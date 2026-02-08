-- KÁTYÚFIGYELŐ - SUPABASE TÁBLA MÓDOSÍTÁS
-- Többszörös bejelentések támogatása ugyanazon címhez

-- 1. Töröljük a régi táblát (VIGYÁZAT: minden adat elveszik!)
-- Ha meg akarod őrizni az adatokat, hagyd ki ezt a lépést
DROP TABLE IF EXISTS pothole_reports;

-- 2. Új tábla létrehozása optimalizált struktúrával
CREATE TABLE pothole_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Koordináták (8 tizedes jegy ~1mm pontosság)
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Cím adatok (case-insensitive tárolás)
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10),
  address TEXT NOT NULL,
  
  -- Normalizált cím (kis betűsre alakítva, összehasonlításhoz)
  normalized_address TEXT GENERATED ALWAYS AS (
    LOWER(TRIM(address))
  ) STORED,
  
  -- Kátyú helye
  position_on_road VARCHAR(50) NOT NULL,
  
  -- Bejelentések száma (alapértelmezett: 1)
  report_count INT DEFAULT 1 NOT NULL,
  
  -- Időbélyegek
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Utolsó bejelentés időpontja
  last_reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexek a gyors kereséshez
CREATE INDEX idx_pothole_location ON pothole_reports(latitude, longitude);
CREATE INDEX idx_pothole_city ON pothole_reports(city);
CREATE INDEX idx_pothole_normalized_address ON pothole_reports(normalized_address);
CREATE INDEX idx_pothole_created ON pothole_reports(created_at DESC);

-- 4. Funkció: Automatikus updated_at frissítés
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Trigger: updated_at automatikus frissítése
CREATE TRIGGER update_pothole_reports_updated_at 
    BEFORE UPDATE ON pothole_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Row Level Security (RLS) engedélyezése
ALTER TABLE pothole_reports ENABLE ROW LEVEL SECURITY;

-- 7. Policy: Mindenki olvashat
CREATE POLICY "Enable read access for all users" 
ON pothole_reports FOR SELECT 
USING (true);

-- 8. Policy: Mindenki írhat (anonymous reporting)
CREATE POLICY "Enable insert for all users" 
ON pothole_reports FOR INSERT 
WITH CHECK (true);

-- 9. Policy: Mindenki frissíthet (report_count növeléséhez)
CREATE POLICY "Enable update for all users" 
ON pothole_reports FOR UPDATE 
USING (true);

-- 10. Magyarázat:
-- A normalized_address egy GENERATED ALWAYS oszlop, ami automatikusan
-- kis betűsre alakítja és trimeli a címet. Ez biztosítja, hogy
-- "Budapest, Fő utca 12" és "budapest, fő utca 12" ugyanazon rekordot találja.

-- HASZNÁLAT:
-- Az alkalmazás a normalized_address alapján keres duplikációkat,
-- így nem számít a kis/nagybetű különbség.

COMMENT ON TABLE pothole_reports IS 'Kátyúbejelentések tárolása többszörös bejelentés támogatással';
COMMENT ON COLUMN pothole_reports.normalized_address IS 'Automatikusan generált lowercase cím az összehasonlításhoz';
COMMENT ON COLUMN pothole_reports.report_count IS 'Adott helyszínen leadott bejelentések száma';

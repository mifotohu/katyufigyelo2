import { createClient } from '@supabase/supabase-js'

// Supabase konfiguráció környezeti változókból
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Ellenőrizzük, hogy a kötelező környezeti változók be vannak-e állítva
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase konfiguráció hiányzik! Ellenőrizd a .env fájlt.')
}

// Supabase kliens létrehozása
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Nincs szükség session kezelésre ebben az appban
  },
})

/**
 * Adatbázis séma (Supabase SQL Editor-ban futtasd le):
 * 
 * CREATE TABLE pothole_reports (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   latitude DECIMAL(10, 8) NOT NULL,
 *   longitude DECIMAL(11, 8) NOT NULL,
 *   city VARCHAR(100) NOT NULL,
 *   postal_code VARCHAR(10),
 *   address TEXT NOT NULL,
 *   position_on_road VARCHAR(50) NOT NULL,
 *   photo_url TEXT,
 *   report_count INT DEFAULT 1,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Index a gyorsabb lekérdezésekhez
 * CREATE INDEX idx_pothole_location ON pothole_reports(latitude, longitude);
 * CREATE INDEX idx_pothole_city ON pothole_reports(city);
 * CREATE INDEX idx_pothole_created ON pothole_reports(created_at DESC);
 * 
 * -- RLS (Row Level Security) beállítása
 * ALTER TABLE pothole_reports ENABLE ROW LEVEL SECURITY;
 * 
 * -- Mindenki olvashat
 * CREATE POLICY "Enable read access for all users" ON pothole_reports
 *   FOR SELECT USING (true);
 * 
 * -- Mindenki írhat (anonymous reporting)
 * CREATE POLICY "Enable insert for all users" ON pothole_reports
 *   FOR INSERT WITH CHECK (true);
 */

// Kátyúbejelentések lekérése
export const getPotholeReports = async () => {
  try {
    const { data, error } = await supabase
      .from('pothole_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Hiba a bejelentések lekérésekor:', error)
    return { data: null, error }
  }
}

// Új kátyúbejelentés létrehozása
export const createPotholeReport = async (reportData) => {
  try {
    // Normalizált cím (kis betűs, trimelt) az összehasonlításhoz
    const normalizedAddress = reportData.address.toLowerCase().trim()
    
    // Ellenőrizzük, hogy van-e már bejelentés UGYANAZON CÍMEN (case-insensitive)
    const { data: existingByAddress } = await supabase
      .from('pothole_reports')
      .select('*')
      .ilike('address', normalizedAddress) // case-insensitive keresés
      .limit(1)

    // Ha van ugyanazon címen bejelentés, növeljük a számlálót
    if (existingByAddress && existingByAddress.length > 0) {
      const existingReport = existingByAddress[0]
      const { data, error } = await supabase
        .from('pothole_reports')
        .update({ 
          report_count: existingReport.report_count + 1,
          last_reported_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReport.id)
        .select()

      if (error) throw error
      return { data: data[0], error: null, isDuplicate: true }
    }

    // Ha nincs, ellenőrizzük a közelség alapján (50m távolságon belül)
    const { data: existingByLocation } = await supabase
      .from('pothole_reports')
      .select('*')
      .gte('latitude', reportData.latitude - 0.0005)
      .lte('latitude', reportData.latitude + 0.0005)
      .gte('longitude', reportData.longitude - 0.0005)
      .lte('longitude', reportData.longitude + 0.0005)
      .limit(1)

    // Ha van közeli bejelentés (kb. 50m-en belül), növeljük a számlálót
    if (existingByLocation && existingByLocation.length > 0) {
      const existingReport = existingByLocation[0]
      const { data, error } = await supabase
        .from('pothole_reports')
        .update({ 
          report_count: existingReport.report_count + 1,
          last_reported_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReport.id)
        .select()

      if (error) throw error
      return { data: data[0], error: null, isDuplicate: true }
    }

    // Új bejelentés létrehozása (nincs duplikáció)
    const { data, error } = await supabase
      .from('pothole_reports')
      .insert([{
        ...reportData,
        report_count: 1,
        last_reported_at: new Date().toISOString()
      }])
      .select()

    if (error) throw error
    return { data: data[0], error: null, isDuplicate: false }
  } catch (error) {
    console.error('Hiba a bejelentés létrehozásakor:', error)
    return { data: null, error, isDuplicate: false }
  }
}
// src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Ez a rész hiányozhatott vagy hibás volt:
export const getPotholeReports = async () => {
  const { data, error } = await supabase
    .from('potholes') // Ellenőrizd, hogy a táblád neve valóban 'potholes'!
    .select('*')
  if (error) throw error
  return data
}

// Ezt kereste a Vercel és nem találta:
export const markAsSolved = async (id) => {
  const { data, error } = await supabase
    .from('potholes')
    .update({ status: 'solved' }) // Feltételezzük, hogy van 'status' oszlopod
    .eq('id', id)
  if (error) throw error
  return data
}
// Fotó feltöltés törölve - nincs rá szükség az új verzióban

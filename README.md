# Kátyúfigyelő ⚠️

Magyarországi kátyúbejelentő közösségi webalkalmazás. Modern, reszponzív, mobile-first design.

![Kátyúfigyelő](https://img.shields.io/badge/version-1.0.0-orange) ![React](https://img.shields.io/badge/React-18.2-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Funkciók

- 🗺️ **Interaktív térkép**: Google Maps integráció Magyarország térképével
- 📍 **Kátyúbejelentés**: Kattintással jelölhető be új úthibák
- 🎨 **Színkódolt markerek**: Bejelentések száma alapján (kék/sárga/piros)
- 📸 **Fotó feltöltés**: Max 3MB, JPG/PNG formátumban
- 🤖 **AI integráció**: Google Gemini API (opcionális)
- 📱 **Reszponzív**: Mobile-first design, minden eszközön használható
- 🔒 **Biztonságos**: Supabase backend, környezeti változók kezelése

## 🚀 Gyors start

### Előfeltételek

- Node.js >= 18.0.0
- npm vagy yarn
- Google Maps API kulcs
- Supabase fiók

### Telepítés

1. **Repository klónozása**
```bash
git clone https://github.com/yourusername/katyufigyelo.git
cd katyufigyelo
```

2. **Függőségek telepítése**
```bash
npm install
```

3. **Környezeti változók beállítása**
```bash
cp .env.example .env
```

Töltsd ki a `.env` fájlt:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key (opcionális)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Supabase adatbázis létrehozása**

Futtasd le a következő SQL scriptet a Supabase SQL Editor-ban:

```sql
CREATE TABLE pothole_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10),
  address TEXT NOT NULL,
  position_on_road VARCHAR(50) NOT NULL,
  photo_url TEXT,
  report_count INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pothole_location ON pothole_reports(latitude, longitude);
CREATE INDEX idx_pothole_city ON pothole_reports(city);
CREATE INDEX idx_pothole_created ON pothole_reports(created_at DESC);

ALTER TABLE pothole_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON pothole_reports
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON pothole_reports
  FOR INSERT WITH CHECK (true);
```

5. **Supabase Storage bucket létrehozása**

A Supabase dashboard-on:
- Storage → New Bucket
- Név: `potholes`
- Public bucket: ✅ (hogy a képek elérhetőek legyenek)

6. **Fejlesztői szerver indítása**
```bash
npm run dev
```

Az alkalmazás elérhető: http://localhost:3000

## 📦 Build és Deploy

### Production build
```bash
npm run build
```

### Vercel Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push-old a projektet GitHub-ra
2. Importáld Vercel-be
3. Állítsd be a környezeti változókat
4. Deploy!

## 🛠️ Technológiai stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Ikonok**: Lucide React
- **Térkép**: Google Maps JavaScript API
- **Backend**: Supabase (PostgreSQL)
- **AI**: Google Gemini (opcionális)
- **Deployment**: Vercel

## 📁 Projekt struktúra

```
katyufigyelo/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Map.jsx
│   │   ├── ReportForm.jsx
│   │   ├── Footer.jsx
│   │   └── ApiKeyBanner.jsx
│   ├── lib/
│   │   ├── supabaseClient.js
│   │   └── geminiClient.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── .env.example
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## 🎨 Használat

1. **Kátyú bejelentése**: Kattints a térképre, ahol a kátyú található
2. **Adatok kitöltése**: Add meg a város, cím és egyéb adatokat
3. **Fotó feltöltése** (opcionális): Maximum 3MB méretben
4. **Beküldés**: Az adatok Supabase-be kerülnek, a térkép frissül

## 🔐 API kulcsok beszerzése

### Google Maps API
1. https://console.cloud.google.com/
2. Projekt létrehozása
3. Maps JavaScript API engedélyezése
4. API kulcs generálása

### Google Gemini API (opcionális)
1. https://aistudio.google.com/app/apikey
2. Create API Key
3. Kulcs másolása

### Supabase
1. https://supabase.com/
2. Új projekt létrehozása
3. URL és Anon Key másolása Settings > API-ból

## 🎨 Markerek színkódja

- 🔵 **Kék (1-5 bejelentés)**: Alacsony prioritású kátyú
- 🟡 **Sárga (6-10 bejelentés)**: Figyelmet igényel
- 🔴 **Piros (10+ bejelentés)**: Veszélyes, sürgős beavatkozás szükséges

## 📱 Reszponzív Design

Az alkalmazás teljes mértékben reszponzív:
- **Mobile**: 320px-től
- **Tablet**: 768px-től
- **Desktop**: 1024px-től

## 🔒 Biztonság

- Környezeti változók kezelése
- Supabase Row Level Security (RLS)
- API kulcsok LocalStorage-ban (24h lejárat)
- Nincs szerver oldali adattárolás
- HTTPS kötelező production-ben

## 🤝 Közreműködés

Pull requestek üdvözöltek! Nagy változtatásokhoz először nyiss egy issue-t.

1. Fork-old a projektet
2. Hozz létre egy feature branch-et (`git checkout -b feature/AmazingFeature`)
3. Commitold a változásokat (`git commit -m 'Add some AmazingFeature'`)
4. Push-old a branch-re (`git push origin feature/AmazingFeature`)
5. Nyiss egy Pull Request-et

## 📄 Licenc

MIT License - részletek a LICENSE fájlban

## 📞 Kapcsolat

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## ⚠️ Fontos megjegyzés

Ez **nem hivatalos** úthibák bejelentő rendszer! Súlyos esetekben továbbra is hívd a Magyar Közutat: **06-1-819-9000**

---

## 🐛 Hibaelhárítás

### Térkép nem töltődik be
- Ellenőrizd a Google Maps API kulcsot
- Nézd meg a böngésző konzolt hibákért
- Győződj meg róla, hogy az API kulcs engedélyezve van a Maps JavaScript API-hoz

### Bejelentés nem kerül mentésre
- Ellenőrizd a Supabase kapcsolatot
- Nézd meg, hogy az RLS policy-k helyesen vannak-e beállítva
- Ellenőrizd a storage bucket létezését és jogosultságait

### Fotó feltöltés sikertelen
- Max 3MB méret
- Csak JPG/PNG formátum
- Ellenőrizd a Supabase storage bucket public jogosultságát

---

Készítve ❤️-tel a közösségért | 2026

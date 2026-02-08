# ✅ Deployment Checklist - Kátyúfigyelő

## 📋 Lépésről Lépésre Útmutató

### 1️⃣ Supabase Beállítása (5-10 perc)

**1.1 Projekt létrehozása**
- [ ] Menj a https://supabase.com
- [ ] Jelentkezz be (GitHub OAuth ajánlott)
- [ ] Kattints: "New Project"
- [ ] Név: `katyufigyelo`
- [ ] Database Password: **Generálj erős jelszót!**
- [ ] Region: `Europe (Frankfurt)` vagy `Europe (London)`
- [ ] Kattints: "Create new project"
- [ ] Várj ~2 percet (project initialization)

**1.2 SQL Migráció Futtatása**
- [ ] Bal menü: "SQL Editor"
- [ ] Kattints: "New query"
- [ ] Másold be a `supabase-migration.sql` teljes tartalmát
- [ ] Kattints: "Run" (vagy Ctrl+Enter)
- [ ] Ellenőrizd: "Success. No rows returned" üzenet
- [ ] Bal menü: "Table Editor"
- [ ] Ellenőrizd: `pothole_reports` tábla létezik

**1.3 API Kulcsok Kimásolása**
- [ ] Bal menü: "Settings" → "API"
- [ ] Másold ki:
  - **Project URL**: `https://xxx.supabase.co`
  - **anon/public key**: `eyJhbG...` (hosszú string)
- [ ] **FONTOS**: Ezek public kulcsok, nyugodtan használhatók!

---

### 2️⃣ GitHub Repository (3-5 perc)

**2.1 Repository Létrehozása**
- [ ] Menj a https://github.com
- [ ] Kattints: "New repository"
- [ ] Név: `katyufigyelo`
- [ ] Visibility: **Public** (ajánlott Vercel-hez)
- [ ] ❌ NE adj hozzá README/gitignore (már van!)
- [ ] Kattints: "Create repository"

**2.2 Kód Feltöltése**
```bash
cd katyufigyelo

# Git inicializálás
git init
git add .
git commit -m "Initial commit - Kátyúfigyelő v1.0"

# Remote hozzáadása (CSERÉLD KI a username-et!)
git remote add origin https://github.com/YOUR_USERNAME/katyufigyelo.git

# Első push
git branch -M main
git push -u origin main
```

- [ ] Frissítsd a GitHub oldalt → kódnak meg kell jelennie

---

### 3️⃣ Vercel Deployment (5 perc)

**3.1 Vercel Projekt Létrehozása**
- [ ] Menj a https://vercel.com
- [ ] Jelentkezz be (GitHub OAuth ajánlott)
- [ ] Kattints: "Add New..." → "Project"
- [ ] Import Git Repository:
  - [ ] Válaszd ki: `katyufigyelo`
  - [ ] Kattints: "Import"

**3.2 Build & Output Beállítások**
- [ ] **Framework Preset**: `Vite`
- [ ] **Root Directory**: `./` (default)
- [ ] **Build Command**: `npm run build` (default)
- [ ] **Output Directory**: `dist` (default)
- [ ] **Install Command**: `npm install` (default)

**3.3 Environment Variables Beállítása** ⚠️ FONTOS!
Kattints: "Environment Variables" fül

**Kötelező változók:**
```
VITE_SUPABASE_URL = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbG...
```

**Opcionális változó (NEM ajánlott!):**
```
VITE_GEMINI_API_KEY = AIza...
```

⚠️ **FIGYELEM**: Ha MEGADOD a Gemini kulcsot:
- ✅ Előny: Minden user számára működik azonnal
- ❌ Hátrány: **TE fizeted a költségeket!**
- ❌ Minden user a TE kulcsodat használja

💡 **Ajánlás**: **NE add meg!** Így minden user a saját kulcsát adja meg az appban.

**3.4 Deploy!**
- [ ] Kattints: "Deploy"
- [ ] Várj ~2-3 percet
- [ ] Status: "✓ Deployment Ready"
- [ ] Kattints: "Visit" → App megnyílik!

**3.5 Domain Beállítása (Opcionális)**
- [ ] Dashboard → Project → Settings → Domains
- [ ] Add Domain: `katyufigyelo.com` (ha van saját domain-ed)
- [ ] DNS rekordok beállítása domain szolgáltatónál

---

### 4️⃣ Tesztelés (10 perc)

**4.1 Alapfunkciók**
- [ ] App betöltődik: https://YOUR_APP.vercel.app
- [ ] Térkép megjelenik (OpenStreetMap)
- [ ] Leaflet CSS betöltődött (markerek látszanak)
- [ ] Fejléc + Lábléc megjelenítése OK

**4.2 Bejelentés Teszt**
- [ ] Kattints a térképre
- [ ] Bejelentő form megjelenik
- [ ] Töltsd ki:
  - Város: Budapest
  - Cím: Fő utca 1.
  - Helyzet: Szélén
- [ ] Kattints: "Beküldöm"
- [ ] Üzenet: "Bejelentés sikeresen elküldve!"
- [ ] Térkép frissül, marker megjelenik

**4.3 Duplikált Bejelentés**
- [ ] Kattints UGYANODA
- [ ] Ugyanazt a címet írd be
- [ ] Küld be újra
- [ ] Üzenet: "Ezen a helyszínen már van bejelentés! A számláló frissítve."
- [ ] Marker színe/száma változik (report_count növekszik)

**4.4 Supabase Ellenőrzés**
- [ ] Supabase → Table Editor → `pothole_reports`
- [ ] 1 rekord létezik
- [ ] `report_count = 2` (első + második bejelentés)

**4.5 Gemini API Banner** (Ha NEM adtál meg env változót)
- [ ] Lila banner megjelenik felül
- [ ] Tooltip működik (i ikon)
- [ ] API kulcs megadható
- [ ] LocalStorage tárolás működik

**4.6 Mobil Teszt**
- [ ] Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
- [ ] iPhone 12 Pro view
- [ ] Térkép reszponzív
- [ ] Form reszponzív
- [ ] Jelmagyarázat megjelenik mobilon

---

### 5️⃣ Monitoring Beállítása (Opcionális, 5 perc)

**5.1 Vercel Analytics**
- [ ] Dashboard → Analytics
- [ ] Enable Analytics (Free tier: 25k events/hó)
- [ ] Figyeld: Látogatók, Pageviews, Top Pages

**5.2 Supabase Usage**
- [ ] Dashboard → Settings → Usage
- [ ] Figyeld: Database size, Bandwidth
- [ ] Alert beállítása 80%-nál (email)

**5.3 Uptime Monitoring (Opcionális)**
- [ ] https://uptimerobot.com (ingyenes)
- [ ] Monitor típus: HTTPS
- [ ] URL: https://YOUR_APP.vercel.app
- [ ] Interval: 5 perc
- [ ] Alert: Email ha down

---

### 6️⃣ Dokumentáció Frissítése

**6.1 README.md**
- [ ] Cseréld ki a demo URL-t:
  ```markdown
  ## 🚀 Live Demo
  https://YOUR_APP.vercel.app
  ```

**6.2 GitHub About**
- [ ] GitHub repo → Settings → About
- [ ] Description: "Közösségi kátyúbejelentő platform Magyarországon"
- [ ] Website: https://YOUR_APP.vercel.app
- [ ] Topics: `react`, `supabase`, `openstreetmap`, `hungary`

---

## 🎯 Post-Deployment Checklist

### Első Nap
- [ ] Share on social media (Facebook, LinkedIn)
- [ ] Tesztelés különböző böngészőkben (Chrome, Firefox, Safari)
- [ ] Mobil tesztelés valódi eszközön (ne csak emulátor)

### Első Hét
- [ ] Figyeld a Vercel Analytics-ot (látogatók száma)
- [ ] Figyeld a Supabase Usage-et (DB méret)
- [ ] Gyűjts feedbacket felhasználóktól
- [ ] Fix bugokat ha vannak

### Első Hónap
- [ ] Ellenőrizd a kvótákat (Vercel bandwidth, Supabase DB)
- [ ] Ha >80% → Fontos a következő lépés (upgrade vagy optimalizálás)
- [ ] Készíts backup-ot a Supabase adatbázisról (manual export)

---

## 🚨 Gyakori Problémák & Megoldások

### 1. "Térkép nem töltődik be"

**Tünet**: Üres térkép, vagy "Leaflet CSS" hiányzik

**Megoldás**:
```bash
# Ellenőrizd:
npm list leaflet
# Ha nincs: npm install leaflet react-leaflet

# Ellenőrizd: src/index.css első sor:
@import 'leaflet/dist/leaflet.css';
```

### 2. "Marker ikonok hiányoznak (404)"

**Tünet**: Console-ban: `marker-icon.png 404`

**Megoldás**: Már javítva van! `Map.jsx` elején CDN ikonok.

### 3. "Supabase connection error"

**Tünet**: "Failed to fetch", "Network error"

**Megoldás**:
1. Ellenőrizd a Vercel env változókat
2. Supabase → Settings → API → URL & Key másolása
3. Vercel → Settings → Environment Variables → Frissítés
4. Redeploy (Settings → Deployments → ... → Redeploy)

### 4. "Bejelentés nem menti"

**Tünet**: Form submit után semmi nem történik

**Megoldás**:
1. Browser Console → Network tab
2. Keress: `supabase.co` request-et
3. Ha 401 Unauthorized → API key hibás
4. Ha 403 Forbidden → RLS policy hiba (futtasd újra az SQL-t)

### 5. "Gemini API banner nem jelenik meg"

**Tünet**: Banner hiányzik, pedig nem adtál meg env kulcsot

**Megoldás**:
```javascript
// GeminiApiBanner.jsx ellenőrzés:
const envKey = import.meta.env.VITE_GEMINI_API_KEY
console.log('Env key:', envKey) // undefined vagy 'your_gemini...'
```

---

## 📝 Hasznos Linkek

- **App**: https://YOUR_APP.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **GitHub Repo**: https://github.com/YOUR_USERNAME/katyufigyelo
- **Google AI Studio**: https://aistudio.google.com/app/apikey

---

## 🎉 Gratulálunk!

Ha eljutottál idáig, az app **élesben fut** és **működik**! 🚀

**Következő lépések**:
1. Share on social media
2. Gyűjts felhasználói feedbacket
3. Iterálj és fejleszd tovább
4. Enjoy! 🎊

---

**Utolsó frissítés**: 2026.02.08  
**Verzió**: 1.0.0 (Production Ready)

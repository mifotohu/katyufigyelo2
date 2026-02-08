# 🚀 Vercel Deployment Útmutató - Kátyúfigyelő

## ⚠️ FONTOS: Leaflet CSS és Ikon Fix

A Leaflet térképkönyvtár használata Vercel-en speciális konfigurációt igényel.

### 1. Problémák Vercel-en

**Probléma #1**: Leaflet CSS nem töltődik be helyesen  
**Probléma #2**: Marker ikonok hiányoznak (404 error)  
**Probléma #3**: Map tiles nem jelennek meg

### 2. Megoldás: `vite.config.js` Frissítése

Győződj meg róla, hogy a `vite.config.js` így néz ki:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'maps': ['leaflet', 'react-leaflet'],
          'supabase': ['@supabase/supabase-js']
        }
      }
    }
  },
  // KRITIKUS: Leaflet asset-ek helyes kezelése
  assetsInclude: ['**/*.png', '**/*.svg'],
  optimizeDeps: {
    include: ['leaflet']
  }
})
```

### 3. Leaflet Ikonok Fix - `Map.jsx`

A `Map.jsx` fájl elején már szerepel az ikon fix:

```javascript
// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})
```

✅ **Ez CDN-ről tölti be az ikonokat, így Vercel-en is működik.**

### 4. CSS Import Ellenőrzése - `index.css`

Győződj meg róla, hogy az `src/index.css` első sora:

```css
@import 'leaflet/dist/leaflet.css';
```

### 5. Vercel Build Beállítások

A Vercel dashboard-on állítsd be:

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```bash
npm install
```

**Node Version:**
```
18.x
```

### 6. Környezeti Változók Vercel-en

Add hozzá a következő environment variable-okat:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key (opcionális)
```

⚠️ **FONTOS**: Ha nem adsz meg `VITE_GEMINI_API_KEY`-t, a felhasználók saját kulcsot kell megadják!

### 7. Deployment Checklist

- [ ] `vite.config.js` frissítve az asset include-dal
- [ ] Leaflet ikon fix a `Map.jsx`-ben
- [ ] CSS import az `index.css`-ben
- [ ] Vercel build settings beállítva
- [ ] Environment változók hozzáadva
- [ ] Build teszt lokálisan: `npm run build && npm run preview`

### 8. Troubleshooting

#### Térkép nem jelenik meg:
```bash
# Ellenőrizd a Vercel build log-ot:
# Dashboard > Deployments > [Latest] > View Function Logs
```

Keresed: `Failed to load resource: the server responded with a status of 404`

**Megoldás**: CDN ikonok használata (már kész)

#### CSS nem töltődik be:
```bash
# Ellenőrizd a Network tab-ot a böngésző dev tools-ban
# Keresed: leaflet.css 404 error
```

**Megoldás**: `@import 'leaflet/dist/leaflet.css';` az index.css-ben

#### Build error a Vercel-en:
```
Error: Cannot find module 'leaflet'
```

**Megoldás**: 
```bash
# Lokálisan:
npm install
npm run build

# Ha sikerül, push GitHub-ra, Vercel auto-deploy
```

### 9. Performance Optimalizálás

Vercel automatikusan:
- ✅ Gzip/Brotli compression
- ✅ CDN caching (OpenStreetMap tile-ok)
- ✅ Edge network (gyors global delivery)
- ✅ Automatic HTTPS

### 10. Monitoring

Vercel dashboard-on figyeld:
- **Analytics**: Látogatók száma
- **Speed Insights**: Oldal sebesség
- **Logs**: Hibák, problémák

---

## 🎯 Gyors Deploy

```bash
# 1. Git commit
git add .
git commit -m "Leaflet deployment fix"

# 2. Push GitHub-ra
git push origin main

# 3. Vercel auto-deploy (~2 perc)
# Ellenőrizd: https://your-app.vercel.app
```

---

## 📊 Vercel Free Tier Limitek

| Limit | Free Plan |
|-------|-----------|
| **Bandwidth** | 100 GB/hó |
| **Serverless Functions** | 100 óra/hó |
| **Build Minutes** | 6000 perc/hó |
| **Deployments** | Korlátlan |
| **Team Members** | 1 (Hobby) |

**Becsült kapacitás:**
- ~50,000 egyedi látogató/hó
- ~200,000 térképbetöltés/hó
- Bőven elegendő kis-közepes projektre

---

## ⚠️ Ha elfogynak a kreditek

Vercel **nem kapcsolja ki** az appot azonnal, helyette:
1. Email figyelmeztetés
2. Dashboard-on jelzi
3. Opció: Upgrade Pro-ra ($20/hó)

**Alternatíva**: Netlify, Railway, vagy Render (hasonló free tier-ek)

---

**Frissítve**: 2026.02.08  
**Verzió**: 1.0.0 (OpenStreetMap Edition)

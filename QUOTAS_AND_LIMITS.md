# 📊 Vercel és Supabase Kvóták - Kátyúfigyelő

## 🎯 Executive Summary

**Röviden**: A Vercel + Supabase Free Tier kombinációval **~10,000-50,000 aktív felhasználó/hó** kezelhető problémamentesen, ~100,000-500,000 kátyúbejelentéssel.

---

## 1. 🚀 Vercel Free Tier (Hobby Plan)

### Limitek

| Metrika | Limit | Magyarázat |
|---------|-------|------------|
| **Bandwidth** | 100 GB/hó | Kimenő adatforgalom (HTML, CSS, JS, képek) |
| **Serverless Function Executions** | 1,000,000/hó | Szerveroldali funkciók futtatása (nem használjuk) |
| **Serverless Function Duration** | 100 óra/hó | Max futási idő összesen (nem használjuk) |
| **Build Minutes** | 6,000 perc/hó | Build idő Git push-kor (~2 perc/build) |
| **Deployments** | ∞ Korlátlan | Korlátlan számú deploy |
| **Custom Domains** | ∞ Korlátlan | Saját domain név beállítás |

### Mi használja a Bandwidth-et?

Az app **statikus fájlokat** (HTML, CSS, JS) szolgál ki:

| Fájl | Méret | Látogató | Havi Bandwidth |
|------|-------|----------|----------------|
| HTML | ~5 KB | 10,000 | 50 MB |
| CSS | ~15 KB | 10,000 | 150 MB |
| JS Bundle | ~200 KB | 10,000 | 2,000 MB |
| **ÖSSZES** | ~220 KB | 10,000 | **~2.2 GB** |

**Becslés**: 
- **10,000 látogató/hó** = ~2.2 GB bandwidth
- **50,000 látogató/hó** = ~11 GB bandwidth
- **100 GB limit** = **~450,000 látogató/hó**

### Mi NEM használja a Bandwidth-et?

- ❌ OpenStreetMap térképek (külső CDN)
- ❌ Supabase adatbázis (külső szolgáltatás)
- ❌ API hívások

### Build Minutes

Egy build ~2 perc:
- **6,000 perc limit** = **~3,000 build/hó**
- Átlagos projekt: **~5-10 build/hó**
- **Bőven elegendő!** ✅

### Mi történik a limit átlépésekor?

Vercel **NEM kapcsolja le** az appot azonnal:

1. **Soft limit** (80%): Email figyelmeztetés
2. **Hard limit** (100%): 
   - App továbbra is fut
   - Dashboard jelzi
   - Upgrade opció ($20/hó Pro tier)

---

## 2. 💾 Supabase Free Tier

### Limitek

| Metrika | Limit | Magyarázat |
|---------|-------|------------|
| **Database Size** | 500 MB | PostgreSQL adatbázis méret |
| **Storage** | 1 GB | Fájlok (nincs használva, mert fotó feltöltés törölve) |
| **Bandwidth** | 5 GB/hó | Adatbázis lekérdezések + storage |
| **Monthly Active Users** | Korlátlan | Nincs user limit! |
| **API Requests** | Korlátlan | Nincs request limit (rate limit van) |
| **Egress (Outbound Data)** | 50 GB/hó | Kimenő adat (lekérdezések válaszai) |

### Adatbázis Méret Becslés

Egy kátyúbejelentés ~500 byte:

```sql
-- Példa rekord méret
id: UUID (16 bytes)
latitude: DECIMAL(10,8) (8 bytes)
longitude: DECIMAL(11,8) (8 bytes)
city: VARCHAR(100) (~20 bytes átlag)
postal_code: VARCHAR(10) (~5 bytes)
address: TEXT (~100 bytes átlag)
position_on_road: VARCHAR(50) (~15 bytes)
report_count: INT (4 bytes)
created_at: TIMESTAMP (8 bytes)
updated_at: TIMESTAMP (8 bytes)
last_reported_at: TIMESTAMP (8 bytes)
---
TOTAL: ~200 bytes/rekord (indexekkel + overhead: ~500 bytes)
```

**Becslés**:
- **500 MB limit** / **500 bytes/rekord** = **~1,000,000 bejelentés**
- **Reális**: ~500,000-700,000 bejelentés (indexek miatt)

| Bejelentések | Adatbázis Méret | Hátralévő |
|--------------|-----------------|-----------|
| 10,000 | ~5 MB | 495 MB ✅ |
| 50,000 | ~25 MB | 475 MB ✅ |
| 100,000 | ~50 MB | 450 MB ✅ |
| 500,000 | ~250 MB | 250 MB ✅ |
| 1,000,000 | ~500 MB | 0 MB ⚠️ |

### Bandwidth (Egress) Becslés

Egy bejelentés lekérdezés ~500 byte:

| Látogatók | Lekérdezések | Egress | Limit% |
|-----------|--------------|--------|--------|
| 1,000 | 10,000 | ~5 MB | 0.1% |
| 10,000 | 100,000 | ~50 MB | 1% |
| 50,000 | 500,000 | ~250 MB | 5% |
| 100,000 | 1,000,000 | ~500 MB | 10% |

**500 MB = 1,000,000 lekérdezés/hó** ⇒ Bőven elegendő!

### Mi történik a limit átlépésekor?

Supabase Free tier esetén:

1. **Database size 100%**:
   - További INSERT-ek elutasítva
   - Read-only mode
   - Email figyelmeztetés

2. **Bandwidth 100%**:
   - Rate limiting erősebb
   - Lassulás
   - Upgrade ajánlat

**Megoldás**: Upgrade Pro-ra ($25/hó, 8 GB DB + 250 GB egress)

---

## 3. 🤖 Google Gemini API (Opcionális)

### Mi ez?

Az app **NEM használja kötelezően** a Gemini API-t. Csak opcionális AI funkciókhoz (pl. címfeloldás javítás).

### Vercel Deployment és Gemini API

**Probléma**: Ha beállítasz `VITE_GEMINI_API_KEY` environment változót Vercel-en, az **minden felhasználó számára ugyanazt a kulcsot használja** → **te fizeted a költségeket!**

**Megoldás a kódban**:
A `GeminiApiBanner.jsx` komponens:
1. Ellenőrzi, van-e env variable
2. Ha nincs → felhasználótól kéri a kulcsot
3. LocalStorage-ban tárolja 24 órára
4. Így **mindenki a saját kulcsát használja**

### Gemini API Free Tier

| Metrika | Limit |
|---------|-------|
| **Requests** | 1,500/nap (~45,000/hó) |
| **Tokens** | 1,000,000/nap |

Egy geocoding hívás ~100 token → **10,000 geocoding/nap ingyenes**

### Költségek (ha fizetős tier)

- **Gemini 1.5 Flash**: $0.35 / 1M input token
- **Geocoding (alternatíva)**: Nominatim (100% ingyenes, nincs limit)

**App használat**: Nominatim-et használunk → **Gemini API opcionális, nem kötelező!**

---

## 4. 📈 Becsült Kapacitás Összesítve

### Havi 10,000 Aktív Felhasználó

| Szolgáltatás | Használat | Limit | % |
|--------------|-----------|-------|---|
| **Vercel Bandwidth** | ~2.2 GB | 100 GB | 2% ✅ |
| **Vercel Builds** | 10 | 6,000 perc | 0.03% ✅ |
| **Supabase DB** | ~5 MB | 500 MB | 1% ✅ |
| **Supabase Egress** | ~50 MB | 50 GB | 0.1% ✅ |

**Eredmény**: **Simán fut!** 🚀

### Havi 50,000 Aktív Felhasználó

| Szolgáltatás | Használat | Limit | % |
|--------------|-----------|-------|---|
| **Vercel Bandwidth** | ~11 GB | 100 GB | 11% ✅ |
| **Vercel Builds** | 20 | 6,000 perc | 0.06% ✅ |
| **Supabase DB** | ~25 MB | 500 MB | 5% ✅ |
| **Supabase Egress** | ~250 MB | 50 GB | 0.5% ✅ |

**Eredmény**: **Még mindig OK!** ✅

### Havi 100,000 Aktív Felhasználó (Skalázási Pont)

| Szolgáltatás | Használat | Limit | % |
|--------------|-----------|-------|---|
| **Vercel Bandwidth** | ~22 GB | 100 GB | 22% ⚠️ |
| **Vercel Builds** | 30 | 6,000 perc | 0.1% ✅ |
| **Supabase DB** | ~50 MB | 500 MB | 10% ✅ |
| **Supabase Egress** | ~500 MB | 50 GB | 1% ✅ |

**Eredmény**: **Még belefér, de figyelni kell!**

---

## 5. 🚨 Mi a Váltási Pont? (Upgrade-re)

### Vercel Pro ($20/hó)

**Érdemes váltani, ha:**
- Bandwidth >80 GB/hó (~350,000 látogató)
- Team collaboration kell
- Analytics fontos

**Előnyök**:
- 1 TB bandwidth
- Commercial use OK
- Analytics
- Password protection

### Supabase Pro ($25/hó)

**Érdemes váltani, ha:**
- Database >400 MB (~800,000 bejelentés)
- Bandwidth >40 GB/hó
- Daily backups kell
- Prod support kell

**Előnyök**:
- 8 GB database
- 250 GB egress
- 100 GB storage
- Daily backups
- Email support

---

## 6. 💡 Optimalizálási Tippek

### Vercel Bandwidth Csökkentés

1. **Gzip compression** (automatikus ✅)
2. **Image optimization** (nincs kép az appban ✅)
3. **Code splitting** (Vite csinálja ✅)
4. **CDN caching** (Vercel Edge ✅)

### Supabase Database Optimalizálás

1. **Index-ek** (már beállítva ✅)
2. **Partial indexes** (még nem kell)
3. **Régi adatok archiválás** (6 hónap után?)
4. **Duplicate detekció** (case-insensitive ✅)

### Monitoring

**Vercel Dashboard**:
- Analytics → Látogatók száma
- Usage → Bandwidth graph

**Supabase Dashboard**:
- Database → Table size
- Usage → Egress graph

**Alerts beállítása**:
- 80% limit → Email alert
- 90% limit → Slack notification (opcionális)

---

## 7. 🎯 Gyakorlati Példa: "Viral" Szcenárió

**Helyzet**: A Kátyúfigyelő "viral" lesz Facebookon.

**Nap 1**: 10,000 látogató
- Vercel: 2.2 GB bandwidth (2%)
- Supabase: 50 MB egress (0.1%)
- **Status**: ✅ OK

**Nap 7**: 70,000 látogató (összesen)
- Vercel: 15.4 GB bandwidth (15%)
- Supabase: 350 MB egress (0.7%)
- **Status**: ✅ OK, de figyelni kell

**Nap 30**: 200,000 látogató (összesen)
- Vercel: 44 GB bandwidth (44%)
- Supabase: 1 GB egress (2%)
- **Status**: ⚠️ Figyelni! Ha folytatódik, Upgrade 1-2 hónapon belül

**Megoldás**:
1. Monitoring beállítása
2. Ha 80% → Email alert
3. Ha 90% → Upgrade megfontolása
4. Alternatíva: Cloudflare proxy (ingyenes bandwidth)

---

## 8. ✅ Összefoglalás

| Felhasználók/hó | Vercel Cost | Supabase Cost | Total |
|-----------------|-------------|---------------|-------|
| 0 - 50,000 | **$0** ✅ | **$0** ✅ | **$0/hó** |
| 50,000 - 100,000 | **$0** ✅ | **$0** ✅ | **$0/hó** |
| 100,000 - 200,000 | $0 vagy $20 | **$0** | **$0-20/hó** |
| 200,000+ | **$20** | $0 vagy $25 | **$20-45/hó** |

**Tanulság**: 
- ✅ **Kis-közepes projektre (0-50k user) teljesen ingyenes**
- ✅ **Nagy projektre (100k+ user) nagyon olcsó ($20-45/hó)**
- ✅ **Skalázható, nincs hirtelen költségugrás**

---

**Frissítve**: 2026.02.08  
**Verzió**: 1.0.0

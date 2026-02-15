import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Supabase SERVICE ROLE kliens (szerver oldali, teljes hozzáférés)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Service role key - NEM az anon key!
)

const DAILY_LIMIT = 10        // Max bejelentés naponta IP-nként
const BLOCK_THRESHOLD = 15    // Ennyi felett azonnali tiltás

// IP hash (GDPR: nem tároljuk nyersen az IP-t)
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + process.env.IP_HASH_SALT).digest('hex')
}

// Kliens IP kinyerése (Vercel proxy-n keresztül)
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

export default async function handler(req, res) {
  // Csak POST kérés engedélyezett
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  const ipHash = hashIP(ip)
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  try {
    // ─── 1. Rate Limit Ellenőrzés ───────────────────────────────────
    const { data: limitRecord, error: limitError } = await supabase
      .from('ip_rate_limits')
      .select('count, blocked')
      .eq('ip_hash', ipHash)
      .eq('date', today)
      .maybeSingle()

    // Ha le van tiltva
    if (limitRecord?.blocked) {
      return res.status(429).json({
        error: 'blocked',
        message: 'Ez az IP-cím le van tiltva. Gyanús aktivitás miatt blokkolva.'
      })
    }

    // Ha elérte a napi limitet
    if (limitRecord && limitRecord.count >= DAILY_LIMIT) {
      return res.status(429).json({
        error: 'rate_limit',
        message: `Napi limit elérve (${DAILY_LIMIT} bejelentés). Holnap újra próbálhatsz.`,
        remaining: 0
      })
    }

    // ─── 2. Azonnali Tiltás Ha Spam (BLOCK_THRESHOLD felett) ───────
    if (limitRecord && limitRecord.count >= BLOCK_THRESHOLD) {
      await supabase
        .from('ip_rate_limits')
        .update({ 
          blocked: true,
          last_request_at: new Date().toISOString()
        })
        .eq('ip_hash', ipHash)
        .eq('date', today)

      return res.status(429).json({
        error: 'blocked',
        message: 'Gyanús aktivitás miatt az IP-cím le lett tiltva.'
      })
    }

    // ─── 3. Bejelentés Feldolgozása ─────────────────────────────────
    const reportData = req.body

    // Validáció
    if (!reportData?.latitude || !reportData?.longitude || !reportData?.address) {
      return res.status(400).json({ error: 'Hiányos adatok' })
    }

    // Koordináta validáció (Magyarország határai)
    const lat = parseFloat(reportData.latitude)
    const lng = parseFloat(reportData.longitude)
    const inHungary = lat >= 45.74 && lat <= 48.585 && lng >= 16.11 && lng <= 22.90

    if (!inHungary) {
      return res.status(400).json({ error: 'A koordináta Magyarország határain kívül van' })
    }

    // Duplikáció ellenőrzés (azonos cím)
    const { data: existing } = await supabase
      .from('pothole_reports')
      .select('id, report_count')
      .ilike('address', reportData.address.toLowerCase().trim())
      .maybeSingle()

    let result
    let isDuplicate = false

    if (existing) {
      // Meglévő bejelentés számláló növelése
      const { data, error } = await supabase
        .from('pothole_reports')
        .update({
          report_count: existing.report_count + 1,
          last_reported_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
      isDuplicate = true
    } else {
      // Helyszín duplikáció (50m-en belül)
      const { data: nearby } = await supabase
        .from('pothole_reports')
        .select('id, report_count')
        .gte('latitude', lat - 0.0005)
        .lte('latitude', lat + 0.0005)
        .gte('longitude', lng - 0.0005)
        .lte('longitude', lng + 0.0005)
        .maybeSingle()

      if (nearby) {
        const { data, error } = await supabase
          .from('pothole_reports')
          .update({
            report_count: nearby.report_count + 1,
            last_reported_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', nearby.id)
          .select()
          .single()

        if (error) throw error
        result = data
        isDuplicate = true
      } else {
        // Teljesen új bejelentés
        const { data, error } = await supabase
          .from('pothole_reports')
          .insert([{
            ...reportData,
            report_count: 1,
            last_reported_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (error) throw error
        result = data
      }
    }

    // ─── 4. Rate Limit Számláló Növelése ────────────────────────────
    const newCount = (limitRecord?.count || 0) + 1

    if (limitRecord) {
      // Meglévő rekord frissítése
      await supabase
        .from('ip_rate_limits')
        .update({
          count: newCount,
          last_request_at: new Date().toISOString()
        })
        .eq('ip_hash', ipHash)
        .eq('date', today)
    } else {
      // Új rekord létrehozása
      await supabase
        .from('ip_rate_limits')
        .insert([{
          ip_hash: ipHash,
          date: today,
          count: 1
        }])
    }

    // ─── 5. Válasz ──────────────────────────────────────────────────
    return res.status(200).json({
      data: result,
      isDuplicate,
      remaining: DAILY_LIMIT - newCount,
      message: isDuplicate
        ? 'Bejelentés megerősítve!'
        : 'Bejelentés sikeresen elküldve!'
    })

  } catch (error) {
    console.error('API hiba:', error)
    return res.status(500).json({ error: 'Szerver hiba', details: error.message })
  }
}

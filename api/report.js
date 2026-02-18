import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ═══════════════════════════════════════════════════════════════
// LIMITEK - Itt állítsd be a szigorúságot
// ═══════════════════════════════════════════════════════════════
const DAILY_LIMIT = 10              // Napi max bejelentés
const BURST_LIMIT = 5               // Max ennyi bejelentés...
const BURST_WINDOW = 60             // ...ennyi másodperc alatt
const INSTANT_BLOCK_COUNT = 10      // Ha ennyi kérés jön egyszerre → azonnali tiltás
const TOTAL_BLOCK_THRESHOLD = 30    // Összesen ennyi bejelentés után állandó tiltás

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + process.env.IP_HASH_SALT).digest('hex')
}

function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

function isNewDay(lastDate) {
  const today = new Date().toISOString().split('T')[0]
  return lastDate !== today
}

// Burst védelem: utolsó N másodpercben hány kérés érkezett
function checkBurst(recentRequests, windowSeconds) {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  
  // Csak az utolsó N másodpercben lévő kéréseket tartjuk
  const validRequests = recentRequests.filter(ts => (now - ts) <= windowMs)
  
  return {
    count: validRequests.length,
    timestamps: validRequests
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  const ipHash = hashIP(ip)
  const today = new Date().toISOString().split('T')[0]
  const now = Date.now()

  try {
    // ═══════════════════════════════════════════════════════════
    // 1. IP REKORD LEKÉRÉSE
    // ═══════════════════════════════════════════════════════════
    const { data: ipRecord } = await supabase
      .from('ip_rate_limits')
      .select('*')
      .eq('ip_hash', ipHash)
      .maybeSingle()

    // ═══════════════════════════════════════════════════════════
    // 2. ÁLLANDÓ TILTÁS ELLENŐRZÉSE
    // ═══════════════════════════════════════════════════════════
    if (ipRecord?.blocked) {
      console.log(`🚫 Tiltott IP próbálkozik: ${ipHash.substring(0, 8)}...`)
      return res.status(429).json({
        error: 'blocked',
        message: 'Ez az IP-cím véglegesen le van tiltva spam aktivitás miatt.'
      })
    }

    // ═══════════════════════════════════════════════════════════
    // 3. BURST VÉDELEM - Túl sok kérés rövid időn belül?
    // ═══════════════════════════════════════════════════════════
    let recentRequests = ipRecord?.recent_requests || []
    if (typeof recentRequests === 'string') {
      recentRequests = JSON.parse(recentRequests)
    }
    
    const burst = checkBurst(recentRequests, BURST_WINDOW)
    
    // Ha túl sok kérés van rövid időn belül → AZONNALI TILTÁS
    if (burst.count >= INSTANT_BLOCK_COUNT) {
      console.log(`⚠️ BURST ATTACK: ${burst.count} kérés ${BURST_WINDOW} másodperc alatt! IP: ${ipHash.substring(0, 8)}...`)
      
      await supabase
        .from('ip_rate_limits')
        .upsert({
          ip_hash: ipHash,
          blocked: true,
          blocked_at: new Date().toISOString(),
          blocked_reason: `Automatikus tiltás: ${burst.count} kérés ${BURST_WINDOW} másodperc alatt (bot/spam)`,
          last_request_at: new Date().toISOString()
        }, { onConflict: 'ip_hash' })

      return res.status(429).json({
        error: 'blocked',
        message: 'Túl sok kérés rövid időn belül. Az IP-cím le lett tiltva.'
      })
    }

    // Ha közel van a burst limithez → figyelmeztető
    if (burst.count >= BURST_LIMIT) {
      return res.status(429).json({
        error: 'burst_limit',
        message: `Lassíts! Maximum ${BURST_LIMIT} bejelentés ${BURST_WINDOW} másodperc alatt.`
      })
    }

    // ═══════════════════════════════════════════════════════════
    // 4. NAPI LIMIT ELLENŐRZÉSE
    // ═══════════════════════════════════════════════════════════
    let dailyCount = 1

    if (ipRecord) {
      if (isNewDay(ipRecord.last_date)) {
        dailyCount = 1  // Új nap → reset
      } else {
        dailyCount = ipRecord.daily_count + 1
      }
    }

    if (dailyCount > DAILY_LIMIT) {
      return res.status(429).json({
        error: 'daily_limit',
        message: `Napi limit elérve (${DAILY_LIMIT} bejelentés). Holnap újra próbálhatsz.`,
        remaining: 0
      })
    }

    // ═══════════════════════════════════════════════════════════
    // 5. ÖSSZESÍTETT TILTÁS (túl sok összesen)
    // ═══════════════════════════════════════════════════════════
    const totalCount = (ipRecord?.total_count || 0) + 1
    const shouldPermanentBlock = totalCount >= TOTAL_BLOCK_THRESHOLD

    if (shouldPermanentBlock) {
      console.log(`⚠️ TOTAL LIMIT: ${totalCount} összesen! IP: ${ipHash.substring(0, 8)}...`)
    }

    // ═══════════════════════════════════════════════════════════
    // 6. BEJELENTÉS FELDOLGOZÁSA
    // ═══════════════════════════════════════════════════════════
    const reportData = req.body

    if (!reportData?.latitude || !reportData?.longitude || !reportData?.address) {
      return res.status(400).json({ error: 'Hiányos adatok' })
    }

    const lat = parseFloat(reportData.latitude)
    const lng = parseFloat(reportData.longitude)
    const inHungary = lat >= 45.74 && lat <= 48.585 && lng >= 16.11 && lng <= 22.90

    if (!inHungary) {
      return res.status(400).json({ error: 'A koordináta Magyarország határain kívül van' })
    }

    // Duplikáció ellenőrzés
    const { data: existing } = await supabase
      .from('pothole_reports')
      .select('id, report_count')
      .ilike('address', reportData.address.toLowerCase().trim())
      .maybeSingle()

    let result
    let isDuplicate = false

    if (existing) {
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

    // ═══════════════════════════════════════════════════════════
    // 7. IP REKORD FRISSÍTÉSE
    // ═══════════════════════════════════════════════════════════
    const updatedRequests = [...burst.timestamps, now].slice(-20)  // Max 20 timestamp tárolása

    await supabase
      .from('ip_rate_limits')
      .upsert({
        ip_hash: ipHash,
        daily_count: isNewDay(ipRecord?.last_date) ? 1 : dailyCount,
        last_date: today,
        total_count: totalCount,
        recent_requests: JSON.stringify(updatedRequests),
        last_request_at: new Date().toISOString(),
        first_request_at: ipRecord?.first_request_at || new Date().toISOString(),
        ...(shouldPermanentBlock && {
          blocked: true,
          blocked_at: new Date().toISOString(),
          blocked_reason: `Automatikus tiltás: ${totalCount} összesített bejelentés`
        })
      }, { onConflict: 'ip_hash' })

    return res.status(200).json({
      data: result,
      isDuplicate,
      remaining: DAILY_LIMIT - dailyCount
    })

  } catch (error) {
    console.error('API hiba:', error)
    return res.status(500).json({ error: 'Szerver hiba', details: error.message })
  }
}

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const DAILY_LIMIT = 10

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + process.env.IP_HASH_SALT).digest('hex')
}

function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    'unknown'
  )
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  const ipHash = hashIP(ip)
  const today = new Date().toISOString().split('T')[0]
  const { reportId } = req.body

  if (!reportId) {
    return res.status(400).json({ error: 'reportId szükséges' })
  }

  try {
    // Rate limit ellenőrzés
    const { data: limitRecord } = await supabase
      .from('ip_rate_limits')
      .select('count, blocked')
      .eq('ip_hash', ipHash)
      .eq('date', today)
      .maybeSingle()

    if (limitRecord?.blocked) {
      return res.status(429).json({ error: 'blocked', message: 'IP le van tiltva.' })
    }

    if (limitRecord && limitRecord.count >= DAILY_LIMIT) {
      return res.status(429).json({
        error: 'rate_limit',
        message: 'Napi limit elérve.',
        remaining: 0
      })
    }

    // +1 növelés
    const { data: current } = await supabase
      .from('pothole_reports')
      .select('report_count')
      .eq('id', reportId)
      .single()

    const { data, error } = await supabase
      .from('pothole_reports')
      .update({
        report_count: current.report_count + 1,
        last_reported_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single()

    if (error) throw error

    // Számláló növelése
    const newCount = (limitRecord?.count || 0) + 1
    if (limitRecord) {
      await supabase
        .from('ip_rate_limits')
        .update({ count: newCount, last_request_at: new Date().toISOString() })
        .eq('ip_hash', ipHash)
        .eq('date', today)
    } else {
      await supabase
        .from('ip_rate_limits')
        .insert([{ ip_hash: ipHash, date: today, count: 1 }])
    }

    return res.status(200).json({
      data,
      remaining: DAILY_LIMIT - newCount
    })

  } catch (error) {
    return res.status(500).json({ error: 'Szerver hiba', details: error.message })
  }
}

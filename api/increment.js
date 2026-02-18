import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const DAILY_LIMIT = 10
const BURST_LIMIT = 5
const BURST_WINDOW = 60
const INSTANT_BLOCK_COUNT = 10

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

function isNewDay(lastDate) {
  const today = new Date().toISOString().split('T')[0]
  return lastDate !== today
}

function checkBurst(recentRequests, windowSeconds) {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const validRequests = recentRequests.filter(ts => (now - ts) <= windowMs)
  return { count: validRequests.length, timestamps: validRequests }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  const ipHash = hashIP(ip)
  const today = new Date().toISOString().split('T')[0]
  const now = Date.now()
  const { reportId } = req.body

  if (!reportId) {
    return res.status(400).json({ error: 'reportId szükséges' })
  }

  try {
    const { data: ipRecord } = await supabase
      .from('ip_rate_limits')
      .select('*')
      .eq('ip_hash', ipHash)
      .maybeSingle()

    if (ipRecord?.blocked) {
      return res.status(429).json({ error: 'blocked', message: 'Ez az IP-cím le van tiltva.' })
    }

    let recentRequests = ipRecord?.recent_requests || []
    if (typeof recentRequests === 'string') {
      recentRequests = JSON.parse(recentRequests)
    }

    const burst = checkBurst(recentRequests, BURST_WINDOW)

    if (burst.count >= INSTANT_BLOCK_COUNT) {
      await supabase
        .from('ip_rate_limits')
        .upsert({
          ip_hash: ipHash,
          blocked: true,
          blocked_at: new Date().toISOString(),
          blocked_reason: `Burst attack: ${burst.count} kérés ${BURST_WINDOW}s alatt`,
          last_request_at: new Date().toISOString()
        }, { onConflict: 'ip_hash' })

      return res.status(429).json({ error: 'blocked', message: 'Túl sok kérés. IP tiltva.' })
    }

    if (burst.count >= BURST_LIMIT) {
      return res.status(429).json({
        error: 'burst_limit',
        message: `Maximum ${BURST_LIMIT} bejelentés ${BURST_WINDOW} másodperc alatt.`
      })
    }

    const dailyCount = ipRecord
      ? (isNewDay(ipRecord.last_date) ? 1 : ipRecord.daily_count + 1)
      : 1

    if (dailyCount > DAILY_LIMIT) {
      return res.status(429).json({
        error: 'daily_limit',
        message: 'Napi limit elérve.',
        remaining: 0
      })
    }

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

    const totalCount = (ipRecord?.total_count || 0) + 1
    const updatedRequests = [...burst.timestamps, now].slice(-20)

    await supabase
      .from('ip_rate_limits')
      .upsert({
        ip_hash: ipHash,
        daily_count: isNewDay(ipRecord?.last_date) ? 1 : dailyCount,
        last_date: today,
        total_count: totalCount,
        recent_requests: JSON.stringify(updatedRequests),
        last_request_at: new Date().toISOString(),
        first_request_at: ipRecord?.first_request_at || new Date().toISOString()
      }, { onConflict: 'ip_hash' })

    return res.status(200).json({ data, remaining: DAILY_LIMIT - dailyCount })

  } catch (error) {
    return res.status(500).json({ error: 'Szerver hiba', details: error.message })
  }
}

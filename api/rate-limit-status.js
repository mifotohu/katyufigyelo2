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
    req.socket?.remoteAddress ||
    'unknown'
  )
}

function isNewDay(lastDate) {
  const today = new Date().toISOString().split('T')[0]
  return lastDate !== today
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  const ipHash = hashIP(ip)

  try {
    const { data: ipRecord } = await supabase
      .from('ip_rate_limits')
      .select('daily_count, last_date, blocked')
      .eq('ip_hash', ipHash)
      .maybeSingle()

    if (ipRecord?.blocked) {
      return res.status(200).json({
        remaining: 0,
        blocked: true,
        message: 'IP tiltva'
      })
    }

    let remaining = DAILY_LIMIT

    if (ipRecord) {
      if (isNewDay(ipRecord.last_date)) {
        // Új nap → teljes limit
        remaining = DAILY_LIMIT
      } else {
        // Mai nap → hátralévő
        remaining = Math.max(0, DAILY_LIMIT - ipRecord.daily_count)
      }
    }

    return res.status(200).json({
      remaining,
      blocked: false,
      limit: DAILY_LIMIT
    })

  } catch (error) {
    console.error('Rate limit status error:', error)
    return res.status(500).json({ error: 'Szerver hiba' })
  }
}

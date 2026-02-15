import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { reportId } = req.body

  if (!reportId) {
    return res.status(400).json({ error: 'reportId szükséges' })
  }

  try {
    const { data, error } = await supabase
      .from('pothole_reports')
      .update({
        solved: true,
        solved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single()

    if (error) throw error

    return res.status(200).json({ data })

  } catch (error) {
    return res.status(500).json({ error: 'Szerver hiba', details: error.message })
  }
}

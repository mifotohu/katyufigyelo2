import { createClient } from '@supabase/supabase-js'

// Supabase konfiguráció
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase környezeti változók hiányoznak!')
}

// Supabase kliens létrehozása
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})

// Összes bejelentés lekérése
export const getPotholeReports = async () => {
  try {
    const { data, error } = await supabase
      .from('pothole_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Hiba a bejelentések lekérésekor:', error)
    return { data: null, error }
  }
}

// Új bejelentés létrehozása VAGY meglévő számláló növelése
export const createPotholeReport = async (reportData) => {
  try {
    // Normalizált cím (kis betűs, trimelt) az összehasonlításhoz
    const normalizedAddress = reportData.address.toLowerCase().trim()
    
    // Ellenőrizzük, hogy van-e már bejelentés UGYANAZON CÍMEN (case-insensitive)
    const { data: existingByAddress } = await supabase
      .from('pothole_reports')
      .select('*')
      .ilike('address', normalizedAddress)
      .limit(1)

    // Ha van ugyanazon címen bejelentés, növeljük a számlálót
    if (existingByAddress && existingByAddress.length > 0) {
      const existingReport = existingByAddress[0]
      const { data, error } = await supabase
        .from('pothole_reports')
        .update({ 
          report_count: existingReport.report_count + 1,
          last_reported_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReport.id)
        .select()

      if (error) throw error
      return { data: data[0], error: null, isDuplicate: true }
    }

    // Ha nincs, ellenőrizzük a közelség alapján (50m távolságon belül)
    const { data: existingByLocation } = await supabase
      .from('pothole_reports')
      .select('*')
      .gte('latitude', reportData.latitude - 0.0005)
      .lte('latitude', reportData.latitude + 0.0005)
      .gte('longitude', reportData.longitude - 0.0005)
      .lte('longitude', reportData.longitude + 0.0005)
      .limit(1)

    // Ha van közeli bejelentés (kb. 50m-en belül), növeljük a számlálót
    if (existingByLocation && existingByLocation.length > 0) {
      const existingReport = existingByLocation[0]
      const { data, error } = await supabase
        .from('pothole_reports')
        .update({ 
          report_count: existingReport.report_count + 1,
          last_reported_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReport.id)
        .select()

      if (error) throw error
      return { data: data[0], error: null, isDuplicate: true }
    }

    // Új bejelentés létrehozása (nincs duplikáció)
    const { data, error } = await supabase
      .from('pothole_reports')
      .insert([{
        ...reportData,
        report_count: 1,
        last_reported_at: new Date().toISOString()
      }])
      .select()

    if (error) throw error
    return { data: data[0], error: null, isDuplicate: false }
  } catch (error) {
    console.error('Hiba a bejelentés létrehozásakor:', error)
    return { data: null, error, isDuplicate: false }
  }
}

// Bejelentés számláló növelése (+1 gombbal)
export const incrementReportCount = async (reportId) => {
  try {
    // Lekérjük az aktuális rekordot
    const { data: currentReport, error: fetchError } = await supabase
      .from('pothole_reports')
      .select('report_count')
      .eq('id', reportId)
      .single()

    if (fetchError) throw fetchError

    // Növeljük a számlálót
    const { data, error } = await supabase
      .from('pothole_reports')
      .update({ 
        report_count: currentReport.report_count + 1,
        last_reported_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()

    if (error) throw error
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Hiba a számláló növelésénél:', error)
    return { data: null, error }
  }
}

// Kátyú megjelölése megoldottként
export const markAsSolved = async (reportId) => {
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

    if (error) throw error
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Hiba a megoldva jelölésnél:', error)
    return { data: null, error }
  }
}

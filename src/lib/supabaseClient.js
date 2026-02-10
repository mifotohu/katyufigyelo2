import { createClient } from '@supabase/supabase-js'

// 1. Változók beolvasása a környezeti beállításokból (.env vagy Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 2. A Supabase kliens létrehozása (csak egyszer!)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 3. Adatok lekérése (Kátyúk listázása)
export const getPotholeReports = async () => {
  const { data, error } = await supabase
    .from('potholes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Hiba a lekéréskor:', error)
    throw error
  }
  return data
}

// 4. Státusz frissítése (Ez hiányzott legutóbb)
export const markAsSolved = async (id) => {
  const { data, error } = await supabase
    .from('potholes')
    .update({ status: 'solved' })
    .eq('id', id)
  
  if (error) {
    console.error('Hiba a frissítéskor:', error)
    throw error
  }
  return data
}
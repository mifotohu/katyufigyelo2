/**
 * Google Gemini API kliens
 * Használat: AI-alapú címfeloldás és adatvalidáció
 */

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
const STORAGE_KEY = 'gemini_api_key'
const STORAGE_EXPIRY_KEY = 'gemini_api_key_expiry'

/**
 * API kulcs lekérése (fallback mechanizmus)
 * 1. Próbáljuk meg a környezeti változóból
 * 2. Ha nincs, LocalStorage-ból
 * 3. Ha az is üres, null-t adunk vissza
 */
export const getApiKey = () => {
  // 1. Környezeti változó (production)
  const envKey = import.meta.env.VITE_GEMINI_API_KEY
  if (envKey && envKey !== 'your_gemini_api_key_here') {
    return envKey
  }

  // 2. LocalStorage (user által megadott)
  const storedKey = localStorage.getItem(STORAGE_KEY)
  const expiry = localStorage.getItem(STORAGE_EXPIRY_KEY)

  if (storedKey && expiry) {
    const now = new Date().getTime()
    if (now < parseInt(expiry)) {
      return storedKey
    } else {
      // Lejárt kulcs törlése
      clearApiKey()
    }
  }

  return null
}

/**
 * API kulcs mentése LocalStorage-ba (24 órás lejárattal)
 */
export const saveApiKey = (apiKey) => {
  const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000) // 24 óra
  localStorage.setItem(STORAGE_KEY, apiKey)
  localStorage.setItem(STORAGE_EXPIRY_KEY, expiryTime.toString())
}

/**
 * API kulcs törlése LocalStorage-ból
 */
export const clearApiKey = () => {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(STORAGE_EXPIRY_KEY)
}

/**
 * Ellenőrzi, hogy van-e érvényes API kulcs
 */
export const hasValidApiKey = () => {
  return getApiKey() !== null
}

/**
 * Gemini API hívás (opcionális funkció - címfeloldás, adatvalidáció)
 */
export const callGeminiAPI = async (prompt) => {
  const apiKey = getApiKey()
  
  if (!apiKey) {
    return { 
      success: false, 
      error: 'Gemini API kulcs hiányzik' 
    }
  }

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`API hiba: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    return { success: true, data: text }
  } catch (error) {
    console.error('Gemini API hiba:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Rate Limiting - Napi Maximum 10 Bejelentés / Felhasználó
 * 
 * LocalStorage alapú, böngésző fingerprint helyett egyszerű megoldás.
 * Naponta 00:00-kor reset.
 */

const STORAGE_KEY = 'katyufigyelo_daily_reports'
const STORAGE_DATE_KEY = 'katyufigyelo_last_reset'
const MAX_DAILY_REPORTS = 10

/**
 * Ellenőrzi, hogy új nap van-e (reset szükséges)
 */
const isNewDay = () => {
  const today = new Date().toDateString()
  const lastReset = localStorage.getItem(STORAGE_DATE_KEY)
  return lastReset !== today
}

/**
 * Reset-eli a számlálót új napra
 */
const resetCounter = () => {
  const today = new Date().toDateString()
  localStorage.setItem(STORAGE_KEY, '0')
  localStorage.setItem(STORAGE_DATE_KEY, today)
}

/**
 * Lekéri az aktuális bejelentések számát
 */
export const getDailyReportCount = () => {
  // Ha új nap, reset
  if (isNewDay()) {
    resetCounter()
    return 0
  }

  const count = localStorage.getItem(STORAGE_KEY)
  return count ? parseInt(count, 10) : 0
}

/**
 * Növeli a bejelentések számát
 */
export const incrementDailyReportCount = () => {
  const currentCount = getDailyReportCount()
  localStorage.setItem(STORAGE_KEY, (currentCount + 1).toString())
}

/**
 * Ellenőrzi, hogy lehet-e még bejelenteni ma
 */
export const canSubmitReport = () => {
  const currentCount = getDailyReportCount()
  return currentCount < MAX_DAILY_REPORTS
}

/**
 * Visszaadja, hány bejelentés van még hátra ma
 */
export const getRemainingReports = () => {
  const currentCount = getDailyReportCount()
  return Math.max(0, MAX_DAILY_REPORTS - currentCount)
}

/**
 * Formázott hibaüzenet ha elérte a limitet
 */
export const getRateLimitMessage = () => {
  const remaining = getRemainingReports()
  
  if (remaining === 0) {
    return `⚠️ Elérted a napi limitet (${MAX_DAILY_REPORTS} bejelentés). Holnap újra próbálkozz!`
  }
  
  return `Még ${remaining} bejelentést küldhetsz be ma.`
}

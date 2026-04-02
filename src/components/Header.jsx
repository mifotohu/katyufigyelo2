import React, { useState, useEffect } from 'react'
import { Car } from 'lucide-react'

const Header = () => {
  const [remaining, setRemaining] = useState(10)
  const [loading, setLoading] = useState(true)

  // Szerver-oldali limit lekérdezése
  const fetchRateLimit = async () => {
    try {
      const response = await fetch('/api/rate-limit-status')
      if (response.ok) {
        const data = await response.json()
        setRemaining(data.remaining || 10)
      }
    } catch (error) {
      console.error('Rate limit fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRateLimit()
    // 30 másodpercenként frissítés
    const interval = setInterval(fetchRateLimit, 30000)
    return () => clearInterval(interval)
  }, [])

  // Egyedi esemény amikor új bejelentés történt
  useEffect(() => {
    const handleReportSubmit = () => {
      fetchRateLimit() // Azonnal frissítés
    }
    window.addEventListener('reportSubmitted', handleReportSubmit)
    return () => window.removeEventListener('reportSubmitted', handleReportSubmit)
  }, [])

  return (
    <header className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md flex-shrink-0">
      <div className="max-w-7xl mx-auto px-2 py-1.5 md:px-4 md:py-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Bal oldal: Logo + Cím */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="bg-white/20 backdrop-blur-sm p-1 rounded">
              <Car className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h1 className="text-sm md:text-base font-bold flex items-center gap-1">
              Kátyúfigyelő
              <span className="text-base md:text-lg">⚠️</span>
            </h1>
          </div>

          {/* Közép: Statisztika + Napi limit + Jelmagyarázat */}
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            {/* Bejelentések száma */}
            <div className="text-xs md:text-sm font-semibold bg-white/10 px-2 py-0.5 md:px-3 md:py-1 rounded whitespace-nowrap">
              <span id="total-reports">Betöltés...</span>
            </div>
            
            {/* Napi limit számláló */}
            <div className="flex items-center gap-1.5">
              <div className="text-xs md:text-sm font-semibold bg-yellow-500/90 text-gray-900 px-2 py-0.5 md:px-3 md:py-1 rounded">
                {loading ? '⏳' : '📊'} {remaining}/10 · Naponta max. 10
              </div>
            </div>
            
            {/* Jelmagyarázat */}
            <div className="flex items-center gap-1.5 md:gap-2 text-xs">
              <div className="flex items-center gap-0.5 md:gap-1">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#3B82F6] border border-white"></div>
                <span>1-10</span>
              </div>
              <div className="flex items-center gap-0.5 md:gap-1">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FBBF24] border border-white"></div>
                <span>11-30</span>
              </div>
              <div className="flex items-center gap-0.5 md:gap-1">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#EF4444] border border-white"></div>
                <span>30+</span>
              </div>
            </div>
          </div>

          {/* Jobb oldal: Rövid leírás */}
          <div className="hidden lg:block text-xs max-w-[240px] text-right leading-tight opacity-90">
            Közösségi platform úthibák bejelentésére
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

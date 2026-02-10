import React, { useState, useEffect } from 'react'
import { Car, Info } from 'lucide-react'
import { getRemainingReports } from '../lib/rateLimit'

const Header = () => {
  const [remaining, setRemaining] = useState(getRemainingReports())
  const [showTooltip, setShowTooltip] = useState(false)

  // Frissítés minden render-nél
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemainingReports())
    }, 1000) // Másodpercenként ellenőriz

    return () => clearInterval(interval)
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
            
            {/* Napi limit számláló + Szöveges magyarázat */}
            <div className="flex items-center gap-1.5">
              <div className="text-xs md:text-sm font-semibold bg-yellow-500/90 text-gray-900 px-2 py-0.5 md:px-3 md:py-1 rounded">
                📊 {remaining}/10 · Naponta max. 10
              </div>
              
              {/* Szöveges magyarázat (mindig látható) */}
              <span className="text-xs hidden sm:inline whitespace-nowrap opacity-90">
                Naponta max. 10 bejelentés
              </span>
              
              {/* Info ikon tooltip-tel (opcionális részletek) */}
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="p-0.5 hover:bg-white/20 rounded transition-colors hidden md:block"
                aria-label="Információ"
              >
                <Info className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </button>

              {/* Tooltip */}
              {showTooltip && (
                <div className="absolute top-full mt-1 right-0 bg-white text-gray-800 rounded-lg shadow-xl p-2 z-[2000] w-56 text-xs">
                  <p className="font-semibold mb-1">📊 Napi bejelentési limit</p>
                  <p className="text-gray-700 leading-tight">
                    A számláló éjfélkor automatikusan reset-elődik.
                  </p>
                </div>
              )}
            </div>
            
            {/* Jelmagyarázat (mindig látható SZÁMOKKAL mobilon is) */}
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

          {/* Jobb oldal: Rövid leírás (csak desktop-on) */}
          <div className="hidden lg:block text-xs max-w-[240px] text-right leading-tight opacity-90">
            Közösségi platform úthibák bejelentésére
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

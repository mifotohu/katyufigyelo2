import React from 'react'
import { Car } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-2 py-1.5 md:px-4 md:py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Bal oldal: Logo + Cím (nagyon kompakt) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="bg-white/20 backdrop-blur-sm p-1 rounded">
              <Car className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h1 className="text-sm md:text-base font-bold flex items-center gap-1">
              Kátyúfigyelő
              <span className="text-base md:text-lg">⚠️</span>
            </h1>
          </div>

          {/* Közép: Bejelentések száma + Jelmagyarázat */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Statisztika */}
            <div className="text-xs md:text-sm font-semibold bg-white/10 px-2 py-0.5 md:px-3 md:py-1 rounded">
              <span id="total-reports">Betöltés...</span>
            </div>
            
            {/* Jelmagyarázat (desktop) */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#3B82F6] border border-white"></div>
                <span>1-10</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#FBBF24] border border-white"></div>
                <span>11-30</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#EF4444] border border-white"></div>
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

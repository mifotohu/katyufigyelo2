import React from 'react'
import { Car } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-3 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Bal oldal: Logo + Cím (kompakt) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-white/20 backdrop-blur-sm p-1.5 md:p-2 rounded-lg">
              <Car className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold flex items-center gap-1">
                Kátyúfigyelő
                <span className="text-xl md:text-2xl">⚠️</span>
              </h1>
            </div>
          </div>

          {/* Közép: Jelmagyarázat (csak desktop-on) */}
          <div className="hidden lg:flex items-center gap-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#3B82F6] border-2 border-white shadow-sm"></div>
              <span className="text-xs font-medium">1-10</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#FBBF24] border-2 border-white shadow-sm"></div>
              <span className="text-xs font-medium">11-30</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#EF4444] border-2 border-white shadow-sm"></div>
              <span className="text-xs font-medium">30+</span>
            </div>
          </div>

          {/* Jobb oldal: Leírás (csak desktop-on) */}
          <div className="hidden md:block text-xs max-w-xs text-right">
            <p className="leading-relaxed opacity-95">
              A Kátyúfigyelő egy közösségi platform, ahol bárki jelenthet úthibákat. 
              Segítsük egymást a biztonságosabb közlekedés érdekében.
            </p>
          </div>
        </div>

        {/* Mobil jelmagyarázat + statisztika */}
        <div className="lg:hidden mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
              <span>1-10</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FBBF24]"></div>
              <span>11-30</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
              <span>30+</span>
            </div>
          </div>
          <div className="text-right">
            <span className="opacity-90" id="total-reports">Betöltés...</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

import React from 'react'
import { MapPin, AlertTriangle } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between">
          {/* Logo és Cím */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 md:p-3 rounded-xl">
              <AlertTriangle className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                Kátyúfigyelő
                <span className="text-3xl">⚠️</span>
              </h1>
              <p className="text-xs md:text-sm opacity-90 mt-1">
                Közösségi úthibák bejelentése Magyarországon
              </p>
            </div>
          </div>

          {/* Stat badge (csak desktop-on) */}
          <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
            <MapPin className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-semibold">Bejelentések száma</p>
              <p className="text-xs opacity-80" id="total-reports">Betöltés...</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

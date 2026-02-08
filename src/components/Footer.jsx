import React, { useState } from 'react'
import { Phone, AlertCircle, Heart, Info } from 'lucide-react'

const Footer = () => {
  const [showTooltip, setShowTooltip] = useState(false)

  const contacts = [
    {
      title: 'Budapest Közút Zrt.',
      subtitle: 'Budapesti úthibák',
      phone: '+36 1 776 6107',
      email: 'karrendezes@budapestkozut.hu',
      icon: AlertCircle
    },
    {
      title: 'Magyar Közút Nonprofit Zrt.',
      subtitle: 'Országos úthálózat',
      email: 'karigenykezeles@kozut.hu',
      website: 'Magyar Közút weboldalán',
      icon: Phone
    }
  ]

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Főrész: Telefonszámok + Tooltip */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Bal oldal: Fontos elérhetőségek */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Kárigény bejelentés
            </h3>
            <div className="space-y-3">
              {contacts.map((contact, index) => (
                <div 
                  key={index}
                  className="bg-gray-800 rounded-lg p-3 text-sm"
                >
                  <div className="flex items-start gap-2">
                    <contact.icon className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-xs">{contact.title}</p>
                      <p className="text-xs text-gray-400 mb-1">{contact.subtitle}</p>
                      {contact.phone && (
                        <a 
                          href={`tel:${contact.phone.replace(/[\s-]/g, '')}`}
                          className="text-orange-500 hover:text-orange-400 font-medium block text-xs"
                        >
                          📞 {contact.phone}
                        </a>
                      )}
                      {contact.email && (
                        <a 
                          href={`mailto:${contact.email}`}
                          className="text-blue-400 hover:text-blue-300 block text-xs mt-1 break-all"
                        >
                          ✉️ {contact.email}
                        </a>
                      )}
                      {contact.website && (
                        <p className="text-gray-400 text-xs mt-1">
                          🌐 Online: {contact.website}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Jobb oldal: Kárbejelentési útmutató (tooltip) */}
          <div className="relative">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-white">
                  Kárbejelentési tudnivalók
                </h3>
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                  aria-label="Részletek"
                >
                  <Info className="w-5 h-5 text-orange-500" />
                </button>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Kátyúból eredő jármű károsodás esetén haladéktalanul jelentsd be az illetékes útkezelőnek. 
                <span className="text-orange-400 font-medium"> Kattints az ikonra a részletekért.</span>
              </p>

              {/* Tooltip panel */}
              {showTooltip && (
                <div className="absolute left-0 right-0 md:left-auto md:right-0 md:w-96 top-full mt-2 bg-white text-gray-800 rounded-lg shadow-2xl p-4 z-50 max-h-96 overflow-y-auto custom-scrollbar">
                  <h4 className="font-bold text-sm mb-3 text-orange-600">
                    📋 Szükséges dokumentumok és információk
                  </h4>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="font-semibold mb-1">Bejelentéshez szükséges:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Kitöltött kárbejelentő lap (útkezelő weboldaláról)</li>
                        <li>Fényképek a helyszínről és a károsodásról</li>
                        <li>Gépjármű forgalmi engedély másolata (mindkét oldal)</li>
                        <li>Kötelező gépjármű felelősségbiztosítás igazolása</li>
                        <li>Kárbejelentő személyi igazolványa</li>
                        <li>Vezetői jogosítvány</li>
                        <li>Javítási számla vagy árajánlat</li>
                        <li>Rendőrségi jegyzőkönyv (ha volt intézkedés)</li>
                        <li>Tanúnyilatkozatok (ha vannak)</li>
                      </ul>
                    </div>

                    <div className="border-t pt-3">
                      <p className="font-semibold mb-1 text-red-600">⚠️ Mire kell figyelni:</p>
                      <ul className="space-y-1 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          <span><strong>Azonnali bejelentés:</strong> A késedelmes bejelentés az igény elutasítását eredményezheti</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          <span><strong>Helyszíni dokumentálás:</strong> Részletes fényképek a kátyúról és a járműkárosodásról</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          <span><strong>E-mail méretkorlát:</strong> Fájlméret max. 5 MB</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          <span><strong>Ügyintézés:</strong> Nyilvántartásba vétel, hiánypótlás, kivizsgálás</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Adatvédelmi tájékoztató */}
            <div className="mt-3 bg-green-900/30 border border-green-700 rounded-lg p-3">
              <p className="text-xs text-green-300 flex items-start gap-2">
                <span className="text-green-400 text-base">🔒</span>
                <span>
                  <strong className="text-green-200">Adatvédelem:</strong> Semmilyen személyes adatot nem kérünk be, 
                  IP címet nem tárolunk. A bejelentés teljesen anonim módon történik.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Alsó sor: Copyright */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
            <p className="text-gray-500">
              © 2026 Kátyúfigyelő. Készítve 
              <Heart className="w-3 h-3 inline mx-1 text-red-500" />
              -tel a közösségért.
            </p>
            <div className="flex items-center gap-3 text-gray-600">
              <span>🔒 Biztonságos</span>
              <span>📱 Reszponzív</span>
              <span className="text-gray-700">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

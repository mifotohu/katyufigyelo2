import React from 'react'
import { Phone, AlertCircle, Github, Heart } from 'lucide-react'

const Footer = () => {
  const emergencyNumbers = [
    {
      name: 'Magyar Közút',
      number: '06-1-819-9000',
      description: 'Úthibák bejelentése',
      icon: AlertCircle
    },
    {
      name: 'Rendőrség / Mentők',
      number: '112',
      description: 'Sürgősségi segélyhívás',
      icon: Phone
    }
  ]

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Fontos telefonszámok */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Fontos telefonszámok
            </h3>
            <div className="space-y-3">
              {emergencyNumbers.map((contact, index) => (
                <div 
                  key={index}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <contact.icon className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{contact.name}</p>
                      <a 
                        href={`tel:${contact.number.replace(/[\s-]/g, '')}`}
                        className="text-xl font-bold text-orange-500 hover:text-orange-400 transition-colors"
                      >
                        {contact.number}
                      </a>
                      <p className="text-sm text-gray-400 mt-1">{contact.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Információk */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Az alkalmazásról
            </h3>
            <div className="space-y-4 text-sm">
              <p>
                A <strong className="text-white">Kátyúfigyelő</strong> egy közösségi platform, 
                ahol bárki jelenthet úthibákat. Célunk, hogy összefogással 
                biztonságosabbá tegyük Magyarország útjait.
              </p>
              <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-3">
                <p className="text-orange-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <strong>Fontos:</strong> Ez nem hivatalos bejelentő rendszer!
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  A súlyos úthibákat továbbra is jelezd a Magyar Közútnak telefonon.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span>🔒 Biztonságos adatkezelés</span>
                <span>🌍 Nyílt forráskód</span>
                <span>📱 Mobile-first design</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright és social */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2026 Kátyúfigyelő. Készítve 
              <Heart className="w-3 h-3 inline mx-1 text-red-500" />
              -tel a közösségért.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <span className="text-xs text-gray-600">
                v1.0.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

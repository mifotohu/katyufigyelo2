import React from 'react'
import { Phone, AlertCircle, Heart } from 'lucide-react'

const Footer = () => {
  const contacts = [
    {
      title: 'Budapest Közút Zrt.',
      subtitle: 'Budapesti úthibák',
      phone: '+36 1 776 6107',
      email: 'karrendezes@budapestkozut.hu',
      icon: AlertCircle
    },
    {
      title: 'Magyar Közút Zrt.',
      subtitle: 'Országos úthálózat',
      email: 'karigenykezeles@kozut.hu',
      website: 'kozut.hu',
      icon: Phone
    }
  ]

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Főrész: Telefonszámok egymás mellett */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {contacts.map((contact, index) => (
            <div 
              key={index}
              className="bg-gray-800 rounded p-2.5 text-xs"
            >
              <div className="flex items-start gap-2">
                <contact.icon className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-xs">{contact.title}</p>
                  <p className="text-xs text-gray-400">{contact.subtitle}</p>
                  {contact.phone && (
                    <a 
                      href={`tel:${contact.phone.replace(/[\s-]/g, '')}`}
                      className="text-orange-400 hover:text-orange-300 font-medium block text-xs mt-0.5"
                    >
                      📞 {contact.phone}
                    </a>
                  )}
                  {contact.email && (
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-blue-400 hover:text-blue-300 block text-xs mt-0.5 truncate"
                    >
                      ✉️ {contact.email}
                    </a>
                  )}
                  {contact.website && (
                    <p className="text-gray-400 text-xs mt-0.5">
                      🌐 {contact.website}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Adatvédelmi tájékoztató */}
        <div className="bg-green-900/20 border border-green-800 rounded p-2 mb-3">
          <p className="text-xs text-green-300 flex items-start gap-2">
            <span className="text-green-400 text-sm flex-shrink-0">🔒</span>
            <span>
              <strong className="text-green-200">Adatvédelem:</strong> Semmilyen személyes adatot nem kérünk be, 
              IP címet nem tárolunk. A bejelentés teljesen anonim módon történik.
            </span>
          </p>
        </div>

        {/* Alsó sor: Copyright */}
        <div className="border-t border-gray-800 pt-2">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
            <p className="text-gray-500 text-xs">
              © 2026 Kátyúfigyelő. 
              <Heart className="w-3 h-3 inline mx-1 text-red-500" />
              Közösségért.
            </p>
            <div className="flex items-center gap-3 text-gray-600 text-xs">
              <span>🔒 Biztonságos</span>
              <span>📱 Reszponzív</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

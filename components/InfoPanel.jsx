import React, { useState } from 'react'
import { Info, ChevronDown, ChevronUp } from 'lucide-react'

const InfoPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="absolute top-4 left-4 z-[1000] w-64 max-w-[calc(100vw-2rem)]">
      {/* Header - mindig látható */}
      <div 
        className="bg-white rounded-lg shadow-xl border-2 border-orange-500 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span className="text-xs font-bold text-gray-800">Kárbejelentési infó</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </div>

        {/* Tartalom - összecsukható */}
        {isExpanded && (
          <div className="px-2 pb-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-2 text-xs">
              <div className="bg-orange-50 rounded p-2">
                <p className="font-semibold text-orange-800 mb-1">📋 Szükséges dokumentumok:</p>
                <ul className="list-disc list-inside space-y-0.5 text-gray-700 text-xs leading-tight">
                  <li>Kárbejelentő lap</li>
                  <li>Fényképek (helyszín, kár)</li>
                  <li>Forgalmi engedély</li>
                  <li>Biztosítás igazolása</li>
                  <li>Személyi igazolvány</li>
                  <li>Jogosítvány</li>
                  <li>Javítási számla/árajánlat</li>
                  <li>Rendőrségi jegyzőkönyv (ha van)</li>
                </ul>
              </div>

              <div className="bg-red-50 rounded p-2">
                <p className="font-semibold text-red-800 mb-1">⚠️ Fontos:</p>
                <ul className="space-y-0.5 text-gray-700 text-xs leading-tight">
                  <li>• <strong>Azonnali bejelentés</strong> szükséges</li>
                  <li>• <strong>Részletes fotók</strong> készítése</li>
                  <li>• Max <strong>5 MB</strong> e-mail méret</li>
                  <li>• Hiánypótlási felszólítás lehetséges</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded p-2">
                <p className="font-semibold text-blue-800 mb-1">📞 Elérhetőségek:</p>
                <div className="space-y-1 text-xs">
                  <div>
                    <p className="font-medium text-gray-800">Budapest:</p>
                    <p className="text-gray-600">+36 1 776 6107</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Országos:</p>
                    <p className="text-gray-600">karigenykezeles@kozut.hu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InfoPanel

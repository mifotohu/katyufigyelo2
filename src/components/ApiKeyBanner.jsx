import React, { useState, useEffect } from 'react'
import { AlertCircle, Key, X, Check, ExternalLink, Info } from 'lucide-react'
import { getApiKey, saveApiKey, clearApiKey, hasValidApiKey } from '../lib/geminiClient'

const ApiKeyBanner = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    // Banner megjelenítése, ha nincs érvényes API kulcs
    setIsVisible(!hasValidApiKey())
  }, [])

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim())
      setSaveSuccess(true)
      setTimeout(() => {
        setIsVisible(false)
        setSaveSuccess(false)
      }, 2000)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setShowInput(false)
  }

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Figyelmeztetés ikon és szöveg */}
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className="w-6 h-6 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="font-semibold text-sm md:text-base">
                🔑 Google AI API kulcs szükséges az optimális működéshez
              </p>
              <p className="text-xs md:text-sm opacity-90 mt-1">
                Az AI-alapú címfeloldáshoz és adatvalidációhoz
              </p>
            </div>
          </div>

          {/* Akciógombok */}
          <div className="flex items-center gap-2">
            {!showInput ? (
              <>
                {/* Tooltip gomb */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="Súgó"
                  >
                    <Info className="w-5 h-5" />
                  </button>

                  {/* Tooltip */}
                  {showTooltip && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white text-gray-800 rounded-lg shadow-xl p-4 z-50 text-sm">
                      <div className="space-y-2">
                        <p className="font-semibold flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Hogyan szerezd meg az API kulcsot?
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                          <li>Látogass el: 
                            <a 
                              href="https://aistudio.google.com/app/apikey" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline ml-1 inline-flex items-center gap-1"
                            >
                              Google AI Studio
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </li>
                          <li>Kattints a "Create API Key" gombra</li>
                          <li>Válaszd ki a projektet (vagy hozz létre újat)</li>
                          <li>Másold ki a generált kulcsot</li>
                          <li>Illeszd be ide az alkalmazásba</li>
                        </ol>
                        <p className="text-xs text-gray-600 pt-2 border-t">
                          🔒 A kulcs 24 órán át helyben, a böngésződben tárolódik.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* API kulcs megadása gomb */}
                <button
                  onClick={() => setShowInput(true)}
                  className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors text-sm"
                >
                  <Key className="w-4 h-4" />
                  API kulcs megadása
                </button>
              </>
            ) : (
              /* API kulcs input mező */
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="bg-white/20 text-white placeholder-white/60 px-3 py-1.5 rounded border-none outline-none focus:bg-white/30 transition-colors text-sm w-48"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveKey()}
                />
                <button
                  onClick={handleSaveKey}
                  disabled={!apiKey.trim() || saveSuccess}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 p-2 rounded-lg transition-colors"
                  aria-label="Mentés"
                >
                  {saveSuccess ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Bezárás gomb */}
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Bezárás"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sikeres mentés üzenet */}
        {saveSuccess && (
          <div className="mt-2 bg-green-500/20 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 text-sm">
            <Check className="w-4 h-4" />
            <span>API kulcs sikeresen mentve! (24 órán át érvényes)</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiKeyBanner

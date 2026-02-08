import React, { useState, useEffect } from 'react'
import { Sparkles, Key, X, Check, ExternalLink, Info } from 'lucide-react'
import { getApiKey, saveApiKey, hasValidApiKey } from '../lib/geminiClient'

const GeminiApiBanner = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    // Banner megjelenítése, ha nincs érvényes API kulcs ÉS nincs env változó
    const envKey = import.meta.env.VITE_GEMINI_API_KEY
    const hasEnvKey = envKey && envKey !== 'your_gemini_api_key_here'
    
    if (!hasEnvKey && !hasValidApiKey()) {
      setIsVisible(true)
    }
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
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Figyelmeztetés ikon és szöveg */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs md:text-sm truncate">
                🤖 Saját Gemini AI API kulcs használata javasolt
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
                    className="p-1.5 hover:bg-white/20 rounded transition-colors"
                    aria-label="Súgó"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  {/* Tooltip */}
                  {showTooltip && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white text-gray-800 rounded-lg shadow-xl p-3 z-50 text-xs">
                      <div className="space-y-2">
                        <p className="font-semibold flex items-center gap-2 text-purple-600">
                          <Key className="w-3.5 h-3.5" />
                          Miért kell saját API kulcs?
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                          A Vercel-en deploy-olt alkalmazás a fejlesztő Google AI API kreditjeit használja. 
                          Saját kulccsal te kontrollálod a használatot és a költségeket.
                        </p>
                        
                        <div className="border-t pt-2">
                          <p className="font-semibold mb-1">Hogyan szerezd meg?</p>
                          <ol className="list-decimal list-inside space-y-0.5 text-gray-700">
                            <li>Látogass el: 
                              <a 
                                href="https://aistudio.google.com/app/apikey" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:underline ml-1 inline-flex items-center gap-0.5"
                              >
                                Google AI Studio
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </li>
                            <li>Kattints: "Create API Key"</li>
                            <li>Válaszd ki a projektet</li>
                            <li>Másold ki a kulcsot</li>
                            <li>Illeszd be ide</li>
                          </ol>
                        </div>
                        
                        <p className="text-xs text-gray-600 pt-2 border-t">
                          🔒 A kulcs <strong>24 órán át</strong> a böngésződben tárolódik (localStorage). 
                          Semmilyen szerverre nem kerül fel.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* API kulcs megadása gomb */}
                <button
                  onClick={() => setShowInput(true)}
                  className="flex items-center gap-1.5 bg-white text-purple-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-purple-50 transition-colors text-xs whitespace-nowrap"
                >
                  <Key className="w-3.5 h-3.5" />
                  API kulcs
                </button>
              </>
            ) : (
              /* API kulcs input mező */
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1.5">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="bg-white/20 text-white placeholder-white/60 px-2 py-1 rounded border-none outline-none focus:bg-white/30 transition-colors text-xs w-36"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveKey()}
                />
                <button
                  onClick={handleSaveKey}
                  disabled={!apiKey.trim() || saveSuccess}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 p-1.5 rounded transition-colors"
                  aria-label="Mentés"
                >
                  {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Bezárás gomb */}
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              aria-label="Bezárás"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sikeres mentés üzenet */}
        {saveSuccess && (
          <div className="mt-2 bg-green-500/20 backdrop-blur-sm rounded p-2 flex items-center gap-2 text-xs">
            <Check className="w-3.5 h-3.5" />
            <span>API kulcs sikeresen mentve! (24 órán át érvényes)</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default GeminiApiBanner

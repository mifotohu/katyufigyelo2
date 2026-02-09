import React, { useState } from 'react'
import Header from './components/Header'
import Map from './components/Map'
import ReportForm from './components/ReportForm'
import Footer from './components/Footer'
import { CheckCircle, AlertCircle } from 'lucide-react'

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [notification, setNotification] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    
    // Ideiglenes marker törlése
    if (selectedLocation?.clearMarker) {
      selectedLocation.clearMarker()
    }
    
    setSelectedLocation(null)
  }

  const handleSubmitSuccess = (isDuplicate) => {
    // Értesítés megjelenítése
    if (isDuplicate) {
      setNotification({
        type: 'warning',
        message: 'Ezen a helyszínen már van bejelentés! A számláló frissítve.'
      })
    } else {
      setNotification({
        type: 'success',
        message: 'Bejelentés sikeresen elküldve! Köszönjük a segítséget!'
      })
    }

    // Űrlap bezárása
    handleCloseForm()

    // Térkép frissítése
    setRefreshTrigger(prev => prev + 1)

    // Értesítés elrejtése 5 másodperc után
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Header />

      {/* Értesítés */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div
            className={`rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-md ${
              notification.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  notification.type === 'success' ? 'text-green-800' : 'text-yellow-800'
                }`}
              >
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className={`text-2xl leading-none ${
                notification.type === 'success' ? 'text-green-600' : 'text-yellow-600'
              } hover:opacity-70`}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Térkép */}
      <Map 
        onLocationSelect={handleLocationSelect} 
        refreshTrigger={refreshTrigger}
      />

      {/* Bejelentő űrlap modal - Magas z-indexszel */}
      {showForm && selectedLocation && (
        <div className="relative z-[9999]">
          <ReportForm
            location={selectedLocation}
            onClose={handleCloseForm}
            onSubmitSuccess={handleSubmitSuccess}
          />
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App

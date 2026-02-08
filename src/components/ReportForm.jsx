import React, { useState } from 'react'
import { X, Camera, Loader2, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import { createPotholeReport, uploadPotholePhoto } from '../lib/supabaseClient'

const ReportForm = ({ location, onClose, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    city: location.city || '',
    postalCode: location.postalCode || '',
    address: location.address || '',
    positionOnRoad: 'Szélén'
  })
  
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [photoError, setPhotoError] = useState(null)

  const roadPositions = [
    'Szélén',
    'Középen',
    'Sávváltónál',
    'Kereszteződésben',
    'Járdán'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    setPhotoError(null)

    if (!file) return

    // Fájl típus ellenőrzés
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setPhotoError('Csak JPG és PNG formátumú képek engedélyezettek!')
      return
    }

    // Fájl méret ellenőrzés (3MB)
    if (file.size > 3 * 1024 * 1024) {
      setPhotoError('A kép mérete maximum 3MB lehet!')
      return
    }

    setPhoto(file)
    
    // Előnézet létrehozása
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Fotó feltöltése (ha van)
      let photoUrl = null
      if (photo) {
        const tempId = `temp-${Date.now()}`
        const { url, error: uploadError } = await uploadPotholePhoto(photo, tempId)
        
        if (uploadError) {
          throw new Error('Fotó feltöltése sikertelen')
        }
        
        photoUrl = url
      }

      // Bejelentés létrehozása
      const reportData = {
        latitude: location.lat,
        longitude: location.lng,
        city: formData.city,
        postal_code: formData.postalCode,
        address: formData.address,
        position_on_road: formData.positionOnRoad,
        photo_url: photoUrl,
        report_count: 1
      }

      const { data, error: createError, isDuplicate } = await createPotholeReport(reportData)

      if (createError) {
        throw new Error('Bejelentés létrehozása sikertelen')
      }

      // Sikeres bejelentés
      if (location.marker) {
        location.marker.setMap(null)
      }

      // Sikeres visszajelzés
      onSubmitSuccess(isDuplicate)
      
    } catch (err) {
      console.error('Bejelentési hiba:', err)
      setError(err.message || 'Hiba történt a bejelentés során. Próbáld újra!')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Kátyú bejelentése</h2>
              <p className="text-sm opacity-90">Töltsd ki az adatokat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Bezárás"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Hiba üzenet */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Koordináták megjelenítése */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-semibold text-gray-700 mb-1">📍 Kiválasztott helyszín:</p>
            <p className="text-gray-600">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          </div>

          {/* Város */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Város / Település *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
              placeholder="pl. Budapest"
            />
          </div>

          {/* Irányítószám */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Irányítószám
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              maxLength={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
              placeholder="pl. 1011"
            />
          </div>

          {/* Cím */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Pontos cím *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
              placeholder="pl. Fő utca 12."
            />
          </div>

          {/* Kátyú helye az úton */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Kátyú helye az úton *
            </label>
            <select
              name="positionOnRoad"
              value={formData.positionOnRoad}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
            >
              {roadPositions.map(position => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>

          {/* Fotó feltöltés */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Fotó (opcionális)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Előnézet"
                      className="max-h-40 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null)
                        setPhotoPreview(null)
                        setPhotoError(null)
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-gray-400" />
                    <p className="text-sm text-gray-600">Kattints a fotó feltöltéséhez</p>
                    <p className="text-xs text-gray-500">Max 3MB • JPG, PNG</p>
                  </>
                )}
              </label>
            </div>
            {photoError && (
              <p className="text-sm text-red-600 mt-1">{photoError}</p>
            )}
          </div>

          {/* Időpont automatikus */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="text-blue-800">
              ⏰ Bejelentés időpontja: <strong>{new Date().toLocaleString('hu-HU')}</strong>
            </p>
          </div>

          {/* Akció gombok */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Mégse
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.city || !formData.address}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Beküldés...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Beküldöm
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportForm

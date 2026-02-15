import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Loader2 } from 'lucide-react'
import { getPotholeReports } from '../lib/supabaseClient'
import InfoPanel from './InfoPanel'

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Marker színek bejelentések száma alapján - ÚJ SZABÁLY
const getMarkerColor = (reportCount, isSolved) => {
  if (isSolved) return '#10B981' // Zöld - Megoldva!
  if (reportCount > 30) return '#EF4444' // Piros - 30+ bejelentés
  if (reportCount >= 11) return '#FBBF24'  // Sárga - 11-30 bejelentés
  return '#3B82F6' // Kék - 1-10 bejelentés
}

const getMarkerLabel = (reportCount, isSolved) => {
  if (isSolved) return 'MEGOLDVA ✓'
  if (reportCount > 30) return 'VESZÉLYES!'
  if (reportCount >= 11) return 'Figyelem'
  return 'Bejelentve'
}

// Custom marker icon factory
const createCustomIcon = (color, count, isSolved) => {
  const size = isSolved ? 28 : (20 + (count * 2))
  const displayText = isSolved ? '✓' : count
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: ${isSolved ? '16px' : '10px'};
      ">${displayText}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Új marker ikon (zöld)
const newMarkerIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background-color: #10B981;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      animation: pulse 1.5s infinite;
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

// Komponens a térkép kattintások kezelésére
const MapClickHandler = ({ onLocationSelect }) => {
  const [tempMarker, setTempMarker] = useState(null)

  // Magyarország határai (approximate bounding box)
  const isInHungary = (lat, lng) => {
    // Magyarország határai (szigorúbb ellenőrzés)
    const HUNGARY_BOUNDS = {
      north: 48.585,  // Észak (Szlovákia határ)
      south: 45.74,   // Dél (Horvátország határ)
      west: 16.11,    // Nyugat (Ausztria határ)
      east: 22.90     // Kelet (Ukrajna/Románia határ)
    }
    
    const withinBounds = lat >= HUNGARY_BOUNDS.south && 
                        lat <= HUNGARY_BOUNDS.north && 
                        lng >= HUNGARY_BOUNDS.west && 
                        lng <= HUNGARY_BOUNDS.east
    
    return withinBounds
  }

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng

      // Ellenőrizzük, hogy Magyarország területén van-e
      if (!isInHungary(lat, lng)) {
        // Alert üzenet
        alert('⚠️ Csak Magyarország területén lehet kátyút bejelenteni!\n\n' +
              'Kérlek, kattints a térképre Magyarország határain belül.')
        return // NEM hozunk létre markert és NEM nyitjuk meg a form-ot
      }

      // Reverse geocoding OpenStreetMap Nominatim API-val
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        )
        const data = await response.json()

        const city = data.address?.city || 
                     data.address?.town || 
                     data.address?.village || 
                     data.address?.municipality || 
                     'Ismeretlen'
        
        const postalCode = data.address?.postcode || ''
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`

        setTempMarker({ lat, lng })
        
        onLocationSelect({
          lat,
          lng,
          address,
          city,
          postalCode,
          clearMarker: () => setTempMarker(null)
        })
      } catch (error) {
        console.error('Geocoding hiba:', error)
        setTempMarker({ lat, lng })
        onLocationSelect({
          lat,
          lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          city: 'Ismeretlen',
          postalCode: '',
          clearMarker: () => setTempMarker(null)
        })
      }
    }
  })

  return tempMarker ? (
    <Marker position={[tempMarker.lat, tempMarker.lng]} icon={newMarkerIcon}>
      <Popup>Új bejelentés helyszíne</Popup>
    </Marker>
  ) : null
}

// Pothole markerek komponens
const PotholeMarkers = ({ reports, onRefresh }) => {
  if (!reports || reports.length === 0) return null

  return (
    <>
      {reports.map((report) => {
        const markerColor = getMarkerColor(report.report_count, report.solved)
        const markerLabel = getMarkerLabel(report.report_count, report.solved)
        const icon = createCustomIcon(markerColor, report.report_count, report.solved)

        return (
          <Marker
            key={report.id}
            position={[parseFloat(report.latitude), parseFloat(report.longitude)]}
            icon={icon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: markerColor }}
                  ></div>
                  <span className="font-bold text-sm">{markerLabel}</span>
                </div>
                <h3 className="font-bold text-base mb-2">{report.city}</h3>
                <p className="text-sm text-gray-700 mb-2">{report.address}</p>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>📍 {report.position_on_road}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{report.report_count}x bejelentve</span>
                    {/* +1 gomb - számláló növelése */}
                    {!report.solved && (
                      <button
                        onClick={async () => {
                          const response = await fetch('/api/increment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ reportId: report.id })
                          })
                          const result = await response.json()

                          if (response.status === 429) {
                            alert('⚠️ ' + result.message)
                            return
                          }
                          if (!response.ok) {
                            alert('Hiba: ' + (result.error || 'Ismeretlen hiba'))
                            return
                          }
                          await onRefresh()
                          setTimeout(() => alert(`✓ Bejelentés megerősítve! (${result.data.report_count}x)`), 100)
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-2 py-0.5 rounded text-xs transition-colors"
                        title="Bejelentés megerősítése (+1)"
                      >
                        +1
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(report.created_at).toLocaleDateString('hu-HU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                
                {/* Gombok: Megoldva */}
                {!report.solved && (
                  <button
                    onClick={async () => {
                      if (confirm('Biztosan megoldottnak jelölöd ezt a kátyút?')) {
                        const response = await fetch('/api/solve', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ reportId: report.id })
                        })
                        const result = await response.json()

                        if (!response.ok) {
                          alert('Hiba: ' + (result.error || 'Ismeretlen hiba'))
                          return
                        }
                        await onRefresh()
                        setTimeout(() => alert('✓ Kátyú sikeresen megoldottnak jelölve!'), 100)
                      }
                    }}
                    className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-3 rounded text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    ✓ Megoldva
                  </button>
                )}
                
                {/* Megoldva státusz */}
                {report.solved && report.solved_at && (
                  <div className="mt-2 bg-green-50 border border-green-200 rounded p-2 text-xs text-green-800">
                    ✓ Megoldva: {new Date(report.solved_at).toLocaleDateString('hu-HU')}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

// Statisztika frissítő komponens
const StatsUpdater = ({ reports }) => {
  useEffect(() => {
    const statsElement = document.getElementById('total-reports')
    if (statsElement) {
      if (!reports || reports.length === 0) {
        statsElement.textContent = '0 bejelentés'
      } else {
        const totalReports = reports.reduce((sum, report) => sum + (report.report_count || 1), 0)
        statsElement.textContent = `${totalReports} bejelentés (${reports.length} helyszín)`
      }
    }
  }, [reports])

  return null
}

const Map = ({ onLocationSelect, refreshTrigger }) => {
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Magyarország központi koordinátái
  const HUNGARY_CENTER = [47.1625, 19.5033]

  // Bejelentések betöltése
  const loadPotholeReports = async () => {
    const { data, error } = await getPotholeReports()
    
    if (error) {
      console.error('Bejelentések betöltési hiba:', error)
      setError('Bejelentések betöltése sikertelen')
      return
    }

    setReports(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    loadPotholeReports()
  }, [refreshTrigger])

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Térkép hiba</h3>
          <p className="text-gray-600 max-w-md">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full z-0">
      {/* h-full: Kitölti a wrapper-t
          Wrapper-ben van a max-h korlátozás
      */}
      {/* Betöltés jelző */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 z-[1000] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-700 font-semibold">Térkép betöltése...</p>
          </div>
        </div>
      )}

      {/* Jelmagyarázat eltávolítva - most a headerben van */}

      {/* Kárbejelentési info panel */}
      <InfoPanel />

      {/* OpenStreetMap Térkép */}
      <MapContainer
        center={HUNGARY_CENTER}
        zoom={7}
        minZoom={6}
        maxZoom={18}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onLocationSelect={onLocationSelect} />
        <PotholeMarkers reports={reports} onRefresh={loadPotholeReports} />
        <StatsUpdater reports={reports} />
      </MapContainer>
    </div>
  )
}

export default Map

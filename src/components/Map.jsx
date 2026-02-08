import React, { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin, Loader2 } from 'lucide-react'
import { getPotholeReports } from '../lib/supabaseClient'

const Map = ({ onLocationSelect, refreshTrigger }) => {
  const mapRef = useRef(null)
  const googleMapRef = useRef(null)
  const markersRef = useRef([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Magyarország központi koordinátái
  const HUNGARY_CENTER = { lat: 47.1625, lng: 19.5033 }

  // Marker színek bejelentések száma alapján
  const getMarkerColor = (reportCount) => {
    if (reportCount >= 10) return '#EF4444' // Piros - veszélyes
    if (reportCount >= 6) return '#FBBF24'  // Sárga - figyelem
    return '#3B82F6' // Kék - alap
  }

  const getMarkerLabel = (reportCount) => {
    if (reportCount >= 10) return 'VESZÉLYES!'
    if (reportCount >= 6) return 'Figyelem'
    return 'Bejelentve'
  }

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places', 'geometry']
        })

        const google = await loader.load()
        
        // Térkép inicializálása
        const map = new google.maps.Map(mapRef.current, {
          center: HUNGARY_CENTER,
          zoom: 7,
          minZoom: 6,
          maxZoom: 18,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.TOP_RIGHT
          },
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        googleMapRef.current = map

        // Kattintás esemény - új bejelentés helyszínének kiválasztása
        map.addListener('click', (event) => {
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()
          
          // Ideiglenes marker
          const tempMarker = new google.maps.Marker({
            position: { lat, lng },
            map: map,
            animation: google.maps.Animation.DROP,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#10B981',
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 2
            },
            title: 'Új bejelentés helyszíne'
          })

          // Reverse geocoding - cím lekérése koordinátákból
          const geocoder = new google.maps.Geocoder()
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const addressComponents = results[0].address_components
              
              let city = ''
              let postalCode = ''
              
              addressComponents.forEach(component => {
                if (component.types.includes('locality')) {
                  city = component.long_name
                }
                if (component.types.includes('postal_code')) {
                  postalCode = component.long_name
                }
              })

              onLocationSelect({
                lat,
                lng,
                address: results[0].formatted_address,
                city: city || 'Ismeretlen',
                postalCode: postalCode || '',
                marker: tempMarker
              })
            }
          })
        })

        // Meglévő bejelentések betöltése
        await loadPotholeMarkers(google, map)
        
        setIsLoading(false)
      } catch (err) {
        console.error('Térkép betöltési hiba:', err)
        setError('A térkép betöltése sikertelen. Ellenőrizd a Google Maps API kulcsot!')
        setIsLoading(false)
      }
    }

    initMap()
  }, [])

  // Bejelentések újratöltése
  useEffect(() => {
    if (refreshTrigger && googleMapRef.current) {
      loadPotholeMarkers(window.google, googleMapRef.current)
    }
  }, [refreshTrigger])

  // Kátyúbejelentések betöltése és megjelenítése
  const loadPotholeMarkers = async (google, map) => {
    // Régi markerek törlése
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    const { data, error } = await getPotholeReports()
    
    if (error) {
      console.error('Bejelentések betöltési hiba:', error)
      return
    }

    if (!data || data.length === 0) {
      // Frissítjük a header statisztikát
      const statsElement = document.getElementById('total-reports')
      if (statsElement) {
        statsElement.textContent = '0 bejelentés'
      }
      return
    }

    // Statisztika frissítése
    const statsElement = document.getElementById('total-reports')
    if (statsElement) {
      const totalReports = data.reduce((sum, report) => sum + (report.report_count || 1), 0)
      statsElement.textContent = `${totalReports} bejelentés (${data.length} helyszín)`
    }

    // Markerek létrehozása
    data.forEach(report => {
      const markerColor = getMarkerColor(report.report_count)
      const markerLabel = getMarkerLabel(report.report_count)

      const marker = new google.maps.Marker({
        position: { 
          lat: parseFloat(report.latitude), 
          lng: parseFloat(report.longitude) 
        },
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12 + (report.report_count * 0.5), // Méret növekszik a bejelentések számával
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        title: `${report.report_count} bejelentés - ${report.city}`,
        zIndex: report.report_count * 10 // Fontosabbak előrébb
      })

      // Info ablak
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-4 h-4 rounded-full" style="background-color: ${markerColor}"></div>
              <span class="font-bold text-sm">${markerLabel}</span>
            </div>
            <h3 class="font-bold text-base mb-2">${report.city}</h3>
            <p class="text-sm text-gray-700 mb-2">${report.address}</p>
            <div class="flex items-center justify-between text-xs text-gray-600">
              <span>📍 ${report.position_on_road}</span>
              <span class="font-semibold">${report.report_count}x bejelentve</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              ${new Date(report.created_at).toLocaleDateString('hu-HU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })

      markersRef.current.push(marker)
    })
  }

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
    <div className="relative flex-1">
      {/* Betöltés jelző */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 z-10 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-700 font-semibold">Térkép betöltése...</p>
          </div>
        </div>
      )}

      {/* Jelmagyarázat */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10 text-sm">
        <h4 className="font-bold mb-2 text-gray-800">Jelmagyarázat</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pothole-safe"></div>
            <span className="text-xs">1-5 bejelentés</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pothole-warning"></div>
            <span className="text-xs">6-10 bejelentés</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pothole-danger"></div>
            <span className="text-xs">10+ bejelentés</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
          Kattints a térképre új bejelentéshez!
        </p>
      </div>

      {/* Térkép konténer */}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}

export default Map

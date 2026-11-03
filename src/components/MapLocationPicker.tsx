import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  ExternalLink, 
  LocateFixed, 
  Layers, 
  Check, 
  Compass,
  AlertCircle
} from 'lucide-react';
import { ALL_PAKISTAN_CITIES } from '../data/pakistanRegions';

interface MapLocationPickerProps {
  lat: number;
  lng: number;
  cityName?: string;
  onLocationChange: (lat: number, lng: number) => void;
  shopName?: string;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  lat,
  lng,
  cityName = 'Peshawar',
  onLocationChange,
  shopName = 'Your Shop Location',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // High-visibility custom SVG marker icon
  const createCustomPinIcon = () => {
    return L.divIcon({
      className: 'custom-shop-pin',
      html: `
        <div style="position: relative; width: 36px; height: 42px; transform: translate(-50%, -100%); cursor: grab;">
          <svg viewBox="0 0 36 42" width="36" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.35"/>
            </filter>
            <path d="M18 0C8.05887 0 0 8.05887 0 18C0 27.5 14.5 39.5 17.15 41.6C17.65 42 18.35 42 18.85 41.6C21.5 39.5 36 27.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="#DC2626" filter="url(#shadow)"/>
            <circle cx="18" cy="18" r="7.5" fill="#FFFFFF"/>
            <circle cx="18" cy="18" r="4.5" fill="#059669"/>
          </svg>
          <div style="position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); width: 8px; height: 3px; background: rgba(0,0,0,0.3); border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [36, 42],
      iconAnchor: [18, 42],
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = Number.isFinite(lat) && lat !== 0 ? lat : 34.0151;
    const initialLng = Number.isFinite(lng) && lng !== 0 ? lng : 71.5249;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: true,
      attributionControl: true,
      maxZoom: 19,
      minZoom: 5,
    });

    // Add crisp OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add draggable marker
    const marker = L.marker([initialLat, initialLng], {
      icon: createCustomPinIcon(),
      draggable: true,
    }).addTo(map);

    marker.bindPopup(`<strong>${shopName}</strong><br/>Drag or click anywhere to adjust location`).openPopup();

    // On marker drag end
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onLocationChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
    });

    // On map click
    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      marker.openPopup();
      onLocationChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Invalidate size after modal animation
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Sync external lat/lng changes with marker and map
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return;

    const currentPos = markerRef.current.getLatLng();
    const isDifferent = Math.abs(currentPos.lat - lat) > 0.0001 || Math.abs(currentPos.lng - lng) > 0.0001;

    if (isDifferent) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.panTo([lat, lng], { animate: true });
    }
  }, [lat, lng]);

  // Center on City center if user changes city
  const handleCenterOnCity = () => {
    if (!cityName || !mapInstanceRef.current || !markerRef.current) return;
    const matchedCity = ALL_PAKISTAN_CITIES.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase()
    );

    if (matchedCity) {
      mapInstanceRef.current.flyTo([matchedCity.lat, matchedCity.lng], 14, { duration: 1.2 });
      markerRef.current.setLatLng([matchedCity.lat, matchedCity.lng]);
      onLocationChange(Number(matchedCity.lat.toFixed(6)), Number(matchedCity.lng.toFixed(6)));
    }
  };

  // One-click GPS Location
  const handleDetectGPS = () => {
    setGpsError(null);
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const userLat = Number(pos.coords.latitude.toFixed(6));
        const userLng = Number(pos.coords.longitude.toFixed(6));

        onLocationChange(userLat, userLng);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([userLat, userLng], 17, { duration: 1.5 });
          markerRef.current.setLatLng([userLat, userLng]);
          markerRef.current.bindPopup(`<strong>Your Current Location</strong><br/>Accurate within ${Math.round(pos.coords.accuracy || 10)}m`).openPopup();
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('GPS location error:', err);
        setGpsError('Could not fetch GPS. Please tap or drag the pin on the map to choose your shop location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(googleMapsUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-2.5 font-['Poppins']">
      {/* Top Map Action Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <MapPin className="w-4 h-4 text-rose-600 animate-bounce" />
          <span>Interactive Location Picker (میپ پر پن لگائیں)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Center City Button */}
          <button
            type="button"
            onClick={handleCenterOnCity}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            title={`Center on ${cityName}`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Center {cityName}</span>
          </button>

          {/* GPS Auto-Detect Button */}
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isLocating}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting GPS...' : '📍 Pin My Exact Location'}</span>
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Map Canvas Container */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-inner bg-slate-100 z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Subtle Map helper overlay on bottom right */}
        <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-medium z-[1000] pointer-events-none flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Click anywhere or drag red pin to set location</span>
        </div>
      </div>

      {/* Selected Coordinates & Generated Google Maps Link */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Selected Coordinates:
          </span>
          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </span>
        </div>

        {/* Live Google Maps Link */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <input
            type="text"
            readOnly
            value={googleMapsUrl}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-600 outline-none select-all"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] shrink-0 cursor-pointer transition-colors"
          >
            {copiedLink ? 'Copied!' : 'Copy'}
          </button>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-[10px] shrink-0 flex items-center gap-1 transition-colors"
          >
            <span>Open in Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  LocateFixed, 
  MapPin, 
  Heart, 
  ChevronRight, 
  Droplet,
  Search,
  ExternalLink,
  Navigation,
  Phone,
  Store
} from 'lucide-react';
import { Shop } from '../types';

interface InteractiveMapProps {
  shops: Shop[];
  selectedShop: Shop | null;
  onSelectShop: (shop: Shop) => void;
  onOpenDetails: (shop: Shop) => void;
  radiusKm: number | null;
  activeCity: string;
  isPinPickerMode?: boolean;
  onPickPin?: (coords: { lat: number; lng: number; mapX: number; mapY: number }) => void;
  pickedPin?: { mapX: number; mapY: number } | null;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  shops,
  selectedShop,
  onSelectShop,
  onOpenDetails,
  activeCity,
  favorites,
  onToggleFavorite,
}) => {
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [currentLocSearch, setCurrentLocSearch] = useState('');

  // Build high-precision Google Maps search query
  const googleMapQuery = useMemo(() => {
    if (currentLocSearch) return currentLocSearch;
    if (mapSearchQuery.trim()) return `${mapSearchQuery}, ${activeCity}, Pakistan`;
    if (selectedShop) {
      if (selectedShop.coords && selectedShop.coords.lat && selectedShop.coords.lng) {
        return `${selectedShop.coords.lat},${selectedShop.coords.lng}`;
      }
      return `${selectedShop.name}, ${selectedShop.address || selectedShop.area}, ${selectedShop.city}, Pakistan`;
    }
    return `${activeCity}, Pakistan`;
  }, [currentLocSearch, mapSearchQuery, selectedShop, activeCity]);

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLocSearch(`${lat},${lng}`);
        },
        () => {
          setCurrentLocSearch(`${activeCity}, Pakistan`);
        }
      );
    } else {
      setCurrentLocSearch(`${activeCity}, Pakistan`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearchQuery.trim()) return;
    setCurrentLocSearch(`${mapSearchQuery}, ${activeCity}, Pakistan`);
  };

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] md:h-[360px] lg:h-[380px] bg-slate-100 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm flex flex-col select-none">
      {/* Top Map Toolbar: Search & Location info */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 flex-wrap">
        {/* Google Maps Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 min-w-[200px] max-w-md flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/90 px-3 py-1.5 text-xs"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder={`Search ${activeCity} addresses, shops...`}
            value={mapSearchQuery}
            onChange={(e) => setMapSearchQuery(e.target.value)}
            className="w-full bg-transparent px-2.5 py-0.5 outline-none text-slate-800 placeholder:text-slate-400 text-xs font-medium"
          />
          <button
            type="submit"
            className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Locate Me Button */}
        <button
          onClick={handleLocateMe}
          className="px-3 py-1.5 bg-white/95 backdrop-blur-md hover:bg-emerald-50 text-emerald-800 rounded-2xl shadow-md border border-slate-200/90 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          title="Detect Current GPS Location"
        >
          <LocateFixed className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">My Location</span>
        </button>
      </div>

      {/* Main Viewport: Official Interactive Google Maps Embed */}
      <div className="relative w-full h-full flex-1 min-h-0">
        <iframe
          title="Google Maps Location View"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(googleMapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
        />

        {/* Floating Google Maps Directions button */}
        {selectedShop && (
          <div className="absolute right-3 top-16 z-20">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                `${selectedShop.name}, ${selectedShop.address || selectedShop.area}, ${selectedShop.city}, Pakistan`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-slate-900/95 hover:bg-slate-900 text-white rounded-2xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold backdrop-blur-xs"
              title="Get Google Maps Turn-by-Turn Directions"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        )}
      </div>

      {/* Selected Shop Preview Pill Card at Bottom of Map */}
      {selectedShop && (
        <div className="absolute bottom-3 left-3 right-3 z-30">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl border border-slate-200/90 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200">
            <div 
              onClick={() => onOpenDetails(selectedShop)}
              className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
            >
              <img
                src={selectedShop.imageUrl || selectedShop.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200'}
                alt={selectedShop.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm font-['Outfit'] truncate">
                    {selectedShop.name}
                  </h4>
                  {selectedShop.hasEleganciaWater && (
                    <span className="shrink-0 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                      <Droplet className="w-2.5 h-2.5 fill-white" />
                      <span>Elegancia</span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{selectedShop.area}, {selectedShop.city}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={(e) => onToggleFavorite(selectedShop.id, e)}
                className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                  favorites.includes(selectedShop.id)
                    ? 'text-rose-500 bg-rose-50 border-rose-200'
                    : 'text-slate-400 hover:text-slate-600 bg-slate-50 border-slate-200'
                }`}
                title="Bookmark store"
              >
                <Heart className={`w-4 h-4 ${favorites.includes(selectedShop.id) ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => onOpenDetails(selectedShop)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

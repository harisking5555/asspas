import React from 'react';
import { Search, MapPin, Navigation, Droplet } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCity: string;
  onOpenCityModal: () => void;
  onDetectLocation: () => void;
  isLocating: boolean;
  onSelectQuickTag: (tag: string) => void;
  onOpenEleganciaView: () => void;
  totalStoresCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  activeCity,
  onOpenCityModal,
  onDetectLocation,
  isLocating,
  onSelectQuickTag,
  onOpenEleganciaView,
  totalStoresCount,
}) => {
  return (
    <div className="relative bg-slate-950 text-white py-8 sm:py-10 border-b border-emerald-800/40 w-full overflow-hidden">
      {/* Background Street Image (Clearly visible with soft ambient tint) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src="/src/assets/images/shopnear_hero_street_1793110435367.jpg"
          alt="Local Neighborhood Street"
          className="w-full h-full object-cover scale-105 opacity-45"
        />
        {/* Soft gradient overlay for text readability without washing out the photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-emerald-950/75 to-slate-950/85" />
      </div>

      <div className="relative max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Left Column: Headlines & Integrated Search Bar */}
        <div className="w-full lg:max-w-2xl text-left z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Discover Verified Local Stores in Pakistan</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            Find Nearby Shops <br />
            <span className="text-emerald-300 font-extrabold">Shop Local, Support Local!</span>
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-200/90 max-w-xl leading-relaxed">
            Discover verified neighborhood shops, supermarkets, pharmacies, sports gear, and official Elegancia mineral water stockists near you.
          </p>

          {/* Search Box Container */}
          <div className="mt-5 bg-white p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 text-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* City Selector Button (Clean icon & city name without redundant labels) */}
            <button
              type="button"
              onClick={onOpenCityModal}
              className="flex items-center gap-2 px-3 py-2 sm:py-1.5 bg-slate-50 hover:bg-emerald-50 rounded-lg sm:rounded-xl border border-slate-200 text-left shrink-0 transition-colors cursor-pointer"
              title="Change City"
            >
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2} />
              <span className="text-xs font-bold text-slate-800">
                {activeCity}
              </span>
            </button>

            {/* Keyword Search Input */}
            <div className="flex-1 flex items-center gap-2 px-2.5 py-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
              <input
                id="search-input-box"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search shops, products, or Elegancia Water..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear Search Input"
                  className="text-xs text-slate-400 hover:text-slate-600 shrink-0 px-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* GPS Locate Button */}
            <button
              type="button"
              onClick={onDetectLocation}
              title="Detect Current GPS Location"
              className="hidden sm:flex items-center justify-center p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            </button>

            {/* Search Submit Button */}
            <button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Search</span>
            </button>
          </div>

          {/* Quick tags */}
          <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px] text-slate-300">
            <span className="font-semibold text-emerald-300">Popular:</span>
            <button
              onClick={onOpenEleganciaView}
              className="inline-flex items-center gap-1 bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer"
            >
              <Droplet className="w-3 h-3 fill-emerald-400 text-emerald-400" />
              Elegancia Mineral Water
            </button>
            <button
              onClick={() => onSelectQuickTag('Kamran Sports')}
              className="hover:text-white underline decoration-slate-400/50 transition-colors cursor-pointer"
            >
              Kamran Sports
            </button>
            <button
              onClick={() => onSelectQuickTag('Imtiaz Super Market')}
              className="hover:text-white underline decoration-slate-400/50 transition-colors cursor-pointer"
            >
              Imtiaz Super Market
            </button>
            <button
              onClick={() => onSelectQuickTag('Outfitters')}
              className="hover:text-white underline decoration-slate-400/50 transition-colors cursor-pointer"
            >
              Outfitters
            </button>
            <button
              onClick={() => onSelectQuickTag('Pharmacy')}
              className="hover:text-white underline decoration-slate-400/50 transition-colors cursor-pointer"
            >
              Pharmacy 24/7
            </button>
          </div>
        </div>

        {/* Right Column: Visual Card - Clickable Quick Market Radar Filter */}
        <div className="hidden lg:block w-full lg:w-[380px] shrink-0">
          <button
            type="button"
            onClick={onOpenCityModal}
            className="w-full text-left relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-900 shadow-xl group cursor-pointer block transition-transform hover:scale-[1.02]"
            title={`Browse ${activeCity} regional businesses & markets`}
          >
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/30 text-[10px] text-emerald-300 font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>City Hub & Market Selector</span>
            </div>
            <img
              src="/src/assets/images/shopnear_hero_street_1793110435367.jpg"
              alt={`${activeCity} Market`}
              className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent flex flex-col justify-end p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-300 tracking-wider uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{activeCity} Regional Market Hub</span>
                  </span>
                  <div className="text-white font-bold text-sm mt-0.5">
                    {totalStoresCount} Verified Stores Active
                  </div>
                  <div className="text-[10px] text-slate-300 mt-0.5">
                    Click to switch city or filter by local bazar
                  </div>
                </div>
                <div className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs shrink-0 flex items-center gap-1">
                  <span>Switch City</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

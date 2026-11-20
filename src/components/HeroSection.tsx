import React, { useState } from 'react';
import { Search, MapPin, Navigation, Droplets, Store, X } from 'lucide-react';
import { resolveExternalImageUrl } from '../data/defaultImages';

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
  heroImageUrl?: string;
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
  heroImageUrl,
}) => {
  const resolvedHeroImg = resolveExternalImageUrl(heroImageUrl, 'market');
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section className="relative bg-slate-950 text-white py-10 sm:py-14 border-b border-emerald-900/40 w-full overflow-hidden">
      {/* Background Street Photography with Measured Scrim */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {!imgFailed ? (
          <img
            src={resolvedHeroImg}
            alt="Local Neighborhood Market"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover scale-105 opacity-35"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-emerald-950/80 to-slate-950/85" />
      </div>

      <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* Left Column: Clean Editorial Headline & Integrated Search Bar */}
        <div className="w-full lg:max-w-2xl text-left z-10">
          <p className="text-xs font-semibold text-emerald-300 tracking-wide mb-2.5">
            Pakistan Hyperlocal Store Directory · {activeCity === 'All Cities' ? 'Nationwide' : activeCity}
          </p>

          <h1 className="font-display text-2xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight text-white leading-[1.15] text-balance">
            Find Nearby Shops,{' '}
            <span className="text-emerald-300">Support Local Bazaars</span>
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Discover verified neighborhood stores, pharmacies, sports outlets, and official Elegancia Mineral Water stockists across Pakistan.
          </p>

          {/* Search Box Container */}
          <div className="mt-6 bg-white p-1.5 sm:p-2 rounded-2xl shadow-xl border border-slate-200/80 text-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={onOpenCityModal}
              className="flex items-center gap-2 px-3.5 py-2.5 sm:py-2 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 text-left shrink-0 transition-colors cursor-pointer"
              title="Change City"
            >
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
              <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
                {activeCity}
              </span>
            </button>

            <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5 min-w-0">
              <Search className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
              <input
                id="search-input-box"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search shops, products, markets, or Elegancia Water..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear Search Input"
                  className="text-slate-400 hover:text-slate-700 shrink-0 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onDetectLocation}
              title="Detect Current GPS Location"
              className="hidden sm:flex items-center justify-center p-2.5 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('shops-list-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shrink-0 shadow-xs cursor-pointer"
            >
              <Search className="w-4 h-4" strokeWidth={1.75} />
              <span>Search</span>
            </button>
          </div>

          {/* Clean Quick Shortcuts */}
          <div className="mt-4 flex items-center gap-3 flex-wrap text-xs text-slate-300">
            <span className="text-slate-400 font-medium">Quick find:</span>
            <button
              type="button"
              onClick={onOpenEleganciaView}
              className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 font-semibold transition-colors cursor-pointer"
            >
              <Droplets className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Elegancia Water</span>
            </button>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onSelectQuickTag('Kamran Sports')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Kamran Sports
            </button>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onSelectQuickTag('Imtiaz Super Market')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Imtiaz Super Market
            </button>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onSelectQuickTag('Pharmacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Pharmacy 24/7
            </button>
          </div>
        </div>

        {/* Right Column: Regional Market Selector Card */}
        <div className="hidden lg:block w-full lg:w-[370px] shrink-0">
          <button
            type="button"
            onClick={onOpenCityModal}
            className="w-full text-left relative rounded-2xl overflow-hidden border border-white/15 bg-slate-900 shadow-2xl group cursor-pointer block transition-transform duration-200 hover:-translate-y-0.5"
            title={`Click to Change City & Market (${activeCity})`}
          >
            <div className="h-52 w-full bg-slate-900 overflow-hidden">
              {!imgFailed ? (
                <img
                  src={resolvedHeroImg}
                  alt={`${activeCity} Regional Market`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-slate-900 flex items-center justify-center">
                  <Store className="w-12 h-12 text-emerald-400/40" strokeWidth={1.5} />
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" strokeWidth={1.75} />
                    <span>{activeCity} Regional Market</span>
                  </span>
                  <div className="text-white font-bold text-base mt-1 tabular-nums">
                    {totalStoresCount} Verified Stores
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Click to switch city or bazaar
                  </div>
                </div>
                <div className="bg-emerald-600 group-hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm shrink-0 whitespace-nowrap transition-colors">
                  Change City
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

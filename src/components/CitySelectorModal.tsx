import React, { useState } from 'react';
import { X, MapPin, Search, Check, Navigation, Building2 } from 'lucide-react';
import { PAKISTAN_REGIONS, ALL_PAKISTAN_CITIES, CityInfo } from '../data/pakistanRegions';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (city: CityInfo) => void;
  onDetectLocation: () => void;
  isLocating: boolean;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
  onDetectLocation,
  isLocating,
}) => {
  const [search, setSearch] = useState('');
  const [activeProvinceTab, setActiveProvinceTab] = useState<string>('All');

  if (!isOpen) return null;

  const popularQuickCities = ['Peshawar', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Abbottabad', 'Mardan', 'Quetta'];

  const filteredCities = ALL_PAKISTAN_CITIES.filter((city) => {
    const matchesSearch =
      city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.province.toLowerCase().includes(search.toLowerCase()) ||
      city.popularAreas.some((a) => a.toLowerCase().includes(search.toLowerCase()));

    const matchesProvince =
      activeProvinceTab === 'All' || city.province.includes(activeProvinceTab);

    return matchesSearch && matchesProvince;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-white">
                Select City & Region in Pakistan
              </h3>
              <p className="text-[11px] text-slate-300">
                Browse local shops across all provinces & territories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Location Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search city, province, or area (e.g. Peshawar, Saddar, Hayatabad)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => {
                onDetectLocation();
                onClose();
              }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shrink-0 transition-colors shadow-xs cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Detect Near Me</span>
            </button>
          </div>

          {/* Quick Popular Cities */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] font-semibold text-slate-400">Quick:</span>
            {popularQuickCities.map((cName) => {
              const cObj = ALL_PAKISTAN_CITIES.find((c) => c.name === cName);
              const isSelected = selectedCity.toLowerCase() === cName.toLowerCase();
              return (
                <button
                  key={cName}
                  onClick={() => {
                    if (cObj) onSelectCity(cObj);
                    onClose();
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-700'
                  }`}
                >
                  {cName}
                </button>
              );
            })}
          </div>

          {/* Province Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <button
              onClick={() => setActiveProvinceTab('All')}
              className={`text-[11px] px-2.5 py-1 rounded-md shrink-0 transition-colors font-semibold cursor-pointer ${
                activeProvinceTab === 'All'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Pakistan ({ALL_PAKISTAN_CITIES.length})
            </button>
            {PAKISTAN_REGIONS.map((reg) => (
              <button
                key={reg.code}
                onClick={() => setActiveProvinceTab(reg.name)}
                className={`text-[11px] px-2.5 py-1 rounded-md shrink-0 transition-colors font-semibold cursor-pointer ${
                  activeProvinceTab === reg.name
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-200'
                }`}
              >
                {reg.name.split('(')[0].trim()} ({reg.cities.length})
              </button>
            ))}
          </div>
        </div>

        {/* Cities Grid List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredCities.map((city) => {
              const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={`${city.name}-${city.province}`}
                  onClick={() => {
                    onSelectCity(city);
                    onClose();
                  }}
                  className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-slate-900 text-xs sm:text-sm">
                        {city.name}
                      </span>
                      {isSelected && (
                        <span className="p-0.5 bg-emerald-600 text-white rounded-full">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-emerald-800 font-semibold block mt-0.5">
                      {city.province}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                      {city.popularAreas.slice(0, 3).join(', ')}
                    </p>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-400 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-medium">
            Active: <strong className="text-slate-900">{selectedCity}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

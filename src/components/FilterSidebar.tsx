import React from 'react';
import { Filter, RotateCcw, Droplet } from 'lucide-react';
import { ShopCategory, ShopType } from '../types';

interface FilterSidebarProps {
  category: ShopCategory | string;
  onCategoryChange: (c: ShopCategory) => void;
  shopType: ShopType;
  onShopTypeChange: (t: ShopType) => void;
  minRating: number;
  onMinRatingChange: (r: number) => void;
  distanceKm: number | null;
  onDistanceKmChange: (d: number | null) => void;
  onlyElegancia: boolean;
  onToggleOnlyElegancia: (val: boolean) => void;
  onResetFilters: () => void;
  totalMatches: number;
  selectedArea?: string;
  onAreaChange?: (area: string) => void;
  availableAreas?: string[];
  availableCategories?: string[];
  selectedProvince?: string;
  onProvinceChange?: (province: string) => void;
  provinces?: string[];
  activeCity?: string;
  onCityChange?: (city: string) => void;
  cities?: string[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  category,
  onCategoryChange,
  shopType,
  onShopTypeChange,
  minRating,
  onMinRatingChange,
  distanceKm,
  onDistanceKmChange,
  onlyElegancia,
  onToggleOnlyElegancia,
  onResetFilters,
  totalMatches,
  selectedArea,
  onAreaChange,
  availableAreas = [],
  availableCategories,
  selectedProvince,
  onProvinceChange,
  provinces = [],
  activeCity,
  onCityChange,
  cities = [],
}) => {
  const defaultCategories: string[] = [
    'All Categories',
    'Agriculture, Seeds & Livestock',
    'Arts, Gifts & Handicrafts',
    'Automotive & Repairs',
    'Bakery, Sweets & Confectionery',
    'Beauty & Personal Care',
    'Books & Stationery',
    'Building Materials & Hardware',
    'Computers, IT & Software',
    'Education, Academies & Tuition',
    'Electronics & Mobiles',
    'Fashion & Clothing',
    'Food & Restaurants',
    'Furniture & Interiors',
    'Grocery & Daily Needs',
    'Home & Living',
    'Home Maintenance & Repair',
    'Hospitals, Clinics & Labs',
    'Jewelry, Gold & Watches',
    'Mineral Water & Beverages',
    'Pharmacy & Health',
    'Professional Services',
    'Solar Energy & UPS Systems',
    'Sports & Toys',
    'Tailoring & Boutiques',
    'Wholesale, Distributors & Mandi',
  ];

  const categoryOptions = availableCategories && availableCategories.length > 0
    ? ['All Categories', ...availableCategories.filter((c) => c !== 'All Categories').sort((a, b) => a.localeCompare(b))]
    : defaultCategories;

  const shopTypes: ShopType[] = [
    'All Shops',
    'Dealer / Distributor',
    'Producer / Manufacturer',
    'Restaurant / Cafe',
    'Retail Store',
    'Service Provider',
    'Wholesale',
  ];

  const ratingOptions = [
    { label: 'Any Rating', val: 0 },
    { label: '4.0 & above', val: 4.0 },
    { label: '3.0 & above', val: 3.0 },
    { label: '2.0 & above', val: 2.0 },
  ];

  const distanceOptions: { label: string; val: number | null }[] = [
    { label: 'Any Distance', val: null },
    { label: 'Within 500 m', val: 0.5 },
    { label: 'Within 1 km', val: 1 },
    { label: 'Within 3 km', val: 3 },
    { label: 'Within 5 km', val: 5 },
    { label: 'Within 10 km', val: 10 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filter Shops</span>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
            {totalMatches}
          </span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Elegancia Water Special Filter */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyElegancia}
            onChange={(e) => onToggleOnlyElegancia(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
          />
          <div>
            <div className="text-xs font-bold text-emerald-950 flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>Elegancia Water Stockists</span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
              Show only shops carrying authentic Elegancia Mineral Water in stock.
            </p>
          </div>
        </label>
      </div>

      {/* Province Selector */}
      {provinces.length > 0 && onProvinceChange && (
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Province (صوبہ)
          </label>
          <select
            value={selectedProvince || 'All Provinces'}
            onChange={(e) => onProvinceChange(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 font-medium outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="All Provinces">All Provinces</option>
            {provinces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      )}

      {/* City Selector */}
      {cities.length > 0 && onCityChange && (
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            City (شہر)
          </label>
          <select
            value={activeCity || 'All Cities'}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 font-medium outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="All Cities">All Cities in Pakistan</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Area / Market / Bazaar Filter */}
      {availableAreas && availableAreas.length > 0 && onAreaChange && (
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Area / Market / Bazaar
          </label>
          <select
            value={selectedArea || 'All Areas'}
            onChange={(e) => onAreaChange(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 font-medium outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer"
          >
            {availableAreas.map((a) => (
              <option key={a} value={a}>
                {a === 'All Areas' ? 'All Areas & Bazaars' : a}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Category Dropdown */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1.5">
          Category (A–Z)
        </label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as ShopCategory)}
          className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 font-medium outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer"
        >
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Shop Type Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2">
          Business Nature
        </label>
        <div className="space-y-2">
          {shopTypes.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer hover:text-slate-900 transition-colors"
            >
              <input
                type="radio"
                name="shopType"
                checked={shopType === type}
                onChange={() => onShopTypeChange(type)}
                className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
              <span className={shopType === type ? 'font-semibold text-slate-900' : ''}>
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2">
          Rating
        </label>
        <div className="space-y-2">
          {ratingOptions.map((opt) => (
            <label
              key={opt.val}
              className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer hover:text-slate-900 transition-colors"
            >
              <input
                type="radio"
                name="rating"
                checked={minRating === opt.val}
                onChange={() => onMinRatingChange(opt.val)}
                className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
              <span className={minRating === opt.val ? 'font-semibold text-slate-900' : ''}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Radius / Distance Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2">
          Radius Distance
        </label>
        <div className="space-y-2">
          {distanceOptions.map((opt, idx) => (
            <label
              key={idx}
              className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer hover:text-slate-900 transition-colors"
            >
              <input
                type="radio"
                name="distance"
                checked={distanceKm === opt.val}
                onChange={() => onDistanceKmChange(opt.val)}
                className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
              <span className={distanceKm === opt.val ? 'font-semibold text-slate-900' : ''}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={() => {
          const el = document.getElementById('shops-list-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
      >
        Apply Filters ({totalMatches} Results)
      </button>
    </div>
  );
};

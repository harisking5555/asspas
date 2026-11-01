import React, { useState } from 'react';
import { 
  MapPin, 
  Droplet, 
  MessageCircle, 
  Grid, 
  List, 
  Search
} from 'lucide-react';
import { Shop } from '../types';

interface AllShopsDirectoryViewProps {
  shops: Shop[];
  onSelectShop: (shop: Shop) => void;
  onOpenDetails: (shop: Shop) => void;
  activeCity: string;
  onOpenCityModal: () => void;
  onOpenAddShop: () => void;
}

export const AllShopsDirectoryView: React.FC<AllShopsDirectoryViewProps> = ({
  shops,
  onSelectShop,
  onOpenDetails,
  activeCity,
  onOpenCityModal,
  onOpenAddShop,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [onlyElegancia, setOnlyElegancia] = useState(false);
  const [onlyOpen, setOnlyOpen] = useState(false);

  const categories = [
    'All',
    'Grocery & Daily Needs',
    'Fashion & Clothing',
    'Electronics & Mobiles',
    'Home & Living',
    'Pharmacy & Health',
    'Books & Stationery',
    'Beauty & Personal Care',
    'Sports & Toys',
    'Food & Restaurants',
  ];

  const filtered = shops.filter((s) => {
    if (selectedCat !== 'All' && s.category !== selectedCat) return false;
    if (onlyElegancia && !s.hasEleganciaWater) return false;
    if (onlyOpen && !s.isOpen) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchArea = s.area.toLowerCase().includes(q);
      const matchTags = s.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchArea && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              All Verified Shops Directory
            </h2>
            <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {filtered.length} Stores Available
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse registered businesses across {activeCity} and surrounding commercial markets on asspas.store.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCityModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>City: {activeCity}</span>
          </button>
          <button
            onClick={onOpenAddShop}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <span>+ List Your Shop</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by store name, area, product (e.g. Kamran Sports, Elegancia)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          />
        </div>

        {/* Category Dropdown */}
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 font-semibold outline-none cursor-pointer"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setOnlyElegancia(!onlyElegancia)}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
              onlyElegancia
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
            }`}
          >
            <Droplet className="w-3.5 h-3.5 fill-current" />
            <span>Elegancia Water Only</span>
          </button>

          <button
            onClick={() => setOnlyOpen(!onlyOpen)}
            className={`px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
              onlyOpen
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Open Now
          </button>

          {/* Grid / Table toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-500'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-500'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((shop) => (
            <div
              key={shop.id}
              onClick={() => onOpenDetails(shop)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {shop.category}
                    </span>
                    {shop.isOpen && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        Open Now
                      </span>
                    )}
                  </div>
                  {shop.hasEleganciaWater && (
                    <div className="absolute bottom-2.5 left-2.5 bg-emerald-600/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
                      <Droplet className="w-3 h-3 fill-white" />
                      <span>Elegancia Water</span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-display font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                      {shop.name}
                    </h3>
                    <span className="text-amber-500 font-bold text-xs flex items-center gap-0.5 shrink-0">
                      ★ {shop.rating}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{shop.address}</span>
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {shop.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                <span className="text-[11px] font-semibold text-emerald-800">
                  {shop.distance} km from you
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const text = encodeURIComponent(`Hello ${shop.name}! I saw your shop on asspas.store.`);
                    window.open(`https://wa.me/${shop.whatsapp || '923085599766'}?text=${text}`, '_blank');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="p-3.5">Store</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Elegancia Water</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((shop) => (
                  <tr
                    key={shop.id}
                    onClick={() => onOpenDetails(shop)}
                    className="hover:bg-emerald-50/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                      <img
                        src={shop.image}
                        alt={shop.name}
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                      <div>
                        <div>{shop.name}</div>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {shop.shopType}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium">{shop.category}</td>
                    <td className="p-3.5 text-slate-500">
                      {shop.area}, {shop.city} ({shop.distance} km)
                    </td>
                    <td className="p-3.5 font-bold text-amber-500">
                      ★ {shop.rating} ({shop.reviewsCount})
                    </td>
                    <td className="p-3.5">
                      {shop.hasEleganciaWater ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Droplet className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                          Stockist
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const text = encodeURIComponent(`Hello ${shop.name}! I saw your shop on asspas.store.`);
                          window.open(`https://wa.me/${shop.whatsapp || '923085599766'}?text=${text}`, '_blank');
                        }}
                        className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold cursor-pointer"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

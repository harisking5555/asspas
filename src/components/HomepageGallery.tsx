import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Store, 
  Package, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ExternalLink,
  Droplet,
  Heart,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';
import { PlatformAd, Shop } from '../types';

interface HomepageGalleryProps {
  ads: PlatformAd[];
  shops: Shop[];
  activeCity: string;
  activeProvince?: string;
  onSelectShop: (shopId: string) => void;
  onOpenChat: (phone: string, title: string) => void;
}

export const HomepageGallery: React.FC<HomepageGalleryProps> = ({
  ads,
  shops,
  activeCity,
  activeProvince,
  onSelectShop,
  onOpenChat,
}) => {
  const [adIndex, setAdIndex] = useState(0);

  // Filter ads by location
  const matchingAds = ads.filter((ad) => {
    if (!ad.isActive) return false;
    const matchesCity = !ad.targetCity || ad.targetCity.toLowerCase() === 'all' || ad.targetCity.toLowerCase() === activeCity.toLowerCase();
    const matchesProv = !ad.targetProvince || ad.targetProvince.toLowerCase() === 'all' || ad.targetProvince.toLowerCase() === (activeProvince || '').toLowerCase();
    return matchesCity && matchesProv;
  });

  const featuredAd = matchingAds.length > 0 ? matchingAds[adIndex % matchingAds.length] : null;

  // Top shops (highest rating & verified)
  const topShops = [...shops]
    .filter((s) => s.city.toLowerCase() === activeCity.toLowerCase() || !activeCity)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  // Top products (from shops catalogs)
  const topProducts: { shop: Shop; item: any }[] = [];
  shops.forEach((s) => {
    if (s.catalog && s.catalog.length > 0) {
      s.catalog.slice(0, 2).forEach((item) => {
        topProducts.push({ shop: s, item });
      });
    }
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 space-y-8 font-['Poppins']">
      {/* SECTION 1: TOP PRODUCTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Package className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Top Products in {activeCity}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Community Picks
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Popular items, fresh arrivals & official Elegancia Mineral Water</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Always highlight Elegancia Mineral Water first */}
          <div className="bg-gradient-to-b from-cyan-900 to-teal-950 text-white rounded-2xl p-3 flex flex-col justify-between shadow-xs border border-cyan-800/40 relative group overflow-hidden">
            <div>
              <div className="h-24 sm:h-28 rounded-xl bg-cyan-950/60 overflow-hidden mb-2 relative">
                <img
                  src="/src/assets/images/product_elegancia_water_1793110437317.jpg"
                  alt="Elegancia Mineral Water"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-1.5 left-1.5 bg-cyan-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded">
                  Elegancia
                </span>
              </div>
              <h4 className="font-bold text-xs text-white line-clamp-1">Elegancia 19L & Bottled</h4>
              <p className="text-[10px] text-cyan-200 mt-0.5">Certified pure hydration</p>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-cyan-800/60 mt-2">
              <span className="font-black text-xs text-cyan-300">Rs. 220+</span>
              <button
                type="button"
                onClick={() => onOpenChat('923085599766', 'Elegancia Mineral Water')}
                className="px-2 py-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg text-[10px] font-black cursor-pointer shadow-xs"
              >
                Order
              </button>
            </div>
          </div>

          {topProducts.slice(0, 5).map(({ shop, item }) => (
            <div
              key={`${shop.id}-${item.id}`}
              className="bg-white rounded-2xl p-3 flex flex-col justify-between shadow-xs border border-slate-200 hover:border-emerald-300 transition-all group"
            >
              <div>
                <div className="h-24 sm:h-28 rounded-xl bg-slate-100 overflow-hidden mb-2 relative">
                  <img
                    src={item.image || shop.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.2 rounded backdrop-blur-xs">
                    {shop.name}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.name}</h4>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">📍 {shop.area || shop.city}</p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
                <span className="font-black text-xs text-emerald-700">Rs. {item.price}</span>
                <button
                  type="button"
                  onClick={() => onSelectShop(shop.id)}
                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold cursor-pointer"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: TOP SHOPS SPOTLIGHT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Store className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Top Rated Verified Stores</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 4.5+ Stars
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Most recommended businesses by local patrons</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {topShops.map((shop) => (
            <div
              key={shop.id}
              onClick={() => onSelectShop(shop.id)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-36 bg-slate-100">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {shop.category}
                </span>
                <div className="absolute top-2 right-2 bg-white text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{shop.rating}</span>
                </div>
              </div>

              <div className="p-3.5 space-y-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 truncate">{shop.name}</h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{shop.address}, {shop.city}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                  <span className="text-emerald-700 font-semibold">{shop.followersCount || 0} Followers</span>
                  <span className="text-slate-700 font-bold hover:underline">View Store →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: FEATURED ADVERTISEMENTS SHOWCASE */}
      {featuredAd && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Featured Advertisements & Verified Brand Spotlights
            </span>
            {matchingAds.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAdIndex((prev) => (prev - 1 + matchingAds.length) % matchingAds.length)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setAdIndex((prev) => (prev + 1) % matchingAds.length)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-emerald-900/30 shadow-lg text-white">
            <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden">
              {featuredAd.mediaType === 'video' ? (
                <video
                  src={featuredAd.mediaUrl}
                  poster="/src/assets/images/product_elegancia_water_1793110437317.jpg"
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={featuredAd.mediaUrl}
                  alt={featuredAd.title}
                  className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-102"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2">
                <span className="bg-emerald-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Featured Partner</span>
                </span>
                {featuredAd.targetCity && (
                  <span className="bg-slate-900/80 backdrop-blur-xs border border-white/20 text-emerald-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{featuredAd.targetCity}</span>
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-6 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                <div className="space-y-1 max-w-xl">
                  <h2 className="font-black text-lg sm:text-2xl text-white tracking-tight drop-shadow-md">
                    {featuredAd.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200/90 line-clamp-2 drop-shadow-sm">
                    {featuredAd.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenChat(featuredAd.whatsappNumber || '923085599766', featuredAd.title)}
                    className="py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact via WhatsApp</span>
                  </button>

                  {featuredAd.linkedShopId && (
                    <button
                      type="button"
                      onClick={() => onSelectShop(featuredAd.linkedShopId!)}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Store className="w-4 h-4" />
                      <span>Visit Shop</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

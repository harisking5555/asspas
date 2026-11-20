import React, { useState } from 'react';
import {
  MapPin,
  Store,
  Package,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Droplets,
  ArrowUpRight,
} from 'lucide-react';
import { PlatformAd, Shop, FeaturedBrandProduct } from '../types';
import { DEFAULT_ELEGANCIA_WATER_IMAGE, resolveExternalImageUrl } from '../data/defaultImages';

interface HomepageGalleryProps {
  ads: PlatformAd[];
  shops: Shop[];
  activeCity: string;
  activeProvince?: string;
  onSelectShop: (shopId: string) => void;
  onOpenChat: (phone: string, title: string) => void;
  featuredBrandName?: string;
  featuredBrandActive?: boolean;
  featuredProducts?: FeaturedBrandProduct[];
}

export const HomepageGallery: React.FC<HomepageGalleryProps> = ({
  ads,
  shops,
  activeCity,
  activeProvince,
  onSelectShop,
  onOpenChat,
  featuredBrandName = 'Elegancia Mineral Water',
  featuredBrandActive = true,
  featuredProducts = [],
}) => {
  const [adIndex, setAdIndex] = useState(0);

  // Filter ads by location
  const matchingAds = ads.filter((ad) => {
    if (!ad.isActive) return false;
    const matchesCity =
      !ad.targetCity ||
      ad.targetCity.toLowerCase() === 'all' ||
      ad.targetCity.toLowerCase() === activeCity.toLowerCase();
    const matchesProv =
      !ad.targetProvince ||
      ad.targetProvince.toLowerCase() === 'all' ||
      ad.targetProvince.toLowerCase() === (activeProvince || '').toLowerCase();
    return matchesCity && matchesProv;
  });

  const featuredAd = matchingAds.length > 0 ? matchingAds[adIndex % matchingAds.length] : null;

  // Top products from shop catalogs
  const topProducts: { shop: Shop; item: any }[] = [];
  shops.forEach((s) => {
    if (s.catalog && s.catalog.length > 0) {
      s.catalog.slice(0, 2).forEach((item) => {
        topProducts.push({ shop: s, item });
      });
    }
  });

  const brandSpotlightProduct = featuredProducts[0];
  const hasProductsToShow = featuredBrandActive || topProducts.length > 0;

  if (!hasProductsToShow && !featuredAd) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 font-['Poppins']">
      {/* FEATURED PARTNER ADVERTISEMENT BANNER */}
      {featuredAd && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Droplets className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
              <span>Featured Partner Spotlight</span>
            </div>
            {matchingAds.length > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAdIndex((prev) => (prev - 1 + matchingAds.length) % matchingAds.length)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Previous featured ad"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => setAdIndex((prev) => (prev + 1) % matchingAds.length)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Next featured ad"
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            )}
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg text-white">
            <div className="relative h-52 sm:h-64 w-full overflow-hidden">
              {featuredAd.mediaType === 'video' ? (
                <video
                  src={featuredAd.mediaUrl}
                  poster={DEFAULT_ELEGANCIA_WATER_IMAGE}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={resolveExternalImageUrl(featuredAd.mediaUrl, 'water')}
                  alt={featuredAd.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-85"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent pointer-events-none" />

              <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-8 sm:right-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
                    <span>Featured Partner</span>
                    {featuredAd.targetCity && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{featuredAd.targetCity}</span>
                      </>
                    )}
                  </div>
                  <h2 className="font-['Outfit'] font-bold text-xl sm:text-2xl text-white tracking-tight">
                    {featuredAd.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed">
                    {featuredAd.description}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenChat(featuredAd.whatsappNumber || '923085599766', featuredAd.title)
                    }
                    className="py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                    <span>WhatsApp Order</span>
                  </button>

                  {featuredAd.linkedShopId && (
                    <button
                      type="button"
                      onClick={() => onSelectShop(featuredAd.linkedShopId!)}
                      className="py-2.5 px-4 bg-white/15 hover:bg-white/25 backdrop-blur-xs border border-white/25 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Store className="w-4 h-4" strokeWidth={1.75} />
                      <span>Visit Shop</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP PRODUCTS IN CITY (Only clean grid, no duplicate shop cards) */}
      {hasProductsToShow && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center">
                <Package className="w-4.5 h-4.5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-['Outfit'] text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Featured Products in {activeCity}
                </h3>
                <p className="text-xs text-slate-500">
                  Popular items from verified merchants &amp; {featuredBrandName}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {featuredBrandActive && (
              <div className="bg-gradient-to-b from-emerald-900 to-slate-950 text-white rounded-2xl p-4 flex flex-col justify-between shadow-sm border border-emerald-800/40 group overflow-hidden">
                <div>
                  <div className="h-28 sm:h-32 rounded-xl bg-slate-900 overflow-hidden mb-3">
                    <img
                      src={resolveExternalImageUrl(brandSpotlightProduct?.imageUrl, 'water')}
                      alt={featuredBrandName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wide mb-0.5">
                    Official Brand
                  </p>
                  <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-1">
                    {brandSpotlightProduct?.name || featuredBrandName}
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                    {brandSpotlightProduct?.size || 'Certified pure hydration'}
                  </p>
                </div>
                <div className="pt-3 flex items-center justify-between border-t border-white/10 mt-3">
                  <span className="font-bold text-xs text-emerald-300 tabular-nums">
                    {brandSpotlightProduct?.price || 'Rs. 180+'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenChat('923085599766', featuredBrandName)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    Order
                  </button>
                </div>
              </div>
            )}

            {topProducts.slice(0, featuredBrandActive ? 4 : 5).map(({ shop, item }) => (
              <div
                key={`${shop.id}-${item.id}`}
                onClick={() => onSelectShop(shop.id)}
                className="bg-white rounded-2xl p-4 flex flex-col justify-between border border-slate-200/90 hover:border-emerald-300 hover:shadow-sm transition-all group cursor-pointer"
              >
                <div>
                  <div className="h-28 sm:h-32 rounded-xl bg-slate-100 overflow-hidden mb-3">
                    <img
                      src={resolveExternalImageUrl(item.image || shop.image, shop.category)}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium truncate mb-0.5">
                    {shop.name}
                  </p>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate mt-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{shop.area || shop.city}</span>
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-slate-100 mt-3">
                  <span className="font-bold text-xs text-slate-900 tabular-nums">
                    Rs. {Number(item.price || 0).toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-emerald-700 text-[11px] font-semibold">
                    <span>View</span>
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

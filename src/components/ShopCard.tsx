import React, { useState, useEffect } from 'react';
import {
  Heart,
  MapPin,
  ArrowUpRight,
  Droplets,
  Phone,
  BadgeCheck,
  Store,
  Clock,
  Star,
} from 'lucide-react';
import { Shop } from '../types';
import { getCategoryDefaultImage, resolveExternalImageUrl } from '../data/defaultImages';

interface ShopCardProps {
  shop: Shop;
  isSelected?: boolean;
  onSelect: () => void;
  onOpenDetails: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onOpenInAppChat?: (shop: Shop) => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({
  shop,
  isSelected = false,
  onSelect,
  onOpenDetails,
  isFavorite,
  onToggleFavorite,
  onOpenInAppChat,
}) => {
  const initialImage = resolveExternalImageUrl(shop.imageUrl || shop.image, shop.category);
  const [imgSrc, setImgSrc] = useState<string>(initialImage);
  const [imgErrorCount, setImgErrorCount] = useState(0);

  useEffect(() => {
    setImgSrc(resolveExternalImageUrl(shop.imageUrl || shop.image, shop.category));
    setImgErrorCount(0);
  }, [shop.imageUrl, shop.image, shop.category]);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenInAppChat) {
      onOpenInAppChat(shop);
    } else {
      const phone = (shop.whatsapp || shop.orderPhone || shop.phone || '923085599766').replace(/[^0-9]/g, '');
      const text = encodeURIComponent(
        `Hello ${shop.name}! I found your business on asspas.store.`
      );
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    }
  };

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = shop.orderPhone || shop.phone || '03085599766';
    window.location.href = `tel:${phone}`;
  };

  return (
    <div
      onClick={onSelect}
      className={`group bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md font-['Poppins'] ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div>
        {/* Clean Storefront Photo */}
        <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100">
          {imgErrorCount < 2 ? (
            <img
              src={imgSrc}
              alt={shop.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => {
                if (imgErrorCount === 0) {
                  setImgSrc(getCategoryDefaultImage(shop.category));
                }
                setImgErrorCount((c) => c + 1);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-50 via-slate-100 to-emerald-100 flex flex-col items-center justify-center text-emerald-700/70 p-4 text-center">
              <Store className="w-9 h-9 mb-1.5" strokeWidth={1.5} />
              <span className="text-xs font-semibold text-slate-700 truncate max-w-full">
                {shop.name}
              </span>
            </div>
          )}

          {/* Subtle Top Status Tag */}
          <div className="absolute top-3 left-3">
            <span
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-2xs ${
                shop.isOpen
                  ? 'bg-emerald-600/90 text-white'
                  : 'bg-slate-900/80 text-white'
              }`}
            >
              {shop.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 shadow-sm transition-colors cursor-pointer backdrop-blur-xs"
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
              strokeWidth={1.75}
            />
          </button>
        </div>

        {/* Spacious Card Content */}
        <div className="p-4 sm:p-5 space-y-2.5">
          {/* Clean Unboxed Category Metadata */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 truncate">
            <span className="text-emerald-700 font-semibold truncate">{shop.category}</span>
            {shop.subCategory && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{shop.subCategory}</span>
              </>
            )}
          </div>

          {/* Shop Name & Verified Badge */}
          <h3 className="font-['Outfit'] font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors flex items-center gap-1.5 leading-snug">
            <span className="truncate">{shop.name}</span>
            {shop.verified && (
              <span title="Verified Business" className="shrink-0">
                <BadgeCheck className="w-4 h-4 text-emerald-600" strokeWidth={2} />
              </span>
            )}
          </h3>

          {/* Location & Distance */}
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.75} />
            <span className="truncate">
              {shop.marketOrBazar || shop.area}, {shop.city}
            </span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-emerald-700 font-semibold shrink-0 tabular-nums">
              {shop.distance} km
            </span>
          </div>

          {/* Rating & Opening Hours */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 pt-0.5">
            <div className="flex items-center gap-1.5 tabular-nums">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
              <span className="font-semibold text-slate-800">{shop.rating}</span>
              <span className="text-slate-400">({shop.reviewsCount})</span>
            </div>
            {shop.openingHours && (
              <div
                className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[140px]"
                title={shop.openingHours}
              >
                <Clock className="w-3 h-3 text-slate-400 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{shop.openingHours}</span>
              </div>
            )}
          </div>

          {/* Subtle Elegancia Water Stockist Note */}
          {shop.hasEleganciaWater && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 pt-0.5">
              <Droplets className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.75} />
              <span>Elegancia Mineral Water Available</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleWhatsAppClick}
            title="Chat on WhatsApp"
            aria-label="Chat on WhatsApp"
            className="w-8 h-8 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleCallClick}
            title="Call Store"
            aria-label="Call Store"
            className="w-8 h-8 rounded-xl bg-slate-200/80 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap"
        >
          <span>View Shop</span>
          <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

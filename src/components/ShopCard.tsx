import React from 'react';
import { 
  Heart, 
  MapPin, 
  ChevronRight, 
  Droplet, 
  Phone, 
  CheckCircle2,
  Users
} from 'lucide-react';
import { Shop } from '../types';

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

  const displayImage = shop.imageUrl || shop.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500';

  return (
    <div
      onClick={onSelect}
      className={`group bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between hover:shadow-lg font-['Poppins'] ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div>
        {/* Store Cover Image Banner with Overlaid Badges */}
        <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100">
          <img
            src={displayImage}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {/* Gradient protection for top badges */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-950/60 to-transparent pointer-events-none" />

          {/* Top Left Badges: Status & Nature */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
            {shop.isOpen ? (
              <span className="text-[10px] font-bold text-white bg-emerald-600/90 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
                Open
              </span>
            ) : (
              <span className="text-[10px] font-bold text-white bg-slate-800/80 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
                Closed
              </span>
            )}

            <span
              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md backdrop-blur-xs ${
                shop.itemType === 'services'
                  ? 'bg-blue-600/90 text-white'
                  : shop.itemType === 'both'
                  ? 'bg-purple-600/90 text-white'
                  : 'bg-emerald-700/90 text-white'
              }`}
            >
              {shop.itemType || 'goods'}
            </span>
          </div>

          {/* Top Right: Favorite Button */}
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? `Remove from favorites` : `Add to favorites`}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 shadow-md transition-all cursor-pointer backdrop-blur-xs"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>

          {/* Bottom Overlaid Category Pill */}
          <div className="absolute bottom-2 left-2.5">
            <span className="text-[11px] font-bold text-white bg-slate-950/70 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/20">
              {shop.category}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-3.5 sm:p-4 space-y-2">
          {/* Title & Verified */}
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-['Outfit'] font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors flex items-center gap-1.5 leading-snug">
              <span className="truncate">{shop.name}</span>
              {shop.verified && (
                <span title="Verified Business">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0" />
                </span>
              )}
            </h3>
          </div>

          {/* Location & Distance */}
          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{shop.area}, {shop.city}</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-bold shrink-0">{shop.distance} km</span>
          </div>

          {/* Rating & Followers */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="text-amber-500 font-bold flex items-center gap-0.5">
              ★ {shop.rating}
            </span>
            <span className="text-slate-400">({shop.reviewsCount})</span>
            {shop.followersCount !== undefined && shop.followersCount > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                  <Users className="w-3 h-3 text-emerald-600" />
                  {shop.followersCount}
                </span>
              </>
            )}
          </div>

          {/* Elegancia Water Stockist Badge */}
          {shop.hasEleganciaWater && (
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
              <Droplet className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              <span>Elegancia Mineral Water Stockist</span>
            </div>
          )}

          {/* Tags */}
          {shop.tags && shop.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap pt-0.5">
              {shop.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium truncate max-w-[120px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer: Clean Icon Actions (No redundant text labels) */}
      <div className="px-3.5 sm:px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* WhatsApp Direct Action (Clean Green Icon Button without redundant text) */}
          <button
            type="button"
            onClick={handleWhatsAppClick}
            title="Chat on WhatsApp"
            aria-label="Chat on WhatsApp"
            className="w-8 h-8 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
            </svg>
          </button>

          {/* Call Direct Action (Clean Phone Icon Button) */}
          <button
            type="button"
            onClick={handleCallClick}
            title="Call Store"
            aria-label="Call Store"
            className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Details Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
        >
          <span>View Shop</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

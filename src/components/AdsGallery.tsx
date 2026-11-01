import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  MessageCircle, 
  MapPin, 
  Sparkles, 
  Store,
  ExternalLink
} from 'lucide-react';
import { PlatformAd, Shop } from '../types';

interface AdsGalleryProps {
  ads: PlatformAd[];
  activeCity: string;
  onSelectShop?: (shopId: string) => void;
  onOpenChat?: (phone: string, title: string) => void;
}

export const AdsGallery: React.FC<AdsGalleryProps> = ({
  ads,
  activeCity,
  onSelectShop,
  onOpenChat,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter ads matching current city or targeting "All"
  const visibleAds = ads.filter(
    (ad) => !ad.targetCity || ad.targetCity.toLowerCase() === 'all' || ad.targetCity.toLowerCase() === activeCity.toLowerCase()
  );

  if (visibleAds.length === 0) return null;

  const currentAd = visibleAds[currentIndex % visibleAds.length];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % visibleAds.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + visibleAds.length) % visibleAds.length);
  };

  const handleContactWhatsApp = (whatsappNumber?: string) => {
    const num = (whatsappNumber || '923085599766').replace(/\D/g, '');
    const text = encodeURIComponent(`Assalam-o-Alaikum! I saw the featured advertisement "${currentAd.title}" on asspas.store.`);
    if (onOpenChat) {
      onOpenChat(num, currentAd.title);
    } else {
      window.open(`https://wa.me/${num}?text=${text}`, '_blank');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 font-['Poppins']">
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-emerald-900/30 shadow-lg text-white">
        {/* Banner Media Item */}
        <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden bg-slate-950">
          {currentAd.mediaType === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                src={currentAd.mediaUrl}
                poster="/src/assets/images/product_elegancia_water_1793110437317.jpg"
                controls
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <img
              src={currentAd.mediaUrl}
              alt={currentAd.title}
              className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-102"
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

          {/* City Badge & Tag */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2">
            <span className="bg-emerald-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Showcase</span>
            </span>
            {currentAd.targetCity && (
              <span className="bg-slate-900/80 backdrop-blur-xs border border-white/20 text-emerald-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{currentAd.targetCity}</span>
              </span>
            )}
          </div>

          {/* Ad Description & Direct WhatsApp CTA */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-6 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
            <div className="space-y-1 max-w-xl">
              <h2 className="font-['Outfit'] font-black text-lg sm:text-2xl text-white tracking-tight drop-shadow-md">
                {currentAd.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-lg leading-relaxed">
                {currentAd.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleContactWhatsApp(currentAd.whatsappContact)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Order</span>
              </button>

              {currentAd.linkedShopId && onSelectShop && (
                <button
                  onClick={() => onSelectShop(currentAd.linkedShopId!)}
                  className="px-3.5 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-xs text-white border border-white/30 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>View Store</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Carousel controls if more than 1 ad */}
        {visibleAds.length > 1 && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 z-10">
            <button
              onClick={handlePrev}
              className="w-7 h-7 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono text-white/80 bg-slate-950/70 px-2 py-0.5 rounded-full border border-white/10">
              {currentIndex + 1} / {visibleAds.length}
            </span>
            <button
              onClick={handleNext}
              className="w-7 h-7 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

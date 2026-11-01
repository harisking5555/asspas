import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Droplet, Store, Gift, ArrowRight } from 'lucide-react';

interface AppSliderProps {
  onOpenElegancia: () => void;
  onOpenRewards: () => void;
  onExploreSports: () => void;
  onOpenAddShop: () => void;
}

export const AppSlider: React.FC<AppSliderProps> = ({
  onOpenElegancia,
  onOpenRewards,
  onExploreSports,
  onOpenAddShop,
}) => {
  const [current, setCurrent] = useState(0);

  const slides = [
    {
      id: 1,
      badge: 'asspas.store · Near You',
      title: 'Find Neighborhood Shops Fast',
      desc: 'Supermarkets, pharmacies, clothing, and sports shops within 500m of your doorstep.',
      btnText: 'Search Nearby',
      btnAction: () => {
        const el = document.getElementById('search-input-box');
        if (el) el.focus();
      },
      bgGradient: 'from-emerald-950 via-emerald-900 to-slate-900',
      icon: <Store className="w-4 h-4 text-emerald-300" />,
      accentColor: 'text-emerald-300',
    },
    {
      id: 2,
      badge: 'Official Peshawar Project',
      title: 'Elegancia Mineral Water',
      desc: 'Pure mineral water (formerly Purifine). Direct doorstep delivery for homes & offices in Peshawar.',
      btnText: 'Order Water Bottles',
      btnAction: onOpenElegancia,
      bgGradient: 'from-emerald-900 via-emerald-950 to-slate-950',
      icon: <Droplet className="w-4 h-4 text-emerald-300 fill-emerald-300" />,
      accentColor: 'text-emerald-300',
    },
    {
      id: 3,
      badge: 'Local Sports & Fitness',
      title: 'Kamran Sports & Fitness',
      desc: 'English willow cricket bats, genuine footballs, gym gear, and custom sportswear in University Town.',
      btnText: 'Explore Sports Gear',
      btnAction: onExploreSports,
      bgGradient: 'from-slate-950 via-emerald-950 to-emerald-900',
      icon: <Store className="w-4 h-4 text-emerald-300" />,
      accentColor: 'text-emerald-300',
    },
    {
      id: 4,
      badge: 'Community Loyalty',
      title: 'Get 100 Free Welcome Points',
      desc: 'Invite your neighbors via WhatsApp and redeem points for free Elegancia water & discount passes.',
      btnText: 'Claim Rewards',
      btnAction: onOpenRewards,
      bgGradient: 'from-emerald-950 via-emerald-900 to-slate-900',
      icon: <Gift className="w-4 h-4 text-emerald-300" />,
      accentColor: 'text-emerald-300',
    },
  ];

  // Auto rotate slides every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-sm border border-emerald-900/20 bg-slate-900">
      {/* Slide Item */}
      <div
        className={`w-full py-4 sm:py-6 px-4 sm:px-8 bg-gradient-to-r ${slide.bgGradient} text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 min-h-[135px] sm:min-h-[160px] transition-all duration-300`}
      >
        <div className="max-w-xl space-y-1 sm:space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide backdrop-blur-xs">
            {slide.icon}
            <span>{slide.badge}</span>
          </div>

          <h2 className="font-display text-base sm:text-xl md:text-2xl font-black tracking-tight leading-snug">
            {slide.title}
          </h2>

          <p className="text-[11px] sm:text-xs text-slate-200/90 leading-relaxed line-clamp-2">
            {slide.desc}
          </p>

          <div className="pt-1">
            <button
              onClick={slide.btnAction}
              className="inline-flex items-center gap-1.5 bg-white text-emerald-950 hover:bg-emerald-50 text-[11px] sm:text-xs font-extrabold px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>{slide.btnText}</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          </div>
        </div>

        {/* Dots & Nav Arrows */}
        <div className="flex flex-col items-end gap-1.5 self-end sm:self-center z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    current === i ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {/* Subtle Mobile Scroll/Swipe Helper Label */}
          <span className="text-[10px] text-emerald-200/80 font-mono tracking-tight select-none">
            ↔ Swipe Slider ({current + 1}/{slides.length})
          </span>
        </div>
      </div>
    </div>
  );
};

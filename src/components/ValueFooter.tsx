import React from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  MessageCircle, 
  Droplet, 
  Sparkles, 
  Heart,
  Store
} from 'lucide-react';
import { MainNavTab } from '../types';

interface ValueFooterProps {
  onSelectTab: (tab: MainNavTab) => void;
  onOpenAddShop: () => void;
  onOpenCityModal: () => void;
  onOpenAboutModal: () => void;
  onOpenContactModal: () => void;
}

export const ValueFooter: React.FC<ValueFooterProps> = ({
  onSelectTab,
  onOpenAddShop,
  onOpenCityModal,
  onOpenAboutModal,
  onOpenContactModal,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-12 pb-20 lg:pb-8">
      {/* 4 Trust Value Pillars */}
      <div className="border-b border-slate-800 py-5 w-full">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs">Hyperlocal Radius</h5>
              <p className="text-[10px] text-slate-400">Within 500m - 10km</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs">100% Verified</h5>
              <p className="text-[10px] text-slate-400">Genuine local shopkeepers</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Droplet className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs">Elegancia Water</h5>
              <p className="text-[10px] text-slate-400">Official Peshawar project</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs">Refer & Earn</h5>
              <p className="text-[10px] text-slate-400">50 Pts referral bonus</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-column Footer */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
        {/* Col 1: Brand & Bio */}
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="font-black text-2xl text-white tracking-tight font-['Outfit']">
              asspas<span className="text-emerald-400">.store</span>
            </span>
          </div>

          <p className="text-slate-400 text-[11px] leading-relaxed">
            Pakistan’s premier local shop discovery directory. Find verified grocery stores, pharmacies, clothing boutiques, sports shops, and official Elegancia mineral water stockists near you.
          </p>

          <div className="pt-1">
            <a
              href="https://wa.me/923085599766"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold text-xs inline-flex items-center gap-2 py-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>0308 5599766</span>
            </a>
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-slate-400 text-[11px]">
            <li>
              <button
                onClick={() => onSelectTab('home')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Explore Nearby Shops
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('shops')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                All Shops Directory
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('categories')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Product Categories
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('elegancia')}
                className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold cursor-pointer"
              >
                Elegancia Mineral Water Hub
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('rewards')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Rewards & Loyalty Club
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('favorites')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                My Saved Favorites
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: For Businesses & About */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">
            Business & Company
          </h4>
          <ul className="space-y-2 text-slate-400 text-[11px]">
            <li>
              <button
                onClick={onOpenAddShop}
                className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
              >
                + Register Your Store on asspas.store
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('admin')}
                className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Portal (/admin)</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('elegancia')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Elegancia Stockist Application
              </button>
            </li>
            <li>
              <button
                onClick={onOpenAboutModal}
                className="hover:text-white transition-colors cursor-pointer"
              >
                About asspas.store
              </button>
            </li>
            <li>
              <button
                onClick={onOpenContactModal}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Contact & Support Office
              </button>
            </li>
            <li>
              <span className="text-slate-500">Peshawar Head Office: University Town, KP</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Top Cities Coverage */}
        <div className="space-y-2.5">
          <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider">
            Coverage Across Pakistan
          </h4>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Peshawar', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Mardan', 'Abbottabad', 'Swat'].map((city) => (
              <button
                key={city}
                onClick={onOpenCityModal}
                className="bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                {city}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500">
            Proudly supporting local economies and merchants across Pakistan.
          </div>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="border-t border-slate-800/80 py-4 w-full text-[11px] text-slate-500">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} asspas.store — Pakistan's Hyperlocal Shop & Water Network. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <button onClick={onOpenAboutModal} className="hover:text-slate-300 cursor-pointer">
              Privacy Policy
            </button>
            <span>·</span>
            <button onClick={onOpenAboutModal} className="hover:text-slate-300 cursor-pointer">
              Terms of Service
            </button>
            <span>·</span>
            <button onClick={onOpenContactModal} className="text-emerald-400 hover:underline cursor-pointer">
              WhatsApp Support: 0308-5599766
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

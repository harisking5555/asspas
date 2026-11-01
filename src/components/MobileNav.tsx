import React from 'react';
import { Home, Store, Droplet, PlusCircle, Gift } from 'lucide-react';
import { UserProfile, MainNavTab } from '../types';

interface MobileNavProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  mobileView: 'list' | 'map';
  onToggleMobileView: () => void;
  onOpenAddShop: () => void;
  onOpenReferral: () => void;
  user: UserProfile;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddShop,
  user,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1 shadow-lg flex items-center justify-around text-[10px]">
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center py-1 transition-colors cursor-pointer ${
          activeTab === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Home className="w-4.5 h-4.5 mb-0.5" strokeWidth={1.75} />
        <span>Explore</span>
      </button>

      <button
        onClick={() => onSelectTab('shops')}
        className={`flex flex-col items-center py-1 transition-colors cursor-pointer ${
          activeTab === 'shops' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Store className="w-4.5 h-4.5 mb-0.5" strokeWidth={1.75} />
        <span>Shops</span>
      </button>

      {/* Center Action: Add Shop */}
      <button
        onClick={onOpenAddShop}
        className="flex flex-col items-center -mt-3 bg-emerald-600 text-white rounded-full p-2.5 shadow-md border-2 border-white active:scale-95 transition-transform cursor-pointer"
        title="Add Shop"
      >
        <PlusCircle className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* Elegancia Water Tab on Mobile */}
      <button
        onClick={() => onSelectTab('elegancia')}
        className={`flex flex-col items-center py-1 transition-colors cursor-pointer ${
          activeTab === 'elegancia' ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Droplet className="w-4.5 h-4.5 mb-0.5 fill-current text-emerald-600" strokeWidth={1.75} />
        <span>Elegancia</span>
      </button>

      {/* Rewards & Referral */}
      <button
        onClick={() => onSelectTab('rewards')}
        className={`flex flex-col items-center py-1 transition-colors cursor-pointer ${
          activeTab === 'rewards' ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <div className="relative">
          <Gift className="w-4.5 h-4.5 mb-0.5 text-emerald-600" strokeWidth={1.75} />
          <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded-full tabular-nums">
            {user.points}
          </span>
        </div>
        <span>Rewards</span>
      </button>
    </div>
  );
};

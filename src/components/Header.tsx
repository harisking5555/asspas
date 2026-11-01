import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Menu, 
  X,
  ChevronDown, 
  Home, 
  Store, 
  Grid, 
  Droplet, 
  Gift, 
  Heart, 
  Info, 
  Phone, 
  PlusCircle, 
  User,
  ShieldCheck,
  Search,
  ExternalLink,
  Download,
  Building2
} from 'lucide-react';
import { UserProfile, MainNavTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  activeCity: string;
  onOpenCityModal: () => void;
  user: UserProfile;
  favoritesCount: number;
  onOpenReferralModal: () => void;
  onOpenAddShopModal: () => void;
  onOpenAuthModal: () => void;
  onOpenAboutModal: () => void;
  onOpenContactModal: () => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  activeCity,
  onOpenCityModal,
  user,
  favoritesCount,
  onOpenAddShopModal,
  onOpenAuthModal,
  onOpenAboutModal,
  onOpenContactModal,
  onOpenInstallModal,
}) => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const displayUser = userProfile || user;

  // Listen for PWA BeforeInstallPromptEvent
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredInstallPrompt(null);
    } else if (onOpenInstallModal) {
      onOpenInstallModal();
    } else {
      alert('To add asspas.store desktop shortcut: Click browser menu (⋮ or ⋯) and select "Install App" or "Add to Home Screen".');
    }
  };

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNav = (tab: MainNavTab) => {
    onSelectTab(tab);
    setDropdownOpen(false);
  };

  return (
    // Note: Do NOT add overflow-x-hidden here! It clips child dropdowns.
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs w-full font-sans text-xs select-none">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Name (Clean text only, no logo box next to it) & City Selector */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNav('home')}
            className="group text-left cursor-pointer transition-transform hover:scale-[1.01]"
            aria-label="asspas.store home"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors leading-none font-['Outfit']">
              asspas<span className="text-emerald-600">.store</span>
            </span>
          </button>

          {/* City Selector Pill (Hidden on mobile to keep header clean and prevent menu clipping; available in dropdown menu) */}
          <button
            onClick={onOpenCityModal}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 px-2.5 py-1.5 rounded-xl border border-slate-200/90 transition-all cursor-pointer shadow-2xs"
            title="Change City in Pakistan"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={2} />
            <span className="max-w-[80px] sm:max-w-[120px] truncate font-semibold">{activeCity}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-medium text-slate-700">
          <button
            onClick={() => handleNav('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                : 'hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleNav('shops')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'shops'
                ? 'bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                : 'hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
            <span>Shops</span>
          </button>

          <button
            onClick={() => handleNav('elegancia')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'elegancia'
                ? 'bg-emerald-100/80 text-emerald-950 font-bold shadow-2xs'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <Droplet className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" strokeWidth={2} />
            <span>Elegancia Water</span>
          </button>

          <button
            onClick={() => handleNav('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                : 'hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
            <span>Favorites</span>
            {favoritesCount > 0 && (
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {favoritesCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right: Actions, Add Shop & Responsive Dropdown Menu (Always visible & fits on all mobile screens) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Add Business CTA (Desktop & Tablet only; on mobile, available via bottom bar and dropdown menu) */}
          <button
            onClick={onOpenAddShopModal}
            className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer shrink-0"
            title="Add Shop"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            <span>Add Shop</span>
          </button>

          {/* Install Shortcut CTA (Desktop & Tablet) */}
          <button
            onClick={handleInstallClick}
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs shrink-0"
            title="Install App Shortcut on PC Desktop / Mobile"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Shortcut</span>
          </button>

          {/* User Profile Button (Displays User Name when logged in) */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer shadow-2xs shrink-0"
            title={currentUser ? currentUser.displayName || 'Profile' : 'Sign In'}
            aria-label="User Account"
          >
            {currentUser && currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="" className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500 shrink-0" />
            ) : (
              <User className="w-4 h-4 text-emerald-700 shrink-0" strokeWidth={2} />
            )}
            {currentUser && (
              <span className="text-xs font-bold text-slate-800 max-w-[85px] truncate hidden sm:inline">
                {currentUser.displayName?.split(' ')[0] || userProfile?.name?.split(' ')[0] || 'Member'}
              </span>
            )}
          </button>

          {/* Unified Menu Dropdown Wrapper (Always visible on mobile & desktop) */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer shadow-2xs shrink-0 ${
                dropdownOpen
                  ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30'
                  : 'text-slate-800 bg-emerald-50/90 hover:bg-emerald-100 border-emerald-200/90'
              }`}
              aria-label="Menu"
              aria-expanded={dropdownOpen}
            >
              {dropdownOpen ? (
                <X className="w-4 h-4 shrink-0" strokeWidth={2} />
              ) : (
                <Menu className="w-4 h-4 text-emerald-700 shrink-0" strokeWidth={2} />
              )}
            </button>

            {/* Dropdown Menu Modal with elevation, outside backdrop, and no clipping */}
            {dropdownOpen && (
              <>
                {/* Mobile Backdrop Click-Away Overlay */}
                <div 
                  className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px] sm:hidden"
                  onClick={() => setDropdownOpen(false)}
                />

                <div 
                  className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-20px)] bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800"
                  style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}
                >
                  {/* City Selector option in Dropdown Menu (Accessible on Mobile & Desktop) */}
                  <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/70 mb-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Selected City
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                        Pakistan
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenCityModal();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200/90 text-slate-800 transition-all shadow-2xs cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2} />
                        <span className="font-bold text-xs truncate group-hover:text-emerald-800 transition-colors">
                          {activeCity}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white px-2 py-0.5 rounded-lg border border-emerald-200 group-hover:border-emerald-600 transition-colors">
                        Change
                      </span>
                    </button>
                  </div>

                  {/* Links Group */}
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => handleNav('home')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                        activeTab === 'home' ? 'text-emerald-800 bg-emerald-50/90 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Home className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                      <span className="font-medium text-slate-800">Home & Map</span>
                    </button>

                    <button
                      onClick={() => handleNav('shops')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                        activeTab === 'shops' ? 'text-emerald-800 bg-emerald-50/90 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Store className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                      <span className="font-medium text-slate-800">All Shops Directory</span>
                    </button>

                    <button
                      onClick={() => handleNav('categories')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                        activeTab === 'categories' ? 'text-emerald-800 bg-emerald-50/90 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Grid className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                      <span className="font-medium text-slate-800">Goods & Services</span>
                    </button>

                    <button
                      onClick={() => handleNav('elegancia')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                        activeTab === 'elegancia' ? 'text-emerald-950 bg-emerald-100 font-black' : 'text-emerald-900 bg-emerald-50/50 hover:bg-emerald-50'
                      }`}
                    >
                      <Droplet className="w-4 h-4 text-emerald-600 fill-emerald-600" strokeWidth={2} />
                      <div className="flex-1">
                        <div className="leading-tight flex items-center gap-1.5">
                          <span>Elegancia Mineral Water</span>
                          <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">Official</span>
                        </div>
                        <div className="text-[10px] text-emerald-700/80 font-normal">Peshawar pure water project</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNav('rewards')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                        activeTab === 'rewards' ? 'text-emerald-800 bg-emerald-50/90 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Gift className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <div className="leading-tight">Rewards & 3x3 Club</div>
                          <div className="text-[10px] text-slate-400 font-normal">Refer neighbors, earn points</div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {displayUser.points} Pts
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleNav('favorites')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                        activeTab === 'favorites' ? 'text-emerald-800 bg-emerald-50/90 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                      <div className="flex-1 flex items-center justify-between">
                        <div className="leading-tight">Saved Favorites</div>
                        {favoritesCount > 0 && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {favoritesCount}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* My Registered Stores */}
                    <button
                      onClick={() => handleNav('my-shops')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                        activeTab === 'my-shops' ? 'text-emerald-800 bg-emerald-50/90 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                      <div className="flex-1">
                        <div className="leading-tight">My Stores</div>
                        <div className="text-[10px] text-slate-400 font-normal">Manage your registered businesses</div>
                      </div>
                    </button>

                    {/* Install App Shortcut */}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleInstallClick();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      <Download className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                      <div className="flex-1">
                        <div className="leading-tight">Install App Shortcut</div>
                        <div className="text-[10px] text-slate-400 font-normal">Add to desktop / home screen</div>
                      </div>
                    </button>

                    {/* Direct Admin Portal link */}
                    <button
                      onClick={() => handleNav('admin')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer border ${
                        activeTab === 'admin' 
                          ? 'text-white bg-emerald-700 border-emerald-800' 
                          : 'text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100 border-emerald-200/80'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <div className="leading-tight">Admin Portal</div>
                          <div className="text-[10px] text-emerald-700/80 font-normal">Protected route (/admin)</div>
                        </div>
                        {isAdmin ? (
                          <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                            Superadmin
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-medium">
                            Login
                          </span>
                        )}
                      </div>
                    </button>
                  </div>

                  <div className="my-1.5 border-t border-slate-100" />
                  
                  {/* Account, About, Contact */}
                  <div className="px-3.5 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Account & Support
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs text-slate-700 hover:bg-emerald-50 font-medium text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                      <span>{currentUser ? `Account (${currentUser.displayName || 'Member'})` : 'Sign In with Google'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenAboutModal();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs text-slate-700 hover:bg-emerald-50 font-medium text-left cursor-pointer"
                    >
                      <Info className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                      <span>About asspas.store</span>
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenContactModal();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs text-slate-700 hover:bg-emerald-50 font-medium text-left cursor-pointer"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                      <span>Helpline (0308-5599766)</span>
                    </button>
                  </div>

                  <div className="my-1 border-t border-slate-100" />

                  {/* Register Shop CTA in Menu */}
                  <div className="px-3 pt-1 pb-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenAddShopModal();
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" strokeWidth={2} />
                      <span>Register Your Business Free</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

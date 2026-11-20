import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Menu,
  X,
  ChevronDown,
  Home,
  Store,
  LayoutGrid,
  Droplets,
  Gift,
  Heart,
  Info,
  Phone,
  PlusCircle,
  User,
  ShieldCheck,
  Download,
  Building2,
  LogOut,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, MainNavTab } from '../types';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { usePWAInstall } from '../hooks/usePWAInstall';

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
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { canPromptNatively, isInstalled, promptInstall } = usePWAInstall();

  const displayUser = userProfile || user;

  const handleInstallClick = async () => {
    if (canPromptNatively) {
      const outcome = await promptInstall();
      if (outcome === 'unavailable' && onOpenInstallModal) {
        onOpenInstallModal();
      }
    } else if (onOpenInstallModal) {
      onOpenInstallModal();
    }
  };

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs w-full font-sans text-xs select-none">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Brand Logo & City Selector */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => handleNav('home')}
            className="group text-left cursor-pointer transition-transform hover:scale-[1.01]"
            aria-label="asspas.store home"
          >
            <BrandLogo size="md" showTagline={false} />
          </button>

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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleNav('shops')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'shops'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
            <span>Shops</span>
          </button>

          <button
            onClick={() => handleNav('elegancia')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'elegancia'
                ? 'bg-emerald-100/80 text-emerald-950 font-semibold'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
            <span>Elegancia Water</span>
          </button>

          <button
            onClick={() => handleNav('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
            <span>Favorites</span>
            {favoritesCount > 0 && (
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {favoritesCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right: Actions, Shortcut (Mobile+Desktop), User Profile, Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenAddShopModal}
            className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer shrink-0"
            title="Add Shop"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            <span>Add Shop</span>
          </button>

          {/* Shortcut / Install App CTA - Always visible on BOTH Mobile and Desktop */}
          {!isInstalled ? (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 sm:px-2.5 py-1.5 rounded-xl border border-emerald-200 transition-all cursor-pointer shadow-2xs shrink-0"
              title="Install App Shortcut on Desktop / Mobile"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="hidden xs:inline sm:inline">Shortcut</span>
            </button>
          ) : (
            <span
              className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200"
              title="App installed on your device"
            >
              <Check className="w-3 h-3 text-emerald-600" />
              <span>App</span>
            </span>
          )}

          {/* User Account Button */}
          <button
            onClick={() => {
              if (currentUser) {
                handleNav('profile');
              } else {
                onOpenAuthModal();
              }
            }}
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer shadow-2xs shrink-0"
            title={currentUser ? userProfile?.name || 'My Profile' : 'Sign In / Create Account'}
            aria-label="User Account"
          >
            {currentUser && (currentUser.photoURL || userProfile?.photoURL) ? (
              <img
                src={userProfile?.photoURL || currentUser.photoURL || ''}
                alt=""
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500 shrink-0"
              />
            ) : (
              <User className="w-4 h-4 text-emerald-700 shrink-0" strokeWidth={2} />
            )}
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 max-w-[68px] sm:max-w-[95px] truncate inline">
              {currentUser
                ? userProfile?.name?.split(' ')[0] || currentUser.displayName?.split(' ')[0] || 'Profile'
                : 'Sign In'}
            </span>
          </button>

          {/* Unified Menu Dropdown Wrapper */}
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

            <AnimatePresence>
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px] sm:hidden"
                    onClick={() => setDropdownOpen(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -6 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-20px)] bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800"
                    style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}
                  >
                    {/* Register Business CTA at very top */}
                    <div className="p-2 border-b border-slate-100 bg-emerald-50/70">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenAddShopModal();
                        }}
                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-200" strokeWidth={2.5} />
                        <span>Register Your Business Free</span>
                      </button>
                    </div>

                    {/* City Selector */}
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
                          <span className="font-bold text-xs truncate group-hover:text-emerald-800">
                            {activeCity}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white px-2 py-0.5 rounded-lg border border-emerald-200 transition-colors">
                          Change
                        </span>
                      </button>
                    </div>

                    {/* Nav Links */}
                    <div className="p-1.5 space-y-0.5">
                      {currentUser && (
                        <button
                          onClick={() => handleNav('profile')}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                            activeTab === 'profile'
                              ? 'text-emerald-800 bg-emerald-50/90 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <User className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                          <span className="font-bold text-emerald-950 truncate">
                            My Profile ({userProfile?.points || 0} PTS = Points)
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => handleNav('home')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                          activeTab === 'home' ? 'text-emerald-800 bg-emerald-50/90 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Home className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                        <span>Home &amp; Map</span>
                      </button>

                      <button
                        onClick={() => handleNav('shops')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                          activeTab === 'shops' ? 'text-emerald-800 bg-emerald-50/90 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Store className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                        <span>All Shops Directory</span>
                      </button>

                      <button
                        onClick={() => handleNav('categories')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                          activeTab === 'categories' ? 'text-emerald-800 bg-emerald-50/90 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <LayoutGrid className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
                        <span>Goods &amp; Services</span>
                      </button>

                      <button
                        onClick={() => handleNav('elegancia')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                          activeTab === 'elegancia' ? 'text-emerald-950 bg-emerald-100 font-black' : 'text-emerald-900 bg-emerald-50/50 hover:bg-emerald-50'
                        }`}
                      >
                        <Droplets className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
                        <div className="flex-1">
                          <div className="leading-tight flex items-center gap-1.5">
                            <span>Elegancia Mineral Water</span>
                            <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">
                              Official
                            </span>
                          </div>
                          <div className="text-[10px] text-emerald-700/80 font-normal">Authorized shops &amp; distributors</div>
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
                            <div className="leading-tight">Rewards &amp; 3×3 Club</div>
                            <div className="text-[10px] text-slate-400 font-normal">PTS = Loyalty Points</div>
                          </div>
                          <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {displayUser.points} PTS
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
                          <span>Saved Favorites</span>
                          {favoritesCount > 0 && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {favoritesCount}
                            </span>
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => handleNav('my-shops')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                          activeTab === 'my-shops' ? 'text-emerald-800 bg-emerald-50/90 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                        <div>
                          <div className="leading-tight">My Stores</div>
                          <div className="text-[10px] text-slate-400 font-normal">Manage your registered businesses</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleInstallClick();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <Download className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                        <div>
                          <div className="leading-tight">Install App Shortcut</div>
                          <div className="text-[10px] text-slate-400 font-normal">Add to desktop / home screen</div>
                        </div>
                      </button>

                      {isAdmin && (
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
                              <div className="text-[10px] text-emerald-700/80 font-normal">Superadmin Console</div>
                            </div>
                            <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                              Admin
                            </span>
                          </div>
                        </button>
                      )}
                    </div>

                    <div className="my-1.5 border-t border-slate-100" />

                    <div className="px-3.5 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Account &amp; Support
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
                        <span>
                          {currentUser ? `Account (${userProfile?.name || currentUser.displayName || 'Member'})` : 'Sign In / Create Account'}
                        </span>
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

                      {currentUser && (
                        <button
                          onClick={async () => {
                            setDropdownOpen(false);
                            await logout();
                            onSelectTab('home');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-left cursor-pointer mt-1"
                        >
                          <LogOut className="w-4 h-4 text-rose-600" strokeWidth={2} />
                          <span>Log Out / Sign Out</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

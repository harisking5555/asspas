/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Store, 
  Filter, 
  Droplet, 
  Heart, 
  Search,
  AlertCircle,
  Map as MapIcon,
  List as ListIcon,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { Shop, ShopCategory, ShopType, UserProfile, MainNavTab } from './types';
import { INITIAL_SHOPS } from './data/mockShops';
import { CityInfo } from './data/pakistanRegions';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AppSlider } from './components/AppSlider';
import { CategoryBar } from './components/CategoryBar';
import { FilterSidebar } from './components/FilterSidebar';
import { ShopCard } from './components/ShopCard';
import { InteractiveMap } from './components/InteractiveMap';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ShopDetailModal } from './components/ShopDetailModal';
import { AddShopModal } from './components/AddShopModal';
import { ReferralModal } from './components/ReferralModal';
import { EleganciaModal } from './components/EleganciaModal';
import { EleganciaPortalView } from './components/EleganciaPortalView';
import { CategoriesView } from './components/CategoriesView';
import { RewardsClubView } from './components/RewardsClubView';
import { AllShopsDirectoryView } from './components/AllShopsDirectoryView';
import { MyStoresView } from './components/MyStoresView';
import { HomepageGallery } from './components/HomepageGallery';
import { UserProfileView } from './components/UserProfileView';
import { FullShopProfileView } from './components/FullShopProfileView';
import { InAppWhatsAppChat } from './components/InAppWhatsAppChat';
import { CitySelectorModal } from './components/CitySelectorModal';
import { AboutModal } from './components/AboutModal';
import { ContactModal } from './components/ContactModal';
import { AuthModal } from './components/AuthModal';
import { InstallShortcutModal } from './components/InstallShortcutModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminPanel } from './components/AdminPanel';
import { ValueFooter } from './components/ValueFooter';
import { MobileNav } from './components/MobileNav';
import { useAuth } from './context/AuthContext';
import { fetchShopsFromDb, seedInitialShopsIfEmpty, calculateHaversineDistance } from './services/shopService';
import { seedCategoriesIfEmpty } from './services/categoryService';
import { PlatformAd } from './types';
import { PAKISTAN_REGIONS } from './data/pakistanRegions';

export default function App() {
  const { currentUser, userProfile, isAdmin, toggleFavorite: authToggleFavorite } = useAuth();

  // Shops State loaded from Cloud Firestore
  const [shops, setShops] = useState<Shop[]>(INITIAL_SHOPS);
  const [loadingShops, setLoadingShops] = useState(true);

  // User profile state (no hardcoded person or names)
  const [user, setUser] = useState<UserProfile>(() => {
    return {
      id: '',
      name: 'Guest Member',
      email: '',
      phone: '',
      role: 'user',
      points: 0,
      referralCode: 'ASSPAS-MEMBER',
      referredCount: 0,
      hasReferralPrivileges: false,
      isLoggedIn: false,
      favorites: [],
    };
  });

  // Sync userProfile from Firebase AuthContext when available
  useEffect(() => {
    if (userProfile) {
      setUser(userProfile);
    } else {
      setUser({
        id: '',
        name: 'Guest Member',
        email: '',
        phone: '',
        role: 'user',
        points: 0,
        referralCode: 'ASSPAS-MEMBER',
        referredCount: 0,
        hasReferralPrivileges: false,
        isLoggedIn: false,
        favorites: [],
      });
    }
  }, [userProfile]);

  // Load shops from Cloud Firestore
  const loadShops = async () => {
    try {
      setLoadingShops(true);
      const dbShops = await fetchShopsFromDb();
      setShops(dbShops);
      if (dbShops.length > 0) {
        setSelectedShop(dbShops[0]);
      }
    } catch (err) {
      console.warn('Failed to fetch from Firestore:', err);
    } finally {
      setLoadingShops(false);
    }
  };

  useEffect(() => {
    loadShops();
    seedInitialShopsIfEmpty();
    seedCategoriesIfEmpty();
  }, []);

  // Active City
  const [activeCity, setActiveCity] = useState<string>('Peshawar');

  // Navigation tab
  const [activeTab, setActiveTab] = useState<MainNavTab>('home');

  // URL routing for /admin, #admin, and #/admin
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (
      path === '/admin' || 
      path.startsWith('/admin') || 
      hash === '#admin' || 
      hash === '#/admin' || 
      search.includes('page=admin') ||
      search.includes('admin')
    ) {
      setActiveTab('admin');
    }
  }, []);

  // Direct Shop deep-linking (?shop=ID or /?shop=ID)
  useEffect(() => {
    if (shops.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const targetShopId = params.get('shop');
      if (targetShopId) {
        const found = shops.find((s) => s.id === targetShopId);
        if (found) {
          setSelectedShop(found);
          setDetailShop(found);
        }
      }
    }
  }, [shops]);

  // Referral link deep-linking (?ref=XYZ or /?ref=XYZ or #/?ref=XYZ)
  const [activeReferralNotice, setActiveReferralNotice] = useState<string | null>(null);

  useEffect(() => {
    let refParam: string | null = null;

    // 1. Check window.location.search (?ref=...)
    if (typeof window !== 'undefined' && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      refParam = searchParams.get('ref');
    }

    // 2. Check window.location.hash if not found in search (#/?ref=...)
    if (!refParam && typeof window !== 'undefined' && window.location.hash) {
      const hashParts = window.location.hash.split('?');
      if (hashParts[1]) {
        const hashParams = new URLSearchParams(hashParts[1]);
        refParam = hashParams.get('ref');
      }
    }

    if (refParam) {
      const cleanRef = refParam.trim();
      localStorage.setItem('asspas_referred_by', cleanRef);
      sessionStorage.setItem('asspas_referred_by', cleanRef);
      setActiveReferralNotice('🎉 Referral Link Active: You were invited by a community member! Register to claim 50 Free Welcome Points.');
    }
  }, []);

  // Sync route state with hash when changing tabs
  const handleSelectTab = (tab: MainNavTab) => {
    setActiveTab(tab);
    if (tab === 'admin') {
      window.history.replaceState(null, '', '#admin');
    } else if (window.location.hash === '#admin' || window.location.hash === '#/admin') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('All Categories');
  const [selectedShopType, setSelectedShopType] = useState<ShopType>('All Shops');
  const [selectedArea, setSelectedArea] = useState<string>('All Areas');
  const [minRating, setMinRating] = useState<number>(0);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [onlyElegancia, setOnlyElegancia] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'nearest' | 'alphabetical' | 'rating' | 'reviews'>('nearest');

  // Compute unique areas/markets for the active city
  const availableAreas = useMemo(() => {
    const cityShops = shops.filter((s) => s.city.toLowerCase() === activeCity.toLowerCase());
    const areaSet = new Set<string>();
    cityShops.forEach((s) => {
      if (s.area) areaSet.add(s.area.trim());
    });
    // Also include popular areas from PAKISTAN_REGIONS
    const regCity = PAKISTAN_REGIONS.flatMap((p) => p.cities).find(
      (c) => c.name.toLowerCase() === activeCity.toLowerCase()
    );
    if (regCity?.popularAreas) {
      regCity.popularAreas.forEach((a) => areaSet.add(a.trim()));
    }
    return ['All Areas', ...Array.from(areaSet).filter(Boolean).sort()];
  }, [shops, activeCity]);

  // Selection & Modal States
  const [selectedShop, setSelectedShop] = useState<Shop | null>(INITIAL_SHOPS[0]);
  const [detailShop, setDetailShop] = useState<Shop | null>(null);
  const [activeChatShop, setActiveChatShop] = useState<Shop | null>(null);
  const [isAddShopOpen, setIsAddShopOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isEleganciaModalOpen, setIsEleganciaModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [isLocating, setIsLocating] = useState(false);

  // Listen for native PWA installation event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleTriggerNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstallModalOpen(false);
      }
      setDeferredPrompt(null);
    } else {
      // Direct instruction popup
      alert('To add asspas.store desktop shortcut: In Chrome/Edge click URL bar install icon (⊕) or Menu (⋮) -> "Install App / Create Shortcut".');
    }
  };

  // Platform Ads Showcase
  const [platformAds, setPlatformAds] = useState<PlatformAd[]>([
    {
      id: 'ad-elegancia-featured',
      title: 'Elegancia Mineral Water · Certified Pure Hydration',
      description: 'Official premium water supply partner for homes, businesses, and restaurants across Peshawar.',
      mediaUrl: '/src/assets/images/product_elegancia_water_1793110437317.jpg',
      mediaType: 'image',
      targetCity: 'Peshawar',
      whatsappNumber: '03085599766',
      isActive: true,
    }
  ]);

  // Authentication gate for adding shop
  const handleOpenAddShop = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setIsAddShopOpen(true);
  };

  // Handle GPS detection
  const handleDetectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setActiveCity('Peshawar');
          setRadiusKm(2);

          const uLat = pos.coords.latitude;
          const uLng = pos.coords.longitude;
          setShops((prev) =>
            prev.map((s) => ({
              ...s,
              distance: calculateHaversineDistance(uLat, uLng, s.coords.lat, s.coords.lng),
            }))
          );
        },
        () => {
          setIsLocating(false);
          setActiveCity('Peshawar');
        },
        { timeout: 4000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (shopId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    authToggleFavorite(shopId);
    setUser((prev) => {
      const exists = prev.favorites.includes(shopId);
      const newFavorites = exists
        ? prev.favorites.filter((id) => id !== shopId)
        : [...prev.favorites, shopId];
      return { ...prev, favorites: newFavorites };
    });
  };

  // Add Points
  const handleAddPoints = (amount: number, reason: string) => {
    setUser((prev) => {
      const nextPoints = Math.max(0, prev.points + amount);
      const nextCount = amount > 0 && reason.includes('referral') ? prev.referredCount + 1 : prev.referredCount;
      return {
        ...prev,
        points: nextPoints,
        referredCount: nextCount,
      };
    });
  };

  // Add New Shop
  const handleAddNewShop = (newShop: Shop) => {
    setShops((prev) => [newShop, ...prev]);
    setSelectedShop(newShop);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
  };

  // Update shop state (e.g. from follow action)
  const handleShopUpdated = (updatedShop: Shop) => {
    setShops((prev) => prev.map((s) => (s.id === updatedShop.id ? updatedShop : s)));
    if (selectedShop?.id === updatedShop.id) {
      setSelectedShop(updatedShop);
    }
    if (detailShop?.id === updatedShop.id) {
      setDetailShop(updatedShop);
    }
  };

  // Add Review
  const handleAddReview = (
    shopId: string,
    review: { userName: string; rating: number; comment: string }
  ) => {
    setShops((prev) =>
      prev.map((s) => {
        if (s.id !== shopId) return s;
        const newReview = {
          id: `rev-${Date.now()}`,
          ...review,
          date: 'Just now',
        };
        const currentReviews = s.reviews || [];
        const updatedReviews = [newReview, ...currentReviews];
        const newRating = +(
          (s.rating * s.reviewsCount + review.rating) /
          (s.reviewsCount + 1)
        ).toFixed(1);
        return {
          ...s,
          rating: newRating,
          reviewsCount: s.reviewsCount + 1,
          reviews: updatedReviews,
        };
      })
    );
  };

  // Filtered and Sorted Shops for Explorer
  const filteredShops = useMemo(() => {
    return shops
      .filter((shop) => {
        if (activeTab === 'favorites' && !user.favorites.includes(shop.id)) {
          return false;
        }

        // City filter
        if (activeCity && shop.city.toLowerCase() !== activeCity.toLowerCase()) {
          if (shops.filter((s) => s.city.toLowerCase() === activeCity.toLowerCase()).length > 0) {
            return false;
          }
        }

        // Special Elegancia Water filter
        if (onlyElegancia && !shop.hasEleganciaWater) return false;

        // Category filter
        if (
          selectedCategory !== 'All Categories' &&
          shop.category !== selectedCategory
        ) {
          return false;
        }

        // Shop type filter
        if (selectedShopType !== 'All Shops' && shop.shopType !== selectedShopType) {
          return false;
        }

        // Area / Bazaar filter
        if (selectedArea !== 'All Areas') {
          const areaLower = selectedArea.toLowerCase();
          const matchArea =
            (shop.area && shop.area.toLowerCase().includes(areaLower)) ||
            (shop.address && shop.address.toLowerCase().includes(areaLower));
          if (!matchArea) return false;
        }

        // Min rating filter
        if (minRating > 0 && shop.rating < minRating) return false;

        // Distance / Radius filter
        if (radiusKm !== null && shop.distance > radiusKm) return false;

        // Search Query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = shop.name.toLowerCase().includes(q);
          const matchCategory = shop.category.toLowerCase().includes(q);
          const matchArea = shop.area.toLowerCase().includes(q);
          const matchTags = shop.tags.some((t) => t.toLowerCase().includes(q));
          const matchWater =
            shop.hasEleganciaWater &&
            (q.includes('water') || q.includes('elegancia') || q.includes('bottle') || q.includes('mineral'));
          const matchType = shop.itemType && shop.itemType.toLowerCase().includes(q);
          if (!matchName && !matchCategory && !matchArea && !matchTags && !matchWater && !matchType) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'reviews') return b.reviewsCount - a.reviewsCount;
        return a.distance - b.distance;
      });
  }, [
    shops,
    activeTab,
    user.favorites,
    activeCity,
    selectedArea,
    onlyElegancia,
    selectedCategory,
    selectedShopType,
    minRating,
    radiusKm,
    searchQuery,
    sortBy,
  ]);

  // Elegancia mineral water stockists
  const eleganciaStockists = useMemo(() => {
    return shops.filter((s) => s.hasEleganciaWater);
  }, [shops]);

  const handleResetFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedShopType('All Shops');
    setSelectedArea('All Areas');
    setMinRating(0);
    setRadiusKm(null);
    setOnlyElegancia(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-emerald-500 selection:text-white font-sans text-xs w-full max-w-full overflow-x-hidden">
      {/* Active Referral Welcome Banner */}
      {activeReferralNotice && (
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between shadow-md z-40 border-b border-emerald-500/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{activeReferralNotice}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-2.5 py-1 bg-white text-emerald-900 rounded-lg font-bold text-[11px] hover:bg-emerald-50 cursor-pointer shadow-xs transition-colors shrink-0"
            >
              Sign In / Claim 50 PTS
            </button>
            <button
              onClick={() => setActiveReferralNotice(null)}
              className="text-white/80 hover:text-white text-xs px-1 cursor-pointer"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        activeCity={activeCity}
        onOpenCityModal={() => setIsCityModalOpen(true)}
        user={user}
        favoritesCount={user.favorites.length}
        onOpenReferralModal={() => setIsReferralOpen(true)}
        onOpenAddShopModal={handleOpenAddShop}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenAboutModal={() => setIsAboutOpen(true)}
        onOpenContactModal={() => setIsContactOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* View: Admin Panel */}
      {activeTab === 'admin' && (
        <AdminPanel
          shops={shops}
          onRefreshShops={loadShops}
          onClose={() => handleSelectTab('home')}
          onOpenAddShop={handleOpenAddShop}
        />
      )}

      {/* Main Home Content */}
      {activeTab === 'home' && (
        <div className="w-full">
          {/* Hero Section */}
          <HeroSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeCity={activeCity}
            onOpenCityModal={() => setIsCityModalOpen(true)}
            onDetectLocation={handleDetectLocation}
            isLocating={isLocating}
            onSelectQuickTag={(tag) => setSearchQuery(tag)}
            onOpenEleganciaView={() => handleSelectTab('elegancia')}
            totalStoresCount={shops.length}
          />

          {/* Promotion Slider Banner */}
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-4 pb-2">
            <AppSlider
              onOpenElegancia={() => setIsEleganciaModalOpen(true)}
              onOpenRewards={() => handleSelectTab('rewards')}
              onExploreSports={() => {
                setSelectedCategory('Sports & Toys');
              }}
              onOpenAddShop={handleOpenAddShop}
            />
          </div>

          {/* Category Bar (Spans full width with inner max-w-7xl) */}
          <div className="w-full my-1">
            <CategoryBar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              filterOnlyElegancia={onlyElegancia}
              onToggleEleganciaFilter={() => setOnlyElegancia(!onlyElegancia)}
            />
          </div>

          {/* Featured Ads & Top Products / Shops Showcase (Item 9) */}
          <HomepageGallery
            ads={platformAds}
            shops={shops}
            activeCity={activeCity}
            onSelectShop={(sId) => {
              const found = shops.find((s) => s.id === sId);
              if (found) {
                setSelectedShop(found);
                setDetailShop(found);
              }
            }}
            onOpenChat={(phone, title) => {
              const matchedShop = shops.find((s) => s.phone.includes(phone) || (s.orderPhone && s.orderPhone.includes(phone))) || shops[0];
              setActiveChatShop(matchedShop);
            }}
          />

          {/* Active Filter Pill Summary */}
          {(selectedCategory !== 'All Categories' ||
            selectedShopType !== 'All Shops' ||
            selectedArea !== 'All Areas' ||
            minRating > 0 ||
            radiusKm !== null ||
            onlyElegancia ||
            searchQuery) && (
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-3">
              <div className="flex items-center justify-between gap-1.5 flex-wrap text-[11px] bg-emerald-50/70 border border-emerald-100 rounded-lg p-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-emerald-950">Active Filters:</span>
                  {selectedCategory !== 'All Categories' && (
                    <span className="bg-white border border-emerald-200 px-2 py-0.5 rounded text-emerald-800 font-medium">
                      {selectedCategory}
                    </span>
                  )}
                  {selectedShopType !== 'All Shops' && (
                    <span className="bg-white border border-emerald-200 px-2 py-0.5 rounded text-emerald-800 font-medium">
                      {selectedShopType}
                    </span>
                  )}
                  {selectedArea !== 'All Areas' && (
                    <span className="bg-white border border-emerald-200 px-2 py-0.5 rounded text-emerald-800 font-medium">
                      Area: {selectedArea}
                    </span>
                  )}
                  {minRating > 0 && (
                    <span className="bg-white border border-emerald-200 px-2 py-0.5 rounded text-emerald-800 font-medium">
                      ★ {minRating}+
                    </span>
                  )}
                  {radiusKm !== null && (
                    <span className="bg-white border border-emerald-200 px-2 py-0.5 rounded text-emerald-800 font-medium">
                      Within {radiusKm} km
                    </span>
                  )}
                  {onlyElegancia && (
                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      <Droplet className="w-3 h-3" /> Elegancia Stockists
                    </span>
                  )}
                  {searchQuery && (
                    <span className="bg-white border border-emerald-200 px-2 py-0.5 rounded text-emerald-800 font-medium">
                      "{searchQuery}"
                    </span>
                  )}
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer text-[10px]"
                >
                  Reset All
                </button>
              </div>
            </div>
          )}

          {/* 1. Dedicated 100% Full-Width Google Maps Section (Compact Height) */}
          <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 my-5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-slate-900 text-xs sm:text-sm font-['Outfit']">
                  Interactive Map Explorer · {activeCity}
                </h2>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {filteredShops.length} stores mapped
              </span>
            </div>

            <InteractiveMap
              shops={filteredShops}
              selectedShop={selectedShop}
              onSelectShop={setSelectedShop}
              onOpenDetails={setDetailShop}
              radiusKm={radiusKm}
              activeCity={activeCity}
              favorites={user.favorites}
              onToggleFavorite={(id, e) => handleToggleFavorite(id, e)}
            />
          </section>

          {/* 2. Main Marketplace Catalog Section (Expansive Grid Layout) */}
          <main id="shops-list-section" className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-16 flex-1">
            {/* Mobile Filter Toggle Bar */}
            <div className="flex lg:hidden items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 mb-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Nearby Businesses ({filteredShops.length})</span>
              </div>
              <button
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-emerald-700" />
                <span>Filters</span>
              </button>
            </div>

            {/* Mobile Filter Drawer */}
            {isMobileFiltersOpen && (
              <div className="lg:hidden mb-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-md animate-in slide-in-from-top-2">
                <FilterSidebar
                  category={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  shopType={selectedShopType}
                  onShopTypeChange={setSelectedShopType}
                  minRating={minRating}
                  onMinRatingChange={setMinRating}
                  distanceKm={radiusKm}
                  onDistanceKmChange={setRadiusKm}
                  onlyElegancia={onlyElegancia}
                  onToggleOnlyElegancia={setOnlyElegancia}
                  onResetFilters={handleResetFilters}
                  totalMatches={filteredShops.length}
                />
              </div>
            )}

            {/* Split 3-Column Layout: Filter Sidebar (Left) + Catalog Grid (Middle) + Locations/Bazaars Sidebar (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
              {/* Left Column: Filter Sidebar (Desktop) */}
              <div className="hidden lg:block lg:col-span-3 sticky top-20">
                <FilterSidebar
                  category={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  shopType={selectedShopType}
                  onShopTypeChange={setSelectedShopType}
                  minRating={minRating}
                  onMinRatingChange={setMinRating}
                  distanceKm={radiusKm}
                  onDistanceKmChange={setRadiusKm}
                  onlyElegancia={onlyElegancia}
                  onToggleOnlyElegancia={setOnlyElegancia}
                  onResetFilters={handleResetFilters}
                  totalMatches={filteredShops.length}
                />
              </div>

              {/* Middle Column: Marketplace Catalog Grid (Spans 6 columns on desktop) */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                {/* Catalog Header Bar */}
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200/90 shadow-2xs flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-xs sm:text-sm font-['Outfit']">
                      Local Businesses & Stores
                    </span>
                    <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
                      {filteredShops.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[11px] hidden sm:inline">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 outline-none font-semibold cursor-pointer"
                    >
                      <option value="nearest">Nearest First</option>
                      <option value="alphabetical">Alphabetical (A - Z)</option>
                      <option value="rating">Top Rated</option>
                      <option value="reviews">Most Reviews</option>
                    </select>
                  </div>
                </div>

                {/* Multi-column Shops Catalog Grid */}
                {filteredShops.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredShops.map((shop) => (
                      <ShopCard
                        key={shop.id}
                        shop={shop}
                        isSelected={selectedShop?.id === shop.id}
                        onSelect={() => setSelectedShop(shop)}
                        onOpenDetails={() => setDetailShop(shop)}
                        isFavorite={user.favorites.includes(shop.id)}
                        onToggleFavorite={(e) => handleToggleFavorite(shop.id, e)}
                        onOpenInAppChat={(s) => setActiveChatShop(s)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      No shops found matching filters
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Try expanding your radius distance or clearing filters to discover more local stores.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Markets & Commercial Hubs Directory Sidebar (Desktop) */}
              <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 sticky top-20">
                {/* 1. Markets & Bazaars in City */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900 text-xs font-['Outfit']">
                        Markets in {activeCity}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsCityModalOpen(true)}
                      className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Change City
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto pr-1">
                    {availableAreas.map((areaName) => {
                      const count = areaName === 'All Areas'
                        ? shops.filter(s => s.city.toLowerCase() === activeCity.toLowerCase()).length
                        : shops.filter(s => s.city.toLowerCase() === activeCity.toLowerCase() && (s.area?.toLowerCase() === areaName.toLowerCase() || s.address?.toLowerCase().includes(areaName.toLowerCase()))).length;
                      const isSelected = selectedArea === areaName;

                      return (
                        <button
                          key={areaName}
                          onClick={() => setSelectedArea(areaName)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold shadow-xs'
                              : 'bg-slate-50 hover:bg-emerald-50/70 text-slate-700'
                          }`}
                        >
                          <span className="truncate">{areaName}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ml-1.5 ${
                            isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200/80 text-slate-600'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Elegancia Water Official Hub Card */}
                <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950 text-white rounded-2xl p-4 shadow-xs space-y-2.5 border border-emerald-700">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      <Droplet className="w-4 h-4 fill-emerald-300 text-emerald-300" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">Elegancia Mineral Water</div>
                      <div className="text-[10px] text-emerald-200/80">Certified Pure Hydration</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                    Order 19L cans, 1.5L family bottles & 500ml packs from verified stockists across {activeCity}.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setOnlyElegancia(!onlyElegancia)}
                      className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold text-center cursor-pointer transition-all ${
                        onlyElegancia ? 'bg-white text-emerald-950 shadow-sm' : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {onlyElegancia ? '✓ Showing Stockists' : 'Filter Water Stores'}
                    </button>
                    <button
                      onClick={() => handleSelectTab('elegancia')}
                      className="px-2.5 py-1.5 bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 rounded-xl text-[11px] font-bold border border-emerald-500/30 cursor-pointer"
                    >
                      Portal →
                    </button>
                  </div>
                </div>

                {/* 3. Register Business Free Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2 text-center">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Own a Shop in {activeCity}?</div>
                  <p className="text-[11px] text-slate-500">
                    Add your business in 2 minutes. Get direct customer orders on WhatsApp & earn +100 PTS!
                  </p>
                  <button
                    onClick={handleOpenAddShop}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    + Register Free (+100 PTS)
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* View: All Shops Directory */}
      {activeTab === 'shops' && (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 flex-1">
          <AllShopsDirectoryView
            shops={shops}
            onSelectShop={(s) => setSelectedShop(s)}
            onOpenDetails={(s) => setDetailShop(s)}
            activeCity={activeCity}
            onOpenCityModal={() => setIsCityModalOpen(true)}
            onOpenAddShop={handleOpenAddShop}
          />
        </div>
      )}

      {/* View: Categories Taxonomies */}
      {activeTab === 'categories' && (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 flex-1">
          <CategoriesView
            shops={shops}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              handleSelectTab('home');
            }}
            onSelectShop={(s) => {
              setSelectedShop(s);
              setDetailShop(s);
            }}
            onFilterElegancia={() => {
              setOnlyElegancia(true);
              handleSelectTab('home');
            }}
          />
        </div>
      )}

      {/* View: Elegancia Mineral Water Dedicated Hub */}
      {activeTab === 'elegancia' && (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 flex-1">
          <EleganciaPortalView
            stockistShops={eleganciaStockists}
            onSelectShop={(s) => {
              setSelectedShop(s);
              setDetailShop(s);
            }}
            onOpenAddShop={handleOpenAddShop}
          />
        </div>
      )}

      {/* View: Rewards & Loyalty Club */}
      {activeTab === 'rewards' && (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 flex-1">
          <RewardsClubView
            user={user}
            onAddPoints={handleAddPoints}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        </div>
      )}

      {/* View: Favorites */}
      {activeTab === 'favorites' && (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 space-y-4 flex-1">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>Saved Favorite Businesses ({user.favorites.length})</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Instant access to your bookmarked local shops & services.
            </p>
          </div>

          {user.favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {shops
                .filter((s) => user.favorites.includes(s.id))
                .map((shop) => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    isSelected={selectedShop?.id === shop.id}
                    onSelect={() => setSelectedShop(shop)}
                    onOpenDetails={() => setDetailShop(shop)}
                    isFavorite={true}
                    onToggleFavorite={(e) => handleToggleFavorite(shop.id, e)}
                  />
                ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
              <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900 text-xs">
                No favorites saved yet
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click the heart icon on any store card to bookmark it here for quick access.
              </p>
              <button
                onClick={() => handleSelectTab('home')}
                className="mt-3 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                Explore Nearby Shops
              </button>
            </div>
          )}
        </div>
      )}

      {/* View: My Registered Businesses (Merchant Portal) */}
      {activeTab === 'my-shops' && (
        <div className="w-full flex-1">
          <MyStoresView
            shops={shops}
            onOpenAddShop={handleOpenAddShop}
            onSelectShop={(s) => setSelectedShop(s)}
            onOpenDetails={(s) => setDetailShop(s)}
            onShopUpdated={(updated) =>
              setShops((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
            }
          />
        </div>
      )}

      {/* View: User Profile (Member Portal & 3x3 Matrix) */}
      {activeTab === 'profile' && (
        <div className="w-full flex-1">
          <UserProfileView
            user={user}
            shops={shops}
            onOpenAddShop={handleOpenAddShop}
            onSelectShop={(s) => {
              setSelectedShop(s);
              handleSelectTab('shop-view');
            }}
            onOpenShopDetails={(s) => setDetailShop(s)}
            onBackToHome={() => handleSelectTab('home')}
          />
        </div>
      )}

      {/* View: Full Shop Profile Page (Item 6 & 8) */}
      {activeTab === 'shop-view' && selectedShop && (
        <div className="w-full flex-1">
          <FullShopProfileView
            shop={selectedShop}
            onBack={() => handleSelectTab('home')}
            isFavorite={user.favorites.includes(selectedShop.id)}
            onToggleFavorite={() => handleToggleFavorite(selectedShop.id)}
            onOpenInAppChat={(s, msg) => {
              setActiveChatShop(s);
            }}
            onEditShop={() => handleSelectTab('my-shops')}
          />
        </div>
      )}

      {/* Full Enterprise Footer */}
      <ValueFooter
        onSelectTab={handleSelectTab}
        onOpenAddShop={handleOpenAddShop}
        onOpenCityModal={() => setIsCityModalOpen(true)}
        onOpenAboutModal={() => setIsAboutOpen(true)}
        onOpenContactModal={() => setIsContactOpen(true)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        mobileView={mobileView}
        onToggleMobileView={() =>
          setMobileView(mobileView === 'list' ? 'map' : 'list')
        }
        onOpenAddShop={handleOpenAddShop}
        onOpenReferral={() => handleSelectTab('rewards')}
        user={user}
      />

      {/* Persistent Floating WhatsApp Action Button */}
      <FloatingWhatsApp phoneNumber="923085599766" />

      {/* Modals */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCity={activeCity}
        onSelectCity={(cityInfo: CityInfo) => {
          setActiveCity(cityInfo.name);
          setSelectedShop(null);
        }}
        onDetectLocation={handleDetectLocation}
        isLocating={isLocating}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenElegancia={() => handleSelectTab('elegancia')}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {detailShop && (
        <ShopDetailModal
          shop={detailShop}
          onClose={() => setDetailShop(null)}
          isFavorite={user.favorites.includes(detailShop.id)}
          onToggleFavorite={() => handleToggleFavorite(detailShop.id)}
          onAddReview={handleAddReview}
          onShopUpdated={handleShopUpdated}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenInAppChat={(s) => setActiveChatShop(s)}
          onOpenFullShop={(s) => {
            setSelectedShop(s);
            handleSelectTab('shop-view');
          }}
        />
      )}

      {/* In-App WhatsApp Live Messenger (Item 7) */}
      {activeChatShop && (
        <InAppWhatsAppChat
          shop={activeChatShop}
          isOpen={true}
          onClose={() => setActiveChatShop(null)}
          initialMessage={`Assalam-o-Alaikum ${activeChatShop.name}! I am inquiring about products on asspas.store.`}
        />
      )}

      <ErrorBoundary fallbackTitle="Register Business Window" onReset={() => setIsAddShopOpen(false)}>
        <AddShopModal
          isOpen={isAddShopOpen}
          onClose={() => setIsAddShopOpen(false)}
          onAddShop={handleAddNewShop}
          activeCity={activeCity}
          onOpenAuth={() => setIsAuthOpen(true)}
          onNavigateToMyStores={() => handleSelectTab('my-shops')}
        />
      </ErrorBoundary>

      <ReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        user={user}
        onAddPoints={handleAddPoints}
      />

      <EleganciaModal
        isOpen={isEleganciaModalOpen}
        onClose={() => setIsEleganciaModalOpen(false)}
        stockistShops={eleganciaStockists}
        onSelectShop={(shop) => {
          setSelectedShop(shop);
          setDetailShop(shop);
        }}
        onFilterElegancia={() => {
          setOnlyElegancia(true);
          handleSelectTab('home');
          const el = document.getElementById('shops-list-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onNavigateToAdmin={() => handleSelectTab('admin')}
        onNavigateToProfile={() => handleSelectTab('profile')}
      />

      {/* Install App & Desktop Shortcut Modal */}
      <InstallShortcutModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onTriggerInstall={handleTriggerNativeInstall}
        isInstallable={!!deferredPrompt}
      />
    </div>
  );
}

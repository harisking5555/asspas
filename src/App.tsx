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
  AlertCircle,
  Map as MapIcon,
  Sparkles,
  Package,
  ExternalLink,
  CheckCircle2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  Shop,
  ShopCategory,
  ShopType,
  UserProfile,
  MainNavTab,
  AdminSettings,
  CategoryItem,
  CatalogItem,
  PlatformAd,
} from './types';
import { INITIAL_SHOPS } from './data/mockShops';
import { CityInfo, getRegionsWithCustom } from './data/pakistanRegions';
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
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  fetchShopsFromDb,
  seedInitialShopsIfEmpty,
  calculateHaversineDistance,
  updateShopInfo,
} from './services/shopService';
import {
  DEFAULT_CATEGORIES,
  fetchCategoriesFromDb,
  seedCategoriesIfEmpty,
} from './services/categoryService';
import {
  DEFAULT_ADMIN_SETTINGS,
  fetchAdminSettings,
} from './services/adminService';

export default function App() {
  const {
    currentUser,
    userProfile,
    isAdmin,
    toggleFavorite: authToggleFavorite,
    toggleFavoriteProduct: authToggleFavoriteProduct,
  } = useAuth();
  const { canPromptNatively, promptInstall } = usePWAInstall();

  // Core Data States
  const [shops, setShops] = useState<Shop[]>(INITIAL_SHOPS);
  const [loadingShops, setLoadingShops] = useState(true);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  // User profile state synced from Firebase AuthContext
  const [user, setUser] = useState<UserProfile>(() => ({
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
    favoriteProducts: [],
  }));

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
        favoriteProducts: [],
      });
    }
  }, [userProfile]);

  // Load shops, categories, and adminSettings from Firestore on mount
  const loadShops = async () => {
    try {
      setLoadingShops(true);
      const dbShops = await fetchShopsFromDb();
      setShops(dbShops);
      if (dbShops.length > 0) {
        setSelectedShop((prev) => prev || dbShops[0]);
      }
    } catch (err) {
      console.warn('Failed to fetch shops from Firestore:', err);
    } finally {
      setLoadingShops(false);
    }
  };

  useEffect(() => {
    loadShops();
    seedInitialShopsIfEmpty();
    seedCategoriesIfEmpty();

    fetchCategoriesFromDb()
      .then((cats) => {
        if (cats.length > 0) setCategories(cats);
      })
      .catch(() => {});

    fetchAdminSettings()
      .then((settings) => {
        setAdminSettings(settings);
      })
      .catch(() => {});
  }, []);

  // Toast Notification state (non-blocking UI banner instead of window.alert)
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => {
      setToastNotice((prev) => (prev === msg ? null : prev));
    }, 5000);
  };

  // Location, Province & City Filter States
  const [selectedProvince, setSelectedProvince] = useState<string>('All Provinces');
  const [activeCity, setActiveCity] = useState<string>('Peshawar');
  const [activeTab, setActiveTab] = useState<MainNavTab>('home');

  // Dynamic Regions merged with admin customizations
  const regions = useMemo(
    () => getRegionsWithCustom(adminSettings.customRegions),
    [adminSettings.customRegions]
  );

  const provinceNames = useMemo(
    () => ['All Provinces', ...regions.map((r) => r.name)],
    [regions]
  );

  const cityNamesForProvince = useMemo(() => {
    const cityList =
      selectedProvince === 'All Provinces'
        ? regions.flatMap((r) => r.cities)
        : regions.find((r) => r.name === selectedProvince)?.cities || [];
    const unique = Array.from(new Set(cityList.map((c) => c.name))).sort((a, b) =>
      a.localeCompare(b)
    );
    return ['All Cities', ...unique];
  }, [regions, selectedProvince]);

  const availableCategoryNames = useMemo(() => {
    const names = new Set<string>(categories.map((c) => c.name));
    shops.forEach((s) => {
      if (s.category) names.add(s.category);
    });
    return ['All Categories', ...Array.from(names).sort((a, b) => a.localeCompare(b))];
  }, [categories, shops]);

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

  // Direct Shop deep-linking (?shop=ID or /shop/ID) -> opens FullShopProfileView cleanly
  useEffect(() => {
    if (shops.length > 0) {
      const params = new URLSearchParams(window.location.search);
      let targetShopId = params.get('shop');
      if (!targetShopId && window.location.pathname.startsWith('/shop/')) {
        targetShopId = window.location.pathname.replace('/shop/', '').split('/')[0] || null;
      }
      if (targetShopId) {
        const found = shops.find((s) => s.id === targetShopId);
        if (found) {
          setSelectedShop(found);
          setActiveTab('shop-view');
        }
      }
    }
  }, [shops]);

  // Referral link deep-linking (?ref=XYZ or #/?ref=XYZ)
  const [activeReferralNotice, setActiveReferralNotice] = useState<string | null>(null);

  useEffect(() => {
    let refParam: string | null = null;
    if (typeof window !== 'undefined' && window.location.search) {
      refParam = new URLSearchParams(window.location.search).get('ref');
    }
    if (!refParam && typeof window !== 'undefined' && window.location.hash) {
      const hashParts = window.location.hash.split('?');
      if (hashParts[1]) {
        refParam = new URLSearchParams(hashParts[1]).get('ref');
      }
    }

    if (refParam) {
      const cleanRef = refParam.trim();
      localStorage.setItem('asspas_referred_by', cleanRef);
      sessionStorage.setItem('asspas_referred_by', cleanRef);
      setActiveReferralNotice(
        `Referral Link Active (${cleanRef}): Register or log in to join the 3x3 Matrix & claim +50 PTS!`
      );
    }
  }, []);

  const handleSelectTab = (tab: MainNavTab) => {
    setActiveTab(tab);
    if (tab === 'admin') {
      window.history.replaceState(null, '', '#admin');
    } else if (window.location.hash === '#admin' || window.location.hash === '#/admin') {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | string>('All Categories');
  const [selectedShopType, setSelectedShopType] = useState<ShopType>('All Shops');
  const [selectedArea, setSelectedArea] = useState<string>('All Areas');
  const [minRating, setMinRating] = useState<number>(0);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [onlyElegancia, setOnlyElegancia] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'nearest' | 'alphabetical' | 'rating' | 'reviews'>('nearest');

  // Unique areas/markets for active city (or across regions when All Cities)
  const availableAreas = useMemo(() => {
    const cityShops =
      activeCity === 'All Cities'
        ? shops
        : shops.filter((s) => s.city.toLowerCase() === activeCity.toLowerCase());
    const areaSet = new Set<string>();
    cityShops.forEach((s) => {
      if (s.area) areaSet.add(s.area.trim());
      if (s.marketOrBazar) areaSet.add(s.marketOrBazar.trim());
    });
    if (activeCity !== 'All Cities') {
      const regCity = regions
        .flatMap((p) => p.cities)
        .find((c) => c.name.toLowerCase() === activeCity.toLowerCase());
      if (regCity?.popularAreas) {
        regCity.popularAreas.forEach((a) => areaSet.add(a.trim()));
      }
    }
    return ['All Areas', ...Array.from(areaSet).filter(Boolean).sort((a, b) => a.localeCompare(b))];
  }, [shops, activeCity, regions]);

  // Selection, Map & Modal States
  const [selectedShop, setSelectedShop] = useState<Shop | null>(INITIAL_SHOPS[0]);
  const [detailShop, setDetailShop] = useState<Shop | null>(null);
  const [activeChatShop, setActiveChatShop] = useState<Shop | null>(null);
  const [isAddShopOpen, setIsAddShopOpen] = useState(false);
  const [defaultEleganciaModal, setDefaultEleganciaModal] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isEleganciaModalOpen, setIsEleganciaModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [isLocating, setIsLocating] = useState(false);

  const handleTriggerNativeInstall = async () => {
    if (canPromptNatively) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        setIsInstallModalOpen(false);
        showToast('asspas.store App shortcut installed!');
        return;
      }
    }
    showToast(
      'To install shortcut: Open browser menu (⋮) -> "Install App" or "Add to Home Screen / Desktop".'
    );
  };

  // Fallback Platform Ads Showcase
  const fallbackAds: PlatformAd[] = [
    {
      id: 'ad-elegancia-featured',
      title: 'Elegancia Mineral Water · Certified Pure Hydration',
      description:
        'Official premium water supply partner for homes, businesses, and restaurants across Pakistan.',
      mediaUrl: '/images/product_elegancia_water_1793110437317.jpg',
      mediaType: 'image',
      targetCity: 'All',
      whatsappNumber: '03085599766',
      isActive: true,
    },
  ];

  // Navigate to Full Shop Profile Page and increment viewsCount
  const handleOpenFullShop = (shop: Shop) => {
    setSelectedShop(shop);
    setDetailShop(null);
    handleSelectTab('shop-view');
    const nextViews = (shop.viewsCount || 0) + 1;
    setShops((prev) => prev.map((s) => (s.id === shop.id ? { ...s, viewsCount: nextViews } : s)));
    updateShopInfo(shop.id, { viewsCount: nextViews }).catch(() => {});
  };

  // Auth gate for adding shop
  const handleOpenAddShop = (eleganciaDefault: boolean = false) => {
    setDefaultEleganciaModal(eleganciaDefault);
    if (!currentUser) {
      setIsAuthOpen(true);
      showToast('Please sign in or create an account to register your shop.');
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
          setRadiusKm(10);
          const uLat = pos.coords.latitude;
          const uLng = pos.coords.longitude;
          setShops((prev) =>
            prev.map((s) => ({
              ...s,
              distance: calculateHaversineDistance(uLat, uLng, s.coords.lat, s.coords.lng),
            }))
          );
          showToast('GPS location detected — showing nearest stores sorted by distance.');
        },
        () => {
          setIsLocating(false);
          showToast('Could not detect GPS coordinates automatically. Select your city manually.');
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Toggle Favorite Shop
  const handleToggleFavorite = (shopId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    authToggleFavorite(shopId);
  };

  // Toggle Favorite Product
  const handleToggleFavoriteProduct = (productId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    authToggleFavoriteProduct(productId);
  };

  // Add Points (UI optimistic sync)
  const handleAddPoints = (amount: number, reason: string) => {
    setUser((prev) => {
      const nextPoints = Math.max(0, prev.points + amount);
      const nextCount =
        amount > 0 && reason.includes('referral') ? prev.referredCount + 1 : prev.referredCount;
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

  // Update shop state
  const handleShopUpdated = (updatedShop: Shop) => {
    setShops((prev) => prev.map((s) => (s.id === updatedShop.id ? updatedShop : s)));
    if (selectedShop?.id === updatedShop.id) setSelectedShop(updatedShop);
    if (detailShop?.id === updatedShop.id) setDetailShop(updatedShop);
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

  // Publicly visible shops (respecting status moderation)
  const visibleShops = useMemo(() => {
    return shops.filter((shop) => {
      if (shop.status === 'suspended' && !isAdmin && shop.ownerId !== currentUser?.uid) {
        return false;
      }
      if (shop.status === 'pending' && !isAdmin && shop.ownerId !== currentUser?.uid) {
        return false;
      }
      return true;
    });
  }, [shops, isAdmin, currentUser]);

  // Filtered and Sorted Shops for Explorer (strict city/province + word-by-word multi-field search)
  const filteredShops = useMemo(() => {
    return visibleShops
      .filter((shop) => {
        if (activeTab === 'favorites' && !user.favorites.includes(shop.id)) {
          return false;
        }

        // Province filter
        if (selectedProvince !== 'All Provinces') {
          const shopProv = (shop.province || '').toLowerCase();
          if (!shopProv.includes(selectedProvince.split('(')[0].trim().toLowerCase())) {
            return false;
          }
        }

        // Strict City filter (no silent fallback to other cities)
        if (activeCity && activeCity !== 'All Cities') {
          if (shop.city.toLowerCase() !== activeCity.toLowerCase()) {
            return false;
          }
        }

        // Special Elegancia Water filter
        if (onlyElegancia && !shop.hasEleganciaWater) return false;

        // Category filter
        if (selectedCategory !== 'All Categories' && shop.category !== selectedCategory) {
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
            (shop.marketOrBazar && shop.marketOrBazar.toLowerCase().includes(areaLower)) ||
            (shop.address && shop.address.toLowerCase().includes(areaLower));
          if (!matchArea) return false;
        }

        // Min rating filter
        if (minRating > 0 && shop.rating < minRating) return false;

        // Distance / Radius filter
        if (radiusKm !== null && shop.distance > radiusKm) return false;

        // Word-by-word multi-field search query
        if (searchQuery.trim()) {
          const words = searchQuery
            .toLowerCase()
            .trim()
            .split(/\s+/)
            .filter(Boolean);
          const haystack = [
            shop.name,
            shop.category,
            shop.subCategory,
            shop.shopType,
            shop.businessNature,
            shop.itemType,
            shop.area,
            shop.city,
            shop.province,
            shop.unionCouncil,
            shop.marketOrBazar,
            shop.streetOrPlaza,
            shop.address,
            shop.openAddress,
            shop.description,
            ...(shop.tags || []),
            ...(shop.catalog || []).map((c) => `${c.name} ${c.description || ''}`),
            shop.hasEleganciaWater ? 'elegancia mineral water bottle 19l dispenser' : '',
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          if (!words.every((w) => haystack.includes(w))) {
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
    visibleShops,
    activeTab,
    user.favorites,
    selectedProvince,
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
  const eleganciaStockists = useMemo(
    () => visibleShops.filter((s) => s.hasEleganciaWater),
    [visibleShops]
  );

  // Favorite Products list resolved against shop catalogs
  const favoriteProductEntries = useMemo(() => {
    const favProductIds = user.favoriteProducts || [];
    if (favProductIds.length === 0) return [];
    const results: { shop: Shop; item: CatalogItem }[] = [];
    visibleShops.forEach((shop) => {
      (shop.catalog || []).forEach((item) => {
        if (favProductIds.includes(item.id)) {
          results.push({ shop, item });
        }
      });
    });
    return results;
  }, [visibleShops, user.favoriteProducts]);

  const totalFavoritesCount =
    (user.favorites?.length || 0) + (user.favoriteProducts?.length || 0);

  const handleResetFilters = () => {
    setSelectedProvince('All Provinces');
    setSelectedCategory('All Categories');
    setSelectedShopType('All Shops');
    setSelectedArea('All Areas');
    setMinRating(0);
    setRadiusKm(null);
    setOnlyElegancia(false);
    setSearchQuery('');
  };

  const handleProvinceChange = (prov: string) => {
    setSelectedProvince(prov);
    setSelectedArea('All Areas');
    if (prov !== 'All Provinces') {
      const provObj = regions.find((r) => r.name === prov);
      if (provObj && !provObj.cities.some((c) => c.name === activeCity)) {
        setActiveCity('All Cities');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-emerald-500 selection:text-white font-sans text-xs w-full max-w-full overflow-x-hidden">
      {/* Non-blocking System Toast Notification */}
      {toastNotice && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="text-xs leading-relaxed flex-1">{toastNotice}</span>
          <button
            onClick={() => setToastNotice(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
        favoritesCount={totalFavoritesCount}
        onOpenReferralModal={() => setIsReferralOpen(true)}
        onOpenAddShopModal={() => handleOpenAddShop(false)}
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
          onOpenAddShop={() => handleOpenAddShop(false)}
          onSettingsUpdated={(updated) => setAdminSettings(updated)}
          onCategoriesUpdated={(updatedCats) => setCategories(updatedCats)}
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
            totalStoresCount={visibleShops.length}
            heroImageUrl={adminSettings.heroMarketImage}
          />

          {/* Promotion Slider Banner */}
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-4 pb-2">
            <AppSlider
              onOpenElegancia={() => setIsEleganciaModalOpen(true)}
              onOpenRewards={() => handleSelectTab('rewards')}
              onExploreSports={() => {
                setSelectedCategory('Sports & Toys');
              }}
              onOpenAddShop={() => handleOpenAddShop(false)}
            />
          </div>

          {/* Category Bar */}
          <div className="w-full my-1">
            <CategoryBar
              selectedCategory={selectedCategory as ShopCategory}
              onSelectCategory={setSelectedCategory}
              filterOnlyElegancia={onlyElegancia}
              onToggleEleganciaFilter={() => setOnlyElegancia(!onlyElegancia)}
            />
          </div>

          {/* Featured Ads, Products & Top Shops Showcase */}
          <HomepageGallery
            ads={
              adminSettings.adsGallery && adminSettings.adsGallery.length > 0
                ? adminSettings.adsGallery
                : fallbackAds
            }
            shops={visibleShops}
            activeCity={activeCity}
            activeProvince={selectedProvince !== 'All Provinces' ? selectedProvince : ''}
            onSelectShop={(sId) => {
              const found = visibleShops.find((s) => s.id === sId);
              if (found) handleOpenFullShop(found);
            }}
            onOpenChat={(phone) => {
              const matchedShop =
                visibleShops.find(
                  (s) =>
                    s.phone.includes(phone) || (s.orderPhone && s.orderPhone.includes(phone))
                ) || visibleShops[0];
              if (matchedShop) setActiveChatShop(matchedShop);
            }}
            featuredBrandName={adminSettings.featuredBrandName}
            featuredBrandActive={adminSettings.featuredBrandActive}
            featuredProducts={adminSettings.featuredProducts}
          />

          {/* Active Filter Pill Summary */}
          {(selectedProvince !== 'All Provinces' ||
            selectedCategory !== 'All Categories' ||
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
                  {selectedProvince !== 'All Provinces' && (
                    <span className="bg-white border border-emerald-200 px-2 py-0.5 rounded text-emerald-800 font-medium">
                      {selectedProvince}
                    </span>
                  )}
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
                      Market: {selectedArea}
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

          {/* Main 3-Column Marketplace Catalog Section */}
          <main
            id="shops-list-section"
            className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-16 pt-2 flex-1"
          >
            {/* Mobile Filter & Map Toggle Bar */}
            <div className="flex lg:hidden items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 mb-3 shadow-2xs gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>
                  {activeCity} ({filteredShops.length})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowMap((v) => !v)}
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer ${
                    showMap
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>{showMap ? 'Hide Map' : 'Map'}</span>
                </button>
                <button
                  onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Filters</span>
                </button>
              </div>
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
                  selectedArea={selectedArea}
                  onAreaChange={setSelectedArea}
                  availableAreas={availableAreas}
                  availableCategories={availableCategoryNames}
                  selectedProvince={selectedProvince}
                  onProvinceChange={handleProvinceChange}
                  provinces={provinceNames}
                  activeCity={activeCity}
                  onCityChange={(city) => {
                    setActiveCity(city);
                    setSelectedArea('All Areas');
                  }}
                  cities={cityNamesForProvince}
                />
              </div>
            )}

            {/* Split 3-Column Layout: Filter Sidebar (Left) + Map & Catalog (Middle) + Markets & Hubs (Right) */}
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
                  selectedArea={selectedArea}
                  onAreaChange={setSelectedArea}
                  availableAreas={availableAreas}
                  availableCategories={availableCategoryNames}
                  selectedProvince={selectedProvince}
                  onProvinceChange={handleProvinceChange}
                  provinces={provinceNames}
                  activeCity={activeCity}
                  onCityChange={(city) => {
                    setActiveCity(city);
                    setSelectedArea('All Areas');
                  }}
                  cities={cityNamesForProvince}
                />
              </div>

              {/* Middle Column: Compact Toggleable Map + Marketplace Catalog Grid */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                {/* Catalog Header Bar with Map Toggle */}
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200/90 shadow-2xs flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-xs sm:text-sm font-['Outfit']">
                      {activeCity === 'All Cities'
                        ? 'All Pakistan Businesses'
                        : `Businesses in ${activeCity}`}
                    </span>
                    <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
                      {filteredShops.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => setShowMap((v) => !v)}
                      className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                        showMap
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
                    </button>

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

                {/* Compact Middle-Column Interactive Map */}
                {(showMap || mobileView === 'map') && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-slate-900 text-xs">
                          Live Map · {activeCity} ({filteredShops.length} pins)
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setShowMap(false);
                          setMobileView('list');
                        }}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Collapse ✕
                      </button>
                    </div>
                    <InteractiveMap
                      shops={filteredShops}
                      selectedShop={selectedShop}
                      onSelectShop={setSelectedShop}
                      onOpenDetails={handleOpenFullShop}
                      radiusKm={radiusKm}
                      activeCity={activeCity === 'All Cities' ? 'Pakistan' : activeCity}
                      favorites={user.favorites}
                      onToggleFavorite={(id, e) => handleToggleFavorite(id, e)}
                    />
                  </div>
                )}

                {/* Multi-column Shops Catalog Grid */}
                {loadingShops ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="h-72 bg-white rounded-2xl border border-slate-200 animate-pulse p-4 space-y-3"
                      >
                        <div className="h-36 bg-slate-100 rounded-xl" />
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : filteredShops.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredShops.map((shop) => (
                      <ShopCard
                        key={shop.id}
                        shop={shop}
                        isSelected={selectedShop?.id === shop.id}
                        onSelect={() => setSelectedShop(shop)}
                        onOpenDetails={() => handleOpenFullShop(shop)}
                        isFavorite={user.favorites.includes(shop.id)}
                        onToggleFavorite={(e) => handleToggleFavorite(shop.id, e)}
                        onOpenInAppChat={(s) => setActiveChatShop(s)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 text-center shadow-xs space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      {activeCity !== 'All Cities'
                        ? `No shops registered in ${activeCity} matching your filters`
                        : 'No shops found matching your filters'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      {activeCity !== 'All Cities'
                        ? `Be the first merchant or customer to put ${activeCity} on asspas.store, or browse stores across all cities in Pakistan.`
                        : 'Try clearing your search or adjusting category and rating filters.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      {activeCity !== 'All Cities' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedProvince('All Provinces');
                              setActiveCity('All Cities');
                              setSelectedArea('All Areas');
                            }}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                          >
                            Show All Pakistan Cities
                          </button>
                          <button
                            onClick={() => handleOpenAddShop(false)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                          >
                            + Register First Shop in {activeCity}
                          </button>
                        </>
                      )}
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Clear All Filters
                      </button>
                    </div>
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
                        {activeCity === 'All Cities'
                          ? 'Markets in Pakistan'
                          : `Markets in ${activeCity}`}
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
                      const count =
                        areaName === 'All Areas'
                          ? activeCity === 'All Cities'
                            ? visibleShops.length
                            : visibleShops.filter(
                                (s) => s.city.toLowerCase() === activeCity.toLowerCase()
                              ).length
                          : visibleShops.filter(
                              (s) =>
                                (activeCity === 'All Cities' ||
                                  s.city.toLowerCase() === activeCity.toLowerCase()) &&
                                (s.area?.toLowerCase() === areaName.toLowerCase() ||
                                  s.marketOrBazar?.toLowerCase() === areaName.toLowerCase() ||
                                  s.address?.toLowerCase().includes(areaName.toLowerCase()))
                            ).length;
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
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ml-1.5 ${
                              isSelected
                                ? 'bg-emerald-700 text-white'
                                : 'bg-slate-200/80 text-slate-600'
                            }`}
                          >
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
                      <div className="font-bold text-xs">
                        {adminSettings.featuredBrandName || 'Elegancia Mineral Water'}
                      </div>
                      <div className="text-[10px] text-emerald-200/80">
                        Certified Pure Hydration
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                    Order 19L cans, 1.5L family bottles & 500ml packs from verified stockists across{' '}
                    {activeCity}.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setOnlyElegancia(!onlyElegancia)}
                      className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold text-center cursor-pointer transition-all ${
                        onlyElegancia
                          ? 'bg-white text-emerald-950 shadow-sm'
                          : 'bg-emerald-700 hover:bg-emerald-600 text-white'
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
                  <div className="font-bold text-xs text-slate-900">
                    Own a Shop in {activeCity}?
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Add your business in 2 minutes. Get direct customer orders on WhatsApp & earn
                    +100 PTS!
                  </p>
                  <button
                    onClick={() => handleOpenAddShop(false)}
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
            shops={visibleShops}
            onSelectShop={(s) => setSelectedShop(s)}
            onOpenDetails={handleOpenFullShop}
            activeCity={activeCity}
            onOpenCityModal={() => setIsCityModalOpen(true)}
            onOpenAddShop={() => handleOpenAddShop(false)}
          />
        </div>
      )}

      {/* View: Categories Taxonomies */}
      {activeTab === 'categories' && (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 flex-1">
          <CategoriesView
            shops={visibleShops}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              handleSelectTab('home');
            }}
            onSelectShop={handleOpenFullShop}
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
            onSelectShop={handleOpenFullShop}
            onOpenAddShop={() => handleOpenAddShop(true)}
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

      {/* View: Favorites (Saved Businesses + Saved Products) */}
      {activeTab === 'favorites' && (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6 flex-1">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>Saved Favorites ({totalFavoritesCount})</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Quick access to your bookmarked local stores and favorite products.
            </p>
          </div>

          {/* Saved Shops Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Saved Businesses ({user.favorites.length})</span>
            </h3>
            {user.favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleShops
                  .filter((s) => user.favorites.includes(s.id))
                  .map((shop) => (
                    <ShopCard
                      key={shop.id}
                      shop={shop}
                      isSelected={selectedShop?.id === shop.id}
                      onSelect={() => setSelectedShop(shop)}
                      onOpenDetails={() => handleOpenFullShop(shop)}
                      isFavorite={true}
                      onToggleFavorite={(e) => handleToggleFavorite(shop.id, e)}
                      onOpenInAppChat={(s) => setActiveChatShop(s)}
                    />
                  ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
                <Heart className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 text-xs">No favorite businesses saved yet</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click the heart icon on any store card to bookmark it here.
                </p>
              </div>
            )}
          </div>

          {/* Saved Products Section */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Saved Products ({favoriteProductEntries.length})</span>
            </h3>
            {favoriteProductEntries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {favoriteProductEntries.map(({ shop, item }) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-3 flex items-center gap-3 shadow-2xs"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-emerald-700 font-black">
                        Rs. {Number(item.price || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">From: {shop.name}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          onClick={() => handleOpenFullShop(shop)}
                          className="text-[10px] font-bold text-emerald-700 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>View Shop</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleToggleFavoriteProduct(item.id)}
                          className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
                <Package className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 text-xs">No favorite products saved yet</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Save items from any shop catalog to view them quickly here.
                </p>
                <button
                  onClick={() => handleSelectTab('home')}
                  className="mt-3 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Explore Shops
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View: My Registered Businesses (Merchant Portal) */}
      {activeTab === 'my-shops' && (
        <div className="w-full flex-1">
          <MyStoresView
            shops={shops}
            onOpenAddShop={() => handleOpenAddShop(false)}
            onSelectShop={handleOpenFullShop}
            onOpenDetails={handleOpenFullShop}
            onShopUpdated={handleShopUpdated}
          />
        </div>
      )}

      {/* View: User Profile (Member Portal & 3x3 Matrix) */}
      {activeTab === 'profile' && (
        <div className="w-full flex-1">
          <UserProfileView
            user={user}
            shops={shops}
            onOpenAddShop={() => handleOpenAddShop(false)}
            onSelectShop={handleOpenFullShop}
            onOpenShopDetails={handleOpenFullShop}
            onBackToHome={() => handleSelectTab('home')}
            onOpenAdmin={() => handleSelectTab('admin')}
            onToggleFavoriteShop={(id) => handleToggleFavorite(id)}
            onToggleFavoriteProduct={handleToggleFavoriteProduct}
          />
        </div>
      )}

      {/* View: Full Shop Profile Page */}
      {activeTab === 'shop-view' && selectedShop && (
        <div className="w-full flex-1">
          <FullShopProfileView
            shop={selectedShop}
            onBack={() => handleSelectTab('home')}
            isFavorite={user.favorites.includes(selectedShop.id)}
            onToggleFavorite={() => handleToggleFavorite(selectedShop.id)}
            onOpenInAppChat={(s) => {
              setActiveChatShop(s);
            }}
            onShopUpdated={handleShopUpdated}
            adminSettings={adminSettings}
          />
        </div>
      )}

      {/* Full Enterprise Footer */}
      <ValueFooter
        onSelectTab={handleSelectTab}
        onOpenAddShop={() => handleOpenAddShop(false)}
        onOpenCityModal={() => setIsCityModalOpen(true)}
        onOpenAboutModal={() => setIsAboutOpen(true)}
        onOpenContactModal={() => setIsContactOpen(true)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        mobileView={mobileView}
        onToggleMobileView={() => {
          const next = mobileView === 'list' ? 'map' : 'list';
          setMobileView(next);
          setShowMap(next === 'map');
          if (activeTab !== 'home') handleSelectTab('home');
        }}
        onOpenAddShop={() => handleOpenAddShop(false)}
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
          if (cityInfo.province) setSelectedProvince(cityInfo.province);
          setSelectedArea('All Areas');
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

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

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
          onOpenFullShop={(s) => handleOpenFullShop(s)}
        />
      )}

      {/* In-App WhatsApp Live Messenger */}
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
          activeCity={activeCity === 'All Cities' ? 'Peshawar' : activeCity}
          onOpenAuth={() => setIsAuthOpen(true)}
          onNavigateToMyStores={() => handleSelectTab('my-shops')}
          defaultElegancia={defaultEleganciaModal}
          existingShops={shops}
          adminSettings={adminSettings}
          categories={categories}
          onCategoryAdded={(cat) =>
            setCategories((prev) =>
              [...prev.filter((c) => c.id !== cat.id), cat].sort((a, b) =>
                a.name.localeCompare(b.name)
              )
            )
          }
          onSelectExistingShop={(s) => {
            setIsAddShopOpen(false);
            handleOpenFullShop(s);
          }}
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
        onSelectShop={handleOpenFullShop}
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
        isInstallable={canPromptNatively}
      />
    </div>
  );
}

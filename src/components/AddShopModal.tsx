import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Store, 
  MapPin, 
  Droplet, 
  Check, 
  Sparkles, 
  Upload,
  AlertCircle,
  Plus,
  Search,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import {
  Shop,
  ShopType,
  GoodsOrServiceType,
  CategoryItem,
  AdminSettings
} from '../types';
import { getRegionsWithCustom, ALL_PAKISTAN_CITIES } from '../data/pakistanRegions';
import { useAuth } from '../context/AuthContext';
import { uploadShopImage } from '../services/storageService';
import { uploadImageToImgBB } from '../services/imageUploadService';
import { createShopInDb } from '../services/shopService';
import {
  DEFAULT_CATEGORIES,
  checkCategorySpellingAndMatch,
  saveCustomCategoryToDb,
  SpellCheckResult
} from '../services/categoryService';
import { MapLocationPicker } from './MapLocationPicker';
import { DEFAULT_GROCERY_STORE_IMAGE, getCategoryDefaultImage } from '../data/defaultImages';

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShop: (newShop: Shop) => void;
  activeCity: string;
  onOpenAuth?: () => void;
  onNavigateToMyStores?: () => void;
  defaultElegancia?: boolean;
  existingShops?: Shop[];
  adminSettings?: AdminSettings;
  categories?: CategoryItem[];
  onCategoryAdded?: (newCat: CategoryItem) => void;
  onSelectExistingShop?: (shop: Shop) => void;
}

export const AddShopModal: React.FC<AddShopModalProps> = ({
  isOpen,
  onClose,
  onAddShop,
  activeCity,
  onOpenAuth,
  onNavigateToMyStores,
  defaultElegancia = false,
  existingShops = [],
  adminSettings,
  categories = DEFAULT_CATEGORIES,
  onCategoryAdded,
  onSelectExistingShop,
}) => {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();

  // Dynamic regions merged with admin custom regions
  const regions = useMemo(
    () => getRegionsWithCustom(adminSettings?.customRegions),
    [adminSettings?.customRegions]
  );

  // Merged A-Z categories
  const mergedCategories = useMemo(() => {
    const byName = new Map<string, CategoryItem>();
    for (const c of DEFAULT_CATEGORIES) {
      byName.set(c.name.toLowerCase(), c);
    }
    for (const c of categories) {
      if (c?.name && c.isActive !== false) {
        byName.set(c.name.toLowerCase(), c);
      }
    }
    return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  // 1. Goods / Services / Both (No default selection - merchant must deliberately choose)
  const [itemType, setItemType] = useState<GoodsOrServiceType | null>(null);

  // 2. Business Nature (No default selection - must choose explicitly before category)
  const [shopType, setShopType] = useState<Exclude<ShopType, 'All Shops'> | null>(null);

  // 3. Searchable A-Z Category + Custom Add at bottom + Spellchecker Dictionary Guard
  const [category, setCategory] = useState<string>('');
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [spellWarning, setSpellWarning] = useState<SpellCheckResult | null>(null);
  const [subCategory, setSubCategory] = useState('');

  // 4. Shop Basic Details
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState(userProfile?.name || '');
  const [description, setDescription] = useState('');

  // 5. Hierarchical Location: Province -> City -> UC -> Market/Bazar -> Street/Plaza -> Open Address
  const [province, setProvince] = useState<string>('Khyber Pakhtunkhwa (KP)');
  const [city, setCity] = useState<string>(activeCity || 'Peshawar');
  const [selectedUcOption, setSelectedUcOption] = useState<string>('');
  const [customUcInput, setCustomUcInput] = useState<string>('');
  const [selectedMarketOption, setSelectedMarketOption] = useState<string>('');
  const [customMarketInput, setCustomMarketInput] = useState<string>('');
  const [streetOrPlaza, setStreetOrPlaza] = useState('');
  const [openAddress, setOpenAddress] = useState('');

  // 6. Contact Details (3 Phone numbers + 1 Primary Line selector)
  const [phone1, setPhone1] = useState(userProfile?.phone || '');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [orderPhoneIndex, setOrderPhoneIndex] = useState<number>(0);
  const [whatsapp, setWhatsapp] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(userProfile?.email || '');

  // Opening Hours
  const [openTime, setOpenTime] = useState('09:00 AM');
  const [closeTime, setCloseTime] = useState('10:00 PM');
  const [openingHours, setOpeningHours] = useState('');
  const [isCustomTiming, setIsCustomTiming] = useState(false);

  // 7. GPS Coordinates, Map Pin Lock & Map Link Saving
  const [latInput, setLatInput] = useState('34.0151');
  const [lngInput, setLngInput] = useState('71.5249');
  const [googleMapsUrlInput, setGoogleMapsUrlInput] = useState('');
  const [isPinConfirmed, setIsPinConfirmed] = useState(false);
  const [mapLinkNotice, setMapLinkNotice] = useState<string | null>(null);

  // 8. Elegancia Mineral Water Stockist (defaultElegancia when opened from Elegancia tab, otherwise false)
  const [hasEleganciaWater, setHasEleganciaWater] = useState<boolean>(defaultElegancia);
  const [eleganciaSizes, setEleganciaSizes] = useState<string[]>(['500ml Bottled', '1.5L Family Pack', '19L Dispenser Can']);
  const [isChilled, setIsChilled] = useState<boolean>(true);
  const [alternativeWater, setAlternativeWater] = useState<string>('None / Not Selling Water');

  // 9. Photos (Respect admin maxShopImagesAllowed)
  const maxImagesAllowed = adminSettings?.maxShopImagesAllowed || 10;
  const [imagePreview, setImagePreview] = useState<string>(DEFAULT_GROCERY_STORE_IMAGE);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successShop, setSuccessShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHasEleganciaWater(Boolean(defaultElegancia));
    }
  }, [isOpen, defaultElegancia]);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.name && !ownerName) setOwnerName(userProfile.name);
      if (userProfile.phone && (!phone1 || phone1 === '0308-5599766')) setPhone1(userProfile.phone);
      if (userProfile.email && !email) setEmail(userProfile.email);
      if (userProfile.province) setProvince(userProfile.province);
      if (userProfile.city) setCity(userProfile.city);
    }
  }, [userProfile]);

  const provinceObj = useMemo(
    () => regions.find((p) => p.name === province) || regions[0],
    [regions, province]
  );

  const availableCities = useMemo(
    () => (provinceObj ? provinceObj.cities : ALL_PAKISTAN_CITIES),
    [provinceObj]
  );

  const selectedCityObj = useMemo(
    () => availableCities.find((c) => c.name === city) || availableCities[0],
    [availableCities, city]
  );

  const availableUCs = useMemo(
    () => selectedCityObj?.unionCouncils || [],
    [selectedCityObj]
  );

  const availableMarkets = useMemo(
    () => selectedCityObj?.popularAreas || [],
    [selectedCityObj]
  );

  useEffect(() => {
    if (availableCities.length > 0 && !availableCities.some((c) => c.name === city)) {
      const nextCity = availableCities[0];
      setCity(nextCity.name);
      setLatInput(String(nextCity.lat));
      setLngInput(String(nextCity.lng));
      setSelectedUcOption('');
      setSelectedMarketOption('');
    }
  }, [province, availableCities]);

  // Duplicate Shop Detection in the same city
  const duplicateMatches = useMemo(() => {
    if (!existingShops || existingShops.length === 0) return [];
    const cleanName = name.trim().toLowerCase();
    const cleanP1 = phone1.replace(/\D/g, '');
    return existingShops.filter((s) => {
      const sameCity = (s.city || '').toLowerCase() === city.toLowerCase();
      if (!sameCity) return false;
      const nameMatch = cleanName.length >= 3 && s.name.trim().toLowerCase() === cleanName;
      const shopPhones = [s.phone, ...(s.phones || [])].map((p) => (p || '').replace(/\D/g, '')).filter(Boolean);
      const phoneMatch = cleanP1.length >= 10 && shopPhones.includes(cleanP1);
      return nameMatch || phoneMatch;
    });
  }, [existingShops, name, phone1, city]);

  // Shops owned by current logged-in user
  const myOwnedShops = useMemo(() => {
    if (!currentUser) return [];
    return existingShops.filter((s) => s.ownerId === currentUser.uid);
  }, [existingShops, currentUser]);

  // Filtered categories for searchable dropdown
  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return mergedCategories;
    return mergedCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.aliases || []).some((a) => a.toLowerCase().includes(q)) ||
        (c.subcategories || []).some((sub) => sub.toLowerCase().includes(q))
    );
  }, [mergedCategories, categorySearch]);

  // Parse Google Maps link or bare coordinates
  const extractCoordinatesFromInput = (url: string): { lat: number; lng: number } | null => {
    const trimmed = url.trim();
    if (!trimmed) return null;
    const bareMatch = trimmed.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
    if (bareMatch) {
      return { lat: parseFloat(bareMatch[1]), lng: parseFloat(bareMatch[2]) };
    }
    const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    }
    const qMatch = trimmed.match(/[?&](?:q|query|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    }
    return null;
  };

  const handleApplyAndSaveMapLink = () => {
    setMapLinkNotice(null);
    const parsed = extractCoordinatesFromInput(googleMapsUrlInput);
    if (parsed && Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng)) {
      setLatInput(String(Number(parsed.lat.toFixed(6))));
      setLngInput(String(Number(parsed.lng.toFixed(6))));
      setIsPinConfirmed(true);
      setMapLinkNotice(`Coordinates locked from link: ${parsed.lat.toFixed(5)}, ${parsed.lng.toFixed(5)}`);
      return;
    }

    const numericLat = parseFloat(latInput);
    const numericLng = parseFloat(lngInput);
    if (Number.isFinite(numericLat) && Number.isFinite(numericLng) && numericLat !== 0 && numericLng !== 0) {
      setIsPinConfirmed(true);
      setMapLinkNotice(`Pinned map coordinates saved & locked (${numericLat.toFixed(5)}, ${numericLng.toFixed(5)})`);
    } else {
      setMapLinkNotice('Could not read coordinates from this link. Paste a full Google Maps URL (with @lat,lng) or pin directly on the map above.');
    }
  };

  const handleCheckCustomCategory = () => {
    const trimmed = customCategoryInput.trim();
    if (!trimmed) return;
    const result = checkCategorySpellingAndMatch(trimmed, mergedCategories);
    if (result.matchedExistingCategory || result.typoCorrections.length > 0) {
      setSpellWarning(result);
    } else {
      finalizeCustomCategory(result.suggestedTitleCase || trimmed);
    }
  };

  const finalizeCustomCategory = async (finalName: string) => {
    const cleanName = finalName.trim();
    if (!cleanName) return;
    const newCat: CategoryItem = {
      id: `cat-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: cleanName,
      type: itemType || 'both',
      icon: 'Tag',
      subcategories: subCategory ? [subCategory.trim()] : [],
      aliases: cleanName.toLowerCase().split(/\s+/),
      order: mergedCategories.length + 1,
      isActive: true,
    };
    await saveCustomCategoryToDb(newCat);
    if (onCategoryAdded) onCategoryAdded(newCat);
    setCategory(cleanName);
    setCustomCategoryInput('');
    setSpellWarning(null);
    setIsCustomCategoryMode(false);
    setCategoryDropdownOpen(false);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).slice(0, maxImagesAllowed);
      const file = files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));

      try {
        setUploadingImage(true);
        const res = await uploadImageToImgBB(file);
        if (res.success && res.url) {
          setImagePreview(res.url);
        }
      } catch (err) {
        console.warn('ImgBB upload error:', err);
      } finally {
        setUploadingImage(false);
      }

      if (files.length > 1) {
        const remaining = files.slice(1, maxImagesAllowed);
        const uploadedExtras: string[] = [];
        for (const f of remaining) {
          try {
            const extraRes = await uploadImageToImgBB(f);
            if (extraRes.success && extraRes.url) {
              uploadedExtras.push(extraRes.url);
            }
          } catch {}
        }
        if (uploadedExtras.length > 0) {
          setAdditionalImages((prev) => [...prev, ...uploadedExtras].slice(0, Math.max(0, maxImagesAllowed - 1)));
        }
      }
    }
  };

  if (!isOpen) return null;

  const effectiveUc = selectedUcOption === '__other__' ? customUcInput.trim() : selectedUcOption.trim();
  const effectiveMarket = selectedMarketOption === '__other__' ? customMarketInput.trim() : selectedMarketOption.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemType) {
      setErrorMsg('Please select whether your business provides Goods/Products, Services/Skills, or Both.');
      return;
    }

    if (!shopType) {
      setErrorMsg('Please select your Business Nature (Retail Store, Wholesale, Producer/Manufacturer, Dealer, Restaurant, or Service Provider).');
      return;
    }

    if (!category) {
      setErrorMsg('Please choose a business category (or select "Other / Specify Below in Subcategory").');
      return;
    }

    if (category === 'Other / Specify Below in Subcategory' && !subCategory.trim()) {
      setErrorMsg('Please enter your specialty / niche in the Subcategory field.');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Please provide your shop or business name.');
      return;
    }

    if (!effectiveMarket) {
      setErrorMsg('Please select or enter the Market / Commercial Bazar where your business operates.');
      return;
    }

    const isValidPakistaniPhone = (num: string) => {
      const clean = num.replace(/[\s\-\+]/g, '');
      return /^(03\d{9}|923\d{9}|0[2-9]\d{8,9})$/.test(clean);
    };

    if (!isValidPakistaniPhone(phone1)) {
      setErrorMsg('Phone 1 must be a valid Pakistani mobile or PTCL number (e.g. 0300-1234567).');
      return;
    }

    if (phone2.trim() && !isValidPakistaniPhone(phone2)) {
      setErrorMsg('Phone 2 must be a valid Pakistani mobile or landline number.');
      return;
    }

    if (phone3.trim() && !isValidPakistaniPhone(phone3)) {
      setErrorMsg('Phone 3 must be a valid Pakistani phone or PTCL landline number.');
      return;
    }

    const parsedLat = parseFloat(latInput);
    const parsedLng = parseFloat(lngInput);
    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
      setErrorMsg('Please select a valid location pin on the map or apply valid coordinates.');
      return;
    }

    if (!isPinConfirmed) {
      setErrorMsg('Please click "Save & Lock Pin" on the map (or "Apply & Save Map Link") to confirm your exact shop location.');
      return;
    }

    if (!currentUser) {
      setErrorMsg('Please sign in to register and manage your business.');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    const constructedAddress = [
      streetOrPlaza.trim(),
      effectiveMarket ? `Market: ${effectiveMarket}` : '',
      effectiveUc ? `UC: ${effectiveUc}` : '',
      openAddress.trim(),
    ].filter(Boolean).join(', ') || 'Main Commercial Area';

    try {
      setSubmitting(true);
      setErrorMsg(null);

      let finalImageUrl =
        selectedFile || imagePreview !== DEFAULT_GROCERY_STORE_IMAGE
          ? imagePreview
          : getCategoryDefaultImage(category);
      if (selectedFile && finalImageUrl.startsWith('blob:')) {
        try {
          const imgbbRes = await uploadImageToImgBB(selectedFile);
          if (imgbbRes.success && imgbbRes.url) {
            finalImageUrl = imgbbRes.url;
          } else {
            finalImageUrl = await uploadShopImage(selectedFile, currentUser.uid);
          }
        } catch (err) {
          console.warn('Storage upload fallback:', err);
        }
      }

      const phones = [phone1.trim(), phone2.trim(), phone3.trim()].filter(Boolean);
      const safeOrderIdx = orderPhoneIndex < phones.length ? orderPhoneIndex : 0;
      const chosenPrimaryPhone = phones[safeOrderIdx] || phones[0] || phone1.trim();
      const resolvedHours = openingHours.trim() || 'Hours by Appointment / Call Store';

      const shopPayload: Omit<Shop, 'id' | 'followersCount' | 'unlockedBadges'> = {
        name: name.trim(),
        category,
        subCategory: subCategory.trim() || undefined,
        itemType,
        shopType,
        businessNature: shopType,
        rating: 5.0,
        reviewsCount: 1,
        distance: 0.8,
        address: constructedAddress,
        area: effectiveMarket || effectiveUc || 'Central',
        unionCouncil: effectiveUc || undefined,
        marketOrBazar: effectiveMarket,
        streetOrPlaza: streetOrPlaza.trim() || undefined,
        openAddress: openAddress.trim() || undefined,
        city,
        province,
        isOpen: true,
        openingHours: resolvedHours,
        phone: chosenPrimaryPhone,
        phones,
        orderPhone: chosenPrimaryPhone,
        orderPhoneIndex: safeOrderIdx,
        whatsapp: (whatsapp || chosenPrimaryPhone).replace(/\D/g, ''),
        email: email.trim() || (currentUser.email ? currentUser.email : ''),
        hasEleganciaWater,
        eleganciaDetails: hasEleganciaWater
          ? {
              inStock: true,
              types: eleganciaSizes,
              isChilled,
              note: `Registered retailer of pure Elegancia Mineral Water in ${city}.`,
            }
          : undefined,
        alternativeWater: !hasEleganciaWater ? alternativeWater : undefined,
        tags: [
          itemType === 'services' ? 'Professional Service' : 'Retail Merchant',
          shopType,
          city,
          province,
        ],
        image: finalImageUrl,
        imageUrl: finalImageUrl,
        images: [finalImageUrl, ...additionalImages],
        coords: {
          lat: parsedLat,
          lng: parsedLng,
          mapX: 50,
          mapY: 50,
        },
        verified: true,
        featured: false,
        status: adminSettings?.requireShopApproval ? 'pending' : 'approved',
        ownerId: currentUser.uid,
        ownerName: ownerName.trim() || userProfile?.name || 'Business Owner',
        description:
          description.trim() ||
          `${name.trim()} offers authentic ${itemType} in ${effectiveMarket}, ${city}. Contact us for fast orders and inquiries.`,
        reviews: [
          {
            id: `rev-${Date.now()}`,
            userName: 'asspas.store Verification Team',
            rating: 5,
            date: 'Just now',
            comment: 'Business registered on asspas.store neighborhood directory.',
          },
        ],
      };

      const res = await createShopInDb(
        shopPayload,
        currentUser.uid,
        Boolean(adminSettings?.requireShopApproval)
      );

      const createdShop: Shop = {
        ...shopPayload,
        status: res.status,
        id: res.shopId,
        followersCount: 0,
        unlockedBadges: [],
      };

      onAddShop(createdShop);
      await refreshUserProfile();
      setSuccessShop(createdShop);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to register shop. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetFormForAnother = () => {
    setSuccessShop(null);
    setName('');
    setItemType(null);
    setShopType(null);
    setCategory('');
    setSubCategory('');
    setDescription('');
    setIsPinConfirmed(false);
    setOpeningHours('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-['Poppins']">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/40 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-extrabold text-base leading-tight">
                {defaultElegancia ? 'Open Elegancia Water Shop / Distributor' : 'Register Business on asspas.store'}
              </h3>
              <p className="text-[11px] text-emerald-200">
                Complete storefront, verified categories & precise pinned location across Pakistan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successShop ? (
          <div className="p-8 text-center space-y-5 my-auto overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-['Outfit'] text-xl font-black text-slate-900">
                {successShop.status === 'pending'
                  ? 'Shop Submitted for Approval!'
                  : 'Shop Successfully Registered!'}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {successShop.status === 'pending' ? (
                  <>
                    <strong>{successShop.name}</strong> has been saved and queued for admin review in{' '}
                    <strong>{successShop.city}</strong>. You earned +100 PTS reward points!
                  </>
                ) : (
                  <>
                    <strong>{successShop.name}</strong> is now live in the{' '}
                    <strong>{successShop.city}</strong> directory. You earned +100 PTS reward points!
                  </>
                )}
              </p>
            </div>

            <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-left">
              <img
                src={successShop.image}
                alt={successShop.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-slate-900 truncate">{successShop.name}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {successShop.shopType} · {successShop.category} · {successShop.city}
                </div>
                <div className={`text-[10px] font-bold mt-0.5 ${
                  successShop.status === 'pending' ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  Status: {successShop.status === 'pending' ? 'Pending Admin Approval' : 'Live & Verified'}
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToMyStores) onNavigateToMyStores();
                }}
                className="w-full sm:w-1/2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Manage in "My Stores"
              </button>

              <button
                type="button"
                onClick={resetFormForAnother}
                className="w-full sm:w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-700" />
                <span>Add Another Business</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Existing Owned Businesses Reminder */}
            {myOwnedShops.length > 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2 flex-wrap">
                <div className="text-[11px] text-emerald-900">
                  <strong>Your Existing Shops ({myOwnedShops.length}):</strong>{' '}
                  {myOwnedShops.slice(0, 3).map((s) => s.name).join(', ')}
                </div>
                {onNavigateToMyStores && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToMyStores();
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Open My Stores →
                  </button>
                )}
              </div>
            )}

            {/* 1. Goods vs Services (Mandatory, Zero Default) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 text-xs flex items-center gap-1">
                  <span>1. Business Classification (Choose One)</span>
                  <span className="text-red-500">*</span>
                </label>
                {!itemType && (
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Select Manually
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { type: 'goods', label: 'Goods / Products', desc: 'Retail store, wholesale, food or physical items' },
                  { type: 'services', label: 'Services / Skills', desc: 'Repairs, salon, plumbing, tuition, agency' },
                  { type: 'both', label: 'Both Goods & Services', desc: 'Selling items plus installation/repair services' },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setItemType(item.type as GoodsOrServiceType)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      itemType === item.type
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className={`text-[10px] mt-0.5 ${itemType === item.type ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Business Nature (Before Categories, Zero Default) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800 text-xs">
                  2. Business Nature (کاروباری نوعیت) <span className="text-red-500">*</span>
                </label>
                {!shopType && (
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Select Manually
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { value: 'Retail Store', label: 'Retail Store', urdu: 'پرچون دکان' },
                  { value: 'Wholesale', label: 'Wholesale Market', urdu: 'تھوک مارکیٹ' },
                  { value: 'Producer / Manufacturer', label: 'Producer / Manufacturer', urdu: 'کارخانہ / مینوفیکچرر' },
                  { value: 'Dealer / Distributor', label: 'Dealer / Distributor', urdu: 'ڈیلر / ڈسٹری بیوٹر' },
                  { value: 'Restaurant / Cafe', label: 'Restaurant / Cafe', urdu: 'ہوٹل یا فوڈ پوائنٹ' },
                  { value: 'Service Provider', label: 'Service Provider', urdu: 'سروس یا ہنر' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setShopType(item.value as Exclude<ShopType, 'All Shops'>)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      shopType === item.value
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-400 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 font-medium'
                    }`}
                  >
                    <div className="text-xs leading-tight">{item.label}</div>
                    <div className={`text-[10px] mt-0.5 ${shopType === item.value ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {item.urdu}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Searchable A-Z Categories with Bottom Custom Add & Spellchecker */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 text-xs">
                  3. Business Category (A–Z Searchable) & Niche <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Searchable Category Combobox */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-left flex items-center justify-between gap-2 cursor-pointer hover:border-emerald-400"
                  >
                    <span className={category ? 'font-semibold text-slate-900 truncate' : 'text-slate-400'}>
                      {category || 'Select Business Category (A–Z)...'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  {categoryDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden">
                      {/* Search input inside dropdown */}
                      <div className="p-2 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50">
                        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          placeholder="Search category (e.g. solar, salon, books)..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="w-full bg-transparent text-xs outline-none font-medium"
                        />
                      </div>

                      <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                        {filteredCategories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setCategory(cat.name);
                              setCategoryDropdownOpen(false);
                              setIsCustomCategoryMode(false);
                              setCategorySearch('');
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 cursor-pointer flex items-center justify-between ${
                              category === cat.name ? 'bg-emerald-50 font-bold text-emerald-800' : 'text-slate-700'
                            }`}
                          >
                            <span>{cat.name}</span>
                            {category === cat.name && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>
                        ))}

                        {/* Empty / Specify Below option */}
                        <button
                          type="button"
                          onClick={() => {
                            setCategory('Other / Specify Below in Subcategory');
                            setCategoryDropdownOpen(false);
                            setIsCustomCategoryMode(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer font-medium"
                        >
                          Empty / Specify Below in Subcategory
                        </button>
                      </div>

                      {/* Bottom Sticky Add Custom Category Button */}
                      <div className="p-2 border-t border-slate-200 bg-emerald-50/80">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomCategoryMode(true);
                            setCategoryDropdownOpen(false);
                            setCustomCategoryInput(categorySearch);
                            setSpellWarning(null);
                          }}
                          className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Custom Category (Bottom Action)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subcategory / Niche */}
                <input
                  type="text"
                  placeholder="Subcategory / Specialty (e.g. Unstitched Lawn)"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Inline Custom Category Spellchecker & Adder */}
              {isCustomCategoryMode && (
                <div className="p-3 bg-white border border-emerald-300 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900">
                      Create New Category (Dictionary Spellcheck Protected)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategoryMode(false);
                        setSpellWarning(null);
                      }}
                      className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      spellCheck={true}
                      autoCorrect="on"
                      placeholder="Type new category name (e.g. Solar Inverters & Panels)"
                      value={customCategoryInput}
                      onChange={(e) => {
                        setCustomCategoryInput(e.target.value);
                        setSpellWarning(null);
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleCheckCustomCategory}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                    >
                      Verify & Add
                    </button>
                  </div>

                  {spellWarning && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] space-y-2">
                      {spellWarning.matchedExistingCategory && (
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-amber-900">
                            Similar category exists: <strong>{spellWarning.matchedExistingCategory.name}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCategory(spellWarning.matchedExistingCategory!.name);
                              setIsCustomCategoryMode(false);
                              setSpellWarning(null);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                          >
                            Use Existing
                          </button>
                        </div>
                      )}
                      {spellWarning.typoCorrections.length > 0 && (
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-amber-900">
                            Suggested spelling: <strong>{spellWarning.suggestedTitleCase}</strong>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => finalizeCustomCategory(spellWarning.suggestedTitleCase)}
                              className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                            >
                              Apply Spelling & Add
                            </button>
                            <button
                              type="button"
                              onClick={() => finalizeCustomCategory(customCategoryInput)}
                              className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer"
                            >
                              Keep Mine
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shop Name & Owner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Shop / Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peshawar General Store"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Owner / Contact Person Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Muhammad Tariq"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Duplicate Shop Warning Card */}
            {duplicateMatches.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <strong>Possible Duplicate Business Detected in {city}:</strong>{' '}
                    <span>
                      "{duplicateMatches[0].name}" is already registered with matching name or phone ({duplicateMatches[0].area}).
                    </span>
                  </div>
                </div>
                {onSelectExistingShop && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectExistingShop(duplicateMatches[0]);
                    }}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <span>View Shop</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* 4. Complete Location Hierarchy & Map Pin */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/90 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>4. Location Hierarchy & Pinned Coordinates</span>
                  <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Province -> City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-700 block mb-1">Province (صوبہ) *</span>
                  <select
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      setSelectedUcOption('');
                      setSelectedMarketOption('');
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-semibold cursor-pointer"
                  >
                    {regions.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-700 block mb-1">City in {province} (شہر) *</span>
                  <select
                    value={city}
                    onChange={(e) => {
                      const chosen = availableCities.find((c) => c.name === e.target.value);
                      setCity(e.target.value);
                      setSelectedUcOption('');
                      setSelectedMarketOption('');
                      if (chosen) {
                        setLatInput(String(chosen.lat));
                        setLngInput(String(chosen.lng));
                        setIsPinConfirmed(false);
                      }
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-semibold cursor-pointer"
                  >
                    {availableCities.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Union Council (UC) & Market/Bazar Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-700 block">Union Council (UC) / Sector</span>
                  <select
                    value={selectedUcOption}
                    onChange={(e) => setSelectedUcOption(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                  >
                    <option value="">Select Union Council / Sector...</option>
                    {availableUCs.map((uc) => (
                      <option key={uc} value={uc}>{uc}</option>
                    ))}
                    <option value="__other__">Other / Specify Custom UC...</option>
                  </select>
                  {selectedUcOption === '__other__' && (
                    <input
                      type="text"
                      placeholder="Write your Union Council or Sector"
                      value={customUcInput}
                      onChange={(e) => setCustomUcInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-700 block">Market / Commercial Bazar *</span>
                  <select
                    value={selectedMarketOption}
                    onChange={(e) => setSelectedMarketOption(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                  >
                    <option value="">Select Market / Bazar...</option>
                    {availableMarkets.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="__other__">Other / Specify Custom Bazar...</option>
                  </select>
                  {selectedMarketOption === '__other__' && (
                    <input
                      type="text"
                      placeholder="Write your Market / Bazar name"
                      value={customMarketInput}
                      onChange={(e) => setCustomMarketInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  )}
                </div>
              </div>

              {/* Plaza / Street / Open Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-700 block mb-1">Street / Plaza / Shop Number</span>
                  <input
                    type="text"
                    placeholder="e.g. Shop #14, Ground Floor, Deans Trade Center"
                    value={streetOrPlaza}
                    onChange={(e) => setStreetOrPlaza(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-700 block mb-1">Open Address / Nearest Landmark</span>
                  <input
                    type="text"
                    placeholder="e.g. Near Jamia Masjid or Main Chowk"
                    value={openAddress}
                    onChange={(e) => setOpenAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Interactive Visual Map & Pin Confirmation */}
              <div className="pt-2 border-t border-emerald-200/80 space-y-3">
                <MapLocationPicker
                  lat={parseFloat(latInput) || 34.0151}
                  lng={parseFloat(lngInput) || 71.5249}
                  cityName={city}
                  shopName={name || 'My Shop Location'}
                  isPinConfirmed={isPinConfirmed}
                  onConfirmPin={(confirmed) => setIsPinConfirmed(confirmed)}
                  onLocationChange={(newLat, newLng) => {
                    setLatInput(String(newLat));
                    setLngInput(String(newLng));
                    setGoogleMapsUrlInput(`https://www.google.com/maps?q=${newLat},${newLng}`);
                  }}
                />

                {/* Google Maps Link Input + Apply & Save Button */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-700 block">
                    Or Paste Google Maps Link / Coordinates & Click Save:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. https://maps.google.com/?q=34.0151,71.5249 or 34.0151, 71.5249"
                      value={googleMapsUrlInput}
                      onChange={(e) => setGoogleMapsUrlInput(e.target.value)}
                      className="flex-1 bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleApplyAndSaveMapLink}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Apply & Save Map Link
                    </button>
                  </div>
                  {mapLinkNotice && (
                    <p className="text-[11px] font-semibold text-emerald-800">{mapLinkNotice}</p>
                  )}
                </div>

                {/* Manual Numeric Coordinates */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[10px] font-medium text-slate-600 block mb-0.5">Latitude</span>
                    <input
                      type="number"
                      step="any"
                      value={latInput}
                      onChange={(e) => {
                        setLatInput(e.target.value);
                        setIsPinConfirmed(false);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-600 block mb-0.5">Longitude</span>
                    <input
                      type="number"
                      step="any"
                      value={lngInput}
                      onChange={(e) => {
                        setLngInput(e.target.value);
                        setIsPinConfirmed(false);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Contact Options (3 Phone Numbers + Clear Primary Order Selection) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div>
                <label className="font-bold text-slate-800 block text-xs">
                  5. Shop Phone Numbers (Choose 1 Primary Line for Customer Orders & WhatsApp) <span className="text-red-500">*</span>
                </label>
                <p className="text-[10px] text-slate-500">
                  Customers will call and send WhatsApp inquiries to your chosen Primary Line first.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className={`p-2 rounded-xl border ${orderPhoneIndex === 0 ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-700">Phone 1 *</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <span className="text-[9px] text-emerald-800 font-bold">Primary Orders</span>
                      <input
                        type="radio"
                        name="primaryPhone"
                        checked={orderPhoneIndex === 0}
                        onChange={() => setOrderPhoneIndex(0)}
                        className="accent-emerald-600 cursor-pointer"
                      />
                    </label>
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="0300-1234567"
                    value={phone1}
                    onChange={(e) => setPhone1(e.target.value)}
                    className="w-full bg-transparent text-xs outline-none font-medium text-slate-900"
                  />
                </div>

                <div className={`p-2 rounded-xl border ${orderPhoneIndex === 1 ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-600">Phone 2 (Optional)</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <span className="text-[9px] text-emerald-800 font-bold">Primary Orders</span>
                      <input
                        type="radio"
                        name="primaryPhone"
                        checked={orderPhoneIndex === 1}
                        onChange={() => setOrderPhoneIndex(1)}
                        className="accent-emerald-600 cursor-pointer"
                      />
                    </label>
                  </div>
                  <input
                    type="tel"
                    placeholder="0312-3456789"
                    value={phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                    className="w-full bg-transparent text-xs outline-none font-medium text-slate-900"
                  />
                </div>

                <div className={`p-2 rounded-xl border ${orderPhoneIndex === 2 ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-600">Phone 3 (Optional)</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <span className="text-[9px] text-emerald-800 font-bold">Primary Orders</span>
                      <input
                        type="radio"
                        name="primaryPhone"
                        checked={orderPhoneIndex === 2}
                        onChange={() => setOrderPhoneIndex(2)}
                        className="accent-emerald-600 cursor-pointer"
                      />
                    </label>
                  </div>
                  <input
                    type="tel"
                    placeholder="091-1234567"
                    value={phone3}
                    onChange={(e) => setPhone3(e.target.value)}
                    className="w-full bg-transparent text-xs outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">WhatsApp Number (Optional override)</span>
                  <input
                    type="tel"
                    placeholder="Same as primary order phone if blank"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Business Email (Optional)</span>
                  <input
                    type="email"
                    placeholder="e.g. yourbusiness@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* 6. Opening Hours */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-800 text-xs">
                  6. Shop Opening Hours (دکان کے اوقات کار)
                </label>
                <span className="text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {openingHours || 'Not Set Yet (Select Below)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] text-slate-600 block mb-1 font-medium">Opening Time</span>
                  <select
                    value={openTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setOpenTime(val);
                      setOpeningHours(val === 'Open 24 Hours' ? 'Open 24/7' : `${val} - ${closeTime}`);
                      setIsCustomTiming(false);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 'Open 24 Hours'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-600 block mb-1 font-medium">Closing Time</span>
                  <select
                    value={closeTime}
                    disabled={openTime === 'Open 24 Hours'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCloseTime(val);
                      setOpeningHours(`${openTime} - ${val}`);
                      setIsCustomTiming(false);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
                  >
                    {['05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM', '01:00 AM'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {[
                  '09:00 AM - 10:00 PM',
                  '10:00 AM - 11:00 PM',
                  '08:00 AM - 08:00 PM',
                  'Open 24/7',
                  'By Appointment Only',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setOpeningHours(preset);
                      setIsCustomTiming(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer border transition-colors ${
                      openingHours === preset && !isCustomTiming
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomTiming(!isCustomTiming)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer border transition-colors ${
                    isCustomTiming
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  Custom Timing...
                </button>
              </div>

              {isCustomTiming && (
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM - 10:00 PM (Friday Break 1:00 - 2:30 PM)"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              )}
            </div>

            {/* 7. Store Description */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                7. Store / Service Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe what your business offers, key brands, delivery availability, and specialties..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-medium"
              />
            </div>

            {/* 8. Photos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-700">
                  8. Storefront & Product Photos (Max {maxImagesAllowed} photos)
                </label>
                {uploadingImage && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded animate-pulse">
                    Uploading...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Store preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
                />
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold cursor-pointer border border-emerald-200 transition-all">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Store Photos from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {additionalImages.length > 0
                      ? `${additionalImages.length + 1} photos attached`
                      : `You can select multiple photos at once (limit ${maxImagesAllowed}).`}
                  </p>
                </div>
              </div>
            </div>

            {/* 9. Elegancia Water Stockist (Unchecked by default unless defaultElegancia) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Droplet className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    Is this business a stockist of Elegancia Mineral Water?
                  </div>
                  <div className="text-[11px] text-slate-500">
                    (Leave unchecked if you do not stock Elegancia Water bottles/dispensers)
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={hasEleganciaWater}
                onChange={(e) => setHasEleganciaWater(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Wholesale Banner when Unchecked vs Sizes when Checked */}
            {!hasEleganciaWater ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-gradient-to-r from-emerald-950 to-teal-950 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs">Partner with Elegancia Mineral Water (Wholesale Margins)</div>
                      <p className="text-[11px] text-emerald-200">
                        Add certified bottled & 19L dispenser stock to attract daily neighborhood customers.
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/923085599766?text=Assalam-o-Alaikum!%20I%20am%20registering%20my%20shop%20on%20asspas.store%20and%20want%20Elegancia%20Mineral%20Water%20wholesale%20rates."
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-[11px] shrink-0 flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Order Wholesale (0308-5599766)</span>
                  </a>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-800 text-xs">
                      Alternative Water Available (Optional):
                    </label>
                    <span className="text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {alternativeWater}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Nestlé Pure Life',
                      'Aquafina',
                      'Gourmet Pure Water',
                      'Local RO Plant Filtered',
                      'Tap / Tube Well Water',
                      'None / Not Selling Water',
                    ].map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => setAlternativeWater(brand)}
                        className={`p-2 rounded-xl border text-xs font-medium text-left transition-colors cursor-pointer ${
                          alternativeWater === brand
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                <div className="font-semibold text-emerald-950 text-xs">
                  Available Elegancia Sizes in Stock:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {['500ml Bottled', '1.5L Family Pack', '19L Dispenser Can'].map((size) => {
                    const isSelected = eleganciaSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setEleganciaSizes(eleganciaSizes.filter((s) => s !== size));
                          } else {
                            setEleganciaSizes([...eleganciaSizes, size]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <label className="flex items-center gap-2 pt-1 text-xs text-emerald-900 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChilled}
                    onChange={(e) => setIsChilled(e.target.checked)}
                    className="accent-emerald-600 rounded"
                  />
                  <span>Chilled / Cold water bottles available on demand</span>
                </label>
              </div>
            )}

            {/* Submit Bar */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {submitting ? 'Saving Shop to Cloud...' : 'Register Business Now'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

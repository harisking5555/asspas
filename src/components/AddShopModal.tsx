import React, { useState, useEffect } from 'react';
import { 
  X, 
  Store, 
  MapPin, 
  Droplet, 
  Check, 
  Sparkles, 
  Phone, 
  Mail, 
  Clock, 
  Image as ImageIcon,
  Upload,
  AlertCircle,
  Plus,
  HelpCircle,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Shop, ShopCategory, ShopType, GoodsOrServiceType } from '../types';
import { PAKISTAN_REGIONS, ALL_PAKISTAN_CITIES } from '../data/pakistanRegions';
import { useAuth } from '../context/AuthContext';
import { uploadShopImage } from '../services/storageService';
import { uploadImageToImgBB } from '../services/imageUploadService';
import { createShopInDb } from '../services/shopService';
import { MapLocationPicker } from './MapLocationPicker';

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShop: (newShop: Shop) => void;
  activeCity: string;
  onOpenAuth?: () => void;
  onNavigateToMyStores?: () => void;
}

// Built-in verified categories dictionary sorted alphabetically (A-Z)
const DEFAULT_EXPANDED_CATEGORIES: string[] = [
  'Agricultural Supplies & Seeds',
  'Air Conditioning & Refrigeration',
  'Aluminium & Glass Works',
  'Arts, Crafts & Paintings',
  'Automotive & Spare Parts',
  'Baby Care & Kids Wear',
  'Bakery, Cakes & Sweets',
  'Banks & Currency Exchange',
  'Barber & Men Grooming Salon',
  'Beauty Parlour & Women Salon',
  'Bicycles, Motorbikes & Repairs',
  'Books, Quran & Islamic Stationery',
  'Building Materials & Cement',
  'Carpets, Rugs & Flooring',
  'Catering, Event & Wedding Services',
  'Cell Phones & Mobile Accessories',
  'Cloth Market, Fabric & Unstitched',
  'Computer, Laptops & IT Hardware',
  'Courier, Cargo & Delivery Services',
  'Crockery & Kitchenware',
  'Curtains, Blinds & Home Decor',
  'Dentists & Dental Clinics',
  'Dry Cleaners & Steam Laundry',
  'Dry Fruits, Nuts & Spices',
  'Educational Academies & Home Tutors',
  'Electrical & Sanitary Fittings',
  'Electronics & Home Appliances',
  'Eyewear, Glasses & Optical Centers',
  'Fashion & Ready-Made Garments',
  'Fish, Poultry, Beef & Mutton',
  'Florists & Fresh Flowers',
  'Footwear & Shoes Store',
  'Furniture & Woodworking',
  'General Store & Kiryana',
  'Gifts, Perfumes & Watches',
  'Graphic Designing & Printing Press',
  'Grocery & Supermarkets',
  'Gym, Fitness & Supplements',
  'Hardware & Hand Tools',
  'Home Maintenance, Plumbing & Electrician',
  'Hospitals, Laboratories & Diagnostic',
  'Hotels, Hostels & Guest Houses',
  'Jewelry, Gold & Gemstones',
  'Lawyers & Legal Consultants',
  'Luggage, Bags & Leather Goods',
  'Meat, Chicken & BBQ Ingredients',
  'Medical Stores & 24/7 Pharmacies',
  'Opticians & Eye Specialists',
  'Organic Food & Fresh Milk/Dairy',
  'Packaging Materials & Corrugated Boxes',
  'Paints, Polish & Hardware',
  'Pet Care, Animals & Veterinary',
  'Photographers & Video Production',
  'Property Dealers & Real Estate',
  'Restaurants, Cafe & Fast Food',
  'Security Systems & CCTV Cameras',
  'Solar Energy, Inverters & Batteries',
  'Sports Equipment, Cricket & Fitness',
  'Stationery & Office Supplies',
  'Tailoring, Stitching & Embroidery',
  'Tires, Batteries & Wheel Alignment',
  'Toys, Gaming & Novelties',
  'Travel & Umrah/Hajj Agencies',
  'Vegetables & Fresh Fruit Vendors',
  'Water Filtration & Mineral Water Supplies',
  'Wholesale Distribution Hub',
  'Other / Uncategorized (Write Below)'
];

export const AddShopModal: React.FC<AddShopModalProps> = ({
  isOpen,
  onClose,
  onAddShop,
  activeCity,
  onOpenAuth,
  onNavigateToMyStores,
}) => {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();

  // 1. Goods / Services / Both (No default selection - merchant must deliberately choose)
  const [itemType, setItemType] = useState<GoodsOrServiceType | null>(null);

  // 2. Business Nature (before categories)
  const [shopType, setShopType] = useState<Exclude<ShopType, 'All Shops'>>('Retail Store');

  // 3. Category & Custom Category with spellcheck helper
  const [categoryList, setCategoryList] = useState<string[]>(DEFAULT_EXPANDED_CATEGORIES);
  const [category, setCategory] = useState<string>('Grocery & Daily Needs');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [subCategory, setSubCategory] = useState('');

  // 4. Shop Basic Details
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState(userProfile?.name || '');
  const [description, setDescription] = useState('');

  // 5. Hierarchical Location: Province -> City -> Union Council (UC) -> Market/Bazar -> Street/Plaza -> Open Address
  const [province, setProvince] = useState<string>('Khyber Pakhtunkhwa (KP)');
  const [city, setCity] = useState<string>(activeCity || 'Peshawar');
  const [unionCouncil, setUnionCouncil] = useState('');
  const [marketOrBazar, setMarketOrBazar] = useState('');
  const [streetOrPlaza, setStreetOrPlaza] = useState('');
  const [openAddress, setOpenAddress] = useState(''); // Open address field for areas without street numbers

  // 6. Contact Details (3 Phone numbers + 1 selected for primary orders - NO developer hardcoded defaults)
  const [phone1, setPhone1] = useState(userProfile?.phone || '');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [orderPhoneIndex, setOrderPhoneIndex] = useState<number>(0);
  const [whatsapp, setWhatsapp] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [openTime, setOpenTime] = useState('09:00 AM');
  const [closeTime, setCloseTime] = useState('10:00 PM');
  const [openingHours, setOpeningHours] = useState('09:00 AM - 10:00 PM');
  const [isCustomTiming, setIsCustomTiming] = useState(false);

  // 7. Manual GPS Coordinates or Map Link Paste
  const [latInput, setLatInput] = useState('34.0151');
  const [lngInput, setLngInput] = useState('71.5249');
  const [googleMapsUrlInput, setGoogleMapsUrlInput] = useState('');

  // 8. Elegancia Water Checkbox (Default unchecked per user instruction)
  const [hasEleganciaWater, setHasEleganciaWater] = useState<boolean>(false);
  const [eleganciaSizes, setEleganciaSizes] = useState<string[]>(['500ml Bottled', '1.5L Family Pack', '19L Dispenser Can']);
  const [isChilled, setIsChilled] = useState<boolean>(true);
  const [alternativeWater, setAlternativeWater] = useState<string>('None / Not Selling Water');

  // 9. Photos (Single or Multiple with admin-friendly format)
  const [imagePreview, setImagePreview] = useState<string>(
    '/src/assets/images/store_imtiaz_grocery_1793110437258.jpg'
  );
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successShop, setSuccessShop] = useState<Shop | null>(null);

  // Sync with userProfile when user logs in
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name && !ownerName) setOwnerName(userProfile.name);
      if (userProfile.phone && (!phone1 || phone1 === '0308-5599766')) setPhone1(userProfile.phone);
      if (userProfile.email && !email) setEmail(userProfile.email);
    }
  }, [userProfile]);

  // Update cities when province changes
  const provinceObj = PAKISTAN_REGIONS.find((p) => p.name === province);
  const availableCities = provinceObj ? provinceObj.cities.map((c) => c.name) : ALL_PAKISTAN_CITIES.map((c) => c.name);

  useEffect(() => {
    if (availableCities.length > 0 && !availableCities.includes(city)) {
      setCity(availableCities[0]);
    }
  }, [province]);

  // Parse Google Maps link or coordinates if user pastes from mobile
  const handleParseMapLink = (url: string) => {
    setGoogleMapsUrlInput(url);
    if (!url.trim()) return;
    try {
      const trimmed = url.trim();
      // Check for bare numbers: "34.0151, 71.5249"
      const bareMatch = trimmed.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
      if (bareMatch) {
        setLatInput(bareMatch[1]);
        setLngInput(bareMatch[2]);
        return;
      }
      // Check for @34.0151,71.5249 pattern
      const match = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        setLatInput(match[1]);
        setLngInput(match[2]);
        return;
      }
      // Check for q=34.0151,71.5249 or query= or ll= pattern
      const qMatch = trimmed.match(/[?&](?:q|query|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) {
        setLatInput(qMatch[1]);
        setLngInput(qMatch[2]);
        return;
      }
    } catch {}
  };

  const handleAddCustomCategory = () => {
    if (!customCategoryInput.trim()) return;
    const trimmed = customCategoryInput.trim();
    if (!categoryList.includes(trimmed)) {
      setCategoryList((prev) => [trimmed, ...prev]);
    }
    setCategory(trimmed);
    setCustomCategoryInput('');
    setIsCustomCategoryMode(false);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
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
        const remaining = files.slice(1, 4);
        for (const f of remaining) {
          try {
            const extraRes = await uploadImageToImgBB(f);
            if (extraRes.success && extraRes.url) {
              setAdditionalImages((prev) => [...prev, extraRes.url!]);
            }
          } catch {}
        }
      }
    }
  };

  // Safe early exit AFTER all hooks have executed
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemType) {
      setErrorMsg('Please select whether your business provides Goods/Products, Services/Skills, or Both.');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Please provide your shop or business name.');
      return;
    }

    const isValidPakistaniPhone = (num: string) => {
      const clean = num.replace(/[\s\-\+]/g, '');
      return /^(03\d{9}|923\d{9}|0[2-9]\d{8,9})$/.test(clean);
    };

    if (!isValidPakistaniPhone(phone1)) {
      setErrorMsg('Primary Phone 1 must be a valid Pakistani phone number (format: 03XX-XXXXXXX).');
      return;
    }

    if (phone2.trim() && !isValidPakistaniPhone(phone2)) {
      setErrorMsg('Phone 2 must be a valid Pakistani phone number (format: 03XX-XXXXXXX) or landline.');
      return;
    }

    if (phone3.trim() && !isValidPakistaniPhone(phone3)) {
      setErrorMsg('Phone 3 must be a valid Pakistani phone or PTCL landline number.');
      return;
    }

    const constructedAddress = [
      streetOrPlaza.trim(),
      marketOrBazar.trim() ? `Market: ${marketOrBazar.trim()}` : '',
      unionCouncil.trim() ? `UC: ${unionCouncil.trim()}` : '',
      openAddress.trim(),
    ].filter(Boolean).join(', ') || 'Main Commercial Area';

    if (!currentUser) {
      setErrorMsg('Please sign in to register and manage your business.');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      let finalImageUrl = imagePreview;
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

      const parsedLat = parseFloat(latInput) || 34.0151;
      const parsedLng = parseFloat(lngInput) || 71.5249;

      const phones = [phone1.trim(), phone2.trim(), phone3.trim()].filter(Boolean);
      const chosenPrimaryPhone = phones[orderPhoneIndex] || phones[0] || phone1.trim();

      const shopPayload: Omit<Shop, 'id' | 'followersCount' | 'unlockedBadges'> = {
        name: name.trim(),
        category,
        subCategory: subCategory.trim() || undefined,
        itemType,
        shopType,
        rating: 5.0,
        reviewsCount: 1,
        distance: 0.8,
        address: constructedAddress,
        area: marketOrBazar.trim() || unionCouncil.trim() || 'Central',
        city,
        province,
        isOpen: true,
        openingHours,
        phone: chosenPrimaryPhone,
        phones,
        orderPhoneIndex,
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
          city,
          province,
          'Verified Seller',
        ],
        image: finalImageUrl,
        images: [finalImageUrl, ...additionalImages],
        coords: {
          lat: parsedLat,
          lng: parsedLng,
          mapX: 50,
          mapY: 50,
        },
        verified: true,
        featured: false,
        status: 'approved',
        ownerId: currentUser.uid,
        ownerName: ownerName.trim() || userProfile?.name || 'Business Owner',
        description: description.trim() || `${name} offers authentic ${itemType} in ${city}, ${province}. Contact us for fast orders and inquiries.`,
        reviews: [
          {
            id: `rev-${Date.now()}`,
            userName: 'asspas.store Verification Team',
            rating: 5,
            date: 'Just now',
            comment: 'Business registered and verified on asspas.store network. Welcome to the neighborhood directory!',
          },
        ],
      };

      const res = await createShopInDb(shopPayload, currentUser.uid);

      const createdShop: Shop = {
        ...shopPayload,
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
                Register Business on asspas.store
              </h3>
              <p className="text-[11px] text-emerald-200">
                Detailed catalog, multiple pictures & precise location across Pakistan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Post-Registration Success View */}
        {successShop ? (
          <div className="p-8 text-center space-y-5 my-auto overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-['Outfit'] text-xl font-black text-slate-900">
                Shop Successfully Registered!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                <strong>{successShop.name}</strong> is now live in the <strong>{successShop.city}</strong> directory. You earned 50 reward points for creating your store!
              </p>
            </div>

            {/* Quick Preview Card */}
            <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-left">
              <img
                src={successShop.image}
                alt={successShop.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-slate-900 truncate">{successShop.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{successShop.category} · {successShop.city}</div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Status: Active & Verified</div>
              </div>
            </div>

            {/* Two Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToMyStores) onNavigateToMyStores();
                }}
                className="w-full sm:w-1/2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                View in "My Stores"
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuccessShop(null);
                  setName('');
                  setItemType(null);
                  setDescription('');
                }}
                className="w-full sm:w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-700" />
                <span>Add Another Business</span>
              </button>
            </div>
          </div>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Goods vs Services (Mandatory, No Default) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 text-xs flex items-center gap-1">
                  <span>1. Business Classification (Choose One)</span>
                  <span className="text-red-500">*</span>
                </label>
                {!itemType && (
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Required Selection
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

            {/* 2. Business Nature (Before categories) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <label className="block font-bold text-slate-800 text-xs">
                2. Business Nature (کاروباری نوعیت) <span className="text-red-500">*</span>
              </label>
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

            {/* Shop Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Shop / Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Peshawar General Store / Khyber Manufacturers"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* 3. Categories with Custom Add & Dictionary on */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">
                  3. Category & Niche (A-Z Alphabetical Order)
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategoryMode(!isCustomCategoryMode)}
                  className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isCustomCategoryMode ? 'Choose from List' : 'Add Custom Category'}</span>
                </button>
              </div>

              {isCustomCategoryMode ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    spellCheck="true"
                    autoCorrect="on"
                    placeholder="Enter custom category name (e.g. Solar Energy Systems)"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCategory}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                  >
                    {categoryList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Subcategory / Specialty (or write your own custom niche)"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              )}
            </div>

            {/* 4. Complete Location Hierarchy & GPS Coordinates */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/90 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>4. Location Hierarchy & Coordinates (صوبہ، شہر، بازار، لوکیشن)</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Step 4 of 7
                </span>
              </div>

              {/* Province & City Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-700 block mb-1">Province (صوبہ) *</span>
                  <select
                    value={province}
                    onChange={(e) => {
                      const newProv = e.target.value;
                      setProvince(newProv);
                      const pObj = PAKISTAN_REGIONS.find((p) => p.name === newProv);
                      if (pObj && pObj.cities.length > 0) {
                        setCity(pObj.cities[0].name);
                      }
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-semibold cursor-pointer"
                  >
                    {PAKISTAN_REGIONS.map((p) => (
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
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-semibold cursor-pointer"
                  >
                    {availableCities.map((cName) => (
                      <option key={cName} value={cName}>
                        {cName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Union Council (UC) & Market/Bazar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-700 block mb-1">Union Council (UC) / Sector</span>
                  <input
                    type="text"
                    placeholder="e.g. UC 24 / Hayatabad Phase 3 / Cantt"
                    value={unionCouncil}
                    onChange={(e) => setUnionCouncil(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-700 block mb-1">Market / Commercial Bazar *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saddar Bazar / Karkhano / Anarkali"
                    value={marketOrBazar}
                    onChange={(e) => setMarketOrBazar(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
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
                    placeholder="e.g. Near Jamia Masjid or GT Road Flyover"
                    value={openAddress}
                    onChange={(e) => setOpenAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Interactive Visual Map & Pin Placement (میپ پر پن اور لوکیشن سلیکٹر) */}
              <div className="pt-2 border-t border-emerald-200/80 space-y-3">
                <MapLocationPicker
                  lat={parseFloat(latInput) || 34.0151}
                  lng={parseFloat(lngInput) || 71.5249}
                  cityName={city}
                  shopName={name || 'My Shop Location'}
                  onLocationChange={(newLat, newLng) => {
                    setLatInput(String(newLat));
                    setLngInput(String(newLng));
                    setGoogleMapsUrlInput(`https://www.google.com/maps?q=${newLat},${newLng}`);
                  }}
                />

                {/* Google Maps link paste input */}
                <div>
                  <span className="text-[10px] font-bold text-slate-700 block mb-1">
                    Or Paste Existing Google Maps Link / Coordinates (یا میپ کا شیئر لنک / نمبرز پیسٹ کریں):
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. https://maps.app.goo.gl/... or 34.0151, 71.5249"
                    value={googleMapsUrlInput}
                    onChange={(e) => handleParseMapLink(e.target.value)}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium shadow-2xs"
                  />
                </div>

                {/* Manual Numeric Coordinates */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[10px] font-medium text-slate-600 block mb-0.5">Latitude (خودکار / دستی)</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 34.0151"
                      value={latInput}
                      onChange={(e) => {
                        setLatInput(e.target.value);
                        if (e.target.value && lngInput) {
                          setGoogleMapsUrlInput(`https://www.google.com/maps?q=${e.target.value},${lngInput}`);
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-600 block mb-0.5">Longitude (خودکار / دستی)</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 71.5249"
                      value={lngInput}
                      onChange={(e) => {
                        setLngInput(e.target.value);
                        if (latInput && e.target.value) {
                          setGoogleMapsUrlInput(`https://www.google.com/maps?q=${latInput},${e.target.value}`);
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Contact Options (3 Phone Numbers + 1 Selected for Orders) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <label className="font-bold text-slate-800 block text-xs">
                5. Phone Numbers (Add up to 3 numbers & choose 1 primary line for customer orders) *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className={`p-2 rounded-xl border ${orderPhoneIndex === 0 ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-700">Phone 1 (Required) *</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <span className="text-[9px] text-emerald-800 font-semibold">Primary</span>
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
                  <span className="text-[9px] text-slate-400">Order Contact Line</span>
                </div>

                <div className={`p-2 rounded-xl border ${orderPhoneIndex === 1 ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-600">Phone 2 (Optional)</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <span className="text-[9px] text-emerald-800 font-semibold">Primary</span>
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
                  <span className="text-[9px] text-slate-400">Alternate Line</span>
                </div>

                <div className={`p-2 rounded-xl border ${orderPhoneIndex === 2 ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-600">Phone 3 (Optional)</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <span className="text-[9px] text-emerald-800 font-semibold">Primary</span>
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
                  <span className="text-[9px] text-slate-400">Landline / PTCL</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">WhatsApp Number (For Direct Website Chats)</span>
                  <input
                    type="tel"
                    placeholder="0300-1234567"
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

            {/* 6. Opening Hours Timing Options (Configurable Opening & Closing Times) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-800 text-xs">
                  6. Shop Opening Hours & Timing (دکان کے اوقات کار)
                </label>
                <span className="text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {openingHours}
                </span>
              </div>

              {/* Configurable Selects for Open & Close */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] text-slate-600 block mb-1 font-medium">Opening Time (کھلنے کا وقت)</span>
                  <select
                    value={openTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setOpenTime(val);
                      if (val === 'Open 24 Hours') {
                        setOpeningHours('Open 24/7');
                      } else {
                        setOpeningHours(`${val} - ${closeTime}`);
                      }
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
                  <span className="text-[10px] text-slate-600 block mb-1 font-medium">Closing Time (بند ہونے کا وقت)</span>
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
                    {['05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM', '01:00 AM', '02:00 AM'].map((t) => (
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
                  Custom Notes...
                </button>
              </div>

              {isCustomTiming && (
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 10:00 PM (Friday Closed 1:00 PM - 2:30 PM)"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              )}
            </div>

            {/* 7. Store Description */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                7. Store / Service Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe what your shop sells, specialized products, brands in stock, service timings, and home delivery terms..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-medium"
              />
            </div>

            {/* 7. Photos (ImgBB Real Image Upload Support) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-700">
                  7. Storefront & Catalog Photos (Powered by ImgBB Cloud)
                </label>
                {uploadingImage && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded animate-pulse">
                    Uploading to ImgBB...
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
                    Hold Ctrl/Cmd to pick multiple storefront & product photos.
                  </p>
                </div>
              </div>
            </div>

            {/* 9. Elegancia Water Stockist (DEFAULT UNCHECKED) */}
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
                    (Leave unchecked if you do not carry Elegancia Water bottles/dispensers)
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

            {/* Alternative Water Options if not selling Elegancia */}
            {!hasEleganciaWater ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-800 text-xs">
                    Alternative Water Source / Brand Available (متبادل منرل واٹر یا فلٹر پانی)
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
                {submitting ? 'Registering on Cloud Firestore...' : 'Register Business Now'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

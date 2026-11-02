import React, { useState } from 'react';
import { 
  Store, 
  PlusCircle, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Star, 
  Users, 
  Droplet, 
  ExternalLink,
  Edit3,
  Clock,
  ArrowRight,
  Package,
  Share2,
  Trash2,
  Plus,
  X,
  Upload,
  Check,
  Tag,
  Eye,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';
import { Shop, CatalogItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { updateShopInfo, updateShopCatalog } from '../services/shopService';
import { uploadImageToImgBB } from '../services/imageUploadService';

interface MyStoresViewProps {
  shops: Shop[];
  onOpenAddShop: () => void;
  onSelectShop: (shop: Shop) => void;
  onOpenDetails: (shop: Shop) => void;
  onShopUpdated?: (updatedShop: Shop) => void;
}

export const MyStoresView: React.FC<MyStoresViewProps> = ({
  shops,
  onOpenAddShop,
  onSelectShop,
  onOpenDetails,
  onShopUpdated,
}) => {
  const { currentUser, userProfile } = useAuth();

  // Selected store for management
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [managingCatalogShop, setManagingCatalogShop] = useState<Shop | null>(null);

  // Edit Shop Form State
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editHours, setEditHours] = useState('09:00 AM - 10:00 PM');
  const [editPhone1, setEditPhone1] = useState('');
  const [editPhone2, setEditPhone2] = useState('');
  const [editPhone3, setEditPhone3] = useState('');
  const [editIsOpen, setEditIsOpen] = useState(true);
  const [savingShop, setSavingShop] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Catalog / Product Management State
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdInStock, setNewProdInStock] = useState(true);
  const [uploadingProdImage, setUploadingProdImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [copiedShopLink, setCopiedShopLink] = useState<string | null>(null);

  // Find stores owned by this user
  const myShops = shops.filter(
    (s) => (currentUser && s.ownerId === currentUser.uid) || 
           (userProfile && s.ownerName?.toLowerCase() === userProfile.name?.toLowerCase())
  );

  // Total products across all owned shops
  const totalProducts = myShops.reduce((acc, s) => acc + (s.catalog?.length || 0), 0);
  const totalFollowers = myShops.reduce((acc, s) => acc + (s.followersCount || 0), 0);

  const handleOpenEdit = (shop: Shop, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingShop(shop);
    setEditName(shop.name);
    setEditDesc(shop.description || '');
    setEditHours(shop.openingHours || '09:00 AM - 10:00 PM');
    const phones = shop.phones || [shop.phone || ''];
    setEditPhone1(phones[0] || '');
    setEditPhone2(phones[1] || '');
    setEditPhone3(phones[2] || '');
    setEditIsOpen(shop.isOpen !== false);
    setSaveSuccessMsg(null);
  };

  const handleSaveShopInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop) return;

    setSavingShop(true);
    const updatedPhones = [editPhone1.trim(), editPhone2.trim(), editPhone3.trim()].filter(Boolean);

    const updates: Partial<Shop> = {
      name: editName.trim(),
      description: editDesc.trim(),
      openingHours: editHours,
      isOpen: editIsOpen,
      phone: updatedPhones[0] || editingShop.phone,
      phones: updatedPhones.length > 0 ? updatedPhones : editingShop.phones,
      whatsapp: updatedPhones[0] || editingShop.whatsapp,
    };

    const success = await updateShopInfo(editingShop.id, updates);
    if (success) {
      const updatedShop: Shop = { ...editingShop, ...updates };
      setEditingShop(updatedShop);
      if (onShopUpdated) onShopUpdated(updatedShop);
      setSaveSuccessMsg('Store information updated successfully!');
      setTimeout(() => {
        setSaveSuccessMsg(null);
        setEditingShop(null);
      }, 1500);
    }
    setSavingShop(false);
  };

  const handleOpenCatalog = (shop: Shop, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setManagingCatalogShop(shop);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdOriginalPrice('');
    setNewProdImage('');
    setNewProdDesc('');
    setNewProdInStock(true);
  };

  const handleProductImageUpload = async (file: File) => {
    setUploadingProdImage(true);
    try {
      const res = await uploadImageToImgBB(file);
      if (res.success && res.url) {
        setNewProdImage(res.url);
      } else {
        alert(res.error || 'Failed to upload image.');
      }
    } catch {
      alert('Could not upload image. Please check connection or enter image URL.');
    } finally {
      setUploadingProdImage(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingCatalogShop || !newProdName.trim() || !newProdPrice) return;

    setSavingProduct(true);
    const newItem: CatalogItem = {
      id: `prod-${Date.now()}`,
      name: newProdName.trim(),
      price: Number(newProdPrice),
      originalPrice: newProdOriginalPrice ? Number(newProdOriginalPrice) : undefined,
      image: newProdImage || managingCatalogShop.image,
      description: newProdDesc.trim() || undefined,
      inStock: newProdInStock,
    };

    const updatedCatalog = [...(managingCatalogShop.catalog || []), newItem];
    const success = await updateShopCatalog(managingCatalogShop.id, updatedCatalog);

    if (success) {
      const updatedShop: Shop = { ...managingCatalogShop, catalog: updatedCatalog };
      setManagingCatalogShop(updatedShop);
      if (onShopUpdated) onShopUpdated(updatedShop);
      setNewProdName('');
      setNewProdPrice('');
      setNewProdOriginalPrice('');
      setNewProdImage('');
      setNewProdDesc('');
      setNewProdInStock(true);
    }
    setSavingProduct(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!managingCatalogShop) return;
    const updatedCatalog = (managingCatalogShop.catalog || []).filter((p) => p.id !== productId);
    const success = await updateShopCatalog(managingCatalogShop.id, updatedCatalog);
    if (success) {
      const updatedShop: Shop = { ...managingCatalogShop, catalog: updatedCatalog };
      setManagingCatalogShop(updatedShop);
      if (onShopUpdated) onShopUpdated(updatedShop);
    }
  };

  const handleShareShop = (shop: Shop, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const link = `https://asspas.store/?shop=${shop.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedShopLink(shop.id);
      setTimeout(() => setCopiedShopLink(null), 3000);
    }
    if (navigator.share) {
      navigator.share({
        title: shop.name,
        text: `Visit our verified shop "${shop.name}" on asspas.store:`,
        url: link,
      }).catch(() => {});
    }
  };

  const handleShareWhatsApp = (shop: Shop, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const link = `https://asspas.store/?shop=${shop.id}`;
    const text = encodeURIComponent(
      `Assalam-o-Alaikum! Check out our store *${shop.name}* on asspas.store:\n\n📍 Location: ${shop.address}, ${shop.city}\n🔗 Direct Storefront & Catalog Link: ${link}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6 font-['Poppins']">
      {/* Header Banner - Retailer & Merchant Dashboard */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-800/60 shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-emerald-800/60 border border-emerald-500/30 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>Retailer & Merchant Panel · asspas.store</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight">
            Welcome back, {userProfile?.name || 'Valued Merchant'}!
          </h1>
          <p className="text-xs text-emerald-100/90 max-w-xl">
            Manage your stores, update product catalog, share direct store links with your dealers & customers, and track local followers.
          </p>
        </div>

        <button
          onClick={onOpenAddShop}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Another Business / Branch</span>
        </button>
      </div>

      {/* Quick Merchant Stats (as shown in Retailer Panel design) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>My Businesses</span>
            <Store className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Outfit']">
            {myShops.length}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            Branches across Pakistan
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Catalog Items</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Outfit']">
            {totalProducts}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            Active products & services
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Local Followers</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Outfit']">
            {totalFollowers}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            Patrons receiving your updates
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Reward Points</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Outfit']">
            {userProfile?.points || 50} PTS
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
            Tier: {userProfile?.starLevel || 1} Star Merchant
          </div>
        </div>
      </div>

      {/* Stores List Grid */}
      {myShops.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
            <span>Active Businesses Under Your Ownership</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {myShops.length}
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myShops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100 mb-3">
                    <img
                      src={shop.image}
                      alt={shop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        {shop.status === 'pending' ? 'Pending Review' : 'Live & Verified'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                        shop.isOpen !== false ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}>
                        {shop.isOpen !== false ? 'Open Now' : 'Closed'}
                      </span>
                    </div>

                    {shop.hasEleganciaWater && (
                      <div className="absolute bottom-2 left-2 bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Droplet className="w-3 h-3 fill-emerald-400" />
                        <span>Elegancia Water Stockist</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div>
                      <h3 className="font-['Outfit'] font-black text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {shop.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {shop.shopType || 'Retail Store'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {shop.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-500 my-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{shop.address}, {shop.city}</span>
                  </div>

                  {/* Contact phone display */}
                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5 mb-2">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>Primary Line: <strong>{shop.phones?.[0] || shop.phone || '0308-5599766'}</strong></span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {shop.rating}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      {shop.followersCount || 0} followers
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Package className="w-3.5 h-3.5 text-emerald-600" />
                      {shop.catalog?.length || 0} Products
                    </span>
                  </div>
                </div>

                {/* Merchant Actions Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(shop, e)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Info</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleOpenCatalog(shop, e)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Products ({shop.catalog?.length || 0})</span>
                    </button>
                  </div>

                  {/* Share Store Link & WhatsApp Share */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleShareShop(shop, e)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3 h-3 text-slate-500" />
                      <span>{copiedShopLink === shop.id ? 'Copied!' : 'Copy Link'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleShareWhatsApp(shop, e)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>WhatsApp Share</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectShop(shop);
                      onOpenDetails(shop);
                    }}
                    className="w-full text-center py-1 text-emerald-700 hover:text-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Public Customer Storefront</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <Store className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-['Outfit'] font-black text-lg text-slate-900">
              No Registered Businesses Yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Register your retail store, wholesale outlet, producer/manufacturer setup, dealer agency, or personal service skills to connect with thousands of local buyers in your city.
            </p>
          </div>
          <button
            onClick={onOpenAddShop}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Your Business Free</span>
          </button>
        </div>
      )}

      {/* Edit Shop Modal */}
      {editingShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-['Outfit'] font-bold text-base text-slate-900">
                    Edit Store Details
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Update store hours, contact lines, and status
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingShop(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveShopInfo} className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Business Name:
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Store Description:
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Describe your products, brands, guarantees, and wholesale rates..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Opening & Closing Hours Presets:
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[
                    '09:00 AM - 10:00 PM',
                    '10:00 AM - 11:00 PM',
                    '08:00 AM - 08:00 PM',
                    'Open 24/7 (Non-stop)'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditHours(preset)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold text-left transition-colors cursor-pointer ${
                        editHours === preset
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  placeholder="Or enter custom timings (e.g. 11:00 AM - Midnight)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">
                  3 Contact & Order Phone Lines:
                </label>
                <input
                  type="tel"
                  placeholder="Primary Phone Line 1 (03XX-XXXXXXX)"
                  value={editPhone1}
                  onChange={(e) => setEditPhone1(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
                <input
                  type="tel"
                  placeholder="Secondary Phone Line 2 (Optional)"
                  value={editPhone2}
                  onChange={(e) => setEditPhone2(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
                <input
                  type="tel"
                  placeholder="Order Hotline / Landline Line 3 (Optional)"
                  value={editPhone3}
                  onChange={(e) => setEditPhone3(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">
                    Current Store Status:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {editIsOpen ? 'Store is open and accepting customer visits/orders' : 'Store is temporarily closed for restocking or holiday'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsOpen(!editIsOpen)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                    editIsOpen ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {editIsOpen ? 'Open Now' : 'Closed'}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingShop(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingShop}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  {savingShop ? 'Saving Changes...' : 'Save Store Info'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Products & Catalog Drawer/Modal */}
      {managingCatalogShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-['Outfit'] font-bold text-base text-slate-900">
                    Product Inventory: {managingCatalogShop.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Add items with prices, stock status, and pictures for WhatsApp ordering
                  </p>
                </div>
              </div>
              <button
                onClick={() => setManagingCatalogShop(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Product Form */}
            <form onSubmit={handleAddProduct} className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>Add New Product / Service Item</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                    Product / Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elegancia 19L Refill / Denim Jacket"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                      Selling Price (Rs.) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 250"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                      Original Price (Rs.)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 300"
                      value={newProdOriginalPrice}
                      onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                  Product Image (Upload Photo or Paste URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Image URL or upload file via button"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                  <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingProdImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProductImageUpload(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold text-slate-700">Stock Status:</label>
                  <button
                    type="button"
                    onClick={() => setNewProdInStock(!newProdInStock)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                      newProdInStock ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-rose-100 border-rose-300 text-rose-800'
                    }`}
                  >
                    {newProdInStock ? 'In Stock (Available)' : 'Out of Stock'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={savingProduct || uploadingProdImage}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{savingProduct ? 'Adding...' : 'Add to Inventory'}</span>
                </button>
              </div>
            </form>

            {/* Existing Inventory Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Current Catalog ({managingCatalogShop.catalog?.length || 0} Items)
                </h4>
              </div>

              {managingCatalogShop.catalog && managingCatalogShop.catalog.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {managingCatalogShop.catalog.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-slate-900 truncate">
                            {item.name}
                          </h5>
                          <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                            <span className="font-bold text-emerald-700">
                              Rs. {item.price}
                            </span>
                            {item.originalPrice && (
                              <span className="line-through text-slate-400 text-[10px]">
                                Rs. {item.originalPrice}
                              </span>
                            )}
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                            item.inStock !== false ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                          }`}>
                            {item.inStock !== false ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(item.id)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  <Package className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                  <span>No products listed yet. Add your first item using the form above!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

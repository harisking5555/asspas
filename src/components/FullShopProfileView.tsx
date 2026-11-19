import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Heart, 
  Star, 
  Navigation, 
  Droplet, 
  CheckCircle2, 
  Share2, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  PhoneCall, 
  ExternalLink, 
  Package, 
  ShoppingBag, 
  Check, 
  Edit,
  Sparkles,
  Info,
  Plus,
  Trash2,
  Upload,
  X,
  Send,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Shop, CatalogItem, AdminSettings, ShopType, ShopPost } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  toggleFollowShop,
  checkIsFollowing,
  fetchShopPosts,
  updateShopInfo,
  updateShopCatalog,
  createShopPost,
  updateShopPost,
  deleteShopPost,
  addShopReviewInDb
} from '../services/shopService';
import { uploadImageToImgBB } from '../services/imageUploadService';
import { DEFAULT_CATEGORIES } from '../services/categoryService';

interface FullShopProfileViewProps {
  shop: Shop;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenInAppChat: (shop: Shop, initialMsg?: string) => void;
  onEditShop?: (shop: Shop) => void;
  onShopUpdated?: (updatedShop: Shop) => void;
  adminSettings?: AdminSettings;
}

const PostMediaCarousel: React.FC<{ images: string[]; title: string }> = ({ images, title }) => {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) return null;

  const safeIdx = idx < images.length ? idx : 0;

  return (
    <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
      <img
        src={images[safeIdx]}
        alt={title}
        className="w-full h-full object-cover transition-all duration-300"
      />
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIdx((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white flex items-center justify-center cursor-pointer border border-white/20"
            aria-label="Previous post image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIdx((prev) => (prev + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white flex items-center justify-center cursor-pointer border border-white/20"
            aria-label="Next post image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute top-2.5 right-2.5 bg-slate-950/75 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
            {safeIdx + 1} / {images.length}
          </div>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-full">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  safeIdx === i ? 'bg-emerald-400 w-4' : 'bg-white/60 w-1.5'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const FullShopProfileView: React.FC<FullShopProfileViewProps> = ({
  shop,
  onBack,
  isFavorite,
  onToggleFavorite,
  onOpenInAppChat,
  onShopUpdated,
  adminSettings,
}) => {
  const { currentUser, userProfile, toggleFavoriteProduct } = useAuth();

  // Carousel and media
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Follower tracking
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(shop.followersCount || 0);
  const [followNotice, setFollowNotice] = useState<string | null>(null);

  // Shop posts
  const [posts, setPosts] = useState<ShopPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'inventory' | 'posts' | 'reviews' | 'about'>('inventory');

  // Inline Owner Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(shop.name);
  const [editDesc, setEditDesc] = useState(shop.description || '');
  const [editHours, setEditHours] = useState(shop.openingHours || '');
  const [editCategory, setEditCategory] = useState(shop.category || '');
  const [editSubCategory, setEditSubCategory] = useState(shop.subCategory || '');
  const [editShopType, setEditShopType] = useState<Exclude<ShopType, 'All Shops'>>(shop.shopType || 'Retail Store');
  const [editAddress, setEditAddress] = useState(shop.address || '');
  const [editPhones, setEditPhones] = useState<string[]>(shop.phones && shop.phones.length > 0 ? shop.phones : [shop.phone || '']);
  const [editPrimaryIdx, setEditPrimaryIdx] = useState<number>(shop.orderPhoneIndex || 0);
  const [editWhatsapp, setEditWhatsapp] = useState(shop.whatsapp || '');
  const [editIsOpen, setEditIsOpen] = useState(shop.isOpen !== false);
  const [editImages, setEditImages] = useState<string[]>(
    shop.images && shop.images.length > 0 ? shop.images : [shop.image || '/images/store_imtiaz_grocery_1793110437258.jpg']
  );
  const [uploadingShopPhoto, setUploadingShopPhoto] = useState(false);
  const [savingEditShop, setSavingEditShop] = useState(false);
  const [ownerStatusNotice, setOwnerStatusNotice] = useState<string | null>(null);

  // Inline Inventory CRUD State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodInStock, setProdInStock] = useState(true);
  const [uploadingProdImg, setUploadingProdImg] = useState(false);
  const [savingProd, setSavingProd] = useState(false);

  // Inline Multi-Image Post Composer State
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [postLinkUrl, setPostLinkUrl] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postImageInput, setPostImageInput] = useState('');
  const [uploadingPostMedia, setUploadingPostMedia] = useState(false);
  const [publishingPost, setPublishingPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Customer Reviews State
  const [reviewName, setReviewName] = useState(userProfile?.name || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const allImages = shop.images && shop.images.length > 0 ? shop.images : [shop.image || '/images/store_imtiaz_grocery_1793110437258.jpg'];
  const maxImagesAllowed = adminSettings?.maxShopImagesAllowed || 10;

  const isOwner = Boolean(
    currentUser &&
      (shop.ownerId === currentUser.uid ||
        (userProfile?.name && shop.ownerName && shop.ownerName.toLowerCase() === userProfile.name.toLowerCase()))
  );

  useEffect(() => {
    setFollowersCount(shop.followersCount || 0);
    setActiveImageIndex(0);
    setEditName(shop.name);
    setEditDesc(shop.description || '');
    setEditHours(shop.openingHours || '');
    setEditCategory(shop.category || '');
    setEditSubCategory(shop.subCategory || '');
    setEditShopType(shop.shopType || 'Retail Store');
    setEditAddress(shop.address || '');
    setEditPhones(shop.phones && shop.phones.length > 0 ? shop.phones : [shop.phone || '']);
    setEditPrimaryIdx(shop.orderPhoneIndex || 0);
    setEditWhatsapp(shop.whatsapp || '');
    setEditIsOpen(shop.isOpen !== false);
    setEditImages(shop.images && shop.images.length > 0 ? shop.images : [shop.image || '/images/store_imtiaz_grocery_1793110437258.jpg']);

    if (currentUser) {
      checkIsFollowing(shop.id, currentUser.uid).then((res) => setIsFollowing(res));
    }
    setLoadingPosts(true);
    fetchShopPosts(shop.id).then((p) => {
      setPosts(p);
      setLoadingPosts(false);
    });
  }, [shop.id, currentUser]);

  useEffect(() => {
    if (userProfile?.name && !reviewName) {
      setReviewName(userProfile.name);
    }
  }, [userProfile?.name]);

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      setFollowNotice('Please sign in to follow this business and receive updates.');
      setTimeout(() => setFollowNotice(null), 3000);
      return;
    }
    if (isOwner) {
      setFollowNotice('You are the owner of this business.');
      setTimeout(() => setFollowNotice(null), 3000);
      return;
    }
    try {
      const res = await toggleFollowShop(shop.id, currentUser.uid, shop.ownerId);
      if (res.error) {
        setFollowNotice(res.error);
        return;
      }
      setIsFollowing(res.isFollowing);
      setFollowersCount(res.newCount);
      if (onShopUpdated) {
        onShopUpdated({ ...shop, followersCount: res.newCount, unlockedBadges: res.newBadges });
      }
      setFollowNotice(res.isFollowing ? 'You are now following this store!' : 'Unfollowed store.');
      setTimeout(() => setFollowNotice(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    const shopUrl = `${window.location.origin}/?shop=${encodeURIComponent(shop.id)}`;
    navigator.clipboard.writeText(shopUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const phoneList = shop.phones && shop.phones.length > 0 ? shop.phones : [shop.phone || '0308-5599766'];
  const primaryOrderPhone = phoneList[shop.orderPhoneIndex || 0] || phoneList[0];

  const handleInAppChat = () => {
    onOpenInAppChat(shop, `Assalam-o-Alaikum ${shop.name}! I am browsing your store on asspas.store.`);
  };

  const handleExternalWhatsApp = () => {
    const cleanPhone = (shop.whatsapp || primaryOrderPhone || '923085599766').replace(/\D/g, '');
    const formatted = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;
    const text = encodeURIComponent(`Assalam-o-Alaikum ${shop.name}! I am contacting you through asspas.store.`);
    window.open(`https://wa.me/${formatted}?text=${text}`, '_blank');
  };

  // Upload additional shop photo inside Edit modal
  const handleShopPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingShopPhoto(true);
    const files = Array.from(e.target.files);
    const uploaded: string[] = [];
    for (const file of files) {
      if (editImages.length + uploaded.length >= maxImagesAllowed) break;
      try {
        const res = await uploadImageToImgBB(file);
        if (res.success && res.url) uploaded.push(res.url);
      } catch {}
    }
    if (uploaded.length > 0) {
      setEditImages((prev) => [...prev, ...uploaded].slice(0, maxImagesAllowed));
    }
    setUploadingShopPhoto(false);
  };

  const handleSaveShopEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEditShop(true);
    const cleanedPhones = editPhones.map((p) => p.trim()).filter(Boolean);
    const safeIdx = editPrimaryIdx < cleanedPhones.length ? editPrimaryIdx : 0;
    const primaryLine = cleanedPhones[safeIdx] || cleanedPhones[0] || shop.phone;

    const updates: Partial<Shop> = {
      name: editName.trim() || shop.name,
      description: editDesc.trim(),
      openingHours: editHours.trim() || 'Hours by Appointment',
      category: editCategory || shop.category,
      subCategory: editSubCategory.trim(),
      shopType: editShopType,
      businessNature: editShopType,
      address: editAddress.trim() || shop.address,
      phones: cleanedPhones,
      phone: primaryLine,
      orderPhone: primaryLine,
      orderPhoneIndex: safeIdx,
      whatsapp: (editWhatsapp || primaryLine).replace(/\D/g, ''),
      isOpen: editIsOpen,
      images: editImages,
      image: editImages[0] || shop.image,
      imageUrl: editImages[0] || shop.image,
    };

    const ok = await updateShopInfo(shop.id, updates);
    setSavingEditShop(false);
    if (ok) {
      if (onShopUpdated) onShopUpdated({ ...shop, ...updates });
      setShowEditModal(false);
      setOwnerStatusNotice('Store profile updated successfully!');
      setTimeout(() => setOwnerStatusNotice(null), 3500);
    }
  };

  // Inventory CRUD
  const openAddProductForm = () => {
    setEditingProductId(null);
    setProdName('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdImage('');
    setProdDesc('');
    setProdInStock(true);
    setShowProductForm(true);
  };

  const openEditProductForm = (item: CatalogItem) => {
    setEditingProductId(item.id);
    setProdName(item.name);
    setProdPrice(String(item.price));
    setProdOriginalPrice(item.originalPrice ? String(item.originalPrice) : '');
    setProdImage(item.image || '');
    setProdDesc(item.description || '');
    setProdInStock(item.inStock !== false);
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice) return;
    setSavingProd(true);

    const existing = shop.catalog || [];
    const newItem: CatalogItem = {
      id: editingProductId || `prod-${Date.now()}`,
      name: prodName.trim(),
      price: Number(prodPrice),
      originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
      image: prodImage.trim() || shop.image,
      description: prodDesc.trim() || undefined,
      inStock: prodInStock,
    };

    const updatedCatalog = editingProductId
      ? existing.map((p) => (p.id === editingProductId ? newItem : p))
      : [...existing, newItem];

    const ok = await updateShopCatalog(shop.id, updatedCatalog);
    setSavingProd(false);
    if (ok) {
      if (onShopUpdated) onShopUpdated({ ...shop, catalog: updatedCatalog });
      setShowProductForm(false);
      setOwnerStatusNotice(editingProductId ? 'Product updated.' : 'Product added to storefront.');
      setTimeout(() => setOwnerStatusNotice(null), 3000);
    }
  };

  const handleToggleProductStock = async (itemId: string) => {
    const updatedCatalog = (shop.catalog || []).map((p) =>
      p.id === itemId ? { ...p, inStock: p.inStock === false } : p
    );
    const ok = await updateShopCatalog(shop.id, updatedCatalog);
    if (ok && onShopUpdated) {
      onShopUpdated({ ...shop, catalog: updatedCatalog });
    }
  };

  const handleDeleteProduct = async (itemId: string) => {
    const updatedCatalog = (shop.catalog || []).filter((p) => p.id !== itemId);
    const ok = await updateShopCatalog(shop.id, updatedCatalog);
    if (ok && onShopUpdated) {
      onShopUpdated({ ...shop, catalog: updatedCatalog });
    }
  };

  // Multi-Image Post Composer & Management
  const handlePostMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingPostMedia(true);
    const files = Array.from(e.target.files);
    const uploaded: string[] = [];
    for (const f of files) {
      try {
        const res = await uploadImageToImgBB(f);
        if (res.success && res.url) uploaded.push(res.url);
      } catch {}
    }
    if (uploaded.length > 0) {
      setPostImages((prev) => [...prev, ...uploaded]);
    }
    setUploadingPostMedia(false);
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !postTitle.trim() || !postCaption.trim()) {
      setPostError('Please provide both a post title and caption.');
      return;
    }

    setPostError(null);
    setPublishingPost(true);

    if (editingPostId) {
      const ok = await updateShopPost(editingPostId, {
        title: postTitle.trim(),
        content: postCaption.trim(),
        images: postImages,
      });
      setPublishingPost(false);
      if (ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === editingPostId
              ? { ...p, title: postTitle.trim(), content: postCaption.trim(), images: postImages }
              : p
          )
        );
        setShowPostForm(false);
        setEditingPostId(null);
        setPostTitle('');
        setPostCaption('');
        setPostImages([]);
        setPostLinkUrl('');
      }
      return;
    }

    const res = await createShopPost(
      {
        shopId: shop.id,
        shopName: shop.name,
        ownerId: currentUser.uid,
        title: postTitle.trim(),
        content: postCaption.trim(),
        images: postImages.length > 0 ? postImages : [shop.image],
        linkUrl: postLinkUrl.trim() || undefined,
      },
      adminSettings?.dailyPostLimit || 5,
      adminSettings?.shopkeeperCanPost !== false
    );

    setPublishingPost(false);
    if (!res.success) {
      setPostError(res.error || 'Could not publish post.');
      return;
    }

    const refreshed = await fetchShopPosts(shop.id);
    setPosts(refreshed);
    setShowPostForm(false);
    setPostTitle('');
    setPostCaption('');
    setPostImages([]);
    setPostLinkUrl('');
  };

  const handleDeletePost = async (postId: string) => {
    const ok = await deleteShopPost(postId);
    if (ok) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    setSubmittingReview(true);

    const newRev = {
      id: `rev-${Date.now()}`,
      userName: reviewName.trim(),
      rating: reviewRating,
      date: new Date().toLocaleDateString(),
      comment: reviewComment.trim(),
    };

    const res = await addShopReviewInDb(
      shop.id,
      newRev,
      shop.reviews || [],
      shop.reviewsCount || 0,
      shop.rating || 4.5
    );

    if (onShopUpdated) {
      onShopUpdated({
        ...shop,
        reviews: res.reviews,
        reviewsCount: res.reviewsCount,
        rating: res.rating,
      });
    }

    setSubmittingReview(false);
    setReviewComment('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3500);
  };

  const directionsUrl =
    shop.coords?.lat && shop.coords?.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${shop.coords.lat},${shop.coords.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${shop.name} ${shop.address} ${shop.city}`
        )}`;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 font-['Poppins']">
      {/* Back button & Action Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>Back to All Stores</span>
        </button>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Shop Profile</span>
            </button>
          )}

          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isFavorite
                ? 'bg-rose-50 border-rose-300 text-rose-600'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="Share store link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            {copiedLink && <span className="text-emerald-700">Copied!</span>}
          </button>
        </div>
      </div>

      {(followNotice || ownerStatusNotice) && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{ownerStatusNotice || followNotice}</span>
        </div>
      )}

      {/* Hero Store Profile Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Image Carousel */}
          <div className="lg:col-span-5 relative bg-slate-900 h-64 sm:h-80 lg:h-auto min-h-[260px] flex items-center justify-center overflow-hidden">
            <img
              src={allImages[activeImageIndex]}
              alt={shop.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/60 px-2 py-1 rounded-full backdrop-blur-xs">
                  {allImages.map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 rounded-full transition-all ${
                        activeImageIndex === i ? 'bg-emerald-400 w-4' : 'bg-white/60 w-2'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                {shop.category}
              </span>
              {shop.subCategory && (
                <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {shop.subCategory}
                </span>
              )}
              {shop.itemType && (
                <span className="bg-slate-900/80 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {shop.itemType === 'both' ? 'Goods & Services' : shop.itemType.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Key Business Facts */}
          <div className="lg:col-span-7 p-5 sm:p-7 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {shop.name}
                  </h1>
                  {shop.verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Merchant
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-xl border border-amber-200 font-bold text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{shop.rating || 4.5}</span>
                  <span className="text-slate-400 font-normal">({shop.reviewsCount || 1})</span>
                </div>
              </div>

              {/* Followers & Nature */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-900 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                  {shop.shopType || 'Retail Store'}
                </span>
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong>{followersCount}</strong> followers</span>
                </div>

                {!isOwner && (
                  <button
                    type="button"
                    onClick={handleFollowToggle}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isFollowing
                        ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                    }`}
                  >
                    {isFollowing ? 'Following' : '+ Follow Store'}
                  </button>
                )}
              </div>

              {/* Location & Opening Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Address & Market:</span>
                    <span>
                      {shop.address}, {shop.marketOrBazar || shop.area}, {shop.city}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Business Hours:</span>
                    <span>{shop.openingHours || 'Hours by Appointment'}</span>
                    <span className={`inline-block ml-1.5 text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      shop.isOpen !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {shop.isOpen !== false ? 'Open Now' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expandable Description */}
              <div className="pt-2">
                <p className={`text-xs text-slate-600 leading-relaxed ${
                  !isDescriptionExpanded ? 'line-clamp-2' : ''
                }`}>
                  {shop.description || 'Welcome to our verified local store on asspas.store. We offer authentic goods and reliable community service.'}
                </p>
                {shop.description && shop.description.length > 120 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline mt-0.5 cursor-pointer"
                  >
                    {isDescriptionExpanded ? 'Read less' : 'Read full description →'}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Action Contact Buttons + Directions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleInAppChat}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>In-App Chat</span>
              </button>

              <button
                type="button"
                onClick={handleExternalWhatsApp}
                className="py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>WhatsApp</span>
              </button>

              <a
                href={`tel:${primaryOrderPhone}`}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors text-center"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call ({primaryOrderPhone})</span>
              </a>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                <span>Directions</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Elegancia Stock Alert Card OR Wholesale Partner Offer */}
      {shop.hasEleganciaWater ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between gap-4 shadow-md flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
              <Droplet className="w-6 h-6 fill-cyan-400 text-cyan-400" />
            </div>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span>Official Elegancia Mineral Water Stockist</span>
                <span className="text-[10px] bg-cyan-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  Certified
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/90 mt-0.5">
                Authentic pure mineral hydration available for immediate pickup or doorstep delivery.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenInAppChat(shop, 'Assalam-o-Alaikum! I want to order Elegancia Mineral Water.')}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl font-black text-xs transition-all shadow-xs cursor-pointer"
          >
            Order Water Now
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <strong className="text-emerald-300">Elegancia Mineral Water Wholesale Partner:</strong>{' '}
              <span className="text-slate-300">
                Shopkeepers can order certified bottled cartons & 19L cans at factory rates.
              </span>
            </div>
          </div>
          <a
            href="https://wa.me/923085599766?text=Assalam-o-Alaikum!%20I%20want%20Elegancia%20Mineral%20Water%20wholesale%20distribution."
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-[11px] shrink-0"
          >
            WhatsApp 0308-5599766
          </a>
        </div>
      )}

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'inventory' ? 'bg-emerald-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products & Inventory ({shop.catalog?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'posts' ? 'bg-emerald-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shop Updates & Posts ({posts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'reviews' ? 'bg-emerald-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Customer Reviews ({shop.reviews?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'about' ? 'bg-emerald-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Map & Contact Details</span>
          </button>
        </div>

        {/* TAB 1: INVENTORY PRODUCTS */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {isOwner && (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                <div className="text-xs text-emerald-950 font-semibold">
                  Owner Catalog Manager: Add new products, update prices, or mark items out of stock.
                </div>
                <button
                  type="button"
                  onClick={openAddProductForm}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>
            )}

            {showProductForm && isOwner && (
              <form onSubmit={handleSaveProduct} className="p-4 bg-white border-2 border-emerald-400 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">
                    {editingProductId ? 'Edit Product Item' : 'Add New Product / Service Item'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowProductForm(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Product Name *"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Selling Price (Rs.) *"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="number"
                    placeholder="Original Price (Optional)"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Short product notes / brand"
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Image URL or upload →"
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <label className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer shrink-0 flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingProdImg ? '...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingProdImg(true);
                          const res = await uploadImageToImgBB(file);
                          if (res.success && res.url) setProdImage(res.url);
                          setUploadingProdImg(false);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodInStock}
                      onChange={(e) => setProdInStock(e.target.checked)}
                      className="accent-emerald-600"
                    />
                    <span>Item Currently In Stock</span>
                  </label>
                  <button
                    type="submit"
                    disabled={savingProd || uploadingProdImg}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {savingProd ? 'Saving...' : editingProductId ? 'Update Item' : 'Save Product'}
                  </button>
                </div>
              </form>
            )}

            {shop.catalog && shop.catalog.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {shop.catalog.map((item) => {
                  const isFavProd = userProfile?.favoriteProducts?.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                    >
                      <div className="relative h-32 bg-slate-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => isOwner && handleToggleProductStock(item.id)}
                          title={isOwner ? 'Click to toggle stock status' : undefined}
                          className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            item.inStock !== false ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white'
                          } ${isOwner ? 'cursor-pointer hover:opacity-90' : ''}`}
                        >
                          {item.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </div>

                      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.name}</h4>
                          {item.description && (
                            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <div>
                              <span className="font-black text-xs text-emerald-700">Rs. {item.price}</span>
                              {item.originalPrice && (
                                <span className="line-through text-slate-400 text-[10px] ml-1">
                                  Rs. {item.originalPrice}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (currentUser) toggleFavoriteProduct(item.id);
                              }}
                              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                                isFavProd ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:text-rose-500'
                              }`}
                              title="Save Product to Favorites"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isFavProd ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                          </div>

                          {isOwner ? (
                            <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => openEditProductForm(item)}
                                className="flex-1 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-[10px] rounded-lg cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(item.id)}
                                className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenInAppChat(
                                  shop,
                                  `Assalam-o-Alaikum ${shop.name}! I want to order "${item.name}" (Rs. ${item.price}).`
                                )
                              }
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                            >
                              Order Item
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-xs text-slate-800">No products uploaded yet</h4>
                <p className="text-[11px] text-slate-500">
                  {isOwner
                    ? 'Click "Add Product" above to list your items with pricing and photos.'
                    : 'Check back soon or chat directly with the store for availability.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SHOP POSTS WITH MULTI-IMAGE CAROUSEL */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {isOwner && (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                <div className="text-xs text-emerald-950 font-semibold">
                  Publish deals & arrivals with multi-photo slides and a single shared caption (Daily limit:{' '}
                  {adminSettings?.dailyPostLimit || 5}).
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPostId(null);
                    setPostTitle('');
                    setPostCaption('');
                    setPostImages([]);
                    setPostLinkUrl('');
                    setPostError(null);
                    setShowPostForm(!showPostForm);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Post</span>
                </button>
              </div>
            )}

            {showPostForm && isOwner && (
              <form onSubmit={handleSubmitPost} className="p-4 bg-white border-2 border-emerald-400 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">
                    {editingPostId ? 'Edit Post' : 'New Multi-Image Store Update'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowPostForm(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {postError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{postError}</span>
                  </div>
                )}

                <input
                  type="text"
                  required
                  placeholder="Post Title (e.g. Eid Collection Arrival / Fresh Water Stock) *"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                />

                <textarea
                  rows={3}
                  required
                  placeholder="Single shared caption describing all photos in this post *"
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />

                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">
                    Post Media Photos ({postImages.length} attached — displays as slide carousel):
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingPostMedia ? 'Uploading...' : 'Upload Multiple Photos'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePostMediaUpload}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste image URL & click Add"
                      value={postImageInput}
                      onChange={(e) => setPostImageInput(e.target.value)}
                      className="flex-1 min-w-[180px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (postImageInput.trim()) {
                          setPostImages((prev) => [...prev, postImageInput.trim()]);
                          setPostImageInput('');
                        }
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>

                  {postImages.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {postImages.map((imgUrl, i) => (
                        <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200">
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPostImages((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <input
                    type="url"
                    placeholder="Optional promo link (https://...)"
                    value={postLinkUrl}
                    onChange={(e) => setPostLinkUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                  <button
                    type="submit"
                    disabled={publishingPost || uploadingPostMedia}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
                  >
                    {publishingPost ? 'Publishing...' : editingPostId ? 'Update Post' : 'Publish Post'}
                  </button>
                </div>
              </form>
            )}

            {loadingPosts ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading posts...</div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{post.title}</h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {isOwner && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPostId(post.id);
                              setPostTitle(post.title);
                              setPostCaption(post.content);
                              setPostImages(post.images || []);
                              setPostLinkUrl(post.linkUrl || '');
                              setShowPostForm(true);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                            title="Delete Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Multi-image carousel slider */}
                    {post.images && post.images.length > 0 && (
                      <PostMediaCarousel images={post.images} title={post.title} />
                    )}

                    {/* Single Shared Caption Below Carousel */}
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {post.content}
                    </p>

                    {post.linkUrl && (
                      <a
                        href={post.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
                      >
                        <span>View linked promotion</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-xs text-slate-800">No posts published yet</h4>
                <p className="text-[11px] text-slate-500">
                  {isOwner
                    ? 'Click "Create Post" above to upload multi-photo promotions and discounts.'
                    : 'This store has not published promotional posts yet.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PERSISTENT CUSTOMER REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 space-y-3">
              {shop.reviews && shop.reviews.length > 0 ? (
                shop.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                          {rev.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{rev.userName}</span>
                          <span className="text-[10px] text-slate-400">{rev.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 pl-9 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                  Be the first customer to review {shop.name}.
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <form onSubmit={handleReviewSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Rate & Review This Business</h4>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name *"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-600 font-medium">Your Rating:</span>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="bg-transparent font-bold text-amber-600 outline-none cursor-pointer"
                  >
                    <option value={5}>★★★★★ (5 Stars)</option>
                    <option value={4}>★★★★☆ (4 Stars)</option>
                    <option value={3}>★★★☆☆ (3 Stars)</option>
                    <option value={2}>★★☆☆☆ (2 Stars)</option>
                    <option value={1}>★☆☆☆☆ (1 Star)</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Share product quality, service speed, and pricing feedback *"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReview ? 'Saving Review...' : 'Submit Verified Review'}</span>
                </button>
                {reviewSuccess && (
                  <p className="text-emerald-700 font-bold text-center">
                    Thank you! Your review has been published.
                  </p>
                )}
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: MAP & CONTACT */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900">Pinned Map Coordinates & Contact Directory</h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-[11px] text-slate-600">
                Latitude: {shop.coords?.lat || 34.0151}, Longitude: {shop.coords?.lng || 71.5249}
              </span>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Google Maps Directions</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Owner / Merchant</span>
                <span className="font-bold text-slate-800">{shop.ownerName || 'Verified Merchant'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Business Nature</span>
                <span className="font-bold text-slate-800">{shop.businessNature || shop.shopType}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Province / City / UC</span>
                <span className="font-bold text-slate-800">
                  {[shop.unionCouncil, shop.marketOrBazar || shop.area, shop.city, shop.province].filter(Boolean).join(', ')}
                </span>
              </div>
            </div>

            {phoneList.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">All Store Phone Lines</span>
                <div className="flex flex-wrap gap-2">
                  {phoneList.map((p, i) => (
                    <a
                      key={i}
                      href={`tel:${p}`}
                      className={`px-3 py-1 rounded-lg border font-bold ${
                        i === (shop.orderPhoneIndex || 0)
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {p} {i === (shop.orderPhoneIndex || 0) ? '(Primary Orders)' : ''}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline Owner Edit Store Modal */}
      {showEditModal && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-600" />
                <h3 className="font-['Outfit'] font-bold text-base text-slate-900">Edit Store Profile & Photos</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveShopEdit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Business Nature</label>
                  <select
                    value={editShopType}
                    onChange={(e) => setEditShopType(e.target.value as Exclude<ShopType, 'All Shops'>)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
                  >
                    <option value="Retail Store">Retail Store</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Producer / Manufacturer">Producer / Manufacturer</option>
                    <option value="Dealer / Distributor">Dealer / Distributor</option>
                    <option value="Restaurant / Cafe">Restaurant / Cafe</option>
                    <option value="Service Provider">Service Provider</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subcategory / Niche</label>
                  <input
                    type="text"
                    value={editSubCategory}
                    onChange={(e) => setEditSubCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address & Landmark</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={editHours}
                    onChange={(e) => setEditHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* 3 Phone numbers + Primary selector */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Phone Lines (Select Primary for Orders)</span>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="editPrimaryPhone"
                      checked={editPrimaryIdx === i}
                      onChange={() => setEditPrimaryIdx(i)}
                      className="accent-emerald-600 cursor-pointer"
                    />
                    <input
                      type="tel"
                      placeholder={`Phone Line ${i + 1}`}
                      value={editPhones[i] || ''}
                      onChange={(e) => {
                        const copy = [...editPhones];
                        copy[i] = e.target.value;
                        setEditPhones(copy);
                      }}
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Store Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                />
              </div>

              {/* Storefront Images Manager */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Storefront Photos ({editImages.length} / {maxImagesAllowed})</span>
                  </span>
                  <label className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer">
                    {uploadingShopPhoto ? 'Uploading...' : '+ Add Photo'}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleShopPhotoUpload} />
                  </label>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {editImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200">
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      {editImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setEditImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">Current Store Status</span>
                <button
                  type="button"
                  onClick={() => setEditIsOpen(!editIsOpen)}
                  className={`px-3 py-1 rounded-lg font-bold text-white cursor-pointer ${
                    editIsOpen ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {editIsOpen ? 'Open Now' : 'Closed'}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEditShop}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {savingEditShop ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

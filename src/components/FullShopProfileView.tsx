import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Phone, 
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
  Award,
  Edit,
  Sparkles,
  Info
} from 'lucide-react';
import { Shop, CatalogItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { toggleFollowShop, checkIsFollowing } from '../services/shopService';
import { fetchShopPosts } from '../services/shopService';

interface FullShopProfileViewProps {
  shop: Shop;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenInAppChat: (shop: Shop, initialMsg?: string) => void;
  onEditShop?: (shop: Shop) => void;
}

export const FullShopProfileView: React.FC<FullShopProfileViewProps> = ({
  shop,
  onBack,
  isFavorite,
  onToggleFavorite,
  onOpenInAppChat,
  onEditShop,
}) => {
  const { currentUser, userProfile, toggleFavoriteProduct } = useAuth();
  
  // Carousel and media
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Follower tracking
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(shop.followersCount || 0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(shop.unlockedBadges || []);
  const [followNotice, setFollowNotice] = useState<string | null>(null);

  // Shop posts
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'inventory' | 'posts' | 'about'>('inventory');

  const allImages = shop.images && shop.images.length > 0 ? shop.images : [shop.image];

  const isOwner = currentUser && (shop.ownerId === currentUser.uid || shop.ownerName === userProfile?.name);

  useEffect(() => {
    setFollowersCount(shop.followersCount || 0);
    setUnlockedBadges(shop.unlockedBadges || []);
    setActiveImageIndex(0);
    if (currentUser) {
      checkIsFollowing(shop.id, currentUser.uid).then((res) => setIsFollowing(res));
    }
    setLoadingPosts(true);
    fetchShopPosts(shop.id).then((p) => {
      setPosts(p);
      setLoadingPosts(false);
    });
  }, [shop, currentUser]);

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      setFollowNotice('Please sign in to follow this business and receive news updates.');
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
      setUnlockedBadges(res.newBadges);
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

  const handleInAppChat = () => {
    onOpenInAppChat(shop, `Assalam-o-Alaikum ${shop.name}! I am browsing your store on asspas.store.`);
  };

  const handleExternalWhatsApp = () => {
    const phone = shop.whatsapp || '923085599766';
    const text = encodeURIComponent(`Assalam-o-Alaikum ${shop.name}! I am contacting you through asspas.store.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 font-['Poppins']">
      {/* Back button & Title Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>Back to All Stores</span>
        </button>

        <div className="flex items-center gap-2">
          {isOwner && onEditShop && (
            <button
              onClick={() => onEditShop(shop)}
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
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer"
            title="Share store link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {followNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{followNotice}</span>
        </div>
      )}

      {/* Hero Store Profile Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Image Carousel (5 cols) */}
          <div className="lg:col-span-5 relative bg-slate-900 h-64 sm:h-80 lg:h-auto min-h-[260px] flex items-center justify-center overflow-hidden">
            <img
              src={allImages[activeImageIndex]}
              alt={shop.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

            {/* Carousel navigation controls */}
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
                {/* Dots indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/60 px-2 py-1 rounded-full backdrop-blur-xs">
                  {allImages.map((_, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeImageIndex === i ? 'bg-emerald-400 w-4' : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badges on Image */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                {shop.category}
              </span>
              {shop.itemType && (
                <span className="bg-slate-900/80 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {shop.itemType === 'both' ? 'Goods & Services' : shop.itemType.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Key Business Facts (7 cols) */}
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

              {/* Followers badge & Action */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong>{followersCount}</strong> community followers</span>
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
                    {isFollowing ? 'Following ✓' : '+ Follow Store'}
                  </button>
                )}
              </div>

              {/* Location & Opening Hours details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Address & Market:</span>
                    <span>{shop.address}, {shop.area || shop.city}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Business Hours:</span>
                    <span>{shop.openingHours || '9:00 AM - 10:00 PM'}</span>
                    <span className={`inline-block ml-1.5 text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      shop.isOpen !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {shop.isOpen !== false ? 'Open Now' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expandable Store Description */}
              <div className="pt-2">
                <p className={`text-xs text-slate-600 leading-relaxed ${
                  !isDescriptionExpanded ? 'line-clamp-2' : ''
                }`}>
                  {shop.description || 'Welcome to our verified local store on asspas.store. We offer premium goods and dependable community services.'}
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

            {/* Quick Action Contact Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleInAppChat}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>In-App Chat</span>
              </button>

              <button
                type="button"
                onClick={handleExternalWhatsApp}
                className="py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>WhatsApp</span>
              </button>

              <a
                href={`tel:${shop.phone || '03085599766'}`}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer text-center"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Store</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Elegancia Water Stock Alert Card */}
      {shop.hasEleganciaWater && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between gap-4 shadow-md flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
              <Droplet className="w-6 h-6 fill-cyan-400 text-cyan-400" />
            </div>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span>Official Elegancia Mineral Water Stockist</span>
                <span className="text-[10px] bg-cyan-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  100% Certified
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/90 mt-0.5">
                Authentic pure mineral hydration available for immediate pickup or delivery.
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
      )}

      {/* Tabs: Inventory Products vs Shop Posts vs Location Map */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-emerald-800 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Store Products & Inventory ({shop.catalog?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'posts'
                ? 'bg-emerald-800 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shop Updates & Posts ({posts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'about'
                ? 'bg-emerald-800 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Map & Contact Details</span>
          </button>
        </div>

        {/* TAB 1: INVENTORY PRODUCTS */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {shop.catalog && shop.catalog.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {shop.catalog.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                  >
                    <div className="relative h-32 bg-slate-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                      <span
                        className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          item.inStock !== false ? 'bg-emerald-600 text-white' : 'bg-slate-500 text-white'
                        }`}
                      >
                        {item.inStock !== false ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.name}</h4>
                        {item.description && (
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <div className="font-black text-xs text-emerald-700">
                          Rs. {item.price}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (currentUser) {
                              toggleFavoriteProduct(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Save Product to Favorites"
                        >
                          <Heart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-xs text-slate-800">No products uploaded yet</h4>
                <p className="text-[11px] text-slate-500">
                  {isOwner 
                    ? 'Use the Merchant Dashboard to list your inventory products with pricing and photos.' 
                    : 'Check back soon or chat directly with the store for availability.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SHOP POSTS */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">{post.title}</h4>
                      <span className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{post.content}</p>

                    {/* Post multi-images */}
                    {post.images && post.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {post.images.map((imgUrl: string, idx: number) => (
                          <img
                            key={idx}
                            src={imgUrl}
                            alt="Post asset"
                            className="w-full h-36 object-cover rounded-xl border border-slate-100"
                          />
                        ))}
                      </div>
                    )}

                    {post.linkUrl && (
                      <a
                        href={post.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
                      >
                        <span>View linked product / promotion</span>
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
                    ? 'Publish new arrivals, discounts, and promotional photos in your store dashboard.' 
                    : 'The store has not published promotional posts yet.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MAP & CONTACT */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900">Map & Coordinates</h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="font-mono text-[11px] text-slate-600">
                  Latitude: {shop.coords?.lat || 34.0151}, Longitude: {shop.coords?.lng || 71.5249}
                </span>
              </div>
              <a
                href={`https://www.google.com/maps?q=${shop.coords?.lat || 34.0151},${shop.coords?.lng || 71.5249}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open in Google Maps ↗</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Owner / Merchant Name</span>
                <span className="font-bold text-slate-800">{shop.ownerName || 'Verified Merchant'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Business Nature</span>
                <span className="font-bold text-slate-800">{shop.businessNature || shop.shopType}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

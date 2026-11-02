import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Heart, 
  Star, 
  Navigation, 
  Droplet, 
  CheckCircle2, 
  User, 
  Share2,
  Send,
  Users,
  Award,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  ExternalLink,
  Package,
  ShoppingBag,
  Check
} from 'lucide-react';
import { Shop, CatalogItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { toggleFollowShop, checkIsFollowing } from '../services/shopService';

interface ShopDetailModalProps {
  shop: Shop | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddReview: (shopId: string, review: { userName: string; rating: number; comment: string }) => void;
  onShopUpdated?: (updatedShop: Shop) => void;
  onOpenAuth?: () => void;
  onOpenInAppChat?: (shop: Shop, initialMsg?: string) => void;
}

export const ShopDetailModal: React.FC<ShopDetailModalProps> = ({
  shop,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddReview,
  onShopUpdated,
  onOpenAuth,
  onOpenInAppChat,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [userName, setUserName] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Follower state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(shop?.followersCount || 0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(shop?.unlockedBadges || []);
  const [followNotice, setFollowNotice] = useState<string | null>(null);

  useEffect(() => {
    if (shop) {
      setFollowersCount(shop.followersCount || 0);
      setUnlockedBadges(shop.unlockedBadges || []);
      setActiveImageIndex(0);
      if (currentUser) {
        checkIsFollowing(shop.id, currentUser.uid).then((res) => setIsFollowing(res));
      } else {
        setIsFollowing(false);
      }
    }
  }, [shop, currentUser]);

  if (!shop) return null;

  // Prepare images list (with carousel support)
  const allImages = shop.images && shop.images.length > 0 
    ? shop.images 
    : [shop.image];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      setFollowNotice('Please sign in with Google to follow this business and receive updates.');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (shop.ownerId && shop.ownerId === currentUser.uid) {
      setFollowNotice('You are registered as the owner of this business. Self-following is disabled.');
      setTimeout(() => setFollowNotice(null), 3500);
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

      if (onShopUpdated) {
        onShopUpdated({
          ...shop,
          followersCount: res.newCount,
          unlockedBadges: res.newBadges,
        });
      }

      setFollowNotice(res.isFollowing ? 'You are now following this local store!' : 'Unfollowed store.');
      setTimeout(() => setFollowNotice(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWhatsApp = (inquiryType = 'general') => {
    let text = `Assalam-o-Alaikum ${shop.name}! I found your store on asspas.store.`;
    if (inquiryType === 'water') {
      text = `Assalam-o-Alaikum ${shop.name}! I am looking for *Elegancia Mineral Water* delivery/pickup via asspas.store. Do you have stock available?`;
    }

    // If in-app chat is available, trigger in-app chat drawer
    if (onOpenInAppChat) {
      onOpenInAppChat(shop, text);
    } else {
      const phone = shop.whatsapp || '923085599766';
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: shop.name,
        text: `Check out ${shop.name} on asspas.store! Located at ${shop.address}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `${shop.name} - ${shop.address}, ${shop.city} on asspas.store: https://asspas.store/shop/${shop.id}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleOrderProduct = (productName: string, price: number) => {
    const text = `Assalam-o-Alaikum ${shop.name}! I would like to order "${productName}" (Rs. ${price}) from your store on asspas.store. Please confirm price, delivery, and stock.`;
    if (onOpenInAppChat) {
      onOpenInAppChat(shop, text);
    } else {
      const raw = primaryOrderPhone.replace(/[^0-9]/g, '');
      const phone = raw.startsWith('0') ? '92' + raw.slice(1) : (raw || '923085599766');
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userComment.trim()) return;

    onAddReview(shop.id, {
      userName: userName.trim(),
      rating: userRating,
      comment: userComment.trim(),
    });

    setUserName('');
    setUserComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  // Determine active order phone from available phone numbers
  const phoneList = shop.phones && shop.phones.length > 0 ? shop.phones : [shop.phone || '0308-5599766'];
  const primaryOrderPhone = phoneList[shop.orderPhoneIndex || 0] || phoneList[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 font-['Poppins']">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Hero Carousel Image */}
        <div className="relative h-48 sm:h-64 w-full bg-slate-900 shrink-0">
          <img
            src={allImages[activeImageIndex] || shop.image}
            alt={shop.name}
            className="w-full h-full object-cover opacity-90 transition-all duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Carousel Left / Right Arrows when multiple pictures exist */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center cursor-pointer border border-white/20 transition-all active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center cursor-pointer border border-white/20 transition-all active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute top-12 right-3 bg-slate-950/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10">
                {activeImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}

          {/* Top action row */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-emerald-600/95 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {shop.category}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md text-white ${
                  shop.itemType === 'services'
                    ? 'bg-blue-600'
                    : shop.itemType === 'both'
                    ? 'bg-purple-600'
                    : 'bg-emerald-700'
                }`}
              >
                {shop.itemType || 'goods'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
                title="Share Store"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleFavorite}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
                title="Save Favorite"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero text overlay */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2">
              <h2 className="font-['Outfit'] text-xl sm:text-2xl font-black tracking-tight drop-shadow-md">
                {shop.name}
              </h2>
              {shop.verified && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-900/60 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200 mt-1 flex-wrap">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                ★ {shop.rating} ({shop.reviewsCount} reviews)
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {shop.distance} km away ({shop.area}, {shop.city})
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-white font-semibold">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                {followersCount} Community Followers
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {followNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{followNotice}</span>
            </div>
          )}

          {copiedLink && (
            <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-200">
              Store info copied to clipboard!
            </div>
          )}

          {/* Follower Bar & Community Unlocks */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-slate-900 text-xs">
                  {followersCount} Local Patrons & Followers
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {unlockedBadges.length > 0 ? (
                  unlockedBadges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg"
                    >
                      <Award className="w-3 h-3 text-amber-600" />
                      {badge}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-500">
                    Reach 10 followers to unlock the Bronze Community Choice badge!
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleFollowToggle}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                isFollowing
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              {isFollowing ? 'Following' : 'Follow Business'}
            </button>
          </div>

          {/* Primary Quick Actions Bar (In-App WhatsApp + Call + Directions) */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => handleWhatsApp('general')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>In-App Chat</span>
            </button>
            <a
              href={`tel:${primaryOrderPhone}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call ({primaryOrderPhone})</span>
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${shop.name} ${shop.address} ${shop.city}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 transition-all"
            >
              <Navigation className="w-4 h-4 text-emerald-700" />
              <span>Directions</span>
            </a>
          </div>

          {/* Additional Contact Numbers If Present */}
          {phoneList.length > 1 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 block">
                Additional Shop Contact Lines:
              </span>
              <div className="flex flex-wrap gap-2">
                {phoneList.map((p, idx) => (
                  <a
                    key={idx}
                    href={`tel:${p}`}
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium ${
                      idx === (shop.orderPhoneIndex || 0)
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{p}</span>
                    {idx === (shop.orderPhoneIndex || 0) && (
                      <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">
                        Primary Orders
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs mb-1.5 uppercase tracking-wider">
              About This Business
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {shop.description}
            </p>
          </div>

          {/* Product Catalog & Inventory Section (Items 6r & 6s) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Products & Price Catalog ({shop.catalog?.length || 0})</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Direct WhatsApp Order Available
              </span>
            </div>

            {shop.catalog && shop.catalog.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shop.catalog.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-slate-200 rounded-2xl hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-xs text-slate-900 truncate">
                          {item.name}
                        </h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-black text-emerald-700 text-sm">
                            Rs. {item.price}
                          </span>
                          {item.originalPrice && (
                            <span className="line-through text-slate-400 text-xs">
                              Rs. {item.originalPrice}
                            </span>
                          )}
                        </div>
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                          item.inStock !== false ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {item.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOrderProduct(item.name, item.price)}
                      className="mt-3 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-98"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Order on WhatsApp (Rs. {item.price})</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                <Package className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                <span>Call or chat via WhatsApp to request daily inventory & custom orders.</span>
              </div>
            )}
          </div>

          {/* Elegancia Water Stockist Badge */}
          {shop.hasEleganciaWater && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">Official Elegancia Mineral Water Stockist</span>
                </div>
                <button
                  onClick={() => handleWhatsApp('water')}
                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Order Water
                </button>
              </div>
              <p className="text-[11px] text-emerald-200 leading-relaxed">
                Guaranteed genuine Elegancia mineral water supplied directly from licensed springs. 
                Doorstep delivery and dispenser refills available for homes and corporate offices.
              </p>
              {shop.eleganciaDetails && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {shop.eleganciaDetails.types?.map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-white/15 px-2 py-0.5 rounded text-[10px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                  {shop.eleganciaDetails.isChilled && (
                    <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded text-[10px] font-bold">
                      ❄ Chilled Available
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Customer Reviews Section */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Community Reviews ({shop.reviews?.length || 0})
            </h4>

            {shop.reviews && shop.reviews.length > 0 ? (
              <div className="space-y-2.5">
                {shop.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                          {rev.userName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 text-xs">
                          {rev.userName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Be the first to leave a verified review for {shop.name}!
              </p>
            )}

            {/* Leave a review form */}
            <form onSubmit={handleReviewSubmit} className="pt-2 space-y-2.5">
              <span className="text-xs font-bold text-slate-800 block">
                Rate & Review This Business:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs text-slate-500 font-medium">Rating:</span>
                  <select
                    value={userRating}
                    onChange={(e) => setUserRating(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold text-amber-600 outline-none cursor-pointer"
                  >
                    <option value={5}>★★★★★ (5 Stars)</option>
                    <option value={4}>★★★★☆ (4 Stars)</option>
                    <option value={3}>★★★☆☆ (3 Stars)</option>
                    <option value={2}>★★☆☆☆ (2 Stars)</option>
                    <option value={1}>★☆☆☆☆ (1 Star)</option>
                  </select>
                </div>
              </div>
              <textarea
                placeholder="Share your experience (quality, prices, delivery speed)..."
                rows={2}
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Verified Feedback</span>
              </button>
              {reviewSubmitted && (
                <span className="text-xs font-bold text-emerald-600 block">
                  Thank you! Your review has been added.
                </span>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

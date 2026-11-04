import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Gift, 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Store, 
  Heart, 
  Clock, 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  Users, 
  ChevronRight, 
  ExternalLink, 
  HelpCircle, 
  MessageSquare, 
  Download, 
  Camera, 
  Edit3, 
  Save, 
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Package
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, Shop, SupportTicket, PointTransaction, ReferralNode } from '../types';
import { useAuth } from '../context/AuthContext';
import { getReferralLink, generateQrCodeDataUrl, fetchUserReferralTree, fetchUserPointsLedger, calculateStarLevel } from '../services/referralService';
import { uploadImageToImgBB } from '../services/imageUploadService';
import { fetchUserSupportTickets, createSupportTicket } from '../services/supportService';
import { PAKISTAN_REGIONS } from '../data/pakistanRegions';

interface UserProfileViewProps {
  user: UserProfile;
  shops: Shop[];
  onOpenAddShop: () => void;
  onSelectShop: (shop: Shop) => void;
  onOpenShopDetails: (shop: Shop) => void;
  onBackToHome: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  shops,
  onOpenAddShop,
  onSelectShop,
  onOpenShopDetails,
  onBackToHome,
}) => {
  const { updateUserProfile, logout, isAdmin } = useAuth();
  
  // Navigation tabs inside full-page profile
  const [activeProfileTab, setActiveProfileTab] = useState<
    'overview' | 'referrals' | 'points' | 'shops' | 'favorites' | 'support'
  >('overview');

  // Edit profile form state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name || '');
  const [editPhone, setEditPhone] = useState(user.phone || '');
  const [editAddress, setEditAddress] = useState(user.address || '');
  const [editProvince, setEditProvince] = useState(user.province || 'Khyber Pakhtunkhwa (KP)');
  const [editCity, setEditCity] = useState(user.city || 'Peshawar');
  const [editArea, setEditArea] = useState(user.area || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Referral & QR Code state
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralTree, setReferralTree] = useState<ReferralNode | null>(null);
  const [pointsLedger, setPointsLedger] = useState<PointTransaction[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Support / Complaint Ticket Form state
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([]);
  const [ticketType, setTicketType] = useState<'complaint' | 'feedback' | 'suggestion'>('feedback');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  const referralUrl = getReferralLink(user.referralCode);

  // Load QR code and Referral Tree
  useEffect(() => {
    generateQrCodeDataUrl(referralUrl).then((url) => setQrCodeDataUrl(url));
    if (user.id) {
      fetchUserReferralTree(user.id, user.referralCode).then((tree) => setReferralTree(tree));
      setLoadingLedger(true);
      fetchUserPointsLedger(user.id).then((txs) => {
        setPointsLedger(txs);
        setLoadingLedger(false);
      });
      fetchUserSupportTickets(user.id).then((t) => setUserTickets(t));
    }
  }, [user.id, referralUrl, user.referralCode]);

  // Compute profile completion percentage
  const calculateProfileCompletion = () => {
    let score = 0;
    if (user.name) score += 20;
    if (user.email) score += 20;
    if (user.phone) score += 20;
    if (user.city) score += 15;
    if (user.address || user.area) score += 15;
    if (user.photoURL) score += 10;
    return score;
  };

  const completionPercent = calculateProfileCompletion();

  // Star progression calculation
  const directCount = user.referredCount || 0;
  const currentStar = user.starLevel || calculateStarLevel(directCount, []);
  const neededForNextStar = 3 - (directCount % 3);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeDataUrl;
    a.download = `asspas-referral-qr-${user.referralCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUserProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        province: editProvince,
        city: editCity,
        area: editArea.trim(),
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploadingPhoto(true);
        const res = await uploadImageToImgBB(file);
        if (res.success && res.url) {
          await updateUserProfile({ photoURL: res.url });
          try {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          } catch {}
        }
      } catch (err) {
        console.warn('Photo upload failed:', err);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setSubmittingTicket(true);
    try {
      const res = await createSupportTicket({
        userId: user.id,
        userName: user.name || 'Member',
        userEmail: user.email || '',
        userPhone: user.phone || '',
        type: ticketType,
        subject: ticketSubject.trim(),
        message: ticketMessage.trim(),
      });
      if (res.success) {
        setTicketSuccess('Your message was successfully received by the asspas.store support team. You will receive an update shortly.');
        setTicketSubject('');
        setTicketMessage('');
        const freshTickets = await fetchUserSupportTickets(user.id);
        setUserTickets(freshTickets);
        setTimeout(() => setTicketSuccess(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTicket(false);
    }
  };

  const userShops = shops.filter((s) => s.ownerId === user.id || s.ownerName === user.name);
  const favoriteShops = shops.filter((s) => (user.favorites || []).includes(s.id));

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 font-['Poppins']">
      {/* Top Breadcrumb & Profile Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Avatar & Core Info */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className="relative group shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-emerald-500/80 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-emerald-700 text-white font-extrabold text-3xl flex items-center justify-center ring-4 ring-emerald-500/80 shadow-lg">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
              <label 
                title="Update Profile Picture"
                className="absolute inset-0 bg-slate-950/70 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[11px] font-bold"
              >
                <Camera className="w-5 h-5 mb-1" />
                <span>{uploadingPhoto ? 'Uploading...' : 'Change'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">
                  {user.name || 'Community Member'}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Verified Account
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Super Admin
                  </span>
                )}
              </div>

              <div className="text-xs text-emerald-200/90 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-300" />
                  {user.email || 'No email attached'}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-300" />
                    {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  {user.city || 'Peshawar'}, {user.province || 'KP'}
                </span>
              </div>

              {/* Profile Completion Bar */}
              <div className="pt-2 max-w-xs">
                <div className="flex items-center justify-between text-[10px] text-emerald-200 mb-1">
                  <span>Profile Completion</span>
                  <span className="font-bold">{completionPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-emerald-950 rounded-full overflow-hidden border border-emerald-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Highlights: Points, Star Level & Quick Action */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* PTS Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 min-w-[130px] text-center shadow-xs">
              <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block">
                Total Balance
              </span>
              <div className="text-2xl font-black text-white tabular-nums flex items-center justify-center gap-1">
                <span>{user.points || 0}</span>
                <span className="text-xs text-emerald-400 font-bold">PTS</span>
              </div>
              <span className="text-[9px] text-emerald-200/80 block mt-0.5" title="PTS stands for Points - Loyalty Points earned through referrals & business registrations.">
                Points (PTS) Active
              </span>
            </div>

            {/* Star Matrix Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 min-w-[130px] text-center shadow-xs">
              <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block">
                Community Rank
              </span>
              <div className="text-2xl font-black text-amber-300 flex items-center justify-center gap-1">
                <span>★ {currentStar}</span>
                <span className="text-xs text-amber-200">Star</span>
              </div>
              <span className="text-[9px] text-emerald-200/80 block mt-0.5">
                {directCount} Direct Invites
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveProfileTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeProfileTab === 'overview'
              ? 'bg-emerald-800 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Details & Edit</span>
        </button>

        <button
          onClick={() => setActiveProfileTab('referrals')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeProfileTab === 'referrals'
              ? 'bg-emerald-800 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Referral Link & 3x3 Star Matrix</span>
        </button>

        <button
          onClick={() => setActiveProfileTab('points')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeProfileTab === 'points'
              ? 'bg-emerald-800 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Points Ledger (PTS Explained)</span>
        </button>

        <button
          onClick={() => setActiveProfileTab('shops')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeProfileTab === 'shops'
              ? 'bg-emerald-800 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>My Shops ({userShops.length})</span>
        </button>

        <button
          onClick={() => setActiveProfileTab('favorites')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeProfileTab === 'favorites'
              ? 'bg-emerald-800 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Favorites ({favoriteShops.length})</span>
        </button>

        <button
          onClick={() => setActiveProfileTab('support')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeProfileTab === 'support'
              ? 'bg-emerald-800 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Complaints & Suggestions ({userTickets.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PERSONAL INFORMATION */}
      {activeProfileTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Profile details successfully updated and saved to database!</span>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Personal Information</h3>
                  <p className="text-[11px] text-slate-500">Your registered contact and regional address details.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                      Full Name
                    </span>
                    <span className="font-semibold text-slate-800 text-xs">{user.name || 'Not provided'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                      Email Address
                    </span>
                    <span className="font-semibold text-slate-800 text-xs truncate">{user.email || 'Not provided'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                      Phone Number
                    </span>
                    <span className="font-semibold text-slate-800 text-xs">{user.phone || 'Not provided'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                      Province
                    </span>
                    <span className="font-semibold text-slate-800 text-xs">{user.province || 'Khyber Pakhtunkhwa (KP)'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                      City
                    </span>
                    <span className="font-semibold text-slate-800 text-xs">{user.city || 'Peshawar'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                      Area / Market / Sector
                    </span>
                    <span className="font-semibold text-slate-800 text-xs">{user.area || 'Not provided'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                      Street Address
                    </span>
                    <span className="font-semibold text-slate-800 text-xs">{user.address || 'Not provided'}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Full Name *
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Mobile Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0300-1234567"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Province *
                      </label>
                      <select
                        value={editProvince}
                        onChange={(e) => {
                          setEditProvince(e.target.value);
                          const prov = PAKISTAN_REGIONS.find((p) => p.name === e.target.value);
                          if (prov && prov.cities.length > 0) {
                            setEditCity(prov.cities[0].name);
                          }
                        }}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      >
                        {PAKISTAN_REGIONS.map((prov) => (
                          <option key={prov.code} value={prov.name}>
                            {prov.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        City *
                      </label>
                      <select
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      >
                        {(PAKISTAN_REGIONS.find((p) => p.name === editProvince)?.cities || []).map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Area / Sector
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Saddar or Hayatabad"
                        value={editArea}
                        onChange={(e) => setEditArea(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. House 4, Street 10"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: QR Code & Quick Referral Card */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-900">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Your Referral QR Code</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Scan or share this QR code directly with local shops and neighbors.
              </p>

              <div className="flex justify-center p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Referral QR Code"
                    className="w-48 h-48 rounded-xl shadow-xs"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download QR</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Quick stats box */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-md space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                Account Status
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Referral Code:</span>
                  <span className="font-mono font-bold text-white select-all">{user.referralCode}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Referred By:</span>
                  <span className="font-semibold text-emerald-300">{user.referredBy || 'Direct Community Registration'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Registered Shops:</span>
                  <span className="font-bold text-white">{userShops.length} Stores</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REFERRAL NETWORK & 3X3 STAR MATRIX */}
      {activeProfileTab === 'referrals' && (
        <div className="space-y-6">
          {/* Referral Link & Social Sharing Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Your Shareable Referral Link</h3>
              <p className="text-xs text-slate-500">
                Invite neighbors, family, and local store owners. No code needed—when they click your link, attribution is 100% automatic!
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-700 select-all truncate">
                {referralUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied Link' : 'Copy Referral Link'}</span>
              </button>
            </div>

            {/* Social 1-Click Sharing */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-600 block mb-2 uppercase tracking-wider">
                Instant 1-Click Social Sharing:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const text = `Assalam-o-Alaikum! Join asspas.store to discover verified shops in Pakistan, locate nearby businesses, and get genuine Elegancia Mineral Water! 🎁 Register via my referral link to get 50 Free Welcome Points: ${referralUrl}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-transform active:scale-95"
                >
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`, '_blank');
                  }}
                  className="py-2.5 px-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-transform active:scale-95"
                >
                  <span>Facebook</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(referralUrl);
                    alert('Referral link copied! Paste it in your Instagram story link sticker or bio.');
                  }}
                  className="py-2.5 px-3 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-transform active:scale-95"
                >
                  <span>Instagram</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const text = `Find verified stores & pure Elegancia water in Pakistan on asspas.store! 50 Free Welcome Points via my link: ${referralUrl}`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-transform active:scale-95"
                >
                  <span>X / Twitter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Star Progression Ladder (1 to 10 Stars) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>3x3 Star Matrix Progression (1 to 10 Stars)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Each user has 3 direct children slots. 3 direct referrals unlock 1 Star. When all 3 children attain 1 Star, you advance to 2 Stars!
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-300 text-amber-900 px-3.5 py-1.5 rounded-xl font-black text-xs">
                Current Rank: ★ {currentStar} Star Leader
              </div>
            </div>

            {/* Visual 10 Star Track */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 text-center pt-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((starNum) => {
                const isAchieved = currentStar >= starNum;
                const isCurrent = currentStar === starNum - 1;
                return (
                  <div
                    key={starNum}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isAchieved
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-xs'
                        : isCurrent
                        ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold animate-pulse'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    <div className="text-sm font-black flex items-center justify-center">
                      ★ {starNum}
                    </div>
                    <span className="text-[9px] block uppercase mt-0.5">
                      {isAchieved ? 'Earned' : isCurrent ? 'Next' : 'Locked'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Next Star Progress Callout */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between flex-wrap gap-2">
              <span>
                You currently have <strong>{directCount} direct registrations</strong>. 
                {neededForNextStar > 0 && directCount < 3
                  ? ` Invite ${neededForNextStar} more direct members to unlock ★ 1 Star!`
                  : ` Help your direct referrals grow their network to advance further!`}
              </span>
              <span className="font-bold text-emerald-800">
                Reward: 50 PTS per direct member + 50 PTS when they create a shop
              </span>
            </div>
          </div>

          {/* 3x3 Downline Network List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Your Direct 3-Slot Downline Matrix ({referralTree?.children.length || 0}/3 filled)</span>
            </h3>

            {referralTree && referralTree.children.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {referralTree.children.map((child, idx) => (
                  <div key={child.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                        Slot #{child.matrixSlot || idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {child.joinedDate}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-xs">{child.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{child.referralCode}</div>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-200/60">
                      <span>Shops Created:</span>
                      <span className="font-bold text-emerald-700">{child.shopsCreated || 0} Stores</span>
                    </div>
                  </div>
                ))}
                {/* Empty slots placeholders */}
                {Array.from({ length: Math.max(0, 3 - referralTree.children.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-3.5 bg-dashed border-2 border-slate-200 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <Users className="w-6 h-6 mb-1 text-slate-300" />
                    <span className="text-xs font-semibold">Available Matrix Slot #{referralTree.children.length + i + 1}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Share link to fill slot</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300" />
                <h4 className="font-bold text-slate-800 text-xs">No direct downline registrations yet</h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Send your referral link to friends or WhatsApp community groups to start filling your 3 matrix slots.
                </p>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Copy Referral Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: POINTS LEDGER (PTS EXPLAINED) */}
      {activeProfileTab === 'points' && (
        <div className="space-y-6">
          {/* PTS Meaning & Explanation Card */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-300" />
              <h3 className="text-base font-black tracking-tight text-white">
                What does "PTS" stand for on asspas.store?
              </h3>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              <strong>PTS stands for Points</strong>—the official digital loyalty & reward currency of <strong>asspas.store</strong>.
              Members earn PTS by welcoming verified neighbors, publishing local business stores, and referring customers to authentic
              Elegancia Mineral Water.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                <span className="text-emerald-300 font-bold block text-[11px]">Direct Referral Bonus</span>
                <span className="text-lg font-black text-white">+50 PTS</span>
                <span className="text-[10px] text-emerald-200 block">Awarded instantly when someone joins via your link</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                <span className="text-emerald-300 font-bold block text-[11px]">Referred Member Creates Shop</span>
                <span className="text-lg font-black text-white">+50 PTS</span>
                <span className="text-[10px] text-emerald-200 block">Bonus when a direct child registers their first store</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                <span className="text-emerald-300 font-bold block text-[11px]">Create Your Own Shop</span>
                <span className="text-lg font-black text-white">+100 PTS</span>
                <span className="text-[10px] text-emerald-200 block">Special welcome merchant bonus</span>
              </div>
            </div>
          </div>

          {/* Points Transactions History Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Points Activity Ledger</h3>
                <p className="text-[11px] text-slate-500">Immutable record of every credit and debit to your account.</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Balance</span>
                <span className="text-lg font-black text-emerald-700">{user.points || 0} PTS</span>
              </div>
            </div>

            {loadingLedger ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading transactions ledger...</div>
            ) : pointsLedger.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {pointsLedger.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-semibold text-slate-800 truncate">{tx.title}</div>
                      <div className="text-[10px] text-slate-400">{tx.date}</div>
                    </div>
                    <div
                      className={`font-black text-sm shrink-0 ${
                        tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} PTS
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">No point transactions recorded yet.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MY REGISTERED SHOPS */}
      {activeProfileTab === 'shops' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-black text-base text-slate-900">Your Registered Businesses</h3>
              <p className="text-xs text-slate-500">Manage your shops, inventory, images, and daily posts.</p>
            </div>
            <button
              type="button"
              onClick={onOpenAddShop}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New Shop (+100 PTS)</span>
            </button>
          </div>

          {userShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userShops.map((shop) => (
                <div key={shop.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-all flex flex-col">
                  <div className="relative h-40 bg-slate-100">
                    <img
                      src={shop.image}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {shop.category}
                    </span>
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      shop.status === 'approved' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
                    }`}>
                      {shop.status || 'Active'}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 truncate">{shop.name}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{shop.address}, {shop.city}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => onOpenShopDetails(shop)}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] transition-colors cursor-pointer text-center"
                      >
                        View Public Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectShop(shop)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer text-center"
                      >
                        Manage Store
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <Store className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">No businesses registered yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Establish your presence on asspas.store to get discovered by local customers, sell Elegancia water, and receive +100 PTS!
              </p>
              <button
                type="button"
                onClick={onOpenAddShop}
                className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Register Your Shop Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SAVED FAVORITES */}
      {activeProfileTab === 'favorites' && (
        <div className="space-y-5">
          <div>
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>Saved Favorite Businesses ({favoriteShops.length})</span>
            </h3>
            <p className="text-xs text-slate-500">Quick access to bookmarked stores and service providers in your neighborhood.</p>
          </div>

          {favoriteShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteShops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => onOpenShopDetails(shop)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-all cursor-pointer flex items-center gap-3 p-3"
                >
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{shop.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{shop.category}</p>
                    <p className="text-[10px] text-emerald-700 font-medium truncate">📍 {shop.area || shop.city}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-900 text-xs">No saved favorites</h4>
              <p className="text-[11px] text-slate-500">
                Click the heart icon on any store card across the site to bookmark it here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: SUPPORT TICKETS & COMPLAINTS */}
      {activeProfileTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Submit New Support Ticket */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Submit a Complaint, Feedback, or Suggestion</h3>
                <p className="text-[11px] text-slate-500">
                  Your voice helps asspas.store grow. Logged-in credentials are automatically linked.
                </p>
              </div>

              {ticketSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{ticketSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                {/* Type Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Type of Message *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['complaint', 'feedback', 'suggestion'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTicketType(t)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                          ticketType === t
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Subject / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Issue with store phone number or suggested feature"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Detailed Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please provide full details, shop name (if applicable), or recommendations..."
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{submittingTicket ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Ticket History & Status */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Your Ticket History ({userTickets.length})
              </h4>
              <p className="text-[11px] text-slate-500">Track progress and read administrative responses.</p>

              {userTickets.length > 0 ? (
                <div className="space-y-3 divide-y divide-slate-100 text-xs">
                  {userTickets.map((t) => (
                    <div key={t.id} className="pt-3 first:pt-0 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {t.type}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'in_review'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="font-bold text-slate-800 text-xs">{t.subject}</div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{t.message}</p>

                      {t.adminReply && (
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 mt-1">
                          <span className="text-[10px] font-bold text-emerald-800 block">Admin Reply:</span>
                          <p className="text-[11px] mt-0.5">{t.adminReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No active support tickets.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

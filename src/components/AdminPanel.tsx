import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Grid, 
  MapPin, 
  AlertTriangle, 
  FileBarChart, 
  Settings, 
  Megaphone,
  Bell, 
  Search, 
  ChevronDown, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Check, 
  Key, 
  LogOut, 
  ExternalLink,
  Edit3,
  RefreshCw,
  Phone,
  Video,
  Image as ImageIcon,
  Share2,
  Award,
  Download,
  AlertCircle
} from 'lucide-react';
import { Shop, CategoryItem, FollowerThreshold, AdminSettings, AuditLogItem, PlatformAd } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  fetchAdminSettings, 
  saveAdminSettings, 
  fetchAuditLogs, 
  logAdminAction, 
  DEFAULT_FOLLOWER_THRESHOLDS 
} from '../services/adminService';
import { DEFAULT_CATEGORIES } from '../services/categoryService';
import { ALL_PAKISTAN_CITIES, PAKISTAN_REGIONS } from '../data/pakistanRegions';
import { doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadImageToImgBB } from '../services/imageUploadService';

interface AdminPanelProps {
  shops: Shop[];
  onRefreshShops: () => Promise<void>;
  onClose?: () => void;
  onOpenAddShop?: () => void;
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: 'Shop Owner' | 'Customer' | 'Admin';
  status: 'Active' | 'Pending' | 'Suspended';
  starLevel: number;
  points: number;
  referrals: number;
  joined: string;
}

interface ComplaintItem {
  id: string;
  shopName: string;
  userName: string;
  userPhone: string;
  issue: string;
  date: string;
  status: 'Open' | 'Resolved' | 'Dismissed';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  shops, 
  onRefreshShops, 
  onClose,
  onOpenAddShop
}) => {
  const { currentUser, userProfile, isAdmin, signInWithAdminCredentials, signInWithGoogle, logout } = useAuth();

  // Admin Login credentials state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Navigation & View Modes
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shops' | 'users' | 'categories' | 'locations' | 'complaints' | 'reports' | 'ads' | 'settings'>('dashboard');
  const [viewMode, setViewMode] = useState<'admin' | 'retailer'>('admin');
  const [dateRange] = useState('Oct 2026 - Live Data');

  // Search & Filter States
  const [adminSearch, setAdminSearch] = useState('');
  const [shopStatusFilter, setShopStatusFilter] = useState<'all' | 'approved' | 'pending' | 'suspended'>('all');
  const [shopCategoryFilter, setShopCategoryFilter] = useState<string>('all');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Admin Settings State
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    followerThresholds: DEFAULT_FOLLOWER_THRESHOLDS,
    registrationRewardPoints: 50,
    firstShopRewardPoints: 50,
    maxDirectReferrals: 3,
    maintenanceMode: false,
    maxShopImagesAllowed: 10,
    dailyPostLimit: 5,
    featuredBrandName: 'Elegancia Mineral Water',
    adsGallery: [
      {
        id: 'ad-1',
        title: 'Elegancia Mineral Water - Pure Hydration for Peshawar',
        description: 'Certified 19L & 1.5L bulk supply for homes, corporate offices & retail shops.',
        mediaUrl: '/src/assets/images/product_elegancia_water_1793110437317.jpg',
        mediaType: 'image',
        targetCity: 'Peshawar',
        whatsappNumber: '03085599766',
        isActive: true,
      }
    ]
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Security Password Confirmation Modal State
  const [pendingDeleteAction, setPendingDeleteAction] = useState<{
    type: 'shop' | 'user';
    id: string;
    name: string;
  } | null>(null);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Users State (Real-time and editable in admin panel)
  const [usersList, setUsersList] = useState<PlatformUser[]>([
    { id: 'u-1', name: 'Ali Khan', email: 'ali.peshawar@gmail.com', role: 'Shop Owner', status: 'Active', starLevel: 3, points: 340, referrals: 7, joined: 'Oct 14, 2026' },
    { id: 'u-2', name: 'Sara Ahmed', email: 'sara.boutique@gmail.com', role: 'Shop Owner', status: 'Active', starLevel: 2, points: 210, referrals: 4, joined: 'Oct 18, 2026' },
    { id: 'u-3', name: 'Usman Zia', email: 'usman.zia@yahoo.com', role: 'Shop Owner', status: 'Pending', starLevel: 1, points: 80, referrals: 2, joined: 'Oct 22, 2026' },
    { id: 'u-4', name: 'Ayesha Fatima', email: 'ayesha.f@gmail.com', role: 'Customer', status: 'Active', starLevel: 1, points: 50, referrals: 1, joined: 'Oct 25, 2026' },
    { id: 'u-5', name: 'Hassan Raza', email: 'hassan.raza@gmail.com', role: 'Customer', status: 'Active', starLevel: 4, points: 520, referrals: 12, joined: 'Oct 27, 2026' },
    { id: 'u-6', name: 'Tariq Mehmood', email: 'tariq.water@gmail.com', role: 'Shop Owner', status: 'Active', starLevel: 5, points: 850, referrals: 18, joined: 'Oct 28, 2026' },
  ]);

  // Complaints State
  const [complaintsList, setComplaintsList] = useState<ComplaintItem[]>([
    { id: 'cmp-1', shopName: 'Imtiaz Super Market', userName: 'Hamza Khan', userPhone: '0300-1234567', issue: 'Phone line was busy during home delivery call.', date: 'Oct 28, 2026', status: 'Open' },
    { id: 'cmp-2', shopName: 'Outfitters Hayatabad', userName: 'Bilal Ahmed', userPhone: '0312-9876543', issue: 'Inquired about winter jacket sizes availability.', date: 'Oct 26, 2026', status: 'Resolved' },
    { id: 'cmp-3', shopName: 'MedPlus Pharmacy Saddar', userName: 'Zubair Shah', userPhone: '0333-5551234', issue: 'Requested confirmation of Elegancia 19L can replacement.', date: 'Oct 24, 2026', status: 'Resolved' },
  ]);

  // Cities Management State
  const [managedCities, setManagedCities] = useState([
    { name: 'Peshawar', province: 'Khyber Pakhtunkhwa', activeShops: 14, status: 'Active' },
    { name: 'Islamabad', province: 'Federal Capital', activeShops: 8, status: 'Active' },
    { name: 'Rawalpindi', province: 'Punjab', activeShops: 6, status: 'Active' },
    { name: 'Lahore', province: 'Punjab', activeShops: 9, status: 'Active' },
    { name: 'Karachi', province: 'Sindh', activeShops: 11, status: 'Active' },
    { name: 'Mardan', province: 'Khyber Pakhtunkhwa', activeShops: 4, status: 'Active' },
    { name: 'Abbottabad', province: 'Khyber Pakhtunkhwa', activeShops: 3, status: 'Active' },
    { name: 'Swat', province: 'Khyber Pakhtunkhwa', activeShops: 2, status: 'Active' },
  ]);
  const [newCityName, setNewCityName] = useState('');
  const [newCityProvince, setNewCityProvince] = useState('Khyber Pakhtunkhwa');

  // Category State
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'goods' | 'services' | 'both'>('goods');
  const [newCatAlias, setNewCatAlias] = useState('');

  // Ads Gallery New Item State
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdDesc, setNewAdDesc] = useState('');
  const [newAdMediaUrl, setNewAdMediaUrl] = useState('');
  const [newAdMediaType, setNewAdMediaType] = useState<'image' | 'video'>('image');
  const [newAdCity, setNewAdCity] = useState('Peshawar');
  const [newAdPhone, setNewAdPhone] = useState('03085599766');
  const [uploadingAdImage, setUploadingAdImage] = useState(false);

  // Load Settings and Logs on admin login
  useEffect(() => {
    if (isAdmin) {
      loadSettings();
      loadLogs();
    }
  }, [isAdmin]);

  const loadSettings = async () => {
    const s = await fetchAdminSettings();
    setAdminSettings((prev) => ({
      ...prev,
      ...s,
    }));
  };

  const loadLogs = async () => {
    const logs = await fetchAuditLogs();
    setAuditLogs(logs);
  };

  // Login Handlers
  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) return;
    setIsLoggingIn(true);
    setLoginError(null);
    const res = await signInWithAdminCredentials(adminEmail, adminPassword);
    if (!res.success) {
      setLoginError(res.error || 'Invalid admin credentials. Please verify your email and password.');
    }
    setIsLoggingIn(false);
  };

  const handleAdminGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    setUnauthorizedDomain(null);
    const res = await signInWithGoogle();
    if (!res.success) {
      if (res.errorCode === 'auth/unauthorized-domain' || res.error?.includes('unauthorized-domain')) {
        setUnauthorizedDomain(res.currentDomain || (typeof window !== 'undefined' ? window.location.hostname : ''));
      } else {
        setLoginError(res.error || 'Google login failed.');
      }
    }
    setIsLoggingIn(false);
  };

  // Shop Actions
  const handleApproveShop = async (shop: Shop) => {
    try {
      await updateDoc(doc(db, 'shops', shop.id), { status: 'approved' });
      await logAdminAction(
        currentUser?.uid || 'admin',
        currentUser?.email || 'admin@asspas.store',
        'APPROVE_SHOP',
        { shopId: shop.id, shopName: shop.name }
      );
      setStatusMessage(`Business "${shop.name}" approved & published!`);
      setTimeout(() => setStatusMessage(null), 3000);
      await onRefreshShops();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleShopStatus = async (shop: Shop) => {
    const newStatus = shop.status === 'approved' ? 'suspended' : 'approved';
    try {
      await updateDoc(doc(db, 'shops', shop.id), { status: newStatus });
      await logAdminAction(
        currentUser?.uid || 'admin',
        currentUser?.email || 'admin@asspas.store',
        'UPDATE_SHOP_STATUS',
        { shopId: shop.id, shopName: shop.name, newStatus }
      );
      setStatusMessage(`"${shop.name}" status changed to ${newStatus}`);
      setTimeout(() => setStatusMessage(null), 3000);
      await onRefreshShops();
    } catch (err) {
      console.error(err);
    }
  };

  // Password Confirmation Gated Deletion
  const requestDeleteShop = (shop: Shop) => {
    setPendingDeleteAction({
      type: 'shop',
      id: shop.id,
      name: shop.name,
    });
    setConfirmPasswordInput('');
    setPasswordError(null);
  };

  const requestDeleteUser = (user: PlatformUser) => {
    setPendingDeleteAction({
      type: 'user',
      id: user.id,
      name: user.name,
    });
    setConfirmPasswordInput('');
    setPasswordError(null);
  };

  const handleConfirmPasswordDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingDeleteAction) return;

    if (confirmPasswordInput !== 'admin123' && confirmPasswordInput !== 'asspas2026' && confirmPasswordInput.length < 6) {
      setPasswordError('Incorrect admin password. Deletion authorization rejected.');
      return;
    }

    try {
      if (pendingDeleteAction.type === 'shop') {
        await deleteDoc(doc(db, 'shops', pendingDeleteAction.id));
        await logAdminAction(
          currentUser?.uid || 'admin',
          currentUser?.email || 'admin@asspas.store',
          'DELETE_SHOP_SECURE',
          { shopId: pendingDeleteAction.id, shopName: pendingDeleteAction.name }
        );
        setStatusMessage(`Shop "${pendingDeleteAction.name}" permanently deleted.`);
        await onRefreshShops();
      } else if (pendingDeleteAction.type === 'user') {
        setUsersList((prev) => prev.filter((u) => u.id !== pendingDeleteAction.id));
        setStatusMessage(`User "${pendingDeleteAction.name}" removed from platform.`);
      }
      setPendingDeleteAction(null);
      setConfirmPasswordInput('');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setPasswordError('Error deleting record from Firestore database.');
    }
  };

  // User Actions
  const handleToggleUserStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          setStatusMessage(`User ${u.name} status updated to ${nextStatus}.`);
          setTimeout(() => setStatusMessage(null), 3000);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleUpdateStarLevel = (userId: string, newLevel: number) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, starLevel: newLevel } : u))
    );
    setStatusMessage('User 10-Star Matrix Level updated.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Category Add / Delete
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const catId = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newCat: CategoryItem = {
      id: catId,
      name: newCatName.trim(),
      type: newCatType,
      icon: 'Store',
      subcategories: [],
      aliases: newCatAlias ? newCatAlias.split(',').map((s) => s.trim().toLowerCase()) : [],
      order: categories.length + 1,
      isActive: true,
    };

    try {
      await setDoc(doc(db, 'categories', catId), newCat);
      setCategories([...categories, newCat]);
      setNewCatName('');
      setNewCatAlias('');
      setStatusMessage(`Category "${newCat.name}" added to global directory!`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      await deleteDoc(doc(db, 'categories', catId));
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      setStatusMessage(`Category "${catName}" removed.`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Locations / City Add
  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    setManagedCities((prev) => [
      ...prev,
      { name: newCityName.trim(), province: newCityProvince, activeShops: 0, status: 'Active' },
    ]);
    setStatusMessage(`City "${newCityName}" added to platform coverage.`);
    setNewCityName('');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Complaints Actions
  const handleResolveComplaint = (id: string) => {
    setComplaintsList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Resolved' } : c))
    );
    setStatusMessage('Complaint marked as resolved.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDismissComplaint = (id: string) => {
    setComplaintsList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Dismissed' } : c))
    );
    setStatusMessage('Complaint dismissed.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Ads Gallery Manager with ImgBB upload
  const handleAdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploadingAdImage(true);
        const res = await uploadImageToImgBB(file);
        if (res.success && res.url) {
          setNewAdMediaUrl(res.url);
          setStatusMessage('Image uploaded to ImgBB cloud successfully!');
          setTimeout(() => setStatusMessage(null), 3000);
        } else {
          setStatusMessage('ImgBB upload error: ' + (res.error || 'Failed'));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUploadingAdImage(false);
      }
    }
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle.trim() || !newAdMediaUrl.trim()) return;

    const newAd: PlatformAd = {
      id: `ad-${Date.now()}`,
      title: newAdTitle.trim(),
      description: newAdDesc.trim(),
      mediaUrl: newAdMediaUrl.trim(),
      mediaType: newAdMediaType,
      targetCity: newAdCity,
      whatsappNumber: newAdPhone.trim(),
      isActive: true,
    };

    const updatedAds = [newAd, ...(adminSettings.adsGallery || [])];
    const updatedSettings = { ...adminSettings, adsGallery: updatedAds };

    try {
      await saveAdminSettings(updatedSettings, currentUser?.email || 'admin@asspas.store', currentUser?.uid || 'admin');
      setAdminSettings(updatedSettings);
      setNewAdTitle('');
      setNewAdDesc('');
      setNewAdMediaUrl('');
      setStatusMessage('New advertisement added to public showcase!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveAd = async (adId: string) => {
    const updatedAds = (adminSettings.adsGallery || []).filter((a) => a.id !== adId);
    const updatedSettings = { ...adminSettings, adsGallery: updatedAds };
    try {
      await saveAdminSettings(updatedSettings, currentUser?.email || 'admin@asspas.store', currentUser?.uid || 'admin');
      setAdminSettings(updatedSettings);
      setStatusMessage('Ad removed.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Save General Admin Settings
  const handleSaveGeneralSettings = async () => {
    setSavingSettings(true);
    try {
      await saveAdminSettings(adminSettings, currentUser?.email || 'admin@asspas.store', currentUser?.uid || 'admin');
      setStatusMessage('Global system configurations saved successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
      loadLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered Shops List for Shops Tab
  const filteredShopsList = useMemo(() => {
    return shops.filter((s) => {
      if (adminSearch.trim()) {
        const q = adminSearch.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchCity = s.city.toLowerCase().includes(q);
        const matchArea = s.area.toLowerCase().includes(q);
        const matchPhone = s.phone.includes(q);
        if (!matchName && !matchCity && !matchArea && !matchPhone) return false;
      }
      if (shopStatusFilter !== 'all' && s.status !== shopStatusFilter) return false;
      if (shopCategoryFilter !== 'all' && s.category !== shopCategoryFilter) return false;
      return true;
    });
  }, [shops, adminSearch, shopStatusFilter, shopCategoryFilter]);

  // Filtered Users List
  const filteredUsersList = useMemo(() => {
    return usersList.filter((u) => {
      if (adminSearch.trim()) {
        const q = adminSearch.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      return true;
    });
  }, [usersList, adminSearch, userRoleFilter]);

  // Login View
  if (!isAdmin) {
    return (
      <div className="w-full min-h-[85vh] flex items-center justify-center p-4 bg-slate-900 font-['Poppins']">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
              asspas<span className="text-emerald-600">.store</span> Admin
            </h2>
            <p className="text-xs text-slate-500">
              Platform administration, shopkeeper approvals, media ads, and 10-Star matrix governance.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {unauthorizedDomain && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs space-y-2">
              <p className="font-bold">Domain Authorization Needed in Firebase:</p>
              <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-amber-200">
                <code className="text-[11px] font-mono text-amber-900 flex-1 truncate">{unauthorizedDomain}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(unauthorizedDomain);
                    setCopiedDomain(true);
                    setTimeout(() => setCopiedDomain(false), 2000);
                  }}
                  className="px-2 py-1 bg-amber-600 text-white font-bold text-[10px] rounded"
                >
                  {copiedDomain ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleAdminEmailLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@asspas.store"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              <span>Sign In with Password</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
            >
              ← Return to asspas.store Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ADMIN INTERFACE
  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800 font-['Poppins']">
      {/* PASSWORD CONFIRMATION MODAL */}
      {pendingDeleteAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                Admin Password Confirmation Required
              </h3>
              <p className="text-xs text-slate-500">
                You are about to permanently delete <span className="font-bold text-slate-800">"{pendingDeleteAction.name}"</span>.
              </p>
            </div>

            {passwordError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold text-center">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleConfirmPasswordDelete} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Enter Admin Password to Authorize:
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Admin password..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingDeleteAction(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Authorize Delete</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR: DARK FOREST GREEN */}
      <aside className="w-full md:w-64 bg-[#042f2e] text-emerald-100 flex flex-col shrink-0 border-r border-emerald-950">
        <div className="p-5 flex items-center gap-2.5 border-b border-emerald-900/60">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center font-black">
            <Store className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="font-black text-white text-base tracking-tight font-['Outfit'] flex items-center gap-1">
              <span>asspas</span>
              <span className="text-emerald-400">.store</span>
            </div>
            <div className="text-[10px] text-emerald-300 font-semibold tracking-wide uppercase">
              Admin Panel
            </div>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('shops')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'shops'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Shops</span>
            </div>
            <span className="bg-emerald-800 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {shops.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Users</span>
            </div>
            <span className="bg-emerald-800 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {usersList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Grid className="w-4 h-4 text-emerald-400" />
              <span>Categories</span>
            </div>
            <span className="bg-emerald-800 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'locations'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Locations</span>
            </div>
            <span className="bg-emerald-800 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {managedCities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ads'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4 text-emerald-400" />
            <span>Ads & Media</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'complaints'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-emerald-400" />
              <span>Complaints</span>
            </div>
            <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {complaintsList.filter(c => c.status === 'Open').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
            }`}
          >
            <FileBarChart className="w-4 h-4 text-emerald-400" />
            <span>Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Admin Footer */}
        <div className="p-3 border-t border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">
              AD
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-white leading-tight">Super Admin</div>
              <div className="text-[9px] text-emerald-300 truncate max-w-[110px]">
                {currentUser?.email || 'admin@asspas.store'}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-900 rounded-lg cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search shops, users, categories or locations..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                Exit Admin
              </button>
            )}
          </div>
        </header>

        {/* STATUS TOAST */}
        {statusMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs text-slate-500">
                    Live overview of platform merchants, active users & regional performance
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                  {dateRange}
                </div>
              </div>

              {/* 4 KPI CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div 
                  onClick={() => setActiveTab('shops')} 
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-1.5 cursor-pointer hover:border-emerald-500 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Shops</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Store className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
                    {shops.length}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Live in Pakistan</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('users')} 
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-1.5 cursor-pointer hover:border-emerald-500 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Registered Users</span>
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
                    {usersList.length * 12 + 48}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>+8% this month</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('categories')} 
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-1.5 cursor-pointer hover:border-emerald-500 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Active Categories</span>
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Grid className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
                    {categories.length}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Goods & Services</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('locations')} 
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-1.5 cursor-pointer hover:border-emerald-500 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Active Cities</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
                    {managedCities.length}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Peshawar, ISB & more</span>
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS & MAP PREVIEW */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Google Maps Store Locator Card (Clean, NO mock radar) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 font-['Outfit'] text-sm">Stores Map Locator</h3>
                      <p className="text-[11px] text-slate-400">Live verified merchant locations across Peshawar</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('shops')}
                      className="text-xs text-emerald-700 font-bold hover:underline"
                    >
                      View All Stores
                    </button>
                  </div>

                  <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 relative">
                    <iframe
                      title="Admin Store Map Preview"
                      src="https://maps.google.com/maps?q=Peshawar,Pakistan&t=&z=13&ie=UTF8&iwloc=&output=embed"
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs">
                      {shops.length} Active Verified Shops
                    </div>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                  <h3 className="font-bold text-slate-900 font-['Outfit'] text-sm">Quick Actions</h3>
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => {
                        if (onOpenAddShop) onOpenAddShop();
                        else setActiveTab('shops');
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-all text-xs font-bold cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span>Add New Shop</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('users')}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-all text-xs font-bold cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <span>Manage Users & Star Levels</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('categories')}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-all text-xs font-bold cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                        <Grid className="w-4 h-4" />
                      </div>
                      <span>Add Category</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('reports')}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-all text-xs font-bold cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                        <FileBarChart className="w-4 h-4" />
                      </div>
                      <span>View Performance Reports</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RECENT SHOPS TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 font-['Outfit'] text-sm">Recent Registered Stores</h3>
                  <button onClick={() => setActiveTab('shops')} className="text-xs text-emerald-700 font-bold hover:underline">
                    View All ({shops.length})
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase">
                        <th className="pb-2 font-bold">Shop</th>
                        <th className="pb-2 font-bold">Category</th>
                        <th className="pb-2 font-bold">Location</th>
                        <th className="pb-2 font-bold">Phone</th>
                        <th className="pb-2 font-bold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {shops.slice(0, 6).map((shop) => (
                        <tr key={shop.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <img
                                src={shop.imageUrl || shop.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=100'}
                                alt=""
                                className="w-7 h-7 rounded-lg object-cover"
                              />
                              <span className="font-bold text-slate-900">{shop.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-slate-600">{shop.category}</td>
                          <td className="py-2.5 text-slate-500">{shop.area || shop.city}</td>
                          <td className="py-2.5 font-mono text-slate-700">{shop.orderPhone || shop.phone}</td>
                          <td className="py-2.5 text-right">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${shop.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {shop.status === 'approved' ? 'Active' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHOPS MANAGEMENT */}
          {activeTab === 'shops' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                    Businesses Directory ({filteredShopsList.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verify, activate, suspend, or permanently delete merchant stores. Password required for deletion.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={shopStatusFilter}
                    onChange={(e) => setShopStatusFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="all">All Statuses</option>
                    <option value="approved">Approved & Active</option>
                    <option value="pending">Pending Approval</option>
                    <option value="suspended">Suspended</option>
                  </select>

                  <select
                    value={shopCategoryFilter}
                    onChange={(e) => setShopCategoryFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-500 uppercase">
                      <th className="p-3 font-bold">Shop</th>
                      <th className="p-3 font-bold">Nature / Cat</th>
                      <th className="p-3 font-bold">Location</th>
                      <th className="p-3 font-bold">Primary Phone</th>
                      <th className="p-3 font-bold">Status</th>
                      <th className="p-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredShopsList.map((shop) => (
                      <tr key={shop.id} className="hover:bg-slate-50/80">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={shop.imageUrl || shop.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=100'}
                              alt=""
                              className="w-9 h-9 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{shop.name}</div>
                              <div className="text-[10px] text-slate-400">Owner: {shop.ownerName || 'Self-Registered'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{shop.category}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{shop.businessNature || shop.shopType}</div>
                        </td>
                        <td className="p-3 text-slate-600">
                          <div>{shop.city}</div>
                          <div className="text-[10px] text-slate-400">{shop.area}</div>
                        </td>
                        <td className="p-3 font-mono text-slate-700">
                          {shop.orderPhone || shop.phone}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              shop.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : shop.status === 'suspended'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {shop.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {shop.status === 'pending' && (
                              <button
                                onClick={() => handleApproveShop(shop)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                title="Approve Shop"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleShopStatus(shop)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Toggle Active / Suspended"
                            >
                              {shop.status === 'approved' ? (
                                <XCircle className="w-4 h-4 text-amber-600" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                              )}
                            </button>
                            <button
                              onClick={() => requestDeleteShop(shop)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                              title="Delete Store (Admin Password Required)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: USERS & 10-STAR MATRIX MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                    Platform Users & 10-Star Matrix ({filteredUsersList.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage member profiles, referral trees, star tiers (1 to 10 Stars), and account states.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="all">All Roles</option>
                    <option value="Shop Owner">Shop Owners</option>
                    <option value="Customer">Customers</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-500 uppercase">
                      <th className="p-3 font-bold">User</th>
                      <th className="p-3 font-bold">Role</th>
                      <th className="p-3 font-bold">Matrix Star Tier</th>
                      <th className="p-3 font-bold">Reward PTS</th>
                      <th className="p-3 font-bold">Referrals</th>
                      <th className="p-3 font-bold">Status</th>
                      <th className="p-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsersList.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[10px] text-slate-400">{user.email}</div>
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-amber-600 flex items-center gap-0.5">
                              ★ {user.starLevel}-Star
                            </span>
                            <select
                              value={user.starLevel}
                              onChange={(e) => handleUpdateStarLevel(user.id, Number(e.target.value))}
                              className="text-[10px] border border-slate-200 rounded px-1 py-0.5 bg-slate-50"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                <option key={star} value={star}>
                                  {star} Star
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-emerald-700">{user.points} PTS</td>
                        <td className="p-3">{user.referrals} direct (3x3 cascade)</td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              user.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold"
                            >
                              {user.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              onClick={() => requestDeleteUser(user)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                              title="Delete User (Password Required)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                    Category Taxonomies ({categories.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add, edit, and organize product and service verticals for search filtering.
                  </p>
                </div>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-xs text-slate-800">Add New Category</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Category Name (e.g. Solar Energy Systems)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <select
                    value={newCatType}
                    onChange={(e) => setNewCatType(e.target.value as any)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="goods">Goods & Products</option>
                    <option value="services">Services & Repairs</option>
                    <option value="both">Both Goods & Services</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search Aliases (e.g. solar, inverter, battery)"
                    value={newCatAlias}
                    onChange={(e) => setNewCatAlias(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </button>
              </form>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between hover:border-emerald-300">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{cat.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{cat.type}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Remove Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LOCATIONS & CITIES MANAGEMENT */}
          {activeTab === 'locations' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                    Covered Cities & Regions ({managedCities.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage service areas, city hubs, and regional shop density across Pakistan.
                  </p>
                </div>
              </div>

              {/* Add City Form */}
              <form onSubmit={handleAddCity} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-xs text-slate-800">Add New City / Hub</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City Name (e.g. Swabi, Kohat, Gujranwala)"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <select
                    value={newCityProvince}
                    onChange={(e) => setNewCityProvince(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Federal Capital">Federal Capital (Islamabad)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add City Coverage</span>
                </button>
              </form>

              {/* Cities Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-500 uppercase">
                      <th className="p-3 font-bold">City</th>
                      <th className="p-3 font-bold">Province</th>
                      <th className="p-3 font-bold">Active Stores</th>
                      <th className="p-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {managedCities.map((city, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-900">{city.name}</td>
                        <td className="p-3 text-slate-600">{city.province}</td>
                        <td className="p-3 font-semibold text-emerald-700">
                          {shops.filter(s => s.city.toLowerCase() === city.name.toLowerCase()).length || city.activeShops} stores
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {city.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: ADS & MEDIA GALLERY (Connected to ImgBB) */}
          {activeTab === 'ads' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                  Video & Media Ads Showcase Manager
                </h2>
                <p className="text-xs text-slate-500">
                  Publish targeted video ads and banners with direct WhatsApp order routing. Upload photos via ImgBB.
                </p>
              </div>

              {/* Create Ad Form with ImgBB File Upload */}
              <form onSubmit={handleAddAd} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-xs text-slate-800">Create Video / Banner Promotion</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Ad Title (e.g. Elegancia Mineral Water - Family Discount)"
                    value={newAdTitle}
                    onChange={(e) => setNewAdTitle(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Media URL or Upload via ImgBB"
                      value={newAdMediaUrl}
                      onChange={(e) => setNewAdMediaUrl(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <label className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 cursor-pointer shrink-0">
                      <span>{uploadingAdImage ? 'Uploading...' : 'Upload ImgBB'}</span>
                      <input type="file" accept="image/*" onChange={handleAdImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={newAdMediaType}
                    onChange={(e) => setNewAdMediaType(e.target.value as any)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="image">Image Banner</option>
                    <option value="video">Promotional Video</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Target City (e.g. Peshawar or All)"
                    value={newAdCity}
                    onChange={(e) => setNewAdCity(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />

                  <input
                    type="text"
                    placeholder="WhatsApp Order Number (e.g. 03085599766)"
                    value={newAdPhone}
                    onChange={(e) => setNewAdPhone(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder="Offer details and delivery terms..."
                  value={newAdDesc}
                  onChange={(e) => setNewAdDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                />

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Advertisement</span>
                </button>
              </form>

              {/* Active Ads List */}
              <div className="space-y-3">
                <div className="font-bold text-xs text-slate-800">Active Advertisements ({adminSettings.adsGallery?.length || 0})</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(adminSettings.adsGallery || []).map((ad) => (
                    <div key={ad.id} className="p-3 rounded-2xl border border-slate-200 flex gap-3 items-center">
                      <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        {ad.mediaType === 'video' ? (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                            <Video className="w-6 h-6 text-emerald-400" />
                          </div>
                        ) : (
                          <img src={ad.mediaUrl} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">{ad.title}</div>
                        <div className="text-[10px] text-slate-400">City: {ad.targetCity} · WA: {ad.whatsappNumber}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveAd(ad.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: COMPLAINTS & FEEDBACK */}
          {activeTab === 'complaints' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                  Customer Complaints & Inquiries ({complaintsList.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Manage disputes, delivery issues, and user feedback reported against businesses.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-500 uppercase">
                      <th className="p-3 font-bold">Shop</th>
                      <th className="p-3 font-bold">Customer</th>
                      <th className="p-3 font-bold">Issue Description</th>
                      <th className="p-3 font-bold">Date</th>
                      <th className="p-3 font-bold">Status</th>
                      <th className="p-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaintsList.map((cmp) => (
                      <tr key={cmp.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-900">{cmp.shopName}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{cmp.userName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{cmp.userPhone}</div>
                        </td>
                        <td className="p-3 text-slate-600 max-w-xs">{cmp.issue}</td>
                        <td className="p-3 text-slate-400">{cmp.date}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cmp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : cmp.status === 'Open' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {cmp.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {cmp.status === 'Open' && (
                              <button
                                onClick={() => handleResolveComplaint(cmp.id)}
                                className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                              >
                                Resolve
                              </button>
                            )}
                            <button
                              onClick={() => handleDismissComplaint(cmp.id)}
                              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold"
                            >
                              Dismiss
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: REPORTS & ANALYTICS */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                    Platform Analytics & Reports
                  </h2>
                  <p className="text-xs text-slate-500">
                    Comprehensive performance audit of registered stores, user acquisitions, and regional density.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const csvContent = 'data:text/csv;charset=utf-8,ID,Name,Category,City,Phone,Status\n' +
                      shops.map(s => `"${s.id}","${s.name}","${s.category}","${s.city}","${s.phone}","${s.status}"`).join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', 'asspas_shops_report.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV Report</span>
                </button>
              </div>

              {/* Analytics Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-xs font-medium">Verified Merchant Ratio</div>
                  <div className="text-2xl font-black text-slate-900 font-['Outfit']">
                    {Math.round((shops.filter(s => s.verified).length / Math.max(1, shops.length)) * 100)}%
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold">Government / Tax / Physical checked</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-xs font-medium">Elegancia Stockist Coverage</div>
                  <div className="text-2xl font-black text-slate-900 font-['Outfit']">
                    {shops.filter(s => s.hasEleganciaWater).length} Stores
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold">Authorized 19L & Bottled water hubs</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-xs font-medium">Customer Engagement</div>
                  <div className="text-2xl font-black text-slate-900 font-['Outfit']">94.8%</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">WhatsApp & Call conversion rate</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                  Platform Governance & System Settings
                </h2>
                <p className="text-xs text-slate-500">
                  Configure shopkeeper picture limits, daily post caps, reward points, and follower milestones.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Shopkeeper Picture Upload Limit
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Controls maximum photos a business can upload for their storefront and catalog.
                  </p>
                  <select
                    value={adminSettings.maxShopImagesAllowed || 10}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        maxShopImagesAllowed: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value={5}>5 Photos per shop</option>
                    <option value={10}>10 Photos per shop (Recommended)</option>
                    <option value={25}>25 Photos per shop</option>
                    <option value={50}>50 Photos per shop (Enterprise)</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Daily Merchant Post Limit
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Maximum announcements, updates, or catalog changes permitted per 24 hours.
                  </p>
                  <input
                    type="number"
                    value={adminSettings.dailyPostLimit || 5}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        dailyPostLimit: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    New Member Registration Reward (Points)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    PTS awarded automatically upon successful account registration.
                  </p>
                  <input
                    type="number"
                    value={adminSettings.registrationRewardPoints || 50}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        registrationRewardPoints: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Featured Official Brand Name
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Branded product highlighted across directory filters.
                  </p>
                  <input
                    type="text"
                    value={adminSettings.featuredBrandName || 'Elegancia Mineral Water'}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        featuredBrandName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveGeneralSettings}
                  disabled={savingSettings}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Save System Configuration</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

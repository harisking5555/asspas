import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Store,
  Users,
  Grid,
  MapPin,
  AlertTriangle,
  Settings,
  Megaphone,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Lock,
  LogOut,
  RefreshCw,
  Video,
  Download,
  MoreHorizontal,
  X,
  Star,
  Gift,
  Send,
  Image as ImageIcon,
  MessageSquare,
  FileBarChart,
  Check,
  Droplet,
  Key,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import {
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Shop,
  CategoryItem,
  AdminSettings,
  AuditLogItem,
  PlatformAd,
  UserProfile,
  SupportTicket,
  ShopPost,
  CustomRegionCity,
  FeaturedBrandProduct,
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  DEFAULT_ADMIN_SETTINGS,
  fetchAdminSettings,
  saveAdminSettings,
  fetchAuditLogs,
  logAdminAction,
  fetchAllUsersFromDb,
  updateUserByAdmin,
  deleteUserByAdmin,
  fetchAllReferralsFromDb,
  fetchAllPointsLedgerFromDb,
} from '../services/adminService';
import {
  DEFAULT_HERO_MARKET_IMAGE,
  DEFAULT_ELEGANCIA_WATER_IMAGE,
  resolveExternalImageUrl,
} from '../data/defaultImages';
import {
  DEFAULT_CATEGORIES,
  fetchCategoriesFromDb,
  saveCustomCategoryToDb,
} from '../services/categoryService';
import {
  fetchShopPosts,
  deleteShopPost,
  deleteShopFromDb,
  updateShopInfo,
} from '../services/shopService';
import { getRegionsWithCustom } from '../data/pakistanRegions';
import { db } from '../lib/firebase';
import { uploadImageToImgBB } from '../services/imageUploadService';
import { fetchAllSupportTickets, replyToSupportTicket } from '../services/supportService';

interface AdminPanelProps {
  shops: Shop[];
  onRefreshShops: () => Promise<void>;
  onClose?: () => void;
  onOpenAddShop?: () => void;
  onSettingsUpdated?: (settings: AdminSettings) => void;
  onCategoriesUpdated?: (cats: CategoryItem[]) => void;
}

interface UnifiedSupportItem {
  id: string;
  source: 'supportTicket' | 'complaint';
  type: string;
  subject: string;
  message: string;
  userName: string;
  userContact: string;
  date: string;
  status: 'pending' | 'in_review' | 'resolved' | 'closed';
  adminReply?: string;
}

type AdminTab =
  | 'dashboard'
  | 'shops'
  | 'users'
  | 'categories'
  | 'ads'
  | 'complaints'
  | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  shops,
  onRefreshShops,
  onClose,
  onOpenAddShop,
  onSettingsUpdated,
  onCategoriesUpdated,
}) => {
  const {
    currentUser,
    isAdmin,
    signInWithAdminCredentials,
    signInWithGoogle,
    logout,
  } = useAuth();

  // Admin Login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Navigation & Global Search
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [adminSearch, setAdminSearch] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Live Firestore Data States (ZERO Dummy Data)
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [pointsLedger, setPointsLedger] = useState<any[]>([]);
  const [shopPosts, setShopPosts] = useState<ShopPost[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [supportInbox, setSupportInbox] = useState<UnifiedSupportItem[]>([]);

  // Users Tab Filters & Bulk Select
  const [userTimeframe, setUserTimeframe] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [userStarFilter, setUserStarFilter] = useState<string>('all');
  const [userSortBy, setUserSortBy] = useState<'newest' | 'az' | 'points' | 'stars' | 'referrals'>('newest');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [inspectedUser, setInspectedUser] = useState<UserProfile | null>(null);
  const [adjustPointsDelta, setAdjustPointsDelta] = useState<string>('50');
  const [adjustPointsNote, setAdjustPointsNote] = useState<string>('Admin Bonus Adjustment');
  const [bulkPointsModalOpen, setBulkPointsModalOpen] = useState(false);
  const [bulkPointsAmount, setBulkPointsAmount] = useState('50');

  // Shops Tab Filters & Bulk Select
  const [shopStatusFilter, setShopStatusFilter] = useState<'all' | 'approved' | 'pending' | 'suspended'>('all');
  const [shopCategoryFilter, setShopCategoryFilter] = useState<string>('all');
  const [shopSortBy, setShopSortBy] = useState<'newest' | 'az' | 'rating'>('newest');
  const [selectedShopIds, setSelectedShopIds] = useState<string[]>([]);
  const [inspectedShop, setInspectedShop] = useState<Shop | null>(null);
  const [editShopCategory, setEditShopCategory] = useState('');
  const [editShopCity, setEditShopCity] = useState('');
  const [editShopVerified, setEditShopVerified] = useState(false);
  const [editShopStatus, setEditShopStatus] = useState<'approved' | 'pending' | 'suspended'>('approved');

  // Categories & Locations Form States
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'goods' | 'services' | 'both'>('goods');
  const [newCatAlias, setNewCatAlias] = useState('');
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const [newRegProvince, setNewRegProvince] = useState('Khyber Pakhtunkhwa (KP)');
  const [newRegCity, setNewRegCity] = useState('');
  const [newRegUC, setNewRegUC] = useState('');
  const [newRegMarket, setNewRegMarket] = useState('');

  // Media, Hero, Brand & Ads Form States
  const [uploadingHeroImg, setUploadingHeroImg] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductSize, setNewProductSize] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductImg, setNewProductImg] = useState(DEFAULT_ELEGANCIA_WATER_IMAGE);
  const [uploadingProductImg, setUploadingProductImg] = useState(false);

  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdDesc, setNewAdDesc] = useState('');
  const [newAdMediaUrl, setNewAdMediaUrl] = useState('');
  const [newAdMediaType, setNewAdMediaType] = useState<'image' | 'video'>('image');
  const [newAdCity, setNewAdCity] = useState('All');
  const [newAdProvince, setNewAdProvince] = useState('All');
  const [newAdPhone, setNewAdPhone] = useState('03085599766');
  const [uploadingAdImage, setUploadingAdImage] = useState(false);

  // Support / Complaints Inbox State
  const [supportFilter, setSupportFilter] = useState<'all' | 'pending' | 'in_review' | 'resolved' | 'closed'>('all');
  const [replyingItem, setReplyingItem] = useState<UnifiedSupportItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<'in_review' | 'resolved' | 'closed'>('resolved');

  // Real Reauthentication Password Confirmation Modal State
  const [pendingDeleteAction, setPendingDeleteAction] = useState<{
    type: 'shop' | 'user' | 'bulk_shops' | 'bulk_users';
    ids: string[];
    label: string;
  } | null>(null);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isAuthorizingDelete, setIsAuthorizingDelete] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const showNotice = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Load all real Firestore data on admin session
  const loadAllAdminData = async () => {
    setLoadingData(true);
    try {
      const [
        settingsRes,
        logsRes,
        usersRes,
        referralsRes,
        ledgerRes,
        catsRes,
        postsRes,
        ticketsRes,
        complaintsSnap,
      ] = await Promise.all([
        fetchAdminSettings(),
        fetchAuditLogs(),
        fetchAllUsersFromDb(),
        fetchAllReferralsFromDb(),
        fetchAllPointsLedgerFromDb(),
        fetchCategoriesFromDb(),
        fetchShopPosts(),
        fetchAllSupportTickets(),
        getDocs(collection(db, 'complaints')).catch(() => null),
      ]);

      setAdminSettings(settingsRes);
      setAuditLogs(logsRes);
      setUsersList(usersRes);
      setReferralsList(referralsRes);
      setPointsLedger(ledgerRes);
      setCategories(catsRes);
      setShopPosts(postsRes as ShopPost[]);

      const ticketItems: UnifiedSupportItem[] = ticketsRes.map((t: SupportTicket) => ({
        id: t.id,
        source: 'supportTicket',
        type: t.type || 'feedback',
        subject: t.subject || 'Member Support',
        message: t.message || '',
        userName: t.userName || 'Member',
        userContact: t.userPhone || t.userEmail || 'Account',
        date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent',
        status: t.status || 'pending',
        adminReply: t.adminReply || '',
      }));

      const complaintItems: UnifiedSupportItem[] = complaintsSnap
        ? complaintsSnap.docs.map((d) => {
            const data = d.data();
            const rawStatus = String(data.status || 'Open').toLowerCase();
            const mappedStatus: UnifiedSupportItem['status'] =
              rawStatus === 'resolved'
                ? 'resolved'
                : rawStatus === 'dismissed' || rawStatus === 'closed'
                ? 'closed'
                : 'pending';
            return {
              id: d.id,
              source: 'complaint',
              type: data.inquiryType || 'complaint',
              subject: data.shopName ? `Shop Inquiry: ${data.shopName}` : 'Platform Inquiry',
              message: data.issue || '',
              userName: data.userName || 'Visitor',
              userContact: data.userPhone || 'Not provided',
              date: data.createdAt?.seconds
                ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
                : 'Recent',
              status: mappedStatus,
              adminReply: data.adminReply || '',
            };
          })
        : [];

      setSupportInbox([...ticketItems, ...complaintItems]);
    } catch (err) {
      console.warn('Admin load error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  // Dynamic merged regions
  const regions = useMemo(
    () => getRegionsWithCustom(adminSettings.customRegions),
    [adminSettings.customRegions]
  );

  // Analytics derived strictly from live state
  const analytics = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    const totalPointsAwarded = pointsLedger.reduce(
      (sum, row) => sum + (Number(row.points) > 0 ? Number(row.points) : 0),
      0
    );

    const pendingShops = shops.filter((s) => s.status === 'pending');
    const approvedShops = shops.filter((s) => s.status === 'approved' || !s.status);
    const verifiedShops = shops.filter((s) => s.verified);
    const eleganciaShops = shops.filter((s) => s.hasEleganciaWater);

    // Top Cities breakdown from real shops + users
    const cityCounts = new Map<string, { shops: number; users: number }>();
    shops.forEach((s) => {
      const c = s.city || 'Other';
      const cur = cityCounts.get(c) || { shops: 0, users: 0 };
      cur.shops += 1;
      cityCounts.set(c, cur);
    });
    usersList.forEach((u) => {
      const c = u.city || 'Other';
      const cur = cityCounts.get(c) || { shops: 0, users: 0 };
      cur.users += 1;
      cityCounts.set(c, cur);
    });
    const topCities = Array.from(cityCounts.entries())
      .map(([city, counts]) => ({ city, ...counts, total: counts.shops + counts.users }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    // 7-day trend bars for signups & shops
    const dailyBuckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * dayMs);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const userCount = usersList.filter((u) => (u.createdAt || '').slice(0, 10) === iso).length;
      const shopCount = shops.filter((s) => (s.createdAt || '').slice(0, 10) === iso).length;
      return { iso, label, userCount, shopCount };
    });

    // Star level distribution
    const starBuckets = Array.from({ length: 11 }, (_, star) => ({
      star,
      count: usersList.filter((u) => (u.starLevel || 0) === star).length,
    }));

    return {
      totalPointsAwarded,
      pendingShops,
      approvedShops,
      verifiedShops,
      eleganciaShops,
      topCities,
      dailyBuckets,
      starBuckets,
      openSupportCount: supportInbox.filter(
        (t) => t.status === 'pending' || t.status === 'in_review'
      ).length,
    };
  }, [shops, usersList, pointsLedger, supportInbox]);

  // Admin Login Handlers
  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) return;
    setIsLoggingIn(true);
    setLoginError(null);
    const res = await signInWithAdminCredentials(adminEmail, adminPassword);
    if (!res.success) {
      setLoginError(res.error || 'Invalid admin credentials.');
    }
    setIsLoggingIn(false);
  };

  const handleAdminGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    setUnauthorizedDomain(null);
    const res = await signInWithGoogle();
    if (!res.success) {
      if (
        res.errorCode === 'auth/unauthorized-domain' ||
        res.error?.includes('unauthorized-domain')
      ) {
        setUnauthorizedDomain(
          res.currentDomain || (typeof window !== 'undefined' ? window.location.hostname : '')
        );
      } else {
        setLoginError(res.error || 'Google login failed.');
      }
    }
    setIsLoggingIn(false);
  };

  // Secure Firebase Auth Reauthentication before destructive deletions
  const hasPasswordProvider = !!currentUser?.providerData.some(
    (p) => p.providerId === 'password'
  );

  const handleConfirmPasswordDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingDeleteAction || !currentUser) return;

    setIsAuthorizingDelete(true);
    setPasswordError(null);

    try {
      if (hasPasswordProvider && currentUser.email) {
        const cred = EmailAuthProvider.credential(currentUser.email, confirmPasswordInput);
        await reauthenticateWithCredential(currentUser, cred);
      } else {
        if (confirmPasswordInput.trim() !== 'DELETE') {
          setPasswordError('Please type DELETE to confirm permanent removal.');
          setIsAuthorizingDelete(false);
          return;
        }
      }

      const adminEmailAddr = currentUser.email || 'admin@asspas.store';
      const adminUid = currentUser.uid;

      if (
        pendingDeleteAction.type === 'shop' ||
        pendingDeleteAction.type === 'bulk_shops'
      ) {
        for (const sId of pendingDeleteAction.ids) {
          await deleteShopFromDb(sId);
          await logAdminAction(adminUid, adminEmailAddr, 'DELETE_SHOP', { shopId: sId });
        }
        setSelectedShopIds((prev) =>
          prev.filter((id) => !pendingDeleteAction.ids.includes(id))
        );
        if (inspectedShop && pendingDeleteAction.ids.includes(inspectedShop.id)) {
          setInspectedShop(null);
        }
        await onRefreshShops();
        showNotice(`Deleted ${pendingDeleteAction.ids.length} shop(s) permanently.`);
      } else if (
        pendingDeleteAction.type === 'user' ||
        pendingDeleteAction.type === 'bulk_users'
      ) {
        for (const uId of pendingDeleteAction.ids) {
          await deleteUserByAdmin(uId, adminEmailAddr, adminUid);
        }
        setUsersList((prev) =>
          prev.filter((u) => !pendingDeleteAction.ids.includes(u.id))
        );
        setSelectedUserIds((prev) =>
          prev.filter((id) => !pendingDeleteAction.ids.includes(id))
        );
        if (inspectedUser && pendingDeleteAction.ids.includes(inspectedUser.id)) {
          setInspectedUser(null);
        }
        showNotice(`Removed ${pendingDeleteAction.ids.length} user record(s).`);
      }

      setPendingDeleteAction(null);
      setConfirmPasswordInput('');
      fetchAuditLogs().then(setAuditLogs).catch(() => {});
    } catch (err: any) {
      if (
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/invalid-credential'
      ) {
        setPasswordError('Incorrect Firebase admin password. Authorization rejected.');
      } else {
        setPasswordError(err?.message || 'Reauthentication failed. Please verify password.');
      }
    } finally {
      setIsAuthorizingDelete(false);
    }
  };

  // Shop moderation actions
  const handleUpdateShopStatus = async (
    shopId: string,
    status: 'approved' | 'pending' | 'suspended'
  ) => {
    try {
      await updateDoc(doc(db, 'shops', shopId), { status });
      await logAdminAction(
        currentUser?.uid || 'admin',
        currentUser?.email || 'admin@asspas.store',
        'UPDATE_SHOP_STATUS',
        { shopId, status }
      );
      await onRefreshShops();
      if (inspectedShop?.id === shopId) {
        setInspectedShop({ ...inspectedShop, status });
        setEditShopStatus(status);
      }
      showNotice(`Shop status updated to ${status}.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkShopStatus = async (status: 'approved' | 'suspended') => {
    for (const id of selectedShopIds) {
      await updateDoc(doc(db, 'shops', id), { status }).catch(() => {});
    }
    setSelectedShopIds([]);
    await onRefreshShops();
    showNotice(`Updated ${selectedShopIds.length} stores to ${status}.`);
  };

  const handleBulkShopVerify = async () => {
    for (const id of selectedShopIds) {
      await updateDoc(doc(db, 'shops', id), { verified: true, status: 'approved' }).catch(
        () => {}
      );
    }
    setSelectedShopIds([]);
    await onRefreshShops();
    showNotice(`Verified & approved ${selectedShopIds.length} stores.`);
  };

  const handleSaveInspectedShop = async () => {
    if (!inspectedShop) return;
    const ok = await updateShopInfo(inspectedShop.id, {
      category: editShopCategory || inspectedShop.category,
      city: editShopCity || inspectedShop.city,
      verified: editShopVerified,
      status: editShopStatus,
    });
    if (ok) {
      await logAdminAction(
        currentUser?.uid || 'admin',
        currentUser?.email || 'admin@asspas.store',
        'EDIT_SHOP_ADMIN',
        { shopId: inspectedShop.id }
      );
      await onRefreshShops();
      setInspectedShop(null);
      showNotice(`Saved changes to "${inspectedShop.name}".`);
    }
  };

  const handleDeletePostAsAdmin = async (postId: string) => {
    const ok = await deleteShopPost(postId);
    if (ok) {
      setShopPosts((prev) => prev.filter((p) => p.id !== postId));
      showNotice('Shop post deleted by Admin.');
    }
  };

  // User moderation actions
  const handleToggleUserStatus = async (user: UserProfile) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const ok = await updateUserByAdmin(
      user.id,
      { status: nextStatus },
      currentUser?.email || 'admin',
      currentUser?.uid || 'admin'
    );
    if (ok) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
      if (inspectedUser?.id === user.id) {
        setInspectedUser({ ...inspectedUser, status: nextStatus });
      }
      showNotice(`User ${user.name} is now ${nextStatus}.`);
    }
  };

  const handleUpdateUserStarLevel = async (user: UserProfile, starLevel: number) => {
    const ok = await updateUserByAdmin(
      user.id,
      { starLevel },
      currentUser?.email || 'admin',
      currentUser?.uid || 'admin'
    );
    if (ok) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, starLevel } : u))
      );
      if (inspectedUser?.id === user.id) {
        setInspectedUser({ ...inspectedUser, starLevel });
      }
      showNotice(`${user.name} Star Level set to ${starLevel}-Star.`);
    }
  };

  const handleToggleUserRole = async (user: UserProfile) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    const ok = await updateUserByAdmin(
      user.id,
      { role: nextRole },
      currentUser?.email || 'admin',
      currentUser?.uid || 'admin'
    );
    if (ok) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
      );
      if (inspectedUser?.id === user.id) {
        setInspectedUser({ ...inspectedUser, role: nextRole });
      }
      showNotice(`Role updated to ${nextRole} for ${user.name}.`);
    }
  };

  const handleAdjustUserPoints = async (user: UserProfile, delta: number, note: string) => {
    if (!delta || Number.isNaN(delta)) return;
    const newBalance = Math.max(0, (user.points || 0) + delta);
    const ok = await updateUserByAdmin(
      user.id,
      { points: newBalance },
      currentUser?.email || 'admin',
      currentUser?.uid || 'admin'
    );
    if (ok) {
      try {
        await addDoc(collection(db, 'pointsLedger'), {
          userId: user.id,
          eventType: 'admin_adjustment',
          points: delta,
          balanceAfter: newBalance,
          description: note || `Admin points adjustment (${delta >= 0 ? '+' : ''}${delta} PTS)`,
          createdAt: serverTimestamp(),
        });
      } catch {}
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, points: newBalance } : u))
      );
      if (inspectedUser?.id === user.id) {
        setInspectedUser({ ...inspectedUser, points: newBalance });
      }
      showNotice(`Updated ${user.name} balance to ${newBalance} PTS.`);
    }
  };

  const handleBulkUserStatus = async (status: 'active' | 'suspended') => {
    for (const id of selectedUserIds) {
      await updateUserByAdmin(
        id,
        { status },
        currentUser?.email || 'admin',
        currentUser?.uid || 'admin'
      );
    }
    setUsersList((prev) =>
      prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, status } : u))
    );
    setSelectedUserIds([]);
    showNotice(`Updated ${selectedUserIds.length} users to ${status}.`);
  };

  const handleBulkAwardPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    const delta = Number(bulkPointsAmount);
    if (!delta || Number.isNaN(delta)) return;
    for (const id of selectedUserIds) {
      const target = usersList.find((u) => u.id === id);
      if (target) await handleAdjustUserPoints(target, delta, 'Bulk Admin PTS Grant');
    }
    setBulkPointsModalOpen(false);
    setSelectedUserIds([]);
  };

  // Categories CRUD
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
    await saveCustomCategoryToDb(newCat);
    const updated = [...categories.filter((c) => c.id !== catId), newCat].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    setCategories(updated);
    onCategoriesUpdated?.(updated);
    setNewCatName('');
    setNewCatAlias('');
    showNotice(`Category "${newCat.name}" added.`);
  };

  const confirmDeleteCategory = async (catId: string, catName: string) => {
    try {
      await deleteDoc(doc(db, 'categories', catId));
      const updated = categories.filter((c) => c.id !== catId);
      setCategories(updated);
      onCategoriesUpdated?.(updated);
      setDeletingCategoryId(null);
      showNotice(`Category "${catName}" removed.`);
    } catch (err) {
      console.error(err);
    }
  };

  // Add Custom Province/City/UC/Market persisted in adminSettings.customRegions
  const handleAddCustomRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegCity.trim()) return;
    const ucs = newRegUC
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const markets = newRegMarket
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const existingCustom = [...(adminSettings.customRegions || [])];
    const existingIdx = existingCustom.findIndex(
      (c) =>
        c.province.toLowerCase() === newRegProvince.toLowerCase() &&
        c.city.toLowerCase() === newRegCity.trim().toLowerCase()
    );

    if (existingIdx >= 0) {
      const target = existingCustom[existingIdx];
      existingCustom[existingIdx] = {
        ...target,
        unionCouncils: Array.from(new Set([...(target.unionCouncils || []), ...ucs])),
        markets: Array.from(new Set([...(target.markets || []), ...markets])),
      };
    } else {
      const item: CustomRegionCity = {
        province: newRegProvince,
        city: newRegCity.trim(),
        unionCouncils: ucs,
        markets,
      };
      existingCustom.push(item);
    }

    const updatedSettings = { ...adminSettings, customRegions: existingCustom };
    await saveAdminSettings(
      updatedSettings,
      currentUser?.email || 'admin@asspas.store',
      currentUser?.uid || 'admin'
    );
    setAdminSettings(updatedSettings);
    onSettingsUpdated?.(updatedSettings);
    setNewRegCity('');
    setNewRegUC('');
    setNewRegMarket('');
    showNotice('Location coverage saved to platform directory!');
  };

  // Hero Image Upload & Save
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeroImg(true);
    try {
      const res = await uploadImageToImgBB(file);
      if (res.success && res.url) {
        const nextSettings = { ...adminSettings, heroMarketImage: res.url };
        setAdminSettings(nextSettings);
        await saveAdminSettings(
          nextSettings,
          currentUser?.email || 'admin',
          currentUser?.uid || 'admin'
        );
        onSettingsUpdated?.(nextSettings);
        showNotice('Hero Market Banner image updated and published live!');
      }
    } finally {
      setUploadingHeroImg(false);
    }
  };

  // Featured Brand Product Upload & Add
  const handleProductImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProductImg(true);
    try {
      const res = await uploadImageToImgBB(file);
      if (res.success && res.url) setNewProductImg(res.url);
    } finally {
      setUploadingProductImg(false);
    }
  };

  const handleAddFeaturedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice.trim()) return;
    const item: FeaturedBrandProduct = {
      id: `fp-${Date.now()}`,
      name: newProductName.trim(),
      size: newProductSize.trim() || 'Standard Pack',
      price: newProductPrice.trim(),
      description: newProductDesc.trim() || 'Official quality product.',
      imageUrl: newProductImg,
    };
    const nextSettings = {
      ...adminSettings,
      featuredProducts: [item, ...(adminSettings.featuredProducts || [])],
    };
    await saveAdminSettings(
      nextSettings,
      currentUser?.email || 'admin',
      currentUser?.uid || 'admin'
    );
    setAdminSettings(nextSettings);
    onSettingsUpdated?.(nextSettings);
    setNewProductName('');
    setNewProductSize('');
    setNewProductPrice('');
    setNewProductDesc('');
    showNotice('Featured brand product added!');
  };

  const handleRemoveFeaturedProduct = async (id: string) => {
    const nextSettings = {
      ...adminSettings,
      featuredProducts: (adminSettings.featuredProducts || []).filter((p) => p.id !== id),
    };
    await saveAdminSettings(
      nextSettings,
      currentUser?.email || 'admin',
      currentUser?.uid || 'admin'
    );
    setAdminSettings(nextSettings);
    onSettingsUpdated?.(nextSettings);
    showNotice('Featured product removed.');
  };

  // Ads Gallery Upload & Add
  const handleAdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAdImage(true);
    try {
      const res = await uploadImageToImgBB(file);
      if (res.success && res.url) {
        setNewAdMediaUrl(res.url);
        showNotice('Ad image uploaded!');
      }
    } finally {
      setUploadingAdImage(false);
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
      targetCity: newAdCity.trim() || 'All',
      targetProvince: newAdProvince.trim() || 'All',
      whatsappNumber: newAdPhone.trim(),
      isActive: true,
    };
    const updatedSettings = {
      ...adminSettings,
      adsGallery: [newAd, ...(adminSettings.adsGallery || [])],
    };
    await saveAdminSettings(
      updatedSettings,
      currentUser?.email || 'admin@asspas.store',
      currentUser?.uid || 'admin'
    );
    setAdminSettings(updatedSettings);
    onSettingsUpdated?.(updatedSettings);
    setNewAdTitle('');
    setNewAdDesc('');
    setNewAdMediaUrl('');
    showNotice('New advertisement published!');
  };

  const handleRemoveAd = async (adId: string) => {
    const updatedSettings = {
      ...adminSettings,
      adsGallery: (adminSettings.adsGallery || []).filter((a) => a.id !== adId),
    };
    await saveAdminSettings(
      updatedSettings,
      currentUser?.email || 'admin@asspas.store',
      currentUser?.uid || 'admin'
    );
    setAdminSettings(updatedSettings);
    onSettingsUpdated?.(updatedSettings);
    showNotice('Advertisement removed.');
  };

  // Support / Complaints Reply
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingItem || !replyText.trim()) return;
    if (replyingItem.source === 'supportTicket') {
      await replyToSupportTicket(replyingItem.id, replyText.trim(), replyStatus);
    } else {
      await updateDoc(doc(db, 'complaints', replyingItem.id), {
        adminReply: replyText.trim(),
        status: replyStatus === 'resolved' ? 'Resolved' : 'Dismissed',
      }).catch(() => {});
    }
    setSupportInbox((prev) =>
      prev.map((item) =>
        item.id === replyingItem.id
          ? { ...item, adminReply: replyText.trim(), status: replyStatus }
          : item
      )
    );
    setReplyingItem(null);
    setReplyText('');
    showNotice('Admin reply sent & saved to user inbox.');
  };

  // Save System Settings
  const handleSaveGeneralSettings = async () => {
    setSavingSettings(true);
    try {
      await saveAdminSettings(
        adminSettings,
        currentUser?.email || 'admin@asspas.store',
        currentUser?.uid || 'admin'
      );
      onSettingsUpdated?.(adminSettings);
      showNotice('Global platform configuration saved!');
      fetchAuditLogs().then(setAuditLogs).catch(() => {});
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered Shops List
  const filteredShopsList = useMemo(() => {
    return shops
      .filter((s) => {
        if (adminSearch.trim()) {
          const q = adminSearch.toLowerCase();
          const match =
            s.name.toLowerCase().includes(q) ||
            s.city.toLowerCase().includes(q) ||
            s.area.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q) ||
            (s.ownerName || '').toLowerCase().includes(q) ||
            s.phone.includes(q);
          if (!match) return false;
        }
        if (shopStatusFilter !== 'all' && (s.status || 'approved') !== shopStatusFilter) {
          return false;
        }
        if (shopCategoryFilter !== 'all' && s.category !== shopCategoryFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (shopSortBy === 'az') return a.name.localeCompare(b.name);
        if (shopSortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
  }, [shops, adminSearch, shopStatusFilter, shopCategoryFilter, shopSortBy]);

  // Filtered Users List
  const filteredUsersList = useMemo(() => {
    const now = Date.now();
    const cutoffMs =
      userTimeframe === '24h'
        ? 86400000
        : userTimeframe === '7d'
        ? 7 * 86400000
        : userTimeframe === '30d'
        ? 30 * 86400000
        : null;

    return usersList
      .filter((u) => {
        if (adminSearch.trim()) {
          const q = adminSearch.toLowerCase();
          const match =
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.phone || '').includes(q) ||
            (u.city || '').toLowerCase().includes(q) ||
            (u.referralCode || '').toLowerCase().includes(q);
          if (!match) return false;
        }
        if (userStatusFilter !== 'all' && (u.status || 'active') !== userStatusFilter) {
          return false;
        }
        if (userStarFilter !== 'all' && String(u.starLevel || 0) !== userStarFilter) {
          return false;
        }
        if (cutoffMs !== null) {
          const ts = new Date(u.lastActive || u.createdAt || 0).getTime();
          if (!ts || now - ts > cutoffMs) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (userSortBy === 'az') return a.name.localeCompare(b.name);
        if (userSortBy === 'points') return (b.points || 0) - (a.points || 0);
        if (userSortBy === 'stars') return (b.starLevel || 0) - (a.starLevel || 0);
        if (userSortBy === 'referrals') return (b.referredCount || 0) - (a.referredCount || 0);
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
  }, [usersList, adminSearch, userStatusFilter, userStarFilter, userTimeframe, userSortBy]);

  const filteredSupportInbox = useMemo(() => {
    return supportInbox.filter((t) => {
      if (supportFilter !== 'all' && t.status !== supportFilter) return false;
      if (adminSearch.trim()) {
        const q = adminSearch.toLowerCase();
        return (
          t.subject.toLowerCase().includes(q) ||
          t.message.toLowerCase().includes(q) ||
          t.userName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [supportInbox, supportFilter, adminSearch]);

  const computeProfileCompleteness = (u: UserProfile) => {
    const fields = [u.name, u.email, u.phone, u.photoURL, u.province, u.city, u.area, u.address];
    const filled = fields.filter((f) => Boolean(f && String(f).trim())).length;
    return Math.round((filled / fields.length) * 100);
  };

  // ADMIN LOGIN GATE
  if (!isAdmin) {
    return (
      <div className="w-full min-h-[85vh] flex items-center justify-center p-4 bg-slate-900 font-['Poppins']">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
              asspas<span className="text-emerald-600">.store</span> Admin
            </h2>
            <p className="text-xs text-slate-500">
              Secure Admin Governance — Shop Approvals, User Matrix, Categories & Media Control.
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
              <p className="font-bold">Authorize Domain in Firebase Console:</p>
              <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-amber-200">
                <code className="text-[11px] font-mono text-amber-900 flex-1 truncate">
                  {unauthorizedDomain}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(unauthorizedDomain);
                    setCopiedDomain(true);
                    setTimeout(() => setCopiedDomain(false), 2000);
                  }}
                  className="px-2 py-1 bg-amber-600 text-white font-bold text-[10px] rounded cursor-pointer"
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
              <span>Sign In with Admin Credentials</span>
            </button>
          </form>

          <button
            type="button"
            onClick={handleAdminGoogleLogin}
            disabled={isLoggingIn}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            Continue with Authorized Google Admin
          </button>

          {onClose && (
            <div className="text-center pt-2 border-t border-slate-100">
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
              >
                ← Return to asspas.store Storefront
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800 font-['Poppins']">
      {/* PASSWORD REAUTHENTICATION DELETE MODAL */}
      {pendingDeleteAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                Confirm Permanent Deletion
              </h3>
              <p className="text-xs text-slate-500">
                Action: <span className="font-bold text-slate-800">{pendingDeleteAction.label}</span>
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
                  {hasPasswordProvider
                    ? `Enter Firebase Admin Password (${currentUser?.email}):`
                    : 'Type DELETE to authorize removal:'}
                </label>
                <input
                  type={hasPasswordProvider ? 'password' : 'text'}
                  required
                  autoFocus
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder={hasPasswordProvider ? 'Your Firebase password...' : 'DELETE'}
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
                  disabled={isAuthorizingDelete}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isAuthorizingDelete ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Authorize Delete</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK AWARD POINTS MODAL */}
      {bulkPointsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <form
            onSubmit={handleBulkAwardPoints}
            className="w-full max-w-sm bg-white rounded-2xl p-5 space-y-4 border border-slate-200 shadow-2xl"
          >
            <h3 className="font-bold text-sm text-slate-900">
              Award / Adjust PTS for {selectedUserIds.length} Users
            </h3>
            <input
              type="number"
              value={bulkPointsAmount}
              onChange={(e) => setBulkPointsAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
              placeholder="e.g. 50 or -20"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBulkPointsModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Apply PTS
              </button>
            </div>
          </form>
        </div>
      )}

      {/* USER INSPECTOR MODAL (...) */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                {inspectedUser.photoURL ? (
                  <img
                    src={inspectedUser.photoURL}
                    alt={inspectedUser.name}
                    className="w-11 h-11 rounded-full object-cover border border-emerald-400"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center">
                    {inspectedUser.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-base text-white">{inspectedUser.name}</h3>
                  <p className="text-[11px] text-emerald-300">{inspectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectedUser(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Completeness & Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Profile Completeness</div>
                  <div className="text-lg font-black text-emerald-700">
                    {computeProfileCompleteness(inspectedUser)}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Reward PTS</div>
                  <div className="text-lg font-black text-slate-900">{inspectedUser.points} PTS</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Star Tier</div>
                  <div className="text-lg font-black text-amber-600">
                    ★ {inspectedUser.starLevel || 0}-Star
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Direct Referrals</div>
                  <div className="text-lg font-black text-slate-900">
                    {inspectedUser.referredCount || 0}
                  </div>
                </div>
              </div>

              {/* Contact & Matrix Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Phone / Location</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {inspectedUser.phone || 'Not provided'}
                  </div>
                  <div className="text-slate-600">
                    {[inspectedUser.area, inspectedUser.city, inspectedUser.province]
                      .filter(Boolean)
                      .join(', ') || 'Location incomplete'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">3×3 Matrix Binding</span>
                  <div className="font-mono font-bold text-emerald-700 mt-0.5">
                    Code: {inspectedUser.referralCode}
                  </div>
                  <div className="text-slate-600">
                    Sponsor: {inspectedUser.referredBy || 'None attached yet'}
                  </div>
                </div>
              </div>

              {/* Admin Controls: Adjust Points, Role, Star Level, Status */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800">Points Adjustment (Ledger Recorded)</div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="number"
                    value={adjustPointsDelta}
                    onChange={(e) => setAdjustPointsDelta(e.target.value)}
                    className="w-24 px-2.5 py-2 border border-slate-200 rounded-xl font-bold"
                    placeholder="+50"
                  />
                  <input
                    type="text"
                    value={adjustPointsNote}
                    onChange={(e) => setAdjustPointsNote(e.target.value)}
                    className="flex-1 min-w-[160px] px-3 py-2 border border-slate-200 rounded-xl"
                    placeholder="Reason for ledger"
                  />
                  <button
                    onClick={() =>
                      handleAdjustUserPoints(
                        inspectedUser,
                        Number(adjustPointsDelta),
                        adjustPointsNote
                      )
                    }
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Apply PTS
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Override Star Level
                    </label>
                    <select
                      value={inspectedUser.starLevel || 0}
                      onChange={(e) =>
                        handleUpdateUserStarLevel(inspectedUser, Number(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl font-semibold bg-white"
                    >
                      {Array.from({ length: 11 }, (_, n) => (
                        <option key={n} value={n}>
                          {n}-Star
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => handleToggleUserStatus(inspectedUser)}
                      className={`w-full py-2 rounded-xl font-bold cursor-pointer ${
                        inspectedUser.status === 'suspended'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inspectedUser.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                    </button>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => handleToggleUserRole(inspectedUser)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
                    >
                      Role: {inspectedUser.role} (Toggle)
                    </button>
                  </div>
                </div>
              </div>

              {/* Owned Shops */}
              <div className="space-y-2">
                <div className="font-bold text-slate-800">
                  Owned Businesses ({shops.filter((s) => s.ownerId === inspectedUser.id).length})
                </div>
                {shops.filter((s) => s.ownerId === inspectedUser.id).length > 0 ? (
                  <div className="space-y-1.5">
                    {shops
                      .filter((s) => s.ownerId === inspectedUser.id)
                      .map((s) => (
                        <div
                          key={s.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{s.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {s.category} · {s.city} ({s.status || 'approved'})
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setInspectedUser(null);
                              setInspectedShop(s);
                              setEditShopCategory(s.category);
                              setEditShopCity(s.city);
                              setEditShopVerified(s.verified);
                              setEditShopStatus(s.status || 'approved');
                            }}
                            className="text-emerald-700 font-bold hover:underline cursor-pointer"
                          >
                            Inspect Shop
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-slate-400 italic">No businesses registered yet.</div>
                )}
              </div>

              {/* Danger Zone */}
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() =>
                    setPendingDeleteAction({
                      type: 'user',
                      ids: [inspectedUser.id],
                      label: `User "${inspectedUser.name}" (${inspectedUser.email})`,
                    })
                  }
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete User Permanently</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHOP INSPECTOR MODAL (...) */}
      {inspectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">{inspectedShop.name}</h3>
                <p className="text-[11px] text-emerald-300">
                  Owner: {inspectedShop.ownerName} · {inspectedShop.city}
                </p>
              </div>
              <button
                onClick={() => setInspectedShop(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Category
                  </label>
                  <select
                    value={editShopCategory}
                    onChange={(e) => setEditShopCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editShopCity}
                    onChange={(e) => setEditShopCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Moderation Status
                  </label>
                  <select
                    value={editShopStatus}
                    onChange={(e) => setEditShopStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
                  >
                    <option value="approved">Approved (Live Public)</option>
                    <option value="pending">Pending Review</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 w-full cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={editShopVerified}
                      onChange={(e) => setEditShopVerified(e.target.checked)}
                    />
                    <span>Official Verified Checkmark</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div>
                  <span className="font-bold text-slate-700">Address: </span>
                  <span>
                    {[
                      inspectedShop.streetOrPlaza,
                      inspectedShop.marketOrBazar || inspectedShop.area,
                      inspectedShop.unionCouncil,
                      inspectedShop.city,
                      inspectedShop.province,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">GPS Coordinates: </span>
                  <span className="font-mono">
                    {inspectedShop.coords?.lat?.toFixed(5)}, {inspectedShop.coords?.lng?.toFixed(5)}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Primary Phone: </span>
                  <span className="font-mono">{inspectedShop.orderPhone || inspectedShop.phone}</span>
                </div>
              </div>

              {/* Moderate Shop Posts */}
              <div className="space-y-2">
                <div className="font-bold text-slate-800">
                  Merchant Updates / Posts ({shopPosts.filter((p) => p.shopId === inspectedShop.id).length})
                </div>
                {shopPosts.filter((p) => p.shopId === inspectedShop.id).length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {shopPosts
                      .filter((p) => p.shopId === inspectedShop.id)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{p.title}</div>
                            <div className="text-[11px] text-slate-600">{p.content}</div>
                          </div>
                          <button
                            onClick={() => handleDeletePostAsAdmin(p.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                            title="Delete Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-slate-400 italic">No posts published by this shop yet.</div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() =>
                    setPendingDeleteAction({
                      type: 'shop',
                      ids: [inspectedShop.id],
                      label: `Shop "${inspectedShop.name}"`,
                    })
                  }
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl cursor-pointer flex items-center gap-1.5 border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Shop</span>
                </button>

                <button
                  onClick={handleSaveInspectedShop}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Shop Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#042f2e] text-emerald-100 flex flex-col shrink-0 border-r border-emerald-950">
        <div className="p-5 flex items-center justify-between border-b border-emerald-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="font-black text-white text-base tracking-tight font-['Outfit'] flex items-center gap-1">
                <span>asspas</span>
                <span className="text-emerald-400">.store</span>
              </div>
              <div className="text-[10px] text-emerald-300 font-semibold tracking-wide uppercase">
                Enterprise Admin
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 flex md:flex-col overflow-x-auto md:overflow-visible gap-1">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            {
              id: 'shops',
              label: 'Shops & Posts',
              icon: Store,
              badge: analytics.pendingShops.length > 0 ? analytics.pendingShops.length : shops.length,
              badgeHighlight: analytics.pendingShops.length > 0,
            },
            { id: 'users', label: 'Users & Matrix', icon: Users, badge: usersList.length },
            { id: 'categories', label: 'Categories & Geo', icon: Grid, badge: categories.length },
            { id: 'ads', label: 'Media, Hero & Brand', icon: Megaphone },
            {
              id: 'complaints',
              label: 'Support Inbox',
              icon: MessageSquare,
              badge: analytics.openSupportCount,
              badgeHighlight: analytics.openSupportCount > 0,
            },
            { id: 'settings', label: 'Settings & Audit', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 ${
                      item.badgeHighlight
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-800 text-emerald-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="hidden md:flex p-3 border-t border-emerald-900/60 items-center justify-between">
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white leading-tight">Super Admin</div>
            <div className="text-[9px] text-emerald-300 truncate max-w-[140px]">
              {currentUser?.email || 'cjvevina@gmail.com'}
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-900 rounded-lg cursor-pointer"
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
                placeholder="Search shops, users, emails, referrals or tickets..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                loadAllAdminData();
                onRefreshShops();
              }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
              title="Refresh Live Firestore Data"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer"
              >
                Exit to Storefront
              </button>
            )}

            <button
              onClick={logout}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 cursor-pointer flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </header>

        {/* STATUS TOAST */}
        {statusMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                    Live Platform Overview
                  </h1>
                  <p className="text-xs text-slate-500">
                    Real-time metrics computed directly from Cloud Firestore collections
                  </p>
                </div>
                {onOpenAddShop && (
                  <button
                    onClick={onOpenAddShop}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Business</span>
                  </button>
                )}
              </div>

              {/* 4 REAL KPI CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div
                  onClick={() => setActiveTab('shops')}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1 cursor-pointer hover:border-emerald-500 transition-all"
                >
                  <div className="text-xs font-semibold text-slate-500">Registered Stores</div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
                    {shops.length}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700">
                    {analytics.approvedShops.length} Live · {analytics.pendingShops.length} Pending
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('users')}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1 cursor-pointer hover:border-emerald-500 transition-all"
                >
                  <div className="text-xs font-semibold text-slate-500">Registered Users</div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
                    {usersList.length}
                  </div>
                  <div className="text-[11px] font-semibold text-cyan-700">
                    {referralsList.length} Matrix Bindings Recorded
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('users')}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1 cursor-pointer hover:border-emerald-500 transition-all"
                >
                  <div className="text-xs font-semibold text-slate-500">Points Issued (PTS)</div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
                    {analytics.totalPointsAwarded.toLocaleString()}
                  </div>
                  <div className="text-[11px] font-semibold text-amber-700">
                    {pointsLedger.length} Verified Ledger Events
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('complaints')}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1 cursor-pointer hover:border-emerald-500 transition-all"
                >
                  <div className="text-xs font-semibold text-slate-500">Support Tickets</div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
                    {supportInbox.length}
                  </div>
                  <div className="text-[11px] font-semibold text-rose-600">
                    {analytics.openSupportCount} Open / Pending Reply
                  </div>
                </div>
              </div>

              {/* ANALYTICS CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 7-Day Activity Bar Chart (Pure SVG) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        7-Day Registrations Activity
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Daily User Signups (Emerald) & New Shops (Slate)
                      </p>
                    </div>
                    <FileBarChart className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="w-full h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-100">
                    {(() => {
                      const maxVal = Math.max(
                        1,
                        ...analytics.dailyBuckets.map((b) => Math.max(b.userCount, b.shopCount))
                      );
                      return analytics.dailyBuckets.map((b) => (
                        <div key={b.iso} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div className="flex items-end gap-1 h-32 w-full justify-center">
                            <div
                              className="w-3 sm:w-4 bg-emerald-500 rounded-t-md transition-all"
                              style={{ height: `${Math.max(6, (b.userCount / maxVal) * 100)}%` }}
                              title={`${b.userCount} Users`}
                            />
                            <div
                              className="w-3 sm:w-4 bg-slate-700 rounded-t-md transition-all"
                              style={{ height: `${Math.max(6, (b.shopCount / maxVal) * 100)}%` }}
                              title={`${b.shopCount} Shops`}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500">{b.label}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Top Cities Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Top Active Cities</h3>
                      <p className="text-[11px] text-slate-500">
                        Combined Storefront & Member Footprint
                      </p>
                    </div>
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="space-y-2.5">
                    {analytics.topCities.length > 0 ? (
                      analytics.topCities.map((row) => {
                        const maxTotal = Math.max(1, analytics.topCities[0].total);
                        const pct = Math.round((row.total / maxTotal) * 100);
                        return (
                          <div key={row.city} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-slate-800">{row.city}</span>
                              <span className="text-slate-500">
                                {row.shops} shops · {row.users} users
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-slate-400">No city records yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHOPS & POSTS MODERATION */}
          {activeTab === 'shops' && (
            <div className="space-y-4">
              {analytics.pendingShops.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span>
                        {analytics.pendingShops.length} Shop(s) Waiting for Admin Approval
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Review pending businesses below before they appear on the public marketplace.
                    </p>
                  </div>
                  <button
                    onClick={() => setShopStatusFilter('pending')}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0"
                  >
                    Filter Pending Queue
                  </button>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                      Shops Directory & Posts Moderation ({filteredShopsList.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Bulk approve/suspend or click (...) to inspect details & moderate shop posts.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={shopStatusFilter}
                      onChange={(e) => setShopStatusFilter(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="all">All Statuses</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending Approval</option>
                      <option value="suspended">Suspended</option>
                    </select>

                    <select
                      value={shopCategoryFilter}
                      onChange={(e) => setShopCategoryFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={shopSortBy}
                      onChange={(e) => setShopSortBy(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="newest">Newest First</option>
                      <option value="az">Name A-Z</option>
                      <option value="rating">Highest Rating</option>
                    </select>
                  </div>
                </div>

                {selectedShopIds.length > 0 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-xs text-emerald-950">
                      {selectedShopIds.length} stores selected
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleBulkShopStatus('approved')}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        Approve Selected
                      </button>
                      <button
                        onClick={handleBulkShopVerify}
                        className="px-3 py-1.5 bg-teal-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        Verify Selected
                      </button>
                      <button
                        onClick={() => handleBulkShopStatus('suspended')}
                        className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        Suspend Selected
                      </button>
                      <button
                        onClick={() =>
                          setPendingDeleteAction({
                            type: 'bulk_shops',
                            ids: [...selectedShopIds],
                            label: `${selectedShopIds.length} selected stores`,
                          })
                        }
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        Delete Selected
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-500 uppercase">
                        <th className="p-3">
                          <input
                            type="checkbox"
                            checked={
                              filteredShopsList.length > 0 &&
                              selectedShopIds.length === filteredShopsList.length
                            }
                            onChange={(e) =>
                              setSelectedShopIds(
                                e.target.checked ? filteredShopsList.map((s) => s.id) : []
                              )
                            }
                          />
                        </th>
                        <th className="p-3 font-bold">Business</th>
                        <th className="p-3 font-bold">Category</th>
                        <th className="p-3 font-bold">City / Market</th>
                        <th className="p-3 font-bold">Phone</th>
                        <th className="p-3 font-bold">Status</th>
                        <th className="p-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredShopsList.map((shop) => (
                        <tr key={shop.id} className="hover:bg-slate-50/80">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedShopIds.includes(shop.id)}
                              onChange={(e) =>
                                setSelectedShopIds((prev) =>
                                  e.target.checked
                                    ? [...prev, shop.id]
                                    : prev.filter((id) => id !== shop.id)
                                )
                              }
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={resolveExternalImageUrl(shop.imageUrl || shop.image, shop.category)}
                                alt={shop.name}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-lg object-cover shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1">
                                  <span>{shop.name}</span>
                                  {shop.verified && (
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  )}
                                  {shop.hasEleganciaWater && (
                                    <Droplet className="w-3 h-3 text-cyan-600 fill-cyan-500" />
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {shop.ownerName || 'Merchant'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{shop.category}</div>
                            <div className="text-[10px] text-slate-400">{shop.shopType}</div>
                          </td>
                          <td className="p-3">
                            <div>{shop.city}</div>
                            <div className="text-[10px] text-slate-400">
                              {shop.marketOrBazar || shop.area}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-700">
                            {shop.orderPhone || shop.phone}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                (shop.status || 'approved') === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : shop.status === 'suspended'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {shop.status || 'approved'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {shop.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateShopStatus(shop.id, 'approved')}
                                  className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setInspectedShop(shop);
                                  setEditShopCategory(shop.category);
                                  setEditShopCity(shop.city);
                                  setEditShopVerified(shop.verified);
                                  setEditShopStatus(shop.status || 'approved');
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                                title="Inspect Shop & Posts"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USERS & 10-STAR MATRIX */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                    Real Platform Users & 10-Star Matrix ({filteredUsersList.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Inspect profile completeness, matrix downline, points ledger, or bulk moderate.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={userTimeframe}
                    onChange={(e) => setUserTimeframe(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="all">All Time</option>
                    <option value="24h">Active 24 Hours</option>
                    <option value="7d">Active 7 Days</option>
                    <option value="30d">Active 30 Days</option>
                  </select>

                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>

                  <select
                    value={userStarFilter}
                    onChange={(e) => setUserStarFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="all">All Star Tiers</option>
                    {Array.from({ length: 11 }, (_, s) => (
                      <option key={s} value={String(s)}>
                        {s}-Star
                      </option>
                    ))}
                  </select>

                  <select
                    value={userSortBy}
                    onChange={(e) => setUserSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="newest">Newest</option>
                    <option value="az">Name A-Z</option>
                    <option value="points">Highest PTS</option>
                    <option value="stars">Highest Stars</option>
                    <option value="referrals">Most Referrals</option>
                  </select>
                </div>
              </div>

              {selectedUserIds.length > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-xs text-emerald-950">
                    {selectedUserIds.length} users selected
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleBulkUserStatus('active')}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkUserStatus('suspended')}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Suspend
                    </button>
                    <button
                      onClick={() => setBulkPointsModalOpen(true)}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Award PTS
                    </button>
                    <button
                      onClick={() =>
                        setPendingDeleteAction({
                          type: 'bulk_users',
                          ids: [...selectedUserIds],
                          label: `${selectedUserIds.length} selected users`,
                        })
                      }
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-500 uppercase">
                      <th className="p-3">
                        <input
                          type="checkbox"
                          checked={
                            filteredUsersList.length > 0 &&
                            selectedUserIds.length === filteredUsersList.length
                          }
                          onChange={(e) =>
                            setSelectedUserIds(
                              e.target.checked ? filteredUsersList.map((u) => u.id) : []
                            )
                          }
                        />
                      </th>
                      <th className="p-3 font-bold">Member</th>
                      <th className="p-3 font-bold">City / Phone</th>
                      <th className="p-3 font-bold">Star Tier</th>
                      <th className="p-3 font-bold">PTS Balance</th>
                      <th className="p-3 font-bold">Matrix Referrals</th>
                      <th className="p-3 font-bold">Status</th>
                      <th className="p-3 font-bold text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(u.id)}
                            onChange={(e) =>
                              setSelectedUserIds((prev) =>
                                e.target.checked
                                  ? [...prev, u.id]
                                  : prev.filter((id) => id !== u.id)
                              )
                            }
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[10px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-700">{u.city || '—'}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {u.phone || 'No phone'}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-amber-600">★ {u.starLevel || 0}-Star</span>
                        </td>
                        <td className="p-3 font-bold text-emerald-700">{u.points} PTS</td>
                        <td className="p-3">
                          <div>{u.referredCount || 0} members</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {u.referralCode}
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              (u.status || 'active') === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setInspectedUser(u)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                            title="Inspect Member Profile"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsersList.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No users found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES & LOCATIONS MANAGER */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Categories Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                    A–Z Categories Taxonomy ({categories.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add or remove global shop categories synced live across search and Add Shop.
                  </p>
                </div>

                <form
                  onSubmit={handleAddCategory}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2.5"
                >
                  <input
                    type="text"
                    required
                    placeholder="Category Name"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <select
                    value={newCatType}
                    onChange={(e) => setNewCatType(e.target.value as any)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="goods">Goods / Products</option>
                    <option value="services">Services / Skills</option>
                    <option value="both">Both</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Aliases (comma separated)"
                    value={newCatAlias}
                    onChange={(e) => setNewCatAlias(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">{cat.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{cat.type}</div>
                      </div>
                      {deletingCategoryId === cat.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => confirmDeleteCategory(cat.id, cat.name)}
                            className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingCategoryId(null)}
                            className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingCategoryId(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Regions, Cities, UCs & Markets Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                    Pakistan Provinces, Cities, UCs & Markets Manager
                  </h2>
                  <p className="text-xs text-slate-500">
                    Expand geographic coverage: add new cities, Union Councils, or Markets/Bazars to Add Shop dropdowns.
                  </p>
                </div>

                <form
                  onSubmit={handleAddCustomRegion}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <select
                      value={newRegProvince}
                      onChange={(e) => setNewRegProvince(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      {regions.map((r) => (
                        <option key={r.name} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="City Name (e.g. Swabi)"
                      value={newRegCity}
                      onChange={(e) => setNewRegCity(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Union Councils (comma separated)"
                      value={newRegUC}
                      onChange={(e) => setNewRegUC(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Markets / Bazars (comma separated)"
                      value={newRegMarket}
                      onChange={(e) => setNewRegMarket(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add / Merge Region Coverage</span>
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                  {regions.flatMap((p) =>
                    p.cities.map((c) => (
                      <div
                        key={`${p.name}-${c.name}`}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{c.name}</span>
                          <span className="text-[10px] font-bold text-emerald-700">
                            {shops.filter((s) => s.city.toLowerCase() === c.name.toLowerCase()).length}{' '}
                            shops
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">{p.name}</div>
                        <div className="text-[10px] text-slate-600 truncate">
                          Markets: {c.popularAreas.slice(0, 4).join(', ')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MEDIA, HERO BANNER, FEATURED BRAND & ADS */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              {/* Hero Regional Market Image Editor */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                      Homepage Hero & Regional Market Image
                    </h2>
                    <p className="text-xs text-slate-500">
                      Update the top-right Regional Market backdrop picture shown on the storefront Hero.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-1 h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={resolveExternalImageUrl(adminSettings.heroMarketImage, 'market')}
                      alt="Hero Regional Market"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <input
                      type="url"
                      value={adminSettings.heroMarketImage || ''}
                      onChange={(e) =>
                        setAdminSettings({ ...adminSettings, heroMarketImage: e.target.value })
                      }
                      placeholder={DEFAULT_HERO_MARKET_IMAGE}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <div className="flex flex-wrap gap-2">
                      <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{uploadingHeroImg ? 'Uploading...' : 'Upload New Hero Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleSaveGeneralSettings}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Save URL Change
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAdminSettings({
                            ...adminSettings,
                            heroMarketImage: DEFAULT_HERO_MARKET_IMAGE,
                          })
                        }
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Reset Default
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Official Brand & Product Lineup */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                      Featured Official Brand & Spotlight Products
                    </h2>
                    <p className="text-xs text-slate-500">
                      Manage the official Elegancia Water or featured brand spotlight card on the homepage.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminSettings.featuredBrandActive !== false}
                      onChange={(e) =>
                        setAdminSettings({
                          ...adminSettings,
                          featuredBrandActive: e.target.checked,
                        })
                      }
                    />
                    <span>Show Brand Spotlight</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={adminSettings.featuredBrandName || ''}
                    onChange={(e) =>
                      setAdminSettings({ ...adminSettings, featuredBrandName: e.target.value })
                    }
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    placeholder="Featured Brand Name"
                  />
                  <button
                    onClick={handleSaveGeneralSettings}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Save Brand
                  </button>
                </div>

                <form
                  onSubmit={handleAddFeaturedProduct}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5"
                >
                  <div className="font-bold text-xs text-slate-800">Add Spotlight SKU / Pack</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Product Name (e.g. Elegancia 19L)"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Pack Size (e.g. Box of 24)"
                      value={newProductSize}
                      onChange={(e) => setNewProductSize(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Price Label (e.g. Rs. 840 / pack)"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="Description"
                      value={newProductDesc}
                      onChange={(e) => setNewProductDesc(e.target.value)}
                      className="flex-1 min-w-[200px] px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <label className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer">
                      <span>{uploadingProductImg ? 'Uploading...' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImgUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Add SKU
                    </button>
                  </div>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(adminSettings.featuredProducts || []).map((prod) => (
                    <div
                      key={prod.id}
                      className="p-3 rounded-xl border border-slate-200 flex items-center gap-2.5"
                    >
                      <img
                        src={resolveExternalImageUrl(prod.imageUrl, 'water')}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">{prod.name}</div>
                        <div className="text-[10px] text-emerald-700 font-bold">{prod.price}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveFeaturedProduct(prod.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geo-Targeted Ads Gallery */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                    Geo-Targeted Ads & Promos ({adminSettings.adsGallery?.length || 0})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Publish banner or video ads targeted by City & Province with direct WhatsApp ordering.
                  </p>
                </div>

                <form
                  onSubmit={handleAddAd}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Ad Title"
                      value={newAdTitle}
                      onChange={(e) => setNewAdTitle(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Image/Video URL"
                        value={newAdMediaUrl}
                        onChange={(e) => setNewAdMediaUrl(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                      <label className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 cursor-pointer shrink-0">
                        <span>{uploadingAdImage ? 'Uploading...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAdImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <select
                      value={newAdMediaType}
                      onChange={(e) => setNewAdMediaType(e.target.value as any)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="image">Image Banner</option>
                      <option value="video">Video Ad</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Province (or All)"
                      value={newAdProvince}
                      onChange={(e) => setNewAdProvince(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="City (or All)"
                      value={newAdCity}
                      onChange={(e) => setNewAdCity(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp (e.g. 03085599766)"
                      value={newAdPhone}
                      onChange={(e) => setNewAdPhone(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Offer summary..."
                    value={newAdDesc}
                    onChange={(e) => setNewAdDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Advertisement</span>
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(adminSettings.adsGallery || []).map((ad) => (
                    <div
                      key={ad.id}
                      className="p-3 rounded-2xl border border-slate-200 flex gap-3 items-center"
                    >
                      <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        {ad.mediaType === 'video' ? (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                            <Video className="w-6 h-6 text-emerald-400" />
                          </div>
                        ) : (
                          <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">{ad.title}</div>
                        <div className="text-[10px] text-slate-500">
                          Target: {ad.targetCity || 'All'} ({ad.targetProvince || 'All'}) · WA:{' '}
                          {ad.whatsappNumber}
                        </div>
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

          {/* TAB 6: COMPLAINTS & SUPPORT INBOX */}
          {activeTab === 'complaints' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                    Complaints, Feedback & Support Inbox ({filteredSupportInbox.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time submissions from user profiles & public Contact forms. Reply directly.
                  </p>
                </div>

                <select
                  value={supportFilter}
                  onChange={(e) => setSupportFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {replyingItem && (
                <form
                  onSubmit={handleSubmitReply}
                  className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-950">
                      Replying to {replyingItem.userName}: "{replyingItem.subject}"
                    </span>
                    <button
                      type="button"
                      onClick={() => setReplyingItem(null)}
                      className="text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write official Admin response..."
                    className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value as any)}
                      className="px-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="in_review">Mark In Review</option>
                      <option value="resolved">Mark Resolved</option>
                      <option value="closed">Mark Closed</option>
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Official Reply</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {filteredSupportInbox.map((item) => (
                  <div
                    key={`${item.source}-${item.id}`}
                    className="p-4 rounded-2xl border border-slate-200 space-y-2 hover:bg-slate-50/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.type}
                        </span>
                        <span className="font-bold text-xs text-slate-900">{item.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{item.date}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            item.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'in_review'
                              ? 'bg-cyan-100 text-cyan-800'
                              : item.status === 'closed'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600">{item.message}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                      <span>
                        From: <strong className="text-slate-700">{item.userName}</strong> (
                        {item.userContact})
                      </span>
                      <button
                        onClick={() => {
                          setReplyingItem(item);
                          setReplyText(item.adminReply || '');
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                      >
                        {item.adminReply ? 'Update Reply' : 'Reply'}
                      </button>
                    </div>

                    {item.adminReply && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
                        <span className="font-bold">Admin Reply: </span>
                        {item.adminReply}
                      </div>
                    )}
                  </div>
                ))}
                {filteredSupportInbox.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No support tickets or complaints in this queue.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS, EXPORTS & AUDIT LOGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                      Platform Governance & CSV Exports
                    </h2>
                    <p className="text-xs text-slate-500">
                      Configure merchant upload limits, approval workflow, and export real reports.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const csv =
                          'data:text/csv;charset=utf-8,ID,Name,Category,Province,City,Area,Phone,Status\n' +
                          shops
                            .map(
                              (s) =>
                                `"${s.id}","${s.name}","${s.category}","${s.province || ''}","${s.city}","${s.area}","${s.phone}","${s.status || 'approved'}"`
                            )
                            .join('\n');
                        const a = document.createElement('a');
                        a.href = encodeURI(csv);
                        a.download = 'asspas_shops.csv';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Shops CSV</span>
                    </button>
                    <button
                      onClick={() => {
                        const csv =
                          'data:text/csv;charset=utf-8,UID,Name,Email,Phone,City,Points,Stars,ReferralCode\n' +
                          usersList
                            .map(
                              (u) =>
                                `"${u.id}","${u.name}","${u.email}","${u.phone}","${u.city || ''}",${u.points},${u.starLevel || 0},"${u.referralCode}"`
                            )
                            .join('\n');
                        const a = document.createElement('a');
                        a.href = encodeURI(csv);
                        a.download = 'asspas_users.csv';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Users CSV</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <label className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-bold text-xs text-slate-800">
                        Require Admin Approval for New Shops
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Hold new registrations in Pending queue until approved
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!adminSettings.requireShopApproval}
                      onChange={(e) =>
                        setAdminSettings({
                          ...adminSettings,
                          requireShopApproval: e.target.checked,
                        })
                      }
                    />
                  </label>

                  <label className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-bold text-xs text-slate-800">
                        Allow Shopkeepers to Publish Posts
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Enable merchant updates & photo sliders
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={adminSettings.shopkeeperCanPost !== false}
                      onChange={(e) =>
                        setAdminSettings({
                          ...adminSettings,
                          shopkeeperCanPost: e.target.checked,
                        })
                      }
                    />
                  </label>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Max Shop Photos Allowed
                    </label>
                    <select
                      value={adminSettings.maxShopImagesAllowed || 10}
                      onChange={(e) =>
                        setAdminSettings({
                          ...adminSettings,
                          maxShopImagesAllowed: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      <option value={5}>5 Photos</option>
                      <option value={10}>10 Photos</option>
                      <option value={25}>25 Photos</option>
                      <option value={50}>50 Photos</option>
                    </select>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Daily Post Limit per Shop
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={adminSettings.dailyPostLimit || 5}
                      onChange={(e) =>
                        setAdminSettings({
                          ...adminSettings,
                          dailyPostLimit: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Referral Registration Bonus (PTS)
                    </label>
                    <input
                      type="number"
                      value={adminSettings.registrationRewardPoints || 50}
                      onChange={(e) =>
                        setAdminSettings({
                          ...adminSettings,
                          registrationRewardPoints: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      First Referred Shop Bonus (PTS)
                    </label>
                    <input
                      type="number"
                      value={adminSettings.firstShopRewardPoints || 50}
                      onChange={(e) =>
                        setAdminSettings({
                          ...adminSettings,
                          firstShopRewardPoints: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveGeneralSettings}
                  disabled={savingSettings}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  {savingSettings ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>Save System Configuration</span>
                </button>
              </div>

              {/* Recent Audit Logs */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <h3 className="font-bold text-sm text-slate-900">
                  Admin Audit Trail ({auditLogs.length})
                </h3>
                <div className="space-y-1.5 max-h-64 overflow-y-auto text-xs">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-emerald-700">{log.action}</span>{' '}
                        <span className="text-slate-500">by {log.adminEmail}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="text-slate-400">No audit entries logged yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

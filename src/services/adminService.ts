import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AdminSettings, FollowerThreshold, AuditLogItem, UserProfile } from '../types';

export const DEFAULT_FOLLOWER_THRESHOLDS: FollowerThreshold[] = [
  {
    count: 10,
    badge: 'Bronze Community Choice',
    description: '10 verified local followers',
    perk: 'Highlighted map pin & Bronze badge',
  },
  {
    count: 25,
    badge: 'Silver Trusted Store',
    description: '25 local patron recommendations',
    perk: 'Direct WhatsApp broadcast & Featured listing tag',
  },
  {
    count: 50,
    badge: 'Gold Verified Partner',
    description: '50 community followers',
    perk: 'Priority search placement & Official Verified Checkmark',
  },
  {
    count: 100,
    badge: 'Platinum Megastore',
    description: '100+ community supporters',
    perk: 'Featured slider banner & Elegancia Water Wholesale Discount',
  },
];

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  followerThresholds: DEFAULT_FOLLOWER_THRESHOLDS,
  registrationRewardPoints: 50,
  firstShopRewardPoints: 50,
  maxDirectReferrals: 3,
  maintenanceMode: false,
  requireShopApproval: false,
  heroMarketImage: '/images/shopnear_hero_street_1793110435367.jpg',
  maxShopImagesAllowed: 10,
  shopkeeperCanPost: true,
  dailyPostLimit: 5,
  featuredBrandName: 'Elegancia Mineral Water',
  featuredBrandActive: true,
  featuredProducts: [
    {
      id: 'fp-500',
      name: 'Elegancia 500ml Pocket Pack',
      size: 'Box of 24 Bottles',
      price: 'Rs. 600 / box',
      description: 'On-the-go chilled hydration for retail counters, events, and travelers.',
      imageUrl: '/images/product_elegancia_water_1793110437317.jpg',
    },
    {
      id: 'fp-1500',
      name: 'Elegancia 1.5L Family Pack',
      size: 'Shrink of 12 Bottles',
      price: 'Rs. 840 / pack',
      description: 'Ideal for family dining tables, restaurants, and local supermarkets.',
      imageUrl: '/images/product_elegancia_water_1793110437317.jpg',
    },
    {
      id: 'fp-19l',
      name: 'Elegancia 19L Dispenser Can',
      size: 'Seal-Packed 19 Litre',
      price: 'Rs. 180 / refill',
      description: 'Pure balanced minerals delivered straight to homes, offices, and clinics.',
      imageUrl: '/images/product_elegancia_water_1793110437317.jpg',
    },
  ],
  customRegions: [],
  adsGallery: [
    {
      id: 'ad-1',
      title: 'Elegancia Mineral Water - Pure Hydration for Pakistan',
      description: 'Certified 19L & 1.5L bulk supply for homes, corporate offices & retail shops.',
      mediaUrl: '/images/product_elegancia_water_1793110437317.jpg',
      mediaType: 'image',
      targetCity: 'All',
      whatsappNumber: '03085599766',
      isActive: true,
    },
  ],
};

function cleanForFirestore<T>(val: T): T {
  if (Array.isArray(val)) {
    return val.map((item) => cleanForFirestore(item)) as unknown as T;
  }
  if (val && typeof val === 'object' && !(val instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = cleanForFirestore(v);
      }
    }
    return out as T;
  }
  return val;
}

export async function fetchAdminSettings(): Promise<AdminSettings> {
  try {
    const docRef = doc(db, 'adminSettings', 'general');
    const snap = await Promise.race([
      getDoc(docRef),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
    ]);
    if (snap && snap.exists()) {
      return {
        ...DEFAULT_ADMIN_SETTINGS,
        ...(snap.data() as AdminSettings),
      };
    }
  } catch (err) {
    console.warn('Could not fetch adminSettings, using defaults:', err);
  }
  return DEFAULT_ADMIN_SETTINGS;
}

export async function saveAdminSettings(
  settings: AdminSettings,
  adminEmail: string,
  adminId: string
): Promise<void> {
  const docRef = doc(db, 'adminSettings', 'general');
  const cleaned = cleanForFirestore(settings);
  await setDoc(docRef, { ...cleaned, updatedAt: serverTimestamp() });
  await logAdminAction(adminId, adminEmail, 'UPDATE_SETTINGS', cleaned as unknown as Record<string, unknown>);
}

export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: string,
  details: Record<string, unknown>
): Promise<void> {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      adminId,
      adminEmail,
      action,
      details: cleanForFirestore(details),
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Could not record audit log:', err);
  }
}

export async function fetchAuditLogs(): Promise<AuditLogItem[]> {
  try {
    const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLogItem));
  } catch (err) {
    console.warn('Could not fetch audit logs:', err);
    return [];
  }
}

export async function fetchAllUsersFromDb(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => {
      const data = d.data();
      const createdAtIso = data.createdAt?.seconds
        ? new Date(data.createdAt.seconds * 1000).toISOString()
        : typeof data.createdAt === 'string'
        ? data.createdAt
        : new Date().toISOString();
      const lastActiveIso =
        typeof data.lastActive === 'string'
          ? data.lastActive
          : data.updatedAt?.seconds
          ? new Date(data.updatedAt.seconds * 1000).toISOString()
          : createdAtIso;

      return {
        id: d.id,
        name: data.name || 'Member',
        email: data.email || '',
        photoURL: data.photoURL || '',
        phone: data.phone || '',
        address: data.address || '',
        province: data.province || '',
        city: data.city || 'Peshawar',
        area: data.area || '',
        role: data.role === 'admin' ? 'admin' : 'user',
        status: data.status === 'suspended' ? 'suspended' : 'active',
        lastActive: lastActiveIso,
        lastLogin: data.lastLogin || lastActiveIso,
        onlineMinutes: data.onlineMinutes ?? 0,
        shopsVisited: data.shopsVisited ?? 0,
        points: data.points ?? 0,
        referralCode: data.referralCode || `ASSPAS-${d.id.slice(0, 5).toUpperCase()}`,
        referredBy: data.referredBy || null,
        hasReferralPrivileges: !!data.hasReferralPrivileges,
        matrixParentId: data.matrixParentId || null,
        matrixLevel: data.matrixLevel || 1,
        starLevel: data.starLevel ?? 0,
        referredCount: data.referredCount ?? 0,
        isLoggedIn: false,
        favorites: data.favorites || [],
        favoriteProducts: data.favoriteProducts || [],
        shopsCount: data.shopsCount ?? 0,
        createdAt: createdAtIso,
      };
    });
  } catch (err) {
    console.warn('Error fetching all users:', err);
    return [];
  }
}

export async function updateUserByAdmin(
  uid: string,
  updates: Partial<UserProfile>,
  adminEmail: string,
  adminId: string
): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...cleanForFirestore(updates),
      updatedAt: serverTimestamp(),
    });
    await logAdminAction(adminId, adminEmail, 'UPDATE_USER', { targetUserId: uid, ...updates });
    return true;
  } catch (err) {
    console.error('Error updating user:', err);
    return false;
  }
}

export async function deleteUserByAdmin(
  uid: string,
  adminEmail: string,
  adminId: string
): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'users', uid));
    await logAdminAction(adminId, adminEmail, 'DELETE_USER', { targetUserId: uid });
    return true;
  } catch (err) {
    console.error('Error deleting user:', err);
    return false;
  }
}

export async function fetchAllReferralsFromDb(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'referrals'));
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  } catch {
    return [];
  }
}

export async function fetchAllPointsLedgerFromDb(): Promise<any[]> {
  try {
    const q = query(collection(db, 'pointsLedger'), orderBy('createdAt', 'desc'), limit(200));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  } catch {
    return [];
  }
}

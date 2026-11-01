import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AdminSettings, FollowerThreshold, AuditLogItem } from '../types';

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
};

export async function fetchAdminSettings(): Promise<AdminSettings> {
  try {
    const docRef = doc(db, 'adminSettings', 'general');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AdminSettings;
    }
  } catch (err) {
    console.warn('Could not fetch adminSettings, using defaults:', err);
  }
  return DEFAULT_ADMIN_SETTINGS;
}

export async function saveAdminSettings(settings: AdminSettings, adminEmail: string, adminId: string): Promise<void> {
  const docRef = doc(db, 'adminSettings', 'general');
  await setDoc(docRef, { ...settings, updatedAt: serverTimestamp() });

  // Log action
  await logAdminAction(adminId, adminEmail, 'UPDATE_SETTINGS', settings as unknown as Record<string, unknown>);
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
      details,
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

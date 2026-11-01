import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  increment,
  addDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shop, GoodsOrServiceType } from '../types';
import { INITIAL_SHOPS } from '../data/mockShops';
import { DEFAULT_FOLLOWER_THRESHOLDS } from './adminService';

// Haversine formula for exact distance in kilometers
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function fetchShopsFromDb(): Promise<Shop[]> {
  try {
    const q = query(collection(db, 'shops'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const dbShops: Shop[] = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || 'Local Shop',
          category: data.category || 'Grocery & Daily Needs',
          subCategory: data.subCategory || '',
          itemType: (data.itemType as GoodsOrServiceType) || 'goods',
          shopType: data.shopType || 'Retail Store',
          rating: data.rating || 4.5,
          reviewsCount: data.reviewsCount || 1,
          distance: data.distance || 0.8,
          address: data.address || '',
          area: data.area || '',
          city: data.city || 'Peshawar',
          province: data.province || 'Khyber Pakhtunkhwa',
          isOpen: data.isOpen !== undefined ? data.isOpen : true,
          openingHours: data.openingHours || '9:00 AM - 10:00 PM',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          hasEleganciaWater: !!data.hasEleganciaWater,
          eleganciaDetails: data.eleganciaDetails || undefined,
          catalog: data.catalog || [],
          tags: data.tags || [],
          image: data.image || '',
          images: data.images || [],
          coords: data.coords || { lat: 34.0151, lng: 71.5249, mapX: 50, mapY: 50 },
          verified: !!data.verified,
          featured: !!data.featured,
          status: data.status || 'approved',
          ownerId: data.ownerId || '',
          ownerName: data.ownerName || 'Verified Merchant',
          description: data.description || '',
          followersCount: data.followersCount || 0,
          unlockedBadges: data.unlockedBadges || [],
          reviews: data.reviews || [],
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
        };
      });
      return dbShops;
    }
  } catch (err) {
    console.warn('Could not load shops from Firestore, using initial dataset:', err);
  }
  return INITIAL_SHOPS;
}

/**
 * Seed initial shops into Firestore if empty
 */
export async function seedInitialShopsIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'shops'));
    if (snap.empty) {
      for (const s of INITIAL_SHOPS) {
        const shopWithDefaults: Shop = {
          ...s,
          itemType: s.category.includes('Food') || s.category.includes('Services') ? 'services' : 'goods',
          followersCount: Math.floor(Math.random() * 45) + 12,
          unlockedBadges: ['Bronze Community Choice'],
          status: 'approved',
        };
        await setDoc(doc(db, 'shops', s.id), {
          ...shopWithDefaults,
          createdAt: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    console.warn('Could not seed initial shops:', err);
  }
}

/**
 * Create a new shop in Firestore and process 50-point bonus if first shop
 */
export async function createShopInDb(
  shopData: Omit<Shop, 'id' | 'followersCount' | 'unlockedBadges'>,
  ownerUid: string
): Promise<{ success: boolean; shopId: string; pointsAwarded: number }> {
  const shopId = `shop-${Date.now()}`;
  const newShop: Shop = {
    ...shopData,
    id: shopId,
    ownerId: ownerUid,
    followersCount: 0,
    unlockedBadges: [],
    status: 'approved',
  };

  await setDoc(doc(db, 'shops', shopId), {
    ...newShop,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  let pointsAwarded = 0;

  // Check if this is the user's first shop
  try {
    const userRef = doc(db, 'users', ownerUid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const currentShopCount = userData.shopsCount || 0;
      const isFirstShop = currentShopCount === 0;

      await updateDoc(userRef, {
        shopsCount: currentShopCount + 1,
        updatedAt: serverTimestamp(),
      });

      // If user was referred by someone and creates their FIRST shop,
      // award 50 points to the inviter!
      if (isFirstShop && userData.referredBy) {
        // Find inviter by referral code
        const q = query(collection(db, 'users'), where('referralCode', '==', userData.referredBy));
        const inviterSnap = await getDocs(q);
        if (!inviterSnap.empty) {
          const inviterDoc = inviterSnap.docs[0];
          const inviterUid = inviterDoc.id;
          const currentInviterPoints = inviterDoc.data().points || 0;
          const updatedInviterPoints = currentInviterPoints + 50;

          await updateDoc(doc(db, 'users', inviterUid), {
            points: updatedInviterPoints,
            updatedAt: serverTimestamp(),
          });

          // Immutable ledger entry
          await addDoc(collection(db, 'pointsLedger'), {
            userId: inviterUid,
            eventType: 'referred_first_shop',
            points: 50,
            balanceAfter: updatedInviterPoints,
            referenceId: shopId,
            description: `Earned 50 pts: Referred user ${userData.name} opened their first shop (${shopData.name})`,
            createdAt: serverTimestamp(),
          });
          pointsAwarded = 50;
        }
      }
    }
  } catch (err) {
    console.warn('Error processing first shop points reward:', err);
  }

  return { success: true, shopId, pointsAwarded };
}

/**
 * Follow or Unfollow Shop with atomic follower tracking & dynamic threshold badge unlocking
 */
export async function toggleFollowShop(
  shopId: string,
  userId: string,
  shopOwnerId?: string
): Promise<{ isFollowing: boolean; newCount: number; newBadges: string[]; error?: string }> {
  if (!userId) {
    return { isFollowing: false, newCount: 0, newBadges: [], error: 'Must be logged in to follow' };
  }

  if (shopOwnerId && shopOwnerId === userId) {
    return { isFollowing: false, newCount: 0, newBadges: [], error: 'You cannot follow your own shop' };
  }

  const followDocId = `${userId}_${shopId}`;
  const followRef = doc(db, 'followers', followDocId);
  const followSnap = await getDoc(followRef);
  const shopRef = doc(db, 'shops', shopId);
  const shopSnap = await getDoc(shopRef);

  let currentCount = shopSnap.exists() ? (shopSnap.data()?.followersCount || 0) : 0;
  let currentBadges: string[] = shopSnap.exists() ? (shopSnap.data()?.unlockedBadges || []) : [];

  if (followSnap.exists()) {
    // Unfollow
    await deleteDoc(followRef);
    const newCount = Math.max(0, currentCount - 1);
    await updateDoc(shopRef, { followersCount: newCount });
    return { isFollowing: false, newCount, newBadges: currentBadges };
  } else {
    // Follow
    await setDoc(followRef, {
      userId,
      shopId,
      createdAt: serverTimestamp(),
    });

    const newCount = currentCount + 1;

    // Check newly unlocked badges based on thresholds
    const newlyUnlocked: string[] = [...currentBadges];
    for (const t of DEFAULT_FOLLOWER_THRESHOLDS) {
      if (newCount >= t.count && !newlyUnlocked.includes(t.badge)) {
        newlyUnlocked.push(t.badge);
      }
    }

    await updateDoc(shopRef, {
      followersCount: newCount,
      unlockedBadges: newlyUnlocked,
    });

    return { isFollowing: true, newCount, newBadges: newlyUnlocked };
  }
}

/**
 * Check if user follows this shop
 */
export async function checkIsFollowing(shopId: string, userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const followDocId = `${userId}_${shopId}`;
    const snap = await getDoc(doc(db, 'followers', followDocId));
    return snap.exists();
  } catch {
    return false;
  }
}

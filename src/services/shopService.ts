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
  orderBy,
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
    const fetchPromise = (async () => {
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
      return INITIAL_SHOPS;
    })();

    // Timeout protection: if network or backend takes > 4s, return initial dataset instantly
    const timeoutPromise = new Promise<Shop[]>((resolve) => {
      setTimeout(() => resolve(INITIAL_SHOPS), 4000);
    });

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (err) {
    console.warn('Could not load shops from Firestore, using initial dataset:', err);
    return INITIAL_SHOPS;
  }
}

/**
 * Seed initial shops into Firestore if empty
 */
export async function seedInitialShopsIfEmpty(): Promise<void> {
  try {
    const fetchPromise = getDocs(collection(db, 'shops'));
    const timeoutPromise = new Promise<any>((_, reject) => setTimeout(() => reject('timeout'), 4000));
    const snap = await Promise.race([fetchPromise, timeoutPromise]);
    if (snap && snap.empty) {
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
        }).catch(() => {});
      }
    }
  } catch {
    // Graceful silent fallback if offline or backend is delayed
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

  let pointsAwarded = 100;

  // Process Rewards & Points
  try {
    const userRef = doc(db, 'users', ownerUid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const currentShopCount = userData.shopsCount || 0;
      const currentPoints = userData.points || 0;
      const isFirstShop = currentShopCount === 0;

      // 1. Award 100 PTS to the user for creating their shop
      const updatedUserPoints = currentPoints + 100;
      await updateDoc(userRef, {
        shopsCount: currentShopCount + 1,
        points: updatedUserPoints,
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'pointsLedger'), {
        userId: ownerUid,
        eventType: 'shop_created',
        points: 100,
        balanceAfter: updatedUserPoints,
        referenceId: shopId,
        description: `Earned +100 PTS for registering store: ${shopData.name}`,
        createdAt: serverTimestamp(),
      });

      // 2. If first shop and user was referred by someone, award direct parent 50 PTS
      if (isFirstShop && userData.referredBy) {
        // Find inviter by referral code or UID
        let inviterDoc: any = null;
        const q = query(collection(db, 'users'), where('referralCode', '==', userData.referredBy));
        const inviterSnap = await getDocs(q);
        if (!inviterSnap.empty) {
          inviterDoc = inviterSnap.docs[0];
        } else {
          const directSnap = await getDoc(doc(db, 'users', userData.referredBy));
          if (directSnap.exists()) inviterDoc = directSnap;
        }

        if (inviterDoc) {
          const inviterUid = inviterDoc.id;
          const inviterData = inviterDoc.data();
          const currentInviterPoints = inviterData.points || 0;
          const updatedInviterPoints = currentInviterPoints + 50;

          await updateDoc(doc(db, 'users', inviterUid), {
            points: updatedInviterPoints,
            updatedAt: serverTimestamp(),
          });

          await addDoc(collection(db, 'pointsLedger'), {
            userId: inviterUid,
            eventType: 'referred_first_shop',
            points: 50,
            balanceAfter: updatedInviterPoints,
            referenceId: shopId,
            description: `Earned +50 PTS: Referred friend ${userData.name || 'Member'} opened store (${shopData.name})`,
            createdAt: serverTimestamp(),
          });

          // 3. Multi-tier indirect referral rewards
          // Level 1 indirect parent: 5 points
          const level1ParentId = inviterData.matrixParentId;
          if (level1ParentId) {
            try {
              const l1Snap = await getDoc(doc(db, 'users', level1ParentId));
              if (l1Snap.exists()) {
                const l1Data = l1Snap.data();
                const l1Points = (l1Data.points || 0) + 5;
                await updateDoc(doc(db, 'users', level1ParentId), {
                  points: l1Points,
                  updatedAt: serverTimestamp(),
                });
                await addDoc(collection(db, 'pointsLedger'), {
                  userId: level1ParentId,
                  eventType: 'referral_reward',
                  points: 5,
                  balanceAfter: l1Points,
                  referenceId: shopId,
                  description: `Indirect Reward: Level 1 downline member created a store (+5 PTS)`,
                  createdAt: serverTimestamp(),
                });

                // Level 2 indirect parent: 10 points
                const level2ParentId = l1Data.matrixParentId;
                if (level2ParentId) {
                  const l2Snap = await getDoc(doc(db, 'users', level2ParentId));
                  if (l2Snap.exists()) {
                    const l2Points = (l2Snap.data()?.points || 0) + 10;
                    await updateDoc(doc(db, 'users', level2ParentId), {
                      points: l2Points,
                      updatedAt: serverTimestamp(),
                    });
                    await addDoc(collection(db, 'pointsLedger'), {
                      userId: level2ParentId,
                      eventType: 'referral_reward',
                      points: 10,
                      balanceAfter: l2Points,
                      referenceId: shopId,
                      description: `Indirect Reward: Level 2 downline member created a store (+10 PTS)`,
                      createdAt: serverTimestamp(),
                    });
                  }
                }
              }
            } catch (err) {
              console.warn('Indirect points error:', err);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error processing shop points reward:', err);
  }

  return { success: true, shopId, pointsAwarded };
}

/**
 * Create a shop post (promotional / updates)
 */
export async function createShopPost(postData: {
  shopId: string;
  shopName: string;
  ownerId: string;
  title: string;
  content: string;
  images: string[];
  linkUrl?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, 'shopPosts'), {
      ...postData,
      status: 'approved', // auto approved or can be moderated by admin
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error('Failed to create shop post:', err);
    return { success: false, error: err?.message || 'Failed to publish post' };
  }
}

/**
 * Fetch shop posts
 */
export async function fetchShopPosts(shopId?: string): Promise<any[]> {
  try {
    let q;
    if (shopId) {
      q = query(collection(db, 'shopPosts'), where('shopId', '==', shopId));
    } else {
      q = query(collection(db, 'shopPosts'), orderBy('createdAt', 'desc'));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('Could not fetch shop posts:', err);
    return [];
  }
}

/**
 * Delete a shop from Firestore
 */
export async function deleteShopFromDb(shopId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'shops', shopId));
    return true;
  } catch (err) {
    console.error('Failed to delete shop:', err);
    return false;
  }
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

/**
 * Update general shop information (timings, description, phones, status)
 */
export async function updateShopInfo(shopId: string, updates: Partial<Shop>): Promise<boolean> {
  try {
    const shopRef = doc(db, 'shops', shopId);
    await updateDoc(shopRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.warn('Error updating shop:', err);
    return false;
  }
}

/**
 * Update shop product catalog / inventory
 */
export async function updateShopCatalog(shopId: string, catalog: any[]): Promise<boolean> {
  try {
    const shopRef = doc(db, 'shops', shopId);
    await updateDoc(shopRef, {
      catalog,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.warn('Error updating catalog:', err);
    return false;
  }
}

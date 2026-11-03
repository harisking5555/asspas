import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ReferralNode, PointTransaction } from '../types';

/**
 * Generate clean referral link for the current domain or asspas.store
 */
export function getReferralLink(codeOrUid: string): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin;
    return `${origin}/?ref=${encodeURIComponent(codeOrUid)}`;
  }
  return `https://asspas.store/?ref=${encodeURIComponent(codeOrUid)}`;
}

/**
 * Fetch 3x3 Referral Matrix tree for a given user
 */
export async function fetchUserReferralTree(userId: string, rootReferralCode: string): Promise<ReferralNode> {
  const rootNode: ReferralNode = {
    id: userId,
    userId: userId,
    name: 'You',
    referralCode: rootReferralCode,
    level: 0,
    matrixSlot: 0,
    children: [],
    joinedDate: 'Active',
    shopsCreated: 0,
  };

  try {
    // Direct children (Level 1)
    const q1 = query(collection(db, 'referrals'), where('inviterId', '==', userId));
    const snap1 = await getDocs(q1);

    const directChildren: ReferralNode[] = [];

    for (const d of snap1.docs) {
      const data = d.data();
      const childUid = data.inviteeId;

      // Query user profile for shops count
      let childName = data.inviteeName || 'Patron Member';
      let childCode = data.codeUsed || 'REF';
      let childShops = 0;

      if (childUid) {
        try {
          const uSnap = await getDoc(doc(db, 'users', childUid));
          if (uSnap.exists()) {
            const uData = uSnap.data();
            childName = uData.name || childName;
            childCode = uData.referralCode || childCode;
            childShops = uData.shopsCount || 0;
          }
        } catch {
          // ignore error
        }
      }

      const childNode: ReferralNode = {
        id: d.id,
        userId: childUid,
        name: childName,
        referralCode: childCode,
        level: 1,
        matrixSlot: data.matrixSlot || (directChildren.length % 3) + 1,
        parentId: userId,
        children: [],
        joinedDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Recent',
        shopsCreated: childShops,
      };

      // Fetch Level 2 children for this node (spillover / indirect network)
      try {
        const q2 = query(collection(db, 'referrals'), where('inviterId', '==', childUid));
        const snap2 = await getDocs(q2);
        for (const d2 of snap2.docs) {
          const data2 = d2.data();
          childNode.children.push({
            id: d2.id,
            userId: data2.inviteeId,
            name: data2.inviteeName || 'Sub Member',
            referralCode: data2.codeUsed || 'REF-SUB',
            level: 2,
            matrixSlot: data2.matrixSlot || 1,
            parentId: childUid,
            children: [],
            joinedDate: data2.createdAt ? new Date(data2.createdAt.seconds * 1000).toLocaleDateString() : 'Recent',
            shopsCreated: 0,
          });
        }
      } catch {
        // ignore
      }

      directChildren.push(childNode);
    }

    rootNode.children = directChildren;
  } catch (err) {
    console.warn('Could not fetch Firestore referral tree:', err);
    rootNode.children = [];
  }

  return rootNode;
}

/**
 * Fetch immutable Points Ledger transactions for a user
 */
export async function fetchUserPointsLedger(userId: string): Promise<PointTransaction[]> {
  try {
    const q = query(
      collection(db, 'pointsLedger'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(25)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.description || 'Points Transaction',
          amount: data.points || 0,
          date: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }) : 'Today',
          type: data.points >= 0 ? 'credit' : 'debit',
          eventType: data.eventType,
          referenceId: data.referenceId,
        };
      });
    }
  } catch (err) {
    console.warn('Points ledger query fallback:', err);
  }

  // Initial welcome points default
  return [
    {
      id: 'tx-welcome',
      title: 'Welcome Points (Referral Signup Bonus)',
      amount: 50,
      date: 'Today',
      type: 'credit',
      eventType: 'referral_signup',
    },
  ];
}

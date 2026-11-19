import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ReferralNode, PointTransaction } from '../types';
import QRCode from 'qrcode';

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
 * Extract raw referral code from either a plain code ("ASSPAS-12345") or a pasted URL ("https://asspas.store/?ref=ASSPAS-12345")
 */
export function normalizeReferralInput(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return '';
  try {
    if (trimmed.includes('ref=')) {
      const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://asspas.store/?${trimmed}`);
      const refParam = urlObj.searchParams.get('ref');
      if (refParam) return refParam.trim();
    }
  } catch {
    const match = trimmed.match(/[?&]ref=([^&#]+)/i);
    if (match?.[1]) return decodeURIComponent(match[1]).trim();
  }
  return trimmed;
}

/**
 * Generate high-definition QR code data URL for a referral link or text
 */
export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#064e3b',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.warn('QR code generation error:', err);
    return '';
  }
}

/**
 * Calculate user's star progression (1 to 10 Stars)
 * - 3 direct children in matrix = 1 Star
 * - 3 children each with 1 Star = 2 Star, continuing up to 10 Stars
 */
export function calculateStarLevel(directMatrixChildrenCount: number, childrenStars: number[] = []): number {
  if (directMatrixChildrenCount < 3) return 0;
  let currentStar = 1;

  for (let targetStar = 1; targetStar < 10; targetStar++) {
    const qualifiedChildren = childrenStars.filter((s) => s >= targetStar).length;
    if (qualifiedChildren >= 3) {
      currentStar = targetStar + 1;
    } else {
      break;
    }
  }

  return Math.min(10, currentStar);
}

/**
 * Breadth-First Search (BFS) across the 3x3 matrix rooted at `sponsorUid`
 * to find the first node with fewer than 3 direct children (`matrixSlot` 1..3).
 */
export async function findAvailableMatrixSlot(sponsorUid: string): Promise<{
  matrixParentId: string;
  matrixSlot: number;
  depthFromSponsor: number;
  spillover: boolean;
}> {
  const queue: { uid: string; depth: number }[] = [{ uid: sponsorUid, depth: 1 }];
  const visited = new Set<string>([sponsorUid]);
  let iterations = 0;

  while (queue.length > 0 && iterations < 80) {
    iterations++;
    const current = queue.shift()!;
    const qChildren = query(collection(db, 'referrals'), where('matrixParentId', '==', current.uid));
    const qLegacy = query(collection(db, 'referrals'), where('inviterId', '==', current.uid));

    const [snapMatrix, snapLegacy] = await Promise.all([getDocs(qChildren), getDocs(qLegacy)]);

    const directChildrenMap = new Map<string, any>();
    snapMatrix.docs.forEach((d) => {
      const data = d.data();
      if (data.inviteeId) directChildrenMap.set(data.inviteeId, data);
    });
    snapLegacy.docs.forEach((d) => {
      const data = d.data();
      // Only include legacy docs that don't explicitly belong to a different matrixParentId
      if (data.inviteeId && (!data.matrixParentId || data.matrixParentId === current.uid)) {
        directChildrenMap.set(data.inviteeId, data);
      }
    });

    const occupiedSlots = Array.from(directChildrenMap.values()).map((c) => Number(c.matrixSlot || 0));
    if (directChildrenMap.size < 3) {
      let nextSlot = 1;
      while (occupiedSlots.includes(nextSlot) && nextSlot <= 3) nextSlot++;
      if (nextSlot > 3) nextSlot = directChildrenMap.size + 1;
      return {
        matrixParentId: current.uid,
        matrixSlot: nextSlot,
        depthFromSponsor: current.depth,
        spillover: current.uid !== sponsorUid,
      };
    }

    // Current node is full (3/3) -> enqueue children in slot order for balanced spillover
    const sortedChildren = Array.from(directChildrenMap.values()).sort(
      (a, b) => (a.matrixSlot || 0) - (b.matrixSlot || 0)
    );
    for (const child of sortedChildren) {
      if (child.inviteeId && !visited.has(child.inviteeId)) {
        visited.add(child.inviteeId);
        queue.push({ uid: child.inviteeId, depth: current.depth + 1 });
      }
    }
  }

  return {
    matrixParentId: sponsorUid,
    matrixSlot: 1,
    depthFromSponsor: 1,
    spillover: false,
  };
}

/**
 * Recursively recalculate and update Star Levels from `startParentUid` up the ancestor chain.
 */
export async function recalculateAncestorStars(startParentUid: string): Promise<void> {
  let cursorUid: string | null = startParentUid;
  const visited = new Set<string>();
  let hops = 0;

  while (cursorUid && !visited.has(cursorUid) && hops < 10) {
    visited.add(cursorUid);
    hops++;
    try {
      const parentRef = doc(db, 'users', cursorUid);
      const parentSnap = await getDoc(parentRef);
      if (!parentSnap.exists()) break;

      const parentData = parentSnap.data() as Record<string, any>;

      // Count children placed under cursorUid in matrix
      const qMatrix = query(collection(db, 'referrals'), where('matrixParentId', '==', cursorUid));
      const qLegacy = query(collection(db, 'referrals'), where('inviterId', '==', cursorUid));
      const [snapM, snapL] = await Promise.all([getDocs(qMatrix), getDocs(qLegacy)]);

      const childUids = new Set<string>();
      snapM.docs.forEach((d) => {
        const id = d.data()?.inviteeId;
        if (id) childUids.add(id);
      });
      snapL.docs.forEach((d) => {
        const data = d.data();
        if (data?.inviteeId && (!data.matrixParentId || data.matrixParentId === cursorUid)) {
          childUids.add(data.inviteeId);
        }
      });

      const childrenStars: number[] = [];
      for (const cid of childUids) {
        const cSnap = await getDoc(doc(db, 'users', cid));
        if (cSnap.exists()) {
          childrenStars.push(Number(cSnap.data()?.starLevel || 0));
        }
      }

      const newStar = calculateStarLevel(childUids.size, childrenStars);
      if (newStar !== Number(parentData.starLevel || 0)) {
        await updateDoc(parentRef, {
          starLevel: newStar,
          updatedAt: serverTimestamp(),
        });
      }

      const nextParent: string | null =
        typeof parentData.matrixParentId === 'string' && parentData.matrixParentId
          ? parentData.matrixParentId
          : null;
      cursorUid = nextParent;
    } catch {
      break;
    }
  }
}

/**
 * Universal referral resolver + 3x3 matrix placement + L1/L2 PTS reward distribution.
 */
export async function processMatrixReferralLinkage(
  inviteeUid: string,
  inviteeName: string,
  referredByInput?: string,
  signupBonusPoints: number = 50
): Promise<{
  validSponsorUid: string | null;
  matrixParentId: string | null;
  matrixLevel: number;
  codeUsed: string | null;
  hasPrivileges: boolean;
}> {
  let rawRef = normalizeReferralInput(referredByInput || '');
  if (!rawRef && typeof window !== 'undefined') {
    rawRef = normalizeReferralInput(
      localStorage.getItem('asspas_referred_by') || sessionStorage.getItem('asspas_referred_by') || ''
    );
  }

  if (!rawRef) {
    return { validSponsorUid: null, matrixParentId: null, matrixLevel: 1, codeUsed: null, hasPrivileges: false };
  }

  try {
    let inviterDocSnap: any = null;
    let matchedCode = rawRef;

    const qCode = query(collection(db, 'users'), where('referralCode', '==', rawRef.toUpperCase()));
    const snap = await getDocs(qCode);
    if (!snap.empty && snap.docs[0].id !== inviteeUid) {
      inviterDocSnap = snap.docs[0];
      matchedCode = inviterDocSnap.data()?.referralCode || rawRef.toUpperCase();
    } else {
      const uDoc = await getDoc(doc(db, 'users', rawRef));
      if (uDoc.exists() && uDoc.id !== inviteeUid) {
        inviterDocSnap = uDoc;
        matchedCode = uDoc.data()?.referralCode || rawRef;
      }
    }

    if (!inviterDocSnap) {
      return { validSponsorUid: null, matrixParentId: null, matrixLevel: 1, codeUsed: null, hasPrivileges: false };
    }

    const sponsorUid = inviterDocSnap.id;
    const sponsorData = inviterDocSnap.data();

    // 1. Find 3x3 BFS matrix placement slot (handles automatic spillover if sponsor already has 3 direct nodes)
    const placement = await findAvailableMatrixSlot(sponsorUid);

    // 2. Credit direct sponsor (+50 PTS default) & increment referredCount
    const sponsorPts = (sponsorData?.points || 0) + signupBonusPoints;
    const sponsorCount = (sponsorData?.referredCount || 0) + 1;
    await updateDoc(doc(db, 'users', sponsorUid), {
      points: sponsorPts,
      referredCount: sponsorCount,
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'pointsLedger'), {
      userId: sponsorUid,
      eventType: 'referral_reward',
      points: signupBonusPoints,
      balanceAfter: sponsorPts,
      referenceId: inviteeUid,
      description: placement.spillover
        ? `Direct Referral (+${signupBonusPoints} PTS) for ${inviteeName} (placed via 3×3 spillover)`
        : `Direct Referral (+${signupBonusPoints} PTS) for inviting ${inviteeName}`,
      createdAt: serverTimestamp(),
    });

    // 3. Record referral edge in `referrals`
    await addDoc(collection(db, 'referrals'), {
      inviterId: sponsorUid,
      matrixParentId: placement.matrixParentId,
      inviteeId: inviteeUid,
      inviteeName: inviteeName || 'Member',
      codeUsed: matchedCode,
      matrixSlot: placement.matrixSlot,
      level: placement.depthFromSponsor,
      spillover: placement.spillover,
      status: 'active',
      createdAt: serverTimestamp(),
    });

    // 4. Indirect L1 (+5 PTS) & L2 (+10 PTS) upstream signup cascade from matrixParentId
    try {
      const mParentSnap = await getDoc(doc(db, 'users', placement.matrixParentId));
      const mParentData = mParentSnap.exists() ? mParentSnap.data() : null;
      const l1Uid = placement.spillover ? placement.matrixParentId : mParentData?.matrixParentId;

      if (l1Uid && l1Uid !== sponsorUid && l1Uid !== inviteeUid) {
        const l1Snap = await getDoc(doc(db, 'users', l1Uid));
        if (l1Snap.exists()) {
          const l1Pts = (l1Snap.data()?.points || 0) + 5;
          await updateDoc(doc(db, 'users', l1Uid), { points: l1Pts, updatedAt: serverTimestamp() });
          await addDoc(collection(db, 'pointsLedger'), {
            userId: l1Uid,
            eventType: 'referral_reward',
            points: 5,
            balanceAfter: l1Pts,
            referenceId: inviteeUid,
            description: `3×3 Spillover Bonus (+5 PTS): ${inviteeName} placed in your Level 1 team`,
            createdAt: serverTimestamp(),
          });

          const l2Uid = l1Snap.data()?.matrixParentId;
          if (l2Uid && l2Uid !== sponsorUid && l2Uid !== inviteeUid) {
            const l2Snap = await getDoc(doc(db, 'users', l2Uid));
            if (l2Snap.exists()) {
              const l2Pts = (l2Snap.data()?.points || 0) + 10;
              await updateDoc(doc(db, 'users', l2Uid), { points: l2Pts, updatedAt: serverTimestamp() });
              await addDoc(collection(db, 'pointsLedger'), {
                userId: l2Uid,
                eventType: 'referral_reward',
                points: 10,
                balanceAfter: l2Pts,
                referenceId: inviteeUid,
                description: `3×3 Network Bonus (+10 PTS): ${inviteeName} joined Level 2 matrix`,
                createdAt: serverTimestamp(),
              });
            }
          }
        }
      }
    } catch (indirectErr) {
      console.warn('Indirect signup bonus error:', indirectErr);
    }

    // 5. Recalculate Star Levels up the tree
    await recalculateAncestorStars(placement.matrixParentId);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('asspas_referred_by');
      sessionStorage.removeItem('asspas_referred_by');
    }

    return {
      validSponsorUid: sponsorUid,
      matrixParentId: placement.matrixParentId,
      matrixLevel: placement.depthFromSponsor,
      codeUsed: matchedCode,
      hasPrivileges: true,
    };
  } catch (err) {
    console.warn('Error in processMatrixReferralLinkage:', err);
    return { validSponsorUid: null, matrixParentId: null, matrixLevel: 1, codeUsed: null, hasPrivileges: false };
  }
}

/**
 * Fetch 3x3 Referral Matrix tree for a given user (includes direct & spillover nodes)
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
    const qMatrix = query(collection(db, 'referrals'), where('matrixParentId', '==', userId));
    const qLegacy = query(collection(db, 'referrals'), where('inviterId', '==', userId));
    const [snapMatrix, snapLegacy] = await Promise.all([getDocs(qMatrix), getDocs(qLegacy)]);

    const mergedDocs = new Map<string, any>();
    snapMatrix.docs.forEach((d) => {
      const data = d.data();
      if (data.inviteeId) mergedDocs.set(data.inviteeId, { id: d.id, ...data });
    });
    snapLegacy.docs.forEach((d) => {
      const data = d.data();
      if (data.inviteeId && (!data.matrixParentId || data.matrixParentId === userId)) {
        if (!mergedDocs.has(data.inviteeId)) {
          mergedDocs.set(data.inviteeId, { id: d.id, ...data });
        }
      }
    });

    const directChildren: ReferralNode[] = [];
    const sortedEntries = Array.from(mergedDocs.values()).sort(
      (a, b) => (a.matrixSlot || 0) - (b.matrixSlot || 0)
    );

    for (const data of sortedEntries) {
      const childUid = data.inviteeId;
      let childName = data.inviteeName || 'Member';
      let childCode = data.codeUsed || 'REF';
      let childShops = 0;
      let childStars = 0;

      if (childUid) {
        try {
          const uSnap = await getDoc(doc(db, 'users', childUid));
          if (uSnap.exists()) {
            const uData = uSnap.data();
            childName = uData.name || childName;
            childCode = uData.referralCode || childCode;
            childShops = uData.shopsCount || 0;
            childStars = uData.starLevel || 0;
          }
        } catch {}
      }

      const childNode: ReferralNode = {
        id: data.id,
        userId: childUid,
        name: childName,
        referralCode: childCode,
        level: 1,
        matrixSlot: data.matrixSlot || (directChildren.length % 3) + 1,
        starLevel: childStars,
        parentId: userId,
        children: [],
        joinedDate: data.createdAt?.seconds
          ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
          : 'Recent',
        shopsCreated: childShops,
      };

      // Fetch Level 2 children for this node (indirect downline)
      try {
        const q2M = query(collection(db, 'referrals'), where('matrixParentId', '==', childUid));
        const q2L = query(collection(db, 'referrals'), where('inviterId', '==', childUid));
        const [snap2M, snap2L] = await Promise.all([getDocs(q2M), getDocs(q2L)]);
        const l2Seen = new Set<string>();

        for (const d2 of [...snap2M.docs, ...snap2L.docs]) {
          const data2 = d2.data();
          if (!data2.inviteeId || l2Seen.has(data2.inviteeId)) continue;
          if (data2.matrixParentId && data2.matrixParentId !== childUid) continue;
          l2Seen.add(data2.inviteeId);

          childNode.children.push({
            id: d2.id,
            userId: data2.inviteeId,
            name: data2.inviteeName || 'Sub Member',
            referralCode: data2.codeUsed || 'REF-SUB',
            level: 2,
            matrixSlot: data2.matrixSlot || childNode.children.length + 1,
            parentId: childUid,
            children: [],
            joinedDate: data2.createdAt?.seconds
              ? new Date(data2.createdAt.seconds * 1000).toLocaleDateString()
              : 'Recent',
            shopsCreated: 0,
          });
        }
      } catch {}

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
      limit(30)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.description || 'Points Transaction',
          amount: data.points || 0,
          date: data.createdAt?.seconds
            ? new Date(data.createdAt.seconds * 1000).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
            : 'Today',
          type: data.points >= 0 ? 'credit' : 'debit',
          eventType: data.eventType,
          referenceId: data.referenceId,
        };
      });
    }
  } catch (err) {
    console.warn('Points ledger query fallback:', err);
  }

  return [];
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile } from '../types';

// Hardcoded Designated Admin UIDs from User
export const KNOWN_ADMIN_UIDS = [
  'mbDWdPHMyIM7QXRMaZa1igMjBWq2',
];

export interface GoogleAuthResult {
  success: boolean;
  isNewUser: boolean;
  error?: string;
  errorCode?: string;
  currentDomain?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: (referralCodeInput?: string) => Promise<GoogleAuthResult>;
  signInWithEmail: (
    email: string,
    pass: string,
    isSignUp?: boolean,
    name?: string,
    referralCodeInput?: string
  ) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  signInWithAdminCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInAsTestMember: (email?: string, name?: string, asAdmin?: boolean) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  toggleFavorite: (shopId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate clean brand referral code: e.g. ASSPAS-8492
export function generateReferralCode(): string {
  const randNum = Math.floor(10000 + Math.random() * 90000);
  return `ASSPAS-${randNum}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Check admin privileges
  const checkIsAdmin = async (uid: string, userSnapData?: any): Promise<boolean> => {
    if (KNOWN_ADMIN_UIDS.includes(uid)) {
      return true;
    }
    if (userSnapData?.role === 'admin') {
      return true;
    }
    try {
      const adminDocRef = doc(db, 'admins', uid);
      const adminSnap = await getDoc(adminDocRef);
      return adminSnap.exists();
    } catch {
      return false;
    }
  };

  // Load user profile from Firestore
  const fetchUserProfile = async (uid: string, fbUser?: FirebaseUser | null): Promise<UserProfile | null> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      const userSnapData = userSnap.exists() ? userSnap.data() : null;

      const userIsAdmin = await checkIsAdmin(uid, userSnapData);
      setIsAdmin(userIsAdmin);

      if (userSnap.exists() && userSnapData) {
        return {
          id: uid,
          name: userSnapData.name || fbUser?.displayName || 'Member',
          email: userSnapData.email || fbUser?.email || '',
          photoURL: userSnapData.photoURL || fbUser?.photoURL || '',
          phone: userSnapData.phone || '',
          role: userIsAdmin ? 'admin' : (userSnapData.role || 'user'),
          points: userSnapData.points ?? 0,
          referralCode: userSnapData.referralCode || generateReferralCode(),
          referredBy: userSnapData.referredBy || null,
          hasReferralPrivileges: userSnapData.hasReferralPrivileges ?? false,
          matrixParentId: userSnapData.matrixParentId || null,
          matrixLevel: userSnapData.matrixLevel || 1,
          referredCount: userSnapData.referredCount ?? 0,
          isLoggedIn: true,
          favorites: userSnapData.favorites || [],
          shopsCount: userSnapData.shopsCount ?? 0,
          createdAt: userSnapData.createdAt ? new Date(userSnapData.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
        };
      }
      return null;
    } catch (error) {
      console.warn('Could not fetch Firestore user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);
      if (fbUser) {
        const profile = await fetchUserProfile(fbUser.uid, fbUser);
        if (profile) {
          setUserProfile(profile);
        } else {
          const userIsAdmin = await checkIsAdmin(fbUser.uid);
          setIsAdmin(userIsAdmin);
          const defaultProfile: UserProfile = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Member',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || '',
            phone: '',
            role: userIsAdmin ? 'admin' : 'user',
            points: 0,
            referralCode: generateReferralCode(),
            referredBy: null,
            hasReferralPrivileges: false,
            matrixParentId: null,
            matrixLevel: 1,
            referredCount: 0,
            isLoggedIn: true,
            favorites: [],
            shopsCount: 0,
          };
          setUserProfile(defaultProfile);
        }
      } else {
        // Keep existing test user profile if signed in as test member
        setUserProfile((prev) => (prev && prev.id.startsWith('member-') ? prev : null));
        setIsAdmin((prev) => (userProfile?.id === 'mbDWdPHMyIM7QXRMaZa1igMjBWq2' ? true : prev));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserProfile = async () => {
    if (currentUser) {
      const profile = await fetchUserProfile(currentUser.uid, currentUser);
      if (profile) setUserProfile(profile);
    }
  };

  /**
   * Admin Email/Password Sign-In specifically for /admin portal
   */
  const signInWithAdminCredentials = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const isAdm = await checkIsAdmin(cred.user.uid);
      setIsAdmin(isAdm);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      const msg = err?.message || 'Invalid admin credentials';
      return { success: false, error: msg };
    }
  };

  /**
   * Universal Referral Link & Reward Attribution Processor
   * Resolves inviter by referral code OR by user UID, awards 50 PTS to both,
   * updates 3x3 matrix tree, and logs to immutable pointsLedger.
   */
  const processReferralReward = async (
    inviteeUid: string,
    inviteeName: string,
    referredByInput?: string
  ): Promise<{ validInviterUid: string | null; codeUsed: string | null; hasPrivileges: boolean }> => {
    let rawRef = (referredByInput || '').trim();
    if (!rawRef && typeof window !== 'undefined') {
      rawRef = (localStorage.getItem('asspas_referred_by') || sessionStorage.getItem('asspas_referred_by') || '').trim();
    }

    if (!rawRef) {
      return { validInviterUid: null, codeUsed: null, hasPrivileges: false };
    }

    try {
      let inviterDocSnap: any = null;
      let matchedCode = rawRef;

      // 1. Try finding by referralCode (case-insensitive)
      const q = query(collection(db, 'users'), where('referralCode', '==', rawRef.toUpperCase()));
      const snap = await getDocs(q);
      if (!snap.empty && snap.docs[0].id !== inviteeUid) {
        inviterDocSnap = snap.docs[0];
        matchedCode = inviterDocSnap.data()?.referralCode || rawRef.toUpperCase();
      } else {
        // 2. Try finding by direct user UID document
        const uDoc = await getDoc(doc(db, 'users', rawRef));
        if (uDoc.exists() && uDoc.id !== inviteeUid) {
          inviterDocSnap = uDoc;
          matchedCode = uDoc.data()?.referralCode || rawRef;
        }
      }

      if (inviterDocSnap) {
        const inviterUid = inviterDocSnap.id;
        const inviterData = inviterDocSnap.data();
        const currentPts = inviterData?.points || 0;
        const currentCount = inviterData?.referredCount || 0;

        // Credit 50 points to inviter
        await updateDoc(doc(db, 'users', inviterUid), {
          points: currentPts + 50,
          referredCount: currentCount + 1,
          updatedAt: serverTimestamp(),
        });

        // Add to pointsLedger for inviter
        await addDoc(collection(db, 'pointsLedger'), {
          userId: inviterUid,
          eventType: 'referral_reward',
          points: 50,
          balanceAfter: currentPts + 50,
          referenceId: inviteeUid,
          description: `Referral reward (+50 PTS) for inviting ${inviteeName} via referral link`,
          createdAt: serverTimestamp(),
        });

        // Add to referrals tracking collection
        await addDoc(collection(db, 'referrals'), {
          inviterId: inviterUid,
          inviteeId: inviteeUid,
          inviteeName: inviteeName || 'New Member',
          codeUsed: matchedCode,
          matrixSlot: (currentCount % 3) + 1,
          level: 1,
          status: 'active',
          createdAt: serverTimestamp(),
        });

        // Clean up stored referral
        if (typeof window !== 'undefined') {
          localStorage.removeItem('asspas_referred_by');
          sessionStorage.removeItem('asspas_referred_by');
        }

        return { validInviterUid: inviterUid, codeUsed: matchedCode, hasPrivileges: true };
      }
    } catch (err) {
      console.warn('Error processing referral reward:', err);
    }

    return { validInviterUid: null, codeUsed: null, hasPrivileges: false };
  };

  /**
   * Sign In / Sign Up with Email and Password
   * Bypasses Google OAuth domain restriction completely
   */
  const signInWithEmail = async (
    email: string,
    pass: string,
    isSignUp: boolean = false,
    name?: string,
    referralCodeInput?: string
  ): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> => {
    try {
      setLoading(true);
      let fbUser: FirebaseUser;
      let isNew = false;

      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
        fbUser = cred.user;
        isNew = true;
        if (name && name.trim()) {
          try {
            await updateProfile(fbUser, { displayName: name.trim() });
          } catch {}
        }
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
        fbUser = cred.user;
      }

      // Check / Create Firestore User Document
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists() || isNew) {
        const { validInviterUid, codeUsed, hasPrivileges } = await processReferralReward(
          fbUser.uid,
          name?.trim() || fbUser.displayName || 'Member',
          referralCodeInput
        );

        const initialPoints = hasPrivileges ? 50 : 0;
        const myReferralCode = generateReferralCode();
        const userIsAdmin = await checkIsAdmin(fbUser.uid);
        setIsAdmin(userIsAdmin);

        const newProfileData = {
          id: fbUser.uid,
          name: name?.trim() || fbUser.displayName || 'Member',
          email: fbUser.email || '',
          photoURL: '',
          phone: '',
          role: userIsAdmin ? 'admin' : 'user',
          points: initialPoints,
          referralCode: myReferralCode,
          referredBy: validInviterUid ? codeUsed : null,
          hasReferralPrivileges: hasPrivileges,
          matrixParentId: validInviterUid,
          matrixLevel: 1,
          referredCount: 0,
          shopsCount: 0,
          favorites: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(userDocRef, newProfileData);

        if (hasPrivileges) {
          try {
            await addDoc(collection(db, 'pointsLedger'), {
              userId: fbUser.uid,
              eventType: 'referral_signup',
              points: 50,
              balanceAfter: 50,
              referenceId: codeUsed,
              description: `Welcome bonus (+50 PTS) for joining via referral link`,
              createdAt: serverTimestamp(),
            });
          } catch (err) {
            console.warn('Error recording invitee ledger:', err);
          }
        }

        const freshProfile: UserProfile = {
          id: fbUser.uid,
          name: name?.trim() || fbUser.displayName || 'Member',
          email: fbUser.email || '',
          photoURL: '',
          phone: '',
          role: userIsAdmin ? 'admin' : 'user',
          points: initialPoints,
          referralCode: myReferralCode,
          referredBy: validInviterUid ? codeUsed : null,
          hasReferralPrivileges: hasPrivileges,
          matrixParentId: validInviterUid,
          matrixLevel: 1,
          referredCount: 0,
          isLoggedIn: true,
          favorites: [],
          shopsCount: 0,
        };

        setUserProfile(freshProfile);
      } else {
        const existingProfile = await fetchUserProfile(fbUser.uid, fbUser);
        if (existingProfile) setUserProfile(existingProfile);
      }

      setLoading(false);
      return { success: true, isNewUser: isNew };
    } catch (err: any) {
      setLoading(false);
      let errorMsg = err?.message || 'Email authentication failed';
      if (err?.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already registered. Please sign in instead.';
      } else if (err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        errorMsg = 'Invalid email or password. Please verify your credentials.';
      } else if (err?.code === 'auth/weak-password') {
        errorMsg = 'Password should be at least 6 characters.';
      }
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Public Google Sign-In with 3x3 referral reward
   */
  const signInWithGoogle = async (
    referralCodeInput?: string
  ): Promise<GoogleAuthResult> => {
    try {
      setLoading(true);
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;
      
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);
      const isNew = !userSnap.exists();

      if (isNew) {
        const { validInviterUid, codeUsed, hasPrivileges } = await processReferralReward(
          fbUser.uid,
          fbUser.displayName || 'Member',
          referralCodeInput
        );

        const initialPoints = hasPrivileges ? 50 : 0;
        const myReferralCode = generateReferralCode();
        const userIsAdmin = await checkIsAdmin(fbUser.uid);
        setIsAdmin(userIsAdmin);

        const newProfileData = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Member',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || '',
          phone: '',
          role: userIsAdmin ? 'admin' : 'user',
          points: initialPoints,
          referralCode: myReferralCode,
          referredBy: validInviterUid ? codeUsed : null,
          hasReferralPrivileges: hasPrivileges,
          matrixParentId: validInviterUid,
          matrixLevel: 1,
          referredCount: 0,
          shopsCount: 0,
          favorites: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(userDocRef, newProfileData);

        if (hasPrivileges) {
          try {
            await addDoc(collection(db, 'pointsLedger'), {
              userId: fbUser.uid,
              eventType: 'referral_signup',
              points: 50,
              balanceAfter: 50,
              referenceId: codeUsed,
              description: `Welcome bonus (+50 PTS) for joining via referral link`,
              createdAt: serverTimestamp(),
            });
          } catch (err) {
            console.warn('Error recording Google invitee ledger:', err);
          }
        }

        const freshProfile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Member',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || '',
          phone: '',
          role: userIsAdmin ? 'admin' : 'user',
          points: initialPoints,
          referralCode: myReferralCode,
          referredBy: validInviterUid ? codeUsed : null,
          hasReferralPrivileges: hasPrivileges,
          matrixParentId: validInviterUid,
          matrixLevel: 1,
          referredCount: 0,
          isLoggedIn: true,
          favorites: [],
          shopsCount: 0,
        };

        setUserProfile(freshProfile);
      } else {
        const existingProfile = await fetchUserProfile(fbUser.uid, fbUser);
        if (existingProfile) setUserProfile(existingProfile);
      }

      setLoading(false);
      return { success: true, isNewUser: isNew };
    } catch (err: any) {
      setLoading(false);
      const isUnauthDomain = err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain');
      return {
        success: false,
        isNewUser: false,
        error: isUnauthDomain 
          ? 'Firebase Google OAuth domain not authorized. Please use Email/Password login or authorize this domain in Firebase Console.'
          : err?.message || 'Google authentication failed',
        errorCode: err?.code,
        currentDomain: typeof window !== 'undefined' ? window.location.hostname : '',
      };
    }
  };

  /**
   * Fast Demo / Preview Test Member Sign-In
   * Allows full interactive testing of shop additions, favorites, and admin console
   * even before domain is authorized in Firebase Console!
   */
  const signInAsTestMember = (email?: string, name?: string, asAdmin?: boolean) => {
    const testUid = asAdmin ? 'mbDWdPHMyIM7QXRMaZa1igMjBWq2' : `member-${Date.now().toString(36)}`;
    const testProfile: UserProfile = {
      id: testUid,
      name: name || (asAdmin ? 'Super Admin' : 'Verified Member'),
      email: email || (asAdmin ? 'admin@asspas.store' : 'member@asspas.store'),
      photoURL: '',
      phone: '0308-5599766',
      role: asAdmin ? 'admin' : 'user',
      points: 100,
      referralCode: generateReferralCode(),
      referredBy: 'ASSPAS-7892',
      hasReferralPrivileges: true,
      matrixParentId: null,
      matrixLevel: 1,
      referredCount: 1,
      isLoggedIn: true,
      favorites: [],
      shopsCount: 0,
      createdAt: new Date().toISOString(),
    };
    setUserProfile(testProfile);
    setIsAdmin(asAdmin ?? false);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));

    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Could not update profile in Firestore:', err);
      }
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      setUserProfile(null);
      setIsAdmin(false);
    } catch (err) {
      console.error('Logout error:', err);
      setUserProfile(null);
      setIsAdmin(false);
    }
  };

  const toggleFavorite = async (shopId: string) => {
    if (!userProfile) return;
    const isFav = userProfile.favorites.includes(shopId);
    const newFavorites = isFav
      ? userProfile.favorites.filter((id) => id !== shopId)
      : [...userProfile.favorites, shopId];

    setUserProfile((prev) => (prev ? { ...prev, favorites: newFavorites } : null));

    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          favorites: newFavorites,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Could not update favorites in Firestore:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        signInWithGoogle,
        signInWithEmail,
        signInWithAdminCredentials,
        signInAsTestMember,
        updateUserProfile,
        logout,
        refreshUserProfile,
        toggleFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

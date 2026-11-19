import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile } from '../types';
import {
  calculateStarLevel,
  processMatrixReferralLinkage,
  fetchUserReferralTree,
} from '../services/referralService';

export const KNOWN_ADMIN_UIDS = ['mbDWdPHMyIM7QXRMaZa1igMjBWq2'];

export interface GoogleAuthResult {
  success: boolean;
  isNewUser: boolean;
  error?: string;
  errorCode?: string;
  currentDomain?: string;
}

export interface ExtraAuthDetails {
  phone?: string;
  address?: string;
  province?: string;
  city?: string;
  area?: string;
  photoURL?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: (referralCodeInput?: string, extraDetails?: ExtraAuthDetails) => Promise<GoogleAuthResult>;
  signInWithEmail: (
    email: string,
    pass: string,
    isSignUp?: boolean,
    name?: string,
    referralCodeInput?: string,
    extraDetails?: ExtraAuthDetails
  ) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  signInWithAdminCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  attachSponsorReferralCode: (codeOrLink: string) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  toggleFavorite: (shopId: string) => Promise<void>;
  toggleFavoriteProduct: (productId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function generateReferralCode(): string {
  const randNum = Math.floor(10000 + Math.random() * 90000);
  return `ASSPAS-${randNum}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const checkIsAdmin = async (uid: string, userSnapData?: any): Promise<boolean> => {
    if (KNOWN_ADMIN_UIDS.includes(uid)) return true;
    if (userSnapData?.role === 'admin') return true;
    try {
      const adminDocRef = doc(db, 'admins', uid);
      const adminSnap = await getDoc(adminDocRef);
      return adminSnap.exists();
    } catch {
      return false;
    }
  };

  const fetchUserProfile = async (uid: string, fbUser?: FirebaseUser | null): Promise<UserProfile | null> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      const userSnapData = userSnap.exists() ? userSnap.data() : null;

      const userIsAdmin = await checkIsAdmin(uid, userSnapData);
      setIsAdmin(userIsAdmin);

      if (userSnap.exists() && userSnapData) {
        let resolvedStar = userSnapData.starLevel ?? 0;
        try {
          if (userSnapData.referredCount >= 3 && resolvedStar === 0) {
            const tree = await fetchUserReferralTree(uid, userSnapData.referralCode || '');
            resolvedStar = calculateStarLevel(
              tree.children.length,
              tree.children.map((c) => c.starLevel || 0)
            );
          }
        } catch {}

        // Track lastActive & lastLogin cleanly
        try {
          await updateDoc(userDocRef, {
            lastActive: new Date().toISOString(),
          });
        } catch {}

        return {
          id: uid,
          name: userSnapData.name || fbUser?.displayName || 'Member',
          email: userSnapData.email || fbUser?.email || '',
          photoURL: userSnapData.photoURL || fbUser?.photoURL || '',
          phone: userSnapData.phone || '',
          address: userSnapData.address || '',
          province: userSnapData.province || '',
          city: userSnapData.city || 'Peshawar',
          area: userSnapData.area || '',
          role: userIsAdmin ? 'admin' : (userSnapData.role || 'user'),
          status: userSnapData.status || 'active',
          lastActive: new Date().toISOString(),
          lastLogin: userSnapData.lastLogin || new Date().toISOString(),
          onlineMinutes: userSnapData.onlineMinutes ?? 0,
          shopsVisited: userSnapData.shopsVisited ?? 0,
          points: userSnapData.points ?? 0,
          referralCode: userSnapData.referralCode || generateReferralCode(),
          referredBy: userSnapData.referredBy || null,
          hasReferralPrivileges: userSnapData.hasReferralPrivileges ?? false,
          matrixParentId: userSnapData.matrixParentId || null,
          matrixLevel: userSnapData.matrixLevel || 1,
          starLevel: resolvedStar,
          referredCount: userSnapData.referredCount ?? 0,
          isLoggedIn: true,
          favorites: userSnapData.favorites || [],
          favoriteProducts: userSnapData.favoriteProducts || [],
          shopsCount: userSnapData.shopsCount ?? 0,
          createdAt: userSnapData.createdAt?.seconds
            ? new Date(userSnapData.createdAt.seconds * 1000).toISOString()
            : new Date().toISOString(),
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
          setUserProfile({
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
            starLevel: 0,
            referredCount: 0,
            isLoggedIn: true,
            favorites: [],
            favoriteProducts: [],
            shopsCount: 0,
          });
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
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
      if (!isAdm) {
        await fbSignOut(auth);
        return { success: false, error: 'This account does not have Administrator permissions.' };
      }
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err?.message || 'Invalid admin credentials' };
    }
  };

  const signInWithEmail = async (
    email: string,
    pass: string,
    isSignUp: boolean = false,
    name?: string,
    referralCodeInput?: string,
    extraDetails?: ExtraAuthDetails
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

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists() || isNew) {
        const referralResult = await processMatrixReferralLinkage(
          fbUser.uid,
          name?.trim() || fbUser.displayName || 'Member',
          referralCodeInput,
          50
        );

        const initialPoints = referralResult.hasPrivileges ? 50 : 0;
        const myReferralCode = generateReferralCode();
        const userIsAdmin = await checkIsAdmin(fbUser.uid);
        setIsAdmin(userIsAdmin);

        const nowIso = new Date().toISOString();
        const newProfileData = {
          id: fbUser.uid,
          name: name?.trim() || fbUser.displayName || 'Member',
          email: fbUser.email || '',
          photoURL: extraDetails?.photoURL || '',
          phone: extraDetails?.phone || '',
          address: extraDetails?.address || '',
          province: extraDetails?.province || 'Khyber Pakhtunkhwa (KP)',
          city: extraDetails?.city || 'Peshawar',
          area: extraDetails?.area || '',
          role: userIsAdmin ? 'admin' : 'user',
          status: 'active',
          lastActive: nowIso,
          lastLogin: nowIso,
          onlineMinutes: 0,
          shopsVisited: 0,
          points: initialPoints,
          referralCode: myReferralCode,
          referredBy: referralResult.validSponsorUid ? referralResult.codeUsed : null,
          hasReferralPrivileges: referralResult.hasPrivileges,
          matrixParentId: referralResult.matrixParentId,
          matrixLevel: referralResult.matrixLevel,
          starLevel: 0,
          referredCount: 0,
          shopsCount: 0,
          favorites: [],
          favoriteProducts: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(userDocRef, newProfileData);

        if (referralResult.hasPrivileges) {
          try {
            await addDoc(collection(db, 'pointsLedger'), {
              userId: fbUser.uid,
              eventType: 'referral_signup',
              points: 50,
              balanceAfter: 50,
              referenceId: referralResult.codeUsed,
              description: `Welcome bonus (+50 PTS) for joining via referral link`,
              createdAt: serverTimestamp(),
            });
          } catch {}
        }

        setUserProfile({
          ...newProfileData,
          role: userIsAdmin ? 'admin' : 'user',
          status: 'active',
          isLoggedIn: true,
          createdAt: nowIso,
        });
      } else {
        await updateDoc(userDocRef, {
          lastLogin: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        }).catch(() => {});
        const existingProfile = await fetchUserProfile(fbUser.uid, fbUser);
        if (existingProfile) setUserProfile(existingProfile);
      }

      setLoading(false);
      return { success: true, isNewUser: isNew };
    } catch (err: any) {
      setLoading(false);
      let errorMsg = err?.message || 'Email authentication failed';
      if (err?.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already registered. Please sign in using Email Login.';
      } else if (
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/user-not-found' ||
        err?.code === 'auth/invalid-credential'
      ) {
        errorMsg = 'Invalid email or password. Please verify your credentials.';
      } else if (err?.code === 'auth/weak-password') {
        errorMsg = 'Password should be at least 6 characters.';
      }
      return { success: false, error: errorMsg };
    }
  };

  const signInWithGoogle = async (
    referralCodeInput?: string,
    extraDetails?: ExtraAuthDetails
  ): Promise<GoogleAuthResult> => {
    try {
      setLoading(true);
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);
      const isNew = !userSnap.exists();

      if (isNew) {
        const referralResult = await processMatrixReferralLinkage(
          fbUser.uid,
          fbUser.displayName || 'Member',
          referralCodeInput,
          50
        );

        const initialPoints = referralResult.hasPrivileges ? 50 : 0;
        const myReferralCode = generateReferralCode();
        const userIsAdmin = await checkIsAdmin(fbUser.uid);
        setIsAdmin(userIsAdmin);

        const nowIso = new Date().toISOString();
        const newProfileData = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Member',
          email: fbUser.email || '',
          photoURL: extraDetails?.photoURL || fbUser.photoURL || '',
          phone: extraDetails?.phone || '',
          address: extraDetails?.address || '',
          province: extraDetails?.province || 'Khyber Pakhtunkhwa (KP)',
          city: extraDetails?.city || 'Peshawar',
          area: extraDetails?.area || '',
          role: userIsAdmin ? 'admin' : 'user',
          status: 'active',
          lastActive: nowIso,
          lastLogin: nowIso,
          onlineMinutes: 0,
          shopsVisited: 0,
          points: initialPoints,
          referralCode: myReferralCode,
          referredBy: referralResult.validSponsorUid ? referralResult.codeUsed : null,
          hasReferralPrivileges: referralResult.hasPrivileges,
          matrixParentId: referralResult.matrixParentId,
          matrixLevel: referralResult.matrixLevel,
          starLevel: 0,
          referredCount: 0,
          shopsCount: 0,
          favorites: [],
          favoriteProducts: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(userDocRef, newProfileData);

        if (referralResult.hasPrivileges) {
          try {
            await addDoc(collection(db, 'pointsLedger'), {
              userId: fbUser.uid,
              eventType: 'referral_signup',
              points: 50,
              balanceAfter: 50,
              referenceId: referralResult.codeUsed,
              description: `Welcome bonus (+50 PTS) for joining via referral link`,
              createdAt: serverTimestamp(),
            });
          } catch {}
        }

        setUserProfile({
          ...newProfileData,
          role: userIsAdmin ? 'admin' : 'user',
          status: 'active',
          isLoggedIn: true,
          createdAt: nowIso,
        });
      } else {
        await updateDoc(userDocRef, {
          lastLogin: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        }).catch(() => {});
        const existingProfile = await fetchUserProfile(fbUser.uid, fbUser);
        if (existingProfile) setUserProfile(existingProfile);
      }

      setLoading(false);
      return { success: true, isNewUser: isNew };
    } catch (err: any) {
      setLoading(false);
      const isUnauthDomain =
        err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain');
      return {
        success: false,
        isNewUser: false,
        error: isUnauthDomain
          ? 'Google OAuth domain is not yet authorized in Firebase Console. Please use Email/Password sign in instead.'
          : err?.message || 'Google authentication failed',
        errorCode: err?.code,
        currentDomain: typeof window !== 'undefined' ? window.location.hostname : '',
      };
    }
  };

  /**
   * Allows a logged-in user who registered without a sponsor code to attach one once and join the 3x3 matrix.
   */
  const attachSponsorReferralCode = async (
    codeOrLink: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || !userProfile) {
      return { success: false, message: 'Please log in first.' };
    }
    if (userProfile.referredBy) {
      return { success: false, message: `You are already linked to sponsor code ${userProfile.referredBy}.` };
    }

    const res = await processMatrixReferralLinkage(
      currentUser.uid,
      userProfile.name,
      codeOrLink,
      50
    );

    if (!res.validSponsorUid || !res.codeUsed) {
      return { success: false, message: 'Sponsor code not found or cannot refer yourself. Please verify and try again.' };
    }

    const updatedPoints = (userProfile.points || 0) + 50;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        referredBy: res.codeUsed,
        matrixParentId: res.matrixParentId,
        matrixLevel: res.matrixLevel,
        hasReferralPrivileges: true,
        points: updatedPoints,
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'pointsLedger'), {
        userId: currentUser.uid,
        eventType: 'referral_signup',
        points: 50,
        balanceAfter: updatedPoints,
        referenceId: res.codeUsed,
        description: `Late Sponsor Bind Bonus (+50 PTS) linked to ${res.codeUsed}`,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Error updating user sponsor fields:', err);
    }

    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            referredBy: res.codeUsed,
            matrixParentId: res.matrixParentId,
            matrixLevel: res.matrixLevel,
            hasReferralPrivileges: true,
            points: updatedPoints,
          }
        : null
    );

    return {
      success: true,
      message: `Linked to ${res.codeUsed}! +50 PTS credited & 3×3 Matrix privileges unlocked.`,
    };
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
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
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

  const toggleFavoriteProduct = async (productId: string) => {
    if (!userProfile) return;
    const currentFavs = userProfile.favoriteProducts || [];
    const isFav = currentFavs.includes(productId);
    const newFavs = isFav ? currentFavs.filter((id) => id !== productId) : [...currentFavs, productId];

    setUserProfile((prev) => (prev ? { ...prev, favoriteProducts: newFavs } : null));

    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          favoriteProducts: newFavs,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Could not update favorite products in Firestore:', err);
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
        attachSponsorReferralCode,
        updateUserProfile,
        logout,
        refreshUserProfile,
        toggleFavorite,
        toggleFavoriteProduct,
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

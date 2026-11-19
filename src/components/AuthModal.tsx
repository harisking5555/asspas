import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  LogOut,
  CheckCircle2,
  Copy,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  ExternalLink,
  Mail,
  Lock,
  User,
  Camera,
  Upload,
  Check,
  Eye,
  EyeOff,
  Phone,
  QrCode,
  Gift,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { uploadImageToImgBB } from '../services/imageUploadService';
import { getReferralLink, generateQrCodeDataUrl, normalizeReferralInput } from '../services/referralService';
import { PAKISTAN_REGIONS } from '../data/pakistanRegions';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToProfile?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onNavigateToAdmin,
  onNavigateToProfile,
}) => {
  const {
    currentUser,
    userProfile,
    isAdmin,
    signInWithGoogle,
    signInWithEmail,
    updateUserProfile,
    logout,
    loading,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'email' | 'signup' | 'google'>('email');
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [provinceInput, setProvinceInput] = useState('Khyber Pakhtunkhwa (KP)');
  const [cityInput, setCityInput] = useState('Peshawar');
  const [areaInput, setAreaInput] = useState('');
  const [signupPhotoUrl, setSignupPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [igCopiedToast, setIgCopiedToast] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  const activeStoredReferral =
    typeof window !== 'undefined'
      ? localStorage.getItem('asspas_referred_by') || sessionStorage.getItem('asspas_referred_by')
      : null;

  useEffect(() => {
    if (isOpen && activeStoredReferral && !referralCodeInput) {
      setReferralCodeInput(activeStoredReferral);
    }
  }, [isOpen, activeStoredReferral]);

  useEffect(() => {
    if (userProfile?.referralCode) {
      generateQrCodeDataUrl(getReferralLink(userProfile.referralCode)).then(setQrDataUrl);
    }
  }, [userProfile?.referralCode]);

  // Clear password inputs whenever mode switches so browser never carries stale autofill across accounts
  const handleSwitchMode = (nextMode: 'email' | 'signup' | 'google') => {
    setAuthMode(nextMode);
    setPasswordInput('');
    setConfirmPasswordInput('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrorMsg(null);
  };

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setUnauthorizedDomain(null);
    const cleanedRef = normalizeReferralInput(referralCodeInput) || activeStoredReferral || undefined;
    const res = await signInWithGoogle(cleanedRef, {
      phone: phoneInput.trim() || undefined,
      province: provinceInput,
      city: cityInput,
      area: areaInput.trim() || undefined,
      address: addressInput.trim() || undefined,
    });
    if (!res.success) {
      if (res.errorCode === 'auth/unauthorized-domain' || res.error?.includes('unauthorized-domain')) {
        setUnauthorizedDomain(res.currentDomain || currentHostname);
      } else {
        setErrorMsg(res.error || 'Failed to authenticate with Google. Please try again.');
      }
    } else {
      onClose();
    }
  };

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploadingPhoto(true);
        const res = await uploadImageToImgBB(file);
        if (res.success && res.url) {
          if (userProfile) {
            await updateUserProfile({ photoURL: res.url });
          } else {
            setSignupPhotoUrl(res.url);
          }
        }
      } catch (err) {
        console.warn('Photo upload failed:', err);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) return;

    if (authMode === 'signup') {
      if (!nameInput.trim()) {
        setErrorMsg('Please enter your full name / username.');
        return;
      }
      if (!phoneInput.trim()) {
        setErrorMsg('Please enter your Pakistani mobile phone number.');
        return;
      }
      const cleanPhone = phoneInput.replace(/[-\s]/g, '');
      if (!/^((\+92|0)?3[0-9]{9})$/.test(cleanPhone)) {
        setErrorMsg('Please enter a valid Pakistani mobile number (e.g. 0300-1234567).');
        return;
      }
      if (passwordInput !== confirmPasswordInput) {
        setErrorMsg('Passwords do not match. Please re-enter your password in both fields.');
        return;
      }
      if (passwordInput.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
    }

    setErrorMsg(null);
    setUnauthorizedDomain(null);

    const isSignUp = authMode === 'signup';
    const referralToPass = normalizeReferralInput(referralCodeInput) || activeStoredReferral || undefined;
    const res = await signInWithEmail(emailInput, passwordInput, isSignUp, nameInput, referralToPass, {
      phone: phoneInput.trim(),
      address: addressInput.trim(),
      province: provinceInput,
      city: cityInput,
      area: areaInput.trim(),
      photoURL: signupPhotoUrl,
    });
    if (!res.success) {
      setErrorMsg(res.error || 'Email authentication failed.');
    } else {
      setPasswordInput('');
      setConfirmPasswordInput('');
      onClose();
    }
  };

  const copyDomain = () => {
    const domain = unauthorizedDomain || currentHostname;
    navigator.clipboard.writeText(domain);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const firebaseSettingsUrl =
    'https://console.firebase.google.com/u/2/project/asspas-611e9/authentication/settings';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm font-['Poppins']">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white flex items-center justify-between border-b border-emerald-800/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-['Outfit'] font-extrabold text-base tracking-tight">
                  {userProfile ? 'Your Verified Account' : 'Welcome to asspas.store'}
                </h3>
                <p className="text-[11px] text-emerald-200/90">
                  {userProfile
                    ? 'Active member of Pakistan local commerce network'
                    : 'Sign in or register to unlock shops, rewards & favorites'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-700">
            {userProfile ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3.5">
                    <div className="relative group shrink-0">
                      {userProfile.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt={userProfile.name}
                          className="w-14 h-14 rounded-full border-2 border-emerald-500 object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                          {userProfile.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <label
                        title="Upload Profile Picture"
                        className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold"
                      >
                        <span>{uploadingPhoto ? '...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfilePhotoChange}
                        />
                      </label>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm truncate">{userProfile.name}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{userProfile.email}</div>
                      {userProfile.phone && (
                        <div className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                          {userProfile.phone}
                        </div>
                      )}
                      {userProfile.city && (
                        <div className="text-[10px] text-emerald-800 font-medium">
                          {userProfile.city}, {userProfile.province || 'Pakistan'}
                        </div>
                      )}
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                          <ShieldCheck className="w-3 h-3" /> System Admin
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Edit Section */}
                  <div className="pt-2 border-t border-emerald-200/60">
                    {!isEditingProfile ? (
                      <div className="flex items-center justify-between text-[11px]">
                        <label className="text-emerald-800 font-bold hover:underline cursor-pointer flex items-center gap-1">
                          <span>{uploadingPhoto ? 'Uploading photo...' : 'Change Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfilePhotoChange}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setEditName(userProfile.name || '');
                            setEditPhone(userProfile.phone || '');
                            setEditCity(userProfile.city || 'Peshawar');
                            setIsEditingProfile(true);
                          }}
                          className="text-emerald-800 font-bold hover:underline cursor-pointer"
                        >
                          Edit Name / Phone / City
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          try {
                            setSavingProfile(true);
                            await updateUserProfile({
                              name: editName.trim() || userProfile.name,
                              phone: editPhone.trim(),
                              city: editCity.trim(),
                            });
                            setIsEditingProfile(false);
                            setProfileSuccessMsg('Profile updated successfully!');
                            setTimeout(() => setProfileSuccessMsg(null), 3000);
                          } finally {
                            setSavingProfile(false);
                          }
                        }}
                        className="space-y-2.5 bg-white p-3 rounded-xl border border-emerald-200 shadow-xs"
                      >
                        <div className="font-bold text-[11px] text-slate-800">Quick Profile Update</div>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="tel"
                            placeholder="0300-1234567"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                          />
                          <input
                            type="text"
                            placeholder="City (e.g. Peshawar)"
                            value={editCity}
                            onChange={(e) => setEditCity(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                            className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={savingProfile}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            {savingProfile ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </form>
                    )}
                    {profileSuccessMsg && (
                      <div className="mt-1 text-[11px] text-emerald-700 font-bold">{profileSuccessMsg}</div>
                    )}
                  </div>
                </div>

                {/* Points & Rank */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl">
                    <div className="text-[11px] text-emerald-800 font-bold">Reward Points (PTS)</div>
                    <div className="text-xl font-black text-emerald-900 font-['Outfit'] mt-0.5">
                      {userProfile.points} <span className="text-xs font-semibold text-emerald-600">PTS</span>
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-1 leading-tight font-medium">
                      PTS = Points earned via referrals & verified shops.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="text-[11px] text-slate-500 font-medium">Matrix Rank</div>
                    <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
                      {userProfile.hasReferralPrivileges ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> 3×3 Active
                        </span>
                      ) : (
                        <span className="text-slate-500">Direct Member</span>
                      )}
                    </div>
                    <p className="text-[10px] text-amber-700 font-bold mt-1">
                      ★ {userProfile.starLevel || 0} / 10 Stars ({userProfile.referredCount} refs)
                    </p>
                  </div>
                </div>

                {/* Referral Link + QR Code + Share */}
                <div className="p-3.5 bg-emerald-950 text-white rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-300 font-medium">Your Referral Link &amp; QR:</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-700/50">
                      +50 PTS / Invite
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {qrDataUrl && (
                      <div className="bg-white p-1.5 rounded-xl shrink-0">
                        <img src={qrDataUrl} alt="Referral QR" className="w-16 h-16" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="text-[10px] text-emerald-300 font-mono">
                        Code: <strong className="text-white select-all">{userProfile.referralCode}</strong>
                      </div>
                      <div className="bg-emerald-900/70 border border-emerald-700/60 rounded-xl p-1.5 flex items-center justify-between gap-1.5">
                        <span className="font-mono text-[10px] text-emerald-100 truncate select-all">
                          {getReferralLink(userProfile.referralCode)}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(getReferralLink(userProfile.referralCode));
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {igCopiedToast && (
                    <div className="p-2 bg-emerald-800/90 text-emerald-100 rounded-lg text-[10px] font-semibold">
                      Referral link copied! Paste it into your Instagram Story or Bio.
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const link = getReferralLink(userProfile.referralCode);
                        const text = `Assalam-o-Alaikum! Join asspas.store to find verified shops & Elegancia Mineral Water in Pakistan. Register via my link to get 50 Free Welcome Points: ${link}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="py-1.5 px-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold text-[11px] cursor-pointer"
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const link = getReferralLink(userProfile.referralCode);
                        window.open(
                          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
                          '_blank'
                        );
                      }}
                      className="py-1.5 px-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl font-bold text-[11px] cursor-pointer"
                    >
                      Facebook
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(getReferralLink(userProfile.referralCode));
                        setIgCopiedToast(true);
                        setTimeout(() => setIgCopiedToast(false), 3000);
                      }}
                      className="py-1.5 px-2 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white rounded-xl font-bold text-[11px] cursor-pointer"
                    >
                      Instagram
                    </button>
                  </div>
                </div>

                {onNavigateToProfile && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToProfile();
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <User className="w-4 h-4 text-emerald-100" />
                    <span>Open Full Profile, 3×3 Matrix &amp; Shops →</span>
                  </button>
                )}

                {isAdmin && onNavigateToAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToAdmin();
                    }}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Open Super Admin Console</span>
                  </button>
                )}

                <button
                  onClick={async () => {
                    await logout();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out / Sign Out</span>
                </button>
              </div>
            ) : (
              /* Logged out state */
              <div className="space-y-4">
                {unauthorizedDomain && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2.5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs">Firebase Authorized Domain Required</div>
                        <div className="text-[11px] text-amber-800 mt-0.5">
                          Google Sign-In needs this domain authorized in Firebase, OR use Email Login right now.
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-slate-700 truncate select-all">
                        {unauthorizedDomain}
                      </span>
                      <button
                        type="button"
                        onClick={copyDomain}
                        className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md font-bold text-[10px] shrink-0 cursor-pointer"
                      >
                        {copiedDomain ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <a
                        href={firebaseSettingsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:underline"
                      >
                        <span>Firebase Console</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('email')}
                        className="text-[11px] font-bold text-emerald-800 underline cursor-pointer"
                      >
                        Use Email Login →
                      </button>
                    </div>
                  </div>
                )}

                {/* Mode Selector Tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('email')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                      authMode === 'email'
                        ? 'bg-white text-emerald-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Email Login
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signup')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                      authMode === 'signup'
                        ? 'bg-white text-emerald-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('google')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                      authMode === 'google'
                        ? 'bg-white text-emerald-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Google
                  </button>
                </div>

                {/* Reward Callout */}
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    50 PTS Welcome Referral Bonus
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Join with a neighbor's referral link or code to unlock 3×3 Matrix privileges &amp; earn <strong>50 PTS (Points)</strong>.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {authMode === 'google' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Referral Code or Link (Optional)
                      </label>
                      <div className="relative">
                        <Gift className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. ASSPAS-12345 or paste invite link"
                          value={referralCodeInput}
                          onChange={(e) => setReferralCodeInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-emerald-600 rounded-2xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-3 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                    </button>
                  </div>
                )}

                {(authMode === 'email' || authMode === 'signup') && (
                  <form
                    onSubmit={handleEmailAuth}
                    autoComplete={authMode === 'signup' ? 'off' : 'on'}
                    className="space-y-3"
                  >
                    {authMode === 'signup' && (
                      <>
                        {/* Full Name */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Full Name / Username *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              autoComplete="name"
                              placeholder="e.g. Haris Khan"
                              value={nameInput}
                              onChange={(e) => setNameInput(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                            />
                          </div>
                        </div>

                        {/* Profile Photo Upload */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-slate-700">
                              Profile Picture (Optional)
                            </label>
                            {uploadingPhoto && (
                              <span className="text-[10px] text-emerald-700 font-bold animate-pulse">
                                Uploading...
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                            {signupPhotoUrl ? (
                              <img
                                src={signupPhotoUrl}
                                alt="Preview"
                                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                <Camera className="w-5 h-5" />
                              </div>
                            )}
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 rounded-lg text-[11px] font-bold cursor-pointer">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{signupPhotoUrl ? 'Change Photo' : 'Upload Picture'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePhotoChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Mobile Phone Number (Pakistan) *
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              required
                              autoComplete="tel"
                              placeholder="0300-1234567"
                              value={phoneInput}
                              onChange={(e) => setPhoneInput(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                            />
                          </div>
                        </div>

                        {/* Province & City */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Province *
                            </label>
                            <select
                              value={provinceInput}
                              onChange={(e) => {
                                setProvinceInput(e.target.value);
                                const prov = PAKISTAN_REGIONS.find((p) => p.name === e.target.value);
                                if (prov && prov.cities.length > 0) {
                                  setCityInput(prov.cities[0].name);
                                }
                              }}
                              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                            >
                              {PAKISTAN_REGIONS.map((prov) => (
                                <option key={prov.code} value={prov.name}>
                                  {prov.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              City *
                            </label>
                            <select
                              value={cityInput}
                              onChange={(e) => setCityInput(e.target.value)}
                              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                            >
                              {(PAKISTAN_REGIONS.find((p) => p.name === provinceInput)?.cities || []).map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Area & Street Address */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Area / Sector / Bazar
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Hayatabad Phase 3"
                              value={areaInput}
                              onChange={(e) => setAreaInput(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Street Address
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Street 4, House 12"
                              value={addressInput}
                              onChange={(e) => setAddressInput(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                            />
                          </div>
                        </div>

                        {/* Sponsor Referral Code / Link */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Referral Code or Invite Link (Optional — +50 PTS)
                          </label>
                          <div className="relative">
                            <Gift className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="e.g. ASSPAS-12345 or paste ?ref= link"
                              value={referralCodeInput}
                              onChange={(e) => setReferralCodeInput(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          autoComplete={authMode === 'signup' ? 'off' : 'email'}
                          placeholder="yourname@gmail.com"
                          value={emailInput}
                          onChange={(e) => {
                            setEmailInput(e.target.value);
                            if (authMode === 'signup') {
                              setPasswordInput('');
                              setConfirmPasswordInput('');
                            }
                          }}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                          placeholder={authMode === 'signup' ? 'Create password (min 6 chars)' : 'Enter your password'}
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {authMode === 'signup' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            placeholder="Re-enter password"
                            value={confirmPasswordInput}
                            onChange={(e) => setConfirmPasswordInput(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      {loading
                        ? 'Authenticating...'
                        : authMode === 'signup'
                        ? 'Create New Account'
                        : 'Sign In with Email'}
                    </button>

                    {authMode === 'email' && (
                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-200" />
                        <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-semibold uppercase">
                          or
                        </span>
                        <div className="flex-grow border-t border-slate-200" />
                      </div>
                    )}

                    {authMode === 'email' && (
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-emerald-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-600 hidden" />
                        <span>Sign in with Google Account</span>
                      </button>
                    )}
                  </form>
                )}

                <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  By continuing, you agree to asspas.store Community Terms &amp; Privacy Policy
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

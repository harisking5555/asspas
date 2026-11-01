import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Droplet, 
  Percent, 
  Truck, 
  Award,
  Users,
  Network,
  Clock,
  ArrowRight,
  ShieldCheck,
  Store,
  Star,
  ExternalLink,
  MessageCircle,
  Facebook,
  Instagram,
  Send,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, ReferralNode, PointTransaction } from '../types';
import { fetchUserReferralTree, fetchUserPointsLedger } from '../services/referralService';
import { useAuth } from '../context/AuthContext';

interface RewardsClubViewProps {
  user: UserProfile;
  onAddPoints: (amount: number, reason: string) => void;
  onOpenAuth?: () => void;
}

export const RewardsClubView: React.FC<RewardsClubViewProps> = ({
  user,
  onAddPoints,
  onOpenAuth,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [referralTree, setReferralTree] = useState<ReferralNode | null>(null);
  const [pointsHistory, setPointsHistory] = useState<PointTransaction[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const activeProfile = userProfile || user;
  const referralUrl = `https://asspas.store/?ref=${activeProfile.referralCode}`;

  useEffect(() => {
    if (activeProfile?.id) {
      setLoadingData(true);
      Promise.all([
        fetchUserReferralTree(activeProfile.id, activeProfile.referralCode),
        fetchUserPointsLedger(activeProfile.id),
      ]).then(([tree, ledger]) => {
        setReferralTree(tree);
        setPointsHistory(ledger);
        setLoadingData(false);
      });
    }
  }, [activeProfile?.id, activeProfile?.referralCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Assalam-o-Alaikum! Join me on asspas.store to find all verified shops & Elegancia Mineral Water in Pakistan. Register via my referral link to claim 50 Free Welcome Points: ${referralUrl}`;

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`, '_blank');
  };

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleInstagramShare = () => {
    navigator.clipboard.writeText(referralUrl);
    alert('Link copied to clipboard! You can now paste your asspas.store referral link in your Instagram Bio or Story sticker.');
  };

  const handleRedeem = (cost: number, title: string) => {
    if (activeProfile.points < cost) {
      alert(`You have ${activeProfile.points} points. You need ${cost} points for this perk. Share your referral link to earn 50 points per registration & 50 points per shop created!`);
      return;
    }
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {}
    onAddPoints(-cost, `Redeemed ${title}`);
    setClaimSuccess(title);
    setTimeout(() => setClaimSuccess(null), 4000);
  };

  // Calculate Star Level:
  // 3 children => 1 Star
  // when 3 children each have 3 children => 2 Star
  // up to 10 Stars
  const directCount = activeProfile.referredCount || 0;
  let calculatedStarLevel = 0;
  if (directCount >= 39) calculatedStarLevel = 4;
  else if (directCount >= 12) calculatedStarLevel = 3;
  else if (directCount >= 6) calculatedStarLevel = 2;
  else if (directCount >= 3) calculatedStarLevel = 1;

  const currentStarLevel = activeProfile.starLevel || calculatedStarLevel;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-['Poppins']">
      {/* Hero Points Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-800/60">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>asspas.store 3×3 Matrix Star Network (1 to 10 Stars)</span>
            </div>
            <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-black tracking-tight">
              3×3 Matrix Loyalty & Star Level System
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              Every member can introduce 3 children. Fill your 3 direct slots to unlock <strong>1 Star ★</strong>. As your team grows, you level up through <strong>10 Stars ★★★★★★★★★★</strong>!
            </p>
          </div>

          {/* Points & Star Level Pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 text-center shrink-0 min-w-[220px]">
            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">
              Available Rewards Points (PTS)
            </span>
            <div className="font-['Outfit'] text-4xl font-black text-white tabular-nums mt-1">
              {activeProfile.points} <span className="text-xs font-normal text-emerald-200">PTS</span>
            </div>
            <div className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 text-xs font-black px-3.5 py-1 rounded-full shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-950" />
              <span>{currentStarLevel > 0 ? `Level ${currentStarLevel} Star Member` : 'Aspiring 1-Star Member'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation of PTS (Points) Badge */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-950">
        <HelpCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">What is "PTS"?</span> PTS stands for <strong>Points</strong>. In asspas.store, points are redeemable store currency earned by referring neighbors and registering verified businesses. Points can be exchanged for free Elegancia mineral water cans, delivery waivers, and promotional badges.
        </div>
      </div>

      {claimSuccess && (
        <div className="bg-emerald-50 text-emerald-900 text-xs font-bold p-4 rounded-2xl border border-emerald-200 flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Congratulations! You redeemed <strong>{claimSuccess}</strong>. The voucher has been activated for your account ({activeProfile.email || activeProfile.phone}).
          </span>
        </div>
      )}

      {/* 10-Star Level Progression Tracker */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-['Outfit'] font-black text-base text-slate-900">
              10-Star Matrix Progression Ladder
            </h3>
            <p className="text-xs text-slate-500">
              Add 3 direct accounts to reach 1 Star. Subsequent direct referrals spill over to your downstream team.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-xl">
            Current: {currentStarLevel} / 10 Stars
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
          {Array.from({ length: 10 }).map((_, i) => {
            const starNum = i + 1;
            const isUnlocked = currentStarLevel >= starNum;
            return (
              <div
                key={starNum}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isUnlocked
                    ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs ring-1 ring-amber-400'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex justify-center mb-1">
                  <Star className={`w-5 h-5 ${isUnlocked ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                </div>
                <div className="font-bold text-xs">{starNum} Star</div>
                <div className="text-[9px] mt-0.5 font-medium">{isUnlocked ? 'Unlocked' : `Level ${starNum}`}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Platform Referral Link Sharing (WhatsApp, FB, Insta, Twitter) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-['Outfit'] font-extrabold text-slate-900 text-base">
              Share Your Referral Link (+50 PTS / Account)
            </h3>
            <p className="text-xs text-slate-500">
              Direct link automatically assigns new signups into your 3×3 matrix downstream tree.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
            Referred: {activeProfile.referredCount} Members
          </span>
        </div>

        {/* Link input with copy */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1.5">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="w-full bg-transparent text-xs text-slate-700 font-mono outline-none px-2.5 select-all font-semibold"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Social Platforms Row */}
        <div>
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
            Instant Share to Social Platforms:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleFacebookShare}
              className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </button>

            <button
              onClick={handleInstagramShare}
              className="py-2.5 px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram</span>
            </button>

            <button
              onClick={handleTwitterShare}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Twitter / X</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3x3 Matrix Hierarchy Visualizer */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Network className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-extrabold text-slate-900 text-base">
                Your 3×3 Matrix Network Tree & Spillover
              </h3>
              <p className="text-xs text-slate-500">
                Max 3 direct slots. Referrals 4+ spill over to the next eligible member in your downstream team.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            <Users className="w-3.5 h-3.5" />
            {referralTree?.children.length || 0} / 3 Direct Slots Filled
          </div>
        </div>

        {/* Tree Display */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 overflow-x-auto">
          {/* Level 0: You */}
          <div className="flex justify-center mb-6">
            <div className="p-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl shadow-md text-center min-w-[160px]">
              <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Root Node</div>
              <div className="font-bold text-sm mt-0.5">{activeProfile.name} (You)</div>
              <div className="text-[11px] text-emerald-100 font-mono mt-0.5">{activeProfile.referralCode}</div>
              <div className="text-[10px] bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block">
                Level {currentStarLevel} Star
              </div>
            </div>
          </div>

          {/* Level 1: 3 Direct Slots */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[1, 2, 3].map((slotNum) => {
              const child = referralTree?.children.find((c) => c.matrixSlot === slotNum) || referralTree?.children[slotNum - 1];
              return (
                <div
                  key={slotNum}
                  className={`p-4 rounded-2xl border transition-all text-center flex flex-col justify-between ${
                    child
                      ? 'bg-white border-emerald-300 shadow-sm'
                      : 'bg-white/60 border-dashed border-slate-300 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-2">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">Child Slot {slotNum}</span>
                    {child && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>

                  {child ? (
                    <div className="space-y-1 my-2">
                      <div className="font-bold text-xs text-slate-900">{child.name}</div>
                      <div className="text-[11px] font-mono text-emerald-700">{child.referralCode}</div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                        <Store className="w-3 h-3 text-slate-400" />
                        {child.shopsCreated > 0 ? (
                          <span className="text-emerald-700 font-semibold">1 Shop (+50 PTS)</span>
                        ) : (
                          <span>0 Shops</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 space-y-1">
                      <div className="text-xs font-semibold text-slate-400">Open Slot {slotNum}</div>
                      <div className="text-[10px] text-slate-400">Invite friend to activate</div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    {child ? `Joined ${child.joinedDate || 'Recently'}` : 'Spillover Enabled'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="space-y-4">
        <h3 className="font-['Outfit'] font-black text-xl text-slate-900">
          Redeem Points for Real Perks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between hover:border-emerald-400 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Droplet className="w-5 h-5 fill-emerald-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Free 19L Elegancia Water Dispenser Can</h4>
              <p className="text-xs text-slate-500">
                Redeem for 1 refill or fresh 19L dispenser can delivered to your doorstep in Peshawar.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="font-['Outfit'] font-black text-emerald-800 text-lg">150 PTS</span>
              <button
                onClick={() => handleRedeem(150, 'Free 19L Elegancia Water Dispenser Can')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Redeem
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between hover:border-emerald-400 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Truck className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">3x Free Local Home Delivery Pass</h4>
              <p className="text-xs text-slate-500">
                Waiver on delivery fees for grocery or pharmacy orders within 5km of your location.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="font-['Outfit'] font-black text-emerald-800 text-lg">100 PTS</span>
              <button
                onClick={() => handleRedeem(100, '3x Free Local Home Delivery Pass')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Redeem
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between hover:border-emerald-400 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Percent className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Rs. 500 Merchant Shopping Voucher</h4>
              <p className="text-xs text-slate-500">
                Redeem at any verified asspas.store supermarket, pharmacy, or clothing outlet.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="font-['Outfit'] font-black text-emerald-800 text-lg">300 PTS</span>
              <button
                onClick={() => handleRedeem(300, 'Rs. 500 Merchant Shopping Voucher')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Redeem
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

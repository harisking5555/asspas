import React, { useState } from 'react';
import { 
  X, 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Sparkles, 
  Droplet, 
  Percent, 
  Truck 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onAddPoints: (points: number, reason: string) => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  user,
  onAddPoints,
}) => {
  const [copied, setCopied] = useState(false);
  const [redeemedReward, setRedeemedReward] = useState<string | null>(null);

  if (!isOpen) return null;

  const referralUrl = `https://asspas.store/?ref=${user.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Assalam-o-Alaikum! Join asspas.store to find all verified local shops near you in Peshawar, track distances, and get authentic Elegancia Mineral Water delivered! 🎁 Use my referral code *${user.referralCode}* to get 50 Free Welcome Points: ${referralUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSimulateReferral = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
    onAddPoints(50, 'Friend joined using your referral link');
  };

  const handleRedeem = (cost: number, rewardName: string) => {
    if (user.points < cost) {
      alert(`You need ${cost} points for this reward. Share your referral code to earn more points!`);
      return;
    }
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {}
    onAddPoints(-cost, `Redeemed ${rewardName}`);
    setRedeemedReward(rewardName);
    setTimeout(() => setRedeemedReward(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-emerald-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-emerald-600 rounded-xl">
              <Gift className="w-5 h-5 text-white" />
            </span>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              asspas.store Rewards Club
            </span>
          </div>

          <h2 className="font-display text-2xl font-black tracking-tight">
            Invite Neighbors & Earn Rewards
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Share your unique referral link on WhatsApp. You get <strong>50 Points</strong> for every neighbor who joins, and they get <strong>100 Free Welcome Points</strong>!
          </p>

          {/* Current Points Badge */}
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            <span className="text-xs font-medium text-emerald-200">Your Balance:</span>
            <span className="font-display text-base font-black text-white tabular-nums">
              {user.points} Points
            </span>
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
              Active Member
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {redeemedReward && (
            <div className="bg-emerald-100 text-emerald-900 p-3 rounded-xl border border-emerald-300 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Awesome! You successfully claimed: <strong>{redeemedReward}</strong>. The code has been sent to your WhatsApp.
              </span>
            </div>
          )}

          {/* Referral Link & Share Box */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-800">
              Your Personal Referral Link:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono select-all truncate">
                {referralUrl}
              </div>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Direct 1-Click Social Sharing Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
              Share directly on your social platforms:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="py-2 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer text-xs"
              >
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`, '_blank');
                }}
                className="py-2 px-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer text-xs"
              >
                <span>Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(referralUrl);
                  alert('Referral link copied! You can now paste your asspas.store link in your Instagram story sticker or bio.');
                }}
                className="py-2 px-3 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer text-xs"
              >
                <span>Instagram</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const text = `Assalam-o-Alaikum! Join asspas.store to find all verified shops & Elegancia Mineral Water in Pakistan. Register via my referral link to get 50 Free Welcome Points: ${referralUrl}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer text-xs"
              >
                <span>X / Twitter</span>
              </button>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={handleSimulateReferral}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
              title="Test the points counter"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Simulate Referral (+50 Pts)</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Total Invited
              </span>
              <span className="font-display font-black text-lg text-slate-900">
                {user.referredCount} Neighbors
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Points Earned
              </span>
              <span className="font-display font-black text-lg text-emerald-700">
                {user.points} Pts
              </span>
            </div>
          </div>

          {/* Rewards Catalog */}
          <div className="space-y-3 pt-2">
            <h4 className="font-display font-bold text-slate-900 text-sm">
              Redeem Your Points for Local Rewards:
            </h4>

            {/* Perk 1 */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Droplet className="w-5 h-5 fill-emerald-600" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    Free Elegancia Water 6-Pack (500ml)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Delivered straight to your doorstep in Peshawar.
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleRedeem(150, 'Free Elegancia Water 6-Pack')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
              >
                150 Pts
              </button>
            </div>

            {/* Perk 2 */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    Rs. 300 Discount Voucher
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Valid at Kamran Sports, Imtiaz Super Market & partners.
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleRedeem(100, 'Rs. 300 Discount Voucher')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
              >
                100 Pts
              </button>
            </div>

            {/* Perk 3 */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    1-Month Free Delivery Pass
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Zero delivery charge for any local store order within 3km.
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleRedeem(200, '1-Month Free Delivery Pass')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
              >
                200 Pts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

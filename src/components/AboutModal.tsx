import React from 'react';
import { X, MapPin, Droplet, ShieldCheck, Heart, Award } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenElegancia: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onOpenElegancia,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-white">
                About asspas.store
              </h3>
              <p className="text-[11px] text-slate-300">
                Pakistan’s Hyperlocal Discovery & Direct Delivery Platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          <div>
            <h4 className="font-display font-bold text-slate-900 text-sm mb-1">
              Our Mission: Shop Local, Support Neighborhoods
            </h4>
            <p>
              <strong>asspas.store</strong> was built to empower local retailers, neighborhood grocery stores, sports dealers, and pharmacies across Pakistan. Instead of waiting days for parcel shipments, <strong>asspas.store</strong> enables customers to find genuine products within walking or driving distance (500 meters to 5 kilometers), connect directly with shopkeepers via WhatsApp, and receive same-day delivery.
            </p>
          </div>

          {/* The Elegancia Mineral Water Story */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-emerald-600 fill-emerald-600" />
              <h4 className="font-display font-bold text-emerald-950 text-xs">
                The Elegancia Mineral Water Initiative (Peshawar Project)
              </h4>
            </div>
            <p className="text-emerald-900">
              Founded in Peshawar and formerly renowned as <strong>Purifine</strong>, the project was completely upgraded and rebranded as <strong>Elegancia</strong>. Sourced directly from pristine mineral springs with automated micro-filtration, UV disinfection, and optimal natural electrolytes, Elegancia is now supplied directly to homes, clinics, and official stockists throughout Peshawar and KP.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenElegancia();
              }}
              className="text-emerald-800 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Learn more about Elegancia Mineral Water & Order Refills →
            </button>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
              <h5 className="font-display font-bold text-slate-900 text-xs">PSQCA Hygiene Standard</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Every bottle and batch meets rigorous microbiological testing.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Award className="w-5 h-5 text-emerald-600 mb-1" />
              <h5 className="font-display font-bold text-slate-900 text-xs">Community Loyalty Points</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Earn 100 welcome points and redeem vouchers at top stores.
              </p>
            </div>
          </div>

          {/* Helpline info */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Official Helpline & WhatsApp
              </span>
              <a
                href="https://wa.me/923085599766"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-emerald-700 hover:underline"
              >
                0308-5599766
              </a>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

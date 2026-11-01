import React from 'react';
import { X, Download, Monitor, Smartphone, Check, Sparkles, Chrome, Globe, Share2 } from 'lucide-react';

interface InstallShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerInstall: () => Promise<void>;
  isInstallable: boolean;
}

export const InstallShortcutModal: React.FC<InstallShortcutModalProps> = ({
  isOpen,
  onClose,
  onTriggerInstall,
  isInstallable,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-['Poppins']">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-emerald-900/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fast 1-Click Access</span>
          </div>

          <h2 className="font-['Outfit'] text-2xl font-black tracking-tight text-white">
            Install asspas.store App & Desktop Shortcut
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
            Open asspas.store anytime directly from your PC desktop, laptop taskbar, or mobile home screen like a native app (Free4talk style).
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-700">
          {/* Main Action Button */}
          <button
            onClick={async () => {
              await onTriggerInstall();
            }}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>{isInstallable ? 'Install App Shortcut on Device' : 'Add Shortcut / Install App'}</span>
          </button>

          {/* Device Specific Guides */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
              Quick Shortcut Instructions:
            </h4>

            {/* Desktop: Chrome / Edge / Brave */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Monitor className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-slate-900 text-xs">
                  Windows PC & Laptop (Chrome, Edge & Brave)
                </h5>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Look at the top URL bar for the <strong>Install App icon (⊕ or ⭳)</strong> on the right side, or click the browser <strong>Menu (⋮) → "Install asspas.store"</strong> or <strong>"Create Shortcut..."</strong> to pin it directly to your Desktop.
                </p>
              </div>
            </div>

            {/* Android Mobile */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-slate-900 text-xs">
                  Android Mobile (Chrome / Samsung Internet)
                </h5>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Tap the top-right <strong>Menu (⋮)</strong> and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>. An asspas.store icon will appear with your other apps.
                </p>
              </div>
            </div>

            {/* iPhone / iPad (Safari) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-slate-900 text-xs">
                  iPhone & iPad (Safari)
                </h5>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Tap the <strong>Share button (↑)</strong> at the bottom of Safari, scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>Add</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Full-screen experience</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Instant fast launch</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Offline caching & GPS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>No app store download needed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

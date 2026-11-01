import React from 'react';
import { 
  X, 
  Droplet, 
  ShieldCheck, 
  MapPin, 
  MessageCircle, 
  CheckCircle2, 
  Truck
} from 'lucide-react';
import { Shop } from '../types';

interface EleganciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockistShops: Shop[];
  onSelectShop: (shop: Shop) => void;
  onFilterElegancia: () => void;
}

export const EleganciaModal: React.FC<EleganciaModalProps> = ({
  isOpen,
  onClose,
  stockistShops,
  onSelectShop,
  onFilterElegancia,
}) => {
  if (!isOpen) return null;

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      'Assalam-o-Alaikum! I want to order / inquire about dealership distribution for Elegancia Mineral Water (Peshawar project) via asspas.store. Please share pricing for cartons & 19L bottles.'
    );
    window.open(`https://wa.me/923085599766?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-emerald-100 flex flex-col max-h-[92vh]">
        {/* Banner with Pure Water Image */}
        <div className="relative h-48 sm:h-56 bg-slate-900 shrink-0">
          <img
            src="/src/assets/images/product_elegancia_water_1793110437317.jpg"
            alt="Elegancia Mineral Water"
            className="w-full h-full object-cover opacity-85"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors z-10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Heading overlay */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/25 border border-emerald-300/40 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1 backdrop-blur-xs">
              <Droplet className="w-3.5 h-3.5 fill-emerald-300 text-emerald-300" />
              <span>Peshawar Project · Pure Mineral Spring</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight drop-shadow-sm">
              Elegancia Mineral Water
            </h2>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">
              Formerly celebrated as <strong>Purifine</strong> in Peshawar & Karachi.
            </p>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Key Facts / Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
              <h4 className="font-display font-bold text-slate-900 text-xs">Medical Grade Pure</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Multi-stage reverse osmosis, ozone treatment, UV sterilized.
              </p>
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
              <Truck className="w-5 h-5 text-emerald-600 mb-1" />
              <h4 className="font-display font-bold text-slate-900 text-xs">Direct Doorstep Supply</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Homes, corporate offices & clinics throughout Peshawar.
              </p>
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
              <Droplet className="w-5 h-5 text-emerald-600 fill-emerald-600 mb-1" />
              <h4 className="font-display font-bold text-slate-900 text-xs">Multiple Bottle Sizes</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                500ml cartons, 1.5L family bottles & 19L dispenser refills.
              </p>
            </div>
          </div>

          {/* Quick Helpline Order Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
                Official Order & Dealership Helpline
              </span>
              <div className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>0308-5599766 (Call / WhatsApp)</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Instant quotes for event cartons, office dispensers & store retail.
              </p>
            </div>
            <button
              onClick={handleWhatsAppInquiry}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat with Dispatch</span>
            </button>
          </div>

          {/* Stockists In This City */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display font-bold text-slate-900 text-sm">
                Verified Stockists Near You ({stockistShops.length})
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onFilterElegancia();
                }}
                className="text-xs text-emerald-700 hover:underline font-bold cursor-pointer"
              >
                Filter on Map & View All →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {stockistShops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => {
                    onClose();
                    onSelectShop(shop);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                >
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-xs truncate group-hover:text-emerald-700">
                      {shop.name}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600 inline" />
                      <span>{shop.area} · {shop.distance} km</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                        Fresh Stock Available
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Official Peshawar distribution hub & authorized retailers.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

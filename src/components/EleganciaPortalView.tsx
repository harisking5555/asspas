import React, { useState } from 'react';
import { 
  Droplet, 
  ShieldCheck, 
  Truck, 
  Calculator, 
  MessageCircle, 
  Sparkles, 
  Award,
  Send
} from 'lucide-react';
import { Shop } from '../types';

interface EleganciaPortalViewProps {
  stockistShops: Shop[];
  onSelectShop: (shop: Shop) => void;
  onOpenAddShop: () => void;
}

export const EleganciaPortalView: React.FC<EleganciaPortalViewProps> = ({
  stockistShops,
  onSelectShop,
  onOpenAddShop,
}) => {
  // Water Order Calculator state
  const [qty500mlCartons, setQty500mlCartons] = useState<number>(1);
  const [qty15lCartons, setQty15lCartons] = useState<number>(0);
  const [qty19lCans, setQty19lCans] = useState<number>(2);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('0308-5599766');
  const [customerAddress, setCustomerAddress] = useState('Hayatabad / Peshawar');

  // Dealership Form state
  const [dealerShopName, setDealerShopName] = useState('');
  const [dealerOwnerName, setDealerOwnerName] = useState('');
  const [dealerPhone, setDealerPhone] = useState('0308-5599766');
  const [dealerCity, setDealerCity] = useState('Peshawar');
  const [dealershipSubmitted, setDealershipSubmitted] = useState(false);

  // Pricing constants in PKR
  const PRICE_500ML_CARTON = 960; // 24 bottles x Rs 40
  const PRICE_15L_CARTON = 840;   // 12 bottles x Rs 70
  const PRICE_19L_CAN = 220;      // 19L refill can

  const totalAmount =
    qty500mlCartons * PRICE_500ML_CARTON +
    qty15lCartons * PRICE_15L_CARTON +
    qty19lCans * PRICE_19L_CAN;

  const handleSendOrderWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const orderItems: string[] = [];
    if (qty500mlCartons > 0) orderItems.push(`${qty500mlCartons}x Cartons (500ml 24x) = Rs. ${qty500mlCartons * PRICE_500ML_CARTON}`);
    if (qty15lCartons > 0) orderItems.push(`${qty15lCartons}x Cartons (1.5L 12x) = Rs. ${qty15lCartons * PRICE_15L_CARTON}`);
    if (qty19lCans > 0) orderItems.push(`${qty19lCans}x 19L Dispenser Cans = Rs. ${qty19lCans * PRICE_19L_CAN}`);

    const text = encodeURIComponent(
      `Assalam-o-Alaikum Elegancia Water Team!\n\nI want to place an order for pure Elegancia Mineral Water via asspas.store:\n` +
      `👤 Name: ${customerName || 'Customer'}\n` +
      `📞 Phone: ${customerPhone}\n` +
      `📍 Delivery Address: ${customerAddress}\n\n` +
      `📦 Items:\n- ${orderItems.join('\n- ')}\n\n` +
      `💰 Total: Rs. ${totalAmount.toLocaleString()} PKR\n\nPlease confirm delivery time. Thank you!`
    );

    window.open(`https://wa.me/923085599766?text=${text}`, '_blank');
  };

  const handleDealershipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Assalam-o-Alaikum! I want to register my store as an official stockist for Elegancia Mineral Water via asspas.store:\n` +
      `🏬 Shop Name: ${dealerShopName}\n` +
      `👤 Owner: ${dealerOwnerName}\n` +
      `📞 Contact: ${dealerPhone}\n` +
      `📍 City: ${dealerCity}\n\nPlease share dealership quotation & delivery schedule.`
    );
    window.open(`https://wa.me/923085599766?text=${text}`, '_blank');
    setDealershipSubmitted(true);
    setTimeout(() => setDealershipSubmitted(false), 5000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero Showcase */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-500/30">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
            <Droplet className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span>Peshawar's Premier Mineral Water Project</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Elegancia Mineral Water
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
            Formerly known and trusted as <strong>Purifine</strong> in Peshawar and Karachi, now completely rebranded and upgraded to <strong>Elegancia</strong>. Sourced from natural mineral springs with multi-stage automated purification, UV sterilization, and balanced natural electrolytes.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <a
              href="https://wa.me/923085599766?text=Hello%2C%20I%20want%20to%20inquire%20about%20Elegancia%20Mineral%20Water"
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Helpline: 0308-5599766</span>
            </a>
            <button
              onClick={onOpenAddShop}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Become an Official Stockist
            </button>
          </div>
        </div>

        {/* Product photo float */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-80 h-72 rounded-2xl overflow-hidden border-2 border-emerald-400/40 shadow-2xl">
          <img
            src="/src/assets/images/product_elegancia_water_1793110437317.jpg"
            alt="Elegancia Pure Mineral Water"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 4 Pillars of Elegancia */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <Droplet className="w-5 h-5 fill-emerald-600" />
          </div>
          <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900">
            Natural Electrolytes
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            Calcium, Magnesium & Potassium for optimal daily hydration and taste.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900">
            Pure & Lab Tested
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            Certified hygienic bottling conforming to PSQCA & health standards.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900">
            Purifine Legacy
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            Trusted history in Peshawar and Karachi now with advanced mineral balancing.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <Truck className="w-5 h-5" />
          </div>
          <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900">
            Express Doorstep Supply
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            Daily refills for offices, clinics, homes, and supermarkets across KP.
          </p>
        </div>
      </div>

      {/* Two Column Grid: Order Calculator & Dealership Application */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Water Order & Price Calculator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h3 className="font-display font-extrabold text-slate-900 text-sm sm:text-base">
                Doorstep Water Order Calculator
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              Wholesale & Retail
            </span>
          </div>

          <form onSubmit={handleSendOrderWhatsApp} className="space-y-4 text-xs">
            {/* 500ml Item */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  500ml Carton (24 Bottles)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Rs. {PRICE_500ML_CARTON} per carton
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty500mlCartons(Math.max(0, qty500mlCartons - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-slate-900 tabular-nums">
                  {qty500mlCartons}
                </span>
                <button
                  type="button"
                  onClick={() => setQty500mlCartons(qty500mlCartons + 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* 1.5L Item */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  1.5L Family Carton (12 Bottles)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Rs. {PRICE_15L_CARTON} per carton
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty15lCartons(Math.max(0, qty15lCartons - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-slate-900 tabular-nums">
                  {qty15lCartons}
                </span>
                <button
                  type="button"
                  onClick={() => setQty15lCartons(qty15lCartons + 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* 19L Dispenser Cans */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  19L Dispenser Can Refill
                </span>
                <span className="text-slate-500 text-[11px]">
                  Rs. {PRICE_19L_CAN} per can
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty19lCans(Math.max(0, qty19lCans - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-slate-900 tabular-nums">
                  {qty19lCans}
                </span>
                <button
                  type="button"
                  onClick={() => setQty19lCans(qty19lCans + 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Customer Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Haris Khan"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none font-medium text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="0308-5599766"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none font-medium text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Delivery Address in Peshawar / KP
              </label>
              <input
                type="text"
                placeholder="House / Office #, Street, Phase, Area"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none font-medium text-xs"
              />
            </div>

            {/* Total Calculation Strip */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-emerald-950">
              <span className="font-bold text-xs">Estimated Total:</span>
              <span className="font-display font-black text-lg text-emerald-800 tabular-nums">
                Rs. {totalAmount.toLocaleString()} PKR
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Order Directly to WhatsApp (0308-5599766)</span>
            </button>
          </form>
        </div>

        {/* Right: Dealership & Stockist Portal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="font-display font-extrabold text-slate-900 text-sm sm:text-base">
                Become an Elegancia Stockist
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              For Supermarkets & Stores
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Own a general store, supermarket, pharmacy, or sports shop in Peshawar or Pakistan? Register to receive official refrigerated dispensers, promotional branding, and daily refill supply.
          </p>

          {dealershipSubmitted && (
            <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3 rounded-xl border border-emerald-200">
              Dealership inquiry opened on WhatsApp. Our dispatch manager will contact you promptly!
            </div>
          )}

          <form onSubmit={handleDealershipSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Al-Madina Super Store, Kamran Sports"
                value={dealerShopName}
                onChange={(e) => setDealerShopName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none font-medium text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Owner Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Owner / Proprietor"
                  value={dealerOwnerName}
                  onChange={(e) => setDealerOwnerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="0308-5599766"
                  value={dealerPhone}
                  onChange={(e) => setDealerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none font-medium text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                City / Commercial Area *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Peshawar Saddar / Hayatabad Phase 3"
                value={dealerCity}
                onChange={(e) => setDealerCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none font-medium text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Apply for Dealership via WhatsApp</span>
            </button>
          </form>

          {/* Mapped Stockists Quick List */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-display font-bold text-xs text-slate-800 mb-2">
              Active Stockist Locations ({stockistShops.length})
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {stockistShops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => onSelectShop(shop)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 cursor-pointer border border-slate-100 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 text-[11px] block truncate">
                      {shop.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {shop.area}, {shop.city} · {shop.distance} km
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                    Stockist
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

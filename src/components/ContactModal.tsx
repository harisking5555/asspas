import React, { useState } from 'react';
import { X, MessageCircle, Phone, MapPin, Mail, Send, Clock } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('0308-5599766');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Assalam-o-Alaikum asspas.store Team!\n\n` +
      `👤 Name: ${name || 'User'}\n` +
      `📞 Phone: ${phone}\n` +
      `💬 Message: ${message || 'Hello, I have an inquiry regarding asspas.store and Elegancia Water.'}`
    );
    window.open(`https://wa.me/923085599766?text=${text}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Contact & Support Helpline
              </h3>
              <p className="text-[11px] text-slate-300">
                Direct WhatsApp Support for asspas.store
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Quick Direct WhatsApp Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Official WhatsApp Hotline
              </span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                0308-5599766
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Available 24/7 for shop registration, Elegancia water inquiries & customer support.
              </p>
            </div>
            <a
              href="https://wa.me/923085599766?text=Hello%20asspas.store%20team%2C%20I%20need%20assistance"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat Now</span>
            </a>
          </div>

          {/* Quick Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs">
              Send us a Message via WhatsApp
            </h4>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Haris Khan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone / WhatsApp Number
              </label>
              <input
                type="text"
                placeholder="0308-5599766"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Message / Inquiry
              </label>
              <textarea
                rows={3}
                placeholder="Write your question, store listing request, or Elegancia mineral water order..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message to 0308-5599766</span>
            </button>
          </form>

          {/* Office Details */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-[11px] text-slate-500">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>University Road / Saddar, Peshawar, KP, Pakistan</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Support Hours: 08:30 AM - 11:00 PM Daily</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Phone, MapPin, Mail, Send, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, userProfile } = useAuth();

  const [inquiryType, setInquiryType] = useState<'Feedback' | 'Complaint' | 'Suggestion'>('Feedback');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subjectShop, setSubjectShop] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (userProfile?.name) setName(userProfile.name);
      if (userProfile?.phone) setPhone(userProfile.phone);
      if (currentUser.email) setEmail(currentUser.email);
    }
  }, [currentUser, userProfile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Record complaint/feedback to Firestore collection 'complaints'
      await addDoc(collection(db, 'complaints'), {
        inquiryType,
        userName: name || userProfile?.name || 'Anonymous User',
        userPhone: phone || userProfile?.phone || 'Not provided',
        userEmail: email || currentUser?.email || '',
        shopName: subjectShop.trim() || 'General Platform',
        issue: message.trim(),
        status: 'Open',
        userId: currentUser?.uid || null,
        createdAt: serverTimestamp(),
      });

      // 2. Open WhatsApp support hotline with pre-filled message
      const text = encodeURIComponent(
        `*${inquiryType.toUpperCase()} - asspas.store*\n\n` +
        `👤 *Name:* ${name || 'User'}\n` +
        `📞 *Phone:* ${phone || 'Not provided'}\n` +
        `🏪 *Store/Subject:* ${subjectShop || 'General'}\n` +
        `📝 *Details:* ${message}`
      );
      window.open(`https://wa.me/923085599766?text=${text}`, '_blank');

      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.warn('Could not save complaint to Firestore:', err);
      // Still open WhatsApp as direct guarantee
      const text = encodeURIComponent(
        `*${inquiryType.toUpperCase()} - asspas.store*\n\n👤 Name: ${name}\n📞 Phone: ${phone}\nMessage: ${message}`
      );
      window.open(`https://wa.me/923085599766?text=${text}`, '_blank');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 font-['Poppins']">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-emerald-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white font-['Outfit']">
                Customer Support & Feedback Desk
              </h3>
              <p className="text-[11px] text-emerald-300">
                Direct helpline for complaints, suggestions & store listings
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Official Hotline Callout */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Official WhatsApp & Call Hotline
              </span>
              <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                0308-5599766
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Instant response from asspas.store support team & Elegancia dispatchers.
              </p>
            </div>
            <a
              href="https://wa.me/923085599766?text=Hello%20asspas.store%20team%2C%20I%20need%20assistance"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Direct Chat</span>
            </a>
          </div>

          {submittedSuccess && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Thank you! Your ticket has been logged and sent to WhatsApp support.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Inquiry Type Radio Selector (Feedback, Complaint, Suggestion) */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Select Nature of Inquiry:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Feedback', 'Complaint', 'Suggestion'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInquiryType(type)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                      inquiryType === type
                        ? type === 'Complaint'
                          ? 'bg-rose-50 border-rose-400 text-rose-800 ring-1 ring-rose-400'
                          : type === 'Suggestion'
                          ? 'bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400'
                          : 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* User pre-filled details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Khan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  WhatsApp / Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Relevant Business / Shop Name (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Imtiaz Super Market / Elegancia Water Delivery"
                value={subjectShop}
                onChange={(e) => setSubjectShop(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Your Message / Details *
              </label>
              <textarea
                rows={3}
                required
                placeholder={
                  inquiryType === 'Complaint'
                    ? 'Please describe the issue faced (wrong item, delay, shop contact issue)...'
                    : inquiryType === 'Suggestion'
                    ? 'Tell us how we can make asspas.store better for your neighborhood...'
                    : 'Share your compliments, experience, or general question...'
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Logging Ticket...' : `Submit ${inquiryType} & Open WhatsApp`}</span>
            </button>
          </form>

          {/* Office Details */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-[11px] text-slate-500">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Peshawar, KP & nationwide network</span>
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

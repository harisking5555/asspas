import React, { useState, useEffect } from 'react';
import { X, MessageCircle, MapPin, Send, Clock, CheckCircle2, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createSupportTicket } from '../services/supportService';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, userProfile } = useAuth();

  const [inquiryType, setInquiryType] = useState<'Feedback' | 'Complaint' | 'Suggestion'>('Feedback');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subjectShop, setSubjectShop] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const isLoggedIn = !!currentUser && !!userProfile;

  useEffect(() => {
    if (currentUser) {
      setName(userProfile?.name || currentUser.displayName || 'Verified Member');
      setPhone(userProfile?.phone || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser, userProfile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const resolvedName = (name || userProfile?.name || 'Member').trim();
    const resolvedPhone = (phone || userProfile?.phone || 'Not provided').trim();
    const resolvedEmail = (email || currentUser?.email || '').trim();

    try {
      await addDoc(collection(db, 'complaints'), {
        inquiryType,
        userName: resolvedName,
        userPhone: resolvedPhone,
        userEmail: resolvedEmail,
        shopName: subjectShop.trim() || 'General Platform',
        issue: message.trim(),
        status: 'Open',
        userId: currentUser?.uid || null,
        createdAt: serverTimestamp(),
      });

      if (currentUser) {
        await createSupportTicket({
          userId: currentUser.uid,
          userName: resolvedName,
          userEmail: resolvedEmail,
          userPhone: resolvedPhone,
          type: inquiryType.toLowerCase() as 'complaint' | 'feedback' | 'suggestion',
          subject: subjectShop.trim() || `${inquiryType} Submission`,
          message: message.trim(),
        });
      }

      const text = encodeURIComponent(
        `*${inquiryType.toUpperCase()} - asspas.store*\n\n` +
          `Name: ${resolvedName}\n` +
          `Phone: ${resolvedPhone}\n` +
          `Store/Subject: ${subjectShop || 'General'}\n` +
          `Details: ${message}`
      );
      window.open(`https://wa.me/923085599766?text=${text}`, '_blank');

      setSubmittedSuccess(true);
      setMessage('');
      setSubjectShop('');
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 2200);
    } catch (err) {
      console.warn('Could not save complaint to Firestore:', err);
      const text = encodeURIComponent(
        `*${inquiryType.toUpperCase()} - asspas.store*\n\nName: ${resolvedName}\nPhone: ${resolvedPhone}\nMessage: ${message}`
      );
      window.open(`https://wa.me/923085599766?text=${text}`, '_blank');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs font-['Poppins']">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.16 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-emerald-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white font-['Outfit']">
                Customer Support &amp; Feedback Desk
              </h3>
              <p className="text-[11px] text-emerald-300">
                Direct helpline for complaints, suggestions &amp; store listings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Official WhatsApp &amp; Call Hotline
              </span>
              <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">0308-5599766</div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Instant response from asspas.store support team &amp; Elegancia dispatchers.
              </p>
            </div>
            <a
              href="https://wa.me/923085599766?text=Hello%20asspas.store%20team%2C%20I%20need%20assistance"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Direct Chat</span>
            </a>
          </div>

          {submittedSuccess && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Thank you! Your ticket has been saved to your profile &amp; sent to support.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">Select Nature of Inquiry:</label>
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

            {isLoggedIn ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{userProfile.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {userProfile.phone || userProfile.email}
                    </div>
                  </div>
                </div>
                {!userProfile.phone && (
                  <input
                    type="tel"
                    required
                    placeholder="Phone (0300-1234567)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-36 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
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
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp / Phone *</label>
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
            )}

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
              <label className="block font-bold text-slate-700 mb-1">Your Message / Details *</label>
              <textarea
                rows={3}
                required
                placeholder={
                  inquiryType === 'Complaint'
                    ? 'Please describe the issue faced...'
                    : inquiryType === 'Suggestion'
                    ? 'Tell us how we can improve asspas.store for your area...'
                    : 'Share your feedback or question...'
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Logging Ticket...' : `Submit ${inquiryType} & Open WhatsApp`}</span>
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-[11px] text-slate-500">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Peshawar, KP &amp; nationwide network</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Support Hours: 08:30 AM - 11:00 PM Daily</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

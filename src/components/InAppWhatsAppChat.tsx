import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MessageCircle, 
  Minimize2, 
  Maximize2, 
  Phone, 
  ExternalLink,
  Store,
  CheckCheck
} from 'lucide-react';
import { Shop } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'shop';
  text: string;
  time: string;
}

interface InAppWhatsAppChatProps {
  shop: Shop;
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

export const InAppWhatsAppChat: React.FC<InAppWhatsAppChatProps> = ({
  shop,
  isOpen,
  onClose,
  initialMessage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const storageKey = `chat_history_${shop.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch {
          initializeWelcome();
        }
      } else {
        initializeWelcome();
      }
    }
  }, [isOpen, shop.id]);

  const initializeWelcome = () => {
    const welcomeMsgs: ChatMessage[] = [
      {
        id: 'msg-1',
        sender: 'shop',
        text: `Assalam-o-Alaikum! Welcome to ${shop.name} official WhatsApp support on asspas.store. How can we help you today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    if (initialMessage) {
      welcomeMsgs.push({
        id: 'msg-init',
        sender: 'user',
        text: initialMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      // Simulate shopkeeper auto-reply for quick reassurance
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-reply-${Date.now()}`,
            sender: 'shop',
            text: `Thank you for reaching out! We are currently available at ${shop.address}, ${shop.city}. A store representative is reviewing your message and will reply shortly.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 1000);
    }
    setMessages(welcomeMsgs);
    localStorage.setItem(`chat_history_${shop.id}`, JSON.stringify(welcomeMsgs));
  };

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_history_${shop.id}`, JSON.stringify(messages));
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shop.id]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Auto response from shop simulation
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          sender: 'shop',
          text: `Thanks to visit asspas.store, drop here your query about any complaint, suggestion, feedback etc. You will be replied soon.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  const openExternalWhatsApp = () => {
    const phone = shop.whatsapp || '923085599766';
    const text = encodeURIComponent(
      `Hello ${shop.name}! I am chatting with you via asspas.store website.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 font-['Poppins'] ${
        isMinimized
          ? 'bottom-4 right-4 w-72'
          : 'bottom-4 right-4 w-88 sm:w-96 max-w-[calc(100vw-24px)]'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-900/20 overflow-hidden flex flex-col">
        {/* WhatsApp Header in cohesive brand emerald theme */}
        <div className="bg-emerald-800 text-white p-3.5 flex items-center justify-between cursor-pointer select-none">
          <div 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="flex items-center gap-2.5 flex-1 min-w-0"
          >
            <div className="relative">
              <img
                src={shop.image}
                alt={shop.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-400"
              />
              <span className="w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full absolute bottom-0 right-0" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs truncate">{shop.name}</span>
                <span className="text-[9px] bg-emerald-950/80 px-1.5 py-0.2 rounded font-semibold text-emerald-200">
                  WhatsApp
                </span>
              </div>
              <div className="text-[10px] text-emerald-200 truncate">
                {shop.city} · {shop.openingHours || 'Online'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-white">
            <button
              onClick={openExternalWhatsApp}
              title="Open in WhatsApp Web / App"
              className="p-1.5 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              className="p-1.5 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              title="Close Chat"
              className="p-1.5 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        {!isMinimized && (
          <>
            <div 
              className="h-72 overflow-y-auto p-3 space-y-2.5 bg-[#EFEAE2]/60 bg-opacity-70 text-xs"
              style={{
                backgroundImage: 'radial-gradient(#10b981 0.75px, transparent 0.75px)',
                backgroundSize: '16px 16px',
              }}
            >
              <div className="text-center my-1">
                <span className="bg-white/80 text-[10px] text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-200">
                  Messages are saved on this device. Minimize anytime!
                </span>
              </div>

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-2xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                    }`}
                  >
                    <div>{m.text}</div>
                    <div
                      className={`text-[9px] mt-0.5 flex items-center justify-end gap-1 ${
                        m.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      <span>{m.time}</span>
                      {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message to shopkeeper..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

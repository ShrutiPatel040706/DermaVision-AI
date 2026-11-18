import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Send, X, Bot, User, AlertTriangle,
  ShoppingBag, RotateCcw, Minimize2, Maximize2,
  Stethoscope, Clock, Sparkles
} from 'lucide-react';
import { chatbotService } from '../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const DISCLAIMER =
  "⚕️ DermaVision AI provides educational information only. It does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified dermatologist for medical concerns.";

// Quick suggestions shown BEFORE any prediction
const PRE_PREDICTION_SUGGESTIONS = [
  { icon: "📸", label: "How to Upload" },
  { icon: "🦠", label: "Supported Diseases" },
  { icon: "⚙️", label: "How It Works" },
  { icon: "🖼️", label: "Image Guidelines" },
  { icon: "🔒", label: "Privacy & Security" },
  { icon: "❓", label: "FAQ" },
  { icon: "📊", label: "Confidence Score" },
];

// Quick suggestions shown AFTER a prediction
const POST_PREDICTION_SUGGESTIONS = [
  { icon: "🔬", label: "What is this disease?" },
  { icon: "🤒", label: "Symptoms" },
  { icon: "⚡", label: "Causes" },
  { icon: "💊", label: "Treatment & Medicines" },
  { icon: "🏠", label: "Home Remedies" },
  { icon: "🛡️", label: "Prevention" },
  { icon: "🥗", label: "Diet" },
  { icon: "⏱️", label: "Recovery Time" },
  { icon: "🔄", label: "Compare Diseases" },
  { icon: "🦠", label: "Is It Contagious?" },
  { icon: "🏥", label: "When to See a Doctor?" },
];

// Page-context greetings
const PAGE_GREETINGS = {
  "/": "👋 Welcome to **DermaVision AI**! I can help you understand how to use the app, explain supported skin conditions, and answer any questions. Upload an image whenever you're ready.",
  "/scan": "📸 Ready to analyze! Upload a clear photo of the skin area of concern. I can guide you on image quality, supported formats, and what to expect from the prediction.",
  "/dashboard": "📊 You're viewing your scan history. Click **Chat** on any scan card to discuss a specific result, or ask me anything about skin health.",
  "/store": "🛍️ You're in the DermaVision Pharmacy! Products here are matched to your diagnosed condition. Ask me anything about a condition or product ingredients.",
  "/recommendations": "💡 These are personalized recommendations based on your scan. Ask me about your condition, treatments, or what ingredients to look for in skincare.",
  "/login": "🔐 Sign in to save your scan history and access personalized recommendations. Ask me anything about DermaVision AI while you wait!",
  "/register": "✨ Creating your account lets you track scans, get personalized recommendations, and chat about your skin health history.",
  "default": "👋 Welcome to **DermaVision AI**! I'm your intelligent skin health assistant. Ask me about skin conditions, how the app works, or upload an image to get started.",
};

// ─── Markdown Renderer ────────────────────────────────────────────────────────

const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-none space-y-0.5 my-1">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start space-x-1.5">
              <span className="text-indigo-400 mt-0.5 shrink-0">•</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    // Bullet list item
    if (/^[-•*]\s/.test(line)) {
      listItems.push(line.replace(/^[-•*]\s/, ''));
      return;
    }
    flushList();

    // Header (## or **)
    if (line.startsWith('## ') || line.startsWith('### ')) {
      const text = line.replace(/^#{2,3}\s/, '');
      elements.push(
        <p key={idx} className="font-bold text-white text-xs mt-2 mb-0.5">{renderInline(text)}</p>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={idx} className="h-1.5" />);
    } else {
      elements.push(
        <p key={idx} className="leading-relaxed">{renderInline(line)}</p>
      );
    }
  });
  flushList();
  return <div className="space-y-0.5 text-[12px]">{elements}</div>;
};

const renderInline = (text) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i} className="text-slate-300">{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
};

// ─── Timestamp formatter ──────────────────────────────────────────────────────

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ChatBox = ({ condition: initialCondition, confidence: initialConfidence, disease_id: initialDiseaseId, forceOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [condition, setCondition] = useState(initialCondition);
  const [confidence, setConfidence] = useState(initialConfidence);
  const [diseaseId, setDiseaseId] = useState(initialDiseaseId);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [supportedDiseases, setSupportedDiseases] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Prop sync ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setCondition(initialCondition);
    setConfidence(initialConfidence);
    setDiseaseId(initialDiseaseId);
  }, [initialCondition, initialConfidence, initialDiseaseId]);

  // forceOpen signal from parent
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    }
  }, [forceOpen]);

  // Global event listener (dispatched from Dashboard scan cards, etc.)
  useEffect(() => {
    const handler = (e) => {
      setCondition(e.detail.condition || null);
      setConfidence(e.detail.confidence ?? null);
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('dv:openchat', handler);
    return () => window.removeEventListener('dv:openchat', handler);
  }, []);

  // ── Fetch supported diseases once ─────────────────────────────────────────
  useEffect(() => {
    chatbotService.getSupportedDiseases()
      .then(setSupportedDiseases)
      .catch(() => {});
  }, []);

  // ── Compute confidence values ──────────────────────────────────────────────
  const getConfidenceInfo = useCallback(() => {
    if (confidence === null || confidence === undefined || isNaN(confidence)) {
      return { fraction: null, percent: null, isLow: false };
    }
    const num = parseFloat(confidence);
    const fraction = num > 1 ? num / 100 : num;
    return {
      fraction,
      percent: (fraction * 100).toFixed(1),
      isLow: fraction < 0.70,
    };
  }, [confidence]);

  // ── Build greeting ─────────────────────────────────────────────────────────
  const buildGreeting = useCallback(() => {
    const { percent, isLow } = getConfidenceInfo();
    const path = location.pathname;

    if (condition) {
      // Post-prediction mode
      const confText = percent ? ` with **${percent}% confidence**` : '';
      return {
        greeting: `Your uploaded image has been predicted as **${condition}**${confText}.\n\nI can explain this condition, answer follow-up questions, compare it with other supported diseases, and help you understand your prediction.`,
        lowConfWarning: isLow && percent
          ? `⚠️ **Low Confidence Warning**\n\nThe prediction confidence is ${percent}%, which is below 70%. The AI may be uncertain. I strongly recommend consulting a licensed dermatologist for an accurate diagnosis.\n\nI can still provide evidence-based information about **${condition}** from our dataset.`
          : null,
        mode: 'post',
      };
    }

    // Pre-prediction mode — page-aware greeting
    const pageGreeting = PAGE_GREETINGS[path] || PAGE_GREETINGS['default'];
    return { greeting: pageGreeting, lowConfWarning: null, mode: 'pre' };
  }, [condition, location.pathname, getConfidenceInfo]);

  // ── Initialize / reset chat ────────────────────────────────────────────────
  const initChat = useCallback(() => {
    const { greeting, lowConfWarning } = buildGreeting();
    const now = Date.now();
    const msgs = [
      { role: 'system', text: DISCLAIMER, timestamp: now },
    ];
    if (lowConfWarning) {
      msgs.push({ role: 'bot', text: lowConfWarning, timestamp: now + 1 });
    }
    msgs.push({ role: 'bot', text: greeting, timestamp: now + 2 });
    setMessages(msgs);
    setUnreadCount(0);
  }, [buildGreeting]);

  useEffect(() => {
    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition, confidence, location.pathname]);

  // ── Auto scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Input focus ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // ── Track unread when minimized ────────────────────────────────────────────
  useEffect(() => {
    if ((isMinimized || !isOpen) && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'bot') {
        setUnreadCount(p => p + 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    const now = Date.now();
    setMessages(prev => [...prev, { role: 'user', text: text.trim(), timestamp: now }]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await chatbotService.askQuestion(
        condition, text.trim(), confidence, diseaseId,
        location.pathname   // pass page context to backend
      );
      setMessages(prev => [...prev, { role: 'bot', text: data.response, timestamp: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "I'm sorry, I couldn't process your request right now. Please try again.",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handleGoToStore = () => {
    navigate(`/store?condition=${encodeURIComponent(condition && condition !== 'Processing' ? condition : 'All')}`);
  };

  const handleClearChat = () => { initChat(); };

  // ── Derived ────────────────────────────────────────────────────────────────
  const { mode } = buildGreeting();
  const suggestions = mode === 'post' ? POST_PREDICTION_SUGGESTIONS : PRE_PREDICTION_SUGGESTIONS;

  // ══════════════════════════════════════════════════════════════════════════════
  //  Floating trigger button (chat closed)
  // ══════════════════════════════════════════════════════════════════════════════
  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setIsMinimized(false); setUnreadCount(0); }}
        className="fixed bottom-6 right-6 z-[9999] flex items-center space-x-2.5 pl-4 pr-5 py-3.5 rounded-2xl shadow-2xl shadow-indigo-900/40 cursor-pointer transition-all hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
        title="Open DermaVision AI Chat"
      >
        {/* Pulse dot */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -left-2 w-5 h-5 bg-rose-500 rounded-full text-white text-[9px] font-extrabold flex items-center justify-center border border-white">
            {unreadCount}
          </span>
        )}
        <Bot className="h-5 w-5 text-white" />
        <span className="text-sm font-bold text-white hidden sm:inline">AI Assistant</span>
      </button>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  //  Minimized bar
  // ══════════════════════════════════════════════════════════════════════════════
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-6 right-6 z-[9999] w-72 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/40 flex items-center cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1a233d 100%)', border: '1px solid rgba(99,102,241,0.3)' }}
        onClick={() => { setIsMinimized(false); setUnreadCount(0); }}
      >
        <div className="flex items-center space-x-2.5 px-4 py-3 flex-1">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center border border-indigo-500/40">
              <Bot className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-900" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">DermaVision AI</span>
            <span className="text-[10px] text-indigo-300">{condition ? condition : 'General Assistant'}</span>
          </div>
        </div>
        {unreadCount > 0 && (
          <span className="mr-3 w-5 h-5 bg-rose-500 rounded-full text-white text-[9px] font-extrabold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          className="mr-3 p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
        <Maximize2 className="h-4 w-4 text-indigo-400 mr-3" />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  //  Full chat panel
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
      style={{
        width: 'min(440px, calc(100vw - 2rem))',
        height: 'min(600px, calc(100vh - 6rem))',
        background: '#0a0f1e',
        border: '1px solid rgba(99,102,241,0.25)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1a233d 100%)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/25 flex items-center justify-center border border-indigo-500/30">
              <Bot className="h-4.5 w-4.5 text-indigo-400" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>
          {/* Title */}
          <div className="min-w-0">
            <span className="text-sm font-bold text-white block truncate leading-tight">DermaVision AI</span>
            <span className="text-[10px] font-medium flex items-center space-x-1 truncate" style={{ color: condition ? '#34d399' : '#a5b4fc' }}>
              <Sparkles className="h-2.5 w-2.5 shrink-0" />
              <span>{condition ? `Analyzing: ${condition}` : `${supportedDiseases.length} conditions · General Mode`}</span>
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-0.5 shrink-0 ml-2">
          {condition && (
            <button
              onClick={handleGoToStore}
              className="flex items-center space-x-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}
              title="Browse products for your condition"
            >
              <ShoppingBag className="h-3 w-3" />
              <span className="hidden sm:inline">Store</span>
            </button>
          )}
          <button onClick={handleClearChat} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer" title="Clear chat">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { setIsMinimized(true); setUnreadCount(0); }}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            title="Minimize"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition cursor-pointer" title="Close">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Mode badge ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-1.5 shrink-0"
        style={{ background: condition ? 'rgba(52,211,153,0.06)' : 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center space-x-1.5">
          <Stethoscope className="h-3 w-3" style={{ color: condition ? '#34d399' : '#818cf8' }} />
          <span className="text-[10px] font-bold" style={{ color: condition ? '#34d399' : '#818cf8' }}>
            {condition ? 'Disease Assistant Mode' : 'General Assistant Mode'}
          </span>
        </div>
        <span className="text-[9px] text-slate-500">Powered by DermaVision AI</span>
      </div>

      {/* ── Messages ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin" style={{ background: '#080d1a' }}>
        {messages.map((msg, idx) => {
          if (msg.role === 'system') {
            return (
              <div key={idx} className="mx-1">
                <div className="rounded-xl px-3 py-2 flex items-start space-x-2" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(253,230,138,0.85)' }}>{msg.text}</p>
                </div>
              </div>
            );
          }

          const isUser = msg.role === 'user';
          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2 max-w-[90%] ${isUser ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mb-4 ${
                  isUser
                    ? 'bg-indigo-500/30 border border-indigo-500/40'
                    : 'bg-slate-700/60 border border-slate-600/40'
                }`}>
                  {isUser
                    ? <User className="h-3 w-3 text-indigo-400" />
                    : <Bot className="h-3 w-3 text-indigo-300" />
                  }
                </div>

                <div className="flex flex-col gap-0.5" style={{ alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl ${
                      isUser ? 'rounded-br-sm' : 'rounded-bl-sm'
                    }`}
                    style={isUser
                      ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff' }
                      : { background: 'rgba(30,27,75,0.8)', color: '#cbd5e1', border: '1px solid rgba(99,102,241,0.15)' }
                    }
                  >
                    {isUser
                      ? <p className="text-[12px] leading-relaxed">{msg.text}</p>
                      : renderMarkdown(msg.text)
                    }
                  </div>
                  {/* Timestamp */}
                  <div className="flex items-center space-x-1 px-1" style={{ color: '#475569' }}>
                    <Clock className="h-2.5 w-2.5" />
                    <span className="text-[9px]">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing animation */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2 max-w-[90%]">
              <div className="w-6 h-6 rounded-lg bg-slate-700/60 border border-slate-600/40 flex items-center justify-center shrink-0">
                <Bot className="h-3 w-3 text-indigo-300" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: 'rgba(30,27,75,0.8)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <span className="inline-flex space-x-1.5 items-center">
                  {[0, 150, 300].map((delay, i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: '#818cf8', animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Suggestions ───────────────────────────────────────────────── */}
      <div
        className="px-3 py-2 shrink-0 overflow-x-auto"
        style={{ background: '#0d1224', borderTop: '1px solid rgba(99,102,241,0.1)' }}
      >
        <div className="flex space-x-1.5 pb-0.5">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s.label)}
              disabled={isLoading}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full whitespace-nowrap text-[10px] font-semibold transition cursor-pointer disabled:opacity-40 shrink-0"
              style={{
                background: 'rgba(99,102,241,0.1)',
                color: '#a5b4fc',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = '#a5b4fc'; }}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Input ───────────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="px-3 py-2.5 flex items-center space-x-2 shrink-0"
        style={{ background: '#0d1224', borderTop: '1px solid rgba(99,102,241,0.15)' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            condition
              ? `Ask about ${condition}, compare diseases, or anything…`
              : 'Ask about skin health, uploading, supported diseases…'
          }
          disabled={isLoading}
          className="flex-1 rounded-xl px-3.5 py-2.5 text-[12px] transition disabled:opacity-40 outline-none"
          style={{
            background: 'rgba(30,27,75,0.6)',
            border: '1px solid rgba(99,102,241,0.25)',
            color: '#e2e8f0',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 shrink-0"
          style={{ background: input.trim() && !isLoading ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#1e1b4b' }}
        >
          <Send className="h-4 w-4 text-white" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;

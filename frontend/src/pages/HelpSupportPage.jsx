import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * HelpSupportPage Component — 100% STRICT APPROVED REFERENCE REDESIGN
 * 
 * Spacious, Hand-Crafted, Light Mode Help Center:
 * 1. Large Central Hero:
 *    - Large torn-paper banner with marker-style heading "HELP & SUPPORT"
 *    - Translucent green washi-tape corners
 *    - Subheading "We're here for you!" with hand-drawn green underline
 *    - Flight path doodle & large hand-drawn headset illustration with chat bubble
 * 2. 2 Large Support Cards:
 *    - "CONTACT SUPPORT" (Green theme, speech bubble icon, functional modal)
 *    - "USER GUIDE" (Purple theme, book icon, functional documentation modal)
 * 3. Bottom Horizontal "WE'VE GOT YOUR BACK" Section:
 *    - 3 spacious reassurance pillars (Safe & Secure, Quick Response, Human + AI Support)
 * 4. Large Right-Side VITTANAYA AI Assistant Panel:
 *    - Prominent full-height chat card
 *    - 5 clickable suggested questions with instant MSME CFO explanations
 *    - Chat thread, text input, send action, and reset conversation
 */
export default function HelpSupportPage({ onNavigateHome }) {
  const { currentProfile, financialData, operationsConfig, setActiveNavId } = useWorkspace();

  const userName = currentProfile?.user_name || currentProfile?.ownerName || 'Business Owner';
  const businessName = currentProfile?.business_name || 'Vittanaya Enterprise';

  // Active Modals & Dialogs
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isUserGuideModalOpen, setIsUserGuideModalOpen] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState('runway'); // 'runway' | 'forecast' | 'operations' | 'invoices' | 'security'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Contact Support Form State
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'Cash Flow & Forecasting',
    priority: 'Normal',
    message: '',
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.message) {
      showToast('Please provide both subject and message details.');
      return;
    }
    const ticketId = `#VIT-${Math.floor(10000 + Math.random() * 90000)}`;
    setIsContactModalOpen(false);
    setContactForm({ subject: '', category: 'Cash Flow & Forecasting', priority: 'Normal', message: '' });
    showToast(`Support Ticket ${ticketId} created! Our team will respond shortly.`);
  };

  // AI Assistant Chat State
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'ai',
      text: "Hi! I'm VITTANAYA AI. How can I help you today?",
      time: '10:30 AM',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatBottomRef = useRef(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  // Suggested Questions Catalog
  const SUGGESTED_QUESTIONS = [
    {
      q: 'How is Cash Runway calculated?',
      a: 'Cash Runway is calculated as: (Total Available Liquid Cash) ÷ (Average Daily Net Burn Rate). For your workspace, maintaining at least 45–60 days of runway ensures adequate working capital cushion before major payable outflows.',
    },
    {
      q: 'How do I add a new invoice?',
      a: 'To log or track customer invoices, navigate to the Invoices section from the sidebar or record receivable inflows in Cash Overview. The platform automatically forecasts collection realization based on customer payment history.',
    },
    {
      q: 'Why is my Financial Health score low?',
      a: 'Financial Health is scored out of 100 based on 4 pillars: Cash Runway adequacy, Debt-to-Equity / Loan coverage, Receivable Aging over 45 days, and Operating Cash Margin. Improving overdue collections directly boosts this score.',
    },
    {
      q: 'How do I enable Fleet / Trips?',
      a: 'Open your Business Profile from the sidebar, navigate to the "Active Operations" section, find "Fleet & Vehicles" or "Trips & Logistics", and click "+ Enable". You can configure vehicle count, fuel rates, and maintenance cycles.',
    },
    {
      q: 'How do I change business information?',
      a: 'You can update your business name, GSTIN, location, and owner identity anytime by visiting "Business Profile" > "Identity & Tax Details" and clicking the Edit button.',
    },
  ];

  // Send Message Handler
  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsAiTyping(true);

    // Intelligent financial fallback
    setTimeout(() => {
      let aiResponseText = '';
      const matched = SUGGESTED_QUESTIONS.find(
        (sq) => sq.q.toLowerCase() === query.toLowerCase() || query.toLowerCase().includes(sq.q.toLowerCase().slice(0, 15))
      );

      if (matched) {
        aiResponseText = matched.a;
      } else if (query.toLowerCase().includes('cash') || query.toLowerCase().includes('balance')) {
        aiResponseText = `Your current available cash balance is ₹${(financialData?.cash_balance || 1485000).toLocaleString('en-IN')}. You can review your accounts breakdown in Cash Overview.`;
      } else if (query.toLowerCase().includes('contact') || query.toLowerCase().includes('human') || query.toLowerCase().includes('call')) {
        aiResponseText = `Our human support engineers are available Monday to Saturday, 9 AM – 7 PM IST. You can click "Contact Support →" on the left to submit an urgent ticket directly to our priority queue.`;
      } else {
        aiResponseText = `I understand you're asking about "${query}". In VITTANAYA, all financial data and operations for ${businessName} are synchronized automatically. You can check the User Guide for detailed tutorials or submit a support ticket if you need specialized assistance.`;
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsAiTyping(false);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'ai',
        text: "Hi! I'm VITTANAYA AI. How can I help you today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    showToast('AI Assistant conversation reset.');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20 text-slate-900">

      {/* Top Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
        <button
          type="button"
          onClick={() => onNavigateHome ? onNavigateHome() : setActiveNavId('dashboard')}
          className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Home</span>
        </button>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold">Help & Support</span>
      </nav>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center space-x-2.5 animate-slideUp">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main 2-Column Spacious Layout Matching Reference Proportions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* ======================================================================= */}
        {/* LEFT COLUMN: HERO, ACTION CARDS & REASSURANCE (7-COL SPAN)             */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8">

          {/* --------------------------------------------------------------------- */}
          {/* 1. LARGE HERO SECTION (TORN PAPER WITH WASHI TAPE & HEADSET DOODLE)   */}
          {/* --------------------------------------------------------------------- */}
          <div className="torn-paper-hero p-8 sm:p-10 relative overflow-hidden transition-all">
            
            {/* Top Washi Tape Corner Accents */}
            <div className="washi-tape-green-lg -top-3 left-8 transform -rotate-12 pointer-events-none" />
            <div className="washi-tape-green-lg -top-3 right-16 transform rotate-12 pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative z-10">
              <div className="space-y-4 max-w-lg">
                
                {/* Large Hand-Crafted Heading Banner */}
                <div className="inline-block px-5 py-3 rounded-2xl bg-slate-50/90 border-2 border-slate-300 shadow-sm transform -rotate-1">
                  <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-wider font-mono uppercase">
                    HELP & SUPPORT
                  </h1>
                </div>

                {/* Subtitle with Hand-drawn Underline */}
                <div className="pt-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight hand-underline-green">
                    We're here for you!
                  </h2>
                </div>

                {/* Descriptive Copy */}
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-1">
                  Explore our guides, reach out to our team, or chat with our AI assistant anytime.
                </p>

                {/* Dashed Flight Path Doodle */}
                <div className="hidden sm:flex items-center space-x-2 text-slate-400 text-sm font-mono pt-2">
                  <span>✈</span>
                  <span className="tracking-widest">-----------------------&gt;</span>
                </div>
              </div>

              {/* Hand-Drawn Headset Illustration */}
              <div className="flex items-center justify-center p-2 relative flex-shrink-0">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  {/* Decorative sound doodle waves */}
                  <div className="absolute -top-2 -right-2 text-blue-600 font-mono text-base animate-pulse">
                    ♩ ♪ ♫
                  </div>
                  
                  {/* Illustrated Headset & Speech Bubble */}
                  <div className="w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-50 flex items-center justify-center relative shadow-lg">
                    {/* Headphone band */}
                    <div className="absolute -top-3 inset-x-3 h-5 border-t-4 border-slate-900 rounded-t-full" />
                    
                    {/* Ear cushions */}
                    <div className="absolute -left-3 top-8 w-4 h-10 rounded-full bg-blue-600 border-2 border-slate-900 shadow-xs" />
                    <div className="absolute -right-3 top-8 w-4 h-10 rounded-full bg-blue-600 border-2 border-slate-900 shadow-xs" />
                    
                    {/* Microphone arm */}
                    <div className="absolute -bottom-1 left-5 w-14 h-2 bg-slate-900 rounded-full transform -rotate-12" />
                    <div className="absolute -bottom-3 right-7 w-4 h-4 rounded-full bg-slate-900" />

                    {/* Chat Bubble in Center */}
                    <div className="w-16 h-12 rounded-2xl bg-white border-2 border-slate-900 flex items-center justify-center text-slate-900 text-xl shadow-xs">
                      💬
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* 2. TWO LARGE SUPPORT CARDS: CONTACT SUPPORT & USER GUIDE             */}
          {/* --------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

            {/* CARD 1: CONTACT SUPPORT (GREEN ACCENT) */}
            <div className="torn-paper p-8 flex flex-col justify-between space-y-6 hover:border-blue-300 transition-all group relative overflow-hidden min-h-[260px]">
              {/* Corner washi tape accent */}
              <div className="washi-tape-green -bottom-2 -right-3 transform rotate-45 pointer-events-none opacity-80" />

              <div className="space-y-4 relative z-10">
                {/* Header with Painted Circular Icon */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md shadow-blue-500/20 border-2 border-white">
                    💬
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight hand-underline-green">
                      CONTACT SUPPORT
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed">
                  Can't find what you're looking for?<br />
                  Our support team is ready to help.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 relative z-10">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Contact Support</span>
                  <span className="text-base">→</span>
                </button>
              </div>

              {/* Faint envelope doodle in background */}
              <div className="absolute -bottom-3 -right-3 text-emerald-100 opacity-60 pointer-events-none text-7xl">
                ✉️
              </div>
            </div>

            {/* CARD 2: USER GUIDE (PURPLE ACCENT) */}
            <div className="torn-paper p-8 flex flex-col justify-between space-y-6 hover:border-purple-300 transition-all group relative overflow-hidden min-h-[260px]">
              {/* Corner washi tape accent */}
              <div className="washi-tape-purple -bottom-2 -right-3 transform -rotate-45 pointer-events-none opacity-80" />

              <div className="space-y-4 relative z-10">
                {/* Header with Painted Circular Icon */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-full bg-purple-500 text-white flex items-center justify-center text-2xl shadow-md shadow-purple-500/20 border-2 border-white">
                    📖
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight hand-underline-purple">
                      USER GUIDE
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed">
                  Step-by-step guides and documentation to help you master VITTANAYA.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 relative z-10">
                <button
                  type="button"
                  onClick={() => setIsUserGuideModalOpen(true)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-extrabold text-sm shadow-md shadow-purple-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Open User Guide</span>
                  <span className="text-base">→</span>
                </button>
              </div>

              {/* Faint book doodle in background */}
              <div className="absolute -bottom-3 -right-3 text-purple-100 opacity-60 pointer-events-none text-7xl">
                📚
              </div>
            </div>

          </div>

          {/* --------------------------------------------------------------------- */}
          {/* 3. "WE'VE GOT YOUR BACK" REASSURANCE SECTION                         */}
          {/* --------------------------------------------------------------------- */}
          <div className="torn-paper p-8 space-y-6 relative overflow-hidden">
            {/* Heading with Underline */}
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight hand-underline-green">
                WE'VE GOT YOUR BACK
              </h3>
            </div>

            {/* 3 Reassurance Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
              
              {/* Pillar 1: Safe & Secure */}
              <div className="flex items-start space-x-3.5 p-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
                  🛡️
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">Safe & Secure</h4>
                  <p className="text-xs text-slate-500 leading-snug">
                    Your data is encrypted and always protected.
                  </p>
                </div>
              </div>

              {/* Pillar 2: Quick Response */}
              <div className="flex items-start space-x-3.5 p-2 sm:border-l sm:border-slate-200/80">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
                  ⏱️
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">Quick Response</h4>
                  <p className="text-xs text-slate-500 leading-snug">
                    We usually respond within a few hours.
                  </p>
                </div>
              </div>

              {/* Pillar 3: Human + AI Support */}
              <div className="flex items-start space-x-3.5 p-2 sm:border-l sm:border-slate-200/80">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
                  👤
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">Human + AI Support</h4>
                  <p className="text-xs text-slate-500 leading-snug">
                    Smart AI assistance with real human support when you need it.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: LARGE VITTANAYA AI ASSISTANT PANEL (5-COL SPAN)          */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="torn-paper p-6 sm:p-8 space-y-5 flex flex-col justify-between flex-1 min-h-[680px] shadow-xl">
            
            {/* AI Assistant Top Bar */}
            <div className="space-y-2.5 pb-4 border-b border-slate-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Robot Icon */}
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-md shadow-blue-500/20">
                    🤖
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-base text-slate-900 tracking-tight">
                        VITTANAYA AI Assistant
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black tracking-wide">
                        BETA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Refresh & Close Controls */}
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={handleResetChat}
                    title="Reset Conversation"
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm transition-colors cursor-pointer"
                  >
                    🔄
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Ask me anything about VITTANAYA. I'll try to help you right away.
              </p>
            </div>

            {/* Chat Conversation Thread */}
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[380px] pr-1 py-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-start space-x-2.5 max-w-[90%]">
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-sm flex-shrink-0 mt-1 shadow-2xs">
                        🤖
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-slate-900 text-white rounded-br-xs'
                          : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}

              {isAiTyping && (
                <div className="flex items-center space-x-2 text-xs text-slate-400 italic py-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-100" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-200" />
                  <span className="text-xs ml-1">VITTANAYA AI is typing...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* 5 Suggested Questions Pills */}
            {messages.length <= 4 && (
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Suggested Questions
                </span>
                <div className="space-y-2">
                  {SUGGESTED_QUESTIONS.map((sq, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(sq.q)}
                      className="w-full p-2.5 rounded-xl bg-white hover:bg-blue-50/70 border border-slate-200 text-slate-800 hover:text-blue-700 text-xs font-semibold flex items-center justify-between transition-all text-left cursor-pointer group shadow-2xs hover:shadow-xs"
                    >
                      <span>{sq.q}</span>
                      <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input Box */}
            <div className="space-y-2.5 pt-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder="Type your question here..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="flex-1 p-3 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 shadow-xs"
                />
                <button
                  type="submit"
                  className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center"
                >
                  <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>

              {/* Disclaimer Notice */}
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 pt-0.5">
                <span>ℹ️</span>
                <span>AI answers can make mistakes. Please verify important information.</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE MODALS: CONTACT SUPPORT & USER GUIDE                       */}
      {/* ========================================================================= */}

      {/* MODAL 1: CONTACT SUPPORT TICKET FORM */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">✉️</span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Submit Support Request</h3>
                  <p className="text-xs text-slate-500">Dedicated assistance for {businessName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Issue Category</label>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none"
                  >
                    <option value="Cash Flow & Forecasting">Cash Flow & Forecasting</option>
                    <option value="Invoices & Receivables">Invoices & Receivables</option>
                    <option value="Active Operations Setup">Active Operations Setup</option>
                    <option value="Bank Feeds & Integrations">Bank Feeds & Integrations</option>
                    <option value="Account & Billing">Account & Billing</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Priority</label>
                  <select
                    value={contactForm.priority}
                    onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none"
                  >
                    <option value="Normal">Normal (Response within 4 hrs)</option>
                    <option value="High">High (Response within 2 hrs)</option>
                    <option value="Urgent">Urgent (Immediate Callback)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subject / Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Question regarding 30-day runway projection"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Message Details</label>
                <textarea
                  rows={4}
                  placeholder="Describe your issue or question in detail..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Submit Ticket →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: USER GUIDE & DOCUMENTATION READER */}
      {isUserGuideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500 text-white flex items-center justify-center text-lg font-bold">
                  📖
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">VITTANAYA User Guide & Docs</h3>
                  <p className="text-xs text-slate-500">Mastering your MSME Financial Digital Twin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUserGuideModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-slate-100 text-xs">
              {[
                { id: 'runway', label: '⏱️ Cash Runway' },
                { id: 'forecast', label: '📊 30D Forecast' },
                { id: 'operations', label: '🏢 Active Operations' },
                { id: 'invoices', label: '🧾 Invoices & Bills' },
                { id: 'security', label: '🔒 Security & Backup' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveGuideTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeGuideTab === tab.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Documentation Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs sm:text-sm leading-relaxed">
              {activeGuideTab === 'runway' && (
                <div className="space-y-3">
                  <h4 className="font-black text-base text-slate-900">Understanding Cash Runway</h4>
                  <p className="text-slate-600">
                    Cash Runway indicates how many days your business can continue operations without additional revenue inflows before liquidity is depleted.
                  </p>
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                    <span className="font-bold text-purple-900 block">Formula:</span>
                    <code className="text-purple-800 font-mono text-xs block">
                      Runway Days = (Liquid Cash + Available Overdraft) ÷ (Daily Outflow Burn Rate)
                    </code>
                  </div>
                  <p className="text-slate-600">
                    A healthy MSME target is <strong>45 to 90 days</strong>. If runway drops below 30 days, the platform triggers an amber or red alert.
                  </p>
                </div>
              )}

              {activeGuideTab === 'forecast' && (
                <div className="space-y-3">
                  <h4 className="font-black text-base text-slate-900">30-Day Cash Flow Forecasting</h4>
                  <p className="text-slate-600">
                    The 30-day forecast combines confirmed receivables, scheduled vendor payables, fixed operational expenses, and active business parameters to project your daily rolling balance.
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-1">
                    <li><strong>Green Bars:</strong> Inflow collections and settlements.</li>
                    <li><strong>Red Bars:</strong> Scheduled supplier disbursements, payroll, and debt servicing.</li>
                    <li><strong>Blue Line:</strong> Cumulative rolling cash balance.</li>
                  </ul>
                </div>
              )}

              {activeGuideTab === 'operations' && (
                <div className="space-y-3">
                  <h4 className="font-black text-base text-slate-900">Configuring Active Operations</h4>
                  <p className="text-slate-600">
                    VITTANAYA supports 13 dedicated MSME operations (Sales, Purchases, Inventory, Fleet, Loans, Fuel, etc.). Each operation can be configured with specific unit parameters in your <strong>Business Profile</strong>.
                  </p>
                  <p className="text-slate-600">
                    When you update operating numbers (e.g. employee count or daily trips), the causal twin automatically re-simulates your cash burn.
                  </p>
                </div>
              )}

              {activeGuideTab === 'invoices' && (
                <div className="space-y-3">
                  <h4 className="font-black text-base text-slate-900">Invoices & Receivables Management</h4>
                  <p className="text-slate-600">
                    Track customer invoices and identify aging receivables before they impact working capital. The system applies risk discounts to invoices past 45 days.
                  </p>
                </div>
              )}

              {activeGuideTab === 'security' && (
                <div className="space-y-3">
                  <h4 className="font-black text-base text-slate-900">Data Privacy & JSON Backup</h4>
                  <p className="text-slate-600">
                    All financial information is stored client-side and encrypted with AES-256-GCM standards. You can download a complete offline JSON backup of your workspace anytime from <strong>Settings &gt; Data &amp; Integrations</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUserGuideModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

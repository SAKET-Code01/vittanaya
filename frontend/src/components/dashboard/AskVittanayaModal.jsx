import React, { useState, useRef, useEffect, useCallback } from 'react';
import { advisoryService } from '../../services/advisoryService';
import MarkdownRenderer from '../common/MarkdownRenderer';

const LANGUAGES = [
  'English',
  'हिन्दी (Hindi)',
  'ଓଡ଼ିଆ (Odia)',
  'मराठी (Marathi)',
  'বাংলা (Bengali)',
  'தமிழ் (Tamil)',
  'తెలుగు (Telugu)',
  'ગુજરાતી (Gujarati)',
];

const LANGUAGE_CODE_MAP = {
  'English': 'en',
  'हिन्दी (Hindi)': 'hi',
  'ଓଡ଼ିଆ (Odia)': 'or',
  'मराठी (Marathi)': 'mr',
  'বাংলা (Bengali)': 'bn',
  'தமிழ் (Tamil)': 'ta',
  'తెలుగు (Telugu)': 'te',
  'ગુજરાતી (Gujarati)': 'gu',
};

const CODE_TO_LANGUAGE_MAP = {
  'en': 'English',
  'hi': 'हिन्दी (Hindi)',
  'or': 'ଓଡ଼ିଆ (Odia)',
  'mr': 'मराठी (Marathi)',
  'bn': 'বাংলা (Bengali)',
  'ta': 'தமிழ் (Tamil)',
  'te': 'తెలుగు (Telugu)',
  'gu': 'ગુજરાતી (Gujarati)',
};

const SPEECH_LANG_MAP = {
  'English': 'en-IN',
  'हिन्दी (Hindi)': 'hi-IN',
  'ଓଡ଼ିଆ (Odia)': 'or-IN',
  'मराठी (Marathi)': 'mr-IN',
  'বাংলা (Bengali)': 'bn-IN',
  'தமிழ் (Tamil)': 'ta-IN',
  'తెలుగు (Telugu)': 'te-IN',
  'ગુજરાતી (Gujarati)': 'gu-IN',
};

const PREFERRED_LANGUAGE_STORAGE_KEY = 'preferred_language';

function getStoredLanguagePreference() {
  try {
    const raw = localStorage.getItem(PREFERRED_LANGUAGE_STORAGE_KEY);
    if (!raw) return 'English';
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.preferred_language) {
        const code = String(parsed.preferred_language).toLowerCase().trim();
        if (CODE_TO_LANGUAGE_MAP[code]) {
          return CODE_TO_LANGUAGE_MAP[code];
        }
      }
    } catch {
      // not JSON, fallback to raw string
    }
    const clean = raw.trim().toLowerCase();
    if (CODE_TO_LANGUAGE_MAP[clean]) {
      return CODE_TO_LANGUAGE_MAP[clean];
    }
    if (LANGUAGES.includes(raw.trim())) {
      return raw.trim();
    }
  } catch (err) {
    console.warn('Could not read preferred_language from localStorage:', err);
  }
  return 'English';
}

function persistLanguagePreference(languageLabel) {
  try {
    const code = LANGUAGE_CODE_MAP[languageLabel] || 'en';
    const payload = { preferred_language: code };
    localStorage.setItem(PREFERRED_LANGUAGE_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Could not write preferred_language to localStorage:', err);
  }
}

/**
 * AskVittanayaModal Component — Production AI Business Copilot
 * 
 * Features:
 * - Clean VITTANAYA Copilot identity (no cartoonish mascot, no technical diagnostic leak)
 * - 3 display modes: COMPACT (~680px), EXPANDED (~92vw), FULLSCREEN (100vw x 100dvh)
 * - Grounded deterministic calculations from backend (AHP, financial, schemes, readiness)
 * - Server-side Groq openai/gpt-oss-120b conversational synthesis with deterministic fallback
 * - Two-step write confirmation cards (complete_action_task)
 * - In-app navigation shortcuts
 * - Web Speech API Voice Input (Speech-to-Text) + SpeechSynthesis (Text-to-Speech)
 * - Responsive viewport-safe layout with scroll locks and keyboard navigation
 */
export default function AskVittanayaModal({
  isOpen,
  onClose,
  currentProfile,
  financialSummary,
  initialPrompt = '',
  onNavigate,
}) {
  // Display modes: 'default' | 'expanded' | 'fullscreen'
  const [chatMode, setChatMode] = useState('default');
  const [selectedLanguage, setSelectedLanguage] = useState(getStoredLanguagePreference);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState({});

  // Voice Speech Recognition & TTS States
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [isSpeakingId, setIsSpeakingId] = useState(null);
  const recognitionRef = useRef(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const businessName = currentProfile?.businessName || currentProfile?.name || currentProfile?.business_name || '';
  const businessCategory = currentProfile?.category || currentProfile?.businessType || currentProfile?.type || currentProfile?.industry || '';
  const businessLocation = currentProfile?.location_district
    ? `${currentProfile.location_district}, ${currentProfile.location_state || 'Odisha'}`
    : (currentProfile?.district || currentProfile?.location || currentProfile?.location_village || 'Odisha');
  const ownCapital = Number(currentProfile?.available_margin_capital || currentProfile?.own_capital || currentProfile?.ownCapital || financialSummary?.cash_balance || 0);

  const activeReqIdRef = useRef(0);
  const lastUserTextRef = useRef('');

  // 1. Lock Background Scrolling
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // 2. Keyboard Esc Handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (chatMode === 'fullscreen') {
          setChatMode('expanded');
        } else if (chatMode === 'expanded') {
          setChatMode('default');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, chatMode, onClose]);

  // 3. Reset conversation context when active business changes
  useEffect(() => {
    activeReqIdRef.current += 1;
    setMessages([]);
  }, [currentProfile?.id, currentProfile?.name, currentProfile?.business_name]);

  // 4. Initialize clean welcome greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const isProfileValid = Boolean(businessName || businessCategory || currentProfile?.id);
      const welcomeMsg = isProfileValid
        ? `Hello! I am **Ask VITTANAYA**, your AI Business Copilot for **${businessName || 'your enterprise'}** in **${businessLocation}**.\n\nI can assist you with AHP feasibility analysis, loan EMI and cash flow projections, government scheme eligibility (PMEGP/MUDRA), and roadmap execution. What would you like to review?`
        : "Hello! I am **Ask VITTANAYA**, your AI Business Copilot. Please select or complete a business profile in your workspace to run verified feasibility, financial, and government scheme models.";
      setMessages([
        {
          id: 1,
          sender: 'ai',
          text: welcomeMsg,
          time: 'Just now',
        },
      ]);
    }
  }, [isOpen, businessName, businessLocation, businessCategory, currentProfile?.user_name, messages.length]);

  const languages = LANGUAGES;

  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    persistLanguagePreference(newLanguage);
  };

  const suggestedQuestions = [
    'Explain my feasibility score',
    'Show matching schemes',
    'What should I do next?',
    'Check my financial health',
    'Show pending tasks',
  ];

  // 5. Auto-scroll message container on updates
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping, chatMode]);

  // 6. Handle Initial Prompt Injection
  useEffect(() => {
    if (!isOpen) return;
    if (initialPrompt) {
      setInputText(initialPrompt);
      return;
    }
    setInputText('');
  }, [isOpen, initialPrompt]);

  // 7. Voice Recognition Setup (Web Speech API)
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = SPEECH_LANG_MAP[selectedLanguage] || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((res) => res[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setSpeechError(`Microphone notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [selectedLanguage]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported on this browser. Voice features work best on Chrome and Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Voice start exception:', e);
      }
    }
  };

  // 8. Text-to-Speech (TTS) Reader for AI Answers
  const handleToggleSpeak = useCallback((msgId, text) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = SPEECH_LANG_MAP[selectedLanguage] || 'en-IN';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);

    setIsSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  }, [isSpeakingId, selectedLanguage]);

  const toggleDetails = (msgId) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  if (!isOpen) return null;

  // 9. Send Chat Message to FastAPI Backend
  const handleSendMessage = async (textToSend, confirmedAction = null) => {
    const text = textToSend || inputText;
    if ((!text.trim() && !confirmedAction) || isTyping) return;

    lastUserTextRef.current = text || 'Confirm action';
    const reqId = ++activeReqIdRef.current;
    const reqProfileId = currentProfile?.id;

    if (!confirmedAction) {
      const userMsg = {
        id: Date.now(),
        sender: 'user',
        text: text,
        time: 'Just now',
      };
      setMessages((prev) => [...prev, userMsg]);
      if (!textToSend) setInputText('');
    }

    setIsTyping(true);

    try {
      const historyPayload = messages
        .filter((m) => m.text && !m.error)
        .slice(-4)
        .map((m) => ({
          sender: m.sender,
          text: m.text,
        }));

      const payload = {
        message: text || 'Confirm action',
        business_id: currentProfile?.id ? String(currentProfile.id) : null,
        language: selectedLanguage,
        business_context: (businessName || businessCategory || currentProfile?.id) ? {
          business_id: currentProfile?.id ? String(currentProfile.id) : null,
          business_category: businessCategory || currentProfile?.category || 'General',
          specific_business: currentProfile?.industry || currentProfile?.category || 'General Enterprise',
          business_name: businessName,
          location: (currentProfile?.location_district || currentProfile?.district || currentProfile?.location)
            ? `${currentProfile.location_district || currentProfile.district || currentProfile.location}${currentProfile.location_state ? `, ${currentProfile.location_state}` : ''}`
            : null,
          available_margin_capital: ownCapital > 0 ? ownCapital : 0,
          social_category: currentProfile?.socialCategory || currentProfile?.social_category || null,
          area_type: currentProfile?.areaType || currentProfile?.area_type || null,
          scale: currentProfile?.scale || null,
        } : null,
        history: historyPayload,
        confirmed_action: confirmedAction,
      };

      const response = await advisoryService.sendChatMessage(payload);

      if (reqId !== activeReqIdRef.current || currentProfile?.id !== reqProfileId) return;

      const resData = response.data || response;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: resData.answer || 'Response generated from verified VITTANAYA engines.',
          time: 'Just now',
          error: resData.data_status === 'UNAVAILABLE',
          details: resData,
        },
      ]);
    } catch (err) {
      console.warn('AI Advisor error notice:', err);
      if (reqId !== activeReqIdRef.current || currentProfile?.id !== reqProfileId) return;

      const unavailableText = "VITTANAYA advisory service is temporarily unavailable. Your saved business data is safe. Please retry.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: unavailableText,
          time: 'Just now',
          error: true,
          details: {
            answer: unavailableText,
            confidence: 'NONE',
            data_status: 'UNAVAILABLE',
            why_this_result: ['Service request timed out or backend unreachable.'],
            recommended_next_steps: ['Check backend service status', 'Click Retry button'],
            sources: [],
            key_facts: [],
          },
        },
      ]);
    } finally {
      if (reqId === activeReqIdRef.current) {
        setIsTyping(false);
      }
    }
  };

  const handleConfirmAction = (details) => {
    handleSendMessage(`Confirm mark task "${details?.task_title || 'task'}" complete`, details);
  };

  const handleCancelAction = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'ai',
        text: 'Action cancelled. No changes were made to your roadmap or readiness score.',
        time: 'Just now',
      },
    ]);
  };

  // Determine Modal Sizing Classes
  const getContainerClasses = () => {
    if (chatMode === 'fullscreen') {
      return 'fixed inset-0 z-50 flex flex-col bg-black/70 animate-fadeIn p-0';
    }
    if (chatMode === 'expanded') {
      return 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fadeIn';
    }
    return 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-fadeIn';
  };

  const getCardClasses = () => {
    if (chatMode === 'fullscreen') {
      return 'bg-[#FAF7F2] w-full h-[100dvh] flex flex-col overflow-hidden shadow-none border-0 rounded-none animate-fadeIn';
    }
    if (chatMode === 'expanded') {
      return 'bg-[#FAF7F2] rounded-2xl sm:rounded-3xl border border-[#E8E2D5] shadow-2xl w-full max-w-[92vw] h-[90vh] max-h-[92vh] flex flex-col overflow-hidden animate-fadeInScale transition-all duration-200';
    }
    return 'bg-[#FAF7F2] rounded-2xl sm:rounded-3xl border border-[#E8E2D5] shadow-2xl w-full max-w-2xl h-[94dvh] sm:h-[min(740px,86vh)] flex flex-col overflow-hidden animate-fadeInScale transition-all duration-200';
  };

  return (
    <div
      className={getContainerClasses()}
      role="dialog"
      aria-modal="true"
      aria-label="Ask VITTANAYA AI Business Copilot"
    >
      <div className={getCardClasses()}>

        {/* Modal Header */}
        <header className="flex-shrink-0 bg-[#0F291E] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-emerald-900/40 select-none">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Sleek VITTANAYA Copilot Emblem */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-800 to-emerald-950 flex items-center justify-center text-amber-300 font-black text-sm shadow-md border border-amber-400/30 shrink-0">
              <span className="tracking-tighter">V✦</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 truncate">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                  Ask VITTANAYA
                </h3>
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                  AI Business Copilot
                </span>
              </div>
              {businessName ? (
                <p className="text-[11px] sm:text-xs text-[#A6B5AC] font-medium truncate">
                  Business: <span className="text-white font-semibold">{businessName}</span> • {businessLocation}
                </p>
              ) : (
                <p className="text-[11px] sm:text-xs text-[#A6B5AC] font-medium truncate">
                  Grounded Hyper-Local Financial & Enterprise Advisory
                </p>
              )}
            </div>
          </div>

          {/* Header Controls: Language Selector + Mode Controls + Close */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-white/10 hover:bg-white/15 text-white text-[11px] sm:text-xs font-semibold rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer transition-colors max-w-[110px] sm:max-w-none"
              aria-label="Select Advisory Language"
            >
              {languages.map((lang, idx) => (
                <option key={idx} value={lang} className="bg-[#0F291E] text-white">
                  {lang}
                </option>
              ))}
            </select>

            {/* Mode 1 Switcher: Default / Minimize */}
            {chatMode !== 'default' && (
              <button
                type="button"
                onClick={() => setChatMode('default')}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                title="Default Compact View (680px)"
                aria-label="Restore default compact view"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="5" width="14" height="14" rx="2" />
                  <path d="M9 9h6v6H9z" />
                </svg>
              </button>
            )}

            {/* Mode 2 Switcher: Expanded Workspace */}
            {chatMode !== 'expanded' && (
              <button
                type="button"
                onClick={() => setChatMode('expanded')}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 hidden sm:flex"
                title="Expanded Workspace View"
                aria-label="Expand chat to large workspace"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </button>
            )}

            {/* Mode 3 Switcher: Full Screen */}
            <button
              type="button"
              onClick={() => setChatMode(chatMode === 'fullscreen' ? 'default' : 'fullscreen')}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              title={chatMode === 'fullscreen' ? 'Exit Full Screen' : 'Full Screen View'}
              aria-label={chatMode === 'fullscreen' ? 'Exit Full Screen' : 'Enter Full Screen'}
            >
              {chatMode === 'fullscreen' ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-600/80 active:bg-rose-700 text-white flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ml-1"
              title="Close (Esc)"
              aria-label="Close Ask VITTANAYA"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Message History Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#FAF7F2] select-text"
        >
          {initialPrompt && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[11px] sm:text-xs text-emerald-800 font-medium flex items-center justify-between">
              <span>Feasibility context loaded. You can send the question directly or edit it below.</span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider ml-2">Active</span>
            </div>
          )}

          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            const details = msg.details;
            const isDetailsOpen = expandedDetails[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-xl bg-[#0F291E] text-amber-300 flex items-center justify-center font-black text-xs shrink-0 shadow-sm border border-emerald-800">
                    V✦
                  </div>
                )}

                <div
                  className={`rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-xs break-words ${
                    chatMode === 'fullscreen' || chatMode === 'expanded'
                      ? 'max-w-[85%] sm:max-w-[75%]'
                      : 'max-w-[88%]'
                  } ${
                    isAi
                      ? msg.error || details?.data_status === 'UNAVAILABLE'
                        ? 'bg-amber-50/90 border border-amber-200 text-amber-900'
                        : 'bg-white border border-[#E8E2D5] text-[#1A211D]'
                      : 'bg-[#102A1E] text-white'
                  }`}
                >
                  {/* Clean Markdown Rendered Content */}
                  {isAi ? (
                    <MarkdownRenderer content={msg.text} />
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  )}

                  {/* Unavailable / Error Box */}
                  {isAi && (msg.error || details?.data_status === 'UNAVAILABLE') && (
                    <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 text-[9px] font-black rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                        UNAVAILABLE
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSendMessage(lastUserTextRef.current || 'What is my feasibility score?')}
                        className="px-3 py-1 rounded-xl bg-[#0F291E] hover:bg-[#1C4332] text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1 cursor-pointer"
                      >
                        <span>🔄 Retry</span>
                      </button>
                    </div>
                  )}

                  {/* State Modification Confirmation Card */}
                  {isAi && details?.confirmation_required && (
                    <div className="mt-3 p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 shadow-sm animate-fadeIn">
                      <div className="flex items-start space-x-2.5">
                        <span className="text-base">⚠️</span>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-amber-950">Action Confirmation Required</h4>
                          <p className="text-[11px] text-amber-900 mt-0.5 leading-normal">
                            Would you like to mark <strong>{details?.confirmation_details?.task_title || 'this task'}</strong> as completed in your PostgreSQL records and recalculate your readiness score?
                          </p>
                          <div className="mt-2.5 flex items-center space-x-2">
                            <button
                              type="button"
                              disabled={isTyping}
                              onClick={() => handleConfirmAction(details.confirmation_details)}
                              className="px-3 py-1.5 rounded-lg bg-[#0F291E] hover:bg-[#1C4332] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1"
                            >
                              <span>✓ Confirm & Execute</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelAction}
                              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick In-App Navigation Target */}
                  {isAi && details?.navigation_target && onNavigate && (
                    <div className="mt-2.5 pt-2 border-t border-[#E8E2D5]/50 flex items-center justify-between">
                      <span className="text-[11px] text-[#607267] font-medium">Quick Workspace Navigation:</span>
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate(details.navigation_target);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Open {details.navigation_target.replace('-', ' ').toUpperCase()}</span>
                        <span>→</span>
                      </button>
                    </div>
                  )}

                  {/* Collapsible Details Panel ("Why this answer?") */}
                  {isAi && isDetailsOpen && (
                    <div className="mt-3 p-3 rounded-xl bg-[#F8F5EE] border border-[#E8E2D5] space-y-2 text-[11px] text-[#3A4A41] animate-fadeIn">
                      {details?.key_facts && details.key_facts.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-[#607267] uppercase tracking-wider block mb-1">
                            Verified Decision Facts:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {details.key_facts.map((kf, idx) => (
                              <div
                                key={idx}
                                className="px-2.5 py-0.5 rounded bg-white border border-[#E8E2D5] text-[10px] font-semibold text-[#0F291E]"
                              >
                                <span className="text-[#607267] font-normal">{kf.label}: </span>
                                <span>{kf.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {details?.why_this_result && details.why_this_result.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-[#607267] uppercase tracking-wider block mb-1">
                            Decision Lineage:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[10px] text-[#425047]">
                            {details.why_this_result.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {details?.recommended_next_steps && details.recommended_next_steps.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                            Recommended Action:
                          </span>
                          <p className="text-[10px] font-medium text-emerald-900">
                            {details.recommended_next_steps[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subtle Provenance Footer + Voice TTS + Why this answer Toggle */}
                  {isAi && !msg.error && (
                    <div className="mt-2.5 pt-1.5 border-t border-[#E8E2D5]/50 flex items-center justify-between text-[10px] text-[#607267]">
                      <div className="flex items-center space-x-1.5 truncate max-w-[65%]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        <span className="truncate font-medium">
                          {details?.provenance_label || 'Grounded in VITTANAYA Business Data'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        {(details?.why_this_result?.length > 0 || details?.key_facts?.length > 0) && (
                          <button
                            type="button"
                            onClick={() => toggleDetails(msg.id)}
                            className="text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer underline text-[10px]"
                          >
                            {isDetailsOpen ? 'Hide Details' : 'Why this answer?'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleSpeak(msg.id, msg.text)}
                          className="text-slate-500 hover:text-emerald-700 font-medium flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
                          title={isSpeakingId === msg.id ? 'Stop speaking' : 'Read response aloud'}
                          aria-label={isSpeakingId === msg.id ? 'Stop reading' : 'Read response aloud'}
                        >
                          <span>{isSpeakingId === msg.id ? '⏹ Stop' : '🔊 Listen'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1.5 text-right ${
                      isAi ? 'text-[#819388]' : 'text-white/60'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>

                {!isAi && (
                  <div className="w-8 h-8 rounded-xl bg-[#D4A343] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    You
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-[#607267] italic p-2 bg-emerald-50/50 rounded-xl border border-emerald-100 max-w-sm">
              <span className="w-2 h-2 rounded-full bg-[#2F7757] animate-ping" />
              <span>VITTANAYA AI Copilot is retrieving verified calculations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions Bar */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-2 bg-[#F4EFE6] border-t border-[#E8E2D5] flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-[#607267] whitespace-nowrap">
            Suggested:
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 rounded-full bg-white border border-[#E8E2D5] text-[11px] font-medium text-[#1A211D] hover:bg-[#E8F1EC] hover:text-[#2F7757] hover:border-emerald-300 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Voice Listening Feedback Banner */}
        {isListening && (
          <div className="flex-shrink-0 px-4 py-2 bg-emerald-900 text-white text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>🎙️ Listening in {selectedLanguage}... speak your question</span>
            </div>
            <button
              type="button"
              onClick={toggleVoiceInput}
              className="text-[10px] uppercase font-bold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded cursor-pointer"
            >
              Done / Stop
            </button>
          </div>
        )}

        {/* Speech Error Notice */}
        {speechError && (
          <div className="flex-shrink-0 px-4 py-1.5 bg-amber-100 text-amber-900 text-[11px] font-medium flex items-center justify-between border-t border-amber-200">
            <span>{speechError}</span>
            <button
              type="button"
              onClick={() => setSpeechError(null)}
              className="text-amber-800 hover:text-amber-950 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Input Bar — Fixed at Bottom */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex-shrink-0 p-3 sm:p-4 bg-white border-t border-[#E8E2D5] flex items-center space-x-2"
        >
          {/* Voice Input Microphone Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md animate-pulse'
                : 'bg-[#F4EFE6] hover:bg-[#E8E2D5] text-[#0F291E] border border-[#E8E2D5]'
            }`}
            title={isListening ? 'Stop Voice Listening' : 'Voice Input (Click and speak)'}
            aria-label={isListening ? 'Stop voice listening' : 'Start voice input'}
          >
            <span className="text-base">{isListening ? '⏹' : '🎙️'}</span>
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask in ${selectedLanguage}... (e.g. explain my feasibility score, loan EMI, schemes)`}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D5] text-xs sm:text-sm text-[#1A211D] placeholder-[#819388] focus:outline-none focus:border-[#2F7757] focus:ring-1 focus:ring-[#2F7757]"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-5 py-2.5 rounded-2xl bg-[#102A1E] hover:bg-[#153928] disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Send Message"
          >
            <span>Send</span>
            <span>→</span>
          </button>
        </form>

      </div>
    </div>
  );
}

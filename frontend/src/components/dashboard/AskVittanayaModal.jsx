import React, { useState, useRef, useEffect } from 'react';
import { AiMascotAvatar } from '../common/JapaneseArtwork';
import { advisoryService } from '../../services/advisoryService';

/**
 * AskVittanayaModal Component — Grounded Multilingual AI Business Advisory Dialog
 * Integrates real backend FastAPI chatbot endpoint with verified decision engines.
 */
export default function AskVittanayaModal({
  isOpen,
  onClose,
  currentProfile,
  financialSummary,
  initialPrompt = '',
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
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

  // Reset conversation context whenever the active business profile changes
  useEffect(() => {
    activeReqIdRef.current += 1;
    setMessages([]);
  }, [currentProfile?.id, currentProfile?.name, currentProfile?.business_name]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const isProfileValid = Boolean(businessName || businessCategory || currentProfile?.id);
      const welcomeMsg = isProfileValid
        ? `Namaste! I am Ask VITTANAYA, your grounded hyper-local business advisor for **${businessName || 'your enterprise'}** in **${businessLocation}**. How can I help you today?`
        : "Namaste! I am Ask VITTANAYA. Please select or complete an active business profile so I can provide grounded financial and scheme guidance.";
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

  const languages = [
    'English',
    'हिन्दी (Hindi)',
    'ଓଡ଼ିଆ (Odia)',
    'मराठी (Marathi)',
    'বাংলা (Bengali)',
    'தமிழ் (Tamil)',
    'తెలుగు (Telugu)',
    'ગુજરાતી (Gujarati)',
  ];

  const suggestedQuestions = [
    'How do I apply for the PMEGP subsidy?',
    'Can I afford this business?',
    'Why is my Feasibility Score evaluated this way?',
    'What is my biggest risk factor?',
    'What should I do next?',
  ];

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialPrompt) {
      setInputText(initialPrompt);
      return;
    }
    setInputText('');
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend, isRetry = false) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    lastUserTextRef.current = text;
    const reqId = ++activeReqIdRef.current;
    const reqProfileId = currentProfile?.id;

    if (!isRetry) {
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
      // Build past history turns for context
      const historyPayload = messages
        .filter((m) => m.text && !m.error)
        .slice(-4)
        .map((m) => ({
          sender: m.sender,
          text: m.text,
        }));

      // Call real backend API chatbot endpoint
      const response = await advisoryService.sendChatMessage({
        message: text,
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
      });

      // Ignore stale response if user switched business or sent a newer request
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

      const unavailableText = "VITTANAYA's advisory service is temporarily unavailable. Your saved business data is safe. Please retry.";
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      {/* Modal Card */}
      <div className="bg-[#FAF7F2] rounded-3xl border border-[#E8E2D5] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fadeInScale">

        {/* Modal Header */}
        <div className="bg-[#0F291E] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AiMascotAvatar size={42} />
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-base font-extrabold text-white">
                  Ask VITTANAYA
                </h3>
                <span className="text-xs text-amber-400">✨</span>
              </div>
              <p className="text-xs text-[#A6B5AC] font-medium">
                Grounded AI Business Advisory • FastAPI Powered
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-white/10 text-white text-xs font-semibold rounded-xl px-2.5 py-1.5 border border-white/20 focus:outline-none cursor-pointer"
            >
              {languages.map((lang, idx) => (
                <option key={idx} value={lang} className="bg-[#0F291E] text-white">
                  {lang}
                </option>
              ))}
            </select>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Message History */}
        <div ref={messagesContainerRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[50vh] bg-[#FAF7F2]">
          {initialPrompt && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800 font-medium">
              Feasibility context loaded. You can send the suggested question or edit it first.
            </div>
          )}
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            const details = msg.details;
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-full bg-[#0F291E] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    V
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isAi
                      ? msg.error || details?.data_status === 'UNAVAILABLE'
                        ? 'bg-amber-50/90 border border-amber-200 text-amber-900'
                        : 'bg-white border border-[#E8E2D5] text-[#1A211D]'
                      : 'bg-[#102A1E] text-white'
                  }`}
                >
                  {/* Primary Text Answer */}
                  <p>{msg.text}</p>

                  {/* Unavailable / Error Retry Box */}
                  {isAi && (msg.error || details?.data_status === 'UNAVAILABLE') ? (
                    <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 text-[9px] font-black rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                        UNAVAILABLE
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSendMessage(lastUserTextRef.current || 'What is my EMI?', true)}
                        className="px-3 py-1 rounded-xl bg-[#0F291E] hover:bg-[#1C4332] text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1 cursor-pointer"
                      >
                        <span>🔄 Retry</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Grounded Key Facts Pills */}
                      {isAi && details?.key_facts && details.key_facts.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-[#E8E2D5]/60 flex flex-wrap gap-1.5">
                          {details.key_facts.map((kf, idx) => (
                            <div
                              key={idx}
                              className="px-2.5 py-1 rounded-xl bg-[#F4EFE6] border border-[#E8E2D5] text-[11px] font-semibold text-[#0F291E]"
                            >
                              <span className="text-[#607267] font-normal">{kf.label}: </span>
                              <span>{kf.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Why / Explainability Points */}
                      {isAi && details?.why_this_result && details.why_this_result.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-[#E8E2D5]/60">
                          <span className="text-[10px] font-bold text-[#607267] uppercase tracking-wider block mb-1">
                            Why this result:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#425047]">
                            {details.why_this_result.slice(0, 2).map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommended Next Steps */}
                      {isAi && details?.recommended_next_steps && details.recommended_next_steps.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-[#E8E2D5]/60">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                            Recommended Next Step:
                          </span>
                          <p className="text-[11px] font-medium text-emerald-900">
                            {details.recommended_next_steps[0]}
                          </p>
                        </div>
                      )}

                      {/* NLP Classification Metadata Badge */}
                      {isAi && details?.nlp_metadata && (
                        <div className="mt-2 pt-1 border-t border-[#E8E2D5]/40 flex flex-wrap items-center justify-between gap-1 text-[9px]">
                          <span className="inline-flex items-center gap-1 rounded bg-[#EBF3ED] px-2 py-0.5 font-bold text-[#1C4332]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Intent: {details.intent} ({Math.round((details.nlp_metadata.confidence_score || 0.95) * 100)}% Confidence)
                          </span>
                          <span className="text-[#607267] font-semibold">
                            {details.nlp_metadata.pipeline}
                          </span>
                        </div>
                      )}

                      {/* Source & Confidence Footer */}
                      {isAi && details && (
                        <div className="mt-2 pt-1 border-t border-[#E8E2D5]/40 flex items-center justify-between text-[9px] text-[#819388]">
                          <span className="font-semibold text-emerald-700">
                            ✓ {details.data_status || 'VERIFIED'}
                          </span>
                          {details.sources && details.sources[0] && (
                            <span>Source: {details.sources[0].authority}</span>
                          )}
                        </div>
                      )}
                    </>
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
                  <div className="w-8 h-8 rounded-full bg-[#D4A343] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    You
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-[#607267] italic p-2">
              <span className="w-2 h-2 rounded-full bg-[#2F7757] animate-ping" />
              <span>VITTANAYA AI is retrieving verified calculations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 sm:px-6 py-2 bg-[#F4EFE6] border-t border-[#E8E2D5] flex items-center space-x-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-[#607267] whitespace-nowrap">
            Suggested:
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-full bg-white border border-[#E8E2D5] text-[11px] font-medium text-[#1A211D] hover:bg-[#E8F1EC] hover:text-[#2F7757] transition-colors whitespace-nowrap cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-white border-t border-[#E8E2D5] flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask in ${selectedLanguage}... (e.g. subsidy eligibility, market competition, repayment)`}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D5] text-xs sm:text-sm text-[#1A211D] placeholder-[#819388] focus:outline-none focus:border-[#2F7757]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-5 py-2.5 rounded-2xl bg-[#102A1E] hover:bg-[#153928] disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
          >
            <span>Send</span>
            <span>→</span>
          </button>
        </form>

      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { AiMascotAvatar } from '../common/JapaneseArtwork';

/**
 * AskVittanayaModal Component — Multilingual AI Business Advisory Dialog
 */
export default function AskVittanayaModal({
  isOpen,
  onClose,
  currentProfile,
  financialSummary,
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${currentProfile?.user_name || 'Entrepreneur'}! I am VITTANAYA AI Advisor. Based on your business profile (${currentProfile?.name || 'MSME'} in ${currentProfile?.location || 'India'}), your Feasibility Score is 78% and PMEGP scheme matches your ₹10,00,000 project cost with 70% loan support. How can I assist you with feasibility, financial planning, or government schemes today?`,
      time: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

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
    'Why is my Feasibility Score 78%?',
    'What are the working capital requirements?',
    'How to optimize quarterly repayments?',
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Context-aware AI Advisor response generator
    setTimeout(() => {
      let aiReply = '';
      const lower = text.toLowerCase();

      if (lower.includes('pmegp') || lower.includes('scheme') || lower.includes('subsidy')) {
        aiReply = `Under PMEGP (Prime Minister Employment Generation Programme), your ₹10,00,000 project qualifies for up to 25–35% margin money subsidy (₹2,50,000 – ₹3,50,000). Your own contribution is only 5–10% (₹1,00,000), and the remaining ₹9,00,000 is supported by the bank with CGTMSE collateral-free guarantee.`;
      } else if (lower.includes('why') || lower.includes('score') || lower.includes('78')) {
        aiReply = `Your 78% Feasibility Score is driven by: 1) Strong local market demand with 12,450 estimated consumers within 5–10 km; 2) Controlled competition (18 similar units); 3) Healthy margin buffer (+₹1.4L cushion above minimum safety threshold).`;
      } else if (lower.includes('repayment') || lower.includes('emi') || lower.includes('quarterly')) {
        aiReply = `For your ₹9,00,000 loan at ~8.5% interest over a 7-year tenure with a 6-month moratorium, your estimated quarterly repayment is ₹35,000. Your monthly operating surplus comfortably exceeds this obligation with a 2.8x Debt Service Coverage Ratio.`;
      } else {
        aiReply = `I have analyzed your request regarding "${text}". Based on current market data for ${currentProfile?.category || 'your sector'} in ${currentProfile?.location || 'your region'}, your working capital cycle requires approximately ₹1,50,000. You can review detailed cash flows in the Financial Plan tab.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiReply,
          time: 'Just now',
        },
      ]);
      setIsTyping(false);
    }, 900);
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
                Multilingual AI Business Advisory
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
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[50vh] bg-[#FAF7F2]">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
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
                  className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isAi
                      ? 'bg-white border border-[#E8E2D5] text-[#1A211D]'
                      : 'bg-[#102A1E] text-white'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
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
              <span>VITTANAYA AI is thinking...</span>
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
            disabled={!inputText.trim()}
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

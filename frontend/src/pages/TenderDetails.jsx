import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, CalendarCheck } from "lucide-react";

// Simple translation object for English and Hindi labels
const translations = {
  english: {
    back: "Back",
    backToDashboard: "Back to Dashboard",
    tenderSummary: "Tender Summary",
    matchScore: "Match Score",
    eligibilityGap: "Eligibility Gap",
    requiredDocuments: "Required Documents",
    reverseTimeline: "Reverse Timeline",
    deadline: "Deadline",
    companySnapshot: "Company Snapshot (at time of analysis)",
    companyName: "Company Name",
    businessType: "Business Type",
    industrySector: "Industry / Sector",
    experience: "Experience",
    turnover: "Turnover",
    advisorTitle: "🤖 AI Tender Advisor",
    shouldApply: "Should I Apply?",
    estimateChances: "Estimate My Chances",
    biggestRisks: "Biggest Risks",
    missingDocs: "Missing Documents",
    winningStrategy: "Winning Strategy",
    explainTender: "Explain This Tender",
    chatPlaceholder: "Ask any custom question related to this tender...",
    send: "Send",
    typing: "AI Advisor is thinking...",
  },
  hindi: {
    back: "वापस",
    backToDashboard: "डैशबोर्ड पर वापस",
    tenderSummary: "टेंडर सारांश",
    matchScore: "मैच स्कोर",
    eligibilityGap: "पात्रता अंतर",
    requiredDocuments: "आवश्यक दस्तावेज़",
    reverseTimeline: "विपरीत समय‑रेखा",
    deadline: "अंतिम तिथि",
    companySnapshot: "कंपनी स्नैपशॉट (विश्लेषण के समय)",
    companyName: "कंपनी का नाम",
    businessType: "व्यवसाय का प्रकार",
    industrySector: "उद्योग / क्षेत्र",
    experience: "अनुभव",
    turnover: "टर्नओवर",
    advisorTitle: "🤖 एआई टेंडर सलाहकार",
    shouldApply: "क्या मुझे आवेदन करना चाहिए?",
    estimateChances: "मेरे अवसरों का अनुमान लगाएं",
    biggestRisks: "सबसे बड़े जोखिम",
    missingDocs: "लापता दस्तावेज",
    winningStrategy: "जीतने की रणनीति",
    explainTender: "इस टेंडर को समझाएं",
    chatPlaceholder: "इस टेंडर से संबंधित कोई भी कस्टम प्रश्न पूछें...",
    send: "भेजें",
    typing: "एआई सलाहकार सोच रहा है...",
  }
};

export default function TenderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferredLanguage, setPreferredLanguage] = useState(() => {
    return localStorage.getItem("preferredLanguage") || "english";
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat log when new messages are added or AI starts thinking
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, aiGenerating]);

  const sendPromptToAI = async (messageText) => {
    // Add user message
    setChatMessages((prev) => [...prev, { sender: 'user', text: messageText }]);
    setAiGenerating(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tender/ai-advisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenderId: id,
          message: messageText,
          preferredLanguage: preferredLanguage,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setChatMessages((prev) => [...prev, { sender: 'ai', text: result.data }]);
      } else {
        setChatMessages((prev) => [...prev, { sender: 'ai', text: result.message || "Unable to generate AI advice right now." }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [...prev, { sender: 'ai', text: "Unable to generate AI advice right now." }]);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleQuickAction = (prompt) => {
    if (aiGenerating) return;
    sendPromptToAI(prompt);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const query = customInput.trim();
    if (!query || aiGenerating) return;
    setCustomInput('');
    sendPromptToAI(query);
  };

  useEffect(() => {
    const fetchTender = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tenders/${encodeURIComponent(id)}`);
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.message || "Failed to load tender");
        }
        const tenderData = result.data;
        setTender(tenderData);

        // If preferredLanguage is not set in localStorage, retrieve it from the user's profile
        if (!localStorage.getItem("preferredLanguage") && tenderData?.userEmail) {
          try {
            const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${encodeURIComponent(tenderData.userEmail)}`);
            const profileResult = await profileRes.json();
            if (profileRes.ok && profileResult.data?.preferredLanguage) {
              const userLang = profileResult.data.preferredLanguage;
              localStorage.setItem("preferredLanguage", userLang);
              setPreferredLanguage(userLang);
            }
          } catch (profileErr) {
            console.error("Error fetching user profile for language setting in TenderDetails:", profileErr);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTender();
  }, [id]);

  const langKey = preferredLanguage.toLowerCase() === "hindi" ? "hindi" : "english";
  const t = translations[langKey];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-100">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400 p-4">
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="ml-4 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded">
          {t.back}
        </button>
      </div>
    );
  }

  if (!tender) return null;

  const { tenderName, summary, fitScore, eligibilityGap = [], requiredDocuments = [], reverseTimeline = [], deadline, companySnapshot } = tender;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pt-12">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 mb-4 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> {t.backToDashboard}
      </button>
      <div className="max-w-3xl mx-auto bg-slate-800 rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4">{tenderName}</h2>
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{t.tenderSummary}</h3>
          <p className="text-gray-300">{summary}</p>
        </section>
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{t.matchScore}</h3>
          <p className="text-green-400 text-3xl font-bold">{fitScore ?? '-'} </p>
        </section>
        {/* Company Snapshot */}
        {companySnapshot && (
          <section className="mb-6 p-4 bg-slate-700 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-indigo-300">{t.companySnapshot}</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {companySnapshot.companyName && <li><strong>{t.companyName}:</strong> {companySnapshot.companyName}</li>}
              {companySnapshot.businessType && <li><strong>{t.businessType}:</strong> {companySnapshot.businessType}</li>}
              {companySnapshot.industryType && <li><strong>{t.industrySector}:</strong> {companySnapshot.industryType}</li>}
              {companySnapshot.experience && <li><strong>{t.experience}:</strong> {companySnapshot.experience}</li>}
              {companySnapshot.turnover && <li><strong>{t.turnover}:</strong> {companySnapshot.turnover}</li>}
            </ul>
          </section>
        )}
        {eligibilityGap.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t.eligibilityGap}</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {eligibilityGap.map((item, i) => (<li key={i}>{item}</li>))}
            </ul>
          </section>
        )}
        {requiredDocuments.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t.requiredDocuments}</h3>
            <ul className="space-y-1">
              {requiredDocuments.map((doc, i) => (
                <li key={i} className="flex items-center text-gray-300">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> {doc}
                </li>
              ))}
            </ul>
          </section>
        )}
        {reverseTimeline.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t.reverseTimeline}</h3>
            <ul className="space-y-3">
              {reverseTimeline.map((step, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <CalendarCheck className="w-5 h-5 mt-1 text-indigo-400" />
                  <div>
                    <p className="font-medium text-gray-200">{step.task}</p>
                    <p className="text-sm text-gray-400">{step.date}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
        {deadline && (
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t.deadline}</h3>
            <p className="text-gray-300">{new Date(deadline).toLocaleDateString()}</p>
          </section>
        )}

        {/* AI Tender Advisor Section */}
        <hr className="border-slate-700 my-8" />

        <section className="mt-8 space-y-6">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 flex items-center gap-2">
            {t.advisorTitle}
          </h3>
          <p className="text-slate-300 text-sm">
            {preferredLanguage.toLowerCase() === 'hindi'
              ? 'हमारे एआई टेंडर सलाहकार से अपने व्यवसाय प्रोफाइल और इस टेंडर के आधार पर सलाह प्राप्त करें।'
              : 'Get instant feedback and preparation advice from our AI Tender Consultant based on your business profile.'}
          </p>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleQuickAction(t.shouldApply)}
              disabled={aiGenerating}
              className="bg-slate-700/60 hover:bg-indigo-600/30 border border-slate-600 hover:border-indigo-500 rounded-xl p-3 text-sm text-left font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 text-slate-200"
            >
              {t.shouldApply}
            </button>
            <button
              onClick={() => handleQuickAction(t.estimateChances)}
              disabled={aiGenerating}
              className="bg-slate-700/60 hover:bg-indigo-600/30 border border-slate-600 hover:border-indigo-500 rounded-xl p-3 text-sm text-left font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 text-slate-200"
            >
              {t.estimateChances}
            </button>
            <button
              onClick={() => handleQuickAction(t.biggestRisks)}
              disabled={aiGenerating}
              className="bg-slate-700/60 hover:bg-indigo-600/30 border border-slate-600 hover:border-indigo-500 rounded-xl p-3 text-sm text-left font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 text-slate-200"
            >
              {t.biggestRisks}
            </button>
            <button
              onClick={() => handleQuickAction(t.missingDocs)}
              disabled={aiGenerating}
              className="bg-slate-700/60 hover:bg-indigo-600/30 border border-slate-600 hover:border-indigo-500 rounded-xl p-3 text-sm text-left font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 text-slate-200"
            >
              {t.missingDocs}
            </button>
            <button
              onClick={() => handleQuickAction(t.winningStrategy)}
              disabled={aiGenerating}
              className="bg-slate-700/60 hover:bg-indigo-600/30 border border-slate-600 hover:border-indigo-500 rounded-xl p-3 text-sm text-left font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 text-slate-200"
            >
              {t.winningStrategy}
            </button>
            <button
              onClick={() => handleQuickAction(t.explainTender)}
              disabled={aiGenerating}
              className="bg-slate-700/60 hover:bg-indigo-600/30 border border-slate-600 hover:border-indigo-500 rounded-xl p-3 text-sm text-left font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 text-slate-200"
            >
              {t.explainTender}
            </button>
          </div>

          {/* Chat Log Window */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 min-h-[250px] max-h-[400px] overflow-y-auto space-y-4 flex flex-col">
            {chatMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm italic py-16 mx-auto">
                {preferredLanguage.toLowerCase() === 'hindi'
                  ? 'परामर्श शुरू करने के लिए एक त्वरित कार्रवाई बटन दबाएं या नीचे एक प्रश्न पूछें।'
                  : 'Click a quick action button or ask a custom question below to start the consultation.'}
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-md whitespace-pre-line leading-relaxed ${msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700/50 rounded-tl-none'
                      }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">
                    {msg.sender === 'user'
                      ? (preferredLanguage.toLowerCase() === 'hindi' ? 'आप' : 'You')
                      : (preferredLanguage.toLowerCase() === 'hindi' ? 'एआई सलाहकार' : 'AI Advisor')}
                  </span>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {aiGenerating && (
              <div className="flex flex-col items-start">
                <div className="bg-slate-800 text-slate-400 border border-slate-700/50 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>{t.typing}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Custom Question Input Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              disabled={aiGenerating}
              placeholder={t.chatPlaceholder}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={aiGenerating || !customInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {t.send}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

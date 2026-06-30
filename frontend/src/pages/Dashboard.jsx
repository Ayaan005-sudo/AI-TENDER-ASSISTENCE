import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Briefcase, Award, TrendingUp, ShieldCheck, Languages, LogOut, FileText, CheckCircle2, ChevronRight, Loader2, Trash2 } from 'lucide-react';

// Simple translation object for English and Hindi labels
const translations = {
  english: {
    companyDetails: "Company Details",
    companyName: "Company / Business Name",
    emailAddress: "Email Address",
    businessType: "Business Type",
    yearsOfExperience: "Years of Experience",
    annualTurnover: "Annual Turnover",
    licensesCertifications: "Licenses & Certifications",
    noLicenses: "No licenses listed",
    updateProfileDetails: "Update Profile Details",
    uploadTender: "Upload Tender",
    mySavedTenders: "My Saved Tenders",
    noTendersSaved: "No tenders saved yet",
    fitScore: "Fit Score",
    deadline: "Deadline",
    logout: "Logout",
    profileComplete: "Profile Setup Complete!",
    profileCompleteDesc: "Thank you for completing the registration. Your business data has been saved, enabling precise matching with state and central government portals.",
    compareBtn: "🤖 Compare with AI",
    comparisonTitle: "🤖 AI Tender Comparison",
    close: "Close",
    errorComparison: "Unable to run comparison right now.",
    comparingTenders: "Comparing selected tenders, please wait...",
  },
  hindi: {
    companyDetails: "कंपनी विवरण",
    companyName: "कंपनी / व्यवसाय का नाम",
    emailAddress: "ईमेल पता",
    businessType: "व्यवसाय का प्रकार",
    yearsOfExperience: "अनुभव के वर्ष",
    annualTurnover: "वार्षिक टर्नओवर",
    licensesCertifications: "लाइसेंस और प्रमाणपत्र",
    noLicenses: "कोई लाइसेंस सूचीबद्ध नहीं है",
    updateProfileDetails: "प्रोफ़ाइल विवरण अपडेट करें",
    uploadTender: "टेंडर अपलोड करें",
    mySavedTenders: "मेरे सहेजे गए टेंडर",
    noTendersSaved: "अभी तक कोई टेंडर सहेजा नहीं गया है",
    fitScore: "फिट स्कोर",
    deadline: "अंतिम तिथि",
    logout: "लॉगआउट",
    profileComplete: "प्रोफ़ाइल सेटअप पूरा हुआ!",
    profileCompleteDesc: "पंजीकरण पूरा करने के लिए धन्यवाद। आपका व्यावसायिक डेटा सहेज लिया गया है, जिससे राज्य और केंद्र सरकार के पोर्टलों के साथ सटीक मिलान सक्षम हो गया है।",
    compareBtn: "🤖 एआई के साथ तुलना करें",
    comparisonTitle: "🤖 एआई टेंडर तुलना",
    close: "बंद करें",
    errorComparison: "अभी तुलना चलाने में असमर्थ।",
    comparingTenders: "चयनित टेंडरों की तुलना की जा रही है, कृपया प्रतीक्षा करें...",
  }
};

// Format raw markdown response to styled plain text JSX elements
const renderFormattedContent = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Process headings
    if (line.startsWith('###') || line.startsWith('####')) {
      const cleanText = line.replace(/^#+\s*/, '');
      return <h4 key={idx} className="text-md font-bold text-indigo-300 mt-4 mb-2">{cleanText}</h4>;
    }
    if (line.startsWith('##')) {
      const cleanText = line.replace(/^#+\s*/, '');
      return <h3 key={idx} className="text-lg font-bold text-indigo-400 mt-5 mb-2 border-b border-slate-700 pb-1">{cleanText}</h3>;
    }
    if (line.startsWith('#')) {
      const cleanText = line.replace(/^#+\s*/, '');
      return <h2 key={idx} className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 mt-6 mb-3">{cleanText}</h2>;
    }
    
    // Process list items
    if (line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('•')) {
      const cleanText = line.replace(/^[\s-*•]+\s*/, '');
      const parts = cleanText.split(/\*\*([^*]+)\*\*/g);
      return (
        <li key={idx} className="list-disc list-inside text-slate-300 text-sm ml-4 mb-1.5 leading-relaxed">
          {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-semibold">{part}</strong> : part)}
        </li>
      );
    }
    
    // Empty line
    if (!line.trim()) {
      return <div key={idx} className="h-2" />;
    }
    
    // Normal paragraphs
    const parts = line.split(/\*\*([^*]+)\*\*/g);
    return (
      <p key={idx} className="text-slate-300 text-sm leading-relaxed mb-2">
        {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-semibold">{part}</strong> : part)}
      </p>
    );
  });
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenders, setTenders] = useState([]);
  const [tendersLoading, setTendersLoading] = useState(true);

  // AI Tender Comparison States
  const [selectedTenderIds, setSelectedTenderIds] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleTenderSelection = (id, event) => {
    event.stopPropagation();
    setSelectedTenderIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleCompareTenders = async () => {
    if (selectedTenderIds.length < 2) return;
    setComparisonLoading(true);
    setComparisonError(null);
    setComparisonResult(null);
    setIsModalOpen(true);

    try {
      const res = await fetch("http://localhost:3000/api/tender/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenderIds: selectedTenderIds
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setComparisonResult(result.data);
      } else {
        setComparisonError(result.message || trans.errorComparison || "Unable to run comparison right now.");
      }
    } catch (err) {
      console.error("Comparison fetch error:", err);
      setComparisonError(trans.errorComparison || "Unable to run comparison right now.");
    } finally {
      setComparisonLoading(false);
    }
  };

  const email = localStorage.getItem('userEmail');

  useEffect(() => {
    if (!email) { return; }
    const fetchTenders = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/tenders/user/${encodeURIComponent(email)}`);
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.message || 'Failed to load tenders');
        }
        setTenders(result.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setTendersLoading(false);
      }
    };
    fetchTenders();
  }, [email]);

  useEffect(() => {
    if (!email) {
      // If no profile setup has occurred, redirect to profile setup
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/users/profile/${encodeURIComponent(email)}`);
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || 'Failed to load profile');
        }

        setProfile(result.data);
        localStorage.setItem('preferredLanguage', result.data.preferredLanguage || 'english');
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error fetching company profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [email, navigate]);

  // Delete tender handler
  const handleDeleteTender = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tender?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/tenders/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to delete tender');
      }
      setTenders((prev) => prev.filter((t) => t._id !== id));
      window.alert('Tender deleted successfully');
    } catch (err) {
      console.error(err);
      window.alert('Error deleting tender');
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  // Determine user's preferred language from the fetched profile data (profile.preferredLanguage)
  const preferredLanguage = profile?.preferredLanguage || 'english';
  const langKey = preferredLanguage.toLowerCase() === 'hindi' ? 'hindi' : 'english';
  const trans = translations[langKey];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 text-sm">Loading your SME Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700/60 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-200">Error Loading Dashboard</h2>
          <p className="text-slate-400 text-sm">{error || "Could not retrieve your profile."}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all"
          >
            Go back to Profile Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans relative overflow-hidden pb-12">

      {/* Background radial glow */}
      <div className="absolute top-[-30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[150px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-10 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/25">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-white tracking-wide text-lg sm:text-xl">AI Tender Assistant</span>
            <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">India SME</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 px-3.5 py-2 rounded-xl hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-800"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{trans.logout}</span>
        </button>
      </nav>

      {/* Main Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Side: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 shadow-xl relative">
            <div className="absolute top-4 right-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-1 rounded-full font-semibold capitalize">
              {profile.preferredLanguage}
            </div>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-indigo-400" />
              {trans.companyDetails}
            </h2>

            <div className="space-y-4">
              {/* Company Name */}
              <div className="border-b border-slate-700/30 pb-3">
                <span className="text-xs text-slate-400 block mb-1">{trans.companyName}</span>
                <span className="text-base font-bold text-slate-200">{profile.companyName}</span>
              </div>

              {/* Email */}
              <div className="border-b border-slate-700/30 pb-3">
                <span className="text-xs text-slate-400 block mb-1">{trans.emailAddress}</span>
                <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {profile.email}
                </span>
              </div>

              {/* Business Type */}
              <div className="border-b border-slate-700/30 pb-3">
                <span className="text-xs text-slate-400 block mb-1">{trans.businessType}</span>
                <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  {profile.businessType}
                </span>
              </div>

              {/* Experience */}
              <div className="border-b border-slate-700/30 pb-3">
                <span className="text-xs text-slate-400 block mb-1">{trans.yearsOfExperience}</span>
                <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-500" />
                  {profile.experience}
                </span>
              </div>

              {/* Turnover */}
              <div className="border-b border-slate-700/30 pb-3">
                <span className="text-xs text-slate-400 block mb-1">{trans.annualTurnover}</span>
                <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                  {profile.turnover}
                </span>
              </div>

              {/* Licenses */}
              <div>
                <span className="text-xs text-slate-400 block mb-1">{trans.licensesCertifications}</span>
                <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  {profile.licenses || trans.noLicenses}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-700 text-indigo-400 font-semibold py-2.5 px-4 rounded-xl border border-slate-700 transition-all text-sm"
            >
              {trans.updateProfileDetails}
            </button>
            <button
              onClick={() => navigate('/tender-upload')}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl"
            >
              {trans.uploadTender}
            </button>
          </div>
        </div>

        {/* Right Side: Active Matches & Features Placeholder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Alert */}
          <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-indigo-300">{trans.profileComplete}</h3>
              <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                {trans.profileCompleteDesc}
              </p>
            </div>
          </div>

          {/* Saved Tenders */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <h3 className="text-xl font-bold text-white">{trans.mySavedTenders}</h3>
              {selectedTenderIds.length >= 2 && (
                <button
                  onClick={handleCompareTenders}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 cursor-pointer"
                >
                  {trans.compareBtn}
                </button>
              )}
            </div>
            {tendersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin w-6 h-6 text-indigo-400" />
              </div>
            ) : tenders.length === 0 ? (
              <p className="text-center text-slate-400">{trans.noTendersSaved}</p>
            ) : (
              <div className="grid gap-4">
                {tenders.map((t, idx) => (
                  <div
                    key={idx}
                    className={`relative border rounded-lg p-4 bg-slate-900 cursor-pointer hover:bg-slate-800 flex items-start gap-4 transition-all duration-200 ${
                      selectedTenderIds.includes(t._id) ? 'border-indigo-500 shadow-md shadow-indigo-500/10' : 'border-slate-600'
                    }`}
                    onClick={() => navigate(`/tender/${t._id}`)}
                  >
                    {/* Checkbox overlay/element */}
                    <div className="flex items-center h-5 mt-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedTenderIds.includes(t._id)}
                        onChange={(e) => handleToggleTenderSelection(t._id, e)}
                        className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                      />
                    </div>

                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white">{t.tenderName}</h4>
                      <p className="text-sm text-gray-300">{trans.fitScore}: {t.fitScore ?? '-'}</p>
                      <p className="text-sm text-gray-300">{trans.deadline}: {t.deadline ? new Date(t.deadline).toLocaleDateString() : '-'}</p>
                    </div>

                    <button
                      className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                      onClick={(e) => { e.stopPropagation(); handleDeleteTender(t._id); }}
                      title="Delete tender"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>

      {/* AI Comparison Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => { setIsModalOpen(false); setSelectedTenderIds([]); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-all font-semibold text-lg cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>
            
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                {trans.comparisonTitle}
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {comparisonLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="animate-spin w-10 h-10 text-indigo-500" />
                  <p className="text-slate-400 text-sm">{trans.comparingTenders}</p>
                </div>
              ) : comparisonError ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm text-center">
                  {comparisonError}
                </div>
              ) : (
                <div className="space-y-4 pr-1">
                  {renderFormattedContent(comparisonResult)}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-700/50 flex justify-end">
              <button
                onClick={() => { setIsModalOpen(false); setSelectedTenderIds([]); }}
                className="bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold py-2.5 px-5 rounded-xl text-sm transition-all cursor-pointer"
              >
                {trans.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Briefcase, Award, TrendingUp, ShieldCheck, Languages, LogOut, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const email = localStorage.getItem('userEmail');

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
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error fetching company profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [email, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/');
  };

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
          <span className="hidden sm:inline">Logout</span>
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
              Company Details
            </h2>

            <div className="space-y-4">
              {/* Company Name */}
              <div className="border-b border-slate-700/30 pb-3">
                <span className="text-xs text-slate-400 block mb-1">Company / Business Name</span>
                <span className="text-base font-bold text-slate-200">{profile.companyName}</span>
              </div>

              {/* Email */}
              <div className="border-b border-slate-700/30 pb-3">
                <span className="text-xs text-slate-400 block mb-1">Email Address</span>
                <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {profile.email}
                </span>
              </div>

              {/* Business Type */}
              <div className="border-b border-slate-700/30 pb-3">
                <span className="text-xs text-slate-400 block mb-1">Business Type</span>
                <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  {profile.businessType}
                </span>
              </div>

              {/* Experience */}
              <div className="border-b border-slate-700/30 pb-3">
                <span className="text-xs text-slate-400 block mb-1">Years of Experience</span>
                <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-500" />
                  {profile.experience}
                </span>
              </div>

              {/* Turnover */}
              <div className="border-b border-slate-700/30 pb-3">
                <span className="text-xs text-slate-400 block mb-1">Annual Turnover</span>
                <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                  {profile.turnover}
                </span>
              </div>

              {/* Licenses */}
              <div>
                <span className="text-xs text-slate-400 block mb-1">Licenses & Certifications</span>
                <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  {profile.licenses || "No licenses listed"}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-700 text-indigo-400 font-semibold py-2.5 px-4 rounded-xl border border-slate-700 transition-all text-sm"
            >
              Update Profile Details
            </button>
            <button
              onClick={() => navigate('/tender-upload')}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl"
            >
              Upload Tender
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
              <h3 className="text-lg font-bold text-indigo-300">Profile Setup Complete!</h3>
              <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                Thank you for completing the registration. Your business data has been saved, enabling precise matching with state and central government portals.
              </p>
            </div>
          </div>

          {/* Tenders Matching Section Placeholder */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Recommended Tenders</h3>
              </div>
              <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-400 border border-slate-700">0 Matches</span>
            </div>

            <div className="text-center py-12 px-4 border border-dashed border-slate-700/50 rounded-xl">
              <div className="w-12 h-12 bg-slate-800 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-300 mb-2">No Matching Tenders Yet</h4>
              <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                We are calibrating our AI matching model for your profile. In the upcoming updates, we will showcase matching tenders from GeM (Government e-Marketplace), CPP Portal, and state departments.
              </p>
              
              <div className="mt-8 flex justify-center">
                <div className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-semibold bg-indigo-500/5 border border-indigo-500/10 px-3.5 py-1.5 rounded-full">
                  <span>Upcoming: Realtime matching alerts</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

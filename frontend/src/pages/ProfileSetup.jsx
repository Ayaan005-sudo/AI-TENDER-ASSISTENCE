import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Briefcase, Award, TrendingUp, ShieldCheck, Languages, CheckCircle2, AlertCircle } from 'lucide-react';

const translations = {
  english: {
    title: "Company Profile Setup",
    subtitle: "Set up your business profile to start matching with matching Government Tenders",
    emailLabel: "Email Address",
    emailPlaceholder: "e.g. contact@shreeshaktienterprises.com",
    companyNameLabel: "Company / Business Name",
    companyNamePlaceholder: "e.g. Shree Shakti Enterprises",
    businessTypeLabel: "Business Type",
    businessTypeSelect: "Select Business Type",
    experienceLabel: "Years of Experience",
    experiencePlaceholder: "e.g. 5 Years",
    turnoverLabel: "Annual Turnover (INR)",
    turnoverSelect: "Select Annual Turnover",
    licensesLabel: "Licenses & Certifications",
    licensesPlaceholder: "e.g. GSTIN, MSME/Udyam, ISO (comma separated)",
    languageLabel: "Preferred Communication Language",
    submitButton: "Save & Setup Profile",
    submittingButton: "Saving Details...",
    toastSuccess: "Profile saved successfully!",
    validationEmail: "Please enter a valid email address",
    validationEmailRequired: "Email is required",
    validationCompanyName: "Company name must be at least 3 characters",
    validationBusinessType: "Please select a business type",
    validationExperience: "Experience is required",
    validationTurnover: "Please select your turnover range",
    existingUserFound: "Existing profile loaded for this email. You can update it below.",
    fetchError: "Could not fetch details. Please fill manually.",
  },
  hindi: {
    title: "कंपनी प्रोफ़ाइल सेटअप",
    subtitle: "प्रासंगिक सरकारी निविदाओं (Tenders) से मिलान शुरू करने के लिए अपना व्यवसाय प्रोफ़ाइल सेट करें",
    emailLabel: "ईमेल पता",
    emailPlaceholder: "उदा. contact@shreeshaktienterprises.com",
    companyNameLabel: "कंपनी / व्यवसाय का नाम",
    companyNamePlaceholder: "उदा. श्री शक्ति एंटरप्राइजेज",
    businessTypeLabel: "व्यवसाय का प्रकार",
    businessTypeSelect: "व्यवसाय का प्रकार चुनें",
    experienceLabel: "अनुभव (वर्षों में)",
    experiencePlaceholder: "उदा. 5 वर्ष",
    turnoverLabel: "वार्षिक टर्नओवर (INR)",
    turnoverSelect: "वार्षिक टर्नओवर चुनें",
    licensesLabel: "लाइसेंस और प्रमाणपत्र",
    licensesPlaceholder: "उदा. GSTIN, MSME/Udyam, ISO (अल्पविराम से अलग करें)",
    languageLabel: "पसंदीदा संचार भाषा",
    submitButton: "सहेजें और प्रोफ़ाइल बनाएं",
    submittingButton: "विवरण सहेजा जा रहा है...",
    toastSuccess: "प्रोफ़ाइल सफलतापूर्वक सहेजी गई!",
    validationEmail: "कृपया एक वैध ईमेल पता दर्ज करें",
    validationEmailRequired: "ईमेल आवश्यक है",
    validationCompanyName: "कंपनी का नाम कम से कम 3 वर्णों का होना चाहिए",
    validationBusinessType: "कृपया व्यवसाय का प्रकार चुनें",
    validationExperience: "अनुभव आवश्यक है",
    validationTurnover: "कृपया अपना टर्नओवर रेंज चुनें",
    existingUserFound: "इस ईमेल के लिए मौजूदा प्रोफ़ाइल मिली। आप इसे नीचे अपडेट कर सकते हैं।",
    fetchError: "विवरण प्राप्त नहीं किया जा सका। कृपया मैन्युअल रूप से भरें।",
  }
};

const businessTypes = [
  { value: "Proprietorship", labelEn: "Sole Proprietorship", labelHi: "एकल स्वामित्व" },
  { value: "Partnership", labelEn: "Partnership Firm", labelHi: "साझेदारी फर्म" },
  { value: "Pvt Ltd", labelEn: "Private Limited Company", labelHi: "प्राइवेट लिमिटेड कंपनी" },
  { value: "Public Ltd", labelEn: "Public Limited Company", labelHi: "पब्लिक लिमिटेड कंपनी" },
  { value: "LLP", labelEn: "Limited Liability Partnership (LLP)", labelHi: "सीमित दायित्व साझेदारी" },
  { value: "MSME/Cooperative", labelEn: "MSME / Cooperative Society", labelHi: "एमएसएमई / सहकारी समिति" }
];

const turnovers = [
  { value: "Under 50 Lakhs", labelEn: "Under ₹50 Lakhs", labelHi: "₹50 लाख से कम" },
  { value: "50 Lakhs - 2 Crores", labelEn: "₹50 Lakhs - ₹2 Crores", labelHi: "₹50 लाख - ₹2 करोड़" },
  { value: "2 Crores - 5 Crores", labelEn: "₹2 Crores - ₹5 Crores", labelHi: "₹2 करोड़ - ₹5 करोड़" },
  { value: "5 Crores - 10 Crores", labelEn: "₹5 Crores - ₹10 Crores", labelHi: "₹5 करोड़ - ₹10 करोड़" },
  { value: "Above 10 Crores", labelEn: "Above ₹10 Crores", labelHi: "₹10 करोड़ से अधिक" }
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [lang, setLang] = useState('english');
  const [submitting, setSubmitting] = useState(false);
  const [apiMessage, setApiMessage] = useState(null);
  const [apiError, setApiError] = useState(null);

  const t = translations[lang];

  // react-hook-form initialization
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      companyName: '',
      businessType: '',
      experience: '',
      turnover: '',
      licenses: '',
      preferredLanguage: 'english'
    }
  });

  const emailValue = watch('email');

  // Watch for preferredLanguage changes to toggle UI language
  const preferredLangWatch = watch('preferredLanguage');
  useEffect(() => {
    if (preferredLangWatch) {
      setLang(preferredLangWatch);
    }
  }, [preferredLangWatch]);

  // Attempt to fetch profile when email is fully typed and loses focus
  const handleEmailBlur = async (e) => {
    const email = e.target.value.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;

    try {
      setApiMessage(null);
      setApiError(null);
      
      const res = await fetch(`http://localhost:3000/api/users/profile/${encodeURIComponent(email)}`);
      const result = await res.json();
      
      if (res.ok && result.success && result.data) {
        const user = result.data;
        // Prefill form fields
        setValue('companyName', user.companyName);
        setValue('businessType', user.businessType);
        setValue('experience', user.experience);
        setValue('turnover', user.turnover);
        setValue('licenses', user.licenses || '');
        setValue('preferredLanguage', user.preferredLanguage || 'english');
        
        setLang(user.preferredLanguage || 'english');
        setApiMessage(t.existingUserFound);
      }
    } catch (err) {
      console.warn("Could not retrieve profile automatically:", err);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setApiMessage(null);
    setApiError(null);

    try {
      const res = await fetch('http://localhost:3000/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      // Store email in localStorage as requested
      localStorage.setItem('userEmail', data.email.toLowerCase());

      // Show success toast and redirect
      setApiMessage(t.toastSuccess);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      console.error(err);
      setApiError(err.message || 'Failed to submit profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 py-12 relative overflow-hidden font-sans">
      
      {/* Background patterns */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl p-6 sm:p-10 transition-all duration-300">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-700/50 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1 text-sm tracking-wide uppercase">
              <Building2 className="w-4 h-4" />
              <span>AI Tender Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
              {t.title}
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-md">
              {t.subtitle}
            </p>
          </div>

          {/* Quick Language Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-center bg-slate-900/60 p-1.5 rounded-lg border border-slate-700/40">
            <Languages className="w-4 h-4 text-slate-400 ml-1.5" />
            <button
              onClick={() => { setValue('preferredLanguage', 'english'); setLang('english'); }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${lang === 'english' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              English
            </button>
            <button
              onClick={() => { setValue('preferredLanguage', 'hindi'); setLang('hindi'); }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${lang === 'hindi' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* Alerts for API responses */}
        {apiMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3 text-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{apiMessage}</span>
          </div>
        )}
        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-3 text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Email Address */}
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              {t.emailLabel} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                onBlur={handleEmailBlur}
                {...register("email", {
                  required: t.validationEmailRequired,
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: t.validationEmail
                  }
                })}
                className={`w-full bg-slate-900 border ${errors.email ? 'border-red-500/80 focus:ring-red-500/20' : 'border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200`}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.email.message}
              </p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              {t.companyNameLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={t.companyNamePlaceholder}
              {...register("companyName", {
                required: t.validationCompanyName,
                minLength: { value: 3, message: t.validationCompanyName }
              })}
              className={`w-full bg-slate-900 border ${errors.companyName ? 'border-red-500/80 focus:ring-red-500/20' : 'border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200`}
            />
            {errors.companyName && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Type */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                {t.businessTypeLabel} <span className="text-red-500">*</span>
              </label>
              <select
                {...register("businessType", { required: t.validationBusinessType })}
                className={`w-full bg-slate-900 border ${errors.businessType ? 'border-red-500/80 focus:ring-red-500/20' : 'border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:ring-4 transition-all duration-200`}
              >
                <option value="" disabled className="text-slate-500">
                  {t.businessTypeSelect}
                </option>
                {businessTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {lang === 'english' ? type.labelEn : type.labelHi}
                  </option>
                ))}
              </select>
              {errors.businessType && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.businessType.message}
                </p>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                {t.experienceLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t.experiencePlaceholder}
                {...register("experience", { required: t.validationExperience })}
                className={`w-full bg-slate-900 border ${errors.experience ? 'border-red-500/80 focus:ring-red-500/20' : 'border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200`}
              />
              {errors.experience && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.experience.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Turnover */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                {t.turnoverLabel} <span className="text-red-500">*</span>
              </label>
              <select
                {...register("turnover", { required: t.validationTurnover })}
                className={`w-full bg-slate-900 border ${errors.turnover ? 'border-red-500/80 focus:ring-red-500/20' : 'border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:ring-4 transition-all duration-200`}
              >
                <option value="" disabled className="text-slate-500">
                  {t.turnoverSelect}
                </option>
                {turnovers.map((to) => (
                  <option key={to.value} value={to.value}>
                    {lang === 'english' ? to.labelEn : to.labelHi}
                  </option>
                ))}
              </select>
              {errors.turnover && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.turnover.message}
                </p>
              )}
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2 flex items-center gap-2">
                <Languages className="w-4 h-4 text-indigo-400" />
                {t.languageLabel}
              </label>
              <select
                {...register("preferredLanguage")}
                className="w-full bg-slate-900 border border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl py-3 px-4 text-slate-100 focus:outline-none focus:ring-4 transition-all duration-200"
              >
                <option value="english">English</option>
                <option value="hindi">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>

          {/* Licenses */}
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              {t.licensesLabel}
            </label>
            <textarea
              rows={2}
              placeholder={t.licensesPlaceholder}
              {...register("licenses")}
              className="w-full bg-slate-900 border border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/35 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all duration-250 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t.submittingButton}
              </>
            ) : (
              t.submitButton
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

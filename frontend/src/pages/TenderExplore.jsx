import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, FileText, CheckCircle2, Languages, ExternalLink, Loader2 } from 'lucide-react';

const tenderTranslations = {
  "TND-001": {
    title: "ईओआई दस्तावेज - रैक सर्वर और सैन स्टोरेज की आपूर्ति, स्थापना और रखरखाव के लिए प्री-बिड पार्टनर का चयन (चेन्नई और मुंबई)",
    industry: "आईटी और सॉफ्टवेयर सेवाएं",
    summary: "एक बैंक के लिए डेटा सेंटर चेन्नई और आपदा रिकवरी साइट मुंबई में रैक सर्वर और सैन स्टोरेज की आपूर्ति, स्थापना और रखरखाव के लिए प्री-बिड पार्टनर का चयन करने के लिए रुचि की अभिव्यक्ति (EOI)।",
    requiredLicenses: ["जीएसटी पंजीकरण", "आईटी हार्डवेयर आपूर्ति अनुभव"]
  },
  "TND-002": {
    title: "उज्जैन में एकीकृत यातायात प्रबंधन प्रणाली (ITMS) के तहत ई-चालान वसूली के लिए एजेंसी की नियुक्ति",
    industry: "आईटी और सॉफ्टवेयर सेवाएं",
    summary: "शहरी प्रशासन और विकास विभाग के तहत उज्जैन शहर में एकीकृत यातायात प्रबंधन प्रणाली (ITMS) के तहत जारी ई-चालान की वसूली के लिए एजेंसी की नियुक्ति।",
    requiredLicenses: ["जीएसटी पंजीकरण", "एमएसएमई पंजीकरण (पसंदीदा)"]
  },
  "TND-003": {
    title: "पूर्वी रेलवे के सियालदह डिवीजन में नादिया और मुर्शिदाबाद जिलों में भूमि योजनाओं का डिजिटलीकरण और प्रमाणन",
    industry: "आईटी और सॉफ्टवेयर सेवाएं",
    summary: "पूर्वी रेलवे के सियालदह डिवीजन के तहत नादिया और मुर्शिदाबाद जिलों में भूमि योजनाओं का डिजिटलीकरण और प्रमाणन। अनुमानित मूल्य 1.58 करोड़ रुपये और ईएमडी 3.16 लाख रुपये।",
    requiredLicenses: ["जीएसटी पंजीकरण", "सर्वेक्षण और जीआईएस प्रमाणन"]
  },
  "TND-004": {
    title: "विभिन्न आईसीटी उपकरणों की आपूर्ति के लिए एजेंसी के चयन हेतु प्रस्ताव का अनुरोध (RFP)",
    industry: "आईटी और सॉफ्टवेयर सेवाएं",
    summary: "भारतीय सूचना प्रौद्योगिकी संस्थान (IIIT), अगरतला, त्रिपुरा में विभिन्न आईसीटी उपकरणों की आपूर्ति के लिए एजेंसी के चयन हेतु प्रस्ताव का अनुरोध (RFP)। 10 लाख रुपये की ईएमडी आवश्यक।",
    requiredLicenses: ["जीएसटी पंजीकरण", "आईटी उपकरण आपूर्ति लाइसेंस", "हार्डवेयर के लिए बीआईएस प्रमाणन"]
  },
  "TND-005": {
    title: "इलेक्ट्रिकल उपकरणों की आपूर्ति और स्थापना और बुनियादी ढांचा कार्य",
    industry: "इलेक्ट्रिकल और इलेक्ट्रॉनिक्स",
    summary: "गुजरात में इलेक्ट्रिकल उपकरणों की आपूर्ति और स्थापना और बुनियादी ढांचे के कार्यों के लिए पश्चिम गुजरात विज कंपनी लिमिटेड (PGVCL) द्वारा निविदा।",
    requiredLicenses: ["जीएसटी पंजीकरण", "इलेक्ट्रिकल ठेकेदार लाइसेंस"]
  },
  "TND-006": {
    title: "रेलवे बुनियादी ढांचे के लिए सिविल और ट्रैक कार्य",
    industry: "रेलवे पार्ट्स और घटक",
    summary: "दक्षिण पश्चिम रेलवे द्वारा कर्नाटक में रेलवे क्षेत्र के तहत सिविल और ट्रैक बुनियादी ढांचे के कार्यों के लिए निविदा।",
    requiredLicenses: ["जीएसटी पंजीकरण", "रेलवे ठेकेदार लाइसेंस", "क्लास ए सिविल वर्क्स लाइसेंस"]
  },
  "TND-007": {
    title: "पूर्वोत्तर रेलवे के तहत सिविल इंजीनियरिंग और निर्माण कार्य",
    industry: "रेलवे पार्ट्स और घटक",
    summary: "उत्तर प्रदेश में गोरखपुर मुख्यालय वाले पूर्वोत्तर रेलवे (NER) क्षेत्र के तहत सिविल इंजीनियरिंग और निर्माण कार्यों के लिए पूर्वोत्तर रेलवे द्वारा निविदा।",
    requiredLicenses: ["जीएसटी पंजीकरण", "रेलवे ठेकेदार पैनलबद्धता", "सिविल वर्क्स लाइसेंस"]
  },
  "TND-008": {
    title: "अचल संपत्ति संपत्ति की नीलामी - साउथ इंडियन बैंक",
    industry: "अन्य",
    summary: "एर्नाकुलम, केरल में साउथ इंडियन बैंक द्वारा अचल संपत्ति की नीलामी। आरक्षित मूल्य लगभग 1.97 करोड़ रुपये और ईएमडी 19.68 लाख रुपये।",
    requiredLicenses: ["वैध केवाईसी दस्तावेज", "ईएमडी भुगतान का प्रमाण"]
  },
  "TND-009": {
    title: "जिला परिषद के तहत निर्माण और विकास कार्य",
    industry: "निर्माण और नागरिक कार्य",
    summary: "जिला परिषद, राजस्थान के तहत सिविल निर्माण और ग्रामीण बुनियादी ढांचा विकास कार्य।",
    requiredLicenses: ["जीएसटी पंजीकरण", "क्लास बी/सी ठेकेदार लाइसेंस"]
  },
  "TND-010": {
    title: "पश्चिम मध्य रेलवे के तहत रेलवे निर्माण और सिविल कार्य",
    industry: "रेलवे पार्ट्स और घटक",
    summary: "जबलपुर, मध्य प्रदेश मुख्यालय वाले पश्चिम मध्य रेलवे के तहत निर्माण और सिविल इंजीनियरिंग कार्य।",
    requiredLicenses: ["जीएसटी पंजीकरण", "रेलवे ठेकेदार पैनलबद्धता"]
  },
  "TND-011": {
    title: "लाइन क्षमता बढ़ाने के लिए 06 आईबीपी का प्रावधान और स्टेशन पर प्लेटफॉर्म नंबर 03 का 100 मीटर विस्तार",
    industry: "रेलवे पार्ट्स और घटक",
    summary: "पूर्वी रेलवे के तहत स्टेशन पर STN-JAJ सेक्शन की लाइन क्षमता बढ़ाने के लिए 06 आईबीपी का प्रावधान, लाइन नंबर 03 के साथ ओआरएल का प्रावधान और हाई लेवल प्लेटफॉर्म नंबर 03 का 100 मीटर विस्तार।",
    requiredLicenses: ["जीएसटी पंजीकरण", "रेलवे सिविल वर्क्स ठेकेदार लाइसेंस"]
  },
  "TND-012": {
    title: "कोंकण रेलवे कॉर्पोरेशन के तहत सिविल और ट्रैक इन्फ्रास्ट्रक्चर कार्य",
    industry: "रेलवे पार्ट्स और घटक",
    summary: "कोंकण रेलवे कॉर्पोरेशन लिमिटेड (KRCL), महाराष्ट्र के तहत सिविल और ट्रैक बुनियादी ढांचा कार्य।",
    requiredLicenses: ["जीएसटी पंजीकरण", "रेलवे ठेकेदार पैनलबद्धता", "आईएसओ 9001 (पसंदीदा)"]
  },
  "TND-013": {
    title: "पूर्वोत्तर सीमांत रेलवे के तहत सिविल और निर्माण कार्य",
    industry: "रेलवे पार्ट्स और घटक",
    summary: "मालीगांव, असम मुख्यालय वाले पूर्वोत्तर सीमांत रेलवे (NFR) के तहत सिविल इंजीनियरिंग और निर्माण कार्य।",
    requiredLicenses: ["जीएसटी पंजीकरण", "रेलवे ठेकेदार पैनलबद्धता"]
  },
  "TND-014": {
    title: "दक्षिण पूर्व मध्य रेलवे के तहत रेलवे बुनियादी ढांचा कार्य",
    industry: "रेलवे पार्ट्स और घटक",
    summary: "बिलासपुर, छत्तीसगढ़ मुख्यालय वाले दक्षिण पूर्व मध्य रेलवे (SECR) के तहत रेलवे बुनियादी ढांचे और सिविल इंजीनियरिंग कार्य।",
    requiredLicenses: ["जीएसटी पंजीकरण", "रेलवे ठेकेदार लाइसेंस"]
  },
  "TND-015": {
    title: "राजकोट डिवीजन के विभिन्न स्टेशनों और एलसी गेट नंबर 203, 241, 258 पर इंटरलॉकिंग कार्य के संबंध में टीआरडी कार्य",
    industry: "रेलवे पार्ट्स और घटक",
    summary: "पश्चिम रेलवे के राजकोट डिवीजन में एलसी गेट 203, 241, 258 और वावानिया, दहिनसरा, बरवाला रोड, भक्ति नगर स्टेशनों पर इंटरलॉकिंग के संबंध में टीआरडी (कर्षण वितरण) कार्य।",
    requiredLicenses: ["जीएसटी पंजीकरण", "रेलवे इलेक्ट्रिकल ठेकेदार लाइसेंस", "टीआरडी वर्क्स प्रमाणन"]
  },
  "TND-016": {
    title: "किसानों को कृषि आदानों और उपकरणों की आपूर्ति और वितरण",
    industry: "अन्य",
    summary: "सरकारी योजना के तहत किसानों को कृषि आदानों और उपकरणों की आपूर्ति और वितरण के लिए कृषि विभाग, राजस्थान द्वारा निविदा।",
    requiredLicenses: ["जीएसटी पंजीकरण", "उर्वरक/कीटनाशक लाइसेंस (यदि लागू हो)", "एमएसएमई पंजीकरण (पसंदीदा)"]
  },
  "TND-017": {
    title: "स्थानीय निकाय निदेशालय के तहत शहरी बुनियादी ढांचा और विकास कार्य",
    industry: "निर्माण और नागरिक कार्य",
    summary: "स्थानीय निकाय निदेशालय, राजस्थान के तहत शहरी बुनियादी ढांचे और स्थानीय निकाय विकास कार्य।",
    requiredLicenses: ["जीएसटी पंजीकरण", "क्लास बी ठेकेदार लाइसेंस"]
  },
  "TND-018": {
    title: "खाद्य नागरिक आपूर्ति और उपभोक्ता मामले विभाग के लिए जनशक्ति आपूर्ति",
    industry: "अन्य",
    summary: "खाद्य, नागरिक आपूर्ति और उपभोक्ता मामले विभाग, राजस्थान के लिए जनशक्ति आपूर्ति अनुबंध। अनुमानित मूल्य 1.44 लाख रुपये।",
    requiredLicenses: ["जीएसटी पंजीकरण", "श्रम लाइसेंस", "पीएफ और ईएसआई पंजीकरण"]
  },
  "TND-019": {
    title: "कृषि उपकरण की खरीद और मंडी बुनियादी ढांचा कार्य",
    industry: "अन्य",
    summary: "कृषि विपणन और निर्यात विभाग, उत्तर प्रदेश के तहत कृषि उपकरणों की खरीद और मंडी (बाजार यार्ड) बुनियादी ढांचे के निर्माण कार्य।",
    requiredLicenses: ["जीएसटी पंजीकरण", "एमएसएमई पंजीकरण (पसंदीदा)"]
  },
  "TND-020": {
    title: "स्कूल फर्नीचर, उपकरण और शैक्षिक सामग्री की आपूर्ति",
    industry: "निर्माण और नागरिक कार्य",
    summary: "सार्वजनिक निर्देश विभाग, कर्नाटक के तहत सरकारी स्कूलों में स्कूल फर्नीचर, उपकरण और शैक्षिक सामग्री की आपूर्ति।",
    requiredLicenses: ["जीएसटी पंजीकरण", "एमएसएमई पंजीकरण (पसंदीदा)", "उपकरणों के लिए बीआईएस प्रमाणन"]
  },
  "TND-021": {
    title: "पुलिस उपकरण, वर्दी और सुरक्षा बुनियादी ढांचे की आपूर्ति",
    industry: "इलेक्ट्रिकल और इलेक्ट्रॉनिक्स",
    summary: "पश्चिम बंगाल पुलिस विभाग को पुलिस उपकरण, वर्दी और सुरक्षा बुनियादी ढांचे की मदों की आपूर्ति।",
    requiredLicenses: ["जीएसटी पंजीकरण", "पुलिस/गृह विभाग द्वारा स्वीकृत विक्रेता"]
  },
  "TND-022": {
    title: "वर्ष 2026-27 के लिए उद्योग विभाग डीएनएच और डीडी के लिए टेक्स रैम्प योजना के तहत कपड़ा विशेषज्ञ की आउटसोर्सिंग",
    industry: "कपड़ा और परिधान",
    summary: "वित्तीय वर्ष 2026-27 के लिए उद्योग विभाग, दादरा और नगर हवेली और दमन और दीव के लिए टेक्स रैम्प योजना के तहत एक कपड़ा विशेषज्ञ की आउटसोर्सिंग।",
    requiredLicenses: ["जीएसटी पंजीकरण", "कपड़ा उद्योग विशेषज्ञता प्रमाण पत्र"]
  },
  "TND-023": {
    title: "भारतीय सेना के लिए स्टोर, उपकरण और बुनियादी ढांचा कार्यों की आपूर्ति",
    industry: "विनिर्माण और इंजीनियरिंग",
    summary: "रक्षा मंत्रालय की खरीद के तहत भारतीय सेना के लिए स्टोर, उपकरण और बुनियादी ढांचा कार्यों की आपूर्ति।",
    requiredLicenses: ["जीएसटी पंजीकरण", "रक्षा विक्रेता पंजीकरण (रक्षा मंत्रालय)", "डीजीक्यूए अनुमोदन (यदि लागू हो)"]
  },
  "TND-024": {
    title: "सरकारी कार्यक्रमों के लिए आतिथ्य सेवाएं, होटल प्रबंधन और प्रोटोकॉल सेवाएं",
    industry: "अन्य",
    summary: "आतिथ्य और प्रोटोकॉल विभाग, जम्मू और कश्मीर के तहत सरकारी कार्यक्रमों के लिए आतिथ्य सेवाएं, होटल प्रबंधन और प्रोटोकॉल सेवाएं प्रदान करना।",
    requiredLicenses: ["जीएसटी पंजीकरण", "एफएसएसएआई लाइसेंस", "होटल/आतिथ्य लाइसेंस"]
  },
  "TND-025": {
    title: "पलसाना, सूरत (सोनगढ़) में बिक्री के लिए व्यक्तिगत घर की नीलामी",
    industry: "अन्य",
    summary: "सरफेसी अधिनियम के तहत बैंक ऑफ बड़ौदा द्वारा पलसाना, सूरत (सोनगढ़) में एक व्यक्तिगत घर की संपत्ति की नीलामी। आरक्षित मूल्य 4.39 लाख रुपये और ईएमडी 43,920 रुपये।",
    requiredLicenses: ["वैध केवाईसी दस्तावेज", "ईएमडी भुगतान का प्रमाण"]
  }
};

const translations = {
  english: {
    title: "Explore Relevant Tenders",
    subtitle: "Discover state and central government tenders hand-picked for your industry",
    backToDashboard: "Back to Dashboard",
    noTendersFound: "No relevant tenders found for your industry right now.",
    closingDate: "Closing Date",
    bidOpening: "Bid Opening",
    requiredDocs: "Required Documents",
    industryLabel: "Industry",
    loading: "Fetching relevant tenders...",
    viewSource: "View Official Source",
  },
  hindi: {
    title: "प्रासंगिक टेंडर खोजें",
    subtitle: "अपने उद्योग के लिए चुने गए राज्य और केंद्र सरकार के टेंडरों की खोज करें",
    backToDashboard: "डैशबोर्ड पर वापस जाएं",
    noTendersFound: "वर्तमान में आपके उद्योग के लिए कोई प्रासंगिक टेंडर नहीं मिला।",
    closingDate: "अंतिम तिथि",
    bidOpening: "बोली खोलने की तिथि",
    requiredDocs: "आवश्यक दस्तावेज़",
    industryLabel: "उद्योग",
    loading: "प्रासंगिक टेंडर लोड हो रहे हैं...",
    viewSource: "आधिकारिक स्रोत देखें",
  }
};

export default function TenderExplore() {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // LocalStorage state values
  const [email] = useState(() => localStorage.getItem("email") || localStorage.getItem("userEmail"));
  const [localUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [industry, setIndustry] = useState(localUser?.industryType || "");
  const [preferredLangWatch, setPreferredLangWatch] = useState(() => {
    return localUser?.preferredLanguage || localStorage.getItem("preferredLanguage") || "english";
  });

  const [lang, setLang] = useState("english");

  // Literal watch effect requested in prompt rules
  useEffect(() => {
    if (preferredLangWatch) {
      setLang(preferredLangWatch);
    }
  }, [preferredLangWatch]);

  // Load industryType from backend profile if missing in localStorage
  useEffect(() => {
    const resolveIndustryAndFetch = async () => {
      let activeIndustry = industry;

      if (!activeIndustry && email) {
        try {
          const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${encodeURIComponent(email)}`);
          const profileResult = await profileRes.json();
          if (profileRes.ok && profileResult.data?.industryType) {
            activeIndustry = profileResult.data.industryType;
            setIndustry(activeIndustry);
            if (profileResult.data.preferredLanguage) {
              setPreferredLangWatch(profileResult.data.preferredLanguage);
            }
          }
        } catch (profileErr) {
          console.error("Failed to load profile for industry fallback:", profileErr);
        }
      }

      if (!activeIndustry) {
        setLoading(false);
        setError("Industry type not found in profile. Please update your profile details.");
        return;
      }

      // Fetch relevant tenders
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tenders/relevant?industryType=${encodeURIComponent(activeIndustry)}`, {
          headers: {
            'industryType': activeIndustry
          }
        });
        const result = await res.json();
        if (res.ok && result.success) {
          setTenders(result.data || []);
        } else {
          setError(result.message || "Failed to fetch relevant tenders");
        }
      } catch (fetchErr) {
        console.error("Fetch relevant tenders error:", fetchErr);
        setError("Network error when loading relevant tenders");
      } finally {
        setLoading(false);
      }
    };

    resolveIndustryAndFetch();
  }, [email, industry]);

  const trans = translations[lang.toLowerCase() === "hindi" || lang.toLowerCase() === "hi" ? "hindi" : "english"];
  const isHindi = lang.toLowerCase() === "hindi" || lang.toLowerCase() === "hi";

  const getTranslatedValue = (tender, fieldName) => {
    const mapped = tenderTranslations[tender.id];
    if (isHindi && mapped) {
      if (fieldName === 'title') return mapped.title || tender.title;
      if (fieldName === 'summary') return mapped.summary || tender.summary;
      if (fieldName === 'industry') return mapped.industry || tender.industry;
      if (fieldName === 'requiredLicenses') return mapped.requiredLicenses || tender.requiredLicenses || [];
    }

    if (fieldName === 'requiredLicenses') return tender.requiredLicenses || [];
    return tender[fieldName];
  };

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
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 px-3.5 py-2 rounded-xl hover:bg-slate-800/50 transition-all border border-slate-700/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{trans.backToDashboard}</span>
        </button>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 mt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-300">
            {trans.title}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {trans.subtitle} {industry && `[${industry}]`}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
            <p className="text-slate-400 text-sm">{trans.loading}</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-6 text-center shadow-xl max-w-md mx-auto">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-2 px-4 rounded-xl text-sm"
            >
              {trans.backToDashboard}
            </button>
          </div>
        ) : tenders.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center shadow-xl">
            <p className="text-slate-400 text-base">{trans.noTendersFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tenders.map((tender) => {
              const closingDate = tender.closingDate ? new Date(tender.closingDate).toLocaleDateString(isHindi ? 'hi-IN' : 'en-US') : 'N/A';
              const bidOpeningDate = tender.bidOpeningDate ? new Date(tender.bidOpeningDate).toLocaleDateString(isHindi ? 'hi-IN' : 'en-US') : 'N/A';

              const title = getTranslatedValue(tender, 'title');
              const summary = getTranslatedValue(tender, 'summary');
              const indVal = getTranslatedValue(tender, 'industry');
              const docs = getTranslatedValue(tender, 'requiredLicenses');

              return (
                <a
                  key={tender.id}
                  href={tender.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl p-6 shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      {/* Top metadata tags */}
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/60 text-slate-400">
                          {tender.id}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          {trans.industryLabel}: {indVal}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors mb-3 leading-snug flex items-start justify-between gap-1">
                        <span>{title}</span>
                      </h3>

                      {/* Summary */}
                      <p className="text-slate-300 text-sm mb-5 leading-relaxed">
                        {summary}
                      </p>
                    </div>

                    <div>
                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl mb-4 text-xs">
                        <div>
                          <span className="text-slate-400 block mb-0.5">{trans.closingDate}</span>
                          <span className="font-semibold text-slate-200 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            {closingDate}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">{trans.bidOpening}</span>
                          <span className="font-semibold text-slate-200 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            {bidOpeningDate}
                          </span>
                        </div>
                      </div>

                      {/* Required Documents */}
                      <div className="border-t border-slate-700/30 pt-3">
                        <span className="text-xs text-slate-400 font-medium block mb-2">{trans.requiredDocs}</span>
                        {docs.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {docs.map((doc, idx) => (
                              <span key={idx} className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md font-medium">
                                {doc}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">None</span>
                        )}
                      </div>

                      {/* Footer Action */}
                      <div className="flex justify-end items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 mt-4 transition-colors">
                        <span className="flex items-center gap-1">
                          {trans.viewSource}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, CheckCircle2, XCircle, Loader2, CalendarCheck } from "lucide-react";

/**
 * TenderUpload – Frontend page for uploading a tender PDF and showing AI analysis.
 *
 * Requirements:
 *  - Dark theme, clean UI.
 *  - Drag‑and‑drop area + fallback file selector.
 *  - On submit, POST a FormData containing:
 *      * email (from localStorage "userEmail")
 *      * preferredLanguage (from localStorage "preferredLanguage")
 *      * the PDF file (field name "file")
 *  - Show a loading spinner while awaiting the AI response.
 *  - Render the analysis result:
 *      * Tender Summary
 *      * Match Score (0‑100) – displayed as a large number.
 *      * Eligibility Gap – bullet list.
 *      * Required Documents – checklist.
 *      * Reverse Timeline – vertical list of tasks with dates.
 *  - All UI text adapts to the user’s preferred language (English/Hindi).
 *  - No backend modifications – only this React component.
 */

const TenderUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preferredLanguage, setPreferredLanguage] = useState("english");
  const [email, setEmail] = useState("");
  const [tenderName, setTenderName] = useState("");

  // Load user details from localStorage on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
    const storedLang = localStorage.getItem('preferredLanguage') || 'english';
    setEmail(storedEmail || '');
    setPreferredLanguage(storedLang);
  }, []);

  /** Helper to translate static UI strings */
  const t = (key) => {
    const en = {
      title: "Tender Analysis",
      dropHere: "Drag & drop PDF here or click to select",
      selectFile: "Select PDF",
      tenderName: "Tender Name",
      upload: "Upload & Analyse",
      loading: "Analyzing tender, please wait...",
      summary: "Tender Summary",
      score: "Match Score",
      eligibility: "Eligibility Gap",
      documents: "Required Documents",
      timeline: "Reverse Timeline",
      back: "Back to Dashboard",
    };
    const hi = {
      title: "टेंडर विश्लेषण",
      dropHere: "PDF फ़ाइल यहाँ ड्रैग और ड्रॉप करें या क्लिक करके चुनें",
      selectFile: "PDF चुनें",
      tenderName: "टेंडर का नाम",
      upload: "अपलोड और विश्लेषण करें",
      loading: "टेंडर का विश्लेषण हो रहा है, कृपया इंतजार करें...",
      summary: "टेंडर सारांश",
      score: "मैच स्कोर",
      eligibility: "पात्रता अंतर",
      documents: "आवश्यक दस्तावेज़",
      timeline: "विपरीत समय‑रेखा",
      back: "डैशबोर्ड पर वापस",
    };
    return preferredLanguage === "hindi" ? hi[key] : en[key];
  };

  // Drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }
    if (!tenderName.trim()) {
      setError("Please enter a tender name.");
      return;
    }
    if (!email) {
      setError("User email not found. Please set up profile first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);
    formData.append("tenderName", tenderName);
    formData.append("preferredLanguage", preferredLanguage);
    // Debug: Log FormData entries
    for (let [key, value] of formData.entries()) {
      console.log("FormData", key, value);
    }

    try {
      const response = await fetch("http://localhost:3000/api/tenders/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze tender");
      }
      setResult(data.data || data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render analysis result if present
  const renderResult = () => {
    if (!result) return null;
    const {
      summary,
      fitScore,
      eligibilityGap = [],
      requiredDocuments = [],
      reverseTimeline = [],
    } = result;
    return (
      <div className="mt-8 space-y-6">
        {/* Summary */}
        <section>
          <h2 className="text-xl font-semibold mb-2">{t("summary")}</h2>
          <p className="text-gray-300">{summary}</p>
        </section>
        {/* Score */}
        <section className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">{t("score")}</h2>
          <div className="text-4xl font-bold text-green-400">{fitScore ?? "-"}</div>
        </section>
        {/* Eligibility Gap */}
        {eligibilityGap.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-2">{t("eligibility")}</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {eligibilityGap.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}
        {/* Required Documents */}
        {requiredDocuments.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-2">{t("documents")}</h2>
            <ul className="space-y-1">
              {requiredDocuments.map((doc, i) => (
                <li key={i} className="flex items-center text-gray-300">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> {doc}
                </li>
              ))}
            </ul>
          </section>
        )}
        {/* Reverse Timeline */}
        {reverseTimeline.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-2">{t("timeline")}</h2>
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
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
        >
          {t("back")}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 pt-12">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-slate-800 p-6 rounded-lg shadow-lg"
        encType="multipart/form-data"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t("tenderName")}</label>
          <input
            type="text"
            className="w-full bg-slate-700 border border-slate-600 p-2 rounded text-white"
            value={tenderName}
            onChange={(e) => setTenderName(e.target.value)}
            required
          />
        </div>
        {/* Drop zone */}
        <div
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-8 mb-4 transition-colors ${
            dragActive ? "border-indigo-400 bg-slate-700" : "border-slate-600"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <UploadCloud className="w-12 h-12 text-indigo-400 mb-3" />
          <p className="text-center text-slate-300">{t("dropHere")}</p>
          <button
            type="button"
            className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded"
          >
            {t("selectFile")}
          </button>
          <input
            id="fileInput"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleChange}
          />
        </div>
        {file && (
          <div className="mb-4 text-sm text-slate-300">
            Selected file: <span className="font-medium text-slate-100">{file.name}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 text-red-500">{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 w-5 h-5" /> {t("loading")}
            </>
          ) : (
            t("upload")
          )}
        </button>
      </form>
      {/* Show analysis result */}
      {renderResult()}
    </div>
  );
};

export default TenderUpload;

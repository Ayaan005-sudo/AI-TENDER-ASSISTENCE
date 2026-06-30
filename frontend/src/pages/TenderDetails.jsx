import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, CalendarCheck } from "lucide-react";

export default function TenderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTender = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/tenders/${encodeURIComponent(id)}`);
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.message || "Failed to load tender");
        }
        setTender(result.data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTender();
  }, [id]);

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
        <button onClick={() => navigate(-1)} className="ml-4 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded">Back</button>
      </div>
    );
  }

  if (!tender) return null;

  const { tenderName, summary, fitScore, eligibilityGap = [], requiredDocuments = [], reverseTimeline = [], deadline } = tender;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pt-12">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 mb-4 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>
      <div className="max-w-3xl mx-auto bg-slate-800 rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4">{tenderName}</h2>
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Summary</h3>
          <p className="text-gray-300">{summary}</p>
        </section>
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Fit Score</h3>
          <p className="text-green-400 text-3xl font-bold">{fitScore ?? '-'} </p>
        </section>
        {eligibilityGap.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Eligibility Gap</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {eligibilityGap.map((item, i) => (<li key={i}>{item}</li>))}
            </ul>
          </section>
        )}
        {requiredDocuments.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Required Documents</h3>
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
            <h3 className="text-xl font-semibold mb-2">Reverse Timeline</h3>
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
            <h3 className="text-xl font-semibold mb-2">Deadline</h3>
            <p className="text-gray-300">{new Date(deadline).toLocaleDateString()}</p>
          </section>
        )}
      </div>
    </div>
  );
}

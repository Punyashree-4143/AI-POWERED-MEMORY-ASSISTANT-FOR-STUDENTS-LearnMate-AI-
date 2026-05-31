import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_URL}/api/notes`;

function SummaryPage() {
  const { id } = useParams();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/${id}`
      );

      setSummary(res.data.summary);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  if (!summary) {
    return (
      <p className="text-center mt-10 text-gray-400">
        Loading summary...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 px-6 py-8">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-center mb-10">
        📄 Summary
      </h1>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* SHORT SUMMARY */}
        <div className="bg-indigo-900 p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold text-indigo-300 mb-3">
            Short Summary
          </h2>

          <p className="text-gray-200 leading-relaxed">
            {summary.short}
          </p>
        </div>

        {/* DETAILED SUMMARY */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-3">
            Detailed Summary
          </h2>

          <p className="text-gray-300 whitespace-pre-line">
            {summary.detailed}
          </p>
        </div>

        {/* KEY POINTS */}
        <div className="bg-green-900 p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold text-green-300 mb-4">
            Key Points
          </h2>

          <ul className="space-y-3">
            {summary.keyPoints?.map((point, i) => (
              <li
                key={i}
                className="bg-gray-800 p-3 rounded-lg shadow-sm flex items-start gap-3"
              >
                <span className="text-green-400 font-bold">•</span>
                <span className="text-gray-200">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SummaryPage;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function SummaryPage() {
  const { id } = useParams();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    const res = await axios.get("http://localhost:5000/api/notes");
    const note = res.data.find((n) => n._id === id);
    setSummary(note?.summary);
  };

  if (!summary) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Summary</h1>

      <h2 className="font-semibold">Short Summary</h2>
      <p className="mb-4">{summary.short}</p>

      <h2 className="font-semibold">Detailed Summary</h2>
      <p className="mb-4">{summary.detailed}</p>

      <h2 className="font-semibold">Key Points</h2>
      <ul className="list-disc ml-6">
        {summary.keyPoints.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
    </div>
  );
}

export default SummaryPage;

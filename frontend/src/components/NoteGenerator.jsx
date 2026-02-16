import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NoteGenerator() {
  // ==============================
  // Persistent State
  // ==============================
  const [text, setText] = useState(() => {
    return localStorage.getItem("noteText") || "";
  });

  const [noteId, setNoteId] = useState(() => {
    return localStorage.getItem("noteId") || null;
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Save text automatically
  useEffect(() => {
    localStorage.setItem("noteText", text);
  }, [text]);

  // Save noteId automatically
  useEffect(() => {
    if (noteId) {
      localStorage.setItem("noteId", noteId);
    }
  }, [noteId]);

  // ==============================
  // Create Note
  // ==============================
  const createNote = async () => {
    if (!text) {
      alert("Enter text or upload PDF first");
      return null;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/notes/create",
        { text }
      );

      setNoteId(res.data._id);
      setLoading(false);

      return res.data._id;
    } catch (error) {
      setLoading(false);
      alert("Error creating note");
      return null;
    }
  };

  // ==============================
  // Upload PDF
  // ==============================
  const uploadPDF = async (file) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/notes/upload-pdf",
        formData
      );

      setText(res.data.note.text);
      setNoteId(res.data.note._id);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert("PDF upload failed");
    }
  };

  // ==============================
  // Summarize → Redirect
  // ==============================
  const handleSummarize = async () => {
    let id = noteId;

    if (!id) {
      id = await createNote();
      if (!id) return;
    }

    try {
      setLoading(true);
      await axios.post(
        `http://localhost:5000/api/notes/summarize/${id}`
      );
      setLoading(false);

      navigate(`/summary/${id}`);
    } catch (error) {
      setLoading(false);
      alert("Summary generation failed");
    }
  };

  // ==============================
  // Flashcards → Redirect
  // ==============================
  const handleFlashcards = async () => {
    let id = noteId;

    if (!id) {
      id = await createNote();
      if (!id) return;
    }

    try {
      setLoading(true);
      await axios.post(
        `http://localhost:5000/api/notes/flashcards/${id}`
      );
      setLoading(false);

      navigate(`/flashcards/${id}`);
    } catch (error) {
      setLoading(false);
      alert("Flashcard generation failed");
    }
  };

  // ==============================
  // Quiz → Redirect
  // ==============================
  const handleQuiz = async () => {
    let id = noteId;

    if (!id) {
      id = await createNote();
      if (!id) return;
    }

    try {
      setLoading(true);
      await axios.post(
        `http://localhost:5000/api/notes/quiz/${id}`
      );
      setLoading(false);

      navigate(`/quiz/${id}`);
    } catch (error) {
      setLoading(false);
      alert("Quiz generation failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-6">

      <h1 className="text-3xl font-bold text-center text-indigo-600">
        AI Learning Assistant
      </h1>

      {/* ==============================
          Text Input
      ============================== */}
      <textarea
        className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        rows="7"
        placeholder="Paste your notes here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* ==============================
          Upload PDF
      ============================== */}
      <div className="flex items-center gap-4">
        <label className="bg-gray-200 px-5 py-2 rounded-xl cursor-pointer hover:bg-gray-300 transition">
          Upload PDF
          <input
            type="file"
            hidden
            accept=".pdf"
            onChange={(e) => uploadPDF(e.target.files[0])}
          />
        </label>

        {loading && (
          <span className="text-indigo-600 font-medium">
            Processing...
          </span>
        )}
      </div>

      {/* ==============================
          Action Buttons
      ============================== */}
      <div className="flex flex-wrap gap-4 justify-center pt-4">

        <button
          onClick={handleSummarize}
          className="bg-indigo-500 text-white px-6 py-2 rounded-xl hover:bg-indigo-600 transition"
        >
          Summarize
        </button>

        <button
          onClick={handleFlashcards}
          className="bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 transition"
        >
          Flashcards
        </button>

        <button
          onClick={handleQuiz}
          className="bg-purple-500 text-white px-6 py-2 rounded-xl hover:bg-purple-600 transition"
        >
          Quiz
        </button>

      </div>

    </div>
  );
}

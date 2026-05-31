import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_URL}/api/notes`;

function NoteViewer() {
  const { id } = useParams();
  const [note, setNote] = useState(null);

  const fetchNote = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/${id}`
      );

      setNote(res.data);
    } catch (error) {
      console.error("Failed to fetch note:", error);
    }
  };

  useEffect(() => {
    fetchNote();
  }, []);

  const generateSummary = async () => {
    try {
      await axios.post(
        `${API_URL}/summarize/${id}`
      );

      fetchNote();
    } catch (error) {
      console.error("Summary generation failed:", error);
    }
  };

  const generateFlashcards = async () => {
    try {
      await axios.post(
        `${API_URL}/flashcards/${id}`
      );

      fetchNote();
    } catch (error) {
      console.error("Flashcard generation failed:", error);
    }
  };

  const generateQuiz = async () => {
    try {
      await axios.post(
        `${API_URL}/quiz/${id}`
      );

      fetchNote();
    } catch (error) {
      console.error("Quiz generation failed:", error);
    }
  };

  if (!note) return <div>Loading...</div>;

  return (
    <div style={{ padding: "30px" }}>
      <h2>Note Viewer</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={generateSummary}>
          Summarize
        </button>

        <button onClick={generateFlashcards}>
          Create Flashcards
        </button>

        <button onClick={generateQuiz}>
          Create Quiz
        </button>
      </div>

      <h3>Original Text</h3>
      <p>{note.text?.slice(0, 1000)}...</p>

      {note.summary?.short && (
        <>
          <h3>Short Summary</h3>
          <p>{note.summary.short}</p>
        </>
      )}

      {note.flashcards?.length > 0 && (
        <>
          <h3>Flashcards</h3>

          {note.flashcards.map((card, index) => (
            <div key={index}>
              <strong>Q:</strong> {card.question}
              <br />
              <strong>A:</strong> {card.answer}
              <hr />
            </div>
          ))}
        </>
      )}

      {note.quiz?.length > 0 && (
        <>
          <h3>Quiz</h3>

          {note.quiz.map((q, index) => (
            <div key={index}>
              <strong>{q.question}</strong>

              {q.options.map((opt, i) => (
                <div key={i}>{opt}</div>
              ))}

              <hr />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default NoteViewer;
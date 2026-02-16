import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function NoteViewer() {
  const { id } = useParams();
  const [note, setNote] = useState(null);

  const fetchNote = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/notes/${id}`
    );
    setNote(res.data);
  };

  useEffect(() => {
    fetchNote();
  }, []);

  const generateSummary = async () => {
    await axios.post(
      `http://localhost:5000/api/notes/summarize/${id}`
    );
    fetchNote();
  };

  const generateFlashcards = async () => {
    await axios.post(
      `http://localhost:5000/api/notes/flashcards/${id}`
    );
    fetchNote();
  };

  const generateQuiz = async () => {
    await axios.post(
      `http://localhost:5000/api/notes/quiz/${id}`
    );
    fetchNote();
  };

  if (!note) return <div>Loading...</div>;

  return (
    <div style={{ padding: "30px" }}>
      <h2>Note Viewer</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={generateSummary}>Summarize</button>
        <button onClick={generateFlashcards}>Create Flashcards</button>
        <button onClick={generateQuiz}>Create Quiz</button>
      </div>

      <h3>Original Text</h3>
      <p>{note.text.slice(0, 1000)}...</p>

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

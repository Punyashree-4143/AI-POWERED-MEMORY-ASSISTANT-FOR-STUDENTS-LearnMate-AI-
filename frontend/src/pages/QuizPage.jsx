import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState([]);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({});

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    const res = await axios.get("http://localhost:5000/api/notes");
    const note = res.data.find((n) => n._id === id);
    setQuiz(note?.quiz || []);
  };

  const handleAnswer = (qIndex, optionIndex) => {
    if (answered[qIndex]) return;

    if (quiz[qIndex].correctAnswerIndex === optionIndex) {
      setScore((prev) => prev + quiz[qIndex].marks);
    }

    setAnswered({ ...answered, [qIndex]: true });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Quiz</h1>
      <p className="mb-6 font-semibold">Score: {score}</p>

      {quiz.map((q, qIndex) => (
        <div key={qIndex} className="bg-white p-5 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-3">{q.question}</h2>

          {q.options.map((opt, optIndex) => (
            <button
              key={optIndex}
              onClick={() => handleAnswer(qIndex, optIndex)}
              className="block w-full text-left p-2 border rounded mb-2 hover:bg-indigo-100"
            >
              {opt}
            </button>
          ))}

          {answered[qIndex] && (
            <p className="mt-3 text-green-600">{q.explanation}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default QuizPage;

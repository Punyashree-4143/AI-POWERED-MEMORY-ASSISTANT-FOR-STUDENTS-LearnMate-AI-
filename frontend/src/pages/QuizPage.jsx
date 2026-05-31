import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_URL}/api/notes`;

function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState([]);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({});
  const [selected, setSelected] = useState({});

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/${id}`
      );

      setQuiz(res.data.quiz || []);
    } catch (err) {
      console.error("Failed to fetch quiz:", err);
    }
  };

  const handleAnswer = (qIndex, optIndex) => {
    if (answered[qIndex]) return;

    setSelected((prev) => ({
      ...prev,
      [qIndex]: optIndex,
    }));

    if (quiz[qIndex].correctAnswerIndex === optIndex) {
      setScore((prev) => prev + (quiz[qIndex].marks || 1));
    }

    setAnswered((prev) => ({
      ...prev,
      [qIndex]: true,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 px-6 py-8">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">🧠 Quiz</h1>

        <div className="bg-indigo-600 px-4 py-2 rounded-lg shadow">
          Score: {score}
        </div>
      </div>

      {/* EMPTY */}
      {quiz.length === 0 && (
        <p className="text-center text-gray-400">
          No quiz available.
        </p>
      )}

      {/* QUESTIONS */}
      <div className="max-w-4xl mx-auto space-y-6">
        {quiz.map((q, qIndex) => (
          <div
            key={qIndex}
            className="bg-gray-800 p-6 rounded-2xl shadow-lg"
          >
            {/* QUESTION */}
            <h2 className="font-semibold text-lg mb-4">
              {qIndex + 1}. {q.question}
            </h2>

            {/* OPTIONS */}
            <div className="space-y-3">
              {q.options.map((opt, optIndex) => {
                const isCorrect =
                  q.correctAnswerIndex === optIndex;

                const isSelected =
                  selected[qIndex] === optIndex;

                let baseStyle =
                  "w-full text-left p-3 rounded-lg border transition";

                let stateStyle = "";

                if (answered[qIndex]) {
                  if (isCorrect) {
                    stateStyle =
                      "bg-green-600 border-green-400 text-white";
                  } else if (isSelected) {
                    stateStyle =
                      "bg-red-600 border-red-400 text-white";
                  } else {
                    stateStyle = "opacity-50";
                  }
                } else {
                  stateStyle =
                    "bg-gray-700 border-gray-600 hover:bg-indigo-600";
                }

                return (
                  <button
                    key={optIndex}
                    onClick={() =>
                      handleAnswer(qIndex, optIndex)
                    }
                    disabled={answered[qIndex]}
                    className={`${baseStyle} ${stateStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* EXPLANATION */}
            {answered[qIndex] && q.explanation && (
              <div className="mt-4 p-3 bg-gray-700 rounded-lg text-sm text-gray-300">
                💡 {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizPage;
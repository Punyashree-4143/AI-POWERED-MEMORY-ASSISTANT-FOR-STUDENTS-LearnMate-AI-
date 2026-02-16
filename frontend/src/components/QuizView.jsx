import { useState } from "react";

export default function QuizView({ quiz }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIndex, optionIndex) => {
    setAnswers({ ...answers, [qIndex]: optionIndex });
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach((q, index) => {
      if (answers[index] === q.correctAnswerIndex) {
        score += q.marks;
      }
    });
    return score;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quiz</h2>

      {quiz.map((q, index) => (
        <div key={index} className="mb-6 p-4 bg-purple-50 rounded-lg">
          <p className="font-medium mb-2">
            {index + 1}. {q.question}
          </p>

          {q.options.map((opt, i) => (
            <label key={i} className="block">
              <input
                type="radio"
                name={`q-${index}`}
                onChange={() => handleSelect(index, i)}
              />
              <span className="ml-2">{opt}</span>
            </label>
          ))}

          {submitted && (
            <p className="mt-2 text-sm text-gray-600">
              {answers[index] === q.correctAnswerIndex
                ? "Correct!"
                : `Wrong. ${q.explanation}`}
            </p>
          )}
        </div>
      ))}

      {!submitted && (
        <button
          onClick={() => setSubmitted(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg"
        >
          Submit Quiz
        </button>
      )}

      {submitted && (
        <p className="mt-4 font-bold">
          Your Score: {calculateScore()} /{" "}
          {quiz.reduce((a, b) => a + b.marks, 0)}
        </p>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function FlashcardsPage() {
  const { id } = useParams();
  const [flashcards, setFlashcards] = useState([]);
  const [flippedIndex, setFlippedIndex] = useState(null);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/notes/${id}`
      );

      setFlashcards(res.data.flashcards || []);
    } catch (err) {
      console.error("Failed to fetch flashcards:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 px-6 py-10">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-center mb-10">
        📚 Flashcards
      </h1>

      {/* EMPTY STATE */}
      {flashcards.length === 0 && (
        <p className="text-center text-gray-400">
          No flashcards available.
        </p>
      )}

      {/* GRID */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {flashcards.map((card, index) => {
          const isFlipped = flippedIndex === index;

          return (
            <div
              key={index}
              onClick={() =>
                setFlippedIndex(isFlipped ? null : index)
              }
              className="cursor-pointer"
            >
              <div
                className={`h-56 rounded-2xl shadow-lg p-6 flex flex-col justify-center items-center text-center transition-all duration-300 transform ${
                  isFlipped
                    ? "bg-gradient-to-br from-green-600 to-emerald-700 text-white scale-105 shadow-xl"
                    : "bg-gray-800 text-gray-200 hover:scale-105 hover:shadow-xl"
                }`}
              >
                {/* LABEL */}
                <span className="text-xs mb-3 uppercase tracking-wide opacity-70">
                  {isFlipped ? "Answer" : "Question"}
                </span>

                {/* CONTENT */}
                <p
                  className={`text-lg ${
                    isFlipped
                      ? "font-medium"
                      : "font-semibold text-indigo-400"
                  }`}
                >
                  {isFlipped ? card.answer : card.question}
                </p>

                {/* HINT */}
                <span className="mt-4 text-xs opacity-70">
                  Click to {isFlipped ? "show question" : "reveal answer"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FlashcardsPage;
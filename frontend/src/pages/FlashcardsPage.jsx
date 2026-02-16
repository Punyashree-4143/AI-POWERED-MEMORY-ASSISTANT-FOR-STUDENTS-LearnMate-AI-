import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function FlashcardsPage() {
  const { id } = useParams();
  const [flashcards, setFlashcards] = useState([]);
  const [flippedIndex, setFlippedIndex] = useState(null);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    const res = await axios.get(`http://localhost:5000/api/notes`);
    const note = res.data.find((n) => n._id === id);
    setFlashcards(note?.flashcards || []);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Flashcards</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {flashcards.map((card, index) => (
          <div
            key={index}
            onClick={() =>
              setFlippedIndex(flippedIndex === index ? null : index)
            }
            className="cursor-pointer bg-white rounded-xl shadow-lg p-6 h-48 flex items-center justify-center text-center hover:shadow-xl transition duration-300"
          >
            {flippedIndex === index ? (
              <p className="text-lg font-medium text-green-600">
                {card.answer}
              </p>
            ) : (
              <p className="text-lg font-semibold text-indigo-600">
                {card.question}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FlashcardsPage;

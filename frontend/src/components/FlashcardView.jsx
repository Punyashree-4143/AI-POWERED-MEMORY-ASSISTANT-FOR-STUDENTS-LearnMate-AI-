import { useState } from "react";

export default function FlashcardView({ cards }) {
  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Flashcards
      </h2>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card, index) => (
          <Flashcard key={index} card={card} />
        ))}
      </div>
    </div>
  );
}

function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="cursor-pointer"
    >
      <div className="relative w-full h-56">
        
        {/* FRONT */}
        <div
          className={`absolute inset-0 transition-all duration-500 rounded-2xl shadow-xl p-6 flex flex-col justify-center items-center text-center 
          bg-gradient-to-br from-indigo-500 to-blue-600 text-white
          ${flipped ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
        >
          <p className="text-lg font-semibold">{card.question}</p>
          <span className="mt-4 text-sm opacity-80">
            Tap to reveal
          </span>
        </div>

        {/* BACK */}
        <div
          className={`absolute inset-0 transition-all duration-500 rounded-2xl shadow-xl p-6 flex items-center justify-center text-center 
          bg-gradient-to-br from-green-400 to-emerald-600 text-white
          ${flipped ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <p className="text-lg font-medium">{card.answer}</p>
        </div>
      </div>
    </div>
  );
}
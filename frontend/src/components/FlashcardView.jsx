import { useState } from "react";

export default function FlashcardView({ cards }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Flashcards</h2>
      <div className="grid md:grid-cols-2 gap-6">
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
      className="cursor-pointer perspective"
    >
      <div
        className={`relative w-full h-48 transition-transform duration-500 transform ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        <div className="absolute w-full h-full bg-white shadow-lg rounded-xl p-4 backface-hidden flex items-center justify-center text-center font-medium">
          {card.question}
        </div>

        <div className="absolute w-full h-full bg-green-100 shadow-lg rounded-xl p-4 backface-hidden rotate-y-180 flex items-center justify-center text-center">
          {card.answer}
        </div>
      </div>
    </div>
  );
}

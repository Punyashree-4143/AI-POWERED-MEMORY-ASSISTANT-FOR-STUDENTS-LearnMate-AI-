import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import NoteGenerator from "./components/NoteGenerator";
import SummaryPage from "./pages/SummaryPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import QuizPage from "./pages/QuizPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
        <Routes>
          <Route path="/" element={<NoteGenerator />} />
          <Route path="/summary/:id" element={<SummaryPage />} />
          <Route path="/flashcards/:id" element={<FlashcardsPage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AppShell from "./components/AppShell";
import NoteGenerator from "./components/NoteGenerator";
import SummaryPage from "./pages/SummaryPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import QuizPage from "./pages/QuizPage";
import FeaturePage from "./pages/FeaturePage";
import MindMapPage from "./pages/MindMapPage";
import InfographicsPage from "./pages/InfographicsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<NoteGenerator />} />
          <Route path="/dashboard" element={<NoteGenerator />} />
          <Route path="/summary/:id" element={<SummaryPage />} />
          <Route path="/flashcards/:id" element={<FlashcardsPage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route
            path="/workspace/summaries"
            element={<FeaturePage type="summaries" />}
          />
          <Route
            path="/workspace/flashcards"
            element={<FeaturePage type="flashcards" />}
          />
          <Route
            path="/workspace/quizzes"
            element={<FeaturePage type="quizzes" />}
          />
          <Route
            path="/workspace/mind-maps"
            element={<MindMapPage />}
          />
          <Route
            path="/workspace/infographics"
            element={<InfographicsPage />}
          
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

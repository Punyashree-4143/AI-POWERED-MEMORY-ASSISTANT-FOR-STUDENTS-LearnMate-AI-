const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* =====================================================
   🔐 Safe AI Request Wrapper
===================================================== */
async function safeAIRequest(prompt, temperature = 0.5) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature,
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("Groq API Error:", err.message);
    throw new Error("AI request failed");
  }
}

/* =====================================================
   🧠 Robust JSON Extractor (Balanced Parsing)
===================================================== */
function extractJSON(text) {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("AI response is not a valid string");
    }

    text = text.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(text);
    } catch {}

    const firstBrace = text.indexOf("{");
    const firstBracket = text.indexOf("[");

    let start =
      firstBrace === -1
        ? firstBracket
        : firstBracket === -1
        ? firstBrace
        : Math.min(firstBrace, firstBracket);

    if (start === -1) throw new Error("No JSON start found");

    let stack = [];
    let end = -1;

    for (let i = start; i < text.length; i++) {
      if (text[i] === "{" || text[i] === "[") stack.push(text[i]);
      if (text[i] === "}" || text[i] === "]") stack.pop();

      if (stack.length === 0) {
        end = i + 1;
        break;
      }
    }

    if (end === -1) throw new Error("Could not determine JSON boundary");

    const jsonString = text.slice(start, end);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON Parse Error:", err.message);
    throw new Error("Invalid AI JSON response");
  }
}

/* =====================================================
   📏 Enforce 5-Line Summary
===================================================== */
function enforceFiveLines(text) {
  if (!text || typeof text !== "string") return "";

  const lines = text
    .split(". ")
    .filter(Boolean)
    .slice(0, 5);

  return lines.join(". ") + ".";
}

/* =====================================================
   🗺 Validate Concept Map
===================================================== */
function validateConceptMap(map) {
  if (!Array.isArray(map)) return [];

  return map
    .filter(item => item.concept && Array.isArray(item.relatedTo))
    .map(item => ({
      concept: String(item.concept).trim(),
      relatedTo: item.relatedTo
        .filter(r => typeof r === "string" && r.length > 2)
        .slice(0, 6),
    }));
}

/* =====================================================
   📚 Normalize Flashcards
===================================================== */
function normalizeFlashcards(cards) {
  if (!Array.isArray(cards)) return [];

  return cards.slice(0, 6).map(card => ({
    question: card.question || "Question missing",
    answer: card.answer || "Answer not available",
    type: ["definition", "concept", "process"].includes(card.type)
      ? card.type
      : "concept",
    difficulty: ["easy", "medium", "hard"].includes(card.difficulty)
      ? card.difficulty
      : "medium",
  }));
}

/* =====================================================
   📝 Normalize Quiz + Explanation Enforcement
===================================================== */
function normalizeQuiz(quiz) {
  if (!Array.isArray(quiz)) return [];

  return quiz.slice(0, 5).map(q => ({
    question: q.question || "Question missing",
    options: Array.isArray(q.options) && q.options.length >= 4
      ? q.options.slice(0, 4)
      : ["Option A", "Option B", "Option C", "Option D"],
    correctAnswerIndex:
      typeof q.correctAnswerIndex === "number" &&
      q.correctAnswerIndex >= 0 &&
      q.correctAnswerIndex <= 3
        ? q.correctAnswerIndex
        : 0,
    explanation:
      q.explanation && q.explanation.split(" ").length >= 20
        ? q.explanation
        : "This answer is correct because it aligns with the core principles and context explained in the provided study material, reflecting the intended concept accurately.",
    difficulty: ["easy", "medium", "hard"].includes(q.difficulty)
      ? q.difficulty
      : "medium",
    marks: typeof q.marks === "number" ? q.marks : 1,
  }));
}

/* =====================================================
   📘 Generate Summary
===================================================== */
async function generateSummary(text) {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid note text");
    }

    const prompt = `
Generate structured academic summary in strict JSON format:

{
  "short": "Exactly 5 sentence summary",
  "detailed": "Detailed academic paragraph",
  "keyPoints": ["5 concise bullet points"],
  "conceptMap": [
    {
      "concept": "Main Concept",
      "relatedTo": ["Related 1", "Related 2"]
    }
  ]
}

Text:
${text.slice(0, 6000)}
`;

    const aiText = await safeAIRequest(prompt, 0.4);
    let summary = extractJSON(aiText);

    summary.short = enforceFiveLines(summary.short);
    summary.conceptMap = validateConceptMap(summary.conceptMap);

    return summary;
  } catch (err) {
    console.error("Summary Error:", err.message);
    throw new Error("Summary generation failed");
  }
}

/* =====================================================
   📚 Generate Flashcards
===================================================== */
async function generateFlashcards(text) {
  try {
    const prompt = `
Generate 6 categorized flashcards in strict JSON array format:

[
  {
    "question": "...",
    "answer": "...",
    "type": "definition | concept | process",
    "difficulty": "easy | medium | hard"
  }
]

Text:
${text.slice(0, 6000)}
`;

    const aiText = await safeAIRequest(prompt);
    let flashcards = extractJSON(aiText);

    return normalizeFlashcards(flashcards);
  } catch (err) {
    console.error("Flashcard Error:", err.message);
    throw new Error("Flashcard generation failed");
  }
}

/* =====================================================
   📝 Generate Quiz
===================================================== */
async function generateQuiz(text) {
  try {
    const prompt = `
Generate 5 MCQs in strict JSON array format:

[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswerIndex": 0,
    "explanation": "Minimum 20 words explanation",
    "difficulty": "easy | medium | hard",
    "marks": 1
  }
]

Text:
${text.slice(0, 6000)}
`;

    const aiText = await safeAIRequest(prompt);
    let quiz = extractJSON(aiText);

    return normalizeQuiz(quiz);
  } catch (err) {
    console.error("Quiz Error:", err.message);
    throw new Error("Quiz generation failed");
  }
}

/* =====================================================
   🚀 Exports
===================================================== */
module.exports = {
  generateSummary,
  generateFlashcards,
  generateQuiz,
};

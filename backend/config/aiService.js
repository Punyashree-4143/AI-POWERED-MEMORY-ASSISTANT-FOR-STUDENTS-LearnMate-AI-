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

function splitTextIntoChunks(text, maxLength = 3500) {
  const paragraphs = String(text || "").split(/\n{2,}/);
  const chunks = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const candidate = currentChunk
      ? `${currentChunk}\n\n${paragraph}`
      : paragraph;

    if (candidate.length <= maxLength) {
      currentChunk = candidate;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    if (paragraph.length <= maxLength) {
      currentChunk = paragraph;
      continue;
    }

    for (let index = 0; index < paragraph.length; index += maxLength) {
      chunks.push(paragraph.slice(index, index + maxLength));
    }

    currentChunk = "";
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/* =====================================================
   Clean OCR Text For Display
===================================================== */
async function correctOcrTextForDisplay(text) {
  try {
    if (!text || typeof text !== "string") {
      return text || "";
    }

    const chunks = splitTextIntoChunks(text);
    const correctedChunks = [];

    for (const chunk of chunks) {
      const prompt = `
You are correcting OCR text from handwritten academic notes.

Task:
- Convert distorted OCR into readable English.
- Fix broken words, punctuation, spacing, and obvious OCR mistakes.
- Preserve technical terms, abbreviations, formulas, headings, bullet points, and examples.
- Do NOT summarize.
- Do NOT add new concepts.
- Do NOT remove meaningful content.
- Keep the same study-note style and approximate order.
- Return only the corrected text. No markdown fence. No explanation.

Examples:
OCR: "WhcJ-t rs .fTOfJmen-+atfon"
Corrected: "What is fragmentation?"

OCR text:
${chunk}
`;

      const corrected = await safeAIRequest(prompt, 0.1);
      correctedChunks.push(corrected.trim());
    }

    return correctedChunks.join("\n\n").trim();
  } catch (err) {
    console.error("OCR Correction Error:", err.message);
    return text;
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
function slugifyId(value, fallback) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  return slug || fallback;
}

function normalizeMindMap(map) {
  const nodes = Array.isArray(map?.nodes) ? map.nodes : [];
  const normalizedNodes = nodes.slice(0, 18).map((node, index) => {
    const label = String(node.label || node.concept || `Concept ${index + 1}`)
      .trim()
      .slice(0, 80);
    const id = slugifyId(node.id || label, `node-${index + 1}`);
    const parentId =
      index === 0
        ? null
        : node.parentId
        ? slugifyId(node.parentId, null)
        : slugifyId(nodes[0]?.id || nodes[0]?.label || "root", "root");

    return {
      id,
      label,
      parentId,
      description: String(node.description || "").trim().slice(0, 220),
      type: ["root", "topic", "subtopic", "detail"].includes(node.type)
        ? node.type
        : index === 0
        ? "root"
        : "topic",
    };
  });

  if (normalizedNodes.length > 0) {
    normalizedNodes[0].parentId = null;
    normalizedNodes[0].type = "root";
  }

  return {
    title: String(map?.title || normalizedNodes[0]?.label || "Mind Map").trim(),
    nodes: normalizedNodes,
  };
}

function normalizeInfographic(infographic) {
  const validAccents = ["purple", "cyan", "emerald", "amber", "pink"];
  const validTypes = [
    "definition",
    "formula",
    "process",
    "comparison",
    "example",
  ];
  const cards = Array.isArray(infographic?.cards) ? infographic.cards : [];
  const flow = Array.isArray(infographic?.flow) ? infographic.flow : [];

  return {
    title: String(infographic?.title || "Visual Study Guide").trim(),
    cards: cards.slice(0, 8).map((card, index) => ({
      title: String(card.title || `Key Idea ${index + 1}`).trim().slice(0, 80),
      content: String(card.content || "").trim().slice(0, 360),
      type: validTypes.includes(card.type) ? card.type : "definition",
      accent: validAccents.includes(card.accent)
        ? card.accent
        : validAccents[index % validAccents.length],
    })),
    flow: flow.slice(0, 6).map((step, index) => ({
      title: String(step.title || `Step ${index + 1}`).trim().slice(0, 80),
      description: String(step.description || "").trim().slice(0, 280),
    })),
  };
}

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
async function generateMindMap(text) {
  try {
    const prompt = `
Create an educational concept tree from these notes in strict JSON format.

Rules:
- Use 1 root concept.
- Use 6 to 14 total nodes.
- parentId must refer to another node id.
- Prefer technical terms from the notes.
- Do not include markdown or explanations outside JSON.

{
  "title": "Main topic",
  "nodes": [
    {
      "id": "operating-system",
      "label": "Operating System",
      "parentId": null,
      "description": "Central topic",
      "type": "root"
    },
    {
      "id": "memory-management",
      "label": "Memory Management",
      "parentId": "operating-system",
      "description": "Handles allocation and deallocation of memory",
      "type": "topic"
    }
  ]
}

Notes:
${text.slice(0, 6000)}
`;

    const aiText = await safeAIRequest(prompt, 0.25);
    return normalizeMindMap(extractJSON(aiText));
  } catch (err) {
    console.error("Mind Map Error:", err.message);
    throw new Error("Mind map generation failed");
  }
}

async function generateInfographic(text) {
  try {
    const prompt = `
Convert these notes into infographic-ready study content in strict JSON format.

Rules:
- Extract key definitions, formulas, examples, comparisons, and processes.
- Use concise educational language.
- Preserve technical terms.
- Create visual-card content, not a long essay.
- Do not include markdown or explanations outside JSON.

{
  "title": "Visual Study Guide",
  "cards": [
    {
      "title": "Key Definition",
      "content": "Concise explanation",
      "type": "definition",
      "accent": "purple"
    }
  ],
  "flow": [
    {
      "title": "Step 1",
      "description": "What happens first"
    }
  ]
}

Allowed card types: definition, formula, process, comparison, example.
Allowed accents: purple, cyan, emerald, amber, pink.

Notes:
${text.slice(0, 6000)}
`;

    const aiText = await safeAIRequest(prompt, 0.25);
    return normalizeInfographic(extractJSON(aiText));
  } catch (err) {
    console.error("Infographic Error:", err.message);
    throw new Error("Infographic generation failed");
  }
}

module.exports = {
  correctOcrTextForDisplay,
  generateMindMap,
  generateInfographic,
  generateSummary,
  generateFlashcards,
  generateQuiz,
};

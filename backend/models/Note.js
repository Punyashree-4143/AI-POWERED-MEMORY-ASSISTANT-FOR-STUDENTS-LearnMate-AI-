const mongoose = require("mongoose");

// =============================
// Flashcard Schema
// =============================
const flashcardSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["definition", "concept", "process"],
      default: "concept",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  { _id: false }
);

// =============================
// Quiz Schema (UPGRADED)
// =============================
const quizSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length >= 2;
        },
        message: "Quiz must have at least 2 options",
      },
    },
    correctAnswerIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    explanation: {
      type: String,
      default: "",
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    marks: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

// =============================
// Concept Map Schema
// =============================
const conceptMapSchema = new mongoose.Schema(
  {
    concept: {
      type: String,
      required: true,
      trim: true,
    },
    relatedTo: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

// =============================
// Summary Schema
// =============================
const summarySchema = new mongoose.Schema(
  {
    short: {
      type: String,
      default: "",
      trim: true,
    },
    detailed: {
      type: String,
      default: "",
      trim: true,
    },
    keyPoints: {
      type: [String],
      default: [],
    },
    conceptMap: {
      type: [conceptMapSchema],
      default: [],
    },
  },
  { _id: false }
);

// =============================
// Visual Aid Schemas
// =============================
const mindMapNodeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["root", "topic", "subtopic", "detail"],
      default: "topic",
    },
  },
  { _id: false }
);

const mindMapSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
    nodes: {
      type: [mindMapNodeSchema],
      default: [],
    },
  },
  { _id: false }
);

const infographicCardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["definition", "formula", "process", "comparison", "example"],
      default: "definition",
    },
    accent: {
      type: String,
      enum: ["purple", "cyan", "emerald", "amber", "pink"],
      default: "purple",
    },
  },
  { _id: false }
);

const infographicStepSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const infographicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
    cards: {
      type: [infographicCardSchema],
      default: [],
    },
    flow: {
      type: [infographicStepSchema],
      default: [],
    },
  },
  { _id: false }
);

// =============================
// Note Schema
// =============================
const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    summary: {
      type: summarySchema,
      default: () => ({}),
    },

    flashcards: {
      type: [flashcardSchema],
      default: [],
    },

    quiz: {
      type: [quizSchema],
      default: [],
    },

    mindMap: {
      type: mindMapSchema,
      default: () => ({}),
    },

    infographic: {
      type: infographicSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Note", noteSchema);

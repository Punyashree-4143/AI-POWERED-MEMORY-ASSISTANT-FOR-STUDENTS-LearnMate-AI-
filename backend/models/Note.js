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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Note", noteSchema);

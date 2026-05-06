const express = require("express");
const router = express.Router();
const multer = require("multer");

const Note = require("../models/Note");
const {
  correctOcrTextForDisplay,
  generateMindMap,
  generateInfographic,
  generateSummary,
  generateFlashcards,
  generateQuiz,
} = require("../config/aiService");
const { extractTextFromUpload } = require("../services/textExtractionService");

// ==============================
// Multer Memory Storage
// ==============================
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
      return;
    }

    cb(new Error("Only PDF and image files are supported"));
  },
});

function handleUpload(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    const statusCode = error instanceof multer.MulterError ? 400 : 415;
    res.status(statusCode).json({ error: error.message });
  });
}

// ==============================
// Create Note (Manual)
// ==============================
router.post("/create", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text required" });

    const note = new Note({ text });
    await note.save();

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==============================
// Upload PDF/Image
// ==============================
router.post("/upload-pdf", handleUpload, async (req, res) => {
  try {
    const { text: extractedText, method } = await extractTextFromUpload(
      req.file
    );

    if (!extractedText) {
      return res.status(422).json({
        message:
          "No readable text could be extracted. Try a clearer scan or higher-resolution image.",
      });
    }

    const shouldCorrectOcrText = method.includes("ocr");
    const displayText = shouldCorrectOcrText
      ? await correctOcrTextForDisplay(extractedText)
      : extractedText;

    const note = new Note({ text: displayText });
    await note.save();

    res.status(201).json({
      message: "Notes uploaded successfully",
      extractionMethod: method,
      correctedForDisplay: shouldCorrectOcrText,
      note,
    });

  } catch (error) {
    console.error("Upload Extraction Error:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// ==============================
// Get Single Note By ID  ✅ FIX
// ==============================
router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    console.error("Get Note Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// Summarize
// ==============================
router.post("/summarize/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const summary = await generateSummary(note.text);
    note.summary = summary;
    await note.save();

    res.json(note);

  } catch (error) {
    console.error("Summarize Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================
// Flashcards
// ==============================
router.post("/flashcards/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const flashcards = await generateFlashcards(note.text);
    note.flashcards = flashcards;
    await note.save();

    res.json(note);

  } catch (error) {
    console.error("Flashcard Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================
// Quiz
// ==============================
router.post("/quiz/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const quiz = await generateQuiz(note.text);
    note.quiz = quiz;
    await note.save();

    res.json(note);

  } catch (error) {
    console.error("Quiz Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================
// Mind Map
// ==============================
router.post("/mind-map/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const mindMap = await generateMindMap(note.text);
    note.mindMap = mindMap;
    await note.save();

    res.json(note);

  } catch (error) {
    console.error("Mind Map Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================
// Infographic
// ==============================
router.post("/infographic/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const infographic = await generateInfographic(note.text);
    note.infographic = infographic;
    await note.save();

    res.json(note);

  } catch (error) {
    console.error("Infographic Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================
// Get All Notes
// ==============================
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

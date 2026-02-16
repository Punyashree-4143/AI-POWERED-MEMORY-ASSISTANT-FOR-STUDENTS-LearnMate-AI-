const express = require("express");
const router = express.Router();
const multer = require("multer");
const { getDocument } = require("pdfjs-dist/legacy/build/pdf.js");

const Note = require("../models/Note");
const {
  generateSummary,
  generateFlashcards,
  generateQuiz,
} = require("../config/aiService");

// ==============================
// Multer Memory Storage
// ==============================
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
// Upload PDF
// ==============================
router.post("/upload-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const uint8Array = new Uint8Array(req.file.buffer);
    const loadingTask = getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    let extractedText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      extractedText += pageText + "\n";
    }

    const note = new Note({ text: extractedText });
    await note.save();

    res.status(201).json({
      message: "PDF uploaded successfully",
      note,
    });

  } catch (error) {
    console.error("PDF Error:", error);
    res.status(500).json({ error: error.message });
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

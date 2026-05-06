const crypto = require("crypto");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const pdfPoppler = require("pdf-poppler");
const sharp = require("sharp");
const { createWorker, PSM } = require("tesseract.js");
const englishOcrData = require("@tesseract.js-data/eng");
const { getDocument } = require("pdfjs-dist/legacy/build/pdf.js");

const MIN_TEXT_CHARS_PER_PAGE = 30;
const OCR_IMAGE_SCALE = Number(process.env.OCR_IMAGE_SCALE || 3600);
const OCR_LANGUAGE = process.env.OCR_LANGUAGE || "eng";
const OCR_ENGINE = (process.env.OCR_ENGINE || "easyocr").toLowerCase();
const OCR_CACHE_PATH = path.join(os.tmpdir(), "tesseract-cache");
const EASYOCR_SCRIPT_PATH = path.join(__dirname, "..", "ocr", "easyocr_runner.py");
const PYTHON_COMMAND = process.env.PYTHON_COMMAND || "python";
const OCR_CANDIDATES = [
  {
    name: "handwritten-auto",
    psm: PSM.AUTO,
    preprocessing: "normalized",
  },
  {
    name: "handwritten-block",
    psm: PSM.SINGLE_BLOCK,
    preprocessing: "highContrast",
  },
  {
    name: "handwritten-line",
    psm: PSM.SINGLE_COLUMN,
    preprocessing: "binary",
  },
];

function normalizeExtractedText(text) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/[|]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanOcrText(text) {
  return normalizeExtractedText(text)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[•·●]/g, "-")
    .replace(/[^\S\n]+([,.;:!?])/g, "$1")
    .replace(/([a-z])-\s+([a-z])/gi, "$1$2")
    .replace(/\b0S\b/g, "OS")
    .replace(/\bO S\b/g, "OS")
    .replace(/\bC PU\b/g, "CPU")
    .replace(/\bI\/ O\b/g, "I/O")
    .replace(/\bI\/0\b/g, "I/O")
    .replace(/\bl\/O\b/g, "I/O")
    .trim();
}

function hasUsableText(text) {
  const normalized = normalizeExtractedText(text);
  const alphaNumericCount = (normalized.match(/[a-z0-9]/gi) || []).length;

  return (
    normalized.length >= MIN_TEXT_CHARS_PER_PAGE &&
    alphaNumericCount >= Math.floor(MIN_TEXT_CHARS_PER_PAGE * 0.6)
  );
}

async function extractSelectablePdfPages(buffer) {
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item) => item.str).join(" ");

    pages.push({
      pageNumber,
      text: normalizeExtractedText(text),
      needsOcr: !hasUsableText(text),
    });
  }

  await pdf.destroy();
  return pages;
}

async function findConvertedImage(tempDir, prefix) {
  const files = await fs.readdir(tempDir);
  const imageFile = files.find(
    (file) => file.startsWith(prefix) && /\.(png|jpe?g|tiff)$/i.test(file)
  );

  if (!imageFile) {
    throw new Error(`Unable to render PDF page for OCR: ${prefix}`);
  }

  return path.join(tempDir, imageFile);
}

async function renderPdfPageToImage(pdfPath, tempDir, pageNumber) {
  const prefix = `page-${pageNumber}`;

  await pdfPoppler.convert(pdfPath, {
    format: "png",
    out_dir: tempDir,
    out_prefix: prefix,
    page: pageNumber,
    scale: OCR_IMAGE_SCALE,
  });

  return findConvertedImage(tempDir, prefix);
}

async function prepareImageForOcr(inputPath, candidateName, preprocessing) {
  const outputPath = inputPath.replace(/\.[^.]+$/, `-${candidateName}.png`);
  const basePipeline = sharp(inputPath)
    .rotate()
    .resize({
      width: 4200,
      withoutEnlargement: false,
    })
    .grayscale()
    .normalize()
    .sharpen()
    .modulate({
      brightness: 1.3,
      saturation: 0,
    })
    .threshold(170);

  if (preprocessing === "highContrast") {
    await basePipeline
      .png()
      .toFile(outputPath);
    return outputPath;
  }

  if (preprocessing === "binary") {
    await basePipeline
      .png()
      .toFile(outputPath);
    return outputPath;
  }

  await basePipeline
    .png()
    .toFile(outputPath);

  return outputPath;
}

async function prepareImageForEasyOcr(inputPath) {
  const outputPath = inputPath.replace(/\.[^.]+$/, "-easyocr.png");

  await sharp(inputPath)
    .rotate()
    .resize({
      width: 3600,
      withoutEnlargement: false,
    })
    .grayscale()
    .normalize()
    .sharpen()
    .modulate({
      brightness: 1.12,
      saturation: 0,
    })
    .png()
    .toFile(outputPath);

  return outputPath;
}

async function createOcrWorker() {
  const workerOptions =
    OCR_LANGUAGE === englishOcrData.code
      ? {
          cachePath: OCR_CACHE_PATH,
          gzip: englishOcrData.gzip,
          langPath: englishOcrData.langPath,
        }
      : { cachePath: OCR_CACHE_PATH };
  const worker = await createWorker(OCR_LANGUAGE, 1, workerOptions);

  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
    tessedit_do_invert: "0",
    preserve_interword_spaces: "1",
    user_defined_dpi: "300",
    tessedit_char_whitelist:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?():;-/% ",
  });

  return worker;
}

function getTextQualityScore(text, confidence = 0) {
  const cleaned = cleanOcrText(text);
  const chars = cleaned.length || 1;
  const alphaNumericCount = (cleaned.match(/[a-z0-9]/gi) || []).length;
  const suspiciousCount = (cleaned.match(/[~^*_={}\[\]\\<>]/g) || []).length;
  const wordCount = (cleaned.match(/[a-z0-9]{2,}/gi) || []).length;
  const alphaRatio = alphaNumericCount / chars;
  const suspiciousRatio = suspiciousCount / chars;

  return confidence + wordCount * 0.18 + alphaRatio * 20 - suspiciousRatio * 80;
}

function runPythonEasyOcr(imagePath) {
  return new Promise((resolve) => {
    const child = spawn(PYTHON_COMMAND, [EASYOCR_SCRIPT_PATH, imagePath], {
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      resolve(null);
    }, 5 * 60 * 1000);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", () => {
      clearTimeout(timeout);
      resolve(null);
    });

    child.on("close", () => {
      clearTimeout(timeout);

      try {
        const result = JSON.parse(stdout.trim());

        if (!result.ok) {
          console.warn("EasyOCR skipped:", result.error || stderr);
          resolve(null);
          return;
        }

        resolve({
          confidence: Number(result.confidence || 0) * 100,
          text: cleanOcrText(result.text || ""),
        });
      } catch (error) {
        console.warn("EasyOCR parse error:", error.message || stderr);
        resolve(null);
      }
    });
  });
}

async function recognizeImageWithEasyOcr(imagePath) {
  if (OCR_ENGINE === "tesseract") {
    return null;
  }

  const preparedImagePath = await prepareImageForEasyOcr(imagePath);
  const result = await runPythonEasyOcr(preparedImagePath);

  if (!result?.text) {
    return null;
  }

  return result;
}

async function recognizeImageWithTesseract(getWorker, imagePath) {
  const worker = await getWorker();
  const results = [];

  for (const candidate of OCR_CANDIDATES) {
    const preparedImagePath = await prepareImageForOcr(
      imagePath,
      candidate.name,
      candidate.preprocessing
    );

    await worker.setParameters({
      tessedit_pageseg_mode: candidate.psm,
    });

    const {
      data: { confidence, text },
    } = await worker.recognize(preparedImagePath);

    results.push({
      candidate: candidate.name,
      confidence: confidence || 0,
      text: cleanOcrText(text),
      score: getTextQualityScore(text, confidence || 0),
    });
  }

  const bestResult = results.sort((a, b) => b.score - a.score)[0];

  return bestResult?.text || "";
}

async function recognizeImage(imagePath, getWorker) {
  const easyOcrResult = await recognizeImageWithEasyOcr(imagePath);

  if (easyOcrResult?.text) {
    return easyOcrResult.text;
  }

  return recognizeImageWithTesseract(getWorker, imagePath);
}

async function extractTextFromPdf(buffer) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "note-ocr-"));
  const pdfPath = path.join(tempDir, `${crypto.randomUUID()}.pdf`);

  try {
    await fs.writeFile(pdfPath, buffer);

    const pages = await extractSelectablePdfPages(buffer);
    const ocrPages = pages.filter((page) => page.needsOcr);

    if (ocrPages.length === 0) {
      return {
        text: normalizeExtractedText(pages.map((page) => page.text).join("\n")),
        method: "pdf-text",
      };
    }

    let worker = null;
    const getWorker = async () => {
      if (!worker) {
        worker = await createOcrWorker();
      }

      return worker;
    };

    try {
      for (const page of ocrPages) {
        const imagePath = await renderPdfPageToImage(
          pdfPath,
          tempDir,
          page.pageNumber
        );
        page.text = await recognizeImage(imagePath, getWorker);
      }
    } finally {
      if (worker) {
        await worker.terminate();
      }
    }

    return {
      text: cleanOcrText(pages.map((page) => page.text).join("\n")),
      method:
        ocrPages.length === pages.length ? "ocr" : "pdf-text-with-ocr-fallback",
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function extractTextFromImage(buffer) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "note-image-ocr-"));
  const imagePath = path.join(tempDir, `${crypto.randomUUID()}.png`);
  let worker = null;
  const getWorker = async () => {
    if (!worker) {
      worker = await createOcrWorker();
    }

    return worker;
  };

  try {
    await sharp(buffer).rotate().png().toFile(imagePath);

    return {
      text: await recognizeImage(imagePath, getWorker),
      method: "ocr",
    };
  } finally {
    if (worker) {
      await worker.terminate();
    }
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function extractTextFromUpload(file) {
  if (!file) {
    const error = new Error("No file uploaded");
    error.statusCode = 400;
    throw error;
  }

  if (file.mimetype === "application/pdf") {
    return extractTextFromPdf(file.buffer);
  }

  if (file.mimetype.startsWith("image/")) {
    return extractTextFromImage(file.buffer);
  }

  const error = new Error("Only PDF and image files are supported");
  error.statusCode = 400;
  throw error;
}

module.exports = {
  extractTextFromUpload,
  normalizeExtractedText,
};

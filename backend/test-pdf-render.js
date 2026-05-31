// test-pdf-render.js

const fs = require("fs");
const { createCanvas } = require("canvas");
const { getDocument } = require("pdfjs-dist/legacy/build/pdf.js");

async function test() {
  const pdfData = fs.readFileSync("./sample.pdf");

  const pdf = await getDocument({
    data: new Uint8Array(pdfData),
  }).promise;

  const page = await pdf.getPage(1);

  const viewport = page.getViewport({
    scale: 2,
  });

  const canvas = createCanvas(
    viewport.width,
    viewport.height
  );

  const ctx = canvas.getContext("2d");

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  fs.writeFileSync(
    "output.png",
    canvas.toBuffer("image/png")
  );

  console.log("SUCCESS");
}

test().catch(console.error);
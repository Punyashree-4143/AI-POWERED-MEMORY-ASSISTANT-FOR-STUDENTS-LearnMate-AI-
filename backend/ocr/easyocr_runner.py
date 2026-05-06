import json
import sys
from pathlib import Path


def fail(message):
    print(json.dumps({"ok": False, "error": message}))
    sys.exit(0)


def main():
    if len(sys.argv) < 2:
        fail("Image path is required")

    image_path = Path(sys.argv[1])

    if not image_path.exists():
        fail(f"Image not found: {image_path}")

    try:
        import easyocr
    except Exception as exc:
        fail(f"EasyOCR is not installed: {exc}")

    try:
        reader = easyocr.Reader(["en"], gpu=False, verbose=False)
        results = reader.readtext(str(image_path), detail=1, paragraph=False)
    except Exception as exc:
        fail(f"EasyOCR failed: {exc}")

    lines = []
    confidences = []

    for box, text, confidence in results:
        if not text or not text.strip():
            continue

        y_position = min(point[1] for point in box)
        x_position = min(point[0] for point in box)
        lines.append((y_position, x_position, text.strip()))
        confidences.append(float(confidence or 0))

    lines.sort(key=lambda item: (round(item[0] / 18), item[1]))
    extracted_text = "\n".join(line[2] for line in lines)
    average_confidence = (
        sum(confidences) / len(confidences) if confidences else 0
    )

    print(
        json.dumps(
            {
                "ok": True,
                "text": extracted_text,
                "confidence": average_confidence,
            }
        )
    )


if __name__ == "__main__":
    main()

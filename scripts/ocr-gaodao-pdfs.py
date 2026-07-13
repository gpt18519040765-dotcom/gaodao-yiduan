#!/usr/bin/env python3
import argparse
import io
import json
import re
import sys
import tempfile
from pathlib import Path

from PIL import Image
from pypdf import PdfReader
from rapidocr_onnxruntime import RapidOCR


DEFAULT_PDFS = [
    {
        "volume": "白话高岛易断上",
        "path": "/Users/mac/Desktop/未命名文件夹/22B-白话 高岛易断 上 (（日）高岛嘉右卫门著；孙正治，孙奥麟译 etc.).pdf",
    },
    {
        "volume": "白话高岛易断下",
        "path": "/Users/mac/Desktop/未命名文件夹/22C-白话 高岛易断 下 (Pdg2Pic, （日）高岛嘉右卫门著；孙正治，孙奥麟译).pdf",
    },
]


def normalize_text(text: str) -> str:
    text = text.strip()
    text = re.sub(r"\s+", "", text)
    return text


def existing_keys(output_path: Path) -> set[tuple[str, int]]:
    if not output_path.exists():
        return set()

    keys: set[tuple[str, int]] = set()
    with output_path.open("r", encoding="utf-8") as fh:
        for line in fh:
            try:
                item = json.loads(line)
            except json.JSONDecodeError:
                continue
            keys.add((item.get("volume", ""), int(item.get("pageIndex", -1))))
    return keys


def image_to_temp_jpeg(image_data: bytes) -> str:
    image = Image.open(io.BytesIO(image_data))
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")

    tmp = tempfile.NamedTemporaryFile(prefix="gaodao-page-", suffix=".jpg", delete=False)
    tmp.close()
    image.save(tmp.name, "JPEG", quality=92)
    return tmp.name


def ocr_page(ocr: RapidOCR, image_path: str) -> tuple[list[dict], str, float]:
    result, elapsed = ocr(image_path)
    lines = []
    if result:
        for box, text, confidence in result:
            clean = normalize_text(text)
            if not clean:
                continue
            lines.append(
                {
                    "text": clean,
                    "confidence": float(confidence),
                    "box": box,
                }
            )

    page_text = "\n".join(line["text"] for line in lines)
    avg_confidence = sum(line["confidence"] for line in lines) / len(lines) if lines else 0.0
    return lines, page_text, avg_confidence


def iter_pdf_pages(pdf_path: Path, start_page: int, end_page: int | None):
    reader = PdfReader(str(pdf_path))
    total_pages = len(reader.pages)
    last_page = min(end_page if end_page else total_pages, total_pages)
    for page_number in range(start_page, last_page + 1):
        page = reader.pages[page_number - 1]
        images = list(page.images)
        yield page_number, total_pages, images


def run(args: argparse.Namespace) -> int:
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    done = existing_keys(output_path) if args.resume else set()
    ocr = RapidOCR()

    with output_path.open("a", encoding="utf-8") as out:
        for source in DEFAULT_PDFS:
            volume = source["volume"]
            pdf_path = Path(source["path"])
            if not pdf_path.exists():
                print(f"missing: {pdf_path}", file=sys.stderr)
                continue

            for page_number, total_pages, images in iter_pdf_pages(pdf_path, args.start_page, args.end_page):
                page_index = page_number - 1
                if (volume, page_index) in done:
                    continue
                if args.limit and page_number > args.start_page + args.limit - 1:
                    break

                if not images:
                    item = {
                        "volume": volume,
                        "pdfPath": str(pdf_path),
                        "pageNumber": page_number,
                        "pageIndex": page_index,
                        "totalPages": total_pages,
                        "lines": [],
                        "text": "",
                        "avgConfidence": 0,
                    }
                    out.write(json.dumps(item, ensure_ascii=False) + "\n")
                    out.flush()
                    print(f"{volume} p{page_number}/{total_pages}: no image", flush=True)
                    continue

                image_path = image_to_temp_jpeg(images[0].data)
                try:
                    lines, page_text, avg_confidence = ocr_page(ocr, image_path)
                finally:
                    Path(image_path).unlink(missing_ok=True)

                item = {
                    "volume": volume,
                    "pdfPath": str(pdf_path),
                    "pageNumber": page_number,
                    "pageIndex": page_index,
                    "totalPages": total_pages,
                    "lines": lines,
                    "text": page_text,
                    "avgConfidence": avg_confidence,
                }
                out.write(json.dumps(item, ensure_ascii=False) + "\n")
                out.flush()
                print(f"{volume} p{page_number}/{total_pages}: {len(lines)} lines conf {avg_confidence:.3f}", flush=True)

    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="OCR the scanned Baihua Gaodao Yiduan PDFs into JSONL pages.")
    parser.add_argument("--output", default="data/sources/pdfs/gaodao-baihua-ocr-pages.jsonl")
    parser.add_argument("--start-page", type=int, default=1)
    parser.add_argument("--end-page", type=int)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--resume", action="store_true")
    args = parser.parse_args()
    return run(args)


if __name__ == "__main__":
    raise SystemExit(main())

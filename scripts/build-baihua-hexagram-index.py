#!/usr/bin/env python3
import json
import re
from pathlib import Path


OCR_PATH = Path("data/sources/pdfs/gaodao-baihua-ocr-pages.jsonl")
OUTPUT_PATH = Path("data/sources/pdfs/gaodao-baihua-hexagrams.json")


TOC = [
    ("乾为天", 3),
    ("坤为地", 20),
    ("水雷屯", 38),
    ("山水蒙", 55),
    ("水天需", 70),
    ("天水讼", 85),
    ("地水师", 96),
    ("水地比", 109),
    ("风天小畜", 120),
    ("天泽履", 132),
    ("地天泰", 144),
    ("天地否", 156),
    ("天火同人", 169),
    ("火天大有", 183),
    ("地山谦", 194),
    ("雷地豫", 206),
    ("泽雷随", 217),
    ("山风蛊", 229),
    ("地泽临", 241),
    ("风地观", 252),
    ("火雷噬嗑", 266),
    ("山火贲", 277),
    ("山地剥", 289),
    ("地雷复", 299),
    ("天雷无妄", 310),
    ("山天大畜", 322),
    ("山雷颐", 335),
    ("泽风大过", 347),
    ("坎为水", 359),
    ("离为火", 369),
    ("泽山咸", 381),
    ("雷风恒", 391),
    ("天山遁", 401),
    ("雷天大壮", 411),
    ("火地晋", 422),
    ("地火明夷", 434),
    ("风火家人", 446),
    ("火泽睽", 457),
    ("水山蹇", 471),
    ("雷水解", 481),
    ("山泽损", 492),
    ("风雷益", 504),
    ("泽天夬", 517),
    ("天风姤", 531),
    ("泽地萃", 543),
    ("地风升", 554),
    ("泽水困", 564),
    ("水风井", 575),
    ("泽火革", 587),
    ("火风鼎", 599),
    ("震为雷", 611),
    ("艮为山", 623),
    ("风山渐", 634),
    ("雷泽归妹", 644),
    ("雷火丰", 654),
    ("火山旅", 666),
    ("巽为风", 676),
    ("兑为泽", 686),
    ("风水涣", 696),
    ("水泽节", 707),
    ("风泽中孚", 718),
    ("雷山小过", 729),
    ("水火既济", 740),
    ("火水未济", 752),
]


LINE_MARKERS = [
    "初九",
    "初六",
    "九二",
    "六二",
    "九三",
    "六三",
    "九四",
    "六四",
    "九五",
    "六五",
    "上九",
    "上六",
    "用九",
    "用六",
]


def book_page_to_volume_page(book_page: int) -> tuple[str, int]:
    if book_page < 381:
        return "白话高岛易断上", book_page + 28
    return "白话高岛易断下", book_page - 374


def normalize_text(text: str) -> str:
    text = re.sub(r"[ \t]+", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def strip_page_noise(text: str, hexagram_name: str) -> str:
    lines = []
    for line in text.splitlines():
        clean = line.strip()
        if not clean:
            continue
        if re.fullmatch(r"[·\d]+", clean):
            continue
        if re.fullmatch(rf"{re.escape(hexagram_name)}[·\d]*", clean):
            continue
        if clean == "白话高岛易断" or clean.endswith("白话高岛易断"):
            continue
        lines.append(clean)
    return "\n".join(lines)


def split_line_sections(text: str):
    pattern = re.compile(rf"(?m)^({'|'.join(re.escape(marker) for marker in LINE_MARKERS)})[：:]")
    positions = [(match.start(), match.group(1)) for match in pattern.finditer(text)]
    positions.sort()

    sections = []
    for index, (start, marker) in enumerate(positions):
        end = positions[index + 1][0] if index + 1 < len(positions) else len(text)
        chunk = text[start:end].strip()
        if len(chunk) < 20:
            continue
        sections.append({"marker": marker, "text": chunk})
    return sections


def load_pages():
    pages = []
    for line in OCR_PATH.read_text(encoding="utf-8").splitlines():
        item = json.loads(line)
        pages.append(item)
    return pages


def page_lookup(pages):
    return {(item["volume"], item["pageNumber"]): item for item in pages}


def build():
    pages = load_pages()
    lookup = page_lookup(pages)
    hexagrams = []

    for index, (name, start_book_page) in enumerate(TOC):
        next_start = TOC[index + 1][1] if index + 1 < len(TOC) else 763
        end_book_page = next_start - 1
        page_items = []
        text_parts = []

        for book_page in range(start_book_page, end_book_page + 1):
            volume, pdf_page = book_page_to_volume_page(book_page)
            page = lookup.get((volume, pdf_page))
            if not page:
                continue
            text = strip_page_noise(page.get("text", ""), name)
            page_items.append(
                {
                    "volume": volume,
                    "pdfPage": pdf_page,
                    "bookPage": book_page,
                    "avgConfidence": page.get("avgConfidence", 0),
                    "lineCount": len(page.get("lines", [])),
                }
            )
            if text:
                text_parts.append(text)

        full_text = normalize_text("\n".join(text_parts))
        hexagrams.append(
            {
                "name": name,
                "bookPageStart": start_book_page,
                "bookPageEnd": end_book_page,
                "pages": page_items,
                "text": full_text,
                "lineSections": split_line_sections(full_text),
            }
        )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(
            {
                "source": "白话高岛易断上下册扫描 PDF OCR",
                "ocrPageFile": str(OCR_PATH),
                "hexagrams": hexagrams,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"wrote {OUTPUT_PATH}")
    print(f"hexagrams {len(hexagrams)}")
    for item in hexagrams[:3] + hexagrams[-3:]:
        print(item["name"], item["bookPageStart"], item["bookPageEnd"], len(item["text"]), len(item["lineSections"]))


if __name__ == "__main__":
    build()

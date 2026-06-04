#!/usr/bin/env python3
import json
import time
import urllib.request
from pathlib import Path

VOLUMES = [
    {"ndlId": "760552", "title": "高島易断 上経 元"},
    {"ndlId": "760553", "title": "高島易断 上経 亨"},
    {"ndlId": "760554", "title": "高島易断 下経 利"},
    {"ndlId": "760555", "title": "高島易断 下経 貞"},
]

OUTPUT_DIR = Path("data/sources/ndl")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def fetch_json(url: str):
    last_error = None
    for attempt in range(1, 5):
        try:
            request = urllib.request.Request(
                url,
                headers={"User-Agent": "gaodao-yiduan-dev/0.1"},
            )
            with urllib.request.urlopen(request, timeout=40) as response:
                return json.load(response)
        except Exception as error:
            last_error = error
            time.sleep(attempt * 2)
    raise last_error


for volume in VOLUMES:
    url = f"https://lab.ndl.go.jp/dl/api/book/fulltext-json/{volume['ndlId']}"
    raw = fetch_json(url)
    pages = [
        {"page": page["page"], "contents": page.get("contents", "")}
        for page in raw.get("list", [])
    ]
    payload = {
        **volume,
        "source": url,
        "pageCount": len(pages),
        "pages": pages,
    }
    output_path = OUTPUT_DIR / f"{volume['ndlId']}.json"
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"saved {volume['ndlId']}: {len(pages)} pages")

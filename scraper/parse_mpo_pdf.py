"""Parse a scanned 'MPO enlistment' PDF from the Ministry of Education into
schools_raw.csv matching the admin tool's schema.

Approach:
  1. Render each page with PyMuPDF at 150 dpi.
  2. Run RapidOCR to get (bbox, text, confidence) triples.
  3. Cluster boxes by y-center into rows (row_height ~ 32px at 150dpi).
  4. For each row, bucket boxes by x-center into 5 columns:
        SL | DISTRICT | THANA/UPAZILA | EIIN | INSTITUTION NAME
  5. Validate a row by presence of a 6-digit EIIN + non-empty district.
  6. Append to schools_raw.csv.

Layout calibration came from observing page 1 at 150dpi (1276x1651):
  SL      : x  180-220
  DISTRICT: x  240-400
  THANA   : x  400-650
  EIIN    : x  650-755
  NAME    : x  755-1240

Usage:
  python parse_mpo_pdf.py ../secondary-school-list.pdf schools_raw.csv
"""

from __future__ import annotations

import argparse
import csv
import io
import re
import sys
from dataclasses import dataclass
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import fitz  # PyMuPDF
from rapidocr_onnxruntime import RapidOCR

# Column x-ranges at 150 dpi (px). Tune if layout shifts on later pages.
COLS = {
    "sl":       (150, 240),
    "district": (240, 400),
    "thana":    (400, 650),
    "eiin":     (650, 755),
    "name":     (755, 1240),
}
ROW_TOL = 14  # px vertical tolerance when clustering boxes into rows
MIN_CONF = 0.40

EIIN_RE = re.compile(r"^\d{6}$")


@dataclass
class Box:
    x: float
    y: float
    x2: float
    y2: float
    text: str
    conf: float

    @property
    def cx(self) -> float: return (self.x + self.x2) / 2
    @property
    def cy(self) -> float: return (self.y + self.y2) / 2


def to_boxes(raw) -> list[Box]:
    out: list[Box] = []
    if not raw:
        return out
    for bbox, text, conf in raw:
        try:
            c = float(conf)
        except (TypeError, ValueError):
            c = 0.0
        if c < MIN_CONF or not text.strip():
            continue
        xs = [p[0] for p in bbox]
        ys = [p[1] for p in bbox]
        out.append(Box(min(xs), min(ys), max(xs), max(ys), text.strip(), c))
    return out


def cluster_rows(boxes: list[Box]) -> list[list[Box]]:
    """Group boxes whose y-centers are within ROW_TOL px."""
    if not boxes:
        return []
    boxes = sorted(boxes, key=lambda b: b.cy)
    rows: list[list[Box]] = [[boxes[0]]]
    for b in boxes[1:]:
        last_row_cy = sum(x.cy for x in rows[-1]) / len(rows[-1])
        if abs(b.cy - last_row_cy) <= ROW_TOL:
            rows[-1].append(b)
        else:
            rows.append([b])
    return rows


def assign_column(b: Box) -> str | None:
    for col, (lo, hi) in COLS.items():
        if lo <= b.cx <= hi:
            return col
    return None


def row_to_record(row: list[Box]) -> dict[str, str] | None:
    bins: dict[str, list[Box]] = {c: [] for c in COLS}
    for b in row:
        col = assign_column(b)
        if col:
            bins[col].append(b)

    def join(col: str) -> str:
        return " ".join(b.text for b in sorted(bins[col], key=lambda x: x.x)).strip()

    eiin = join("eiin").replace(" ", "")
    if not EIIN_RE.match(eiin):
        return None

    district = join("district")
    thana = join("thana")
    name = join("name")
    if not district or not name:
        return None

    return {
        "eiin": eiin,
        "name": name,
        "level": "Secondary",
        "address": "",
        "division": "",
        "district": district,
        "upazila": thana,
        "latitude": "",
        "longitude": "",
    }


def parse_page(page, ocr: RapidOCR, page_idx: int) -> list[dict[str, str]]:
    pix = page.get_pixmap(dpi=150)
    raw, _ = ocr(pix.tobytes("png"))
    boxes = to_boxes(raw)
    records: list[dict[str, str]] = []
    orphans: list[list[Box]] = []
    for row in cluster_rows(boxes):
        rec = row_to_record(row)
        if rec:
            records.append(rec)
        else:
            orphans.append(row)
    # Institution names can wrap to a second row (x=755+ with no other cols).
    # If a row is ALL name-column and sits just below a record, append to prev.
    for row in orphans:
        name_boxes = [b for b in row if b.cx >= COLS["name"][0]]
        if not name_boxes or len(name_boxes) != len(row):
            continue
        if not records:
            continue
        extra = " ".join(b.text for b in sorted(name_boxes, key=lambda x: x.x)).strip()
        records[-1]["name"] = (records[-1]["name"] + " " + extra).strip()
    print(f"  page {page_idx+1}: {len(records)} rows")
    return records


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("out", nargs="?", default="schools_raw.csv")
    ap.add_argument("--max-pages", type=int, default=0,
                    help="limit for debugging; 0 = all")
    args = ap.parse_args()

    pdf_path = Path(args.pdf)
    out_path = Path(args.out)
    if not pdf_path.exists():
        print(f"PDF not found: {pdf_path}", file=sys.stderr)
        return 2

    print(f"Opening {pdf_path}...")
    doc = fitz.open(pdf_path)
    total_pages = doc.page_count
    if args.max_pages:
        total_pages = min(total_pages, args.max_pages)
    print(f"Processing {total_pages} pages...")

    ocr = RapidOCR()
    all_records: list[dict[str, str]] = []

    for i in range(total_pages):
        page = doc[i]
        # Skip pages that already have embedded text (cover / distribution list)
        if page.get_text().strip():
            print(f"  page {i+1}: skipping text-only page")
            continue
        try:
            all_records.extend(parse_page(page, ocr, i))
        except Exception as e:
            print(f"  page {i+1}: ERROR {e}", file=sys.stderr)

    fieldnames = [
        "eiin", "name", "level", "address",
        "division", "district", "upazila",
        "latitude", "longitude",
    ]
    with out_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(all_records)

    print(f"\nWrote {len(all_records)} rows -> {out_path}")
    # Quick integrity check
    unique = {r["eiin"] for r in all_records}
    print(f"Unique EIINs: {len(unique)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""Fetch the full IPEMIS school list via the public DataTables endpoint and
emit schools_raw.csv ready for the .NET admin tool.

Endpoint: GET https://ipemis.dpe.gov.bd/load-lite-school-list
- No auth. Requires x-requested-with header + a matching Referer.
- DataTables-style pagination via start/length.
- recordsTotal = 65,569 (national total, all school types).

Rate control: 500ms delay between page fetches. 65k / 1000-per-page = ~66
calls -> ~35s of wall clock + network time. Empirically faster in practice.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import sys
import time
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import httpx

URL = "https://ipemis.dpe.gov.bd/load-lite-school-list"

HEADERS = {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "x-requested-with": "XMLHttpRequest",
    "referer": "https://ipemis.dpe.gov.bd/search-school",
    "user-agent": "Mozilla/5.0 (FindSchoolBD-seed/0.1; +hello@findschool.app)",
    "accept-language": "en-US,en;q=0.9,bn;q=0.8",
}

DEFAULT_PAGE_SIZE = 1000
DELAY_SECONDS = 0.5
MAX_RETRIES = 4

OUT_FIELDS = [
    "eiin", "name", "name_bn", "level",
    "address", "division", "district", "upazila",
    "latitude", "longitude",
    "total_teachers", "total_students",
]


def build_params(start: int, length: int, draw: int) -> dict:
    params = {
        "draw": str(draw),
        "start": str(start),
        "length": str(length),
        "search[value]": "",
        "search[regex]": "false",
        "divisionId": "",
        "districtId": "",
        "upazilaId": "",
        "geoUnionId": "",
        "schoolName": "",
        "schoolCode": "",
        "withElectricity": "",
        "withInternet": "",
        "withPlayground": "",
        "withLibrary": "",
        "disabledSchool": "",
        "_": str(int(time.time() * 1000)),
    }
    # DataTables adapter requires the columns[] block even though the values are trivial.
    for i in range(8):
        params[f"columns[{i}][data]"] = str(i)
        params[f"columns[{i}][name]"] = ""
        params[f"columns[{i}][searchable]"] = "true"
        params[f"columns[{i}][orderable]"] = "false"
        params[f"columns[{i}][search][value]"] = ""
        params[f"columns[{i}][search][regex]"] = "false"
    return params


def fetch_page(client: httpx.Client, start: int, length: int, draw: int) -> dict:
    last_err: Exception | None = None
    for attempt in range(MAX_RETRIES):
        try:
            r = client.get(URL, params=build_params(start, length, draw))
            r.raise_for_status()
            return r.json()
        except (httpx.HTTPError, json.JSONDecodeError) as e:
            last_err = e
            backoff = 1.5 ** attempt
            print(f"  retry {attempt+1}/{MAX_RETRIES} in {backoff:.1f}s ({e})", file=sys.stderr)
            time.sleep(backoff)
    raise RuntimeError(f"Failed after {MAX_RETRIES} retries: {last_err}")


def to_csv_row(rec: dict) -> dict[str, str]:
    bits = [rec.get("geoClusterName"), rec.get("geoUnionName"),
            rec.get("upazilaName"), rec.get("districtName"), "Bangladesh"]
    address = ", ".join(p.strip() for p in bits if p and p.strip())
    return {
        "eiin": (rec.get("schoolCode") or "").strip(),
        "name": (rec.get("schoolName") or "").strip(),
        "name_bn": (rec.get("schoolNameLocal") or "").strip(),
        "level": (rec.get("schoolTypeName") or "").strip(),
        "address": address,
        "division": (rec.get("divisionName") or "").strip(),
        "district": (rec.get("districtName") or "").strip(),
        "upazila": (rec.get("upazilaName") or "").strip(),
        "latitude": "",
        "longitude": "",
        "total_teachers": str(rec.get("totalTeacher", "") or ""),
        "total_students": str(rec.get("totalStudent", "") or ""),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("-o", "--out", default="schools_raw.csv")
    ap.add_argument("--page-size", type=int, default=DEFAULT_PAGE_SIZE)
    ap.add_argument("--limit", type=int, default=0,
                    help="stop after N total rows (0 = all)")
    args = ap.parse_args()

    out_path = Path(args.out)
    seen_eiins: set[str] = set()
    total_written = 0

    with httpx.Client(headers=HEADERS, timeout=60.0) as client, \
         out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=OUT_FIELDS)
        writer.writeheader()

        # first request also tells us the total
        first = fetch_page(client, 0, args.page_size, 1)
        grand_total = int(first.get("recordsTotal", 0))
        target = min(grand_total, args.limit) if args.limit else grand_total
        print(f"recordsTotal={grand_total}  target={target}  page_size={args.page_size}")

        def emit(rows: list[dict]) -> int:
            nonlocal total_written
            written = 0
            for r in rows:
                row = to_csv_row(r)
                if not row["eiin"]:
                    continue
                if row["eiin"] in seen_eiins:
                    continue
                seen_eiins.add(row["eiin"])
                writer.writerow(row)
                written += 1
                total_written += 1
                if args.limit and total_written >= args.limit:
                    return written
            return written

        emit(first.get("aaData", []))

        start = args.page_size
        draw = 2
        while start < target:
            if args.limit and total_written >= args.limit:
                break
            page = fetch_page(client, start, args.page_size, draw)
            rows = page.get("aaData", [])
            n = emit(rows)
            print(f"  start={start:6d}  got={len(rows):4d}  new={n:4d}  total={total_written}")
            if not rows:
                print("  empty page -> stopping", file=sys.stderr)
                break
            start += args.page_size
            draw += 1
            time.sleep(DELAY_SECONDS)

    print(f"\nWrote {total_written} unique rows -> {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

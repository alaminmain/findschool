"""
Find School - IPEMIS Scraper
Scrapes school directory (Name, EIIN, Address, Level, Lat/Long) from
ipemis.dpe.gov.bd using Playwright. Output: schools_raw.csv

Usage:
    pip install playwright pandas
    playwright install chromium
    python scrape_ipemis.py --division Dhaka --district Dhaka --upazila Dhanmondi
"""

import argparse
import csv
import logging
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterator, Optional

from playwright.sync_api import sync_playwright, Page, TimeoutError as PWTimeout

PORTAL_URL = "https://ipemis.dpe.gov.bd/site/page/school-directory"
OUTPUT = Path(__file__).parent / "schools_raw.csv"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("ipemis")


@dataclass
class SchoolRow:
    eiin: str
    name: str
    level: str
    address: str
    division: str
    district: str
    upazila: str
    latitude: Optional[float]
    longitude: Optional[float]


def select_dropdown(page: Page, selector: str, value: str) -> None:
    """Select a value in a dropdown and wait for dependent dropdowns to repopulate."""
    page.wait_for_selector(selector, state="visible", timeout=15_000)
    page.select_option(selector, label=value)
    page.wait_for_load_state("networkidle")


def parse_row(cells: list[str], division: str, district: str, upazila: str) -> SchoolRow:
    # Column order on the portal: # | EIIN | School Name | Level | Address | Lat | Long
    eiin = cells[1].strip()
    name = cells[2].strip()
    level = cells[3].strip() if len(cells) > 3 else ""
    address = cells[4].strip() if len(cells) > 4 else ""

    def _to_float(raw: str) -> Optional[float]:
        try:
            return float(raw.strip())
        except (ValueError, AttributeError):
            return None

    lat = _to_float(cells[5]) if len(cells) > 5 else None
    lng = _to_float(cells[6]) if len(cells) > 6 else None

    return SchoolRow(eiin, name, level, address, division, district, upazila, lat, lng)


def iter_pages(page: Page, division: str, district: str, upazila: str) -> Iterator[SchoolRow]:
    """Yield SchoolRow for each result row, traversing pagination."""
    while True:
        page.wait_for_selector("table tbody tr", timeout=15_000)
        rows = page.query_selector_all("table tbody tr")

        if not rows or "no record" in (rows[0].inner_text() or "").lower():
            log.info("No records on this page.")
            return

        for r in rows:
            cells = [c.inner_text() for c in r.query_selector_all("td")]
            if len(cells) < 3:
                continue
            yield parse_row(cells, division, district, upazila)

        # Pagination - "Next" link. Stop when disabled.
        next_btn = page.query_selector("li.next:not(.disabled) a, a[rel='next']:not(.disabled)")
        if not next_btn:
            return
        next_btn.click()
        time.sleep(1.5)  # be polite


def scrape(division: str, district: str, upazila: str, headless: bool = True) -> list[SchoolRow]:
    results: list[SchoolRow] = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        ctx = browser.new_context(user_agent="FindSchoolBot/1.0 (research)")
        page = ctx.new_page()

        try:
            log.info("Opening portal...")
            page.goto(PORTAL_URL, wait_until="domcontentloaded", timeout=30_000)

            select_dropdown(page, "select[name='division']", division)
            time.sleep(0.8)
            select_dropdown(page, "select[name='district']", district)
            time.sleep(0.8)
            select_dropdown(page, "select[name='upazila']", upazila)

            page.click("button[type='submit'], #btnSearch")
            page.wait_for_load_state("networkidle")

            for row in iter_pages(page, division, district, upazila):
                results.append(row)
                if len(results) % 100 == 0:
                    log.info("Scraped %d rows so far...", len(results))
        except PWTimeout as e:
            log.error("Timeout: %s", e)
        finally:
            browser.close()
    return results


def write_csv(rows: list[SchoolRow], path: Path) -> None:
    is_new = not path.exists()
    with path.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(asdict(rows[0]).keys()) if rows else [])
        if is_new and rows:
            writer.writeheader()
        for r in rows:
            writer.writerow(asdict(r))
    log.info("Wrote %d rows -> %s", len(rows), path)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--division", required=True)
    ap.add_argument("--district", required=True)
    ap.add_argument("--upazila", required=True)
    ap.add_argument("--headed", action="store_true")
    args = ap.parse_args()

    rows = scrape(args.division, args.district, args.upazila, headless=not args.headed)
    if rows:
        write_csv(rows, OUTPUT)
    else:
        log.warning("No rows scraped.")


if __name__ == "__main__":
    main()

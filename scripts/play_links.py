#!/usr/bin/env python3
"""Check static Play links, or update them with --write. No build is required."""

import argparse
import html
from pathlib import Path
import re
from urllib.parse import urlencode

# Single source for the proposed attribution format; Play Console support is unverified.
PLAY_URL = "https://play.google.com/store/apps/details"
APP_ID = "com.bada.aituoisoldi"
SOURCE = "sito"
PAGES = {"index.html": ("it", "home"), "en/index.html": ("en", "en")}
ANCHOR = re.compile(r'<a\b[^>]*\bdata-play="([^"]+)"[^>]*>', re.I)
HREF = re.compile(r'\bhref="([^"]+)"')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1] / "site"
    errors = []
    for name, (language, campaign_page) in PAGES.items():
        path = root / name
        content = path.read_text()
        expected = {f"{campaign_page}-hero", f"{campaign_page}-fine"}
        found = [match[1] for match in ANCHOR.finditer(content)]
        if set(found) != expected or len(found) != 2:
            errors.append(f"{name}: expected two Play links: {sorted(expected)}")

        def replace(match):
            campaign = match[1]
            query = urlencode({"id": APP_ID, "hl": language, "utm_source": SOURCE, "utm_campaign": campaign})
            target = html.escape(f"{PLAY_URL}?{query}", quote=True)
            href = HREF.search(match[0])
            if not href:
                errors.append(f"{name}: {campaign} has no href")
                return match[0]
            if href[1] != target and not args.write:
                errors.append(f"{name}: update {campaign} with --write")
            return HREF.sub(lambda _: f'href="{target}"', match[0])

        updated = ANCHOR.sub(replace, content)
        if args.write and updated != content:
            path.write_text(updated)
    if errors:
        raise SystemExit("\n".join(errors))
    print("Play links match the shared attribution format")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Reject JavaScript, script markup and oversized files in the published folder."""

import argparse
import mimetypes
from pathlib import Path
import re
import sys


MAX_BYTES = 100_000
SIZE_EXCEPTION = Path("assets/feature-graphic.png")
SCRIPT_TAG = re.compile(rb"<script", re.IGNORECASE)
TEXT_TYPES = {"application/json", "application/xml", "application/manifest+json"}


def violations(root: Path) -> list[str]:
    errors = []
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        relative = path.relative_to(root)
        if path.suffix.lower() == ".js":
            errors.append(f"{relative}: JavaScript files are not allowed")
        if path.stat().st_size > MAX_BYTES and relative != SIZE_EXCEPTION:
            errors.append(f"{relative}: {path.stat().st_size:,} bytes exceeds {MAX_BYTES:,}")
        media_type = mimetypes.guess_type(path.name)[0] or ""
        is_text = media_type.startswith("text/") or media_type.endswith("+xml") or media_type in TEXT_TYPES
        if is_text and SCRIPT_TAG.search(path.read_bytes()):
            errors.append(f"{relative}: <script markup is not allowed")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", type=Path, default=Path(__file__).resolve().parents[1] / "site")
    root = parser.parse_args().root
    if not root.is_dir():
        print(f"Site folder does not exist: {root}", file=sys.stderr)
        return 1
    errors = violations(root)
    if errors:
        print("Static site guard failed:\n" + "\n".join(errors), file=sys.stderr)
        return 1
    print("Static site guard passed: no .js, no <script, no files over 100 KB except the Open Graph graphic")
    return 0


if __name__ == "__main__":
    sys.exit(main())

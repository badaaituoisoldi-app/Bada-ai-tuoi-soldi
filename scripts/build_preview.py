#!/usr/bin/env python3
"""Package the site as one HTML file, usable without adjacent asset folders."""

import argparse
import base64
from pathlib import Path
import re
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"


def data_uri(relative_path):
    path = SITE / relative_path
    mime = {".png": "image/png", ".woff2": "font/woff2"}[path.suffix]
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def build_html():
    html = (SITE / "index.html").read_text()
    css = (SITE / "styles.css").read_text()
    css = re.sub(
        r'url\(["\']?(assets/[^)"\']+)["\']?\)',
        lambda match: 'url("' + data_uri(match[1]) + '")',
        css,
    )
    html = re.sub(
        r'<link\b[^>]*href="styles.css"[^>]*>',
        lambda _: "<style>" + css + "</style>",
        html,
    )

    def inline_script(match):
        name = match[1]
        script = (SITE / name).read_text()
        if name != "theme.js":
            script = 'document.addEventListener("DOMContentLoaded", () => {\n' + script + '\n}, { once: true });'
        return "<script>\n" + script + "\n</script>"

    html = re.sub(
        r'<script\b[^>]*src="(theme.js|script.js|viewer.js)"[^>]*>\s*</script>',
        inline_script,
        html,
    )
    html = re.sub(
        r'\b(src|href)="(assets/[^"]+)"',
        lambda match: match[1] + '="' + data_uri(match[2]) + '"',
        html,
    )
    html = html.replace('id="viewer-original"', 'id="viewer-original" download="Bada-originale.png"')
    # Browsers block navigation to data: images, but allow saving them.
    html = re.sub(
        r'(<a\b[^>]*href="data:image/png;base64,[^"]+")',
        lambda match: match[1] if " download=" in match[1] else match[1] + ' download="Bada-schermata.png"',
        html,
    )
    # Keep the locally bundled font's redistribution notice in the single file.
    license_text = (SITE / "assets/fonts/LICENSE.txt").read_text()
    html = html.replace("</head>", "<!--\nFont license:\n" + license_text + "\n-->\n</head>")
    if re.search(r'\b(?:src|href)="(?:assets/|(?:styles.css|theme.js|script.js|viewer.js)")', html):
        raise ValueError("An external local asset remains in the preview")
    return html.encode("utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "downloads/bada-anteprima.zip")
    parser.add_argument("--html", type=Path, help="Also save the unpacked HTML for inspection")
    args = parser.parse_args()
    html = build_html()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    entry = ZipInfo("Bada.html", date_time=(1980, 1, 1, 0, 0, 0))
    entry.compress_type = ZIP_DEFLATED
    entry.external_attr = 0o100644 << 16
    with ZipFile(args.output, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        archive.writestr(entry, html)
    if args.html:
        args.html.parent.mkdir(parents=True, exist_ok=True)
        args.html.write_bytes(html)
    print(f"{args.output}: Bada.html, {len(html):,} bytes, all assets included")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Render 2 crisp official-document page JPGs for an Unpaper daily episode and print
normalized [x, y, w, h] highlight boxes for each point's quote.

Usage:
  python scripts/unpaper/render-pages.py --input episode.json --out-dir public/unpaper/daily/YYYY-MM-DD-am
"""
import argparse
import html
import json
import os
import pymupdf


def render_page(html_body: str, out_jpg: str, needles: list[str]) -> dict[str, list[float]]:
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)
    page.insert_htmlbox(pymupdf.Rect(42, 42, 553, 800), html_body)
    pix = page.get_pixmap(dpi=150)
    pix.save(out_jpg, jpg_quality=90)
    r = page.rect
    boxes: dict[str, list[float]] = {}
    for needle in needles:
        q = needle.strip()
        if not q:
            continue
        rects = page.search_for(q[:48]) or page.search_for(q[:24])
        if rects:
            b = rects[0]
            boxes[needle] = [
                0.0623,
                round(max(0.02, b.y0 / r.height - 0.005), 4),
                0.83,
                round(min(0.14, max(0.055, (b.y1 - b.y0) / r.height + 0.055)), 4),
            ]
    return boxes


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--out-dir", required=True)
    args = ap.parse_args()

    with open(args.input, "r", encoding="utf-8") as f:
        ep = json.load(f)

    os.makedirs(args.out_dir, exist_ok=True)
    src = ep.get("source", {})
    issuer = html.escape(str(src.get("issuer") or ep["script"]["doc"].get("issuer") or "Official Source"))
    doc_title = html.escape(str(src.get("title") or ep.get("title") or ""))
    doc_date = html.escape(str(src.get("date") or ep["script"]["doc"].get("date") or ""))
    doc_url = html.escape(str(ep.get("sourceUrl") or ""))
    pts = ep["script"]["points"]

    p1_quote = pts[0].get("quote", "")
    p2_quote = pts[1].get("quote", "")
    p3_quote = pts[2].get("quote", "")

    html_p1 = f"""
    <div style="font-family: sans-serif; color: #111; line-height: 1.48; font-size: 11pt;">
      <div style="text-align:center; border-bottom: 2px solid #1a3c6e; padding-bottom: 8px; margin-bottom: 12px;">
        <div style="font-size: 13pt; font-weight: bold; color: #1a3c6e;">{issuer.upper()}</div>
        <div style="font-size: 8.5pt; color: #555;">{doc_date} &middot; {doc_url[:70]}</div>
      </div>
      <h2 style="font-size: 12pt; margin: 6px 0 10px 0;">{doc_title}</h2>
      <p><b>Document Overview:</b> {html.escape(ep["script"]["doc"].get("name", ""))}</p>
      <p><b>Point 1 — {html.escape(pts[0].get("title", ""))}</b><br/>
      {html.escape(p1_quote)}</p>
      <p style="color:#444; font-size: 9.5pt;"><b>Reference:</b> {html.escape(pts[0]["proof"]["source"])} ({html.escape(pts[0]["proof"]["page"])})</p>
    </div>
    """

    html_p2 = f"""
    <div style="font-family: sans-serif; color: #111; line-height: 1.48; font-size: 11pt;">
      <div style="text-align:center; border-bottom: 1px solid #ccc; padding-bottom: 6px; margin-bottom: 14px;">
        <div style="font-size: 9pt; color: #444;">{issuer} &middot; {doc_date} &middot; Page 2</div>
      </div>
      <p><b>Point 2 — {html.escape(pts[1].get("title", ""))}</b><br/>
      {html.escape(p2_quote)}</p>
      <p style="color:#444; font-size: 9.5pt;"><b>Reference:</b> {html.escape(pts[1]["proof"]["source"])} ({html.escape(pts[1]["proof"]["page"])})</p>
      <hr style="border:none; border-top:1px solid #eee; margin: 14px 0;"/>
      <p><b>Point 3 — {html.escape(pts[2].get("title", ""))}</b><br/>
      {html.escape(p3_quote)}</p>
      <p style="color:#444; font-size: 9.5pt;"><b>Reference:</b> {html.escape(pts[2]["proof"]["source"])} ({html.escape(pts[2]["proof"]["page"])})</p>
    </div>
    """

    b1 = render_page(html_p1, os.path.join(args.out_dir, "doc-1.jpg"), [p1_quote])
    b2 = render_page(html_p2, os.path.join(args.out_dir, "doc-2.jpg"), [p2_quote, p3_quote])
    print(json.dumps({
        "p1": b1.get(p1_quote, [0.0623, 0.32, 0.83, 0.08]),
        "p2": b2.get(p2_quote, [0.0623, 0.14, 0.83, 0.08]),
        "p3": b2.get(p3_quote, [0.0623, 0.42, 0.83, 0.08]),
    }))


if __name__ == "__main__":
    main()

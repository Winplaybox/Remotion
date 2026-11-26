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


def union_box(page: pymupdf.Page, needle: str) -> list[float] | None:
    q = needle.strip()
    if not q:
        return None
    r = page.rect
    rects = page.search_for(q)
    if not rects:
        words = q.split()
        start_rects = page.search_for(" ".join(words[:5])) or page.search_for(" ".join(words[:3]))
        end_rects = page.search_for(" ".join(words[-5:])) or page.search_for(" ".join(words[-3:]))
        if not start_rects:
            return None
        min_y = start_rects[0].y0 - 2
        max_y = (end_rects[-1].y1 + 2) if end_rects else r.height
        collected = list(start_rects) + list(end_rects)
        for i in range(0, len(words), 2):
            chunk = " ".join(words[i : i + 4])
            if len(chunk) >= 10:
                for m in page.search_for(chunk):
                    if m.y0 >= min_y and m.y1 <= max_y:
                        collected.append(m)
        rects = collected
    if not rects:
        return None
    x0 = min(b.x0 for b in rects)
    y0 = min(b.y0 for b in rects)
    x1 = max(b.x1 for b in rects)
    y1 = max(b.y1 for b in rects)
    pad_x, pad_y = 4.0, 1.5
    bx = max(0.01, (x0 - pad_x) / r.width)
    by = max(0.01, (y0 - pad_y) / r.height)
    bw = min(0.98 - bx, (x1 - x0 + 2 * pad_x) / r.width)
    bh = min(0.98 - by, (y1 - y0 + 2 * pad_y) / r.height)
    return [round(bx, 4), round(by, 4), round(bw, 4), round(bh, 4)]


def render_page(html_body: str, out_jpg: str, needles: list[str]) -> dict[str, list[float]]:
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)
    page.insert_htmlbox(pymupdf.Rect(42, 42, 553, 800), html_body)
    pix = page.get_pixmap(dpi=150)
    pix.save(out_jpg, jpg_quality=92)
    boxes: dict[str, list[float]] = {}
    for needle in needles:
        box = union_box(page, needle)
        if box:
            boxes[needle] = box
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
    <div style="font-family: Georgia, serif; color: #111; line-height: 1.48; font-size: 10.8pt;">
      <div style="text-align:center; border-bottom: 2px solid #1a3c6e; padding-bottom: 8px; margin-bottom: 12px;">
        <div style="font-family: sans-serif; font-size: 12.5pt; font-weight: bold; color: #1a3c6e;">{issuer.upper()}</div>
        <div style="font-family: sans-serif; font-size: 8.5pt; color: #555;">{doc_date} &middot; {doc_url[:70]}</div>
      </div>
      <h2 style="font-size: 11.8pt; margin: 6px 0 10px 0;">{doc_title}</h2>
      <p style="margin-bottom: 10px;"><b>Document Overview:</b> {html.escape(ep["script"]["doc"].get("name", ""))}</p>
      <p style="margin-bottom: 6px;"><b>Point 1 &mdash; {html.escape(pts[0].get("title", ""))}</b></p>
      <p style="margin-bottom: 10px;">{html.escape(p1_quote)}</p>
      <p style="color:#444; font-family: sans-serif; font-size: 9pt;"><b>Reference:</b> {html.escape(pts[0]["proof"]["source"])} ({html.escape(pts[0]["proof"]["page"])})</p>
    </div>
    """

    html_p2 = f"""
    <div style="font-family: Georgia, serif; color: #111; line-height: 1.48; font-size: 10.8pt;">
      <div style="text-align:center; border-bottom: 1px solid #ccc; padding-bottom: 6px; margin-bottom: 14px;">
        <div style="font-family: sans-serif; font-size: 9pt; color: #444;">{issuer} &middot; {doc_date} &middot; Page 2</div>
      </div>
      <p style="margin-bottom: 6px;"><b>Point 2 &mdash; {html.escape(pts[1].get("title", ""))}</b></p>
      <p style="margin-bottom: 8px;">{html.escape(p2_quote)}</p>
      <p style="color:#444; font-family: sans-serif; font-size: 9pt;"><b>Reference:</b> {html.escape(pts[1]["proof"]["source"])} ({html.escape(pts[1]["proof"]["page"])})</p>
      <hr style="border:none; border-top:1px solid #eee; margin: 14px 0;"/>
      <p style="margin-bottom: 6px;"><b>Point 3 &mdash; {html.escape(pts[2].get("title", ""))}</b></p>
      <p style="margin-bottom: 8px;">{html.escape(p3_quote)}</p>
      <p style="color:#444; font-family: sans-serif; font-size: 9pt;"><b>Reference:</b> {html.escape(pts[2]["proof"]["source"])} ({html.escape(pts[2]["proof"]["page"])})</p>
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

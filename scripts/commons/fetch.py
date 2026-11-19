"""Pick + download Wikimedia Commons photos and record attribution.

  python3 scripts/commons/fetch.py scripts/commons/picks-horror.json public/commons content/commons-photos.json

A pick is {"file": "File:..."} (exact) or {"q": "search words"} (first free-licence hit), plus "representative": true
when it is not the exact place. Only CC0 / Public domain / CC BY / CC BY-SA are accepted (no NC / ND).
"""
import json, re, sys, html, urllib.parse, urllib.request, io
from PIL import Image
UA = {"User-Agent": "WinplayboxRemotion/1.0 (epicbharat.official@gmail.com)"}
OK = ("CC0", "Public domain", "CC BY", "CC BY-SA")
def api(params):
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({**params, "format": "json"})
    return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40))
def info_for(titles):
    if not titles: return []
    d = api({"action": "query", "titles": "|".join(titles), "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 1280})
    return list(d["query"]["pages"].values())
def search_titles(q, n=12):
    d = api({"action": "query", "list": "search", "srsearch": f"filetype:bitmap {q}", "srnamespace": 6, "srlimit": n})
    return [r["title"] for r in d["query"]["search"]]
def clean(s): return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()
def ok(p, skip):
    if "imageinfo" not in p or p["title"] in skip: return False
    ii = p["imageinfo"][0]; m = ii.get("extmetadata", {}); lic = m.get("LicenseShortName", {}).get("value", "")
    return lic.startswith(OK) and "NC" not in lic and "ND" not in lic and ii["width"] >= 1000 and ii["height"] >= 700 and not p["title"].lower().endswith((".png", ".svg", ".gif"))
picks = json.load(open(sys.argv[1])); out = sys.argv[2]; man_path = sys.argv[3]
try: manifest = json.load(open(man_path))
except FileNotFoundError: manifest = {}
for pid, spec in picks.items():
    if pid in manifest and manifest[pid].get("file") == spec.get("file"): continue
    skip = set(spec.get("skip", []))
    if spec.get("file"): pages = info_for([spec["file"]])
    else:
        ts = search_titles(spec["q"]); pages = sorted(info_for(ts), key=lambda p: ts.index(p["title"]) if p["title"] in ts else 99)
    p = next((p for p in pages if ok(p, skip) or spec.get("file")), None)
    if not p: print("!! none for", pid, spec); continue
    ii = p["imageinfo"][0]; m = ii["extmetadata"]
    img = Image.open(io.BytesIO(urllib.request.urlopen(urllib.request.Request(ii["thumburl"], headers=UA), timeout=60).read())).convert("RGB")
    img.thumbnail((1280, 1280)); img.save(f"{out}/{pid}.jpg", quality=78, optimize=True, progressive=True)
    manifest[pid] = {
        "file": p["title"], "src": f"commons/{pid}.jpg", "page": ii["descriptionurl"],
        "author": clean(m.get("Artist", {}).get("value", "")) or "Unknown", "license": m.get("LicenseShortName", {}).get("value", ""),
        "licenseUrl": m.get("LicenseUrl", {}).get("value", ""), "representative": bool(spec.get("representative"))}
    json.dump(dict(sorted(manifest.items())), open(man_path, "w"), indent=1, ensure_ascii=False)
    print("ok", pid, p["title"], manifest[pid]["license"], manifest[pid]["author"][:40])
json.dump(dict(sorted(manifest.items())), open(man_path, "w"), indent=1, ensure_ascii=False)

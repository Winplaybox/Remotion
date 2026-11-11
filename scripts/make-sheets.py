"""Pack each <id>/<folder>/*.png into <id>/<folder>.sheet.png (one row, atlas offsets in sheet.json)."""
import json, sys, pathlib
from PIL import Image
root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "output/characters")
for cdir in sorted(p for p in root.iterdir() if p.is_dir()):
    for fdir in sorted(p for p in cdir.iterdir() if p.is_dir()):
        files = sorted(fdir.glob("*.png"))
        if not files: continue
        ims = [Image.open(f) for f in files]
        w, h = ims[0].size
        cols = min(8, len(ims)); rows = -(-len(ims) // cols)
        sheet = Image.new("RGBA", (w * cols, h * rows), (0, 0, 0, 0))
        meta = []
        for i, (f, im) in enumerate(zip(files, ims)):
            x, y = (i % cols) * w, (i // cols) * h
            sheet.paste(im, (x, y)); meta.append({"name": f.stem, "x": x, "y": y, "w": w, "h": h})
        sheet.save(cdir / f"{fdir.name}.sheet.png")
        (cdir / f"{fdir.name}.sheet.json").write_text(json.dumps(meta))

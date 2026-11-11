"""Kokoro-82M text-to-speech (Apache-2.0, free, runs on the CPU) via kokoro-onnx.

  python scripts/telegram/kokoro.py out.wav --voice hm_omega --lang hi --text "नंबर तीन ..."
  python scripts/telegram/kokoro.py --download      # fetch the model files (~350 MB, cached in $KOKORO_HOME)

Hindi voices (lang "hi"): hm_omega, hm_psi (male), hf_alpha, hf_beta (female). They read DEVANAGARI; Roman Hinglish is
mispronounced, so the caller must pass Devanagari for Hindi. English: af_heart (best overall), am_michael, bm_george.
"""
import argparse, os, sys, urllib.request
from pathlib import Path

HOME = Path(os.environ.get("KOKORO_HOME", Path.home() / ".kokoro"))
BASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
FILES = ("kokoro-v1.0.onnx", "voices-v1.0.bin")


def ensure_models() -> None:
    HOME.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        p = HOME / name
        if p.exists() and p.stat().st_size > 1_000_000:
            continue
        tmp = p.with_suffix(".part")
        urllib.request.urlretrieve(BASE + name, tmp)
        tmp.rename(p)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("out", nargs="?")
    ap.add_argument("--text")
    ap.add_argument("--voice", default="hm_omega")
    ap.add_argument("--lang", default="hi")
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--download", action="store_true")
    a = ap.parse_args()
    ensure_models()
    if a.download:
        return 0
    if not a.out or not a.text:
        ap.error("out and --text are required")
    import soundfile as sf
    from kokoro_onnx import Kokoro
    k = Kokoro(str(HOME / FILES[0]), str(HOME / FILES[1]))
    audio, sr = k.create(a.text, voice=a.voice, speed=a.speed, lang=a.lang)
    sf.write(a.out, audio, sr)
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""
Narrate one episode scene-by-scene with IndicF5 (your own voice), Edge TTS as fallback.

  1) npm run daily -- --channel epicbharatsaga --day 1 --dry      # writes output/epicbharatsaga/day-001.narration.json
  2) python scripts/narration/narrate.py --channel epicbharatsaga --day 1 \
        --ref "C:/path/ref.wav" --ref-text "exact words spoken in ref.wav"
  3) npm run daily -- --channel epicbharatsaga --day 1             # picks up the WAVs, scene length follows the voice

IndicF5 needs a GPU for sane speed (local CUDA or Google Colab T4). CPU works but is slow.
Output: public/audio/<channel>/day-NNN/scene-N.wav (48 kHz stereo, loudness -16 LUFS).
"""
import argparse, json, os, shutil, subprocess, sys, tempfile

p = argparse.ArgumentParser()
p.add_argument("--channel", required=True)
p.add_argument("--day", type=int, required=True)
p.add_argument("--ref", help="reference voice WAV for IndicF5 (5-15 s, clean)")
p.add_argument("--ref-text", help="exact transcript of the reference WAV (Devanagari)")
p.add_argument("--engine", choices=["indicf5", "edge"], default="indicf5")
p.add_argument("--edge-voice", default="hi-IN-MadhurNeural")
p.add_argument("--only", type=int, help="regenerate a single scene number")
a = p.parse_args()

tag = f"day-{a.day:03d}"
spec_path = os.path.join("output", a.channel, f"{tag}.narration.json")
if not os.path.exists(spec_path):
    sys.exit(f"{spec_path} missing - run: npm run daily -- --channel {a.channel} --day {a.day} --dry")
scenes = json.load(open(spec_path, encoding="utf-8"))
out_dir = os.path.join("public", "audio", a.channel, tag)
os.makedirs(out_dir, exist_ok=True)
ffmpeg = shutil.which("ffmpeg") or sys.exit("ffmpeg not found on PATH")


def finish(raw_wav: str, dest: str) -> None:
    """Trim silence, normalise loudness, 48 kHz stereo."""
    af = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=11"
    subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-i", raw_wav, "-af", af, "-ar", "48000", "-ac", "2", dest], check=True)


model = None
if a.engine == "indicf5":
    if not a.ref or not a.ref_text:
        sys.exit("IndicF5 needs --ref and --ref-text (or use --engine edge)")
    try:
        import numpy as np, soundfile as sf
        from transformers import AutoModel
        print("[IndicF5] loading ai4bharat/IndicF5 ...")
        model = AutoModel.from_pretrained("ai4bharat/IndicF5", trust_remote_code=True)
    except Exception as e:  # noqa: BLE001
        print(f"[IndicF5] unavailable ({e}); falling back to Edge TTS")
        a.engine = "edge"

for i, s in enumerate(scenes, start=1):
    if a.only and i != a.only:
        continue
    dest = os.path.join(out_dir, s["file"])
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, "raw.wav")
        if a.engine == "indicf5":
            audio = model(s["text"], ref_audio_path=a.ref, ref_text=a.ref_text)
            if audio.dtype == np.int16:
                audio = audio.astype(np.float32) / 32768.0
            sf.write(raw, np.array(audio, dtype=np.float32), samplerate=24000)
        else:
            mp3 = os.path.join(tmp, "raw.mp3")
            subprocess.run([sys.executable, "-m", "edge_tts", "--voice", a.edge_voice, "--rate=+5%", "--text", s["text"], "--write-media", mp3], check=True)
            subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-i", mp3, raw], check=True)
        finish(raw, dest)
    print(f"[{a.engine}] scene {i} -> {dest}")

print("done. Now render: npm run daily -- --channel", a.channel, "--day", a.day)

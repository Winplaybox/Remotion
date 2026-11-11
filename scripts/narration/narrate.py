"""
Narrate one episode scene-by-scene.

Engines:
  auto     — the channel's voice chain, first that works for the WHOLE post wins (one voice per video):
             Kokoro (open model, Apache-2.0, offline) -> Gemini TTS (GEMINI_API_KEY) -> Edge TTS
  kokoro / gemini / edge — one engine only
  indicf5  — your own voice (GPU), Edge TTS as fallback

GitHub Actions does this automatically with Edge TTS (hi-IN-MadhurNeural) via `post.ts --auto-narrate`,
so nothing has to be run by hand. Use this script locally only to replace the voice with IndicF5.

  1) npm run post -- --channel epicbharatsaga --n 1 --dry          # writes output/epicbharatsaga/post-001.narration.json
  2) python scripts/narration/narrate.py --channel epicbharatsaga --n 1 \
        --ref "C:/path/ref.wav" --ref-text "exact words spoken in ref.wav"
  3) git add public/audio && git commit && git push                 # GitHub Actions renders + publishes on schedule

IndicF5 needs a GPU for sane speed (local CUDA or Google Colab T4). CPU works but is slow.
Output: public/audio/<channel>/post-NNN/scene-N.wav (48 kHz mono, -16 LUFS; small enough to commit).
Batch: --n 1-7 narrates a whole week in one go.
"""
import argparse, json, os, shutil, subprocess, sys, tempfile

p = argparse.ArgumentParser()
p.add_argument("--channel", required=True)
p.add_argument("--n", required=True, help="post number or range, e.g. 3 or 1-7")
p.add_argument("--ref", help="reference voice WAV for IndicF5 (5-15 s, clean)")
p.add_argument("--ref-text", help="exact transcript of the reference WAV (Devanagari)")
p.add_argument("--engine", choices=["indicf5", "edge", "kokoro", "gemini", "auto"], default="indicf5")
p.add_argument("--engines", default="kokoro,gemini,edge", help="order for --engine auto")
p.add_argument("--edge-voice", default="hi-IN-MadhurNeural")
p.add_argument("--edge-rate", default="+5%")
p.add_argument("--kokoro-voice", default="hm_omega", help="hf_alpha hf_beta hm_omega hm_psi (Hindi), af_heart ... (English)")
p.add_argument("--kokoro-speed", type=float, default=1.0)
p.add_argument("--gemini-voice", default="Charon", help="Gemini prebuilt voice, e.g. Puck Fenrir Charon Kore Zephyr Algenib")
p.add_argument("--gemini-style", default="", help="how to say it (natural-language direction, prepended to every line)")
p.add_argument("--only", type=int, help="regenerate a single scene number")
p.add_argument("--missing-only", action="store_true", help="skip scenes whose WAV already exists")
a = p.parse_args()

lo, _, hi = a.n.partition("-")
numbers = list(range(int(lo), int(hi or lo) + 1))
ffmpeg = shutil.which("ffmpeg") or sys.exit("ffmpeg not found on PATH")


def finish(raw_wav: str, dest: str) -> None:
    """Trim silence, normalise loudness, 48 kHz stereo."""
    af = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=11"
    subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-i", raw_wav, "-af", af, "-ar", "48000", "-ac", "1", dest], check=True)


# ---------- engines: each writes a WAV for one line or raises ----------
_kokoro = {}


def say_kokoro(text: str, raw: str) -> None:
    import numpy as np, soundfile as sf
    from kokoro import KPipeline
    lang = a.kokoro_voice[0]  # voice prefix = language: h Hindi, a American English, b British English
    if lang not in _kokoro:
        _kokoro[lang] = KPipeline(lang_code=lang, repo_id="hexgrad/Kokoro-82M")
    parts = [np.asarray(audio, dtype=np.float32) for _, _, audio in _kokoro[lang](text, voice=a.kokoro_voice, speed=a.kokoro_speed) if audio is not None]
    if not parts:
        raise RuntimeError("kokoro produced no audio")
    sf.write(raw, np.concatenate(parts), samplerate=24000)


GEMINI_MODELS = [m for m in [os.environ.get("GEMINI_TTS_MODEL"), "gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts"] if m]


def say_gemini(text: str, raw: str) -> None:
    import base64, time, urllib.request, urllib.error, wave
    key = os.environ.get("GEMINI_API_KEY") or ""
    if not key:
        raise RuntimeError("GEMINI_API_KEY not set")
    prompt = f"{a.gemini_style.strip()}:\n{text}" if a.gemini_style.strip() else text
    body = json.dumps({"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseModalities": ["AUDIO"],
        "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": a.gemini_voice}}}}}).encode()
    last = None
    for model_id in GEMINI_MODELS:
        for attempt in range(3):
            req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent",
                                         data=body, headers={"Content-Type": "application/json", "x-goog-api-key": key})
            try:
                with urllib.request.urlopen(req, timeout=120) as r:
                    j = json.load(r)
                data = j["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
                with wave.open(raw, "wb") as w:  # 16-bit PCM, 24 kHz mono
                    w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(base64.b64decode(data))
                return
            except urllib.error.HTTPError as e:
                last = f"{model_id}: HTTP {e.code}"
                if e.code == 429 and attempt < 2:
                    time.sleep(20 * (attempt + 1)); continue
                break  # 404 (model gone) / 403 / quota for the day -> next model
            except (KeyError, IndexError, TimeoutError) as e:
                last = f"{model_id}: {e}"; break
    raise RuntimeError(f"gemini failed ({last})")


def say_edge(text: str, raw: str) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        mp3 = os.path.join(tmp, "raw.mp3")
        subprocess.run([sys.executable, "-m", "edge_tts", "--voice", a.edge_voice, f"--rate={a.edge_rate}", "--text", text, "--write-media", mp3], check=True)
        subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-i", mp3, raw], check=True)


ENGINES = {"kokoro": say_kokoro, "gemini": say_gemini, "edge": say_edge}

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

def narrate_post(n: int) -> None:
    tag = f"post-{n:03d}"
    spec_path = os.path.join("output", a.channel, f"{tag}.narration.json")
    if not os.path.exists(spec_path):
        subprocess.run(["npx", "ts-node", "scripts/post.ts", "--channel", a.channel, "--n", str(n), "--dry"], check=True, shell=os.name == "nt")
    scenes = json.load(open(spec_path, encoding="utf-8"))
    out_dir = os.path.join("public", "audio", a.channel, tag)
    os.makedirs(out_dir, exist_ok=True)
    if a.engine in ENGINES or a.engine == "auto":
        chain = [e.strip() for e in a.engines.split(",") if e.strip() in ENGINES] if a.engine == "auto" else [a.engine]
        todo = [(i, s) for i, s in enumerate(scenes, start=1)
                if not (a.only and i != a.only) and not (a.missing_only and os.path.exists(os.path.join(out_dir, s["file"])))]
        if not todo:
            return
        # One voice per video: an engine must manage every line of the post, otherwise the next engine redoes all of them.
        for eng in chain:
            with tempfile.TemporaryDirectory() as tmp:
                try:
                    done = []
                    for i, s in todo:
                        raw = os.path.join(tmp, f"{i}.wav")
                        ENGINES[eng](s["text"], raw)
                        done.append((i, s, raw))
                except Exception as e:  # noqa: BLE001
                    print(f"[{eng}] {tag}: {e} — trying the next engine")
                    continue
                for i, s, raw in done:
                    finish(raw, os.path.join(out_dir, s["file"]))
                with open(os.path.join(out_dir, "engine.txt"), "w", encoding="utf-8") as f:
                    f.write(eng)
                print(f"[{eng}] {tag}: {len(done)} line(s) -> {out_dir}")
                return
        raise SystemExit(f"{tag}: every engine failed ({', '.join(chain)})")

    for i, s in enumerate(scenes, start=1):
        if a.only and i != a.only:
            continue
        dest = os.path.join(out_dir, s["file"])
        if a.missing_only and os.path.exists(dest):
            continue
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
        print(f"[{a.engine}] {tag} scene {i} -> {dest}")


for n in numbers:
    narrate_post(n)

print("done. Commit public/audio and push; Actions publishes on schedule.")

"""Transcribe audio with word timestamps (faster-whisper, CPU int8). Writes JSON:
{"language": "hi", "duration": 123.4, "segments": [{"start","end","text","words":[{"start","end","word"}]}]}

  python scripts/telegram/transcribe.py in.wav out.json [--model small] [--language hi]
"""
import argparse, json
from faster_whisper import WhisperModel

p = argparse.ArgumentParser()
p.add_argument("audio"); p.add_argument("out")
p.add_argument("--model", default="small")
p.add_argument("--language", default=None)
a = p.parse_args()

model = WhisperModel(a.model, device="cpu", compute_type="int8")
segments, info = model.transcribe(a.audio, language=a.language, word_timestamps=True, vad_filter=True, beam_size=1)
out = {"language": info.language, "duration": info.duration, "segments": []}
for s in segments:
    out["segments"].append({
        "start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
        "words": [{"start": round(w.start, 2), "end": round(w.end, 2), "word": w.word.strip()} for w in (s.words or [])],
    })
json.dump(out, open(a.out, "w", encoding="utf-8"), ensure_ascii=False)
print(f"[transcribe] {info.language} {info.duration:.1f}s {len(out['segments'])} segments")

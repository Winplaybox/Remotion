#!/usr/bin/env python3
"""
Generates per-beat narration audio using edge-tts (free, no API key).
Each line in narration.txt becomes one MP3 clip, so Remotion scene
durations can be driven by real audio length instead of guesswork.
"""
import asyncio
import json
from pathlib import Path

import edge_tts
from mutagen.mp3 import MP3

VOICE = "hi-IN-MadhurNeural"
EPISODE_DIR = Path("content/topics/ep01")
OUTPUT_DIR = Path("assets/audio/generated/ep01")
NARRATION_FILE = EPISODE_DIR / "narration.txt"


def get_duration_seconds(path: Path) -> float:
    return MP3(path).info.length


async def synthesize_beat(text: str, out_path: Path) -> None:
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(str(out_path))


async def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    raw = NARRATION_FILE.read_text(encoding="utf-8")
    beats = [line.strip() for line in raw.split("\n\n") if line.strip()]

    manifest = []
    for i, beat_text in enumerate(beats, start=1):
        out_path = OUTPUT_DIR / f"beat-{i:02d}.mp3"
        print(f"Synthesizing beat {i}/{len(beats)}: {beat_text[:50]}...")
        await synthesize_beat(beat_text, out_path)
        duration = get_duration_seconds(out_path)
        manifest.append({
            "beat": i,
            "text": beat_text,
            "audioPath": str(out_path).replace("\\", "/"),
            "durationSeconds": duration,
            "durationFrames": round(duration * 30),
        })
        print(f"  -> {duration:.2f}s")

    manifest_path = OUTPUT_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    total = sum(b["durationSeconds"] for b in manifest)
    print(f"\nTotal narration duration: {total:.2f}s ({round(total * 30)} frames)")
    print(f"Manifest written to {manifest_path}")


if __name__ == "__main__":
    asyncio.run(main())

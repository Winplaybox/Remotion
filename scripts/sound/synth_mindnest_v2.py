"""
MindNest Tales (StoryVisualEngine V2) background music: a gentle music-box lullaby over a soft pad, synthesised here
from sine partials (no samples, no third-party audio, so no licence to track). Loops seamlessly.

    python scripts/sound/synth_mindnest_v2.py      # -> public/mindnest-v2/audio/music-box-loop.mp3

Separate from synth_channels.py so re-running it never touches the sounds of other channels.
"""
import os, subprocess, wave
import numpy as np

SR = 44100
BPM = 72
BEAT = 60 / BPM
OUT = os.path.join("public", "mindnest-v2", "audio")
os.makedirs(OUT, exist_ok=True)


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def box(f, sec):
    """Music-box tine: bright attack, inharmonic upper partials that die fast, long soft tail."""
    t = np.arange(int(sec * SR)) / SR
    s = (np.sin(2 * np.pi * f * t) * np.exp(-2.2 * t)
         + 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-4.5 * t)
         + 0.18 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-7 * t)
         + 0.08 * np.sin(2 * np.pi * f * 5.43 * t) * np.exp(-12 * t))
    a = int(0.004 * SR)
    s[:a] *= np.linspace(0, 1, a)
    return s


def pad(freqs, sec):
    t = np.arange(int(sec * SR)) / SR
    s = sum(np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.21 * t)) + 0.25 * np.sin(2 * np.pi * f * 2 * t) for f in freqs)
    env = np.minimum(1, t / 1.2) * np.minimum(1, (sec - t) / 1.2)
    return s * env / len(freqs)


# D major pentatonic lullaby, 16 bars of 3/4 (waltz feel, like a cradle song).
D = 62
melody = [  # (scale degree in semitones above D4, beats); None = rest
    (12, 1), (9, 1), (7, 1), (9, 2), (4, 1), (7, 1), (4, 1), (2, 1), (4, 3),
    (2, 1), (4, 1), (7, 1), (9, 2), (7, 1), (4, 1), (2, 1), (4, 1), (0, 3),
    (12, 1), (14, 1), (12, 1), (9, 2), (7, 1), (9, 1), (12, 1), (9, 1), (7, 3),
    (4, 1), (7, 1), (9, 1), (7, 2), (4, 1), (2, 1), (4, 1), (2, 1), (0, 3),
]
chords = [[0, 7, 16], [7, 14, 23], [9, 16, 24], [4, 11, 19]]  # D, A/E-ish, Bm, G (relative to D3)

beats = sum(b for _, b in melody)
bars = int(np.ceil(beats / 3))
total = bars * 3 * BEAT
buf = np.zeros(int((total + 4) * SR))

at = 0.0
for deg, b in melody:
    if deg is not None:
        n = box(hz(D + deg + 12), 3.5) * 0.5
        i = int(at * SR)
        buf[i:i + len(n)] += n
        # soft echo an octave down, a beat later (music-box comb)
        e = box(hz(D + deg), 2.5) * 0.12
        j = int((at + BEAT * 0.5) * SR)
        buf[j:j + len(e)] += e
    at += b * BEAT

bar = 3 * BEAT
for k in range(bars):
    c = chords[(k // 2) % len(chords)]
    p = pad([hz(50 + x) for x in c], bar * 1.15) * 0.22
    i = int(k * bar * SR)
    buf[i:i + len(p)] += p[: len(buf) - i]

# fold the tail back onto the start so the loop is seamless
L = int(total * SR)
tail = buf[L:]
buf = buf[:L]
buf[: len(tail)] += tail

# gentle low-pass + normalise
k = 0.35
y = np.empty_like(buf)
acc = 0.0
for i, v in enumerate(buf):
    acc += k * (v - acc)
    y[i] = acc
y = y / (np.max(np.abs(y)) + 1e-9) * 0.7

wav = os.path.join(OUT, "music-box-loop.wav")
with wave.open(wav, "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((y * 32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-b:a", "96k", os.path.join(OUT, "music-box-loop.mp3")], check=True)
os.remove(wav)
print("wrote", os.path.join(OUT, "music-box-loop.mp3"), f"{total:.1f}s")

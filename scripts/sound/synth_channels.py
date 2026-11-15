"""
Original sound kit for AllTrainReels, Indian Horror Tapes and MindNest Tales (no samples, no licences needed).
Separate from synth.py so re-running it never rewrites the sounds of channels that are already published.
Writes MP3s to public/sfx/.   python scripts/sound/synth_channels.py
"""
import os, subprocess, wave
import numpy as np

SR = 44100
OUT = os.path.join("public", "sfx")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(21)

def t(sec): return np.arange(int(sec * SR)) / SR
def env(n, a=0.005, r=0.2):
    e = np.ones(n); A = max(1, int(a * SR)); R = max(1, int(r * SR))
    e[:A] = np.linspace(0, 1, A); e[-R:] *= np.linspace(1, 0, R); return e
def note(f, sec, harm=(1, .5, .25), a=0.005, r=None, decay=3.0):
    x = t(sec); s = sum(h * np.sin(2 * np.pi * f * (i + 1) * x) for i, h in enumerate(harm))
    return s * np.exp(-decay * x) * env(len(x), a, r or sec * 0.3)
def lp(x, k=0.05):
    # one-pole low-pass, vectorised enough for a few seconds of audio
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc += k * (v - acc); y[i] = acc
    return y
def noise(sec): return rng.standard_normal(int(sec * SR))
def place(buf, clip, at):
    i = int(at * SR); j = min(len(buf), i + len(clip)); buf[i:j] += clip[: j - i]
def hz(midi): return 440 * 2 ** ((midi - 69) / 12)
def save(name, x, gain=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    wav = os.path.join(OUT, name + ".wav")
    with wave.open(wav, "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-b:a", "128k", os.path.join(OUT, name + ".mp3")], check=True)
    os.remove(wav); print("wrote", name)

# ---------- horror ----------
x = t(40)
drone = sum(np.sin(2 * np.pi * hz(36 + i) * x + 0.3 * np.sin(2 * np.pi * 0.07 * x * (k + 1))) * g for k, (i, g) in enumerate([(0, 1), (1, .35), (7, .3), (13, .2)]))
drone *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.05 * x)
air = lp(noise(40), 0.01) * 3
horror = 0.5 * drone + 0.25 * air
for k in range(6):  # sparse detuned music-box notes
    place(horror, 0.18 * note(hz(84 + [0, 1, 6, 3, 1, 8][k]), 3, (1, .2), decay=1.2), 3 + k * 6.2)
save("music_horror", horror, 0.55)
beat = np.zeros(int(2.0 * SR))
for k in range(2):
    place(beat, note(52, 0.18, (1, .3), decay=18), 0.1 + k * 0.9)
    place(beat, 0.7 * note(46, 0.16, (1, .3), decay=20), 0.34 + k * 0.9)
save("heartbeat", beat, 0.7)
x = t(1.4)
creak = np.sin(2 * np.pi * (180 + 60 * np.sin(2 * np.pi * 1.3 * x)) * x + 4 * lp(noise(1.4), 0.02)) * env(len(x), 0.05, 0.4)
save("creak", lp(creak, 0.2), 0.45)
x = t(3)
wind = lp(noise(3), 0.02) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.6 * x)) * env(len(x), 0.5, 1.0)
save("wind", wind, 0.45)
stinger = 0.6 * sum(note(hz(m), 2.2, (1, .5, .3), a=0.002, decay=1.6) for m in (48, 49, 55, 61)) + 0.5 * lp(noise(2.2), 0.4) * np.exp(-3 * t(2.2))
save("stinger", stinger, 0.75)

# ---------- trains ----------
x = t(2.2)
horn = sum(np.sin(2 * np.pi * f * x) for f in (311, 370, 466)) * env(len(x), 0.05, 0.5) * (1 + 0.03 * np.sin(2 * np.pi * 5 * x))
save("train_horn", lp(horn, 0.3), 0.45)
clack = np.zeros(int(4.0 * SR))
for k in range(8):
    for d in (0, 0.12):
        place(clack, 0.8 * lp(noise(0.05), 0.5) * np.exp(-90 * t(0.05)) + 0.5 * note(120, 0.05, (1,), decay=60), k * 0.5 + d)
save("train_clack", clack + 0.15 * lp(noise(4), 0.04), 0.4)

def music(bpm, bars, scale, root, pattern, bass, pad=True, perc=None, seed=1, lead=0.35):
    r = np.random.default_rng(seed); beat = 60 / bpm; total = bars * 4 * beat
    buf = np.zeros(int(total * SR) + SR)
    for b in range(bars * 4):
        for k, step in enumerate(pattern):
            if step is None or r.random() < 0.15: continue
            place(buf, lead * note(hz(root + scale[step % len(scale)] + 12 * (step // len(scale))), beat * 1.5, (1, .4, .1), decay=4), b * beat + k * beat / len(pattern))
        if b % 4 == 0:
            place(buf, 0.5 * note(hz(root - 24 + bass[(b // 4) % len(bass)]), beat * 4, (1, .5), decay=0.8), b * beat)
            if pad:
                chord = [0, 7, 12, 16] if scale[2] == 4 else [0, 7, 12, 15]
                place(buf, 0.12 * sum(note(hz(root - 12 + bass[(b // 4) % len(bass)] + c), beat * 4, (1, .3), a=0.6, decay=0.2) for c in chord), b * beat)
        if perc == "drive":
            place(buf, 0.25 * lp(noise(0.03), 0.6) * np.exp(-120 * t(0.03)), b * beat + beat / 2)
            if b % 2 == 0: place(buf, 0.6 * note(55, 0.15, (1,), decay=25), b * beat)
        if perc == "soft" and b % 2 == 1:
            place(buf, 0.15 * lp(noise(0.05), 0.3) * np.exp(-60 * t(0.05)), b * beat)
    buf = buf[: int(total * SR)]
    fade = int(0.05 * SR); buf[:fade] *= np.linspace(0, 1, fade); buf[-fade:] *= np.linspace(1, 0, fade)
    return buf

MAJ = [0, 2, 4, 5, 7, 9, 11]; PENTA_MAJ = [0, 2, 4, 7, 9]
save("music_rail", music(124, 16, MAJ, 67, [0, 2, 4, None, 4, 2, 5, None], [0, 5, 3, 4], perc="drive", seed=11), 0.6)
save("music_story", music(84, 16, PENTA_MAJ, 76, [0, None, 2, None, 4, None, 3, None], [0, 3, 5, 4], perc="soft", seed=13, lead=0.28), 0.55)

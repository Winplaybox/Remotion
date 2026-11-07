"""
Original sound kit for all engines, synthesised from scratch (no samples, no licences needed).
Writes MP3s to public/sfx/. Re-run any time:  python scripts/sound/synth.py
"""
import os, subprocess, wave
import numpy as np

SR = 44100
OUT = os.path.join("public", "sfx")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

def t(sec): return np.arange(int(sec * SR)) / SR
def env(n, a=0.005, r=0.2):
    e = np.ones(n); A = max(1, int(a * SR)); R = max(1, int(r * SR))
    e[:A] = np.linspace(0, 1, A); e[-R:] *= np.linspace(1, 0, R); return e
def note(f, sec, harm=(1, .5, .25), a=0.005, r=None, decay=3.0):
    x = t(sec); s = sum(h * np.sin(2 * np.pi * f * (i + 1) * x) for i, h in enumerate(harm))
    return s * np.exp(-decay * x) * env(len(x), a, r or sec * 0.3)
def lp(x, k=0.05):
    y = np.zeros_like(x); acc = 0.0
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

# ---------- one-shot SFX ----------
save("tick", note(1800, 0.06, (1, .3), decay=60) + 0.3 * lp(noise(0.06), 0.4) * np.exp(-80 * t(0.06)), 0.5)
save("ding", note(hz(84), 1.6, (1, .6, .3, .15), decay=2.2) + 0.6 * note(hz(91), 1.6, (1, .4), decay=2.6), 0.7)
save("pop", np.sin(2 * np.pi * (600 - 400 * t(0.12) / 0.12) * t(0.12)) * np.exp(-30 * t(0.12)), 0.6)
w = noise(0.45); sweep = np.linspace(0.02, 0.35, len(w)); y = np.zeros_like(w); acc = 0.0
for i, v in enumerate(w): acc += sweep[i] * (v - acc); y[i] = acc
save("whoosh", y * np.sin(np.pi * np.linspace(0, 1, len(y))) ** 2, 0.55)
save("swoosh", lp(noise(0.22), 0.25) * np.sin(np.pi * np.linspace(0, 1, int(0.22 * SR))) ** 3, 0.4)
x = t(1.2); riser = np.sin(2 * np.pi * (200 + 900 * x ** 2) * x) * np.linspace(0, 1, len(x)) ** 2 + 0.3 * lp(noise(1.2), 0.3) * np.linspace(0, 1, len(x)) ** 3
save("riser", riser, 0.5)
x = t(0.5); horn = (np.sign(np.sin(2 * np.pi * 415 * x)) + np.sign(np.sin(2 * np.pi * 523 * x))) * env(len(x), 0.01, 0.08)
save("horn", lp(horn, 0.15), 0.35)
bell = sum(note(hz(72) * r, 3.0, (1,), decay=d) * g for r, d, g in [(1, 1.2, 1), (2.76, 2, .5), (5.4, 3, .3), (8.9, 4, .2)])
save("bell", bell, 0.6)
steps = np.zeros(int(2.0 * SR))
for k in range(4):
    place(steps, lp(noise(0.09), 0.08) * np.exp(-35 * t(0.09)) + 0.5 * note(90, 0.09, (1,), decay=40), 0.1 + k * 0.48)
save("footsteps", steps, 0.6)

# ---------- loops (ambience) ----------
save("engine_loop", sum(np.sin(2 * np.pi * f * t(4)) * g for f, g in [(48, 1), (96, .5), (144, .25)]) * (1 + 0.15 * np.sin(2 * np.pi * 7 * t(4))) + 0.2 * lp(noise(4), 0.05), 0.35)
save("rain_loop", lp(noise(6), 0.5) * 0.6 + lp(noise(6), 0.08), 0.35)
crack = lp(noise(6), 0.06) * 0.5
for k in range(60): place(crack, noise(0.01) * 2 * np.exp(-400 * t(0.01)), rng.uniform(0, 5.9))
save("fire_loop", crack, 0.35)
x = t(6); waves = lp(noise(6), 0.03) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * x))
save("water_loop", waves, 0.35)

# ---------- original background music (loops) ----------
def music(bpm, bars, scale, root, pattern, bass, pad=True, perc=None, seed=1):
    r = np.random.default_rng(seed); beat = 60 / bpm; total = bars * 4 * beat
    buf = np.zeros(int(total * SR) + SR)
    for b in range(bars * 4):
        for k, step in enumerate(pattern):
            if step is None or r.random() < 0.15: continue
            place(buf, 0.35 * note(hz(root + scale[step % len(scale)] + 12 * (step // len(scale))), beat * 1.5, (1, .4, .1), decay=4), b * beat + k * beat / len(pattern))
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

PENTA_MAJ = [0, 2, 4, 7, 9]; PENTA_MIN = [0, 3, 5, 7, 10]; BHAIRAV = [0, 1, 4, 5, 7, 8, 11]
save("music_puzzle", music(96, 16, PENTA_MAJ, 72, [0, None, 2, 4, None, 3, 1, None], [0, 5, 7, 3], perc="soft", seed=3), 0.6)
save("music_chase", music(118, 16, PENTA_MIN, 64, [0, 2, None, 3, 4, None, 2, 1], [0, 0, 5, 3], perc="drive", seed=5), 0.6)
x = t(32); drone = sum(np.sin(2 * np.pi * hz(48 + i) * x) * g for i, g in [(0, 1), (7, .6), (12, .5), (19, .2)]) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.1 * x))
saga = 0.25 * drone + music(72, 10, BHAIRAV, 72, [0, None, None, 2, None, 4, None, None], [0, 5], pad=False, seed=9)[: len(x)]
save("music_saga", saga, 0.55)

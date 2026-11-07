import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { VoiceCues } from "@visuals/VoiceCues";
import { SoundBed, duckFromCues, type Sfx } from "@visuals/Sound";
import { NARRATORS, OUTRO_SECONDS, TITLE_SECONDS, beatStarts, narratorVideoSeconds, type Narrator, type NarratorVideo } from "./model";

const W = 1080, H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- background sets ---------- */
const Backdrop: React.FC<{ n: Narrator; frame: number }> = ({ n, frame }) => {
  const p = n.palette;
  const base = <AbsoluteFill style={{ background: `linear-gradient(180deg, ${p.bgTop}, ${p.bgBottom})` }} />;
  if (n.set === "night") {
    return (
      <>
        {base}
        <svg width={W} height={H} style={{ position: "absolute" }}>
          {Array.from({ length: 80 }, (_, i) => (
            <circle key={i} cx={random(`s${i}`) * W} cy={random(`t${i}`) * 1100} r={0.8 + random(`r${i}`) * 2} fill="#fff" opacity={0.25 + 0.5 * Math.abs(Math.sin(frame / 25 + i))} />
          ))}
          <circle cx={860} cy={250} r={90} fill="#FFF1C1" opacity={0.95} />
          <circle cx={830} cy={235} r={90} fill={p.bgTop} opacity={0.35} />
          <path d={`M0 ${H - 520} Q 270 ${H - 600} 540 ${H - 540} T 1080 ${H - 560} V ${H} H 0 Z`} fill="#0A0B22" opacity={0.85} />
        </svg>
      </>
    );
  }
  if (n.set === "noir") {
    const sweep = Math.sin(frame / 60) * 120;
    return (
      <>
        {base}
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <path d={`M${540 + sweep - 60} 0 L ${540 + sweep + 60} 0 L ${900 + sweep} ${H} L ${180 + sweep} ${H} Z`} fill="#FFF7D6" opacity={0.07} />
          {Array.from({ length: 60 }, (_, i) => {
            const x = random(`rx${i}`) * W, y = ((random(`ry${i}`) * H + frame * 28) % H);
            return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 46} stroke="#9FB3C8" strokeWidth={2} opacity={0.25} />;
          })}
        </svg>
      </>
    );
  }
  if (n.set === "paper") {
    return (
      <>
        {base}
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <g transform={`translate(540 760) rotate(${frame * 0.15})`} opacity={0.18}>
            {Array.from({ length: 16 }, (_, i) => <ellipse key={i} rx={60} ry={300} transform={`rotate(${i * 22.5})`} fill="none" stroke={p.accent} strokeWidth={3} />)}
            <circle r={330} fill="none" stroke={p.accent} strokeWidth={4} />
          </g>
          <rect x={30} y={30} width={W - 60} height={H - 60} rx={30} fill="none" stroke={p.accent} strokeWidth={6} opacity={0.5} strokeDasharray="2 14" strokeLinecap="round" />
        </svg>
      </>
    );
  }
  if (n.set === "board") {
    return (
      <>
        {base}
        <AbsoluteFill style={{ border: "26px solid #6B4423", boxShadow: "inset 0 0 120px rgba(0,0,0,.45)" }} />
        <svg width={W} height={H} style={{ position: "absolute" }}>
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${random(`bx${i}`) * W} ${random(`by${i}`) * 1200} q 40 -10 90 6`} stroke="#fff" strokeWidth={3} opacity={0.08} fill="none" />)}
        </svg>
      </>
    );
  }
  // bright
  return (
    <>
      {base}
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {Array.from({ length: 14 }, (_, i) => {
          const y = (random(`fy${i}`) * H - frame * (1 + random(`fs${i}`) * 2) + H * 2) % H;
          return <circle key={i} cx={random(`fx${i}`) * W} cy={y} r={20 + random(`fr${i}`) * 60} fill="#fff" opacity={0.06} />;
        })}
      </svg>
    </>
  );
};

/* ---------- narrator character (bust) ---------- */
const NarratorBust: React.FC<{ n: Narrator; talk: number; frame: number }> = ({ n, talk, frame }) => {
  const { skin, hair, outfit, accessory, hairStyle } = n.look;
  const blink = frame % 110 < 4 ? 0.1 : 1;
  const bob = Math.sin(frame / 14) * 4;
  const mouth = 4 + talk * 22;
  return (
    <svg width={520} height={560} viewBox="-260 -300 520 560" style={{ position: "absolute", left: W / 2 - 260, top: H - 560 + bob }}>
      <path d="M-230 260 Q -220 90 -110 60 L 110 60 Q 220 90 230 260 Z" fill={outfit} />
      <path d="M-60 60 L 0 130 L 60 60" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth={8} />
      <rect x={-34} y={20} width={68} height={60} fill={skin} />
      {hairStyle === "long" ? <path d="M-130 -110 Q -150 60 -95 90 L 95 90 Q 150 60 130 -110 Z" fill={hair} /> : null}
      <ellipse cx={0} cy={-60} rx={118} ry={138} fill={skin} />
      {hairStyle === "bald" ? null : <path d="M-122 -70 Q -128 -200 0 -205 Q 128 -200 122 -70 Q 90 -150 0 -150 Q -90 -150 -122 -70 Z" fill={hair} />}
      {hairStyle === "bun" ? <circle cx={0} cy={-210} r={48} fill={hair} /> : null}
      <ellipse cx={-118} cy={-50} rx={16} ry={26} fill={skin} />
      <ellipse cx={118} cy={-50} rx={16} ry={26} fill={skin} />
      <ellipse cx={-44} cy={-62} rx={13} ry={16 * blink} fill="#1A1210" />
      <ellipse cx={44} cy={-62} rx={13} ry={16 * blink} fill="#1A1210" />
      <path d="M-70 -98 Q -44 -110 -20 -98 M 20 -98 Q 44 -110 70 -98" stroke={hairStyle === "bun" ? "#9E958A" : "#2A1A12"} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M0 -50 Q -8 -10 6 -6" stroke="rgba(0,0,0,.25)" strokeWidth={5} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={26} rx={34} ry={mouth / 2} fill="#5A1E1E" />
      <ellipse cx={-70} cy={4} rx={20} ry={11} fill="#E06666" opacity={0.25} />
      <ellipse cx={70} cy={4} rx={20} ry={11} fill="#E06666" opacity={0.25} />
      {accessory === "specs" ? <g fill="none" stroke="#2B2B2B" strokeWidth={6}><circle cx={-44} cy={-62} r={30} /><circle cx={44} cy={-62} r={30} /><path d="M-14 -62 H 14" /></g> : null}
      {accessory === "tilak" ? <path d="M0 -150 L -9 -112 L 0 -100 L 9 -112 Z" fill="#D7261E" /> : null}
      {accessory === "hat" ? <g><ellipse cx={0} cy={-150} rx={190} ry={34} fill="#5B4632" /><path d="M-110 -150 Q -100 -260 0 -262 Q 100 -260 110 -150 Z" fill="#6E553C" /><rect x={-110} y={-172} width={220} height={22} fill="#2E2318" /></g> : null}
      {accessory === "cap" ? <g><path d="M-122 -110 Q -120 -215 0 -218 Q 120 -215 122 -110 Z" fill="#FF5A5F" /><path d="M20 -120 Q 140 -128 190 -100 Q 130 -92 20 -100 Z" fill="#E0484D" /></g> : null}
    </svg>
  );
};

/* ---------- captions with karaoke highlight ---------- */
const Caption: React.FC<{ text: string; progress: number; n: Narrator; inP: number }> = ({ text, progress, n, inP }) => {
  const words = text.split(/\s+/).filter(Boolean);
  const total = words.reduce((s, w) => s + w.length + 1, 0);
  let acc = 0;
  const size = text.length > 90 ? 52 : text.length > 55 ? 60 : 68;
  return (
    <div style={{ position: "absolute", top: 1010, left: 60, right: 60, textAlign: "center", fontFamily: FONT.ui, fontWeight: 900, fontSize: size, lineHeight: 1.22, opacity: inP, transform: `translateY(${(1 - inP) * 30}px)` }}>
      {words.map((w, i) => {
        const start = acc / total; acc += w.length + 1;
        const lit = progress >= start;
        return (
          <span key={i} style={{ color: lit ? n.palette.accent : n.palette.text, textShadow: n.set === "paper" ? "none" : "0 4px 0 rgba(0,0,0,.45)", marginRight: "0.28em", display: "inline-block" }}>{w}</span>
        );
      })}
    </div>
  );
};

export const NarratorVideoComposition: React.FC<NarratorVideo> = (p) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const n = NARRATORS[p.narrator];
  const pal = n.palette;
  const starts = beatStarts(p);
  const end = narratorVideoSeconds(p);
  const outroAt = end - OUTRO_SECONDS;
  const idx = starts.findIndex((s, i) => t >= s && t < s + p.beats[i]!.seconds);
  const beat = idx >= 0 ? p.beats[idx]! : null;
  const bt = beat ? t - starts[idx]! : 0;
  const speakEnd = beat ? Math.max(0.6, beat.seconds - 0.45) : 0;
  const speaking = beat && bt > 0.12 && bt < speakEnd;
  const talk = speaking ? Math.abs(Math.sin(frame * 0.9) * 0.7 + Math.sin(frame * 0.37) * 0.3) : t < TITLE_SECONDS && t > 0.3 ? Math.abs(Math.sin(frame * 0.8)) * 0.6 : 0;
  const cardIn = beat ? spring({ frame: Math.round(bt * fps), fps, config: { damping: 12, stiffness: 150 } }) : 0;
  const titleP = spring({ frame, fps, config: { damping: 14 } });
  const titleOut = interpolate(t, [TITLE_SECONDS - 0.3, TITLE_SECONDS], [1, 0], clamp);
  const outroP = spring({ frame: frame - Math.round(outroAt * fps), fps, config: { damping: 12 } });
  const voice = p.beats.flatMap((b, i) => (b.voice ? [{ src: b.voice, at: starts[i]! + 0.12 }] : []));
  const sfx: Sfx[] = [
    { src: "sfx/whoosh.mp3", at: 0.1, volume: 0.35 },
    ...starts.map((s): Sfx => ({ src: "sfx/pop.mp3", at: s + 0.02, volume: 0.25 })),
    { src: "sfx/ding.mp3", at: outroAt + 0.1, volume: 0.4 }
  ];
  const cardBg = n.set === "paper" ? pal.card : `${pal.card}E6`;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop n={n} frame={frame} />
      <VoiceCues cues={voice} />
      {p.sound ? <SoundBed music={n.music} musicVolume={0.12} duck={duckFromCues(voice)} sfx={sfx} /> : null}

      {/* top bar: narrator label + progress */}
      <div style={{ position: "absolute", top: 90, left: 60, right: 60, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 30, letterSpacing: 4, color: n.set === "paper" ? pal.text : "#111", background: n.set === "paper" ? pal.card : pal.accent, padding: "8px 22px", borderRadius: 12, border: n.set === "paper" ? `3px solid ${pal.accent}` : "none" }}>{n.label}</div>
        <div style={{ flex: 1, display: "flex", gap: 8 }}>
          {p.beats.map((_, i) => <div key={i} style={{ flex: 1, height: 10, borderRadius: 6, background: i < idx || t >= outroAt ? pal.accent : i === idx ? `${pal.accent}AA` : "rgba(127,127,127,.35)" }} />)}
        </div>
      </div>

      {/* title card */}
      {t < TITLE_SECONDS ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 420, opacity: titleOut }}>
          <div style={{ fontFamily: FONT.display, fontSize: Math.min(140, 2000 / Math.max(8, p.title.length)), lineHeight: 1.02, color: pal.text, textAlign: "center", padding: "0 70px", transform: `scale(${0.7 + titleP * 0.3})`, textShadow: n.set === "paper" ? "none" : `0 8px 0 rgba(0,0,0,.35), 0 0 40px ${pal.accent}66` }}>{p.title}</div>
        </AbsoluteFill>
      ) : null}

      {/* beat card */}
      {beat && t < outroAt ? (
        <>
          <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 560, height: 560, borderRadius: 60, background: cardBg, border: `6px solid ${pal.accent}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.6 + 0.4 * cardIn}) rotate(${(1 - cardIn) * -8 + Math.sin(frame / 30) * 1.5}deg)`, boxShadow: `0 20px 60px rgba(0,0,0,.35), 0 0 60px ${pal.accent}44` }}>
              <div style={{ fontSize: 300, lineHeight: 1, fontFamily: "'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif" }}>{beat.icon || "✨"}</div>
            </div>
          </div>
          <Caption text={beat.caption} progress={interpolate(bt, [0.12, speakEnd], [0, 1], clamp)} n={n} inP={interpolate(bt, [0, 0.25], [0, 1], clamp)} />
        </>
      ) : null}

      {/* outro */}
      {t >= outroAt ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 520 }}>
          <div style={{ fontFamily: FONT.display, fontSize: 96, color: pal.text, textAlign: "center", padding: "0 80px", lineHeight: 1.05, transform: `scale(${0.7 + outroP * 0.3})` }}>{p.outro}</div>
          {p.handle ? <div style={{ marginTop: 30, fontFamily: FONT.mono, fontWeight: 700, fontSize: 36, color: pal.accent }}>{p.handle}</div> : null}
        </AbsoluteFill>
      ) : null}

      <NarratorBust n={n} talk={talk} frame={frame} />
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 28, letterSpacing: 3, color: "#111", background: pal.accent, padding: "6px 22px", borderRadius: 99 }}>{n.label}</div>
      </div>
    </AbsoluteFill>
  );
};

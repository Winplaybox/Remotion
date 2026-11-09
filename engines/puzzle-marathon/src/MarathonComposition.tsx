import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { SoundBed, duckFromCues, type Sfx } from "@visuals/Sound";
import { VoiceCues } from "@visuals/VoiceCues";
import { OddOrbitComposition } from "../../odd-orbit/src/OddOrbitComposition";
import type { OddOrbit } from "../../odd-orbit/src/model";
import { TrackVehicleComposition } from "../../track-vehicle/src/TrackVehicleComposition";
import type { TrackVehicle } from "../../track-vehicle/src/model";
import { FPS, HIDDEN_COUNT, answerAt, marathonTimeline, type Marathon, type MarathonLevel, type Segment } from "./model";

const BG = "linear-gradient(135deg, #070B1A 0%, #0E1430 55%, #160B26 100%)";
const GOLD = "#FFD23F";
// Vertical puzzle canvas, cropped to its busy part (title -> grid) and scaled to full height.
// Kaali Peeli grids reach further down (4 rows), so its crop is taller. Same panel width for both keeps the layout fixed.
const CROP: Record<string, [number, number]> = { orbit: [60, 1640], track: [40, 1860] };
const PANEL_W = 1080 * (1080 / (1640 - 60));
const SIDE = (1920 - PANEL_W) / 2;
const DIFF_COLOR: Record<string, string> = { easy: "#5BE38A", medium: "#4FC3FF", hard: "#FF9F43", expert: "#FF5A6E" };

const Pop: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f - delay, fps: FPS, config: { damping: 14, stiffness: 120 } });
  return <div style={{ ...style, opacity: s, transform: `translateY(${(1 - s) * 30}px) scale(${0.92 + s * 0.08})` }}>{children}</div>;
};

const Subscribe: React.FC<{ handle: string }> = ({ handle }) => {
  const f = useCurrentFrame();
  const tapped = f > 40;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 34, justifyContent: "center" }}>
      <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 34, color: "#fff", background: tapped ? "#2E2E38" : "#FF2B2B", padding: "16px 40px", borderRadius: 14, transform: `scale(${f > 34 && f < 44 ? 0.92 : 1})` }}>{tapped ? "✓ SUBSCRIBED" : "SUBSCRIBE"}</div>
      <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 28, color: "#9FB3FF" }}>{handle}</div>
    </div>
  );
};

const Hook: React.FC<{ m: Marathon }> = ({ m }) => {
  const off = m.prevBonus ? 3.3 * FPS : 0;
  return (
    <AbsoluteFill style={{ background: BG }}>
      {m.prevBonus ? (
        <Sequence durationInFrames={off} layout="none">
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <Pop><div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 34, letterSpacing: 6, color: "#9FB3FF" }}>PICHHLE EPISODE KE BONUS KA JAWAB</div></Pop>
            <Pop delay={6}><div style={{ fontFamily: FONT.display, fontSize: 150, color: "#0B0F1F", background: GOLD, padding: "10px 60px", borderRadius: 30, marginTop: 24 }}>{m.prevBonus}</div></Pop>
            <Pop delay={14}><div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 40, color: "#fff", marginTop: 24 }}>Sahi pakda tha? 👀</div></Pop>
          </AbsoluteFill>
        </Sequence>
      ) : null}
      <Sequence from={off} layout="none">
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <Pop><div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: "#9FB3FF" }}>{m.series} #{m.episode}</div></Pop>
          <Pop delay={6}><div style={{ fontFamily: FONT.display, fontSize: 118, color: "#fff", lineHeight: 1.05, marginTop: 20, textShadow: "0 8px 0 #2B1D6B" }}>{m.title}</div></Pop>
          <Pop delay={18}><div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 44, color: GOLD, marginTop: 30 }}>{m.tagline}</div></Pop>
          <Pop delay={34}><div style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 36, color: "#DDE3FF", marginTop: 26 }}>✍️ Paper-pen lo · har sahi jawab = +1 point · end mein apna rank dekho</div></Pop>
          <Pop delay={50}>
            <div style={{ display: "flex", gap: 16, marginTop: 44, justifyContent: "center" }}>
              {(["easy", "medium", "hard", "expert"] as const).map((d) => (
                <div key={d} style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 26, color: "#0B0F1F", background: DIFF_COLOR[d], padding: "10px 22px", borderRadius: 10 }}>{d.toUpperCase()}</div>
              ))}
            </div>
          </Pop>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const LevelCard: React.FC<{ l: MarathonLevel; total: number; unit: string; bonus?: boolean | undefined }> = ({ l, total, unit, bonus }) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [l.levelCard * FPS - 8, l.levelCard * FPS], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const c = bonus ? GOLD : DIFF_COLOR[l.difficulty] ?? GOLD;
  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center", opacity: out }}>
      <Pop><div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 34, letterSpacing: 8, color: c }}>{bonus ? "SIRF 1% SOLVE KARTE HAIN" : l.difficulty.toUpperCase()}</div></Pop>
      <Pop delay={3}><div style={{ fontFamily: FONT.display, fontSize: 240, color: bonus ? GOLD : "#fff", lineHeight: 1 }}>{bonus ? `BONUS ${unit}` : `${unit} ${l.no}`}</div></Pop>
      {bonus ? null : <Pop delay={8}><div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 40, color: "#9FB3FF" }}>{l.no} / {total}{l.hidden ? " · jawab END mein 🔒" : ""}</div></Pop>}
    </AbsoluteFill>
  );
};

const scaleOf = (l: MarathonLevel) => { const [a, b] = CROP[l.game]!; return 1080 / (b - a); };

/** The vertical puzzle, cropped + scaled into the middle of the 16:9 frame. */
const Panel: React.FC<{ l: MarathonLevel; revealSeconds?: number }> = ({ l, revealSeconds }) => {
  const r = revealSeconds !== undefined;
  const game = l.game === "orbit"
    ? <OddOrbitComposition {...(l.puzzle as OddOrbit)} {...(r ? { revealSeconds } : {})} />
    : <TrackVehicleComposition {...(l.puzzle as TrackVehicle)} {...(r ? { answerSeconds: revealSeconds, cta: "" } : {})} />;
  return (
  <div style={{ position: "absolute", left: SIDE, top: 0, width: PANEL_W, height: 1080, overflow: "hidden", borderRadius: 28, boxShadow: "0 0 0 3px rgba(159,179,255,.25)", background: "#0B0D12" }}>
    <div style={{ position: "absolute", left: (PANEL_W - 1080 * scaleOf(l)) / 2, top: -CROP[l.game]![0] * scaleOf(l), width: 1080, height: 1920, transform: `scale(${scaleOf(l)})`, transformOrigin: "top left" }}>
      {game}
    </div>
  </div>
  );
};

const LeftBar: React.FC<{ l: MarathonLevel; total: number; unit: string; bonus?: boolean | undefined }> = ({ l, total, unit, bonus }) => {
  const c = bonus ? GOLD : DIFF_COLOR[l.difficulty] ?? GOLD;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: SIDE, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 18 }}>
      <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: "#9FB3FF" }}>{bonus ? "BONUS" : unit}</div>
      <div style={{ fontFamily: FONT.display, fontSize: bonus ? 150 : 200, color: bonus ? GOLD : "#fff", lineHeight: 0.9 }}>{bonus ? "★" : l.no}</div>
      {bonus ? null : <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 34, color: "#9FB3FF" }}>of {total}</div>}
      <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 28, color: "#0B0F1F", background: c, padding: "8px 22px", borderRadius: 10, marginTop: 10 }}>{bonus ? "1% ONLY" : l.difficulty.toUpperCase()}</div>
      {bonus ? null : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 26px)", gap: 10, marginTop: 30 }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i} style={{ width: 26, height: 26, borderRadius: 7, background: i + 1 < l.no ? "#5B6CFF" : i + 1 === l.no ? GOLD : i + 1 > total - HIDDEN_COUNT ? "rgba(255,90,110,.25)" : "rgba(255,255,255,.1)", boxShadow: i + 1 === l.no ? `0 0 16px ${GOLD}` : "none" }} />
          ))}
        </div>
      )}
    </div>
  );
};

const Right: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: SIDE, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 40px" }}>{children}</div>
);

const LevelView: React.FC<{ l: MarathonLevel; total: number; unit: string; handle: string; bonus?: boolean | undefined; askSeconds?: number }> = ({ l, total, unit, handle, bonus, askSeconds = 0 }) => {
  const cardF = l.levelCard * FPS;
  const playF = l.play * FPS;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence from={cardF} layout="none">
        <Panel l={l} />
        <LeftBar l={l} total={total} unit={unit} bonus={bonus} />
        <Right>
          <Sequence durationInFrames={playF} layout="none">
            <Pop>
              {l.game === "orbit" ? (
                <>
                  <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 46, color: "#fff", lineHeight: 1.2 }}>Odd one<br />dhundo 👀</div>
                  <div style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 30, color: "#9FB3FF", marginTop: 24, lineHeight: 1.4 }}>Timer khatam hone se<br />pehle ROW + NUMBER<br />yaad rakho</div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 46, color: "#fff", lineHeight: 1.2 }}>Nazar mat<br />hatana 👀</div>
                  <div style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 30, color: "#9FB3FF", marginTop: 24, lineHeight: 1.4 }}>Shuffle ke baad<br />NUMBER yaad rakho</div>
                </>
              )}
              <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, color: "#9FB3FF", marginTop: 40, opacity: 0.7 }}>{handle}</div>
            </Pop>
          </Sequence>
          <Sequence from={playF} layout="none">
            {bonus ? null : l.hidden ? (
              <Pop>
                <div style={{ fontFamily: FONT.display, fontSize: 110, color: "#FF5A6E", lineHeight: 1 }}>🔒 LOCK</div>
                <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 36, color: "#fff", marginTop: 16, lineHeight: 1.3 }}>Apna jawab likh lo ✍️<br />jawab video ke END mein</div>
              </Pop>
            ) : (
              <Pop>
                <div style={{ fontFamily: FONT.display, fontSize: 96, color: "#5BE38A", lineHeight: 1 }}>SAHI?</div>
                <div style={{ fontFamily: FONT.display, fontSize: 150, color: GOLD, lineHeight: 1.1 }}>+1</div>
                <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 34, color: "#fff" }}>apne score mein jodo ✍️</div>
              </Pop>
            )}
          </Sequence>
        </Right>
      </Sequence>
      <Sequence durationInFrames={cardF} layout="none"><LevelCard l={l} total={total} unit={unit} bonus={bonus} /></Sequence>
      {bonus ? (
        <Sequence from={cardF + playF} durationInFrames={askSeconds * FPS} layout="none">
          <AbsoluteFill style={{ background: "rgba(5,6,18,.86)", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <Pop><div style={{ fontFamily: FONT.display, fontSize: 120, color: GOLD }}>BONUS KA JAWAB?</div></Pop>
            <Pop delay={8}><div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 52, color: "#fff", marginTop: 10 }}>Comment karo 👇 — jawab AGLE EPISODE mein!</div></Pop>
            <Pop delay={18}><Subscribe handle={handle} /></Pop>
          </AbsoluteFill>
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

/** Expert levels' answers: each puzzle shown at its reveal moment for 4 s. */
const AnswerRound: React.FC<{ m: Marathon }> = ({ m }) => {
  const hidden = m.levels.filter((l) => l.hidden);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence durationInFrames={3 * FPS} layout="none">
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <Pop><div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 36, letterSpacing: 8, color: "#FF5A6E" }}>ANSWER ROUND</div></Pop>
          <Pop delay={5}><div style={{ fontFamily: FONT.display, fontSize: 150, color: "#fff" }}>EXPERT {m.unit}S KE JAWAB</div></Pop>
        </AbsoluteFill>
      </Sequence>
      {hidden.map((l, i) => (
        <Sequence key={l.no} from={answerAt(i) * FPS} durationInFrames={4 * FPS} layout="none">
          <AbsoluteFill>
            {/* Start the puzzle at the end of play so its reveal animation runs. */}
            <Sequence from={-l.play * FPS} layout="none"><Panel l={l} revealSeconds={3.6} /></Sequence>
            <LeftBar l={l} total={m.levels.length} unit={m.unit} />
            <Right>
              <Pop>
                <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: "#9FB3FF", letterSpacing: 4 }}>{m.unit} {l.no} KA JAWAB</div>
                <div style={{ fontFamily: FONT.display, fontSize: 84, color: GOLD, marginTop: 10 }}>{l.answer}</div>
                <div style={{ fontFamily: FONT.display, fontSize: 90, color: "#5BE38A", marginTop: 10 }}>SAHI? +1</div>
              </Pop>
            </Right>
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const CheckpointView: React.FC<{ s: Segment; handle: string }> = ({ s, handle }) => (
  <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
    <Pop><div style={{ fontFamily: FONT.display, fontSize: 130, color: GOLD }}>{s.checkpoint!.title}</div></Pop>
    <Pop delay={8}><div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 48, color: "#fff", whiteSpace: "pre-line", lineHeight: 1.35, marginTop: 10 }}>{s.checkpoint!.line}</div></Pop>
    <Pop delay={20}><Subscribe handle={handle} /></Pop>
  </AbsoluteFill>
);

const Result: React.FC<{ m: Marathon }> = ({ m }) => (
  <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
    <Pop><div style={{ fontFamily: FONT.display, fontSize: 120, color: "#fff" }}>AAPKA SCORE?</div></Pop>
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20, width: 1100 }}>
      {m.ranks.map((r, i) => {
        const next = m.ranks[i - 1];
        const range = next ? `${r.min}-${next.min - 1}` : `${r.min}-${m.levels.length}`;
        return (
          <Pop key={r.title} delay={10 + i * 8}>
            <div style={{ display: "flex", alignItems: "center", gap: 28, background: "rgba(255,255,255,.06)", border: "2px solid rgba(159,179,255,.25)", borderRadius: 18, padding: "16px 30px" }}>
              <div style={{ fontFamily: FONT.display, fontSize: 56, color: GOLD, width: 190, textAlign: "left" }}>{range}</div>
              <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 46, color: "#fff", width: 380, textAlign: "left" }}>{r.title}</div>
              <div style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 30, color: "#9FB3FF", textAlign: "left" }}>{r.line}</div>
            </div>
          </Pop>
        );
      })}
    </div>
    <Pop delay={50}><div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 50, color: GOLD, marginTop: 34 }}>Comment mein apna score likho 👇 · abhi BONUS {m.unit.toLowerCase()} baaki hai!</div></Pop>
  </AbsoluteFill>
);

export const MarathonComposition: React.FC<Marathon> = (m) => {
  useBundledFonts();
  const { durationInFrames } = useVideoConfig();
  const tl = marathonTimeline(m);
  const sfx: Sfx[] = [{ src: "sfx/riser.mp3", at: 0.2, volume: 0.35 }];
  for (const s of tl) {
    const at = s.from / FPS;
    if ((s.kind === "level" || s.kind === "bonus") && s.level) {
      const start = at + s.level.levelCard;
      sfx.push({ src: "sfx/whoosh.mp3", at, volume: 0.35 }, { src: "sfx/pop.mp3", at: start + 0.2, volume: 0.3 });
      for (const k of [3, 2, 1]) sfx.push({ src: "sfx/tick.mp3", at: start + s.level.play - k, volume: 0.45 });
      sfx.push({ src: s.level.hidden ? "sfx/pop.mp3" : "sfx/ding.mp3", at: start + s.level.play, volume: 0.55 });
    }
    if (s.kind === "answers") m.levels.filter((l) => l.hidden).forEach((_, i) => sfx.push({ src: "sfx/ding.mp3", at: at + answerAt(i) + 0.1, volume: 0.5 }));
    if (s.kind === "checkpoint" || s.kind === "result") sfx.push({ src: "sfx/bell.mp3", at: at + 0.1, volume: 0.45 });
  }
  return (
    <AbsoluteFill style={{ background: BG }}>
      <VoiceCues cues={m.voice} />
      <SoundBed music={m.game === "orbit" ? "sfx/music_puzzle.mp3" : "sfx/music_chase.mp3"} musicVolume={0.13} duck={duckFromCues(m.voice)} sfx={sfx.filter((x) => x.at * FPS < durationInFrames)} />
      {tl.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.frames}>
          {s.kind === "hook" ? <Hook m={m} />
            : s.kind === "level" ? <LevelView l={s.level!} total={m.levels.length} unit={m.unit} handle={m.handle} />
            : s.kind === "bonus" ? <LevelView l={s.level!} total={m.levels.length} unit={m.unit} handle={m.handle} bonus askSeconds={m.bonusAskSeconds} />
            : s.kind === "checkpoint" ? <CheckpointView s={s} handle={m.handle} />
            : s.kind === "answers" ? <AnswerRound m={m} />
            : <Result m={m} />}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

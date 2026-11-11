import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { VoiceCues } from "@visuals/VoiceCues";
import { SoundBed, duckFromCues, type Sfx } from "@visuals/Sound";
import { PrevAnswerCard } from "@visuals/PrevAnswer";
import { AskOutro } from "@visuals/AskOutro";
import { Character, type Pose } from "@visuals/rig/Character";
import { SetBackground } from "@visuals/rig/Sets";
import type { CastId as PresetId } from "@visuals/rig/cast";
import { Caption, CaseStamp, ClueNote, CountdownRing, SpeechBubble, Spotlight } from "@visuals/StoryKit";
import { askOutroSfx, followTapAt } from "../../ask-outro";
import { introLength, liarBeats, outroStart, type LiarLineup } from "./model";

/**
 * Layout (1080x1920): 0-180 brand + CASE · 190-340 title + place/time · 360-580 clue board ·
 * 600-900 speech bubble / countdown · 960-1450 cast on the floor · 1470-1560 number + name · 1580-1700 caption.
 * Timeline: [prev answer] → hook (jasoos) → 3 clues → lineup walks in → 3 alibis in spotlight → think countdown → AskOutro.
 */
const XS = [196, 540, 884];
const FLOOR = 1452;
const SCALE = 0.95;
const THINK_POSES: Pose[] = ["think", "shrug", "hipHand"];

export const LiarLineupComposition: React.FC<LiarLineup> = (p) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const beats = liarBeats(p);
  const outroAt = outroStart(p);
  const cur = [...beats].reverse().find((b) => t >= b.start) ?? beats[0]!;
  const inBeat = t >= cur.start && t < cur.start + cur.dur + 0.3;
  const local = Math.round((t - cur.start) * fps);
  const hook = beats.find((b) => b.kind === "hook")!;
  const lineup = beats.find((b) => b.kind === "lineup")!;
  const think = beats.find((b) => b.kind === "think")!;
  const clueBeats = beats.filter((b) => b.kind === "clue");
  const alibiBeats = beats.filter((b) => b.kind === "alibi");
  const inOutro = t >= outroAt;
  const speaking = cur.kind === "alibi" && inBeat ? cur.index : -1;
  const thinking = t >= think.start;

  // jasoos: enters with the hook, narrates the clues, leaves when the suspects arrive
  const jIn = spring({ frame: frame - Math.round(hook.start * fps), fps, config: { damping: 14 } });
  const jOut = interpolate(t, [lineup.start - 0.1, lineup.start + 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const jasoosX = -260 + 800 * jIn - 900 * jOut;
  const jasoosTalking = (cur.kind === "hook" || cur.kind === "clue") && inBeat && t - cur.start < cur.dur - 0.3;

  // zoom: slow push-in over the whole video
  const zoom = 1 + 0.05 * Math.min(1, t / Math.max(1, outroAt));
  const spotAmount = speaking >= 0 ? Math.min(1, (t - cur.start) * 4) * interpolate(t, [cur.start + cur.dur, cur.start + cur.dur + 0.3], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const sfx: Sfx[] = [
    ...(p.introSeconds > 0 ? [{ src: "sfx/ding.mp3", at: 0.15, volume: 0.4 }] : []),
    { src: "sfx/bell.mp3", at: hook.start + 0.05, volume: 0.35 },
    { src: "sfx/whoosh.mp3", at: hook.start + 0.4, volume: 0.45 },
    ...clueBeats.map((b): Sfx => ({ src: "sfx/pop.mp3", at: b.start + 0.05, volume: 0.45 })),
    { src: "sfx/footsteps.mp3", at: lineup.start + 0.2, until: lineup.start + 1.6, volume: 0.35 },
    ...alibiBeats.map((b): Sfx => ({ src: "sfx/swoosh.mp3", at: b.start, volume: 0.35 })),
    { src: "sfx/riser.mp3", at: think.start, volume: 0.3 },
    ...Array.from({ length: Math.floor(p.thinkSeconds) }, (_, k): Sfx => ({ src: "sfx/tick.mp3", at: think.start + k + 0.05, volume: 0.55 })),
    ...askOutroSfx(p.askOutro, outroAt)
  ];

  const titleIn = spring({ frame: frame - Math.round(hook.start * fps), fps, config: { damping: 14 } });
  const accent = p.accent;
  const caption = (() => {
    if (inOutro || cur.kind === "prev" || cur.kind === "alibi" || cur.kind === "think") return "";
    return inBeat ? cur.r : "";
  })();

  return (
    <AbsoluteFill style={{ background: "#120A14", overflow: "hidden" }}>
      <VoiceCues cues={p.voice} />
      {p.sound ? <SoundBed music="sfx/music_puzzle.mp3" musicVolume={0.12} duck={duckFromCues(p.voice, 3.4)} sfx={sfx} /> : null}

      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "540px 1250px" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <SetBackground set={p.set} t={t} />
        </svg>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {jOut < 1 ? (
            <g transform={`translate(${jasoosX} ${FLOOR}) scale(${SCALE * 1.12})`}>
              <Character look="jasoos" pose={cur.kind === "clue" ? "point" : "talk"} talking={jasoosTalking} frame={frame} seed="jasoos" expression="smug" />
            </g>
          ) : null}
          {p.suspects.map((s, i) => {
            const enter = spring({ frame: frame - Math.round((lineup.start + i * 0.25) * fps), fps, config: { damping: 15, stiffness: 90 } });
            if (enter <= 0.001) return null;
            const from = i === 0 ? -300 : i === 2 ? 1380 : 540;
            const x = from + (XS[i]! - from) * enter;
            const y = FLOOR + (i === 1 ? (1 - enter) * 700 : 0) - Math.abs(Math.sin(enter * Math.PI * 4)) * 14 * (1 - enter);
            const pose: Pose = speaking === i ? "talk" : thinking ? THINK_POSES[(i + p.postNo) % 3]! : "idle";
            const expression = speaking === i ? "neutral" : thinking ? "worried" : "neutral";
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${SCALE})`}>
                <Character look={s.preset as PresetId} pose={pose} talking={speaking === i} expression={expression} frame={frame} seed={`${p.postNo}-${i}`} facing={i === 2 ? -1 : 1} />
              </g>
            );
          })}
        </svg>
        <Spotlight x={XS[Math.max(0, speaking)]!} y={1180} rx={250} ry={560} amount={spotAmount} id="spot" />
      </AbsoluteFill>

      {/* number + name plates */}
      {p.suspects.map((s, i) => {
        const k = spring({ frame: frame - Math.round((lineup.start + 0.5 + i * 0.25) * fps), fps, config: { damping: 13 } });
        if (k <= 0.001) return null;
        const lit = speaking === i;
        return (
          <div key={i} style={{ position: "absolute", left: XS[i]! - 165, top: 1468, width: 330, textAlign: "center", opacity: k * (speaking >= 0 && !lit ? 0.55 : 1), transform: `scale(${(0.6 + 0.4 * k) * (lit ? 1.08 : 1)})` }}>
            <span style={{ display: "inline-block", width: 64, height: 64, lineHeight: "64px", borderRadius: 32, background: accent, color: "#120A14", fontFamily: FONT.display, fontSize: 44, border: "4px solid #120A14", verticalAlign: "middle" }}>{i + 1}</span>
            <span style={{ fontFamily: FONT.display, fontSize: 46, color: "#fff", marginLeft: 12, verticalAlign: "middle", textShadow: "0 3px 0 #000" }}>{s.name.r.toUpperCase()}</span>
            <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 26, color: "#FFE9B0", textShadow: "0 2px 0 #000", marginTop: 2 }}>{s.role.r}</div>
          </div>
        );
      })}

      {/* top bands */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 600, background: "linear-gradient(180deg, rgba(10,6,14,.92) 0%, rgba(10,6,14,.75) 70%, rgba(10,6,14,0))" }} />
      <div style={{ position: "absolute", top: 56, left: 56, right: 56, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: FONT.ui, fontWeight: 900, fontSize: 32, color: "#fff" }}>
        <span>🕵️ {p.brand}</span>
        <span style={{ fontFamily: FONT.display, fontSize: 50, color: accent }}>CASE #{String(p.postNo).padStart(3, "0")}</span>
      </div>
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", opacity: titleIn, transform: `translateY(${(1 - titleIn) * -30}px)` }}>
        <div style={{ fontFamily: FONT.display, fontSize: Math.min(104, 1900 / p.title.length), color: "#fff", textShadow: "0 5px 0 #000", lineHeight: 1.05 }}>{p.title}</div>
        <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 32, color: "#FFE9B0", marginTop: 6 }}>📍 {p.place.r} · ⏰ {p.time.r}</div>
      </div>

      {/* clue board */}
      {p.clues.map((c, i) => {
        const b = clueBeats[i]!;
        return (
          <ClueNote key={i} n={i + 1} text={c.r} f={frame - Math.round(b.start * fps)} fps={fps} x={28 + i * 346} y={326} w={330} h={250} tilt={[-2.5, 1.5, -1][i]!}
            active={cur.kind === "clue" && cur.index === i && inBeat} accent={accent} />
        );
      })}

      {cur.kind === "hook" ? <CaseStamp text={`CASE #${String(p.postNo).padStart(3, "0")}`} f={local - 6} fps={fps} color="#FF4A3D" x={760} y={760} /> : null}

      {speaking >= 0 ? (
        <SpeechBubble text={p.suspects[speaking]!.alibi.r} name={`#${speaking + 1} ${p.suspects[speaking]!.name.r.toUpperCase()} (${p.suspects[speaking]!.role.r})`}
          f={local} fps={fps} tx={XS[speaking]!} ty={980} top={612} accent={accent} />
      ) : null}

      {thinking && !inOutro ? (
        <CountdownRing seconds={think.dur} elapsed={t - think.start} x={540} y={760} r={110} color={accent} label="KAUN JHOOTHA? 🤥" />
      ) : null}

      <Caption text={caption} f={local} fps={fps} accent={accent} />
      <div style={{ position: "absolute", top: 1760, width: "100%", textAlign: "center", fontFamily: FONT.mono, fontSize: 28, color: "#FFE9B0", opacity: 0.75 }}>{p.handle}</div>

      <AskOutro from={Math.round(outroAt * fps)} a={p.askOutro} accent={accent} tapAt={followTapAt(p.askOutro)} />
      {p.introSeconds > 0 && p.prevAnswer ? (
        <PrevAnswerCard seconds={introLength(p)} heading={`PICHHLE CASE #${String(p.postNo - 1).padStart(3, "0")} KA JHOOTHA`} answer={p.prevAnswer} accent={accent} bg="linear-gradient(180deg,#1B0F1E,#2A1426)" />
      ) : null}
    </AbsoluteFill>
  );
};

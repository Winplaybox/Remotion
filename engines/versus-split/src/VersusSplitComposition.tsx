import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AskOutro } from "../../../packages/visuals/src/AskOutro";
import { FONT, useBundledFonts } from "../../../packages/visuals/src/fonts";
import { PrevAnswerCard } from "../../../packages/visuals/src/PrevAnswer";
import { SoundBed, duckFromCues, type Sfx } from "../../../packages/visuals/src/Sound";
import { VoiceCues } from "../../../packages/visuals/src/VoiceCues";
import { askOutroSfx, followTapAt } from "../../ask-outro";
import type { VersusSplit } from "./model";
import { FighterEmblem, MetallicCrown, MiniCrown } from "./graphics";

/**
 * VersusSplitComposition — Exact GravityClaw & Shorts Benchmark Edition
 *
 * Visual Ground Truth:
 * - Diagonal Split: Coral (#FF5B37) on left, Royal Blue (#2B6CFF) on right
 * - Top Area: Character Avatars (Cat/Dog or Anime/Gaming) with bold condensed uppercase names
 * - Center Seam: Black circle badge with #FFD23F yellow/gold border and bold "VS"
 * - Bottom Card: Single rounded dark translucent card holding 3 stat comparison rows
 * - Stat Rows: Centered label, dual racing bars, mini gold crown (👑) on winning side
 * - Row 3 Center: Big bold live score counter (e.g. 1 - 2)
 * - Footnote: Subtle source/benchmark note below stats
 * - Climax: 3D Metallic Crown drops onto the grand winner with spring bounce
 */
export const VersusSplitComposition: React.FC<VersusSplit> = (p) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introFrames = Math.round(p.introSeconds * fps);
  const playFrames = Math.round(p.playSeconds * fps);
  const playStart = introFrames;
  const outroStart = introFrames + playFrames;
  const _inPlay = frame >= playStart && frame < outroStart;
  const f = Math.max(0, frame - playStart);

  // Climax / Crown timing
  const climaxFrame = Math.round((p.playSeconds - p.climaxSeconds) * fps);
  const isClimax = f >= climaxFrame;

  // Sound cues
  const sfx: Sfx[] = [
    { src: "sfx/whoosh.mp3", at: p.introSeconds + 0.1, volume: 0.4 },
    { src: "sfx/pop.mp3", at: p.introSeconds + 0.8, volume: 0.4 },
    { src: "sfx/bell.mp3", at: p.introSeconds + 3.0, volume: 0.35 },
    { src: "sfx/ding.mp3", at: p.introSeconds + 6.0, volume: 0.35 },
    { src: "sfx/bell.mp3", at: p.introSeconds + 9.0, volume: 0.4 },
    { src: "sfx/pop.mp3", at: p.introSeconds + p.playSeconds - p.climaxSeconds, volume: 0.55 },
    ...askOutroSfx(p.askOutro, p.introSeconds + p.playSeconds)
  ];

  // GSAP-Grade Spring Dynamics
  const slamA = spring({ frame: f, fps, config: { damping: 12, stiffness: 130 } });
  const slamB = spring({ frame: Math.max(0, f - 4), fps, config: { damping: 12, stiffness: 130 } });
  const vsSlam = spring({ frame: Math.max(0, f - 8), fps, config: { damping: 10, stiffness: 180 } });
  const cardSlam = spring({ frame: Math.max(0, f - 14), fps, config: { damping: 14, stiffness: 110 } });

  // Camera Shake
  const initialShake = f < 16 ? Math.sin(f * 2.2) * (1 - f / 16) * 12 : 0;
  const climaxShake = isClimax && f - climaxFrame < 18 ? Math.sin((f - climaxFrame) * 2.4) * (1 - (f - climaxFrame) / 18) * 16 : 0;
  const cameraShakeY = initialShake + climaxShake;

  // Rounds timing (frames from playStart)
  const r1Start = 20;
  const r2Start = 90;
  const r3Start = 160;

  const r1Progress = interpolate(f, [r1Start, r1Start + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const r2Progress = interpolate(f, [r2Start, r2Start + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const r3Progress = interpolate(f, [r3Start, r3Start + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const r1CrownSpring = spring({ frame: Math.max(0, f - (r1Start + 14)), fps, config: { damping: 8, stiffness: 220 } });
  const r2CrownSpring = spring({ frame: Math.max(0, f - (r2Start + 14)), fps, config: { damping: 8, stiffness: 220 } });
  const r3CrownSpring = spring({ frame: Math.max(0, f - (r3Start + 14)), fps, config: { damping: 8, stiffness: 220 } });

  // Real-time Score calculation
  let scoreA = 0;
  let scoreB = 0;
  if (f >= r1Start + 16) {
    if (p.rounds[0]?.win === "a") scoreA++;
    else if (p.rounds[0]?.win === "b") scoreB++;
  }
  if (f >= r2Start + 16) {
    if (p.rounds[1]?.win === "a") scoreA++;
    else if (p.rounds[1]?.win === "b") scoreB++;
  }
  if (f >= r3Start + 16) {
    if (p.rounds[2]?.win === "a") scoreA++;
    else if (p.rounds[2]?.win === "b") scoreB++;
  }

  // 3D Crown Physics on Grand Winner
  const crownSpring = spring({ frame: Math.max(0, f - climaxFrame), fps, config: { damping: 8, stiffness: 140 } });
  const crownY = interpolate(crownSpring, [0, 1], [-300, 0]);

  const winA = p.winner === "a";
  const coralA = p.fighterA.color || "#FF5B37";
  const blueB = p.fighterB.color || "#2B6CFF";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        color: "#FFFFFF",
        overflow: "hidden",
        transform: `translateY(${cameraShakeY}px)`
      }}
    >
      {/* 1. FULL-SCREEN DIAGONAL SPLIT BACKGROUND */}
      {/* Left Region (Coral #FF5B37) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(0 0, 56% 0, 44% 100%, 0 100%)",
          backgroundColor: coralA,
          zIndex: 1
        }}
      />

      {/* Right Region (Blue #2B6CFF) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(56% 0, 100% 0, 100% 100%, 44% 100%)",
          backgroundColor: blueB,
          zIndex: 1
        }}
      />

      {/* 2. TOP SECTION: FIGHTERS & AVATARS */}
      {/* Fighter A (Left Half) */}
      <div
        style={{
          position: "absolute",
          top: 190,
          left: "26%",
          transform: `translate(-50%, 0) translateY(${(1 - slamA) * -120}px)`,
          opacity: isClimax && !winA ? 0.35 : slamA,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
          transition: "opacity 0.3s ease"
        }}
      >
        {/* Grand Winner Crown Landing */}
        {isClimax && winA && (
          <div
            style={{
              position: "absolute",
              top: -110,
              transform: `translateY(${crownY}px) scale(${crownSpring})`,
              zIndex: 30
            }}
          >
            <MetallicCrown size={170} frame={frame} />
          </div>
        )}

        {/* Fighter Emblem / Character Avatar */}
        <div style={{ transform: "scale(1.05)" }}>
          <FighterEmblem name={p.fighterA.name} franchise={p.fighterA.franchise} color={coralA} size={220} />
        </div>

        {/* Bold Condensed Name */}
        <div
          style={{
            fontFamily: FONT.display,
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 1,
            color: "#FFFFFF",
            letterSpacing: 2,
            marginTop: 20,
            textTransform: "uppercase",
            textShadow: "0 6px 18px rgba(0,0,0,0.3)"
          }}
        >
          {p.fighterA.name}
        </div>
      </div>

      {/* Fighter B (Right Half) */}
      <div
        style={{
          position: "absolute",
          top: 190,
          left: "74%",
          transform: `translate(-50%, 0) translateY(${(1 - slamB) * -120}px)`,
          opacity: isClimax && winA ? 0.35 : slamB,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
          transition: "opacity 0.3s ease"
        }}
      >
        {/* Grand Winner Crown Landing */}
        {isClimax && !winA && (
          <div
            style={{
              position: "absolute",
              top: -110,
              transform: `translateY(${crownY}px) scale(${crownSpring})`,
              zIndex: 30
            }}
          >
            <MetallicCrown size={170} frame={frame} />
          </div>
        )}

        {/* Fighter Emblem / Character Avatar */}
        <div style={{ transform: "scale(1.05)" }}>
          <FighterEmblem name={p.fighterB.name} franchise={p.fighterB.franchise} color={blueB} size={220} />
        </div>

        {/* Bold Condensed Name */}
        <div
          style={{
            fontFamily: FONT.display,
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 1,
            color: "#FFFFFF",
            letterSpacing: 2,
            marginTop: 20,
            textTransform: "uppercase",
            textShadow: "0 6px 18px rgba(0,0,0,0.3)"
          }}
        >
          {p.fighterB.name}
        </div>
      </div>

      {/* 3. CENTER SEAM VS BADGE */}
      <div
        style={{
          position: "absolute",
          top: 360,
          left: "50%",
          transform: `translate(-50%, -50%) scale(${vsSlam})`,
          width: 140,
          height: 140,
          borderRadius: "50%",
          backgroundColor: "#161616",
          border: "10px solid #FFD23F",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 14px 34px rgba(0,0,0,0.45)",
          zIndex: 20
        }}
      >
        <span
          style={{
            fontFamily: FONT.display,
            fontSize: 58,
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: 1
          }}
        >
          VS
        </span>
      </div>

      {/* 4. BOTTOM TRANSLUCENT STAT COMPARISON CARD */}
      <div
        style={{
          position: "absolute",
          top: 730,
          left: 54,
          right: 54,
          backgroundColor: "rgba(0, 0, 0, 0.38)",
          borderRadius: 44,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1.5px solid rgba(255, 255, 255, 0.12)",
          padding: "40px 44px 32px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
          transform: `translateY(${(1 - cardSlam) * 140}px)`,
          opacity: cardSlam,
          zIndex: 25
        }}
      >
        {/* ROW 1 */}
        {p.rounds[0] && renderStatRow({
          round: p.rounds[0],
          progress: r1Progress,
          crownScale: r1CrownSpring,
          showScore: false,
          scoreText: ""
        })}

        {/* Separator spacing */}
        <div style={{ height: 26 }} />

        {/* ROW 2 */}
        {p.rounds[1] && renderStatRow({
          round: p.rounds[1],
          progress: r2Progress,
          crownScale: r2CrownSpring,
          showScore: false,
          scoreText: ""
        })}

        {/* Separator spacing */}
        <div style={{ height: 26 }} />

        {/* ROW 3 (WITH CENTER LIVE SCORE) */}
        {p.rounds[2] && renderStatRow({
          round: p.rounds[2],
          progress: r3Progress,
          crownScale: r3CrownSpring,
          showScore: true,
          scoreText: `${scoreA} - ${scoreB}`
        })}

        {/* FOOTNOTE */}
        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            fontFamily: FONT.ui,
            fontSize: 20,
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.72)",
            letterSpacing: 0.5
          }}
        >
          {p.verdictReason || "* typical values · lore confirmed"}
        </div>
      </div>

      {/* 5. PREVIOUS WINNER RECAP (First 2.5s) */}
      {p.introSeconds > 0 && p.prevAnswer ? (
        <PrevAnswerCard
          seconds={p.introSeconds}
          heading="PICHHLE MATCH KA WINNER"
          answer={p.prevAnswer}
          accent="#FFD23F"
          bg="#0B0E17"
        />
      ) : null}

      {/* 6. VOICE AUDIO SYNC */}
      <VoiceCues cues={p.voice} />

      {/* 7. SOUND BED & SFX */}
      {p.sound ? (
        <SoundBed
          music="sfx/music_chase.mp3"
          musicVolume={0.22}
          duck={duckFromCues(p.voice)}
          sfx={sfx}
        />
      ) : null}

      {/* 8. COMMUNITY ASK OUTRO (Debate hook) */}
      <AskOutro
        from={outroStart}
        a={p.askOutro}
        accent="#FFD23F"
        tapAt={followTapAt(p.askOutro)}
      />
    </AbsoluteFill>
  );
};

interface RenderRowProps {
  round: VersusSplit["rounds"][number];
  progress: number;
  crownScale: number;
  showScore: boolean;
  scoreText: string;
}

function renderStatRow({ round, progress, crownScale, showScore, scoreText }: RenderRowProps) {
  const winA = round.win === "a";
  const winB = round.win === "b";

  // Widths of progress bars
  const leftFill = interpolate(progress, [0, 1], [0, winA ? 100 : 70]);
  const rightFill = interpolate(progress, [0, 1], [0, winB ? 100 : 70]);

  return (
    <div style={{ position: "relative" }}>
      {/* Row Title */}
      <div
        style={{
          textAlign: "center",
          fontFamily: FONT.ui,
          fontSize: 25,
          fontWeight: 900,
          letterSpacing: 2,
          color: "#FFFFFF",
          textTransform: "uppercase",
          marginBottom: 10
        }}
      >
        {round.name}
      </div>

      {/* Mini Crown Icons */}
      <div style={{ position: "relative", height: 26, marginBottom: 4 }}>
        {winA && (
          <div
            style={{
              position: "absolute",
              left: 4,
              bottom: 0,
              transform: `scale(${crownScale})`,
              transformOrigin: "bottom left"
            }}
          >
            <MiniCrown size={34} color="#FFD23F" />
          </div>
        )}
        {winB && (
          <div
            style={{
              position: "absolute",
              right: 4,
              bottom: 0,
              transform: `scale(${crownScale})`,
              transformOrigin: "bottom right"
            }}
          >
            <MiniCrown size={34} color="#FFD23F" />
          </div>
        )}
      </div>

      {/* Dual Comparison Bars Track */}
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {/* Left Bar (Fighter A) */}
        <div
          style={{
            flex: 1,
            height: 28,
            borderRadius: 99,
            backgroundColor: "rgba(0, 0, 0, 0.35)",
            overflow: "hidden",
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${leftFill}%`,
              borderRadius: 99,
              backgroundColor: winA ? "#FFFFFF" : "rgba(0, 0, 0, 0.45)"
            }}
          />
        </div>

        {/* Right Bar (Fighter B) */}
        <div
          style={{
            flex: 1,
            height: 28,
            borderRadius: 99,
            backgroundColor: "rgba(0, 0, 0, 0.35)",
            overflow: "hidden",
            display: "flex",
            justifyContent: "flex-start"
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${rightFill}%`,
              borderRadius: 99,
              backgroundColor: winB ? "#FFFFFF" : "rgba(0, 0, 0, 0.45)"
            }}
          />
        </div>
      </div>

      {/* Values Row (with Center Score on Row 3) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
          fontFamily: FONT.ui,
          fontSize: 34,
          fontWeight: 800,
          color: "#FFFFFF"
        }}
      >
        {/* Left Value */}
        <div style={{ minWidth: 140, textAlign: "left" }}>{round.statA}</div>

        {/* Center Running Score */}
        {showScore && (
          <div
            style={{
              fontFamily: FONT.display,
              fontSize: 58,
              fontWeight: 900,
              letterSpacing: 2,
              color: "#FFFFFF",
              textShadow: "0 4px 12px rgba(0,0,0,0.5)"
            }}
          >
            {scoreText}
          </div>
        )}

        {/* Right Value */}
        <div style={{ minWidth: 140, textAlign: "right" }}>{round.statB}</div>
      </div>
    </div>
  );
}

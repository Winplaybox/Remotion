import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AskOutro } from "../../../packages/visuals/src/AskOutro";
import { FONT, useBundledFonts } from "../../../packages/visuals/src/fonts";
import { PrevAnswerCard } from "../../../packages/visuals/src/PrevAnswer";
import { SoundBed, duckFromCues, type Sfx } from "../../../packages/visuals/src/Sound";
import { VoiceCues } from "../../../packages/visuals/src/VoiceCues";
import { askOutroSfx, followTapAt } from "../../ask-outro";
import type { VersusSplit } from "./model";

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
    { src: "sfx/pop.mp3", at: p.introSeconds + 2.0, volume: 0.4 },
    { src: "sfx/bell.mp3", at: p.introSeconds + 6.0, volume: 0.35 },
    { src: "sfx/ding.mp3", at: p.introSeconds + 10.0, volume: 0.35 },
    { src: "sfx/pop.mp3", at: p.introSeconds + p.playSeconds - p.climaxSeconds, volume: 0.5 },
    ...askOutroSfx(p.askOutro, p.introSeconds + p.playSeconds)
  ];

  // Springs
  const entranceA = spring({ frame: f, fps, config: { damping: 12, stiffness: 120 } });
  const entranceB = spring({ frame: Math.max(0, f - 6), fps, config: { damping: 12, stiffness: 120 } });
  const crownSpring = spring({ frame: Math.max(0, f - climaxFrame), fps, config: { damping: 10, stiffness: 140 } });

  // Rounds timing
  const r1Show = f >= 20;
  const r2Show = f >= 90;
  const r3Show = f >= 160;

  // Crown drop translation (from -200px down onto the winner card)
  const crownY = interpolate(crownSpring, [0, 1], [-250, 0]);

  // Center clash pulse
  const clashPulse = 1 + Math.sin(frame * 0.4) * 0.08;

  const winA = p.winner === "a";

  return (
    <AbsoluteFill style={{ backgroundColor: "#060810", color: "#FFFFFF", overflow: "hidden" }}>
      {/* 1. TOP HALF: FIGHTER A */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 960,
          background: `radial-gradient(circle at 50% 20%, ${p.fighterA.color}44 0%, #0A0F1D 80%)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 50px 40px",
          transform: `translateY(${(1 - entranceA) * -120}px)`,
          opacity: isClimax && !winA ? 0.45 : entranceA,
          transition: "opacity 0.5s ease"
        }}
      >
        {/* Header Fighter A */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div
              style={{
                backgroundColor: p.fighterA.color,
                color: "#FFFFFF",
                padding: "6px 16px",
                borderRadius: 8,
                fontSize: 22,
                fontFamily: FONT.punch,
                fontWeight: 900,
                letterSpacing: 2
              }}
            >
              {p.fighterA.franchise}
            </div>
            <span style={{ fontSize: 24, fontFamily: FONT.mono, fontWeight: 700, color: "#93C5FD" }}>
              PWR {p.fighterA.signaturePower}
            </span>
          </div>

          <div style={{ fontFamily: FONT.display, fontSize: 72, lineHeight: 1.05, color: "#FFFFFF", textShadow: `0 0 30px ${p.fighterA.color}` }}>
            {p.fighterA.name}
          </div>
          <div style={{ fontFamily: FONT.ui, fontSize: 28, fontWeight: 700, color: "#BFDBFE" }}>
            {p.fighterA.title}
          </div>
        </div>

        {/* Signature Move Box */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(10px)",
            border: `2px solid ${p.fighterA.color}88`,
            borderRadius: 20,
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontFamily: FONT.mono, color: "#93C5FD", letterSpacing: 1 }}>
              SIGNATURE MOVE
            </div>
            <div style={{ fontSize: 32, fontFamily: FONT.punch, fontWeight: 900, color: "#FFFFFF" }}>
              {p.fighterA.signatureMove}
            </div>
          </div>
          <div style={{ fontSize: 36 }}>⚡</div>
        </div>

        {/* Winner Crown on Fighter A */}
        {isClimax && winA && (
          <div
            style={{
              position: "absolute",
              top: 130,
              right: 60,
              transform: `translateY(${crownY}px) rotate(8deg)`,
              textAlign: "center",
              zIndex: 30
            }}
          >
            <div style={{ fontSize: 96, filter: "drop-shadow(0 10px 25px rgba(234, 179, 8, 0.8))" }}>
              👑
            </div>
            <div
              style={{
                backgroundColor: "#FACC15",
                color: "#000000",
                fontFamily: FONT.punch,
                fontWeight: 900,
                fontSize: 22,
                padding: "6px 14px",
                borderRadius: 12,
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)"
              }}
            >
              WINNER!
            </div>
          </div>
        )}
      </div>

      {/* 2. CENTER CLASH DIVIDER (960px) */}
      <div
        style={{
          position: "absolute",
          top: 935,
          left: 0,
          right: 0,
          height: 50,
          zIndex: 20,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {/* Glow Line */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: 4,
            background: "linear-gradient(90deg, #3B82F6, #FBBF24, #EF4444)",
            boxShadow: "0 0 20px #FBBF24"
          }}
        />

        {/* VS Badge */}
        <div
          style={{
            position: "relative",
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: "#111827",
            border: "3px solid #FBBF24",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: FONT.display,
            fontSize: 34,
            fontWeight: 900,
            color: "#FFFFFF",
            boxShadow: "0 0 25px rgba(251, 191, 36, 0.7)",
            transform: `scale(${clashPulse})`
          }}
        >
          VS
        </div>
      </div>

      {/* 3. BOTTOM HALF: FIGHTER B */}
      <div
        style={{
          position: "absolute",
          top: 960,
          left: 0,
          right: 0,
          height: 960,
          background: `radial-gradient(circle at 50% 80%, ${p.fighterB.color}44 0%, #150A0F 80%)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "50px 50px 80px",
          transform: `translateY(${(1 - entranceB) * 120}px)`,
          opacity: isClimax && winA ? 0.45 : entranceB,
          transition: "opacity 0.5s ease"
        }}
      >
        {/* Signature Move Box */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(10px)",
            border: `2px solid ${p.fighterB.color}88`,
            borderRadius: 20,
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontFamily: FONT.mono, color: "#FCA5A5", letterSpacing: 1 }}>
              SIGNATURE MOVE
            </div>
            <div style={{ fontSize: 32, fontFamily: FONT.punch, fontWeight: 900, color: "#FFFFFF" }}>
              {p.fighterB.signatureMove}
            </div>
          </div>
          <div style={{ fontSize: 36 }}>💥</div>
        </div>

        {/* Footer Fighter B Details */}
        <div>
          <div style={{ fontFamily: FONT.ui, fontSize: 28, fontWeight: 700, color: "#FECACA" }}>
            {p.fighterB.title}
          </div>
          <div style={{ fontFamily: FONT.display, fontSize: 72, lineHeight: 1.05, color: "#FFFFFF", textShadow: `0 0 30px ${p.fighterB.color}` }}>
            {p.fighterB.name}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <div
              style={{
                backgroundColor: p.fighterB.color,
                color: "#FFFFFF",
                padding: "6px 16px",
                borderRadius: 8,
                fontSize: 22,
                fontFamily: FONT.punch,
                fontWeight: 900,
                letterSpacing: 2
              }}
            >
              {p.fighterB.franchise}
            </div>
            <span style={{ fontSize: 24, fontFamily: FONT.mono, fontWeight: 700, color: "#FCA5A5" }}>
              PWR {p.fighterB.signaturePower}
            </span>
          </div>
        </div>

        {/* Winner Crown on Fighter B */}
        {isClimax && !winA && (
          <div
            style={{
              position: "absolute",
              bottom: 130,
              right: 60,
              transform: `translateY(${crownY}px) rotate(-8deg)`,
              textAlign: "center",
              zIndex: 30
            }}
          >
            <div style={{ fontSize: 96, filter: "drop-shadow(0 10px 25px rgba(234, 179, 8, 0.8))" }}>
              👑
            </div>
            <div
              style={{
                backgroundColor: "#FACC15",
                color: "#000000",
                fontFamily: FONT.punch,
                fontWeight: 900,
                fontSize: 22,
                padding: "6px 14px",
                borderRadius: 12,
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)"
              }}
            >
              WINNER!
            </div>
          </div>
        )}
      </div>

      {/* 4. ROUND STATS COMPARISON OVERLAY (Centered) */}
      <div
        style={{
          position: "absolute",
          top: 660,
          left: 50,
          right: 50,
          zIndex: 25,
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        {p.rounds.map((r, i) => {
          const visible = i === 0 ? r1Show : i === 1 ? r2Show : r3Show;
          if (!visible) return null;
          return (
            <div
              key={r.roundNo}
              style={{
                backgroundColor: "rgba(10, 15, 28, 0.92)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                borderRadius: 16,
                padding: "12px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 10px 25px rgba(0,0,0,0.6)"
              }}
            >
              <div style={{ flex: 1, textAlign: "left" }}>
                <span style={{ fontFamily: FONT.punch, fontSize: 18, color: r.win === "a" ? "#60A5FA" : "#9CA3AF", fontWeight: 800 }}>
                  {r.win === "a" && "★ "}
                  {r.statA}
                </span>
              </div>
              <div style={{ padding: "0 14px", textAlign: "center" }}>
                <span style={{ fontFamily: FONT.mono, fontSize: 16, color: "#FBBF24", fontWeight: 800 }}>
                  R{r.roundNo}: {r.name}
                </span>
              </div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <span style={{ fontFamily: FONT.punch, fontSize: 18, color: r.win === "b" ? "#F87171" : "#9CA3AF", fontWeight: 800 }}>
                  {r.statB}
                  {r.win === "b" && " ★"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Previous Answer Card (on post 2+) */}
      {p.introSeconds > 0 && p.prevAnswer ? (
        <PrevAnswerCard
          seconds={p.introSeconds}
          heading={`PICHHLA WINNER #${String(p.postNo - 1).padStart(3, "0")}`}
          answer={p.prevAnswer}
          accent="#FBBF24"
          bg="linear-gradient(180deg, #180905, #2B110B)"
        />
      ) : null}

      {/* 6. AskOutro Interaction Banner & Follow Button (during outro) */}
      <AskOutro
        from={outroStart}
        a={p.askOutro}
        accent="#FBBF24"
        tapAt={followTapAt(p.askOutro)}
      />

      {/* 7. Voice Cues & Sound Bed */}
      <VoiceCues cues={p.voice} />
      {p.sound && <SoundBed sfx={sfx} duck={duckFromCues(p.voice, 3.4)} music="sfx/music_puzzle.mp3" musicVolume={0.12} />}
    </AbsoluteFill>
  );
};

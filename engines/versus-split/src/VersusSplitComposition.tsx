import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AskOutro } from "../../../packages/visuals/src/AskOutro";
import { FONT, useBundledFonts } from "../../../packages/visuals/src/fonts";
import { PrevAnswerCard } from "../../../packages/visuals/src/PrevAnswer";
import { SoundBed, duckFromCues, type Sfx } from "../../../packages/visuals/src/Sound";
import { VoiceCues } from "../../../packages/visuals/src/VoiceCues";
import { askOutroSfx, followTapAt } from "../../ask-outro";
import type { VersusSplit } from "./model";
import { FighterEmblem, LightningSeam, MangaSpeedlines, MetallicCrown } from "./graphics";

/**
 * VersusSplitComposition — Hyper-Cinematic Motion Studio Edition
 *
 * Engineered with Motion Studio choreography:
 * - GSAP-grade spring dynamics, anticipation, and staggered timeline
 * - Real diagonal split (polygon angled slash) with active lightning seam
 * - Stylized vector character crests & dynamic fighter auras
 * - Anime radiating action speedlines & camera micro-shake
 * - Racing neon stat gauge bars with live counter progression
 * - 3D Metallic Golden Crown (👑) with ruby gems, specular glints & gravity bounce
 * - High-impact verdict slam & AskOutro community debate
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
    { src: "sfx/pop.mp3", at: p.introSeconds + 1.2, volume: 0.4 },
    { src: "sfx/bell.mp3", at: p.introSeconds + 4.5, volume: 0.35 },
    { src: "sfx/ding.mp3", at: p.introSeconds + 8.5, volume: 0.35 },
    { src: "sfx/bell.mp3", at: p.introSeconds + 12.0, volume: 0.4 },
    { src: "sfx/pop.mp3", at: p.introSeconds + p.playSeconds - p.climaxSeconds, volume: 0.55 },
    ...askOutroSfx(p.askOutro, p.introSeconds + p.playSeconds)
  ];

  // GSAP-Grade Spring Choreography
  const slamA = spring({ frame: f, fps, config: { damping: 11, stiffness: 140 } });
  const slamB = spring({ frame: Math.max(0, f - 4), fps, config: { damping: 11, stiffness: 140 } });
  const vsSlam = spring({ frame: Math.max(0, f - 8), fps, config: { damping: 9, stiffness: 190 } });

  // Camera Shake on Initial Slam (f: 0-16) and Climax Slam (f: climaxFrame - climaxFrame + 18)
  const initialShake = f < 18 ? Math.sin(f * 2.2) * (1 - f / 18) * 14 : 0;
  const climaxShake = isClimax && f - climaxFrame < 20 ? Math.sin((f - climaxFrame) * 2.5) * (1 - (f - climaxFrame) / 20) * 18 : 0;
  const cameraShakeY = initialShake + climaxShake;

  // Rounds timing
  const r1Start = 20;
  const r2Start = 110;
  const r3Start = 200;

  const r1Show = f >= r1Start;
  const r2Show = f >= r2Start;
  const r3Show = f >= r3Start;

  // Racing stat progress (0 -> 1)
  const barProgress1 = interpolate(f, [r1Start, r1Start + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barProgress2 = interpolate(f, [r2Start, r2Start + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barProgress3 = interpolate(f, [r3Start, r3Start + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Real-time Score calculation
  let scoreA = 0;
  let scoreB = 0;
  if (f >= r1Start + 18) {
    if (p.rounds[0]?.win === "a") scoreA++;
    else if (p.rounds[0]?.win === "b") scoreB++;
  }
  if (f >= r2Start + 18) {
    if (p.rounds[1]?.win === "a") scoreA++;
    else if (p.rounds[1]?.win === "b") scoreB++;
  }
  if (f >= r3Start + 18) {
    if (p.rounds[2]?.win === "a") scoreA++;
    else if (p.rounds[2]?.win === "b") scoreB++;
  }

  // 3D Crown Physics: Heavy drop with bouncy settling
  const crownSpring = spring({ frame: Math.max(0, f - climaxFrame), fps, config: { damping: 7, stiffness: 150 } });
  const crownY = interpolate(crownSpring, [0, 1], [-380, 0]);

  // Center pulse
  const clashPulse = 1 + Math.sin(frame * 0.35) * 0.07;

  const winA = p.winner === "a";
  const coralA = p.fighterA.color || "#ff6b4a";
  const blueB = p.fighterB.color || "#2b6cff";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#05070E",
        color: "#FFFFFF",
        overflow: "hidden",
        transform: `translateY(${cameraShakeY}px)`
      }}
    >
      {/* 1. ANIME RADIATING SPEEDLINES */}
      <MangaSpeedlines frame={frame} opacity={f < 45 || isClimax ? 0.35 : 0.15} />

      {/* 2. TOP / LEFT HALF: FIGHTER A (Diagonal Angle Split) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1040,
          clipPath: "polygon(0 0, 100% 0, 100% 880px, 0 1020px)",
          background: `radial-gradient(circle at 40% 30%, ${coralA}44 0%, #070B16 80%)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 50px 70px",
          transform: `translateY(${(1 - slamA) * -220}px)`,
          opacity: isClimax && !winA ? 0.25 : slamA,
          transition: "opacity 0.4s ease",
          zIndex: 10
        }}
      >
        {/* Halftone Dot Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
            pointerEvents: "none"
          }}
        />

        {/* Header Fighter A */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div
              style={{
                backgroundColor: coralA,
                color: "#FFFFFF",
                padding: "6px 20px",
                borderRadius: 99,
                fontSize: 22,
                fontFamily: FONT.punch,
                fontWeight: 900,
                letterSpacing: 2,
                boxShadow: `0 0 25px ${coralA}77`
              }}
            >
              {p.fighterA.franchise}
            </div>
            <span style={{ fontSize: 24, fontFamily: FONT.mono, fontWeight: 700, color: "#93C5FD" }}>
              PWR {p.fighterA.signaturePower}
            </span>
          </div>

          {/* Name & Fighter Crest Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div
                style={{
                  fontFamily: FONT.display,
                  fontSize: 82,
                  lineHeight: 0.98,
                  color: "#FFFFFF",
                  textShadow: `0 0 40px ${coralA}cc, 0 4px 10px rgba(0,0,0,0.8)`
                }}
              >
                {p.fighterA.name}
              </div>
              <div style={{ fontFamily: FONT.ui, fontSize: 30, fontWeight: 800, color: "#BFDBFE", marginTop: 4 }}>
                {p.fighterA.title}
              </div>
            </div>

            {/* Illustrated Crest Emblem */}
            <div style={{ transform: "scale(1.1)", filter: `drop-shadow(0 0 20px ${coralA}88)` }}>
              <FighterEmblem name={p.fighterA.name} franchise={p.fighterA.franchise} color={coralA} size={135} />
            </div>
          </div>
        </div>

        {/* Signature Move Box */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(14px)",
            border: `2px solid ${coralA}aa`,
            borderRadius: 22,
            padding: "18px 26px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: `0 12px 35px rgba(0,0,0,0.6), inset 0 0 25px ${coralA}25`
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontFamily: FONT.mono, color: "#93C5FD", letterSpacing: 1.5 }}>
              SIGNATURE TECHNIQUE
            </div>
            <div style={{ fontSize: 34, fontFamily: FONT.punch, fontWeight: 900, color: "#FFFFFF" }}>
              {p.fighterA.signatureMove}
            </div>
          </div>
          <div style={{ fontSize: 42, filter: "drop-shadow(0 0 10px #FFD23F)" }}>💥</div>
        </div>

        {/* Winner Crown on Fighter A */}
        {isClimax && winA && (
          <div
            style={{
              position: "absolute",
              top: 100,
              right: 60,
              transform: `translateY(${crownY}px) rotate(5deg)`,
              textAlign: "center",
              zIndex: 50
            }}
          >
            <MetallicCrown size={190} frame={frame} glowColor="#FFD23F" />
            <div
              style={{
                marginTop: -10,
                backgroundColor: "#ffd23f",
                color: "#000000",
                fontFamily: FONT.punch,
                fontWeight: 900,
                fontSize: 26,
                padding: "8px 24px",
                borderRadius: 14,
                boxShadow: "0 8px 25px rgba(0,0,0,0.7)",
                letterSpacing: 2
              }}
            >
              WINNER!
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM / RIGHT HALF: FIGHTER B (Diagonal Angle Split) */}
      <div
        style={{
          position: "absolute",
          top: 880,
          left: 0,
          right: 0,
          height: 1040,
          clipPath: "polygon(0 140px, 100% 0, 100% 1040px, 0 1040px)",
          background: `radial-gradient(circle at 60% 70%, ${blueB}44 0%, #0F0814 80%)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "100px 50px 70px",
          transform: `translateY(${(1 - slamB) * 220}px)`,
          opacity: isClimax && winA ? 0.25 : slamB,
          transition: "opacity 0.4s ease",
          zIndex: 10
        }}
      >
        {/* Halftone Dot Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
            pointerEvents: "none"
          }}
        />

        {/* Signature Move Box */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(14px)",
            border: `2px solid ${blueB}aa`,
            borderRadius: 22,
            padding: "18px 26px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: `0 12px 35px rgba(0,0,0,0.6), inset 0 0 25px ${blueB}25`
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontFamily: FONT.mono, color: "#FCA5A5", letterSpacing: 1.5 }}>
              SIGNATURE TECHNIQUE
            </div>
            <div style={{ fontSize: 34, fontFamily: FONT.punch, fontWeight: 900, color: "#FFFFFF" }}>
              {p.fighterB.signatureMove}
            </div>
          </div>
          <div style={{ fontSize: 42, filter: "drop-shadow(0 0 10px #60A5FA)" }}>⚡</div>
        </div>

        {/* Footer Fighter B Details */}
        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Name & Fighter Crest Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: FONT.ui, fontSize: 30, fontWeight: 800, color: "#FECACA", marginBottom: 4 }}>
                {p.fighterB.title}
              </div>
              <div
                style={{
                  fontFamily: FONT.display,
                  fontSize: 82,
                  lineHeight: 0.98,
                  color: "#FFFFFF",
                  textShadow: `0 0 40px ${blueB}cc, 0 4px 10px rgba(0,0,0,0.8)`
                }}
              >
                {p.fighterB.name}
              </div>
            </div>

            {/* Illustrated Crest Emblem */}
            <div style={{ transform: "scale(1.1)", filter: `drop-shadow(0 0 20px ${blueB}88)` }}>
              <FighterEmblem name={p.fighterB.name} franchise={p.fighterB.franchise} color={blueB} size={135} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <div
              style={{
                backgroundColor: blueB,
                color: "#FFFFFF",
                padding: "6px 20px",
                borderRadius: 99,
                fontSize: 22,
                fontFamily: FONT.punch,
                fontWeight: 900,
                letterSpacing: 2,
                boxShadow: `0 0 25px ${blueB}77`
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
              bottom: 110,
              right: 60,
              transform: `translateY(${crownY}px) rotate(-5deg)`,
              textAlign: "center",
              zIndex: 50
            }}
          >
            <MetallicCrown size={190} frame={frame} glowColor="#FFD23F" />
            <div
              style={{
                marginTop: -10,
                backgroundColor: "#ffd23f",
                color: "#000000",
                fontFamily: FONT.punch,
                fontWeight: 900,
                fontSize: 26,
                padding: "8px 24px",
                borderRadius: 14,
                boxShadow: "0 8px 25px rgba(0,0,0,0.7)",
                letterSpacing: 2
              }}
            >
              WINNER!
            </div>
          </div>
        )}
      </div>

      {/* 4. ACTIVE LIGHTNING ARCS ALONG DIAGONAL SEAM */}
      <LightningSeam frame={frame} color="#FFD23F" />

      {/* 5. 3D HIGH-GLOSS VS BADGE (Center Collision) */}
      <div
        style={{
          position: "absolute",
          top: 960,
          left: 540,
          transform: `translate(-50%, -50%) scale(${vsSlam * clashPulse})`,
          zIndex: 35,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {/* Glow halo */}
        <div
          style={{
            position: "absolute",
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 210, 63, 0.6) 0%, transparent 70%)",
            filter: "blur(12px)"
          }}
        />

        {/* Jet Black Sphere with 3D Gold Ring */}
        <div
          style={{
            position: "relative",
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #262626 0%, #000000 100%)",
            border: "5px solid #FFD23F",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 0 35px rgba(255, 210, 63, 0.9), inset 0 0 15px rgba(255, 210, 63, 0.5)"
          }}
        >
          <span
            style={{
              fontFamily: FONT.display,
              fontSize: 42,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: 1,
              textShadow: "0 2px 8px rgba(0,0,0,0.9)"
            }}
          >
            VS
          </span>
        </div>
      </div>

      {/* 6. REAL-TIME SCOREBOARD PILL (Top Center) */}
      <div
        style={{
          position: "absolute",
          top: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 40,
          backgroundColor: "rgba(5, 7, 14, 0.88)",
          backdropFilter: "blur(14px)",
          border: "2px solid #FFD23F",
          borderRadius: 99,
          padding: "6px 26px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          boxShadow: "0 10px 30px rgba(0,0,0,0.8)"
        }}
      >
        <span style={{ fontFamily: FONT.punch, fontSize: 26, color: coralA, fontWeight: 900 }}>
          {scoreA}
        </span>
        <span style={{ fontFamily: FONT.mono, fontSize: 16, color: "#FFD23F", letterSpacing: 2, fontWeight: 800 }}>
          SCORE
        </span>
        <span style={{ fontFamily: FONT.punch, fontSize: 26, color: blueB, fontWeight: 900 }}>
          {scoreB}
        </span>
      </div>

      {/* 7. RACING NEON STAT GAUGE BARS (Center Overlay) */}
      <div
        style={{
          position: "absolute",
          top: 670,
          left: 45,
          right: 45,
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          gap: 14
        }}
      >
        {p.rounds.map((r, i) => {
          const visible = i === 0 ? r1Show : i === 1 ? r2Show : r3Show;
          if (!visible) return null;
          const prog = i === 0 ? barProgress1 : i === 1 ? barProgress2 : barProgress3;

          return (
            <div
              key={r.roundNo}
              style={{
                backgroundColor: "rgba(6, 9, 18, 0.94)",
                backdropFilter: "blur(18px)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                borderRadius: 20,
                padding: "14px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                boxShadow: "0 14px 35px rgba(0,0,0,0.75)"
              }}
            >
              {/* Category Header with Round No */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: FONT.ui, fontSize: 19, fontWeight: 900, color: "#F3F4F6", letterSpacing: 1 }}>
                  R{r.roundNo}: {r.name.toUpperCase()}
                </span>
                {prog >= 0.9 && (
                  <span style={{ fontSize: 18, color: "#FFD23F", fontWeight: 900 }}>
                    {r.win === "a" ? `👑 ${p.fighterA.name}` : r.win === "b" ? `👑 ${p.fighterB.name}` : "🤝 TIE"}
                  </span>
                )}
              </div>

              {/* Racing Energy Gauge Bars Growing Outward from Center */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 18 }}>
                {/* Left Bar (Fighter A) */}
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 9, height: "100%", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(r.win === "a" ? 100 : 70) * prog}%`,
                      background: `linear-gradient(90deg, ${coralA}99, ${coralA})`,
                      borderRadius: 9,
                      boxShadow: `0 0 12px ${coralA}`
                    }}
                  />
                </div>

                {/* Center Pulse Dot */}
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#FFD23F", boxShadow: "0 0 10px #FFD23F" }} />

                {/* Right Bar (Fighter B) */}
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-start", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 9, height: "100%", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(r.win === "b" ? 100 : 70) * prog}%`,
                      background: `linear-gradient(90deg, ${blueB}, ${blueB}99)`,
                      borderRadius: 9,
                      boxShadow: `0 0 12px ${blueB}`
                    }}
                  />
                </div>
              </div>

              {/* Stat Values at ends */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 17, fontFamily: FONT.mono, fontWeight: 800 }}>
                <span style={{ color: r.win === "a" ? "#60A5FA" : "#9CA3AF" }}>
                  {r.statA}
                </span>
                <span style={{ color: r.win === "b" ? "#F87171" : "#9CA3AF" }}>
                  {r.statB}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 8. PREVIOUS WINNER ANSWER CARD (on post 2+) */}
      {p.introSeconds > 0 && p.prevAnswer ? (
        <PrevAnswerCard
          seconds={p.introSeconds}
          heading={`PICHHLA WINNER #${String(p.postNo - 1).padStart(3, "0")}`}
          answer={p.prevAnswer}
          accent="#FFD23F"
          bg="linear-gradient(180deg, #180905, #2B110B)"
        />
      ) : null}

      {/* 9. ASK OUTRO INTERACTION BANNER & FOLLOW BUTTON */}
      <AskOutro
        from={outroStart}
        a={p.askOutro}
        accent="#FFD23F"
        tapAt={followTapAt(p.askOutro)}
      />

      {/* 10. VOICE CUES & SOUND BED */}
      <VoiceCues cues={p.voice} />
      {p.sound && <SoundBed sfx={sfx} duck={duckFromCues(p.voice, 3.4)} music="sfx/music_puzzle.mp3" musicVolume={0.12} />}
    </AbsoluteFill>
  );
};

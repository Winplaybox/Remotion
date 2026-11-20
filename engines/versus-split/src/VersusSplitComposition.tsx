import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AskOutro } from "../../../packages/visuals/src/AskOutro";
import { FONT, useBundledFonts } from "../../../packages/visuals/src/fonts";
import { PrevAnswerCard } from "../../../packages/visuals/src/PrevAnswer";
import { SoundBed, duckFromCues, type Sfx } from "../../../packages/visuals/src/Sound";
import { VoiceCues } from "../../../packages/visuals/src/VoiceCues";
import { askOutroSfx, followTapAt } from "../../ask-outro";
import type { VersusSplit } from "./model";

/**
 * VersusSplitComposition — GravityClaw "Versus Split" Ground Truth
 *
 * Style Specs:
 * - Two halves split by diagonal/seam with slam-in animation
 * - Black VS badge with yellow (#ffd23f) ring on the collision seam
 * - Translucent stats panel with racing bars growing outward from the centre
 * - Live animated round scores and winner indicators
 * - Dramatic climax: Golden Crown (👑) dropping and bouncing on the winner
 * - Verdict slam with reason and community AskOutro
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
    { src: "sfx/pop.mp3", at: p.introSeconds + p.playSeconds - p.climaxSeconds, volume: 0.5 },
    ...askOutroSfx(p.askOutro, p.introSeconds + p.playSeconds)
  ];

  // Slam-in springs for the two halves
  const slamA = spring({ frame: f, fps, config: { damping: 11, stiffness: 140 } });
  const slamB = spring({ frame: Math.max(0, f - 4), fps, config: { damping: 11, stiffness: 140 } });
  const vsSlam = spring({ frame: Math.max(0, f - 8), fps, config: { damping: 9, stiffness: 180 } });

  // Rounds timing
  const r1Start = 20;
  const r2Start = 110;
  const r3Start = 200;

  const r1Show = f >= r1Start;
  const r2Show = f >= r2Start;
  const r3Show = f >= r3Start;

  // Bar progress animations (0 -> 1)
  const barProgress1 = interpolate(f, [r1Start, r1Start + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barProgress2 = interpolate(f, [r2Start, r2Start + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barProgress3 = interpolate(f, [r3Start, r3Start + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Running Score calculation
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

  // Crown physics drop & bounce
  const crownSpring = spring({ frame: Math.max(0, f - climaxFrame), fps, config: { damping: 8, stiffness: 160 } });
  const crownY = interpolate(crownSpring, [0, 1], [-320, 0]);

  // Center pulse & energy
  const clashPulse = 1 + Math.sin(frame * 0.35) * 0.06;

  const winA = p.winner === "a";
  const coralA = p.fighterA.color || "#ff6b4a";
  const blueB = p.fighterB.color || "#2b6cff";

  return (
    <AbsoluteFill style={{ backgroundColor: "#060810", color: "#FFFFFF", overflow: "hidden" }}>
      {/* 1. TOP / LEFT HALF: FIGHTER A */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 960,
          background: `radial-gradient(circle at 50% 25%, ${coralA}3a 0%, #080D1A 85%)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 50px 40px",
          transform: `translateY(${(1 - slamA) * -180}px)`,
          opacity: isClimax && !winA ? 0.3 : slamA,
          transition: "opacity 0.4s ease"
        }}
      >
        {/* Header Fighter A */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div
              style={{
                backgroundColor: coralA,
                color: "#FFFFFF",
                padding: "6px 18px",
                borderRadius: 99,
                fontSize: 22,
                fontFamily: FONT.punch,
                fontWeight: 900,
                letterSpacing: 2,
                boxShadow: `0 0 20px ${coralA}66`
              }}
            >
              {p.fighterA.franchise}
            </div>
            <span style={{ fontSize: 24, fontFamily: FONT.mono, fontWeight: 700, color: "#93C5FD" }}>
              PWR {p.fighterA.signaturePower}
            </span>
          </div>

          <div
            style={{
              fontFamily: FONT.display,
              fontSize: 78,
              lineHeight: 1.02,
              color: "#FFFFFF",
              textShadow: `0 0 35px ${coralA}99`
            }}
          >
            {p.fighterA.name}
          </div>
          <div style={{ fontFamily: FONT.ui, fontSize: 30, fontWeight: 700, color: "#BFDBFE", marginTop: 4 }}>
            {p.fighterA.title}
          </div>
        </div>

        {/* Signature Move Box */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.07)",
            backdropFilter: "blur(12px)",
            border: `2px solid ${coralA}aa`,
            borderRadius: 22,
            padding: "20px 26px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: `0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px ${coralA}22`
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
          <div style={{ fontSize: 40 }}>💥</div>
        </div>

        {/* Winner Crown on Fighter A */}
        {isClimax && winA && (
          <div
            style={{
              position: "absolute",
              top: 130,
              right: 60,
              transform: `translateY(${crownY}px) rotate(6deg)`,
              textAlign: "center",
              zIndex: 40
            }}
          >
            <div style={{ fontSize: 110, filter: "drop-shadow(0 15px 35px rgba(253, 224, 71, 0.9))" }}>
              👑
            </div>
            <div
              style={{
                backgroundColor: "#ffd23f",
                color: "#000000",
                fontFamily: FONT.punch,
                fontWeight: 900,
                fontSize: 24,
                padding: "8px 20px",
                borderRadius: 14,
                boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
                letterSpacing: 2
              }}
            >
              WINNER!
            </div>
          </div>
        )}
      </div>

      {/* 2. CENTER COLLISION SEAM & VS BADGE */}
      <div
        style={{
          position: "absolute",
          top: 935,
          left: 0,
          right: 0,
          height: 50,
          zIndex: 30,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {/* Glowing seam line */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: 6,
            background: `linear-gradient(90deg, ${coralA}, #ffd23f, ${blueB})`,
            boxShadow: "0 0 25px #ffd23f"
          }}
        />

        {/* GravityClaw Black VS Badge with Yellow Ring */}
        <div
          style={{
            position: "relative",
            width: 88,
            height: 88,
            borderRadius: "50%",
            backgroundColor: "#000000",
            border: "4px solid #ffd23f",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: FONT.display,
            fontSize: 38,
            fontWeight: 900,
            color: "#FFFFFF",
            boxShadow: "0 0 35px rgba(255, 210, 63, 0.8)",
            transform: `scale(${vsSlam * clashPulse})`
          }}
        >
          VS
        </div>
      </div>

      {/* 3. BOTTOM / RIGHT HALF: FIGHTER B */}
      <div
        style={{
          position: "absolute",
          top: 960,
          left: 0,
          right: 0,
          height: 960,
          background: `radial-gradient(circle at 50% 75%, ${blueB}3a 0%, #120914 85%)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "50px 50px 80px",
          transform: `translateY(${(1 - slamB) * 180}px)`,
          opacity: isClimax && winA ? 0.3 : slamB,
          transition: "opacity 0.4s ease"
        }}
      >
        {/* Signature Move Box */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.07)",
            backdropFilter: "blur(12px)",
            border: `2px solid ${blueB}aa`,
            borderRadius: 22,
            padding: "20px 26px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: `0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px ${blueB}22`
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
          <div style={{ fontSize: 40 }}>⚡</div>
        </div>

        {/* Footer Fighter B Details */}
        <div>
          <div style={{ fontFamily: FONT.ui, fontSize: 30, fontWeight: 700, color: "#FECACA", marginBottom: 4 }}>
            {p.fighterB.title}
          </div>
          <div
            style={{
              fontFamily: FONT.display,
              fontSize: 78,
              lineHeight: 1.02,
              color: "#FFFFFF",
              textShadow: `0 0 35px ${blueB}99`
            }}
          >
            {p.fighterB.name}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <div
              style={{
                backgroundColor: blueB,
                color: "#FFFFFF",
                padding: "6px 18px",
                borderRadius: 99,
                fontSize: 22,
                fontFamily: FONT.punch,
                fontWeight: 900,
                letterSpacing: 2,
                boxShadow: `0 0 20px ${blueB}66`
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
              transform: `translateY(${crownY}px) rotate(-6deg)`,
              textAlign: "center",
              zIndex: 40
            }}
          >
            <div style={{ fontSize: 110, filter: "drop-shadow(0 15px 35px rgba(253, 224, 71, 0.9))" }}>
              👑
            </div>
            <div
              style={{
                backgroundColor: "#ffd23f",
                color: "#000000",
                fontFamily: FONT.punch,
                fontWeight: 900,
                fontSize: 24,
                padding: "8px 20px",
                borderRadius: 14,
                boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
                letterSpacing: 2
              }}
            >
              WINNER!
            </div>
          </div>
        )}
      </div>

      {/* 4. LIVE RUNNING SCOREBOARD PILL (Top Header) */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 35,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(10px)",
          border: "2px solid #ffd23f",
          borderRadius: 99,
          padding: "6px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)"
        }}
      >
        <span style={{ fontFamily: FONT.punch, fontSize: 24, color: coralA, fontWeight: 900 }}>
          {scoreA}
        </span>
        <span style={{ fontFamily: FONT.mono, fontSize: 16, color: "#ffd23f", letterSpacing: 2, fontWeight: 800 }}>
          SCORE
        </span>
        <span style={{ fontFamily: FONT.punch, fontSize: 24, color: blueB, fontWeight: 900 }}>
          {scoreB}
        </span>
      </div>

      {/* 5. GRAVITYCLAW RACING STAT BARS (Center Overlay) */}
      <div
        style={{
          position: "absolute",
          top: 670,
          left: 45,
          right: 45,
          zIndex: 35,
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
                backgroundColor: "rgba(8, 12, 22, 0.94)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 18,
                padding: "12px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                boxShadow: "0 12px 30px rgba(0,0,0,0.7)"
              }}
            >
              {/* Category Header with Round No */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: FONT.ui, fontSize: 18, fontWeight: 900, color: "#F3F4F6", letterSpacing: 1 }}>
                  R{r.roundNo}: {r.name.toUpperCase()}
                </span>
                {prog >= 0.9 && (
                  <span style={{ fontSize: 18, color: "#ffd23f", fontWeight: 900 }}>
                    {r.win === "a" ? `👑 ${p.fighterA.name}` : r.win === "b" ? `👑 ${p.fighterB.name}` : "🤝 TIE"}
                  </span>
                )}
              </div>

              {/* Racing Bars Growing Outward from Center */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 16 }}>
                {/* Left Bar (Fighter A) */}
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, height: "100%", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(r.win === "a" ? 100 : 70) * prog}%`,
                      backgroundColor: coralA,
                      borderRadius: 8,
                      boxShadow: `0 0 10px ${coralA}`
                    }}
                  />
                </div>

                {/* Center Divider Dot */}
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#ffd23f" }} />

                {/* Right Bar (Fighter B) */}
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-start", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, height: "100%", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(r.win === "b" ? 100 : 70) * prog}%`,
                      backgroundColor: blueB,
                      borderRadius: 8,
                      boxShadow: `0 0 10px ${blueB}`
                    }}
                  />
                </div>
              </div>

              {/* Stat Values at ends */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 16, fontFamily: FONT.mono, fontWeight: 700 }}>
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

      {/* 6. Previous Winner Answer Card (on post 2+) */}
      {p.introSeconds > 0 && p.prevAnswer ? (
        <PrevAnswerCard
          seconds={p.introSeconds}
          heading={`PICHHLA WINNER #${String(p.postNo - 1).padStart(3, "0")}`}
          answer={p.prevAnswer}
          accent="#ffd23f"
          bg="linear-gradient(180deg, #180905, #2B110B)"
        />
      ) : null}

      {/* 7. AskOutro Interaction Banner & Follow Button (during outro) */}
      <AskOutro
        from={outroStart}
        a={p.askOutro}
        accent="#ffd23f"
        tapAt={followTapAt(p.askOutro)}
      />

      {/* 8. Voice Cues & Sound Bed */}
      <VoiceCues cues={p.voice} />
      {p.sound && <SoundBed sfx={sfx} duck={duckFromCues(p.voice, 3.4)} music="sfx/music_puzzle.mp3" musicVolume={0.12} />}
    </AbsoluteFill>
  );
};

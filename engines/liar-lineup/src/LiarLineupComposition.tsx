import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "../../../packages/visuals/src/fonts";
import { PrevAnswerCard } from "../../../packages/visuals/src/PrevAnswer";
import { AskOutro } from "../../../packages/visuals/src/AskOutro";
import { SoundBed, duckFromCues, type Sfx } from "../../../packages/visuals/src/Sound";
import { VoiceCues } from "../../../packages/visuals/src/VoiceCues";
import { CharacterRig } from "../../../packages/visuals/src/rig/CharacterRig";
import { StyleFilter } from "../../../packages/visuals/src/styles/StyleFilter";
import { askOutroSfx, followTapAt } from "../../ask-outro";
import type { LiarLineup } from "./model";

export const LiarLineupComposition: React.FC<LiarLineup> = (p) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introFrames = Math.round(p.introSeconds * fps);
  const playFrames = Math.round(p.playSeconds * fps);
  const askStart = introFrames + playFrames;

  const inPlay = frame >= introFrames && frame < askStart;
  const playFrame = Math.max(0, frame - introFrames);
  const playTime = playFrame / fps;

  // Active speaker timing:
  // 0s - 4s: Intro & Crime Scene Clues
  // 4s - 8.5s: Clues overview
  // 8.5s - 11.5s: Suspect 1 speaks
  // 11.5s - 14.5s: Suspect 2 speaks
  // 14.5s - 18s: Suspect 3 speaks
  const activeSuspect = playTime >= 14.5 ? 2 : playTime >= 11.5 ? 1 : playTime >= 8.5 ? 0 : -1;

  // Header entry spring
  const headerSpring = spring({ frame: playFrame, fps, config: { damping: 14 } });

  const sfx: Sfx[] = [
    ...(p.introSeconds ? [{ src: "sfx/ding.mp3", at: 0.15, volume: 0.4 }] : []),
    { src: "sfx/pop.mp3", at: p.introSeconds + 0.25, volume: 0.4 },
    ...askOutroSfx(p.askOutro, p.introSeconds + p.playSeconds)
  ];

  return (
    <StyleFilter styleId="sharp-ink-outlines" frame={frame} intensity={0.8}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${p.palette.bgBottom} 0%, ${p.palette.bgTop} 100%)`,
          fontFamily: FONT.ui,
          color: "#FFFFFF",
          overflow: "hidden"
        }}
      >
        {/* Background Noir Atmosphere: Venetian Blinds & Subtle Fog */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.45) 0px, rgba(0,0,0,0.45) 30px, transparent 30px, transparent 65px)",
            opacity: 0.35,
            pointerEvents: "none"
          }}
        />

        {/* Previous Answer Card (First ~2.5s) */}
        {p.introSeconds > 0 && p.prevAnswer ? (
          <PrevAnswerCard
            seconds={p.introSeconds}
            heading={`PREVIOUS CASE #${p.postNo - 1} ANSWER`}
            answer={p.prevAnswer}
            accent={p.palette.accent}
            bg={`linear-gradient(180deg, ${p.palette.bgTop}, ${p.palette.bgBottom})`}
          />
        ) : null}

        {/* Main Gameplay Screen */}
        {inPlay ? (
          <AbsoluteFill style={{ padding: "80px 48px", boxSizing: "border-box" }}>
            {/* Top Bar: Case # & Brand Badge */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                opacity: headerSpring,
                transform: `translateY(${(1 - headerSpring) * -30}px)`
              }}
            >
              <div
                style={{
                  background: p.palette.card,
                  border: `2px solid ${p.palette.accent}`,
                  borderRadius: 24,
                  padding: "8px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12
                }}
              >
                <span style={{ fontSize: 24 }}>🔍</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: p.palette.gold, letterSpacing: 2 }}>
                  CASE #{p.postNo}
                </span>
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: 3,
                  textTransform: "uppercase"
                }}
              >
                {p.brand}
              </div>
            </div>

            {/* Case Title & Incident Banner */}
            <div
              style={{
                marginTop: 24,
                textAlign: "center",
                opacity: headerSpring
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontFamily: FONT.display,
                  fontSize: 54,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  letterSpacing: 2,
                  textShadow: `0 4px 18px rgba(0,0,0,0.8), 0 0 30px ${p.palette.accent}40`
                }}
              >
                {p.caseTitle}
              </h1>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 24,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                  background: "rgba(0,0,0,0.4)",
                  padding: "8px 20px",
                  borderRadius: 14,
                  display: "inline-block"
                }}
              >
                {p.victimEvent}
              </div>
            </div>

            {/* Middle Section: Clue Board (3 Clues) */}
            <div
              style={{
                marginTop: 28,
                background: "rgba(10, 15, 24, 0.8)",
                border: "2px solid rgba(255, 209, 102, 0.4)",
                borderRadius: 20,
                padding: "16px 20px",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16
              }}
            >
              {p.clues.map((clue, idx) => {
                const clueSpring = spring({
                  frame: Math.max(0, playFrame - idx * 8),
                  fps,
                  config: { damping: 12 }
                });
                return (
                  <div
                    key={clue.id}
                    style={{
                      background: p.palette.card,
                      borderRadius: 14,
                      padding: "14px 12px",
                      textAlign: "center",
                      border: "1px solid rgba(255,255,255,0.15)",
                      opacity: clueSpring,
                      transform: `scale(${clueSpring})`
                    }}
                  >
                    <div style={{ fontSize: 32 }}>{clue.icon}</div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: p.palette.gold,
                        marginTop: 4,
                        letterSpacing: 1
                      }}
                    >
                      {clue.title}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.85)",
                        marginTop: 4,
                        lineHeight: 1.3
                      }}
                    >
                      {clue.detail}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Suspects Lineup & Spotlight Arena */}
            <div
              style={{
                marginTop: 56,
                position: "relative",
                height: 720,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end"
              }}
            >
              {p.suspects.map((suspect, idx) => {
                const isSpeaking = activeSuspect === idx;
                const talkAmp = isSpeaking ? (Math.sin(playFrame / 4) > 0 ? 0.75 : 0.25) : 0;
                const suspectAction = isSpeaking
                  ? "talking"
                  : activeSuspect >= 0
                  ? "nervous"
                  : "idle";
                const suspectExp = isSpeaking
                  ? (suspect.isLiar ? "evil-smile" : "nervous")
                  : "suspicious";

                return (
                  <div
                    key={suspect.characterId}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative"
                    }}
                  >
                    {/* Spotlight Beam */}
                    {isSpeaking ? (
                      <div
                        style={{
                          position: "absolute",
                          top: -70,
                          width: 260,
                          height: 600,
                          background: `radial-gradient(ellipse at 50% 0%, ${p.palette.accent}77 0%, transparent 75%)`,
                          pointerEvents: "none",
                          zIndex: 0
                        }}
                      />
                    ) : null}

                    {/* Suspect Speech Bubble when active */}
                    {isSpeaking ? (
                      <div
                        style={{
                          position: "absolute",
                          top: -30,
                          width: 290,
                          background: "#FFFFFF",
                          color: "#181410",
                          padding: "12px 14px",
                          borderRadius: 16,
                          fontSize: 17,
                          fontWeight: 700,
                          lineHeight: 1.35,
                          textAlign: "center",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.7), 0 0 15px rgba(255,209,102,0.4)",
                          border: `2px solid ${p.palette.gold}`,
                          zIndex: 10
                        }}
                      >
                        "{suspect.statement}"
                        <div
                          style={{
                            position: "absolute",
                            bottom: -10,
                            left: "50%",
                            marginLeft: -10,
                            width: 0,
                            height: 0,
                            borderLeft: "10px solid transparent",
                            borderRight: "10px solid transparent",
                            borderTop: `10px solid #FFFFFF`
                          }}
                        />
                      </div>
                    ) : null}

                    {/* 2D Vector Character Rig */}
                    <div style={{ zIndex: 1, marginBottom: -8 }}>
                      <CharacterRig
                        character={suspect.characterId}
                        action={suspectAction}
                        expression={suspectExp}
                        frame={frame}
                        talk={talkAmp}
                        scale={0.88}
                      />
                    </div>

                    {/* Numbered Podium */}
                    <div
                      style={{
                        width: "92%",
                        background: isSpeaking
                          ? `linear-gradient(180deg, ${p.palette.accent} 0%, #B8860B 100%)`
                          : "linear-gradient(180deg, #2E3440 0%, #151A23 100%)",
                        border: isSpeaking ? `3px solid ${p.palette.gold}` : "2px solid rgba(255,255,255,0.2)",
                        borderRadius: "16px 16px 8px 8px",
                        padding: "12px 8px",
                        textAlign: "center",
                        boxShadow: isSpeaking
                          ? `0 0 30px ${p.palette.accent}88, 0 12px 24px rgba(0,0,0,0.85)`
                          : "0 8px 16px rgba(0,0,0,0.5)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 900,
                          color: isSpeaking ? "#1A1208" : "#FFFFFF"
                        }}
                      >
                        #{idx + 1}
                      </div>
                      <div
                        style={{
                          fontSize: 19,
                          fontWeight: 800,
                          color: isSpeaking ? "#1A1208" : p.palette.gold,
                          marginTop: 3,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {suspect.name}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: isSpeaking ? "#3D2B14" : "rgba(255,255,255,0.7)",
                          marginTop: 2
                        }}
                      >
                        {suspect.profession}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Jasoos Bhai Detective Banner */}
            <div
              style={{
                marginTop: 48,
                background: "linear-gradient(135deg, rgba(20,26,38,0.92) 0%, rgba(10,13,20,0.95) 100%)",
                border: `2px solid ${p.palette.gold}88`,
                borderRadius: 22,
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                gap: 22,
                boxShadow: "0 14px 35px rgba(0,0,0,0.7)"
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 105,
                  height: 125,
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 18,
                  background: "rgba(0,0,0,0.5)",
                  border: `2px solid ${p.palette.gold}66`
                }}
              >
                <div style={{ position: "absolute", top: -35, left: "50%", transform: "translateX(-50%)" }}>
                  <CharacterRig
                    character="jasoos-bhai"
                    action={activeSuspect >= 0 ? "thinking" : "pointing"}
                    expression="thinking"
                    frame={frame}
                    scale={0.48}
                  />
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: p.palette.gold, letterSpacing: 1.5 }}>
                  🕵️‍♂️ JASOOS BHAI:
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF", marginTop: 4, lineHeight: 1.3 }}>
                  {activeSuspect >= 0
                    ? `Suspect #${activeSuspect + 1} ki baat dhyan se suno aur suraagon se milao!`
                    : "Teeno suraag dekh liye? Ab suspects ke bayaan suno!"}
                </div>
              </div>
            </div>
          </AbsoluteFill>
        ) : null}

        {/* AskOutro Screen (Ending ~5.2s) */}
        <AskOutro
          from={askStart}
          a={p.askOutro}
          accent={p.palette.accent}
          tapAt={followTapAt(p.askOutro)}
        />

        {/* Audio Layer */}
        {p.sound ? (
          <SoundBed
            music="sfx/music_chase.mp3"
            musicVolume={0.16}
            duck={duckFromCues(p.voice)}
            sfx={sfx}
          />
        ) : null}
        <VoiceCues cues={p.voice} />
      </AbsoluteFill>
    </StyleFilter>
  );
};

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AskOutro } from "../../../packages/visuals/src/AskOutro";
import { FONT, useBundledFonts } from "../../../packages/visuals/src/fonts";
import { PrevAnswerCard } from "../../../packages/visuals/src/PrevAnswer";
import { SoundBed, duckFromCues, type Sfx } from "../../../packages/visuals/src/Sound";
import { VoiceCues } from "../../../packages/visuals/src/VoiceCues";
import { askOutroSfx, followTapAt } from "../../ask-outro";
import type { BreakingDesk } from "./model";

/**
 * ChatStory Breaking Desk Composition
 *
 * Exact Visual Match to GravityClaw #41 Chat Story:
 * - Mobile Messenger Phone UI (clean card on subtle vignette or full vertical 9:16)
 * - Top App Header: Back chevron `< `, Coral/Teal contact avatar with initial, Contact Name, and green `• online` pulse
 * - Top Center Pill: `BREAKING NEWS` / category & `Today 11:42 PM`
 * - Staggered Chat Bubbles:
 *   - Right: Teal bubbles (#00A884 / #128C7E) with white text & `Read` receipt
 *   - Left: White bubbles (#FFFFFF) with dark charcoal text & subtle drop shadow
 *   - Typing Indicator: 3 bouncing animated dots in white bubble (...) before incoming replies
 *   - Auto-scrolling message thread with smooth spring easing
 * - Bottom Bar: Capsule input with "Message" placeholder + Circular teal send button (↑)
 * - Audio & Voice: Synchronized TTS voice lines, pop SFX on bubble entries, AskOutro debate
 */
export const BreakingDeskComposition: React.FC<BreakingDesk> = (p) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introFrames = Math.round(p.introSeconds * fps);
  const playFrames = Math.round(p.playSeconds * fps);
  const playStart = introFrames;
  const outroStart = introFrames + playFrames;
  const _inPlay = frame >= playStart && frame < outroStart;
  const f = Math.max(0, frame - playStart);

  // Sound cues
  const sfx: Sfx[] = [
    { src: "sfx/pop.mp3", at: p.introSeconds + 0.4, volume: 0.4 },
    { src: "sfx/pop.mp3", at: p.introSeconds + 2.5, volume: 0.4 },
    { src: "sfx/ding.mp3", at: p.introSeconds + 4.2, volume: 0.35 },
    { src: "sfx/pop.mp3", at: p.introSeconds + 6.0, volume: 0.4 },
    { src: "sfx/pop.mp3", at: p.introSeconds + 8.5, volume: 0.4 },
    ...askOutroSfx(p.askOutro, p.introSeconds + p.playSeconds)
  ];

  // Derive conversation dialogue from the news story
  const messages = [
    {
      id: "m1",
      sender: "user" as const,
      text: "did you see what just dropped in the news?!",
      startFrame: 10
    },
    {
      id: "m2",
      sender: "contact" as const,
      text: p.story.headline,
      startFrame: 65,
      typingFrom: 35
    },
    {
      id: "m3",
      sender: "user" as const,
      text: "Wait, is this officially confirmed?!",
      startFrame: 120,
      hasReadReceipt: true
    },
    {
      id: "m4",
      sender: "contact" as const,
      text: p.story.cardText,
      startFrame: 175,
      typingFrom: 145
    },
    {
      id: "m5",
      sender: "contact" as const,
      text: `⚡ ${p.story.highlightLine}`,
      startFrame: 235
    },
    {
      id: "m6",
      sender: "user" as const,
      text: "This changes literally everything.",
      startFrame: 295
    }
  ];

  // Dynamic vertical auto-scroll as messages accumulate
  const scrollY = interpolate(
    f,
    [10, 110, 170, 230, 290],
    [0, -40, -180, -320, -460],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Contact info
  const contactName = p.brand || "Breaking Wire";
  const initialLetter = contactName.slice(0, 1).toUpperCase() || "M";

  // Typing dots animation
  const dot1 = Math.sin(frame * 0.4) * 4;
  const dot2 = Math.sin(frame * 0.4 + 1.2) * 4;
  const dot3 = Math.sin(frame * 0.4 + 2.4) * 4;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#E2E8F0",
        color: "#111827",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {/* 1. MOBILE PHONE CONTAINER (Clean App Frame) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#F0F2F5",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {/* 2. TOP HEADER (Mobile Messenger App Bar) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 190,
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            padding: "60px 40px 20px",
            boxShadow: "0 4px 18px rgba(0, 0, 0, 0.06)",
            zIndex: 40
          }}
        >
          {/* Back chevron */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#00A884",
              marginRight: 24,
              fontFamily: FONT.ui,
              cursor: "pointer"
            }}
          >
            ‹
          </div>

          {/* Contact Round Avatar */}
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#FFFFFF",
              fontFamily: FONT.ui,
              fontWeight: 900,
              fontSize: 38,
              boxShadow: "0 4px 12px rgba(255, 107, 107, 0.35)",
              marginRight: 24
            }}
          >
            {initialLetter}
          </div>

          {/* Contact Name & Status */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: FONT.ui,
                fontSize: 34,
                fontWeight: 900,
                color: "#111827",
                lineHeight: 1.1
              }}
            >
              {contactName}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
                fontFamily: FONT.ui,
                fontSize: 22,
                fontWeight: 700,
                color: "#00A884"
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#22C55E",
                  boxShadow: "0 0 8px #22C55E"
                }}
              />
              online
            </div>
          </div>
        </div>

        {/* 3. CHAT CONVERSATION AREA */}
        <div
          style={{
            position: "absolute",
            top: 190,
            bottom: 150,
            left: 0,
            right: 0,
            padding: "36px 44px 20px",
            overflow: "hidden"
          }}
        >
          {/* Top Info Banner & Timestamp */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              marginBottom: 36
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.06)",
                padding: "6px 20px",
                borderRadius: 99,
                fontFamily: FONT.ui,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: 2,
                color: "#4B5563",
                textTransform: "uppercase"
              }}
            >
              {p.story.category || "BREAKING NEWS"}
            </div>
            <div
              style={{
                fontFamily: FONT.ui,
                fontSize: 20,
                fontWeight: 600,
                color: "#9CA3AF"
              }}
            >
              Today 11:42 PM
            </div>
          </div>

          {/* Scrolling Messages Stream */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              transform: `translateY(${scrollY}px)`,
              transition: "transform 0.4s ease-out"
            }}
          >
            {messages.map((m) => {
              const isUser = m.sender === "user";
              const showMsg = f >= m.startFrame;

              // Typing indicator before message arrives
              const isTyping =
                m.typingFrom !== undefined && f >= m.typingFrom && f < m.startFrame;

              const msgSpring = spring({
                frame: Math.max(0, f - m.startFrame),
                fps,
                config: { damping: 12, stiffness: 150 }
              });

              return (
                <React.Fragment key={m.id}>
                  {/* Typing Indicator Bubble */}
                  {isTyping && (
                    <div
                      style={{
                        alignSelf: "flex-start",
                        backgroundColor: "#FFFFFF",
                        padding: "16px 26px",
                        borderRadius: "24px 24px 24px 4px",
                        boxShadow: "0 3px 12px rgba(0, 0, 0, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: "#9CA3AF",
                          transform: `translateY(${dot1}px)`
                        }}
                      />
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: "#9CA3AF",
                          transform: `translateY(${dot2}px)`
                        }}
                      />
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: "#9CA3AF",
                          transform: `translateY(${dot3}px)`
                        }}
                      />
                    </div>
                  )}

                  {/* Actual Chat Bubble */}
                  {showMsg && (
                    <div
                      style={{
                        alignSelf: isUser ? "flex-end" : "flex-start",
                        maxWidth: "84%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isUser ? "flex-end" : "flex-start",
                        transform: `scale(${msgSpring}) translateY(${(1 - msgSpring) * 30}px)`,
                        transformOrigin: isUser ? "bottom right" : "bottom left",
                        opacity: msgSpring
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: isUser ? "#00A884" : "#FFFFFF",
                          color: isUser ? "#FFFFFF" : "#111827",
                          padding: "20px 28px",
                          borderRadius: isUser ? "28px 28px 6px 28px" : "28px 28px 28px 6px",
                          boxShadow: isUser
                            ? "0 4px 14px rgba(0, 168, 132, 0.3)"
                            : "0 4px 16px rgba(0, 0, 0, 0.06)",
                          fontFamily: FONT.ui,
                          fontSize: 32,
                          fontWeight: 700,
                          lineHeight: 1.3,
                          letterSpacing: 0.2
                        }}
                      >
                        {m.text}
                      </div>

                      {/* Read Receipt */}
                      {isUser && m.hasReadReceipt && f >= m.startFrame + 18 && (
                        <div
                          style={{
                            marginTop: 6,
                            marginRight: 8,
                            fontFamily: FONT.ui,
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#6B7280"
                          }}
                        >
                          Read ✓✓
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 4. BOTTOM INPUT BAR (Mobile Keyboard Input) */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 150,
            backgroundColor: "#FFFFFF",
            padding: "24px 36px 36px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            boxShadow: "0 -4px 18px rgba(0, 0, 0, 0.04)",
            zIndex: 40
          }}
        >
          {/* Capsule input container */}
          <div
            style={{
              flex: 1,
              height: 74,
              backgroundColor: "#F3F4F6",
              borderRadius: 99,
              padding: "0 28px",
              display: "flex",
              alignItems: "center",
              fontFamily: FONT.ui,
              fontSize: 28,
              fontWeight: 600,
              color: "#9CA3AF"
            }}
          >
            Message
          </div>

          {/* Teal Circular Send Button (↑) */}
          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: "50%",
              backgroundColor: "#00A884",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#FFFFFF",
              fontSize: 34,
              fontWeight: 900,
              boxShadow: "0 6px 16px rgba(0, 168, 132, 0.35)"
            }}
          >
            ↑
          </div>
        </div>
      </div>

      {/* 5. PREVIOUS ANSWER RECAP (First 2.5s) */}
      {p.introSeconds > 0 && p.prevAnswer ? (
        <PrevAnswerCard
          seconds={p.introSeconds}
          heading="PICHHLE POST KA JAWAB"
          answer={p.prevAnswer}
          accent="#00A884"
          bg="#1E293B"
        />
      ) : null}

      {/* 6. VOICE AUDIO SYNC */}
      <VoiceCues cues={p.voice} />

      {/* 7. SOUND BED & SFX */}
      {p.sound ? (
        <SoundBed
          music="sfx/music_story.mp3"
          musicVolume={0.16}
          duck={duckFromCues(p.voice)}
          sfx={sfx}
        />
      ) : null}

      {/* 8. COMMUNITY ASK OUTRO (Debate hook) */}
      <AskOutro
        from={outroStart}
        a={p.askOutro}
        accent="#00A884"
        tapAt={followTapAt(p.askOutro)}
      />
    </AbsoluteFill>
  );
};

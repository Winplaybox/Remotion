import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "../../../packages/visuals/src/fonts";
import { SoundBed, duckFromCues, type Sfx } from "../../../packages/visuals/src/Sound";
import { VoiceCues } from "../../../packages/visuals/src/VoiceCues";
import { askOutroSfx } from "../../ask-outro";
import type { BreakingDesk } from "./model";

/**
 * Chat Story Breaking News Composition
 *
 * Exact Visual Match to GravityClaw #41 Chat Story:
 * - Floating clean white container on subtle dark canvas
 * - Header: Teal back arrow (<), Coral/Pink circle avatar (initial), Contact Name, and green • online dot
 * - Subheader: Date (Today 11:42 PM) and category capsule pill (BREAKING NEWS / FICTIONAL STORY)
 * - Message Stream:
 *   - Right: Teal bubbles (#14B8A6) with white text & Read receipt
 *   - Left: White bubbles (#FFFFFF) with dark charcoal text, subtle border & floating emoji reaction
 *   - Typing Indicator: 3 bouncing animated dots in white pill (...) before incoming replies
 *   - NO premature scrolling: All messages stay visible vertically with plenty of headroom!
 * - Footer Input Bar: Light grey rounded capsule ("Message") + Circular teal send button (↑)
 * - End Card: Native in-chat dialog modal popping in the middle of the chat during outro
 */
export const BreakingDeskComposition: React.FC<BreakingDesk> = (p) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introFrames = Math.round(p.introSeconds * fps);
  const playFrames = Math.round(p.playSeconds * fps);
  const playStart = introFrames;
  const outroStart = introFrames + playFrames;
  const isOutro = frame >= outroStart;
  const f = Math.max(0, frame - playStart);

  // Sound cues
  const sfx: Sfx[] = [
    { src: "sfx/pop.mp3", at: p.introSeconds + 0.3, volume: 0.4 },
    { src: "sfx/pop.mp3", at: p.introSeconds + 2.0, volume: 0.4 },
    { src: "sfx/ding.mp3", at: p.introSeconds + 3.8, volume: 0.35 },
    { src: "sfx/pop.mp3", at: p.introSeconds + 5.5, volume: 0.4 },
    { src: "sfx/pop.mp3", at: p.introSeconds + 7.2, volume: 0.4 },
    { src: "sfx/bell.mp3", at: p.introSeconds + p.playSeconds, volume: 0.45 },
    ...askOutroSfx(p.askOutro, p.introSeconds + p.playSeconds)
  ];

  // Resolve chat lines
  const dialogueLines = p.story.dialogue || [
    {
      id: "m1",
      sender: "user" as const,
      text: "did you see what Google News just reported?!",
      time: "11:41 PM"
    },
    {
      id: "m2",
      sender: "contact" as const,
      text: p.story.headline,
      time: "11:42 PM"
    },
    {
      id: "m3",
      sender: "user" as const,
      text: "wait is this officially confirmed??",
      time: "11:42 PM",
      hasReadReceipt: true
    },
    {
      id: "m4",
      sender: "contact" as const,
      text: p.story.cardText,
      time: "11:43 PM"
    },
    {
      id: "m5",
      sender: "contact" as const,
      text: `⚡ ${p.story.highlightLine}`,
      time: "11:43 PM",
      highlight: true
    },
    {
      id: "m6",
      sender: "user" as const,
      text: "this changes literally everything",
      time: "11:44 PM"
    }
  ];

  // Stagger schedule: messages enter progressively across playSeconds
  const stepDur = Math.floor((p.playSeconds * fps - 45) / dialogueLines.length);
  const messagesWithTiming = dialogueLines.map((line, idx) => {
    const startFrame = 12 + idx * stepDur;
    const typingFrom = line.sender === "contact" ? Math.max(0, startFrame - 22) : undefined;
    return {
      ...line,
      startFrame,
      typingFrom
    };
  });

  // NO PREMATURE SCROLLING:
  // All messages (up to 9) easily fit in the ~1300px vertical chat space!
  // Only scroll if there are 10+ messages that actually overflow.
  const maxNaturalCount = 9;
  const isOverflowing = dialogueLines.length > maxNaturalCount;
  const scrollY = isOverflowing
    ? interpolate(
        f,
        [playFrames * 0.7, playFrames * 0.95],
        [0, -180],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;

  // In-Chat Dialog Springs (Modal End Card)
  const dialogSpring = spring({
    frame: Math.max(0, frame - outroStart),
    fps,
    config: { damping: 11, stiffness: 140 }
  });
  const dialogOverlayOpacity = interpolate(
    frame - outroStart,
    [0, 14],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Contact Branding
  const contactName = p.story.contactName || p.brand || "Marcus";
  const initialLetter = contactName.slice(0, 1).toUpperCase() || "M";
  const contactStatus = p.story.contactStatus || "• online";

  // Typing dots animation
  const dot1 = Math.sin(frame * 0.45) * 4;
  const dot2 = Math.sin(frame * 0.45 + 1.2) * 4;
  const dot3 = Math.sin(frame * 0.45 + 2.4) * 4;

  // Find last user message with read receipt
  const lastUserMsgId = [...dialogueLines].reverse().find((m) => m.sender === "user" && m.hasReadReceipt)?.id;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0A0A0A",
        color: "#111827",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {/* =========================================================================
          EXACT GRAVITYCLAW CHAT STORY CARD (White Container with Rounded Corners)
         ========================================================================= */}
      <div
        style={{
          position: "absolute",
          top: 50,
          bottom: 50,
          left: 54,
          right: 54,
          backgroundColor: "#FFFFFF",
          borderRadius: 36,
          boxShadow: "0 25px 70px rgba(0, 0, 0, 0.55)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {/* -------------------------------------------------------------------------
            1. EXACT GRAVITYCLAW HEADER (< Marcus • online)
           ------------------------------------------------------------------------- */}
        <div
          style={{
            height: 130,
            backgroundColor: "#FFFFFF",
            borderBottom: "1.5px solid #F1F5F9",
            padding: "0 34px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            zIndex: 40
          }}
        >
          {/* Teal Back Chevron Arrow */}
          <div
            style={{
              fontFamily: FONT.ui,
              fontSize: 44,
              fontWeight: 800,
              color: "#14B8A6",
              cursor: "pointer",
              lineHeight: 1
            }}
          >
            ‹
          </div>

          {/* Coral/Pink Circular Avatar with Initial */}
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#FFFFFF",
              fontFamily: FONT.ui,
              fontWeight: 900,
              fontSize: 36,
              boxShadow: "0 4px 14px rgba(255, 107, 107, 0.35)"
            }}
          >
            {initialLetter}
          </div>

          {/* Contact Name & Status */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: FONT.ui,
                fontSize: 32,
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.15
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
                fontSize: 20,
                fontWeight: 700,
                color: "#14B8A6"
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#22C55E",
                  boxShadow: "0 0 8px #22C55E"
                }}
              />
              {contactStatus}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------------
            2. CHAT STREAM VIEWPORT (Clean, Natural Stack, Plenty of Space)
           ------------------------------------------------------------------------- */}
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            padding: "20px 32px 16px",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Top Date & Category Pill (Exact GravityClaw match) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              marginBottom: 20
            }}
          >
            <div
              style={{
                fontFamily: FONT.ui,
                fontSize: 18,
                fontWeight: 600,
                color: "#94A3B8"
              }}
            >
              Today 11:42 PM
            </div>
            <div
              style={{
                backgroundColor: "#F1F5F9",
                color: "#64748B",
                fontFamily: FONT.ui,
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 1.5,
                padding: "5px 18px",
                borderRadius: 99,
                textTransform: "uppercase"
              }}
            >
              {p.story.category || "BREAKING NEWS"}
            </div>
          </div>

          {/* Message Stream */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              transform: `translateY(${scrollY}px)`,
              transition: "transform 0.4s ease-out"
            }}
          >
            {messagesWithTiming.map((m) => {
              const isUser = m.sender === "user";
              const showMsg = f >= m.startFrame;

              // Typing indicator before incoming message
              const isTyping =
                m.typingFrom !== undefined && f >= m.typingFrom && f < m.startFrame;

              const msgSpring = spring({
                frame: Math.max(0, f - m.startFrame),
                fps,
                config: { damping: 13, stiffness: 160 }
              });

              return (
                <React.Fragment key={m.id}>
                  {/* Bouncing Typing Indicator Pill */}
                  {isTyping && (
                    <div
                      style={{
                        alignSelf: "flex-start",
                        backgroundColor: "#FFFFFF",
                        padding: "16px 26px",
                        borderRadius: "22px 22px 22px 4px",
                        border: "1.5px solid #F1F5F9",
                        boxShadow: "0 3px 12px rgba(0, 0, 0, 0.04)",
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
                          backgroundColor: "#14B8A6",
                          transform: `translateY(${dot1}px)`
                        }}
                      />
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: "#14B8A6",
                          transform: `translateY(${dot2}px)`
                        }}
                      />
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: "#14B8A6",
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
                        maxWidth: "80%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isUser ? "flex-end" : "flex-start",
                        transform: `scale(${msgSpring}) translateY(${(1 - msgSpring) * 20}px)`,
                        transformOrigin: isUser ? "bottom right" : "bottom left",
                        opacity: msgSpring,
                        position: "relative"
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: isUser ? "#14B8A6" : "#FFFFFF",
                          color: isUser ? "#FFFFFF" : "#1E293B",
                          padding: "16px 26px",
                          borderRadius: isUser ? "22px 22px 4px 22px" : "22px 22px 22px 4px",
                          border: isUser ? "none" : "1.5px solid #F1F5F9",
                          boxShadow: isUser
                            ? "0 4px 14px rgba(20, 184, 166, 0.3)"
                            : "0 3px 12px rgba(0, 0, 0, 0.04)",
                          fontFamily: FONT.ui,
                          fontSize: 28,
                          fontWeight: 700,
                          lineHeight: 1.35,
                          letterSpacing: 0.2,
                          position: "relative"
                        }}
                      >
                        {m.text}

                        {/* Floating Reaction Emoji Badge (e.g. 😂 or ⚡) */}
                        {m.reactionEmoji && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: -16,
                              right: 12,
                              backgroundColor: "#FFFFFF",
                              borderRadius: "50%",
                              width: 42,
                              height: 42,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
                              fontSize: 24,
                              border: "1.5px solid #F1F5F9"
                            }}
                          >
                            {m.reactionEmoji}
                          </div>
                        )}
                      </div>

                      {/* GravityClaw Read Receipt */}
                      {isUser && m.id === lastUserMsgId && f >= m.startFrame + 14 && (
                        <div
                          style={{
                            marginTop: 5,
                            marginRight: 6,
                            fontFamily: FONT.ui,
                            fontSize: 18,
                            fontWeight: 600,
                            color: "#94A3B8"
                          }}
                        >
                          Read
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* -------------------------------------------------------------------------
            3. EXACT GRAVITYCLAW FOOTER (Capsule Input + Teal Up-Arrow Button)
           ------------------------------------------------------------------------- */}
        <div
          style={{
            height: 120,
            backgroundColor: "#FFFFFF",
            borderTop: "1.5px solid #F1F5F9",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            gap: 18,
            zIndex: 40
          }}
        >
          {/* Rounded Input Capsule */}
          <div
            style={{
              flex: 1,
              height: 72,
              backgroundColor: "#F1F5F9",
              borderRadius: 99,
              padding: "0 28px",
              display: "flex",
              alignItems: "center",
              fontFamily: FONT.ui,
              fontSize: 26,
              fontWeight: 600,
              color: "#94A3B8"
            }}
          >
            Message
          </div>

          {/* Teal Circular Send Button (↑) */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              backgroundColor: "#14B8A6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: 34,
              fontWeight: 900,
              boxShadow: "0 6px 16px rgba(20, 184, 166, 0.35)"
            }}
          >
            ↑
          </div>
        </div>

        {/* -------------------------------------------------------------------------
            4. IN-CHAT CENTERED DIALOG MODAL (End Card)
           ------------------------------------------------------------------------- */}
        {isOutro && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "0 44px",
              zIndex: 80,
              opacity: dialogOverlayOpacity
            }}
          >
            {/* The Native Dialog Card */}
            <div
              style={{
                width: "100%",
                maxWidth: 880,
                backgroundColor: "#FFFFFF",
                borderRadius: 36,
                padding: "44px 40px 36px",
                boxShadow: "0 25px 70px rgba(0, 0, 0, 0.45)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: `scale(${dialogSpring}) translateY(${(1 - dialogSpring) * 50}px)`,
                border: "2px solid rgba(255, 255, 255, 0.8)"
              }}
            >
              {/* Top Badge */}
              <div
                style={{
                  backgroundColor: "#CCFBF1",
                  color: "#0F766E",
                  padding: "8px 24px",
                  borderRadius: 99,
                  fontFamily: FONT.ui,
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 18
                }}
              >
                📊 BREAKING POLL
              </div>

              {/* The Question */}
              <div
                style={{
                  fontFamily: FONT.ui,
                  fontSize: 36,
                  fontWeight: 900,
                  lineHeight: 1.25,
                  color: "#111827",
                  textAlign: "center",
                  marginBottom: 28
                }}
              >
                {p.askOutro.question}
              </div>

              {/* Interactive Poll Options */}
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
                {p.askOutro.options.map((opt, i) => (
                  <div
                    key={i}
                    style={{
                      width: "100%",
                      backgroundColor: "#F8FAFC",
                      border: "2px solid #E2E8F0",
                      borderRadius: 20,
                      padding: "16px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: FONT.ui,
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#1E293B"
                    }}
                  >
                    <span>{opt}</span>
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        border: "2px solid #14B8A6",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      ○
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Action Button */}
              <div
                style={{
                  marginTop: 26,
                  width: "100%",
                  backgroundColor: "#14B8A6",
                  color: "#FFFFFF",
                  padding: "18px 28px",
                  borderRadius: 99,
                  textAlign: "center",
                  fontFamily: FONT.ui,
                  fontSize: 26,
                  fontWeight: 900,
                  letterSpacing: 1,
                  boxShadow: "0 8px 24px rgba(20, 184, 166, 0.35)"
                }}
              >
                Drop Your Answer in Comments Below 💬
              </div>

              {/* Channel Handle */}
              <div
                style={{
                  marginTop: 14,
                  fontFamily: FONT.mono,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#9CA3AF"
                }}
              >
                {p.handle}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. VOICE AUDIO SYNC */}
      <VoiceCues cues={p.voice} />

      {/* 6. SOUND BED & SFX */}
      {p.sound ? (
        <SoundBed
          music="sfx/music_story.mp3"
          musicVolume={0.16}
          duck={duckFromCues(p.voice)}
          sfx={sfx}
        />
      ) : null}
    </AbsoluteFill>
  );
};

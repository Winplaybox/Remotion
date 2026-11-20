import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "../../../packages/visuals/src/fonts";
import { duckFromCues, SoundBed, type Sfx } from "../../../packages/visuals/src/Sound";
import { VoiceCues } from "../../../packages/visuals/src/VoiceCues";
import { askOutroSfx } from "../../ask-outro";
import type { BreakingDesk } from "./model";

/**
 * Chat Box / Story Breaking News Composition
 *
 * All Use Cases Covered (Remotion Ready):
 * - User Typing → Submit: Progressive character-by-character typing in input bar with cursor (|),
 *   then send button pulses and input clears on submit!
 * - Message Becomes Bubble: Pops/slides in with spring physics, and animated checkmark status
 *   (✓ Sent → ✓✓ Delivered → ✓✓ Read).
 * - Receiver Typing: Three animated bouncing dots (...) appear inside a pill before reply.
 * - Receiver Responds: Message bubble springs in after typing.
 * - Message Reactions: ❤️ 😂 👍 😮 😢 🙏 appear as reaction pills with counts and pop scale animation!
 * - Bullets & Multi-line: Clean checklist support (✅ Available worldwide, etc.)
 * - In-Chat Poll / Vote Modal: Native centered card with radio options and 'Vote Now' button!
 * - Header Actions: Back chevron, Avatar, Online status, plus Phone 📞, Camera 📹, More ⋮ icons.
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
      text: "did you see what news just reported?!",
      time: "11:42 PM",
      hasReadReceipt: true
    },
    {
      id: "m2",
      sender: "contact" as const,
      text: "A new AI assistant just launched worldwide. 🤖",
      time: "11:43 PM"
    },
    {
      id: "m3",
      sender: "user" as const,
      text: "wait is this officially confirmed??",
      time: "11:43 PM",
      hasReadReceipt: true
    },
    {
      id: "m4",
      sender: "contact" as const,
      text: "Yes! It's officially confirmed. ✅\nThey've started rolling it out today. 🚀",
      time: "11:44 PM",
      reactions: [{ emoji: "❤️", count: 3 }]
    },
    {
      id: "m5",
      sender: "user" as const,
      text: "That's huge! 🔥",
      time: "11:44 PM",
      hasReadReceipt: true
    },
    {
      id: "m6",
      sender: "contact" as const,
      text: "Here's the key highlights:",
      bullets: [
        "Available worldwide",
        "Faster & more accurate",
        "Works across all devices"
      ],
      time: "11:45 PM",
      reactions: [{ emoji: "👍", count: 8 }, { emoji: "🎉", count: 2 }]
    }
  ];

  // Active trailing typing from story (e.g. "That's amazing!")
  const activeTyping = p.story.activeTypingInput;
  const totalSlots = dialogueLines.length + (activeTyping ? 0.8 : 0);
  const slotDur = Math.floor((p.playSeconds * fps - 45) / totalSlots);

  // Stagger schedule: calculates typing start, submit frame, bubble start, and reaction frame
  const messagesWithTiming = dialogueLines.map((line, idx) => {
    const slotStart = 10 + idx * slotDur;
    const isUser = line.sender === "user";

    // User: types inside input bar, then submits
    const typeDuration = isUser
      ? Math.min(32, Math.max(16, Math.floor(line.text.length * 0.85)))
      : 0;
    const submitFrame = isUser ? slotStart + typeDuration : slotStart + 22;

    // Contact typing indicator: 3 dots bouncing
    const typingFrom = !isUser ? slotStart : undefined;

    // The bubble appears at submitFrame
    const bubbleStart = submitFrame;

    // Reaction pops in after bubble settles
    const reactionFrame = bubbleStart + 20;

    return {
      ...line,
      slotStart,
      typeStart: isUser ? slotStart : undefined,
      submitFrame,
      bubbleStart,
      typingFrom,
      reactionFrame
    };
  });

  // Calculate live input bar text & cursor
  const activeUserTypingMsg = messagesWithTiming.find(
    (m) => m.sender === "user" && m.typeStart !== undefined && f >= m.typeStart && f < m.submitFrame
  );

  const lastMsg = messagesWithTiming[messagesWithTiming.length - 1];
  const trailingStart = lastMsg ? lastMsg.bubbleStart + 35 : 0;
  const isTrailingTyping = !!activeTyping && f >= trailingStart;

  let displayedInputText = "Message";
  let isInputPlaceholder = true;

  if (activeUserTypingMsg && activeUserTypingMsg.typeStart !== undefined) {
    const chars = Math.min(
      activeUserTypingMsg.text.length,
      Math.floor(
        interpolate(
          f,
          [activeUserTypingMsg.typeStart, activeUserTypingMsg.submitFrame],
          [0, activeUserTypingMsg.text.length],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
      )
    );
    const cursor = f % 14 < 7 ? "|" : "";
    displayedInputText = activeUserTypingMsg.text.slice(0, chars) + cursor;
    isInputPlaceholder = false;
  } else if (isTrailingTyping && activeTyping) {
    const trailingDuration = 38;
    const chars = Math.min(
      activeTyping.length,
      Math.floor(
        interpolate(f, [trailingStart, trailingStart + trailingDuration], [0, activeTyping.length], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp"
        })
      )
    );
    const cursor = f % 14 < 7 ? "|" : "";
    displayedInputText = activeTyping.slice(0, chars) + cursor;
    isInputPlaceholder = false;
  }

  // Send button bounce at submit moments
  const justSubmittedMsg = messagesWithTiming.find(
    (m) => m.sender === "user" && f >= m.submitFrame && f < m.submitFrame + 14
  );
  const sendScale = justSubmittedMsg
    ? 1 + Math.sin((f - justSubmittedMsg.submitFrame) * 0.45) * 0.22
    : 1;

  // NO PREMATURE SCROLLING:
  // All messages (up to 9) easily fit in the ~1400px vertical chat space!
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
            1. EXACT HEADER (< Marcus • online + Phone 📞, Camera 📹, More ⋮)
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

          {/* Action Icons on Right: Phone, Video, More (From Infographic) */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 24,
              color: "#14B8A6"
            }}
          >
            {/* Phone Call Icon */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {/* Video Camera Icon */}
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="23 7 16 12 23 17 23 7" fill="currentColor" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            {/* 3-dots Menu Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2.2" />
              <circle cx="12" cy="12" r="2.2" />
              <circle cx="12" cy="19" r="2.2" />
            </svg>
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
          {/* Top Date & Category Pill */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              marginBottom: 16
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
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>📊</span>
              <span>{p.story.category || "BREAKING NEWS"}</span>
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
              const showMsg = f >= m.bubbleStart;

              // Typing indicator before incoming message
              const isTyping =
                m.typingFrom !== undefined && f >= m.typingFrom && f < m.bubbleStart;

              const msgSpring = spring({
                frame: Math.max(0, f - m.bubbleStart),
                fps,
                config: { damping: 13, stiffness: 170 }
              });

              // Checkmarks progression for user: ✓ (Sent) → ✓✓ (Delivered) → ✓✓ (Read)
              const framesSinceBubble = f - m.bubbleStart;
              const isDelivered = framesSinceBubble >= 10;
              const isRead = framesSinceBubble >= 22;

              // Reaction spring
              const showReaction = f >= m.reactionFrame;
              const reactionSpring = spring({
                frame: Math.max(0, f - m.reactionFrame),
                fps,
                config: { damping: 11, stiffness: 200 }
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
                        maxWidth: "82%",
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
                          padding: "16px 24px",
                          borderRadius: isUser ? "22px 22px 4px 22px" : "22px 22px 22px 4px",
                          border: isUser ? "none" : "1.5px solid #F1F5F9",
                          boxShadow: isUser
                            ? "0 4px 14px rgba(20, 184, 166, 0.3)"
                            : "0 3px 12px rgba(0, 0, 0, 0.04)",
                          fontFamily: FONT.ui,
                          fontSize: 27,
                          fontWeight: 700,
                          lineHeight: 1.35,
                          letterSpacing: 0.2,
                          position: "relative",
                          whiteSpace: "pre-line"
                        }}
                      >
                        {m.text}

                        {/* Checklist Bullets */}
                        {m.bullets && m.bullets.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                              marginTop: 10
                            }}
                          >
                            {m.bullets.map((b, bi) => (
                              <div
                                key={bi}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  fontSize: 24,
                                  fontWeight: 700,
                                  color: "#1E293B"
                                }}
                              >
                                <span style={{ fontSize: 20 }}>✅</span>
                                <span>{b}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Timestamp & Checkmarks on User Bubble */}
                        <div
                          style={{
                            marginTop: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 6,
                            fontSize: 16,
                            fontWeight: 600,
                            color: isUser ? "rgba(255, 255, 255, 0.85)" : "#94A3B8"
                          }}
                        >
                          <span>{m.time || "11:42 PM"}</span>
                          {isUser && (
                            <span
                              style={{
                                color: isRead ? "#5EEAD4" : "rgba(255, 255, 255, 0.85)",
                                fontWeight: 900,
                                fontSize: 16,
                                letterSpacing: -2
                              }}
                            >
                              {isDelivered ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>

                        {/* Multi-Reaction Pills (From Infographic: ❤️ 3, 👍 8, 🎉 2) */}
                        {showReaction && m.reactions && m.reactions.length > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: -18,
                              left: isUser ? "auto" : 12,
                              right: isUser ? 12 : "auto",
                              display: "flex",
                              gap: 6,
                              zIndex: 25,
                              transform: `scale(${reactionSpring})`,
                              transformOrigin: isUser ? "bottom right" : "bottom left"
                            }}
                          >
                            {m.reactions.map((r, ri) => (
                              <div
                                key={ri}
                                style={{
                                  backgroundColor: "#FFFFFF",
                                  border: "1.5px solid #E2E8F0",
                                  borderRadius: 99,
                                  padding: "3px 10px",
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: 19,
                                  fontWeight: 800,
                                  color: "#1E293B"
                                }}
                              >
                                <span>{r.emoji}</span>
                                {r.count !== undefined && (
                                  <span style={{ fontSize: 16, fontWeight: 800, color: "#64748B" }}>
                                    {r.count}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Backward Compatible Single Reaction Badge */}
                        {showReaction && !m.reactions && m.reactionEmoji && (
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
                              border: "1.5px solid #F1F5F9",
                              transform: `scale(${reactionSpring})`
                            }}
                          >
                            {m.reactionEmoji}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* -------------------------------------------------------------------------
            3. EXACT FOOTER (Live Typing + Smile + Pulsing Send Button)
           ------------------------------------------------------------------------- */}
        <div
          style={{
            height: 120,
            backgroundColor: "#FFFFFF",
            borderTop: "1.5px solid #F1F5F9",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            gap: 16,
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
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: FONT.ui,
              fontSize: 26,
              fontWeight: isInputPlaceholder ? 600 : 700,
              color: isInputPlaceholder ? "#94A3B8" : "#111827",
              boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.04)"
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayedInputText}
            </span>

            {/* Smiley Emoji Icon */}
            <span style={{ fontSize: 26, cursor: "pointer", opacity: 0.85, marginLeft: 8 }}>
              😊
            </span>
          </div>

          {/* Teal Circular Send Button (Pulses on Submit) */}
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
              transform: `scale(${sendScale})`,
              transition: "transform 0.15s ease-out",
              boxShadow: "0 6px 18px rgba(20, 184, 166, 0.4)"
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" fill="#FFFFFF" />
            </svg>
          </div>
        </div>

        {/* -------------------------------------------------------------------------
            4. IN-CHAT POLL / VOTE MODAL (From Infographic)
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
            {/* The Native Poll Card */}
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
              {/* Top Badge: 📊 POLL */}
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
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <span>📊</span>
                <span>POLL</span>
              </div>

              {/* The Question */}
              <div
                style={{
                  fontFamily: FONT.ui,
                  fontSize: 34,
                  fontWeight: 900,
                  lineHeight: 1.25,
                  color: "#111827",
                  textAlign: "center",
                  marginBottom: 26
                }}
              >
                {p.askOutro.question}
              </div>

              {/* Interactive Radio Options */}
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
                {p.askOutro.options.map((opt, i) => {
                  const isFirstSelected = i === 0;
                  return (
                    <div
                      key={i}
                      style={{
                        width: "100%",
                        backgroundColor: isFirstSelected ? "#F0FDFA" : "#F8FAFC",
                        border: isFirstSelected ? "2px solid #14B8A6" : "2px solid #E2E8F0",
                        borderRadius: 20,
                        padding: "16px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontFamily: FONT.ui,
                        fontSize: 26,
                        fontWeight: 800,
                        color: isFirstSelected ? "#0F766E" : "#1E293B"
                      }}
                    >
                      <span>{opt}</span>
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          border: isFirstSelected ? "2px solid #14B8A6" : "2px solid #CBD5E1",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        {isFirstSelected && (
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              backgroundColor: "#14B8A6"
                            }}
                          />
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Action Button: Vote Now */}
              <div
                style={{
                  marginTop: 24,
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
                  boxShadow: "0 8px 24px rgba(20, 184, 166, 0.35)",
                  cursor: "pointer"
                }}
              >
                Vote Now
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

      {/* 6. SFX BED */}
      {p.sound && <SoundBed sfx={sfx} duck={duckFromCues(p.voice)} />}
    </AbsoluteFill>
  );
};

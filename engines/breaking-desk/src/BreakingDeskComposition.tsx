import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "../../../packages/visuals/src/fonts";
import { SoundBed, duckFromCues, type Sfx } from "../../../packages/visuals/src/Sound";
import { VoiceCues } from "../../../packages/visuals/src/VoiceCues";
import { askOutroSfx } from "../../ask-outro";
import type { BreakingDesk } from "./model";

/**
 * Authentic Mobile Phone Chat Story Composition
 *
 * Engineered to feel 100% like a real live smartphone chat:
 * - Real iOS Status Bar (9:41, Dynamic Island, 5G, Wi-Fi, 100% Battery)
 * - Navigation Header Bar with Back button, Avatar, Verified badge, • online
 * - Strictly Contained Chat Viewport (No overlay leaks on header/footer)
 * - Realistic WhatsApp/iOS bubbles with tails, timestamps & blue read receipts (✓✓)
 * - Animated bouncing typing indicator (...) before incoming replies
 * - In-Chat Native Dialog End Card (Poll / Question modal pops up in the middle of the chat)
 * - Bottom Phone Input Bar with emoji, capsule, camera, and circular send button
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
    { src: "sfx/pop.mp3", at: p.introSeconds + 2.2, volume: 0.4 },
    { src: "sfx/ding.mp3", at: p.introSeconds + 4.0, volume: 0.35 },
    { src: "sfx/pop.mp3", at: p.introSeconds + 5.8, volume: 0.4 },
    { src: "sfx/pop.mp3", at: p.introSeconds + 8.0, volume: 0.4 },
    { src: "sfx/bell.mp3", at: p.introSeconds + p.playSeconds, volume: 0.45 },
    ...askOutroSfx(p.askOutro, p.introSeconds + p.playSeconds)
  ];

  // Resolve chat lines (either custom dialogue or derived from story)
  const dialogueLines = p.story.dialogue || [
    {
      id: "m1",
      sender: "user" as const,
      text: "did you see what just dropped in the news?!",
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
      text: "Wait, is this officially confirmed?!",
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
      text: "This changes literally everything.",
      time: "11:44 PM"
    }
  ];

  // Stagger schedule for messages & typing indicators
  const stepDur = Math.floor((p.playSeconds * fps - 60) / dialogueLines.length);
  const messagesWithTiming = dialogueLines.map((line, idx) => {
    const startFrame = 15 + idx * stepDur;
    const typingFrom = line.sender === "contact" ? Math.max(0, startFrame - 25) : undefined;
    return {
      ...line,
      startFrame,
      typingFrom
    };
  });

  // Dynamic vertical auto-scroll: keeps the newest message comfortably in the lower-middle viewport
  const scrollKeyframes = messagesWithTiming.map((m) => m.startFrame);
  const scrollValues = [0, 0, -40, -180, -320, -460];
  const scrollY = interpolate(
    f,
    scrollKeyframes,
    scrollValues.slice(0, scrollKeyframes.length),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // In-Chat Dialog Springs (Modal End Card)
  const dialogSpring = spring({
    frame: Math.max(0, frame - outroStart),
    fps,
    config: { damping: 11, stiffness: 140 }
  });
  const dialogOverlayOpacity = interpolate(
    frame - outroStart,
    [0, 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Contact Branding
  const contactName = p.story.contactName || p.brand || "Breaking Desk";
  const isHanuman = contactName.includes("हनुमान") || p.story.contactAvatar === "saffron-gada";
  const contactStatus = p.story.contactStatus || "• online";

  // Typing dots animation
  const dot1 = Math.sin(frame * 0.45) * 4;
  const dot2 = Math.sin(frame * 0.45 + 1.2) * 4;
  const dot3 = Math.sin(frame * 0.45 + 2.4) * 4;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0B0F19",
        color: "#111827",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {/* =========================================================================
          REAL SMARTPHONE CHAT SCREEN (1080 x 1920)
         ========================================================================= */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: isHanuman ? "#FFF7ED" : "#EFEAE2",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {/* Subtle Chat Background Pattern (Doodle-like texture) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage: `radial-gradient(${isHanuman ? "#EA580C" : "#00A884"} 1.5px, transparent 1.5px)`,
            backgroundSize: "24px 24px",
            pointerEvents: "none"
          }}
        />

        {/* -------------------------------------------------------------------------
            1. REAL SMARTPHONE TOP HEADER (Status Bar + Navigation Bar)
            Height: 180px, Solid Opaque Background, High Z-Index
           ------------------------------------------------------------------------- */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 180,
            backgroundColor: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            zIndex: 60,
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* iOS Top Status Bar (Time, Dynamic Island, 5G, Wi-Fi, Battery) */}
          <div
            style={{
              height: 52,
              padding: "10px 42px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: FONT.ui,
              fontSize: 22,
              fontWeight: 700,
              color: "#111827"
            }}
          >
            {/* Clock */}
            <span>9:41</span>

            {/* Apple Dynamic Island Notch */}
            <div
              style={{
                width: 140,
                height: 34,
                backgroundColor: "#000000",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 12
              }}
            >
              {/* Camera Lens Specular */}
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  backgroundColor: "#1E293B",
                  border: "1.5px solid #0F172A"
                }}
              />
            </div>

            {/* Status Icons: Cellular Bars, Wi-Fi, Battery */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Cellular Bars */}
              <svg width="22" height="15" viewBox="0 0 22 15">
                <rect x="1" y="10" width="3.5" height="5" rx="1" fill="#111827" />
                <rect x="6.5" y="7" width="3.5" height="8" rx="1" fill="#111827" />
                <rect x="12" y="4" width="3.5" height="11" rx="1" fill="#111827" />
                <rect x="17.5" y="1" width="3.5" height="14" rx="1" fill="#111827" />
              </svg>
              {/* 5G */}
              <span style={{ fontSize: 17, fontWeight: 800 }}>5G</span>
              {/* Battery Indicator */}
              <div
                style={{
                  width: 32,
                  height: 16,
                  border: "2px solid #111827",
                  borderRadius: 5,
                  padding: 1.5,
                  display: "flex",
                  alignItems: "center",
                  position: "relative"
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#22C55E",
                    borderRadius: 2
                  }}
                />
                {/* Battery tip */}
                <div
                  style={{
                    position: "absolute",
                    right: -5,
                    width: 3,
                    height: 7,
                    backgroundColor: "#111827",
                    borderRadius: "0 2px 2px 0"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Navigation App Bar (Contact Info, Back Button, Icons) */}
          <div
            style={{
              flex: 1,
              padding: "4px 34px 10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            {/* Left: Back Arrow + Avatar + Contact Name & Status */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Back chevron */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: isHanuman ? "#EA580C" : "#00A884",
                  fontFamily: FONT.ui,
                  fontWeight: 800,
                  fontSize: 34,
                  cursor: "pointer"
                }}
              >
                ‹ <span style={{ fontSize: 22, fontWeight: 700 }}>14</span>
              </div>

              {/* Contact Avatar Circle */}
              {isHanuman ? (
                // Saffron Gada Divine Avatar for Lord Hanuman
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #FED7AA 0%, #EA580C 70%, #9A3412 100%)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 4px 14px rgba(234, 88, 12, 0.4)",
                    border: "2px solid #FFFFFF"
                  }}
                >
                  <span style={{ fontSize: 40 }}>🚩</span>
                </div>
              ) : (
                // Modern Gradient Initial Avatar
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
                    boxShadow: "0 4px 14px rgba(255, 107, 107, 0.35)",
                    border: "2px solid #FFFFFF"
                  }}
                >
                  {contactName.slice(0, 1).toUpperCase()}
                </div>
              )}

              {/* Name & Online Status */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: FONT.ui,
                      fontSize: 32,
                      fontWeight: 900,
                      color: "#111827",
                      lineHeight: 1.1
                    }}
                  >
                    {contactName}
                  </span>
                  {/* Verified Badge */}
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      backgroundColor: isHanuman ? "#EA580C" : "#0EA5E9",
                      color: "#FFFFFF",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 14,
                      fontWeight: 900
                    }}
                  >
                    ✓
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 3,
                    fontFamily: FONT.ui,
                    fontSize: 20,
                    fontWeight: 700,
                    color: isHanuman ? "#EA580C" : "#00A884"
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

            {/* Right: Phone & Video Call Icons */}
            <div style={{ display: "flex", alignItems: "center", gap: 24, color: isHanuman ? "#EA580C" : "#00A884" }}>
              <span style={{ fontSize: 32, cursor: "pointer" }}>📹</span>
              <span style={{ fontSize: 28, cursor: "pointer" }}>📞</span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------------
            2. STRICTLY CONTAINED MIDDLE VIEWPORT (Zero Overlay / Zero Leakage)
            Top: 180px, Bottom: 150px, overflow: "hidden", clipPath: inset(0 0 0 0)
           ------------------------------------------------------------------------- */}
        <div
          style={{
            position: "absolute",
            top: 180,
            bottom: 150,
            left: 0,
            right: 0,
            overflow: "hidden",
            clipPath: "inset(0 0 0 0)",
            padding: "20px 38px 24px"
          }}
        >
          {/* Top Date / Subheader Pill (Sticky & Fades Out as chat progresses) */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
              opacity: interpolate(f, [20, 60], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.07)",
                backdropFilter: "blur(4px)",
                padding: "8px 26px",
                borderRadius: 99,
                fontFamily: FONT.ui,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: 1.5,
                color: "#4B5563",
                textTransform: "uppercase"
              }}
            >
              {isHanuman ? "भक्त एवं प्रभु संवाद · आज का संदेश" : p.story.category || "BREAKING DISPATCH"}
            </div>
          </div>

          {/* Scrolling Messages Stream with Natural Physics */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              transform: `translateY(${scrollY}px)`,
              transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            {messagesWithTiming.map((m) => {
              const isUser = m.sender === "user";
              const showMsg = f >= m.startFrame;

              // Typing Indicator before contact replies
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
                        boxShadow: "0 3px 12px rgba(0, 0, 0, 0.06)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        position: "relative"
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: isHanuman ? "#EA580C" : "#9CA3AF",
                          transform: `translateY(${dot1}px)`
                        }}
                      />
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: isHanuman ? "#EA580C" : "#9CA3AF",
                          transform: `translateY(${dot2}px)`
                        }}
                      />
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: isHanuman ? "#EA580C" : "#9CA3AF",
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
                        maxWidth: "85%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isUser ? "flex-end" : "flex-start",
                        transform: `scale(${msgSpring}) translateY(${(1 - msgSpring) * 24}px)`,
                        transformOrigin: isUser ? "bottom right" : "bottom left",
                        opacity: msgSpring,
                        position: "relative"
                      }}
                    >
                      {/* Bubble Body with Authentic WhatsApp Notch / Geometry */}
                      <div
                        style={{
                          backgroundColor: isUser
                            ? isHanuman ? "#EA580C" : "#00A884"
                            : "#FFFFFF",
                          color: isUser ? "#FFFFFF" : "#111827",
                          padding: "18px 26px 14px",
                          borderRadius: isUser ? "24px 24px 4px 24px" : "24px 24px 24px 4px",
                          boxShadow: isUser
                            ? `0 4px 14px ${isHanuman ? "rgba(234, 88, 12, 0.35)" : "rgba(0, 168, 132, 0.35)"}`
                            : "0 3px 14px rgba(0, 0, 0, 0.07)",
                          fontFamily: FONT.ui,
                          fontSize: 32,
                          fontWeight: m.highlight ? 900 : 700,
                          lineHeight: 1.32,
                          letterSpacing: 0.2,
                          border: m.highlight ? `2px solid ${isHanuman ? "#F97316" : "#10B981"}` : "none"
                        }}
                      >
                        {m.text}

                        {/* Bottom Timestamp & Read Receipt inside the bubble */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 6,
                            fontSize: 18,
                            fontWeight: 600,
                            color: isUser ? "rgba(255, 255, 255, 0.85)" : "#9CA3AF"
                          }}
                        >
                          <span>{m.time || "11:42 PM"}</span>
                          {isUser && (
                            <span
                              style={{
                                color: m.hasReadReceipt && f >= m.startFrame + 18 ? "#60A5FA" : "rgba(255,255,255,0.7)",
                                fontWeight: 800
                              }}
                            >
                              ✓✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* -------------------------------------------------------------------------
            3. REAL SMARTPHONE BOTTOM INPUT BAR
            Height: 150px, Fixed at Bottom, High Z-Index
           ------------------------------------------------------------------------- */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 150,
            backgroundColor: "#FFFFFF",
            padding: "16px 30px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.05)",
            zIndex: 60
          }}
        >
          {/* Input Controls Row */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* Plus / Emoji Icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                backgroundColor: "#F3F4F6",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 28,
                color: "#6B7280"
              }}
            >
              +
            </div>

            {/* Pill Capsule Message Input */}
            <div
              style={{
                flex: 1,
                height: 68,
                backgroundColor: "#F3F4F6",
                borderRadius: 99,
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: FONT.ui,
                fontSize: 26,
                fontWeight: 600,
                color: "#9CA3AF"
              }}
            >
              <span>{isHanuman ? "प्रभु से पूछें..." : "Message"}</span>
              <span style={{ fontSize: 26 }}>📷</span>
            </div>

            {/* Send Arrow Button */}
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                backgroundColor: isHanuman ? "#EA580C" : "#00A884",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#FFFFFF",
                fontSize: 32,
                fontWeight: 900,
                boxShadow: `0 6px 16px ${isHanuman ? "rgba(234, 88, 12, 0.4)" : "rgba(0, 168, 132, 0.4)"}`
              }}
            >
              ↑
            </div>
          </div>

          {/* iPhone Home Swipe Bar */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 170,
                height: 5,
                borderRadius: 3,
                backgroundColor: "#111827"
              }}
            />
          </div>
        </div>

        {/* -------------------------------------------------------------------------
            4. IN-CHAT NATIVE DIALOG END CARD (Community Poll / Question Modal)
            Pops right in the MIDDLE OF THE CHAT as requested!
           ------------------------------------------------------------------------- */}
        {isOutro && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "0 50px",
              zIndex: 80,
              opacity: dialogOverlayOpacity
            }}
          >
            {/* The Native Dialog Card */}
            <div
              style={{
                width: "100%",
                maxWidth: 920,
                backgroundColor: "#FFFFFF",
                borderRadius: 40,
                padding: "44px 44px 38px",
                boxShadow: "0 28px 70px rgba(0, 0, 0, 0.45)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: `scale(${dialogSpring}) translateY(${(1 - dialogSpring) * 60}px)`,
                border: "2px solid rgba(255, 255, 255, 0.8)"
              }}
            >
              {/* Top Badge */}
              <div
                style={{
                  backgroundColor: isHanuman ? "#FFEDD5" : "#CCFBF1",
                  color: isHanuman ? "#C2410C" : "#0F766E",
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
                {isHanuman ? "🙏 आज का प्रश्न · COMMUNITY POLL" : "📊 COMMUNITY DEBATE"}
              </div>

              {/* The Question */}
              <div
                style={{
                  fontFamily: FONT.ui,
                  fontSize: 38,
                  fontWeight: 900,
                  lineHeight: 1.25,
                  color: "#111827",
                  textAlign: "center",
                  marginBottom: 30
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
                      borderRadius: 22,
                      padding: "18px 26px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: FONT.ui,
                      fontSize: 30,
                      fontWeight: 800,
                      color: "#1E293B",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                    }}
                  >
                    <span>{opt}</span>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: `2px solid ${isHanuman ? "#EA580C" : "#00A884"}`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: 16
                      }}
                    >
                      ○
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Call to Action Button */}
              <div
                style={{
                  marginTop: 28,
                  width: "100%",
                  backgroundColor: isHanuman ? "#EA580C" : "#00A884",
                  color: "#FFFFFF",
                  padding: "20px 30px",
                  borderRadius: 99,
                  textAlign: "center",
                  fontFamily: FONT.ui,
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: 1,
                  boxShadow: `0 8px 24px ${isHanuman ? "rgba(234, 88, 12, 0.4)" : "rgba(0, 168, 132, 0.4)"}`
                }}
              >
                {isHanuman ? "कमेंट में उत्तर दें और 'जय श्री राम' लिखें 🚩" : "Drop Your Answer in Comments Below 💬"}
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

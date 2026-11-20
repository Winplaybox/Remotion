import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AskOutro } from "../../../packages/visuals/src/AskOutro";
import { FONT, useBundledFonts } from "../../../packages/visuals/src/fonts";
import { PrevAnswerCard } from "../../../packages/visuals/src/PrevAnswer";
import { SoundBed, duckFromCues, type Sfx } from "../../../packages/visuals/src/Sound";
import { VoiceCues } from "../../../packages/visuals/src/VoiceCues";
import { askOutroSfx, followTapAt } from "../../ask-outro";
import type { BreakingDesk } from "./model";

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
    { src: "sfx/whoosh.mp3", at: p.introSeconds + 0.1, volume: 0.4 },
    { src: "sfx/pop.mp3", at: p.introSeconds + 0.6, volume: 0.4 },
    { src: "sfx/bell.mp3", at: p.introSeconds + 3.5, volume: 0.35 },
    ...askOutroSfx(p.askOutro, p.introSeconds + p.playSeconds)
  ];

  // Visual springs
  const headerSpring = spring({ frame: f, fps, config: { damping: 14, stiffness: 120 } });
  const cardSpring = spring({ frame: Math.max(0, f - 10), fps, config: { damping: 12, stiffness: 100 } });
  const reactionSpring = spring({ frame: Math.max(0, f - 45), fps, config: { damping: 10, stiffness: 160 } });

  // Typewriter effect for headline
  const headlineChars = Math.min(
    p.story.headline.length,
    Math.floor(Math.max(0, f - 15) * 1.8)
  );
  const displayHeadline = p.story.headline.slice(0, headlineChars);
  const cursorBlink = Math.floor(frame / 12) % 2 === 0;

  // Yellow marker swipe progress
  const markerSwipe = interpolate(f, [40, 70], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  // Ticker marquee translation
  const tickerOffset = (frame * 3.5) % 2400;

  // Radar ping animation
  const ping = (frame % 30) / 30;
  const radarSpread = ping * 18;
  const radarAlpha = (1 - ping) * 0.8;

  return (
    <AbsoluteFill style={{ backgroundColor: p.palette.bgTop, color: "#FFFFFF", overflow: "hidden" }}>
      {/* 1. News Studio Backdrop with animated light glow and ambient grid */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 30%, ${p.palette.accent}22 0%, transparent 65%), linear-gradient(180deg, ${p.palette.bgTop} 0%, ${p.palette.bgBottom} 100%)`
        }}
      >
        {/* Subtle grid lines */}
        <svg width="1080" height="1920" style={{ position: "absolute", opacity: 0.15 }}>
          <defs>
            <pattern id="news-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#FFFFFF" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1080" height="1920" fill="url(#news-grid)" />
        </svg>
      </AbsoluteFill>

      {/* 2. Top Broadcast Navigation Bar */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 60,
          right: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: headerSpring,
          transform: `translateY(${(1 - headerSpring) * -30}px)`
        }}
      >
        {/* Live Bug */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#E11D2E",
              padding: "8px 16px",
              borderRadius: 6,
              fontWeight: 900,
              fontSize: 22,
              fontFamily: FONT.punch,
              letterSpacing: 1.5,
              boxShadow: "0 4px 14px rgba(225, 29, 46, 0.4)"
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                opacity: cursorBlink ? 1 : 0.4
              }}
            />
            LIVE
          </div>
          <span style={{ fontSize: 22, fontFamily: FONT.mono, fontWeight: 700, color: "#D1D5DB" }}>
            {p.liveClock} IST
          </span>
        </div>

        {/* Channel & Category Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "8px 18px",
            borderRadius: 20
          }}
        >
          <span style={{ fontSize: 20, fontFamily: FONT.ui, fontWeight: 800, color: p.palette.highlight }}>
            {p.story.category}
          </span>
          <span style={{ fontSize: 18, color: "#9CA3AF" }}>•</span>
          <span style={{ fontSize: 18, fontFamily: FONT.mono, color: "#E5E7EB" }}>
            #{p.postNo.toString().padStart(3, "0")}
          </span>
        </div>
      </div>

      {/* 3. Breaking Headline Banner */}
      <div
        style={{
          position: "absolute",
          top: 170,
          left: 60,
          right: 60,
          opacity: headerSpring,
          transform: `translateY(${(1 - headerSpring) * -20}px)`
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div
            style={{
              backgroundColor: p.palette.accent,
              color: "#FFFFFF",
              padding: "6px 14px",
              fontSize: 20,
              fontFamily: FONT.punch,
              letterSpacing: 2,
              fontWeight: 900,
              borderRadius: 4
            }}
          >
            BREAKING DISPATCH
          </div>
          <span style={{ fontSize: 19, fontFamily: FONT.mono, color: "#9CA3AF", letterSpacing: 1 }}>
            {p.story.source}
          </span>
        </div>

        <div
          style={{
            fontFamily: FONT.display,
            fontSize: 48,
            lineHeight: 1.15,
            letterSpacing: 0.5,
            color: "#FFFFFF",
            minHeight: 120,
            textShadow: "0 4px 16px rgba(0, 0, 0, 0.6)"
          }}
        >
          {displayHeadline}
          {headlineChars < p.story.headline.length && (
            <span style={{ opacity: cursorBlink ? 1 : 0, color: p.palette.highlight }}> |</span>
          )}
        </div>
      </div>

      {/* 4. Headline Backdrop: Stacked Article Cards */}
      <div
        style={{
          position: "absolute",
          top: 360,
          left: 60,
          right: 60,
          height: 1040,
          perspective: 1000
        }}
      >
        {/* Background Tilt Card */}
        <div
          style={{
            position: "absolute",
            top: 25,
            left: 10,
            right: 10,
            height: 980,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: 24,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            transform: "rotate(-3.5deg)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)"
          }}
        />

        {/* Foreground Main Article Card */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 980,
            backgroundColor: p.palette.cardBg,
            color: p.palette.cardText,
            borderRadius: 24,
            padding: "44px 40px",
            transform: `rotate(1.8deg) translateY(${(1 - cardSpring) * 60}px) scale(${0.96 + cardSpring * 0.04})`,
            boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Card Header */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 18, color: "#6B7280", letterSpacing: 1 }}>
                {p.story.subhead}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#E5E7EB" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#D1D5DB" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#9CA3AF" }} />
              </div>
            </div>

            {/* Lead Summary */}
            <p
              style={{
                fontFamily: FONT.ui,
                fontSize: 32,
                lineHeight: 1.45,
                fontWeight: 600,
                color: "#1F2937",
                marginBottom: 36
              }}
            >
              {p.story.cardText}
            </p>

            {/* Key Highlight Sentence with Yellow Marker Swipe */}
            <div
              style={{
                position: "relative",
                padding: "24px 28px",
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                border: "1px solid #E5E7EB",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 18,
                  top: 18,
                  bottom: 18,
                  width: `${markerSwipe}%`,
                  backgroundColor: p.palette.highlight,
                  borderRadius: 6,
                  opacity: 0.85,
                  zIndex: 0
                }}
              />
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontFamily: FONT.punch,
                  fontSize: 34,
                  fontWeight: 900,
                  lineHeight: 1.3,
                  color: "#111827",
                  letterSpacing: 0.5
                }}
              >
                ★ {p.story.highlightLine}
              </div>
            </div>
          </div>

          {/* Location Geo Card */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "18px 24px",
              backgroundColor: "#E5E7EB",
              borderRadius: 16
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", width: 14, height: 14 }}>
                <div
                  style={{
                    position: "absolute",
                    left: 7 - radarSpread / 2,
                    top: 7 - radarSpread / 2,
                    width: radarSpread,
                    height: radarSpread,
                    borderRadius: "50%",
                    backgroundColor: "#E11D2E",
                    opacity: radarAlpha
                  }}
                />
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: "#E11D2E"
                  }}
                />
              </div>
              <span style={{ fontFamily: FONT.ui, fontSize: 22, fontWeight: 800, color: "#111827" }}>
                📍 {p.story.location}
              </span>
            </div>
            <span style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 700, color: "#4B5563" }}>
              VERIFIED CITE
            </span>
          </div>
        </div>

        {/* Reaction Pill Badge (pops out near bottom of card) */}
        <div
          style={{
            position: "absolute",
            bottom: -20,
            right: 25,
            backgroundColor: "#111827",
            color: p.palette.highlight,
            padding: "12px 24px",
            borderRadius: 30,
            fontFamily: FONT.punch,
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 1.5,
            border: `2px solid ${p.palette.highlight}`,
            boxShadow: "0 12px 28px rgba(0, 0, 0, 0.4)",
            transform: `scale(${reactionSpring}) rotate(-4deg)`,
            zIndex: 10
          }}
        >
          {p.story.reactionPill}
        </div>
      </div>

      {/* 5. Bottom Live Ticker Bar (1740-1860px) */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 0,
          right: 0,
          height: 80,
          backgroundColor: "#0B0F19",
          borderTop: `2px solid ${p.palette.accent}`,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          overflow: "hidden"
        }}
      >
        {/* Ticker Lead Tag */}
        <div
          style={{
            height: "100%",
            backgroundColor: p.palette.accent,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            fontSize: 22,
            fontFamily: FONT.punch,
            fontWeight: 900,
            letterSpacing: 1.5,
            zIndex: 2,
            boxShadow: "6px 0 16px rgba(0, 0, 0, 0.4)"
          }}
        >
          HEADLINES
        </div>

        {/* Scrolling Items */}
        <div
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            transform: `translateX(${-tickerOffset}px)`,
            fontFamily: FONT.mono,
            fontSize: 24,
            fontWeight: 600,
            color: "#F3F4F6",
            letterSpacing: 0.5,
            gap: 50
          }}
        >
          {[...p.story.ticker, ...p.story.ticker, ...p.story.ticker].map((item, idx) => (
            <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: 20 }}>
              <span>{item}</span>
              <span style={{ color: p.palette.highlight }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* 6. Previous Answer Card (for repeat viewers, on posts 2+) */}
      {p.introSeconds > 0 && p.prevAnswer ? (
        <PrevAnswerCard
          seconds={p.introSeconds}
          heading={`PICHHLA UPDATE #${String(p.postNo - 1).padStart(3, "0")}`}
          answer={p.prevAnswer}
          accent={p.palette.highlight}
          bg="linear-gradient(180deg, #10141f, #1e2230)"
        />
      ) : null}

      {/* 7. AskOutro Interaction Banner & Follow Button (during outro) */}
      <AskOutro
        from={outroStart}
        a={p.askOutro}
        accent={p.palette.accent}
        tapAt={followTapAt(p.askOutro)}
      />

      {/* 8. Voice Cues & Sound Bed */}
      <VoiceCues cues={p.voice} />
      {p.sound && <SoundBed sfx={sfx} duck={duckFromCues(p.voice, 3.4)} music="sfx/music_puzzle.mp3" musicVolume={0.12} />}
    </AbsoluteFill>
  );
};

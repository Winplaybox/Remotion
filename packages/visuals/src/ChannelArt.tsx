import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT, useBundledFonts } from "./fonts";

/** YouTube channel art drawn in code: banner (2560x1440, text inside the 1546x423 safe area), logo and watermark. */
export interface ChannelArtProps {
  kind: "banner" | "logo" | "watermark";
  title: string;
  tagline: string;
  handle: string;
  schedule: string;
  colors: { bg1: string; bg2: string; accent: string; text: string };
  icon: "chakra" | "taxi" | "lock" | "magnifier";
}

export const Icon: React.FC<{ icon: ChannelArtProps["icon"]; size: number; accent: string; text: string }> = ({ icon, size, accent, text }) => {
  const s = size;
  if (icon === "chakra") {
    const dots = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <circle key={i} cx={50 + Math.cos(a) * 34} cy={50 + Math.sin(a) * 34} r={i === 4 ? 7.5 : 6} fill={i === 4 ? "#FF4D8D" : accent} />;
    });
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="34" fill="none" stroke={text} strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 5" />
        {dots}
        <circle cx="50" cy="50" r="13" fill={accent} />
        <text x="50" y="56" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="16" fill="#1A1033">?</text>
      </svg>
    );
  }
  if (icon === "taxi") {
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <rect x="14" y="42" width="72" height="30" rx="8" fill={accent} />
        <path d="M26 42 L34 26 H66 L74 42 Z" fill={accent} />
        <path d="M31 41 L37 30 H63 L69 41 Z" fill="#9FD7FF" />
        <rect x="14" y="54" width="72" height="7" fill="#111" />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={14 + i * 8} y={54} width="4" height="7" fill={accent} />)}
        <rect x="40" y="18" width="20" height="7" rx="2" fill="#111" stroke={accent} strokeWidth="1.5" />
        <circle cx="30" cy="74" r="8" fill="#111" /><circle cx="70" cy="74" r="8" fill="#111" />
        <circle cx="30" cy="74" r="3" fill="#888" /><circle cx="70" cy="74" r="3" fill="#888" />
      </svg>
    );
  }
  if (icon === "lock") {
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <path d="M32 46 V34 a18 18 0 0 1 36 0 V46" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" />
        <rect x="22" y="44" width="56" height="44" rx="9" fill="#06202C" stroke={accent} strokeWidth="3.5" />
        {["7", "?", "3"].map((d, i) => (
          <g key={i}>
            <rect x={29 + i * 15} y={56} width="12" height="18" rx="2.5" fill="none" stroke={text} strokeOpacity="0.8" strokeWidth="1.6" />
            <text x={35 + i * 15} y={70} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fontSize="12" fill={i === 1 ? accent : text}>{d}</text>
          </g>
        ))}
      </svg>
    );
  }
  return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      <circle cx="42" cy="42" r="24" fill="none" stroke={accent} strokeWidth="7" />
      <circle cx="42" cy="42" r="19" fill="#FFFFFF" fillOpacity="0.08" />
      <path d="M60 60 L82 82" stroke={accent} strokeWidth="10" strokeLinecap="round" />
      <text x="42" y="52" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="28" fill={text}>?</text>
    </svg>
  );
};

export const ChannelArt: React.FC<ChannelArtProps> = (p) => {
  useBundledFonts();
  const bg = `radial-gradient(ellipse at 50% 45%, ${p.colors.bg2}, ${p.colors.bg1} 72%)`;
  if (p.kind === "watermark") {
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "92%", height: "92%", borderRadius: "50%", background: bg, border: `8px solid ${p.colors.accent}`, display: "grid", placeItems: "center" }}>
          <Icon icon={p.icon} size={200} accent={p.colors.accent} text={p.colors.text} />
        </div>
      </AbsoluteFill>
    );
  }
  if (p.kind === "logo") {
    return (
      <AbsoluteFill style={{ background: bg, alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 26, borderRadius: "50%", border: `10px solid ${p.colors.accent}`, opacity: 0.9 }} />
        {/* No text: profile pictures show at 40-100 px, a symbol reads, words don't. */}
        <Icon icon={p.icon} size={520} accent={p.colors.accent} text={p.colors.text} />
      </AbsoluteFill>
    );
  }
  // Banner: decoration across the full width (TV), all text inside the centre 1546x423 safe area.
  const tiles = Array.from({ length: 28 }, (_, i) => ({ x: (i % 7) * 380 + (Math.floor(i / 7) % 2) * 190 - 60, y: Math.floor(i / 7) * 380 - 40, r: (i * 37) % 360 }));
  return (
    <AbsoluteFill style={{ background: bg }}>
      {tiles.map((t, i) => (
        <div key={i} style={{ position: "absolute", left: t.x, top: t.y, transform: `rotate(${t.r}deg)`, opacity: 0.08 }}>
          <Icon icon={p.icon} size={260} accent={p.colors.accent} text={p.colors.text} />
        </div>
      ))}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 30%, ${p.colors.bg1}cc 50%, transparent 70%)` }} />
      <div style={{ position: "absolute", left: (2560 - 1546) / 2, top: (1440 - 423) / 2, width: 1546, height: 423, display: "flex", alignItems: "center", gap: 48 }}>
        <div style={{ flex: "0 0 auto", width: 300, height: 300, borderRadius: "50%", background: p.colors.bg1, border: `8px solid ${p.colors.accent}`, display: "grid", placeItems: "center", boxShadow: `0 0 60px ${p.colors.accent}66` }}>
          <Icon icon={p.icon} size={230} accent={p.colors.accent} text={p.colors.text} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
          <div style={{ fontFamily: FONT.display, fontSize: 150, lineHeight: 1, color: p.colors.text, letterSpacing: 3, whiteSpace: "nowrap", textShadow: `0 8px 0 rgba(0,0,0,.4)` }}>{p.title}</div>
          <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 52, color: p.colors.accent }}>{p.tagline}</div>
          <div style={{ display: "flex", gap: 18, marginTop: 8, alignItems: "center" }}>
            <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 34, color: p.colors.bg1, background: p.colors.accent, borderRadius: 12, padding: "8px 22px" }}>{p.schedule}</div>
            <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 34, color: p.colors.text, opacity: 0.85 }}>{p.handle}</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

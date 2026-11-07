import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { NARRATORS, type NarratorThumb } from "./model";
import { Backdrop, NarratorBust } from "./NarratorVideoComposition";

/** Thumbnail: big 2–3 line title with outline, a large emoji badge and the narrator. Same look as the video. */
export const NarratorThumbnail: React.FC<NarratorThumb> = (p) => {
  useBundledFonts();
  const { width: W, height: H } = useVideoConfig();
  const n = NARRATORS[p.narrator];
  const land = W > H;
  const words = p.title.split(/\s+/);
  const size = land ? Math.min(140, 1500 / Math.max(6, Math.ceil(p.title.length / 2))) : Math.min(170, 2000 / Math.max(6, Math.ceil(p.title.length / 2.4)));
  const ink = n.set === "paper" ? n.palette.text : "#FFFFFF";
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop n={n} frame={40} W={W} H={H} />
      <AbsoluteFill style={{ background: land ? "linear-gradient(90deg, rgba(0,0,0,.55), transparent 70%)" : "linear-gradient(180deg, rgba(0,0,0,.45), transparent 55%)" }} />
      <div style={{ position: "absolute", ...(land ? { left: 60, top: 50, width: W * 0.6 } : { left: 60, right: 60, top: 160 }), fontFamily: FONT.display, fontSize: size, lineHeight: 0.98, color: ink, textAlign: land ? "left" : "center", WebkitTextStroke: n.set === "paper" ? "0" : `${Math.round(size / 18)}px #000`, paintOrder: "stroke fill", textShadow: "0 10px 0 rgba(0,0,0,.35)" }}>
        {words.map((w, i) => <span key={i} style={{ color: i % 3 === 1 ? n.palette.accent : ink }}>{w} </span>)}
      </div>
      <div style={{ position: "absolute", ...(land ? { left: 70, bottom: 50 } : { left: W / 2 - 170, top: H * 0.42 }), width: land ? 250 : 340, height: land ? 250 : 340, borderRadius: 50, background: n.palette.card, border: `8px solid ${n.palette.accent}`, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-6deg)", boxShadow: "0 20px 50px rgba(0,0,0,.45)" }}>
        <div style={{ fontSize: land ? 150 : 210, lineHeight: 1, fontFamily: "'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif" }}>{p.icon || "✨"}</div>
      </div>
      <NarratorBust n={n} talk={0.3} frame={20} left={land ? W - 470 : W / 2 - 260} top={land ? H - 470 : H - 560} scale={land ? 0.84 : 1} />
      <div style={{ position: "absolute", ...(land ? { right: 40, bottom: 30 } : { left: 0, right: 0, bottom: 40, textAlign: "center" }), fontFamily: FONT.ui, fontWeight: 900, fontSize: 30, letterSpacing: 3, color: "#111" }}>
        <span style={{ background: n.palette.accent, padding: "6px 20px", borderRadius: 99 }}>{n.label}</span>
      </div>
    </AbsoluteFill>
  );
};

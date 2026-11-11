import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { Character } from "@visuals/rig/Character";

/** Channel logo (800x800) and banner (2560x1440, safe area 1546x423 in the middle) for Jasoos Bhai. */
export const JasoosLogo: React.FC = () => {
  useBundledFonts();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #FFD23F 0%, #FF8A3D 55%, #7A1F2E 100%)" }}>
      <svg width={800} height={800} style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(400 1080) scale(1.7)">
          <Character look="jasoos" pose="idle" frame={20} seed="logo" expression="smug" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const JasoosBanner: React.FC = () => {
  useBundledFonts();
  const cast = ["naukar", "bahu", "driver", "dadi", "beta"] as const;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#1B0F1E,#3B1F2B)" }}>
      <svg width={2560} height={1440} style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={1280} cy={760} rx={900} ry={260} fill="#FFD23F" opacity={0.08} />
        {cast.map((c, i) => (
          <g key={c} transform={`translate(${1640 + i * 92} ${925}) scale(0.4)`} opacity={0.95}>
            <Character look={c} pose={i % 2 ? "think" : "shrug"} expression="worried" frame={i * 9} seed={c} />
          </g>
        ))}
        <g transform="translate(600 930) scale(0.62)">
          <Character look="jasoos" pose="wave" frame={12} seed="banner" expression="smug" />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 575, textAlign: "center", paddingLeft: 400, paddingRight: 560 }}>
        <div style={{ fontFamily: FONT.display, fontSize: 140, color: "#FFD23F", textShadow: "0 8px 0 #000", lineHeight: 1 }}>JASOOS BHAI</div>
        <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 46, color: "#fff", marginTop: 10, lineHeight: 1.2 }}>Roz naya case<br />Jhooth kaun bol raha hai? 🤥</div>
      </div>
    </AbsoluteFill>
  );
};

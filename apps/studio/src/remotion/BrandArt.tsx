import React from "react";
import { AbsoluteFill, random } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { ELEMENT_RENDERERS } from "../../../../engines/odd-orbit/src/elements";
import { Vehicle, VehicleDefs } from "../../../../engines/track-vehicle/src/vehicles";
import { PROPS, PropDefs } from "../../../../engines/story-diorama/src/props";

/** Channel avatars (800x800) and YouTube banners (2560x1440). Render as stills. */
export type BrandArtProps = { channel: "chakra" | "kpc" | "ebs"; kind: "avatar" | "banner" };

const CP = { bg: "#0A0820", bg2: "#1A0F2E", glow: "#5B2C83", line: "#FFD27A", body: "#FFF4D6", accent: "#FF9F1C" };

const OrbitDefs: React.FC = () => (
  <defs>
    <radialGradient id="oo-glow"><stop offset="0" stopColor="#fff" stopOpacity={0.9} /><stop offset="0.35" stopColor={CP.line} stopOpacity={0.35} /><stop offset="1" stopColor={CP.line} stopOpacity={0} /></radialGradient>
    <radialGradient id="oo-flame"><stop offset="0" stopColor="#FFC24D" stopOpacity={0.8} /><stop offset="1" stopColor="#FF8A1C" stopOpacity={0} /></radialGradient>
  </defs>
);

const ChakraAvatar: React.FC = () => {
  const Chakra = ELEMENT_RENDERERS.chakra;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${CP.glow}, ${CP.bg} 70%)` }}>
      <svg viewBox="-400 -400 800 800" width="100%" height="100%">
        <OrbitDefs />
        <Chakra a={0.6} dir={1} r={330} sats={1} body={CP.body} line={CP.line} />
      </svg>
    </AbsoluteFill>
  );
};

const ChakraBanner: React.FC = () => {
  const els = ["chakra", "ring", "diya", "atom", "planet", "clock", "gear", "comet"] as const;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${CP.bg}, ${CP.bg2})` }}>
      <svg width={2560} height={1440} style={{ position: "absolute", inset: 0 }}>
        <OrbitDefs />
        {Array.from({ length: 13 * 7 }, (_, i) => {
          const col = i % 13, row = Math.floor(i / 13);
          const E = ELEMENT_RENDERERS[els[i % els.length] ?? "ring"];
          return <g key={i} transform={`translate(${100 + col * 197} ${130 + row * 197})`} opacity={0.22}><E a={random(`b${i}`) * 6.28} dir={1} r={80} sats={2} body={CP.body} line={CP.line} /></g>;
        })}
      </svg>
      {/* YouTube safe area is the centre 1546x423 */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 50, background: `${CP.bg}EE`, padding: "40px 80px", borderRadius: 40, border: `4px solid ${CP.line}55` }}>
          <svg viewBox="-110 -110 220 220" width={220} height={220}><OrbitDefs /><ELEMENT_RENDERERS.chakra a={0.6} dir={1} r={100} sats={1} body={CP.body} line={CP.line} /></svg>
          <div>
            <div style={{ fontFamily: FONT.display, fontSize: 150, color: "#fff", lineHeight: 1 }}>CHAKRA <span style={{ color: CP.accent }}>PUZZLE</span></div>
            <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 52, color: CP.line, marginTop: 14 }}>Roz ek naya puzzle · Kitna tez hai tumhara dimaag? 🧠</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Stripes: React.FC<{ op?: number }> = ({ op = 1 }) => <AbsoluteFill style={{ background: "repeating-linear-gradient(45deg, #FFC800 0 60px, #111 60px 120px)", opacity: op }} />;

const KpcAvatar: React.FC = () => (
  <AbsoluteFill style={{ background: "#111" }}>
    <Stripes op={0.9} />
    <AbsoluteFill style={{ background: "radial-gradient(circle, #111 0 46%, transparent 47%)" }} />
    <svg viewBox="-400 -400 800 800" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <VehicleDefs />
      <g transform="rotate(-20) scale(2.2)"><Vehicle kind="kaalipeeli" color="#FFC800" trim="#1A1A1A" lit={1} frame={0} /></g>
    </svg>
  </AbsoluteFill>
);

const KpcBanner: React.FC = () => (
  <AbsoluteFill style={{ background: "#121317" }}>
    <svg width={2560} height={1440} style={{ position: "absolute", inset: 0 }}>
      <VehicleDefs />
      {[300, 700, 1100, 1460, 1860, 2260].map((x) => <line key={x} x1={x} x2={x} y1={0} y2={1440} stroke="#fff" strokeOpacity={0.4} strokeWidth={10} strokeDasharray="90 90" />)}
      {Array.from({ length: 14 }, (_, i) => (
        <g key={i} transform={`translate(${160 + (i % 7) * 380} ${360 + Math.floor(i / 7) * 720}) rotate(${(random(`r${i}`) - 0.5) * 30}) scale(1.4)`} opacity={0.35}>
          <Vehicle kind={(["kaalipeeli", "auto", "bestbus", "police", "ambulance", "kaalipeeli", "suv"] as const)[i % 7] ?? "kaalipeeli"} color={i % 7 === 0 || i % 7 === 5 ? "#FFC800" : "#6B6F78"} trim={i % 7 === 0 || i % 7 === 5 ? "#1A1A1A" : "#F5B800"} lit={0} frame={0} />
        </g>
      ))}
    </svg>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", background: "rgba(10,10,12,.92)", padding: "40px 90px", borderRadius: 40, border: "8px solid #FFC800" }}>
        <div style={{ fontFamily: FONT.punch, fontStyle: "italic", fontWeight: 900, fontSize: 150, color: "#fff", lineHeight: 1 }}>KAALI PEELI <span style={{ color: "#FFC800" }}>CHASE</span></div>
        <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 52, color: "#FFC800", marginTop: 18 }}>Nazar hati, gaadi gayi! · Roz naya level 🚕</div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);


const EB = { paper: "#F5EEDF", ink: "#1C1A17", accent: "#F0533F", accent2: "#F6B93B", accent3: "#5BD17A", maroon: "#3A1020", deep: "#1E0A14" };

const Emblem: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="-110 -110 220 220" width={size} height={size}>
    <circle r={104} fill="none" stroke={EB.accent2} strokeWidth={4} />
    <circle r={92} fill="none" stroke={EB.accent2} strokeWidth={1.5} strokeDasharray="3 6" />
    {Array.from({ length: 16 }, (_, i) => <ellipse key={i} rx={11} ry={44} cy={-40} fill={i % 2 ? EB.accent2 : "#F28C28"} opacity={0.9} transform={`rotate(${i * 22.5})`} />)}
    {Array.from({ length: 8 }, (_, i) => <ellipse key={i} rx={10} ry={26} cy={-22} fill={EB.paper} transform={`rotate(${i * 45 + 22.5})`} />)}
    <circle r={16} fill={EB.accent} />
    <circle r={6} fill={EB.paper} />
  </svg>
);

const EbsAvatar: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle, ${EB.maroon}, ${EB.deep} 75%)`, alignItems: "center", justifyContent: "center" }}>
    <Emblem size={640} />
  </AbsoluteFill>
);

const EbsBanner: React.FC = () => {
  const pal = { paper: EB.paper, ink: EB.ink, accent: EB.accent, accent2: EB.accent2, accent3: EB.accent3 };
  const prop = (name: keyof typeof PROPS, x: number, y: number, s: number, data: Record<string, unknown> = {}) => {
    const P = PROPS[name];
    return <g transform={`translate(${x} ${y}) scale(${s})`}><P lf={200} fps={30} data={data} pal={pal} /></g>;
  };
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #141A44, #3A2A4A 55%, ${EB.maroon})` }}>
      <svg width={2560} height={1440} style={{ position: "absolute", inset: 0 }}>
        <PropDefs />
        {Array.from({ length: 70 }, (_, i) => <circle key={i} cx={random(`s${i}`) * 2560} cy={random(`t${i}`) * 700} r={1.5 + random(`u${i}`) * 2.5} fill="#FFF6DA" opacity={0.6} />)}
        {prop("hills", 1280, 1180, 2.2, { color: "#2A1E3F" })}
        {prop("temple", 350, 1250, 0.9)}
        {prop("temple", 2220, 1250, 0.9)}
        {prop("fish", 620, 1050, 0.6, { horn: true })}
        {prop("lotus", 1960, 1120, 0.8)}
        {prop("diyaRow", 1280, 1330, 1.2, { count: 9, spacing: 220 })}
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 46, background: "rgba(30,10,20,.88)", padding: "34px 70px", borderRadius: 36, border: `4px solid ${EB.accent2}` }}>
          <Emblem size={210} />
          <div>
            <div style={{ fontFamily: FONT.display, fontSize: 150, lineHeight: 1, color: EB.paper }}>EPIC <span style={{ color: EB.accent2 }}>BHARAT</span> SAGA</div>
            <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 46, color: EB.accent2, marginTop: 14 }}>Sanatan Dharma ki kahaniyaan · Roz ek episode 🙏</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const BrandArt: React.FC<BrandArtProps> = ({ channel, kind }) => {
  useBundledFonts();
  if (channel === "chakra") return kind === "avatar" ? <ChakraAvatar /> : <ChakraBanner />;
  if (channel === "ebs") return kind === "avatar" ? <EbsAvatar /> : <EbsBanner />;
  return kind === "avatar" ? <KpcAvatar /> : <KpcBanner />;
};

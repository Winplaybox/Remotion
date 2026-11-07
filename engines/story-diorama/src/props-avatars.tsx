import React from "react";
import { spring } from "remotion";
import { FONT } from "@visuals/fonts";
import type { PropCtx } from "./props";

/* Paper-cutout kit for the Dashavatar season (and reusable for later seasons).
 * Same conventions as props.tsx: origin = bottom-centre unless noted, shadows via #sd-shadow. */

const num = (v: unknown, d: number) => (typeof v === "number" ? v : d);
const str = (v: unknown, d: string) => (typeof v === "string" ? v : d);
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const SHADOW = "url(#sd-shadow)";
const GOLD = "#F6B93B";
const GOLD_DARK = "#C9861A";

/* ---------- people ---------- */

/**
 * Generic paper figure, ~420px tall standing (~280 seated). Origin = feet.
 * data: robe, skin, sash, head ("plain"|"crown"|"feather"|"sage"|"jata"|"child"|"bun"),
 * item ("none"|"bow"|"axe"|"flute"|"umbrella"|"sword"|"kamandalu"|"basket"|"lift"|"abhaya"|"namaste"),
 * pose ("stand"|"seated"), horns (bool), heads (number, Ravana = 10), halo (bool), glowEyes (bool).
 */
const Figure: React.FC<PropCtx> = ({ lf, data }) => {
  const robe = str(data.robe, "#F28C28");
  const skin = str(data.skin, "#E8B48A");
  const sash = str(data.sash, GOLD);
  const head = str(data.head, "plain");
  const item = str(data.item, "none");
  const seated = data.pose === "seated";
  const heads = Math.max(1, Math.round(num(data.heads, 1)));
  const top = seated ? -200 : -290;
  const hy = top - 46;
  const sway = seated ? 0 : Math.sin(lf / 22) * 1.5;

  const Head: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
    <g transform={`translate(${x} ${hy}) scale(${s})`}>
      {head === "jata" || head === "bun" ? <ellipse cy={-58} rx={24} ry={22} fill={head === "jata" ? "#4A2A14" : "#1C1A17"} /> : null}
      <circle r={46} fill={skin} />
      {head === "plain" || head === "crown" || head === "feather" || head === "child" || head === "bun" || head === "jata" ? (
        <path d="M -46 -4 Q -48 -52 0 -54 Q 48 -52 46 -4 Q 30 -30 0 -32 Q -30 -30 -46 -4 Z" fill={head === "jata" ? "#4A2A14" : "#1C1A17"} />
      ) : null}
      {head === "sage" ? (
        <>
          <path d="M -46 -6 Q -48 -56 0 -58 Q 48 -56 46 -6 Q 30 -36 0 -36 Q -30 -36 -46 -6 Z" fill="#F2F2F2" />
          <ellipse cy={-66} rx={22} ry={20} fill="#F2F2F2" />
          <path d="M -36 14 Q 0 110 36 14 Q 0 34 -36 14 Z" fill="#F2F2F2" />
        </>
      ) : null}
      {head === "crown" || head === "feather" ? (
        <g filter={SHADOW}>
          <path d="M -40 -30 L -40 -74 L -20 -58 L 0 -96 L 20 -58 L 40 -74 L 40 -30 Z" fill={GOLD} />
          <circle cy={-50} r={8} fill="#F0533F" />
        </g>
      ) : null}
      {head === "feather" ? (
        <g transform="translate(26 -88) rotate(18)">
          <path d="M 0 0 Q -22 -50 0 -100 Q 22 -50 0 0 Z" fill="#2F8F5B" />
          <ellipse cy={-62} rx={11} ry={16} fill="#1E5FA8" />
          <circle cy={-62} r={6} fill="#F6B93B" />
        </g>
      ) : null}
      {head === "child" ? <path d="M 0 -50 Q 10 -78 24 -80" stroke="#1C1A17" strokeWidth={6} fill="none" strokeLinecap="round" /> : null}
      {data.horns === true ? (
        <>
          <path d="M -30 -40 Q -70 -80 -60 -120 Q -50 -80 -18 -50 Z" fill="#E9D9AE" />
          <path d="M 30 -40 Q 70 -80 60 -120 Q 50 -80 18 -50 Z" fill="#E9D9AE" />
        </>
      ) : null}
      <circle cx={-15} cy={2} r={5} fill={data.glowEyes === true ? "#FFD23F" : "#1C1A17"} />
      <circle cx={15} cy={2} r={5} fill={data.glowEyes === true ? "#FFD23F" : "#1C1A17"} />
      <path d="M -6 -18 L 6 -18" stroke="#F0533F" strokeWidth={4} />
      <path d="M -12 22 Q 0 28 12 22" stroke="#7A3A1A" strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );

  const headXs = heads === 1 ? [0] : Array.from({ length: heads }, (_, i) => (i - (heads - 1) / 2) * 62);

  return (
    <g transform={`rotate(${sway})`}>
      {data.halo === true ? <circle cy={hy} r={110} fill="url(#sd-sunglow)" opacity={0.9} /> : null}
      {data.halo === true ? <circle cy={hy} r={78} fill="none" stroke={GOLD} strokeWidth={5} opacity={0.8} /> : null}
      <g filter={SHADOW}>
        {seated ? (
          <>
            <ellipse cy={-36} rx={150} ry={44} fill={robe} />
            <path d={`M -96 -50 Q -110 ${top + 20} 0 ${top} Q 110 ${top + 20} 96 -50 Z`} fill={robe} />
          </>
        ) : (
          <>
            <path d="M -38 0 L -34 -70 M 38 0 L 34 -70" stroke={skin} strokeWidth={26} strokeLinecap="round" />
            <path d={`M -80 -60 L -92 ${top + 30} Q 0 ${top - 20} 92 ${top + 30} L 80 -60 Q 0 -40 -80 -60 Z`} fill={robe} />
          </>
        )}
        <path d={`M -80 ${top + 40} L 70 ${seated ? -80 : -150}`} stroke={sash} strokeWidth={16} strokeLinecap="round" opacity={0.95} />
        {/* arms */}
        {item === "lift" ? (
          <>
            <path d={`M 70 ${top + 30} L 90 ${top - 220}`} stroke={skin} strokeWidth={24} strokeLinecap="round" />
            <path d={`M -70 ${top + 30} Q -110 ${top + 120} -90 ${top + 190}`} stroke={skin} strokeWidth={24} strokeLinecap="round" fill="none" />
          </>
        ) : item === "namaste" ? (
          <path d={`M -64 ${top + 34} Q -30 ${top + 120} 0 ${top + 70} Q 30 ${top + 120} 64 ${top + 34}`} stroke={skin} strokeWidth={22} strokeLinecap="round" fill="none" />
        ) : item === "abhaya" ? (
          <>
            <path d={`M 70 ${top + 30} Q 120 ${top + 90} 110 ${top - 10}`} stroke={skin} strokeWidth={22} strokeLinecap="round" fill="none" />
            <ellipse cx={110} cy={top - 30} rx={20} ry={28} fill={skin} />
            <path d={`M -70 ${top + 30} Q -90 ${top + 130} -10 ${top + 150}`} stroke={skin} strokeWidth={22} strokeLinecap="round" fill="none" />
          </>
        ) : item === "basket" ? (
          <>
            <path d={`M -70 ${top + 30} L -78 ${hy - 70}`} stroke={skin} strokeWidth={22} strokeLinecap="round" />
            <path d={`M 70 ${top + 30} L 78 ${hy - 70}`} stroke={skin} strokeWidth={22} strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d={`M -70 ${top + 30} Q -110 ${top + 120} -96 ${top + 200}`} stroke={skin} strokeWidth={22} strokeLinecap="round" fill="none" />
            <path d={`M 70 ${top + 30} Q 120 ${top + 110} 110 ${top + 180}`} stroke={skin} strokeWidth={22} strokeLinecap="round" fill="none" />
          </>
        )}
        {headXs.map((x, i) => <Head key={i} x={x} s={heads > 1 && x !== 0 ? 0.82 : 1} />)}
        {headXs.length > 1 ? <Head x={0} /> : null}
      </g>
      {/* items */}
      {item === "bow" ? (
        <g transform={`translate(150 ${top + 120})`} filter={SHADOW}>
          <path d="M 0 -220 Q 90 0 0 220" fill="none" stroke="#8A4B24" strokeWidth={14} strokeLinecap="round" />
          <line x1={0} y1={-220} x2={0} y2={220} stroke="#F3E2B8" strokeWidth={3} />
        </g>
      ) : null}
      {item === "axe" ? (
        <g transform={`translate(130 ${top + 190}) rotate(-12)`} filter={SHADOW}>
          <rect x={-8} y={-300} width={16} height={330} rx={6} fill="#8A4B24" />
          <path d="M 8 -290 Q 110 -300 120 -200 Q 70 -230 8 -210 Z" fill="#C9CED6" />
          <path d="M 8 -290 Q 110 -300 120 -200" fill="none" stroke="#8C939E" strokeWidth={5} />
        </g>
      ) : null}
      {item === "flute" ? (
        <g transform={`translate(10 ${hy + 34}) rotate(-8)`} filter={SHADOW}>
          <rect x={-10} y={-9} width={220} height={18} rx={9} fill="#C98A3A" />
          {[40, 80, 120, 160].map((x) => <circle key={x} cx={x} r={4} fill="#5E3015" />)}
        </g>
      ) : null}
      {item === "umbrella" ? (
        <g transform={`translate(90 ${hy - 40})`} filter={SHADOW}>
          <line x1={0} y1={-90} x2={0} y2={150} stroke="#5E3015" strokeWidth={8} />
          <path d="M -130 -60 Q 0 -190 130 -60 Q 98 -76 65 -60 Q 32 -78 0 -60 Q -32 -78 -65 -60 Q -98 -76 -130 -60 Z" fill="#F6E7B0" stroke="#C9861A" strokeWidth={5} />
        </g>
      ) : null}
      {item === "sword" ? (
        <g transform={`translate(130 ${top + 190}) rotate(${22 + Math.sin(lf / 10) * 4})`} filter={SHADOW}>
          <rect x={-6} y={-330} width={12} height={300} fill="#DCE3EA" />
          <path d="M -6 -330 L 0 -360 L 6 -330 Z" fill="#DCE3EA" />
          <rect x={-34} y={-34} width={68} height={12} rx={4} fill={GOLD} />
          <rect x={-7} y={-24} width={14} height={40} fill="#5E3015" />
        </g>
      ) : null}
      {item === "kamandalu" ? (
        <g transform={`translate(-100 ${top + 230}) scale(0.35)`} filter={SHADOW}>
          <path d="M -130 -60 Q -150 120 0 130 Q 150 120 130 -60 Q 70 -100 0 -100 Q -70 -100 -130 -60 Z" fill="#B87333" />
        </g>
      ) : null}
      {item === "basket" ? (
        <g transform={`translate(0 ${hy - 76})`}>
          <circle cy={-30} r={90} fill="url(#sd-sunglow)" />
          <g filter={SHADOW}>
            <path d="M -110 -10 L 110 -10 L 86 50 L -86 50 Z" fill="#B5864A" />
            {[-70, -35, 0, 35, 70].map((x) => <line key={x} x1={x} x2={x * 0.8} y1={-8} y2={48} stroke="#7A5428" strokeWidth={4} />)}
            <circle cy={-30} r={26} fill="#4A7BB7" />
          </g>
        </g>
      ) : null}
    </g>
  );
};

/* ---------- Kurma: samudra manthan ---------- */

const Tortoise: React.FC<PropCtx> = ({ lf }) => {
  const step = Math.sin(lf / 8) * 6;
  return (
    <g filter={SHADOW}>
      <ellipse cx={-210} cy={-20} rx={46} ry={24} fill="#6E8F4A" transform={`rotate(${step})`} />
      <ellipse cx={210} cy={-20} rx={46} ry={24} fill="#6E8F4A" transform={`rotate(${-step})`} />
      <path d="M 230 -90 Q 330 -120 340 -60 Q 330 -20 240 -40 Z" fill="#7FA35A" />
      <circle cx={312} cy={-76} r={7} fill="#1C1A17" />
      <path d="M -260 -40 Q -250 -230 0 -240 Q 250 -230 260 -40 Z" fill="#5E7A3A" />
      {[-150, -50, 50, 150].map((x, i) => (
        <path key={x} d={`M ${x - 48} -60 L ${x - 30} ${-150 - (i === 1 || i === 2 ? 40 : 0)} L ${x + 30} ${-150 - (i === 1 || i === 2 ? 40 : 0)} L ${x + 48} -60 Z`} fill="#86A85A" stroke="#4A6230" strokeWidth={5} />
      ))}
      <path d="M -270 -40 L 270 -40" stroke="#4A6230" strokeWidth={14} strokeLinecap="round" />
    </g>
  );
};

/** Mount Mandara. Origin = base centre, ~560 tall. */
const Mountain: React.FC<PropCtx> = ({ data }) => {
  const c = str(data.color, "#8A6E52");
  return (
    <g filter={SHADOW}>
      <path d="M -260 0 L -120 -380 L -60 -300 L 0 -560 L 90 -330 L 140 -400 L 260 0 Z" fill={c} />
      <path d="M 0 -560 L 90 -330 L 140 -400 L 260 0 L 40 0 Z" fill="#000" opacity={0.18} />
      {data.trees !== false ? [-150, -60, 70, 160].map((x, i) => <path key={x} d={`M ${x} ${-60 - i * 20} l -24 50 l 48 0 Z`} fill="#3F7A3A" />) : null}
    </g>
  );
};

/** Mandara on Kurma's back, Vasuki wound round it, devas pulling one end and asuras the other. Origin = water line. */
const Churning: React.FC<PropCtx> = ({ lf, fps, data, pal }) => {
  const t = lf / fps;
  const turn = Math.sin(t * 2.2) * 6;
  const pull = Math.sin(t * 2.2) * 22;
  return (
    <g>
      <g transform="translate(0 40) scale(1.05)"><Tortoise lf={lf} fps={fps} data={{}} pal={pal} /></g>
      <g transform={`translate(0 -150) rotate(${turn} 0 -280) scale(0.82)`}><Mountain lf={lf} fps={fps} data={{ trees: false }} pal={pal} /></g>
      {/* Vasuki coils */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M -170 ${-260 - i * 110} Q 0 ${-210 - i * 110} 170 ${-260 - i * 110}`} fill="none" stroke="#3E7A3A" strokeWidth={22} strokeLinecap="round" />
      ))}
      <path d={`M -170 -480 Q -320 -500 ${-470 - pull} -460`} fill="none" stroke="#3E7A3A" strokeWidth={22} strokeLinecap="round" />
      <path d={`M 170 -260 Q 320 -250 ${470 - pull} -290`} fill="none" stroke="#3E7A3A" strokeWidth={22} strokeLinecap="round" />
      <circle cx={-475 - pull} cy={-460} r={26} fill="#2F6A2E" />
      {data.figures !== false ? (
        <>
          <g transform={`translate(${-430 - pull} -240) scale(0.5)`}><Figure lf={lf} fps={fps} data={{ robe: "#3A2A4A", skin: "#7A5A8A", horns: true, glowEyes: true }} pal={pal} /></g>
          <g transform={`translate(${430 - pull} -60) scale(0.5)`}><Figure lf={lf} fps={fps} data={{ robe: "#F28C28", head: "crown" }} pal={pal} /></g>
        </>
      ) : null}
    </g>
  );
};

/** Golden kalash of amrit. Origin = base. */
const Kalash: React.FC<PropCtx> = ({ lf, data }) => (
  <g>
    <circle cy={-170} r={260} fill="url(#sd-sunglow)" opacity={0.7 + Math.sin(lf / 12) * 0.1} />
    <g filter={SHADOW}>
      <path d="M -140 -160 Q -170 -20 -60 0 L 60 0 Q 170 -20 140 -160 Q 90 -230 50 -240 L -50 -240 Q -90 -230 -140 -160 Z" fill={GOLD} />
      <path d="M -140 -160 Q 0 -110 140 -160" fill="none" stroke={GOLD_DARK} strokeWidth={8} />
      <rect x={-70} y={-280} width={140} height={44} rx={10} fill={GOLD_DARK} />
      {[-40, 0, 40].map((x, i) => <path key={x} d={`M ${x} -280 Q ${x - 40 + i * 20} -380 ${x + (i - 1) * 30} -420 Q ${x + 30} -360 ${x + 10} -280 Z`} fill="#4E9446" />)}
      <circle cy={-410} r={34} fill="#F28C28" />
    </g>
    {str(data.label, "") ? <text y={80} textAnchor="middle" fontFamily={FONT.display} fontSize={64} fill="#FFF3D1">{str(data.label, "")}</text> : null}
  </g>
);

/* ---------- Varaha ---------- */

/** Bhudevi as a small globe. Origin = centre. */
const Earth: React.FC<PropCtx> = ({ lf }) => (
  <g filter={SHADOW} transform={`rotate(${lf / 4})`}>
    <circle r={120} fill="#2E8FA6" />
    <path d="M -80 -60 Q -30 -100 10 -70 Q 40 -30 0 0 Q -40 20 -70 -10 Z" fill="#4E9446" />
    <path d="M 20 30 Q 70 10 96 50 Q 70 96 30 80 Z" fill="#4E9446" />
    <path d="M -100 40 Q -70 50 -60 80 Q -90 80 -100 40 Z" fill="#4E9446" />
    <circle r={120} fill="none" stroke="#BFF3F5" strokeWidth={5} opacity={0.6} />
  </g>
);

/** Varaha rising with the earth balanced on his tusks. data.earth=false hides the globe. Origin = feet. */
const Varaha: React.FC<PropCtx> = ({ lf, fps, data, pal }) => {
  const lift = spring({ frame: lf - 10, fps, config: { damping: 14 } });
  return (
    <g>
      <circle cx={140} cy={-260} r={300} fill="url(#sd-sunglow)" opacity={0.4} />
      <g filter={SHADOW}>
        {[-150, -60, 70, 160].map((x, i) => <rect key={x} x={x - 22} y={-120} width={44} height={130} rx={14} fill="#3E4656" transform={`rotate(${Math.sin(lf / 7 + i) * 4} ${x} -120)`} />)}
        <path d="M -260 -140 Q -260 -330 -40 -350 Q 160 -360 230 -250 Q 250 -160 160 -110 L -200 -100 Q -260 -100 -260 -140 Z" fill="#5A6478" />
        <path d="M -230 -250 Q -150 -380 40 -350" fill="none" stroke="#7A8498" strokeWidth={10} strokeDasharray="20 18" />
        <path d="M 170 -300 Q 300 -310 360 -230 Q 370 -180 320 -170 L 200 -170 Z" fill="#6A7488" />
        <ellipse cx={360} cy={-205} rx={22} ry={30} fill="#3E4656" />
        <path d="M 180 -320 L 150 -400 L 220 -330 Z" fill="#3E4656" />
        <circle cx={250} cy={-262} r={11} fill="#FFD23F" />
        <path d="M 300 -180 Q 360 -200 380 -290" fill="none" stroke="#FFF6DA" strokeWidth={16} strokeLinecap="round" />
        <path d="M -40 -330 L -40 -380 L 0 -360 L 40 -400 L 70 -350" fill={GOLD} />
      </g>
      {data.earth !== false ? <g transform={`translate(380 ${-300 - lift * 140}) scale(0.8)`}><Earth lf={lf} fps={fps} data={{}} pal={pal} /></g> : null}
    </g>
  );
};

/* ---------- Narasimha ---------- */

/** Stone pillar that cracks and bursts open at data.burstAt seconds. Origin = base. */
const Pillar: React.FC<PropCtx> = ({ lf, fps, data }) => {
  const burst = num(data.burstAt, 999) * fps;
  const k = clamp01((lf - burst) / 10);
  const shake = lf > burst - fps && k < 1 ? Math.sin(lf * 2.4) * 6 : 0;
  const crack = clamp01((lf - (burst - fps * 1.2)) / fps);
  return (
    <g transform={`translate(${shake} 0)`}>
      <circle cy={-330} r={360} fill="url(#sd-flameglow)" opacity={k} />
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * k * 150} 0) rotate(${side * k * 12} 0 0)`} filter={SHADOW}>
          <path d={side < 0 ? "M -110 0 L -110 -620 L 0 -620 L 10 -480 L -12 -330 L 8 -170 L 0 0 Z" : "M 110 0 L 110 -620 L 0 -620 L 10 -480 L -12 -330 L 8 -170 L 0 0 Z"} fill="#B9A58A" />
          <rect x={side < 0 ? -140 : 0} y={-660} width={140} height={44} fill="#9C8A70" />
          <rect x={side < 0 ? -140 : 0} y={-30} width={140} height={30} fill="#9C8A70" />
        </g>
      ))}
      {k === 0 ? <path d="M 0 -620 L 10 -480 L -12 -330 L 8 -170 L 0 0" fill="none" stroke="#3A2A1A" strokeWidth={6} strokeDasharray={700} strokeDashoffset={700 * (1 - crack)} /> : null}
    </g>
  );
};

/** Narasimha's face as a paper emblem: mane of flames, crown, tilak. Origin = centre. */
const Narasimha: React.FC<PropCtx> = ({ lf, fps }) => {
  const p = spring({ frame: lf, fps, config: { damping: 10 } });
  return (
    <g transform={`scale(${0.4 + p * 0.6})`}>
      <circle r={330} fill="url(#sd-flameglow)" />
      <g filter={SHADOW}>
        {Array.from({ length: 18 }, (_, i) => (
          <path key={i} d="M -34 -150 Q 0 -300 34 -150 Z" fill={i % 2 ? "#E8731C" : "#F2A12E"} transform={`rotate(${i * 20 + Math.sin(lf / 6 + i) * 3})`} />
        ))}
        <circle r={170} fill="#F2A12E" />
        <ellipse r={130} ry={140} cy={10} fill="#F7C64B" />
        <path d="M -60 -200 L -60 -250 L -30 -228 L 0 -280 L 30 -228 L 60 -250 L 60 -200 Z" fill={GOLD} />
        <path d="M -20 -110 L 0 -60 L 20 -110 Z" fill="#F0533F" />
        <ellipse cx={-58} cy={-14} rx={26} ry={18} fill="#FFF6DA" /><ellipse cx={58} cy={-14} rx={26} ry={18} fill="#FFF6DA" />
        <circle cx={-56} cy={-12} r={11} fill="#B23A0A" /><circle cx={56} cy={-12} r={11} fill="#B23A0A" />
        <circle cx={-56} cy={-12} r={5} fill="#1C1A17" /><circle cx={56} cy={-12} r={5} fill="#1C1A17" />
        <path d="M -96 -52 L -28 -34" stroke="#1C1A17" strokeWidth={12} strokeLinecap="round" />
        <path d="M 96 -52 L 28 -34" stroke="#1C1A17" strokeWidth={12} strokeLinecap="round" />
        <path d="M -40 40 Q 0 20 40 40 L 30 60 Q 0 50 -30 60 Z" fill="#8A3A1A" />
        <path d="M -60 80 Q 0 140 60 80 Q 0 100 -60 80 Z" fill="#8A3A1A" />
        <path d="M -30 84 L -22 110 L -14 86 M 14 86 L 22 110 L 30 84" fill="#FFF6DA" />
      </g>
    </g>
  );
};

/** Two-line "boon" card with five crossed-out conditions. Uses noteCard look but tuned for lists of NOT. */
const BoonList: React.FC<PropCtx> = ({ lf, fps, data, pal }) => {
  const items = arr(data.items);
  const h = 150 + items.length * 96;
  return (
    <g transform="rotate(-1.5)">
      <rect x={-400} y={-h / 2} width={800} height={h} rx={14} fill="#FBF6EA" filter={SHADOW} />
      <text y={-h / 2 + 84} textAnchor="middle" fontFamily={FONT.display} fontSize={60} fill={pal.accent}>{str(data.title, "")}</text>
      {items.map((it, i) => {
        const p = clamp01((lf - fps * 0.4 - i * 9) / 8);
        const y = -h / 2 + 170 + i * 96;
        return (
          <g key={i} opacity={p}>
            <text x={-330} y={y} fontFamily={FONT.display} fontSize={52} fill={pal.ink}>{`✕  ${it}`}</text>
          </g>
        );
      })}
    </g>
  );
};

/* ---------- Vamana ---------- */

/** Three giant footprints appearing one by one with labels. data.labels (3), data.stepSeconds. Origin = centre. */
const ThreeSteps: React.FC<PropCtx> = ({ lf, fps, data, pal }) => {
  const labels = arr(data.labels).length ? arr(data.labels) : ["PRITHVI", "SWARG", "BALI KA SIR"];
  const step = num(data.stepSeconds, 1.2) * fps;
  return (
    <g>
      {labels.map((label, i) => {
        const p = spring({ frame: lf - i * step, fps, config: { damping: 12 } });
        const y = 260 - i * 300;
        const x = i === 1 ? 160 : -120;
        return (
          <g key={label} transform={`translate(${x} ${y}) scale(${p})`} opacity={clamp01(p * 2)}>
            <circle r={150} fill="url(#sd-sunglow)" opacity={0.6} />
            <g filter={SHADOW} transform="rotate(-10)">
              <ellipse cy={10} rx={70} ry={110} fill={GOLD} />
              {[-48, -22, 4, 28, 48].map((dx, k) => <circle key={k} cx={dx} cy={-112 + Math.abs(dx) * 0.5} r={14 - k * 1.2} fill={GOLD} />)}
              <circle r={22} cy={20} fill="#F0533F" opacity={0.7} />
            </g>
            <text x={i === 1 ? -200 : 200} y={20} textAnchor="middle" fontFamily={FONT.display} fontSize={56} fill={pal.paper}>{`${i + 1}. ${label}`}</text>
          </g>
        );
      })}
    </g>
  );
};

/* ---------- Rama / Krishna ---------- */

/** Shiva's great bow; data.breakAt seconds snaps it in two. Origin = centre. */
const GreatBow: React.FC<PropCtx> = ({ lf, fps, data }) => {
  const at = num(data.breakAt, 999) * fps;
  const k = clamp01((lf - at) / 8);
  return (
    <g>
      {k > 0 ? <circle r={260 * k} fill="url(#sd-sunglow)" opacity={1 - k * 0.5} /> : null}
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * k * 40} ${k * 30}) rotate(${side * k * 18})`} filter={SHADOW}>
          <path d={side < 0 ? "M -420 40 Q -220 -170 0 -190" : "M 420 40 Q 220 -170 0 -190"} fill="none" stroke="#6B3A1A" strokeWidth={30} strokeLinecap="round" />
          <path d={side < 0 ? "M -420 40 Q -220 -170 0 -190" : "M 420 40 Q 220 -170 0 -190"} fill="none" stroke={GOLD} strokeWidth={6} strokeDasharray="30 30" />
        </g>
      ))}
      {k === 0 ? <line x1={-420} y1={40} x2={420} y2={40} stroke="#F3E2B8" strokeWidth={4} /> : null}
    </g>
  );
};

/** Ram Setu: floating stones each marked RAM. Origin = centre of bridge. */
const Setu: React.FC<PropCtx> = ({ lf, fps }) => (
  <g>
    {Array.from({ length: 7 }, (_, i) => {
      const p = spring({ frame: lf - i * 5, fps, config: { damping: 13 } });
      const x = (i - 3) * 140;
      return (
        <g key={i} transform={`translate(${x} ${(1 - p) * 120 + Math.sin(lf / 12 + i) * 5})`} opacity={clamp01(p * 2)} filter={SHADOW}>
          <path d="M -66 0 Q -70 -56 0 -60 Q 70 -56 66 0 Q 40 20 0 18 Q -40 20 -66 0 Z" fill="#9C9486" />
          <text y={-12} textAnchor="middle" fontFamily={FONT.display} fontSize={34} fill="#F0533F">RAM</text>
        </g>
      );
    })}
  </g>
);

/** Peacock feather (mor-pankh). Origin = base of quill, ~360 tall. */
const Feather: React.FC<PropCtx> = ({ lf }) => (
  <g filter={SHADOW} transform={`rotate(${Math.sin(lf / 18) * 4})`}>
    <path d="M 0 0 Q -10 -180 0 -360" fill="none" stroke="#C9B26A" strokeWidth={6} />
    <path d="M 0 -60 Q -120 -200 0 -360 Q 120 -200 0 -60 Z" fill="#2F8F5B" />
    <ellipse cy={-250} rx={56} ry={74} fill="#1E8F8A" />
    <ellipse cy={-245} rx={36} ry={50} fill="#1E5FA8" />
    <ellipse cy={-238} rx={18} ry={26} fill="#0E2A57" />
    <circle cy={-246} r={8} fill={GOLD} />
  </g>
);

/* ---------- Kalki ---------- */

/** Devadatta, the white horse, galloping, with Kalki riding. data.rider=false hides the rider. Origin = hooves. */
const Horse: React.FC<PropCtx> = ({ lf, fps, data, pal }) => {
  const g = Math.sin(lf / 3.5);
  return (
    <g transform={`translate(0 ${Math.abs(g) * -10})`}>
      <g filter={SHADOW}>
        {[-130, -80, 90, 140].map((x, i) => (
          <path key={x} d={`M ${x} -170 L ${x + (i % 2 ? g : -g) * 40} -20`} stroke="#E8E2D6" strokeWidth={30} strokeLinecap="round" />
        ))}
        <path d="M -200 -190 Q -210 -300 -60 -300 L 120 -300 Q 220 -300 230 -220 Q 220 -160 120 -150 L -150 -150 Q -200 -150 -200 -190 Z" fill="#F5F1E8" />
        <path d="M 160 -280 Q 210 -420 300 -430 Q 350 -400 330 -350 Q 270 -340 230 -240 Z" fill="#F5F1E8" />
        <path d="M 170 -300 Q 200 -400 270 -440" fill="none" stroke="#C9B26A" strokeWidth={22} strokeLinecap="round" />
        <circle cx={300} cy={-400} r={8} fill="#1C1A17" />
        <path d="M -200 -230 Q -300 -200 -290 -110" fill="none" stroke="#C9B26A" strokeWidth={26} strokeLinecap="round" />
        <path d="M -40 -300 L 60 -300 L 50 -240 L -30 -240 Z" fill="#B23A2A" />
      </g>
      {data.rider !== false ? (
        <g transform="translate(10 -250) scale(0.62)"><Figure lf={lf} fps={fps} data={{ robe: "#1E5FA8", head: "crown", item: "sword", skin: "#E8B48A" }} pal={pal} /></g>
      ) : null}
    </g>
  );
};

export const AVATAR_PROPS = {
  figure: Figure, tortoise: Tortoise, mountain: Mountain, churning: Churning, kalash: Kalash,
  earth: Earth, varaha: Varaha, pillar: Pillar, narasimha: Narasimha, boonList: BoonList,
  threeSteps: ThreeSteps, greatBow: GreatBow, setu: Setu, feather: Feather, horse: Horse
} as const;

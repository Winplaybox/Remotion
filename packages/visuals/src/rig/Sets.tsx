import React from "react";

/**
 * SET KIT — full-frame 1080x1920 layered SVG backgrounds for character scenes. Floor line at y≈1470.
 * Each set is night-lit so the Spotlight overlay reads well. Add a set = add a case + its id in SET_IDS.
 */
export const SET_IDS = ["haveli", "village", "flat"] as const;
export type SetId = (typeof SET_IDS)[number];

const W = 1080;
const H = 1920;
export const FLOOR_Y = 1470;

const Lamp: React.FC<{ x: number; y: number; t: number; color?: string }> = ({ x, y, t, color = "#FFC56B" }) => {
  const flick = 0.85 + Math.sin(t * 7.3 + x) * 0.08 + Math.sin(t * 13.1 + x) * 0.05;
  return (
    <g>
      <circle cx={x} cy={y + 40} r={170} fill={color} opacity={0.16 * flick} />
      <circle cx={x} cy={y + 40} r={80} fill={color} opacity={0.22 * flick} />
      <line x1={x} y1={0} x2={x} y2={y} stroke="#2a1c12" strokeWidth={4} />
      <path d={`M ${x - 26} ${y} L ${x + 26} ${y} L ${x + 18} ${y + 56} L ${x - 18} ${y + 56} Z`} fill="#6B4423" stroke="#2a1c12" strokeWidth={4} />
      <ellipse cx={x} cy={y + 38} rx={12} ry={16} fill="#FFF3C4" opacity={flick} />
    </g>
  );
};

export const SetBackground: React.FC<{ set: SetId; t: number }> = ({ set, t }) => {
  switch (set) {
    case "haveli":
      return (
        <g>
          <defs>
            <linearGradient id="hv-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3B1F2B" />
              <stop offset="1" stopColor="#5A2E2A" />
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#hv-wall)" />
          {/* arches */}
          {[0, 1, 2].map((i) => {
            const x = 60 + i * 340;
            return (
              <g key={i}>
                <path d={`M ${x} ${FLOOR_Y} L ${x} 820 Q ${x + 140} 600 ${x + 280} 820 L ${x + 280} ${FLOOR_Y} Z`} fill="#24121C" stroke="#C98A4B" strokeWidth={10} />
                <path d={`M ${x + 30} ${FLOOR_Y} L ${x + 30} 840 Q ${x + 140} 670 ${x + 250} 840 L ${x + 250} ${FLOOR_Y} Z`} fill="#140A12" />
                {i === 1 ? (
                  <g>
                    <circle cx={x + 140} cy={900} r={62} fill="#F4F1E1" opacity={0.95} />
                    <circle cx={x + 140} cy={900} r={130} fill="#F4F1E1" opacity={0.08} />
                    {[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={x + 50 + k * 45} cy={1000 + (k % 2) * 40} r={2.5} fill="#fff" opacity={0.7} />)}
                  </g>
                ) : (
                  [0, 1, 2, 3].map((k) => <circle key={k} cx={x + 70 + k * 45} cy={950 + (k % 3) * 60} r={2.5} fill="#fff" opacity={0.6} />)
                )}
              </g>
            );
          })}
          <rect x={0} y={560} width={W} height={34} fill="#7A3A2A" stroke="#C98A4B" strokeWidth={6} />
          {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M ${i * 62} 594 l 31 34 31 -34 Z`} fill="#E2A33C" opacity={0.9} />)}
          <Lamp x={230} y={640} t={t} />
          <Lamp x={850} y={640} t={t} />
          {/* floor */}
          <rect x={0} y={FLOOR_Y} width={W} height={H - FLOOR_Y} fill="#3A2016" />
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={i * 150 - 60} y1={FLOOR_Y} x2={i * 190 - 300} y2={H} stroke="#2A160E" strokeWidth={6} />)}
          <line x1={0} y1={FLOOR_Y} x2={W} y2={FLOOR_Y} stroke="#C98A4B" strokeWidth={8} />
          {/* tijori */}
          <g transform="translate(900 1260)">
            <rect x={-80} y={0} width={160} height={210} rx={10} fill="#4A5560" stroke="#1A1E22" strokeWidth={6} />
            <circle cx={0} cy={100} r={34} fill="#6B7884" stroke="#1A1E22" strokeWidth={5} />
            <line x1={0} y1={100} x2={22} y2={82} stroke="#1A1E22" strokeWidth={6} />
          </g>
        </g>
      );
    case "village":
      return (
        <g>
          <defs>
            <linearGradient id="vl-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0B1236" />
              <stop offset="1" stopColor="#2C2F6B" />
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#vl-sky)" />
          {Array.from({ length: 40 }, (_, i) => (
            <circle key={i} cx={(i * 263) % W} cy={560 + ((i * 137) % 520)} r={(i % 3) + 1.5} fill="#fff" opacity={0.35 + 0.35 * Math.abs(Math.sin(t * 1.4 + i))} />
          ))}
          <path d={`M 0 1180 Q 260 1060 520 1160 Q 800 1060 1080 1150 L 1080 ${FLOOR_Y} L 0 ${FLOOR_Y} Z`} fill="#1B2A3E" />
          {/* hut */}
          <g transform="translate(250 980)">
            <rect x={-170} y={120} width={340} height={370} fill="#B9864F" stroke="#3A2414" strokeWidth={8} />
            <path d="M -220 140 L 0 -60 L 220 140 Z" fill="#7A5A2E" stroke="#3A2414" strokeWidth={8} />
            {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-200 + i * 50} y1={140} x2={0} y2={-50} stroke="#5A4020" strokeWidth={4} />)}
            <rect x={-50} y={280} width={100} height={210} fill="#3A2414" />
            <rect x={80} y={220} width={60} height={60} fill="#FFC56B" opacity={0.85 + Math.sin(t * 6) * 0.1} stroke="#3A2414" strokeWidth={6} />
          </g>
          {/* tree */}
          <g transform="translate(860 1000)">
            <rect x={-26} y={80} width={52} height={400} fill="#4A3020" stroke="#22150C" strokeWidth={6} />
            <circle cx={0} cy={40} r={150} fill="#1F4A2E" stroke="#0F2618" strokeWidth={6} />
            <circle cx={-90} cy={110} r={90} fill="#24563A" />
            <circle cx={90} cy={100} r={90} fill="#24563A" />
          </g>
          <Lamp x={560} y={760} t={t} />
          <rect x={0} y={FLOOR_Y} width={W} height={H - FLOOR_Y} fill="#5A3C22" />
          {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={(i * 97) % W} cy={FLOOR_Y + 30 + ((i * 53) % 400)} r={4} fill="#3E2814" />)}
          <line x1={0} y1={FLOOR_Y} x2={W} y2={FLOOR_Y} stroke="#7A5530" strokeWidth={6} />
        </g>
      );
    case "flat":
      return (
        <g>
          <rect width={W} height={H} fill="#22324A" />
          <rect x={0} y={560} width={W} height={FLOOR_Y - 560} fill="#2C4060" />
          {/* window with city */}
          <g transform="translate(110 700)">
            <rect x={0} y={0} width={380} height={460} fill="#0E1426" stroke="#E8E2D0" strokeWidth={14} />
            {Array.from({ length: 7 }, (_, i) => (
              <rect key={i} x={20 + i * 50} y={160 + ((i * 47) % 140)} width={40} height={300} fill="#1B2440" />
            ))}
            {Array.from({ length: 28 }, (_, i) => (
              <rect key={i} x={28 + (i % 7) * 50} y={190 + Math.floor(i / 7) * 60 + ((i * 47) % 30)} width={12} height={14} fill="#FFD27A" opacity={((i * 31) % 5) > 1 ? 0.85 : 0.15} />
            ))}
            <circle cx={300} cy={80} r={34} fill="#F4F1E1" opacity={0.9} />
            <line x1={190} y1={0} x2={190} y2={460} stroke="#E8E2D0" strokeWidth={10} />
          </g>
          {/* sofa + TV */}
          <g transform="translate(760 1150)">
            <rect x={-170} y={-170} width={340} height={200} rx={14} fill="#121722" stroke="#0A0D14" strokeWidth={8} />
            <rect x={-150} y={-150} width={300} height={160} fill="#2B3A5A" opacity={0.6 + Math.sin(t * 3) * 0.05} />
            <rect x={-20} y={30} width={40} height={60} fill="#3A3A3A" />
            <rect x={-200} y={90} width={400} height={30} rx={6} fill="#6B4A2E" stroke="#2A1A10" strokeWidth={5} />
          </g>
          <Lamp x={540} y={600} t={t} color="#FFE3A8" />
          <rect x={0} y={FLOOR_Y} width={W} height={H - FLOOR_Y} fill="#8A6A4A" />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 100} y1={FLOOR_Y} x2={i * 100 - 200 + i * 20} y2={H} stroke="#6E5236" strokeWidth={5} />)}
          <line x1={0} y1={FLOOR_Y} x2={W} y2={FLOOR_Y} stroke="#4A3420" strokeWidth={8} />
        </g>
      );
  }
};

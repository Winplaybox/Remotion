import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT, useBundledFonts } from "../fonts";
import { Character } from "./Character";
import { ACTION_IDS, ACTIONS, EXPRESSION_IDS, type ActionId } from "./motion";
import { CAST, CAST_BY_ID, CATEGORIES, CATEGORY_LABEL, byCategory, type CastId, type Category } from "./cast";

const TIER_COLOR = { main: "#FFD27A", supporting: "#9BE3B0", rotating: "#8EC5FF", guest: "#F6A6D8" } as const;

/** Contact sheet of one category (10 characters). Studio: Rig/CharacterSheet. */
export const CharacterSheet: React.FC<{ category: Category; action: ActionId }> = ({ category, action }) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const members = byCategory(category);
  const spec = ACTIONS[action];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#1B1530,#2A1F3D)" }}>
      <div style={{ position: "absolute", top: 36, width: "100%", textAlign: "center", fontFamily: FONT.display, fontSize: 70, color: "#FFD27A" }}>{CATEGORY_LABEL[category].toUpperCase()}</div>
      <div style={{ position: "absolute", top: 126, width: "100%", textAlign: "center", fontFamily: FONT.mono, fontSize: 28, color: "#ffffffaa" }}>JASOOS BHAI CAST · {CAST.length} characters · {members.length} here</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {members.map((m, i) => {
          const x = i === 9 ? 540 : 180 + (i % 3) * 360;
          const y = 540 + Math.floor(i / 3) * 372;
          return (
            <g key={m.id}>
              <circle cx={x} cy={y - 150} r={128} fill="#ffffff10" />
              <g transform={`translate(${x} ${y}) scale(0.5)`}>
                <Character look={m.id} action={action} frame={frame + Math.round(spec.loop * 0.2)} seed={m.id} exportMode />
              </g>
              <text x={x} y={y + 38} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={26} fill="#fff">{m.name}</text>
              <text x={x} y={y + 68} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={21} fill={TIER_COLOR[m.tier]}>{m.profession} · {m.tier}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** All 20 actions + 16 expressions of ONE character (proof sheet). Studio: Rig/ActionSheet. */
export const ActionSheet: React.FC<{ id: CastId }> = ({ id }) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const m = CAST_BY_ID[id];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#1B1530,#2A1F3D)" }}>
      <div style={{ position: "absolute", top: 18, width: "100%", textAlign: "center", fontFamily: FONT.display, fontSize: 56, color: "#FFD27A" }}>{m.name.toUpperCase()} · 20 ACTIONS + 16 EXPRESSIONS</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {ACTION_IDS.map((a, i) => {
          const cx = 108 + (i % 5) * 216;
          const top = 100 + Math.floor(i / 5) * 276;
          const f = frame + Math.round(ACTIONS[a].loop * 0.2);
          return (
            <g key={a}>
              <svg x={cx - 108} y={top} width={216} height={240} viewBox="-190 -640 380 680" preserveAspectRatio="xMidYMax meet">
                <Character look={id} action={a} frame={f} seed={a} exportMode />
              </svg>
              <text x={cx} y={top + 262} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={22} fill="#fff">{a}</text>
            </g>
          );
        })}
        {EXPRESSION_IDS.map((e, i) => {
          const cx = 68 + (i % 8) * 134;
          const top = 1250 + Math.floor(i / 8) * 300;
          return (
            <g key={e}>
              <svg x={cx - 65} y={top} width={130} height={130} viewBox="-100 -575 200 200">
                <Character look={id} action="idle" expression={e} frame={frame} seed={e} exportMode />
              </svg>
              <text x={cx} y={top + 156} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={20} fill="#FFD27A">{e}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const SHEET_CATEGORIES = CATEGORIES;

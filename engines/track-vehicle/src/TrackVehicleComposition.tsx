import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { VoiceCues } from "@visuals/VoiceCues";
import { FPS, PHASE, type TrackVehicle } from "./model";
import { buildSchedule, carPose } from "./schedule";
import { Vehicle, VehicleDefs, VEHICLE_SIZE } from "./vehicles";

const W = 1080, H = 1920;
const AREA_TOP = 470, AREA_BOTTOM = 1580;
const ease = Easing.inOut(Easing.cubic);

function useGeometry(p: TrackVehicle) {
  return useMemo(() => {
    const pitchX = Math.min(300, 880 / p.cols);
    const pitchY = Math.min(330, (AREA_BOTTOM - AREA_TOP) / p.rows);
    const { w, l } = VEHICLE_SIZE[p.vehicle];
    const scale = Math.min((pitchY * 0.8) / l, (pitchX * 0.5) / w);
    const top = AREA_TOP + (AREA_BOTTOM - AREA_TOP - pitchY * p.rows) / 2 + pitchY / 2;
    const slotXY = (s: number): [number, number] => [W / 2 + ((s % p.cols) - (p.cols - 1) / 2) * pitchX, top + Math.floor(s / p.cols) * pitchY];
    const laneXs = Array.from({ length: p.cols + 1 }, (_, i) => W / 2 + (i - p.cols / 2) * pitchX);
    return { pitchX, pitchY, scale, slotXY, laneXs, w, l };
  }, [p]);
}

/** Quadratic bezier between two slots, bent sideways so swapping cars pass each other. */
function pathPoint(p0: [number, number], p1: [number, number], bend: number, t: number) {
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
  const len = Math.hypot(dx, dy) || 1;
  const off = Math.min(140, len * 0.35) * bend;
  const c: [number, number] = [(p0[0] + p1[0]) / 2 + (-dy / len) * off, (p0[1] + p1[1]) / 2 + (dx / len) * off];
  const u = 1 - t;
  const x = u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0];
  const y = u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1];
  const tx = 2 * u * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]);
  const ty = 2 * u * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]);
  let ang = (Math.atan2(ty, tx) * 180) / Math.PI + 90;
  while (ang > 180) ang -= 360;
  while (ang < -180) ang += 360;
  if (ang > 90) ang -= 180;
  if (ang < -90) ang += 180;
  ang = Math.max(-62, Math.min(62, ang));
  return { x, y, ang };
}

const Road: React.FC<{ laneXs: number[]; frame: number; seed: string }> = ({ laneXs, frame, seed }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <rect width={W} height={H} fill="#121317" />
    <rect width={W} height={H} filter="url(#tv-noise)" />
    {laneXs.map((x, i) => {
      const edge = i === 0 || i === laneXs.length - 1;
      return edge
        ? <g key={i}><line x1={x} x2={x} y1={0} y2={H} stroke="#111" strokeWidth={16} /><line x1={x} x2={x} y1={-60} y2={H + 60} stroke="#FFC800" strokeOpacity={0.8} strokeWidth={16} strokeDasharray="40 40" strokeDashoffset={-frame * 14} /></g>
        : <line key={i} x1={x} x2={x} y1={-80} y2={H + 80} stroke="#F2F2F2" strokeOpacity={0.55} strokeWidth={6} strokeDasharray="70 70" strokeDashoffset={-frame * 14} />;
    })}
    {[380, 1610].map((zy) => (
      <g key={zy} transform={`translate(0 ${((zy + frame * 14) % (H + 200)) - 100})`} opacity={0.22}>
        {Array.from({ length: 14 }, (_, k) => <rect key={k} x={(laneXs[0] ?? 0) + 20 + k * (((laneXs[laneXs.length - 1] ?? W) - (laneXs[0] ?? 0) - 40) / 14)} y={0} width={34} height={90} fill="#fff" />)}
      </g>
    ))}
    {Array.from({ length: 34 }, (_, i) => {
      const x = random(`${seed}-sx${i}`) * W;
      const len = 80 + random(`${seed}-sl${i}`) * 320;
      const sp = 30 + random(`${seed}-sv${i}`) * 45;
      const y = ((random(`${seed}-sy${i}`) * (H + len) + frame * sp) % (H + len)) - len;
      return <line key={i} x1={x} x2={x} y1={y} y2={y + len} stroke="#fff" strokeOpacity={0.05 + random(`${seed}-so${i}`) * 0.14} strokeWidth={1.5 + random(`${seed}-sw${i}`) * 2} />;
    })}
  </svg>
);

export const TrackVehicleComposition: React.FC<TrackVehicle> = (p) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = useGeometry(p);
  const sched = useMemo(() => buildSchedule(p), [p]);

  const showStart = PHASE.intro;
  const hideStart = showStart + PHASE.show;
  const shuffleStart = hideStart + PHASE.hide;
  const shuffleEnd = shuffleStart + p.shuffleSeconds * FPS;
  const questionEnd = shuffleEnd + p.questionSeconds * FPS;
  const answerEnd = questionEnd + p.answerSeconds * FPS;
  const sf = frame - shuffleStart;

  const isQuestion = frame >= shuffleEnd;
  const answerP = p.answerSeconds > 0 ? spring({ frame: frame - questionEnd, fps, config: { damping: 14 } }) : 0;
  const endP = p.endCard.show ? interpolate(frame, [answerEnd, answerEnd + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const hideP = interpolate(frame, [hideStart, hideStart + PHASE.hide], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const targetColorMix = Math.max(1 - hideP, answerP);
  const highlight = Math.max(interpolate(frame, [showStart, showStart + 10, hideStart, hideStart + 14], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), answerP);
  const titleIn = spring({ frame, fps, config: { damping: 16 } });
  const swapTitle = spring({ frame: frame - shuffleEnd, fps, config: { damping: 15 } });
  const timeLeft = interpolate(frame, [shuffleStart, shuffleEnd], [p.shuffleSeconds, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const timerVisible = frame < shuffleEnd ? interpolate(frame, [hideStart, shuffleStart], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const cars = Array.from({ length: sched.slots }, (_, car) => {
    const pose = carPose(sched, car, Math.max(0, Math.min(sf, shuffleEnd - shuffleStart)));
    const a = g.slotXY(pose.slotFrom), b = g.slotXY(pose.slotTo);
    const tt = ease(pose.t);
    const pt = pose.moving ? pathPoint(a, b, pose.bend, tt) : { x: a[0], y: a[1], ang: 0 };
    const bell = pose.moving ? Math.pow(Math.sin(Math.PI * pose.t), 0.6) : 0;
    const drop = spring({ frame: frame - (car % p.cols) * 2 - Math.floor(car / p.cols) * 3, fps, config: { damping: 15, stiffness: 120 } });
    const puffs = pose.moving
      ? Array.from({ length: 6 }, (_, j) => {
          const tj = pose.t - (j + 1) * 0.06;
          if (tj <= 0) return null;
          const q = pathPoint(a, b, pose.bend, ease(tj));
          const rad = (q.ang * Math.PI) / 180;
          const rx = q.x - Math.sin(rad) * (g.l / 2) * g.scale;
          const ry = q.y + Math.cos(rad) * (g.l / 2) * g.scale;
          return <circle key={j} cx={rx} cy={ry} r={(14 + j * 9) * g.scale * 1.4} fill="#B9BEC8" opacity={0.22 * (1 - j / 6)} />;
        })
      : null;
    return { car, x: pt.x, y: pt.y + (1 - drop) * -90, ang: pt.ang * bell, drop, puffs, moving: pose.moving };
  });

  const isTarget = (c: number) => c === sched.targetCar;
  const dimOthers = answerP * 0.65;
  const targetCar = cars[sched.targetCar];
  const glowXY = frame < shuffleStart || !targetCar ? g.slotXY(sched.targetCar) : [targetCar.x, targetCar.y];
  const pulse = 1 + Math.sin(frame / 4) * 0.04;
  const accent = p.colors.accent;

  return (
    <AbsoluteFill style={{ background: "#0B0C0F", overflow: "hidden" }}>
      <VoiceCues cues={p.voice} />
      <AbsoluteFill style={{ filter: endP > 0 ? `blur(${endP * 14}px) brightness(${1 - endP * 0.45})` : undefined }}>
        <Road laneXs={g.laneXs} frame={frame} seed={p.seed} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <VehicleDefs />
          {cars.map((c) => <g key={`p${c.car}`}>{c.puffs}</g>)}
          {[...cars].sort((x, y) => Number(x.moving) - Number(y.moving)).map((c) => (
            <g key={c.car} transform={`translate(${c.x} ${c.y}) rotate(${c.ang}) scale(${g.scale})`} opacity={c.drop * (isTarget(c.car) ? 1 : 1 - dimOthers)}>
              <Vehicle kind={p.vehicle} color={isTarget(c.car) ? interpolateColors(targetColorMix, [0, 1], [p.colors.decoy, p.colors.target]) : p.colors.decoy} trim={p.colors.trim} lit={isTarget(c.car) ? targetColorMix : 0} frame={frame} />
            </g>
          ))}
          {highlight > 0.01 ? (
            <g transform={`translate(${glowXY[0]} ${glowXY[1]}) scale(${pulse})`} opacity={highlight}>
              <rect x={-g.w * g.scale * 0.85} y={-g.l * g.scale * 0.62} width={g.w * g.scale * 1.7} height={g.l * g.scale * 1.24} rx={26} fill="none" stroke={accent} strokeWidth={6} style={{ filter: `drop-shadow(0 0 18px ${accent}) drop-shadow(0 0 40px ${accent})` }} />
              <circle r={g.l * g.scale * 0.95} fill="none" stroke={accent} strokeOpacity={0.35} strokeWidth={3} />
            </g>
          ) : null}
        </svg>

        {/* numbered badges */}
        {isQuestion
          ? Array.from({ length: sched.slots }, (_, s) => {
              const [x, y] = g.slotXY(s);
              const pop = spring({ frame: frame - shuffleEnd - 4 - s * 1.5, fps, config: { damping: 12, stiffness: 160 } });
              const win = s === sched.answerSlot ? answerP : 0;
              return (
                <div key={s} style={{ position: "absolute", left: x - 38, top: y - 38, width: 76, height: 76, borderRadius: 99, border: "5px solid #fff", background: win > 0.5 ? accent : "rgba(10,10,14,.82)", color: win > 0.5 ? "#111" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.ui, fontWeight: 900, fontSize: 36, transform: `scale(${pop * (1 + win * 0.35)})`, opacity: 1 - dimOthers * (s === sched.answerSlot ? 0 : 0.8), boxShadow: win > 0.5 ? `0 0 40px ${accent}` : "0 6px 20px rgba(0,0,0,.6)" }}>
                  {s + 1}
                </div>
              );
            })
          : null}

        {/* title */}
        <div style={{ position: "absolute", top: 205, width: "100%", textAlign: "center", fontFamily: FONT.punch, fontStyle: "italic", fontWeight: 900, fontSize: Math.min(96, 1650 / ((isQuestion ? p.questionPrefix + p.questionSuffix : p.titlePrefix).length + p.label.length + 2)), whiteSpace: "nowrap", letterSpacing: -2, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,.8)", transform: `translateY(${(1 - titleIn) * -40}px) scale(${isQuestion ? 0.9 + swapTitle * 0.1 : 1})`, opacity: titleIn }}>
          {isQuestion ? p.questionPrefix : p.titlePrefix} <span style={{ color: accent }}>{p.label}</span>{isQuestion ? p.questionSuffix : ""}
        </div>
        <div style={{ position: "absolute", top: 340, left: 210, right: 210, display: "flex", alignItems: "center", gap: 22, opacity: timerVisible }}>
          <div style={{ flex: 1, height: 12, borderRadius: 12, background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(timeLeft / p.shuffleSeconds) * 100}%`, borderRadius: 12, background: timeLeft < 4 ? "linear-gradient(90deg,#FF5A3C,#FF8A3C)" : `linear-gradient(90deg, ${accent}, #FFB347)` }} />
          </div>
          <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 34, color: "#fff", width: 70 }}>{Math.ceil(timeLeft)}s</div>
        </div>
        {isQuestion ? (
          <div style={{ position: "absolute", top: 335, width: "100%", display: "flex", justifyContent: "center", opacity: swapTitle }}>
            <div style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 28, color: "#fff", padding: "10px 26px", borderRadius: 99, border: "2px solid rgba(255,255,255,.45)", background: "rgba(0,0,0,.45)" }}>
              {answerP > 0.5 ? p.answerLine.replace("{n}", String(sched.answerSlot + 1)) : p.cta}
            </div>
          </div>
        ) : null}
        {frame >= showStart && frame < hideStart + 10 ? (
          <div style={{ position: "absolute", left: g.slotXY(sched.targetCar)[0] - 300, width: 600, top: g.slotXY(sched.targetCar)[1] + g.l * g.scale * 0.68, display: "flex", justifyContent: "center", opacity: highlight }}>
            <div style={{ fontFamily: FONT.ui, fontWeight: 900, fontSize: 28, letterSpacing: 3, color: "#111", background: accent, padding: "8px 20px", borderRadius: 99, boxShadow: `0 0 30px ${accent}` }}>{p.rememberText}</div>
          </div>
        ) : null}
        <div style={{ position: "absolute", top: 1680, width: "100%", textAlign: "center", fontFamily: FONT.ui, fontWeight: 800, fontSize: 24, letterSpacing: 9, color: "rgba(255,255,255,.55)" }}>{p.handle}</div>
        <div style={{ position: "absolute", top: 92, left: 60, right: 60, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: titleIn }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: FONT.ui, fontWeight: 900, fontSize: 26, letterSpacing: 4, color: "#fff" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "repeating-linear-gradient(45deg, #FFC800 0 8px, #111 8px 16px)" }} />
            {p.brand}
          </div>
          <div style={{ fontFamily: FONT.punch, fontStyle: "italic", fontWeight: 900, fontSize: 34, color: "#111", background: accent, padding: "6px 20px", borderRadius: 10 }}>LEVEL {String(p.level).padStart(2, "0")}</div>
        </div>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 60% at 50% 50%, transparent 55%, rgba(0,0,0,.75))" }} />
      </AbsoluteFill>

      {endP > 0 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: endP, transform: `scale(${0.92 + endP * 0.08})` }}>
          <div style={{ fontFamily: FONT.punch, fontStyle: "italic", fontWeight: 900, fontSize: Math.min(150, 1500 / p.endCard.title.length), color: accent, WebkitTextStroke: "6px #3A2500", textShadow: "0 10px 0 #3A2500, 0 20px 40px rgba(0,0,0,.6)", transform: "rotate(-4deg)" }}>{p.endCard.title}</div>
          <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 44, color: "#fff", textAlign: "center", maxWidth: 820, marginTop: 50, lineHeight: 1.25 }}>{p.endCard.line}</div>
          <div style={{ marginTop: 50, fontFamily: FONT.ui, fontWeight: 900, fontSize: 40, color: "#111", background: accent, padding: "20px 48px", borderRadius: 99, border: "4px solid #3A2500", transform: `scale(${1 + Math.sin(frame / 6) * 0.03})` }}>{p.endCard.button.replace("{next}", String(p.level + 1))}</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

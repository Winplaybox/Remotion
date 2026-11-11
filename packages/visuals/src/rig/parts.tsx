import React from "react";
import { OUTLINE, type FullLook, type FaceShape, type Prop } from "./presets";

/** Drawing helpers for the rig: head shapes, hair, headwear, facial hair, torsos, accessories and held props. */
const S = { stroke: OUTLINE, strokeWidth: 5, strokeLinejoin: "round" as const };
const T = (w = 4) => ({ stroke: OUTLINE, strokeWidth: w, strokeLinejoin: "round" as const });

export interface HeadMetrics { rx: number; ry: number; cy: number; top: number }
export const headMetrics = (s: FaceShape): HeadMetrics => {
  switch (s) {
    case "oval": return { rx: 51, ry: 68, cy: -444, top: -512 };
    case "long": return { rx: 48, ry: 73, cy: -447, top: -520 };
    case "square": return { rx: 58, ry: 60, cy: -440, top: -500 };
    default: return { rx: 56, ry: 64, cy: -442, top: -506 };
  }
};

export const HeadShape: React.FC<{ shape: FaceShape; fill: string }> = ({ shape, fill }) => {
  const m = headMetrics(shape);
  if (shape === "square") return <rect x={-m.rx} y={m.top} width={m.rx * 2} height={m.ry * 2} rx={30} fill={fill} {...S} />;
  return <ellipse cx={0} cy={m.cy} rx={m.rx} ry={m.ry} fill={fill} {...S} />;
};

/** Wraps hair/headwear drawn for the "round" head so it fits any face shape. */
export const OnHead: React.FC<{ shape: FaceShape; children: React.ReactNode }> = ({ shape, children }) => {
  const m = headMetrics(shape);
  return <g transform={`translate(0 ${m.top + 506}) scale(${m.rx / 56} 1)`}>{children}</g>;
};

// ------------------------------------------------------------------------------------------------ HAIR
export const BackHair: React.FC<{ L: FullLook }> = ({ L }) => {
  const c = L.hairColor;
  switch (L.hair) {
    case "bun":
    case "greyBun":
      return <circle cx={34} cy={-506} r={27} fill={c} {...S} />;
    case "ponytail":
      return <path d="M 40 -494 Q 96 -470 78 -380 Q 70 -420 46 -456 Z" fill={c} {...S} />;
    case "braid":
      return (
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => <ellipse key={i} cx={56 + i * 2} cy={-420 + i * 24} rx={14} ry={15} fill={c} stroke={OUTLINE} strokeWidth={4} />)}
          <path d="M 64 -290 l -8 20 M 66 -290 l 8 20" stroke="#E2483D" strokeWidth={5} />
        </g>
      );
    case "long":
      return <path d="M -62 -470 Q -92 -400 -88 -296 L 88 -296 Q 92 -400 62 -470 Z" fill={c} {...S} />;
    case "bob":
      return <path d="M -62 -470 Q -76 -410 -62 -384 L 62 -384 Q 76 -410 62 -470 Z" fill={c} {...S} />;
    case "twinBraids":
      return (
        <g>
          {[-1, 1].map((s) => (
            <g key={s}>
              {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={s * (62 + i)} cy={-420 + i * 24} rx={13} ry={14} fill={c} stroke={OUTLINE} strokeWidth={4} />)}
              <circle cx={s * 66} cy={-300} r={6} fill="#E2483D" stroke={OUTLINE} strokeWidth={2} />
            </g>
          ))}
        </g>
      );
    case "pigtails":
      return (
        <g>
          {[-1, 1].map((s) => (
            <g key={s}>
              <path d={`M ${s * 52} -476 Q ${s * 100} -470 ${s * 92} -400 Q ${s * 78} -430 ${s * 56} -450 Z`} fill={c} {...S} />
            </g>
          ))}
        </g>
      );
    case "jata":
      return (
        <g>
          <circle cx={0} cy={-546} r={34} fill={c} {...S} />
          <path d="M -50 -470 Q -86 -420 -70 -340 M 50 -470 Q 88 -420 72 -340 M -40 -480 Q -70 -440 -58 -380 M 40 -480 Q 70 -440 58 -380" stroke={OUTLINE} strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M -50 -470 Q -86 -420 -70 -340 M 50 -470 Q 88 -420 72 -340 M -40 -480 Q -70 -440 -58 -380 M 40 -480 Q 70 -440 58 -380" stroke={c} strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      );
    case "curly":
      return <ellipse cx={0} cy={-466} rx={74} ry={70} fill={c} {...S} />;
    default:
      return null;
  }
};

export const FrontHair: React.FC<{ L: FullLook }> = ({ L }) => {
  const c = L.hairColor;
  switch (L.hair) {
    case "short":
      return <path d="M -58 -446 Q -62 -516 0 -514 Q 62 -516 58 -446 Q 52 -482 4 -484 Q -42 -486 -58 -446 Z" fill={c} {...S} />;
    case "sidePart":
      return <path d="M -58 -444 Q -64 -518 0 -516 Q 62 -514 58 -446 Q 44 -490 -10 -488 Q -18 -470 -40 -470 Q -54 -462 -58 -444 Z" fill={c} {...S} />;
    case "spiky":
      return <path d="M -58 -446 L -62 -492 L -40 -488 L -34 -526 L -12 -500 L 2 -534 L 16 -502 L 38 -526 L 42 -488 L 62 -494 L 58 -446 Q 40 -480 0 -482 Q -40 -480 -58 -446 Z" fill={c} {...S} />;
    case "messy":
      return <path d="M -60 -444 L -68 -480 L -48 -478 L -56 -520 L -26 -504 L -22 -540 L 0 -510 L 22 -538 L 28 -504 L 56 -520 L 50 -478 L 70 -482 L 60 -444 Q 40 -478 0 -478 Q -40 -478 -60 -444 Z" fill={c} {...S} />;
    case "flatTop":
      return <path d="M -52 -448 L -54 -530 L 54 -530 L 52 -448 Q 42 -484 0 -486 Q -42 -484 -52 -448 Z" fill={c} {...S} />;
    case "slickBack":
      return (
        <g>
          <path d="M -56 -450 Q -60 -520 0 -518 Q 60 -520 56 -450 Q 50 -490 0 -492 Q -50 -490 -56 -450 Z" fill={c} {...S} />
          <path d="M -30 -506 Q 0 -516 30 -506 M -36 -496 Q 0 -508 36 -496" stroke="#ffffff55" strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      );
    case "buzz":
      return <path d="M -54 -452 Q -56 -508 0 -506 Q 56 -508 54 -452 Q 40 -480 0 -482 Q -40 -480 -54 -452 Z" fill={c} opacity={0.6} stroke={OUTLINE} strokeWidth={3} />;
    case "balding":
      return (
        <g>
          <path d="M -58 -452 Q -66 -480 -52 -494 Q -44 -470 -44 -450 Z" fill={c} {...T(4)} />
          <path d="M 58 -452 Q 66 -480 52 -494 Q 44 -470 44 -450 Z" fill={c} {...T(4)} />
          <path d="M -12 -508 Q 0 -516 12 -508" stroke={c} strokeWidth={4} fill="none" />
          <path d="M -26 -496 Q -8 -506 6 -500" stroke="#fff7" strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      );
    case "bald":
      return (
        <g>
          <ellipse cx={-52} cy={-456} rx={9} ry={20} fill={c} stroke={OUTLINE} strokeWidth={3.5} />
          <ellipse cx={52} cy={-456} rx={9} ry={20} fill={c} stroke={OUTLINE} strokeWidth={3.5} />
          <path d="M -24 -496 Q -10 -504 6 -500" stroke="#fff6" strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      );
    case "topknot":
      return (
        <g>
          <ellipse cx={-52} cy={-460} rx={8} ry={16} fill={c} stroke={OUTLINE} strokeWidth={3.5} />
          <ellipse cx={52} cy={-460} rx={8} ry={16} fill={c} stroke={OUTLINE} strokeWidth={3.5} />
          <path d="M -10 -504 Q 0 -512 10 -504 L 6 -530 Q 0 -540 -6 -530 Z" fill={c} {...T(4)} />
          <circle cx={0} cy={-540} r={14} fill={c} {...T(4)} />
        </g>
      );
    case "curly":
      return (
        <g>
          {Array.from({ length: 9 }, (_, i) => {
            const a = Math.PI * (1.08 + (i / 8) * 0.84);
            return <circle key={i} cx={Math.cos(a) * 62} cy={-452 + Math.sin(a) * 66} r={19} fill={c} {...T(4)} />;
          })}
          <path d="M -50 -476 Q 0 -500 50 -476 Q 40 -494 0 -498 Q -40 -494 -50 -476 Z" fill={c} />
        </g>
      );
    case "bun":
    case "greyBun":
    case "ponytail":
    case "braid":
    case "twinBraids":
    case "pigtails":
    case "long":
      return <path d="M -60 -420 Q -70 -518 0 -516 Q 70 -518 60 -420 Q 54 -470 22 -484 Q 4 -476 0 -490 Q -4 -476 -22 -484 Q -54 -470 -60 -420 Z" fill={c} {...S} />;
    case "bob":
      return <path d="M -62 -424 Q -70 -520 0 -518 Q 70 -520 62 -424 L 62 -408 L 50 -408 L 48 -466 Q 0 -488 -48 -466 L -50 -408 L -62 -408 Z" fill={c} {...S} />;
    case "jata":
      return <path d="M -58 -440 Q -64 -512 0 -510 Q 64 -512 58 -440 Q 44 -482 0 -486 Q -44 -482 -58 -440 Z" fill={c} {...S} />;
    default:
      return null;
  }
};

// ------------------------------------------------------------------------------------------------ HEADWEAR
export const Headwear: React.FC<{ L: FullLook }> = ({ L }) => {
  const c = L.headwearColor;
  switch (L.headwear) {
    case "pagdi":
      return (
        <g>
          <path d="M -66 -452 Q -76 -548 0 -556 Q 76 -548 66 -452 Q 0 -486 -66 -452 Z" fill={c} {...S} />
          <path d="M -62 -480 Q 0 -520 64 -470 M -58 -508 Q 0 -540 60 -500" stroke="#0003" strokeWidth={6} fill="none" />
          <path d="M 0 -488 l 10 -18 -10 -22 -10 22 Z" fill={L.trim} stroke={OUTLINE} strokeWidth={3} />
          <circle cx={0} cy={-500} r={6} fill="#3FD0C9" stroke={OUTLINE} strokeWidth={2} />
        </g>
      );
    case "gandhiTopi":
      return <path d="M -52 -476 L 54 -476 L 44 -516 Q 0 -524 -42 -512 Z" fill={c} {...S} />;
    case "cap":
      return (
        <g>
          <path d="M -58 -470 Q -58 -528 0 -528 Q 58 -528 58 -470 Z" fill={c} {...S} />
          <path d="M -6 -472 Q 50 -480 86 -466 Q 50 -458 -6 -462 Z" fill={c} {...S} />
        </g>
      );
    case "policeCap":
      return (
        <g>
          <path d="M -62 -472 L -70 -524 Q 0 -540 70 -524 L 62 -472 Z" fill={c} {...S} />
          <rect x={-62} y={-486} width={124} height={16} fill="#3A3226" stroke={OUTLINE} strokeWidth={3.5} />
          <path d="M -60 -470 Q 0 -446 60 -470 L 56 -462 Q 0 -440 -56 -462 Z" fill="#1E1A14" stroke={OUTLINE} strokeWidth={3} />
          <circle cx={0} cy={-506} r={9} fill="#E6C04A" stroke={OUTLINE} strokeWidth={2.5} />
        </g>
      );
    case "fedora":
      return (
        <g>
          <ellipse cx={0} cy={-478} rx={92} ry={17} fill={c} {...S} />
          <path d="M -54 -480 Q -60 -548 -14 -544 Q 0 -530 14 -544 Q 60 -548 54 -480 Z" fill={c} {...S} />
          <path d="M -55 -490 Q 0 -500 55 -490 L 54 -478 Q 0 -488 -54 -478 Z" fill={L.trim} stroke={OUTLINE} strokeWidth={3} />
        </g>
      );
    case "sunHat":
      return (
        <g>
          <ellipse cx={0} cy={-480} rx={104} ry={18} fill={c} {...S} />
          <path d="M -56 -482 Q -58 -540 0 -542 Q 58 -540 56 -482 Z" fill={c} {...S} />
          <path d="M -56 -490 Q 0 -500 56 -490 L 56 -480 Q 0 -490 -56 -480 Z" fill="#C0392B" stroke={OUTLINE} strokeWidth={3} />
          {[-70, -40, 40, 70].map((x) => <path key={x} d={`M ${x} -480 l 0 4`} stroke="#0003" strokeWidth={3} />)}
        </g>
      );
    case "chefHat":
      return (
        <g>
          <path d="M -50 -480 L -52 -520 Q -78 -530 -66 -556 Q -50 -584 -20 -570 Q 0 -590 24 -572 Q 56 -586 66 -556 Q 76 -528 52 -520 L 50 -480 Z" fill={c} {...S} />
          <rect x={-52} y={-496} width={104} height={16} fill="#E8E8E8" stroke={OUTLINE} strokeWidth={3.5} />
        </g>
      );
    case "nurseCap":
      return (
        <g>
          <path d="M -50 -486 L -44 -522 Q 0 -540 44 -522 L 50 -486 Z" fill={c} {...S} />
          <path d="M -6 -518 h 12 M 0 -524 v 12" stroke="#D32F2F" strokeWidth={6} />
        </g>
      );
    case "ghunghat":
      return (
        <g>
          <path d="M -72 -380 Q -86 -548 0 -554 Q 86 -548 72 -380 L 54 -380 Q 58 -484 0 -494 Q -58 -484 -54 -380 Z" fill={c} {...S} />
          <path d="M -72 -380 L -76 -336 L -44 -350 L -54 -380 Z M 72 -380 L 76 -336 L 44 -350 L 54 -380 Z" fill={c} {...T(4)} />
          <path d="M -72 -520 Q 0 -490 72 -520" stroke={L.trim} strokeWidth={6} fill="none" />
        </g>
      );
    case "bandana":
      return (
        <g>
          <path d="M -60 -466 Q -62 -526 0 -524 Q 62 -526 60 -466 Q 0 -490 -60 -466 Z" fill={c} {...S} />
          <path d="M 56 -480 L 92 -500 L 84 -476 L 96 -462 L 58 -466 Z" fill={c} {...T(4)} />
          <circle cx={-20} cy={-504} r={4} fill="#fff8" />
          <circle cx={10} cy={-512} r={4} fill="#fff8" />
          <circle cx={30} cy={-496} r={4} fill="#fff8" />
        </g>
      );
    case "beanie":
      return (
        <g>
          <path d="M -58 -466 Q -62 -540 0 -540 Q 62 -540 58 -466 Z" fill={c} {...S} />
          <rect x={-60} y={-484} width={120} height={22} rx={8} fill={L.trim} {...S} />
          <circle cx={0} cy={-548} r={12} fill={L.trim} {...T(4)} />
        </g>
      );
    case "hardHat":
      return (
        <g>
          <path d="M -60 -474 Q -62 -540 0 -540 Q 62 -540 60 -474 Z" fill={c} {...S} />
          <path d="M -72 -474 L 72 -474 L 66 -462 L -66 -462 Z" fill={c} {...S} />
          <rect x={-10} y={-546} width={20} height={70} fill={c} stroke={OUTLINE} strokeWidth={3} />
        </g>
      );
    case "headCloth":
      return (
        <g>
          <path d="M -62 -458 Q -70 -540 0 -544 Q 70 -540 62 -458 Q 0 -490 -62 -458 Z" fill={c} {...S} />
          <path d="M -58 -490 L 58 -490 M -52 -508 L 52 -508 M -30 -540 L -30 -470 M 0 -544 L 0 -470 M 30 -540 L 30 -470" stroke="#fff6" strokeWidth={4} />
          <path d="M 54 -478 L 90 -460 L 74 -446 L 92 -432 L 56 -446 Z" fill={c} {...T(4)} />
        </g>
      );
    default:
      return null;
  }
};

// ------------------------------------------------------------------------------------------------ FACIAL HAIR
export const FacialHairArt: React.FC<{ L: FullLook }> = ({ L }) => {
  const c = L.hairColor === "#3A2A22" ? "#2A1C16" : L.hairColor;
  switch (L.facialHair) {
    case "mustache":
      return <path d="M -22 -414 Q -10 -428 0 -419 Q 10 -428 22 -414 Q 10 -411 0 -414 Q -10 -411 -22 -414 Z" fill={c} stroke={OUTLINE} strokeWidth={3} />;
    case "bigMustache":
      return <path d="M -40 -428 Q -36 -414 -24 -414 Q -10 -432 0 -420 Q 10 -432 24 -414 Q 36 -414 40 -428 Q 44 -406 24 -406 Q 10 -410 0 -413 Q -10 -410 -24 -406 Q -44 -406 -40 -428 Z" fill={c} stroke={OUTLINE} strokeWidth={3} />;
    case "handlebar":
      return (
        <g>
          <path d="M -36 -418 Q -24 -414 -10 -428 Q 0 -420 10 -428 Q 24 -414 36 -418 Q 24 -406 0 -411 Q -24 -406 -36 -418 Z" fill={c} stroke={OUTLINE} strokeWidth={3} />
          <path d="M -36 -418 Q -50 -420 -48 -436 M 36 -418 Q 50 -420 48 -436" stroke={c} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      );
    case "stubble":
      return <path d="M -44 -420 Q 0 -358 44 -420 Q 30 -390 0 -386 Q -30 -390 -44 -420 Z" fill="#2A1C1644" />;
    case "beard":
      return <path d="M -52 -430 Q -48 -360 0 -360 Q 48 -360 52 -430 Q 30 -396 0 -396 Q -30 -396 -52 -430 Z" fill={c} stroke={OUTLINE} strokeWidth={3.5} />;
    case "goatee":
      return <path d="M -15 -396 Q 0 -352 15 -396 Q 0 -384 -15 -396 Z" fill={c} stroke={OUTLINE} strokeWidth={3} />;
    case "longBeard":
      return <path d="M -52 -430 Q -60 -330 0 -290 Q 60 -330 52 -430 Q 30 -394 0 -394 Q -30 -394 -52 -430 Z" fill={c} stroke={OUTLINE} strokeWidth={3.5} />;
    case "sideburns":
      return (
        <g>
          <path d="M -54 -470 L -46 -470 L -44 -420 L -52 -416 Z M 54 -470 L 46 -470 L 44 -420 L 52 -416 Z" fill={c} stroke={OUTLINE} strokeWidth={3} />
        </g>
      );
    default:
      return null;
  }
};

export const NoseArt: React.FC<{ L: FullLook }> = ({ L }) => {
  switch (L.nose) {
    case "big": return <path d="M -3 -444 Q 18 -424 4 -418 Q -8 -414 -12 -422" stroke={OUTLINE} strokeWidth={4.5} fill={L.skin} strokeLinecap="round" />;
    case "pointy": return <path d="M 0 -446 L 11 -420 L -2 -419" stroke={OUTLINE} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    case "round": return <circle cx={2} cy={-426} r={9} fill={L.skin} stroke={OUTLINE} strokeWidth={4} />;
    default: return <path d="M -2 -440 Q 9 -424 -5 -420" stroke={OUTLINE} strokeWidth={4} fill="none" strokeLinecap="round" />;
  }
};

// ------------------------------------------------------------------------------------------------ TORSO
export const SLEEVE: Record<FullLook["top"], number> = { kurta: 0.9, shirt: 0.9, vest: 0, blouse: 0.3, coat: 0.9, uniform: 0.9, tshirt: 0.55, suit: 0.95, labcoat: 0.95, robe: 0, hoodie: 0.95, sherwani: 0.95 };
export const torsoBottomOf = (t: FullLook["top"]) => ({ kurta: -118, coat: -106, labcoat: -88, sherwani: -96 } as Record<string, number>)[t] ?? -190;
export const bellyOf = (b: FullLook["build"]) => (b === "slim" ? 50 : b === "stout" ? 78 : 60);

export const Torso: React.FC<{ L: FullLook }> = ({ L }) => {
  const bellyW = bellyOf(L.build);
  const tb = torsoBottomOf(L.top);
  const shoulders = "M -64 -330 Q -64 -352 -44 -354 L 44 -354 Q 64 -352 64 -330";
  const mid = (-330 + tb) / 2 + 30;
  const body = `${shoulders} L ${bellyW} ${mid} Q ${bellyW + 4} ${tb + 10} ${bellyW - 6} ${tb} L ${-bellyW + 6} ${tb} Q ${-bellyW - 4} ${tb + 10} ${-bellyW} ${mid} Z`;
  if (L.top === "blouse") {
    return (
      <g>
        <path d="M -58 -300 L 58 -300 L 56 -200 L -56 -200 Z" fill={L.skin} {...S} />
        <path d={`${shoulders} L 62 -292 L -62 -292 Z`} fill={L.topColor} {...S} />
        <path d="M -66 -352 L -22 -354 L 62 -214 L 56 -190 L 14 -190 L -66 -300 Z" fill={L.bottom === "saree" ? L.bottomColor : L.trim} {...S} />
        <path d="M -22 -354 L 62 -214" stroke={L.trim} strokeWidth={9} />
        <path d="M -66 -300 L 14 -190" stroke={L.trim} strokeWidth={9} />
      </g>
    );
  }
  if (L.top === "robe") {
    return (
      <g>
        <path d={body} fill={L.skin} {...S} />
        <path d="M -64 -340 L -20 -354 L 64 -230 L 62 -190 L 6 -190 L -64 -290 Z" fill={L.topColor} {...S} />
        <path d="M -20 -354 L 64 -230" stroke={L.trim} strokeWidth={8} />
        <path d="M 40 -354 Q 64 -352 64 -330 L 64 -300 L 38 -330 Z" fill={L.topColor} {...T(4)} />
      </g>
    );
  }
  return (
    <g>
      <path d={body} fill={L.topColor} {...S} />
      {L.top === "vest" ? <path d="M -30 -354 Q 0 -300 30 -354 Z" fill={L.skin} stroke={OUTLINE} strokeWidth={4} /> : null}
      {L.top === "kurta" ? (
        <g>
          <path d="M -16 -354 L 0 -320 L 16 -354" fill="none" stroke={L.trim} strokeWidth={6} />
          <path d="M 0 -320 L 0 -250" stroke={L.trim} strokeWidth={6} />
          {[-305, -285, -265].map((y) => <circle key={y} cx={0} cy={y} r={3.5} fill={L.trim} />)}
          <path d={`M ${-bellyW + 10} ${tb + 2} L ${bellyW - 10} ${tb + 2}`} stroke={L.trim} strokeWidth={7} />
        </g>
      ) : null}
      {L.top === "sherwani" ? (
        <g>
          <path d="M -22 -356 L -22 -340 L 22 -340 L 22 -356" fill={L.trim} {...T(4)} />
          <path d="M 0 -340 L 0 -100" stroke={L.trim} strokeWidth={5} />
          {[-320, -290, -260, -230, -200, -170, -140].map((y) => <circle key={y} cx={0} cy={y} r={5} fill="#E6C04A" stroke={OUTLINE} strokeWidth={2} />)}
          <path d={`M ${-bellyW + 8} ${tb + 2} L ${bellyW - 8} ${tb + 2}`} stroke={L.trim} strokeWidth={8} />
        </g>
      ) : null}
      {L.top === "shirt" || L.top === "uniform" ? (
        <g>
          <path d="M -26 -354 L 0 -326 L 26 -354 L 14 -360 L 0 -340 L -14 -360 Z" fill={L.trim} stroke={OUTLINE} strokeWidth={4} />
          <path d="M 0 -326 L 0 -196" stroke="#0003" strokeWidth={4} />
          {[-300, -270, -240, -210].map((y) => <circle key={y} cx={0} cy={y} r={3.5} fill={L.trim} stroke={OUTLINE} strokeWidth={1.5} />)}
          <rect x={-bellyW - 2} y={-208} width={bellyW * 2 + 4} height={16} fill={L.top === "uniform" ? L.trim : "#3A2A20"} stroke={OUTLINE} strokeWidth={3.5} />
          <rect x={-8} y={-210} width={16} height={20} rx={3} fill="#D9A441" stroke={OUTLINE} strokeWidth={3} />
          {L.top === "uniform" ? (
            <g>
              <rect x={-50} y={-310} width={34} height={30} rx={4} fill={L.trim} stroke={OUTLINE} strokeWidth={3} />
              <rect x={16} y={-310} width={34} height={30} rx={4} fill={L.trim} stroke={OUTLINE} strokeWidth={3} />
            </g>
          ) : null}
        </g>
      ) : null}
      {L.top === "tshirt" ? (
        <g>
          <path d="M -22 -354 Q 0 -332 22 -354" fill="none" stroke={OUTLINE} strokeWidth={4} />
          <path d="M 0 -296 l 9 18 20 3 -14 14 3 20 -18 -9 -18 9 3 -20 -14 -14 20 -3 Z" fill={L.trim} stroke={OUTLINE} strokeWidth={3} />
        </g>
      ) : null}
      {L.top === "hoodie" ? (
        <g>
          <path d="M -44 -354 Q -50 -330 0 -318 Q 50 -330 44 -354 Q 0 -340 -44 -354 Z" fill={L.trim} {...T(4)} />
          <path d="M -14 -330 L -12 -290 M 14 -330 L 12 -290" stroke="#fff" strokeWidth={4} />
          <path d="M -44 -250 L 44 -250 L 54 -208 L -54 -208 Z" fill={L.trim} opacity={0.7} {...T(4)} />
        </g>
      ) : null}
      {L.top === "coat" ? (
        <g>
          <path d="M -30 -354 L -6 -250 L -18 -150 M 30 -354 L 6 -250 L 18 -150" fill="none" stroke={L.trim} strokeWidth={8} />
          <path d="M -30 -354 L 0 -300 L 30 -354" fill="#E8E2D0" stroke={OUTLINE} strokeWidth={4} />
          <path d="M -6 -310 L 0 -300 L 6 -310 L 4 -250 L 0 -240 L -4 -250 Z" fill="#7A2E2E" stroke={OUTLINE} strokeWidth={2.5} />
          <rect x={-62} y={-205} width={124} height={15} fill={L.trim} stroke={OUTLINE} strokeWidth={3.5} />
          {[-280, -240, -170].map((y) => <circle key={y} cx={-12} cy={y} r={4} fill="#3B2A1C" />)}
        </g>
      ) : null}
      {L.top === "suit" ? (
        <g>
          <path d="M -30 -354 L 0 -296 L 30 -354 L 18 -354 L 0 -330 L -18 -354 Z" fill="#F4F4F0" stroke={OUTLINE} strokeWidth={4} />
          <path d="M -30 -354 L -8 -250 L -26 -226 L -48 -330 Z M 30 -354 L 8 -250 L 26 -226 L 48 -330 Z" fill={L.trim} stroke={OUTLINE} strokeWidth={4} />
          <path d="M 0 -296 L 0 -196" stroke="#0004" strokeWidth={4} />
          {[-244, -214].map((y) => <circle key={y} cx={-8} cy={y} r={4} fill="#111" />)}
          <path d={`M ${-bellyW + 6} ${tb + 2} L ${bellyW - 6} ${tb + 2}`} stroke="#0004" strokeWidth={5} />
        </g>
      ) : null}
      {L.top === "labcoat" ? (
        <g>
          <path d="M -26 -354 L 0 -300 L 26 -354 Z" fill={L.trim} stroke={OUTLINE} strokeWidth={4} />
          <path d="M -30 -354 L -6 -250 L -10 -92 M 30 -354 L 6 -250 L 10 -92" fill="none" stroke="#0003" strokeWidth={5} />
          <rect x={24} y={-280} width={30} height={34} rx={4} fill="none" stroke="#0003" strokeWidth={4} />
          <path d="M 32 -280 l 0 -14 M 40 -280 l 0 -10" stroke="#2E7DD1" strokeWidth={4} />
        </g>
      ) : null}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ ACCESSORIES
/** Drawn on the torso/neck area (above the body, under the head). */
export const BodyAccessories: React.FC<{ L: FullLook }> = ({ L }) => {
  const has = (a: FullLook["accessories"][number]) => L.accessories.includes(a);
  return (
    <g>
      {has("dupatta") ? <path d="M -66 -346 Q 0 -300 66 -346 L 70 -330 Q 0 -280 -70 -330 Z" fill={L.trim} stroke={OUTLINE} strokeWidth={4} /> : null}
      {has("gamcha") ? (
        <g>
          <path d="M -60 -356 L -30 -356 L -40 -250 L -66 -258 Z" fill="#E2483D" stroke={OUTLINE} strokeWidth={4} />
          <path d="M -54 -340 L -36 -338 M -58 -310 L -40 -306 M -62 -280 L -44 -276" stroke="#fff" strokeWidth={4} />
        </g>
      ) : null}
      {has("scarf") ? (
        <g>
          <path d="M -40 -362 Q 0 -332 40 -362 L 44 -340 Q 0 -310 -44 -340 Z" fill={L.accent} {...T(4)} />
          <path d="M 24 -336 L 40 -270 L 18 -278 L 10 -326 Z" fill={L.accent} {...T(4)} />
        </g>
      ) : null}
      {has("goldChain") ? <path d="M -30 -350 Q 0 -290 30 -350" stroke="#F2C14E" strokeWidth={6} fill="none" /> : null}
      {has("rudraksha") ? (
        <g>{Array.from({ length: 9 }, (_, i) => { const x = -30 + i * 7.5; return <circle key={i} cx={x} cy={-350 + 52 * Math.sin((i / 8) * Math.PI)} r={5.5} fill="#7A4A1E" stroke={OUTLINE} strokeWidth={2} />; })}</g>
      ) : null}
      {has("tie") ? (
        <g>
          <path d="M -8 -350 L 8 -350 L 6 -338 L -6 -338 Z" fill={L.accent} {...T(3)} />
          <path d="M -6 -338 L 6 -338 L 14 -278 L 0 -258 L -14 -278 Z" fill={L.accent} {...T(3.5)} />
        </g>
      ) : null}
      {has("stethoscope") ? (
        <g>
          <path d="M -34 -356 Q -40 -276 0 -270 Q 40 -276 34 -356" stroke="#2A2A2A" strokeWidth={7} fill="none" strokeLinecap="round" />
          <circle cx={0} cy={-262} r={13} fill="#C9CED6" stroke={OUTLINE} strokeWidth={4} />
          <circle cx={0} cy={-262} r={5} fill={L.accent} />
        </g>
      ) : null}
      {has("camera") ? (
        <g>
          <path d="M -34 -356 L -22 -270 M 34 -356 L 22 -270" stroke="#222" strokeWidth={5} />
          <rect x={-34} y={-278} width={68} height={46} rx={8} fill="#2E2E34" stroke={OUTLINE} strokeWidth={4} />
          <circle cx={0} cy={-255} r={15} fill="#9CC8E8" stroke={OUTLINE} strokeWidth={4} />
          <circle cx={-4} cy={-259} r={4} fill="#fff" />
          <rect x={14} y={-290} width={16} height={10} rx={3} fill="#2E2E34" stroke={OUTLINE} strokeWidth={3} />
        </g>
      ) : null}
      {has("apron") ? (
        <g>
          <path d="M -44 -300 L 44 -300 L 60 -150 L -60 -150 Z" fill={L.accent} opacity={0.96} {...T(4)} />
          <path d="M -44 -300 L -30 -354 M 44 -300 L 30 -354" stroke={OUTLINE} strokeWidth={4} />
          <rect x={-22} y={-250} width={44} height={34} rx={4} fill="none" stroke="#0003" strokeWidth={4} />
        </g>
      ) : null}
      {has("badge") ? <path d="M 34 -300 l 6 12 13 2 -9 9 2 13 -12 -6 -12 6 2 -13 -9 -9 13 -2 Z" fill="#E6C04A" stroke={OUTLINE} strokeWidth={2.5} /> : null}
      {has("medals") ? (
        <g>
          {[0, 1, 2, 3].map((i) => <g key={i}><rect x={20 + i * 11} y={-318} width={9} height={14} fill={["#D32F2F", "#1976D2", "#388E3C", "#F9A825"][i]} stroke={OUTLINE} strokeWidth={1.5} /></g>)}
          <path d="M -50 -330 l 5 10 11 1 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -1 Z" fill="#E6C04A" stroke={OUTLINE} strokeWidth={2} />
        </g>
      ) : null}
    </g>
  );
};

/** Straps/bag drawn BEHIND the torso. */
export const BackpackBehind: React.FC<{ L: FullLook }> = ({ L }) =>
  L.accessories.includes("backpack") ? <rect x={-84} y={-350} width={168} height={150} rx={26} fill={L.accent} {...S} /> : null;
export const BackpackStraps: React.FC<{ L: FullLook }> = ({ L }) =>
  L.accessories.includes("backpack") ? (
    <g stroke={OUTLINE} strokeWidth={4} fill={L.accent}>
      <path d="M -50 -354 L -30 -354 L -24 -230 L -46 -230 Z" />
      <path d="M 50 -354 L 30 -354 L 24 -230 L 46 -230 Z" />
    </g>
  ) : null;

/** Face-level accessories: drawn on the head, above the eyes. */
export const FaceAccessories: React.FC<{ L: FullLook }> = ({ L }) => {
  const has = (a: FullLook["accessories"][number]) => L.accessories.includes(a);
  return (
    <g>
      {has("glasses") ? (
        <g fill="none" stroke="#3A2A1A" strokeWidth={4}>
          <circle cx={-21} cy={-446} r={16} />
          <circle cx={21} cy={-446} r={16} />
          <path d="M -5 -448 Q 0 -452 5 -448 M -37 -448 L -54 -454 M 37 -448 L 54 -454" />
        </g>
      ) : null}
      {has("sunglasses") ? (
        <g>
          <rect x={-40} y={-460} width={34} height={22} rx={9} fill="#14141A" stroke={OUTLINE} strokeWidth={3} />
          <rect x={6} y={-460} width={34} height={22} rx={9} fill="#14141A" stroke={OUTLINE} strokeWidth={3} />
          <path d="M -6 -452 L 6 -452 M -40 -454 L -54 -458 M 40 -454 L 54 -458" stroke={OUTLINE} strokeWidth={4} />
          <path d="M -36 -456 L -28 -456 M 10 -456 L 18 -456" stroke="#fff8" strokeWidth={3} strokeLinecap="round" />
        </g>
      ) : null}
      {has("bandit") ? (
        <g>
          <path d="M -58 -462 Q 0 -474 58 -462 L 56 -434 Q 0 -444 -56 -434 Z" fill="#15151B" stroke={OUTLINE} strokeWidth={3.5} />
          <ellipse cx={-21} cy={-448} rx={11} ry={8} fill="#F4F0E6" />
          <ellipse cx={21} cy={-448} rx={11} ry={8} fill="#F4F0E6" />
        </g>
      ) : null}
      {has("bindi") ? <circle cx={0} cy={-472} r={5} fill="#D81B3A" /> : null}
      {has("tilak") ? (
        <g>
          <path d="M -6 -470 L -4 -492 M 6 -470 L 4 -492" stroke="#F2F2F2" strokeWidth={3.5} />
          <path d="M 0 -468 L 0 -490" stroke="#D81B3A" strokeWidth={4} />
        </g>
      ) : null}
      {has("tripund") ? (
        <g stroke="#EDEDED" strokeWidth={3.5} strokeLinecap="round">
          <path d="M -16 -488 L 16 -488 M -16 -496 L 16 -496 M -16 -504 L 16 -504" />
          <circle cx={0} cy={-476} r={4} fill="#D81B3A" stroke="none" />
        </g>
      ) : null}
      {has("scar") ? <path d="M 28 -452 L 46 -416 M 32 -440 l 8 -3 M 38 -428 l 8 -3" stroke="#7A2E2E" strokeWidth={3.5} fill="none" strokeLinecap="round" /> : null}
      {has("mole") ? <circle cx={-30} cy={-414} r={3.5} fill="#2A1C16" /> : null}
      {has("bandage") ? (
        <g transform="rotate(-24 34 -420)">
          <rect x={18} y={-428} width={32} height={14} rx={4} fill="#F2D7B0" stroke={OUTLINE} strokeWidth={2.5} />
          <rect x={30} y={-428} width={8} height={14} fill="#E6BE8A" />
        </g>
      ) : null}
      {has("earrings") ? [-1, 1].map((s) => <circle key={s} cx={s * 56} cy={-422} r={6} fill="#F2C14E" stroke={OUTLINE} strokeWidth={2} />) : null}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ PROPS
/** Held item, drawn with the hand at (0,0). Hanging items hang down, long items stand on the floor. */
export const PropArt: React.FC<{ prop: Prop; accent: string }> = ({ prop, accent }) => {
  switch (prop) {
    case "magnifier":
      return (
        <g transform="rotate(-30)">
          <rect x={-6} y={-6} width={12} height={46} rx={5} fill="#5A3A22" stroke={OUTLINE} strokeWidth={3.5} />
          <circle cx={0} cy={-34} r={28} fill="#BFE6FF" fillOpacity={0.55} stroke="#D9A441" strokeWidth={8} />
          <circle cx={0} cy={-34} r={28} fill="none" stroke={OUTLINE} strokeWidth={2.5} />
          <path d="M -12 -46 Q -6 -52 2 -50" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      );
    case "briefcase":
      return (
        <g>
          <path d="M -14 8 Q 0 -10 14 8" stroke={OUTLINE} strokeWidth={5} fill="none" />
          <rect x={-42} y={8} width={84} height={58} rx={8} fill="#6B4423" stroke={OUTLINE} strokeWidth={4.5} />
          <rect x={-8} y={26} width={16} height={10} rx={2} fill="#E6C04A" stroke={OUTLINE} strokeWidth={2.5} />
        </g>
      );
    case "clipboard":
      return (
        <g transform="translate(14 -36) rotate(8)">
          <rect x={-30} y={-42} width={60} height={84} rx={6} fill="#B9864F" stroke={OUTLINE} strokeWidth={4} />
          <rect x={-22} y={-34} width={44} height={68} fill="#FFFDF5" stroke={OUTLINE} strokeWidth={2.5} />
          <rect x={-12} y={-48} width={24} height={12} rx={3} fill="#9AA3AD" stroke={OUTLINE} strokeWidth={3} />
          <path d="M -14 -16 L 14 -16 M -14 -4 L 14 -4 M -14 8 L 8 8 M -14 20 L 14 20" stroke="#0006" strokeWidth={3} />
        </g>
      );
    case "baton":
      return (
        <g>
          <rect x={-6} y={-150} width={12} height={330} rx={6} fill="#7A4A22" stroke={OUTLINE} strokeWidth={4} />
          <rect x={-6} y={-150} width={12} height={22} rx={6} fill="#C9A26A" stroke={OUTLINE} strokeWidth={3} />
        </g>
      );
    case "cane":
      return (
        <g>
          <path d="M 0 170 L 0 -22 Q 0 -44 -20 -42 Q -34 -40 -30 -26" stroke={OUTLINE} strokeWidth={13} fill="none" strokeLinecap="round" />
          <path d="M 0 170 L 0 -22 Q 0 -44 -20 -42 Q -34 -40 -30 -26" stroke="#8A5A2B" strokeWidth={7} fill="none" strokeLinecap="round" />
        </g>
      );
    case "ledger":
      return (
        <g transform="translate(18 -30) rotate(-12)">
          <rect x={-30} y={-24} width={60} height={48} rx={4} fill="#B3261E" stroke={OUTLINE} strokeWidth={4} />
          <rect x={-26} y={-20} width={52} height={40} fill="none" stroke="#F4D58D" strokeWidth={3} />
          <path d="M -14 -6 L 14 -6 M -14 6 L 8 6" stroke="#F4D58D" strokeWidth={3} />
        </g>
      );
    case "milkCan":
      return (
        <g>
          <path d="M -16 6 Q 0 -14 16 6" stroke={OUTLINE} strokeWidth={5} fill="none" />
          <path d="M -26 10 L 26 10 L 30 70 L -30 70 Z" fill="#C9CED6" stroke={OUTLINE} strokeWidth={4.5} />
          <rect x={-18} y={4} width={36} height={8} rx={3} fill="#9AA3AD" stroke={OUTLINE} strokeWidth={3} />
          <path d="M -26 36 L 28 36" stroke="#0003" strokeWidth={3} />
        </g>
      );
    case "mic":
      return (
        <g transform="rotate(-20)">
          <rect x={-6} y={-60} width={12} height={64} rx={5} fill="#2E2E34" stroke={OUTLINE} strokeWidth={3.5} />
          <circle cx={0} cy={-72} r={16} fill="#B7BDC6" stroke={OUTLINE} strokeWidth={4} />
          <path d="M -10 -76 L 10 -76 M -10 -68 L 10 -68" stroke="#0004" strokeWidth={3} />
        </g>
      );
    case "wateringCan":
      return (
        <g>
          <path d="M -12 6 Q 0 -14 12 6" stroke={OUTLINE} strokeWidth={5} fill="none" />
          <path d="M -26 12 L 26 12 L 24 62 L -24 62 Z" fill="#4E9A62" stroke={OUTLINE} strokeWidth={4.5} />
          <path d="M 26 30 L 62 4 L 66 12 L 26 48 Z" fill="#4E9A62" stroke={OUTLINE} strokeWidth={4} />
          <path d="M 62 2 l 10 -6 M 66 12 l 10 -2" stroke={OUTLINE} strokeWidth={3} />
        </g>
      );
    case "broom":
      return (
        <g>
          <rect x={-5} y={-130} width={10} height={250} rx={5} fill="#A9783C" stroke={OUTLINE} strokeWidth={4} />
          <path d="M -26 120 L 26 120 L 38 172 L -38 172 Z" fill="#D9B45A" stroke={OUTLINE} strokeWidth={4} />
          <path d="M -14 128 L -18 170 M 0 128 L 0 170 M 14 128 L 18 170" stroke="#0004" strokeWidth={3} />
        </g>
      );
    case "ladle":
      return (
        <g transform="rotate(14)">
          <rect x={-4} y={-110} width={8} height={120} rx={4} fill="#9AA3AD" stroke={OUTLINE} strokeWidth={3.5} />
          <path d="M -22 -112 Q 0 -140 22 -112 Q 0 -90 -22 -112 Z" fill="#B7BDC6" stroke={OUTLINE} strokeWidth={4} />
        </g>
      );
    case "bag":
      return (
        <g>
          <path d="M -14 8 Q 0 -12 14 8" stroke={OUTLINE} strokeWidth={5} fill="none" />
          <path d="M -32 10 L 32 10 L 40 78 L -40 78 Z" fill={accent} stroke={OUTLINE} strokeWidth={4.5} />
          <rect x={-18} y={30} width={36} height={22} rx={4} fill="#F4F0E6" opacity={0.85} stroke={OUTLINE} strokeWidth={2.5} />
        </g>
      );
    case "phone":
      return (
        <g transform="translate(6 -26) rotate(12)">
          <rect x={-14} y={-26} width={28} height={52} rx={6} fill="#1E2A3A" stroke={OUTLINE} strokeWidth={3.5} />
          <rect x={-10} y={-20} width={20} height={36} rx={2} fill="#6FB6FF" />
        </g>
      );
    default:
      return null;
  }
};

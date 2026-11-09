import React from "react";
import type { CharacterAction, CharacterDefinition, CharacterExpression } from "./types";
import { getCharacterById } from "./cast";

export interface CharacterRigProps {
  character: CharacterDefinition | string;
  action?: CharacterAction;
  expression?: CharacterExpression;
  frame?: number;
  talk?: number; // 0 to 1 lip-sync loudness
  scale?: number;
  flip?: boolean;
  style?: React.CSSProperties;
}

const OUTLINE = "#2B1810";
const OUTLINE_W = 6;

export const CharacterRig: React.FC<CharacterRigProps> = ({
  character,
  action = "idle",
  expression = "neutral",
  frame = 0,
  talk = 0,
  scale = 1,
  flip = false,
  style,
}) => {
  const def = typeof character === "string" ? getCharacterById(character) : character;
  const { skin, hair, hairStyle, facialHair, outfitColor, outfitSecondary = outfitColor, outfitStyle, accessory } = def.look;

  // Determine effective expression based on action if default neutral
  let effExp: CharacterExpression = expression;
  if (expression === "neutral") {
    if (action === "smiling") effExp = "smiling";
    else if (action === "laughing") effExp = "laughing";
    else if (action === "thinking") effExp = "thinking";
    else if (action === "surprised") effExp = "surprised";
    else if (action === "afraid") effExp = "afraid";
    else if (action === "nervous") effExp = "nervous";
    else if (action === "stressed") effExp = "stressed";
    else if (action === "angry") effExp = "angry";
    else if (action === "crying") effExp = "crying";
    else if (action === "confused") effExp = "confused";
    else if (action === "suspicious") effExp = "suspicious";
    else if (action === "celebrating") effExp = "happy";
  }

  // Blinking logic (blink every ~100 frames for 4 frames)
  const isBlinking = frame % 105 < 4;

  // Walk / Run cycle math
  const walkSpeed = action === "running" ? 0.35 : 0.18;
  const isMoving = action === "walking" || action === "running" || action === "sneaking";
  const cycle = isMoving ? Math.sin(frame * walkSpeed) : 0;
  const legAngleLeft = cycle * (action === "running" ? 36 : 22);
  const legAngleRight = -cycle * (action === "running" ? 36 : 22);

  // Subtle breathing / idle bob
  const idleBob = Math.sin(frame / 16) * 3;
  const bodyBob = isMoving ? Math.abs(Math.sin(frame * walkSpeed)) * (action === "running" ? 14 : 7) : idleBob;

  // Arm positions based on 20 actions
  let leftArmTransform = "rotate(0, -65, -30)";
  let rightArmTransform = "rotate(0, 65, -30)";

  switch (action) {
    case "pointing":
      rightArmTransform = "rotate(-75, 65, -30)";
      leftArmTransform = "rotate(15, -65, -30)";
      break;
    case "thinking":
      rightArmTransform = "rotate(-125, 65, -30) translate(20, -10)";
      leftArmTransform = "rotate(20, -65, -30)";
      break;
    case "talking":
      rightArmTransform = `rotate(${-35 + Math.sin(frame / 8) * 18}, 65, -30)`;
      leftArmTransform = `rotate(${20 + Math.cos(frame / 8) * 12}, -65, -30)`;
      break;
    case "celebrating":
      leftArmTransform = "rotate(-135, -65, -30)";
      rightArmTransform = "rotate(135, 65, -30)";
      break;
    case "surprised":
    case "afraid":
      leftArmTransform = "rotate(-85, -65, -30)";
      rightArmTransform = "rotate(85, 65, -30)";
      break;
    case "nervous":
    case "stressed":
      leftArmTransform = "rotate(40, -65, -30)";
      rightArmTransform = "rotate(-40, 65, -30)";
      break;
    case "angry":
      leftArmTransform = "rotate(35, -65, -30)";
      rightArmTransform = "rotate(-35, 65, -30)";
      break;
    case "sneaking":
      leftArmTransform = "rotate(45, -65, -30)";
      rightArmTransform = "rotate(-25, 65, -30)";
      break;
    case "walking":
    case "running":
      leftArmTransform = `rotate(${-cycle * 30}, -65, -30)`;
      rightArmTransform = `rotate(${cycle * 30}, 65, -30)`;
      break;
    default:
      leftArmTransform = `rotate(${Math.sin(frame / 20) * 4}, -65, -30)`;
      rightArmTransform = `rotate(${-Math.sin(frame / 20) * 4}, 65, -30)`;
      break;
  }

  // Head tilt for looking left / right or suspicious
  let headTransform = "";
  if (action === "looking-left") headTransform = "rotate(-8, 0, -160) translate(-8, 0)";
  else if (action === "looking-right") headTransform = "rotate(8, 0, -160) translate(8, 0)";
  else if (action === "suspicious") headTransform = "rotate(5, 0, -160) translate(4, -2)";
  else if (action === "confused") headTransform = "rotate(-6, 0, -160)";

  // Mouth rendering based on expression + talk amplitude
  const mouthOpen = talk > 0 ? 8 + talk * 26 : (effExp === "laughing" || effExp === "surprised" ? 22 : 6);

  const renderMouth = () => {
    if (talk > 0.1 || effExp === "laughing" || effExp === "surprised" || effExp === "shocked") {
      return (
        <g>
          <ellipse cx="0" cy="-115" rx={effExp === "surprised" ? 14 : 20} ry={mouthOpen / 2} fill="#5C1818" stroke={OUTLINE} strokeWidth={OUTLINE_W - 2} />
          {talk > 0.4 ? <path d="M -12 -120 Q 0 -114 12 -120" stroke="#FFFFFF" strokeWidth={5} fill="none" /> : null}
        </g>
      );
    }
    if (effExp === "smiling" || effExp === "happy") {
      return <path d="M -16 -120 Q 0 -106 16 -120" fill="none" stroke={OUTLINE} strokeWidth={OUTLINE_W} strokeLinecap="round" />;
    }
    if (effExp === "angry" || effExp === "sad" || effExp === "crying") {
      return <path d="M -16 -112 Q 0 -124 16 -112" fill="none" stroke={OUTLINE} strokeWidth={OUTLINE_W} strokeLinecap="round" />;
    }
    if (effExp === "evil-smile") {
      return <path d="M -18 -118 Q 0 -104 18 -124" fill="none" stroke={OUTLINE} strokeWidth={OUTLINE_W} strokeLinecap="round" />;
    }
    // Neutral
    return <line x1="-12" y1="-116" x2="12" y2="-116" stroke={OUTLINE} strokeWidth={OUTLINE_W} strokeLinecap="round" />;
  };

  // Eyes rendering based on expression
  const renderEyes = () => {
    if (isBlinking || effExp === "crying") {
      return (
        <g stroke={OUTLINE} strokeWidth={OUTLINE_W} strokeLinecap="round">
          <line x1="-38" y1="-155" x2="-14" y2="-155" />
          <line x1="14" y1="-155" x2="38" y2="-155" />
          {effExp === "crying" ? (
            <g fill="#4CC9F0" opacity={0.8}>
              <ellipse cx="-26" cy="-140" rx="4" ry="10" />
              <ellipse cx="26" cy="-140" rx="4" ry="10" />
            </g>
          ) : null}
        </g>
      );
    }

    const pupilX = action === "looking-left" ? -4 : action === "looking-right" ? 4 : 0;
    const eyeH = effExp === "shocked" || effExp === "surprised" ? 18 : 12;

    return (
      <g>
        {/* Eye whites */}
        <ellipse cx="-26" cy="-155" rx="14" ry={eyeH} fill="#FFFFFF" stroke={OUTLINE} strokeWidth={OUTLINE_W - 2} />
        <ellipse cx="26" cy="-155" rx="14" ry={eyeH} fill="#FFFFFF" stroke={OUTLINE} strokeWidth={OUTLINE_W - 2} />
        {/* Pupils */}
        <circle cx={-26 + pupilX} cy="-155" r={effExp === "shocked" ? 4 : 6} fill="#1A1210" />
        <circle cx={26 + pupilX} cy="-155" r={effExp === "shocked" ? 4 : 6} fill="#1A1210" />
        {/* Highlights */}
        <circle cx={-24 + pupilX} cy="-157" r="2" fill="#FFFFFF" />
        <circle cx={28 + pupilX} cy="-157" r="2" fill="#FFFFFF" />
      </g>
    );
  };

  // Eyebrows
  const renderEyebrows = () => {
    let leftD = "M -40 -174 Q -26 -180 -12 -174";
    let rightD = "M 12 -174 Q 26 -180 40 -174";

    if (effExp === "angry") {
      leftD = "M -40 -180 L -12 -168";
      rightD = "M 12 -168 L 40 -180";
    } else if (effExp === "afraid" || effExp === "sad" || effExp === "stressed") {
      leftD = "M -40 -168 L -12 -180";
      rightD = "M 12 -180 L 40 -168";
    } else if (effExp === "surprised" || effExp === "shocked") {
      leftD = "M -40 -184 Q -26 -192 -12 -184";
      rightD = "M 12 -184 Q 26 -192 40 -184";
    }

    return (
      <g stroke={hairStyle === "bun" && hair === "#FFFFFF" ? "#888888" : OUTLINE} strokeWidth={OUTLINE_W + 1} strokeLinecap="round" fill="none">
        <path d={leftD} />
        <path d={rightD} />
      </g>
    );
  };

  return (
    <svg
      width={300 * scale}
      height={700 * scale}
      viewBox="-150 -350 300 700"
      style={{
        transform: flip ? "scaleX(-1)" : undefined,
        overflow: "visible",
        ...style,
      }}
    >
      <defs>
        <radialGradient id={`shadow-${def.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.35)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* Ground Contact Shadow */}
      <ellipse cx="0" cy="330" rx="90" ry="16" fill={`url(#shadow-${def.id})`} />

      {/* Animated Body Container */}
      <g transform={`translate(0, ${-bodyBob})`}>
        {/* LEGS & SHOES */}
        {/* Left Leg */}
        <g transform={`rotate(${legAngleLeft}, -30, 110)`}>
          <rect x="-44" y="110" width="28" height="180" rx="12" fill={outfitSecondary} stroke={OUTLINE} strokeWidth={OUTLINE_W} />
          {/* Shoe */}
          <ellipse cx="-34" cy="295" rx="22" ry="14" fill="#201A16" stroke={OUTLINE} strokeWidth={OUTLINE_W} />
        </g>
        {/* Right Leg */}
        <g transform={`rotate(${legAngleRight}, 30, 110)`}>
          <rect x="16" y="110" width="28" height="180" rx="12" fill={outfitSecondary} stroke={OUTLINE} strokeWidth={OUTLINE_W} />
          {/* Shoe */}
          <ellipse cx="26" cy="295" rx="22" ry="14" fill="#201A16" stroke={OUTLINE} strokeWidth={OUTLINE_W} />
        </g>

        {/* TORSO & OUTFIT */}
        <g id="torso">
          {/* Torso Base */}
          <path
            d="M -60 -20 Q -70 50 -60 120 L 60 120 Q 70 50 60 -20 Q 0 -35 -60 -20 Z"
            fill={outfitColor}
            stroke={OUTLINE}
            strokeWidth={OUTLINE_W}
            strokeLinejoin="round"
          />

          {/* Collar / Lapel / Saree / Kurta details */}
          {outfitStyle === "coat" || outfitStyle === "suit" ? (
            <g stroke={OUTLINE} strokeWidth={OUTLINE_W} fill={outfitSecondary}>
              <path d="M -60 -20 L -18 50 L -35 55 L -60 20 Z" />
              <path d="M 60 -20 L 18 50 L 35 55 L 60 20 Z" />
              <line x1="0" y1="50" x2="0" y2="120" />
              <circle cx="0" cy="70" r="4" fill="#EAE2B7" />
              <circle cx="0" cy="95" r="4" fill="#EAE2B7" />
            </g>
          ) : null}

          {outfitStyle === "saree" ? (
            <path
              d="M -58 118 Q 0 40 58 -18"
              fill="none"
              stroke={outfitSecondary}
              strokeWidth={16}
              strokeLinecap="round"
            />
          ) : null}

          {outfitStyle === "kurta" || outfitStyle === "sherwani" ? (
            <g stroke={OUTLINE} strokeWidth={OUTLINE_W - 2}>
              <line x1="0" y1="-25" x2="0" y2="120" strokeLinecap="round" />
              <circle cx="0" cy="10" r="4" fill={outfitSecondary} />
              <circle cx="0" cy="40" r="4" fill={outfitSecondary} />
              <circle cx="0" cy="70" r="4" fill={outfitSecondary} />
            </g>
          ) : null}

          {outfitStyle === "uniform" ? (
            <g>
              <rect x="-45" y="-5" width="24" height="16" rx="3" fill="#D4AF37" stroke={OUTLINE} strokeWidth={OUTLINE_W - 3} />
              <line x1="0" y1="-25" x2="0" y2="120" stroke={OUTLINE} strokeWidth={OUTLINE_W - 2} />
            </g>
          ) : null}
        </g>

        {/* LEFT ARM */}
        <g transform={leftArmTransform}>
          <rect x="-82" y="-30" width="26" height="130" rx="13" fill={outfitColor} stroke={OUTLINE} strokeWidth={OUTLINE_W} />
          {/* Hand */}
          <circle cx="-69" cy="110" r="14" fill={skin} stroke={OUTLINE} strokeWidth={OUTLINE_W} />
        </g>

        {/* RIGHT ARM */}
        <g transform={rightArmTransform}>
          <rect x="56" y="-30" width="26" height="130" rx="13" fill={outfitColor} stroke={OUTLINE} strokeWidth={OUTLINE_W} />
          {/* Hand */}
          <circle cx="69" cy="110" r="14" fill={skin} stroke={OUTLINE} strokeWidth={OUTLINE_W} />
        </g>

        {/* HEAD & FACE */}
        <g id="head" transform={headTransform}>
          {/* Neck */}
          <rect x="-20" y="-70" width="40" height="50" fill={skin} stroke={OUTLINE} strokeWidth={OUTLINE_W} />

          {/* Long Hair Back */}
          {hairStyle === "long" ? (
            <path d="M -75 -180 Q -95 -50 -55 20 L 55 20 Q 95 -50 75 -180 Z" fill={hair} stroke={OUTLINE} strokeWidth={OUTLINE_W} />
          ) : null}

          {/* Head Base (Ellipse) */}
          <ellipse cx="0" cy="-150" rx="68" ry="82" fill={skin} stroke={OUTLINE} strokeWidth={OUTLINE_W} />

          {/* Ears */}
          <ellipse cx="-68" cy="-148" rx="12" ry="18" fill={skin} stroke={OUTLINE} strokeWidth={OUTLINE_W} />
          <ellipse cx="68" cy="-148" rx="12" ry="18" fill={skin} stroke={OUTLINE} strokeWidth={OUTLINE_W} />

          {/* Hair Base */}
          {hairStyle !== "bald" && hairStyle !== "turban" ? (
            <path
              d="M -70 -170 Q -74 -245 0 -248 Q 74 -245 70 -170 Q 50 -205 0 -205 Q -50 -205 -70 -170 Z"
              fill={hair}
              stroke={OUTLINE}
              strokeWidth={OUTLINE_W}
            />
          ) : null}

          {/* Bun */}
          {hairStyle === "bun" ? (
            <circle cx="0" cy="-250" r="34" fill={hair} stroke={OUTLINE} strokeWidth={OUTLINE_W} />
          ) : null}

          {/* Turban / Pagdi */}
          {hairStyle === "turban" ? (
            <g stroke={OUTLINE} strokeWidth={OUTLINE_W}>
              <ellipse cx="0" cy="-210" rx="76" ry="46" fill={outfitSecondary} />
              <path d="M -60 -190 Q 0 -255 60 -190" fill="none" stroke="#FFFFFF" strokeWidth={OUTLINE_W - 2} />
              <circle cx="0" cy="-240" r="14" fill="#D4AF37" />
            </g>
          ) : null}

          {/* Cap */}
          {hairStyle === "cap" || accessory === "police-cap" ? (
            <g stroke={OUTLINE} strokeWidth={OUTLINE_W}>
              <path d="M -70 -190 Q 0 -250 70 -190 Z" fill={accessory === "police-cap" ? "#8A2522" : outfitSecondary} />
              <ellipse cx="25" cy="-185" rx="65" ry="14" fill="#201A16" />
              {accessory === "police-cap" ? <circle cx="0" cy="-215" r="8" fill="#D4AF37" /> : null}
            </g>
          ) : null}

          {/* Detective Fedora Hat */}
          {accessory === "detective-hat" ? (
            <g stroke={OUTLINE} strokeWidth={OUTLINE_W}>
              <ellipse cx="0" cy="-205" rx="100" ry="24" fill="#5B4632" />
              <path d="M -60 -205 Q -55 -275 0 -278 Q 55 -275 60 -205 Z" fill="#6E553C" />
              <rect x="-60" y="-220" width="120" height="16" fill="#2E2318" stroke={OUTLINE} strokeWidth={OUTLINE_W - 2} />
            </g>
          ) : null}

          {/* Eyebrows */}
          {renderEyebrows()}

          {/* Eyes */}
          {renderEyes()}

          {/* Spectacles / Glasses */}
          {accessory === "specs" ? (
            <g fill="none" stroke="#1D1D1D" strokeWidth={OUTLINE_W - 1}>
              <circle cx="-26" cy="-155" r="20" />
              <circle cx="26" cy="-155" r="20" />
              <line x1="-6" y1="-155" x2="6" y2="-155" />
            </g>
          ) : null}

          {/* Nose */}
          <path d="M 0 -150 Q -6 -130 5 -128" fill="none" stroke={OUTLINE} strokeWidth={OUTLINE_W - 1} strokeLinecap="round" />

          {/* Tilak */}
          {accessory === "tilak" ? (
            <path d="M 0 -190 L -6 -165 L 0 -158 L 6 -165 Z" fill="#D62828" stroke={OUTLINE} strokeWidth={2} />
          ) : null}

          {/* Mustache / Beard */}
          {facialHair === "mustache" || facialHair === "full-beard" ? (
            <path
              d="M -30 -124 Q 0 -114 30 -124 Q 15 -132 0 -128 Q -15 -132 -30 -124 Z"
              fill={hairStyle === "bun" && hair === "#FFFFFF" ? "#666666" : OUTLINE}
            />
          ) : null}

          {facialHair === "full-beard" ? (
            <path
              d="M -45 -125 Q -55 -60 0 -55 Q 55 -60 45 -125 Z"
              fill={hairStyle === "bun" && hair === "#FFFFFF" ? "#CCCCCC" : hair}
              stroke={OUTLINE}
              strokeWidth={OUTLINE_W - 2}
            />
          ) : null}

          {facialHair === "goatee" ? (
            <ellipse cx="0" cy="-96" rx="10" ry="14" fill={hair} stroke={OUTLINE} strokeWidth={3} />
          ) : null}

          {/* Mouth */}
          {renderMouth()}

          {/* Gold Chain Accessory */}
          {accessory === "gold-chain" ? (
            <path d="M -32 -25 Q 0 15 32 -25" fill="none" stroke="#D4AF37" strokeWidth={OUTLINE_W} strokeLinecap="round" />
          ) : null}

          {/* Stethoscope Accessory */}
          {accessory === "stethoscope" ? (
            <g fill="none" stroke="#2B2D42" strokeWidth={6} strokeLinecap="round">
              <path d="M -28 -30 Q 0 45 28 -30" />
              <circle cx="0" cy="50" r="10" fill="#CBD5E1" stroke="#2B2D42" strokeWidth={4} />
            </g>
          ) : null}
        </g>
      </g>
    </svg>
  );
};

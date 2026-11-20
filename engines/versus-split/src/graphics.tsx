import React from "react";

/**
 * 1. MANGA SPEEDLINES
 * High-octane anime action lines radiating outward from center seam.
 */
export const MangaSpeedlines: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.25 }) => {
  const lineCount = 36;
  const rotOffset = (frame * 3) % 10;
  return (
    <svg
      width="1080"
      height="1920"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
        mixBlendMode: "screen",
        zIndex: 5
      }}
    >
      <defs>
        <radialGradient id="speedline-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
        </radialGradient>
      </defs>
      <g transform="translate(540, 960)">
        {Array.from({ length: lineCount }).map((_, i) => {
          const angle = (i * 360) / lineCount + rotOffset;
          const length = 1100 + ((i * 37 + frame * 5) % 120);
          const width = 1.5 + (i % 3);
          return (
            <line
              key={i}
              x1={0}
              y1={280}
              x2={0}
              y2={length}
              stroke="url(#speedline-fade)"
              strokeWidth={width}
              transform={`rotate(${angle})`}
            />
          );
        })}
      </g>
    </svg>
  );
};

/**
 * 2. LIGHTNING SEAM
 * Animated jagged electrical discharge that crackles along the diagonal clash seam.
 */
export const LightningSeam: React.FC<{ frame: number; color?: string }> = ({ frame, color = "#FFD23F" }) => {
  const jitter = (frame % 4) * 8;
  const path = `M -200 ${940 + jitter} Q 270 ${920 - jitter} 540 ${960 + jitter} T 1280 ${980 - jitter}`;
  const glow = 10 + (frame % 5) * 4;

  return (
    <svg
      width="1080"
      height="1920"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 22,
        mixBlendMode: "screen"
      }}
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={4}
        style={{ filter: `drop-shadow(0 0 ${glow}px ${color})` }}
      />
      <path
        d={path}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={1.5}
      />
    </svg>
  );
};

/**
 * 3. 3D METALLIC GOLDEN CROWN (👑)
 * Photorealistic vector crown with 3D gold facets, ruby & sapphire cabochons, and specular light gleams.
 */
export const MetallicCrown: React.FC<{
  size?: number;
  frame?: number;
  glowColor?: string;
}> = ({ size = 180, frame = 0, glowColor = "#FACC15" }) => {
  const glint = ((frame * 4) % 120) - 20;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size * 0.8,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {/* Radiant Golden Backlight */}
      <div
        style={{
          position: "absolute",
          width: size * 1.5,
          height: size * 1.5,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glowColor}66 0%, transparent 70%)`,
          filter: "blur(20px)",
          zIndex: 0
        }}
      />

      {/* Vector Crown Graphic */}
      <svg
        width={size}
        height={size * 0.8}
        viewBox="0 0 200 160"
        style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.8))" }}
      >
        <defs>
          {/* 3D Gold Gradient */}
          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF9D2" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#FDE68A" />
            <stop offset="75%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Crown Base Gradient */}
          <linearGradient id="gold-base" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Ruby Jewel Gradient */}
          <radialGradient id="ruby-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FCA5A5" />
            <stop offset="40%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#450A0A" />
          </radialGradient>

          {/* Sapphire Jewel Gradient */}
          <radialGradient id="sapphire-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="40%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0F172A" />
          </radialGradient>

          {/* Emerald Jewel Gradient */}
          <radialGradient id="emerald-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="40%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#064E3B" />
          </radialGradient>
        </defs>

        {/* Crown Spikes Back Shadow */}
        <polygon
          points="20,130 10,45 60,85 100,20 140,85 190,45 180,130"
          fill="#5B2E05"
        />

        {/* Crown Main Facets */}
        <polygon
          points="20,130 15,48 60,85 100,25 140,85 185,48 180,130"
          fill="url(#gold-grad)"
          stroke="#FFFBEB"
          strokeWidth="2"
        />

        {/* Facet Shading Lines */}
        <polygon points="100,25 60,85 100,130" fill="rgba(0,0,0,0.15)" />
        <polygon points="100,25 140,85 100,130" fill="rgba(255,255,255,0.2)" />
        <polygon points="15,48 60,85 30,130" fill="rgba(0,0,0,0.2)" />
        <polygon points="185,48 140,85 170,130" fill="rgba(255,255,255,0.2)" />

        {/* Crown Rim Base Band */}
        <rect
          x="18"
          y="125"
          width="164"
          height="22"
          rx="5"
          fill="url(#gold-base)"
          stroke="#FDE68A"
          strokeWidth="1.5"
        />

        {/* Base Rim Pearls/Gems */}
        <circle cx="35" cy="136" r="5" fill="url(#ruby-grad)" />
        <circle cx="68" cy="136" r="5" fill="url(#sapphire-grad)" />
        <circle cx="100" cy="136" r="6" fill="url(#ruby-grad)" />
        <circle cx="132" cy="136" r="5" fill="url(#emerald-grad)" />
        <circle cx="165" cy="136" r="5" fill="url(#ruby-grad)" />

        {/* Crown Peak Spheres */}
        <circle cx="15" cy="45" r="7" fill="url(#ruby-grad)" stroke="#FEF08A" strokeWidth="1.5" />
        <circle cx="100" cy="22" r="9" fill="url(#ruby-grad)" stroke="#FEF08A" strokeWidth="2" />
        <circle cx="185" cy="45" r="7" fill="url(#ruby-grad)" stroke="#FEF08A" strokeWidth="1.5" />

        {/* Specular Glint Star */}
        {glint >= 0 && glint <= 80 && (
          <path
            d={`M ${glint + 60} 55 Q ${glint + 66} 55 ${glint + 66} 49 Q ${glint + 66} 55 ${glint + 72} 55 Q ${glint + 66} 55 ${glint + 66} 61 Q ${glint + 66} 55 ${glint + 60} 55 Z`}
            fill="#FFFFFF"
            filter="drop-shadow(0 0 6px #FFFFFF)"
          />
        )}
      </svg>
    </div>
  );
};

/**
 * 4. STYLIZED FIGHTER EMBLEMS & CRESTS
 * Draws high-impact vector artwork for iconic fighters so cards aren't just empty text!
 */
export const FighterEmblem: React.FC<{
  name: string;
  franchise: string;
  color: string;
  size?: number;
}> = ({ name, color, size = 160 }) => {
  const n = name.toUpperCase();

  // 1. GOKU EMBLEM (Kanji "悟" GO + Saiyan Aura Ring)
  if (n.includes("GOKU")) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.06)" stroke={color} strokeWidth="4" />
        <circle cx="50" cy="50" r="41" fill="#EA580C" opacity="0.9" />
        <circle cx="50" cy="50" r="34" fill="#FFFFFF" />
        {/* Kanji Character "悟" */}
        <text
          x="50"
          y="63"
          textAnchor="middle"
          fontSize="40"
          fontWeight="900"
          fontFamily="sans-serif"
          fill="#111827"
        >
          悟
        </text>
      </svg>
    );
  }

  // 2. SAITAMA EMBLEM (Hero Fist + Bald Gleam + Yellow Cape)
  if (n.includes("SAITAMA")) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.06)" stroke={color} strokeWidth="4" />
        <circle cx="50" cy="50" r="41" fill="#EAB308" opacity="0.9" />
        {/* Red Hero Glove Fist */}
        <circle cx="50" cy="46" r="22" fill="#DC2626" />
        <rect x="42" y="58" width="16" height="14" rx="4" fill="#DC2626" />
        {/* Specular shine */}
        <ellipse cx="44" cy="40" rx="6" ry="3" fill="#FFFFFF" opacity="0.8" />
        <text x="50" y="86" textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="sans-serif" fill="#FFFFFF">
          ONE PUNCH
        </text>
      </svg>
    );
  }

  // 3. NARUTO EMBLEM (Uzumaki Spiral Crest)
  if (n.includes("NARUTO")) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.06)" stroke={color} strokeWidth="4" />
        <circle cx="50" cy="50" r="41" fill="#F97316" />
        <circle cx="50" cy="50" r="32" fill="#FFFFFF" />
        {/* Uzumaki Spiral */}
        <path
          d="M 50 50 m -18 0 a 18 18 0 1 0 36 0 a 14 14 0 1 0 -28 0 a 10 10 0 1 0 20 0 a 6 6 0 1 0 -12 0"
          fill="none"
          stroke="#DC2626"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 4. SASUKE EMBLEM (Uchiha Fan Crest)
  if (n.includes("SASUKE")) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.06)" stroke={color} strokeWidth="4" />
        <circle cx="50" cy="50" r="41" fill="#4338CA" />
        {/* Uchiha Fan Top Red */}
        <path d="M 28 48 A 22 22 0 0 1 72 48 Z" fill="#DC2626" />
        {/* Uchiha Fan Bottom White */}
        <path d="M 28 48 A 22 22 0 0 0 72 48 Z" fill="#FFFFFF" />
        <rect x="47" y="66" width="6" height="12" fill="#FFFFFF" rx="2" />
      </svg>
    );
  }

  // 5. BATMAN EMBLEM (Bat Insignia)
  if (n.includes("BATMAN")) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.06)" stroke={color} strokeWidth="4" />
        <circle cx="50" cy="50" r="41" fill="#EAB308" />
        <ellipse cx="50" cy="50" rx="34" ry="24" fill="#000000" />
        {/* Bat Shape */}
        <path
          d="M 20 50 Q 28 36 38 42 Q 44 46 47 40 L 48 42 L 50 38 L 52 42 L 53 40 Q 56 46 62 42 Q 72 36 80 50 Q 72 64 56 56 Q 50 62 44 56 Q 28 64 20 50 Z"
          fill="#EAB308"
        />
      </svg>
    );
  }

  // 6. UNDERTAKER EMBLEM (Gothic Cross & Tombstone)
  if (n.includes("UNDERTAKER")) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.06)" stroke={color} strokeWidth="4" />
        <circle cx="50" cy="50" r="41" fill="#1E1B4B" />
        {/* Gothic Cross */}
        <rect x="44" y="24" width="12" height="52" fill="#A855F7" rx="3" />
        <rect x="28" y="38" width="44" height="12" fill="#A855F7" rx="3" />
        <text x="50" y="86" textAnchor="middle" fontSize="11" fontWeight="900" fontFamily="sans-serif" fill="#C084FC">
          DEADMAN
        </text>
      </svg>
    );
  }

  // 7. GENERIC / UNIVERSAL WARRIOR CREST
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id={`grad-${n}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#grad-${n})`} stroke="#FFFFFF" strokeWidth="3" opacity="0.85" />
      <polygon points="50,18 78,38 70,74 50,86 30,74 22,38" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="34"
        fontWeight="900"
        fontFamily="sans-serif"
        fill="#FFFFFF"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.8))" }}
      >
        {n.slice(0, 1)}
      </text>
    </svg>
  );
};

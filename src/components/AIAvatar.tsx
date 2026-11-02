import React from "react";
import { Img, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface AIAvatarProps {
  name?: string;
  role?: string;
  mode?: "pip" | "stage" | "badge";
  accentColor?: string;
  isSpeaking?: boolean;
  avatarUrl?: string; // Optional custom video or image cutout
}

export const AIAvatar: React.FC<AIAvatarProps> = ({
  name = "Aria",
  role = "AI Research Lead",
  mode = "pip",
  accentColor = "#00F5FF",
  isSpeaking = true,
  avatarUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const intro = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  // Breathing / idling motion
  const breathY = Math.sin(frame * 0.08) * 4;
  const floatRotate = Math.cos(frame * 0.05) * 1.5;

  // Audio/speech reactivity
  const speechMouthOpen = isSpeaking ? Math.abs(Math.sin(frame * 0.45)) * 14 + 4 : 2;
  const pulseScale = isSpeaking ? 1 + Math.sin(frame * 0.3) * 0.03 : 1;
  const glowIntensity = isSpeaking ? 0.8 + Math.sin(frame * 0.3) * 0.2 : 0.4;

  // Eye blink (every 90-100 frames)
  const isBlinking = frame % 95 >= 91;

  if (mode === "pip") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "10px 22px 10px 12px",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(9, 14, 26, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "999px",
          border: `1.5px solid ${accentColor}66`,
          boxShadow: `0 12px 35px rgba(0,0,0,0.6), 0 0 25px ${accentColor}${Math.round(glowIntensity * 50).toString(16)}`,
          transform: `scale(${intro}) translateY(${breathY}px)`,
          fontFamily: "'Segoe UI', Roboto, sans-serif",
          zIndex: 40,
        }}
      >
        {/* Holographic Avatar Circle */}
        <div
          style={{
            position: "relative",
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}33 0%, #050B14 80%)`,
            border: `2px solid ${accentColor}`,
            boxShadow: `0 0 16px ${accentColor}`,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {avatarUrl ? (
            <Img
              src={avatarUrl}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            /* Cyber AI Vector Face */
            <svg width="60" height="60" viewBox="0 0 100 100" style={{ transform: `scale(${pulseScale})` }}>
              {/* Head Silhouette */}
              <circle cx="50" cy="46" r="28" fill="#0E1726" stroke={accentColor} strokeWidth="2.5" />
              {/* Shoulders */}
              <path d="M 20 85 Q 50 68 80 85 Z" fill="#0A0F1D" stroke={`${accentColor}88`} strokeWidth="1.5" />
              {/* Cyber Visor / Eyes */}
              {isBlinking ? (
                <line x1="36" y1="44" x2="64" y2="44" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
              ) : (
                <rect
                  x="33"
                  y="40"
                  width="34"
                  height="8"
                  rx="4"
                  fill={accentColor}
                  filter="drop-shadow(0 0 6px #00F5FF)"
                />
              )}
              {/* Speech Reactive Mouth */}
              <rect
                x="44"
                y="57"
                width="12"
                height={speechMouthOpen}
                rx="3"
                fill="#FFFFFF"
                opacity={isSpeaking ? 0.9 : 0.4}
              />
              {/* Cyber Headset Accent */}
              <circle cx="24" cy="46" r="4" fill={accentColor} />
              <line x1="24" y1="46" x2="38" y2="56" stroke={accentColor} strokeWidth="1.5" />
            </svg>
          )}

          {/* Orbiting Voice Wave Ring */}
          {isSpeaking && (
            <div
              style={{
                position: "absolute",
                inset: -2,
                borderRadius: "50%",
                border: `2px dashed ${accentColor}`,
                transform: `rotate(${frame * 4}deg)`,
                opacity: 0.6,
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {/* Nameplate & Speaking Status */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                color: "#FFFFFF",
                fontSize: "19px",
                fontWeight: 800,
                letterSpacing: "0.5px",
              }}
            >
              {name}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: isSpeaking ? accentColor : "#64748B",
                background: isSpeaking ? `${accentColor}22` : "rgba(255,255,255,0.05)",
                border: `1px solid ${isSpeaking ? accentColor : "#475569"}`,
                padding: "1px 6px",
                borderRadius: "4px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {isSpeaking ? "Speaking" : "Listening"}
            </span>
          </div>

          <div
            style={{
              color: "#94A3B8",
              fontSize: "14px",
              fontWeight: 500,
              marginTop: "2px",
            }}
          >
            {role}
          </div>
        </div>
      </div>
    );
  }

  // Full Center Stage Host Mode
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${intro}) translateY(${breathY}px) rotate(${floatRotate}deg)`,
        fontFamily: "'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Holographic Pedestal & Cyber Rings */}
      <div
        style={{
          position: "relative",
          width: "280px",
          height: "280px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />

        {/* Animated Cyber Ring */}
        <div
          style={{
            position: "absolute",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            border: `2px dashed ${accentColor}66`,
            transform: `rotate(${frame * 1.5}deg)`,
          }}
        />

        {/* Character Stage Circle */}
        <div
          style={{
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "linear-gradient(180deg, #101B2E 0%, #060B14 100%)",
            border: `3px solid ${accentColor}`,
            boxShadow: `0 0 40px ${accentColor}66, inset 0 0 30px rgba(0,0,0,0.8)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <svg width="200" height="200" viewBox="0 0 100 100" style={{ transform: `scale(${pulseScale})` }}>
            {/* Ambient Background Aura */}
            <circle cx="50" cy="50" r="42" fill={`${accentColor}11`} />
            {/* Head Silhouette */}
            <circle cx="50" cy="45" r="26" fill="#0D1527" stroke={accentColor} strokeWidth="2.5" />
            {/* Shoulders */}
            <path d="M 15 88 Q 50 68 85 88 Z" fill="#080C17" stroke={`${accentColor}77`} strokeWidth="2" />
            {/* Cyber Visor */}
            {isBlinking ? (
              <line x1="36" y1="42" x2="64" y2="42" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
            ) : (
              <rect
                x="34"
                y="38"
                width="32"
                height="8"
                rx="4"
                fill={accentColor}
                filter="drop-shadow(0 0 8px #00F5FF)"
              />
            )}
            {/* Mouth */}
            <rect
              x="44"
              y="56"
              width="12"
              height={speechMouthOpen}
              rx="3"
              fill="#FFFFFF"
              opacity={isSpeaking ? 0.95 : 0.4}
            />
            {/* Headset Antenna */}
            <circle cx="24" cy="45" r="4.5" fill={accentColor} />
            <line x1="24" y1="45" x2="38" y2="55" stroke={accentColor} strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Stage Badge */}
      <div
        style={{
          marginTop: "16px",
          textAlign: "center",
          padding: "6px 20px",
          background: "rgba(15, 23, 42, 0.9)",
          borderRadius: "999px",
          border: `1px solid ${accentColor}55`,
        }}
      >
        <div style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: 800 }}>{name}</div>
        <div style={{ color: accentColor, fontSize: "13px", fontWeight: 600, letterSpacing: "1px" }}>
          {role}
        </div>
      </div>
    </div>
  );
};

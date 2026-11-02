import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface SpeakerInfo {
  name: string;
  role: string;
  voiceName: string;
  accentColor: string;
}

export interface DualSpeakerAvatarProps {
  activeSpeakerIndex?: 0 | 1; // 0 for Speaker 1 (Aria), 1 for Speaker 2 (Dev)
  speaker1?: SpeakerInfo;
  speaker2?: SpeakerInfo;
}

export const DualSpeakerAvatar: React.FC<DualSpeakerAvatarProps> = ({
  activeSpeakerIndex = 0,
  speaker1 = {
    name: "Aria",
    role: "Lead Researcher",
    voiceName: "Aoede",
    accentColor: "#00F5FF",
  },
  speaker2 = {
    name: "Dev",
    role: "Tech Inquirer",
    voiceName: "Puck",
    accentColor: "#F59E0B",
  },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isBlinking = frame % 90 >= 86;

  // Render a single speaker pill
  const renderSpeaker = (speaker: SpeakerInfo, isActive: boolean, isLeft: boolean) => {
    const mouthHeight = isActive ? Math.abs(Math.sin(frame * 0.45)) * 12 + 3 : 2;
    const pulseScale = isActive ? 1 + Math.sin(frame * 0.3) * 0.04 : 0.96;
    const glow = isActive ? `0 0 25px ${speaker.accentColor}` : "none";

    const intro = spring({
      frame,
      fps,
      config: { damping: 12, stiffness: 90 },
    });

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "8px 18px 8px 10px",
          background: isActive
            ? "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)"
            : "rgba(10, 15, 26, 0.75)",
          backdropFilter: "blur(16px)",
          borderRadius: "999px",
          border: `1.5px solid ${isActive ? speaker.accentColor : "rgba(255,255,255,0.12)"}`,
          boxShadow: `0 8px 30px rgba(0,0,0,0.6), ${glow}`,
          transform: `scale(${intro * pulseScale})`,
          opacity: isActive ? 1 : 0.65,
          fontFamily: "'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Holographic Avatar Circle */}
        <div
          style={{
            position: "relative",
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${speaker.accentColor}33 0%, #050B14 80%)`,
            border: `2px solid ${isActive ? speaker.accentColor : "#475569"}`,
            boxShadow: isActive ? `0 0 16px ${speaker.accentColor}` : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Cyber Vector Head */}
          <svg width="50" height="50" viewBox="0 0 100 100">
            <circle cx="50" cy="46" r="28" fill="#0E1726" stroke={speaker.accentColor} strokeWidth="2.5" />
            <path d="M 20 85 Q 50 68 80 85 Z" fill="#0A0F1D" stroke={`${speaker.accentColor}88`} strokeWidth="1.5" />
            {/* Visor */}
            {isBlinking ? (
              <line x1="36" y1="44" x2="64" y2="44" stroke={speaker.accentColor} strokeWidth="3" strokeLinecap="round" />
            ) : (
              <rect
                x="33"
                y="40"
                width="34"
                height="8"
                rx="4"
                fill={speaker.accentColor}
                filter={`drop-shadow(0 0 6px ${speaker.accentColor})`}
              />
            )}
            {/* Mouth */}
            <rect
              x="44"
              y="57"
              width="12"
              height={mouthHeight}
              rx="3"
              fill="#FFFFFF"
              opacity={isActive ? 0.95 : 0.4}
            />
          </svg>

          {/* Active Speaking Orbit Ring */}
          {isActive && (
            <div
              style={{
                position: "absolute",
                inset: -2,
                borderRadius: "50%",
                border: `2px dashed ${speaker.accentColor}`,
                transform: `rotate(${frame * 4 * (isLeft ? 1 : -1)}deg)`,
                opacity: 0.7,
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {/* Nameplate */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                color: "#FFFFFF",
                fontSize: "17px",
                fontWeight: 800,
                letterSpacing: "0.5px",
              }}
            >
              {speaker.name}
            </span>
            <span
              style={{
                fontSize: "10px",
                color: isActive ? speaker.accentColor : "#64748B",
                background: isActive ? `${speaker.accentColor}22` : "rgba(255,255,255,0.05)",
                border: `1px solid ${isActive ? speaker.accentColor : "#475569"}`,
                padding: "1px 5px",
                borderRadius: "4px",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {isActive ? "Speaking" : "Listening"}
            </span>
          </div>

          <div
            style={{
              color: "#94A3B8",
              fontSize: "13px",
              fontWeight: 500,
              marginTop: "2px",
            }}
          >
            {speaker.role} • {speaker.voiceName}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "960px",
        padding: "0 10px",
      }}
    >
      {renderSpeaker(speaker1, activeSpeakerIndex === 0, true)}
      {renderSpeaker(speaker2, activeSpeakerIndex === 1, false)}
    </div>
  );
};

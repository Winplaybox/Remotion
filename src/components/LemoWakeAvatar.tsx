import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export interface LemoWakeAvatarProps {
  name: string;
  role: string;
  isSpeaking: boolean;
  accentColor: string;
  styleMode?: "keynote" | "scifi" | "blueprint";
  avatarVariant?: "researcher" | "engineer";
}

export const LemoWakeAvatar: React.FC<LemoWakeAvatarProps> = ({
  name,
  role,
  isSpeaking,
  accentColor = "#00F5FF",
  styleMode = "keynote",
  avatarVariant = "researcher",
}) => {
  const frame = useCurrentFrame();

  // 1. Organic Breathing Layer (sine-wave vertical motion)
  const breathingOffset = Math.sin(frame * 0.06) * 3.5;
  const breathingScale = 1 + Math.sin(frame * 0.06) * 0.008;

  // 2. Procedural Eye Blink (occurs every 130 frames for 6 frames)
  const blinkCycle = frame % 130;
  const isBlinking = blinkCycle >= 124 && blinkCycle <= 129;
  const eyeScaleY = isBlinking ? 0.1 : 1;

  // 3. Audio-Reactive Energy Aura (simulated speech modulation)
  const speechPulse = isSpeaking ? (Math.sin(frame * 0.35) + 1) * 0.5 : 0.15;
  const glowIntensity = interpolate(speechPulse, [0, 1], [0.3, 0.85]);

  return (
    <div
      style={{
        position: "relative",
        width: 280,
        height: 380,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        borderRadius: "20px",
        overflow: "hidden",
        background:
          styleMode === "scifi"
            ? "linear-gradient(180deg, rgba(6, 34, 38, 0.9) 0%, rgba(2, 11, 11, 0.95) 100%)"
            : styleMode === "blueprint"
            ? "linear-gradient(180deg, rgba(15, 37, 72, 0.9) 0%, rgba(11, 29, 58, 0.95) 100%)"
            : "linear-gradient(180deg, rgba(16, 24, 40, 0.85) 0%, rgba(3, 7, 18, 0.95) 100%)",
        border: `1.5px solid ${isSpeaking ? accentColor : "rgba(255, 255, 255, 0.15)"}`,
        boxShadow: isSpeaking
          ? `0 0 30px ${accentColor}${Math.round(glowIntensity * 255).toString(16).padStart(2, "0")}, inset 0 0 15px ${accentColor}33`
          : "0 10px 30px rgba(0, 0, 0, 0.6)",
      }}
    >
      {/* Background Volumetric Halo (Lemo-Wake Depth Layer 1) */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
          opacity: glowIntensity * 0.6,
          filter: "blur(25px)",
          pointerEvents: "none",
        }}
      />

      {/* Holographic Scanline Overlay (Sci-Fi Mode) */}
      {styleMode === "scifi" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 255, 204, 0.05) 3px, rgba(0, 255, 204, 0.05) 6px)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}

      {/* Character Figure (Lemo-Wake Depth Layer 2: Torso & Head) */}
      <div
        style={{
          transform: `translateY(${breathingOffset}px) scale(${breathingScale})`,
          transformOrigin: "bottom center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 5,
          marginBottom: 30,
        }}
      >
        {/* Head & Stylized Geometric Face */}
        <div
          style={{
            width: 80,
            height: 96,
            borderRadius: "40px 40px 35px 35px",
            background:
              avatarVariant === "researcher"
                ? "linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)"
                : "linear-gradient(135deg, #CBD5E1 0%, #64748B 100%)",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            boxShadow: `0 0 15px ${accentColor}44`,
            border: `1px solid ${accentColor}66`,
          }}
        >
          {/* Eyes with Procedural Blink */}
          <div
            style={{
              position: "absolute",
              top: 40,
              width: "100%",
              display: "flex",
              justifyContent: "space-around",
              padding: "0 18px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: 10,
                height: 8,
                borderRadius: "50%",
                backgroundColor: accentColor,
                transform: `scaleY(${eyeScaleY})`,
                boxShadow: `0 0 8px ${accentColor}`,
              }}
            />
            <div
              style={{
                width: 10,
                height: 8,
                borderRadius: "50%",
                backgroundColor: accentColor,
                transform: `scaleY(${eyeScaleY})`,
                boxShadow: `0 0 8px ${accentColor}`,
              }}
            />
          </div>

          {/* Audio-reactive Mouth Pulse */}
          <div
            style={{
              position: "absolute",
              bottom: 18,
              width: isSpeaking ? 16 + speechPulse * 6 : 12,
              height: isSpeaking ? 4 + speechPulse * 6 : 2,
              borderRadius: "4px",
              backgroundColor: isSpeaking ? accentColor : "#64748B",
              boxShadow: isSpeaking ? `0 0 6px ${accentColor}` : "none",
            }}
          />
        </div>

        {/* Torso / Shoulders with Depth Shading */}
        <div
          style={{
            width: 160,
            height: 90,
            borderRadius: "30px 30px 0 0",
            background:
              styleMode === "blueprint"
                ? "linear-gradient(180deg, #1E3A8A 0%, #0F172A 100%)"
                : "linear-gradient(180deg, #1E293B 0%, #090D16 100%)",
            marginTop: -10,
            borderTop: `2px solid ${accentColor}88`,
            boxShadow: "0 -4px 12px rgba(0,0,0,0.5)",
            position: "relative",
          }}
        >
          {/* Technical Collar / ID Accent */}
          <div
            style={{
              position: "absolute",
              top: 15,
              left: "50%",
              transform: "translateX(-50%)",
              width: 30,
              height: 4,
              borderRadius: 2,
              backgroundColor: accentColor,
              opacity: 0.8,
            }}
          />
        </div>
      </div>

      {/* Floating Identity & Voice Tag (Lemo-Wake Layer 3) */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          right: 12,
          padding: "6px 12px",
          background: "rgba(3, 7, 18, 0.85)",
          backdropFilter: "blur(8px)",
          borderRadius: "10px",
          border: `1px solid ${isSpeaking ? accentColor : "rgba(255, 255, 255, 0.1)"}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 20,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Segoe UI', Roboto, sans-serif",
              fontSize: "12px",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "0.5px",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontFamily: "'Segoe UI', Roboto, sans-serif",
              fontSize: "10px",
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {role}
          </div>
        </div>

        {/* Live Audio Indicator Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            padding: "3px 6px",
            borderRadius: "6px",
            background: isSpeaking ? `${accentColor}22` : "transparent",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: isSpeaking ? accentColor : "#475569",
              boxShadow: isSpeaking ? `0 0 8px ${accentColor}` : "none",
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "9px",
              fontWeight: 700,
              color: isSpeaking ? accentColor : "#64748B",
            }}
          >
            {isSpeaking ? "ON AIR" : "READY"}
          </span>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { useCurrentFrame } from "remotion";

export const ParallaxLayers: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();

  // Multi-speed parallax offsets
  const gridOffsetY = (frame * 0.4) % 60;
  const orb1X = Math.sin(frame * 0.02) * 40;
  const orb1Y = Math.cos(frame * 0.02) * 40;
  const orb2X = Math.cos(frame * 0.015) * 50;
  const orb2Y = Math.sin(frame * 0.015) * 50;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        background: "radial-gradient(circle at 50% 25%, #0B132B 0%, #030712 70%, #000208 100%)",
        overflow: "hidden",
      }}
    >
      {/* Background Glowing Ambient Orbs */}
      <div
        style={{
          position: "absolute",
          top: `calc(15% + ${orb1Y}px)`,
          left: `calc(10% + ${orb1X}px)`,
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 245, 255, 0.12) 0%, rgba(0, 245, 255, 0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: `calc(5% + ${orb2X}px)`,
          top: `calc(50% + ${orb2Y}px)`,
          width: "650px",
          height: "650px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(121, 40, 202, 0.14) 0%, rgba(121, 40, 202, 0) 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      {/* Cyber Grid Layer */}
      <div
        style={{
          position: "absolute",
          top: -60,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          transform: `translateY(${gridOffsetY}px)`,
          maskImage: "radial-gradient(ellipse at 50% 45%, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 45%, black 40%, transparent 80%)",
          pointerEvents: "none",
        }}
      />

      {/* Top and Bottom Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(3,7,18,0.7) 0%, transparent 15%, transparent 85%, rgba(3,7,18,0.9) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content Layer */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
};

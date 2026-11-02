import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhysicalPlateSchema, TelemetryDialSchema } from "../../schemas/universalTeardown.schema";
import { z } from "zod";

type PhysicalPlate = z.infer<typeof PhysicalPlateSchema>;
type TelemetryDial = z.infer<typeof TelemetryDialSchema>;

export interface DataPhysicalizationProps {
  plates: PhysicalPlate[];
  dials: TelemetryDial[];
  accentColor?: string;
  delay?: number;
}

export const DataPhysicalization: React.FC<DataPhysicalizationProps> = ({
  plates,
  dials,
  accentColor = "#00F5FF",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animation
  const intro = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 85, mass: 1 },
  });

  const time = (frame - delay) / 30;
  // Subtle continuous 3D camera hover
  const orbitTiltX = -16 + Math.sin(time * 1.2) * 2;
  const orbitTiltY = 18 + Math.cos(time * 0.9) * 2.5;

  return (
    <div
      style={{
        position: "relative",
        width: 960,
        height: 820,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1200px",
        boxShadow: `0 0 80px ${accentColor}18`,
      }}
    >
      {/* 3D Isometric Plate Stage */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 480,
          transformStyle: "preserve-3d",
          transform: `scale(${intro}) rotateX(${orbitTiltX}deg) rotateY(${orbitTiltY}deg)`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "40px",
        }}
      >
        {plates.map((plate, idx) => {
          // Staggered rise for each physical plate
          const plateSpring = spring({
            frame: frame - delay - idx * 10,
            fps,
            config: { damping: 12, stiffness: 100 },
          });

          const currentHeight = interpolate(plateSpring, [0, 1], [20, plate.densityValue * 3.4]);
          const elevationZ = idx * 60;

          return (
            <div
              key={plate.yearOrStep}
              style={{
                position: "relative",
                width: 220,
                transform: `translateZ(${elevationZ}px)`,
                transformStyle: "preserve-3d",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Volumetric Physical Monolith Column */}
              <div
                style={{
                  width: 200,
                  height: currentHeight,
                  borderRadius: "16px 16px 6px 6px",
                  background: `linear-gradient(180deg, ${plate.plateColor}EE 0%, ${plate.plateColor}66 60%, rgba(15, 23, 42, 0.95) 100%)`,
                  border: `2px solid ${plate.plateColor}`,
                  boxShadow: `0 0 35px ${plate.plateColor}44, inset 0 0 20px ${plate.plateColor}33`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  paddingTop: "14px",
                  boxSizing: "border-box",
                }}
              >
                {/* Metric Readout on Top of Plate */}
                <div
                  style={{
                    fontFamily: "'Segoe UI', Roboto, sans-serif",
                    fontSize: "22px",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                  }}
                >
                  {plate.metricFormatted}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#E2E8F0",
                    marginTop: "4px",
                    letterSpacing: "0.5px",
                  }}
                >
                  {plate.annotation}
                </div>
              </div>

              {/* Physical Floor Base Label */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "6px 16px",
                  borderRadius: "8px",
                  background: "rgba(13, 17, 23, 0.9)",
                  border: `1.5px solid ${plate.plateColor}88`,
                  fontFamily: "monospace",
                  fontSize: "16px",
                  fontWeight: 900,
                  color: "#FFFFFF",
                  letterSpacing: "1px",
                }}
              >
                {plate.yearOrStep}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calibrated Telemetry Dials Rack (Bottom Half) */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          marginTop: "30px",
          padding: "20px 30px",
          boxSizing: "border-box",
          background: "rgba(13, 17, 23, 0.85)",
          border: "1.5px solid #1F293D",
          borderRadius: "20px",
          backdropFilter: "blur(10px)",
        }}
      >
        {dials.map((dial, dialIdx) => {
          const dialProgress = spring({
            frame: frame - delay - 25 - dialIdx * 12,
            fps,
            config: { damping: 14, stiffness: 70 },
          });

          // Needle angle from -120deg to +120deg
          const needleAngle = interpolate(
            dialProgress,
            [0, 1],
            [-120, -120 + (dial.value / dial.max) * 240]
          );

          const statusColor =
            dial.status === "critical"
              ? "#EF4444"
              : dial.status === "elevated"
              ? "#F59E0B"
              : "#00F5FF";

          return (
            <div
              key={dial.code}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              {/* Circular Dial Gauge */}
              <div
                style={{
                  position: "relative",
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #0F172A 0%, #030712 100%)",
                  border: `2px solid ${statusColor}66`,
                  boxShadow: `0 0 20px ${statusColor}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Dial Tick Marks */}
                <svg width="110" height="110" viewBox="0 0 110 110" style={{ position: "absolute", inset: 0 }}>
                  <circle
                    cx="55"
                    cy="55"
                    r="46"
                    fill="none"
                    stroke={statusColor}
                    strokeWidth="2"
                    strokeDasharray="4 6"
                    opacity={0.4}
                  />
                </svg>

                {/* Animated Needle */}
                <div
                  style={{
                    position: "absolute",
                    width: 3,
                    height: 42,
                    backgroundColor: statusColor,
                    bottom: "55px",
                    left: "53.5px",
                    transformOrigin: "bottom center",
                    transform: `rotate(${needleAngle}deg)`,
                    boxShadow: `0 0 8px ${statusColor}`,
                    borderRadius: 2,
                  }}
                />

                {/* Center Pivot */}
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    boxShadow: `0 0 6px ${statusColor}`,
                    zIndex: 5,
                  }}
                />
              </div>

              {/* Dial Label & Readout */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#94A3B8",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  {dial.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Segoe UI', Roboto, sans-serif",
                    fontSize: "26px",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    marginTop: "2px",
                  }}
                >
                  {dial.formattedValue}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: statusColor,
                    marginTop: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  STATUS: {dial.status} • [{dial.code}]
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

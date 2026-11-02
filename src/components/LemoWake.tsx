import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface LemoWakeProps {
  imageSrc?: string;
  title?: string;
  badge?: string;
  accentColor?: string;
  focalPoint?: { xPct: number; yPct: number; label: string };
  delay?: number;
}

export const LemoWake: React.FC<LemoWakeProps> = ({
  imageSrc,
  title = "Extracted Research Architecture Diagram",
  badge = "WAKE-UP LOOP • 30 FPS",
  accentColor = "#00F5FF",
  focalPoint = { xPct: 50, yPct: 45, label: "Self-Attention Mechanism" },
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const intro = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 90, mass: 1 },
  });

  // Continuous subtle 2.5D breathing & camera tilt
  const time = (frame - delay) / 30;
  const breathScale = 1 + Math.sin(time * 1.5) * 0.015;
  const floatTiltX = Math.sin(time * 1.2) * 3;
  const floatTiltY = Math.cos(time * 1.0) * 4;

  // Diagonal Light Sheen Sweep (sweeps across diagram every 90 frames)
  const sheenProgress = ((frame - delay) % 90) / 90;
  const sheenX = interpolate(sheenProgress, [0, 1], [-150, 250]);

  // Focal point pulsing indicator
  const focalPulse = 1 + Math.sin(time * 6) * 0.25;

  return (
    <div
      style={{
        perspective: "1200px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "880px",
          height: "560px",
          borderRadius: "28px",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(9, 14, 26, 0.95) 100%)",
          border: `1.5px solid ${accentColor}55`,
          boxShadow: `0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px ${accentColor}22`,
          transform: `scale(${intro * breathScale}) rotateX(${floatTiltX}deg) rotateY(${floatTiltY}deg)`,
          transformStyle: "preserve-3d",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: "16px 24px",
            background: "rgba(3, 7, 18, 0.7)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: accentColor,
                boxShadow: `0 0 10px ${accentColor}`,
              }}
            />
            <span
              style={{
                fontFamily: "'Segoe UI', Roboto, sans-serif",
                fontSize: "18px",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "0.5px",
              }}
            >
              {title}
            </span>
          </div>

          <span
            style={{
              fontSize: "12px",
              color: accentColor,
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}55`,
              padding: "2px 8px",
              borderRadius: "6px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {badge}
          </span>
        </div>

        {/* Main Diagram Area with Dynamic Motion */}
        <div
          style={{
            position: "relative",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle at 50% 50%, rgba(0, 245, 255, 0.05) 0%, transparent 80%)",
            overflow: "hidden",
          }}
        >
          {imageSrc ? (
            <Img
              src={imageSrc}
              alt={title}
              style={{
                width: "90%",
                height: "90%",
                objectFit: "contain",
                filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.7))",
              }}
            />
          ) : (
            /* Procedural Neural Architecture Diagram (Lemo-Wake Fallback) */
            <svg width="780" height="420" viewBox="0 0 780 420" style={{ width: "95%", height: "95%" }}>
              {/* Background Grid */}
              <defs>
                <pattern id="diag-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </pattern>
                <linearGradient id="sheenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.18)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <rect width="780" height="420" fill="url(#diag-grid)" />

              {/* Input Tokens Layer */}
              <g transform="translate(60, 160)">
                <rect x="0" y="0" width="130" height="90" rx="12" fill="#0E1E38" stroke="#38BDF8" strokeWidth="2" />
                <text x="65" y="42" fill="#FFFFFF" fontSize="16" fontWeight="bold" textAnchor="middle">INPUT</text>
                <text x="65" y="65" fill="#38BDF8" fontSize="13" textAnchor="middle">Tokens / Vectors</text>
              </g>

              {/* Connecting Signal Arrow 1 */}
              <path
                d="M 190 205 L 290 205"
                stroke={accentColor}
                strokeWidth="3"
                strokeDasharray="8 6"
                strokeDashoffset={-frame * 3}
              />

              {/* Core Attention Mechanism Block */}
              <g transform="translate(290, 110)">
                <rect
                  x="0"
                  y="0"
                  width="200"
                  height="190"
                  rx="16"
                  fill="#101D34"
                  stroke={accentColor}
                  strokeWidth="2.5"
                  filter="drop-shadow(0 0 20px rgba(0, 245, 255, 0.3))"
                />
                <text x="100" y="40" fill="#FFFFFF" fontSize="18" fontWeight="900" textAnchor="middle">MULTI-HEAD</text>
                <text x="100" y="65" fill={accentColor} fontSize="17" fontWeight="bold" textAnchor="middle">ATTENTION</text>

                {/* Sub-matrices Q, K, V */}
                <rect x="25" y="90" width="40" height="32" rx="6" fill="#00F5FF22" stroke="#00F5FF" strokeWidth="1.5" />
                <text x="45" y="112" fill="#00F5FF" fontSize="15" fontWeight="bold" textAnchor="middle">Q</text>

                <rect x="80" y="90" width="40" height="32" rx="6" fill="#7928CA22" stroke="#7928CA" strokeWidth="1.5" />
                <text x="100" y="112" fill="#C084FC" fontSize="15" fontWeight="bold" textAnchor="middle">K</text>

                <rect x="135" y="90" width="40" height="32" rx="6" fill="#10B98122" stroke="#10B981" strokeWidth="1.5" />
                <text x="155" y="112" fill="#10B981" fontSize="15" fontWeight="bold" textAnchor="middle">V</text>

                <text x="100" y="160" fill="#94A3B8" fontSize="12" textAnchor="middle">Softmax(QKᵀ / √d) V</text>
              </g>

              {/* Connecting Signal Arrow 2 */}
              <path
                d="M 490 205 L 590 205"
                stroke={accentColor}
                strokeWidth="3"
                strokeDasharray="8 6"
                strokeDashoffset={-frame * 3}
              />

              {/* Feed Forward / Output Layer */}
              <g transform="translate(590, 160)">
                <rect x="0" y="0" width="130" height="90" rx="12" fill="#0E1E38" stroke="#10B981" strokeWidth="2" />
                <text x="65" y="42" fill="#FFFFFF" fontSize="16" fontWeight="bold" textAnchor="middle">OUTPUT</text>
                <text x="65" y="65" fill="#10B981" fontSize="13" textAnchor="middle">Probabilities</text>
              </g>
            </svg>
          )}

          {/* Focal Point Glowing Spotlight */}
          {focalPoint && (
            <div
              style={{
                position: "absolute",
                left: `${focalPoint.xPct}%`,
                top: `${focalPoint.yPct}%`,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  border: `2px solid ${accentColor}`,
                  boxShadow: `0 0 25px ${accentColor}`,
                  transform: `scale(${focalPulse})`,
                  opacity: 0.8,
                }}
              />
              <div
                style={{
                  marginTop: "8px",
                  padding: "4px 12px",
                  background: "rgba(15, 23, 42, 0.95)",
                  border: `1px solid ${accentColor}`,
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "0.5px",
                  whiteSpace: "nowrap",
                }}
              >
                {focalPoint.label}
              </div>
            </div>
          )}

          {/* Light Sheen Sweep Overlay across entire card */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${sheenX}%`,
              width: "40%",
              background: "linear-gradient(105deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)",
              transform: "skewX(-20deg)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};

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
  title = "Transformer Multi-Head Attention Mechanism",
  badge = "LEMO-WAKE ARCHITECTURE • SECTION 3.2",
  accentColor = "#00F5FF",
  focalPoint = { xPct: 50, yPct: 48, label: "Scaled Dot-Product Attention: Softmax(QKᵀ / √d_k) V" },
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const intro = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 90, mass: 1 },
  });

  const time = (frame - delay) / 30;
  const breathScale = 1 + Math.sin(time * 1.5) * 0.012;
  const floatTiltX = Math.sin(time * 1.2) * 2.5;
  const floatTiltY = Math.cos(time * 1.0) * 3;

  const sheenProgress = ((frame - delay) % 90) / 90;
  const sheenX = interpolate(sheenProgress, [0, 1], [-150, 250]);

  const focalPulse = 1 + Math.sin(time * 6) * 0.2;

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
          width: "940px",
          height: "720px",
          borderRadius: "28px",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(9, 14, 26, 0.98) 100%)",
          border: `1.5px solid ${accentColor}55`,
          boxShadow: `0 30px 80px rgba(0, 0, 0, 0.85), 0 0 40px ${accentColor}25`,
          transform: `scale(${intro * breathScale}) rotateX(${floatTiltX}deg) rotateY(${floatTiltY}deg)`,
          transformStyle: "preserve-3d",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: "18px 28px",
            background: "rgba(3, 7, 18, 0.8)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: accentColor,
                boxShadow: `0 0 12px ${accentColor}`,
              }}
            />
            <span
              style={{
                fontFamily: "'Segoe UI', Roboto, sans-serif",
                fontSize: "20px",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "0.5px",
              }}
            >
              {title}
            </span>
          </div>

          <span
            style={{
              fontSize: "13px",
              color: accentColor,
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}66`,
              padding: "4px 12px",
              borderRadius: "8px",
              fontWeight: 800,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            {badge}
          </span>
        </div>

        {/* Dynamic Architectural Diagram Area */}
        <div
          style={{
            position: "relative",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle at 50% 50%, rgba(0, 245, 255, 0.06) 0%, transparent 80%)",
            overflow: "hidden",
            padding: "20px",
          }}
        >
          {imageSrc ? (
            <Img
              src={imageSrc}
              alt={title}
              style={{ width: "95%", height: "95%", objectFit: "contain" }}
            />
          ) : (
            <svg width="880" height="580" viewBox="0 0 880 580" style={{ width: "100%", height: "100%" }}>
              <defs>
                <pattern id="lemo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
                <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
              </defs>
              <rect width="880" height="580" fill="url(#lemo-grid)" />

              {/* Input Tokens Box */}
              <g transform="translate(40, 210)">
                <rect x="0" y="0" width="160" height="120" rx="16" fill="url(#cardGrad)" stroke="#38BDF8" strokeWidth="2.5" />
                <text x="80" y="45" fill="#FFFFFF" fontSize="20" fontWeight="900" textAnchor="middle">INPUT</text>
                <text x="80" y="75" fill="#38BDF8" fontSize="16" fontWeight="bold" textAnchor="middle">Word Tokens</text>
                <text x="80" y="100" fill="#64748B" fontSize="13" textAnchor="middle">Dim: 12,288</text>
              </g>

              {/* Animated Connecting Vector Streams 1 */}
              <path
                d="M 200 270 L 320 270"
                stroke={accentColor}
                strokeWidth="4"
                strokeDasharray="10 8"
                strokeDashoffset={-frame * 3.5}
              />

              {/* Central Multi-Head Attention Block */}
              <g transform="translate(320, 90)">
                <rect
                  x="0"
                  y="0"
                  width="280"
                  height="360"
                  rx="24"
                  fill="#0B132B"
                  stroke={accentColor}
                  strokeWidth="3"
                  filter="drop-shadow(0 0 35px rgba(0, 245, 255, 0.4))"
                />
                <text x="140" y="48" fill="#FFFFFF" fontSize="22" fontWeight="900" textAnchor="middle">MULTI-HEAD</text>
                <text x="140" y="80" fill={accentColor} fontSize="20" fontWeight="900" textAnchor="middle">ATTENTION</text>

                {/* Parallel Head Cards (h = 8) */}
                <g transform="translate(25, 110)">
                  <rect x="0" y="0" width="65" height="55" rx="8" fill="#00F5FF22" stroke="#00F5FF" strokeWidth="2" />
                  <text x="32" y="32" fill="#00F5FF" fontSize="20" fontWeight="900" textAnchor="middle">Q</text>
                  <text x="32" y="48" fill="#64748B" fontSize="11" textAnchor="middle">Query</text>

                  <rect x="82" y="0" width="65" height="55" rx="8" fill="#7928CA22" stroke="#7928CA" strokeWidth="2" />
                  <text x="114" y="32" fill="#C084FC" fontSize="20" fontWeight="900" textAnchor="middle">K</text>
                  <text x="114" y="48" fill="#64748B" fontSize="11" textAnchor="middle">Key</text>

                  <rect x="164" y="0" width="65" height="55" rx="8" fill="#10B98122" stroke="#10B981" strokeWidth="2" />
                  <text x="196" y="32" fill="#10B981" fontSize="20" fontWeight="900" textAnchor="middle">V</text>
                  <text x="196" y="48" fill="#64748B" fontSize="11" textAnchor="middle">Value</text>
                </g>

                {/* Scaled Dot-Product Core Box */}
                <rect x="25" y="190" width="230" height="90" rx="12" fill="#1E293B" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                <text x="140" y="225" fill="#FFFFFF" fontSize="15" fontWeight="bold" textAnchor="middle">Softmax(QKᵀ / √d_k) V</text>
                <text x="140" y="255" fill="#38BDF8" fontSize="13" textAnchor="middle">h = 8 Parallel Heads • d_k = 64</text>

                {/* Linear Layer */}
                <rect x="25" y="300" width="230" height="40" rx="8" fill="#0E1726" stroke={accentColor} strokeWidth="1.5" />
                <text x="140" y="325" fill="#E2E8F0" fontSize="14" fontWeight="bold" textAnchor="middle">Linear Projection (W_O)</text>
              </g>

              {/* Animated Connecting Vector Streams 2 */}
              <path
                d="M 600 270 L 720 270"
                stroke={accentColor}
                strokeWidth="4"
                strokeDasharray="10 8"
                strokeDashoffset={-frame * 3.5}
              />

              {/* Feed Forward / Output Box */}
              <g transform="translate(720, 210)">
                <rect x="0" y="0" width="130" height="120" rx="16" fill="url(#cardGrad)" stroke="#10B981" strokeWidth="2.5" />
                <text x="65" y="45" fill="#FFFFFF" fontSize="20" fontWeight="900" textAnchor="middle">OUTPUT</text>
                <text x="65" y="75" fill="#10B981" fontSize="15" fontWeight="bold" textAnchor="middle">Context</text>
                <text x="65" y="100" fill="#64748B" fontSize="13" textAnchor="middle">Probabilities</text>
              </g>
            </svg>
          )}

          {/* Focal Point Indicator */}
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
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  border: `2px dashed ${accentColor}`,
                  boxShadow: `0 0 35px ${accentColor}`,
                  transform: `scale(${focalPulse})`,
                  opacity: 0.9,
                }}
              />
              <div
                style={{
                  marginTop: "12px",
                  padding: "6px 18px",
                  background: "rgba(15, 23, 42, 0.96)",
                  border: `1.5px solid ${accentColor}`,
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  letterSpacing: "0.5px",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.8)",
                  whiteSpace: "nowrap",
                }}
              >
                {focalPoint.label}
              </div>
            </div>
          )}

          {/* Light Sheen Sweep Overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${sheenX}%`,
              width: "45%",
              background: "linear-gradient(105deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)",
              transform: "skewX(-20deg)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};

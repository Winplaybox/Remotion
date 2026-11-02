import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TeardownLayerSchema } from "../../schemas/universalTeardown.schema";
import { z } from "zod";

type TeardownLayer = z.infer<typeof TeardownLayerSchema>;

export interface ExplodedLayerStackProps {
  layers: TeardownLayer[];
  accentColor?: string;
  delay?: number;
}

export const ExplodedLayerStack: React.FC<ExplodedLayerStackProps> = ({
  layers,
  accentColor = "#00F5FF",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const intro = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  const time = (frame - delay) / 30;
  const orbitTiltX = -20 + Math.sin(time * 0.8) * 3;
  const orbitTiltY = 25 + Math.cos(time * 0.7) * 3.5;

  return (
    <div
      style={{
        position: "relative",
        width: 960,
        height: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1400px",
        boxShadow: `0 0 80px ${accentColor}18`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: 760,
          height: 480,
          transformStyle: "preserve-3d",
          transform: `scale(${intro}) rotateX(${orbitTiltX}deg) rotateY(${orbitTiltY}deg)`,
        }}
      >
        {layers.map((layer, idx) => {
          // Explode along Z-axis based on frame
          const explodeSpring = spring({
            frame: frame - delay - idx * 12,
            fps,
            config: { damping: 13, stiffness: 90 },
          });

          const currentZ = interpolate(explodeSpring, [0, 1], [0, (idx - (layers.length - 1) / 2) * 180]);

          return (
            <div
              key={layer.id}
              style={{
                position: "absolute",
                inset: 0,
                transform: `translateZ(${currentZ}px)`,
                transformStyle: "preserve-3d",
                borderRadius: "20px",
                background: "rgba(13, 17, 23, 0.92)",
                border: `2px solid ${layer.accentColor}`,
                boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px ${layer.accentColor}33`,
                padding: "24px 30px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* Layer Header Code */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "14px",
                    fontWeight: 900,
                    color: layer.accentColor,
                    letterSpacing: "1.5px",
                    background: `${layer.accentColor}18`,
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: `1px solid ${layer.accentColor}66`,
                  }}
                >
                  [{layer.layerCode}]
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#8B949E",
                    textTransform: "uppercase",
                  }}
                >
                  {layer.category}
                </span>
              </div>

              {/* Layer Main Title */}
              <div>
                <div
                  style={{
                    fontFamily: "'Segoe UI', Roboto, sans-serif",
                    fontSize: "26px",
                    fontWeight: 900,
                    color: "#FFFFFF",
                  }}
                >
                  {layer.name}
                </div>

                {/* Metrics Badges */}
                <div style={{ display: "flex", gap: "20px", marginTop: "14px" }}>
                  {layer.metrics.map((m) => (
                    <div
                      key={m.label}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "10px",
                        background: "rgba(15, 23, 42, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#94A3B8" }}>
                        {m.label}
                      </div>
                      <div style={{ fontFamily: "'Segoe UI', Roboto, sans-serif", fontSize: "18px", fontWeight: 800, color: "#FFFFFF" }}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spec Callouts */}
              {layer.callouts.length > 0 && (
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: layer.accentColor,
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingTop: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{layer.callouts[0].title}: {layer.callouts[0].description}</span>
                  <span>[{layer.callouts[0].specCode}]</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { DESIGN } from "../../designSystem";
import { SafeZone, useSpring, SourceTag } from "../shared/CADGrid";

interface Plate {
  label: string;
  value: string;
  color: string;
  delay: number;
  source: string;
}

const PLATES: Plate[] = [
  { label: "MMLU", value: "90.0%", color: DESIGN.colors.accent, delay: 20, source: "AI Index 2026, p.47" },
  { label: "ImageNet", value: "91.1%", color: DESIGN.colors.accentPurple, delay: 50, source: "AI Index 2026, p.52" },
  { label: "HumanEval", value: "84.9%", color: DESIGN.colors.accentGreen, delay: 80, source: "AI Index 2026, p.61" },
];

export const SceneBenchmarkStack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const header = useSpring(frame, fps, 0, "smooth");

  return (
    <AbsoluteFill>
      <SafeZone>
        <div style={{ fontFamily: DESIGN.fonts.mono, fontSize: 22, letterSpacing: "0.2em", color: DESIGN.colors.accent, textTransform: "uppercase", opacity: header, marginBottom: 32 }}>
          3 BENCHMARKS · AI VS HUMAN
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
          {PLATES.map((p) => {
            const s = useSpring(frame, fps, p.delay, "smooth");
            const y = (1 - s) * 60;
            return (
              <div key={p.label} style={{ opacity: s, transform: `translateY(${y}px)` }}>
                <PlateCard {...p} />
              </div>
            );
          })}
        </div>
      </SafeZone>
    </AbsoluteFill>
  );
};

const PlateCard: React.FC<Plate> = ({ label, value, color, source }) => (
  <div style={{
    background: DESIGN.colors.bgSurface,
    border: `1px solid ${color}33`,
    borderLeft: `4px solid ${color}`,
    borderRadius: 8,
    padding: "20px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}>
    <div>
      <div style={{ fontFamily: DESIGN.fonts.mono, fontSize: 20, color: DESIGN.colors.textSecondary, letterSpacing: "0.1em" }}>{label}</div>
      <SourceTag text={source} opacity={0.45} />
    </div>
    <div style={{ fontFamily: DESIGN.fonts.display, fontSize: 56, fontWeight: 800, color }}>{value}</div>
  </div>
);

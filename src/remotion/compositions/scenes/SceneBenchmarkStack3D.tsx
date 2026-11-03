import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PerspectiveCamera } from "@react-three/drei";
import { DESIGN } from "../../designSystem";
import { useSpring, SafeZone } from "../shared/CADGrid";
import { KineticCaptions } from "../shared/KineticCaptions";

interface Props {
  caption: string;
}

interface Plate {
  label: string;
  value: string;
  color: string;
  delay: number;
  yTarget: number;
}

const PLATES: Plate[] = [
  { label: "MMLU", value: "90.0%", color: "#4A9EFF", delay: 15, yTarget: 1.4 },
  { label: "ImageNet", value: "91.1%", color: "#9B5DE5", delay: 45, yTarget: 0 },
  { label: "HumanEval", value: "84.9%", color: "#00D084", delay: 75, yTarget: -1.4 },
];

/**
 * 3D exploded layer stack — hero moment for the benchmark reveal.
 * Reserved for this scene only per CLAUDE.md (2D/2.5D is default elsewhere).
 */
export const SceneBenchmarkStack3D: React.FC<Props> = ({ caption }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const cameraOrbit = frame * 0.004;
  const cameraRadius = 6;
  const cameraX = Math.sin(cameraOrbit) * cameraRadius;
  const cameraZ = Math.cos(cameraOrbit) * cameraRadius;

  const headerIn = useSpring(frame, fps, 0, "smooth");

  return (
    <AbsoluteFill style={{ background: DESIGN.colors.bgDeep }}>
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height} linear>
          <ambientLight intensity={0.6} />
          <pointLight position={[3, 3, 3]} intensity={1.2} color="#4A9EFF" />
          <pointLight position={[-3, -2, 2]} intensity={0.6} color="#9B5DE5" />
          <PerspectiveCameraRig x={cameraX} z={cameraZ} />
          {PLATES.map((p) => (
            <Plate3D key={p.label} plate={p} frame={frame} fps={fps} />
          ))}
        </ThreeCanvas>
      </AbsoluteFill>

      <SafeZone centerV={false}>
        <div style={{ marginTop: 40, fontFamily: DESIGN.fonts.mono, fontSize: 22, letterSpacing: "0.2em", color: DESIGN.colors.accent, textTransform: "uppercase", opacity: headerIn }}>
          3 BENCHMARKS · AI VS HUMAN
        </div>
      </SafeZone>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 190 }}>
        <KineticCaptions text={caption} startFrame={0} fontSize={28} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PerspectiveCameraRig: React.FC<{ x: number; z: number }> = ({ x, z }) => {
  return <PerspectiveCamera makeDefault position={[x, 0.4, z]} fov={50} onUpdate={(cam) => cam.lookAt(0, 0, 0)} />;
};

const Plate3D: React.FC<{ plate: Plate; frame: number; fps: number }> = ({ plate, frame, fps }) => {
  const s = useSpring(frame, fps, plate.delay, "smooth");
  const y = plate.yTarget * s;
  const opacity = s;
  const scale = 0.6 + 0.4 * s;

  return (
    <group position={[0, y, 0]}>
      <mesh scale={[2.4, 0.5, 1.2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={plate.color}
          transparent
          opacity={0.25 * opacity}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <mesh scale={[2.4, 0.04, 1.2]} position={[0, 0.25, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={plate.color} transparent opacity={opacity} />
      </mesh>
    </group>
  );
};

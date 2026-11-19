import React, { useMemo, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mindNestForDay } from "../content/mindnest/fables";

/**
 * SAMPLE — MindNest Tales in cute "animated-film" 3D. Fable #1 (patience): Chintu the cheetah cub, his mum Rani and a
 * blue butterfly. Every character, prop and set piece is built from three.js primitives in code (no models, no AI,
 * no licences). The 3D picture is language-free; only the caption/title text (read from content/mindnest/fables.ts)
 * changes per language, so the same visuals serve all 7 MindNest channels.
 */

// ---------------------------------------------------------------- palette / materials
const C = {
  fur: "#F8AE3C", furMom: "#EE9E34", cream: "#FFEBCB", spot: "#5A3A22", nose: "#3A2418", tear: "#3A2418",
  pinkEar: "#F7A6A0", blush: "#FF8C8C", scarf: "#F0533F", iris: "#6B3E1E", irisMom: "#4E6B2A",
  grass: "#9ED47A", grass2: "#86C766", hill1: "#B5E08E", hill2: "#7FC27A", trunk: "#A9744F", leaf: "#6CC36A", leaf2: "#8AD67C",
  mud: "#8A5A36", wing: "#4FA8FF", wing2: "#9BD6FF"
};

const Fur: React.FC<{ c: string }> = ({ c }) => (
  <meshPhysicalMaterial color={c} roughness={0.55} clearcoat={0.25} clearcoatRoughness={0.5} sheen={0.8} sheenRoughness={0.6} sheenColor="#fff4d8" />
);
const Gloss: React.FC<{ c: string; r?: number }> = ({ c, r = 0.25 }) => <meshPhysicalMaterial color={c} roughness={r} clearcoat={1} clearcoatRoughness={0.08} />;
const Soft: React.FC<{ c: string }> = ({ c }) => <meshStandardMaterial color={c} roughness={0.9} />;
const Unlit: React.FC<{ c: string; o?: number }> = ({ c, o = 1 }) => <meshBasicMaterial color={c} transparent={o < 1} opacity={o} depthWrite={o >= 1} />;

/** Soft radial "blob" texture for contact shadows and glows. */
function useBlob(): THREE.Texture {
  return useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    const g = cv.getContext("2d")!;
    const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    gr.addColorStop(0, "rgba(40,60,20,0.55)");
    gr.addColorStop(0.6, "rgba(40,60,20,0.22)");
    gr.addColorStop(1, "rgba(40,60,20,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}
const Blob: React.FC<{ x: number; z: number; s: number; o?: number }> = ({ x, z, s, o = 1 }) => {
  const tex = useBlob();
  return (
    <mesh position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]} scale={[s, s * 0.75, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent opacity={o} depthWrite={false} />
    </mesh>
  );
};

/** Place a child on a sphere surface: yaw/pitch in radians, r = radius. */
const OnSphere: React.FC<{ yaw: number; pitch: number; r: number; children: React.ReactNode }> = ({ yaw, pitch, r, children }) => (
  <group rotation={[0, yaw, 0]}>
    <group rotation={[-pitch, 0, 0]}>
      <group position={[0, 0, r]}>{children}</group>
    </group>
  </group>
);

// ---------------------------------------------------------------- characters
type Mood = "happy" | "excited" | "sad" | "content";

interface EyeProps { side: 1 | -1; blink: number; look: [number, number]; mood: Mood; big: number; iris: string; lashes: boolean }
const Eye: React.FC<EyeProps> = ({ side, blink, look, mood, big, iris, lashes }) => {
  const closed = mood === "content";
  return (
    <OnSphere yaw={side * 0.33} pitch={0.12} r={0.56}>
      {closed ? (
        // happy closed eye: ^ arc
        <mesh position={[0, -0.02, 0.05]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.1 * big, 0.026, 10, 24, Math.PI]} />
          <Unlit c={C.nose} />
        </mesh>
      ) : (
        <group scale={[big, big * Math.max(0.06, blink), big]}>
          <mesh scale={[1, 1.12, 0.62]}><sphereGeometry args={[0.19, 22, 22]} /><Gloss c="#ffffff" r={0.15} /></mesh>
          <group position={[look[0] * 0.03, look[1] * 0.03, 0.01]}>
            <mesh position={[0, -0.01, 0.085]} scale={[1, 1.1, 0.5]}><sphereGeometry args={[0.145, 22, 22]} /><Gloss c={iris} r={0.1} /></mesh>
            <mesh position={[0, -0.01, 0.125]} scale={[1, 1.1, 0.4]}><sphereGeometry args={[0.085, 16, 16]} /><Gloss c="#120a06" r={0.05} /></mesh>
            <mesh position={[0.05 * side, 0.06, 0.16]}><sphereGeometry args={[0.045, 16, 16]} /><Unlit c="#ffffff" /></mesh>
            <mesh position={[-0.045 * side, -0.06, 0.155]}><sphereGeometry args={[0.022, 12, 12]} /><Unlit c="#ffffff" /></mesh>
          </group>
          {/* sad: droopy upper lid */}
          {mood === "sad" && (
            <mesh position={[0, 0.12, 0.02]} rotation={[0, 0, side * -0.35]} scale={[1.15, 0.5, 0.7]}>
              <sphereGeometry args={[0.17, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} /><Fur c={C.fur} />
            </mesh>
          )}
          {lashes && [0, 1, 2].map((i) => (
            <mesh key={i} position={[side * (0.1 + i * 0.035), 0.15 - i * 0.03, 0.04]} rotation={[0, 0, side * (-0.6 - i * 0.35)]}>
              <capsuleGeometry args={[0.012, 0.07, 4, 8]} /><Unlit c={C.nose} />
            </mesh>
          ))}
        </group>
      )}
      {/* eyebrow */}
      <mesh position={[side * 0.02, mood === "excited" ? 0.31 : 0.27, 0.02]} rotation={[0, 0, Math.PI / 2 + (mood === "sad" ? side * 0.4 : side * -0.15)]}>
        <capsuleGeometry args={[0.022, 0.1, 4, 8]} /><Unlit c={C.spot} />
      </mesh>
    </OnSphere>
  );
};

const Mouth: React.FC<{ mood: Mood; open: number }> = ({ mood, open }) => {
  if (mood === "sad") {
    return <mesh position={[0, -0.33, 0.62]}><torusGeometry args={[0.07, 0.018, 8, 20, Math.PI]} /><Unlit c={C.nose} /></mesh>;
  }
  if (mood === "excited" || open > 0.05) {
    const o = Math.max(open, 0.6);
    return (
      <group position={[0, -0.35, 0.6]}>
        <mesh scale={[1.15, o * 1.1, 0.5]}><sphereGeometry args={[0.11, 16, 16]} /><Gloss c="#5a1a22" r={0.4} /></mesh>
        <mesh position={[0, -0.05 * o, 0.03]} scale={[1, 0.5 * o, 0.5]}><sphereGeometry args={[0.08, 16, 16]} /><Gloss c="#ff7d8f" r={0.4} /></mesh>
      </group>
    );
  }
  // "w" cat smile
  return (
    <group position={[0, -0.31, 0.6]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.05, 0, 0]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.05, 0.015, 8, 20, Math.PI]} /><Unlit c={C.nose} /></mesh>
      ))}
    </group>
  );
};

const SPOTS_HEAD: [number, number, number][] = [[0.0, 0.85, 0.07], [0.35, 0.7, 0.06], [-0.4, 0.72, 0.065], [0.8, 0.45, 0.06], [-0.85, 0.4, 0.06], [1.05, 0.05, 0.05], [-1.1, 0.1, 0.055], [0.2, 1.05, 0.05], [-0.25, 1.1, 0.05], [1.3, 0.55, 0.05], [-1.35, 0.6, 0.05]];
const SPOTS_BODY: [number, number, number][] = [[0.9, 0.3, 0.07], [-0.95, 0.25, 0.07], [1.2, -0.2, 0.06], [-1.25, -0.25, 0.065], [0.7, 0.75, 0.06], [-0.6, 0.8, 0.06], [1.6, 0.2, 0.07], [-1.65, 0.1, 0.07], [2.2, 0.4, 0.07], [-2.3, -0.1, 0.07], [3.1, 0.3, 0.07]];

const TAIL_CURVE = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.35, 0.05, -0.05), new THREE.Vector3(0.6, 0.35, -0.1), new THREE.Vector3(0.62, 0.75, -0.12), new THREE.Vector3(0.45, 0.95, -0.1)]);
const TailTube: React.FC<{ fur: string }> = ({ fur }) => (
  <>
    <mesh><tubeGeometry args={[TAIL_CURVE, 48, 0.085, 16, false]} /><Fur c={fur} /></mesh>
    {[0.62, 0.74, 0.86].map((u) => {
      const p = TAIL_CURVE.getPointAt(u);
      const tg = TAIL_CURVE.getTangentAt(u);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tg);
      return <mesh key={u} position={p} quaternion={q}><torusGeometry args={[0.085, 0.022, 10, 24]} /><Soft c={C.spot} /></mesh>;
    })}
    <mesh position={TAIL_CURVE.getPointAt(1)}><sphereGeometry args={[0.09, 14, 14]} /><Fur c={C.spot} /></mesh>
  </>
);

export interface CheetahProps {
  t: number; x: number; z?: number; scale?: number; mom?: boolean; mood?: Mood; face?: number;
  hop?: number; walk?: number; tilt?: number; look?: [number, number]; mud?: number; open?: number; lean?: number;
}

/** Chibi cheetah: huge glossy head, big eyes with highlights, soft round body, tear marks, spots, curly tail. */
export const Cheetah: React.FC<CheetahProps> = ({ t, x, z = 0, scale = 1, mom = false, mood = "happy", face = 0, hop = 0, walk = 0, tilt = 0, look = [0, 0], mud = 0, open = 0, lean = 0 }) => {
  const fur = mom ? C.furMom : C.fur;
  // blink every ~3.3s (offset for mom), 4 frames
  const ph = (t + (mom ? 1.3 : 0)) % 3.3;
  const blink = ph < 0.13 ? Math.abs(ph - 0.065) / 0.065 : 1;
  const breathe = 1 + Math.sin(t * 2.4) * 0.018;
  const squash = 1 - Math.min(0, hop) * 0;
  const hopY = Math.max(0, hop);
  const land = hop < 0 ? -hop : 0; // negative hop = landing squash amount
  const sx = (1 + land * 0.12) * breathe, sy = (1 - land * 0.12) * squash;
  const leg = Math.sin(walk) * 0.7;
  const headR = mom ? 0.92 : 1;
  const tail = Math.sin(t * 2.2 + (mom ? 1 : 0)) * 0.25;
  return (
    <group position={[x, 0, z]} scale={scale}>
      <Blob x={0} z={0.05} s={1.5 - hopY * 0.6} o={1 - hopY * 0.5} />
      <group position={[0, hopY, 0]} rotation={[lean, face, 0]} scale={[sx, sy, sx]}>
        {/* tail: smooth tube with dark rings near the tip */}
        <group position={[0.3, 0.25, -0.35]} rotation={[0.15, 0, tail]}>
          <TailTube fur={fur} />
        </group>
        {/* hind feet */}
        {[-1, 1].map((s) => (
          <group key={`h${s}`} position={[s * 0.3, 0.1, 0.12]} rotation={[s * leg * 0.4, s * 0.3, 0]}>
            <mesh scale={[1, 0.62, 1.35]}><sphereGeometry args={[0.2, 18, 18]} /><Fur c={fur} /></mesh>
            {[-1, 0, 1].map((k) => <mesh key={k} position={[k * 0.065, -0.02, 0.24]}><sphereGeometry args={[0.045, 12, 12]} /><Fur c={C.cream} /></mesh>)}
          </group>
        ))}
        {/* body */}
        <mesh position={[0, 0.62, 0]} scale={[1, 1.12, 0.95]}><sphereGeometry args={[0.5, 28, 28]} /><Fur c={fur} /></mesh>
        <mesh position={[0, 0.56, 0.2]} scale={[0.72, 0.9, 0.62]}><sphereGeometry args={[0.5, 26, 26]} /><Fur c={C.cream} /></mesh>
        <group position={[0, 0.62, 0]} scale={[1, 1.12, 0.95]}>
          {SPOTS_BODY.map(([yaw, pitch, r], i) => (
            <OnSphere key={i} yaw={yaw} pitch={pitch - 0.2} r={0.495}>
              <mesh scale={[1, 0.85, 0.25]}><sphereGeometry args={[r * 1.2, 12, 12]} /><Soft c={C.spot} /></mesh>
            </OnSphere>
          ))}
        </group>
        {/* front legs */}
        {[-1, 1].map((s) => (
          <group key={`f${s}`} position={[s * 0.22, 0.5, 0.25]} rotation={[-s * leg * 0.6 + (mood === "excited" ? -0.3 : 0), 0, 0]}>
            <mesh position={[0, -0.18, 0.05]}><capsuleGeometry args={[0.11, 0.28, 10, 20]} /><Fur c={fur} /></mesh>
            <mesh position={[0, -0.38, 0.1]} scale={[1, 0.75, 1.15]}><sphereGeometry args={[0.135, 16, 16]} /><Fur c={C.cream} /></mesh>
          </group>
        ))}
        {/* scarf (Chintu) */}
        {!mom && (
          <group position={[0, 0.98, 0.04]}>
            <mesh rotation={[Math.PI / 2 - 0.25, 0, 0]}><torusGeometry args={[0.4, 0.12, 18, 40]} /><Gloss c={C.scarf} r={0.5} /></mesh>
            <mesh position={[0.4, -0.2, 0.2]} rotation={[0.2, 0, 0.25 + Math.sin(t * 3) * 0.08]} scale={[1, 1, 0.45]}><capsuleGeometry args={[0.08, 0.2, 8, 16]} /><Gloss c={C.scarf} r={0.5} /></mesh>
            <mesh position={[0.34, -0.04, 0.3]}><sphereGeometry args={[0.11, 14, 14]} /><Gloss c={C.scarf} r={0.5} /></mesh>
          </group>
        )}
        {/* head */}
        <group position={[0, 1.33, 0.04]} rotation={[0.04 + Math.sin(t * 1.7) * 0.03, look[0] * 0.15, tilt]} scale={headR}>
          <mesh scale={[1.13, 0.97, 1]}><sphereGeometry args={[0.62, 36, 36]} /><Fur c={fur} /></mesh>
          {/* spots on head */}
          <group scale={[1.13, 0.97, 1]}>
            {SPOTS_HEAD.map(([yaw, pitch, r], i) => (
              <OnSphere key={i} yaw={yaw * 1.05} pitch={pitch} r={0.615}>
                <mesh scale={[1, 0.85, 0.22]}><sphereGeometry args={[r, 12, 12]} /><Soft c={C.spot} /></mesh>
              </OnSphere>
            ))}
          </group>
          {/* ears */}
          {[-1, 1].map((s) => (
            <group key={`e${s}`} position={[s * 0.48, 0.42, -0.08]} rotation={[0, 0, s * -0.55 + Math.sin(t * 1.3 + s) * 0.04]}>
              <mesh scale={[1, 1.05, 0.5]}><sphereGeometry args={[0.2, 18, 18]} /><Fur c={fur} /></mesh>
              <mesh position={[0, -0.01, 0.07]} scale={[0.68, 0.72, 0.3]}><sphereGeometry args={[0.2, 16, 16]} /><Soft c={C.pinkEar} /></mesh>
              <mesh position={[0, 0.06, -0.06]} scale={[0.9, 0.6, 0.4]}><sphereGeometry args={[0.18, 16, 16]} /><Soft c={C.spot} /></mesh>
            </group>
          ))}
          {/* muzzle */}
          <mesh position={[0, -0.22, 0.42]} scale={[1.25, 0.82, 0.85]}><sphereGeometry args={[0.27, 26, 26]} /><Fur c={C.cream} /></mesh>
          <mesh position={[0, -0.36, 0.38]} scale={[0.9, 0.55, 0.8]}><sphereGeometry args={[0.2, 22, 22]} /><Fur c={C.cream} /></mesh>
          {/* nose */}
          <mesh position={[0, -0.12, 0.66]} scale={[1.45, 0.95, 0.9]} rotation={[0.3, 0, 0]}><sphereGeometry args={[0.075, 16, 16]} /><Gloss c={C.nose} r={0.15} /></mesh>
          {/* cheetah tear marks: inner eye corner down the muzzle */}
          {[-1, 1].map((s) => (
            <mesh key={`t${s}`} position={[s * 0.2, -0.1, 0.6]} rotation={[-0.35, s * 0.35, s * 0.32]}><capsuleGeometry args={[0.018, 0.15, 6, 10]} /><Unlit c={C.tear} /></mesh>
          ))}
          <Mouth mood={mood} open={open} />
          {/* blush */}
          {[-1, 1].map((s) => (
            <OnSphere key={`b${s}`} yaw={s * 0.68} pitch={-0.28} r={0.59}>
              <mesh scale={[1.3, 0.8, 0.2]}><sphereGeometry args={[0.085, 16, 16]} /><Unlit c={C.blush} o={0.55} /></mesh>
            </OnSphere>
          ))}
          {/* whisker dots */}
          {[-1, 1].map((s) => [0, 1, 2].map((k) => (
            <mesh key={`w${s}${k}`} position={[s * (0.13 + (k % 2) * 0.06), -0.2 - k * 0.04, 0.6 - k * 0.01]}><sphereGeometry args={[0.012, 8, 8]} /><Unlit c={C.spot} /></mesh>
          )))}
          {[-1, 1].map((s) => (
            <Eye key={`y${s}`} side={s as 1 | -1} blink={blink} look={look} mood={mood} big={mom ? 0.92 : 1.06} iris={mom ? C.irisMom : C.iris} lashes={mom} />
          ))}
          {/* mud splats on face */}
          {mud > 0 && [[0.5, 0.3, 0.09], [-0.6, -0.1, 0.07], [0.9, -0.2, 0.06], [-0.2, 0.75, 0.08]].map(([yaw, pitch, r], i) => (
            <group key={`m${i}`} scale={[1.13, 0.97, 1]}>
              <OnSphere yaw={yaw!} pitch={pitch!} r={0.62}>
                <mesh scale={[mud, mud * 0.8, mud * 0.35]}><sphereGeometry args={[r!, 14, 14]} /><Gloss c={"#6B4226"} r={0.2} /></mesh>
              </OnSphere>
            </group>
          ))}
        </group>
        {mud > 0 && [[0.25, 0.75, 0.42, 0.12], [-0.3, 0.5, 0.4, 0.1], [0.05, 0.3, 0.46, 0.09]].map(([mx, my, mz, r], i) => (
          <mesh key={`bm${i}`} position={[mx!, my!, mz!]} scale={[mud, mud * 0.8, mud * 0.4]}><sphereGeometry args={[r!, 14, 14]} /><Gloss c={C.mud} r={0.35} /></mesh>
        ))}
      </group>
    </group>
  );
};

export const Butterfly: React.FC<{ t: number; pos: [number, number, number]; flap?: number; s?: number; yaw?: number; perched?: boolean }> = ({ t, pos, flap = 14, s = 1, yaw = 0, perched = false }) => {
  const a = perched ? 0.15 + (Math.sin(t * 5) * 0.5 + 0.5) * 0.35 : 0.25 + (Math.sin(t * flap) * 0.5 + 0.5) * 1.05;
  const Wing: React.FC<{ side: 1 | -1 }> = ({ side }) => (
    <group rotation={[0, side * a, 0]}>
      <mesh position={[side * 0.2, 0.1, 0]} rotation={[0, 0, side * 0.35]} scale={[1, 1.15, 1]}><circleGeometry args={[0.2, 32]} /><meshPhysicalMaterial color={C.wing} side={THREE.DoubleSide} roughness={0.2} clearcoat={1} emissive={C.wing} emissiveIntensity={0.25} /></mesh>
      <mesh position={[side * 0.22, 0.12, 0.002 * side]} rotation={[0, 0, side * 0.35]}><circleGeometry args={[0.09, 24]} /><meshBasicMaterial color={C.wing2} side={THREE.DoubleSide} /></mesh>
      <mesh position={[side * 0.13, -0.12, 0]} rotation={[0, 0, side * -0.5]}><circleGeometry args={[0.12, 28]} /><meshPhysicalMaterial color="#2F7FE0" side={THREE.DoubleSide} roughness={0.2} clearcoat={1} emissive="#2F7FE0" emissiveIntensity={0.2} /></mesh>
    </group>
  );
  return (
    <group position={pos} rotation={[perched ? -0.2 : 0.35, yaw, 0]} scale={s}>
      <Wing side={1} />
      <Wing side={-1} />
      <mesh><capsuleGeometry args={[0.035, 0.24, 6, 12]} /><Gloss c="#2B2440" /></mesh>
      <mesh position={[0, 0.17, 0]}><sphereGeometry args={[0.05, 14, 14]} /><Gloss c="#2B2440" /></mesh>
      {[-1, 1].map((k) => (
        <group key={k}>
          <mesh position={[k * 0.05, 0.27, 0.02]} rotation={[0, 0, -k * 0.4]}><cylinderGeometry args={[0.006, 0.006, 0.18, 6]} /><Unlit c="#2B2440" /></mesh>
          <mesh position={[k * 0.09, 0.355, 0.02]}><sphereGeometry args={[0.02, 8, 8]} /><Unlit c="#2B2440" /></mesh>
        </group>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- set
const Tree: React.FC<{ x: number; z: number; s: number; t: number }> = ({ x, z, s, t }) => (
  <group position={[x, 0, z]} scale={s} rotation={[0, 0, Math.sin(t * 0.9 + x) * 0.02]}>
    <mesh position={[0, 0.9, 0]}><cylinderGeometry args={[0.14, 0.22, 1.8, 16]} /><Soft c={C.trunk} /></mesh>
    <mesh position={[0, 2.1, 0]}><sphereGeometry args={[0.95, 26, 26]} /><Fur c={C.leaf} /></mesh>
    <mesh position={[0.6, 1.7, 0.2]}><sphereGeometry args={[0.6, 22, 22]} /><Fur c={C.leaf2} /></mesh>
    <mesh position={[-0.6, 1.8, 0.15]}><sphereGeometry args={[0.65, 22, 22]} /><Fur c={C.leaf2} /></mesh>
    <mesh position={[0.1, 2.75, 0.1]}><sphereGeometry args={[0.55, 22, 22]} /><Fur c={C.leaf2} /></mesh>
  </group>
);
const Cloud: React.FC<{ x: number; y: number; z: number; s: number }> = ({ x, y, z, s }) => (
  <group position={[x, y, z]} scale={s}>
    {[[0, 0, 0.6], [0.6, -0.1, 0.45], [-0.6, -0.12, 0.45], [0.25, 0.3, 0.45], [-0.3, 0.22, 0.4]].map(([cx, cy, r], i) => (
      <mesh key={i} position={[cx!, cy!, 0]}><sphereGeometry args={[r!, 18, 18]} /><meshStandardMaterial color="#ffffff" roughness={1} emissive="#ffffff" emissiveIntensity={0.35} /></mesh>
    ))}
  </group>
);
const Flower: React.FC<{ x: number; z: number; c: string; t: number }> = ({ x, z, c, t }) => (
  <group position={[x, 0, z]} rotation={[0, 0, Math.sin(t * 2 + x * 3) * 0.08]}>
    <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.012, 0.012, 0.3, 6]} /><Soft c="#4E9B45" /></mesh>
    {Array.from({ length: 5 }, (_, i) => (
      <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 0.05, 0.31 + Math.sin((i / 5) * Math.PI * 2) * 0.05, 0]}><sphereGeometry args={[0.045, 12, 12]} /><Gloss c={c} r={0.5} /></mesh>
    ))}
    <mesh position={[0, 0.31, 0.02]}><sphereGeometry args={[0.035, 12, 12]} /><Gloss c="#FFD34D" /></mesh>
  </group>
);

const FLOWERS: [number, number, string][] = [[-1.7, 0.6, "#FF8FB1"], [-1.3, 1.4, "#FFFFFF"], [1.5, 1.1, "#FFB347"], [1.9, 0.2, "#FF8FB1"], [-2.2, -0.6, "#C9A0FF"], [2.3, -0.9, "#FFFFFF"], [0.9, 1.9, "#C9A0FF"], [-0.8, 2.1, "#FFB347"], [2.8, 1.6, "#FF8FB1"], [-2.9, 1.2, "#FFFFFF"]];

const Meadow: React.FC<{ t: number }> = ({ t }) => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[40, 64]} /><meshStandardMaterial color={C.grass} roughness={1} /></mesh>
    {/* rolling hills */}
    <mesh position={[-6, -5.2, -14]}><sphereGeometry args={[8, 28, 28]} /><Fur c={C.hill1} /></mesh>
    <mesh position={[7, -6.4, -16]}><sphereGeometry args={[9, 28, 28]} /><Fur c={C.hill2} /></mesh>
    <mesh position={[0, -9, -24]}><sphereGeometry args={[12, 28, 28]} /><Fur c="#A5D98A" /></mesh>
    <Tree x={-3.2} z={-3} s={1.15} t={t} />
    <Tree x={3.4} z={-4} s={1.3} t={t} />
    <Tree x={-6} z={-9} s={1.6} t={t} />
    <Tree x={5.5} z={-11} s={1.8} t={t} />
    <Cloud x={-2.5 + t * 0.08} y={6.8} z={-12} s={1.3} />
    <Cloud x={3.5 + t * 0.05} y={8.2} z={-16} s={1.7} />
    {/* sun */}
    <mesh position={[3.6, 9.5, -20]}><circleGeometry args={[1.4, 48]} /><meshBasicMaterial color="#FFE28A" /></mesh>
    <mesh position={[3.6, 9.5, -20.1]}><circleGeometry args={[2.2, 48]} /><meshBasicMaterial color="#FFF2B8" transparent opacity={0.5} /></mesh>
    {FLOWERS.map(([x, z, c], i) => <Flower key={i} x={x} z={z} c={c} t={t} />)}
    {/* grass tufts */}
    {Array.from({ length: 26 }, (_, i) => {
      const x = Math.sin(i * 12.7) * 3.4, z = Math.cos(i * 5.3) * 2.2 - 0.5;
      return <mesh key={i} position={[x, 0.04, z]} scale={[1, 0.5, 1]}><sphereGeometry args={[0.12 + (i % 3) * 0.04, 12, 12]} /><Fur c={i % 2 ? C.grass2 : "#B3E28F"} /></mesh>;
    })}
  </>
);

const Lights: React.FC = () => (
  <>
    <hemisphereLight args={["#E4F4FF", "#E8D7A8", 1.15]} />
    <directionalLight position={[3, 6, 6]} intensity={2.1} color="#FFF1DA" />
    <directionalLight position={[-4, 3, -4]} intensity={1.4} color="#FFE2F0" />
    <directionalLight position={[-3, 2, 5]} intensity={0.55} color="#CDE8FF" />
  </>
);

const Cam: React.FC<{ pos: [number, number, number]; target: [number, number, number] }> = ({ pos, target }) => {
  const { camera } = useThree();
  camera.position.set(...pos);
  camera.lookAt(...target);
  camera.updateProjectionMatrix();
  return null;
};

const ease = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => x * x * (3 - 2 * x) });
/** Periodic hop: returns >0 in air, <0 briefly on landing (squash). */
const hopCurve = (t: number, period: number, h: number) => {
  const p = (t % period) / period;
  if (p < 0.7) return Math.sin((p / 0.7) * Math.PI) * h;
  return -Math.sin(((p - 0.7) / 0.3) * Math.PI) * 0.6;
};

// ---------------------------------------------------------------- scenes
type SceneFC = React.FC<{ f: number; fps: number }>;

/** 1 — Chintu and mum Rani in the meadow; Chintu bounces happily. */
const S1: SceneFC = ({ f, fps }) => {
  const t = f / fps;
  const camZ = ease(f, 0, 140, 11.6, 10.4);
  return (
    <>
      <Cam pos={[0.2, 2.0, camZ]} target={[0, 1.55, 0]} />
      <Lights /><Meadow t={t} />
      <Cheetah t={t} x={-0.75} z={-0.3} scale={1.32} mom face={0.35} tilt={Math.sin(t * 1.1) * 0.08 + 0.1} look={[0.6, -0.2]} />
      <Cheetah t={t} x={0.75} z={0.2} face={-0.3} hop={hopCurve(t, 0.9, 0.32)} tilt={Math.sin(t * 2) * 0.1} mood={t > 2.4 ? "excited" : "happy"} look={[-0.4, 0.3]} />
    </>
  );
};

/** 2 — A shiny blue butterfly; Chintu spots it and runs after it. */
const S2: SceneFC = ({ f, fps }) => {
  const t = f / fps;
  const run = ease(f, 40, 135, 0, 1);
  const cx = -0.6 + run * 1.6;
  const bx = 0.4 + Math.sin(t * 1.4) * 0.6 + run * 1.4, by = 2.6 + Math.sin(t * 2.3) * 0.3;
  return (
    <>
      <Cam pos={[ease(f, 0, 135, -0.2, 1.1), 2.1, 10.2]} target={[ease(f, 0, 135, 0, 1.0), 1.75, 0]} />
      <Lights /><Meadow t={t} />
      <Butterfly t={t} pos={[bx, by, 0.6]} s={1.25} yaw={Math.sin(t) * 0.5} />
      <Cheetah t={t} x={cx} z={0.3} face={run > 0 ? 0.55 : 0.15} mood="excited" open={0.8}
        hop={run > 0 ? hopCurve(t, 0.42, 0.35) : 0} walk={t * 15 * (run > 0 ? 1 : 0)} lean={run > 0 ? 0.12 : 0}
        look={[0.5, 1]} tilt={-0.12} />
    </>
  );
};

/** 3 — Splash! Chintu slips into the mud; the butterfly flies away. */
const S3: SceneFC = ({ f, fps }) => {
  const t = f / fps;
  const slip = ease(f, 18, 40, 0, 1);
  const mud = ease(f, 32, 44, 0, 1);
  const sit = f > 40;
  const splash = interpolate(f, [34, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Cam pos={[0, 2.2, ease(f, 0, 135, 10.0, 8.6)]} target={[0, 1.35, 0]} />
      <Lights /><Meadow t={t} />
      {/* puddle */}
      <mesh position={[0, 0.02, 0.2]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.6, 1.05, 1]}><circleGeometry args={[1, 48]} /><meshPhysicalMaterial color={C.mud} roughness={0.15} clearcoat={1} /></mesh>
      <mesh position={[0, 0.01, 0.2]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.75, 1.18, 1]}><circleGeometry args={[1, 48]} /><Soft c="#6E4A2C" /></mesh>
      {splash > 0 && splash < 1 && Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const r = splash * 1.3;
        return <mesh key={i} position={[Math.cos(a) * r, Math.sin(splash * Math.PI) * (0.6 + (i % 3) * 0.25), 0.2 + Math.sin(a) * r * 0.5]} scale={1 - splash * 0.6}><sphereGeometry args={[0.07, 12, 12]} /><Gloss c={C.mud} /></mesh>;
      })}
      <Butterfly t={t} pos={[0.9 + t * 0.35, 2.7 + t * 0.35, -0.5]} s={1.1} />
      <Cheetah t={t} x={0} z={0.2} face={sit ? 0 : 0.5 - slip * 0.5} lean={sit ? -0.08 : slip * 0.5}
        hop={sit ? 0 : -slip * 0.5 + (slip > 0 && slip < 0.6 ? 0.3 * Math.sin(slip * Math.PI / 0.6) : 0)}
        mood={sit ? "sad" : "excited"} open={sit ? 0 : 0.8} mud={mud} tilt={sit ? 0.18 : 0} look={sit ? [0, -0.6] : [0.6, 1]} />
    </>
  );
};

/** 4 — Rani: "sit still and wait". Chintu waits calmly… and the butterfly lands on his nose! */
const S4: SceneFC = ({ f, fps }) => {
  const t = f / fps;
  const land = ease(f, 50, 105, 0, 1);
  const landed = f >= 105;
  const nose: [number, number, number] = [0.62, 1.27, 1.0];
  const start: [number, number, number] = [2.2, 3.4, -0.5];
  const bp: [number, number, number] = landed ? [nose[0], nose[1] + Math.sin(t * 3) * 0.01, nose[2]]
    : [start[0] + (nose[0] - start[0]) * land + Math.sin(t * 5) * 0.15 * (1 - land), start[1] + (nose[1] - start[1]) * land + Math.sin(t * 3.3) * 0.2 * (1 - land), start[2] + (nose[2] - start[2]) * land];
  const delight = f > 112;
  return (
    <>
      <Cam pos={[0.25, 2.0, ease(f, 0, 175, 10.6, 9.2)]} target={[0.1, 1.55, 0]} />
      <Lights /><Meadow t={t} />
      <Cheetah t={t} x={-0.8} z={-0.4} scale={1.32} mom face={0.4} tilt={0.14} look={[0.7, -0.2]} mood={f < 45 ? "happy" : "content"} />
      <Cheetah t={t} x={0.62} z={0.2} face={0} mood={delight ? "excited" : "content"} open={delight ? 0.5 : 0}
        look={delight ? [0, -0.9] : [0, 0]} tilt={delight ? Math.sin(t * 4) * 0.06 : -0.05}
        hop={delight && f > 140 ? hopCurve(t, 0.7, 0.12) : 0} />
      <Butterfly t={t} pos={bp} s={0.47} perched={landed} />
    </>
  );
};

// ---------------------------------------------------------------- overlays
const DEVA = "'Noto Sans Devanagari', Inter, sans-serif";

function useMindNestFonts() {
  const [h] = useState(() => delayRender("mindnest fonts"));
  useState(() => {
    const files: [string, string, string][] = [
      ["Noto Sans Devanagari", "noto-sans-devanagari-devanagari-700-normal.woff2", "700"],
      ["Noto Sans Devanagari", "noto-sans-devanagari-devanagari-900-normal.woff2", "900"],
      ["Inter", "inter-latin-900-normal.woff2", "900"]
    ];
    Promise.all(files.map(async ([fam, file, w]) => {
      const ff = new FontFace(fam, `url(${staticFile(`fonts/${file}`)}) format("woff2")`, { weight: w });
      await ff.load();
      document.fonts.add(ff);
    })).finally(() => continueRender(h));
    return null;
  });
}

const Caption: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - 4, fps, config: { damping: 14, stiffness: 140 } });
  const out = interpolate(f, [dur - 8, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1430, display: "flex", justifyContent: "center", opacity: Math.min(pop, out), transform: `translateY(${(1 - pop) * 40}px)` }}>
      <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 44, padding: "30px 40px", boxShadow: "0 14px 40px rgba(40,70,30,.25)", border: "6px solid #FFD34D",
        fontFamily: DEVA, fontWeight: 700, fontSize: 50, lineHeight: 1.45, color: "#3A2A1A", textAlign: "center" }}>{text}</div>
    </div>
  );
};

const Title: React.FC<{ a: string; b: string }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 6, fps, config: { damping: 11, stiffness: 120 } });
  return (
    <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", transform: `scale(${0.6 + s * 0.4})`, opacity: s }}>
      <div style={{ fontFamily: DEVA, fontWeight: 900, fontSize: 96, lineHeight: 1.25, color: "#ffffff", WebkitTextStroke: "3px #E2563A", textShadow: "0 8px 0 #E2563A, 0 18px 30px rgba(0,0,0,.25)" }}>{a}</div>
      <div style={{ fontFamily: DEVA, fontWeight: 900, fontSize: 110, lineHeight: 1.25, color: "#FFD34D", textShadow: "0 8px 0 #C2742A, 0 18px 30px rgba(0,0,0,.25)" }}>{b}</div>
    </div>
  );
};

const MoralCard: React.FC<{ label: string; text: string }> = ({ label, text }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 12, stiffness: 130 } });
  return (
    <div style={{ position: "absolute", top: 200, left: 110, right: 110, transform: `scale(${s})`, background: "linear-gradient(#FFF8E6,#FFE9B8)", borderRadius: 50, padding: "34px 30px 40px",
      border: "8px solid #F0533F", boxShadow: "0 20px 50px rgba(0,0,0,.25)", textAlign: "center" }}>
      <div style={{ fontFamily: DEVA, fontWeight: 900, fontSize: 52, color: "#F0533F" }}>{label}</div>
      <div style={{ fontFamily: DEVA, fontWeight: 900, fontSize: 70, lineHeight: 1.35, color: "#3A2A1A", whiteSpace: "pre-line", marginTop: 8 }}>{text}</div>
    </div>
  );
};

const Fade: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const o = Math.max(interpolate(f, [0, 8], [1, 0], { extrapolateRight: "clamp" }), interpolate(f, [dur - 6, dur], [0, 1], { extrapolateLeft: "clamp" }));
  return <AbsoluteFill style={{ background: "#FFF6E0", opacity: o, pointerEvents: "none" }} />;
};

const SceneCanvas: React.FC<{ S: SceneFC; dur: number }> = ({ S, dur: _d }) => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} camera={{ position: [0, 1.7, 8], fov: 36 }} gl={{ antialias: true, alpha: true }} style={{ position: "absolute", inset: 0 }}>
      <S f={f} fps={fps} />
    </ThreeCanvas>
  );
};

export const MINDNEST3D_SCENES = [135, 135, 135, 180] as const;
export const MINDNEST3D_FRAMES = MINDNEST3D_SCENES.reduce((a, b) => a + b, 0);

export const MindNest3D: React.FC<{ lang?: "hi" | "es" | "ar" | "de" | "ja" | "ko" | "fil"; fable?: number }> = ({ lang = "hi", fable = 1 }) => {
  useMindNestFonts();
  const story = useMemo(() => mindNestForDay(lang, fable), [lang, fable]);
  const titleLines = story.scenes[0]!.headlines[0]!.lines.map((l) => l.text.replace(/\u00a0/g, " "));
  const moralLayer = story.scenes[4]!.layers.find((l) => l.kind === "prop" && (l as { prop?: string }).prop === "moralCard") as { data?: { title?: string; text?: string } } | undefined;
  const scenes: SceneFC[] = [S1, S2, S3, S4];
  let at = 0;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #7FCBF2 0%, #BDE6F7 45%, #E9F7E1 100%)" }}>
      {scenes.map((S, i) => {
        const from = at;
        const dur = MINDNEST3D_SCENES[i]!;
        at += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SceneCanvas S={S} dur={dur} />
            {i === 0 && <Sequence durationInFrames={95}><Title a={titleLines[0] ?? ""} b={titleLines[1] ?? ""} /></Sequence>}
            {i === 3 && moralLayer?.data && <Sequence from={118}><MoralCard label={moralLayer.data.title ?? ""} text={moralLayer.data.text ?? ""} /></Sequence>}
            <Caption text={story.scenes[i]!.caption ?? ""} dur={dur} />
            <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 34, letterSpacing: 6, color: "#ffffff", textShadow: "0 3px 10px rgba(0,60,90,.35)" }}>MINDNEST TALES</div>
            <Fade dur={dur} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

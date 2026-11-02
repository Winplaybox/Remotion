import React, { useEffect, useRef, useState } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";

interface ThreeHeroSceneProps {
  label?: string;
}

export const ThreeHeroScene: React.FC<ThreeHeroSceneProps> = ({
  label = "MULTI-HEAD ATTENTION CORE",
}) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  // Synchronize Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const shellMeshRef = useRef<THREE.Mesh | null>(null);
  const ringMeshRef = useRef<THREE.LineSegments | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const width = 640;
      const height = 640;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 4.2;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(1);

      // 1. Inner Glowing Icosahedron (Core Weights)
      const coreGeo = new THREE.IcosahedronGeometry(1.0, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x00f5ff,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x003b5c,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      scene.add(coreMesh);

      // 2. Outer Wireframe Shell (Attention Heads)
      const shellGeo = new THREE.IcosahedronGeometry(1.4, 1);
      const shellMat = new THREE.MeshBasicMaterial({
        color: 0x7928ca,
        wireframe: true,
        transparent: true,
        opacity: 0.7,
      });
      const shellMesh = new THREE.Mesh(shellGeo, shellMat);
      scene.add(shellMesh);

      // 3. Orbital Data Rings
      const ringGeo = new THREE.RingGeometry(1.7, 1.74, 32);
      const wireRing = new THREE.WireframeGeometry(ringGeo);
      const ringLine = new THREE.LineSegments(
        wireRing,
        new THREE.LineBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.5 })
      );
      ringLine.rotation.x = Math.PI / 3;
      scene.add(ringLine);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const pointLight1 = new THREE.PointLight(0x00f5ff, 2.5, 50);
      pointLight1.position.set(3, 4, 3);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0x7928ca, 3.0, 50);
      pointLight2.position.set(-3, -3, 2);
      scene.add(pointLight2);

      sceneRef.current = scene;
      rendererRef.current = renderer;
      cameraRef.current = camera;
      coreMeshRef.current = coreMesh;
      shellMeshRef.current = shellMesh;
      ringMeshRef.current = ringLine;
    } catch {
      // Fallback for headless environments without WebGL
      setWebGlSupported(false);
    }

    return () => {
      rendererRef.current?.dispose();
    };
  }, []);

  // Update animation frame deterministically
  useEffect(() => {
    if (coreMeshRef.current && shellMeshRef.current && ringMeshRef.current && rendererRef.current && sceneRef.current && cameraRef.current) {
      const time = frame * 0.04;
      coreMeshRef.current.rotation.x = time * 0.8;
      coreMeshRef.current.rotation.y = time * 1.2;

      shellMeshRef.current.rotation.x = -time * 0.6;
      shellMeshRef.current.rotation.y = time * 0.9;

      ringMeshRef.current.rotation.z = time * 0.5;

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [frame]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 640,
          height: 640,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {webGlSupported ? (
          <canvas
            ref={canvasRef}
            width={640}
            height={640}
            style={{ width: "640px", height: "640px" }}
          />
        ) : (
          /* High-Fidelity 2.5D Fallback if WebGL unavailable */
          <div
            style={{
              width: "360px",
              height: "360px",
              borderRadius: "50%",
              background: "radial-gradient(circle, #00F5FF 0%, #7928CA 60%, transparent 80%)",
              boxShadow: "0 0 80px rgba(0, 245, 255, 0.6)",
              transform: `rotate(${frame * 2}deg) scale(${1 + Math.sin(frame * 0.1) * 0.05})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px dashed rgba(255, 255, 255, 0.4)",
            }}
          >
            <div
              style={{
                width: "240px",
                height: "240px",
                borderRadius: "50%",
                background: "#090E1A",
                border: "2px solid #00F5FF",
              }}
            />
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "16px",
          padding: "8px 24px",
          background: "rgba(0, 245, 255, 0.12)",
          border: "1px solid rgba(0, 245, 255, 0.4)",
          borderRadius: "999px",
          color: "#00F5FF",
          fontFamily: "'Segoe UI', Roboto, sans-serif",
          fontSize: "18px",
          fontWeight: 700,
          letterSpacing: "3px",
          textTransform: "uppercase",
          boxShadow: "0 0 20px rgba(0, 245, 255, 0.2)",
        }}
      >
        {label}
      </div>
    </div>
  );
};

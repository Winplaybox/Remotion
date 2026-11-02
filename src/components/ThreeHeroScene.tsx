import React, { useEffect, useRef, useState } from "react";
import { random, useCurrentFrame } from "remotion";
import * as THREE from "three";

interface ThreeHeroSceneProps {
  label?: string;
  sublabel?: string;
}

export const ThreeHeroScene: React.FC<ThreeHeroSceneProps> = ({
  label = "MULTI-HEAD ATTENTION CORE",
  sublabel = "8 Parallel Heads • 12,288 Dimension Embedding Space",
}) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const shellMeshRef = useRef<THREE.Mesh | null>(null);
  const ringMesh1Ref = useRef<THREE.LineSegments | null>(null);
  const ringMesh2Ref = useRef<THREE.LineSegments | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const width = 860;
      const height = 860;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 2.9; // Closer camera for massive, heroic presence

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(1);

      // 1. Massive Inner Glowing Core (Weight Matrix)
      const coreGeo = new THREE.IcosahedronGeometry(1.0, 2);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x00f5ff,
        metalness: 0.85,
        roughness: 0.15,
        emissive: 0x002d44,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      scene.add(coreMesh);

      // 2. Complex Outer Attention Shell
      const shellGeo = new THREE.IcosahedronGeometry(1.35, 1);
      const shellMat = new THREE.MeshBasicMaterial({
        color: 0x9333ea,
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      });
      const shellMesh = new THREE.Mesh(shellGeo, shellMat);
      scene.add(shellMesh);

      // 3. Dual Orbital Energy Rings
      const ringGeo1 = new THREE.RingGeometry(1.55, 1.58, 48);
      const wireRing1 = new THREE.WireframeGeometry(ringGeo1);
      const ringLine1 = new THREE.LineSegments(
        wireRing1,
        new THREE.LineBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.7 })
      );
      ringLine1.rotation.x = Math.PI / 3;
      scene.add(ringLine1);

      const ringGeo2 = new THREE.RingGeometry(1.75, 1.78, 48);
      const wireRing2 = new THREE.WireframeGeometry(ringGeo2);
      const ringLine2 = new THREE.LineSegments(
        wireRing2,
        new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 })
      );
      ringLine2.rotation.y = Math.PI / 4;
      scene.add(ringLine2);

      // 4. Floating Particle Cloud (Data Tokens)
      const particleCount = 80;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const radius = 1.6 + random(`r-${i}`) * 0.8;
        const theta = random(`th-${i}`) * Math.PI * 2;
        const phi = (random(`ph-${i}`) - 0.5) * Math.PI;
        positions[i * 3] = radius * Math.cos(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi);
        positions[i * 3 + 2] = radius * Math.cos(phi) * Math.sin(theta);
      }
      particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0x00f5ff,
        size: 0.05,
        transparent: true,
        opacity: 0.8,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // Dynamic Studio Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      const pointLight1 = new THREE.PointLight(0x00f5ff, 3.5, 40);
      pointLight1.position.set(4, 5, 4);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0x7928ca, 4.0, 40);
      pointLight2.position.set(-4, -4, 3);
      scene.add(pointLight2);

      sceneRef.current = scene;
      rendererRef.current = renderer;
      cameraRef.current = camera;
      coreMeshRef.current = coreMesh;
      shellMeshRef.current = shellMesh;
      ringMesh1Ref.current = ringLine1;
      ringMesh2Ref.current = ringLine2;
      particlesRef.current = particles;
    } catch {
      setWebGlSupported(false);
    }

    return () => {
      rendererRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (
      coreMeshRef.current &&
      shellMeshRef.current &&
      ringMesh1Ref.current &&
      ringMesh2Ref.current &&
      particlesRef.current &&
      rendererRef.current &&
      sceneRef.current &&
      cameraRef.current
    ) {
      const time = frame * 0.035;
      coreMeshRef.current.rotation.x = time * 0.8;
      coreMeshRef.current.rotation.y = time * 1.2;

      shellMeshRef.current.rotation.x = -time * 0.6;
      shellMeshRef.current.rotation.y = time * 0.9;

      ringMesh1Ref.current.rotation.z = time * 0.6;
      ringMesh2Ref.current.rotation.x = -time * 0.5;

      particlesRef.current.rotation.y = time * 0.3;

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
        width: "100%",
      }}
    >
      <div
        style={{
          width: 860,
          height: 860,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {webGlSupported ? (
          <canvas
            ref={canvasRef}
            width={860}
            height={860}
            style={{ width: "860px", height: "860px" }}
          />
        ) : (
          <div
            style={{
              width: "480px",
              height: "480px",
              borderRadius: "50%",
              background: "radial-gradient(circle, #00F5FF 0%, #7928CA 60%, transparent 80%)",
              boxShadow: "0 0 100px rgba(0, 245, 255, 0.7)",
              transform: `rotate(${frame * 2}deg)`,
            }}
          />
        )}
      </div>

      {/* Hero Dimension Callout Badge */}
      <div
        style={{
          marginTop: "-20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          zIndex: 20,
        }}
      >
        <div
          style={{
            padding: "10px 32px",
            background: "rgba(15, 23, 42, 0.9)",
            border: "1.5px solid #00F5FF",
            borderRadius: "999px",
            color: "#00F5FF",
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            fontSize: "22px",
            fontWeight: 800,
            letterSpacing: "3px",
            textTransform: "uppercase",
            boxShadow: "0 0 30px rgba(0, 245, 255, 0.35)",
          }}
        >
          {label}
        </div>
        {sublabel && (
          <div
            style={{
              color: "#94A3B8",
              fontFamily: "'Segoe UI', Roboto, sans-serif",
              fontSize: "16px",
              fontWeight: 500,
              letterSpacing: "1px",
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};

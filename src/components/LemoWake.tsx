import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface LemoWakeProps {
  imageSrc?: string;
  title?: string;
  badge?: string;
  accentColor?: string;
  diagramType?: "pipeline" | "lattice" | "chiplet" | "satellite" | "terminal" | "archive" | "attention";
  focalPoint?: { xPct: number; yPct: number; label: string };
  delay?: number;
}

export const LemoWake: React.FC<LemoWakeProps> = ({
  imageSrc,
  title = "Research Diagram",
  badge = "LEMO-WAKE ARCHITECTURE",
  accentColor = "#00F5FF",
  diagramType = "chiplet",
  focalPoint,
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

  // Render specific technical diagrams
  const renderDiagramSvg = () => {
    // 1. CHIPLET TEARDOWN (NVIDIA Blackwell B200 Dual-Die 10 TB/s NVLink)
    if (diagramType === "chiplet") {
      return (
        <svg width="880" height="580" viewBox="0 0 880 580" style={{ width: "100%", height: "100%" }}>
          <defs>
            <pattern id="chiplet-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(96,165,250,0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="880" height="580" fill="url(#chiplet-grid)" />

          {/* Substrate Base Package */}
          <rect x="80" y="80" width="720" height="420" rx="16" fill="#0A1832" stroke="#60A5FA" strokeWidth="2.5" />
          <text x="110" y="115" fill="#93C5FD" fontSize="16" fontWeight="bold">NVIDIA BLACKWELL B200 • SUBSTRATE #NV-884</text>
          <text x="770" y="115" fill="#60A5FA" fontSize="14" textAnchor="end">TDP: 1,200W</text>

          {/* Silicon Die 1 (Left) */}
          <g transform="translate(130, 150)">
            <rect x="0" y="0" width="260" height="290" rx="12" fill="#122A54" stroke="#60A5FA" strokeWidth="2" />
            <text x="130" y="40" fill="#FFFFFF" fontSize="18" fontWeight="900" textAnchor="middle">TSMC 4NP DIE #1</text>
            <text x="130" y="65" fill="#60A5FA" fontSize="13" textAnchor="middle">104 Billion Transistors</text>

            {/* Compute Cores */}
            <rect x="20" y="90" width="105" height="85" rx="6" fill="#1E3A8A" stroke="#93C5FD" strokeWidth="1" />
            <text x="72" y="138" fill="#FFFFFF" fontSize="13" fontWeight="bold" textAnchor="middle">Streaming MP</text>

            <rect x="135" y="90" width="105" height="85" rx="6" fill="#1E3A8A" stroke="#93C5FD" strokeWidth="1" />
            <text x="187" y="138" fill="#FFFFFF" fontSize="13" fontWeight="bold" textAnchor="middle">Tensor Core 5</text>

            {/* HBM3e Memory Stacks */}
            <rect x="20" y="195" width="220" height="70" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
            <text x="130" y="228" fill="#F59E0B" fontSize="14" fontWeight="bold" textAnchor="middle">96 GB HBM3e (8 TB/s)</text>
            <text x="130" y="250" fill="#94A3B8" fontSize="11" textAnchor="middle">Ultra-High Bandwidth Stack</text>
          </g>

          {/* 10 TB/s NVLink High-Speed Interconnect Bus (Center) */}
          <g transform="translate(415, 150)">
            <rect x="0" y="0" width="50" height="290" rx="6" fill="#F59E0B22" stroke="#F59E0B" strokeWidth="2" />
            <text x="25" y="150" fill="#F59E0B" fontSize="13" fontWeight="900" textAnchor="middle" transform="rotate(-90, 25, 150)">
              10 TB/s NVLink DIE-TO-DIE
            </text>

            {/* Flowing Data Particles */}
            {[-2, -1, 0, 1, 2].map((i) => {
              const y = ((frame * 6 + i * 50) % 270) + 10;
              return (
                <circle key={i} cx="25" cy={y} r="4" fill="#F59E0B" filter="drop-shadow(0 0 6px #F59E0B)" />
              );
            })}
          </g>

          {/* Silicon Die 2 (Right) */}
          <g transform="translate(490, 150)">
            <rect x="0" y="0" width="260" height="290" rx="12" fill="#122A54" stroke="#60A5FA" strokeWidth="2" />
            <text x="130" y="40" fill="#FFFFFF" fontSize="18" fontWeight="900" textAnchor="middle">TSMC 4NP DIE #2</text>
            <text x="130" y="65" fill="#60A5FA" fontSize="13" textAnchor="middle">104 Billion Transistors</text>

            {/* Compute Cores */}
            <rect x="20" y="90" width="105" height="85" rx="6" fill="#1E3A8A" stroke="#93C5FD" strokeWidth="1" />
            <text x="72" y="138" fill="#FFFFFF" fontSize="13" fontWeight="bold" textAnchor="middle">Streaming MP</text>

            <rect x="135" y="90" width="105" height="85" rx="6" fill="#1E3A8A" stroke="#93C5FD" strokeWidth="1" />
            <text x="187" y="138" fill="#FFFFFF" fontSize="13" fontWeight="bold" textAnchor="middle">Tensor Core 5</text>

            {/* HBM3e Memory Stacks */}
            <rect x="20" y="195" width="220" height="70" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
            <text x="130" y="228" fill="#F59E0B" fontSize="14" fontWeight="bold" textAnchor="middle">96 GB HBM3e (8 TB/s)</text>
            <text x="130" y="250" fill="#94A3B8" fontSize="11" textAnchor="middle">Ultra-High Bandwidth Stack</text>
          </g>
        </svg>
      );
    }

    // 2. SATELLITE RECONNAISSANCE (Orbital Radar & Thermal Scan)
    if (diagramType === "satellite") {
      const radarAngle = (frame * 3) % 360;
      return (
        <svg width="880" height="580" viewBox="0 0 880 580" style={{ width: "100%", height: "100%" }}>
          <defs>
            <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Radar Circles */}
          <circle cx="440" cy="290" r="80" fill="none" stroke="#F59E0B" strokeWidth="1" opacity="0.4" />
          <circle cx="440" cy="290" r="160" fill="none" stroke="#F59E0B" strokeWidth="1" opacity="0.4" />
          <circle cx="440" cy="290" r="240" fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.6" />

          {/* Crosshairs */}
          <line x1="200" y1="290" x2="680" y2="290" stroke="#F59E0B" strokeWidth="1" strokeDasharray="6 6" opacity="0.5" />
          <line x1="440" y1="50" x2="440" y2="530" stroke="#F59E0B" strokeWidth="1" strokeDasharray="6 6" opacity="0.5" />

          {/* Rotating Radar Sweep */}
          <g transform={`rotate(${radarAngle}, 440, 290)`}>
            <path d="M 440 290 L 680 290 A 240 240 0 0 0 600 130 Z" fill="url(#radarSweep)" />
          </g>

          {/* Thermal Cluster Target (100k H100 Facility) */}
          <g transform="translate(490, 210)">
            <rect x="0" y="0" width="140" height="90" rx="8" fill="#EF444433" stroke="#EF4444" strokeWidth="2" filter="drop-shadow(0 0 15px #EF4444)" />
            <text x="70" y="30" fill="#FEF3C7" fontSize="13" fontWeight="900" textAnchor="middle">THERMAL PLUME</text>
            <text x="70" y="55" fill="#EF4444" fontSize="15" fontWeight="bold" textAnchor="middle">1.2 GW DRAW</text>
            <text x="70" y="75" fill="#D97706" fontSize="11" textAnchor="middle">100,000 H100 CLUSTER</text>
          </g>

          {/* Latitude & Longitude HUD Readout */}
          <text x="40" y="70" fill="#F59E0B" fontSize="15" fontFamily="monospace" fontWeight="bold">
            LAT: 46° 52' 14" N  •  LON: 100° 47' 42" W  •  ALT: 420 KM
          </text>
          <text x="40" y="95" fill="#94A3B8" fontSize="13" fontFamily="monospace">
            SATELLITE: USA-314 KEYHOLE  •  SPECTRUM: LONGWAVE INFRARED
          </text>
        </svg>
      );
    }

    // 3. LIVING SCREENCAST (UNIX CLI Terminal & AST Loop)
    if (diagramType === "terminal") {
      return (
        <svg width="880" height="580" viewBox="0 0 880 580" style={{ width: "100%", height: "100%" }}>
          {/* Terminal Window Chrome */}
          <rect x="40" y="30" width="800" height="520" rx="16" fill="#0D1117" stroke="#30363D" strokeWidth="2" />
          <rect x="40" y="30" width="800" height="42" rx="16 16 0 0" fill="#161B22" />

          {/* Window Buttons */}
          <circle cx="68" cy="51" r="6" fill="#FF5F56" />
          <circle cx="88" cy="51" r="6" fill="#FFBD2E" />
          <circle cx="108" cy="51" r="6" fill="#27C93F" />

          <text x="440" y="56" fill="#8B949E" fontSize="13" fontFamily="monospace" textAnchor="middle">
            claude-agent-v3: ~/workspace/repo-100k (bash)
          </text>

          {/* Terminal Code & Execution Buffer */}
          <g transform="translate(65, 105)" fontFamily="monospace" fontSize="14">
            <text x="0" y="25" fill="#58A6FF">$ agy tool run_tests --path tests/test_attention.py</text>
            <text x="0" y="55" fill="#8B949E">Running 48 test suites across 12,288 tensor dimensions...</text>
            <text x="0" y="85" fill="#FF7B72">FAILED tests/test_attention.py::test_qkv_cache_overflow</text>
            <text x="0" y="115" fill="#8B949E">&gt; Assertion Error: tensor delta &gt; 0.0001 (got 0.0482)</text>

            <text x="0" y="160" fill="#3FB950">&gt;&gt;&gt; AGENT TRIGGER: Spawning AST Patch Subagent [Task-982]</text>
            <text x="0" y="190" fill="#79C0FF">Reading AST node: AttentionLayer.forward() at line 142</text>
            <text x="0" y="220" fill="#E6EDF3">Generating deterministic replacement chunk with float16 precision...</text>

            {/* Test Pass Banner */}
            <rect x="0" y="250" width="750" height="75" rx="10" fill="#23863622" stroke="#238636" strokeWidth="2" />
            <text x="25" y="285" fill="#3FB950" fontSize="18" fontWeight="bold">
              ✓ 48/48 TESTS PASSED (100% GREEN) • DURATION: 1.4s
            </text>
            <text x="25" y="310" fill="#8B949E" fontSize="13">
              Automated commit created: git commit -m "fix(core): calibrate attention float16 cache"
            </text>
          </g>
        </svg>
      );
    }

    // 4. ARCHIVE DOSSIER (1956 Dartmouth AI Conference Light Table)
    if (diagramType === "archive") {
      return (
        <svg width="880" height="580" viewBox="0 0 880 580" style={{ width: "100%", height: "100%" }}>
          {/* Manila File Folder Backing */}
          <rect x="50" y="40" width="780" height="500" rx="12" fill="#E8D8B8" stroke="#8C6D47" strokeWidth="3" />
          <rect x="80" y="70" width="720" height="440" rx="4" fill="#FBF8EE" filter="drop-shadow(0 10px 25px rgba(0,0,0,0.4))" />

          {/* Top Secret Ink Stamp */}
          <g transform="translate(610, 110) rotate(-12)">
            <rect x="0" y="0" width="160" height="50" rx="6" fill="none" stroke="#DC2626" strokeWidth="3.5" />
            <text x="80" y="34" fill="#DC2626" fontSize="20" fontWeight="900" fontFamily="Courier New" textAnchor="middle" letterSpacing="3">
              TOP SECRET
            </text>
          </g>

          {/* Typewritten Header */}
          <g transform="translate(110, 120)" fontFamily="Courier New" fill="#181411">
            <text x="0" y="25" fontSize="18" fontWeight="bold">A PROPOSAL FOR THE DARTMOUTH SUMMER RESEARCH</text>
            <text x="0" y="50" fontSize="18" fontWeight="bold">PROJECT ON ARTIFICIAL INTELLIGENCE (1955)</text>
            <text x="0" y="85" fontSize="13" fill="#6B5945">AUTHORS: J. McCarthy, M.L. Minsky, N. Rochester, C.E. Shannon</text>
            <line x1="0" y1="105" x2="660" y2="105" stroke="#8C6D47" strokeWidth="1.5" />

            {/* Typewritten Key Claim */}
            <text x="0" y="145" fontSize="14" fill="#241D17" fontWeight="bold">
              "An attempt will be made to find how to make machines use language,
            </text>
            <text x="0" y="170" fontSize="14" fill="#241D17" fontWeight="bold">
              form abstractions and concepts, solve kinds of problems now
            </text>
            <text x="0" y="195" fontSize="14" fill="#241D17" fontWeight="bold">
              reserved for humans, and improve themselves."
            </text>

            {/* Grant Callout */}
            <rect x="0" y="230" width="660" height="60" rx="6" fill="#F0E8D0" stroke="#8C6D47" strokeWidth="1" />
            <text x="20" y="265" fontSize="15" fontWeight="bold" fill="#B45309">
              REQUESTED BUDGET: $7,500 FROM THE ROCKEFELLER FOUNDATION
            </text>
          </g>
        </svg>
      );
    }

    // 5. DEEPSEEK-R1 DUAL-STAGE PURE RL PIPELINE
    if (diagramType === "pipeline") {
      return (
        <svg width="880" height="580" viewBox="0 0 880 580" style={{ width: "100%", height: "100%" }}>
          <defs>
            <pattern id="deepseek-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,255,204,0.04)" strokeWidth="1" />
            </pattern>
            <linearGradient id="r1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B2A2D" />
              <stop offset="100%" stopColor="#031618" />
            </linearGradient>
          </defs>
          <rect width="880" height="580" fill="url(#deepseek-grid)" />

          {/* Block 1: Base Model */}
          <g transform="translate(40, 200)">
            <rect x="0" y="0" width="180" height="130" rx="16" fill="url(#r1Grad)" stroke="#00FFCC" strokeWidth="2.5" />
            <text x="90" y="42" fill="#FFFFFF" fontSize="18" fontWeight="900" textAnchor="middle">BASE MODEL</text>
            <text x="90" y="72" fill="#00FFCC" fontSize="15" fontWeight="bold" textAnchor="middle">DeepSeek-V3</text>
            <text x="90" y="100" fill="#64748B" fontSize="12" textAnchor="middle">Few Cold-Start Prompts</text>
          </g>

          <path d="M 220 265 L 340 265" stroke="#00FFCC" strokeWidth="4" strokeDasharray="10 8" strokeDashoffset={-frame * 4} />

          {/* Block 2: Pure RL Engine */}
          <g transform="translate(340, 90)">
            <rect x="0" y="0" width="260" height="350" rx="24" fill="#062226" stroke="#00FFCC" strokeWidth="3" filter="drop-shadow(0 0 35px rgba(0, 255, 204, 0.35))" />
            <text x="130" y="45" fill="#FFFFFF" fontSize="20" fontWeight="900" textAnchor="middle">LARGE-SCALE RL</text>
            <text x="130" y="75" fill="#00FFCC" fontSize="16" fontWeight="bold" textAnchor="middle">Zero Supervised SFT</text>

            <rect x="25" y="105" width="210" height="70" rx="10" fill="#020B0B" stroke="#00FFCC" strokeWidth="1.5" />
            <text x="130" y="135" fill="#00FFCC" fontSize="14" fontWeight="bold" textAnchor="middle">Rule-Based Reward (R)</text>
            <text x="130" y="158" fill="#64748B" fontSize="12" textAnchor="middle">Compiler & Math Verifier</text>

            <rect x="25" y="195" width="210" height="80" rx="10" fill="#020B0B" stroke="#F59E0B" strokeWidth="1.5" />
            <text x="130" y="228" fill="#F59E0B" fontSize="14" fontWeight="bold" textAnchor="middle">"Aha Moment" Loop</text>
            <text x="130" y="252" fill="#E2E8F0" fontSize="12" textAnchor="middle">Self-Correction & Backtracking</text>

            <rect x="25" y="295" width="210" height="35" rx="6" fill="#0F172A" stroke="rgba(255,255,255,0.2)" />
            <text x="130" y="318" fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="middle">Compute Cost: $6.0M</text>
          </g>

          <path d="M 600 265 L 700 265" stroke="#00FFCC" strokeWidth="4" strokeDasharray="10 8" strokeDashoffset={-frame * 4} />

          {/* Block 3: Output */}
          <g transform="translate(700, 200)">
            <rect x="0" y="0" width="150" height="130" rx="16" fill="url(#r1Grad)" stroke="#10B981" strokeWidth="2.5" />
            <text x="75" y="42" fill="#FFFFFF" fontSize="17" fontWeight="900" textAnchor="middle">DEEPSEEK-R1</text>
            <text x="75" y="72" fill="#10B981" fontSize="15" fontWeight="bold" textAnchor="middle">AIME: 79.8%</text>
            <text x="75" y="100" fill="#64748B" fontSize="12" textAnchor="middle">Matches OpenAI o1</text>
          </g>
        </svg>
      );
    }

    // 6. GOOGLE WILLOW QUANTUM LATTICE
    if (diagramType === "lattice") {
      return (
        <svg width="880" height="580" viewBox="0 0 880 580" style={{ width: "100%", height: "100%" }}>
          <defs>
            <pattern id="willow-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(96,165,250,0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="880" height="580" fill="url(#willow-grid)" />

          <text x="440" y="60" fill="#60A5FA" fontSize="22" fontWeight="900" textAnchor="middle">
            105-QUBIT SURFACE CODE LATTICE (d = 7)
          </text>
          <text x="440" y="90" fill="#94A3B8" fontSize="14" textAnchor="middle">
            Real-Time Error Syndrome Extraction Cycle: &lt; 1.2 Microseconds
          </text>

          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3, 4].map((col) => {
              const x = 160 + col * 140;
              const y = 140 + row * 100;
              const isSyndrome = (row + col) % 2 === 1;
              const pulse = Math.sin(frame * 0.1 + row * 2 + col) * 3;

              return (
                <g key={`${row}-${col}`}>
                  {col < 4 && (
                    <line x1={x} y1={y} x2={x + 140} y2={y} stroke="rgba(96, 165, 250, 0.4)" strokeWidth="2" strokeDasharray="4 4" />
                  )}
                  {row < 3 && (
                    <line x1={x} y1={y} x2={x} y2={y + 100} stroke="rgba(96, 165, 250, 0.4)" strokeWidth="2" strokeDasharray="4 4" />
                  )}
                  <circle cx={x} cy={y} r={isSyndrome ? 18 + pulse * 0.5 : 22} fill={isSyndrome ? "#F59E0B" : "#3B82F6"} stroke="#FFFFFF" strokeWidth="2" filter={`drop-shadow(0 0 10px ${isSyndrome ? "#F59E0B" : "#3B82F6"})`} />
                  <text x={x} y={y + 5} fill="#FFFFFF" fontSize={isSyndrome ? "11" : "13"} fontWeight="bold" textAnchor="middle">
                    {isSyndrome ? "S" : `Q${row * 5 + col}`}
                  </text>
                </g>
              );
            })
          )}

          <g transform="translate(240, 500)">
            <circle cx="20" cy="15" r="12" fill="#3B82F6" stroke="#FFFFFF" />
            <text x="42" y="20" fill="#E2E8F0" fontSize="14" fontWeight="bold">Data Qubits (Information)</text>
            <circle cx="240" cy="15" r="10" fill="#F59E0B" stroke="#FFFFFF" />
            <text x="260" y="20" fill="#E2E8F0" fontSize="14" fontWeight="bold">Syndrome Qubits (Error Detection)</text>
          </g>
        </svg>
      );
    }

    // Default: Attention
    return (
      <svg width="880" height="580" viewBox="0 0 880 580" style={{ width: "100%", height: "100%" }}>
        <rect width="880" height="580" fill="#0B132B" />
        <text x="440" y="290" fill="#FFFFFF" fontSize="24" textAnchor="middle">Attention Matrix Q, K, V</text>
      </svg>
    );
  };

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
            background: `radial-gradient(circle at 50% 50%, ${accentColor}12 0%, transparent 80%)`,
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
            renderDiagramSvg()
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

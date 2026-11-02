import { ResearchUseCase } from "./types";

export const GOOGLE_WILLOW_USE_CASE: ResearchUseCase = {
  id: "google-willow",
  title: "Google Willow: Quantum Below Threshold",
  category: "Quantum Hardware & Error Correction",
  citation: {
    source: "Google Quantum AI 2024",
    claimRef: "Nature / ArXiv:2412.03722 • Figure 3",
    paperTitle: "Quantum error correction below the surface code threshold",
    year: 2024,
  },
  hook: {
    title: "QUANTUM THRESHOLD CRACKED",
    subtitle: "Series C • Hardware Breakthrough",
    accentWord: "THRESHOLD",
    badge: "Physics Milestone",
    headline: "Adding physical qubits now reduces error.",
    body: "History mein pehli baar: Google ke 105-qubit Willow chip ne prove kiya ki physical qubits badhane se logical quantum error rate exponentially kam hota hai.",
    metrics: [
      { label: "Physical Qubits", value: "105" },
      { label: "Target Speedup", value: "10²⁵x" },
    ],
  },
  diagram: {
    title: "Figure 1 • 2D Surface Code Qubit Lattice",
    badge: "LEMO-WAKE LATTICE • 30 FPS",
    sublabel: "Interleaved Data Qubits (X, Z) with Real-Time Syndrome Extraction",
    diagramType: "lattice",
  },
  takeaway: {
    title: "THE PRACTICAL QUANTUM ERA",
    subtitle: "Real-Time Syndrome Extraction",
    accentWord: "QUANTUM",
    badge: "Fault-Tolerant Era",
    headline: "Commercial Quantum Computing is Real",
    body: "Frontier supercomputers jo calculation 10²⁵ saal mein karte, Willow use minutes mein solve kar sakta hai bina decoherence crash hue.",
    metrics: [
      { label: "Syndrome Cycle", value: "<1.2µs" },
      { label: "Distance", value: "d = 7" },
    ],
  },
  timeline: {
    totalDurationInFrames: 300,
    fps: 30,
    sections: [
      {
        id: "hook-willow",
        startFrame: 0,
        durationInFrames: 90,
        speaker: "Aoede",
        subtitleText: "Quantum computing ka sabse bada roadblock solve ho gaya hai. Google ke new chip Willow ne quantum threshold cross kar liya hai.",
      },
      {
        id: "doubt-willow",
        startFrame: 90,
        durationInFrames: 55,
        speaker: "Puck",
        subtitleText: "Wait! Pehle toh qubits add karne par noise aur error aur badh jaata tha na?",
      },
      {
        id: "lattice-willow",
        startFrame: 145,
        durationInFrames: 55,
        speaker: "Aoede",
        subtitleText: "Exactly! Par Willow mein surface code distance d=7 par pohanch gaya hai, jahan error rate exponentially drop hone lagta hai.",
      },
      {
        id: "outro-willow",
        startFrame: 200,
        durationInFrames: 100,
        speaker: "Aoede",
        subtitleText: "Iska matlab useful, fault-tolerant quantum algorithms ab science fiction nahi balki reality ban chuki hain.",
      },
    ],
  },
  recommendedStyle: "blueprint-teardown",
};

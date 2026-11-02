import { ResearchUseCase } from "./types";

export const BLACKWELL_B200_USE_CASE: ResearchUseCase = {
  id: "blackwell-b200",
  title: "NVIDIA Blackwell B200 Hardware Teardown",
  category: "Silicon Engineering & AI Superchips",
  citation: {
    source: "NVIDIA Architecture Whitepaper 2024",
    claimRef: "Blackwell Architecture Technical Brief • Section 1.4",
    paperTitle: "NVIDIA Blackwell Architecture: Generative AI Supercomputing",
    year: 2024,
  },
  hook: {
    title: "208 BILLION TRANSISTORS",
    subtitle: "Hardware Series • Silicon Teardown",
    accentWord: "TRANSISTORS",
    badge: "Hardware Breakthrough",
    headline: "Two reticle-limited dies merged into one.",
    body: "Physics ke limits cross karne ke liye, NVIDIA ne pehli baar do separate silicon dies ko 10 Terabyte-per-second high-bandwidth interconnect se single GPU bana diya.",
    metrics: [
      { label: "Transistors", value: "208 Billion" },
      { label: "NVLink Bandwidth", value: "10 TB/s" },
    ],
  },
  diagram: {
    title: "FIG. 1 • DUAL-DIE SILICON PACKAGING",
    badge: "CAD BLUEPRINT • TEARDOWN",
    sublabel: "Dual 4NP TSMC Dies • 192GB HBM3e Memory Subsystem",
    diagramType: "chiplet",
  },
  takeaway: {
    title: "THE POWER DENSITY CRISIS",
    subtitle: "Liquid Cooling & 1,200W Thermal Envelope",
    accentWord: "CRISIS",
    badge: "Thermal Scaling Law",
    headline: "Air cooling is officially dead.",
    body: "Har B200 chip 1,200 Watts heat generate karta hai. Future AI datacenters direct-to-chip liquid cooling ke bina survive nahi kar sakte.",
    metrics: [
      { label: "Thermal TDP", value: "1,200 W" },
      { label: "Training Speedup", value: "4x Hopper" },
    ],
  },
  timeline: {
    totalDurationInFrames: 300,
    fps: 30,
    sections: [
      {
        id: "hook-b200",
        startFrame: 0,
        durationInFrames: 90,
        speaker: "Aoede",
        subtitleText: "Silicon manufacturing apni physical limit par pahunch chuka tha. Par NVIDIA ne rulebook phaad kar Blackwell B200 launch kar diya.",
      },
      {
        id: "question-b200",
        startFrame: 90,
        durationInFrames: 55,
        speaker: "Puck",
        subtitleText: "Wait! Agar chip photolithography machine se bada ban hi nahi sakta, toh inhone 208 billion transistors kaise fit kiye?",
      },
      {
        id: "cad-b200",
        startFrame: 145,
        durationInFrames: 55,
        speaker: "Aoede",
        subtitleText: "Dual-die interconnect! Do alag-alag silicon dies ko ten terabytes per second speed se fuse kiya, jisse software ko lagta hai ye ek single chip hai.",
      },
      {
        id: "outro-b200",
        startFrame: 200,
        durationInFrames: 100,
        speaker: "Aoede",
        subtitleText: "Lekin 1200 watts per chip ka matlab hai ki ab AI air cooling se nahi, high-pressure cold liquid cooling se chalega.",
      },
    ],
  },
  recommendedStyle: "blueprint-teardown",
};

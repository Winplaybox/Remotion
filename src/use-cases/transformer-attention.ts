import { ResearchUseCase } from "./types";

export const TRANSFORMER_ATTENTION_USE_CASE: ResearchUseCase = {
  id: "transformer-attention",
  title: "Attention Is All You Need",
  category: "Foundational AI & Natural Language",
  citation: {
    source: "Vaswani et al. 2017",
    claimRef: "ArXiv:1706.03762 • Section 3.2",
    paperTitle: "Attention Is All You Need",
    year: 2017,
  },
  hook: {
    title: "HOW CHATGPT UNDERSTANDS YOU",
    subtitle: "Series A • AI Explained",
    accentWord: "UNDERSTANDS",
    badge: "Breakthrough Insight",
    headline: "Words are not text, they are vectors.",
    body: "Jab aap prompt type karte ho, model har word ko 12,288 dimensions ke mathematical space mein convert karta hai.",
    metrics: [
      { label: "Dimensions", value: "12,288" },
      { label: "Vocabulary", value: "100k+" },
    ],
  },
  diagram: {
    title: "Figure 1 • Multi-Head Attention Mechanism",
    badge: "LEMO-WAKE LOOP • 30 FPS",
    sublabel: "Self-Attention Matrix • Q, K, V • 8 Parallel Heads",
    diagramType: "attention",
  },
  takeaway: {
    title: "THE FUTURE OF REASONING",
    subtitle: "Stanford AI Index Empirical Findings",
    accentWord: "FUTURE",
    badge: "Compute Scaling Law",
    headline: "Matrix Multiplication at Massive Scale",
    body: "Intelligence is the mathematical byproduct of loss minimization on trillions of training tokens across high-bandwidth clusters.",
    metrics: [
      { label: "Training Flops", value: "10²⁶" },
      { label: "Verification", value: "100%" },
    ],
  },
  timeline: {
    totalDurationInFrames: 300,
    fps: 30,
    sections: [
      {
        id: "hook",
        startFrame: 0,
        durationInFrames: 90,
        speaker: "Aoede",
        subtitleText: "Kya aapne socha hai ki jab aap AI se baat karte ho, toh wo har word ka exact matlab kaise samajh leta hai?",
      },
      {
        id: "attention-3d",
        startFrame: 90,
        durationInFrames: 55,
        speaker: "Puck",
        subtitleText: "Wait! Kya model humari tarah ek-ek word sequentially padhta hai, ya sab ek saath?",
      },
      {
        id: "lemowake-loop",
        startFrame: 145,
        durationInFrames: 55,
        speaker: "Aoede",
        subtitleText: "Sab ek saath! Multi-head attention mechanism har word ko doosre sabhi words ke sath mathematically connect karta hai.",
      },
      {
        id: "scaling-outro",
        startFrame: 200,
        durationInFrames: 100,
        speaker: "Aoede",
        subtitleText: "Isiliye complex questions ka answer AI fractions of a second mein calculate karke generate kar deta hai.",
      },
    ],
  },
  recommendedStyle: "dark-keynote",
};

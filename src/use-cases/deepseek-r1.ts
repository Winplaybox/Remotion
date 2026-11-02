import { ResearchUseCase } from "./types";

export const DEEPSEEK_R1_USE_CASE: ResearchUseCase = {
  id: "deepseek-r1",
  title: "DeepSeek-R1: Pure RL Reasoning",
  category: "Autonomous Reasoning & Frontier RL",
  citation: {
    source: "Guo et al. 2025",
    claimRef: "DeepSeek-R1 Paper • Section 2.1",
    paperTitle: "Incentivizing Reasoning Capability in LLMs via Reinforcement Learning",
    year: 2025,
  },
  hook: {
    title: "THE $6M REASONING MIRACLE",
    subtitle: "Series B • Open-Source Frontier AI",
    accentWord: "MIRACLE",
    badge: "Breakthrough Discovery",
    headline: "Reasoning emerges without human demonstration.",
    body: "DeepSeek-R1 ne prove kiya ki supervised fine-tuning ke bina bhi, pure rule-based reinforcement learning se model khud apne reasoning steps verify kar sakta hai.",
    metrics: [
      { label: "Training Cost", value: "$6.0M" },
      { label: "AIME 2024", value: "79.8%" },
    ],
  },
  diagram: {
    title: "Figure 2 • Dual-Stage Pure RL Architecture",
    badge: "LEMO-WAKE PIPELINE • 30 FPS",
    sublabel: "Cold-Start Foundation → Large-Scale RL → Rejection Sampling",
    diagramType: "pipeline",
  },
  takeaway: {
    title: "THE OPEN WEIGHT PARADIGM",
    subtitle: "Empirical Efficiency & Market Shock",
    accentWord: "PARADIGM",
    badge: "Cost Scaling Law",
    headline: "Algorithmic Efficiency Beats Brute Force",
    body: "OpenAI ke $100M+ black-box models ke comparison mein, DeepSeek-R1 ne algorithmic reward optimization se 95% compute cost bacha liya.",
    metrics: [
      { label: "Cost Savings", value: "94%" },
      { label: "Codeforces", value: "97.3%" },
    ],
  },
  timeline: {
    totalDurationInFrames: 300,
    fps: 30,
    sections: [
      {
        id: "hook-r1",
        startFrame: 0,
        durationInFrames: 90,
        speaker: "Aoede",
        subtitleText: "AI industry mein ek massive earthquake aaya hai: DeepSeek-R1 ne prove kar diya ki reasoning ke liye expensive human labeling ki zaroorat nahi hai.",
      },
      {
        id: "aha-moment-r1",
        startFrame: 90,
        durationInFrames: 55,
        speaker: "Puck",
        subtitleText: "Lekin wait! Agar human reasoning nahi di, toh model ko kaise pata chala ki answer sahi hai ya galat?",
      },
      {
        id: "rl-loop-r1",
        startFrame: 145,
        durationInFrames: 55,
        speaker: "Aoede",
        subtitleText: "Rule-based verification! Math aur code problems ke answers verify karna easy hai. Model ne self-reflection se 'Aha moments' discover kiye.",
      },
      {
        id: "outro-r1",
        startFrame: 200,
        durationInFrames: 100,
        speaker: "Aoede",
        subtitleText: "Isliye six million dollars mein wo achieve hua jo pehle 100 million mein hota tha. AI ab open aur accessible hai.",
      },
    ],
  },
  recommendedStyle: "scifi-hud",
};

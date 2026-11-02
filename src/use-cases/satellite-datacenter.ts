import { ResearchUseCase } from "./types";

export const SATELLITE_DATACENTER_USE_CASE: ResearchUseCase = {
  id: "satellite-datacenter",
  title: "Satellite Reconnaissance: 100k GPU Clusters",
  category: "Geopolitics of Compute & Energy Grid",
  citation: {
    source: "Stanford HAI & SemiAnalysis 2024",
    claimRef: "Global AI Compute Audit • Report Sec. 4",
    paperTitle: "Tracking Frontier AI Clusters via Infrared Orbital Radiometry",
    year: 2024,
  },
  hook: {
    title: "TRACKING 100,000 H100s FROM SPACE",
    subtitle: "Evidence Dossier • Satellite Intelligence",
    accentWord: "SPACE",
    badge: "Classified Telemetry",
    headline: "Frontier clusters cannot hide their thermal heat signatures.",
    body: "Infrared satellite imagery se reveal hua hai ki North Dakota aur Texas mein secret 1.2 Gigawatt datacenters ban rahe hain jo poore shehar jitni bijli consume karte hain.",
    metrics: [
      { label: "Cluster Size", value: "100,000 GPUs" },
      { label: "Power Draw", value: "1.2 GW" },
    ],
  },
  diagram: {
    title: "ORBITAL TELEMETRY • TARGET SECTOR 48",
    badge: "SATELLITE RADAR • THERMAL SCAN",
    sublabel: "Latitude 46.8° N • High-Voltage Substation Thermal Plume",
    diagramType: "satellite",
  },
  takeaway: {
    title: "THE ENERGY BOTTLENECK",
    subtitle: "Nuclear Reactors for AI Training",
    accentWord: "BOTTLENECK",
    badge: "Grid Capacity Limit",
    headline: "AI is moving next to nuclear power plants.",
    body: "Next generation frontier models train karne ke liye grid energy exhaust ho chuki hai. Big Tech directly decommissioned nuclear plants khareed raha hai.",
    metrics: [
      { label: "Grid Deficit", value: "45 GW" },
      { label: "Nuclear Deals", value: "$30 Billion" },
    ],
  },
  timeline: {
    totalDurationInFrames: 300,
    fps: 30,
    sections: [
      {
        id: "hook-sat",
        startFrame: 0,
        durationInFrames: 90,
        speaker: "Aoede",
        subtitleText: "Aapko lagta hai AI software hai? Space se dekhne par AI ek gigantic industrial monster dikhta hai.",
      },
      {
        id: "question-sat",
        startFrame: 90,
        durationInFrames: 55,
        speaker: "Puck",
        subtitleText: "Wait! Satellites space se server rooms ke andar kaise dekh sakti hain?",
      },
      {
        id: "radar-sat",
        startFrame: 145,
        durationInFrames: 55,
        speaker: "Aoede",
        subtitleText: "Infrared thermal plumes! 100,000 GPUs jab full load par matrix math karte hain, toh unka heat signature space se saaf glowing dikhta hai.",
      },
      {
        id: "outro-sat",
        startFrame: 200,
        durationInFrames: 100,
        speaker: "Aoede",
        subtitleText: "Isiliye Big Tech ab solar ya wind nahi, balki nuclear power plants ke bagal mein data centers build kar raha hai.",
      },
    ],
  },
  recommendedStyle: "satellite-briefing",
};

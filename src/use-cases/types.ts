import { VideoStyleId } from "../styles/types";

export interface UseCaseMetric {
  label: string;
  value: string;
}

export interface UseCaseSection {
  id: string;
  startFrame: number;
  durationInFrames: number;
  speaker: "Aoede" | "Puck";
  subtitleText: string;
}

export interface ResearchUseCase {
  id: "deepseek-r1" | "google-willow" | "transformer-attention";
  title: string;
  category: string;
  citation: {
    source: string;
    claimRef: string;
    paperTitle: string;
    year: number;
  };
  hook: {
    title: string;
    subtitle: string;
    accentWord: string;
    badge: string;
    headline: string;
    body: string;
    metrics: UseCaseMetric[];
  };
  diagram: {
    title: string;
    badge: string;
    sublabel: string;
    diagramType: "pipeline" | "lattice" | "attention";
  };
  takeaway: {
    title: string;
    subtitle: string;
    accentWord: string;
    badge: string;
    headline: string;
    body: string;
    metrics: UseCaseMetric[];
  };
  timeline: {
    totalDurationInFrames: number;
    fps: number;
    sections: UseCaseSection[];
  };
  recommendedStyle: VideoStyleId;
}

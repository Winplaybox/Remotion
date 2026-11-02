import { VideoContent } from "../../../schemas";

export interface QualityEngine {
  runAutomatedQC(video: VideoContent): Promise<{
    passed: boolean;
    issues: string[];
    score: number;
  }>;
}

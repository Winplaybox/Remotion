import { ResearchUseCase, UseCaseId } from "./types";
import { BLACKWELL_B200_USE_CASE } from "./blackwell-b200";
import { SATELLITE_DATACENTER_USE_CASE } from "./satellite-datacenter";
import { CLAUDE_CODE_AGENT_USE_CASE } from "./claude-code-agent";
import { DARTMOUTH_DOSSIER_USE_CASE } from "./dartmouth-dossier";
import { DEEPSEEK_R1_USE_CASE } from "./deepseek-r1";
import { GOOGLE_WILLOW_USE_CASE } from "./google-willow";

export * from "./types";
export * from "./blackwell-b200";
export * from "./satellite-datacenter";
export * from "./claude-code-agent";
export * from "./dartmouth-dossier";
export * from "./deepseek-r1";
export * from "./google-willow";

export const USE_CASES: Record<UseCaseId, ResearchUseCase> = {
  "blackwell-b200": BLACKWELL_B200_USE_CASE,
  "satellite-datacenter": SATELLITE_DATACENTER_USE_CASE,
  "claude-code-agent": CLAUDE_CODE_AGENT_USE_CASE,
  "dartmouth-dossier": DARTMOUTH_DOSSIER_USE_CASE,
  "deepseek-r1": DEEPSEEK_R1_USE_CASE,
  "google-willow": GOOGLE_WILLOW_USE_CASE,
};

export function getUseCase(id?: string): ResearchUseCase {
  if (id && (USE_CASES as Record<string, ResearchUseCase>)[id]) {
    return (USE_CASES as Record<string, ResearchUseCase>)[id];
  }
  return BLACKWELL_B200_USE_CASE;
}

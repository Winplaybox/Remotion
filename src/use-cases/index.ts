import { ResearchUseCase } from "./types";
import { DEEPSEEK_R1_USE_CASE } from "./deepseek-r1";
import { GOOGLE_WILLOW_USE_CASE } from "./google-willow";
import { TRANSFORMER_ATTENTION_USE_CASE } from "./transformer-attention";

export * from "./types";
export * from "./deepseek-r1";
export * from "./google-willow";
export * from "./transformer-attention";

export const USE_CASES: Record<string, ResearchUseCase> = {
  "deepseek-r1": DEEPSEEK_R1_USE_CASE,
  "google-willow": GOOGLE_WILLOW_USE_CASE,
  "transformer-attention": TRANSFORMER_ATTENTION_USE_CASE,
};

export function getUseCase(id?: string): ResearchUseCase {
  if (id && USE_CASES[id]) {
    return USE_CASES[id];
  }
  return TRANSFORMER_ATTENTION_USE_CASE;
}

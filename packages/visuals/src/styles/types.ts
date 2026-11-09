export type FeasibilityLevel = "high" | "medium" | "low";
export type DifficultyLevel = "Low" | "Medium" | "Medium–High" | "High";

export interface StyleImplementation {
  rendering_approach: string;
  character_creation: string;
  animation_methods: string;
  backgrounds_environments: string;
  effects_camera_lighting: string;
}

export interface RemotionIntegrationConfig {
  timeline: string;
  composition: string;
  transitions: string;
  audio: string;
}

export interface StyleFeasibility {
  code_only_feasibility: FeasibilityLevel;
  difficulty: DifficultyLevel;
  limitations: string;
}

export interface AnimationStyleDefinition {
  id: string;
  name: string;
  category: string;
  implementation: StyleImplementation;
  recommended_npm_packages: string[];
  asset_requirements: string;
  remotion_integration: RemotionIntegrationConfig;
  feasibility: StyleFeasibility;
}

export interface StylesDocumentPolicy {
  ai_usage: string;
  allowed: string[];
  disallowed: string[];
  important_clarification: string;
}

export interface StylesDocument {
  title: string;
  version: string;
  created_date: string;
  total_styles: number;
  scope: string;
  render_engine: string;
  policy: StylesDocumentPolicy;
  rendering_contract: {
    determinism: string;
    frame_model: string;
    "3d_model": string;
    asset_policy: string;
    quality_gates: string[];
  };
  style_selection_rule: string;
  styles: AnimationStyleDefinition[];
  user_requested_styles: string[];
}

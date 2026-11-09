import stylesCatalog from "../../../../config/styles/styles-catalog.json";
import type { AnimationStyleDefinition, StylesDocument } from "./types";

export const STYLES_CATALOG = stylesCatalog as unknown as { document: StylesDocument };

export const ALL_ANIMATION_STYLES: AnimationStyleDefinition[] = STYLES_CATALOG.document.styles;

export const STYLE_BY_ID = new Map<string, AnimationStyleDefinition>(
  ALL_ANIMATION_STYLES.map((s) => [s.id, s])
);

export const getStyleById = (id: string): AnimationStyleDefinition | undefined => {
  return STYLE_BY_ID.get(id);
};

export const getStylesByCategory = (query: string): AnimationStyleDefinition[] => {
  const q = query.toLowerCase();
  return ALL_ANIMATION_STYLES.filter((s) =>
    s.category.toLowerCase().includes(q) ||
    s.name.toLowerCase().includes(q) ||
    s.id.toLowerCase().includes(q)
  );
};

export const get2DVectorStyles = (): AnimationStyleDefinition[] => {
  return ALL_ANIMATION_STYLES.filter(
    (s) => s.category.includes("2D") || s.category.includes("vector")
  );
};

export const get3DStyles = (): AnimationStyleDefinition[] => {
  return ALL_ANIMATION_STYLES.filter((s) => s.category.includes("3D"));
};

export const getHighFeasibilityStyles = (): AnimationStyleDefinition[] => {
  return ALL_ANIMATION_STYLES.filter((s) => s.feasibility.code_only_feasibility === "high");
};

import type { StoryStyleConfig } from "../types";
import { premium25d } from "./premium-2-5d";
import { storybookClassic } from "./storybook-classic";
import { watercolor } from "./watercolor";
import { premiumToon } from "./premium-toon";
import { nightStory } from "./night-story";
import { softPastel3d } from "./soft-pastel-3d";

export const STORY_STYLES = {
  "premium-2.5d": premium25d,
  "storybook-classic": storybookClassic,
  watercolor,
  "premium-toon": premiumToon,
  "night-story": nightStory,
  "soft-pastel-3d": softPastel3d
} as const satisfies Record<string, StoryStyleConfig>;

export type StoryStyleId = keyof typeof STORY_STYLES;
export const STORY_STYLE_IDS = Object.keys(STORY_STYLES) as StoryStyleId[];

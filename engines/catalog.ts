/**
 * Production engine catalog — the single list the Engine Builder, QA script and tests use.
 * `node scripts/new-engine.mjs` appends new engines below the marker. Keep entries pure (no React).
 */
import type { ZodTypeAny } from "zod";
import { OddOrbitSchema, chakraPuzzleForDay, chakraVoiceLines, oddOrbitDuration, oddCellOf } from "./odd-orbit/src/model";
import { TrackVehicleSchema, kaaliPeeliForDay, kaaliPeeliVoiceLines, trackVehicleDuration } from "./track-vehicle/src/model";
import { buildSchedule } from "./track-vehicle/src/schedule";
import { StoryDioramaSchema, storyDioramaDuration } from "./story-diorama/src/model";
import { epicBharatSagaForDay, authoredEpisodes } from "../content/epicbharatsaga/vishnu-season";
import { TemplateSchema, templateForDay, templateDuration, templateVoiceLines, templateAnswerComment } from "./_template/src/model";
import { LiarLineupSchema, liarLineupForDay, liarLineupDuration, liarLineupVoiceLines, liarLineupAnswerComment } from "./liar-lineup/src/model";
import { CodeLockSchema, codeLockForDay, codeLockDuration, codeLockVoiceLines, codeLockAnswerComment } from "./code-lock/src/model";
// @engine-builder:imports

export interface VoiceLine { file: string; text: string; at: number }

export interface EngineEntry {
  slug: string;
  /** Composition id registered in apps/studio/src/remotion/Root.tsx */
  compositionId: string;
  schema: ZodTypeAny;
  forDay: (n: number) => unknown;
  durationFrames: (props: never) => number;
  voiceLines?: (props: never) => VoiceLine[];
  answer?: (n: number) => string;
  /** Allowed video length in seconds. */
  seconds: [number, number];
  /** Which post numbers exist (stories are authored; puzzles are infinite). */
  days: () => number[];
  /**
   * Puzzle engines: first post that ends with the shared AskOutro (engines/ask-outro.ts) instead of revealing the answer.
   * Required whenever `answer` is set. Earlier posts were published with the old ending and stay locked.
   */
  askFrom?: number;
  /** Not a real channel (template/demo): skipped by publishing checks. */
  demo?: boolean;
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

export const ENGINE_CATALOG: EngineEntry[] = [
  {
    slug: "odd-orbit", compositionId: "ChakraPuzzle", schema: OddOrbitSchema, forDay: chakraPuzzleForDay,
    durationFrames: oddOrbitDuration as (p: never) => number, voiceLines: chakraVoiceLines as (p: never) => VoiceLine[],
    answer: (n) => { const c = oddCellOf(chakraPuzzleForDay(n)); return `ROW ${c.row} · #${c.col}`; },
    seconds: [15, 30], days: () => range(30), askFrom: 4
  },
  {
    slug: "track-vehicle", compositionId: "KaaliPeeliChase", schema: TrackVehicleSchema, forDay: kaaliPeeliForDay,
    durationFrames: trackVehicleDuration as (p: never) => number,
    voiceLines: ((p: ReturnType<typeof kaaliPeeliForDay>) => kaaliPeeliVoiceLines(p, buildSchedule(p).answerSlot + 1)) as (p: never) => VoiceLine[],
    answer: (n) => `#${buildSchedule(kaaliPeeliForDay(n)).answerSlot + 1}`,
    seconds: [15, 30], days: () => range(30), askFrom: 4
  },
  {
    slug: "story-diorama", compositionId: "EpicBharatSaga", schema: StoryDioramaSchema, forDay: epicBharatSagaForDay,
    durationFrames: storyDioramaDuration as (p: never) => number, seconds: [30, 90], days: authoredEpisodes
  },
  {
    slug: "_template", compositionId: "EngineTemplate", schema: TemplateSchema, forDay: templateForDay,
    durationFrames: templateDuration as (p: never) => number, voiceLines: templateVoiceLines as (p: never) => VoiceLine[],
    answer: (n) => templateAnswerComment(templateForDay(n)), seconds: [15, 30], days: () => range(30), askFrom: 1, demo: true
  },
  {
    slug: "liar-lineup", compositionId: "LiarLineup", schema: LiarLineupSchema, forDay: liarLineupForDay,
    durationFrames: liarLineupDuration as (p: never) => number, voiceLines: liarLineupVoiceLines as (p: never) => VoiceLine[],
    answer: (n) => liarLineupAnswerComment(liarLineupForDay(n)), seconds: [30, 60], days: () => range(30), askFrom: 1
  },
  {
    slug: "code-lock", compositionId: "CodeLock", schema: CodeLockSchema, forDay: codeLockForDay,
    durationFrames: codeLockDuration as (p: never) => number, voiceLines: codeLockVoiceLines as (p: never) => VoiceLine[],
    answer: (n) => codeLockAnswerComment(codeLockForDay(n)), seconds: [25, 40], days: () => range(30), askFrom: 1
  },
  // @engine-builder:catalog
];

export const engineBySlug = (slug: string) => {
  const e = ENGINE_CATALOG.find((x) => x.slug === slug || x.compositionId === slug);
  if (!e) throw new Error(`Unknown engine "${slug}". Known: ${ENGINE_CATALOG.map((x) => x.slug).join(", ")}`);
  return e;
};

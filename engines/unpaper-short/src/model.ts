/**
 * ENGINE UNPAPER_SHORT — "Unpaper: Decode What Matters."
 * "Jo document sab share karte hain, par koi padhta nahi — hum 60 sec mein padh ke batate hain."
 * Budget, RBI, SEBI, court rulings, new rules, results, research papers. Showing the real source page is the USP.
 *
 * Not a puzzle: no AskOutro, no answer comment game. Length is VARIABLE: the sum of the episode's scenes
 * (new-format Shorts are 30-60 s; ep001 is the older ~173 s paper explainer and stays as authored).
 *
 * Two ways to author an episode (content/unpaper/epNNN.ts):
 *  1. `script` (preferred, the brief's formula): hook -> show the document -> 3 decoded points -> "aap par asar" -> CTA.
 *     unpaperScenes() turns it into scenes (dochook, showdoc, decode x3, asar, outro).
 *  2. `scenes` (legacy, ep001): a free list of typed scenes.
 * Narration is pre-rendered per scene into public/unpaper/<episode>/*.mp3 (`audio`); a scene without audio is silent
 * (drafts / previews before the voice pass). Deterministic: a post number maps to one authored episode, nothing random.
 *
 * PUBLISHING uses daily date-slot episodes instead (./daily.ts, content/unpaper/daily/*.json). The authored episodes
 * below (ep001, ep002 draft) are engine QA / Studio fixtures only and are never published by the channel.
 */
import { z } from "zod";
import { UNPAPER_EP001 } from "../../../content/unpaper/ep001";
import { UNPAPER_EP002_DRAFT } from "../../../content/unpaper/ep002-budget-2026";

export const FPS = 30;

/** Series names from the brief. */
export const UNPAPER_SERIES = ["Fine Print", "Budget Decoded", "Rule Badla"] as const;
export const SeriesSchema = z.enum(UNPAPER_SERIES);

/** What the dark ProofChip shows on every claim: source · page · date. */
export const ProofSchema = z.object({ source: z.string(), page: z.string(), date: z.string() });
export type Proof = z.infer<typeof ProofSchema>;

/** Matte clay props. The brief allows only 2-3 per video (tested). */
export const CLAY_PROPS = ["rupee", "gavel", "house", "chart"] as const;
export const ClayPropSchema = z.enum(CLAY_PROPS);
export type ClayKind = z.infer<typeof ClayPropSchema>;

const SceneSchema = z.object({
  type: z.string(),
  seconds: z.number().positive(),
  caption: z.string(),
  tts: z.string(),
  cite: z.string().optional(),
  audio: z.string().optional(),
  proof: ProofSchema.optional(),
  props: z.record(z.unknown()).default({})
}).passthrough();
export type UnpaperScene = z.infer<typeof SceneSchema>;

const Beat = { caption: z.string(), tts: z.string(), seconds: z.number().positive(), audio: z.string().optional() };
/** A highlight box on a real page image, as fractions of the page: [x, y, w, h]. */
const BoxSchema = z.tuple([z.number().min(0).max(1), z.number().min(0).max(1), z.number().positive().max(1), z.number().positive().max(1)]);

export const ScriptSchema = z.object({
  /** 1. Hook (0-2 s): the document spins in, its orange corner peels and this number pops out. */
  hook: z.object({ ...Beat, number: z.string(), line: z.string(), proof: ProofSchema.optional() }),
  /** 2. Show the document: what it is (real cover/first page). */
  doc: z.object({ ...Beat, name: z.string(), issuer: z.string(), date: z.string(), image: z.string(), proof: ProofSchema }),
  /** 3. Exactly three decoded points: camera dives into the page, the line is highlighted and lifts up as 3D text. */
  points: z.array(z.object({
    ...Beat,
    title: z.string(),
    page: z.string(),
    box: BoxSchema,
    /** The highlighted line(s), verbatim from the page. */
    quote: z.string(),
    /** The plain-language decode shown under the lifted line. */
    decoded: z.string(),
    proof: ProofSchema,
    prop: ClayPropSchema.optional()
  })).length(3),
  /** 4. "Aap par asar": the personal angle. */
  asar: z.object({ ...Beat, lines: z.array(z.string()).min(1).max(3), proof: ProofSchema.optional(), prop: ClayPropSchema.optional() }),
  /** 5. CTA / outro (the paper folds into the logo). Copy lives in episode.cta. */
  outro: z.object({ ...Beat })
});
export type UnpaperScript = z.infer<typeof ScriptSchema>;

/**
 * Per-episode engagement copy (all optional, defaults in unpaperCta). Overlays never add time, so the episode length
 * and the narration timing stay exactly as authored.
 */
export const UnpaperCtaSchema = z.object({
  /** Legacy hook card question (episodes without a script). Default: the first scene's caption up to its "?". */
  hook: z.string().optional(),
  /** Big number that pops out of the peeled corner in the hook (legacy overlay; script episodes use script.hook). */
  hookNumber: z.string().optional(),
  hookSeconds: z.number().positive().max(4).optional(),
  /** Mid-video pill "Comment karo: <comment>". */
  comment: z.string().optional(),
  /** When the pill appears (seconds from start). Default: the middle of the video. */
  commentAt: z.number().nonnegative().optional(),
  /** Outro length for legacy episodes (script episodes use the whole outro beat). */
  endSeconds: z.number().positive().max(10).optional(),
  /** Outro question. Default "Kaunsa document decode karein? Comment karo." */
  question: z.string().optional(),
  /** Commenter whose request this video answers, shown on screen ("Shoutout: @name"). */
  shoutout: z.string().optional(),
  /** Next-video teaser slot. */
  nextTeaser: z.string().optional(),
  /** Cross-platform line. Default "Poora breakdown YouTube par / slides Instagram par". */
  crossPost: z.string().optional(),
  /** Legacy fields kept so older content still parses. */
  follow: z.string().optional(),
  saveShare: z.string().optional(),
  loop: z.string().optional()
});
export type UnpaperCta = z.infer<typeof UnpaperCtaSchema>;

const EpisodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  series: SeriesSchema.optional(),
  source: z.object({ title: z.string().optional(), url: z.string().optional(), date: z.string().optional() }).passthrough(),
  script: ScriptSchema.optional(),
  scenes: z.array(SceneSchema).min(1),
  cta: UnpaperCtaSchema.optional()
});

export const UnpaperShortSchema = z.object({ episode: EpisodeSchema });
export type UnpaperShort = z.infer<typeof UnpaperShortSchema>;
export type UnpaperEpisode = UnpaperShort["episode"];

/** Script -> scenes, in the brief's order. Pure. */
export function unpaperScenes(s: UnpaperScript): UnpaperScene[] {
  const b = (x: { caption: string; tts: string; seconds: number; audio?: string | undefined }) =>
    ({ caption: x.caption, tts: x.tts, seconds: x.seconds, ...(x.audio ? { audio: x.audio } : {}) });
  return [
    { type: "dochook", ...b(s.hook), ...(s.hook.proof ? { proof: s.hook.proof } : {}), props: { number: s.hook.number, line: s.hook.line, image: s.doc.image } },
    { type: "showdoc", ...b(s.doc), proof: s.doc.proof, props: { name: s.doc.name, issuer: s.doc.issuer, date: s.doc.date, image: s.doc.image } },
    ...s.points.map((p, i) => ({
      type: "decode", ...b(p), proof: p.proof,
      props: { index: i + 1, title: p.title, page: p.page, box: p.box, quote: p.quote, decoded: p.decoded, ...(p.prop ? { prop: p.prop } : {}) }
    })),
    { type: "asar", ...b(s.asar), ...(s.asar.proof ? { proof: s.asar.proof } : {}), props: { lines: s.asar.lines, ...(s.asar.prop ? { prop: s.asar.prop } : {}) } },
    { type: "outro", ...b(s.outro), props: {} }
  ];
}

type RawEpisode = Omit<UnpaperEpisode, "scenes"> & { scenes?: UnpaperEpisode["scenes"] };
const normalize = (e: RawEpisode): UnpaperEpisode => ({ ...e, scenes: e.scenes ?? unpaperScenes(e.script!) });

/** Authored episodes, in publish order. Add new ones here only once their narration mp3s exist. */
const EPISODES = [UNPAPER_EP001].map((e) => normalize(e as unknown as RawEpisode));
/** Script-format drafts (no narration yet): rendered for previews/tests, never published. */
const DRAFTS = [UNPAPER_EP002_DRAFT].map((e) => normalize(e as unknown as RawEpisode));

export const unpaperEpisodes = () => EPISODES.map((_, i) => i + 1);
export const unpaperDrafts = (): UnpaperShort[] => DRAFTS.map((episode) => ({ episode }));

export function unpaperShortForDay(day: number): UnpaperShort {
  const d = Math.min(Math.max(1, Math.floor(day)), EPISODES.length);
  return { episode: EPISODES[d - 1]! };
}

export const unpaperShortDuration = (p: UnpaperShort) =>
  Math.round(p.episode.scenes.reduce((a, s) => a + s.seconds, 0) * FPS);

/** Distinct clay props a video uses (the brief: 2-3 per video). */
export const unpaperClayProps = (ep: UnpaperEpisode): ClayKind[] =>
  [...new Set(ep.scenes.map((s) => (s.props as { prop?: unknown }).prop).filter((x): x is ClayKind => (CLAY_PROPS as readonly unknown[]).includes(x)))];

export interface ResolvedCta {
  hook: string; hookNumber: string; hookFrames: number; comment: string; commentFrom: number; commentFrames: number;
  endFrames: number; question: string; shoutout?: string; nextTeaser?: string; crossPost: string;
  /** true when the episode's own scenes start with the 3D document hook (no overlay needed). */
  scriptHook: boolean;
}

export const DEFAULT_QUESTION = "Kaunsa document decode karein? Comment karo.";
export const DEFAULT_CROSSPOST = "Poora breakdown YouTube par / slides Instagram par";

/** Engagement copy + timing for an episode, defaults filled in. Pure function of the episode. */
export function unpaperCta(ep: { scenes: readonly { caption: string; seconds: number; type?: string }[]; script?: UnpaperScript | undefined; cta?: UnpaperCta | undefined }): ResolvedCta {
  const c = ep.cta ?? {};
  const total = Math.round(ep.scenes.reduce((a, s) => a + s.seconds, 0) * FPS);
  const first = ep.scenes[0]?.caption ?? "";
  const q = first.includes("?") ? first.slice(0, first.indexOf("?") + 1) : first;
  const hook = ep.script?.hook.line ?? c.hook ?? q;
  const commentFrames = Math.round(1.5 * FPS);
  const commentFrom = Math.min(total - commentFrames, Math.max(0, Math.round((c.commentAt ?? total / FPS / 2) * FPS)));
  const last = ep.scenes[ep.scenes.length - 1];
  const endFrames = ep.script && last ? Math.round(last.seconds * FPS) : Math.round((c.endSeconds ?? 4) * FPS);
  return {
    hook,
    hookNumber: ep.script?.hook.number ?? c.hookNumber ?? "?",
    hookFrames: Math.round((c.hookSeconds ?? 2) * FPS),
    comment: c.comment ?? "kaunsa point pata tha?",
    commentFrom,
    commentFrames,
    endFrames,
    question: c.question ?? DEFAULT_QUESTION,
    ...(c.shoutout ? { shoutout: c.shoutout } : {}),
    ...(c.nextTeaser ? { nextTeaser: c.nextTeaser } : {}),
    crossPost: c.crossPost ?? DEFAULT_CROSSPOST,
    scriptHook: ep.scenes[0]?.type === "dochook"
  };
}

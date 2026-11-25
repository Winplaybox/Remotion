import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ADVANCE, episodeChunks, EPISODE_CAPTION } from "../captions";
import { SCRIPT } from "../content";
import { fontsFor } from "../fonts";
import { FRAME, RADIUS, type StoryStyleConfig } from "../types";
import { XFADE_FRAMES, type EpisodeCue, type EpisodeScene, type MindNestEpisodeProps, type PageSlot } from "./model";

/**
 * Everything that is TEXT, on one persistent layer above the dissolving pages (so type never cross-fades with the art):
 * hook wordmark + title -> title docks to the top as the story headline (+ page dots) -> moral card -> goodbye line.
 * Captions: <= 2 lines, inside the Shorts safe area, word-by-word highlight timed to the voice.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const HIGHLIGHT = "#FFD66B";

function glow(s: StoryStyleConfig, strong = 1): React.CSSProperties {
  const c = s.cards.quoteBacking;
  return s.cards.quoteStyle === "outline"
    ? ({ WebkitTextStroke: `12px ${c}`, paintOrder: "stroke fill" } as React.CSSProperties)
    : { textShadow: `0 0 ${16 * strong}px ${c}, 0 0 ${34 * strong}px ${c}, 0 0 ${58 * strong}px ${c}, 0 2px 2px rgba(0,0,0,0.08)` };
}

/** Caption chunks with times (seconds from the page's voice start). */
export function cuesFor(scene: EpisodeScene, script: keyof typeof ADVANCE, fallbackSeconds: number): EpisodeCue[] {
  if (scene.cues?.length) return scene.cues;
  const chunks = episodeChunks(scene.narration, script);
  const total = scene.audioSeconds ?? fallbackSeconds;
  const chars = chunks.reduce((n, c) => n + c.length, 0) || 1;
  let at = 0;
  return chunks.map((text) => { const d = (text.length / chars) * total; const c = { text, start: at, end: at + d }; at += d; return c; });
}

const KaraokeLine: React.FC<{ text: string; progress: number; cjk: boolean; ink: string }> = ({ text, progress, cjk, ink }) => {
  const units = cjk ? [...text] : text.split(/(\s+)/);
  const total = units.reduce((n, u) => n + u.trim().length, 0) || 1;
  let acc = 0;
  return (
    <>
      {units.map((u, i) => {
        const len = u.trim().length;
        const a = acc / total;
        acc += len;
        const b = acc / total;
        if (!len) return <span key={i}>{u}</span>;
        const state = progress >= b ? "done" : progress >= a ? "now" : "next";
        return <span key={i} style={{ color: state === "now" ? HIGHLIGHT : ink, opacity: state === "next" ? 0.78 : 1 }}>{u}</span>;
      })}
    </>
  );
};

export const EpisodeUI: React.FC<{ p: MindNestEpisodeProps; style: StoryStyleConfig; slots: PageSlot[] }> = ({ p, style: s, slots }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const script = SCRIPT[p.lang];
  const f = fontsFor(script, p.lang);
  const ty = s.typography;
  const dir = p.lang === "ar" ? "rtl" : "ltr";
  const side = FRAME.safeSide;
  const cjk = script === "cjk";

  const slotOf = (kind: EpisodeScene["kind"]) => slots.find((sl) => p.scenes[sl.index]!.kind === kind);
  const story1 = slotOf("story");
  const moral = slotOf("moral");
  const bye = slotOf("goodbye");
  const end = slots.length ? slots[slots.length - 1]!.from + slots[slots.length - 1]!.frames : 1;

  // hook -> headline: the title docks to the top while page 1 dissolves in
  // docks while page 1 is still mostly transparent, so the moving title never crosses visible characters
  const dock = story1 ? ease(frame, story1.from - 4, story1.from + 9) : 1;
  const storyOut = moral ? 1 - ease(frame, moral.from, moral.from + XFADE_FRAMES) : 1;
  const moralIn = moral ? ease(frame, moral.from + 6, moral.from + XFADE_FRAMES + 12) : 0;
  const moralOut = bye ? 1 - ease(frame, bye.from, bye.from + XFADE_FRAMES) : 1;
  const byeIn = bye ? ease(frame, bye.from + 8, bye.from + XFADE_FRAMES + 14) : 0;
  const allOut = 1 - ease(frame, end - 10, end);

  const longest = Math.max(...p.title.map((l) => l.length));
  const fit = (max: number, min: number, l = longest) => Math.round(Math.max(min, Math.min(max, (FRAME.width - 2 * side) / (Math.max(1, l) * ADVANCE[script] * 1.08))));
  const titleBig = fit(132, 84);
  const titleSmall = fit(96, 64);
  const titleSize = lerp(titleBig, titleSmall, dock);
  const titleTop = lerp(1235, 150, dock);
  const lh = script === "deva" ? 1.16 : 1.06;

  // story page dots
  const storySlots = slots.filter((sl) => p.scenes[sl.index]!.kind === "story");
  const curStory = storySlots.reduce((k, sl, i) => (frame >= sl.from + XFADE_FRAMES / 2 ? i : k), 0);

  // caption: the story page whose picture is (mostly) on screen
  const cur = [...slots].reverse().find((sl) => frame >= sl.from + XFADE_FRAMES / 2) ?? slots[0]!;
  const scene = p.scenes[cur.index]!;
  let caption: { text: string; progress: number; alpha: number } | null = null;
  if (scene.kind === "story") {
    const tv = (frame - cur.from - cur.voiceAt) / fps;
    const cues = cuesFor(scene, script, (cur.frames - cur.voiceAt - XFADE_FRAMES) / fps - 0.4);
    let i = cues.findIndex((c, k) => tv < (cues[k + 1]?.start ?? Infinity) - 0.05);
    if (i < 0) i = cues.length - 1;
    const c = cues[Math.max(0, i)]!;
    const chunkStart = cur.from + cur.voiceAt + Math.round(c.start * fps);
    const pageIn = ease(frame, cur.from + XFADE_FRAMES / 2, cur.from + cur.voiceAt);
    const next = slots[cur.index + 1];
    const pageOut = next ? 1 - ease(frame, next.from - 2, next.from + XFADE_FRAMES / 2) : 1;
    const chunkIn = i === 0 ? 1 : ease(frame, chunkStart - 3, chunkStart + 4);
    caption = { text: c.text, progress: Math.max(0, Math.min(1, (tv - c.start) / Math.max(0.1, c.end - c.start))), alpha: pageIn * pageOut * chunkIn };
  }
  const capSize = EPISODE_CAPTION.size(script);
  const capBottom = s.composition.storyPosition;
  const scrim = caption ? caption.alpha : 0;

  const wordmarkIn = story1 ? 1 - ease(frame, story1.from - 2, story1.from + 7) : 0;
  const moralLong = Math.max(...p.moral.map((l) => l.length));
  const moralSize = fit(124, 76, moralLong);
  const byeSize = cjk ? 64 : 76;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: allOut }}>
      {/* top wash: ties the type to the plate (no box) */}
      <div style={{ position: "absolute", left: 0, top: 0, width: FRAME.width, height: 680, opacity: dock, background: `linear-gradient(to bottom, ${s.cards.topWash} 0%, ${s.cards.topWash} 38%, rgba(0,0,0,0) 100%)` }} />

      {/* hook: wordmark + episode pill (frame 0 is a finished cover) */}
      <div style={{ position: "absolute", top: 196, left: 0, right: 0, textAlign: "center", opacity: wordmarkIn, transform: `translateY(${-dock * 40}px)` }}>
        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 104, lineHeight: 1, color: ty.brand, letterSpacing: "0.01em", ...glow(s, 1.2) }}>MindNest <span style={{ color: ty.accent }}>Tales</span></div>
        <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 14, padding: "8px 26px", borderRadius: RADIUS.pill, background: "rgba(255,248,226,0.82)", boxShadow: s.cards.shadow, fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 30, letterSpacing: "0.28em", color: ty.ink }}>
          <span style={{ width: 10, height: 10, borderRadius: RADIUS.pill, background: ty.accent }} />EPISODE {String(p.fable).padStart(2, "0")}
        </div>
      </div>

      {/* brand line once the story starts */}
      <div style={{ position: "absolute", top: FRAME.safeTop - 10, left: 0, right: 0, textAlign: "center", opacity: dock, fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: "0.34em", color: ty.brand, ...glow(s, 0.6) }}>
        {p.brand} · EPISODE {String(p.fable).padStart(2, "0")}
      </div>

      {/* episode title: big on the hook, docked as the headline during the story */}
      <div dir={dir} style={{ position: "absolute", top: titleTop, left: side, right: side, textAlign: "center", opacity: storyOut, fontFamily: f.display, fontWeight: ty.titleWeight, fontSize: titleSize, lineHeight: lh, color: ty.ink, ...glow(s) }}>
        <div>{p.title[0]}</div>
        <div style={{ color: ty.accent }}>{p.title[1]}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 14, opacity: dock }}>
          {storySlots.map((_, i) => <span key={i} style={{ width: i === curStory ? 40 : 14, height: 14, borderRadius: RADIUS.pill, background: i <= curStory ? ty.accent : "rgba(59,36,18,0.25)", boxShadow: "0 0 10px rgba(255,244,210,0.9)" }} />)}
        </div>
      </div>

      {/* moral card: typography only */}
      {moral ? (
        <div dir={dir} style={{ position: "absolute", top: 150, left: side, right: side, textAlign: "center", opacity: moralIn * moralOut }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 20, fontFamily: f.display, fontWeight: 700, fontSize: 54, lineHeight: 1.1, color: ty.accent, transform: `translateY(${(1 - moralIn) * 16}px)`, ...glow(s, 0.8) }}>
            <span style={{ width: 48, height: 5, borderRadius: RADIUS.pill, background: ty.accent, opacity: 0.75 }} />
            <span>{p.moralLabel}</span>
            <span style={{ width: 48, height: 5, borderRadius: RADIUS.pill, background: ty.accent, opacity: 0.75 }} />
          </div>
          {p.moral.map((line, i) => {
            const k = moral ? ease(frame, moral.from + XFADE_FRAMES + 4 + i * 9, moral.from + XFADE_FRAMES + 20 + i * 9) : 0;
            return <div key={i} style={{ marginTop: i ? 0 : 16, fontFamily: f.display, fontWeight: 800, fontSize: moralSize, lineHeight: lh, color: i ? ty.accent : ty.ink, opacity: k, transform: `scale(${0.86 + 0.14 * k})`, ...glow(s) }}>{line}</div>;
          })}
        </div>
      ) : null}

      {/* goodbye line */}
      {bye ? (
        <div dir={dir} style={{ position: "absolute", top: 210, left: side + 10, right: side + 10, textAlign: "center", opacity: byeIn, transform: `translateY(${(1 - byeIn) * 20}px)` }}>
          <div style={{ fontFamily: f.display, fontWeight: 800, fontSize: byeSize, lineHeight: lh, color: "#FFF4D6", textShadow: "0 0 18px rgba(20,24,60,0.9), 0 0 40px rgba(20,24,60,0.7), 0 3px 3px rgba(0,0,0,0.25)" }}>{p.scenes[bye.index]!.narration}</div>
          <div style={{ marginTop: 22, fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 30, letterSpacing: "0.3em", color: "#FFD877", textShadow: "0 0 14px rgba(20,24,60,0.9)" }}>MINDNEST TALES</div>
        </div>
      ) : null}

      {/* caption scrim + chunked caption (bottom 190 px and right 130 px stay clear for the Shorts UI) */}
      {s.cards.storyStyle === "scrim" ? (
        <div style={{ position: "absolute", left: 0, bottom: 0, width: FRAME.width, height: capBottom + 300, opacity: scrim, background: `linear-gradient(to top, ${s.cards.storyBacking} 0%, ${s.cards.storyBacking} 55%, rgba(0,0,0,0) 100%)` }} />
      ) : null}
      {caption ? (
        <div dir={dir} style={{ position: "absolute", bottom: capBottom, left: side, width: EPISODE_CAPTION.width, display: "flex", justifyContent: "center" }}>
          <div style={{
            fontFamily: f.body, fontWeight: 700, fontSize: capSize, lineHeight: 1.32, color: ty.captionInk, textAlign: "center",
            opacity: caption.alpha, transform: `translateY(${(1 - caption.alpha) * 10}px)`,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            textShadow: `0 2px 3px ${s.cards.storyBacking}, 0 0 16px ${s.cards.storyBacking}, 0 0 30px ${s.cards.storyBacking}`
          } as React.CSSProperties}>
            <KaraokeLine text={caption.text} progress={caption.progress} cjk={cjk} ink={ty.captionInk} />
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

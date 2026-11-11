import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { REEL_INTRO, REEL_OUTRO, captionPages, FPS, type HighlightReel, type ShortClip, type ShortThumb } from "./model";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const ShortClipComposition: React.FC<ShortClip> = (p) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const { fps, width: W, height: H, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const src = /^https?:/.test(p.src) ? p.src : staticFile(p.src);
  const startFrom = Math.round(p.start * fps);
  const endAt = Math.round(p.end * fps);
  const pages = useMemo(() => captionPages(p.words), [p.words]);
  const page = pages.find((pg) => t >= pg.start - 0.05 && t <= pg.end + 0.35);
  const fitH = (W * p.height) / p.width;
  const crop = p.framing === "crop" || fitH >= H * 0.9;
  const hookIn = spring({ frame, fps, config: { damping: 14 } });
  const hookOut = interpolate(t, [2.8, 3.3], [1, 0], clamp);
  const duck = (f: number) => (p.voice && f / fps < p.voiceSeconds ? 0.22 : 1);
  const flashA = p.flash ? interpolate(frame, [0, 6], [0.9, 0], clamp) : 0;
  const asset = (f: string) => (/^https?:/.test(f) ? f : staticFile(f));

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {crop ? (
        <OffthreadVideo src={src} startFrom={startFrom} endAt={endAt} volume={duck} style={{ width: W, height: H, objectFit: "cover" }} />
      ) : (
        <>
          <OffthreadVideo src={src} startFrom={startFrom} endAt={endAt} muted style={{ position: "absolute", width: W, height: H, objectFit: "cover", filter: "blur(30px) brightness(0.5)", transform: "scale(1.2)" }} />
          <div style={{ position: "absolute", top: (H - fitH) / 2 - 80, left: 0, width: W, height: fitH }}>
            <OffthreadVideo src={src} startFrom={startFrom} endAt={endAt} volume={duck} style={{ width: W, height: fitH, objectFit: "contain" }} />
          </div>
        </>
      )}

      {p.hook && t < 3.3 ? (
        <div style={{ position: "absolute", top: 170, left: 50, right: 50, display: "flex", justifyContent: "center", opacity: hookOut, transform: `scale(${0.7 + hookIn * 0.3})` }}>
          <div style={{ fontFamily: FONT.display, fontSize: Math.min(110, 1800 / Math.max(8, p.hook.length)), lineHeight: 1.02, color: "#111", background: p.accent, padding: "14px 30px", borderRadius: 18, textAlign: "center", boxShadow: "0 10px 0 rgba(0,0,0,.35)" }}>{p.hook}</div>
        </div>
      ) : null}

      {page ? (
        <div style={{ position: "absolute", top: crop ? H * 0.68 : (H + fitH) / 2 - 40, left: 60, right: 60, textAlign: "center", fontFamily: FONT.ui, fontWeight: 900, fontSize: 76, lineHeight: 1.15, textTransform: "uppercase" }}>
          {page.words.map((w, i) => {
            const on = t >= w.start && t < w.end + 0.05;
            const pop = on ? 1.08 : 1;
            return (
              <span key={i} style={{ display: "inline-block", marginRight: "0.25em", color: on ? p.accent : "#fff", transform: `scale(${pop})`, WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 rgba(0,0,0,.5)" }}>{w.word}</span>
            );
          })}
        </div>
      ) : null}

      {p.handle ? <div style={{ position: "absolute", bottom: 230, width: "100%", textAlign: "center", fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: "#fff", textShadow: "0 2px 6px #000" }}>{p.handle}</div> : null}
      {p.voice ? <Audio src={asset(p.voice)} /> : null}
      {p.sfx ? <Audio src={staticFile(`sfx/${p.sfx}.mp3`)} volume={0.55} /> : null}
      {p.brand || p.logo ? (
        <div style={{ position: "absolute", top: 70, left: 50, display: "flex", alignItems: "center", gap: 14, background: "rgba(0,0,0,.55)", padding: "10px 22px 10px 12px", borderRadius: 999, border: `3px solid ${p.accent}` }}>
          {p.logo ? <Img src={asset(p.logo)} style={{ width: 54, height: 54, borderRadius: 27, objectFit: "cover" }} /> : null}
          {p.brand ? <span style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 34, color: "#fff" }}>{p.brand}</span> : null}
        </div>
      ) : null}
      {p.badge ? (
        <div style={{ position: "absolute", top: 60, right: 50, fontFamily: FONT.display, fontSize: 104, color: "#111", background: p.accent, padding: "4px 30px", borderRadius: 22, boxShadow: "0 10px 0 rgba(0,0,0,.4)", transform: `scale(${0.6 + hookIn * 0.4}) rotate(-3deg)` }}>{p.badge}</div>
      ) : null}
      {flashA > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flashA }} /> : null}
      <div style={{ position: "absolute", bottom: 0, left: 0, height: 10, width: `${(frame / durationInFrames) * 100}%`, background: p.accent }} />
    </AbsoluteFill>
  );
};

const Card: React.FC<{ title: string; sub?: string; accent: string; brand: string; logo: string }> = ({ title, sub, accent, brand, logo }) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 13 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #2a1b4d, #0b0714)`, alignItems: "center", justifyContent: "center", padding: 70 }}>
      {logo ? <Img src={/^https?:/.test(logo) ? logo : staticFile(logo)} style={{ width: 220, height: 220, borderRadius: 110, marginBottom: 50, transform: `scale(${a})`, border: `8px solid ${accent}` }} /> : null}
      <div style={{ fontFamily: FONT.display, fontSize: 150, lineHeight: 1, textAlign: "center", color: accent, transform: `scale(${0.6 + a * 0.4})`, textShadow: "0 10px 0 rgba(0,0,0,.5)" }}>{title}</div>
      {sub ? <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 52, color: "#fff", marginTop: 36, textAlign: "center", opacity: a }}>{sub}</div> : null}
      {brand ? <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 40, color: "#fff", marginTop: 60, opacity: 0.85 }}>{brand}</div> : null}
    </AbsoluteFill>
  );
};

/** "Best of" countdown reel: title card, clips #N..#1 with rank badges, voice-over intros, CTA outro. */
export const HighlightReelComposition: React.FC<HighlightReel> = (r) => {
  const intro = Math.round(REEL_INTRO * FPS), outro = Math.round(REEL_OUTRO * FPS);
  let at = intro;
  const seqs = r.clips.map((c, i) => {
    const d = Math.max(1, Math.round((c.end - c.start) * FPS)), from = at; at += d;
    return <Sequence key={i} from={from} durationInFrames={d}><ShortClipComposition {...c} accent={r.accent} brand={r.brand} logo={r.logo} flash={i > 0} sfx={i === r.clips.length - 1 ? "ding" : i > 0 ? "whoosh" : ""} /></Sequence>;
  });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence from={0} durationInFrames={intro}><Card title={r.title} sub={r.subtitle} accent={r.accent} brand={r.brand} logo={r.logo} />{r.intro ? <Audio src={/^https?:/.test(r.intro) ? r.intro : staticFile(r.intro)} /> : null}</Sequence>
      {seqs}
      <Sequence from={at} durationInFrames={outro}><Card title={r.cta} sub="Like • Share • Subscribe" accent={r.accent} brand={r.brand} logo={r.logo} /></Sequence>
    </AbsoluteFill>
  );
};

/** Thumbnail still: a frame of the best moment + huge title + brand. */
export const ShortThumbnail: React.FC<ShortThumb> = (p) => {
  useBundledFonts();
  const { width: W, height: H, fps } = useVideoConfig();
  const src = /^https?:/.test(p.src) ? p.src : staticFile(p.src);
  const fitH = (W * p.height) / p.width;
  const asset = (f: string) => (/^https?:/.test(f) ? f : staticFile(f));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OffthreadVideo src={src} startFrom={Math.round(p.at * fps)} muted style={{ position: "absolute", width: W, height: H, objectFit: "cover", filter: "blur(28px) brightness(.45)", transform: "scale(1.2)" }} />
      <div style={{ position: "absolute", top: (H - fitH) / 2 - 120, width: W, height: fitH }}><OffthreadVideo src={src} startFrom={Math.round(p.at * fps)} muted style={{ width: W, height: fitH, objectFit: "contain" }} /></div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 62%, rgba(0,0,0,.8) 100%)" }} />
      <div style={{ position: "absolute", bottom: 210, left: 50, right: 50, textAlign: "center", fontFamily: FONT.display, fontSize: Math.min(170, 2400 / Math.max(8, p.title.length) * 2), lineHeight: 1, color: p.accent, WebkitTextStroke: "14px #000", paintOrder: "stroke fill", textTransform: "uppercase" }}>{p.title}</div>
      {p.badge ? <div style={{ position: "absolute", top: 70, right: 50, fontFamily: FONT.display, fontSize: 130, color: "#111", background: p.accent, padding: "4px 34px", borderRadius: 24 }}>{p.badge}</div> : null}
      {p.brand || p.logo ? <div style={{ position: "absolute", top: 70, left: 50, display: "flex", alignItems: "center", gap: 16, background: "rgba(0,0,0,.6)", padding: "12px 26px 12px 14px", borderRadius: 999, border: `3px solid ${p.accent}` }}>{p.logo ? <Img src={asset(p.logo)} style={{ width: 70, height: 70, borderRadius: 35 }} /> : null}<span style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 42, color: "#fff" }}>{p.brand}</span></div> : null}
    </AbsoluteFill>
  );
};

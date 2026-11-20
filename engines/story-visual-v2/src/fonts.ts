import { useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import type { StoryText } from "./types";

/** OFL fonts bundled in public/mindnest-v2/fonts (licences next to them). Renders never hit the network. */
const FILES: ReadonlyArray<readonly [family: string, file: string, weight: string]> = [
  ["Baloo 2", "baloo-2-devanagari-500-normal.woff2", "500"],
  ["Baloo 2", "baloo-2-devanagari-700-normal.woff2", "700"],
  ["Baloo 2", "baloo-2-devanagari-800-normal.woff2", "800"],
  ["Baloo 2", "baloo-2-latin-500-normal.woff2", "500"],
  ["Baloo 2", "baloo-2-latin-700-normal.woff2", "700"],
  ["Baloo 2", "baloo-2-latin-800-normal.woff2", "800"],
  ["Baloo Bhaijaan 2", "baloo-bhaijaan-2-arabic-600-normal.woff2", "600"],
  ["Baloo Bhaijaan 2", "baloo-bhaijaan-2-arabic-800-normal.woff2", "800"],
  ["Baloo Bhaijaan 2", "baloo-bhaijaan-2-latin-600-normal.woff2", "600"],
  ["Baloo Bhaijaan 2", "baloo-bhaijaan-2-latin-800-normal.woff2", "800"],
  ["Mukta", "mukta-devanagari-500-normal.woff2", "500"],
  ["Mukta", "mukta-devanagari-600-normal.woff2", "600"],
  ["Mukta", "mukta-devanagari-700-normal.woff2", "700"],
  ["Mukta", "mukta-latin-500-normal.woff2", "500"],
  ["Mukta", "mukta-latin-600-normal.woff2", "600"],
  ["Mukta", "mukta-latin-700-normal.woff2", "700"],
  // CJK (OFL, subset to kana + CJK unified ideographs / Hangul syllables + Latin): see OFL-*.txt next to them.
  ["M PLUS Rounded 1c", "m-plus-rounded-1c-jp-500.woff2", "500"],
  ["M PLUS Rounded 1c", "m-plus-rounded-1c-jp-800.woff2", "800"],
  ["Noto Sans KR", "noto-sans-kr-500.woff2", "500"],
  ["Noto Sans KR", "noto-sans-kr-800.woff2", "800"]
];

const CJK_FAMILIES: Record<string, string> = { ja: "M PLUS Rounded 1c", ko: "Noto Sans KR" };
const loading = new Map<string, Promise<void>>();
/** Latin/Devanagari/Arabic faces always; a CJK face only for its own language (they are ~0.7-1 MB each). */
function loadAll(lang?: string): Promise<void> {
  const key = lang && CJK_FAMILIES[lang] ? lang : "base";
  const hit = loading.get(key);
  if (hit) return hit;
  const want = FILES.filter(([family]) => !Object.values(CJK_FAMILIES).includes(family) || family === CJK_FAMILIES[key]);
  const p = Promise.all(
    want.map(async ([family, file, weight]) => {
      const face = new FontFace(family, `url(${staticFile(`mindnest-v2/fonts/${file}`)}) format("woff2")`, { weight });
      await face.load();
      document.fonts.add(face);
    })
  ).then(() => undefined);
  loading.set(key, p);
  return p;
}

export function useStoryFonts(lang?: string): void {
  const [handle] = useState(() => delayRender("story-visual-v2 fonts"));
  useState(() => {
    loadAll(lang)
      .then(() => continueRender(handle))
      .catch((e: unknown) => {
        console.error(e);
        continueRender(handle);
      });
    return null;
  });
}

/** Bundled CJK faces first (renders never depend on the machine's fonts); system faces only as a last resort. */
const JA = "'M PLUS Rounded 1c', 'Noto Sans KR', 'Noto Sans CJK JP', sans-serif";
const KO = "'Noto Sans KR', 'M PLUS Rounded 1c', 'Noto Sans CJK KR', sans-serif";

export function fontsFor(script: StoryText["script"], lang?: string): { display: string; body: string } {
  const CJK = lang === "ko" ? KO : JA;
  switch (script) {
    case "arabic":
      return { display: "'Baloo Bhaijaan 2', sans-serif", body: "'Baloo Bhaijaan 2', sans-serif" };
    case "cjk":
      return { display: CJK, body: CJK };
    default:
      return { display: "'Baloo 2', 'Noto Sans Devanagari', sans-serif", body: "Mukta, 'Baloo 2', 'Noto Sans Devanagari', sans-serif" };
  }
}

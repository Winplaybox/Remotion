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
  ["Mukta", "mukta-latin-700-normal.woff2", "700"]
];

let loading: Promise<void> | null = null;
function loadAll(): Promise<void> {
  if (loading) return loading;
  loading = Promise.all(
    FILES.map(async ([family, file, weight]) => {
      const face = new FontFace(family, `url(${staticFile(`mindnest-v2/fonts/${file}`)}) format("woff2")`, { weight });
      await face.load();
      document.fonts.add(face);
    })
  ).then(() => undefined);
  return loading;
}

export function useStoryFonts(): void {
  const [handle] = useState(() => delayRender("story-visual-v2 fonts"));
  useState(() => {
    loadAll()
      .then(() => continueRender(handle))
      .catch((e: unknown) => {
        console.error(e);
        continueRender(handle);
      });
    return null;
  });
}

/** CJK has no bundled face yet: falls back to the system (see README). */
const CJK = "'Noto Sans CJK JP', 'Noto Sans CJK KR', 'Hiragino Maru Gothic ProN', 'Apple SD Gothic Neo', sans-serif";

export function fontsFor(script: StoryText["script"]): { display: string; body: string } {
  switch (script) {
    case "arabic":
      return { display: "'Baloo Bhaijaan 2', sans-serif", body: "'Baloo Bhaijaan 2', sans-serif" };
    case "cjk":
      return { display: CJK, body: CJK };
    default:
      return { display: "'Baloo 2', 'Noto Sans Devanagari', sans-serif", body: "Mukta, 'Baloo 2', 'Noto Sans Devanagari', sans-serif" };
  }
}

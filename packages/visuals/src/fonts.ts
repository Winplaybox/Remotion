import { useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

/** Fonts are bundled in /public/fonts so renders never depend on the network. */
const FONT_FILES: ReadonlyArray<readonly [family: string, file: string, weight: string, style: string]> = [
  ["Anton", "anton.woff2", "400", "normal"],
  ["Inter", "inter-latin-500-normal.woff2", "500", "normal"],
  ["Inter", "inter-latin-700-normal.woff2", "700", "normal"],
  ["Inter", "inter-latin-800-normal.woff2", "800", "normal"],
  ["Inter", "inter-latin-900-normal.woff2", "900", "normal"],
  ["JetBrains Mono", "jetbrains-mono-latin-500-normal.woff2", "500", "normal"],
  ["JetBrains Mono", "jetbrains-mono-latin-700-normal.woff2", "700", "normal"],
  ["Poppins", "poppins-latin-800-italic.woff2", "800", "italic"],
  ["Poppins", "poppins-latin-900-italic.woff2", "900", "italic"],
  // Hindi (Devanagari) captions/titles — OFL, see public/fonts/NotoSansDevanagari-OFL.txt
  ["Noto Sans Devanagari", "noto-sans-devanagari-devanagari-700-normal.woff2", "700", "normal"],
  ["Noto Sans Devanagari", "noto-sans-devanagari-devanagari-900-normal.woff2", "900", "normal"]
];

let loading: Promise<void> | null = null;

function loadAll(): Promise<void> {
  if (loading) return loading;
  loading = Promise.all(
    FONT_FILES.map(async ([family, file, weight, style]) => {
      const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format("woff2")`, { weight, style });
      await face.load();
      document.fonts.add(face);
    })
  ).then(() => undefined);
  return loading;
}

/** Blocks the frame until every bundled font is ready. */
export function useBundledFonts(): void {
  const [handle] = useState(() => delayRender("Loading bundled fonts"));
  useState(() => {
    loadAll()
      .then(() => continueRender(handle))
      .catch((error: unknown) => {
        console.error(error);
        continueRender(handle);
      });
    return null;
  });
}

export const FONT = {
  display: "Anton, 'Noto Sans Devanagari', Impact, sans-serif",
  ui: "Inter, 'Noto Sans Devanagari', Arial, sans-serif",
  mono: "'JetBrains Mono', monospace",
  punch: "Poppins, Inter, sans-serif"
} as const;

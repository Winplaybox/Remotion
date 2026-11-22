/**
 * Unpaper brand + cross-platform handles. ONE place for every handle/link the Unpaper engine shows or writes:
 * the on-video end card reads it, and so do the YouTube description and Instagram/Facebook caption templates
 * (channels/channels.ts -> unpaperDescription / unpaperCaption). Change a handle here and every surface follows.
 */
export const UNPAPER_BRAND = {
  name: "Unpaper",
  tagline: "Decode What Matters",
  colors: { ink: "#171717", saffron: "#F07828", cyan: "#12B8D6", grey: "#F2F2F2" }
} as const;

export const UNPAPER_HANDLES = {
  youtube: { label: "YouTube", handle: "@Unpaper", url: "https://youtube.com/@Unpaper" },
  instagram: { label: "Instagram", handle: "@unpaper.ai", url: "https://www.instagram.com/unpaper.ai/" },
  facebook: { label: "Facebook", handle: "Unpaper", url: "https://www.facebook.com/profile.php?id=61596651637282" }
} as const;

interface EpisodeLike { title: string; source: { title?: string | undefined; url?: string | undefined } }

/** YouTube description: source, then links to the Instagram account and the Facebook Page. */
export function unpaperDescription(ep: EpisodeLike): string {
  const h = UNPAPER_HANDLES;
  return [
    ep.title,
    `Source: ${ep.source.url ?? ep.source.title ?? ""}`,
    "Har claim paper ke page se verified.",
    "",
    `${UNPAPER_BRAND.name} — ${UNPAPER_BRAND.tagline}. Subscribe ${h.youtube.handle}`,
    `📸 Instagram: ${h.instagram.handle} — ${h.instagram.url}`,
    `📘 Facebook: ${h.facebook.handle} — ${h.facebook.url}`,
    "#AI #research #hinglish #shorts"
  ].join("\n");
}

/** Instagram / Facebook caption: points viewers at the full video on YouTube. */
export function unpaperCaption(ep: EpisodeLike): string {
  return [
    ep.title,
    `${UNPAPER_BRAND.name} — ${UNPAPER_BRAND.tagline}.`,
    `▶️ Full video YouTube pe: ${UNPAPER_HANDLES.youtube.handle}`,
    "#AI #research #hinglish #reels"
  ].join("\n");
}

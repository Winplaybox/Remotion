export const DESIGN = {
  colors: {
    bgDeep: "#07090E",
    bgSurface: "#0D1117",
    bgElevated: "#161B22",

    textPrimary: "#F0F6FF",
    textSecondary: "#8B9BAF",
    textMuted: "#4A5568",

    accent: "#4A9EFF",
    accentWarm: "#FF6B35",
    accentGreen: "#00D084",
    accentRed: "#FF4D6A",
    accentPurple: "#9B5DE5",

    dataPalette: [
      "#4A9EFF",
      "#FF6B35",
      "#00D084",
      "#9B5DE5",
      "#F7C59F",
      "#3DBCF6",
    ],

    gridLine: "rgba(74,158,255,0.08)",
    gridLineBright: "rgba(74,158,255,0.18)",
    divider: "rgba(240,246,255,0.08)",
  },

  fonts: {
    display: '"Inter", "Helvetica Neue", Arial, sans-serif',
    sans: '"Inter", "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
  },

  safeZone: {
    top: 160,
    bottom: 160,
    left: 72,
    right: 72,
    contentWidth: 936,
  },

  springs: {
    snappy: { damping: 22, stiffness: 180, mass: 0.8 },
    smooth: { damping: 28, stiffness: 120, mass: 1.0 },
    heavy: { damping: 18, stiffness: 80, mass: 1.4 },
    bouncy: { damping: 12, stiffness: 200, mass: 0.7 },
  },

  z: {
    gridBg: 0,
    contentBase: 10,
    cards: 20,
    overlay: 30,
    captions: 40,
    hud: 50,
  },
} as const;

export type DesignColor = keyof typeof DESIGN.colors;

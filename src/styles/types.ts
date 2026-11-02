export type VideoStyleId =
  | "scifi-hud"
  | "blueprint-teardown"
  | "satellite-briefing"
  | "living-screencast"
  | "archive-lighttable"
  | "data-storytelling"
  | "dark-keynote"
  | "swiss-motion";

export interface VideoStyleConfig {
  id: VideoStyleId;
  name: string;
  tagline: string;
  description: string;
  palette: {
    background: string;
    backgroundRadial?: string;
    surfaceCard: string;
    border: string;
    primaryAccent: string;
    secondaryAccent: string;
    textPrimary: string;
    textSecondary: string;
    glow: string;
  };
  typography: {
    fontFamily: string;
    headlineWeight: number;
    textTransform: "uppercase" | "none" | "capitalize";
    letterSpacing: string;
  };
  cameraDynamics: {
    defaultMotion: "push_in" | "parallax_orbit" | "pan_left" | "static";
    zoomIntensity: number;
  };
  visualMotifs: {
    gridStyle: "dots" | "cyber-grid" | "blueprint-lines" | "terminal-scan" | "radar-rings" | "archive-grain" | "clean";
    glowStrength: number;
    borderWidth: number;
    cornerRadius: number;
  };
}

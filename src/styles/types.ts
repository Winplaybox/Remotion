export type VideoStyleId =
  | "dark-keynote"
  | "scifi-hud"
  | "exploded-teardown"
  | "whiteboard-explainer"
  | "data-storytelling"
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
    gridStyle: "dots" | "cyber-grid" | "blueprint-lines" | "chalk-noise" | "clean";
    glowStrength: number;
    borderWidth: number;
    cornerRadius: number;
  };
}

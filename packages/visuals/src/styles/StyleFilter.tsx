import React from "react";
import { AbsoluteFill } from "remotion";

export interface StyleFilterProps {
  styleId?: string;
  frame?: number;
  intensity?: number;
  children: React.ReactNode;
}

/**
 * Procedural SVG & CSS styling filter component.
 * Allows applying any of the catalog's visual aesthetic treatments (Film Noir, Neon Cyberpunk,
 * Comic Art, Risograph, Vintage Film, Sharp Ink, etc.) to any Remotion scene or composition.
 */
export const StyleFilter: React.FC<StyleFilterProps> = ({
  styleId = "sharp-ink-outlines",
  frame = 0,
  intensity = 1,
  children,
}) => {
  const seed = (frame % 12);
  const grainOpacity = 0.04 * intensity;

  let filterCss = "none";
  let overlay: React.ReactNode = null;

  switch (styleId) {
    case "film-noir":
      filterCss = "grayscale(100%) contrast(140%) brightness(90%)";
      overlay = (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.75) 100%)",
            pointerEvents: "none",
          }}
        />
      );
      break;

    case "neon-cyberpunk":
      filterCss = "contrast(125%) saturate(145%)";
      overlay = (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255,0,128,0.06) 0%, rgba(0,255,255,0.06) 100%)",
            pointerEvents: "none",
            boxShadow: "inset 0 0 100px rgba(0, 240, 255, 0.2)",
          }}
        />
      );
      break;

    case "comic-art":
      filterCss = "contrast(130%) saturate(120%)";
      overlay = (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(0,0,0,0.12) 15%, transparent 16%)",
            backgroundSize: "6px 6px",
            pointerEvents: "none",
          }}
        />
      );
      break;

    case "risograph":
      filterCss = "contrast(115%) saturate(110%)";
      overlay = (
        <div
          style={{
            position: "absolute",
            inset: 0,
            mixBlendMode: "multiply",
            background: "rgba(255, 245, 230, 0.15)",
            pointerEvents: "none",
          }}
        />
      );
      break;

    case "vintage-film-animation":
      filterCss = "sepia(25%) contrast(110%) brightness(95%)";
      overlay = (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, transparent 55%, rgba(40,25,10,0.5) 100%)",
              pointerEvents: "none",
            }}
          />
          {/* Subtle frame dust line */}
          <div
            style={{
              position: "absolute",
              left: `${(seed * 37) % 100}%`,
              top: 0,
              bottom: 0,
              width: 1,
              background: "rgba(255,255,255,0.15)",
              pointerEvents: "none",
            }}
          />
        </>
      );
      break;

    case "sharp-ink-outlines":
    default:
      filterCss = "contrast(108%) saturate(105%)";
      break;
  }

  return (
    <AbsoluteFill style={{ filter: filterCss }}>
      {children}
      {overlay}
      {/* Procedural grain for tactile cartoon/film texture */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: grainOpacity,
          mixBlendMode: "overlay",
        }}
      >
        <filter id={`noise-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            seed={seed}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#noise-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill } from "remotion";
import { Character } from "./Character";
import type { ActionId, ExpressionId } from "./motion";
import type { CastId } from "./cast";

/** One transparent export frame. Anchor (feet centre) is always at (ANCHOR.x, ANCHOR.y) — identical for every character/state. */
export const SPRITE = { width: 640, height: 700 } as const;
export const ANCHOR = { x: 320, y: 650 } as const;

export interface SpriteFrameProps extends Record<string, unknown> { id: CastId; action: ActionId; expression?: ExpressionId | undefined; frame: number }

export const SpriteFrame: React.FC<SpriteFrameProps> = ({ id, action, expression, frame }) => (
  <AbsoluteFill style={{ background: "transparent" }}>
    <svg width={SPRITE.width} height={SPRITE.height}>
      <g transform={`translate(${ANCHOR.x} ${ANCHOR.y})`}>
        <Character look={id} action={action} {...(expression ? { expression } : {})} frame={frame} seed={id} exportMode />
      </g>
    </svg>
  </AbsoluteFill>
);

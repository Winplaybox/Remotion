import { CAST, CAST_BY_ID, CATEGORIES, TIER_COUNTS, byCategory, byTier, genderOf, lookOf } from "../packages/visuals/src/rig/cast";
import { ACTIONS, ACTION_IDS, EXPRESSIONS, EXPRESSION_IDS, FORE, POSES, POSE_IDS, UPPER, solveArm } from "../packages/visuals/src/rig/motion";
import { STYLES, STYLE_BY_ID, stylesByStatus } from "../packages/visuals/src/styles/recipes";

describe("cast (100 characters)", () => {
  it("has 100 unique ids and names, 10 per category, tiers 12/38/30/20", () => {
    expect(CAST).toHaveLength(100);
    expect(new Set(CAST.map((c) => c.id)).size).toBe(100);
    expect(new Set(CAST.map((c) => c.name)).size).toBe(100);
    for (const c of CATEGORIES) expect(byCategory(c)).toHaveLength(10);
    for (const [t, n] of Object.entries(TIER_COUNTS)) expect(byTier(t as keyof typeof TIER_COUNTS)).toHaveLength(n);
  });

  it("keeps the 12 original ids used by published videos", () => {
    for (const id of ["jasoos", "seth", "naukar", "maali", "driver", "munim", "beta", "chowkidar", "bahu", "beti", "dadi", "kaamwali"]) expect(CAST_BY_ID[id as keyof typeof CAST_BY_ID]).toBeDefined();
    expect(genderOf("bahu")).toBe("f");
    expect(genderOf("seth")).toBe("m");
  });

  it("every look is visually distinct (≥5 of 12 traits differ from every other)", () => {
    const keys = ["skin", "hair", "hairColor", "headwear", "headwearColor", "facialHair", "top", "topColor", "bottom", "bottomColor", "faceShape", "prop"] as const;
    const looks = CAST.map((c) => lookOf(c.id));
    for (let i = 0; i < looks.length; i++) {
      for (let j = i + 1; j < looks.length; j++) {
        const diff = keys.filter((k) => looks[i]![k] !== looks[j]![k]).length;
        expect({ a: CAST[i]!.id, b: CAST[j]!.id, ok: diff >= 5 }).toEqual({ a: CAST[i]!.id, b: CAST[j]!.id, ok: true });
      }
    }
  });

  it("every character has a main colour and proportions inside the rig limits", () => {
    for (const c of CAST) {
      expect(c.look.height).toBeGreaterThanOrEqual(0.7);
      expect(c.look.height).toBeLessThanOrEqual(1.12);
      expect(c.look.topColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("motion library", () => {
  it("defines 20 actions and 16 expressions", () => {
    expect(ACTION_IDS).toHaveLength(20);
    expect(EXPRESSION_IDS).toHaveLength(16);
    for (const a of ACTION_IDS) {
      const s = ACTIONS[a];
      expect(POSES[s.pose]).toBeDefined();
      expect(EXPRESSIONS[s.expression]).toBeDefined();
    }
  });

  it("walk/run/sneak loops are short whole numbers so exports repeat without a jump", () => {
    expect(ACTIONS.walk.loop).toBe(32);
    expect(ACTIONS.run.loop).toBe(16);
    for (const a of ACTION_IDS) expect(ACTIONS[a].loop % 4).toBe(0);
  });

  it("arm IK never stretches the bones (same identity in every pose)", () => {
    for (const p of POSE_IDS) {
      for (const [side, hand] of [[1, POSES[p].r], [-1, POSES[p].l]] as const) {
        for (const jitter of [0, 12, -12]) {
          const a = solveArm(side, hand, jitter, jitter);
          expect(Math.hypot(a.ex - a.sx, a.ey - a.sy)).toBeCloseTo(UPPER, 3);
          expect(Math.hypot(a.hx - a.ex, a.hy - a.ey)).toBeCloseTo(FORE, 3);
        }
      }
    }
  });
});

describe("visual style catalogue (49)", () => {
  it("registers all 49 styles with recipe + status, 13 requested ones present", () => {
    expect(STYLES).toHaveLength(49);
    expect(new Set(STYLES.map((s) => s.id)).size).toBe(49);
    expect(STYLES.filter((s) => s.requested)).toHaveLength(13);
    for (const s of STYLES) expect(["ready", "approx", "planned"]).toContain(s.status);
    expect(STYLE_BY_ID["pixel-art"]!.status).toBe("ready");
  });

  it("3D / real-renderer styles are never marked ready", () => {
    for (const id of ["ps2-style", "lego-style", "low-poly-3d", "cel-shaded-art", "stylized-3d-cartoon", "isometric-3d", "voxel-art", "toon-shaded-3d", "3d-cutaway"]) expect(STYLE_BY_ID[id]!.status).toBe("planned");
    expect(stylesByStatus("ready").length).toBeGreaterThan(10);
  });
});

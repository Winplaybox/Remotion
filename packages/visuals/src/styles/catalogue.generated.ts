// GENERATED from docs/style-catalogue.json (49 code-only styles). Do not edit by hand — edit recipes.ts for looks/status.
export interface CatalogueEntry { id: string; name: string; category: string; approach: string; packages: string[]; assets: string; difficulty: string; limitation: string; requested: boolean }
export const CATALOGUE: CatalogueEntry[] = [
 {
  "id": "pixel-art",
  "name": "Pixel Art",
  "category": "2D raster / sprite sheet",
  "approach": "Canvas 2D or CSS image-rendered pixel sprites; nearest-neighbor scaling; palette-limited procedural tiles.",
  "packages": [
   "Canvas API",
   "@remotion/media-utils (optional utilities)",
   "sharp (asset preprocessing)",
   "pngjs (optional pixel asset tooling)"
  ],
  "assets": "Sprite sheets are authored manually or generated algorithmically; no AI required.",
  "difficulty": "High",
  "limitation": "Keep integer scaling and avoid smoothing; large numbers of individual DOM pixels are inefficient.",
  "requested": true
 },
 {
  "id": "ps2-style",
  "name": "PS2 Style",
  "category": "3D low-resolution retro rendering",
  "approach": "Three.js scene with low-poly meshes, low-resolution render targets, affine/nearest texture sampling approximations and restrained post-processing.",
  "packages": [
   "three",
   "@react-three/fiber",
   "@react-three/drei",
   "@remotion/three",
   "@react-three/postprocessing (optional)"
  ],
  "assets": "Requires manually authored 3D models, UVs, textures and rigs; a PS2 look is an emulation, not an actual PS2 renderer.",
  "difficulty": "High",
  "limitation": "WebGL renderer and GPU memory are important; test headless rendering and deterministic frame output.",
  "requested": true
 },
 {
  "id": "comic-art",
  "name": "Comic Art",
  "category": "2D vector / layered illustration",
  "approach": "SVG and HTML layers, panel composition, halftone patterns and procedural impact graphics.",
  "packages": [
   "Built-in React/SVG/CSS",
   "roughjs (optional hand-ink effect)",
   "paper.js (optional vector paths)",
   "@remotion/transitions"
  ],
  "assets": "Entirely code-renderable when artwork is supplied as SVG or drawn from primitives.",
  "difficulty": "High",
  "limitation": "For fluid character acting, use separated layers or authored sprite sequences.",
  "requested": true
 },
 {
  "id": "lego-style",
  "name": "LEGO-Inspired Brick Toy Style",
  "category": "3D stylized toy rendering",
  "approach": "Three.js meshes with block geometry, cylindrical studs, toy-like materials and articulated minifigure-inspired rigs.",
  "packages": [
   "three",
   "@react-three/fiber",
   "@react-three/drei",
   "@remotion/three",
   "@react-three/postprocessing (optional)"
  ],
  "assets": "Code can build simple brick geometry; complex polished scenes benefit from manually authored models.",
  "difficulty": "Medium–High",
  "limitation": "Dense scenes can become draw-call heavy; instance repeated bricks.",
  "requested": true
 },
 {
  "id": "claymation",
  "name": "Claymation",
  "category": "Stop-motion-inspired 3D or frame sequence",
  "approach": "Use 3D clay-like meshes/materials with Three.js, or render manually authored stop-motion frames and sequence them.",
  "packages": [
   "three",
   "@react-three/fiber",
   "@react-three/drei",
   "@remotion/three",
   "@remotion/media-utils; sharp for sequence preparation"
  ],
  "assets": "A convincing claymation look needs authored 3D models/materials or manually created frames; code alone can create a stylized approximation.",
  "difficulty": "Medium–High",
  "limitation": "True stop-motion craft texture is an asset/material task; avoid random jitter that breaks deterministic rendering.",
  "requested": true
 },
 {
  "id": "paper-cutout",
  "name": "Paper Cutout",
  "category": "2D layered puppet / 2.5D",
  "approach": "Layered SVG/PNG paper pieces with transform origins, depth ordering and optional Three.js planes.",
  "packages": [
   "Built-in React/SVG/CSS",
   "@remotion/three (optional)",
   "three (optional)",
   "sharp (asset preprocessing)"
  ],
  "assets": "Fully feasible with manually authored vector/raster layers; no AI needed.",
  "difficulty": "High",
  "limitation": "Consistent pivot points and layer naming are essential for reusable rigs.",
  "requested": true
 },
 {
  "id": "retro-anime",
  "name": "Retro Anime",
  "category": "2D cel animation",
  "approach": "Layered cel artwork, SVG effects, hand-authored key poses and sprite/image sequences.",
  "packages": [
   "Built-in React/SVG/CSS/Canvas",
   "@remotion/media-utils",
   "sharp (sequence processing)"
  ],
  "assets": "Can be produced without AI, but detailed hand-drawn anime requires human-authored artwork or manually modelled/rigged characters.",
  "difficulty": "Medium–High",
  "limitation": "Do not claim full hand-drawn studio animation from a few static images; define animation coverage per character.",
  "requested": true
 },
 {
  "id": "low-poly-3d",
  "name": "Low Poly 3D",
  "category": "Real-time 3D",
  "approach": "Three.js geometry with flat shading, low polygon counts, simple materials and orthographic/perspective cameras.",
  "packages": [
   "three",
   "@react-three/fiber",
   "@react-three/drei",
   "@remotion/three",
   "@react-three/postprocessing (optional)"
  ],
  "assets": "Strong fit for code-driven 3D; complex characters still need rigged models or procedural geometry.",
  "difficulty": "High",
  "limitation": "Use instancing, compressed geometry and controlled lighting for render speed.",
  "requested": true
 },
 {
  "id": "risograph",
  "name": "Risograph",
  "category": "2D print / layered ink effect",
  "approach": "SVG/Canvas layers with limited spot-colour channels, grain masks and slight channel misregistration.",
  "packages": [
   "Built-in Canvas/SVG/CSS",
   "roughjs (optional)",
   "paper.js (optional)",
   "sharp (optional texture processing)"
  ],
  "assets": "Fully feasible with code and manually authored vector artwork/textures.",
  "difficulty": "High",
  "limitation": "Keep ink layers aligned and use deterministic seeded noise.",
  "requested": true
 },
 {
  "id": "miniature-diorama",
  "name": "Miniature Diorama",
  "category": "3D miniature scene",
  "approach": "Three.js scene with small-scale props, orthographic camera, depth of field approximation and tilt-shift post-processing.",
  "packages": [
   "three",
   "@react-three/fiber",
   "@react-three/drei",
   "@remotion/three",
   "@react-three/postprocessing"
  ],
  "assets": "Feasible with code-driven 3D plus authored assets; detailed dioramas need modelling work.",
  "difficulty": "Medium–High",
  "limitation": "Depth-of-field post-processing increases render cost; use sparingly.",
  "requested": true
 },
 {
  "id": "90s-classic-shonen-anime",
  "name": "90s Classic Shonen Anime",
  "category": "2D cel anime / impact-frame animation",
  "approach": "Hand-authored cel layers and key poses; SVG/Canvas speed effects; optional 3D camera/layout elements.",
  "packages": [
   "Built-in React/SVG/Canvas/CSS",
   "@remotion/transitions",
   "@remotion/media-utils",
   "sharp (sequence preparation)"
  ],
  "assets": "Technically feasible without AI; authentic detailed anime requires substantial human-created art and frame assets.",
  "difficulty": "Medium–High",
  "limitation": "High asset-production effort; code orchestrates animation rather than inventing drawings.",
  "requested": true
 },
 {
  "id": "cel-shaded-art",
  "name": "Cel-Shaded Art Style",
  "category": "3D toon shading",
  "approach": "Three.js materials/shader code using stepped lighting, outline passes and toon ramps.",
  "packages": [
   "three",
   "@react-three/fiber",
   "@react-three/drei",
   "@remotion/three",
   "@react-three/postprocessing (optional)"
  ],
  "assets": "Strongly feasible with Three.js; polished character animation needs authored rigs and models.",
  "difficulty": "Medium–High",
  "limitation": "Outline rendering and shader compatibility need testing in the target WebGL/headless environment.",
  "requested": true
 },
 {
  "id": "sharp-ink-outlines",
  "name": "Sharp Ink Outlines",
  "category": "2D vector / 3D outline treatment",
  "approach": "SVG strokes for 2D or Three.js outline pass for 3D; variable stroke width and ink accents.",
  "packages": [
   "Built-in SVG/CSS/Canvas",
   "roughjs (optional)",
   "three",
   "@react-three/postprocessing (3D option)"
  ],
  "assets": "Feasible; style is an outline treatment and can be combined with other styles.",
  "difficulty": "High",
  "limitation": "Avoid excessively complex SVG paths and test outline thickness at final resolution.",
  "requested": true
 },
 {
  "id": "rubber-hose-cartoon",
  "name": "Rubber Hose Cartoon",
  "category": "2D vector puppet",
  "approach": "SVG paths with bendable limbs, simple face parts and squash/stretch transforms.",
  "packages": [
   "Built-in React/SVG/CSS",
   "flubber (optional SVG path interpolation)",
   "roughjs (optional)"
  ],
  "assets": "Highly feasible for stylized characters; complex path morphs require compatible path topology.",
  "difficulty": "High",
  "limitation": "Keep SVG path point structures compatible when morphing.",
  "requested": false
 },
 {
  "id": "modern-western-cartoon",
  "name": "Modern Western Cartoon",
  "category": "2D vector / layered raster",
  "approach": "SVG shapes, layered artwork and CSS/Canvas compositing.",
  "packages": [
   "Built-in React/SVG/CSS/Canvas",
   "@remotion/transitions"
  ],
  "assets": "Feasible; style quality depends on authored character design and rigging.",
  "difficulty": "High",
  "limitation": "Build reusable rigs and expression atlases.",
  "requested": false
 },
 {
  "id": "saturday-morning-cartoon",
  "name": "Saturday Morning Cartoon",
  "category": "2D cel / vector",
  "approach": "Layered vector or raster cels with bold colour blocks and limited animation.",
  "packages": [
   "Built-in React/SVG/CSS/Canvas",
   "@remotion/media-utils"
  ],
  "assets": "Feasible with authored artwork; full frame-by-frame animation requires many drawings.",
  "difficulty": "High",
  "limitation": "Use limited animation strategically to control asset volume.",
  "requested": false
 },
 {
  "id": "flat-vector-animation",
  "name": "Flat Vector Animation",
  "category": "2D vector motion graphics",
  "approach": "SVG/React components and CSS transforms; shape morphing for simple transitions.",
  "packages": [
   "Built-in React/SVG/CSS",
   "flubber (optional)",
   "@remotion/transitions"
  ],
  "assets": "One of the most code-native and reliable styles.",
  "difficulty": "High",
  "limitation": "Prefer SVG for scalable clean artwork; keep path complexity reasonable.",
  "requested": false
 },
 {
  "id": "2d-puppet-animation",
  "name": "2D Puppet Animation",
  "category": "2D skeletal / cutout rig",
  "approach": "Hierarchical SVG/Canvas layers with pivot points and inverse-kinematics-style constraints where implemented.",
  "packages": [
   "Built-in React/SVG/Canvas",
   "@remotion/transitions; optionally pixi.js for larger 2D scenes"
  ],
  "assets": "Feasible; a reusable rig must be built and characters need separated parts.",
  "difficulty": "High",
  "limitation": "Do not assume a full 2D skeletal animation editor is included in Remotion.",
  "requested": false
 },
 {
  "id": "pencil-sketch",
  "name": "Pencil Sketch Animation",
  "category": "2D line art / texture",
  "approach": "SVG strokes, Canvas drawing and authored sketch overlays; optional frame-sequence animation.",
  "packages": [
   "Built-in SVG/Canvas/CSS",
   "roughjs",
   "paper.js (optional)"
  ],
  "assets": "Feasible for stylized sketch motion; natural hand-drawn line work needs authored drawings.",
  "difficulty": "High",
  "limitation": "Use seeded variation so repeated renders remain identical.",
  "requested": false
 },
 {
  "id": "watercolor-storybook",
  "name": "Watercolor Storybook",
  "category": "2D painted illustration",
  "approach": "Layered manually painted raster artwork with Canvas/SVG compositing and masks.",
  "packages": [
   "Built-in Canvas/SVG/CSS",
   "sharp (asset processing)",
   "@remotion/transitions"
  ],
  "assets": "Feasible with human-created art assets; code animates/composites them.",
  "difficulty": "High",
  "limitation": "Watercolor appearance primarily comes from the source artwork and textures.",
  "requested": false
 },
 {
  "id": "gouache-illustration",
  "name": "Gouache Illustration",
  "category": "2D painted illustration",
  "approach": "Layered raster paintings and SVG masks; Canvas compositing.",
  "packages": [
   "Built-in Canvas/SVG/CSS",
   "sharp (asset processing)"
  ],
  "assets": "Feasible with authored artwork; not a procedural painting generator by default.",
  "difficulty": "High",
  "limitation": "Use separated layers if characters need independent movement.",
  "requested": false
 },
 {
  "id": "modern-tv-anime",
  "name": "Modern TV Anime",
  "category": "2D cel animation",
  "approach": "Layered cel artwork, vector effects and frame-sequenced drawings.",
  "packages": [
   "Built-in React/SVG/Canvas/CSS",
   "@remotion/media-utils",
   "sharp"
  ],
  "assets": "Feasible as a production format; authentic hand-drawn quality depends on manually produced cels.",
  "difficulty": "Medium–High",
  "limitation": "Define whether scenes use puppet animation, limited cels or full frame-by-frame assets.",
  "requested": false
 },
 {
  "id": "manga-screentone",
  "name": "Manga Screentone",
  "category": "2D monochrome print",
  "approach": "SVG/Canvas patterns, masks, hatching and monochrome layers.",
  "packages": [
   "Built-in SVG/Canvas/CSS",
   "roughjs",
   "paper.js (optional)",
   "@remotion/transitions"
  ],
  "assets": "Highly feasible with authored line art or vector shapes.",
  "difficulty": "High",
  "limitation": "Ensure halftone frequency remains legible at target video resolution.",
  "requested": false
 },
 {
  "id": "chibi-anime",
  "name": "Chibi Anime",
  "category": "2D stylized character",
  "approach": "SVG or layered raster with exaggerated head/body proportions.",
  "packages": [
   "Built-in React/SVG/CSS/Canvas",
   "@remotion/transitions"
  ],
  "assets": "Feasible; character artwork must be designed in chibi proportions.",
  "difficulty": "High",
  "limitation": "Maintain a separate character design system rather than scaling normal characters.",
  "requested": false
 },
 {
  "id": "anime-watercolor",
  "name": "Anime Watercolor",
  "category": "2D cel plus painted background",
  "approach": "Layered cel character artwork over painted backgrounds; Canvas/SVG compositing.",
  "packages": [
   "Built-in Canvas/SVG/CSS",
   "sharp (asset processing)",
   "@remotion/transitions"
  ],
  "assets": "Feasible with authored character and background assets.",
  "difficulty": "High",
  "limitation": "Separate the character and background pipelines.",
  "requested": false
 },
 {
  "id": "limited-animation-anime",
  "name": "Limited Animation Anime",
  "category": "2D pose-based cel animation",
  "approach": "Pose atlas, layered cels and SVG/Canvas effects.",
  "packages": [
   "Built-in React/SVG/Canvas/CSS",
   "@remotion/media-utils"
  ],
  "assets": "Very feasible as a controlled animation style; motion is intentionally selective.",
  "difficulty": "High",
  "limitation": "Create a pose library per character to avoid repetitive scenes.",
  "requested": false
 },
 {
  "id": "80s-ova-anime",
  "name": "80s OVA Anime",
  "category": "2D cel / painted background",
  "approach": "Authored cel layers, background plates, grain and colour grading.",
  "packages": [
   "Built-in React/SVG/Canvas/CSS",
   "@remotion/transitions",
   "sharp"
  ],
  "assets": "Feasible with authored art; authentic cel detail requires manual art production.",
  "difficulty": "Medium–High",
  "limitation": "Use colour and texture overlays carefully; avoid excessive post-processing.",
  "requested": false
 },
 {
  "id": "stylized-3d-cartoon",
  "name": "Stylized 3D Cartoon",
  "category": "3D character animation",
  "approach": "Three.js scene graph, materials, lights and camera.",
  "packages": [
   "three",
   "@react-three/fiber",
   "@react-three/drei",
   "@remotion/three",
   "@react-three/postprocessing"
  ],
  "assets": "Feasible with authored 3D models and rigs; code can also generate simple models.",
  "difficulty": "Medium–High",
  "limitation": "Character rigging and animation assets are the main production cost.",
  "requested": false
 },
 {
  "id": "isometric-3d",
  "name": "Isometric 3D",
  "category": "3D / orthographic scene",
  "approach": "Three.js orthographic camera with isometric orientation and modular geometry.",
  "packages": [
   "three",
   "@react-three/fiber",
   "@react-three/drei",
   "@remotion/three"
  ],
  "assets": "Strong fit for code-driven scenes and modular environments.",
  "difficulty": "High",
  "limitation": "Use orthographic camera and consistent grid units.",
  "requested": false
 },
 {
  "id": "voxel-art",
  "name": "Voxel Art",
  "category": "3D block geometry",
  "approach": "Three.js instanced cubes or merged voxel meshes; voxel atlas for characters.",
  "packages": [
   "three",
   "@react-three/fiber",
   "@react-three/drei",
   "@remotion/three"
  ],
  "assets": "Feasible without AI; procedural geometry is a strong approach.",
  "difficulty": "High",
  "limitation": "Merge geometry or use instancing; one mesh per voxel will be slow.",
  "requested": false
 },
 {
  "id": "toon-shaded-3d",
  "name": "Toon Shaded 3D",
  "category": "3D shader-based illustration",
  "approach": "Three.js custom ShaderMaterial or toon materials plus outline pass.",
  "packages": [
   "three",
   "@react-three/fiber",
   "@react-three/drei",
   "@remotion/three",
   "@react-three/postprocessing"
  ],
  "assets": "Feasible with shader code and authored 3D assets.",
  "difficulty": "Medium–High",
  "limitation": "Validate shader and outline support in headless rendering.",
  "requested": false
 },
 {
  "id": "3d-cutaway",
  "name": "3D Cutaway Animation",
  "category": "3D explanatory visualization",
  "approach": "Three.js geometry, clipping planes, exploded views and animated section visibility.",
  "packages": [
   "three",
   "@react-three/fiber",
   "@react-three/drei",
   "@remotion/three"
  ],
  "assets": "Excellent for technical explainers when geometry is available.",
  "difficulty": "High",
  "limitation": "Complex models need clean topology and material management.",
  "requested": false
 },
 {
  "id": "toy-photography",
  "name": "Toy Photography Style",
  "category": "3D miniature object rendering",
  "approach": "Three.js physically based materials, studio lighting, shallow depth-of-field approximation.",
  "packages": [
   "three",
   "@react-three/fiber",
   "@react-three/drei",
   "@remotion/three",
   "@react-three/postprocessing"
  ],
  "assets": "Feasible with authored models and materials; realism depends on modelling and lighting.",
  "difficulty": "Medium–High",
  "limitation": "Use controlled studio lighting and avoid overloading the scene.",
  "requested": false
 },
 {
  "id": "ukiyo-e",
  "name": "Ukiyo-e",
  "category": "2D woodblock-print illustration",
  "approach": "SVG layers, flat colour plates, hand-authored contours and paper textures.",
  "packages": [
   "Built-in SVG/Canvas/CSS",
   "roughjs (optional)",
   "sharp (optional)"
  ],
  "assets": "Feasible as a stylized motion treatment using authored artwork.",
  "difficulty": "High",
  "limitation": "Avoid claiming authentic physical woodblock printing; this is a digital emulation.",
  "requested": false
 },
 {
  "id": "linocut-print",
  "name": "Linocut Print",
  "category": "2D carved-print illustration",
  "approach": "SVG paths, masks, stipple/hatch patterns and monochrome layers.",
  "packages": [
   "Built-in SVG/Canvas/CSS",
   "roughjs",
   "paper.js (optional)"
  ],
  "assets": "Feasible with authored line art and procedural texture overlays.",
  "difficulty": "High",
  "limitation": "Line detail must survive downscaling and compression.",
  "requested": false
 },
 {
  "id": "engraving-art",
  "name": "Engraving Art",
  "category": "2D line illustration",
  "approach": "SVG paths, repeated hatch patterns, Canvas compositing and masks.",
  "packages": [
   "Built-in SVG/Canvas",
   "paper.js",
   "roughjs (optional)"
  ],
  "assets": "Feasible for stylized illustrations; high-detail engraving needs authored drawings.",
  "difficulty": "High",
  "limitation": "Many tiny paths can increase render time; simplify artwork.",
  "requested": false
 },
 {
  "id": "indian-miniature-painting",
  "name": "Indian Miniature Painting",
  "category": "2D traditional painted illustration",
  "approach": "Layered raster/vector artwork with fine-line overlays and decorative borders.",
  "packages": [
   "Built-in SVG/Canvas/CSS",
   "sharp (asset processing)"
  ],
  "assets": "Feasible with human-created artwork; code handles compositing and movement.",
  "difficulty": "High",
  "limitation": "Respect source-art ownership and use original designs.",
  "requested": false
 },
 {
  "id": "madhubani-folk-art",
  "name": "Madhubani Folk Art",
  "category": "2D folk illustration",
  "approach": "SVG patterns, geometric fills, repeated motifs and flat colour regions.",
  "packages": [
   "Built-in SVG/Canvas/CSS",
   "paper.js (optional)",
   "roughjs (optional)"
  ],
  "assets": "Highly feasible with vector primitives and authored patterns.",
  "difficulty": "High",
  "limitation": "Pattern density should be tuned for video resolution.",
  "requested": false
 },
 {
  "id": "warli-art",
  "name": "Warli Art",
  "category": "2D geometric folk animation",
  "approach": "SVG primitive geometry and line drawing on textured backgrounds.",
  "packages": [
   "Built-in SVG/Canvas/CSS",
   "roughjs (optional)"
  ],
  "assets": "One of the most code-native traditional styles.",
  "difficulty": "High",
  "limitation": "Build reusable figure primitives and motion patterns.",
  "requested": false
 },
 {
  "id": "pop-art",
  "name": "Pop Art",
  "category": "2D graphic illustration",
  "approach": "SVG/Canvas colour blocks, halftone patterns and bold typography.",
  "packages": [
   "Built-in SVG/Canvas/CSS",
   "roughjs (optional)",
   "@remotion/transitions"
  ],
  "assets": "Highly feasible with code and vector artwork.",
  "difficulty": "High",
  "limitation": "Use a controlled palette and avoid illegible dot patterns.",
  "requested": false
 },
 {
  "id": "newspaper-illustration",
  "name": "Newspaper Illustration",
  "category": "2D monochrome print",
  "approach": "SVG/Canvas line art, paper texture, column layouts and print masks.",
  "packages": [
   "Built-in SVG/Canvas/CSS",
   "roughjs (optional)",
   "sharp"
  ],
  "assets": "Feasible with authored line art and code-driven layout.",
  "difficulty": "High",
  "limitation": "Text must remain readable; use proper font licensing.",
  "requested": false
 },
 {
  "id": "kinetic-typography",
  "name": "Kinetic Typography",
  "category": "2D text motion graphics",
  "approach": "React text layers, SVG text paths, CSS transforms and per-character timing.",
  "packages": [
   "Built-in React/CSS/SVG",
   "@remotion/transitions",
   "@remotion/google-fonts (optional font loading)"
  ],
  "assets": "Fully code-native; no character artwork required.",
  "difficulty": "High",
  "limitation": "Ensure fonts load before rendering and handle line wrapping deterministically.",
  "requested": false
 },
 {
  "id": "cinematic-2-5d",
  "name": "Cinematic 2.5D",
  "category": "Layered 2D / pseudo-3D",
  "approach": "Layered artwork on 3D planes or CSS transforms with depth-based camera movement.",
  "packages": [
   "three",
   "@react-three/fiber",
   "@react-three/drei",
   "@remotion/three; or built-in CSS/SVG"
  ],
  "assets": "Feasible with separated assets; depth maps must be authored, not AI-generated.",
  "difficulty": "High",
  "limitation": "Layer separation quality controls the illusion; avoid exposing layer gaps.",
  "requested": false
 },
 {
  "id": "film-noir",
  "name": "Film Noir",
  "category": "2D/2.5D cinematic treatment",
  "approach": "SVG/Canvas layers, monochrome grading, masks and directional lighting overlays.",
  "packages": [
   "Built-in Canvas/SVG/CSS",
   "@remotion/transitions; three optional for 3D scenes"
  ],
  "assets": "Highly feasible as a compositing and art-direction preset.",
  "difficulty": "High",
  "limitation": "Lighting is largely stylized compositing unless using actual 3D geometry.",
  "requested": false
 },
 {
  "id": "neon-cyberpunk",
  "name": "Neon Cyberpunk",
  "category": "2D/3D compositing",
  "approach": "SVG/Canvas neon strokes or Three.js emissive materials and bloom post-processing.",
  "packages": [
   "Built-in SVG/Canvas/CSS",
   "three",
   "@react-three/fiber",
   "@remotion/three",
   "@react-three/postprocessing"
  ],
  "assets": "Feasible; 3D lighting requires WebGL and authored assets.",
  "difficulty": "High",
  "limitation": "Bloom can be expensive; tune resolution and effect passes.",
  "requested": false
 },
 {
  "id": "silhouette-animation",
  "name": "Silhouette Animation",
  "category": "2D shape / cutout",
  "approach": "SVG silhouettes, Canvas masks and layered foreground/background shapes.",
  "packages": [
   "Built-in SVG/Canvas/CSS",
   "paper.js (optional)"
  ],
  "assets": "Fully feasible with code-drawn geometry and authored paths.",
  "difficulty": "High",
  "limitation": "Readable silhouette poses are more important than facial detail.",
  "requested": false
 },
 {
  "id": "geometric-motion-graphics",
  "name": "Geometric Motion Graphics",
  "category": "2D vector motion graphics",
  "approach": "SVG/Canvas primitives, React composition and deterministic interpolation.",
  "packages": [
   "Built-in React/SVG/CSS/Canvas",
   "flubber (optional)",
   "@remotion/transitions"
  ],
  "assets": "Fully code-native and highly reliable.",
  "difficulty": "High",
  "limitation": "Use a shared timing/interpolation system for consistent motion.",
  "requested": false
 },
 {
  "id": "vintage-film-animation",
  "name": "Vintage Film Animation",
  "category": "2D/footage treatment",
  "approach": "Canvas overlays, CSS filters, SVG dust/scratch layers and authored footage/artwork.",
  "packages": [
   "Built-in Canvas/SVG/CSS",
   "@remotion/media-utils",
   "sharp (optional)"
  ],
  "assets": "Feasible as a post-processing style; authentic film stock is an approximation.",
  "difficulty": "High",
  "limitation": "Use deterministic noise and avoid excessive flicker.",
  "requested": false
 },
 {
  "id": "sci-fi-hud",
  "name": "Sci-Fi HUD Animation",
  "category": "2D vector interface graphics",
  "approach": "SVG/Canvas interface elements, charts, paths and code-generated typography.",
  "packages": [
   "Built-in React/SVG/Canvas/CSS",
   "@remotion/transitions"
  ],
  "assets": "Fully code-native for interface visuals.",
  "difficulty": "High",
  "limitation": "Keep UI legible and avoid random unreadable pseudo-data.",
  "requested": false
 }
];

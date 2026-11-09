# Remotion Code-Only Animation Style Catalogue

Version: **1.0.0**  
Engine: **Remotion (React + TypeScript)**  
Total Styles: **49**

---

## 1. Scope & Policy

All animation values must be code-driven, procedural, or based on manually authored/licensed assets.
- **Allowed**: React, TypeScript, SVG, CSS, HTML Canvas 2D, Three.js / WebGL, procedural algorithms, manual SVGs, PNGs, WebPs, 3D rigs, sprite sheets.
- **Disallowed in Production Pipeline**: AI image generation, AI video generation, AI model inference at render time.
- **Determinism**: Every frame must strictly derive from `useCurrentFrame()`, `useVideoConfig()`, and explicit input props.

---

## 2. 100-Character Cast Universe for `JasoosBhaiCases`

The character universe consists of 100 Indian cartoon characters spanning 10 archetypes:
1. **Main detective family (10)**: Jasoos Bhai, Assistant Chhotu, Inspector Sharma, Constable Ram Singh, Forensic Expert Dr. Salunkhe, Informer Kallu, etc.
2. **Rich family (10)**: Seth Dhaniram, Sethani Malti Devi, Beta Rohan, Beti Priya, Bahu Sunita, Damaad Vikram, Dadi Saraswati, Dada Hariprasad, Chacha Ramesh, Chachi Shobha.
3. **Household staff (10)**: Naukar Ramu, Maali Kaka, Driver Bahadur, Cook Maharaj, Kaamwali Kamla, Chowkidar Birju, Dhobi Mohan, Cleaner Pappu, Caretaker Shankar, Maid Radha.
4. **Business people (10)**: Munim Chimanlal, Jeweller Zaveri, Banker Gupta, Shopkeeper Lala, Contractor Tiwari, Landlord Verma, CA Agarwal, Broker Mehta, Trader Bansal, Grocer Murari.
5. **Village characters (10)**: Sarpanch Mukhiya Ji, Patwari Mishra, Pandit Radheshyam, Farmer Sukhbir, Milkman Dudhwala, Postman Daakiya, Barber Hajaam, Potter Kumhar, Blacksmith Lohar, Weaver Bunkar.
6. **City characters (10)**: Doctor Batra, Lawyer Saxena, Teacher Shrikant, Journalist Barkha, Photographer Alok, Engineer Pradeep, Architect Sen, Scientist Dr. Roy, Professor Das, Bank Teller Neha.
7. **Suspicious characters (10)**: Gambler Jagga, Smuggler Raka, Pickpocket Chikna, Stranger in Coat, Fake Baba Nirmal, Con Artist Bunty, Forger Salim, Fence Billo, Hacker Vicky, Safe-Cracker Kaalia.
8. **Female characters (10)**: Neighbour Aunty Pammi, School Principal Mrs. Deshmukh, Nurse Mary, Singer Riya, Actress Simran, Boutique Owner Suman, Chef Ananya, Fitness Trainer Pooja, Pilot Captain Sneha, Writer Arundhati.
9. **Young characters (10)**: School Boy Bunty, School Girl Pinky, College Student Aryan, Hostel Warden Mr. Khurana, Tuition Teacher Deepak, Techie Rohan, Intern Tanvi, Delivery Boy Sonu, Gamer Sunny, Scout Leader Kabir.
10. **Special characters (10)**: Night Watchman Jaggu, Magician PC Sorcar, Astrologer Acharya Ji, Traveller Marco, Tourist John, Old School Friend Rakesh, Antique Collector Singhania, Museum Curator Joshi, Hotel Manager Oberoi, Train Ticket Examiner TTE Pandey.

### 20 Standard Actions
`idle`, `walking`, `running`, `talking`, `smiling`, `laughing`, `thinking`, `pointing`, `surprised`, `afraid`, `nervous`, `stressed`, `angry`, `crying`, `confused`, `suspicious`, `sneaking`, `looking-left`, `looking-right`, `celebrating`.

### 16 Standard Facial Expressions
`neutral`, `happy`, `smiling`, `laughing`, `angry`, `sad`, `crying`, `afraid`, `nervous`, `stressed`, `shocked`, `surprised`, `suspicious`, `confused`, `thinking`, `evil-smile`.

---

## 3. The 49 Animation Visual Styles

Detailed breakdown of the 49 visual styles is available in `config/styles/styles-catalog.json` and exportable via `packages/visuals/src/styles/`.

| ID | Style Name | Category | Primary Tech |
|---|---|---|---|
| `pixel-art` | Pixel Art | 2D raster / sprite | Canvas 2D / CSS image-rendering |
| `ps2-style` | PS2 Style | 3D retro low-res | Three.js / low-res render target |
| `comic-art` | Comic Art | 2D vector / halftone | SVG + Halftone pattern filters |
| `lego-style` | LEGO-Inspired Brick Toy | 3D stylized toy | Three.js block geometry & studs |
| `claymation` | Claymation | Stop-motion 3D | Stepped keyframes & tactile noise |
| `paper-cutout` | Paper Cutout | 2D layered puppet / 2.5D | SVG layers, shadows & drop offsets |
| `retro-anime` | Retro Anime | 2D cel animation | Cel shadow layers, pose holds, speed lines |
| `low-poly-3d` | Low Poly 3D | Real-time 3D | Three.js flat-shaded geometry |
| `risograph` | Risograph | 2D print / layered ink | Spot-color channels, grain misregistration |
| `miniature-diorama` | Miniature Diorama | 3D miniature scene | Orthographic Three.js camera & tilt-shift |
| `90s-classic-shonen-anime` | 90s Classic Shonen Anime | 2D cel anime | High contrast cels, impact flashes |
| `cel-shaded-art` | Cel-Shaded Art Style | 3D toon shading | Toon ramp shaders & outline pass |
| `sharp-ink-outlines` | Sharp Ink Outlines | 2D vector / 3D outlines | Dark brown thick vector outlines |
| `rubber-hose-cartoon` | Rubber Hose Cartoon | 2D vector puppet | Curving limbs & squash/stretch |
| `modern-western-cartoon` | Modern Western Cartoon | 2D vector puppet | Dynamic vector rigs & eye blinks |
| `saturday-morning-cartoon` | Saturday Morning Cartoon | 2D cel / vector | Bold color blocks & limited poses |
| `flat-vector-animation` | Flat Vector Animation | 2D motion graphics | Clean SVG geometry & spring timing |
| `2d-puppet-animation` | 2D Puppet Animation | 2D skeletal / cutout | Hierarchical limb transforms & pivot points |
| `pencil-sketch` | Pencil Sketch Animation | 2D line art / texture | Seeded line boil & roughjs textures |
| `watercolor-storybook` | Watercolor Storybook | 2D painted illustration | Soft alpha edges, paper diffusion |
| `gouache-illustration` | Gouache Illustration | 2D painted illustration | Opaque color blocks & textured edges |
| `modern-tv-anime` | Modern TV Anime | 2D cel animation | Vector cels, multiplane parallax |
| `manga-screentone` | Manga Screentone | 2D monochrome print | Halftone dot patterns, ink hatching |
| `chibi-anime` | Chibi Anime | 2D stylized character | Oversized heads, expressive emotes |
| `anime-watercolor` | Anime Watercolor | 2D cel + painted bg | Cel characters over watercolor plates |
| `limited-animation-anime` | Limited Animation Anime | 2D pose-based cel | Strategic key pose holds & lip-sync |
| `80s-ova-anime` | 80s OVA Anime | 2D cel / painted bg | Atmospheric glows, cinematic framing |
| `stylized-3d-cartoon` | Stylized 3D Cartoon | 3D character animation | Soft toon lighting, 3D meshes |
| `isometric-3d` | Isometric 3D | 3D orthographic scene | 30° / 45° isometric camera projections |
| `voxel-art` | Voxel Art | 3D block geometry | Instanced 3D cubes / voxel grids |
| `toon-shaded-3d` | Toon Shaded 3D | 3D shader illustration | Custom stepped light ramp shaders |
| `3d-cutaway` | 3D Cutaway Animation | 3D explanatory viz | Clipping planes & exploded views |
| `toy-photography` | Toy Photography Style | 3D miniature object | Studio lights, macro shallow depth of field |
| `ukiyo-e` | Ukiyo-e | 2D woodblock-print | Hand-carved contours & flat ink plates |
| `linocut-print` | Linocut Print | 2D carved-print | White gouge marks on dark ink |
| `engraving-art` | Engraving Art | 2D line illustration | Cross-hatch densities & etched paths |
| `indian-miniature-painting` | Indian Miniature Painting | 2D traditional painted | Ornate borders, fine gold line overlays |
| `madhubani-folk-art` | Madhubani Folk Art | 2D folk illustration | Double outlines & geometric fish/tree motifs |
| `warli-art` | Warli Art | 2D geometric folk | White geometric triangles & circles on ochre |
| `pop-art` | Pop Art | 2D graphic illustration | Primary color blocks, Ben-Day halftone dots |
| `newspaper-illustration` | Newspaper Illustration | 2D monochrome print | Newsprint texture, halftone photo plates |
| `kinetic-typography` | Kinetic Typography | 2D text motion graphics | Spring-animated letterforms & text masks |
| `cinematic-2-5d` | Cinematic 2.5D | Layered 2D / pseudo-3D | Multiplane parallax camera depth |
| `film-noir` | Film Noir | 2D/2.5D cinematic | High-contrast black & white, dramatic blinds shadow |
| `neon-cyberpunk` | Neon Cyberpunk | 2D/3D compositing | Vibrant neon strokes & bloom glows |
| `silhouette-animation` | Silhouette Animation | 2D shape / cutout | High-contrast black silhouettes on color skies |
| `geometric-motion-graphics` | Geometric Motion Graphics | 2D vector motion graphics | Shape morphing, looping geometric repeaters |
| `vintage-film-animation` | Vintage Film Animation | 2D / footage treatment | Seeded grain, dust lines, sepia color grade |
| `sci-fi-hud` | Sci-Fi HUD Animation | 2D interface graphics | Vector dials, coordinates, animated waveforms |

---

## 4. Usage in Remotion Compositions

To apply any style preset or post-processing filter:
```tsx
import { StyleFilter } from "@remotion-project/visuals/styles";

export const MyScene = ({ frame }: { frame: number }) => {
  return (
    <StyleFilter styleId="film-noir" frame={frame}>
      {/* Your scene elements, characters, backgrounds */}
    </StyleFilter>
  );
};
```

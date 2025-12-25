# Design Specification: Dither Boy (Liquid Morphism)

## 1. Direction & Rationale

**Visual Essence:**
"Dither Boy" merges the tactile depth of **Liquid Morphism** with the vibrant energy of **80s Retro Futurism**. The interface features dark, frosted glass surfaces that float above a dynamic, deep-space gradient background, punctuated by neon cyan and magenta accents. It feels like a high-end, futuristic creative tool—fluid, responsive, and immersive.

**Core Experience:**
- **Materiality:** UI elements are treated as physical glass objects with light refraction, subtle borders, and layered depth.
- **Fluidity:** Interactions use spring physics (60fps) to create a "liquid" feel—panels morph, buttons ripple, and content flows.
- **Focus:** The chrome recedes; the user's artwork (canvas) is the luminous hero.

## 2. Design Tokens

### 2.1 Color System (Retro-Futuristic Dark Mode)

**Primary (Neon Accents)**
| Token | Value | Role |
|-------|-------|------|
| `primary-500` | `#00F0FF` | Main action, active states (Cyan) |
| `primary-glow`| `0 0 20px rgba(0, 240, 255, 0.4)` | Neon glow effect |
| `secondary-500`| `#FF0099` | Secondary actions, highlights (Magenta) |

**Glass & Surface (The "Liquid" Material)**
| Token | Value | Role |
|-------|-------|------|
| `surface-glass` | `rgba(20, 20, 25, 0.6)` | Main panels (sidebar, header) |
| `surface-glass-hover` | `rgba(30, 30, 35, 0.7)` | Interactive glass states |
| `surface-overlay` | `rgba(0, 0, 0, 0.4)` | Modals, backdrops |
| `border-glass` | `rgba(255, 255, 255, 0.1)` | Subtle edge definition |
| `border-glass-highlight` | `rgba(255, 255, 255, 0.2)` | Top/Left inner rim light |

**Background & Neutrals**
| Token | Value | Role |
|-------|-------|------|
| `bg-depth` | `#050510` | Deep space background base |
| `text-primary` | `#FFFFFF` | High contrast headings/labels |
| `text-secondary` | `rgba(255, 255, 255, 0.6)` | Metadata, descriptions |
| `text-muted` | `rgba(255, 255, 255, 0.4)` | Placeholders, disabled |

### 2.2 Typography (Geometric Technical)

**Font Family:** `Inter`, `Space Grotesk` (headings), or system sans.
**Scale (Major Third 1.25):**
| Level | Size | Weight | Line Height | Tracking |
|-------|------|--------|-------------|----------|
| `h1` | 32px | Bold (700) | 1.2 | -0.02em |
| `h2` | 24px | Semi (600) | 1.3 | -0.01em |
| `body` | 14px | Reg (400) | 1.5 | 0 |
| `small` | 12px | Med (500) | 1.5 | 0.02em |
| `mono` | 12px | Reg (400) | 1.4 | 0 |

### 2.3 Spacing & Geometry (4pt Grid)

- **Spacing:** `4, 8, 12, 16, 24, 32, 48, 64px`
- **Radius:**
  - `radius-sm`: 8px (Inner elements, inputs)
  - `radius-md`: 16px (Cards, buttons)
  - `radius-lg`: 24px (Panels, modals)
  - `radius-full`: 9999px (Pills, circular buttons)
- **Blur:**
  - `blur-sm`: `backdrop-filter: blur(8px)`
  - `blur-md`: `backdrop-filter: blur(16px)`
  - `blur-lg`: `backdrop-filter: blur(32px)`

## 3. Components

### 3.1 Glass Panel (Container)
The structural building block.
- **Structure:** `radius-lg`, `surface-glass` background, `blur-md`.
- **Border:** `1px solid border-glass`.
- **Shadow:** `0 8px 32px rgba(0,0,0,0.3)` (Deep shadow for lift).
- **Rim Light:** `box-shadow: inset 1px 1px 0 0 border-glass-highlight`.
- **States:** None (static container).

### 3.2 Liquid Button (Primary)
Main calls to action (e.g., "Export").
- **Structure:** Height 48px, `radius-full`.
- **Background:** `primary-500` (Solid) OR `surface-glass` (Secondary).
- **Text:** Black (on Primary), White (on Secondary).
- **Interaction:**
  - Hover: Scale 1.05, Brightness 1.1, `cursor: pointer`.
  - Active: Scale 0.95.
  - Motion: `spring(stiffness: 400, damping: 30)`.

### 3.3 Algorithm Card (Selectable)
Grid item in the left panel.
- **Structure:** Aspect Ratio 16:9 or Square.
- **Background:** `rgba(255,255,255,0.05)`.
- **Border:** `1px solid transparent`.
- **Content:** Thumbnail preview + Label overlay (bottom).
- **States:**
  - Selected: Border `primary-500`, Background `rgba(0, 240, 255, 0.1)`.
  - Hover: Lift -4px, `box-shadow: 0 4px 16px rgba(0,0,0,0.2)`.

### 3.4 Slider Control (Input)
Precise parameter tuning.
- **Track:** Height 4px, `rgba(255,255,255,0.1)`, `radius-full`.
- **Fill:** `primary-500`.
- **Thumb:** 16x16px, White, `shadow-sm`, Scale 1.2 on hover.
- **Value:** Floating tooltip on drag.

### 3.5 Drop Zone (Canvas Overlay)
Interactive area for file upload.
- **State (Idle):** Invisible or subtle dashed border.
- **State (Dragging):** Full overlay `rgba(0, 240, 255, 0.1)`, Border `2px dashed primary-500`.
- **Animation:** Fade in (200ms).

### 3.6 Navigation Bar
- **Structure:** Fixed Top, Height 64px, `blur-lg`.
- **Background:** `surface-glass` (Higher transparency).
- **Elements:** Logo (Left), Theme Toggle/Github (Right).
- **Border:** Bottom `1px solid border-glass`.

## 4. Layout & Responsive Patterns

### 4.1 Editor Layout (Desktop > 1024px)
**Structure:** Three-column layout.
1.  **Left Panel (280px):** Fixed width, scrollable. Contains Algorithm Categories & Search.
2.  **Center Canvas (Flex):** Fluid width, centered content. Margins 32px.
3.  **Right Panel (320px):** Fixed width, scrollable. Contains Parameters & Export.

**Glass Layering:**
- Background: Abstract animated gradient meshes (Deep Blue/Purple).
- Layer 1: App Shell (Panels).
- Layer 2: Modals/Dropdowns.
- Layer 3: Tooltips/Toasts.

### 4.2 Responsive Adaptation
- **Tablet (768px - 1024px):**
  - Left Panel becomes a Drawer (Hamburger menu).
  - Right Panel stays visible or collapses to bottom sheet.
- **Mobile (< 768px):**
  - Stacked Layout.
  - Canvas (Top) -> Parameters (Bottom Sheet) -> Algorithms (Bottom Sheet).
  - Bottom Navigation Bar for switching views (Edit / Library / Export).
  - Touch Targets: Minimum 44px.

## 5. Interaction & Animation

**Engine:** Framer Motion (React).

**Principles:**
1.  **Liquid Morph:** Elements should visually "flow" between states using layout preservation (`layout` prop).
2.  **Spring Physics:** No linear easings. Use springs for natural weight.
3.  **Micro-interactions:** Every click/hover yields immediate visual feedback (Scale, Glow, Color).

**Standard Transitions:**
- **Panel Entry:** Slide from edge + Fade. `x: -20px -> 0`, `opacity: 0 -> 1`.
- **Modal Entry:** Scale up + Fade. `scale: 0.9 -> 1`.
- **List Items:** Staggered entrance (`staggerChildren: 0.05`).

**Performance:**
- Animate `transform` and `opacity` ONLY.
- Use `will-change: transform` on heavy glass elements.
- Disable blur animations on low-power devices (Media query check).

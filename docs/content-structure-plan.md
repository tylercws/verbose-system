# Content Structure Plan - Dither Boy (Liquid Morphism Edition)

## 1. Material Inventory
**Strategy Document:** `dithering_app_comprehensive_strategy.md`
- **Core Function:** Real-time image/video dithering (WebGL/WASM).
- **Algorithm Categories:** Error Diffusion, Ordered (Bayer), Blue-Noise, Halftone, Glitch.
- **Video Features:** ffmpeg.wasm integration, frame-by-frame processing.
- **Aesthetic:** Liquid Morphism, Glassmorphism, Retro-futuristic (80s nostalgia).

## 2. Website Structure
**Type:** SPA (Single Page Application)
**Reasoning:** The application is a tool-based interface ("Editor"). Users stay in one environment to upload, edit, and export. A multi-page structure would disrupt the workflow.

## 3. Page/Section Breakdown

### Main View (Editor Interface)
**Purpose:** The central workspace for all operations.

| Section | Component Pattern | Content Source | Content to Extract | Visual Asset (Content ONLY) |
|---------|------------------|----------------|-------------------|------------------------------|
| **Global Header** | Glass Navbar | Strategy §3 | Brand Logo ("Dither Boy"), GitHub link, Theme Toggle | `imgs/logo.svg` (create placeholder) |
| **Canvas Area** | Hero/Canvas Pattern | Strategy §6 | Main viewport for Image/Video preview. Drag & Drop zone overlay. | User Uploaded Content |
| **Algorithm Panel** | Glass Sidebar (Left) | Strategy §5 | List of 50+ algorithms categorized: Error Diffusion, Bayer, Noise, Halftone, Glitch. Search bar. | - |
| **Controls Panel** | Glass Sidebar (Right) | Strategy §5 | Parameter sliders (dither amount, palette selection, contrast), Video timeline. | - |
| **Export Overlay** | Modal Pattern | Strategy §6 | Format selection (PNG/JPG/MP4/GIF), Scale, Frame rate (for video). | - |

### Content Details & Data Requirements

**1. Algorithm Categories (for Left Panel)**
*Source: Strategy §5.3*
- **Error Diffusion:** Floyd-Steinberg, Jarvis, Stucki, Atkinson, Sierra.
- **Ordered:** Bayer 2x2, 4x4, 8x8.
- **Stochastic:** Blue Noise.
- **Artistic:** Glitch, Halftone, Custom Palette.

**2. Control Parameters (for Right Panel)**
*Source: Strategy §5.4*
- **General:** Brightness, Contrast, Gamma.
- **Dither Specific:** Matrix size, Divisor, Threshold.
- **Palette:** Presets (Gameboy, CGA, Monochrome), Custom Upload.

**3. Video Specifics (Timeline Area)**
*Source: Strategy §6*
- Playback controls (Play/Pause, Loop).
- Timeline scrubber.
- Frame drop warning indicator.

## 4. Content Analysis
**Information Density:** High (Editor interface)
**Content Balance:**
- **Visuals:** 80% (Canvas is hero).
- **Controls:** 20% (UI chrome).
- **Text:** Minimal (Labels only).
**Interaction Intensity:** Very High (Real-time slider adjustments, drag-and-drop).

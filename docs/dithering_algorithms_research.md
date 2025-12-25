# Comprehensive Research on Dithering Algorithms for Image and Video Processing

## Executive Summary and Objectives

Dithering is the intentional insertion of structured or stochastic noise to mitigate perceptual artifacts caused by quantization—most notably color banding—when reducing color depth or constraining imagery to a limited palette. In the image domain, dithering exploits spatial integration in human vision to preserve tonal transitions and fine detail. In the video domain, dithering can suppress temporal banding while interacting with compression, display pipeline color spaces, and frame-to-frame stability.

This report surveys the principal families of dithering—Floyd–Steinberg and other error diffusion algorithms, ordered dithering using Bayer matrices and blue-noise threshold maps, random noise dithering, color dithering approaches, halftone screening patterns, glitch-art techniques, and web/video implementation strategies. It details error diffusion kernels and variants (Atkinson, Stucki, Burkes, Sierra, Jarvis–Judice–Ninke, Fan/Shiau-Fan, and Riemersma), Bayer matrix generation and normalization, blue-noise threshold maps and their perceptual advantages, color quantization with nearest-neighbor palette mapping, halftone screening and dot diffusion, glitch-oriented manipulations, and practical web deployment via Canvas, WebGL, and GPU shaders. The report concludes with performance guidance, aesthetic recommendations, and research gaps requiring further benchmarking and validation.

Key findings:

- Error diffusion provides high visual quality for static images and handles arbitrary palettes but is inherently sequential and can exhibit worm artifacts; serpentine scanning and variant kernels mitigate these to varying degrees. [^1][^3][^9]
- Ordered dithering with Bayer matrices is fast, deterministic, and GPU-friendly, but introduces crosshatch patterning and brightness bias unless thresholds are normalized and centered. [^4][^6][^5]
- Blue-noise dithering yields spatially uniform high-frequency dot distributions, reduces low-frequency clumping, and offers animation stability and good denoiser compatibility; threshold maps can be precomputed offline. [^5][^10][^11][^12][^13]
- Random (white noise) dithering is simple and parallelizable but often appears grainy and unstable across frames. [^14][^5]
- For web deployment, ordered and blue-noise methods align well with fragment shaders; error diffusion can run on CPU or be approximated via multi-pass techniques but is challenging for real-time video at high resolutions. [^6][^7][^8][^16][^15]

Deliverables include technical implementation details, visual characteristics, processing requirements, web-compatible approaches, and categorization by stylistic intent and technical mechanism.

Information gaps acknowledged: rigorous cross-algorithm benchmarks on standardized datasets, comprehensive palettes and bit-depth configurations beyond core examples, quantitative video temporal stability metrics, detailed GPU kernel optimizations per device class, licensing specifics for certain variants, and perceptual tuning guidelines for arbitrary color palettes.

[^5]: Ditherpunk — The article I wish I had about monochrome image dithering.
[^6]: The Art of Dithering and Retro Shading for the Web.
[^7]: Apply dithering and retro filters to images and videos in the browser.
[^8]: WebGL Image Processing.
[^16]: WebGL best practices - MDN.
[^1]: Floyd–Steinberg dithering.
[^3]: Image Dithering: Eleven Algorithms and Source Code.
[^9]: libcaca study - 3. Error diffusion.
[^4]: Ordered dithering.
[^10]: Methods for Generating Blue-Noise Dither Matrices for Digital Halftoning.
[^11]: Rendering in Real Time with Spatiotemporal Blue Noise Textures (Part 1).
[^12]: Optimizing blue-noise dithering – backpropagation through Fourier transform and sorting.
[^13]: Blue Noise Dithering - Andrew Bauer.
[^14]: Random Dithering.


## Foundations: Quantization, Color Spaces, and Dithering

Quantization maps a continuous or high-bit-depth signal to a reduced palette or bit depth, introducing rounding errors that manifest as banding or contouring in smooth gradients. Dithering randomizes these errors in space or time to break up large-scale structures and leverage the eye’s low-pass spatial response. Effective dithering must consider the display-referred encoding: operations that involve averaging, error propagation, and thresholding should be performed in linear light to avoid perceptually nonuniform distortion of midtones. In practice, that means converting from sRGB to linear before dithering and converting back afterward. [^5]

There is a fundamental trade-off between structured and stochastic dithering. Ordered (Bayer) matrices and clustered-dot screens impose regular patterns that can be aesthetically pleasing and temporally stable but may introduce visible crosshatch or moiré. Error diffusion achieves high quality by propagating quantization error to neighboring pixels but is sequential and can produce worm-like artifacts in uniform regions. Blue-noise threshold maps occupy a middle ground, offering high-frequency, low-correlation noise that reduces perceptual artifacts without strong structural patterns. [^4][^5][^19]

To frame these trade-offs, Table 1 provides a conceptual comparison across algorithm families.

Table 1. Conceptual trade-offs across dithering families

| Family                     | Pattern structure         | Perceptual smoothness       | Temporal stability           | Parallelizability            | Typical artifacts                         |
|---------------------------|---------------------------|-----------------------------|------------------------------|-----------------------------|-------------------------------------------|
| Error diffusion (FS, etc.)| Organic, directional      | High in static images       | Moderate; scan-order sensitive| Low (sequential)            | Worming, directional smearing             |
| Ordered (Bayer)           | Regular crosshatch        | Moderate; pattern可见       | High; thresholds static       | High (per-pixel)            | Crosshatch, moiré, brightness bias        |
| Blue-noise threshold map  | Stochastic high-frequency | High; uniform dot distribution| High; tiles stable            | High (per-pixel)            | Subtle spatial noise; map generation cost |
| Random (white noise)      | Unstructured              | Low; grainy                 | Low; frame-to-frame variation | High (per-pixel)            | Grain/clumping, temporal flicker          |

Sources: [^5] [^4] [^19]

The remainder of this section details how these principles manifest in concrete algorithms and how to implement them on the web.

### Random Dithering (White Noise)

Random dithering adds uniform white noise before quantization so that pixels near a threshold randomly cross it, yielding an unbiased distribution over large areas. Each pixel’s value is compared to a random threshold drawn independently across the image. For monochrome quantization, brightness can be compared to a uniform random value in [0,1], producing black or white decisions with the correct average over many pixels. The approach is trivially parallelizable but often produces a grainy appearance and unstable animations due to frame-to-frame randomness. [^14] [^5]

Implementation note: to avoid temporal flicker in video, random dithering should either seed noise per frame identically or be replaced by a static noise texture (blue noise preferred) tiled across frames. [^5]

### Ordered Dithering (Bayer Matrices)

Ordered dithering tiles a precomputed threshold matrix across the image. At each pixel, the incoming value (or luminance for grayscale) is compared to the threshold at the corresponding matrix position; if above, it quantizes to one level, otherwise to the other. For multi-level quantization, thresholds can be offset or the matrix normalized to avoid brightness bias. The method is deterministic and highly parallel, making it suitable for fragment shaders and Canvas-based pixel manipulation. [^4]

A critical implementation detail is normalizing and centering the thresholds. Standard Bayer matrices can be precalculated as integer indices and normalized by n²; many formulations also subtract 0.5 to center thresholds around zero, reducing average brightness shifts on small or arbitrary palettes. Without this normalization, ordered dithering can slightly lighten images, especially near black or white. [^4]

Bayer matrices are typically powers of two in size (2×2, 4×4, 8×8, 16×16) and can be generated recursively. Smaller matrices produce more visible patterns; larger matrices reduce pattern perceptibility at the cost of bigger threshold maps and potential moiré with fine detail. [^4] [^6] [^20]

Table 2 summarizes common Bayer matrix sizes and their normalized forms and visual tendencies.

Table 2. Common Bayer matrices: size, normalized values, and visual characteristics

| Size  | Example normalized values (precalculated) | Visual characteristics                         |
|-------|-------------------------------------------|------------------------------------------------|
| 2×2   | [[0.00, 0.50], [0.75, 0.25]]              | Strong crosshatch; pronounced pattern visibility|
| 4×4   | See reference matrix in [^4]              | More uniform; crosshatch still visible         |
| 8×8   | See reference matrix in [^4] [^20]        | Smoother gradients; reduced moiré with care    |
| 16×16 | Larger patterns; threshold tiling subtle  | Near-stochastic appearance; stable in motion   |

Sources: [^4] [^20]

Bayer matrices can be generated recursively—for example, by a Kronecker product construction that populates a 2n×2n matrix from an n×n base—then normalized by dividing by n² to produce thresholds in [0,1). For multi-channel color images, the same matrix can be applied per channel, though care is needed for arbitrary palettes (see Color Dithering). [^4] [^6]

#### Matrix Generation and Normalization

Recursive construction ensures thresholds are well-distributed. A standard approach uses a base 2×2 matrix and iteratively builds larger matrices via a pattern of additions and index interleaving, then normalizes by the total count of entries. To center thresholds and avoid brightness bias, subtract 0.5 after normalization. In shaders, threshold lookup is performed via modular arithmetic on pixel coordinates. [^4] [^6]

#### Visual Characteristics and Pattern Artifacts

Ordered dithering’s visible crosshatch is a hallmark. In static images, the regularity can be aesthetically pleasing and compress well; in animations, thresholds remain static relative to the image, avoiding flicker. However, crosshatch can compete with fine detail, and moiré can appear when sampling structured scenes with periodic content. Larger matrices reduce pattern visibility but increase computational footprint and can still interact with image content. [^4]

### Blue-Noise Dithering

Blue-noise dithering uses threshold maps whose energy is concentrated at high spatial frequencies, minimizing low-frequency content that causes visible clumping or void formation. The result is a more uniform distribution of dots, which appears smoother perceptually and remains stable in motion. Blue-noise maps are typically precomputed offline using void-and-cluster or energy-minimization procedures and then applied per pixel in a shader or CPU loop. [^5] [^10] [^13]

Compared to white noise, blue-noise dithering reduces perceptual chunkiness at low sampling rates and integrates better with denoisers in rendering. Compared to ordered dithering, blue noise avoids strong crosshatch patterns while retaining parallelism. [^13] [^5]

#### Generation Algorithms and Parameters

Blue-noise maps can be generated via iterative pixel swapping guided by an energy function that penalizes low-frequency correlations. Practical parameters reported for 2D generation include a spatial sigma around 2.1, a sampling window of 9×9, and millions of iterations to converge. Modern approaches may use Fourier-domain optimization and sorting-based backpropagation to tune the dithering matrix directly, trading expensive generation for improved perceptual properties. Spatiotemporal blue-noise textures further constrain temporal correlation, ensuring each pixel exhibits blue-noise characteristics over time. [^13] [^12] [^11]

Table 3 outlines representative generation parameters and their impact.

Table 3. Blue-noise generation: parameters and trade-offs

| Parameter         | Typical value(s)           | Impact on quality and runtime                    |
|-------------------|----------------------------|--------------------------------------------------|
| Texture size      | 128×128                    | Larger sizes cost more memory but yield stable tiling |
| Iterations        | ~4,000,000                 | More iterations improve uniformity; longer runtime    |
| σ (spatial)       | ~2.1                       | Controls distance-based decay; affects cluster suppression |
| Window size       | 9×9                        | Balances locality and detection of low-frequency energy  |
| Temporal control  | Spatiotemporal textures    | Stabilizes frames; critical for video                 |

Sources: [^13] [^11] [^12]

#### Applications and Visual Outcomes

Blue-noise dithering is widely used in rendering and image processing to achieve smoother appearance at low sample counts, with improved denoiser performance. In dithering, blue-noise threshold maps produce organic, uniform dot distributions without directional artifacts, making them suitable for both static images and video. [^13] [^11] [^5]

## Error Diffusion Algorithms

Error diffusion quantizes each pixel to the nearest palette color and distributes the quantization error to neighboring, unprocessed pixels according to a kernel. The scan order is typically left-to-right, top-to-bottom; serpentine scanning alternates direction on alternate rows to reduce directional artifacts. Error diffusion can handle arbitrary palettes (e.g., arbitrary sets of RGB colors) by selecting the nearest palette entry in color space and diffusing the residual. Quality, memory, and speed depend on kernel size and scan order. [^1] [^9] [^3]

Kernels are described as matrices relative to the current pixel X, with a divisor indicating how the error is normalized before distribution. Table 4 provides a comparative summary.

Table 4. Error diffusion kernels: weights, divisor, lookahead, and artifacts

| Algorithm                 | Kernel weights (relative to X)                                           | Divisor | Lookahead rows | Visual artifacts and notes                          |
|--------------------------|---------------------------------------------------------------------------|---------|----------------|-----------------------------------------------------|
| Floyd–Steinberg (FS)     | X 7; 3 5 1                                                               | 16      | 1              | Classic; good quality; worms in uniform regions     |
| Fan                     | X 7; 5 3 1                                                               | 16      | 1              | FS derivative; slightly different artifact balance  |
| Shiau-Fan (family)       | variants (e.g., X 6; 2 6 2)                                              | 16      | 1              | Patents; artifact suppression focus                 |
| Atkinson                | X 1 1; 1 1 1; 1                                                          | 8       | 2              | Reduced error propagation; higher midtone contrast  |
| Stucki                  | X 8 4; 2 4 8 4 2; 1 2 4 2 1                                              | 42      | 2              | JJN variant; smoother; moderate speed               |
| Burkes                  | X 8 4; 2 4 8 4 2                                                         | 32      | 1              | Simplified Stucki; power-of-two math                |
| Sierra (standard)       | X 5 3; 2 4 5 4 2; 2 3 2                                                  | 32      | 2              | JJN variant; fewer pixels than JJN; speed/quality trade |
| Sierra Two-Row          | X 4 3; 1 2 3 2 1                                                         | 16      | 1              | Faster variant; slightly reduced quality            |
| Sierra Filter Lite      | X 2; 1 1                                                                 | 4       | 1              | Very fast; simplified artifacts                     |
| Jarvis–Judice–Ninke (JJN)| X 7 5; 3 5 7 5 3; 1 3 5 3 1                                            | 48      | 2              | Wider diffusion; smoother gradients                 |
| Riemersma               | Sequenced error with exponential falloff along space-filling curve        | —       | —              | Organic appearance; sequential; curve-distance artifacts possible |

Sources: [^1] [^9] [^3]

In practice, Floyd–Steinberg is the default choice for high-quality static images; Atkinson yields a crisper midtone appearance at the cost of highlights/shadows; Stucki/Burkes/Sierra trade speed and memory for smoother results. Serpentine scanning reduces worms and directional smearing. Riemersma’s space-filling curve traversal can produce organic textures but remains sequential. [^3] [^9]

### Floyd–Steinberg Dithering

Floyd–Steinberg distributes 7/16 of the error to the right, 3/16 to bottom-left, 5/16 to bottom, and 1/16 to bottom-right. The divisor is 16, enabling efficient bit-shifting on modern hardware. FS works well with grayscale and color; for color, nearest-neighbor palette selection in RGB space followed by error diffusion maintains local color accuracy. Serpentine scanning can reduce worm artifacts. [^1] [^3]

Table 5 details the FS kernel.

Table 5. Floyd–Steinberg kernel specification

| Position         | Weight |
|------------------|--------|
| Right (x+1, y)   | 7/16   |
| Bottom-left (x-1, y+1) | 3/16   |
| Bottom (x, y+1)  | 5/16   |
| Bottom-right (x+1, y+1)| 1/16   |

Source: [^1]

### Variants and Derivatives

Derivatives modify weights and scan patterns to address artifacts. Fan and Shiau-Fan adjust coefficients to reduce directional artifacts; Atkinson diffuses only 75% of the error, emphasizing midtones; Stucki and Burkes scale JJN to reduce lookahead or simplify math; Sierra variants reduce the number of weighted neighbors for speed; Filter Lite is the simplest FS-like variant. [^9] [^3]

Table 6 summarizes key differences.

Table 6. Variant comparison: weights, divisor, lookahead, quality, speed

| Variant            | Divisor | Lookahead | Quality characteristics                 | Speed class        |
|-------------------|---------|-----------|------------------------------------------|--------------------|
| Fan               | 16      | 1         | Similar to FS; different artifact balance| Fast               |
| Shiau-Fan (family)| 16      | 1         | Artifact suppression; patented           | Fast               |
| Atkinson          | 8       | 2         | Crisp midtones; reduced bleed            | Fast               |
| Stucki            | 42      | 2         | Smooth gradients                         | Moderate           |
| Burkes            | 32      | 1         | Close to Stucki; power-of-two math       | Fast–Moderate      |
| Sierra (standard) | 32      | 2         | JJN-like; fewer neighbors                | Moderate           |
| Sierra Two-Row    | 16      | 1         | Faster; slightly reduced smoothness      | Fast               |
| Sierra Filter Lite| 4       | 1         | Very simple; more artifacts              | Very fast          |
| JJN               | 48      | 2         | Widest diffusion; smoothest              | Slower             |
| Riemersma         | —       | —         | Organic, curved-traversal artifacts      | Sequential; slower |

Sources: [^9] [^3]

### Scan Order and Traversal

Raster (left-to-right, top-to-bottom) scanning is standard and avoids revisiting pixels. Serpentine (boustrophedon) scanning alternates direction each row and can reduce worm artifacts and directional bias, particularly in uniform regions. Riemersma’s traversal follows a Hilbert space-filling curve, preserving locality and producing organic patterns; however, distances along the curve do not always correspond to spatial proximity, potentially introducing structural artifacts. [^9] [^3]


## Color Dithering Algorithms

Color dithering generalizes grayscale techniques to multiple channels and arbitrary palettes. The two main approaches are per-channel ordered dithering and error diffusion with nearest-neighbor palette selection.

- Per-channel ordered dithering applies the same Bayer or blue-noise threshold map to each RGB channel. This is fast and suitable for real-time applications but can produce color shift artifacts if the thresholds are not balanced across channels or if the palette is highly non-uniform. [^4] [^6]

- Error diffusion selects the nearest palette color in 3D color space (e.g., Euclidean distance in RGB), quantizes the pixel to that color, and diffuses the vector error to neighbors. This better respects arbitrary palettes but is sequential and more computationally intensive. [^3]

Arbitrary-palette positional dithering (Yliluoma) is a notable ordered approach that attempts to produce good results even with uneven palette spacing by optimizing positional decisions. It is patent-free and can be tailored to arbitrary palettes. [^21]

Table 7 provides a decision matrix for palette types and recommended methods.

Table 7. Color dithering decision matrix: palette types and method suitability

| Palette type            | Ordered (Bayer/Blue) suitability | Error diffusion suitability | Notes                                                         |
|-------------------------|----------------------------------|-----------------------------|---------------------------------------------------------------|
| Uniform per-channel     | High                             | High                        | Per-channel thresholds work well; FS stable                  |
| Non-uniform arbitrary   | Moderate (Yliluoma recommended)  | High                        | Nearest-neighbor diffusion handles arbitrary sets best       |
| Small palette (≤16)     | Moderate                         | High                        | Patterns more visible; diffusion preserves tones             |
| Retro/pixel-art palettes| High (Bayer/blue)                | Moderate–High               | Ordered for style; diffusion can add organic texture         |
| Video real-time         | High (Bayer/blue)                | Low–Moderate                | Prefer ordered; diffusion sequential and costly              |

Sources: [^4] [^21] [^3] [^6]

### Ordered Color Dithering

Apply the same threshold map to each RGB channel independently. When using Bayer matrices, normalize and center thresholds to avoid brightness bias. Avoid moiré by selecting matrix sizes appropriate to the content and by considering blue-noise maps for scenes with fine periodic detail. [^4] [^6]

### Arbitrary Palette Methods

Nearest-neighbor selection in RGB space with error diffusion preserves local color fidelity even for non-uniform palettes. Yliluoma’s positional dithering improves ordered dithering for arbitrary palettes by optimizing placement. For web, ordered methods are shader-friendly; diffusion remains CPU-bound or requires GPU approximations with careful pipelining. [^3] [^21] [^7]


## Halftone Patterns and Screening Algorithms

Digital halftoning approximates continuous tones using spatial modulation of dot size, density, or clustering. Clustered-dot screens mimic traditional printing, producing larger, visible dots that can be aesthetically pleasing and robust in print pipelines. Dispersed-dot screens distribute single pixels more uniformly, akin to Bayer or blue-noise dithering. Dot diffusion, introduced by Knuth, combines tileable matrices with cell ranking to influence local error propagation and produce hybrid textures. [^19] [^9]

Table 8 compares screening approaches.

Table 8. Screening approaches: clustered vs dispersed vs dot diffusion

| Approach        | Mechanism                          | Texture look             | Pros                                   | Cons                                  |
|-----------------|------------------------------------|--------------------------|----------------------------------------|---------------------------------------|
| Clustered-dot   | Cluster size modulation            | Visible dots             | Print-friendly; robust; aesthetic      | Lower resolution; pattern visibility  |
| Dispersed-dot   | Single-pixel density modulation    | Uniform fine grain       | High detail; less visible patterning   | Sensitive to moiré; display pipeline dependent |
| Dot diffusion   | Tileable matrices + cell ranking   | Hybrid organic texture   | Tileable; controllable diffusion       | More complex; sequential elements     |

Sources: [^19] [^9]


## Glitch Art and Artistic Dithering Effects

Glitch art uses deliberate errors—databending, pixel sorting, data moshing, hex editing, glitch scanning, light leaks, double exposure, and noise/grain—to disrupt the illusion of coherent pixels and explore the aesthetics of failure. While not dithering per se, these techniques can be combined with dithering to emphasize texture, fragmentation, and digital decay. Pixel sorting reorganizes pixels based on brightness or hue, producing streaks and clusters; data moshing smears frames by removing keyframes; noise and grain overlay or amplify stochastic texture. [^18] [^5]

Combining glitch techniques with ordered or blue-noise dithering can produce controlled texture overlays that remain stable in motion, while error diffusion can add organic irregularities that complement databending artifacts.


## Advanced Dithering Techniques for Video Processing

Video dithering must address temporal stability, compression interactions, and real-time constraints. Ordered and blue-noise methods are naturally suited to GPU shaders and can be applied per frame with stable threshold maps. Error diffusion, by contrast, is sequential and harder to accelerate, though CPU implementations can be optimized for moderate resolutions. Client-side tools demonstrate practical video dithering workflows with live preview and export. [^7]

Spatiotemporal blue-noise textures ensure both spatial high-frequency distribution and temporal blue-noise characteristics, improving perceived stability and reducing temporal banding without flicker. These textures are applicable to video dithering where consistent frame-to-frame behavior is essential. [^11]

Table 9 compares video techniques across real-time constraints and stability.

Table 9. Video dithering techniques: real-time suitability and stability

| Technique                     | Real-time suitability | Temporal stability | Notes                                                      |
|-------------------------------|-----------------------|--------------------|------------------------------------------------------------|
| Ordered (Bayer)               | High (GPU)            | High               | Static thresholds; potential crosshatch                    |
| Blue-noise threshold map      | High (GPU)            | High               | Uniform high-frequency distribution; preferred for video   |
| Error diffusion (FS, etc.)    | Low–Moderate (CPU)    | Moderate           | Sequential; serpentine helps; expensive at high resolution |
| Spatiotemporal blue-noise     | High (GPU)            | Very high          | Explicit time-axis control; best for low-flicker video     |

Sources: [^7] [^11]


## Performance Considerations for Web-based Implementation

Modern web applications have three primary pathways for dithering: CPU pixel manipulation via Canvas 2D, GPU processing via WebGL fragment shaders, and higher-level frameworks that bundle post-processing passes.

- Canvas 2D is simple and portable but CPU-bound; it works well for small images or non-real-time processing.

- WebGL fragment shaders enable per-pixel operations at scale, ideal for ordered and blue-noise dithering. Efficient pipelines include ping-pong framebuffers for multi-pass effects and careful management of textures and uniforms. [^8] [^16]

- Open-source browser tools demonstrate practical, client-side image and video dithering with live preview and export, validating the feasibility of real-time dithering in the browser. [^7]

Table 10 summarizes implementation pathways.

Table 10. Implementation pathways for web dithering

| Pathway      | Algorithms                        | Performance class | Developer effort | Notes                                              |
|--------------|-----------------------------------|-------------------|------------------|----------------------------------------------------|
| Canvas 2D    | Ordered, blue-noise, simple diffusion (small) | Low–Moderate      | Low              | CPU-bound; good for static images                  |
| WebGL shader | Ordered, blue-noise, screening    | High              | Moderate         | Fragment shaders; stable patterns; GPU-accelerated |
| Hybrid       | Post-processing stacks (e.g., React Three Fiber) | High              | Moderate–High    | Composable effects; uniforms control; FBOs         |

Sources: [^8] [^16] [^7]

### Canvas 2D vs WebGL Shaders

Ordered and blue-noise dithering map naturally to fragment shaders: each fragment samples the input texture, fetches a threshold from a precomputed matrix or texture, and outputs the quantized color. Best practices include minimizing branching, using integer textures or normalized floats for thresholds, and batching operations to reduce draw calls. [^8] [^16]

### GPU-friendly Dithering Patterns

Blue-noise textures can be bound as uniforms or sampler2D arrays; thresholds are retrieved using UV modulo tile size or texture coordinates. Threshold normalization and centering are crucial to avoid brightness bias. Avoid per-pixel random number generation on GPU to maintain temporal stability and performance; precompute noise and blue-noise maps offline. [^5] [^6]

### Client-side Video Pipelines

Practical browser tools validate client-side processing for both images and videos, with algorithm selection, palette control, and export to standard formats. Real-time previews benefit from GPU shaders; for error diffusion, CPU pipelines can be used with lower resolutions or reduced frame rates. [^7]


## Categorization and Selection Guide

Dithering algorithms can be categorized by intent and mechanism:

- Bitmap style: ordered dithering (Bayer), blue-noise dithering, random noise; emphasizes texture and pattern control.
- Glitch effects: databending, pixel sorting, data moshing, noise overlays; emphasizes disruption and decay.
- Modulation: halftone screening, dot diffusion; emphasizes dot size/density and clustered patterns.
- Arbitrary palette control: nearest-neighbor error diffusion, Yliluoma positional dithering; emphasizes color fidelity to non-uniform sets.

Aesthetic and technical selection depends on content type, desired pattern visibility, palette uniformity, and real-time constraints. Table 11 provides a selection matrix.

Table 11. Algorithm selection by content type, palette, and constraints

| Content type       | Palette uniformity       | Real-time need | Recommended approach                      | Rationale                                      |
|--------------------|--------------------------|----------------|-------------------------------------------|------------------------------------------------|
| Portraits          | Uniform per-channel      | Yes            | Blue-noise ordered dithering              | Smooth tones; low flicker                      |
| Landscapes         | Uniform or small arbitrary| Yes           | Blue-noise; optional FS for stills        | Stable patterns; gradient handling             |
| Line art           | Binary or few colors     | Yes            | Bayer (small matrix)                      | Crisp lines; low anomaly                       |
| Retro pixel art    | Small arbitrary          | Yes            | Bayer or blue-noise                       | Style control; stable animation                |
| High-fidelity still| Arbitrary non-uniform    | No             | FS or JJN with nearest-neighbor palette   | Best color fidelity; accept sequential cost    |
| Video (low-flicker)| Arbitrary                | Yes            | Spatiotemporal blue-noise                 | Temporal stability; low banding                |

Sources: [^5] [^7] [^6]


## Implementation Playbook: Web Recipes

This section distills the preceding analysis into actionable recipes for web engineers and graphics developers.

- Ordered (Bayer) dithering shader:
  - Precompute a normalized Bayer matrix (e.g., 8×8) and pass as a uniform or texture.
  - For each fragment, compute tile coordinates via UV modulo matrix size.
  - Compare channel values to centered thresholds and quantize to target levels.
  - Normalize thresholds to avoid brightness bias; consider inverting thresholds if needed. [^4] [^6]

- Blue-noise threshold map:
  - Precompute a blue-noise texture offline (e.g., 128×128) with void-and-cluster or energy minimization.
  - Bind as sampler2D; fetch threshold via UV modulo tile size.
  - Apply per pixel for ordered dithering; tune levels for palette size.
  - For video, prefer spatiotemporal blue-noise textures to minimize flicker. [^10] [^11] [^13]

- Error diffusion (CPU):
  - Implement FS or chosen variant with serpentine scanning to reduce worm artifacts.
  - For color, nearest-neighbor palette selection followed by vector error diffusion.
  - Optimize with row buffers (lookahead arrays) and bit-shifts where divisors are powers of two.
  - Limit resolution or frame rate for real-time video; consider GPU approximations only with caution. [^1] [^3] [^9]

- Glitch combinations:
  - Overlay pixel sorting or databending artifacts on dithered images to accentuate texture.
  - Use blue-noise overlays to stabilize the appearance of grain in motion. [^18] [^5]

Table 12 consolidates the recipes and parameters.

Table 12. Recipe parameters for web dithering

| Recipe                        | Inputs                                  | Key steps                                           | Outputs                    | Pitfalls                                  |
|------------------------------|-----------------------------------------|-----------------------------------------------------|----------------------------|-------------------------------------------|
| Bayer ordered shader         | Bayer matrix (normalized), levels       | Threshold lookup, compare per channel, quantize     | Dithered image             | Brightness bias if not centered           |
| Blue-noise ordered shader    | Blue-noise texture, levels              | Threshold lookup, compare per pixel                 | Dithered image             | Map generation cost; tiling artifacts     |
| FS error diffusion (CPU)     | Palette, scan order                     | Nearest-neighbor selection, error distribution      | Dithered image/video       | Sequential cost; worm artifacts           |
| Glitch + dither overlay      | Dithered image, glitch parameters       | Apply pixel sorting/databending; optional noise     | Artistic variant           | Overpowering texture; temporal instability|

Sources: [^4] [^10] [^1] [^3] [^6] [^13] [^7] [^18]


## Conclusion and Recommendations

Dithering remains a vital tool for perceptual quantization in constrained palettes and bit depths. Error diffusion, particularly Floyd–Steinberg and its derivatives, offers high static-image quality and flexible arbitrary-palette handling but is sequential and exhibits worm artifacts; serpentine scanning and variant kernels provide mitigations. Ordered dithering (Bayer) and blue-noise threshold maps deliver parallelism and temporal stability, with blue noise preferred for uniform high-frequency dot distributions and reduced perceptual artifacts.

For web deployment, favor GPU-friendly ordered and blue-noise methods in fragment shaders; leverage client-side tools to validate workflows and performance. In video, spatiotemporal blue-noise textures provide superior temporal stability and reduced flicker. Error diffusion is best reserved for high-quality stills or moderated real-time scenarios.

Aesthetic choices depend on content and intent. Bayer matrices deliver a distinctive retro crosshatch; blue-noise produces clean, organic textures; FS and JJN yield smooth gradients with directional organic artifacts. For arbitrary palettes, error diffusion with nearest-neighbor selection or Yliluoma’s positional dithering is recommended.

Research gaps to address in future work:

- Comprehensive, reproducible benchmarks across FS, JJN, Stucki, Burkes, Sierra, Atkinson, and blue-noise dithering on standardized datasets with perceptual metrics.
- Detailed color palette evaluations, including non-uniform arbitrary palettes and bit-depth configurations beyond common examples.
- Quantitative analysis of temporal stability and compression interactions for video dithering across display pipelines.
- GPU kernel optimization case studies per device class and browser, including pipeline details and memory access patterns.
- Licensing specifics for patented variants (e.g., Shiau-Fan) and any constraints on web deployment.
- Perceptual tuning guidelines for arbitrary palettes (e.g., Yliluoma) tailored to web constraints.

The broader implication is that dithering is not merely a technical fix for banding; it is a design choice that shapes texture, style, and temporal behavior. Selecting the right algorithm is as much an aesthetic decision as a technical one.


## References

[^1]: Floyd–Steinberg dithering. https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering
[^2]: CS 559: Computer Graphics Floyd-Steinberg Dithering. https://research.cs.wisc.edu/graphics/Courses/559-s2004/docs/floyd-steinberg.pdf
[^3]: Image Dithering: Eleven Algorithms and Source Code. https://tannerhelland.com/2012/12/28/dithering-eleven-algorithms-source-code.html
[^4]: Ordered dithering. https://en.wikipedia.org/wiki/Ordered_dithering
[^5]: Ditherpunk — The article I wish I had about monochrome image dithering. https://surma.dev/things/ditherpunk/
[^6]: The Art of Dithering and Retro Shading for the Web. https://blog.maximeheckel.com/posts/the-art-of-dithering-and-retro-shading-web/
[^7]: Apply dithering and retro filters to images and videos in the browser. https://github.com/gyng/ditherer
[^8]: WebGL Image Processing. https://webglfundamentals.org/webgl/lessons/webgl-image-processing.html
[^9]: libcaca study - 3. Error diffusion. http://caca.zoy.org/study/part3.html
[^10]: Methods for Generating Blue-Noise Dither Matrices for Digital Halftoning. https://www.imaging.org/common/uploaded%20files/pdfs/Papers/1999/RP-0-93/1786.pdf
[^11]: Rendering in Real Time with Spatiotemporal Blue Noise Textures (Part 1). https://developer.nvidia.com/blog/rendering-in-real-time-with-spatiotemporal-blue-noise-textures-part-1/
[^12]: “Optimizing” blue-noise dithering – backpropagation through Fourier transform and sorting. https://bartwronski.com/2020/04/26/optimizing-blue-noise-dithering-backpropagation-through-fourier-transform-and-sorting/
[^13]: Blue Noise Dithering - Andrew Bauer. https://abau.io/blog/blue_noise_dithering/
[^14]: Random Dithering. https://www.visgraf.impa.br/Courses/ip00/proj/Dithering1/random_dithering.html
[^15]: Automatic Stochastic Dithering Techniques on GPU: Image Quality. https://www.astesj.com/publications/ASTESJ_050679.pdf
[^16]: WebGL best practices - MDN. https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
[^17]: Dither it!: a web application for dithering images. https://ditherit.com/
[^18]: Glitch Art: Exploring the Aesthetics of Digital Error and Distortion. https://blog.depositphotos.com/glitch-art.html
[^19]: Digital Halftoning (Bouman). https://engineering.purdue.edu/~bouman/ece637/notes/pdf/Halftoning.pdf
[^20]: Bayer Dithering | Spencer Szabados. https://spencerszabados.github.io/blog/2022/bayer-dithering/
[^21]: Joel Yliluoma's arbitrary-palette positional dithering algorithm. https://bisqwit.iki.fi/story/howto/dither/jy/
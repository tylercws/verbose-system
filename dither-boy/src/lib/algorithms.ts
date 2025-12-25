// Dithering Algorithm Types and Data
export interface DitheringAlgorithm {
  id: string;
  name: string;
  category: string;
  description: string;
  parameters?: Record<string, { min: number; max: number; default: number; step?: number; label?: string }>;
  performance?: 'fast' | 'medium' | 'slow';
  quality?: 'low' | 'medium' | 'high';
  tags?: string[];
  preview?: string; // Base64 or URL for preview image
}

// Algorithm Categories
export const ALGORITHM_CATEGORIES = [
  'Error Diffusion',
  'Ordered Dithering',
  'Blue Noise',
  'Random',
  'Halftone',
  'Glitch',
  'Artistic'
] as const;

export type AlgorithmCategory = typeof ALGORITHM_CATEGORIES[number];

// Sample Algorithm Data
export const DITHERING_ALGORITHMS: DitheringAlgorithm[] = [
  // Error Diffusion Algorithms
  {
    id: 'floyd-steinberg',
    name: 'Floyd-Steinberg',
    category: 'Error Diffusion',
    description: 'Classic error diffusion algorithm that distributes quantization error to neighboring pixels.',
    parameters: {
      intensity: { min: 0, max: 100, default: 100, label: 'Intensity' }
    },
    performance: 'medium',
    quality: 'high',
    tags: ['classic', 'smooth', 'dithering']
  },
  {
    id: 'atkinson',
    name: 'Atkinson',
    category: 'Error Diffusion',
    description: 'Reduces error propagation for crisp midtones with less bleeding.',
    parameters: {
      intensity: { min: 0, max: 100, default: 100, label: 'Intensity' }
    },
    performance: 'fast',
    quality: 'medium',
    tags: ['crisp', 'midtones', 'contrast']
  },
  {
    id: 'stucki',
    name: 'Stucki',
    category: 'Error Diffusion',
    description: 'Modified Floyd-Steinberg with wider diffusion for smoother gradients.',
    parameters: {
      intensity: { min: 0, max: 100, default: 100, label: 'Intensity' }
    },
    performance: 'slow',
    quality: 'high',
    tags: ['smooth', 'gradients', 'quality']
  },
  {
    id: 'burkes',
    name: 'Burkes',
    category: 'Error Diffusion',
    description: 'Simplified Stucki algorithm with power-of-two math for better performance.',
    parameters: {
      intensity: { min: 0, max: 100, default: 100, label: 'Intensity' }
    },
    performance: 'fast',
    quality: 'medium',
    tags: ['optimized', 'fast', 'balanced']
  },
  {
    id: 'sierra',
    name: 'Sierra',
    category: 'Error Diffusion',
    description: 'Balanced error diffusion with good quality-to-speed ratio.',
    parameters: {
      intensity: { min: 0, max: 100, default: 100, label: 'Intensity' }
    },
    performance: 'medium',
    quality: 'medium',
    tags: ['balanced', 'versatile']
  },

  // Ordered Dithering
  {
    id: 'bayer-2x2',
    name: 'Bayer 2x2',
    category: 'Ordered Dithering',
    description: 'Smallest Bayer matrix with visible crosshatch pattern.',
    parameters: {
      intensity: { min: 0, max: 100, default: 100, label: 'Intensity' },
      threshold: { min: 0, max: 255, default: 128, label: 'Threshold' }
    },
    performance: 'fast',
    quality: 'medium',
    tags: ['patterned', 'retro', 'crosshatch']
  },
  {
    id: 'bayer-4x4',
    name: 'Bayer 4x4',
    category: 'Ordered Dithering',
    description: 'Medium-sized Bayer matrix with more uniform distribution.',
    parameters: {
      intensity: { min: 0, max: 100, default: 100, label: 'Intensity' },
      threshold: { min: 0, max: 255, default: 128, label: 'Threshold' }
    },
    performance: 'fast',
    quality: 'medium',
    tags: ['balanced', 'uniform']
  },
  {
    id: 'bayer-8x8',
    name: 'Bayer 8x8',
    category: 'Ordered Dithering',
    description: 'Large Bayer matrix with smoother gradients and reduced moiré.',
    parameters: {
      intensity: { min: 0, max: 100, default: 100, label: 'Intensity' },
      threshold: { min: 0, max: 255, default: 128, label: 'Threshold' }
    },
    performance: 'fast',
    quality: 'high',
    tags: ['smooth', 'minimal-patterns']
  },
  {
    id: 'bayer-16x16',
    name: 'Bayer 16x16',
    category: 'Ordered Dithering',
    description: 'Largest Bayer matrix with near-stochastic appearance.',
    parameters: {
      intensity: { min: 0, max: 100, default: 100, label: 'Intensity' },
      threshold: { min: 0, max: 255, default: 128, label: 'Threshold' }
    },
    performance: 'fast',
    quality: 'high',
    tags: ['stochastic', 'smooth', 'high-quality']
  },

  // Blue Noise
  {
    id: 'blue-noise',
    name: 'Blue Noise',
    category: 'Blue Noise',
    description: 'High-frequency noise distribution for uniform dot patterns.',
    parameters: {
      intensity: { min: 0, max: 100, default: 100, label: 'Intensity' },
      tileSize: { min: 32, max: 256, default: 128, step: 32, label: 'Tile Size' }
    },
    performance: 'fast',
    quality: 'high',
    tags: ['uniform', 'stable', 'perceptual']
  },

  // Random Dithering
  {
    id: 'random-white',
    name: 'Random White Noise',
    category: 'Random',
    description: 'Adds uniform white noise before quantization for unbiased distribution.',
    parameters: {
      intensity: { min: 0, max: 100, default: 100, label: 'Intensity' },
      seed: { min: 0, max: 9999, default: 1234, label: 'Seed' }
    },
    performance: 'fast',
    quality: 'low',
    tags: ['grainy', 'unstable', 'simple']
  },

  // Halftone
  {
    id: 'halftone',
    name: 'Halftone',
    category: 'Halftone',
    description: 'Digital halftone screening with dot size modulation.',
    parameters: {
      intensity: { min: 0, max: 100, default: 100, label: 'Intensity' },
      dotSize: { min: 1, max: 10, default: 3, label: 'Dot Size' }
    },
    performance: 'medium',
    quality: 'medium',
    tags: ['print-style', 'dots', 'pattern']
  },

  // Glitch Effects
  {
    id: 'pixel-sort',
    name: 'Pixel Sorting',
    category: 'Glitch',
    description: 'Sorts pixels by brightness to create streaks and fragmentation.',
    parameters: {
      intensity: { min: 0, max: 100, default: 50, label: 'Intensity' },
      threshold: { min: 0, max: 255, default: 128, label: 'Threshold' }
    },
    performance: 'slow',
    quality: 'medium',
    tags: ['artistic', 'streaks', 'glitch']
  },
  {
    id: 'databend',
    name: 'Databending',
    category: 'Glitch',
    description: 'Simulates data corruption for digital glitch aesthetic.',
    parameters: {
      intensity: { min: 0, max: 100, default: 30, label: 'Intensity' },
      corruption: { min: 1, max: 10, default: 3, label: 'Corruption Level' }
    },
    performance: 'slow',
    quality: 'low',
    tags: ['corruption', 'digital', 'distortion']
  },

  // Artistic Effects
  {
    id: 'stipple',
    name: 'Stippling',
    category: 'Artistic',
    description: 'Creates pointillist-style artwork with varying dot densities.',
    parameters: {
      intensity: { min: 0, max: 100, default: 100, label: 'Intensity' },
      density: { min: 10, max: 200, default: 50, label: 'Dot Density' }
    },
    performance: 'medium',
    quality: 'medium',
    tags: ['artistic', 'points', 'painterly']
  }
];

// Algorithm performance weights for sorting
export const PERFORMANCE_WEIGHT = {
  fast: 3,
  medium: 2,
  slow: 1
};

export const QUALITY_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1
};

// Helper functions
export const getAlgorithmsByCategory = (category: AlgorithmCategory): DitheringAlgorithm[] => {
  return DITHERING_ALGORITHMS.filter(algorithm => algorithm.category === category);
};

export const getAlgorithmById = (id: string): DitheringAlgorithm | undefined => {
  return DITHERING_ALGORITHMS.find(algorithm => algorithm.id === id);
};

export const searchAlgorithms = (query: string): DitheringAlgorithm[] => {
  const lowerQuery = query.toLowerCase();
  return DITHERING_ALGORITHMS.filter(algorithm => 
    algorithm.name.toLowerCase().includes(lowerQuery) ||
    algorithm.description.toLowerCase().includes(lowerQuery) ||
    algorithm.category.toLowerCase().includes(lowerQuery) ||
    algorithm.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
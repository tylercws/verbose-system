// Dithering Engine Implementation
export interface DitheringOptions {
  intensity?: number; // 0-100
  threshold?: number; // 0-255
  seed?: number;
  tileSize?: number;
  dotSize?: number;
  density?: number;
  corruption?: number;
}

export interface ProcessedImage {
  data: ImageData;
  width: number;
  height: number;
}

export class DitheringEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Process an image with the specified dithering algorithm
   */
  async processImage(
    imageData: ImageData,
    algorithmId: string,
    options: DitheringOptions = {}
  ): Promise<ProcessedImage> {
    const { intensity = 100, threshold = 128, ...otherOptions } = options;

    // Create a copy of the image data to modify
    const processedData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );

    // Apply dithering based on algorithm
    switch (algorithmId) {
      case 'floyd-steinberg':
        this.floydSteinbergDithering(processedData, intensity);
        break;
      case 'atkinson':
        this.atkinsonDithering(processedData, intensity);
        break;
      case 'stucki':
        this.stuckiDithering(processedData, intensity);
        break;
      case 'burkes':
        this.burkesDithering(processedData, intensity);
        break;
      case 'sierra':
        this.sierraDithering(processedData, intensity);
        break;
      case 'bayer-2x2':
        this.bayerDithering(processedData, intensity, threshold, 2);
        break;
      case 'bayer-4x4':
        this.bayerDithering(processedData, intensity, threshold, 4);
        break;
      case 'bayer-8x8':
        this.bayerDithering(processedData, intensity, threshold, 8);
        break;
      case 'bayer-16x16':
        this.bayerDithering(processedData, intensity, threshold, 16);
        break;
      case 'blue-noise':
        this.blueNoiseDithering(processedData, intensity, otherOptions.tileSize || 128);
        break;
      case 'random-white':
        this.randomDithering(processedData, intensity, otherOptions.seed || 1234);
        break;
      case 'halftone':
        this.halftoneDithering(processedData, intensity, otherOptions.dotSize || 3);
        break;
      case 'pixel-sort':
        this.pixelSortDithering(processedData, intensity, threshold);
        break;
      case 'databend':
        this.databendDithering(processedData, intensity, otherOptions.corruption || 3);
        break;
      case 'stipple':
        this.stippleDithering(processedData, intensity, otherOptions.density || 50);
        break;
      default:
        console.warn(`Unknown algorithm: ${algorithmId}`);
        break;
    }

    return {
      data: processedData,
      width: imageData.width,
      height: imageData.height
    };
  }

  /**
   * Convert image element to ImageData
   */
  imageToImageData(image: HTMLImageElement): ImageData {
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    this.ctx.drawImage(image, 0, 0);
    return this.ctx.getImageData(0, 0, image.width, image.height);
  }

  /**
   * Convert canvas to image data
   */
  canvasToImageData(canvas: HTMLCanvasElement): ImageData {
    const ctx = canvas.getContext('2d')!;
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  /**
   * Convert ImageData back to canvas
   */
  imageDataToCanvas(imageData: ProcessedImage, canvas?: HTMLCanvasElement): HTMLCanvasElement {
    const targetCanvas = canvas || document.createElement('canvas');
    targetCanvas.width = imageData.width;
    targetCanvas.height = imageData.height;
    const ctx = targetCanvas.getContext('2d')!;
    ctx.putImageData(imageData.data, 0, 0);
    return targetCanvas;
  }

  // Floyd-Steinberg Dithering
  private floydSteinbergDithering(imageData: ImageData, intensity: number) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const intensityFactor = intensity / 100;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        
        // Convert to grayscale
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        const oldGray = gray;
        const newGray = gray < 128 ? 0 : 255;
        const error = (oldGray - newGray) * intensityFactor;

        // Distribute error
        this.distributeError(data, width, height, x + 1, y, i + 4, error * 7 / 16);
        this.distributeError(data, width, height, x - 1, y + 1, i + 4 * width - 4, error * 3 / 16);
        this.distributeError(data, width, height, x, y + 1, i + 4 * width, error * 5 / 16);
        this.distributeError(data, width, height, x + 1, y + 1, i + 4 * width + 4, error * 1 / 16);

        // Set new pixel value
        data[i] = data[i + 1] = data[i + 2] = newGray;
      }
    }
  }

  // Atkinson Dithering
  private atkinsonDithering(imageData: ImageData, intensity: number) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const intensityFactor = intensity / 100;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        const oldGray = gray;
        const newGray = gray < 128 ? 0 : 255;
        const error = (oldGray - newGray) * intensityFactor;

        // Distribute error (only 75% of error is diffused)
        this.distributeError(data, width, height, x + 1, y, i + 4, error * 1 / 8);
        this.distributeError(data, width, height, x + 2, y, i + 8, error * 1 / 8);
        this.distributeError(data, width, height, x - 1, y + 1, i + 4 * width - 4, error * 1 / 8);
        this.distributeError(data, width, height, x + 1, y + 1, i + 4 * width + 4, error * 1 / 8);
        this.distributeError(data, width, height, x - 2, y + 1, i + 4 * width - 8, error * 1 / 8);
        this.distributeError(data, width, height, x, y + 2, i + 8 * width, error * 1 / 8);

        data[i] = data[i + 1] = data[i + 2] = newGray;
      }
    }
  }

  // Stucki Dithering
  private stuckiDithering(imageData: ImageData, intensity: number) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const intensityFactor = intensity / 100;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        const oldGray = gray;
        const newGray = gray < 128 ? 0 : 255;
        const error = (oldGray - newGray) * intensityFactor;

        // Stucki weights
        this.distributeError(data, width, height, x + 1, y, i + 4, error * 8 / 42);
        this.distributeError(data, width, height, x + 2, y, i + 8, error * 4 / 42);
        this.distributeError(data, width, height, x - 2, y + 1, i + 4 * width - 8, error * 2 / 42);
        this.distributeError(data, width, height, x - 1, y + 1, i + 4 * width - 4, error * 4 / 42);
        this.distributeError(data, width, height, x, y + 1, i + 4 * width, error * 8 / 42);
        this.distributeError(data, width, height, x + 1, y + 1, i + 4 * width + 4, error * 4 / 42);
        this.distributeError(data, width, height, x + 2, y + 1, i + 4 * width + 8, error * 2 / 42);
        this.distributeError(data, width, height, x - 2, y + 2, i + 8 * width - 8, error * 1 / 42);
        this.distributeError(data, width, height, x - 1, y + 2, i + 8 * width - 4, error * 2 / 42);
        this.distributeError(data, width, height, x, y + 2, i + 8 * width, error * 4 / 42);
        this.distributeError(data, width, height, x + 1, y + 2, i + 8 * width + 4, error * 2 / 42);
        this.distributeError(data, width, height, x + 2, y + 2, i + 8 * width + 8, error * 1 / 42);

        data[i] = data[i + 1] = data[i + 2] = newGray;
      }
    }
  }

  // Burkes Dithering (simplified Stucki)
  private burkesDithering(imageData: ImageData, intensity: number) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const intensityFactor = intensity / 100;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        const oldGray = gray;
        const newGray = gray < 128 ? 0 : 255;
        const error = (oldGray - newGray) * intensityFactor;

        // Burkes weights (simplified)
        this.distributeError(data, width, height, x + 1, y, i + 4, error * 8 / 32);
        this.distributeError(data, width, height, x + 2, y, i + 8, error * 4 / 32);
        this.distributeError(data, width, height, x - 2, y + 1, i + 4 * width - 8, error * 2 / 32);
        this.distributeError(data, width, height, x - 1, y + 1, i + 4 * width - 4, error * 4 / 32);
        this.distributeError(data, width, height, x, y + 1, i + 4 * width, error * 8 / 32);
        this.distributeError(data, width, height, x + 1, y + 1, i + 4 * width + 4, error * 4 / 32);
        this.distributeError(data, width, height, x + 2, y + 1, i + 4 * width + 8, error * 2 / 32);

        data[i] = data[i + 1] = data[i + 2] = newGray;
      }
    }
  }

  // Sierra Dithering
  private sierraDithering(imageData: ImageData, intensity: number) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const intensityFactor = intensity / 100;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        const oldGray = gray;
        const newGray = gray < 128 ? 0 : 255;
        const error = (oldGray - newGray) * intensityFactor;

        // Sierra weights
        this.distributeError(data, width, height, x + 1, y, i + 4, error * 5 / 32);
        this.distributeError(data, width, height, x + 2, y, i + 8, error * 3 / 32);
        this.distributeError(data, width, height, x - 2, y + 1, i + 4 * width - 8, error * 2 / 32);
        this.distributeError(data, width, height, x - 1, y + 1, i + 4 * width - 4, error * 4 / 32);
        this.distributeError(data, width, height, x, y + 1, i + 4 * width, error * 5 / 32);
        this.distributeError(data, width, height, x + 1, y + 1, i + 4 * width + 4, error * 4 / 32);
        this.distributeError(data, width, height, x + 2, y + 1, i + 4 * width + 8, error * 2 / 32);
        this.distributeError(data, width, height, x - 1, y + 2, i + 8 * width - 4, error * 2 / 32);
        this.distributeError(data, width, height, x, y + 2, i + 8 * width, error * 3 / 32);
        this.distributeError(data, width, height, x + 1, y + 2, i + 8 * width + 4, error * 2 / 32);

        data[i] = data[i + 1] = data[i + 2] = newGray;
      }
    }
  }

  // Bayer Ordered Dithering
  private bayerDithering(imageData: ImageData, intensity: number, threshold: number, size: number) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const intensityFactor = intensity / 100;

    // Generate Bayer matrix
    const bayerMatrix = this.generateBayerMatrix(size);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        
        // Calculate threshold
        const thresholdValue = threshold + (bayerMatrix[y % size][x % size] - 0.5) * 255 * intensityFactor;
        
        const newGray = gray > thresholdValue ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = newGray;
      }
    }
  }

  // Blue Noise Dithering (simplified implementation)
  private blueNoiseDithering(imageData: ImageData, intensity: number, tileSize: number) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const intensityFactor = intensity / 100;

    // Generate simple blue noise-like pattern (for demo purposes)
    const blueNoise = this.generateBlueNoisePattern(tileSize);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        
        const threshold = 128 + (blueNoise[y % tileSize][x % tileSize] - 0.5) * 255 * intensityFactor;
        const newGray = gray > threshold ? 255 : 0;
        
        data[i] = data[i + 1] = data[i + 2] = newGray;
      }
    }
  }

  // Random White Noise Dithering
  private randomDithering(imageData: ImageData, intensity: number, seed: number) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const intensityFactor = intensity / 100;

    // Simple linear congruential generator for reproducible random values
    let random = seed;
    const randomValue = () => {
      random = (random * 1103515245 + 12345) % (2 ** 31);
      return random / (2 ** 31);
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        
        const threshold = 128 + (randomValue() - 0.5) * 255 * intensityFactor;
        const newGray = gray > threshold ? 255 : 0;
        
        data[i] = data[i + 1] = data[i + 2] = newGray;
      }
    }
  }

  // Halftone Dithering
  private halftoneDithering(imageData: ImageData, intensity: number, dotSize: number) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const intensityFactor = intensity / 100;

    for (let y = 0; y < height; y += dotSize) {
      for (let x = 0; x < width; x += dotSize) {
        // Calculate average gray value in the dot area
        let totalGray = 0;
        let count = 0;
        
        for (let dy = 0; dy < dotSize && y + dy < height; dy++) {
          for (let dx = 0; dx < dotSize && x + dx < width; dx++) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            totalGray += gray;
            count++;
          }
        }
        
        const avgGray = totalGray / count;
        const dotIntensity = Math.round((avgGray / 255) * dotSize * dotSize * intensityFactor);
        
        // Fill the dot based on intensity
        for (let dy = 0; dy < dotSize && y + dy < height; dy++) {
          for (let dx = 0; dx < dotSize && x + dx < width; dx++) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            const pixelIntensity = dotSize * dotSize - (dy * dotSize + dx);
            const shouldFill = pixelIntensity <= dotIntensity;
            
            data[i] = data[i + 1] = data[i + 2] = shouldFill ? 0 : 255;
          }
        }
      }
    }
  }

  // Pixel Sort Dithering (simplified)
  private pixelSortDithering(imageData: ImageData, intensity: number, threshold: number) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const intensityFactor = intensity / 100;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        
        // Simple sorting effect - move bright pixels
        if (gray > threshold) {
          const newX = Math.min(width - 1, x + Math.floor(Math.random() * 5 * intensityFactor));
          const newI = (y * width + newX) * 4;
          
          // Swap pixel values
          const temp = [data[i], data[i + 1], data[i + 2], data[i + 3]];
          [data[i], data[i + 1], data[i + 2], data[i + 3]] = [data[newI], data[newI + 1], data[newI + 2], data[newI + 3]];
          [data[newI], data[newI + 1], data[newI + 2], data[newI + 3]] = temp;
        }
      }
    }
  }

  // Databend Dithering
  private databendDithering(imageData: ImageData, intensity: number, corruptionLevel: number) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const intensityFactor = intensity / 100;

    // Simulate data corruption
    const corruptionCount = Math.floor((width * height * corruptionLevel * intensityFactor) / 1000);

    for (let i = 0; i < corruptionCount; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const pixelIndex = (y * width + x) * 4;
      
      // Random corruption patterns
      const corruptionType = Math.floor(Math.random() * 4);
      switch (corruptionType) {
        case 0: // Color channel corruption
          data[pixelIndex] = Math.floor(Math.random() * 255);
          break;
        case 1: // Pixel shifting
          const shift = Math.floor(Math.random() * 10) - 5;
          if (x + shift >= 0 && x + shift < width) {
            const shiftIndex = (y * width + (x + shift)) * 4;
            data[pixelIndex] = data[shiftIndex];
          }
          break;
        case 2: // Block corruption
          const blockSize = Math.floor(Math.random() * 5) + 1;
          for (let by = 0; by < blockSize && y + by < height; by++) {
            for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
              const blockIndex = ((y + by) * width + (x + bx)) * 4;
              data[blockIndex] = Math.floor(Math.random() * 255);
            }
          }
          break;
        case 3: // Data duplication
          const sourceX = Math.floor(Math.random() * width);
          const sourceY = Math.floor(Math.random() * height);
          const sourceIndex = (sourceY * width + sourceX) * 4;
          data[pixelIndex] = data[sourceIndex];
          break;
      }
    }
  }

  // Stipple Dithering (simplified)
  private stippleDithering(imageData: ImageData, intensity: number, density: number) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const intensityFactor = intensity / 100;

    // Clear to white first
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i + 1] = data[i + 2] = 255;
    }

    // Place dots based on image brightness
    for (let y = 0; y < height; y += density) {
      for (let x = 0; x < width; x += density) {
        const i = (y * width + x) * 4;
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        
        // Place black dots where image is dark
        if (gray < 128) {
          const dotSize = Math.floor((128 - gray) / 128 * density * intensityFactor);
          for (let dy = 0; dy < dotSize && y + dy < height; dy++) {
            for (let dx = 0; dx < dotSize && x + dx < width; dx++) {
              const dotIndex = ((y + dy) * width + (x + dx)) * 4;
              data[dotIndex] = data[dotIndex + 1] = data[dotIndex + 2] = 0;
            }
          }
        }
      }
    }
  }

  // Helper method to distribute error
  private distributeError(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    x: number,
    y: number,
    index: number,
    error: number
  ) {
    if (x >= 0 && x < width && y >= 0 && y < height && index >= 0 && index < data.length) {
      data[index] = Math.max(0, Math.min(255, data[index] + error));
    }
  }

  // Generate Bayer matrix
  private generateBayerMatrix(size: number): number[][] {
    if (size === 2) {
      return [
        [0, 2],
        [3, 1]
      ];
    } else if (size === 4) {
      return [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
      ];
    } else if (size === 8) {
      return [
        [0, 48, 12, 60, 3, 51, 15, 63],
        [32, 16, 44, 28, 35, 19, 47, 31],
        [8, 56, 4, 52, 11, 59, 7, 55],
        [40, 24, 36, 20, 43, 27, 39, 23],
        [2, 50, 14, 62, 1, 49, 13, 61],
        [34, 18, 46, 30, 33, 17, 45, 29],
        [10, 58, 6, 54, 9, 57, 5, 53],
        [42, 26, 38, 22, 41, 25, 37, 21]
      ];
    } else if (size === 16) {
      // Simplified 16x16 matrix (in practice, this would be a full matrix)
      const matrix: number[][] = [];
      for (let i = 0; i < 16; i++) {
        matrix[i] = [];
        for (let j = 0; j < 16; j++) {
          matrix[i][j] = (i * 16 + j) % 256;
        }
      }
      return matrix;
    }
    
    // Default fallback
    return [[0, 1], [2, 3]];
  }

  // Generate blue noise pattern (simplified)
  private generateBlueNoisePattern(size: number): number[][] {
    const pattern: number[][] = [];
    
    for (let y = 0; y < size; y++) {
      pattern[y] = [];
      for (let x = 0; x < size; x++) {
        // Simple pseudo-blue-noise pattern
        const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1) + Math.random() * 0.3;
        pattern[y][x] = (noise + 1) / 2; // Normalize to 0-1
      }
    }
    
    return pattern;
  }
}
export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface DrawRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculate a centered draw rectangle that fits an image inside the given canvas dimensions
 * while preserving aspect ratio.
 */
export const computeDrawRect = (
  image: { width: number; height: number },
  canvas: CanvasDimensions
): DrawRect => {
  const scaleX = canvas.width / image.width;
  const scaleY = canvas.height / image.height;
  const scale = Math.min(scaleX, scaleY);

  const width = image.width * scale;
  const height = image.height * scale;

  return {
    width,
    height,
    x: (canvas.width - width) / 2,
    y: (canvas.height - height) / 2
  };
};

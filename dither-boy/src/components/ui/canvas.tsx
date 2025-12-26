import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from './glass-panel';
import { cn } from '@/lib/utils';

export interface CanvasProps {
  imageSrc?: string;
  processedImageSrc?: string;
  width?: number;
  height?: number;
  className?: string;
  showControls?: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  onImageLoad?: (image: HTMLImageElement) => void;
  onImageProcess?: (canvas: HTMLCanvasElement, originalImage: HTMLImageElement) => void;
  children?: React.ReactNode;
}

const Canvas: React.FC<CanvasProps> = ({
  imageSrc,
  processedImageSrc,
  width = 800,
  height = 600,
  className,
  showControls = true,
  onCanvasReady,
  onImageLoad,
  onImageProcess,
  children
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastDrawRect, setLastDrawRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const processedImageRef = useRef<HTMLImageElement | null>(null);

  const computeDrawRect = (img: HTMLImageElement, canvas: HTMLCanvasElement) => {
    const scaleX = canvas.width / img.width;
    const scaleY = canvas.height / img.height;
    const scale = Math.min(scaleX, scaleY);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;
    return { x, y, width: scaledWidth, height: scaledHeight };
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !originalImageRef.current || !lastDrawRect) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    ctx.drawImage(
      originalImageRef.current,
      lastDrawRect.x,
      lastDrawRect.y,
      lastDrawRect.width,
      lastDrawRect.height
    );

    if (processedImageRef.current) {
      ctx.drawImage(
        processedImageRef.current,
        lastDrawRect.x,
        lastDrawRect.y,
        lastDrawRect.width,
        lastDrawRect.height
      );
    }

    ctx.restore();

    if (originalImageRef.current) {
      onImageProcess?.(canvas, originalImageRef.current);
    }
  }, [lastDrawRect, pan, zoom, onImageProcess]);

  // Draw image on canvas
  const drawImage = useCallback(async (imageSrc: string, canvas: HTMLCanvasElement) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate scaling to fit canvas while maintaining aspect ratio
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scale = Math.min(scaleX, scaleY);
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;
        const rect = { x, y, width: scaledWidth, height: scaledHeight };
        setLastDrawRect(rect);
        originalImageRef.current = img;
        processedImageRef.current = processedImageSrc ? processedImageRef.current : null;
        renderCanvas();

        onImageLoad?.(img);
        resolve();
      };
      
      img.onerror = reject;
      img.src = imageSrc;
    });
  }, [onImageLoad, processedImageSrc, renderCanvas]);

  // Handle image loading
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;

    canvas.width = width;
    canvas.height = height;
    processedImageRef.current = null;

    drawImage(imageSrc, canvas).then(() => {
      onCanvasReady?.(canvas);
    }).catch(console.error);
  }, [imageSrc, width, height, drawImage, onCanvasReady]);

  // Handle processed image overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !processedImageSrc) {
      processedImageRef.current = null;
      renderCanvas();
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      processedImageRef.current = img;
      renderCanvas();
    };
    
    img.src = processedImageSrc;
  }, [processedImageSrc, renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [zoom, pan, renderCanvas]);

  // Pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDragging) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom handling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };

  // Reset view
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const canvasClasses = cn(
    'w-full h-full',
    'cursor-grab',
    isDragging && 'cursor-grabbing',
    className
  );

  return (
    <GlassPanel 
      ref={containerRef}
      variant="default" 
      padding="none" 
      className="relative overflow-hidden"
    >
      {/* Canvas Container */}
      <div 
        className={canvasClasses}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ 
            imageRendering: 'pixelated',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        />
        
        {/* Overlay content */}
        <div className="absolute inset-0 pointer-events-none">
          {children}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4"
        >
          <GlassPanel variant="overlay" blur="sm" padding="sm">
            <div className="flex items-center justify-between">
              {/* Zoom Control */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-secondary">Zoom:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom(prev => Math.max(0.1, prev * 0.9))}
                    className="p-1 rounded bg-surface-glassLight hover:bg-surface-glass transition-colors"
                  >
                    <svg className="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <span className="text-sm font-mono text-text-primary min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  
                  <button
                    onClick={() => setZoom(prev => Math.min(5, prev * 1.1))}
                    className="p-1 rounded bg-surface-glassLight hover:bg-surface-glass transition-colors"
                  >
                    <svg className="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={resetView}
                  className="px-3 py-1 text-xs rounded bg-surface-glassLight hover:bg-surface-glass text-text-primary transition-colors"
                >
                  Reset
                </button>
                
                <button
                  onClick={() => {
                    const canvas = canvasRef.current;
                    if (canvas) {
                      const link = document.createElement('a');
                      link.download = 'dithered-image.png';
                      link.href = canvas.toDataURL();
                      link.click();
                    }
                  }}
                  className="px-3 py-1 text-xs rounded bg-primary-500 hover:bg-primary-400 text-bg-depth transition-colors"
                >
                  Export
                </button>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <GlassPanel variant="overlay" padding="md">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <span className="text-text-primary">Processing...</span>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!imageSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-glassLight flex items-center justify-center">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No Image Loaded
            </h3>
            <p className="text-text-secondary">
              Upload an image to start dithering
            </p>
          </div>
        </div>
      )}
    </GlassPanel>
  );
};

export { Canvas };

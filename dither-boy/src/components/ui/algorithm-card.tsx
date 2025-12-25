import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface DitheringAlgorithm {
  id: string;
  name: string;
  category: string;
  description: string;
  parameters?: Record<string, { min: number; max: number; default: number; step?: number }>;
  preview?: string; // Base64 or URL for preview image
  performance?: 'fast' | 'medium' | 'slow';
  quality?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface AlgorithmCardProps {
  algorithm: DitheringAlgorithm;
  selected?: boolean;
  onSelect?: (algorithm: DitheringAlgorithm) => void;
  onPreview?: (algorithm: DitheringAlgorithm) => void;
  className?: string;
}

const AlgorithmCard = React.forwardRef<HTMLDivElement, AlgorithmCardProps>(
  ({ algorithm, selected = false, onSelect, onPreview, className }, ref) => {
    const handleClick = () => {
      onSelect?.(algorithm);
    };

    const handlePreview = (e: React.MouseEvent) => {
      e.stopPropagation();
      onPreview?.(algorithm);
    };

    const cardClasses = cn(
      'relative',
      'aspect-video',
      'rounded-lg',
      'overflow-hidden',
      'cursor-pointer',
      'transition-all',
      'duration-300',
      'ease-out',
      'border',
      selected 
        ? 'border-primary-500 bg-surface-glassSelected shadow-neon' 
        : 'border-border-glass bg-surface-glassLight hover:bg-surface-glass hover:border-primary-300',
      'hover:-translate-y-1',
      'hover:shadow-lg',
      className
    );

    const performanceColors = {
      fast: 'text-green-400',
      medium: 'text-yellow-400',
      slow: 'text-red-400'
    };

    const qualityColors = {
      low: 'text-red-400',
      medium: 'text-yellow-400',
      high: 'text-green-400'
    };

    return (
      <motion.div
        ref={ref}
        className={cardClasses}
        onClick={handleClick}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ 
          scale: 1.02,
          transition: { type: 'spring', stiffness: 400, damping: 30 }
        }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        {/* Preview Image or Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-bg-primary to-bg-secondary">
          {algorithm.preview ? (
            <img 
              src={algorithm.preview} 
              alt={algorithm.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-text-muted">
              <div className="w-8 h-8 mb-2 opacity-50">
                {/* Algorithm icon placeholder */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
                </svg>
              </div>
              <span className="text-xs font-mono">{algorithm.category}</span>
            </div>
          )}
        </div>

        {/* Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Performance and Quality Indicators */}
        <div className="absolute top-2 right-2 flex gap-1">
          {algorithm.performance && (
            <span className={cn(
              'px-1.5 py-0.5 text-xs rounded-full bg-black/50 backdrop-blur-sm',
              performanceColors[algorithm.performance]
            )}>
              {algorithm.performance}
            </span>
          )}
          {algorithm.quality && (
            <span className={cn(
              'px-1.5 py-0.5 text-xs rounded-full bg-black/50 backdrop-blur-sm',
              qualityColors[algorithm.quality]
            )}>
              {algorithm.quality}
            </span>
          )}
        </div>

        {/* Bottom Info Panel */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {algorithm.name}
              </h3>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                {algorithm.description}
              </p>
            </div>
            
            {/* Preview Button */}
            {onPreview && (
              <motion.button
                className="ml-2 p-1 rounded-full bg-primary-500/20 hover:bg-primary-500/40 transition-colors"
                onClick={handlePreview}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </motion.button>
            )}
          </div>
        </div>

        {/* Selection Indicator */}
        {selected && (
          <motion.div
            className="absolute top-2 left-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <svg className="w-4 h-4 text-bg-depth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}

        {/* Tags */}
        {algorithm.tags && algorithm.tags.length > 0 && (
          <div className="absolute top-8 left-2 flex flex-wrap gap-1">
            {algorithm.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 text-xs bg-black/30 text-text-secondary rounded-full backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
            {algorithm.tags.length > 2 && (
              <span className="px-1.5 py-0.5 text-xs bg-black/30 text-text-muted rounded-full backdrop-blur-sm">
                +{algorithm.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </motion.div>
    );
  }
);

AlgorithmCard.displayName = 'AlgorithmCard';

export { AlgorithmCard };
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from './glass-panel';
import { cn } from '@/lib/utils';

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  description?: string;
  disabled?: boolean;
  showValue?: boolean;
  className?: string;
  formatValue?: (value: number) => string;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  description,
  disabled = false,
  showValue = true,
  className,
  formatValue = (val) => val.toString()
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const sliderRef = useRef<HTMLDivElement>(null);

  // Calculate percentage for positioning
  const percentage = ((value - min) / (max - min)) * 100;

  // Handle slider click/drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateValue(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !isDragging) return;
    updateValue(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateValue = (e: React.MouseEvent | MouseEvent) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newValue = min + percentage * (max - min);
    
    // Snap to step
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    
    onValueChange(clampedValue);
  };

  // Handle keyboard input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    let newValue = value;
    const stepSize = step;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = Math.max(min, value - stepSize);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(max, value + stepSize);
        break;
      case 'Home':
        newValue = min;
        break;
      case 'End':
        newValue = max;
        break;
      default:
        return;
    }

    e.preventDefault();
    onValueChange(newValue);
  };

  // Handle mouse move for tooltip
  const handleMouseMoveForTooltip = (e: React.MouseEvent) => {
    if (disabled) return;
    setShowTooltip(true);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label and Value */}
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-text-primary">
              {label}
            </label>
          )}
          {showValue && (
            <motion.span 
              className="text-sm font-mono text-primary-400"
              key={value}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.1 }}
            >
              {formatValue(value)}
            </motion.span>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-text-muted">
          {description}
        </p>
      )}

      {/* Slider Container */}
      <div className="relative">
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && !disabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute z-10 px-2 py-1 text-xs bg-bg-primary border border-border-glass rounded shadow-lg pointer-events-none"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y - 40,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="font-mono text-text-primary">
                {formatValue(value)}
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border-glass"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slider Track */}
        <div
          ref={sliderRef}
          className={cn(
            'relative h-2 bg-surface-glassLight rounded-full cursor-pointer select-none',
            'transition-all duration-200 ease-out',
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-glass'
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMoveForTooltip}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label={label}
          aria-disabled={disabled}
        >
          {/* Progress Fill */}
          <motion.div
            className="absolute h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
            style={{ width: `${percentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />

          {/* Thumb */}
          <motion.div
            className={cn(
              'absolute w-4 h-4 bg-primary-500 rounded-full shadow-lg border-2 border-border-highlight',
              'cursor-grab active:cursor-grabbing',
              'transition-all duration-200',
              disabled ? 'opacity-50' : 'hover:shadow-neon hover:scale-110',
              isDragging && 'scale-110 shadow-neon'
            )}
            style={{ 
              left: `calc(${percentage}% - 8px)`,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            whileHover={{ scale: disabled ? 1 : 1.1 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            animate={{
              boxShadow: isDragging 
                ? '0 0 20px rgba(0, 240, 255, 0.6), 0 0 40px rgba(0, 240, 255, 0.4)'
                : '0 4px 16px rgba(0,0,0,0.2)'
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />

          {/* Tick Marks (optional) */}
          {step > 0 && (max - min) / step <= 10 && (
            <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
              {Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => {
                const tickValue = min + i * step;
                const tickPercentage = ((tickValue - min) / (max - min)) * 100;
                return (
                  <motion.div
                    key={i}
                    className="w-0.5 h-2 bg-border-glass rounded-full"
                    style={{ marginLeft: `${tickPercentage}%` }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Min/Max Labels */}
        <div className="flex justify-between mt-1">
          <span className="text-xs text-text-muted font-mono">
            {formatValue(min)}
          </span>
          <span className="text-xs text-text-muted font-mono">
            {formatValue(max)}
          </span>
        </div>
      </div>
    </div>
  );
};

export { Slider };
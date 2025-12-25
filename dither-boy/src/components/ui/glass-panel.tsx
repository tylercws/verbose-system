import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'selected' | 'overlay';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  children: React.ReactNode;
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ 
    className, 
    variant = 'default', 
    blur = 'md',
    padding = 'md',
    animated = true,
    children, 
    ...props 
  }, ref) => {
    const variants = {
      default: 'glass-panel',
      hover: 'glass-panel-hover',
      selected: 'glass-selected',
      overlay: 'glass-overlay'
    };

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8'
    };

    const blurClasses = {
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
      xl: 'backdrop-blur-xl'
    };

    const baseClasses = [
      'relative',
      'rounded-lg',
      'border',
      'transition-all',
      'duration-300',
      'ease-out',
      variants[variant],
      paddingClasses[padding],
      blurClasses[blur],
      className
    ].filter(Boolean).join(' ');

    const Component = animated ? motion.div : 'div';

    const animationProps = animated ? {
      initial: { opacity: 0, y: -10, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { 
        duration: 0.3, 
        ease: [0.04, 0.62, 0.23, 0.98],
        type: 'spring',
        stiffness: 400,
        damping: 30
      }
    } : {};

    return (
      <Component
        ref={ref}
        className={baseClasses}
        {...animationProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';

export { GlassPanel };
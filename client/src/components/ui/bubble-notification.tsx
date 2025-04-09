import React, { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export type BubbleVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type BubblePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
export type BubbleSize = 'sm' | 'md' | 'lg';

export interface BubbleNotificationProps {
  id: string;
  message: string;
  title?: string;
  variant?: BubbleVariant;
  position?: BubblePosition;
  icon?: ReactNode;
  duration?: number;
  size?: BubbleSize;
  showClose?: boolean;
  onClose: () => void;
}

const variantStyles: Record<BubbleVariant, string> = {
  default: 'bg-background border-border',
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const sizeStyles: Record<BubbleSize, string> = {
  sm: 'p-3 max-w-[280px] text-sm',
  md: 'p-4 max-w-[320px]',
  lg: 'p-5 max-w-[380px]',
};

const iconContainerStyles: Record<BubbleVariant, string> = {
  default: 'text-primary',
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

export const BubbleNotification: React.FC<BubbleNotificationProps> = ({
  message,
  title,
  variant = 'default',
  position = 'top-right',
  icon,
  duration = 5000,
  size = 'md',
  showClose = true,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  // Auto-close notification after duration
  useEffect(() => {
    if (duration === Infinity) return;
    
    const timeout = setTimeout(() => {
      setIsExiting(true);
      const animationDuration = 500; // match this with the animation duration
      setTimeout(onClose, animationDuration);
    }, duration);
    
    return () => clearTimeout(timeout);
  }, [duration, onClose]);

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExiting(true);
    const animationDuration = 300; // match this with the animation duration
    setTimeout(onClose, animationDuration);
  };

  return (
    <div
      className={cn(
        'relative rounded-lg border shadow-lg backdrop-blur-sm',
        'transition-all overflow-hidden',
        variantStyles[variant],
        sizeStyles[size],
        position.includes('left') ? 'ml-2' : position.includes('right') ? 'mr-2' : '',
        'min-w-[240px]'
      )}
      style={{
        opacity: isExiting ? 0 : 1,
        transform: `translateY(${isExiting ? (position.includes('top') ? '-10px' : '10px') : '0'})`,
        transition: 'opacity 300ms, transform 300ms'
      }}
    >
      {/* Progress bar */}
      {duration !== Infinity && (
        <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full">
          <div 
            className={cn("h-full bg-primary/50", {
              'bg-green-400/60': variant === 'success',
              'bg-red-400/60': variant === 'error',
              'bg-amber-400/60': variant === 'warning',
              'bg-blue-400/60': variant === 'info',
            })}
            style={{
              width: '100%',
              animation: `shrink-width ${duration}ms linear forwards`
            }}
          />
        </div>
      )}

      <div className="flex gap-3">
        {/* Icon */}
        {icon && (
          <div className={cn("flex-shrink-0 mt-1", iconContainerStyles[variant])}>
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-grow">
          {title && (
            <div className="font-medium mb-1">{title}</div>
          )}
          <div className={cn(
            "text-sm leading-relaxed",
            !title && "pt-0.5"
          )}>
            {message}
          </div>
        </div>

        {/* Close button */}
        {showClose && (
          <button
            onClick={handleCloseClick}
            className={cn(
              "flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity -mr-1 -mt-1 p-1",
              {
                "text-green-700": variant === 'success',
                "text-red-700": variant === 'error',
                "text-amber-700": variant === 'warning',
                "text-blue-700": variant === 'info',
              }
            )}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shrink-width {
            from { width: 100%; }
            to { width: 0%; }
          }
        `
      }} />
    </div>
  );
};
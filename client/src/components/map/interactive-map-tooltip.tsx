import { useState, useEffect, useRef } from 'react';
import { Property } from '@shared/schema';
import { formatPrice } from '@/lib/utils';
import NeighborhoodScoreCard from '@/components/neighborhoods/neighborhood-score-card';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveMapTooltipProps {
  property: Property;
  isHovered: boolean;
  position: { x: number; y: number } | null;
}

export default function InteractiveMapTooltip({ 
  property, 
  isHovered,
  position 
}: InteractiveMapTooltipProps) {
  const [showNeighborhoodCard, setShowNeighborhoodCard] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle hover behavior with delay to prevent flickering
  useEffect(() => {
    if (isHovered) {
      setTooltipVisible(true);
      
      // Clear any existing timeout for hiding the tooltip
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      // Small delay before hiding to allow for mouse movement between elements
      timeoutRef.current = setTimeout(() => {
        setTooltipVisible(false);
        setShowNeighborhoodCard(false);
      }, 300);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered]);
  
  if (!position || !tooltipVisible) return null;
  
  const tooltipStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };
  
  return (
    <div 
      className="absolute z-30 pointer-events-none"
      style={tooltipStyle}
    >
      <AnimatePresence>
        {tooltipVisible && (
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-full mt-[-8px]"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-lg overflow-hidden border border-primary-100 p-3 min-w-[220px] max-w-[300px] pointer-events-auto">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-2">
                  <h3 className="font-medium text-primary-900 truncate">{property.title}</h3>
                  <p className="text-sm text-primary-700 mt-1">{property.address}</p>
                </div>
                <div className="bg-primary-50 px-2 py-1 rounded text-sm font-semibold text-primary-900">
                  {formatPrice(property.price)}
                </div>
              </div>
              
              <div className="mt-2 text-xs text-primary-600 flex items-center gap-3">
                <span>{property.bedrooms} bed</span>
                <span className="w-1 h-1 rounded-full bg-primary-300"></span>
                <span>{property.bathrooms} bath</span>
                <span className="w-1 h-1 rounded-full bg-primary-300"></span>
                <span>{property.squareFeet.toLocaleString()} sqft</span>
              </div>
              
              {property.neighborhoodId && (
                <div className="mt-3 border-t border-primary-100 pt-2">
                  {showNeighborhoodCard ? (
                    <NeighborhoodScoreCard 
                      neighborhoodId={property.neighborhoodId} 
                      compact 
                      onClose={() => setShowNeighborhoodCard(false)}
                    />
                  ) : (
                    <button
                      onClick={() => setShowNeighborhoodCard(true)}
                      className="text-xs text-secondary-600 hover:text-secondary-800 font-medium"
                    >
                      View neighborhood score →
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Triangle pointer */}
            <div className="w-4 h-4 bg-white/90 backdrop-blur-md transform rotate-45 border-r border-b border-primary-100 mx-auto -mt-2 z-10"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
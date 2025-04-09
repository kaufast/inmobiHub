import { Property } from '@shared/schema';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Bed, Bath, Square } from 'lucide-react';
import { Link } from 'wouter';

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
  if (!position) return null;
  
  // Offset to position the tooltip properly
  const offsetX = 15;
  const offsetY = -120;
  
  return (
    <AnimatePresence>
      {isHovered && (
        <motion.div 
          className="absolute z-50 pointer-events-none"
          style={{ 
            left: position.x + offsetX, 
            top: position.y + offsetY,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow-lg border border-primary-200 overflow-hidden w-64">
            {property.images && property.images.length > 0 && (
              <div className="h-32 bg-primary-100 relative overflow-hidden">
                <img 
                  src={property.images[0]} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-primary-900/80 text-white text-xs font-medium px-2 py-1 rounded">
                  {formatPrice(property.price)}
                </div>
                {property.isPremium && (
                  <div className="absolute top-2 left-2 bg-secondary-500 text-white text-xs font-medium px-2 py-1 rounded">
                    Premium
                  </div>
                )}
              </div>
            )}
            
            <div className="p-3">
              <h3 className="font-medium text-primary-900 line-clamp-1">{property.title}</h3>
              <p className="text-xs text-primary-600 mb-2 line-clamp-1">{property.address}</p>
              
              <div className="flex justify-between text-xs text-primary-700">
                <div className="flex items-center">
                  <Bed className="h-3 w-3 mr-1" />
                  <span>{property.bedrooms} Beds</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-3 w-3 mr-1" />
                  <span>{property.bathrooms} Baths</span>
                </div>
                <div className="flex items-center">
                  <Square className="h-3 w-3 mr-1" />
                  <span>{property.squareFeet.toLocaleString()} sq ft</span>
                </div>
              </div>
              
              <Link href={`/properties/${property.id}`}>
                <a className="block mt-2 text-primary-600 text-xs text-center">
                  View Details
                </a>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
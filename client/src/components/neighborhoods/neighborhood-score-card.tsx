import { useQuery } from "@tanstack/react-query";
import { Neighborhood } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin } from "lucide-react";
import { Link } from "wouter";

interface NeighborhoodScoreCardProps {
  neighborhoodId: number;
  compact?: boolean;
  className?: string;
  onClose?: () => void;
}

export default function NeighborhoodScoreCard({ 
  neighborhoodId, 
  compact = false,
  className = "",
  onClose
}: NeighborhoodScoreCardProps) {
  const { data: neighborhood, isLoading } = useQuery<Neighborhood>({
    queryKey: [`/api/neighborhoods/${neighborhoodId}`],
    enabled: !!neighborhoodId,
  });
  
  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-primary-100 shadow-md ${className}`}>
        <div className="flex justify-center items-center h-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }
  
  if (!neighborhood) {
    return null;
  }
  
  // For compact mode (map tooltip)
  if (compact) {
    return (
      <div 
        className={`p-3 rounded-lg bg-white/90 backdrop-blur-md border border-primary-100 shadow-lg max-w-[220px] transition-all duration-200 ${className}`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-primary-900 truncate">{neighborhood.name}</h3>
            <div className="flex items-center text-xs text-primary-500 mt-0.5">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{neighborhood.city}</span>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-primary-400 hover:text-primary-600 -mt-1 -mr-1 p-1"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-lg font-bold text-primary-800">{neighborhood.overallScore}</span>
            <span className="text-xs text-primary-600 ml-1">/100</span>
          </div>
          <Badge variant="outline" className="text-xs bg-primary-50">
            Rank #{neighborhood.rank || "N/A"}
          </Badge>
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-primary-600">Safety</span>
              <span className="font-medium text-primary-800">{neighborhood.safetyScore || 'N/A'}</span>
            </div>
            <Progress value={neighborhood.safetyScore || 0} className="h-1.5 bg-primary-100" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-primary-600">Schools</span>
              <span className="font-medium text-primary-800">{neighborhood.schoolScore || 'N/A'}</span>
            </div>
            <Progress value={neighborhood.schoolScore || 0} className="h-1.5 bg-primary-100" />
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-primary-100">
          <Link href={`/neighborhoods/${neighborhood.id}`}>
            <a className="text-xs text-secondary-600 hover:text-secondary-700 font-medium">
              View full neighborhood profile →
            </a>
          </Link>
        </div>
      </div>
    );
  }
  
  // Standard mode for property details page
  return (
    <div className={`p-5 rounded-xl bg-white/80 backdrop-blur-sm border border-primary-100 shadow-md ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-primary-900">{neighborhood.name}</h3>
          <p className="text-sm text-primary-600">{neighborhood.city}, {neighborhood.state}</p>
        </div>
        <div className="flex flex-col items-center bg-primary-50 rounded-lg px-2 py-1">
          <div className="text-2xl font-bold text-primary-800">{neighborhood.overallScore}</div>
          <div className="text-xs text-primary-600 -mt-1">Overall Score</div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-primary-700">Safety</span>
            <span className="text-sm font-medium text-primary-800">{neighborhood.safetyScore || 'N/A'}</span>
          </div>
          <Progress value={neighborhood.safetyScore || 0} className="h-2 bg-primary-100" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-primary-700">Schools</span>
            <span className="text-sm font-medium text-primary-800">{neighborhood.schoolScore || 'N/A'}</span>
          </div>
          <Progress value={neighborhood.schoolScore || 0} className="h-2 bg-primary-100" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-primary-700">Walkability</span>
            <span className="text-sm font-medium text-primary-800">{neighborhood.walkabilityScore || 'N/A'}</span>
          </div>
          <Progress value={neighborhood.walkabilityScore || 0} className="h-2 bg-primary-100" />
        </div>
      </div>
      
      {neighborhood.description && (
        <div className="mt-4 text-sm text-primary-700 line-clamp-2">
          {neighborhood.description}
        </div>
      )}
      
      <div className="mt-4 flex justify-between items-center">
        <Badge variant="outline" className="bg-primary-50">
          Rank #{neighborhood.rank || "N/A"}
        </Badge>
        
        <Link href={`/neighborhoods/${neighborhood.id}`}>
          <a className="text-sm text-secondary-600 hover:text-secondary-700 font-medium">
            See full insights →
          </a>
        </Link>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Neighborhood } from '@shared/schema';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X, TrendingUp, Building, Car, School, HeartPulse, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface NeighborhoodScoreCardProps {
  neighborhoodId: number;
  compact?: boolean;
  className?: string;
  onClose?: () => void;
}

export default function NeighborhoodScoreCard({ 
  neighborhoodId,
  compact = false,
  className = '',
  onClose
}: NeighborhoodScoreCardProps) {
  const [showFullInsights, setShowFullInsights] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch neighborhood data
  const { isLoading, error, data: neighborhood } = useQuery<Neighborhood>({
    queryKey: [`/api/neighborhoods/${neighborhoodId}`],
  });

  const handlePremiumClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access premium insights",
        variant: "destructive",
      });
      return;
    }
    
    if (user.subscriptionTier === 'free') {
      toast({
        title: "Premium Feature",
        description: "Please upgrade your subscription to access detailed neighborhood insights",
        variant: "default",
      });
      return;
    }
    
    setShowFullInsights(true);
  };

  if (isLoading) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-sm ${className} min-h-[200px] flex items-center justify-center`}>
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !neighborhood) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-sm ${className}`}>
        <Alert variant="destructive">
          <AlertDescription>
            Could not load neighborhood data
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Convert scores to 0-10 scale (original is 0-100)
  const normalizeScore = (score: number | null) => score ? score / 10 : 0;
  
  // Format scores for display
  const formatScore = (score: number | null) => {
    return normalizeScore(score).toFixed(1).replace(/\.0$/, '');
  };
  
  // Overall score on 0-10 scale
  const overallScoreOut10 = formatScore(neighborhood.overallScore);
  
  // Get color based on score 
  const getScoreColor = (score: number | null) => {
    const normalizedScore = normalizeScore(score);
    if (normalizedScore >= 8) return 'text-green-600';
    if (normalizedScore >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Get bg color for the progress bar
  const getProgressBgColor = (score: number | null) => {
    const normalizedScore = normalizeScore(score);
    if (normalizedScore >= 8) return 'bg-green-600';
    if (normalizedScore >= 6) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  // Extract and prepare scores for display
  const affordabilityScore = neighborhood.affordabilityScore ?? 0;
  const schoolScore = neighborhood.schoolScore ?? 0;
  const safetyScore = neighborhood.safetyScore ?? 0;
  const transportScore = neighborhood.transitScore ?? 0; // Updated to use transitScore
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-primary-100 ${className} ${compact ? 'p-3' : 'p-5'}`}>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-primary-400 hover:text-primary-600"
        >
          <X size={18} />
        </button>
      )}
      
      <div className="flex items-center mb-3">
        <h3 className={`font-semibold text-primary-900 ${compact ? 'text-base' : 'text-lg'}`}>
          {neighborhood.name}
        </h3>
        <Badge variant="outline" className="ml-2 bg-primary-50">
          {neighborhood.city}
        </Badge>
      </div>
      
      {/* Overall Score */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-primary-600">Overall Score</span>
          <span className={`font-bold text-lg ${getScoreColor(neighborhood.overallScore)}`}>
            {formatScore(neighborhood.overallScore)}/10
          </span>
        </div>
        <Progress 
          value={neighborhood.overallScore} 
          className="h-2 bg-primary-100"
        />
      </div>
      
      {/* Score Categories - Basic Version */}
      {!showFullInsights && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-primary-500" />
              <span className="text-sm text-primary-600">Housing</span>
            </div>
            <div className="text-right">
              <span className={`font-semibold ${getScoreColor(affordabilityScore)}`}>
                {formatScore(affordabilityScore)}/10
              </span>
            </div>
            
            <div className="flex items-center">
              <School className="h-4 w-4 mr-2 text-primary-500" />
              <span className="text-sm text-primary-600">Education</span>
            </div>
            <div className="text-right">
              <span className={`font-semibold ${getScoreColor(schoolScore)}`}>
                {formatScore(schoolScore)}/10
              </span>
            </div>
            
            <div className="flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2 text-primary-500" />
              <span className="text-sm text-primary-600">Safety</span>
            </div>
            <div className="text-right">
              <span className={`font-semibold ${getScoreColor(safetyScore)}`}>
                {formatScore(safetyScore)}/10
              </span>
            </div>
          </div>
          
          {neighborhood.growth !== null && (
            <div className="flex items-center justify-between border-t border-primary-100 pt-3 mt-3">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm text-primary-600">Annual Growth</span>
              </div>
              <span className="font-semibold text-green-600">
                {neighborhood.growth > 0 ? '+' : ''}{neighborhood.growth}%
              </span>
            </div>
          )}
          
          {/* Call to action for premium insights */}
          {!compact && user?.subscriptionTier !== 'premium' && user?.subscriptionTier !== 'enterprise' && (
            <div className="mt-4 border-t border-primary-100 pt-4">
              <Button 
                onClick={handlePremiumClick} 
                variant="secondary" 
                className="w-full"
              >
                View Detailed Insights
              </Button>
              <p className="text-xs text-primary-500 mt-2 text-center">
                Upgrade for full neighborhood analytics
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Full Premium Insights */}
      {showFullInsights && (
        <div className="space-y-4">
          {/* Scores grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {/* Housing Score */}
            <div>
              <div className="flex items-center mb-1">
                <Building className="h-4 w-4 mr-1 text-primary-500" />
                <span className="text-sm text-primary-600">Housing</span>
              </div>
              <Progress value={affordabilityScore} className="h-1.5 bg-primary-100" />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-primary-500">
                  {normalizeScore(affordabilityScore) < 5 ? 'Affordable' : 'High Value'}
                </span>
                <span className={`text-xs font-medium ${getScoreColor(affordabilityScore)}`}>
                  {formatScore(affordabilityScore)}/10
                </span>
              </div>
            </div>
            
            {/* Transport Score */}
            <div>
              <div className="flex items-center mb-1">
                <Car className="h-4 w-4 mr-1 text-primary-500" />
                <span className="text-sm text-primary-600">Transport</span>
              </div>
              <Progress value={transportScore} className="h-1.5 bg-primary-100" />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-primary-500">
                  {normalizeScore(transportScore) < 5 ? 'Limited' : 'Well Connected'}
                </span>
                <span className={`text-xs font-medium ${getScoreColor(transportScore)}`}>
                  {formatScore(transportScore)}/10
                </span>
              </div>
            </div>
            
            {/* Education Score */}
            <div>
              <div className="flex items-center mb-1">
                <School className="h-4 w-4 mr-1 text-primary-500" />
                <span className="text-sm text-primary-600">Education</span>
              </div>
              <Progress value={schoolScore} className="h-1.5 bg-primary-100" />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-primary-500">
                  {normalizeScore(schoolScore) < 5 ? 'Developing' : 'Excellent'}
                </span>
                <span className={`text-xs font-medium ${getScoreColor(schoolScore)}`}>
                  {formatScore(schoolScore)}/10
                </span>
              </div>
            </div>
            
            {/* Safety Score */}
            <div>
              <div className="flex items-center mb-1">
                <ShieldCheck className="h-4 w-4 mr-1 text-primary-500" />
                <span className="text-sm text-primary-600">Safety</span>
              </div>
              <Progress value={safetyScore} className="h-1.5 bg-primary-100" />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-primary-500">
                  {normalizeScore(safetyScore) < 5 ? 'Concern' : 'Very Safe'}
                </span>
                <span className={`text-xs font-medium ${getScoreColor(safetyScore)}`}>
                  {formatScore(safetyScore)}/10
                </span>
              </div>
            </div>
          </div>
          
          {/* Additional metrics */}
          <div className="border-t border-primary-100 pt-3 grid grid-cols-2 gap-3">
            {neighborhood.medianHomePrice && (
              <div>
                <h4 className="text-sm font-medium text-primary-800">Median Home Price</h4>
                <p className="text-lg font-semibold text-primary-900">
                  ${neighborhood.medianHomePrice.toLocaleString()}
                </p>
              </div>
            )}
            
            {neighborhood.population && (
              <div>
                <h4 className="text-sm font-medium text-primary-800">Population</h4>
                <p className="text-base font-semibold text-primary-900">
                  {neighborhood.population.toLocaleString()}
                </p>
              </div>
            )}
            
            {neighborhood.growth !== null && (
              <div>
                <h4 className="text-sm font-medium text-primary-800">Appreciation</h4>
                <p className="text-base font-semibold text-green-600">
                  {neighborhood.growth > 0 ? '+' : ''}{neighborhood.growth}% YoY
                </p>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium text-primary-800">City</h4>
              <p className="text-base font-semibold text-primary-900">
                {neighborhood.city}, {neighborhood.state}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
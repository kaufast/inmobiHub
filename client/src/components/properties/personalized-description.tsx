import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface PersonalizedDescriptionProps {
  propertyId: number;
  className?: string;
}

export default function PersonalizedDescription({ propertyId, className = "" }: PersonalizedDescriptionProps) {
  const { user } = useAuth();
  
  const { 
    data: response, 
    isLoading, 
    error,
    isError 
  } = useQuery<{ personalizedDescription: string }>({
    queryKey: [`/api/properties/${propertyId}/personalized-description`],
    queryFn: undefined, // Use default fetcher
    enabled: !!user,
    retry: (failureCount, error: any) => {
      // Don't retry on 403 errors (subscription required)
      if (error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    }
  });

  if (!user) {
    return (
      <Alert className={`bg-white/50 backdrop-blur-xl ${className}`}>
        <Sparkles className="h-4 w-4 text-blue-500" />
        <AlertTitle>AI Insights</AlertTitle>
        <AlertDescription>
          <p className="mb-2">Log in to see personalized insights about this property.</p>
          <Link href="/auth">
            <Button size="sm" variant="outline">Log in</Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Alert className={`bg-white/50 backdrop-blur-xl ${className}`}>
        <Sparkles className="h-4 w-4 text-blue-500" />
        <AlertTitle>AI Insights</AlertTitle>
        <AlertDescription>
          <Skeleton className="h-4 w-full my-1" />
          <Skeleton className="h-4 w-5/6 my-1" />
          <Skeleton className="h-4 w-4/6 my-1" />
        </AlertDescription>
      </Alert>
    );
  }

  // Handle subscription required error
  if (isError && (error as any)?.status === 403) {
    return (
      <Alert className={`bg-amber-50 border-amber-200 ${className}`}>
        <Sparkles className="h-4 w-4 text-amber-500" />
        <AlertTitle>Premium Feature</AlertTitle>
        <AlertDescription>
          <p className="mb-2">AI-powered insights are available with a premium subscription.</p>
          <Link href="/dashboard?tab=subscription">
            <Button size="sm" variant="outline" className="bg-amber-100 border-amber-300 hover:bg-amber-200">
              Upgrade
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  // Handle other errors
  if (isError || !response) {
    return (
      <Alert className={`bg-red-50 border-red-200 ${className}`}>
        <Sparkles className="h-4 w-4 text-red-500" />
        <AlertTitle>AI Insights Unavailable</AlertTitle>
        <AlertDescription>
          We couldn't generate personalized insights at this time. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`bg-blue-50/80 backdrop-blur-xl border-blue-200 ${className}`}>
      <Sparkles className="h-4 w-4 text-blue-500" />
      <AlertTitle>AI Insights</AlertTitle>
      <AlertDescription>
        {response.personalizedDescription}
      </AlertDescription>
    </Alert>
  );
}
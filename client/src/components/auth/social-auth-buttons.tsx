import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { signInWithGoogle, handleRedirectResult, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle } from 'lucide-react';

interface SocialAuthButtonsProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: Error) => void;
}

export function SocialAuthButtons({ onSuccess, onError }: SocialAuthButtonsProps) {
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Handle redirect result when component mounts
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        console.log("Checking redirect result in SocialAuthButtons...");
        setAuthError(null);
        const user = await handleRedirectResult();
        
        if (user) {
          console.log("Firebase redirect successful, user:", user.email);
          const userData = {
            email: user.email || '',
            username: user.email || '',
            fullName: user.displayName || '',
            password: `firebase_${user.uid}`, // Secure password that user doesn't need to know
            profileImage: user.photoURL || null
          };
          
          toast({
            title: "Successfully authenticated with Google",
            description: "Completing sign in process...",
          });
          
          onSuccess?.(userData);
        } else {
          console.log("No redirect result found");
        }
      } catch (error: any) {
        console.error('Redirect result error:', error);
        
        // Extract detailed error information
        const errorCode = error.code || 'unknown';
        const errorMessage = error.message || 'Authentication failed';
        console.error(`Firebase error details - Code: ${errorCode}, Message: ${errorMessage}`);
        
        // Set error message for display
        setAuthError(`Authentication failed: ${errorMessage}`);
        
        toast({
          title: "Authentication failed",
          description: `Firebase error: ${errorCode}. Please try again.`,
          variant: "destructive",
        });
        
        onError?.(error as Error);
      } finally {
        setIsGoogleLoading(false);
      }
    };

    checkRedirectResult();

    // Also listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Firebase auth state changed, user signed in:", user.email);
        const userData = {
          email: user.email || '',
          username: user.email || '',
          fullName: user.displayName || '',
          password: `firebase_${user.uid}`, // Secure password that user doesn't need to know
          profileImage: user.photoURL || null
        };
        
        toast({
          title: "Successfully authenticated with Google",
          description: "Completing sign in process...",
        });
        
        setAuthError(null);
        onSuccess?.(userData);
      } else {
        console.log("Firebase auth state changed, user signed out or not signed in");
      }
    }, (error) => {
      console.error("Firebase auth state error:", error);
      setAuthError(`Authentication monitoring error: ${error.message}`);
    });

    return () => unsubscribe();
  }, [onSuccess, onError, toast]);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setAuthError(null);
      
      console.log("Initiating Google sign-in process...");
      await signInWithGoogle();
      console.log("Sign-in function completed (should redirect)");
      
      // Note: For redirect flow, we don't expect to reach this point
      // as the page will reload. The actual success handling is done 
      // in the useEffect through either the redirect result or auth state change
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Extract detailed error information
      const errorCode = error.code || 'unknown';
      const errorMessage = error.message || 'Authentication failed';
      console.error(`Firebase error details - Code: ${errorCode}, Message: ${errorMessage}`);
      
      // Set error message for display
      setAuthError(`Sign-in failed: ${errorMessage}`);
      
      toast({
        title: "Authentication failed",
        description: `Could not sign in with Google: ${errorCode}. Please try again.`,
        variant: "destructive",
      });
      
      onError?.(error as Error);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-3 w-full">
      {authError && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="w-full flex items-center justify-center"
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
        )}
        Continue with Google
      </Button>
    </div>
  );
}
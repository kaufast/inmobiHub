import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { signInWithGoogle, auth } from '@/lib/firebase';
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

  // Only listen for auth state changes, as we're using popup auth
  useEffect(() => {

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
      
      console.log("Initiating Google sign-in process with popup...");
      const user = await signInWithGoogle();
      
      if (user) {
        console.log("Popup sign-in successful:", user.email);
        // We don't need to handle success explicitly here since the 
        // onAuthStateChanged listener will take care of it
      } else {
        console.log("Popup completed but no user returned");
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Extract detailed error information
      const errorCode = error.code || 'unknown';
      const errorMessage = error.message || 'Authentication failed';
      console.error(`Firebase error details - Code: ${errorCode}, Message: ${errorMessage}`);
      
      // Provide more user-friendly error messages for common issues
      let displayMessage = errorMessage;
      
      if (errorCode === 'auth/popup-blocked') {
        displayMessage = "The sign-in popup was blocked by your browser. Please allow popups for this site and try again.";
      } else if (errorCode === 'auth/popup-closed-by-user') {
        displayMessage = "You closed the sign-in window before completing authentication. Please try again.";
      } else if (errorCode === 'auth/unauthorized-domain') {
        displayMessage = `This website (${window.location.hostname}) is not authorized in Firebase. Please visit our main site at inmobi.mobi.`;
      }
      
      // Set error message for display
      setAuthError(`Sign-in failed: ${displayMessage}`);
      
      toast({
        title: "Authentication failed",
        description: displayMessage,
        variant: "destructive",
      });
      
      onError?.(error as Error);
      setIsGoogleLoading(false);
    } finally {
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
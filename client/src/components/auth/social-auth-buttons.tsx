import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { signInWithGoogle, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
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
  const { handleFirebaseAuth } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Only listen for auth state changes, as we're using popup auth
  useEffect(() => {
    // Remove the automatic trigger of onSuccess to prevent authentication banner issues
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Firebase auth state changed, user signed in:", user.email);
        // We'll handle the user data in the handleGoogleSignIn function instead
      } else {
        console.log("Firebase auth state changed, user signed out or not signed in");
      }
    }, (error) => {
      console.error("Firebase auth state error:", error);
      setAuthError(`Authentication monitoring error: ${error.message}`);
    });

    return () => unsubscribe();
  }, [toast, handleFirebaseAuth, onSuccess]);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setAuthError(null);
      
      console.log("Initiating Google sign-in process with popup...");
      const user = await signInWithGoogle();
      
      if (user) {
        console.log("Popup sign-in successful:", user.email);
        
        // Use the centralized Firebase authentication handler from useAuth
        const success = await handleFirebaseAuth(user);
        
        if (success) {
          console.log("Firebase authentication completed successfully");
          setAuthError(null);
          onSuccess?.(user);
        } else {
          console.error("Firebase authentication failed through the centralized handler");
          
          // Provide user-friendly error for unauthorized domains
          if (window.location.hostname !== 'inmobi.mobi' && 
              window.location.hostname !== 'foundation-hub-kaufast.replit.app') {
            const domainErrorMessage = `This website (${window.location.hostname}) is not authorized in Firebase. Please visit our main site at inmobi.mobi or foundation-hub-kaufast.replit.app.`;
            
            // If we're on a development domain, provide more helpful information
            if (window.location.hostname.includes('replit') || window.location.hostname.includes('localhost')) {
              const devMessage = `This development domain (${window.location.hostname}) is not authorized for Firebase authentication. Use the demo credentials instead for testing, or visit our production site at inmobi.mobi.`;
              setAuthError(`Sign-in failed: ${devMessage}`);
            } else {
              setAuthError(`Sign-in failed: ${domainErrorMessage}`);
            }
          } else {
            setAuthError("Authentication failed. Please try again.");
          }
          
          onError?.(new Error("Firebase authentication failed"));
        }
      } else {
        console.log("Popup completed but no user returned");
        setAuthError("Authentication canceled. Please try again.");
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
        displayMessage = `This website (${window.location.hostname}) is not authorized in Firebase. Please visit our main site at inmobi.mobi or foundation-hub-kaufast.replit.app.`;
        
        // If we're on a development domain, provide more helpful information
        if (window.location.hostname.includes('replit') || window.location.hostname.includes('localhost')) {
          displayMessage = `This development domain (${window.location.hostname}) is not authorized for Firebase authentication. Use the demo credentials instead for testing, or visit our production site at inmobi.mobi.`;
        }
      }
      
      // Set error message for display
      setAuthError(`Sign-in failed: ${displayMessage}`);
      
      onError?.(error as Error);
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
          
          {authError.includes('not authorized in Firebase') && (
            <div className="mt-4 flex flex-col space-y-3">
              <span className="text-sm">Firebase authentication is only enabled on our official domains.</span>
              
              {/* Recommend test credentials in development mode */}
              {(window.location.hostname.includes('replit') || window.location.hostname.includes('localhost')) && (
                <div className="bg-blue-50 text-blue-800 p-3 rounded-md border border-blue-200 text-sm">
                  <strong>Development Mode:</strong> Use the demo credentials above for testing:
                  <div className="mt-1 font-mono bg-gray-100 p-1 rounded text-xs">
                    Username: testuser<br/>
                    Password: password123
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1"
                  onClick={() => window.open('https://inmobi.mobi', '_blank')}
                >
                  Visit inmobi.mobi
                </Button>
              </div>
            </div>
          )}
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
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { signInWithGoogle, handleRedirectResult, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

interface SocialAuthButtonsProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: Error) => void;
}

export function SocialAuthButtons({ onSuccess, onError }: SocialAuthButtonsProps) {
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Handle redirect result when component mounts
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const user = await handleRedirectResult();
        if (user) {
          const userData = {
            email: user.email || '',
            username: user.email || '',
            fullName: user.displayName || '',
            password: `firebase_${user.uid}`, // Secure password that user doesn't need to know
            profileImage: user.photoURL || null
          };
          
          onSuccess?.(userData);
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        toast({
          title: "Authentication failed",
          description: "Could not complete sign in. Please try again.",
          variant: "destructive",
        });
        onError?.(error as Error);
      }
    };

    checkRedirectResult();

    // Also listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          email: user.email || '',
          username: user.email || '',
          fullName: user.displayName || '',
          password: `firebase_${user.uid}`, // Secure password that user doesn't need to know
          profileImage: user.photoURL || null
        };
        
        onSuccess?.(userData);
      }
    });

    return () => unsubscribe();
  }, [onSuccess, onError, toast]);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      
      await signInWithGoogle();
      // Note: The actual success handling is done in the useEffect through
      // either the redirect result or the auth state change
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Authentication failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
      onError?.(error as Error);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-3 w-full">
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
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FaGoogle, FaApple } from "react-icons/fa";
import { signInWithGoogle, signInWithApple } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SocialAuthButtonsProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: Error) => void;
}

export function SocialAuthButtons({ onSuccess, onError }: SocialAuthButtonsProps) {
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const user = await signInWithGoogle();
      
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
      console.error('Google sign-in error:', error);
      toast({
        title: "Authentication failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
      onError?.(error as Error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsAppleLoading(true);
      const user = await signInWithApple();
      
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
      console.error('Apple sign-in error:', error);
      toast({
        title: "Authentication failed",
        description: "Could not sign in with Apple. Please try again.",
        variant: "destructive",
      });
      onError?.(error as Error);
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-3 w-full">
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isAppleLoading}
        className="w-full flex items-center justify-center"
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
        )}
        Continue with Google
      </Button>
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleAppleSignIn}
        disabled={isGoogleLoading || isAppleLoading}
        className="w-full flex items-center justify-center bg-black text-white hover:bg-gray-800"
      >
        {isAppleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FaApple className="mr-2 h-5 w-5" />
        )}
        Continue with Apple
      </Button>
    </div>
  );
}
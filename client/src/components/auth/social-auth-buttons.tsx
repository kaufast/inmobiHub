import { Button } from "@/components/ui/button";
import { signInWithGoogle, signInWithApple } from "@/lib/firebase";
import { FaGoogle, FaApple } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function SocialAuthButtons() {
  const [isLoading, setIsLoading] = useState({
    google: false,
    apple: false
  });
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(prev => ({ ...prev, google: true }));
      await signInWithGoogle();
      // The redirect will happen automatically, but we'll never reach here
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Sign-in failed",
        description: error instanceof Error ? error.message : "Failed to sign in with Google",
        variant: "destructive",
      });
      setIsLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(prev => ({ ...prev, apple: true }));
      const result = await signInWithApple();
      
      // If we're here, we used popup flow (not redirect)
      if (result && result.user) {
        const user = result.user;
        const userData = {
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          uid: user.uid,
          photoURL: user.photoURL,
        };
        
        console.log("User signed in:", userData);
        
        toast({
          title: "Sign-in successful",
          description: `Welcome${userData.displayName ? `, ${userData.displayName}` : ""}!`,
        });
        
        // Handle redirect or state update here
      }
    } catch (error) {
      console.error("Apple sign-in error:", error);
      toast({
        title: "Sign-in failed",
        description: error instanceof Error ? error.message : "Failed to sign in with Apple",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, apple: false }));
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center"
        onClick={handleGoogleSignIn}
        disabled={isLoading.google || isLoading.apple}
      >
        {isLoading.google ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
        )}
        Sign in with Google
      </Button>
      
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center"
        onClick={handleAppleSignIn}
        disabled={isLoading.google || isLoading.apple}
      >
        {isLoading.apple ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FaApple className="mr-2 h-4 w-4" />
        )}
        Sign in with Apple
      </Button>
    </div>
  );
}
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

// Types
type AuthContextType = {
  currentUser: User | null;
  isLoading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
};

// Create context with default values
const FirebaseAuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  error: null,
  signOut: async () => {},
});

// Provider component
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Monitor authentication state with error handling
  useEffect(() => {
    try {
      console.log("Setting up Firebase auth state listener");
      
      // Use a timeout to prevent getting stuck in loading state
      const loadingTimeout = setTimeout(() => {
        if (isLoading) {
          console.warn("Firebase auth initialization timed out");
          setIsLoading(false);
        }
      }, 3000);
      
      // Set up the auth state listener
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          setCurrentUser(user);
          setIsLoading(false);
          clearTimeout(loadingTimeout);
          if (user) {
            console.log('Firebase user authenticated:', user.displayName || user.email || 'Anonymous user');
          }
        },
        (error) => {
          console.error('Firebase auth state error:', error);
          setError(error);
          setIsLoading(false);
          clearTimeout(loadingTimeout);
          toast({
            title: 'Authentication Error',
            description: error.message,
            variant: 'destructive',
          });
        }
      );
      
      // Return cleanup functions for both the auth listener and the timeout
      return () => {
        unsubscribe();
        clearTimeout(loadingTimeout);
      };
    } catch (error) {
      // Handle any initialization errors
      console.error("Firebase auth initialization error:", error);
      setError(error instanceof Error ? error : new Error("Failed to initialize Firebase auth"));
      setIsLoading(false);
      return () => {}; // Empty cleanup function
    }
  }, [toast]);

  // Sign out function
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out',
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Sign out failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const value = {
    currentUser,
    isLoading,
    error,
    signOut,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}
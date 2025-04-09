import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";
import { User, LoginUser, RegisterUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import { auth, firebaseSignOut } from "@/lib/firebase";

// Create the auth context
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginUser) => Promise<boolean>;
  register: (userData: RegisterUser) => Promise<boolean>;
  logout: () => Promise<boolean>;
  isAuthenticating: boolean;
};

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Create the auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Fetch the current user
  const fetchCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/user');
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else if (res.status !== 401) { // 401 is expected when not logged in
        setError('Failed to fetch user data');
      }
    } catch (err) {
      setError('Network error while fetching user data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Login function
  const login = async (credentials: LoginUser): Promise<boolean> => {
    try {
      setIsAuthenticating(true);
      setError(null);
      
      const res = await apiRequest('POST', '/api/login', credentials);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Login failed');
      }
      
      const userData = await res.json();
      setUser(userData);
      queryClient.setQueryData(["/api/user"], userData);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.fullName}!`,
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Register function
  const register = async (userData: RegisterUser): Promise<boolean> => {
    try {
      setIsAuthenticating(true);
      setError(null);
      
      const res = await apiRequest('POST', '/api/register', userData);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Registration failed');
      }
      
      const newUser = await res.json();
      setUser(newUser);
      queryClient.setQueryData(["/api/user"], newUser);
      
      toast({
        title: "Registration successful",
        description: `Welcome to Foundation, ${newUser.fullName}!`,
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Logout function
  const logout = async (): Promise<boolean> => {
    try {
      setIsAuthenticating(true);
      setError(null);
      
      // First, log out from Firebase if the user was authenticated with it
      if (auth.currentUser) {
        await firebaseSignOut();
      }
      
      // Then log out from our server
      const res = await apiRequest('POST', '/api/logout');
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Logout failed');
      }
      
      setUser(null);
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      
      toast({
        title: "Logout failed",
        description: message,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Create the context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticating,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export { AuthContext };

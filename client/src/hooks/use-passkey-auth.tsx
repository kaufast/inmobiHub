import { useState } from 'react';
import { 
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function usePasskeyAuth() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();

  /**
   * Register a new passkey for the current user
   * @returns Promise that resolves to the registration success status
   */
  const registerPasskey = async (): Promise<boolean> => {
    try {
      setIsRegistering(true);
      
      // Get registration options from the server
      const optionsRes = await apiRequest('GET', '/api/users/passkey/register-options');
      const options = await optionsRes.json();
      
      // Prompt user to create a passkey
      const credential = await startRegistration(options);
      
      // Send the credential to the server for verification
      const verificationRes = await apiRequest('POST', '/api/users/passkey/register-verify', credential);
      const verification = await verificationRes.json();
      
      if (verification.passkeyEnabled) {
        toast({
          title: 'Passkey registration successful',
          description: 'You can now use this passkey to sign in to your account.',
          variant: 'default',
        });
        return true;
      } else {
        toast({
          title: 'Passkey registration failed',
          description: 'Please try again or contact support.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error: any) {
      console.error('Passkey registration error:', error);
      toast({
        title: 'Passkey registration failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsRegistering(false);
    }
  };

  /**
   * Disable passkey for the current user
   * @returns Promise that resolves to the disabling success status
   */
  const disablePasskey = async (): Promise<boolean> => {
    try {
      setIsRegistering(true);
      
      // Send request to disable passkey
      const response = await apiRequest('DELETE', '/api/users/passkey');
      const result = await response.json();
      
      if (!result.passkeyEnabled) {
        toast({
          title: 'Passkey disabled',
          description: 'Your passkey has been successfully disabled.',
          variant: 'default',
        });
        return true;
      } else {
        toast({
          title: 'Failed to disable passkey',
          description: 'Please try again or contact support.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error: any) {
      console.error('Disable passkey error:', error);
      toast({
        title: 'Failed to disable passkey',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsRegistering(false);
    }
  };

  /**
   * Authenticate with a passkey
   * @param username User's username
   * @returns Promise that resolves to the authentication result containing the user data
   */
  const authenticateWithPasskey = async (username: string): Promise<{ success: boolean, user?: any }> => {
    try {
      setIsAuthenticating(true);
      
      // Get authentication options from the server
      const optionsRes = await apiRequest('POST', '/api/auth/passkey/login-options', { username });
      const options = await optionsRes.json();
      
      // Prompt user to use their passkey
      const credential = await startAuthentication(options);
      
      // Send the credential to the server for verification
      const verificationRes = await apiRequest('POST', '/api/auth/passkey/login-verify', {
        ...credential,
        username,
      });
      
      if (!verificationRes.ok) {
        const errorData = await verificationRes.json();
        throw new Error(errorData.message || 'Authentication failed');
      }
      
      const verification = await verificationRes.json();
      
      if (verification.user) {
        toast({
          title: 'Authentication successful',
          description: 'Welcome back to Inmobi!',
          variant: 'default',
        });
        return { success: true, user: verification.user };
      } else {
        toast({
          title: 'Authentication failed',
          description: 'Please try again or use a different sign-in method.',
          variant: 'destructive',
        });
        return { success: false };
      }
    } catch (error: any) {
      console.error('Passkey authentication error:', error);
      toast({
        title: 'Authentication failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Check if passkeys are supported by the user's browser
   * @returns Boolean indicating if passkeys are supported
   */
  const isPasskeySupported = (): boolean => {
    return typeof window !== 'undefined' && 
      window.PublicKeyCredential !== undefined && 
      typeof window.PublicKeyCredential === 'function';
  };

  return {
    registerPasskey,
    disablePasskey,
    authenticateWithPasskey,
    isPasskeySupported,
    isRegistering,
    isAuthenticating,
  };
}
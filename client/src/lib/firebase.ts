import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithRedirect, 
  GoogleAuthProvider,
  getRedirectResult,
  signOut
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Store recaptcha verifier instance globally
let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Initialize reCAPTCHA verifier
 * @param containerId HTML element ID where reCAPTCHA widget will be rendered
 */
export function initRecaptchaVerifier(containerId: string) {
  try {
    // Avoid re-initializing
    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'normal',
        callback: () => {
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          recaptchaVerifier = null; // Reset on expiry
        }
      });
    }
    
    return recaptchaVerifier;
  } catch (error) {
    console.error('Error initializing reCAPTCHA:', error);
    return null;
  }
}

/**
 * Send SMS verification code
 * @param phoneNumber User's phone number
 */
export async function sendSmsVerification(phoneNumber: string) {
  try {
    // Get recaptcha token from client
    const recaptchaToken = await recaptchaVerifier?.verify();
    
    if (!recaptchaToken) {
      throw new Error('reCAPTCHA verification failed');
    }
    
    // Send request to server endpoint
    const response = await fetch('/api/auth/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        recaptchaToken
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send verification code');
    }
    
    return data;
  } catch (error) {
    console.error('Error sending SMS verification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send verification code'
    };
  }
}

/**
 * Verify SMS code
 * @param verificationId ID received from sendSmsVerification
 * @param code Verification code entered by user
 */
export async function verifySmsCode(verificationId: string, code: string) {
  try {
    const response = await fetch('/api/auth/sms/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verificationId,
        code
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify code');
    }
    
    return data;
  } catch (error) {
    console.error('Error verifying SMS code:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to verify code'
    };
  }
}

/**
 * Check if the device supports Apple Keychain or other credential manager
 */
export function supportsAppleKeychain(): boolean {
  return window && 
    'PasswordCredential' in window && 
    'navigator' in window && 
    'credentials' in navigator;
}

/**
 * Store credentials in the device's secure keychain (Apple Keychain on iOS/macOS)
 * @param username User's username
 * @param password User's password
 */
export async function storeCredentialsInKeychain(
  username: string, 
  password: string
): Promise<boolean> {
  if (!supportsAppleKeychain()) {
    return false;
  }
  
  try {
    // Define an interface for the credential for TypeScript
    interface IPasswordCredential extends Credential {
      id: string;
      password?: string;
      name?: string;
      iconURL?: string;
    }

    // Create a new credential 
    // Note: Using any here because the PasswordCredential is not fully typed in some TS environments
    const credential = new (window as any).PasswordCredential({
      id: username,
      password: password,
      name: username, // Optional display name
      iconURL: window.location.origin + '/logo.png' // Optional icon
    }) as IPasswordCredential;
    
    // Store the credential in the browser's password manager
    await navigator.credentials.store(credential);
    
    return true;
  } catch (error) {
    console.error('Error storing credentials:', error);
    return false;
  }
}

/**
 * Retrieve credentials from the device's secure keychain
 */
export async function retrieveCredentialsFromKeychain() {
  if (!supportsAppleKeychain()) {
    return null;
  }
  
  try {
    // Define credential type
    interface IPasswordCredential extends Credential {
      id: string;
      password?: string;
      type: string;
    }

    // Request a credential from the browser's password manager
    // Note: Using any type here since the CredentialRequestOptions interface 
    // doesn't have the password property in all TS environments
    const options = {
      password: true,
      mediation: 'optional' // Show UI only if user has multiple credentials
    } as any;
    
    const credential = await navigator.credentials.get(options) as IPasswordCredential;
    
    if (credential && credential.type === 'password') {
      return {
        username: credential.id,
        password: credential.password || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    return null;
  }
}

/**
 * Handle the redirect result from Firebase Authentication
 */
export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // User is signed in
      const user = result.user;
      // You can get the Google Access Token with:
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential?.accessToken;
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
}

/**
 * Sign out from Firebase Authentication
 */
export async function firebaseSignOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

export { auth };
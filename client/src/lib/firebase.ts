import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithRedirect, 
  GoogleAuthProvider, 
  PhoneAuthProvider, 
  RecaptchaVerifier,
  OAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  ApplicationVerifier,
  getRedirectResult,
  UserCredential
} from "firebase/auth";

// Firebase configuration - Using the values you provided
const firebaseConfig = {
  apiKey: "AIzaSyA8MFoP8ZJNft4SXTZ4vR9nOEYz35hB5MY",
  authDomain: "smskeychain.firebaseapp.com",
  projectId: "smskeychain",
  storageBucket: "smskeychain.firebasestorage.app",
  messagingSenderId: "347323668810",
  appId: "1:347323668810:web:d28cff23d9b3e1f908c9b3",
  measurementId: "G-B7J5N9ZRT6"
};

// Check if Firebase is properly configured - we're now using hardcoded config
export const isFirebaseConfigured = (): boolean => {
  console.log("Firebase is configured with project:", firebaseConfig.projectId);
  return true; // Now we have valid Firebase config
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Provider instances
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
const phoneProvider = new PhoneAuthProvider(auth);

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

appleProvider.addScope('email');
appleProvider.addScope('name');

// Handle sign in with Google
export const signInWithGoogle = () => {
  signInWithRedirect(auth, googleProvider);
};

// Handle sign in with Apple
export const signInWithApple = async (): Promise<UserCredential> => {
  return signInWithPopup(auth, appleProvider);
};

// Initialize Phone Authentication
let recaptchaVerifier: RecaptchaVerifier | null = null;

// Function to initialize Recaptcha Verifier
export const initRecaptchaVerifier = (elementId: string) => {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      size: 'normal',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log('reCAPTCHA verified');
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        console.log('reCAPTCHA expired');
      }
    });
  }
  return recaptchaVerifier;
};

// Send SMS verification code
export const sendSmsVerificationCode = async (phoneNumber: string, verifier: ApplicationVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    return confirmationResult;
  } catch (error) {
    console.error("Error sending SMS code:", error);
    throw error;
  }
};

// Handle redirect results after OAuth sign-in
export const handleRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // User is signed in
      // You can access result.user for the user information
      console.log("User authenticated via redirect:", result.user.displayName);
      
      // If we have additional data to store in our database about the user
      // we would make an API call here to our backend
      
      return result;
    }
    return null;
  } catch (error) {
    console.error("Error handling redirect:", error);
    throw error;
  }
};

// Sign out
export const signOut = () => auth.signOut();

// Export auth instance for use in other components
export { auth };
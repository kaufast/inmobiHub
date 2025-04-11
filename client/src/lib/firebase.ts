import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your web app's Firebase configuration
// Using the hardcoded values here since the environment variables may not be properly accessible via import.meta.env
const firebaseConfig = {
  apiKey: "AIzaSyAHBABI9mL7s6Jr_n7FhlSCLMrMA8QBp8Q",
  authDomain: "inmobi-a6bd4.firebaseapp.com",
  projectId: "inmobi-a6bd4",
  storageBucket: "inmobi-a6bd4.firebasestorage.app",
  messagingSenderId: "937279827019",
  appId: "1:937279827019:web:92eb1d4219413097b9f1ce",
  measurementId: "G-D1KKXE9REV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
// Sign in with Google
export async function signInWithGoogle() {
  try {
    console.log("Starting Google sign-in process...");
    
    // Always use popup method for authentication (works better across environments)
    console.log("Using popup method for Google sign-in...");
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Popup sign-in successful:", result.user.email);
    return result.user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    // Log additional details about the error
    if (error.code) console.error('Error code:', error.code);
    if (error.message) console.error('Error message:', error.message);
    if (error.customData) console.error('Error custom data:', error.customData);
    
    // If popup fails due to being blocked or domain issues, log it clearly
    if (error.code === 'auth/popup-blocked') {
      console.error('Google sign-in popup was blocked by the browser. Please allow popups for this site.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      console.error('Google sign-in popup was closed before completing the sign-in process.');
    } else if (error.code === 'auth/unauthorized-domain') {
      console.error(`Google sign-in error: This domain (${window.location.hostname}) is not authorized in the Firebase console. Please add it to the Authorized Domains list in Firebase Authentication settings.`);
    }
    
    throw error;
  }
}



// We no longer need redirect-based authentication since we're using popup method
export async function handleRedirectResult() {
  console.log("Redirect method is no longer used. We've switched to popup authentication.");
  return null;
}

// Sign out
export async function firebaseSignOut() {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    if (error.code) console.error('Sign out error code:', error.code);
    if (error.message) console.error('Sign out error message:', error.message);
    throw error;
  }
}

export { auth };
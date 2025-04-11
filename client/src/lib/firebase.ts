import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithRedirect, getRedirectResult } from "firebase/auth";

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
    // Check if we're in Replit's preview environment which might block popups
    const isReplit = window.location.hostname.includes('replit');
    console.log("Environment detection:", isReplit ? "Replit environment detected" : "Non-Replit environment");
    
    if (isReplit) {
      console.log("Using redirect method for Google sign-in in Replit...");
      // Always use redirect in Replit environment
      await signInWithRedirect(auth, googleProvider);
      console.log("Redirect initiated, page should reload after auth...");
      return null; // The page will redirect, so no need to return anything
    } else {
      console.log("Using popup method for Google sign-in...");
      // Use popup for other environments
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Popup sign-in successful:", result.user.email);
      return result.user;
    }
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    // Log additional details about the error
    if (error.code) console.error('Error code:', error.code);
    if (error.message) console.error('Error message:', error.message);
    if (error.customData) console.error('Error custom data:', error.customData);
    throw error;
  }
}



// Check for redirect result (to be called on app initialization)
export async function handleRedirectResult() {
  try {
    console.log("Checking for redirect result...");
    const result = await getRedirectResult(auth);
    console.log("Redirect result:", result ? "Successfully got result" : "No result found");
    
    if (result) {
      // User successfully authenticated after redirect
      console.log("User successfully authenticated after redirect:", result.user.email);
      return result.user;
    }
    return null;
  } catch (error: any) {
    console.error('Error handling redirect result:', error);
    if (error.code) console.error('Redirect error code:', error.code);
    if (error.message) console.error('Redirect error message:', error.message);
    return null;
  }
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
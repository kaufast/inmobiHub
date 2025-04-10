import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut, signInWithRedirect, getRedirectResult } from "firebase/auth";

// Your web app's Firebase configuration
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

// Configure Apple Auth Provider
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Sign in with Google
export async function signInWithGoogle() {
  try {
    // Check if we're in Replit's preview environment which might block popups
    const isReplit = window.location.hostname.includes('replit');
    
    if (isReplit) {
      // Use redirect for Replit environment to avoid popup blockers
      await signInWithRedirect(auth, googleProvider);
      return null; // The page will redirect, so no need to return anything
    } else {
      // Use popup for other environments
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    }
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

// Sign in with Apple
export async function signInWithApple() {
  try {
    // Apple Sign In requires a properly configured domain with Apple Developer settings
    // It likely won't work in development environment without proper setup
    const isReplit = window.location.hostname.includes('replit');
    
    if (isReplit) {
      // Use redirect for Replit environment to avoid popup blockers
      await signInWithRedirect(auth, appleProvider);
      return null; // The page will redirect, so no need to return anything
    } else {
      // Use popup for other environments
      const result = await signInWithPopup(auth, appleProvider);
      return result.user;
    }
  } catch (error) {
    console.error('Error signing in with Apple:', error);
    throw error;
  }
}

// Check for redirect result (to be called on app initialization)
export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // User successfully authenticated after redirect
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Error handling redirect result:', error);
    return null;
  }
}

// Sign out
export async function firebaseSignOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export { auth };
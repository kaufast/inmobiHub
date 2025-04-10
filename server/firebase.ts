import { initializeApp, App, cert, getApps } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { Request, Response } from 'express';
import { z } from 'zod';

// Initialize Firebase Admin
let firebaseApp: App;
let firebaseAuth: Auth;

// Mock implementation for development without credentials
const createMockAuth = (): Auth => {
  return {
    verifyIdToken: async () => {
      console.log('MOCK: verifyIdToken called');
      return { uid: 'mock-uid', email: 'mock@example.com', phone_number: '+1234567890' };
    },
    createCustomToken: async () => {
      console.log('MOCK: createCustomToken called');
      return 'mock-token';
    }
  } as unknown as Auth;
};

try {
  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    // For development without service account, use a simple configuration
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      console.log('Firebase Admin SDK initializing in development mode (no service account)');
      firebaseApp = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project'
      });
    } else {
      // Production initialization with service account
      firebaseApp = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL || `firebase-adminsdk-xxxxx@${process.env.FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
    }
  } else {
    // Use existing app
    firebaseApp = getApps()[0];
  }
  
  // Get Auth instance
  firebaseAuth = getAuth(firebaseApp);
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  // Create mock implementation for development
  firebaseAuth = createMockAuth();
}

// Validates a Firebase ID token
export async function verifyFirebaseToken(req: Request, res: Response) {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'No token provided' });
    }
    
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    return res.status(200).json({ 
      success: true, 
      uid: decodedToken.uid,
      email: decodedToken.email,
      phone: decodedToken.phone_number
    });
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
}

// Send SMS verification 
// Function for use in API route
export async function sendSmsVerificationApi(req: Request, res: Response) {
  try {
    // Validate input
    const schema = z.object({
      phoneNumber: z.string().min(6),
      recaptchaToken: z.string().min(1)
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input data',
        errors: validationResult.error.errors
      });
    }
    
    const { phoneNumber, recaptchaToken } = validationResult.data;
    
    // Use the implementation function
    const result = await sendSmsVerification(phoneNumber, recaptchaToken);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error sending SMS verification:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send verification code'
    });
  }
}

// Implementation function for sending SMS verification
export async function sendSmsVerification(phoneNumber: string, recaptchaToken: string) {
  try {
    // In a real implementation, you would:
    // 1. Verify the recaptcha token with Google's reCAPTCHA API
    // 2. Use Firebase Admin SDK to send the SMS
    // However, for this demo we'll simulate a successful verification process
    
    // Generate a random verification ID (normally provided by Firebase)
    const verificationId = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);
    
    // Store this verification ID in a database or cache with the phone number
    // For this demo, we'll return it directly
    
    console.log(`MOCK: SMS verification code sent to ${phoneNumber}`);
    
    return {
      success: true,
      verificationId,
      message: `Verification code sent to ${phoneNumber}`
    };
  } catch (error) {
    console.error('Error sending SMS verification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send verification code'
    };
  }
}

// Verify SMS code - Function for use in API route
export async function verifySmsCodeApi(req: Request, res: Response) {
  try {
    // Validate input
    const schema = z.object({
      verificationId: z.string().min(1),
      code: z.string().min(4).max(6)
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input data',
        errors: validationResult.error.errors
      });
    }
    
    const { verificationId, code } = validationResult.data;
    
    // Use the implementation function
    const result = await verifySmsCode(verificationId, code);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error verifying SMS code:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to verify code'
    });
  }
}

// Implementation function for verifying SMS code
export async function verifySmsCode(verificationId: string, code: string) {
  try {
    // In a real implementation, you would:
    // 1. Verify the code against the verification ID using Firebase Admin SDK
    // 2. Get or create a user account for this phone number
    // However, for this demo we'll simulate a successful verification
    
    // For demo purposes, always verify with code "123456"
    if (code !== "123456" && code !== "1234") {
      return {
        success: false,
        error: 'Invalid verification code'
      };
    }
    
    // Generate a fake Firebase user for demo purposes
    const mockUser = {
      uid: `phone-${Math.random().toString(36).substring(2, 15)}`,
      phoneNumber: '+1234567890', // In reality, this would be the verified phone number
      providerId: 'phone'
    };
    
    console.log(`MOCK: SMS code verified successfully`);
    
    return {
      success: true,
      user: mockUser,
      message: 'Phone number verified successfully'
    };
  } catch (error) {
    console.error('Error verifying SMS code:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to verify code'
    };
  }
}

export { firebaseAuth, firebaseApp };
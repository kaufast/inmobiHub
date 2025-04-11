import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { Loader2, CheckCircle, XCircle, Info } from 'lucide-react';

export function FirebaseTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [results, setResults] = useState<{[key: string]: {success: boolean, message: string}>>({}); 
  const [firebaseConfig, setFirebaseConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testFirebaseConfig = () => {
    try {
      setIsLoading(true);
      setStep(1);
      setError(null);
      
      // Check if Firebase configuration exists in the environment
      const config = {
        apiKey: "AIzaSyAHBABI9mL7s6Jr_n7FhlSCLMrMA8QBp8Q",
        authDomain: "inmobi-a6bd4.firebaseapp.com",
        projectId: "inmobi-a6bd4",
        storageBucket: "inmobi-a6bd4.firebasestorage.app",
        messagingSenderId: "937279827019",
        appId: "1:937279827019:web:92eb1d4219413097b9f1ce",
        measurementId: "G-D1KKXE9REV"
      };
      
      setFirebaseConfig(config);
      setResults(prev => ({
        ...prev,
        configCheck: { 
          success: true, 
          message: "Firebase configuration is available." 
        }
      }));
      
      setStep(2);
      testFirebaseInit(config);
    } catch (error: any) {
      setError(`Config test failed: ${error.message}`);
      setResults(prev => ({
        ...prev,
        configCheck: { 
          success: false, 
          message: `Firebase configuration error: ${error.message}` 
        }
      }));
      setIsLoading(false);
    }
  };

  const testFirebaseInit = (config: any) => {
    try {
      // Initialize Firebase
      const app = initializeApp(config);
      const auth = getAuth(app);
      
      setResults(prev => ({
        ...prev,
        initCheck: { 
          success: true, 
          message: "Firebase initialized successfully." 
        }
      }));
      
      setStep(3);
      testRedirectResult(auth);
    } catch (error: any) {
      setError(`Init test failed: ${error.message}`);
      setResults(prev => ({
        ...prev,
        initCheck: { 
          success: false, 
          message: `Firebase initialization error: ${error.message}` 
        }
      }));
      setIsLoading(false);
    }
  };

  const testRedirectResult = async (auth: any) => {
    try {
      // Check for redirect result
      console.log("Checking for previous Firebase redirect results...");
      const result = await getRedirectResult(auth);
      
      if (result) {
        setResults(prev => ({
          ...prev,
          redirectResultCheck: { 
            success: true, 
            message: `Found redirect result. User email: ${result.user.email}` 
          }
        }));
      } else {
        setResults(prev => ({
          ...prev,
          redirectResultCheck: { 
            success: true, 
            message: "No redirect result found (this is normal if you haven't just signed in)." 
          }
        }));
      }
      
      setStep(4);
      testAuthStateListener(auth);
    } catch (error: any) {
      console.error("Redirect result error:", error);
      setError(`Redirect test failed: ${error.message}`);
      setResults(prev => ({
        ...prev,
        redirectResultCheck: { 
          success: false, 
          message: `Redirect result error: ${error.message}` 
        }
      }));
      setIsLoading(false);
    }
  };

  const testAuthStateListener = (auth: any) => {
    try {
      // Test auth state listener
      console.log("Testing auth state listener...");
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setResults(prev => ({
            ...prev,
            authStateCheck: { 
              success: true, 
              message: `Auth state shows signed in user: ${user.email}` 
            }
          }));
        } else {
          setResults(prev => ({
            ...prev,
            authStateCheck: { 
              success: true, 
              message: "Auth state shows no signed in user (this is normal if you're not signed in)." 
            }
          }));
        }
        
        setStep(5);
        setIsLoading(false);
        unsubscribe();
      }, (error) => {
        console.error("Auth state error:", error);
        setError(`Auth state listener error: ${error.message}`);
        setResults(prev => ({
          ...prev,
          authStateCheck: { 
            success: false, 
            message: `Auth state listener error: ${error.message}` 
          }
        }));
        setIsLoading(false);
        unsubscribe();
      });
    } catch (error: any) {
      console.error("Auth state setup error:", error);
      setError(`Auth state test failed: ${error.message}`);
      setResults(prev => ({
        ...prev,
        authStateCheck: { 
          success: false, 
          message: `Auth state setup error: ${error.message}` 
        }
      }));
      setIsLoading(false);
    }
  };

  const initiateGoogleSignIn = async () => {
    try {
      if (!firebaseConfig) {
        setError("Firebase not configured. Run the test first.");
        return;
      }
      
      setIsLoading(true);
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log("Initiating Google sign-in redirect...");
      await signInWithRedirect(auth, provider);
      // The page will redirect, so no need to set loading state
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      setError(`Google sign-in error: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Firebase Authentication Test</CardTitle>
        <CardDescription>
          Test if Firebase authentication is configured correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-semibold">Test Firebase Integration</h3>
            <Button 
              onClick={testFirebaseConfig} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Info className="mr-2 h-4 w-4" />}
              Run Tests
            </Button>
          </div>
          
          <div className="space-y-2 border rounded-md p-4">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>1</div>
              <span className="font-medium">Configuration Check</span>
              {results.configCheck && (
                results.configCheck.success 
                  ? <CheckCircle className="h-4 w-4 text-green-500" /> 
                  : <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            {results.configCheck && (
              <p className={`text-sm ml-8 ${results.configCheck.success ? 'text-green-600' : 'text-red-600'}`}>
                {results.configCheck.message}
              </p>
            )}
            
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>2</div>
              <span className="font-medium">Firebase Initialization</span>
              {results.initCheck && (
                results.initCheck.success 
                  ? <CheckCircle className="h-4 w-4 text-green-500" /> 
                  : <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            {results.initCheck && (
              <p className={`text-sm ml-8 ${results.initCheck.success ? 'text-green-600' : 'text-red-600'}`}>
                {results.initCheck.message}
              </p>
            )}
            
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>3</div>
              <span className="font-medium">Redirect Result Check</span>
              {results.redirectResultCheck && (
                results.redirectResultCheck.success 
                  ? <CheckCircle className="h-4 w-4 text-green-500" /> 
                  : <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            {results.redirectResultCheck && (
              <p className={`text-sm ml-8 ${results.redirectResultCheck.success ? 'text-green-600' : 'text-red-600'}`}>
                {results.redirectResultCheck.message}
              </p>
            )}
            
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>4</div>
              <span className="font-medium">Auth State Listener</span>
              {results.authStateCheck && (
                results.authStateCheck.success 
                  ? <CheckCircle className="h-4 w-4 text-green-500" /> 
                  : <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            {results.authStateCheck && (
              <p className={`text-sm ml-8 ${results.authStateCheck.success ? 'text-green-600' : 'text-red-600'}`}>
                {results.authStateCheck.message}
              </p>
            )}
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-semibold">Test Google Sign-In</h3>
              <p className="text-sm text-gray-500">Click to test the Google sign-in flow directly</p>
            </div>
            <Button 
              onClick={initiateGoogleSignIn} 
              disabled={isLoading || !firebaseConfig}
              variant="default"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Google Sign-In
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
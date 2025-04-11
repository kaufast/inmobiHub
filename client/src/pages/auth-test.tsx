import { FirebaseTest } from "@/components/auth/firebase-test";

export default function AuthTestPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Firebase Authentication Test</h1>
      <p className="text-lg mb-8 text-muted-foreground">
        This page is designed to help diagnose and troubleshoot Firebase authentication issues. 
        Use the test below to check if Firebase configuration and authentication flows are working correctly.
      </p>
      <FirebaseTest />
    </div>
  );
}
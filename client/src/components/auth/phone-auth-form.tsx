import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { initRecaptchaVerifier, sendSmsVerificationCode } from "@/lib/firebase";
import { ConfirmationResult } from "firebase/auth";
import { Loader2, Phone } from "lucide-react";

export function PhoneAuthForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const { toast } = useToast();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number to continue",
        variant: "destructive",
      });
      return;
    }
    
    // Format the phone number if needed
    const formattedPhoneNumber = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
    
    try {
      setIsLoading(true);
      
      // Initialize recaptcha if not already done
      if (!recaptchaContainerRef.current) {
        toast({
          title: "Error",
          description: "reCAPTCHA container not found",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const recaptchaVerifier = initRecaptchaVerifier("recaptcha-container");
      
      // Send verification code
      const result = await sendSmsVerificationCode(formattedPhoneNumber, recaptchaVerifier);
      
      setConfirmationResult(result);
      setVerificationSent(true);
      
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code",
      });
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast({
        title: "Failed to send verification code",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast({
        title: "Verification code required",
        description: "Please enter the verification code sent to your phone",
        variant: "destructive",
      });
      return;
    }
    
    if (!confirmationResult) {
      toast({
        title: "Error",
        description: "No verification request found. Please try again",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Confirm the verification code
      const userCredential = await confirmationResult.confirm(verificationCode);
      
      toast({
        title: "Authentication successful",
        description: "You've been successfully signed in",
      });
      
      // You can now use userCredential.user to get the user information
      console.log("User authenticated:", userCredential.user);
      
      // Redirect or update state as needed
    } catch (error) {
      console.error("Error verifying code:", error);
      toast({
        title: "Failed to verify code",
        description: error instanceof Error ? error.message : "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Sign in with Phone</h3>
      
      {!verificationSent ? (
        <form onSubmit={handleSendVerificationCode} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number (with country code)
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          {/* reCAPTCHA container */}
          <div id="recaptcha-container" ref={recaptchaContainerRef} className="my-4"></div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !phoneNumber} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Phone className="mr-2 h-4 w-4" />
                Send Verification Code
              </>
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="verificationCode" className="text-sm font-medium">
              Verification Code
            </label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !verificationCode} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </Button>
          
          <Button 
            type="button"
            variant="outline"
            onClick={() => setVerificationSent(false)}
            className="w-full mt-2"
          >
            Back
          </Button>
        </form>
      )}
    </div>
  );
}
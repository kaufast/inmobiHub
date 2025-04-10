import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, LockKeyhole, CheckCircle2 } from "lucide-react";
import { initRecaptchaVerifier, sendSmsVerification, verifySmsCode } from "@/lib/firebase";

enum PhoneAuthStep {
  PHONE_INPUT,
  CODE_VERIFICATION,
  VERIFIED
}

interface PhoneAuthProps {
  onVerified?: (phoneNumber: string, uid: string) => void;
  onCancel?: () => void;
}

export function PhoneAuth({ onVerified, onCancel }: PhoneAuthProps) {
  const [step, setStep] = useState<PhoneAuthStep>(PhoneAuthStep.PHONE_INPUT);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Strip non-numeric characters
    const numericValue = value.replace(/\D/g, "");
    // Format with international code
    if (numericValue.length === 0) return "";
    if (numericValue.length <= 3) return `+${numericValue}`;
    if (numericValue.length <= 6) return `+${numericValue.slice(0, 3)} ${numericValue.slice(3)}`;
    if (numericValue.length <= 10) return `+${numericValue.slice(0, 3)} ${numericValue.slice(3, 6)} ${numericValue.slice(6)}`;
    return `+${numericValue.slice(0, 3)} ${numericValue.slice(3, 6)} ${numericValue.slice(6, 9)} ${numericValue.slice(9)}`;
  };

  // Initialize reCAPTCHA when component mounts
  useEffect(() => {
    if (step === PhoneAuthStep.PHONE_INPUT && recaptchaContainerRef.current) {
      initRecaptchaVerifier('recaptcha-container');
    }
  }, [step]);
  
  const handleSendCode = async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Remove all non-numeric characters (except +)
      const formattedPhone = phoneNumber.replace(/[^\d+]/g, "");
      
      if (!formattedPhone || formattedPhone.length < 10) {
        throw new Error("Please enter a valid phone number");
      }
      
      // Call server to send SMS (this will verify recaptcha on the client side first)
      const response = await sendSmsVerification(formattedPhone);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to send verification code");
      }
      
      setVerificationId(response.verificationId || null);
      setStep(PhoneAuthStep.CODE_VERIFICATION);
      toast({
        title: "Verification code sent",
        description: `A code has been sent to ${formattedPhone}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code");
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send verification code",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyCode = async () => {
    setError(null);
    setLoading(true);
    
    try {
      if (!verificationId) {
        throw new Error("Verification session expired. Please try again.");
      }
      
      if (!verificationCode || verificationCode.length < 4) {
        throw new Error("Please enter a valid verification code");
      }
      
      // Call Firebase to verify the code
      const response = await verifySmsCode(verificationId, verificationCode);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to verify code");
      }
      
      setStep(PhoneAuthStep.VERIFIED);
      toast({
        title: "Phone verified",
        description: "Your phone number has been successfully verified",
      });
      
      // Call onVerified callback if provided
      if (onVerified && response.user) {
        onVerified(phoneNumber, response.user.uid);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code");
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to verify code",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        {step === PhoneAuthStep.PHONE_INPUT && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Verify your phone number</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                We'll send a one-time verification code to this number.
              </p>
            </div>
            
            <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
            
            {error && <p className="text-sm text-destructive">{error}</p>}
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSendCode} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>Send Code</>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {step === PhoneAuthStep.CODE_VERIFICATION && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <LockKeyhole className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Enter verification code</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={loading}
                maxLength={6}
              />
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to {phoneNumber}
              </p>
            </div>
            
            {error && <p className="text-sm text-destructive">{error}</p>}
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep(PhoneAuthStep.PHONE_INPUT)}
                disabled={loading}
              >
                Back
              </Button>
              <Button onClick={handleVerifyCode} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>Verify Code</>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {step === PhoneAuthStep.VERIFIED && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium">Phone Verified</h3>
            </div>
            
            <p>Your phone number {phoneNumber} has been successfully verified.</p>
            
            <Button onClick={handleCancel} className="w-full">
              Continue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
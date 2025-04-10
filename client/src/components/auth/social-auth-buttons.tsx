import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Phone, KeyRound, Fingerprint } from "lucide-react";
import { PhoneAuth } from "./phone-auth";
import { supportsAppleKeychain, storeCredentialsInKeychain } from "@/lib/firebase";

interface SocialAuthButtonsProps {
  onLoginSuccess?: (provider: string, uid?: string) => void;
  credentials?: { username: string; password: string };
}

export function SocialAuthButtons({ onLoginSuccess, credentials }: SocialAuthButtonsProps) {
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [keychainDialogOpen, setKeychainDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Check if browser supports keychain (Apple platform)
  const keychainSupported = supportsAppleKeychain();
  
  const handlePhoneVerified = (phoneNumber: string, uid: string) => {
    setPhoneDialogOpen(false);
    if (onLoginSuccess) {
      onLoginSuccess("phone", uid);
    }
  };
  
  const handlePasskeyLogin = () => {
    // This is a placeholder - actual passkey implementation would go here
    toast({
      title: "Passkey Login",
      description: "Passkey authentication is coming soon",
    });
  };
  
  const handleStoreInKeychain = async () => {
    if (!keychainSupported || !credentials) {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "This browser or device doesn't support secure credential storage",
      });
      return;
    }
    
    try {
      const stored = await storeCredentialsInKeychain(
        credentials.username, 
        credentials.password
      );
      
      if (stored) {
        toast({
          title: "Saved to Keychain",
          description: "Your login credentials have been securely saved",
        });
      } else {
        throw new Error("Failed to store credentials");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save credentials securely",
      });
    } finally {
      setKeychainDialogOpen(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Phone Authentication */}
        <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Phone className="mr-2 h-4 w-4" />
              Phone
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <PhoneAuth 
              onVerified={handlePhoneVerified}
              onCancel={() => setPhoneDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        {/* Passkey Authentication */}
        <Button variant="outline" className="w-full" onClick={handlePasskeyLogin}>
          <Fingerprint className="mr-2 h-4 w-4" />
          Passkey
        </Button>
      </div>
      
      {/* Apple Keychain / Credential Management API */}
      {keychainSupported && credentials && (
        <Dialog open={keychainDialogOpen} onOpenChange={setKeychainDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full text-sm">
              <KeyRound className="mr-2 h-4 w-4" />
              Save credentials securely
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Save to Keychain</h3>
                </div>
                
                <p className="text-sm">
                  Would you like to securely save your login credentials for this site?
                  Your credentials will be stored securely in your device's keychain.
                </p>
                
                <div className="flex space-x-2 justify-end">
                  <Button variant="outline" onClick={() => setKeychainDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStoreInKeychain}>
                    Save Credentials
                  </Button>
                </div>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
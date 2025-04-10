import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { getQueryFn } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertCircle, 
  ClockIcon, 
  Shield, 
  Lock, 
  Fingerprint,
  User
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@shared/schema';
import VerificationRequestForm from '@/components/users/verification-request-form';
import VerificationBadge from '@/components/users/verification-badge';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';

type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

const UserVerificationPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  
  if (isLoading) {
    return <div className="flex justify-center p-20">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // Helper to check if user is eligible for verification
  const isEligibleForVerification = () => {
    const status = user.idVerificationStatus as VerificationStatus;
    return status === 'none' || status === 'rejected';
  };
  
  const getStatusCard = () => {
    const status = user.idVerificationStatus as VerificationStatus;
    
    if (user.isVerified) {
      return (
        <Card className="border-4 border-blue-500">
          <CardHeader className="bg-blue-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-blue-500" />
              <div>
                <CardTitle>Fully Verified</CardTitle>
                <CardDescription>
                  You have the official blue checkmark verification
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <VerificationBadge 
                  isVerified={true}
                  role={user.role}
                  variant="profile"
                />
              </div>
              <p>
                Congratulations! Your account has been fully verified by Inmobi's verification team.
                You now have increased credibility and trust on the platform.
              </p>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h4 className="font-semibold text-blue-700">Benefits of verification:</h4>
                <ul className="list-disc list-inside mt-2 text-blue-700">
                  <li>Priority placement in property listings</li>
                  <li>Higher engagement from potential clients</li>
                  <li>Access to premium partnership opportunities</li>
                  <li>Enhanced profile visibility in search results</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    switch (status) {
      case 'pending':
        return (
          <Card className="border-4 border-amber-300">
            <CardHeader className="bg-amber-50">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-8 w-8 text-amber-500" />
                <div>
                  <CardTitle>Verification Pending</CardTitle>
                  <CardDescription>
                    Your verification is being reviewed
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <VerificationBadge 
                    idVerificationStatus="pending"
                    variant="profile"
                  />
                </div>
                <p>
                  Your verification documents have been submitted and are currently being reviewed 
                  by our verification team. This process typically takes 1-2 business days.
                </p>
                
                <div className="mt-4 p-4 bg-amber-50 rounded-md">
                  <h4 className="font-semibold">What happens next?</h4>
                  <ul className="list-disc list-inside mt-2">
                    <li>Our team reviews your submitted documents</li>
                    <li>We may contact you if additional information is needed</li>
                    <li>Once approved, you'll receive a verification badge</li>
                    <li>You'll be notified by email when the review is complete</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'approved':
        return (
          <Card className="border-4 border-green-500">
            <CardHeader className="bg-green-50">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-500" />
                <div>
                  <CardTitle>ID Verified</CardTitle>
                  <CardDescription>
                    Your ID has been verified successfully
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <VerificationBadge 
                    idVerificationStatus="approved"
                    variant="profile"
                  />
                </div>
                <p>
                  Your identity has been verified successfully. This helps build trust 
                  with potential clients and partners on Inmobi.
                </p>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <h4 className="font-semibold text-blue-700">Want the blue checkmark?</h4>
                  <p className="mt-2 text-blue-700">
                    You are now eligible for full verification with a blue checkmark.
                    This is typically granted to established realtors and property professionals.
                  </p>
                  <Button 
                    className="mt-3 bg-blue-500 hover:bg-blue-600"
                    onClick={() => {
                      toast({
                        title: "Blue checkmark request received",
                        description: "Our team will review your profile. This may take a few days.",
                      });
                    }}
                  >
                    Request Blue Checkmark
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'rejected':
        return (
          <Card className="border-4 border-red-300">
            <CardHeader className="bg-red-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <CardTitle>Verification Failed</CardTitle>
                  <CardDescription>
                    Your verification could not be completed
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-4">
              <div className="flex flex-col gap-4">
                <p>
                  Unfortunately, we couldn't verify your identity with the documents provided.
                  This could be due to:
                </p>
                
                <ul className="list-disc list-inside">
                  <li>Document quality issues (blurry, cut-off, or illegible)</li>
                  <li>Document validity concerns</li>
                  <li>Information mismatch with your account details</li>
                </ul>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <h4 className="font-semibold">What to do next?</h4>
                  <p className="mt-2">
                    You can submit a new verification request with improved documents.
                    Ensure all information is clearly visible and matches your account details.
                  </p>
                  <Button 
                    className="mt-3" 
                    onClick={() => setShowVerificationForm(true)}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      default: // 'none'
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-gray-500" />
                <div>
                  <CardTitle>Not Verified</CardTitle>
                  <CardDescription>
                    Boost your profile credibility with verification
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-4">
              <div className="flex flex-col gap-4">
                <p>
                  Getting verified on Inmobi helps build trust with potential clients and partners.
                  Verified users enjoy higher engagement and priority placement in search results.
                </p>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <h4 className="font-semibold">Benefits of verification:</h4>
                  <ul className="list-disc list-inside mt-2">
                    <li>Increased trust and credibility</li>
                    <li>Higher message response rates</li>
                    <li>More listing views and inquiries</li>
                    <li>Access to premium features</li>
                  </ul>
                </div>
                
                <Button 
                  className="mt-2" 
                  onClick={() => setShowVerificationForm(true)}
                >
                  Start Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };
  
  return (
    <div className="container p-4 mx-auto max-w-5xl">
      <PageHeader
        title="Account Verification"
        description="Verify your identity to build trust and credibility"
      />
      
      <Tabs defaultValue="verification" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="verification">Verification Status</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="verification" className="mt-6">
          {showVerificationForm ? (
            <div className="mt-4">
              <VerificationRequestForm
                onSuccess={() => setShowVerificationForm(false)}
              />
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowVerificationForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            getStatusCard()
          )}
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="h-8 w-8 text-gray-500" />
                <div>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security options
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="h-5 w-5 text-blue-500" />
                    <div>
                      <h3 className="font-medium">Passkey Authentication</h3>
                      <p className="text-sm text-gray-500">
                        Enable passwordless login with passkeys
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={user.passkeyEnabled ? "outline" : "default"}
                    onClick={() => {
                      toast({
                        title: user.passkeyEnabled 
                          ? "Passkey removed successfully" 
                          : "Passkey setup",
                        description: user.passkeyEnabled 
                          ? "Your passkey has been removed from your account." 
                          : "Follow the prompts to set up your passkey.",
                      });
                    }}
                  >
                    {user.passkeyEnabled ? "Remove Passkey" : "Set Up Passkey"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    onClick={() => {
                      toast({
                        title: "Coming Soon",
                        description: "This feature will be available soon.",
                      });
                    }}
                  >
                    Set Up 2FA
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-blue-500" />
                    <div>
                      <h3 className="font-medium">Change Password</h3>
                      <p className="text-sm text-gray-500">
                        Update your account password
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Password Change",
                        description: "Password change feature coming soon.",
                      });
                    }}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserVerificationPage;
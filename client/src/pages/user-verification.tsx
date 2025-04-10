import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { AUTH, API_ENDPOINTS } from "@/lib/constants";
import VerificationRequestForm from "@/components/users/verification-request-form";
import VerificationBadge from "@/components/users/verification-badge";
import PageHeader from "@/components/layout/page-header";

const UserVerificationPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>("verification-status");
  
  // Get the user's verification status
  const { data: verificationStatus, isLoading } = useQuery({
    queryKey: ["verification", user?.id],
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await apiRequest("GET", API_ENDPOINTS.VERIFICATION_STATUS(user.id));
        return await res.json();
      } catch (error) {
        console.error("Failed to get verification status", error);
        return { 
          status: AUTH.VERIFICATION_STATUSES.NONE,
          documentType: null,
          submittedAt: null,
          approvedAt: null,
          rejectedAt: null,
          rejectionReason: null,
        };
      }
    },
    enabled: !!user,
  });
  
  // Get admin verification requests (only for admin users)
  const { data: verificationRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["admin-verification-requests"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", API_ENDPOINTS.VERIFICATION_ADMIN);
        return await res.json();
      } catch (error) {
        console.error("Failed to get verification requests", error);
        return [];
      }
    },
    enabled: user?.role === AUTH.ROLES.ADMIN,
  });
  
  // Admin functions to approve/reject verification
  const approveMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", API_ENDPOINTS.VERIFICATION_APPROVE(userId));
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-verification-requests"] });
      toast({
        title: "Verification approved",
        description: "The user has been successfully verified",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error approving verification",
        description: error.message || "Failed to approve verification",
        variant: "destructive",
      });
    },
  });
  
  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: number; reason: string }) => {
      const res = await apiRequest("POST", API_ENDPOINTS.VERIFICATION_REJECT(userId), { reason });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-verification-requests"] });
      toast({
        title: "Verification rejected",
        description: "The verification request has been rejected",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error rejecting verification",
        description: error.message || "Failed to reject verification",
        variant: "destructive",
      });
    },
  });
  
  // Function to handle rejection with prompt for reason
  const handleReject = (userId: number) => {
    const reason = prompt("Please enter a reason for rejection:");
    if (reason) {
      rejectMutation.mutate({ userId, reason });
    }
  };
  
  // Determine what to render for the user based on verification status
  const renderUserVerificationStatus = () => {
    if (isLoading) {
      return (
        <Card className="w-full">
          <CardContent className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      );
    }
    
    if (!verificationStatus || verificationStatus.status === AUTH.VERIFICATION_STATUSES.NONE) {
      return (
        <Card className="w-full mb-8">
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>You have not submitted a verification request yet</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Verify your identity to gain access to additional features and establish trust with other users.
            </p>
            <Button onClick={() => setSelectedTab("submit-verification")}>Submit Verification</Button>
          </CardContent>
        </Card>
      );
    }
    
    if (verificationStatus.status === AUTH.VERIFICATION_STATUSES.PENDING) {
      return (
        <Card className="w-full mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Verification Pending
              <VerificationBadge isVerified={false} variant="profile" showTooltip={false} />
            </CardTitle>
            <CardDescription>
              Your verification request is being reviewed by our team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Document Type</span>
                <span className="text-muted-foreground">
                  {verificationStatus.documentType === AUTH.ID_VERIFICATION_TYPES.PASSPORT && "Passport"}
                  {verificationStatus.documentType === AUTH.ID_VERIFICATION_TYPES.DRIVERS_LICENSE && "Driver's License"}
                  {verificationStatus.documentType === AUTH.ID_VERIFICATION_TYPES.NATIONAL_ID && "National ID"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Submitted On</span>
                <span className="text-muted-foreground">
                  {new Date(verificationStatus.submittedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Verification typically takes 1-2 business days to process. You will be notified once your verification is approved or if additional information is needed.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (verificationStatus.status === AUTH.VERIFICATION_STATUSES.APPROVED) {
      return (
        <Card className="w-full mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Verification Approved
              <VerificationBadge isVerified={true} variant="profile" />
            </CardTitle>
            <CardDescription>
              Your identity has been verified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Document Type</span>
                <span className="text-muted-foreground">
                  {verificationStatus.documentType === AUTH.ID_VERIFICATION_TYPES.PASSPORT && "Passport"}
                  {verificationStatus.documentType === AUTH.ID_VERIFICATION_TYPES.DRIVERS_LICENSE && "Driver's License"}
                  {verificationStatus.documentType === AUTH.ID_VERIFICATION_TYPES.NATIONAL_ID && "National ID"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Verified On</span>
                <span className="text-muted-foreground">
                  {new Date(verificationStatus.approvedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-4 p-3 bg-green-50 text-green-800 rounded-md">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm">
                  Your verified status is now visible to other users, increasing trust and credibility for your listings and interactions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (verificationStatus.status === AUTH.VERIFICATION_STATUSES.REJECTED) {
      return (
        <Card className="w-full mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              Verification Rejected
              <XCircle className="h-5 w-5" />
            </CardTitle>
            <CardDescription>
              Your verification request was not approved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Document Type</span>
                <span className="text-muted-foreground">
                  {verificationStatus.documentType === AUTH.ID_VERIFICATION_TYPES.PASSPORT && "Passport"}
                  {verificationStatus.documentType === AUTH.ID_VERIFICATION_TYPES.DRIVERS_LICENSE && "Driver's License"}
                  {verificationStatus.documentType === AUTH.ID_VERIFICATION_TYPES.NATIONAL_ID && "National ID"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Rejected On</span>
                <span className="text-muted-foreground">
                  {new Date(verificationStatus.rejectedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Reason</span>
                <span className="text-muted-foreground">
                  {verificationStatus.rejectionReason || "No reason provided"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 text-red-800 rounded-md">
                <XCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm">
                  Please review the rejection reason and submit a new verification request with clearer documentation.
                </p>
              </div>
              <Button 
                onClick={() => setSelectedTab("submit-verification")}
                className="mt-4"
              >
                Submit New Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };
  
  // Admin panel for handling verification requests
  const renderAdminPanel = () => {
    if (user?.role !== AUTH.ROLES.ADMIN) return null;
    
    return (
      <Card className="w-full mt-8">
        <CardHeader>
          <CardTitle>Admin: Verification Requests</CardTitle>
          <CardDescription>
            Review and manage user identity verification requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRequests ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !verificationRequests || verificationRequests.length === 0 ? (
            <p className="text-muted-foreground">No pending verification requests</p>
          ) : (
            <div className="space-y-6">
              {verificationRequests.map((request: any) => (
                <Card key={request.userId} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{request.user.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{request.user.email}</p>
                        <p className="text-sm text-muted-foreground">User ID: {request.userId}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium">Role: {request.user.role}</span>
                        <span className="text-sm text-muted-foreground">
                          Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-sm font-medium">Document Type:</span>
                      <span className="ml-2">
                        {request.documentType === AUTH.ID_VERIFICATION_TYPES.PASSPORT && "Passport"}
                        {request.documentType === AUTH.ID_VERIFICATION_TYPES.DRIVERS_LICENSE && "Driver's License"}
                        {request.documentType === AUTH.ID_VERIFICATION_TYPES.NATIONAL_ID && "National ID"}
                      </span>
                    </div>
                    
                    {request.notes && (
                      <div className="mb-4">
                        <span className="text-sm font-medium">Notes:</span>
                        <p className="text-sm text-muted-foreground mt-1">{request.notes}</p>
                      </div>
                    )}
                    
                    <div className="border rounded-md p-4 mb-4 bg-gray-50">
                      <p className="text-sm font-medium mb-2">ID Document</p>
                      <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                          Document preview available in admin dashboard
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => handleReject(request.userId)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        {rejectMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Rejecting
                          </>
                        ) : (
                          "Reject"
                        )}
                      </Button>
                      <Button 
                        onClick={() => approveMutation.mutate(request.userId)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        {approveMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Approving
                          </>
                        ) : (
                          "Approve"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="container py-10">
      <PageHeader 
        title="Identity Verification" 
        description="Verify your identity to gain access to premium features and increased trust"
      />
      
      <Tabs 
        defaultValue="verification-status" 
        value={selectedTab} 
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="mb-8">
          <TabsTrigger value="verification-status">Verification Status</TabsTrigger>
          <TabsTrigger value="submit-verification">Submit Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="verification-status">
          {renderUserVerificationStatus()}
          {renderAdminPanel()}
        </TabsContent>
        
        <TabsContent value="submit-verification">
          <VerificationRequestForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserVerificationPage;
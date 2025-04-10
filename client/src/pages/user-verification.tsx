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

const UserVerificationPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("status");

  const { data: verificationStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: [API_ENDPOINTS.VERIFICATION_STATUS(user?.id || 0)],
    queryFn: async () => {
      if (!user) return null;
      try {
        const response = await apiRequest(
          "GET", 
          API_ENDPOINTS.VERIFICATION_STATUS(user.id)
        );
        return await response.json();
      } catch (error) {
        // If endpoint returns 404, it means no verification request exists
        if (error instanceof Error && error.message.includes("404")) {
          return { status: AUTH.VERIFICATION_STATUSES.NONE };
        }
        throw error;
      }
    },
    enabled: !!user,
  });

  const updateVerificationMutation = useMutation({
    mutationFn: async ({ userId, status, reason }: { userId: number; status: string; reason?: string }) => {
      const response = await apiRequest(
        "PATCH", 
        API_ENDPOINTS.VERIFICATION_UPDATE(userId),
        { status, notes: reason }
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification status updated",
        description: "The verification status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.VERIFICATION_STATUS(user?.id || 0)] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.VERIFICATION_ADMIN] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating verification",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // If user is not logged in, redirect to login
  if (!user) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access the verification page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/auth"}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // When still loading verification status
  if (isStatusLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <PageHeader
          title="Account Verification"
          description="Verify your identity to gain access to premium features and build trust with other users."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Verification" },
          ]}
        />
        
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading verification status...</span>
        </div>
      </div>
    );
  }

  // Display different UI based on verification status
  const renderVerificationStatus = () => {
    if (!verificationStatus || verificationStatus.status === AUTH.VERIFICATION_STATUSES.NONE) {
      return (
        <Card className="w-full mb-8">
          <CardHeader>
            <CardTitle>Not Verified</CardTitle>
            <CardDescription>
              You have not submitted any verification documents yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Verify your identity to gain access to premium features, build trust with other users, and unlock the full potential of our platform. The verification process typically takes 1-2 business days.
            </p>
            <Button onClick={() => setActiveTab("request")}>
              Start Verification Process
            </Button>
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
                <span className="text-sm font-medium">Approved On</span>
                <span className="text-muted-foreground">
                  {verificationStatus.approvedAt 
                    ? new Date(verificationStatus.approvedAt).toLocaleDateString() 
                    : "Unknown"}
                </span>
              </div>
              <div className="mt-4 flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700">
                  Your verification badge is now visible on your profile and listings
                </span>
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
            <CardTitle className="flex items-center gap-2">
              Verification Rejected
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Rejected
              </span>
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
              {verificationStatus.rejectedAt && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Rejected On</span>
                  <span className="text-muted-foreground">
                    {new Date(verificationStatus.rejectedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {verificationStatus.rejectionReason && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Reason</span>
                  <span className="text-muted-foreground">
                    {verificationStatus.rejectionReason}
                  </span>
                </div>
              )}
              <div className="mt-4 flex items-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">
                  Please submit a new verification request with the required corrections
                </span>
              </div>
              <Button onClick={() => setActiveTab("request")} className="mt-4">
                Submit New Verification Request
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Fallback for unknown status
    return (
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>
            Your current verification status is unknown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            There seems to be an issue with retrieving your verification status. Please try again later or contact customer support.
          </p>
          <Button onClick={() => setActiveTab("request")}>
            Start Verification Process
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container max-w-4xl py-8">
      <PageHeader
        title="Account Verification"
        description="Verify your identity to gain access to premium features and build trust with other users."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Verification" },
        ]}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="status" className="flex-1">Verification Status</TabsTrigger>
          <TabsTrigger value="request" className="flex-1">Submit Verification</TabsTrigger>
          {user.role === "admin" && (
            <TabsTrigger value="admin" className="flex-1">Admin Panel</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="status" className="space-y-4">
          {renderVerificationStatus()}
          
          <Card>
            <CardHeader>
              <CardTitle>Benefits of Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>
                    <strong>Increased Trust:</strong> Verified users receive a badge visible on their profile and listings
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>
                    <strong>Premium Access:</strong> Unlock premium features and higher visibility
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>
                    <strong>Agent Privileges:</strong> Verified agents receive priority support and expanded listing options
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>
                    <strong>Unlimited Listings:</strong> Verified users can post unlimited property listings
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="request">
          <Card>
            <CardHeader>
              <CardTitle>Submit Verification Documents</CardTitle>
              <CardDescription>
                Please upload a photo of your government-issued ID to verify your identity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationRequestForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        {user.role === "admin" && (
          <TabsContent value="admin">
            <AdminVerificationPanel updateMutation={updateVerificationMutation} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// Admin panel component
interface AdminVerificationPanelProps {
  updateMutation: any;
}

const AdminVerificationPanel: React.FC<AdminVerificationPanelProps> = ({ updateMutation }) => {
  const [rejectionReason, setRejectionReason] = useState<string>("");
  
  const { data: verificationRequests, isLoading } = useQuery({
    queryKey: [API_ENDPOINTS.VERIFICATION_ADMIN],
    queryFn: async () => {
      const response = await apiRequest("GET", API_ENDPOINTS.VERIFICATION_ADMIN);
      return await response.json();
    },
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading verification requests...</span>
      </div>
    );
  }
  
  if (!verificationRequests || verificationRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            There are no pending verification requests at this time.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Verification Requests</CardTitle>
          <CardDescription>
            Review and approve or reject user verification requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {verificationRequests.map((request: any) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h3 className="font-medium">{request.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                    <p className="text-sm text-muted-foreground">{request.role}</p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Document Type:</span>{" "}
                      {request.idVerificationType === AUTH.ID_VERIFICATION_TYPES.PASSPORT && "Passport"}
                      {request.idVerificationType === AUTH.ID_VERIFICATION_TYPES.DRIVERS_LICENSE && "Driver's License"}
                      {request.idVerificationType === AUTH.ID_VERIFICATION_TYPES.NATIONAL_ID && "National ID"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Submitted:</span>{" "}
                      {new Date(request.idVerificationDate).toLocaleDateString()}
                    </p>
                    {request.idVerificationNotes && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">Notes:</span>{" "}
                        {request.idVerificationNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex md:justify-end items-start space-x-2">
                    <Button
                      variant="outline"
                      className="border-green-300 hover:bg-green-50 text-green-700"
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ 
                        userId: request.id, 
                        status: "approved"
                      })}
                    >
                      Approve
                    </Button>
                    <Select
                      onValueChange={(value) => {
                        updateMutation.mutate({ 
                          userId: request.id, 
                          status: "rejected",
                          reason: value
                        });
                      }}
                    >
                      <SelectTrigger className="border-red-300 hover:bg-red-50 text-red-700 w-[160px]">
                        <SelectValue placeholder="Reject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Document not clearly visible">
                          Document not clearly visible
                        </SelectItem>
                        <SelectItem value="Document expired">
                          Document expired
                        </SelectItem>
                        <SelectItem value="Information doesn't match account">
                          Information doesn't match account
                        </SelectItem>
                        <SelectItem value="Invalid document type">
                          Invalid document type
                        </SelectItem>
                        <SelectItem value="Other issue">
                          Other issue
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {updateMutation.isPending && updateMutation.variables?.userId === request.id && (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Processing...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserVerificationPage;
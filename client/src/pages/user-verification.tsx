import React from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { API_ENDPOINTS, AUTH } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import VerificationBadge from "@/components/users/verification-badge";
import PageHeader from "@/components/layout/page-header";

interface User {
  id: number;
  role: string;
}

interface VerificationStatus {
  status: 'pending' | 'approved' | 'rejected' | 'none';
  documentType?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface UserVerificationPageProps {
  initialVerificationStatus?: VerificationStatus;
}

interface AdminVerificationPanelProps {
  updateMutation: UseMutationResult<ApiResponse<VerificationStatus>, Error, { userId: number; status: string; reason?: string }, unknown>;
}

const AdminVerificationPanel: React.FC<AdminVerificationPanelProps> = ({ updateMutation }) => {
  const { data: pendingVerifications, isLoading } = useQuery<VerificationStatus[]>({
    queryKey: [API_ENDPOINTS.VERIFICATION_ADMIN],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.VERIFICATION_ADMIN);
      return await response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin mr-2" aria-hidden="true" />
        <span>Loading pending verifications...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Verifications</CardTitle>
        <CardDescription>
          Review and approve verification requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingVerifications?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending verifications</p>
        ) : (
          <div className="space-y-4">
            {pendingVerifications?.map((verification) => (
              <div key={verification.submittedAt} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Document Type: {verification.documentType}</p>
                  <p className="text-sm text-muted-foreground">
                    Submitted on {new Date(verification.submittedAt || '').toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => updateMutation.mutate({
                      userId: parseInt(verification.submittedAt || '0'),
                      status: AUTH.VERIFICATION_STATUSES.REJECTED,
                      reason: "Document quality insufficient"
                    })}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => updateMutation.mutate({
                      userId: parseInt(verification.submittedAt || '0'),
                      status: AUTH.VERIFICATION_STATUSES.APPROVED
                    })}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const UserVerificationPage: React.FC<UserVerificationPageProps> = ({ initialVerificationStatus }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const { data: verificationStatus, isLoading: isVerificationLoading } = useQuery<VerificationStatus>({
    queryKey: [API_ENDPOINTS.VERIFICATION_STATUS, user?.id],
    queryFn: async () => {
      const endpoint = typeof API_ENDPOINTS.VERIFICATION_STATUS === 'function' && user?.id
        ? API_ENDPOINTS.VERIFICATION_STATUS(user.id)
        : String(API_ENDPOINTS.VERIFICATION_STATUS);
      const response = await fetch(endpoint);
      const data: ApiResponse<VerificationStatus> = await response.json();
      return data.data;
    },
    enabled: !!user,
    initialData: initialVerificationStatus,
  });

  const updateMutation = useMutation<
    ApiResponse<VerificationStatus>,
    Error,
    { userId: number; status: string; reason?: string },
    unknown
  >({
    mutationFn: async (data) => {
      const endpoint = typeof API_ENDPOINTS.VERIFICATION_UPDATE === 'function'
        ? API_ENDPOINTS.VERIFICATION_UPDATE(data.userId)
        : String(API_ENDPOINTS.VERIFICATION_UPDATE);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isAuthLoading || isVerificationLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin mr-2" aria-hidden="true" />
        <span>Loading verification status...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p>Please log in to view your verification status.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="User Verification"
        description="Manage your verification status and submit documents for review"
      />

      <Tabs defaultValue="status" className="mt-8">
        <TabsList>
          <TabsTrigger value="status">My Status</TabsTrigger>
          {user.role === "admin" && (
            <TabsTrigger value="admin">Admin Panel</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="status" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>
                  Current status of your verification request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <VerificationBadge status={verificationStatus?.status || "none"} />
                  {verificationStatus?.status === "pending" && (
                    <p className="text-sm text-muted-foreground">
                      Your verification request is being reviewed. We'll notify you once it's processed.
                    </p>
                  )}
                  {verificationStatus?.status === "approved" && (
                    <p className="text-sm text-muted-foreground">
                      Your account is verified. Approved on{" "}
                      {new Date(verificationStatus.approvedAt || "").toLocaleDateString()}
                    </p>
                  )}
                  {verificationStatus?.status === "rejected" && (
                    <div className="space-y-2">
                      <p className="text-sm text-destructive">
                        Your verification was rejected.
                        {verificationStatus.rejectionReason && (
                          <span> Reason: {verificationStatus.rejectionReason}</span>
                        )}
                      </p>
                      <Button
                        onClick={() =>
                          updateMutation.mutate({
                            userId: user.id,
                            status: AUTH.VERIFICATION_STATUSES.PENDING,
                          })
                        }
                      >
                        Request Again
                      </Button>
                    </div>
                  )}
                  {(!verificationStatus?.status || verificationStatus.status === "none") && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        You haven't submitted a verification request yet.
                      </p>
                      <Button
                        onClick={() =>
                          updateMutation.mutate({
                            userId: user.id,
                            status: AUTH.VERIFICATION_STATUSES.PENDING,
                          })
                        }
                      >
                        Request Verification
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {user.role === "admin" && (
          <TabsContent value="admin" className="mt-4">
            <AdminVerificationPanel updateMutation={updateMutation} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default UserVerificationPage;
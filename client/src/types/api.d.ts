export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  role: string;
  email?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VerificationStatus {
  status: 'pending' | 'approved' | 'rejected' | 'none';
  documentType?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface VerificationRequest {
  userId: string;
  documentType: string;
  documentUrl: string;
}

export interface VerificationUpdate {
  userId: string;
  status: 'approved' | 'rejected';
  reason?: string;
} 
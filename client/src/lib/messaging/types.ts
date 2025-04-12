export type MessageCategory = 'inbox' | 'sent' | 'archived';

export interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  subject: string;
  content: string;
  isRead: boolean;
  isArchived: boolean;
  propertyId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
  profileImage?: string | null;
}

export interface MessageWithSenderInfo extends Message {
  sender: User;
}

export interface MessageWithRecipientInfo extends Message {
  recipient: User;
}

export interface MessageRecipient {
  id: number;
  name: string;
  role: string;
  profileImage?: string | null;
}
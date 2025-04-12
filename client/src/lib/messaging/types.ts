// Messaging types used throughout the application

// Categories for messages
export type MessageCategory = 'inbox' | 'sent' | 'archived';

// User type
export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
  profileImage: string | null;
}

// Recipient type (used when sending messages)
export interface MessageRecipient {
  id: number;
  name: string;
  role: string;
  profileImage: string | null;
}

// Base message type
export interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  subject: string;
  content: string;
  isRead: boolean;
  isArchived: boolean;
  propertyId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Extended message with sender info (for recipient's inbox)
export interface MessageWithSenderInfo extends Message {
  sender: User;
}

// Extended message with recipient info (for sender's sent folder)
export interface MessageWithRecipientInfo extends Message {
  recipient: User;
}

// Props for MessageList component
export interface MessageListProps {
  messages: MessageWithSenderInfo[] | MessageWithRecipientInfo[];
  selectedMessageId: number | null;
  onSelectMessage: (id: number) => void;
  isSentFolder: boolean;
}

// Props for MessageDetail component
export interface MessageDetailProps {
  message: MessageWithSenderInfo | MessageWithRecipientInfo | null;
  onReply?: () => void;
  onArchive?: (id: number) => void;
  onDelete?: (id: number) => void;
  onForward?: () => void;
  isSentFolder?: boolean;
}

// Props for ComposeMessage component
export interface ComposeMessageProps {
  onSend: (recipientId: number, subject: string, content: string, propertyId?: number) => Promise<boolean>;
  onCancel: () => void;
  recipients: MessageRecipient[];
  isLoading?: boolean;
  defaultRecipientId?: number;
  defaultSubject?: string;
  defaultContent?: string;
  properties?: Array<{ id: number; title: string }>;
}
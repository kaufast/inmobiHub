// Define the types for the messaging system

export type MessageCategory = 'inbox' | 'sent' | 'archived';

// Base message type
export interface Message {
  id: number;
  subject: string;
  content: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  propertyId?: number | null;
}

// Message recipient type
export interface MessageRecipient {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
  profileImage?: string | null;
}

// User type (can be sender or recipient)
export interface MessageUser {
  id: number;
  fullName: string;
  email: string;
  profileImage?: string | null;
  role: 'user' | 'agent' | 'admin';
}

// Message with sender info (for inbox)
export interface MessageWithSenderInfo extends Message {
  sender: MessageUser;
}

// Message with recipient info (for sent items)
export interface MessageWithRecipientInfo extends Message {
  recipient: MessageUser;
}

// Props for MessageList component
export interface MessageListProps {
  messages: Array<MessageWithSenderInfo | MessageWithRecipientInfo>;
  selectedMessageId: number | null;
  onSelectMessage: (id: number) => void;
  isSentFolder?: boolean;
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
  recipients: MessageRecipient[];
  isLoading?: boolean;
  defaultRecipientId?: number;
  defaultSubject?: string;
  defaultContent?: string;
  properties?: Array<{ id: number; title: string }>;
}
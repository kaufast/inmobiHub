import { Message, User } from "@shared/schema";

export type MessageCategory = 'inbox' | 'sent' | 'archived';

// Platform-agnostic interfaces for messaging components
export interface MessageListProps {
  messages: Message[] | undefined;
  selectedMessageId: number | null;
  onSelectMessage: (messageId: number) => void;
  onArchiveMessage?: (messageId: number) => void;
  onDeleteMessage?: (messageId: number) => void;
  isLoading: boolean;
  emptyMessage: string;
  getUserById: (userId: number) => User | undefined;
}

export interface MessageDetailProps {
  message: Message | null;
  onBack?: () => void;
  onReply?: (messageId: number) => void;
  onArchive?: (messageId: number) => void;
  onDelete?: (messageId: number) => void;
  emptyMessage: string;
  getUserById: (userId: number) => User | undefined;
  viewType: MessageCategory;
}

export interface ComposeMessageProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (recipientId: number, subject: string, content: string, propertyId?: number) => Promise<void>;
  recipients: User[] | undefined;
  replyToMessage?: Message | null;
  isLoading: boolean;
  propertyId?: number;
}

export interface MessagingContainerProps {
  userId: number;
}
import { useState, useEffect, useCallback } from 'react';
import { 
  MessageCategory, 
  Message, 
  User, 
  MessageWithSenderInfo,
  MessageWithRecipientInfo
} from './types';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Sample mock data for users
const mockUsers: User[] = [
  { id: 1, username: 'johndoe', fullName: 'John Doe', email: 'john@example.com', role: 'user', profileImage: null },
  { id: 2, username: 'janesmith', fullName: 'Jane Smith', email: 'jane@example.com', role: 'agent', profileImage: null },
  { id: 3, username: 'michaelj', fullName: 'Michael Johnson', email: 'michael@example.com', role: 'admin', profileImage: null },
];

// Sample mock data for messages
const mockMessages: Message[] = [
  {
    id: 1,
    senderId: 2,
    recipientId: 1,
    subject: 'Property Listing Update',
    content: 'Hello John, I wanted to let you know about a new property that matches your criteria.',
    isRead: false,
    isArchived: false,
    propertyId: 101,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 2,
    senderId: 3,
    recipientId: 1,
    subject: 'Account Verification',
    content: 'Your account has been successfully verified. You can now access premium features.',
    isRead: true,
    isArchived: false,
    propertyId: null,
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000),
  },
  {
    id: 3,
    senderId: 1,
    recipientId: 2,
    subject: "Question about Property",
    content: "Hi Jane, I am interested in scheduling a viewing for the property on Main Street.",
    isRead: true,
    isArchived: false,
    propertyId: 102,
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    updatedAt: new Date(Date.now() - 259200000),
  },
];

// This hook contains the core business logic for the messaging system
// It's shared between all platform-specific implementations
export function useMessagingSystem(userId: number) {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<MessageCategory>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [rawMessages, setRawMessages] = useState<Message[]>([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Load mock data
  useEffect(() => {
    // In a real implementation, we would fetch messages and users from the API
    const timer = setTimeout(() => {
      setRawMessages(mockMessages);
      setUsers(mockUsers);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Enrich messages with sender/recipient info
  const messages = rawMessages.map(message => {
    const isSent = message.senderId === userId;
    
    if (isSent) {
      const recipient = users.find(u => u.id === message.recipientId);
      return {
        ...message,
        recipient: recipient || { 
          id: message.recipientId, 
          username: 'unknown', 
          fullName: 'Unknown User', 
          email: 'unknown@example.com', 
          role: 'user' as const 
        }
      } as MessageWithRecipientInfo;
    } else {
      const sender = users.find(u => u.id === message.senderId);
      return {
        ...message,
        sender: sender || { 
          id: message.senderId, 
          username: 'unknown', 
          fullName: 'Unknown User', 
          email: 'unknown@example.com', 
          role: 'user' as const 
        }
      } as MessageWithSenderInfo;
    }
  });
  
  // Filtered messages based on category and search term
  const filteredMessages = messages.filter(message => {
    const matchesCategory = 
      (activeCategory === 'inbox' && message.recipientId === userId && !message.isArchived) ||
      (activeCategory === 'sent' && message.senderId === userId) ||
      (activeCategory === 'archived' && message.isArchived);
    
    const matchesSearch = 
      searchTerm === '' || 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Selected message
  const selectedMessage = selectedMessageId 
    ? messages.find(m => m.id === selectedMessageId) || null
    : null;

  // Handle message selection
  const handleSelectMessage = useCallback((messageId: number) => {
    setSelectedMessageId(messageId);
    
    // Mark message as read if it's not already
    setRawMessages(prev => 
      prev.map(m => 
        m.id === messageId && !m.isRead 
          ? { ...m, isRead: true } 
          : m
      )
    );
    
    // In a real implementation, we would update the read status in the API
  }, []);

  // Archive message
  const archiveMessage = useCallback((messageId: number) => {
    setRawMessages(prev => 
      prev.map(m => 
        m.id === messageId 
          ? { ...m, isArchived: true } 
          : m
      )
    );
    
    if (selectedMessageId === messageId) {
      setSelectedMessageId(null);
    }
    
    toast({
      title: "Message archived",
      description: "The message has been moved to your archive.",
    });
    
    // In a real implementation, we would update the archived status in the API
  }, [selectedMessageId, toast]);

  // Delete message
  const deleteMessage = useCallback((messageId: number) => {
    setRawMessages(prev => prev.filter(m => m.id !== messageId));
    
    if (selectedMessageId === messageId) {
      setSelectedMessageId(null);
    }
    
    toast({
      title: "Message deleted",
      description: "The message has been permanently deleted.",
    });
    
    // In a real implementation, we would delete the message from the API
  }, [selectedMessageId, toast]);

  // Send message
  const sendMessage = useCallback(async (recipientId: number, subject: string, content: string, propertyId?: number) => {
    // In a real implementation, we would send the message to the API
    const newMessage: Message = {
      id: Math.floor(Math.random() * 10000), // Generate a random ID
      senderId: userId,
      recipientId,
      subject,
      content,
      isRead: false,
      isArchived: false,
      propertyId: propertyId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setRawMessages(prev => [...prev, newMessage]);
    setIsComposeOpen(false);
    
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    });
    
    return true;
  }, [userId, toast]);

  // Get user by ID
  const getUserById = useCallback((id: number): User | undefined => {
    return users.find(user => user.id === id);
  }, [users]);

  return {
    // State
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    messages,
    filteredMessages,
    isComposeOpen,
    setIsComposeOpen,
    selectedMessageId,
    setSelectedMessageId,
    selectedMessage,
    isLoading,
    
    // Actions
    handleSelectMessage,
    archiveMessage,
    deleteMessage,
    sendMessage,
    getUserById,
  };
}
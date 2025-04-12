import { useState, useEffect, useCallback } from 'react';
import { MessageCategory, Message, User } from './types';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// This hook contains the core business logic for the messaging system
// It's shared between all platform-specific implementations
export function useMessagingSystem(userId: number) {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<MessageCategory>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

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
    ? messages.find(m => m.id === selectedMessageId)
    : null;

  // Mock data loading
  useEffect(() => {
    // In a real implementation, we would fetch messages from the API
    // For now, we'll just set a timeout to simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle message selection
  const handleSelectMessage = useCallback((messageId: number) => {
    setSelectedMessageId(messageId);
    
    // Mark message as read if it's not already
    setMessages(prev => 
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
    setMessages(prev => 
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
    setMessages(prev => prev.filter(m => m.id !== messageId));
    
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
    
    setMessages(prev => [...prev, newMessage]);
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
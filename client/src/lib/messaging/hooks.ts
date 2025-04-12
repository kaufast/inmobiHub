import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCategory, 
  Message, 
  MessageWithSenderInfo, 
  MessageWithRecipientInfo 
} from './types';

// Demo data for messages
const DEMO_MESSAGES: Array<MessageWithSenderInfo | MessageWithRecipientInfo> = [
  {
    id: 1,
    subject: "Question about Property #123",
    content: "Hello, I'm interested in the 3-bedroom apartment you have listed. Is it still available for viewing this weekend?",
    isRead: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    propertyId: 123,
    sender: {
      id: 2,
      fullName: "Jane Smith",
      email: "jane.smith@example.com",
      role: "user",
      profileImage: null
    }
  },
  {
    id: 2,
    subject: "Property Valuation Request",
    content: "I'm planning to sell my house in the next few months and would like to get a valuation. Could you provide me with information about your valuation services?",
    isRead: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    sender: {
      id: 3,
      fullName: "Robert Johnson",
      email: "robert.johnson@example.com",
      role: "user",
      profileImage: null
    }
  },
  {
    id: 3,
    subject: "RE: Neighborhood Analysis Report",
    content: "Thank you for your interest in our neighborhood analysis reports. I've attached a sample report for your review. Please let me know if you have any questions.",
    isRead: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 48 hours ago
    recipient: {
      id: 4,
      fullName: "Maria Garcia",
      email: "maria.garcia@example.com",
      role: "agent",
      profileImage: null
    }
  },
  {
    id: 4,
    subject: "Rental Agreement Clarification",
    content: "I have a question about clause 14 in the rental agreement. It states that tenants are responsible for minor repairs, but it doesn't specify what qualifies as 'minor'. Could you please clarify this?",
    isRead: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    sender: {
      id: 5,
      fullName: "David Wilson",
      email: "david.wilson@example.com",
      role: "user",
      profileImage: null
    }
  },
  {
    id: 5,
    subject: "Investment Property Consultation",
    content: "I'm looking to diversify my investment portfolio with real estate. Do you offer consultation services for potential investors? I'd like to discuss strategies and potentially view some properties with good ROI.",
    isRead: true,
    isArchived: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    sender: {
      id: 6,
      fullName: "Michael Brown",
      email: "michael.brown@example.com",
      role: "user",
      profileImage: null
    }
  }
];

/**
 * Hook for managing the messaging system
 * In a real application, this would make API calls to a backend
 */
export function useMessagingSystem(userId: number) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Array<MessageWithSenderInfo | MessageWithRecipientInfo>>([]);
  
  // UI state
  const [activeCategory, setActiveCategory] = useState<MessageCategory>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  
  // Load messages (simulated API call)
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500)); // simulate network delay
        
        // Simulate loading messages from an API
        setMessages(DEMO_MESSAGES);
      } catch (error) {
        toast({
          title: "Error loading messages",
          description: "Could not load your messages. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, [toast, userId]);
  
  // Filter messages based on current category and search term
  const filteredMessages = messages.filter(message => {
    // First check if the message belongs to the current category
    const isSentMessage = 'recipient' in message;
    const matchesCategory = 
      (activeCategory === 'inbox' && !isSentMessage && !message.isArchived) || 
      (activeCategory === 'sent' && isSentMessage) || 
      (activeCategory === 'archived' && message.isArchived);
    
    if (!matchesCategory) return false;
    
    // Then filter by search term if one is provided
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      message.subject.toLowerCase().includes(term) || 
      message.content.toLowerCase().includes(term)
    );
  });
  
  // Get the currently selected message
  const selectedMessage = selectedMessageId 
    ? messages.find(m => m.id === selectedMessageId) || null
    : null;
  
  // Mark a message as read when selected
  useEffect(() => {
    if (selectedMessageId && selectedMessage && !selectedMessage.isRead) {
      setMessages(prev => 
        prev.map(message => 
          message.id === selectedMessageId 
            ? { ...message, isRead: true } 
            : message
        )
      );
    }
  }, [selectedMessageId, selectedMessage]);
  
  // Handlers for message actions
  const handleSelectMessage = useCallback((id: number) => {
    setSelectedMessageId(id);
  }, []);
  
  const archiveMessage = useCallback((id: number) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === id 
          ? { ...message, isArchived: true } 
          : message
      )
    );
    
    toast({
      title: "Message archived",
      description: "The message has been moved to your archive."
    });
    
    // If the archived message was selected, clear the selection
    if (selectedMessageId === id) {
      setSelectedMessageId(null);
    }
  }, [selectedMessageId, toast]);
  
  const deleteMessage = useCallback((id: number) => {
    // In a real app, we might flag it as deleted instead of removing it entirely
    setMessages(prev => prev.filter(message => message.id !== id));
    
    toast({
      title: "Message deleted",
      description: "The message has been permanently deleted."
    });
    
    // If the deleted message was selected, clear the selection
    if (selectedMessageId === id) {
      setSelectedMessageId(null);
    }
  }, [selectedMessageId, toast]);
  
  // Send a new message
  const sendMessage = useCallback(async (
    recipientId: number, 
    subject: string, 
    content: string,
    propertyId?: number
  ): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create a new message
      const newMessage: MessageWithRecipientInfo = {
        id: Math.max(0, ...messages.map(m => m.id)) + 1,
        subject,
        content,
        isRead: true,
        isArchived: false,
        createdAt: new Date().toISOString(),
        propertyId: propertyId || null,
        recipient: {
          id: recipientId,
          fullName: "Demo Recipient", // In a real app, we'd get this from the API
          email: "recipient@example.com", // In a real app, we'd get this from the API
          role: "user", // In a real app, we'd get this from the API
          profileImage: null
        }
      };
      
      // Add the new message
      setMessages(prev => [...prev, newMessage]);
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully."
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Could not send your message. Please try again later.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [messages, toast]);
  
  return {
    // State
    messages,
    filteredMessages,
    isLoading,
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    selectedMessageId,
    setSelectedMessageId,
    selectedMessage,
    isComposeOpen,
    setIsComposeOpen,
    
    // Actions
    handleSelectMessage,
    archiveMessage,
    deleteMessage,
    sendMessage,
  };
}
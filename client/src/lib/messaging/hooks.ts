import { useQuery, useMutation } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageCategory } from "./types";
import { useState } from "react";

/**
 * Hook for using messages with platform-agnostic data fetching and state management
 */
export function useMessagingSystem(userId: number | undefined) {
  const [activeCategory, setActiveCategory] = useState<MessageCategory>("inbox");
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  
  // Fetch received messages (inbox)
  const {
    data: receivedMessages,
    isLoading: isLoadingReceived,
    refetch: refetchReceived
  } = useQuery<Message[]>({
    queryKey: ["/api/user/messages", { role: "recipient" }],
    enabled: !!userId && activeCategory === "inbox",
  });
  
  // Fetch sent messages
  const {
    data: sentMessages,
    isLoading: isLoadingSent,
    refetch: refetchSent
  } = useQuery<Message[]>({
    queryKey: ["/api/user/messages", { role: "sent" }],
    enabled: !!userId && activeCategory === "sent",
  });
  
  // Fetch archived messages
  const {
    data: archivedMessages,
    isLoading: isLoadingArchived,
    refetch: refetchArchived
  } = useQuery<Message[]>({
    queryKey: ["/api/user/messages", { role: "archived" }],
    enabled: !!userId && activeCategory === "archived",
  });

  // Get users for user lookup
  const {
    data: users,
    isLoading: isLoadingUsers
  } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!userId,
  });
  
  // Mutation to send a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { recipientId: number; subject: string; content: string; propertyId?: number }) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return await res.json();
    },
    onSuccess: () => {
      // Refresh both received and sent messages
      refetchReceived();
      refetchSent();
      
      // Close the compose dialog
      setIsComposeOpen(false);
    },
  });
  
  // Mutation to update message status
  const updateMessageStatusMutation = useMutation({
    mutationFn: async ({ messageId, status }: { messageId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/messages/${messageId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      // Refresh all message categories
      refetchReceived();
      refetchSent();
      refetchArchived();
    },
  });
  
  // Get messages for the current category
  const getMessagesForCategory = () => {
    switch (activeCategory) {
      case "inbox":
        return receivedMessages;
      case "sent":
        return sentMessages;
      case "archived":
        return archivedMessages;
      default:
        return undefined;
    }
  };
  
  // Get loading state for the current category
  const isLoadingForCategory = () => {
    switch (activeCategory) {
      case "inbox":
        return isLoadingReceived;
      case "sent":
        return isLoadingSent;
      case "archived":
        return isLoadingArchived;
      default:
        return false;
    }
  };
  
  // Filter messages by search term
  const getFilteredMessages = () => {
    const messages = getMessagesForCategory();
    
    if (!messages) return [];
    if (!searchTerm) return messages;
    
    const term = searchTerm.toLowerCase();
    return messages.filter(message => 
      message.subject.toLowerCase().includes(term) || 
      message.content.toLowerCase().includes(term)
    );
  };
  
  // Get user by ID
  const getUserById = (userId: number): User | undefined => {
    if (!users) return undefined;
    return users.find(u => u.id === userId);
  };
  
  // Handle message selection
  const handleSelectMessage = (messageId: number) => {
    setSelectedMessageId(messageId);
    
    // If it's in the inbox and unread, mark it as read
    const message = getMessagesForCategory()?.find(m => m.id === messageId);
    if (message && message.status === "unread" && activeCategory === "inbox") {
      updateMessageStatusMutation.mutate({
        messageId,
        status: "read",
      });
    }
  };
  
  // Archive a message
  const archiveMessage = (messageId: number) => {
    updateMessageStatusMutation.mutate({
      messageId,
      status: "archived",
    });
    
    if (selectedMessageId === messageId) {
      setSelectedMessageId(null);
    }
  };
  
  // Delete a message (currently just archives it)
  const deleteMessage = (messageId: number) => {
    // Implementation would depend on API - this just archives for now
    archiveMessage(messageId);
  };
  
  // Get the selected message
  const selectedMessage = selectedMessageId 
    ? getMessagesForCategory()?.find(m => m.id === selectedMessageId) || null
    : null;
  
  return {
    // State
    activeCategory,
    setActiveCategory,
    selectedMessageId,
    setSelectedMessageId,
    searchTerm,
    setSearchTerm,
    isComposeOpen,
    setIsComposeOpen,
    
    // Data
    messages: getMessagesForCategory(),
    filteredMessages: getFilteredMessages(),
    selectedMessage,
    users,
    
    // Loading states
    isLoading: isLoadingForCategory(),
    isLoadingUsers,
    
    // Actions
    handleSelectMessage,
    archiveMessage,
    deleteMessage,
    sendMessage: sendMessageMutation.mutateAsync,
    updateMessageStatus: updateMessageStatusMutation.mutateAsync,
    
    // Helpers
    getUserById,
  };
}
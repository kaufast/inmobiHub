import { useState, useEffect } from 'react';
import { MessageRecipient } from '@/lib/messaging/types';
import { useToast } from './use-toast';

// Demo data for available message recipients
const DEMO_RECIPIENTS: MessageRecipient[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "user",
    profileImage: null
  },
  {
    id: 2,
    name: "Alice Williams",
    email: "alice.williams@example.com",
    role: "agent",
    profileImage: null
  },
  {
    id: 3,
    name: "Carlos Rodriguez",
    email: "carlos.r@example.com",
    role: "admin",
    profileImage: null
  },
  {
    id: 4,
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    role: "user",
    profileImage: null
  },
  {
    id: 5,
    name: "Emma Martinez",
    email: "emma.m@example.com",
    role: "agent",
    profileImage: null
  }
];

// Hook for fetching and managing message recipients
export function useMessageRecipients() {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<MessageRecipient[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(true);
  
  // Fetch recipients (simulated API call)
  useEffect(() => {
    const fetchRecipients = async () => {
      setIsLoadingRecipients(true);
      
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 400)); // simulate network delay
        
        // Simulate fetching recipients from an API
        setRecipients(DEMO_RECIPIENTS);
      } catch (error) {
        toast({
          title: "Error loading recipients",
          description: "Could not load the list of recipients. Please try again later.",
          variant: "destructive",
        });
        setRecipients([]);
      } finally {
        setIsLoadingRecipients(false);
      }
    };
    
    fetchRecipients();
  }, [toast]);
  
  return {
    recipients,
    isLoadingRecipients,
  };
}
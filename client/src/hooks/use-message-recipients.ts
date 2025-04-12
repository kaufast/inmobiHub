import { useQuery, useMutation } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Hook to handle message recipients
export function useMessageRecipients() {
  const { toast } = useToast();

  // Get all potential message recipients (all users except current user)
  const {
    data: recipients,
    isLoading: isLoadingRecipients,
    error: recipientsError,
  } = useQuery<User[]>({
    queryKey: ['/api/message-recipients'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Get users by specific role
  const getUsersByRole = (role: 'user' | 'agent' | 'admin') => {
    return useQuery<User[]>({
      queryKey: [`/api/users/by-role/${role}`],
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
  };

  // Get admin users
  const {
    data: adminUsers,
    isLoading: isLoadingAdmins,
  } = getUsersByRole('admin');

  // Get agent users
  const {
    data: agentUsers,
    isLoading: isLoadingAgents,
  } = getUsersByRole('agent');

  // Get regular users
  const {
    data: regularUsers,
    isLoading: isLoadingUsers,
  } = getUsersByRole('user');

  // Send a new message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, subject, content }: { 
      recipientId: number;
      subject: string;
      content: string;
    }) => {
      const res = await apiRequest('POST', '/api/messages', {
        recipientId,
        subject,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate messages queries to refresh the messages list
      queryClient.invalidateQueries({ queryKey: ['/api/user/messages'] });
      
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error sending message',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    recipients,
    isLoadingRecipients,
    recipientsError,
    adminUsers,
    agentUsers,
    regularUsers,
    isLoadingAdmins,
    isLoadingAgents,
    isLoadingUsers,
    sendMessageMutation,
  };
}
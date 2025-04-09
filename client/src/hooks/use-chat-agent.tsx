import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function useChatAgent(propertyId?: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message to the chat
    const newUserMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Send message to API
      const response = await apiRequest('POST', '/api/chat', {
        message,
        chatHistory: messages,
        propertyId
      });

      const data = await response.json();

      // Add AI response to chat
      const aiMessage: Message = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [messages, propertyId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat
  };
}
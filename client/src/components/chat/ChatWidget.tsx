import { useState, useEffect, useRef } from 'react';
import { useChatAgent } from '@/hooks/use-chat-agent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, X, Send, Minimize2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatWidgetProps {
  propertyId?: number;
  delayAppearance?: number; // Delay in milliseconds
}

export function ChatWidget({ propertyId, delayAppearance = 10000 }: ChatWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { messages, isLoading, error, sendMessage } = useChatAgent(propertyId);

  // Show chat widget after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayAppearance);
    
    return () => clearTimeout(timer);
  }, [delayAppearance]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat is expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {!isExpanded ? (
        <Button 
          className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 text-white p-0"
          onClick={() => setIsExpanded(true)}
        >
          <MessageCircle size={24} />
        </Button>
      ) : (
        <Card className="w-80 md:w-96 shadow-lg border-primary/20">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-primary/5">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/logo.png" alt="PropertiMate" />
                <AvatarFallback>PM</AvatarFallback>
              </Avatar>
              <span className="font-medium">PropertiMate Assistant</span>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setIsExpanded(false)}
              >
                <Minimize2 size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setIsVisible(false)}
              >
                <X size={18} />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 h-80 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <MessageCircle size={30} className="mb-2 opacity-50" />
                <p className="text-sm">Hi! I'm your virtual real estate assistant. How can I help you today?</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex gap-2 max-w-[90%]",
                      message.role === 'user' ? "ml-auto" : "mr-auto"
                    )}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src="/logo.png" alt="Assistant" />
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={cn(
                        "py-2 px-3 rounded-lg text-sm",
                        message.role === 'user' 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}
                    >
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src="" alt="You" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 max-w-[90%]">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src="/logo.png" alt="Assistant" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="py-2 px-3 rounded-lg bg-muted flex items-center">
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="text-sm text-destructive my-2 text-center">
                    {error}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-3 pt-2 border-t">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                <Send size={16} />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
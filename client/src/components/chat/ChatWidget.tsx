import { useState, useEffect, useRef } from 'react';
import { useChatAgent } from '@/hooks/use-chat-agent';
import { useSuggestedQuestions } from '@/hooks/use-suggested-questions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, X, Send, Minimize2, Loader2, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SuggestedQuestions } from './SuggestedQuestions';

interface ChatWidgetProps {
  propertyId?: number;
  delayAppearance?: number; // Delay in milliseconds
}

export function ChatWidget({ propertyId, delayAppearance = 10000 }: ChatWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { messages, isLoading, error, sendMessage } = useChatAgent(propertyId, category);

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
  
  // List of predefined categories for analytics
  const categories = [
    { value: "pricing", label: "Pricing Questions" },
    { value: "features", label: "Property Features" },
    { value: "neighborhood", label: "Neighborhood Info" },
    { value: "financing", label: "Financing & Mortgages" },
    { value: "process", label: "Buying/Selling Process" },
    { value: "legal", label: "Legal Questions" },
    { value: "scheduling", label: "Scheduling & Tours" },
    { value: "other", label: "Other Questions" }
  ];

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
        <Card className="w-80 md:w-96 shadow-lg border-gray-600 bg-gray-800">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-gray-700">
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
          
          <CardContent className="p-4 h-80 overflow-y-auto bg-gray-800 text-white">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-300">
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
                          ? "bg-gray-600 text-white" 
                          : "bg-gray-700 text-white"
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
                    <div className="py-2 px-3 rounded-lg bg-gray-700 text-white flex items-center">
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
          
          <CardFooter className="p-3 pt-2 border-t flex-col bg-gray-700 border-gray-600">
            <div className="flex w-full items-center gap-2 mb-2">
              <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex gap-1 text-xs h-8 px-2 border-dashed"
                  >
                    <Tag size={14} />
                    {category ? categories.find(c => c.value === category)?.label : "Select category"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium mb-2">Question category</p>
                    {categories.map((cat) => (
                      <Button
                        key={cat.value}
                        variant={category === cat.value ? "default" : "outline"}
                        className="w-full justify-start text-left text-sm mb-1"
                        onClick={() => {
                          setCategory(cat.value);
                          setIsCategoryOpen(false);
                        }}
                      >
                        {cat.label}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <span className="text-xs text-gray-300 flex-1">
                {category 
                  ? "Category selected for analytics" 
                  : "Select a question category to help us improve"}
              </span>
            </div>
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-600 text-white border-gray-500 placeholder:text-gray-300"
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
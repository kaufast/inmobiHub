import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Inbox, 
  Send, 
  ArchiveIcon, 
  PenSquare, 
  Search, 
  MessageCircle,
  Menu,
  X
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { MessageCategory } from '@/lib/messaging/types';

interface MobileGmailStyleMessagingProps {
  userId: number;
}

export function MobileGmailStyleMessaging({ userId }: MobileGmailStyleMessagingProps) {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<MessageCategory>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Temporary placeholder data
  const filteredMessages = [];
  const selectedMessage = null;
  const recipients = [];
  const isLoadingRecipients = false;

  // Temporary placeholder functions
  const handleSelectMessage = (id: number) => {
    setSelectedMessageId(id);
  };
  
  const handleSendMessage = async (recipientId: number, subject: string, content: string) => {
    setIsComposeOpen(false);
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    });
  };

  // For mobile, show different views based on state:
  // 1. Message List view (default)
  // 2. Message Detail view (when message selected)
  // 3. Compose view (when compose is open)
  
  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Mobile Header with Navigation */}
      <div className="bg-primary p-2 text-white flex items-center justify-between">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          
          <SheetContent side="left" className="p-0">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Messages</h2>
            </div>
            <div className="p-4 space-y-2">
              <Button 
                variant="default" 
                className="w-full mb-4"
                onClick={() => {
                  setIsComposeOpen(true);
                  setIsSidebarOpen(false);
                }}
              >
                <PenSquare className="h-4 w-4 mr-2" />
                Compose New Message
              </Button>
              
              <Button 
                variant={activeCategory === "inbox" ? "secondary" : "ghost"}
                className="w-full justify-start" 
                onClick={() => {
                  setActiveCategory("inbox");
                  setSelectedMessageId(null);
                  setIsSidebarOpen(false);
                }}
              >
                <Inbox className="h-4 w-4 mr-2" />
                Inbox
              </Button>
              
              <Button 
                variant={activeCategory === "sent" ? "secondary" : "ghost"}
                className="w-full justify-start" 
                onClick={() => {
                  setActiveCategory("sent");
                  setSelectedMessageId(null);
                  setIsSidebarOpen(false);
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                Sent
              </Button>
              
              <Button 
                variant={activeCategory === "archived" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveCategory("archived");
                  setSelectedMessageId(null);
                  setIsSidebarOpen(false);
                }}
              >
                <ArchiveIcon className="h-4 w-4 mr-2" />
                Archived
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="font-semibold">
          {selectedMessageId 
            ? "Message Details" 
            : isComposeOpen 
              ? "New Message" 
              : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`}
        </div>

        {(selectedMessageId || isComposeOpen) && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white"
            onClick={() => {
              setSelectedMessageId(null);
              setIsComposeOpen(false);
            }}
          >
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Search bar - only shown in list view */}
      {!selectedMessageId && !isComposeOpen && (
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        {isComposeOpen ? (
          <div className="p-3">
            {/* Compose form will go here */}
            <p className="text-center p-8 text-muted-foreground">Compose message form will be here</p>
          </div>
        ) : selectedMessageId ? (
          <div className="p-3">
            {/* Message detail will go here */}
            <p className="text-center p-8 text-muted-foreground">Message details will be here</p>
          </div>
        ) : (
          <div>
            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No messages</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeCategory === 'inbox' 
                    ? "Your inbox is empty. Messages from others will appear here."
                    : activeCategory === 'sent'
                    ? "You haven't sent any messages yet."
                    : "No archived messages found."}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {/* Message list items will go here */}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating action button - only shown in list view */}
      {!selectedMessageId && !isComposeOpen && (
        <Button
          className="fixed bottom-5 right-5 rounded-full w-14 h-14 shadow-lg"
          size="icon"
          onClick={() => setIsComposeOpen(true)}
        >
          <PenSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
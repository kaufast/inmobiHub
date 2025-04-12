import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Inbox, 
  Send, 
  ArchiveIcon, 
  PenSquare, 
  MessageCircle, 
  Menu,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MessageCategory } from '@/lib/messaging/types';
import { useMessagingSystem } from '@/lib/messaging/hooks';
import { useMessageRecipients } from '@/hooks/use-message-recipients';
import { MobileMessageList } from './MobileMessageList';
import { MobileMessageDetail } from './MobileMessageDetail';
import { MobileComposeMessage } from './MobileComposeMessage';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface MobileGmailStyleMessagingProps {
  userId: number;
}

export function MobileGmailStyleMessaging({ userId }: MobileGmailStyleMessagingProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const {
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    filteredMessages,
    isComposeOpen,
    setIsComposeOpen,
    selectedMessageId,
    setSelectedMessageId,
    selectedMessage,
    isLoading,
    handleSelectMessage,
    archiveMessage,
    deleteMessage,
    sendMessage,
  } = useMessagingSystem(userId);
  
  // Use the message recipients hook to get potential recipients
  const { recipients, isLoadingRecipients } = useMessageRecipients();

  // Handle message actions
  const handleReply = () => {
    if (!selectedMessage) return;
    
    // In a real implementation we would set up defaults for replying
    setIsComposeOpen(true);
    setSelectedMessageId(null);
  };
  
  const handleForward = () => {
    if (!selectedMessage) return;
    
    // In a real implementation we would set up defaults for forwarding
    setIsComposeOpen(true);
    setSelectedMessageId(null);
  };
  
  const handleBack = () => {
    setSelectedMessageId(null);
  };

  const closeSheet = () => {
    setSheetOpen(false);
  };

  const selectCategory = (category: MessageCategory) => {
    setActiveCategory(category);
    setSelectedMessageId(null);
    closeSheet();
  };

  // Mobile views are handled as a stack rather than a multi-column layout
  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      {/* Mobile navigation header */}
      <div className="flex items-center justify-between p-3 border-b bg-background z-10">
        <div className="flex items-center">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] px-0">
              <div className="flex flex-col h-full pt-4">
                <Button 
                  variant="default" 
                  className="mx-4 mb-6 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    setIsComposeOpen(true);
                    closeSheet();
                  }}
                >
                  <PenSquare className="h-4 w-4 mr-2" />
                  New Message
                </Button>
                
                <div className="space-y-1 px-2">
                  <Button 
                    variant={activeCategory === "inbox" ? "secondary" : "ghost"}
                    className="w-full justify-start" 
                    onClick={() => selectCategory("inbox")}
                  >
                    <Inbox className="h-4 w-4 mr-2" />
                    Inbox
                  </Button>
                  
                  <Button 
                    variant={activeCategory === "sent" ? "secondary" : "ghost"}
                    className="w-full justify-start" 
                    onClick={() => selectCategory("sent")}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Sent
                  </Button>
                  
                  <Button 
                    variant={activeCategory === "archived" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => selectCategory("archived")}
                  >
                    <ArchiveIcon className="h-4 w-4 mr-2" />
                    Archived
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">
            {activeCategory === 'inbox' ? 'Inbox' : 
             activeCategory === 'sent' ? 'Sent Messages' : 'Archived'}
          </h1>
        </div>
        
        {!isComposeOpen && !selectedMessageId && (
          <Button 
            variant="default"
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsComposeOpen(true)}
          >
            <PenSquare className="h-4 w-4 mr-1" />
            New
          </Button>
        )}
      </div>
      
      {/* Content area - shows one of: compose form, message detail, or message list */}
      <div className="flex-1 overflow-hidden">
        {isComposeOpen ? (
          <MobileComposeMessage 
            onSend={sendMessage}
            onCancel={() => setIsComposeOpen(false)}
            recipients={recipients}
            isLoading={isLoadingRecipients}
          />
        ) : selectedMessageId && selectedMessage ? (
          <MobileMessageDetail
            message={selectedMessage}
            onReply={handleReply}
            onArchive={archiveMessage}
            onDelete={deleteMessage}
            onForward={handleForward}
            onBack={handleBack}
            isSentFolder={activeCategory === 'sent'}
          />
        ) : (
          isLoading ? (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              <p className="mt-4 text-muted-foreground">Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
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
            <MobileMessageList 
              messages={filteredMessages}
              selectedMessageId={selectedMessageId}
              onSelectMessage={handleSelectMessage}
              isSentFolder={activeCategory === 'sent'}
            />
          )
        )}
      </div>
    </div>
  );
}
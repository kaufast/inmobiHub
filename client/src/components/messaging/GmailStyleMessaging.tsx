import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Inbox, 
  Send, 
  ArchiveIcon, 
  PenSquare, 
  Search,
  MessageCircle
} from 'lucide-react';
import { MessageCategory } from '@/lib/messaging/types';
import { useMessagingSystem } from '@/lib/messaging/hooks';
import { useMessageRecipients } from '@/hooks/use-message-recipients';
import { MessageList } from './MessageList';
import { MessageDetail } from './MessageDetail';
import { ComposeMessage } from './ComposeMessage';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface GmailStyleMessagingProps {
  userId: number;
}

export function GmailStyleMessaging({ userId }: GmailStyleMessagingProps) {
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
  };
  
  const handleForward = () => {
    if (!selectedMessage) return;
    
    // In a real implementation we would set up defaults for forwarding
    setIsComposeOpen(true);
  };

  // Function to render category button
  const CategoryButton = ({ 
    category, 
    icon, 
    label 
  }: { 
    category: MessageCategory; 
    icon: React.ReactNode; 
    label: string 
  }) => (
    <Button
      variant={activeCategory === category ? "secondary" : "ghost"}
      className="justify-start w-full"
      onClick={() => {
        setActiveCategory(category);
        setSelectedMessageId(null);
      }}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Button>
  );

  return (
    <div className="h-[calc(100vh-60px)] flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-background">
        <h1 className="text-xl font-semibold">Messages</h1>
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r p-4 bg-background">
          <Button 
            variant="default" 
            className="w-full mb-4"
            onClick={() => setIsComposeOpen(true)}
          >
            <PenSquare className="h-4 w-4 mr-2" />
            New Message
          </Button>
          
          <div className="space-y-1">
            <CategoryButton 
              category="inbox" 
              icon={<Inbox className="h-4 w-4" />} 
              label="Inbox" 
            />
            <CategoryButton 
              category="sent" 
              icon={<Send className="h-4 w-4" />} 
              label="Sent" 
            />
            <CategoryButton 
              category="archived" 
              icon={<ArchiveIcon className="h-4 w-4" />} 
              label="Archived" 
            />
          </div>
        </div>

        {/* Message List Column */}
        <div className={`border-r ${selectedMessageId ? 'w-1/3' : 'flex-1'}`}>
          {isLoading ? (
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
            <MessageList 
              messages={filteredMessages}
              selectedMessageId={selectedMessageId}
              onSelectMessage={handleSelectMessage}
              isSentFolder={activeCategory === 'sent'}
            />
          )}
        </div>

        {/* Message Detail or Compose Form */}
        {isComposeOpen ? (
          <div className="flex-1">
            <ComposeMessage 
              onSend={sendMessage}
              onClose={() => setIsComposeOpen(false)}
              recipients={recipients}
              isLoading={isLoadingRecipients}
            />
          </div>
        ) : selectedMessageId && selectedMessage ? (
          <div className="flex-1">
            <MessageDetail 
              message={selectedMessage}
              onReply={handleReply}
              onArchive={archiveMessage}
              onDelete={deleteMessage}
              onForward={handleForward}
              isSentFolder={activeCategory === 'sent'}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
            <div className="text-center max-w-md">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a message</h3>
              <p className="text-sm text-muted-foreground">
                Choose a message from the list to view its contents here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
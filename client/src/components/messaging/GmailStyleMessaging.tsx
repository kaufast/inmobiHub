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
  MessageCircle 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCategory, 
  MessageWithSenderInfo, 
  MessageWithRecipientInfo 
} from '@/lib/messaging/types';
import { useMessagingSystem } from '@/lib/messaging/hooks';
import { useMessageRecipients } from '@/hooks/use-message-recipients';
import { MessageList } from './MessageList';
import { MessageDetail } from './MessageDetail';
import { ComposeMessage } from './ComposeMessage';

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

  return (
    <div className="flex h-[calc(100vh-80px)] gap-4">
      {/* Left sidebar - Message categories */}
      <Card className="w-64 flex-shrink-0">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="default" 
            className="w-full mb-4"
            onClick={() => setIsComposeOpen(true)}
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Compose New Message
          </Button>
          
          <div className="space-y-1 mt-6">
            <Button 
              variant={activeCategory === "inbox" ? "secondary" : "ghost"}
              className="w-full justify-start" 
              onClick={() => {
                setActiveCategory("inbox");
                setSelectedMessageId(null);
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
              }}
            >
              <ArchiveIcon className="h-4 w-4 mr-2" />
              Archived
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Middle column - Message list */}
      <Card className="flex-grow">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <Separator />
        
        <div className="h-[calc(100%-80px)] overflow-auto">
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
            activeCategory === 'sent' ? (
              <MessageList 
                messages={filteredMessages as MessageWithRecipientInfo[]}
                selectedMessageId={selectedMessageId}
                onSelectMessage={handleSelectMessage}
                isSentFolder={true}
              />
            ) : (
              <MessageList 
                messages={filteredMessages as MessageWithSenderInfo[]}
                selectedMessageId={selectedMessageId}
                onSelectMessage={handleSelectMessage}
                isSentFolder={false}
              />
            )
          )}
        </div>
      </Card>

      {/* Right column - Message detail or compose form */}
      <Card className="w-1/2 flex-shrink-0">
        {isComposeOpen ? (
          <ComposeMessage 
            onSend={sendMessage}
            onCancel={() => setIsComposeOpen(false)}
            recipients={recipients}
            isLoading={isLoadingRecipients}
          />
        ) : selectedMessageId && selectedMessage ? (
          <MessageDetail
            message={selectedMessage}
            onReply={handleReply}
            onArchive={archiveMessage}
            onDelete={deleteMessage}
            onForward={handleForward}
            isSentFolder={activeCategory === 'sent'}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No message selected</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select a message from the list to view its contents.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
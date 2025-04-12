import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Inbox, 
  Send, 
  ArchiveIcon, 
  PenSquare, 
  Search, 
  MessageCircle 
} from 'lucide-react';
import { MessageList } from './MessageList';
import { MessageDetail } from './MessageDetail';
import { ComposeMessage } from './ComposeMessage';
import { useMessagingSystem } from '@/lib/messaging/hooks';
import { useMessageRecipients } from '@/hooks/use-message-recipients';
import { MessageCategory } from '@/lib/messaging/types';
import { useToast } from '@/hooks/use-toast';

interface GmailStyleMessagingProps {
  userId: number;
}

export function GmailStyleMessaging({ userId }: GmailStyleMessagingProps) {
  const { toast } = useToast();
  const {
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    isComposeOpen,
    setIsComposeOpen,
    selectedMessageId,
    filteredMessages,
    selectedMessage,
    isLoading,
    handleSelectMessage,
    archiveMessage,
    deleteMessage,
    sendMessage,
    getUserById,
  } = useMessagingSystem(userId);

  // Use the message recipients hook to get potential recipients
  const { recipients, isLoadingRecipients } = useMessageRecipients();

  // Handle sending a message
  const handleSendMessage = async (recipientId: number, subject: string, content: string, propertyId?: number) => {
    try {
      await sendMessage({ recipientId, subject, content, propertyId });
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "There was an error sending your message",
        variant: "destructive",
      });
    }
  };

  // Get empty message based on category
  const getEmptyMessage = () => {
    switch (activeCategory) {
      case 'inbox':
        return 'Your inbox is empty';
      case 'sent':
        return 'You haven\'t sent any messages yet';
      case 'archived':
        return 'No archived messages';
      default:
        return 'No messages found';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Messages</h1>
          <p className="text-primary-600">Manage your communications</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left sidebar with navigation */}
        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-4">
              <Button 
                onClick={() => setIsComposeOpen(true)} 
                className="w-full bg-secondary-500 hover:bg-secondary-600 mb-4 py-6"
                size="lg"
              >
                <PenSquare className="h-5 w-5 mr-2" />
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
        </div>
        
        {/* Middle column - Message list */}
        <div className="md:col-span-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary-400" />
                <Input
                  placeholder="Search messages..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Tab indicators for mobile */}
              <Tabs className="mt-4 md:hidden" value={activeCategory} onValueChange={(value) => setActiveCategory(value as MessageCategory)}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="inbox">
                    <Inbox className="h-4 w-4 mr-2" />
                    Inbox
                  </TabsTrigger>
                  <TabsTrigger value="sent">
                    <Send className="h-4 w-4 mr-2" />
                    Sent
                  </TabsTrigger>
                  <TabsTrigger value="archived">
                    <ArchiveIcon className="h-4 w-4 mr-2" />
                    Archived
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="flex-grow pb-0 h-[calc(100%-76px)]">
              <MessageList
                messages={filteredMessages}
                selectedMessageId={selectedMessageId}
                onSelectMessage={handleSelectMessage}
                onArchiveMessage={activeCategory === "inbox" ? archiveMessage : undefined}
                onDeleteMessage={activeCategory === "inbox" ? deleteMessage : undefined}
                isLoading={isLoading}
                emptyMessage={getEmptyMessage()}
                getUserById={getUserById}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Message detail */}
        <div className="md:col-span-5">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <MessageDetail
                message={selectedMessage}
                onReply={(messageId) => setIsComposeOpen(true)}
                onArchive={archiveMessage}
                onDelete={deleteMessage}
                emptyMessage="Select a message from the list to view its details"
                getUserById={getUserById}
                viewType={activeCategory}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Compose Message Component */}
      <ComposeMessage
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendMessage}
        recipients={recipients}
        replyToMessage={selectedMessage}
        isLoading={false}
      />
    </div>
  );
}
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageListProps, MessageWithSenderInfo, MessageWithRecipientInfo } from '@/lib/messaging/types';
import { CircleIcon, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

// Helper function to get the initials for the avatar fallback
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function MobileMessageList({
  messages,
  selectedMessageId,
  onSelectMessage,
  isSentFolder
}: MessageListProps) {
  const [searchText, setSearchText] = useState('');
  
  // Filter messages by search text
  const filteredMessages = searchText.trim() === '' 
    ? messages 
    : messages.filter(message => 
        message.subject.toLowerCase().includes(searchText.toLowerCase()) ||
        message.content.toLowerCase().includes(searchText.toLowerCase())
      );
  
  return (
    <div className="flex flex-col h-full">
      {/* Mobile search bar */}
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-10"
            placeholder="Search messages..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      
      {/* Message list */}
      <div className="flex-1 overflow-y-auto">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <p className="text-muted-foreground text-center">
              {searchText.trim() !== '' 
                ? "No messages matching your search" 
                : "No messages found"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredMessages.map(message => {
              // Determine if message has sender or recipient based on folder
              const person = isSentFolder
                ? (message as MessageWithRecipientInfo).recipient
                : (message as MessageWithSenderInfo).sender;
              
              // Calculate relative time (e.g., "2 hours ago")
              const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
              
              return (
                <div
                  key={message.id}
                  className={`p-3 flex items-center cursor-pointer ${
                    selectedMessageId === message.id ? "bg-muted" : ""
                  }`}
                  onClick={() => onSelectMessage(message.id)}
                >
                  <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                    {person.profileImage ? (
                      <AvatarImage src={person.profileImage} alt={person.fullName} />
                    ) : (
                      <AvatarFallback>{getInitials(person.fullName)}</AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className={`font-medium truncate ${!message.isRead && !isSentFolder ? "font-semibold" : ""}`}>
                        {person.fullName}
                      </p>
                      <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {timeAgo}
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium truncate">{message.subject}</p>
                    
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-muted-foreground truncate">
                        {message.content.length > 60
                          ? `${message.content.substring(0, 60)}...`
                          : message.content}
                      </p>
                      
                      {!message.isRead && !isSentFolder && (
                        <div className="ml-auto">
                          <CircleIcon className="h-2 w-2 fill-primary text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
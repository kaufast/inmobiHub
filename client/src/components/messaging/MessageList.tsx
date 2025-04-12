import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageListProps, 
  MessageWithSenderInfo, 
  MessageWithRecipientInfo 
} from '@/lib/messaging/types';
import { CircleIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to get the initials for the avatar fallback
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function MessageList({
  messages,
  selectedMessageId,
  onSelectMessage,
  isSentFolder = false
}: MessageListProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y">
        {messages.map(message => {
          // Determine if message has sender or recipient based on folder
          const person = isSentFolder
            ? (message as MessageWithRecipientInfo).recipient
            : (message as MessageWithSenderInfo).sender;
            
          // Calculate relative time (e.g., "2 hours ago")
          const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
          
          return (
            <div
              key={message.id}
              className={`p-4 flex cursor-pointer transition-colors ${
                selectedMessageId === message.id ? "bg-muted" : "hover:bg-muted/50"
              }`}
              onClick={() => onSelectMessage(message.id)}
            >
              <Avatar className="h-10 w-10 mr-4 flex-shrink-0">
                {person.profileImage ? (
                  <AvatarImage src={person.profileImage} alt={person.fullName} />
                ) : (
                  <AvatarFallback>{getInitials(person.fullName)}</AvatarFallback>
                )}
              </Avatar>
              
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <p className={`font-medium truncate ${
                      !message.isRead && !isSentFolder ? "font-semibold" : ""
                    }`}>
                      {person.fullName}
                    </p>
                    <Badge variant="outline" className="ml-2 text-xs h-5">
                      {person.role}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {timeAgo}
                  </div>
                </div>
                
                <p className="mt-1 text-sm font-medium">{message.subject}</p>
                
                <div className="flex mt-1">
                  <p className="text-xs text-muted-foreground truncate">
                    {message.content.length > 100
                      ? `${message.content.substring(0, 100)}...`
                      : message.content}
                  </p>
                  
                  {!message.isRead && !isSentFolder && (
                    <div className="ml-auto pl-2">
                      <CircleIcon className="h-2 w-2 fill-primary text-primary" />
                    </div>
                  )}
                </div>
                
                {message.propertyId && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Property #{message.propertyId}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
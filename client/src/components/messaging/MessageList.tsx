import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageListProps, MessageWithSenderInfo, MessageWithRecipientInfo } from '@/lib/messaging/types';

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
  isSentFolder
}: MessageListProps) {
  return (
    <div className="divide-y">
      {messages.map(message => {
        // Determine if message has sender or recipient based on folder
        const person = isSentFolder
          ? (message as MessageWithRecipientInfo).recipient
          : (message as MessageWithSenderInfo).sender;
        
        // Calculate relative time (e.g., "2 hours ago")
        const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
        
        // Determine display class based on read status
        const messageClass = !message.isRead && !isSentFolder
          ? "bg-muted/50 font-medium"
          : "hover:bg-muted/30";
        
        return (
          <div
            key={message.id}
            className={`p-4 flex items-center gap-4 cursor-pointer ${
              selectedMessageId === message.id ? "bg-muted" : messageClass
            }`}
            onClick={() => onSelectMessage(message.id)}
          >
            <Avatar className="h-10 w-10">
              {person.profileImage ? (
                <AvatarImage src={person.profileImage} alt={person.fullName} />
              ) : (
                <AvatarFallback>{getInitials(person.fullName)}</AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold truncate">
                  {person.fullName}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo}
                </div>
              </div>
              
              <div className="text-sm font-medium truncate">
                {message.subject}
                {message.propertyId && (
                  <Badge variant="outline" className="ml-2 px-1 py-0 text-xs">
                    Property #{message.propertyId}
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground truncate">
                {message.content}
              </div>
            </div>
            
            {!message.isRead && !isSentFolder && (
              <div className="h-2 w-2 rounded-full bg-primary" />
            )}
          </div>
        );
      })}
    </div>
  );
}
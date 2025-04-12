import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Reply, 
  Forward, 
  ArchiveIcon, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { MessageDetailProps, MessageWithSenderInfo, MessageWithRecipientInfo } from '@/lib/messaging/types';

// Helper function to get the initials for the avatar fallback
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function MessageDetail({
  message,
  onReply,
  onArchive,
  onDelete,
  onForward,
  isSentFolder = false
}: MessageDetailProps) {
  if (!message) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Select a message to view details</p>
      </div>
    );
  }

  // Determine if the message has sender or recipient info based on the folder
  const person = isSentFolder
    ? (message as MessageWithRecipientInfo).recipient
    : (message as MessageWithSenderInfo).sender;
  
  // Format the date for display
  const formattedDate = format(new Date(message.createdAt), 'PPP p');

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Message Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold truncate">{message.subject}</h2>
        <div className="flex gap-2">
          {onReply && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onReply}
              className="flex-shrink-0"
            >
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
          )}
          {onForward && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onForward}
              className="flex-shrink-0"
            >
              <Forward className="h-4 w-4 mr-2" />
              Forward
            </Button>
          )}
          {onArchive && !message.isArchived && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onArchive(message.id)}
              title="Archive"
            >
              <ArchiveIcon className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(message.id)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Sender/Recipient Info */}
        <div className="flex items-start mb-6">
          <Avatar className="h-12 w-12 mr-4">
            {person.profileImage ? (
              <AvatarImage src={person.profileImage} alt={person.fullName} />
            ) : (
              <AvatarFallback>{getInitials(person.fullName)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-medium">{person.fullName}</h3>
              <Badge variant="outline" className="ml-2">
                {person.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {isSentFolder ? 'To: ' : 'From: '}{person.email}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
          </div>
        </div>
        
        {/* Related property info if applicable */}
        {message.propertyId && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="secondary">
                  Related Property
                </Badge>
                <p className="text-sm mt-1">Property #{message.propertyId}</p>
              </div>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Property
              </Button>
            </div>
          </div>
        )}
        
        {/* Message body */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
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
  if (!message) return null;
  
  // Determine if the message has sender or recipient info based on the folder
  const person = isSentFolder
    ? (message as MessageWithRecipientInfo).recipient
    : (message as MessageWithSenderInfo).sender;
  
  // Format the date for display
  const formattedDate = format(new Date(message.createdAt), 'PPP p');
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold mb-2">{message.subject}</h2>
          <div className="flex gap-1">
            {onReply && (
              <Button variant="ghost" size="icon" onClick={onReply} title="Reply">
                <Reply className="h-4 w-4" />
              </Button>
            )}
            {onForward && (
              <Button variant="ghost" size="icon" onClick={onForward} title="Forward">
                <Forward className="h-4 w-4" />
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
        
        {message.propertyId && (
          <div className="mb-2">
            <Badge variant="outline" className="mr-2">
              Related Property #{message.propertyId}
            </Badge>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              View Property
            </Button>
          </div>
        )}
        
        <div className="flex items-center mt-2">
          <Avatar className="h-10 w-10 mr-4">
            {person.profileImage ? (
              <AvatarImage src={person.profileImage} alt={person.fullName} />
            ) : (
              <AvatarFallback>{getInitials(person.fullName)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="font-medium">
              {person.fullName}
              <Badge className="ml-2" variant="outline">
                {person.role}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {isSentFolder ? 'To: ' : 'From: '}{person.email}
            </div>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            {formattedDate}
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-grow overflow-auto">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
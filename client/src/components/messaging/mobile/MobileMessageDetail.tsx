import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Reply, 
  Forward, 
  ArchiveIcon, 
  Trash2,
  ChevronLeft,
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

export function MobileMessageDetail({
  message,
  onReply,
  onArchive,
  onDelete,
  onForward,
  isSentFolder = false,
  onBack
}: MessageDetailProps & { onBack: () => void }) {
  if (!message) return null;
  
  // Determine if the message has sender or recipient info based on the folder
  const person = isSentFolder
    ? (message as MessageWithRecipientInfo).recipient
    : (message as MessageWithSenderInfo).sender;
  
  // Format the date for display
  const formattedDate = format(new Date(message.createdAt), 'PPP p');
  
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Mobile header */}
      <div className="flex items-center p-3 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold truncate">{message.subject}</h2>
        </div>
        <div className="flex gap-1">
          {onArchive && !message.isArchived && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onArchive(message.id)}
              title="Archive"
              className="h-8 w-8"
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
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Message content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Sender/Recipient info */}
          <div className="flex items-center mb-4">
            <Avatar className="h-10 w-10 mr-3">
              {person.profileImage ? (
                <AvatarImage src={person.profileImage} alt={person.fullName} />
              ) : (
                <AvatarFallback>{getInitials(person.fullName)}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <div className="font-medium truncate">
                  {person.fullName}
                </div>
                <Badge className="ml-2 text-xs py-0 px-2" variant="outline">
                  {person.role}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {isSentFolder ? 'To: ' : 'From: '}{person.email}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mb-4">
            {formattedDate}
          </div>
          
          {/* Related property info if applicable */}
          {message.propertyId && (
            <div className="mb-4 p-2 bg-muted rounded-md">
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  Related Property #{message.propertyId}
                </Badge>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
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
      
      {/* Reply/Forward actions */}
      <div className="p-3 border-t flex justify-between">
        {onReply && (
          <Button 
            className="flex-1 mr-2" 
            onClick={onReply}
            variant="outline"
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
        )}
        {onForward && (
          <Button 
            className="flex-1" 
            onClick={onForward}
            variant="outline"
          >
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </Button>
        )}
      </div>
    </div>
  );
}
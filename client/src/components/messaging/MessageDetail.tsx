import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message, MessageWithSenderInfo, MessageWithRecipientInfo } from '@/lib/messaging/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ArchiveIcon, Trash2, Reply, Forward } from 'lucide-react';
import { User } from '@/lib/messaging/types';

interface MessageDetailProps {
  message: MessageWithSenderInfo | MessageWithRecipientInfo | null;
  onReply?: () => void;
  onArchive?: (id: number) => void;
  onDelete?: (id: number) => void;
  onForward?: () => void;
  isSentFolder?: boolean;
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
    return null;
  }

  // Determine if we should show the sender or recipient info
  const person: User = isSentFolder
    ? ('recipient' in message ? message.recipient : { id: 0, username: '', fullName: 'Unknown', email: '', role: 'user' })
    : ('sender' in message ? message.sender : { id: 0, username: '', fullName: 'Unknown', email: '', role: 'user' });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">{message.subject}</h2>
        <div className="flex space-x-2">
          {onArchive && (
            <Button variant="ghost" size="icon" onClick={() => onArchive(message.id)}>
              <ArchiveIcon className="h-5 w-5" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(message.id)}>
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            {person.profileImage ? (
              <AvatarImage src={person.profileImage} alt={person.fullName} />
            ) : (
              <AvatarFallback>{getInitials(person.fullName)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="font-medium">{person.fullName}</div>
            <div className="text-sm text-muted-foreground">
              {isSentFolder ? 'To: ' : 'From: '}{person.email}
            </div>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            {format(new Date(message.createdAt), 'PPp')}
          </div>
        </div>
      </div>

      <div className="flex-grow p-4 overflow-auto">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Property reference if present */}
        {message.propertyId && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">Referenced Property</h3>
              <div className="text-sm">
                Property ID: {message.propertyId}
                {/* Additional property details would go here in a real implementation */}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="p-4 border-t mt-auto">
        <div className="flex space-x-2">
          {onReply && (
            <Button variant="outline" onClick={onReply}>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
          )}
          {onForward && (
            <Button variant="outline" onClick={onForward}>
              <Forward className="h-4 w-4 mr-2" />
              Forward
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
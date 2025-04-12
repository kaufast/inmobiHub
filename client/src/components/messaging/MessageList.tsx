import { useState } from 'react';
import { Message, MessageWithSenderInfo, MessageWithRecipientInfo } from '@/lib/messaging/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: MessageWithSenderInfo[] | MessageWithRecipientInfo[];
  selectedMessageId: number | null;
  onSelectMessage: (id: number) => void;
  isSentFolder?: boolean;
}

export function MessageList({ 
  messages, 
  selectedMessageId, 
  onSelectMessage,
  isSentFolder = false
}: MessageListProps) {
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);

  const toggleMessageSelection = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedMessages(prev => 
      prev.includes(id) 
        ? prev.filter(messageId => messageId !== id) 
        : [...prev, id]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="divide-y">
      {messages.map(message => {
        // For sent messages, we want to show the recipient
        // For received messages, we want to show the sender
        const person = isSentFolder 
          ? ('recipient' in message ? message.recipient : { fullName: 'Unknown', profileImage: null })
          : ('sender' in message ? message.sender : { fullName: 'Unknown', profileImage: null });
        
        const isSelected = selectedMessageId === message.id;
        const isChecked = selectedMessages.includes(message.id);
        
        return (
          <div 
            key={message.id}
            className={cn(
              "flex items-start p-3 hover:bg-accent/30 cursor-pointer transition-colors", 
              isSelected && "bg-accent/50", 
              !message.isRead && !isSentFolder && "font-medium"
            )}
            onClick={() => onSelectMessage(message.id)}
          >
            <div className="flex items-center mr-3">
              <Checkbox 
                checked={isChecked}
                onCheckedChange={() => {}}
                onClick={(e) => toggleMessageSelection(message.id, e)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            
            <Avatar className="h-10 w-10 mr-3">
              {person.profileImage ? (
                <AvatarImage src={person.profileImage} alt={person.fullName} />
              ) : (
                <AvatarFallback>{getInitials(person.fullName)}</AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium truncate">{person.fullName}</div>
                <div className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </div>
              </div>
              
              <div className="text-sm font-medium truncate">{message.subject}</div>
              
              <div className="text-sm text-muted-foreground truncate">
                {message.content.substring(0, 100)}
                {message.content.length > 100 ? '...' : ''}
              </div>
              
              {!message.isRead && !isSentFolder && (
                <Badge variant="default" className="mt-1">Unread</Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
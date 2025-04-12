import { Button } from "@/components/ui/button";
import { MessageDetailProps } from "@/lib/messaging/types";
import { MessageCircle, Reply, ArchiveIcon, Trash2, ArrowLeft } from "lucide-react";

export function MobileMessageDetail({
  message,
  onBack,
  onReply,
  onArchive,
  onDelete,
  emptyMessage,
  getUserById,
  viewType,
}: MessageDetailProps) {
  if (!message) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-primary-700">No message selected</h3>
        <p className="text-sm text-primary-500 max-w-md mt-2">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const sender = getUserById(message.senderId);
  const recipient = getUserById(message.recipientId);

  return (
    <div className="h-full flex flex-col">
      {/* Back button - always shown on mobile */}
      <div className="sticky top-0 z-10 bg-white p-4 border-b border-primary-100 flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h3 className="text-lg font-medium truncate flex-1">{message.subject}</h3>
      </div>

      <div className="p-4 flex-grow overflow-y-auto">
        <div className="flex items-center justify-between mb-4 text-primary-600 text-sm">
          <div className="font-medium">
            {viewType === "sent" ? (
              <span>To: {recipient?.fullName || `User #${message.recipientId}`}</span>
            ) : (
              <span>From: {sender?.fullName || `User #${message.senderId}`}</span>
            )}
          </div>
          <div className="text-xs">
            {new Date(message.createdAt).toLocaleString()}
          </div>
        </div>
        
        <div className="prose prose-sm max-w-none mb-6 text-primary-800 whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
      
      {viewType === "inbox" && (
        <div className="sticky bottom-0 p-4 border-t border-primary-100 bg-white">
          <div className="flex space-x-2">
            {onReply && (
              <Button onClick={() => onReply(message.id)} className="flex-1">
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
            )}
            
            <div className="flex space-x-2">
              {onArchive && (
                <Button variant="outline" size="icon" onClick={() => onArchive(message.id)}>
                  <ArchiveIcon className="h-4 w-4" />
                </Button>
              )}
              
              {onDelete && (
                <Button variant="outline" size="icon" onClick={() => onDelete(message.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
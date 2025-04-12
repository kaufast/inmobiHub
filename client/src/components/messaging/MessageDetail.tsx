import { Button } from "@/components/ui/button";
import { MessageDetailProps } from "@/lib/messaging/types";
import { MessageCircle, Reply, ArchiveIcon, Trash2, ArrowLeft } from "lucide-react";

export function MessageDetail({
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
      {/* Mobile back button */}
      {onBack && (
        <div className="p-4 flex items-center lg:hidden border-b border-primary-100">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      )}

      <div className="p-6 flex-grow overflow-y-auto">
        <h2 className="text-xl font-semibold text-primary-900 mb-2">{message.subject}</h2>
        
        <div className="flex items-center justify-between mb-6 text-primary-600 text-sm">
          <div>
            {viewType === "sent" ? (
              <span>To: {recipient?.fullName || `User #${message.recipientId}`}</span>
            ) : (
              <span>From: {sender?.fullName || `User #${message.senderId}`}</span>
            )}
          </div>
          <div>
            {new Date(message.createdAt).toLocaleString()}
          </div>
        </div>
        
        <div className="prose prose-sm max-w-none mb-6 text-primary-800 whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
      
      {viewType === "inbox" && (
        <div className="p-4 border-t border-primary-100 flex space-x-2">
          {onReply && (
            <Button onClick={() => onReply(message.id)}>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
          )}
          
          {onArchive && (
            <Button variant="outline" onClick={() => onArchive(message.id)}>
              <ArchiveIcon className="h-4 w-4 mr-2" />
              Archive
            </Button>
          )}
          
          {onDelete && (
            <Button variant="outline" onClick={() => onDelete(message.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
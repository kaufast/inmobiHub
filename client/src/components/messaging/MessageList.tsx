import { formatTimeAgo } from "@/lib/utils";
import { MessageListProps } from "@/lib/messaging/types";
import { Search, MessageCircle, Circle, CheckCircle2, Reply, ArchiveIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export function MessageList({
  messages,
  selectedMessageId,
  onSelectMessage,
  isLoading,
  emptyMessage,
  getUserById,
}: MessageListProps) {
  // Get status icon based on message status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "unread":
        return <Circle className="h-4 w-4 text-blue-500 fill-blue-500" />;
      case "read":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "replied":
        return <Reply className="h-4 w-4 text-purple-500" />;
      case "archived":
        return <ArchiveIcon className="h-4 w-4 text-orange-500" />;
      default:
        return <Circle className="h-4 w-4 text-primary-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {isLoading ? (
        <div className="flex justify-center py-12 flex-grow">
          <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
      ) : messages && messages.length > 0 ? (
        <div className="divide-y divide-primary-100 overflow-y-auto flex-grow">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`px-4 py-3 cursor-pointer hover:bg-primary-50 transition-colors ${
                selectedMessageId === message.id ? "bg-primary-50" : ""
              } ${message.status === "unread" ? "font-medium" : ""}`}
              onClick={() => onSelectMessage(message.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(message.status)}
                  <span className="text-sm font-medium truncate max-w-[150px]">
                    {getUserById(message.senderId)?.fullName || `User #${message.senderId}`}
                  </span>
                </div>
                <span className="text-xs text-primary-500">
                  {formatTimeAgo(message.createdAt)}
                </span>
              </div>
              <h4 className="text-sm font-medium text-primary-800 truncate">{message.subject}</h4>
              <p className="text-xs text-primary-500 truncate">{message.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-primary-600">No messages found</h3>
          <p className="text-xs text-primary-500">
            {emptyMessage}
          </p>
        </div>
      )}
    </div>
  );
}
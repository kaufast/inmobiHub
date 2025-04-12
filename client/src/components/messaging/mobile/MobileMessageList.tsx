import { MessageListProps } from "@/lib/messaging/types";
import { formatTimeAgo } from "@/lib/utils";
import { Circle, CheckCircle2, Reply, ArchiveIcon, MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function MobileMessageList({
  messages,
  selectedMessageId,
  onSelectMessage,
  isLoading,
  emptyMessage,
  getUserById,
}: MessageListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter messages by search term
  const filteredMessages = messages ? messages.filter(message => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      message.subject.toLowerCase().includes(term) || 
      message.content.toLowerCase().includes(term) ||
      getUserById(message.senderId)?.fullName?.toLowerCase().includes(term)
    );
  }) : [];
  
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
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-primary-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 h-4 w-4" />
          <Input
            placeholder="Search messages..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : filteredMessages.length > 0 ? (
        <div className="divide-y divide-primary-100 overflow-y-auto flex-grow">
          {filteredMessages.map((message) => (
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
                  <span className="text-sm font-medium truncate max-w-[200px]">
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
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-primary-700">No messages found</h3>
          <p className="text-sm text-primary-500 mt-2">
            {emptyMessage}
          </p>
        </div>
      )}
    </div>
  );
}
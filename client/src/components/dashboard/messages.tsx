import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { User, Message, InsertMessage, Property } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatTimeAgo } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface MessagesProps {
  propertyId?: number;
}

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Inbox,
  Send,
  PenSquare,
  Loader2,
  Search,
  MessageCircle,
  User as UserIcon,
  Clock,
  CheckCircle2,
  Circle,
  Reply,
  ArchiveIcon,
  Trash2,
} from "lucide-react";

// Form schema for new message
const messageFormSchema = z.object({
  recipientId: z.number({
    required_error: "Please select a recipient",
  }),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  content: z.string().min(10, "Message must be at least 10 characters"),
  propertyId: z.number().optional(),
});

type MessageFormValues = z.infer<typeof messageFormSchema>;

export default function Messages({ propertyId }: MessagesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  
  // Fetch property data if propertyId is provided
  const { data: property } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId,
  });
  
  // Fetch received messages
  const { 
    data: receivedMessages, 
    isLoading: isLoadingReceived,
    refetch: refetchReceived
  } = useQuery<Message[]>({
    queryKey: ["/api/user/messages", { role: "recipient" }],
    enabled: !!user && activeTab === "received",
  });
  
  // Fetch sent messages
  const { 
    data: sentMessages, 
    isLoading: isLoadingSent,
    refetch: refetchSent 
  } = useQuery<Message[]>({
    queryKey: ["/api/user/messages", { role: "sent" }],
    enabled: !!user && activeTab === "sent",
  });
  
  // Fetch potential recipients (all users)
  const { data: allUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!user && isNewMessageOpen,
  });
  
  // Mutation to send a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormValues) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
      
      // Refresh both received and sent messages
      refetchReceived();
      refetchSent();
      
      // Close the dialog and reset form
      setIsNewMessageOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation to update message status
  const updateMessageStatusMutation = useMutation({
    mutationFn: async ({ messageId, status }: { messageId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/messages/${messageId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      // Refresh received messages
      refetchReceived();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Set up form for new message
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      subject: "",
      content: "",
    },
  });
  
  // Set up form for replying to a message
  const replyForm = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      subject: "",
      content: "",
    },
  });
  
  // When a message is selected for reply, update reply form
  // Set initial property ID if provided
  useEffect(() => {
    if (propertyId && property) {
      form.setValue("propertyId", propertyId);
      if (!form.getValues("subject")) {
        form.setValue("subject", `Inquiry about: ${property.title}`);
      }
      // Open the new message dialog automatically when property ID is provided
      setIsNewMessageOpen(true);
    }
  }, [propertyId, property, form]);

  useEffect(() => {
    if (selectedMessage && isReplyDialogOpen) {
      replyForm.setValue("recipientId", selectedMessage.senderId);
      replyForm.setValue("subject", `Re: ${selectedMessage.subject}`);
      replyForm.setValue("propertyId", selectedMessage.propertyId || undefined);
    }
  }, [selectedMessage, isReplyDialogOpen, replyForm]);
  
  // When a message is selected, mark it as read if it's unread
  useEffect(() => {
    if (selectedMessage && selectedMessage.status === "unread" && user?.id === selectedMessage.recipientId) {
      updateMessageStatusMutation.mutate({
        messageId: selectedMessage.id,
        status: "read",
      });
    }
  }, [selectedMessage, updateMessageStatusMutation, user]);
  
  // Filter messages by search term
  const filterMessages = (messages: Message[] | undefined) => {
    if (!messages) return [];
    
    if (!searchTerm) return messages;
    
    const term = searchTerm.toLowerCase();
    return messages.filter(message => 
      message.subject.toLowerCase().includes(term) || 
      message.content.toLowerCase().includes(term)
    );
  };
  
  // Get messages for the current tab
  const currentMessages = activeTab === "received" ? receivedMessages : sentMessages;
  const filteredMessages = filterMessages(currentMessages);
  const isLoading = activeTab === "received" ? isLoadingReceived : isLoadingSent;
  
  // Handle form submission for new message
  const onSubmitNewMessage = (data: MessageFormValues) => {
    sendMessageMutation.mutate(data);
  };
  
  // Handle form submission for reply
  const onSubmitReply = (data: MessageFormValues) => {
    sendMessageMutation.mutate(data);
    setIsReplyDialogOpen(false);
    
    // Also update the original message status to "replied"
    if (selectedMessage) {
      updateMessageStatusMutation.mutate({
        messageId: selectedMessage.id,
        status: "replied",
      });
    }
  };
  
  // Handle message selection
  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
  };
  
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
  
  // Mock function to get user by ID (simulating what would happen with real data)
  const getUserById = (userId: number): User | undefined => {
    if (!allUsers) return undefined;
    return allUsers.find(u => u.id === userId);
  };
  
  // Mark message as archived
  const archiveMessage = (messageId: number) => {
    updateMessageStatusMutation.mutate({
      messageId,
      status: "archived",
    });
    toast({
      title: "Message archived",
      description: "The message has been archived",
    });
    
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };
  
  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Messages</h1>
          <p className="text-primary-600">Manage your communications</p>
        </div>
        <Button 
          onClick={() => setIsNewMessageOpen(true)} 
          className="bg-secondary-500 hover:bg-secondary-600"
        >
          <PenSquare className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex w-full items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary-400" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="received" value={activeTab} onValueChange={(value) => setActiveTab(value as "received" | "sent")}>
                <TabsList className="grid grid-cols-2 mx-4">
                  <TabsTrigger value="received">
                    <Inbox className="h-4 w-4 mr-2" />
                    Inbox
                  </TabsTrigger>
                  <TabsTrigger value="sent">
                    <Send className="h-4 w-4 mr-2" />
                    Sent
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="received" className="pt-2">
                  {isLoadingReceived ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
                    </div>
                  ) : filteredMessages && filteredMessages.length > 0 ? (
                    <div className="divide-y divide-primary-100">
                      {filteredMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`px-4 py-3 cursor-pointer hover:bg-primary-50 transition-colors ${
                            selectedMessage?.id === message.id ? "bg-primary-50" : ""
                          } ${message.status === "unread" ? "font-medium" : ""}`}
                          onClick={() => handleMessageClick(message)}
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
                    <div className="text-center py-10">
                      <MessageCircle className="h-10 w-10 text-primary-300 mx-auto mb-2" />
                      <h3 className="text-sm font-medium text-primary-600">No messages found</h3>
                      <p className="text-xs text-primary-500">
                        {searchTerm ? "Try a different search term" : "Your inbox is empty"}
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="sent" className="pt-2">
                  {isLoadingSent ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
                    </div>
                  ) : filteredMessages && filteredMessages.length > 0 ? (
                    <div className="divide-y divide-primary-100">
                      {filteredMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`px-4 py-3 cursor-pointer hover:bg-primary-50 transition-colors ${
                            selectedMessage?.id === message.id ? "bg-primary-50" : ""
                          }`}
                          onClick={() => handleMessageClick(message)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center space-x-2">
                              <Send className="h-4 w-4 text-primary-400" />
                              <span className="text-sm font-medium truncate max-w-[150px]">
                                To: {getUserById(message.recipientId)?.fullName || `User #${message.recipientId}`}
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
                    <div className="text-center py-10">
                      <Send className="h-10 w-10 text-primary-300 mx-auto mb-2" />
                      <h3 className="text-sm font-medium text-primary-600">No sent messages</h3>
                      <p className="text-xs text-primary-500">
                        {searchTerm ? "Try a different search term" : "You haven't sent any messages yet"}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Message Detail */}
        <div className="md:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedMessage.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      {activeTab === "received" ? "From" : "To"}: {
                        activeTab === "received" 
                          ? getUserById(selectedMessage.senderId)?.fullName || `User #${selectedMessage.senderId}`
                          : getUserById(selectedMessage.recipientId)?.fullName || `User #${selectedMessage.recipientId}`
                      }
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(selectedMessage.createdAt)}</span>
                    </Badge>
                    
                    {activeTab === "received" && (
                      <Badge 
                        variant="outline" 
                        className={`${
                          selectedMessage.status === "unread" 
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            : selectedMessage.status === "read"
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : selectedMessage.status === "replied"
                            ? "bg-purple-50 text-purple-700 hover:bg-purple-100"
                            : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                        }`}
                      >
                        {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center space-x-2 mb-6">
                  <Avatar>
                    <AvatarImage 
                      src={
                        activeTab === "received" 
                          ? getUserById(selectedMessage.senderId)?.profileImage 
                          : getUserById(selectedMessage.recipientId)?.profileImage
                      } 
                    />
                    <AvatarFallback className="bg-primary-200 text-primary-700">
                      {
                        activeTab === "received" 
                          ? getUserInitials(getUserById(selectedMessage.senderId)?.fullName || "U")
                          : getUserInitials(getUserById(selectedMessage.recipientId)?.fullName || "U")
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-medium">
                      {
                        activeTab === "received" 
                          ? getUserById(selectedMessage.senderId)?.fullName || `User #${selectedMessage.senderId}`
                          : getUserById(selectedMessage.recipientId)?.fullName || `User #${selectedMessage.recipientId}`
                      }
                    </div>
                    <div className="text-primary-500 text-xs">
                      {
                        activeTab === "received" 
                          ? getUserById(selectedMessage.senderId)?.email
                          : getUserById(selectedMessage.recipientId)?.email
                      }
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-primary-100 pt-4 pb-2">
                  <div className="prose prose-sm max-w-none text-primary-700 whitespace-pre-line">
                    {selectedMessage.content}
                  </div>
                </div>
                
                {selectedMessage.propertyId && (
                  <div className="mt-4 border rounded-md p-3 bg-primary-50">
                    <div className="text-xs text-primary-500 mb-1">Related to property:</div>
                    <div className="text-sm font-medium text-primary-700">Property #{selectedMessage.propertyId}</div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div>
                  {activeTab === "received" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => archiveMessage(selectedMessage.id)}
                    >
                      <ArchiveIcon className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                  )}
                </div>
                {activeTab === "received" && selectedMessage.status !== "replied" && (
                  <Button 
                    className="bg-secondary-500 hover:bg-secondary-600"
                    size="sm"
                    onClick={() => setIsReplyDialogOpen(true)}
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-primary-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-primary-700 mb-2">No message selected</h3>
                <p className="text-primary-500">
                  Select a message from the list to view its details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* New Message Dialog */}
      <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Send a message to another user
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitNewMessage)} className="space-y-4">
              <FormField
                control={form.control}
                name="recipientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a recipient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allUsers?.filter(u => u.id !== user?.id).map((recipient) => (
                          <SelectItem key={recipient.id} value={recipient.id.toString()}>
                            {recipient.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Message subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your message here..."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewMessageOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-secondary-500 hover:bg-secondary-600"
                  disabled={sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send Message
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>
              Send a reply to {getUserById(selectedMessage?.senderId || 0)?.fullName || "the sender"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...replyForm}>
            <form onSubmit={replyForm.handleSubmit(onSubmitReply)} className="space-y-4">
              <FormField
                control={replyForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Message subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={replyForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your reply here..."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-secondary-500 hover:bg-secondary-600"
                  disabled={sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send Reply
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

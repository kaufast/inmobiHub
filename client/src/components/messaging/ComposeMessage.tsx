import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Minimize, Maximize, Loader2 } from "lucide-react";
import { ComposeMessageProps } from "@/lib/messaging/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Form schema for new message
const messageFormSchema = z.object({
  recipientId: z.coerce.number({
    required_error: "Please select a recipient",
  }),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  content: z.string().min(10, "Message must be at least 10 characters"),
});

type MessageFormValues = z.infer<typeof messageFormSchema>;

export function ComposeMessage({
  isOpen,
  onClose,
  onSend,
  recipients,
  replyToMessage,
  isLoading,
  propertyId,
}: ComposeMessageProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Desktop or mobile view
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Set up form with validation
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      recipientId: replyToMessage ? replyToMessage.senderId : undefined,
      subject: replyToMessage ? `Re: ${replyToMessage.subject}` : "",
      content: "",
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: MessageFormValues) => {
    await onSend(data.recipientId, data.subject, data.content, propertyId);
    form.reset();
  };
  
  // Group recipients by role if available
  const groupedRecipients = recipients?.reduce((acc, recipient) => {
    const role = recipient.role || 'other';
    if (!acc[role]) acc[role] = [];
    acc[role].push(recipient);
    return acc;
  }, {} as Record<string, typeof recipients>) || {};
  
  // For mobile, use Dialog component
  if (isMobileView) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="recipientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {recipients ? (
                          Object.entries(groupedRecipients).map(([role, users]) => (
                            <div key={role}>
                              <div className="px-2 py-1.5 text-xs font-medium text-primary-500 uppercase">
                                {role === 'agent' ? 'Agents' : 
                                  role === 'admin' ? 'Administrators' : 
                                  role === 'user' ? 'Users' : 'Other'}
                              </div>
                              {users?.map(recipient => (
                                <SelectItem 
                                  key={recipient.id} 
                                  value={recipient.id.toString()}
                                >
                                  {recipient.fullName || recipient.username}
                                </SelectItem>
                              ))}
                            </div>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            Loading recipients...
                          </SelectItem>
                        )}
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
                      <Input {...field} />
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
                      <Textarea rows={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
  
  // For desktop, use Gmail-style compose window
  return isOpen ? (
    <div 
      className={`fixed z-40 bg-white shadow-xl border border-primary-200 rounded-t-lg overflow-hidden transition-all ${
        isMinimized 
          ? 'bottom-0 right-4 w-80 h-14' 
          : isMaximized 
            ? 'bottom-0 right-0 w-full h-[calc(100vh-64px)]' 
            : 'bottom-0 right-4 w-500 h-[70vh] max-h-[600px]'
      }`}
    >
      {/* Compose header */}
      <div className="bg-primary-800 text-white p-3 flex justify-between items-center">
        <h3 className="font-medium">
          {isMinimized ? 'New Message (Minimized)' : 'New Message'}
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            className="text-white hover:text-primary-200 focus:outline-none"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize className="h-4 w-4" />
          </button>
          <button 
            className="text-white hover:text-primary-200 focus:outline-none"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            <Maximize className="h-4 w-4" />
          </button>
          <button 
            className="text-white hover:text-primary-200 focus:outline-none"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Compose form */}
      {!isMinimized && (
        <div className="p-4 flex flex-col h-[calc(100%-48px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 h-full flex flex-col">
              <FormField
                control={form.control}
                name="recipientId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <span className="w-16 text-sm font-medium">To:</span>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value?.toString()}
                        >
                          <SelectTrigger className="border-0 border-b border-dashed focus:ring-0">
                            <SelectValue placeholder="Select recipient" />
                          </SelectTrigger>
                          <SelectContent>
                            {recipients ? (
                              Object.entries(groupedRecipients).map(([role, users]) => (
                                <div key={role}>
                                  <div className="px-2 py-1.5 text-xs font-medium text-primary-500 uppercase">
                                    {role === 'agent' ? 'Agents' : 
                                      role === 'admin' ? 'Administrators' : 
                                      role === 'user' ? 'Users' : 'Other'}
                                  </div>
                                  {users?.map(recipient => (
                                    <SelectItem 
                                      key={recipient.id} 
                                      value={recipient.id.toString()}
                                    >
                                      {recipient.fullName || recipient.username}
                                    </SelectItem>
                                  ))}
                                </div>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                Loading recipients...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <span className="w-16 text-sm font-medium">Subject:</span>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="border-0 border-b border-dashed focus:ring-0" 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="border-0 resize-none h-full" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between items-center">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  ) : null;
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import { ComposeMessageProps } from "@/lib/messaging/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Form schema for new message
const messageFormSchema = z.object({
  recipientId: z.coerce.number({
    required_error: "Please select a recipient",
  }),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  content: z.string().min(10, "Message must be at least 10 characters"),
});

type MessageFormValues = z.infer<typeof messageFormSchema>;

export function MobileComposeMessage({
  isOpen,
  onClose,
  onSend,
  recipients,
  replyToMessage,
  isLoading,
  propertyId,
}: ComposeMessageProps) {
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
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="sticky top-0 z-10 bg-primary-800 text-white p-4 flex items-center">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white mr-2 hover:bg-primary-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <h3 className="text-lg font-medium flex-1">New Message</h3>
      </div>
      
      <div className="p-4 flex-grow overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 h-full flex flex-col">
            <FormField
              control={form.control}
              name="recipientId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value?.toString()}
                    >
                      <SelectTrigger className="w-full">
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Subject" />
                  </FormControl>
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
                      placeholder="Your message"
                      className="flex-grow min-h-[200px]" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
      
      <div className="sticky bottom-0 p-4 border-t border-primary-100 bg-white">
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
          className="w-full py-6"
          size="lg"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Message
        </Button>
      </div>
    </div>
  );
}
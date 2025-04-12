import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageRecipient } from '@/lib/messaging/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

// Form validation schema
const messageFormSchema = z.object({
  recipientId: z.string().min(1, "Please select a recipient"),
  subject: z.string().min(1, "Subject is required").max(100, "Subject is too long"),
  content: z.string().min(1, "Message content is required"),
  propertyId: z.string().optional(),
});

type MessageFormValues = z.infer<typeof messageFormSchema>;

interface MobileComposeMessageProps {
  onSend: (recipientId: number, subject: string, content: string, propertyId?: number) => Promise<boolean>;
  onCancel: () => void;
  recipients: MessageRecipient[];
  isLoading?: boolean;
  defaultRecipientId?: number;
  defaultSubject?: string;
  defaultContent?: string;
  properties?: Array<{ id: number; title: string }>;
}

export function MobileComposeMessage({
  onSend,
  onCancel,
  recipients,
  isLoading = false,
  defaultRecipientId,
  defaultSubject = '',
  defaultContent = '',
  properties = []
}: MobileComposeMessageProps) {
  // Group recipients by role for better organization
  const groupedRecipients = recipients.reduce((acc: Record<string, MessageRecipient[]>, recipient) => {
    const role = recipient.role;
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(recipient);
    return acc;
  }, {});
  
  // Role display names for grouping
  const roleDisplayNames: Record<string, string> = {
    'user': 'Users',
    'agent': 'Agents',
    'admin': 'Administrators',
  };
  
  // Initialize form with default values
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      recipientId: defaultRecipientId ? String(defaultRecipientId) : '',
      subject: defaultSubject,
      content: defaultContent,
      propertyId: '',
    },
  });

  const onSubmit = async (data: MessageFormValues) => {
    const success = await onSend(
      parseInt(data.recipientId),
      data.subject,
      data.content,
      data.propertyId ? parseInt(data.propertyId) : undefined
    );
    if (success) {
      onCancel();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Mobile header */}
      <div className="flex items-center p-3 border-b">
        <Button variant="ghost" size="icon" onClick={onCancel} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-base font-semibold flex-1">New Message</h2>
        <Button 
          size="sm" 
          disabled={isLoading || !form.formState.isValid}
          onClick={form.handleSubmit(onSubmit)}
        >
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
      
      {/* Message form */}
      <div className="flex-1 overflow-y-auto p-4">
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="recipientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a recipient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(groupedRecipients).map(([role, roleRecipients]) => (
                        <div key={role}>
                          <div className="px-2 py-1.5 text-sm font-semibold bg-muted">
                            {roleDisplayNames[role] || role}
                          </div>
                          {roleRecipients.map(recipient => (
                            <SelectItem key={recipient.id} value={String(recipient.id)}>
                              {recipient.name} ({recipient.email})
                            </SelectItem>
                          ))}
                        </div>
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
                    <Input placeholder="Enter subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {properties.length > 0 && (
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Property (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {properties.map(property => (
                          <SelectItem key={property.id} value={String(property.id)}>
                            {property.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your message here..." 
                      className="min-h-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
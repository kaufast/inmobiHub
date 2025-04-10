import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Upload, Info } from 'lucide-react';
import { userAvatar } from '@/lib/constants'; // Replace with actual user avatar path

// Form schema
const verificationFormSchema = z.object({
  idVerificationType: z.enum(['passport', 'driver_license', 'national_id']),
  idVerificationDocument: z.string().min(1, 'Document image is required'),
  notes: z.string().optional(),
});

type VerificationFormValues = z.infer<typeof verificationFormSchema>;

interface VerificationRequestFormProps {
  onSuccess?: () => void;
}

export const VerificationRequestForm: React.FC<VerificationRequestFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [document, setDocument] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      idVerificationType: 'passport',
      idVerificationDocument: '',
      notes: '',
    }
  });

  const verificationMutation = useMutation({
    mutationFn: async (data: VerificationFormValues) => {
      const res = await apiRequest('POST', '/api/users/verify/id', data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Verification request failed');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Verification Request Submitted',
        description: 'Your identity verification request has been submitted for review.',
        variant: 'default',
      });
      
      // Invalidate user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification Request Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'The document must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64 = base64String.split(',')[1]; // Remove data:image/*;base64, prefix
      setDocument(base64);
      form.setValue('idVerificationDocument', base64);
      setIsUploading(false);
    };
    reader.onerror = () => {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive',
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: VerificationFormValues) => {
    verificationMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
        <CardDescription>
          Submit your documents to verify your identity and get a blue checkmark on your profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-5 w-5 text-blue-500" />
          <AlertTitle className="text-blue-700">Why verify your identity?</AlertTitle>
          <AlertDescription className="text-blue-600">
            Verified users enjoy higher trust from buyers/renters, priority listing placement, and access to premium partnership opportunities.
          </AlertDescription>
        </Alert>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="idVerificationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="driver_license">Driver's License</SelectItem>
                        <SelectItem value="national_id">National ID Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Choose the type of identification document you'll provide
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="idVerificationDocument"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Upload</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-4">
                      <Input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={handleDocumentUpload}
                        className="cursor-pointer"
                      />
                      
                      {/* Preview area */}
                      {document && (
                        <div className="border rounded-md p-2 mt-2">
                          <p className="text-sm text-gray-500 mb-2">Document preview:</p>
                          <img 
                            src={`data:image/jpeg;base64,${document}`} 
                            alt="Document preview" 
                            className="max-h-40 object-contain mx-auto border rounded" 
                          />
                        </div>
                      )}
                      
                      {/* Hidden input for the actual base64 data */}
                      <input 
                        type="hidden" 
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload a clear image of your document (max 5MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional information you'd like to provide..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Add any details that might help us verify your identity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {verificationMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {verificationMutation.error.message}
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isUploading || verificationMutation.isPending || !document}>
              {verificationMutation.isPending ? 'Submitting...' : 'Submit Verification Request'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-gray-500">
          <p>Your documents are securely stored and only accessed by our verification team.</p>
          <p>Verification typically takes 1-2 business days.</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default VerificationRequestForm;
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/constants";

const verificationSchema = z.object({
  idVerificationType: z.enum(["passport", "driver_license", "national_id"], {
    required_error: "Please select an ID type",
  }),
  idVerificationDocument: z.string().min(1, "Please upload a document"),
  notes: z.string().optional(),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

const VerificationRequestForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  
  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      idVerificationType: "passport",
      idVerificationDocument: "",
      notes: "",
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Maximum file size of 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setDocumentPreview(result);
      form.setValue("idVerificationDocument", result);
    };
    reader.readAsDataURL(file);
  };
  
  const onSubmit = async (data: VerificationFormValues) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      await apiRequest("POST", API_ENDPOINTS.VERIFICATION, {
        userId: user.id,
        idVerificationType: data.idVerificationType,
        idVerificationDocument: data.idVerificationDocument,
        notes: data.notes,
      });
      
      toast({
        title: "Verification request submitted",
        description: "Your verification request has been submitted and will be reviewed",
      });
      
      // Reset form
      form.reset();
      setDocumentPreview(null);
    } catch (error: any) {
      toast({
        title: "Error submitting verification",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Identity Verification</CardTitle>
          <CardDescription>You must be logged in to submit a verification request</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
        <CardDescription>Submit your identification document to verify your identity</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="idVerificationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an ID type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driver_license">Driver's License</SelectItem>
                      <SelectItem value="national_id">National ID</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Please select the type of identification document you will provide
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Upload Document</FormLabel>
              <div className="flex flex-col gap-3">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,application/pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <FormDescription>
                  Upload a clear image or scan of your ID document (JPG, PNG, or PDF format, max 5MB)
                </FormDescription>
                
                {documentPreview && documentPreview.startsWith('data:image') && (
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <img 
                      src={documentPreview} 
                      alt="Document preview" 
                      className="max-h-48 mx-auto object-contain"
                    />
                  </div>
                )}
                
                {documentPreview && documentPreview.startsWith('data:application/pdf') && (
                  <div className="mt-2 p-4 border rounded-md bg-gray-100">
                    <p className="text-sm">PDF document selected</p>
                  </div>
                )}
              </div>
            </FormItem>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional information about your verification request" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Add any information that may help us verify your identity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Verification Request"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p className="text-sm text-muted-foreground">
          Your verification documents are securely stored and only accessed by authorized personnel.
          Verification typically takes 1-2 business days to process.
        </p>
      </CardFooter>
    </Card>
  );
};

export default VerificationRequestForm;
import React, { useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AUTH, API_ENDPOINTS, VALIDATION } from "@/lib/constants";
import { Upload, X, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define form schema for ID verification
const verificationSchema = z.object({
  idVerificationType: z.enum([
    AUTH.ID_VERIFICATION_TYPES.PASSPORT,
    AUTH.ID_VERIFICATION_TYPES.DRIVERS_LICENSE,
    AUTH.ID_VERIFICATION_TYPES.NATIONAL_ID,
  ]),
  idVerificationDocument: z
    .instanceof(File)
    .refine((file) => file.size <= VALIDATION.MAX_FILE_SIZE, {
      message: `File size must be less than ${VALIDATION.MAX_FILE_SIZE / (1024 * 1024)}MB`,
    })
    .refine((file) => VALIDATION.ALLOWED_DOCUMENT_TYPES.includes(file.type), {
      message: "File must be a PDF, JPEG, or PNG",
    }),
  notes: z.string().optional(),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

const VerificationRequestForm: React.FC = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      idVerificationType: AUTH.ID_VERIFICATION_TYPES.PASSPORT,
      notes: "",
    },
  });

  const verificationMutation = useMutation({
    mutationFn: async (data: VerificationFormValues) => {
      // Convert the file to base64 for API submission
      const reader = new FileReader();
      return new Promise<string>((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64Document = reader.result as string;
            const documentData = base64Document.split(",")[1]; // Remove the data:image/jpeg;base64, part
            
            const response = await apiRequest("POST", API_ENDPOINTS.VERIFICATION, {
              idVerificationType: data.idVerificationType,
              idVerificationDocument: documentData,
              notes: data.notes,
            });
            
            const result = await response.json();
            resolve(result.message);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };
        reader.readAsDataURL(data.idVerificationDocument);
      });
    },
    onSuccess: (message) => {
      toast({
        title: "Verification request submitted",
        description: message,
      });
      // Clear the form
      form.reset();
      setPreviewUrl(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting verification",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VerificationFormValues) => {
    verificationMutation.mutate(data);
  };

  // Handle file selection for preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("idVerificationDocument", file, { shouldValidate: true });
      
      // Create a preview URL for images
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        // For PDFs, show a placeholder
        setPreviewUrl(null);
      }
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      form.setValue("idVerificationDocument", file, { shouldValidate: true });
      
      // Create a preview URL for images
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        // For PDFs, show a placeholder
        setPreviewUrl(null);
      }
    }
  };

  const clearFile = () => {
    form.setValue("idVerificationDocument", undefined, { shouldValidate: true });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="idVerificationType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Document Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={AUTH.ID_VERIFICATION_TYPES.PASSPORT} id="passport" />
                    <Label htmlFor="passport">Passport</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={AUTH.ID_VERIFICATION_TYPES.DRIVERS_LICENSE} id="drivers_license" />
                    <Label htmlFor="drivers_license">Driver's License</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={AUTH.ID_VERIFICATION_TYPES.NATIONAL_ID} id="national_id" />
                    <Label htmlFor="national_id">National ID</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="idVerificationDocument"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Upload Document</FormLabel>
              <FormControl>
                <div
                  className={`border-2 border-dashed rounded-md p-6 ${
                    previewUrl ? 'border-primary' : 'border-border'
                  } hover:border-primary transition-colors cursor-pointer`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept={VALIDATION.ALLOWED_DOCUMENT_TYPES.join(",")}
                    onChange={handleFileChange}
                    className="hidden"
                    {...fieldProps}
                  />
                  
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="Document preview" className="max-h-60 mx-auto" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                        className="absolute top-2 right-2 bg-background/80 rounded-full p-1"
                      >
                        <X className="h-5 w-5 text-destructive" />
                      </button>
                      <div className="mt-2 text-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 inline mr-1 text-green-500" />
                        Document uploaded successfully
                      </div>
                    </div>
                  ) : value instanceof File ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                      </div>
                      <p className="font-medium">{value.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(value.size / 1024 / 1024).toFixed(2)}MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                        className="mt-2 text-xs text-destructive hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="font-medium">Drag and drop your document here</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse (PDF, JPG, PNG)
                      </p>
                      <p className="text-xs text-muted-foreground mt-4">
                        Maximum file size: {VALIDATION.MAX_FILE_SIZE / (1024 * 1024)}MB
                      </p>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional information that might help with verification..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 text-sm text-amber-800">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Please note:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Your document must be clearly visible and not expired</li>
                  <li>All text and your photo must be clearly visible</li>
                  <li>Verification typically takes 1-2 business days</li>
                  <li>Your information is securely stored and handled in accordance with our privacy policy</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={verificationMutation.isPending}
            className="w-full sm:w-auto"
          >
            {verificationMutation.isPending ? "Submitting..." : "Submit Verification Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default VerificationRequestForm;
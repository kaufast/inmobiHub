import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileType, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BulkUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const { toast } = useToast();
  
  const handleUpload = () => {
    setIsUploading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUploading(false);
      setUploadComplete(true);
      toast({
        title: "Upload Complete",
        description: "Your properties have been successfully uploaded.",
        variant: "default",
      });
    }, 2000);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-800">Bulk Property Upload</h1>
      </div>
      
      <Card className="shadow-md border-indigo-100">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
          <CardTitle className="text-lg text-indigo-700">Upload Multiple Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Upload multiple properties at once using our CSV template.</p>
          
          <div className="border-2 border-dashed border-indigo-200 rounded-lg p-8 text-center mb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <FileType className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-indigo-700 mb-2">Drop your CSV file here</h3>
            <p className="text-gray-500 mb-4">or click to browse your files</p>
            <Button
              variant="default"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={isUploading || uploadComplete}
              onClick={handleUpload}
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : uploadComplete ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Upload Complete
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Select File
                </>
              )}
            </Button>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">Important Notes:</h4>
            <ul className="list-disc pl-5 text-amber-700 space-y-1">
              <li>Make sure to use our template format</li>
              <li>Images should be provided as pipe-separated URLs</li>
              <li>Maximum of 50 properties per upload</li>
              <li>All properties will be subject to approval</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
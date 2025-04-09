import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Redirect } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, HelpCircle, Lock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';

interface UploadResults {
  successful: number;
  failed: number;
  errors: Array<{ property: string; error: string }>;
  created: Array<{ id: number; title: string }>;
}

export default function BulkUploadPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const csvInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<string>('csv');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UploadResults | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<any[] | null>(null);

  // If not logged in, redirect to auth page
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Check if user has premium subscription
  const isPremium = user.subscriptionTier === 'premium' || user.subscriptionTier === 'enterprise';
  
  if (!isPremium) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">{t('premiumFeature')}</CardTitle>
            <CardDescription>{t('premiumFeatureDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <Lock className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('bulkUploadPremiumRequired')}</h3>
                <p className="text-muted-foreground mb-6">
                  {t('bulkUploadPremiumRequiredDescription')}
                </p>
                <Button asChild>
                  <a href="/subscription">{t('upgradeToPremium')}</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handler for CSV upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setResults(null);
      setJsonData(null);
    }
  };

  // Function to parse CSV file
  const parseCSV = (csvText: string): any[] => {
    // Split by line breaks
    const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
    
    // Get headers
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Process data rows
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim());
      if (row.length === headers.length) {
        const entry: Record<string, any> = {};
        headers.forEach((header, index) => {
          // Try to convert numbers
          if (!isNaN(Number(row[index])) && row[index] !== '') {
            entry[header] = Number(row[index]);
          } else if (row[index].toLowerCase() === 'true') {
            entry[header] = true;
          } else if (row[index].toLowerCase() === 'false') {
            entry[header] = false;
          } else {
            entry[header] = row[index];
          }
        });
        result.push(entry);
      }
    }
    return result;
  };

  // Handler for parsing the file
  const handleParseFile = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setProgress(10);
    
    try {
      const fileReader = new FileReader();
      
      fileReader.onload = (event) => {
        if (event.target && event.target.result) {
          setProgress(40);
          const fileContents = event.target.result as string;
          
          // Parse based on file type
          let parsed;
          if (activeTab === 'csv') {
            parsed = parseCSV(fileContents);
          } else {
            // For Excel, we'll need to parse as CSV for now
            // In a real implementation, you'd use a library like xlsx
            parsed = parseCSV(fileContents);
          }
          
          setJsonData(parsed);
          setProgress(70);
          
          // Validate the data
          const validated = validatePropertyData(parsed);
          setProgress(100);
          
          setTimeout(() => {
            setIsProcessing(false);
            setProgress(0);
          }, 500);
        }
      };
      
      fileReader.readAsText(selectedFile);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        title: t('error'),
        description: t('errorParsingFile'),
        variant: 'destructive'
      });
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Validate property data
  const validatePropertyData = (data: any[]): any[] => {
    // Here you would add validation logic
    // For now, we'll just return the data
    return data;
  };

  // Handler for importing the data to the database
  const handleImportData = async () => {
    if (!jsonData || jsonData.length === 0) return;
    
    setIsProcessing(true);
    setProgress(10);
    
    try {
      // Format data for API
      const propertyData = jsonData.map(item => {
        // Transform data if needed
        return {
          title: item.title,
          description: item.description,
          price: Number(item.price),
          address: item.address,
          city: item.city,
          state: item.state,
          zipCode: item.zipCode,
          country: item.country,
          latitude: Number(item.latitude) || 0,
          longitude: Number(item.longitude) || 0,
          bedrooms: Number(item.bedrooms) || 0,
          bathrooms: Number(item.bathrooms) || 0,
          squareFeet: Number(item.squareFeet) || 0,
          lotSize: Number(item.lotSize) || 0,
          yearBuilt: Number(item.yearBuilt) || 0,
          propertyType: item.propertyType || 'house',
          isPremium: item.isPremium === true || item.isPremium === 'true',
          isActive: item.isActive === true || item.isActive === 'true' || true,
          images: item.images ? item.images.split('|').map((url: string) => url.trim()) : []
        };
      });
      
      setProgress(50);
      
      // Call the API
      const response = await apiRequest('POST', '/api/properties/bulk-upload', {
        properties: propertyData
      });
      
      setProgress(90);
      
      const result = await response.json();
      setResults(result);
      
      setProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 500);
      
      toast({
        title: t('uploadComplete'),
        description: t('propertiesUploaded', { count: result.successful }),
        variant: 'default'
      });
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: t('error'),
        description: t('errorImportingData'),
        variant: 'destructive'
      });
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{t('bulkUpload')}</CardTitle>
          <CardDescription>{t('bulkUploadDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="csv">CSV</TabsTrigger>
              <TabsTrigger value="excel">Excel</TabsTrigger>
            </TabsList>
            
            <TabsContent value="csv" className="space-y-4">
              <div className="border rounded-lg p-4 border-dashed border-border bg-muted/40">
                <div className="flex flex-col items-center justify-center p-6 space-y-3">
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="font-medium">{t('dragAndDrop')}</h3>
                    <p className="text-sm text-muted-foreground">{t('csvUploadInfo')}</p>
                  </div>
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => csvInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t('selectCSVFile')}
                  </Button>
                </div>
              </div>
              
              {selectedFile && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium">{t('selectedFile')}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{selectedFile.name}</p>
                  
                  <div className="flex space-x-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleParseFile}
                      disabled={isProcessing}
                    >
                      {t('parseFile')}
                    </Button>
                    
                    <Button 
                      size="sm" 
                      onClick={handleImportData} 
                      disabled={isProcessing || !jsonData}
                    >
                      {t('importData')}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="excel" className="space-y-4">
              <div className="border rounded-lg p-4 border-dashed border-border bg-muted/40">
                <div className="flex flex-col items-center justify-center p-6 space-y-3">
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="font-medium">{t('dragAndDrop')}</h3>
                    <p className="text-sm text-muted-foreground">{t('excelUploadInfo')}</p>
                  </div>
                  <input
                    ref={excelInputRef}
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => excelInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t('selectExcelFile')}
                  </Button>
                </div>
              </div>
              
              {selectedFile && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium">{t('selectedFile')}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{selectedFile.name}</p>
                  
                  <div className="flex space-x-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleParseFile}
                      disabled={isProcessing}
                    >
                      {t('parseFile')}
                    </Button>
                    
                    <Button 
                      size="sm" 
                      onClick={handleImportData} 
                      disabled={isProcessing || !jsonData}
                    >
                      {t('importData')}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {isProcessing && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('processing')}</p>
              <Progress value={progress} />
            </div>
          )}
          
          {jsonData && (
            <div className="mt-6 space-y-2">
              <h3 className="font-medium">{t('preview')}</h3>
              <div className="max-h-64 overflow-y-auto">
                <pre className="p-4 bg-muted text-xs rounded-lg whitespace-pre-wrap">
                  {JSON.stringify(jsonData, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {results && (
            <div className="mt-6 space-y-4">
              <h3 className="font-medium">{t('importResults')}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                    <h4 className="font-medium">{t('successfulUploads')}</h4>
                  </div>
                  <p className="text-2xl font-semibold">{results.successful}</p>
                </div>
                
                <div className="p-4 bg-red-500/10 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                    <h4 className="font-medium">{t('failedUploads')}</h4>
                  </div>
                  <p className="text-2xl font-semibold">{results.failed}</p>
                </div>
              </div>
              
              {results.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t('errors')}</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {results.errors.map((error, idx) => (
                        <li key={idx} className="text-sm">
                          <span className="font-medium">{error.property}:</span> {error.error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {results.created.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">{t('createdProperties')}</h4>
                  <ul className="space-y-1">
                    {results.created.map((property) => (
                      <li key={property.id} className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        <a 
                          href={`/properties/${property.id}`} 
                          className="text-sm hover:underline"
                        >
                          {property.title} (ID: {property.id})
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <Separator className="my-6" />
          
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <HelpCircle className="h-5 w-5 mr-2 text-muted-foreground" />
              <h4 className="font-medium">{t('uploadHelp')}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{t('csvHelpText')}</p>
            <div className="mt-3">
              <h5 className="text-sm font-medium mb-1">{t('requiredFields')}</h5>
              <code className="text-xs bg-muted p-1 rounded">
                title, price, address, city, state, propertyType
              </code>
            </div>
            <div className="mt-3">
              <Button variant="link" className="text-xs p-0 h-auto" asChild>
                <a href="/assets/property-template.csv" download>
                  {t('downloadTemplate')}
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <a href="/dashboard">{t('backToDashboard')}</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
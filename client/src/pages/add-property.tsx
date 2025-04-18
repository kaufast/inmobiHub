import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation, useSearch } from 'wouter';
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Home, 
  BedDouble, 
  Bath, 
  SquareStack,
  Calendar,
  Tag, 
  ImagePlus,
  Plus,
  Trash,
  Upload,
  Info,
  Check,
  Save,
  FileText,
  AlertCircle
} from 'lucide-react';
import { 
  getTitleSuggestions, 
  getDescriptionSuggestions, 
  countries, 
  getAddressSuggestions,
  getCitySuggestions,
  getStateSuggestions
} from '@/lib/property-suggestions';
import { SuggestionInput } from '@/components/ui/suggestion-input';
import { AddressSuggestionInput } from '@/components/ui/address-suggestion-input';
import { ImageUploader, UploadedImage } from '@/components/ui/upload/image-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Link } from 'wouter';

// Create a schema for property data based on the DB schema
const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Price must be a valid number greater than 0',
  }),
  bedrooms: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Bedrooms must be a valid number',
  }),
  bathrooms: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Bathrooms must be a valid number',
  }),
  squareFeet: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Area must be a valid number greater than 0',
  }),
  propertyType: z.enum(['house', 'condo', 'apartment', 'townhouse', 'land']),
  listingType: z.string().min(1, 'Listing type is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State/Province must be at least 2 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  zipCode: z.string().min(2, 'Postal code must be at least 2 characters'),
  yearBuilt: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 1900 && Number(val) <= new Date().getFullYear(), {
    message: 'Year built must be a valid year',
  }),
  // These are needed by the schema but we'll provide default values
  latitude: z.number().default(0),
  longitude: z.number().default(0),
  images: z.array(z.string()).default([]),
  // Optional fields
  isPremium: z.boolean().default(false),
  features: z.array(z.string()).optional(),
  neighborhoodId: z.number().optional(),
  lotSize: z.number().optional(),
  garageSpaces: z.number().optional(),
  locationScore: z.number().optional(),
  // Features transformed to JSON
  hasParking: z.boolean().optional(),
  hasAirConditioning: z.boolean().optional(),
  hasHeating: z.boolean().optional(),
  hasInternet: z.boolean().optional(),
  hasFurnished: z.boolean().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function AddPropertyPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const draftId = new URLSearchParams(search).get('draft');
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [draftName, setDraftName] = useState<string>('');
  const [savingDraft, setSavingDraft] = useState(false);
  
  // Redirect to auth page if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  // Fetch draft data if editing a draft
  const { data: draftData } = useQuery({
    queryKey: ['/api/property-drafts', draftId],
    queryFn: async () => {
      if (!draftId) return null;
      const res = await fetch(`/api/property-drafts/${draftId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!draftId && !!user,
  });
  
  // Fetch neighborhoods for dropdown
  const { data: neighborhoods } = useQuery({
    queryKey: ['/api/neighborhoods'],
    queryFn: async () => {
      const res = await fetch('/api/neighborhoods');
      if (!res.ok) return [];
      return res.json();
    }
  });
  
  // Initialize the form
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      bedrooms: '',
      bathrooms: '',
      squareFeet: '',
      propertyType: 'house',
      listingType: 'sale',
      address: '',
      city: '',
      state: '',
      country: 'USA',
      zipCode: '',
      yearBuilt: '',
      isPremium: false,
      hasParking: false,
      hasAirConditioning: false,
      hasHeating: false,
      hasInternet: false,
      hasFurnished: false,
      latitude: 0,
      longitude: 0,
      images: [],
      features: [],
    },
  });
  
  // Load draft data when available
  useEffect(() => {
    if (draftData && draftData.formData) {
      setDraftName(draftData.name);
      
      // Fill the form with draft data
      const formData = draftData.formData;
      Object.keys(formData).forEach((key) => {
        form.setValue(key as any, formData[key]);
      });
      
      toast({
        title: "Draft Loaded",
        description: `"${draftData.name}" has been loaded for editing.`,
      });
    }
  }, [draftData, form, toast]);
  
  // Save as draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async ({ name, formData }: { name: string, formData: any }) => {
      // If editing an existing draft
      if (draftId) {
        const res = await apiRequest('PATCH', `/api/property-drafts/${draftId}`, {
          name,
          formData
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to update draft');
        }
        return res.json();
      } 
      // Creating a new draft
      else {
        const res = await apiRequest('POST', '/api/property-drafts', {
          name,
          formData
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to save draft');
        }
        return res.json();
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/property-drafts'] });
      toast({
        title: 'Draft saved',
        description: 'Your property has been saved as a draft.',
      });
      setSavingDraft(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error saving draft',
        description: error.message,
        variant: 'destructive',
      });
      setSavingDraft(false);
    }
  });
  
  // Function to handle saving the current form state as a draft
  const handleSaveAsDraft = async () => {
    const formData = form.getValues();
    
    // Get a name for the draft if it doesn't exist
    if (!draftName) {
      const defaultName = formData.title || 'New Property Draft';
      setDraftName(defaultName);
    }
    
    try {
      setSavingDraft(true);
      await saveDraftMutation.mutateAsync({ 
        name: draftName || 'New Property Draft', 
        formData 
      });
    } catch (err) {
      console.error('Error saving draft:', err);
      setSavingDraft(false);
    }
  };
  
  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (formData: PropertyFormData & { images: string[] }) => {
      const res = await apiRequest('POST', '/api/properties', formData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create property');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: 'Property created',
        description: 'Your property has been successfully added.',
      });
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating property',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // This section previously contained the image handling functions
  // (handleImageSelect, removeImage, uploadImages)
  // These have been replaced by the ImageUploader component
  
  // Handle form submission
  const onSubmit = async (data: PropertyFormData) => {
    try {
      // Process uploaded images
      const propertyImageUrls = uploadedImages.map(image => image.urls.original);
      
      // Convert string values to numbers for the API
      const preparedData = {
        ...data,
        price: Number(data.price),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        squareFeet: Number(data.squareFeet),
        yearBuilt: Number(data.yearBuilt),
        images: propertyImageUrls,
        // Add features based on checkboxes
        features: [
          ...(data.hasParking ? ['parking'] : []),
          ...(data.hasAirConditioning ? ['air-conditioning'] : []),
          ...(data.hasHeating ? ['heating'] : []),
          ...(data.hasInternet ? ['internet'] : []),
          ...(data.hasFurnished ? ['furnished'] : []),
        ],
        // Add the current user as the owner
        ownerId: user?.id,
      };
      
      await createPropertyMutation.mutateAsync(preparedData as any);
    } catch (err) {
      console.error('Error adding property:', err);
    }
  };
  
  // If user is not loaded yet or not authenticated, show loading state
  if (!user) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">Add New Property</h1>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="basic">Basic Information</TabsTrigger>
                    <TabsTrigger value="details">Property Details</TabsTrigger>
                    <TabsTrigger value="media">Images & Media</TabsTrigger>
                  </TabsList>
                  
                  {/* Basic Information Tab */}
                  <TabsContent value="basic" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Title</FormLabel>
                            <FormControl>
                              <SuggestionInput 
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="e.g. Modern Apartment in Downtown" 
                                suggestions={getTitleSuggestions(form.getValues().propertyType)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <SuggestionInput 
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Describe your property..." 
                                suggestions={getDescriptionSuggestions(form.getValues().propertyType)}
                                isTextarea={true}
                                rows={5}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g. 250000" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="listingType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Listing Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select listing type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="sale">For Sale</SelectItem>
                                  <SelectItem value="rent">For Rent</SelectItem>
                                  <SelectItem value="auction">Auction</SelectItem>
                                  <SelectItem value="shortTerm">Short-Term Rental</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="propertyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="apartment">Apartment</SelectItem>
                                <SelectItem value="house">House</SelectItem>
                                <SelectItem value="condo">Condo</SelectItem>
                                <SelectItem value="townhouse">Townhouse</SelectItem>
                                <SelectItem value="land">Land</SelectItem>
                                <SelectItem value="commercial">Commercial</SelectItem>
                                <SelectItem value="industrial">Industrial</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="bedrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bedrooms</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g. 3" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="bathrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bathrooms</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g. 2" 
                                  step="0.5"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="squareFeet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Area (sq ft)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g. 1200" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab('details')}
                      >
                        Continue to Property Details
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Property Details Tab */}
                  <TabsContent value="details" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-3">
                        <FormLabel>Address Information</FormLabel>
                        <div className="grid grid-cols-1 gap-3">
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <AddressSuggestionInput 
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Street Address" 
                                    suggestions={getAddressSuggestions(form.getValues().country)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <SuggestionInput 
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="City" 
                                      suggestions={getCitySuggestions(form.getValues().country)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <SuggestionInput 
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="State/Province" 
                                      suggestions={getStateSuggestions(form.getValues().country)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name="country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select Country" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {countries.map((country) => (
                                          <SelectItem key={country.value} value={country.value}>
                                            {country.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="zipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input 
                                      placeholder="Postal/Zip Code" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="yearBuilt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year Built</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g. 2005" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Neighborhood field has been removed as requested */}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <FormLabel>Property Features</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="hasParking"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="cursor-pointer">Parking</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="hasAirConditioning"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="cursor-pointer">Air Conditioning</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="hasHeating"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="cursor-pointer">Heating</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="hasInternet"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="cursor-pointer">Internet</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="hasFurnished"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="cursor-pointer">Furnished</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <FormLabel>Listing Options</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="isPremium"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-2">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1">
                                  <FormLabel className="cursor-pointer flex items-center">
                                    Premium Listing 
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="w-80">
                                            Premium listings get highlighted in search results, 
                                            receive priority placement, and include advanced analytics.
                                            Only available for Premium and Enterprise subscribers.
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </FormLabel>
                                  <FormDescription className="text-xs">
                                    Boost visibility with premium placement
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          {/* Note: Featured properties are managed by admin users */}
                          <div className="flex items-start space-x-2 opacity-50">
                            <Checkbox disabled />
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <span className="cursor-not-allowed">Featured Property</span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="w-80">
                                        Featured properties are managed by administrators.
                                        Properties can be featured on approval by the platform team.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Display on homepage and featured sections
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setActiveTab('basic')}
                      >
                        Back to Basic Information
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab('media')}
                      >
                        Continue to Images & Media
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Images & Media Tab */}
                  <TabsContent value="media" className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Property Images</Label>
                        <div className="text-sm text-muted-foreground">
                          Upload up to 10 high-quality images of your property. The first image will be used as the main image.
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <ImageUploader 
                          onChange={setUploadedImages} 
                          value={uploadedImages}
                          maxImages={10}
                          showPreview={true}
                          previewSize="md"
                          allowMultiple={true}
                          onError={(error) => {
                            toast({
                              title: "Image Upload Error",
                              description: error.message,
                              variant: "destructive",
                            });
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Draft saving section */}
                    <div className="border border-border rounded-md p-4 bg-muted/30">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-primary" />
                          <h3 className="font-medium">Save Your Progress</h3>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Not ready to submit? Save your progress and continue later.
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Input
                            placeholder="Draft name (e.g. Beach House Draft)"
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            className="bg-primary/10 border-primary/20"
                            onClick={handleSaveAsDraft}
                            disabled={savingDraft}
                          >
                            {savingDraft ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save as Draft
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setActiveTab('details')}
                      >
                        Back to Property Details
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createPropertyMutation.isPending || isUploading}
                      >
                        {(createPropertyMutation.isPending || isUploading) ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving Property...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Create Property
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
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
  Check
} from 'lucide-react';
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Redirect to auth page if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
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
  
  // Handle file selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      
      // Limit to 10 images total
      if (images.length + newFiles.length > 10) {
        toast({
          title: 'Too many images',
          description: 'You can upload a maximum of 10 images per property.',
          variant: 'destructive',
        });
        return;
      }
      
      // Add new files and create object URLs
      setImages(prev => [...prev, ...newFiles]);
      
      // Generate preview URLs
      const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newImageUrls]);
    }
  };
  
  // Remove image
  const removeImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imageUrls[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  // Mock function to upload images (in a real app, this would upload to your server/cloud storage)
  const uploadImages = async () => {
    // In a real app, you would upload the images to a cloud storage service
    // For now, we'll use the Replit asset paths which are already loaded in memory
    setIsUploading(true);
    
    try {
      // In a real implementation, we would use FormData to upload images to a server
      // For demonstration, we're using the image URLs already in memory
      console.log(`Processing ${images.length} images for upload`);
      
      // For each image, convert to base64 for demonstration
      const uploadedUrls = await Promise.all(
        images.map(async (image, index) => {
          // Convert file to base64 string (for demo/dev only)
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              // In a real app, this would be the URL returned from your image upload service
              // For now, we'll just use the URLs created by the FileReader (or placeholder URLs)
              resolve(imageUrls[index] || `https://source.unsplash.com/random/800x600/?property,${index}`);
            };
            reader.readAsDataURL(image);
          });
        })
      );
      
      console.log(`Successfully processed ${uploadedUrls.length} images`);
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Image Upload Error",
        description: "There was a problem uploading your images. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: PropertyFormData) => {
    try {
      let uploadedImageUrls: string[] = [];
      
      if (images.length > 0) {
        uploadedImageUrls = await uploadImages();
      }
      
      // Convert string values to numbers for the API
      const preparedData = {
        ...data,
        price: Number(data.price),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        squareFeet: Number(data.squareFeet),
        yearBuilt: Number(data.yearBuilt),
        images: uploadedImageUrls,
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
                              <Input 
                                placeholder="e.g. Modern Apartment in Downtown" 
                                {...field} 
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
                              <Textarea 
                                placeholder="Describe your property..." 
                                rows={5}
                                {...field} 
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
                                  <Input 
                                    placeholder="Street Address" 
                                    {...field} 
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
                                    <Input 
                                      placeholder="City" 
                                      {...field} 
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
                                    <Input 
                                      placeholder="State/Province" 
                                      {...field} 
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
                                    <Input 
                                      placeholder="Country" 
                                      {...field} 
                                    />
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
                        
                        <FormField
                          control={form.control}
                          name="neighborhoodId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Neighborhood</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select neighborhood" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {neighborhoods?.map((neighborhood: any) => (
                                    <SelectItem 
                                      key={neighborhood.id} 
                                      value={String(neighborhood.id)}
                                    >
                                      {neighborhood.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                        <div className="border-2 border-dashed rounded-md p-6 text-center">
                          <ImagePlus className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                          <div className="text-lg font-medium mb-2">
                            Drag & drop your images here
                          </div>
                          <div className="text-sm text-muted-foreground mb-4">
                            Supported formats: JPEG, PNG, WebP. Max size: 5MB per image.
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Select Images
                          </Button>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageSelect}
                          />
                        </div>
                        
                        {imageUrls.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">
                              {imageUrls.length} {imageUrls.length === 1 ? 'image' : 'images'} selected
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {imageUrls.map((url, index) => (
                                <div key={url} className="relative group">
                                  <img
                                    src={url}
                                    alt={`Property image ${index + 1}`}
                                    className="rounded-md object-cover w-full h-32"
                                  />
                                  {index === 0 && (
                                    <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-md">
                                      Main Image
                                    </div>
                                  )}
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(index)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
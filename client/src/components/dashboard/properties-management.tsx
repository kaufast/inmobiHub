import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Property, insertPropertySchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { z } from "zod";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Loader2,
  MapPin,
  Bed,
  Bath,
  Square,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import PropertyLocationPicker from "@/components/map/property-location-picker";

// Create validaton schema based on insertPropertySchema
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().min(1, "Price is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  country: z.string().default("USA"),
  latitude: z.number(),
  longitude: z.number(),
  bedrooms: z.number().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.number().min(0, "Bathrooms must be 0 or more"),
  squareFeet: z.number().min(1, "Square feet is required"),
  propertyType: z.enum(["house", "condo", "apartment", "townhouse", "land"]),
  yearBuilt: z.number().optional(),
  isPremium: z.boolean().default(false),
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).min(1, "At least one image is required"),
  ownerId: z.number().optional(),
});

type PropertyFormValues = z.infer<typeof formSchema>;

export default function PropertiesManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Fetch user properties
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/user/properties"],
    enabled: !!user,
  });

  // Add property mutation
  const addPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormValues) => {
      const res = await apiRequest("POST", "/api/properties", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Property added",
        description: "Your property has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/properties"] });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding property",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Edit property mutation
  const editPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormValues) => {
      if (!editingProperty) return null;
      const res = await apiRequest("PUT", `/api/properties/${editingProperty.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Property updated",
        description: "Your property has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/properties"] });
      setIsEditDialogOpen(false);
      setEditingProperty(null);
      editForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating property",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/properties/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Property deleted",
        description: "Your property has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/properties"] });
      setIsDeleteConfirmOpen(false);
      setPropertyToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting property",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form setup for adding a property
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
      latitude: 0,
      longitude: 0,
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      propertyType: "house",
      yearBuilt: undefined,
      isPremium: false,
      features: [],
      images: [],
    },
  });

  // Form setup for editing a property
  const editForm = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
      latitude: 0,
      longitude: 0,
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      propertyType: "house",
      yearBuilt: undefined,
      isPremium: false,
      features: [],
      images: [],
    },
  });

  // Update edit form when editing property changes
  useEffect(() => {
    if (editingProperty) {
      editForm.reset({
        ...editingProperty,
      });
    }
  }, [editingProperty, editForm]);

  // Add a demo property image
  const handleAddImage = (formHandler: any) => {
    const currentImages = formHandler.getValues("images") || [];
    
    // Use URL from a sample modern home
    const newImage = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3";
    
    formHandler.setValue("images", [...currentImages, newImage]);
  };

  // Remove an image from the form
  const handleRemoveImage = (index: number, formHandler: any) => {
    const currentImages = formHandler.getValues("images");
    const updatedImages = currentImages.filter((_, i) => i !== index);
    formHandler.setValue("images", updatedImages);
  };

  // Handle form submission for adding a property
  const onSubmitAddProperty = (data: PropertyFormValues) => {
    addPropertyMutation.mutate({
      ...data,
      ownerId: user?.id,
    });
  };

  // Handle form submission for editing a property
  const onSubmitEditProperty = (data: PropertyFormValues) => {
    editPropertyMutation.mutate({
      ...data,
      ownerId: user?.id,
    });
  };

  // Open edit dialog with a property
  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setIsDeleteConfirmOpen(true);
  };

  // Confirm property deletion
  const confirmDelete = () => {
    if (propertyToDelete) {
      deletePropertyMutation.mutate(propertyToDelete.id);
    }
  };

  // Toggle a feature in the add form
  const toggleFeature = (feature: string, formHandler: any) => {
    const currentFeatures = formHandler.getValues("features") || [];
    const isFeatureSelected = currentFeatures.includes(feature);
    
    if (isFeatureSelected) {
      formHandler.setValue(
        "features", 
        currentFeatures.filter(f => f !== feature)
      );
    } else {
      formHandler.setValue("features", [...currentFeatures, feature]);
    }
  };

  // Filter properties based on active tab
  const filteredProperties = () => {
    if (!properties) return [];
    if (activeTab === "all") return properties;
    if (activeTab === "premium") return properties.filter(p => p.isPremium);
    return properties;
  };

  // Get property type label
  const getPropertyTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      house: 'House',
      condo: 'Condo',
      apartment: 'Apartment',
      townhouse: 'Townhouse',
      land: 'Land'
    };
    
    return typeMap[type] || type;
  };

  // Format features list for display
  const formatFeatures = (features: string[] | null) => {
    if (!features || features.length === 0) return "None";
    return features.join(", ");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Properties Management</h1>
          <p className="text-primary-600">Manage your property listings</p>
        </div>
        
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-secondary-500 hover:bg-secondary-600">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Properties</TabsTrigger>
          <TabsTrigger value="premium">Premium Listings</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
      ) : (
        <div>
          {properties && properties.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties().map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium flex items-center">
                        <div className="h-10 w-10 rounded-md overflow-hidden mr-2">
                          <img 
                            src={property.images[0]} 
                            alt={property.title} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span>{property.title}</span>
                      </TableCell>
                      <TableCell>${property.price.toLocaleString()}</TableCell>
                      <TableCell>{getPropertyTypeLabel(property.propertyType)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-primary-500" />
                          <span className="truncate max-w-xs">
                            {property.address}, {property.city}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {property.isPremium ? (
                          <Badge className="bg-secondary-500">Premium</Badge>
                        ) : (
                          <Badge variant="outline">Standard</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProperty(property)}
                          className="mr-1"
                        >
                          <Pencil className="h-4 w-4 text-primary-700" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(property)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="mb-4 text-primary-400">
                  <svg
                    className="h-12 w-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-primary-800 mb-2">No properties yet</h3>
                <p className="text-primary-600 mb-6">
                  Get started by adding your first property listing
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-secondary-500 hover:bg-secondary-600">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Property
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Add Property Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Fill in the details to list a new property.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAddProperty)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter property title" {...field} />
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
                          <Textarea placeholder="Describe the property" rows={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter price"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
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
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
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
                          <FormLabel>Sq Ft</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="condo">Condo</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                            <SelectItem value="land">Land</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="yearBuilt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Built</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Year built (optional)"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => 
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isPremium"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Premium Listing</FormLabel>
                          <FormDescription>
                            Mark this property as a premium listing
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
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
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Zip Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormItem className="col-span-2">
                    <FormLabel>Property Location</FormLabel>
                    <FormDescription>
                      Click on the map to set the property location or use the search box to find an address
                    </FormDescription>
                    <div className="mt-2">
                      <PropertyLocationPicker
                        latitude={form.watch("latitude")}
                        longitude={form.watch("longitude")}
                        onLocationChange={(lat, lng) => {
                          form.setValue("latitude", lat);
                          form.setValue("longitude", lng);
                        }}
                        className="mt-2"
                      />
                    </div>
                  </FormItem>
                  
                  <FormField
                    control={form.control}
                    name="features"
                    render={() => (
                      <FormItem>
                        <FormLabel>Property Features</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {["pool", "garage", "fireplace", "waterfront", "garden", "airConditioner", "gym", "balcony"].map((feature) => (
                            <div key={feature} className="flex items-center space-x-2">
                              <Switch
                                id={`feature-${feature}`}
                                checked={(form.getValues("features") || []).includes(feature)}
                                onCheckedChange={() => toggleFeature(feature, form)}
                              />
                              <label
                                htmlFor={`feature-${feature}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {feature.charAt(0).toUpperCase() + feature.slice(1)}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Images</FormLabel>
                        <div className="border rounded-md p-4">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {field.value.map((image, index) => (
                              <div key={index} className="relative w-20 h-20 overflow-hidden rounded-md group">
                                <img
                                  src={image}
                                  alt={`Property ${index}`}
                                  className="w-full h-full object-cover"
                                />
                                <div 
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                  onClick={() => handleRemoveImage(index, form)}
                                >
                                  <Trash2 className="h-5 w-5 text-white cursor-pointer" />
                                </div>
                              </div>
                            ))}
                            {field.value.length === 0 && (
                              <div className="text-primary-500 text-sm italic">No images added yet</div>
                            )}
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAddImage(form)}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Image
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-secondary-500 hover:bg-secondary-600"
                  disabled={addPropertyMutation.isPending}
                >
                  {addPropertyMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Property
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Property Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update your property information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEditProperty)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter property title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the property" rows={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter price"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={editForm.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="squareFeet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sq Ft</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editForm.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="condo">Condo</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                            <SelectItem value="land">Land</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="yearBuilt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Built</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Year built (optional)"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => 
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="isPremium"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Premium Listing</FormLabel>
                          <FormDescription>
                            Mark this property as a premium listing
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-6">
                  <FormField
                    control={editForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Zip Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormItem className="col-span-2">
                    <FormLabel>Property Location</FormLabel>
                    <FormDescription>
                      Click on the map to set the property location or use the search box to find an address
                    </FormDescription>
                    <div className="mt-2">
                      <PropertyLocationPicker
                        latitude={editForm.watch("latitude")}
                        longitude={editForm.watch("longitude")}
                        onLocationChange={(lat, lng) => {
                          editForm.setValue("latitude", lat);
                          editForm.setValue("longitude", lng);
                        }}
                        className="mt-2"
                      />
                    </div>
                  </FormItem>
                  
                  <FormField
                    control={editForm.control}
                    name="features"
                    render={() => (
                      <FormItem>
                        <FormLabel>Property Features</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {["pool", "garage", "fireplace", "waterfront", "garden", "airConditioner", "gym", "balcony"].map((feature) => (
                            <div key={feature} className="flex items-center space-x-2">
                              <Switch
                                id={`feature-edit-${feature}`}
                                checked={(editForm.getValues("features") || []).includes(feature)}
                                onCheckedChange={() => toggleFeature(feature, editForm)}
                              />
                              <label
                                htmlFor={`feature-edit-${feature}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {feature.charAt(0).toUpperCase() + feature.slice(1)}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Images</FormLabel>
                        <div className="border rounded-md p-4">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {field.value.map((image, index) => (
                              <div key={index} className="relative w-20 h-20 overflow-hidden rounded-md group">
                                <img
                                  src={image}
                                  alt={`Property ${index}`}
                                  className="w-full h-full object-cover"
                                />
                                <div 
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                  onClick={() => handleRemoveImage(index, editForm)}
                                >
                                  <Trash2 className="h-5 w-5 text-white cursor-pointer" />
                                </div>
                              </div>
                            ))}
                            {field.value.length === 0 && (
                              <div className="text-primary-500 text-sm italic">No images added yet</div>
                            )}
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAddImage(editForm)}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Image
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-secondary-500 hover:bg-secondary-600"
                  disabled={editPropertyMutation.isPending}
                >
                  {editPropertyMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Property
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-primary-50 p-4 rounded-md">
            {propertyToDelete && (
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                  {propertyToDelete.images && propertyToDelete.images.length > 0 ? (
                    <img
                      src={propertyToDelete.images[0]}
                      alt={propertyToDelete.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-200 flex items-center justify-center">
                      <Building className="h-6 w-6 text-primary-500" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-primary-800">{propertyToDelete.title}</h4>
                  <p className="text-xs text-primary-500">{propertyToDelete.address}, {propertyToDelete.city}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletePropertyMutation.isPending}
            >
              {deletePropertyMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

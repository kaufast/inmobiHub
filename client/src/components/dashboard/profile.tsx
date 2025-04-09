import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, User, AtSign, Phone, Clock, ShieldCheck, AlertCircle, Package2, KeyRound } from "lucide-react";

// Profile form schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
});

// Password form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  
  // Set up profile form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      profileImage: user?.profileImage || "",
    },
  });
  
  // Set up password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", `/api/user/${user?.id}`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.setQueryData(["/api/user"], data);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const res = await apiRequest("POST", "/api/user/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully",
      });
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Submit profile update
  const onSubmitProfile = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  // Submit password change
  const onSubmitPasswordChange = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };
  
  // Update profile image URL
  const handleProfileImageUpdate = () => {
    // For demo purposes, set a sample profile image URL
    // In a real application, this would involve uploading an image to a server
    const demoImageUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3";
    form.setValue("profileImage", demoImageUrl);
    
    toast({
      title: "Profile image updated",
      description: "Your profile image has been updated",
    });
  };
  
  // Format account creation date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  
  // Get subscription tier display name
  const getSubscriptionTierName = (tier: string) => {
    const tierMap: Record<string, string> = {
      free: 'Free',
      premium: 'Premium',
      enterprise: 'Enterprise',
    };
    
    return tierMap[tier] || tier;
  };
  
  if (!user) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-primary-800 mb-2">User Not Found</h3>
        <p className="text-primary-600">Unable to load user profile information</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-800">Account Settings</h1>
        <p className="text-primary-600">Manage your profile and account preferences</p>
      </div>
      
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">
            <User className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your public profile information</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col items-center">
                <div className="relative mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.profileImage || undefined} alt={user.fullName} />
                    <AvatarFallback className="text-2xl bg-secondary-500 text-white">
                      {user.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                    onClick={handleProfileImageUpdate}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Button>
                </div>
                
                <h3 className="text-lg font-semibold text-primary-800">{user.fullName}</h3>
                <p className="text-primary-600 text-sm flex items-center">
                  <AtSign className="h-3.5 w-3.5 mr-1" />
                  {user.username}
                </p>
                
                <Badge className={`mt-3 ${
                  user.subscriptionTier === "premium" 
                    ? "bg-secondary-500" 
                    : user.subscriptionTier === "enterprise" 
                    ? "bg-purple-700" 
                    : ""
                }`}>
                  <Package2 className="h-3 w-3 mr-1" />
                  {getSubscriptionTierName(user.subscriptionTier)}
                </Badge>
              </CardContent>
              <CardFooter className="flex flex-col items-stretch pt-0">
                <div className="text-xs text-primary-500 flex items-center justify-center pb-2">
                  <Clock className="h-3 w-3 mr-1" />
                  Member since {formatDate(user.createdAt)}
                </div>
              </CardFooter>
            </Card>
            
            {/* Profile Edit Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form id="profile-form" onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number (optional)" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormDescription>
                            This will only be visible to property agents when you contact them
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us a bit about yourself" 
                              rows={4} 
                              {...field} 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Briefly describe yourself as a real estate investor or buyer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button 
                  type="submit"
                  form="profile-form"
                  className="bg-secondary-500 hover:bg-secondary-600"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-primary-800">Password</h4>
                    <p className="text-xs text-primary-500">
                      Change your account password
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsPasswordDialogOpen(true)}
                  >
                    <KeyRound className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-primary-800">Account Activity</h4>
                  
                  <Alert variant="outline">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-600 ml-2">Your account is secure</AlertTitle>
                    <AlertDescription className="ml-6">
                      No suspicious activities have been detected on your account.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-primary-500">Recent logins</div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-primary-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 flex items-center justify-center bg-primary-100 rounded-full">
                            <svg className="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-primary-800">Current Session</div>
                            <div className="text-xs text-primary-500">New York, USA • Chrome on Windows</div>
                          </div>
                        </div>
                        <div className="text-xs text-primary-500">Just now</div>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 flex items-center justify-center bg-primary-100 rounded-full">
                            <svg className="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-primary-800">Mobile Device</div>
                            <div className="text-xs text-primary-500">New York, USA • Safari on iOS</div>
                          </div>
                        </div>
                        <div className="text-xs text-primary-500">Yesterday</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to update your credentials.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...passwordForm}>
            <form id="password-form" onSubmit={passwordForm.handleSubmit(onSubmitPasswordChange)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter current password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters and include a number and special character.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              form="password-form"
              className="bg-secondary-500 hover:bg-secondary-600"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

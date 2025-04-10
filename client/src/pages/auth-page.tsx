import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { PhoneAuthForm } from "@/components/auth/phone-auth-form";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  rememberMe: z.boolean().optional()
});

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  acceptTerms: z.boolean()
    .refine(val => val === true, {
      message: "You must accept the terms and conditions",
    })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { currentUser } = useFirebaseAuth();
  const firebaseConfigured = isFirebaseConfigured();

  // Redirect if already authenticated (traditional auth or Firebase)
  if (user || currentUser) {
    navigate("/");
    return <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2">Already logged in, redirecting...</span>
    </div>;
  }

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false
    }
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Handle the login
      console.log("Login submitted:", data);
      toast({
        title: "Login submitted",
        description: "Processing your login..."
      });
      
      // Here we'd typically connect with our API for authentication
      setTimeout(() => {
        toast({
          title: "Login successful",
          description: "Welcome back!"
        });
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // Handle the registration
      console.log("Registration submitted:", data);
      toast({
        title: "Registration submitted",
        description: "Creating your account..."
      });
      
      // Here we'd typically connect with our API for registration
      setTimeout(() => {
        toast({
          title: "Registration successful",
          description: "Your account has been created. Welcome to Inmobi!"
        });
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign in or Register | Inmobi Real Estate</title>
        <meta name="description" content="Sign in to your Inmobi account or create a new one to access personalized property recommendations, saved searches, and more." />
      </Helmet>
      
      <div className="flex min-h-screen bg-muted/40">
        {/* Left Side - Auth Form */}
        <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="w-full max-w-md mx-auto lg:w-96">
            <div className="flex flex-col items-center">
              <img src="/logo.svg" alt="Inmobi Logo" className="h-12 mb-4" />
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-center">
                {activeTab === "login" ? "Welcome back" : "Create an account"}
              </h2>
              <p className="mt-2 text-sm text-center text-muted-foreground">
                {activeTab === "login" 
                  ? "Sign in to your account to continue" 
                  : "Join Inmobi to discover your perfect property"}
              </p>
            </div>

            <div className="mt-8">
              <Tabs 
                defaultValue="login" 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as "login" | "register")} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Remember me</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-center justify-between">
                        <Button
                          variant="link"
                          className="px-0 text-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            toast({
                              title: "Password reset",
                              description: "Password reset functionality will be implemented soon."
                            });
                          }}
                        >
                          Forgot your password?
                        </Button>
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign in"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I accept the{" "}
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    window.open("/terms", "_blank");
                                  }}
                                >
                                  Terms and Conditions
                                </Button>
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
              
              {firebaseConfigured && (
                <>
                  <div className="relative mt-8">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-background text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-6">
                    <SocialAuthButtons />
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-background text-muted-foreground">
                          Or use phone number
                        </span>
                      </div>
                    </div>
                    
                    <PhoneAuthForm />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Side - Hero Image */}
        <div className="relative hidden w-0 flex-1 lg:block">
          <div className="absolute inset-0 flex flex-col bg-gradient-to-r from-blue-400 to-blue-600">
            <div className="flex flex-col justify-center h-full p-12 text-white">
              <h1 className="text-4xl font-bold">Find Your Dream Property</h1>
              <div className="max-w-md mt-4 text-lg">
                <p className="mb-4">
                  Join Inmobi to discover premium properties tailored to your preferences.
                </p>
                <ul className="grid gap-2 list-disc list-inside">
                  <li>Exclusive property listings</li>
                  <li>AI-powered recommendations</li>
                  <li>Smart property comparison tools</li>
                  <li>Real-time market insights</li>
                  <li>Schedule property tours instantly</li>
                </ul>
                <p className="mt-6 font-semibold">
                  Over 10,000 satisfied clients have found their perfect home with us.
                </p>
              </div>
              <div className="mt-12">
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="inline-block w-8 h-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-300"
                      >
                        <img
                          src={`https://i.pravatar.cc/100?img=${i + 10}`}
                          alt={`User ${i}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-medium">
                    Join thousands of satisfied users
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
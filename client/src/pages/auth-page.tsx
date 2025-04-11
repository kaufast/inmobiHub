import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { LoginUser, RegisterUser, loginUserSchema, registerUserSchema } from "@shared/schema";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { PasskeyAuthForm } from "@/components/auth/passkey-auth";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, login, register, isAuthenticating } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Set document title
  useEffect(() => {
    document.title = "Login or Register - Inmobi";
  }, []);

  // Login form
  const loginForm = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
    },
  });

  const onLoginSubmit = async (data: LoginUser) => {
    try {
      await login(data);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const onRegisterSubmit = async (data: RegisterUser) => {
    try {
      await register(data);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Form Section */}
            <div className="p-8 md:p-12">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary-800">Welcome to Inmobi</h1>
                <p className="text-primary-600 mt-2">
                  Access exclusive property insights and investment opportunities
                </p>
              </div>
              
              <Tabs
                defaultValue="login"
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "login" | "register")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
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
                            <div className="flex items-center justify-between">
                              <FormLabel>Password</FormLabel>
                              <a href="#" className="text-sm text-secondary-600 hover:text-secondary-500">
                                Forgot password?
                              </a>
                            </div>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <label
                          htmlFor="remember"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </label>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isAuthenticating}
                      >
                        {isAuthenticating ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Sign In
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
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
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
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
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-primary-500 mt-1">
                              Must be at least 8 characters with a number and special character
                            </p>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox id="terms" className="mt-1" />
                        <label
                          htmlFor="terms"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the{" "}
                          <a href="#" className="text-secondary-600 hover:text-secondary-500">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-secondary-600 hover:text-secondary-500">
                            Privacy Policy
                          </a>
                        </label>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isAuthenticating}
                      >
                        {isAuthenticating ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Create Account
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
              
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-primary-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-primary-500">Or continue with</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <SocialAuthButtons 
                    onSuccess={async (userData) => {
                      // Handle successful Firebase auth
                      try {
                        // For login tab, try to login first
                        if (activeTab === 'login') {
                          try {
                            // Try to login with the given email as username
                            await login({
                              username: userData.email,
                              password: userData.password
                            });
                            return; // If login succeeds, return
                          } catch (error) {
                            // If login fails, it might be a new user - continue to register
                            console.log("Firebase user not found in our system, registering...");
                          }
                        }
                        
                        // Register the user with our API
                        await register({
                          username: userData.username,
                          email: userData.email,
                          password: userData.password,
                          fullName: userData.fullName || userData.email.split('@')[0] // Use email prefix if no name
                        });
                      } catch (error) {
                        console.error("Error in Firebase auth flow:", error);
                      }
                    }}
                    onError={(error) => {
                      console.error("Social auth error:", error);
                    }}
                  />
                  
                  {/* Passkey Authentication */}
                  {activeTab === 'login' && (
                    <div className="mt-4">
                      <PasskeyAuthForm />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Hero Section */}
            <div className="hidden md:block relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3')] bg-cover bg-center opacity-20"></div>
              </div>
              
              <div className="relative z-10 p-12 flex flex-col h-full justify-center">
                <h2 className="text-4xl font-bold text-white mb-6">
                  Data-Driven Real Estate Investments
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-md">
                  Join thousands of investors making smarter real estate decisions with powerful analytics, market insights, and premium properties.
                </p>
                
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                  <div className="flex items-center mb-4">
                    <div className="text-yellow-400 flex">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    </div>
                  </div>
                  <blockquote className="text-white mb-4">
                    "Inmobi has completely transformed how I approach real estate investing. The data insights helped me find properties with 20% higher ROI than my previous investments."
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center text-white font-bold">
                      RC
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-medium">Robert Chen</p>
                      <p className="text-white/70 text-sm">Real Estate Investor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

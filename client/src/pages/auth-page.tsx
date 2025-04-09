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

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Set document title
  useEffect(() => {
    document.title = "Login or Register - Foundation";
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

  const onLoginSubmit = (data: LoginUser) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterUser) => {
    registerMutation.mutate(data);
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
                <h1 className="text-3xl font-bold text-primary-800">Welcome to Foundation</h1>
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
                        className="w-full bg-secondary-600 hover:bg-secondary-700"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
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
                        className="w-full bg-secondary-600 hover:bg-secondary-700"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
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
                
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <Button variant="outline" className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2.5a4.38 4.38 0 0 0-3 1.52 4.09 4.09 0 0 0-1 2.95 3.63 3.63 0 0 0 2.94-1.78zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91s-2-.89-3.3-.87a4.92 4.92 0 0 0-4.14 2.53c-1.75 3.07-.45 7.6 1.27 10.08.83 1.22 1.83 2.59 3.14 2.54s1.73-.82 3.25-.82 1.95.82 3.29.79 2.22-1.23 3.06-2.45a11 11 0 0 0 1.38-2.84 4.41 4.41 0 0 1-2.62-4.06z"></path>
                    </svg>
                    Apple
                  </Button>
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
                    "Foundation has completely transformed how I approach real estate investing. The data insights helped me find properties with 20% higher ROI than my previous investments."
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

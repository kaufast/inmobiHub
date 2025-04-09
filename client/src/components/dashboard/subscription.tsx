import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Define types for the subscription API responses
interface SubscriptionResponse {
  tier: string;
};

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Subscription features
const subscriptionPlans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    features: [
      "Basic property search",
      "Save up to 5 favorite properties",
      "Limited message exchanges",
      "Email notifications",
    ],
    constraints: [
      "Limited to 1 property listing",
      "No analytics",
      "No premium badge",
      "No priority support",
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
  },
  {
    id: "premium",
    name: "Premium",
    price: 19.99,
    period: "month",
    features: [
      "Advanced property search with filters",
      "Unlimited favorite properties",
      "Unlimited message exchanges",
      "Email and SMS notifications",
      "Up to 10 property listings",
      "Basic analytics",
      "Premium badge on profile",
      "Priority support",
    ],
    constraints: [],
    buttonText: "Upgrade",
    buttonVariant: "default" as const,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 49.99,
    period: "month",
    features: [
      "All premium features",
      "Unlimited property listings",
      "Advanced analytics",
      "Featured properties",
      "Custom branding",
      "API access",
      "Dedicated account manager",
    ],
    constraints: [],
    buttonText: "Contact Us",
    buttonVariant: "default" as const,
  },
];

// Payment form schema
const paymentFormSchema = z.object({
  plan: z.enum(["premium", "enterprise"]),
  cardNumber: z.string().min(16, "Card number must be 16 digits"),
  cardName: z.string().min(3, "Cardholder name is required"),
  expiryDate: z.string().min(5, "Expiry date is required"),
  cvc: z.string().min(3, "CVC is required"),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function Subscription() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get current subscription
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery<SubscriptionResponse>({
    queryKey: ["/api/subscription"],
    // Default to free tier if no subscription found
    select: (data) => data || { tier: "free" },
  });

  // Payment form
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      plan: "premium",
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvc: "",
    },
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      const res = await apiRequest("POST", "/api/subscription", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Subscription updated",
        description: "Your subscription has been successfully updated.",
      });
      setShowPaymentForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpgradeClick = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentForm(true);
    form.setValue("plan", planId as "premium" | "enterprise");
  };

  const onSubmitPayment = (data: PaymentFormValues) => {
    subscribeMutation.mutate(data);
  };

  // Show loading while subscription data is loading
  if (isLoadingSubscription) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Ensure subscription data is defined
  const subscriptionTier = subscription?.tier || 'free';
  const currentPlan = subscriptionPlans.find(plan => plan.id === subscriptionTier) || subscriptionPlans[0];

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscription Plans</h2>
          <p className="text-muted-foreground">Choose the best plan for your real estate needs</p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Your Current Plan
              <Badge variant="outline" className="ml-2 px-3 py-1">
                {currentPlan.name}
              </Badge>
            </CardTitle>
            <CardDescription>
              You are currently on the {currentPlan.name} plan.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Plan Selection */}
        {!showPaymentForm ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className={plan.id === subscriptionTier ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.constraints.map((constraint) => (
                      <li key={constraint} className="flex items-start text-muted-foreground">
                        <span className="mr-2">•</span>
                        <span>{constraint}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={plan.buttonVariant} 
                    className="w-full"
                    disabled={plan.id === subscriptionTier || plan.id === "enterprise"}
                    onClick={() => handleUpgradeClick(plan.id)}
                  >
                    {plan.id === subscriptionTier ? "Current Plan" : plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Enter your payment details to upgrade to the {selectedPlan ? (selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)) : 'Premium'} plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitPayment)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Select Plan</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="premium" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Premium ($19.99/month)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="enterprise" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Enterprise ($49.99/month)
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cardName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cardholder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="4242 4242 4242 4242" 
                                {...field} 
                                className="pl-10"
                              />
                              <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input placeholder="MM/YY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cvc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVC</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPaymentForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={subscribeMutation.isPending}
                    >
                      {subscribeMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Confirm Payment
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
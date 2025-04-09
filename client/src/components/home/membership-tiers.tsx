import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Link } from "wouter";

interface PricingTier {
  name: string;
  price: number;
  period: string;
  description: string;
  features: {
    included: string[];
    excluded: string[];
  };
  popular?: boolean;
  buttonText: string;
  buttonVariant: "primary" | "outline";
}

export default function MembershipTiers() {
  const pricingTiers: PricingTier[] = [
    {
      name: "Free",
      price: 0,
      period: "month",
      description: "Essential tools to start your real estate journey.",
      features: {
        included: [
          "Basic property search",
          "Save up to 5 favorite properties",
          "Standard market insights",
          "Basic ROI calculator",
        ],
        excluded: [
          "Advanced analytics",
          "Investment opportunity alerts",
        ],
      },
      buttonText: "Sign Up Free",
      buttonVariant: "outline",
    },
    {
      name: "Premium",
      price: 49,
      period: "month",
      description: "Advanced tools for serious investors.",
      features: {
        included: [
          "Everything in Free",
          "Unlimited saved properties",
          "Advanced market analytics",
          "Comprehensive ROI calculator",
          "Investment opportunity alerts",
          "Priority access to new listings",
        ],
        excluded: [],
      },
      popular: true,
      buttonText: "Start Premium",
      buttonVariant: "primary",
    },
    {
      name: "Enterprise",
      price: 199,
      period: "month",
      description: "Complete solution for professional investors.",
      features: {
        included: [
          "Everything in Premium",
          "API access to data",
          "Portfolio performance dashboard",
          "Custom reporting",
          "Dedicated account manager",
          "Strategic investment consulting",
        ],
        excluded: [],
      },
      buttonText: "Contact Sales",
      buttonVariant: "outline",
    },
  ];

  return (
    <section className="py-16 bg-primary-50" id="membership">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-800 mb-4">Choose Your Investment Path</h2>
          <p className="text-primary-600 text-lg">Unlock premium features and data insights to make smarter real estate investment decisions.</p>
        </div>
        
        <div className="flex flex-col lg:flex-row justify-center gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div 
              key={index}
              className={`flex-1 bg-white rounded-2xl shadow-lg overflow-hidden border transition-transform hover:scale-105 ${
                tier.popular 
                  ? 'border-secondary-500 shadow-xl scale-105 z-10' 
                  : 'border-primary-200'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 bg-secondary-500 text-white text-center py-2 font-medium text-sm">
                  MOST POPULAR
                </div>
              )}
              
              <div className={`p-8 ${tier.popular ? 'pt-12' : ''}`}>
                <h3 className="text-xl font-bold text-primary-800 mb-2">{tier.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-primary-800">${tier.price}</span>
                  <span className="text-primary-500 ml-2">/{tier.period}</span>
                </div>
                <p className="text-primary-600 mb-6">{tier.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.included.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-primary-700">{feature}</span>
                    </li>
                  ))}
                  {tier.features.excluded.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-primary-400">
                      <X className="h-5 w-5 text-primary-300 mr-2 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="px-8 pb-8">
                <Link href="/auth">
                  <Button 
                    className={`w-full ${
                      tier.buttonVariant === 'primary'
                        ? 'bg-secondary-500 hover:bg-secondary-600 text-white'
                        : 'bg-white hover:bg-primary-50 text-primary-800 border border-primary-300'
                    }`}
                  >
                    {tier.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

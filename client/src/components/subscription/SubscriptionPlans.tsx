import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    interval: 'forever',
    features: [
      'Access to basic features',
      'Email support',
      'Basic analytics',
      'Limited API access',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19.99',
    interval: 'month',
    features: [
      'All Basic features',
      'Priority support',
      'Advanced analytics',
      'Full API access',
      'Custom integrations',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$49.99',
    interval: 'month',
    features: [
      'All Pro features',
      '24/7 support',
      'Custom integrations',
      'Dedicated account manager',
      'White-label options',
    ],
  },
];

interface SubscriptionPlansProps {
  onSelectPlan: (planId: string) => void;
}

export function SubscriptionPlans({ onSelectPlan }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={`cursor-pointer transition-all ${
            selectedPlan === plan.id ? 'border-primary shadow-lg' : ''
          }`}
          onClick={() => {
            setSelectedPlan(plan.id);
            onSelectPlan(plan.id);
          }}
        >
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>
              {plan.price}{plan.interval !== 'forever' ? `/${plan.interval}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant={selectedPlan === plan.id ? 'default' : 'outline'}
              className="w-full"
            >
              {selectedPlan === plan.id ? 'Selected' : plan.id === 'basic' ? 'Get Started' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 
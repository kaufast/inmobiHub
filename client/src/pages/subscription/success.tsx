import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function SubscriptionSuccess() {
  const router = useRouter();
  const { session_id } = router.query;

  useEffect(() => {
    if (session_id) {
      // You can verify the session here if needed
      toast({
        title: 'Success!',
        description: 'Your subscription has been activated successfully.',
      });
    }
  }, [session_id]);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Subscription Activated!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for subscribing. Your account has been upgraded successfully.
        </p>
        <Button onClick={() => router.push('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
} 
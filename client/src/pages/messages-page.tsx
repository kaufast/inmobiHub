import { AppAgnosticMessaging } from '@/components/messaging/AppAgnosticMessaging';

export default function MessagesPage() {
  // In a real application, we would get the user ID from authentication
  // For now, we'll use a hardcoded demo user ID
  const demoUserId = 1;
  
  return (
    <div className="container mx-auto p-4">
      <AppAgnosticMessaging userId={demoUserId} />
    </div>
  );
}
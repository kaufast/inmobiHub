import { useAuth } from "@/hooks/use-auth";
import { AppAgnosticMessaging } from "@/components/messaging/AppAgnosticMessaging";
import { ProtectedRoute } from "@/lib/protected-route";

function MessagesPageContent() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="container mx-auto">
      <AppAgnosticMessaging userId={user.id} />
    </div>
  );
}

export default function MessagesPage() {
  return <ProtectedRoute path="/messages" component={MessagesPageContent} />;
}
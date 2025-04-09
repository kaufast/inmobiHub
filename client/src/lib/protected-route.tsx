import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type UserRole = 'user' | 'agent' | 'admin';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  allowedRoles?: UserRole[];
}

// Generic protected route that checks authentication
export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles
}: ProtectedRouteProps) {
  // Try using useAuth safely
  let user = null;
  let isLoading = false;
  
  try {
    // Try to use the auth context
    const auth = useAuth();
    user = auth.user;
    isLoading = auth.isLoading;
  } catch (e) {
    console.log("Auth context not available");
    // If auth context isn't available, we'll treat as loading
    isLoading = true;
  }

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // If no user, redirect to auth page
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If allowedRoles is specified, check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role as UserRole)) {
      // Redirect to appropriate dashboard based on role
      const redirectPath = 
        user.role === 'admin' ? '/admin/dashboard' : 
        user.role === 'agent' ? '/agent/dashboard' : '/dashboard';
      
      return (
        <Route path={path}>
          <Redirect to={redirectPath} />
        </Route>
      );
    }
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}

// Specific routes for different user roles
export function UserProtectedRoute({ path, component }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return <ProtectedRoute path={path} component={component} allowedRoles={['user']} />;
}

export function AgentProtectedRoute({ path, component }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return <ProtectedRoute path={path} component={component} allowedRoles={['agent']} />;
}

export function AdminProtectedRoute({ path, component }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return <ProtectedRoute path={path} component={component} allowedRoles={['admin']} />;
}

export function PublisherProtectedRoute({ path, component }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return <ProtectedRoute path={path} component={component} allowedRoles={['agent', 'admin']} />;
}

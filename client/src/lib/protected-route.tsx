import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useState } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType;
}) {
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

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}

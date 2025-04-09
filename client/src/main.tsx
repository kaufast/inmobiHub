import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./hooks/use-auth";
import { BubbleNotificationsProvider } from "./hooks/use-bubble-notifications";
// Import i18n configuration
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BubbleNotificationsProvider position="top-right" maxNotifications={5}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BubbleNotificationsProvider>
  </QueryClientProvider>
);

import { createRoot } from "react-dom/client";
import SimpleApp from "./SimpleApp";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
// Import i18n configuration
import "./i18n";

// Use simplified app to resolve WebSocket issues
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SimpleApp />
  </QueryClientProvider>
);

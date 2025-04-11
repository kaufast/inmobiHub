import { createRoot } from "react-dom/client";
import TestApp from "./TestApp"; // Only import TestApp for now
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
// Import i18n configuration
import "./i18n";

// Temporarily rendering only TestApp to fix WebSocket connection issues
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TestApp />
  </QueryClientProvider>
);

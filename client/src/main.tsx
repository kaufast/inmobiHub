import { createRoot } from "react-dom/client";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
// Import i18n configuration
import "./i18n";
// Import our simplified test app
import TestApp from "./TestApp";

// We're using the simplified TestApp while debugging issues with the main App
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TestApp />
  </QueryClientProvider>
);

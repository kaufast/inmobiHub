import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// Import CSS files in correct order
import './index.css' // Main styles with Tailwind and theme
import './App.css' // App-specific styles
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
// Import i18n configuration
import "./i18n";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </QueryClientProvider>,
)

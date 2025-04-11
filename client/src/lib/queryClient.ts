import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Ensure URL has leading slash for consistency
  const apiUrl = url.startsWith('/') ? url : `/${url}`;
  
  // Add retry logic for improved reliability
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      const res = await fetch(apiUrl, {
        method,
        headers: {
          ...(data ? { "Content-Type": "application/json" } : {}),
          // Add cache control headers to prevent caching issues
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache"
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      
      // For 404 errors specifically on registration endpoint, try with a different path format
      if (res.status === 404 && apiUrl === '/api/register' && attempts === 0) {
        console.warn('Registration endpoint not found, trying alternate URL format...');
        attempts++;
        continue;
      }
      
      await throwIfResNotOk(res);
      return res;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw error;
      }
      // Add exponential backoff for retries
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }
  
  // This should never be reached due to the throw in the loop above
  throw new Error('Request failed after maximum retry attempts');
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    // Ensure URL has leading slash for consistency
    const apiUrl = url.startsWith('/') ? url : `/${url}`;
    
    // Add retry logic similar to apiRequest
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const res = await fetch(apiUrl, {
          credentials: "include",
          headers: {
            // Add cache control headers to prevent caching issues
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache"
          }
        });
        
        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          return null;
        }
        
        // For 404 errors, try alternative approaches
        if (res.status === 404 && attempts === 0) {
          console.warn(`Endpoint not found for: ${apiUrl}, trying alternate URL format...`);
          attempts++;
          continue;
        }
        
        await throwIfResNotOk(res);
        return await res.json();
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        // Add exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
    
    throw new Error('Query failed after maximum retry attempts');
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

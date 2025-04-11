import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initDatabase } from '@/utils/indexedDB';

interface CacheContextType {
  isInitialized: boolean;
  error: Error | null;
}

const CacheContext = createContext<CacheContextType>({
  isInitialized: false,
  error: null,
});

export function CacheProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initCache() {
      try {
        await initDatabase();
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize cache:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // We still set initialized to true so the app can continue to work
        // even without caching
        setIsInitialized(true);
      }
    }

    initCache();
  }, []);

  const value = {
    isInitialized,
    error,
  };

  // If IndexedDB is initializing, show a minimal loading indicator
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="flex flex-col items-center">
          <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-primary rounded-full"></div>
          <p className="mt-4 text-sm text-gray-400">Initializing cache...</p>
        </div>
      </div>
    );
  }

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
}
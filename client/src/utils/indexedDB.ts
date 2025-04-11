/**
 * IndexedDB utility for caching property data to improve performance
 * - Reduces API calls for frequently accessed data
 * - Improves offline experience
 * - Speeds up application loading time
 */

// Database name and version
const DB_NAME = 'inmobiCache';
const DB_VERSION = 1;

// Store names
export const STORES = {
  PROPERTIES: 'properties',
  NEIGHBORHOODS: 'neighborhoods',
  FEATURED_PROPERTIES: 'featuredProperties',
  USER_PREFERENCES: 'userPreferences',
  SEARCH_HISTORY: 'searchHistory',
};

/**
 * Initialize the IndexedDB database
 */
export function initDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.error('Your browser does not support IndexedDB');
      reject('IndexedDB not supported');
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores with indexes
      if (!db.objectStoreNames.contains(STORES.PROPERTIES)) {
        const propertiesStore = db.createObjectStore(STORES.PROPERTIES, { keyPath: 'key' });
        propertiesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.NEIGHBORHOODS)) {
        const neighborhoodsStore = db.createObjectStore(STORES.NEIGHBORHOODS, { keyPath: 'key' });
        neighborhoodsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.FEATURED_PROPERTIES)) {
        db.createObjectStore(STORES.FEATURED_PROPERTIES, { keyPath: 'key' });
      }
      
      if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
        db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'key' });
      }
      
      if (!db.objectStoreNames.contains(STORES.SEARCH_HISTORY)) {
        const searchStore = db.createObjectStore(STORES.SEARCH_HISTORY, { keyPath: 'key' });
        searchStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Generic function to add or update data in a store
 */
export async function addOrUpdateData<T>(storeName: string, data: T): Promise<T> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    
    request.onerror = (event) => {
      console.error(`Error adding data to ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    request.onsuccess = () => {
      resolve(data);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Generic function to add or update multiple items in a store
 */
export async function addOrUpdateBulkData<T>(storeName: string, items: T[]): Promise<T[]> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    items.forEach(item => {
      store.put(item);
    });
    
    transaction.onerror = (event) => {
      console.error(`Error adding bulk data to ${storeName}:`, transaction.error);
      reject(transaction.error);
    };
    
    transaction.oncomplete = () => {
      resolve(items);
      db.close();
    };
  });
}

/**
 * Get data from a store by key
 */
export async function getData<T>(storeName: string, key: string): Promise<T | null> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    
    request.onerror = (event) => {
      console.error(`Error getting data from ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get all data from a store
 */
export async function getAllData<T>(storeName: string): Promise<T[]> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = (event) => {
      console.error(`Error getting all data from ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Delete data from a store by key
 */
export async function deleteData(storeName: string, key: string): Promise<void> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    
    request.onerror = (event) => {
      console.error(`Error deleting data from ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    request.onsuccess = () => {
      resolve();
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Clear all data from a store
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onerror = (event) => {
      console.error(`Error clearing ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    request.onsuccess = () => {
      resolve();
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Check if data needs to be refreshed based on timestamp
 * @param timestamp The timestamp to check against
 * @param maxAgeMs Maximum age in milliseconds before data needs refresh
 * @returns Boolean indicating if data needs refresh
 */
export function needsRefresh(timestamp: number, maxAgeMs = 1000 * 60 * 10): boolean {
  if (!timestamp) return true;
  return Date.now() - timestamp > maxAgeMs;
}

/**
 * Get data with a specific index value
 */
export async function getDataByIndex<T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    
    request.onerror = (event) => {
      console.error(`Error getting data by index from ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get the most recent records based on timestamp
 */
export async function getMostRecentData<T>(
  storeName: string,
  limit: number = 10
): Promise<T[]> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    
    // Make sure the store has a timestamp index
    if (!store.indexNames.contains('timestamp')) {
      reject(new Error(`Store ${storeName} does not have a timestamp index`));
      return;
    }
    
    const index = store.index('timestamp');
    const request = index.openCursor(null, 'prev'); // 'prev' for descending order
    
    const results: T[] = [];
    
    request.onerror = (event) => {
      console.error(`Error getting recent data from ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      
      if (cursor && results.length < limit) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}
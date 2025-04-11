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
 * Get data from a store by ID
 */
export async function getData<T>(storeName: string, id: number | string): Promise<T | null> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
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
 * Delete data from a store by ID
 */
export async function deleteData(storeName: string, id: number | string): Promise<void> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
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
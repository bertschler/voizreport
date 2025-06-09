import { createStore } from 'jotai';

// Create a singleton store instance
let storeInstance: ReturnType<typeof createStore> | null = null;

export const getAppStore = () => {
  if (!storeInstance) {
    storeInstance = createStore();
  }
  return storeInstance;
};

// Export the store instance for use in function handlers
export const store = getAppStore(); 
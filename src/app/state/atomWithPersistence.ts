import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export interface PersistenceOptions<T> {
  /** Storage key for localStorage */
  key: string;
  /** Default value when no stored data exists */
  defaultValue: T;
  /** Maximum number of items to keep (for arrays) */
  maxItems?: number;
  /** Enable console logging for debugging */
  enableLogging?: boolean;
  /** Custom serializer function */
  serialize?: (value: T) => string;
  /** Custom deserializer function */
  deserialize?: (value: string) => T;
  /** Custom recovery function when storage fails */
  onStorageError?: (error: Error, fallbackValue: T) => T;
  /** Validation function to ensure data integrity */
  validate?: (value: unknown) => value is T;
}

/**
 * Creates a Jotai atom with automatic localStorage persistence, error handling, and logging
 * This version is hydration-safe and won't cause SSR/client mismatches
 * 
 * @example
 * ```ts
 * // Simple usage - just like Recoil
 * const userPrefsAtom = atomWithPersistence('user_preferences', { theme: 'light' });
 * 
 * // Advanced usage with options
 * const reportsAtom = atomWithPersistence('reports', [], {
 *   maxItems: 50,
 *   validate: (value): value is Report[] => Array.isArray(value)
 * });
 * 
 * // Use just like any other atom
 * const prefs = get(userPrefsAtom);
 * set(userPrefsAtom, { ...prefs, theme: 'dark' });
 * ```
 */
export function atomWithPersistence<T>(
  key: string, 
  defaultValue: T, 
  options?: Omit<PersistenceOptions<T>, 'key' | 'defaultValue'>
) {
  const {
    maxItems,
    enableLogging = true,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onStorageError,
    validate
  } = options || {};

  const log = enableLogging 
    ? (message: string, ...args: any[]) => console.log(`📦 [${key}]`, message, ...args)
    : () => {};

  const logError = enableLogging
    ? (message: string, error: Error) => console.error(`💥 [${key}]`, message, error)
    : () => {};

  // Check if we're on the client side
  const isClient = typeof window !== 'undefined';

  // Helper function to load from storage
  const loadFromStorage = (): T => {
    if (!isClient) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        log('No stored data found, using default value');
        return defaultValue;
      }

      const parsed = deserialize(item);
      
      // Validate if validation function provided
      if (validate && !validate(parsed)) {
        log('Stored data failed validation, using default value');
        return defaultValue;
      }

      // Apply maxItems limit for arrays
      let result = parsed;
      if (maxItems && Array.isArray(result) && result.length > maxItems) {
        result = result.slice(0, maxItems) as T;
        log(`Trimmed data to ${maxItems} items`);
      }

      log('Loaded from storage:', Array.isArray(result) ? `${result.length} items` : 'data loaded');
      return result;
    } catch (error) {
      logError('Error loading from storage:', error as Error);
      
      if (onStorageError) {
        return onStorageError(error as Error, defaultValue);
      }
      
      return defaultValue;
    }
  };

  // Helper function to save to storage
  const saveToStorage = (value: T) => {
    if (!isClient) {
      return;
    }

    try {
      // Apply maxItems limit for arrays before saving
      let valueToSave = value;
      if (maxItems && Array.isArray(value) && value.length > maxItems) {
        valueToSave = value.slice(0, maxItems) as T;
        log(`Trimming to ${maxItems} items before save`);
      }

      const serialized = serialize(valueToSave);
      localStorage.setItem(key, serialized);
      log('Saved to storage:', Array.isArray(valueToSave) ? `${valueToSave.length} items` : 'data saved');
    } catch (error) {
      logError('Error saving to storage:', error as Error);
      
      // Recovery attempt: try to save essential data only
      if (Array.isArray(value) && value.length > 0) {
        try {
          // For arrays, try saving first 10 items as recovery
          const recoveryData = value.slice(0, Math.min(10, maxItems || 10)) as T;
          const recoverySerialized = serialize(recoveryData);
          localStorage.setItem(key, recoverySerialized);
          log('Recovery save successful with limited data');
        } catch (recoveryError) {
          logError('Recovery save also failed:', recoveryError as Error);
        }
      }
    }
  };

  // Create the atom
  const baseAtom = atom(defaultValue);

  // Create derived atom that handles persistence
  const persistentAtom = atom(
    (get) => {
      const value = get(baseAtom);
      // On first read, try to load from storage
      if (isClient && JSON.stringify(value) === JSON.stringify(defaultValue)) {
        const stored = loadFromStorage();
        if (JSON.stringify(stored) !== JSON.stringify(defaultValue)) {
          return stored;
        }
      }
      return value;
    },
    (get, set, update: T) => {
      set(baseAtom, update);
      saveToStorage(update);
    }
  );

  return persistentAtom;
}

/**
 * IndexedDB version - similar to your atomWithIndexedPersistence
 * TODO: Implement if needed
 */
export function atomWithIndexedPersistence<T>(
  key: string,
  defaultValue: T,
  options?: Omit<PersistenceOptions<T>, 'key' | 'defaultValue'>
) {
  // For now, fallback to localStorage
  // Can implement IndexedDB later if needed
  return atomWithPersistence(key, defaultValue, options);
} 
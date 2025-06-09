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
 * Just like Recoil's atomWithPersistence - the atom automatically saves/loads
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

  return atomWithStorage<T>(key, defaultValue, {
    getItem: (storageKey: string, initialValue: T) => {
      try {
        const item = localStorage.getItem(storageKey);
        if (item === null) {
          log('No stored data found, using default value');
          return initialValue;
        }

        const parsed = deserialize(item);
        
        // Validate if validation function provided
        if (validate && !validate(parsed)) {
          log('Stored data failed validation, using default value');
          return initialValue;
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
          return onStorageError(error as Error, initialValue);
        }
        
        return initialValue;
      }
    },

    setItem: (storageKey: string, value: T) => {
      try {
        // Apply maxItems limit for arrays before saving
        let valueToSave = value;
        if (maxItems && Array.isArray(value) && value.length > maxItems) {
          valueToSave = value.slice(0, maxItems) as T;
          log(`Trimming to ${maxItems} items before save`);
        }

        const serialized = serialize(valueToSave);
        localStorage.setItem(storageKey, serialized);
        log('Saved to storage:', Array.isArray(valueToSave) ? `${valueToSave.length} items` : 'data saved');
      } catch (error) {
        logError('Error saving to storage:', error as Error);
        
        // Recovery attempt: try to save essential data only
        if (Array.isArray(value) && value.length > 0) {
          try {
            // For arrays, try saving first 10 items as recovery
            const recoveryData = value.slice(0, Math.min(10, maxItems || 10)) as T;
            const recoverySerialized = serialize(recoveryData);
            localStorage.setItem(storageKey, recoverySerialized);
            log('Recovery save successful with limited data');
          } catch (recoveryError) {
            logError('Recovery save also failed:', recoveryError as Error);
          }
        }
      }
    },

    removeItem: (storageKey: string) => {
      try {
        localStorage.removeItem(storageKey);
        log('Removed from storage');
      } catch (error) {
        logError('Error removing from storage:', error as Error);
      }
    }
  });
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
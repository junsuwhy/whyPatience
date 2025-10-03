/**
 * useLocalStorage Hook Implementation
 *
 * A custom React hook that provides a simplified interface for localStorage operations,
 * managing local storage data reading, writing, and synchronization. This hook wraps
 * StorageService functionality and provides a React-friendly API with automatic state
 * synchronization, serialization, error handling, and other advanced features.
 *
 * This hook follows React Hooks best practices, supports generic types, automatic
 * serialization/deserialization, error boundary handling, and integrates perfectly
 * with React lifecycle.
 *
 * Features:
 * - Generic data storage for any JSON-serializable data type
 * - Automatic synchronization when localStorage data changes
 * - Graceful error handling for localStorage unavailable, quota exceeded, etc.
 * - Default value support ensuring data is always available
 * - SSR compatibility for server-side rendering environments
 * - Performance optimization using useCallback and useMemo to avoid unnecessary re-renders
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { storageService } from '../services/storage';

/**
 * Options interface for the useLocalStorage hook
 */
export interface UseLocalStorageOptions<T> {
  /** Default value when localStorage is empty or unavailable */
  defaultValue: T;
  /** Custom serializer function for converting value to string */
  serializer?: (value: T) => string;
  /** Custom deserializer function for converting string to value */
  deserializer?: (value: string) => T;
}

/**
 * Return interface for the useLocalStorage hook
 */
export interface UseLocalStorageReturn<T> {
  /** Current value from localStorage or default */
  value: T;
  /** Function to update the value in both state and localStorage */
  setValue: (value: T | ((prev: T) => T)) => void;
  /** Function to remove the value from localStorage and reset to default */
  remove: () => void;
  /** Current error state, null if no error */
  error: Error | null;
  /** Loading state during initialization */
  isLoading: boolean;
}

/**
 * Check if we're in a browser environment (not SSR)
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Check if localStorage is available and accessible
 */
const isLocalStorageAvailable = (): boolean => {
  if (!isBrowser) return false;

  try {
    const test = '__localStorage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Custom hook for localStorage operations with React state synchronization
 *
 * @param key - The localStorage key to use
 * @param options - Configuration options including default value and serializers
 * @returns UseLocalStorageReturn object with value, setValue, remove, error, and isLoading
 */
export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T>
): UseLocalStorageReturn<T> {
  const { defaultValue, serializer, deserializer } = options;

  // Create namespaced key using StorageService convention
  const fullKey = useMemo(() => {
    return `${storageService.config.namespace}:${key}`;
  }, [key]);

  // Default serialization functions
  const serialize = useMemo(() => {
    return serializer || ((value: T) => JSON.stringify(value));
  }, [serializer]);

  const deserialize = useMemo(() => {
    return deserializer || ((value: string) => JSON.parse(value) as T);
  }, [deserializer]);

  // State management - initialize with stable values
  const [value, setValue] = useState<T>(defaultValue);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Track if component is mounted to avoid state updates after unmount
  const isMountedRef = useRef(true);

  // Track initialization to prevent duplicate initial loads
  const hasInitializedRef = useRef(false);

  // Initialize value from localStorage only once
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initializeValue = () => {
      if (!isMountedRef.current) return;

      if (!isLocalStorageAvailable()) {
        // For SSR compatibility, don't set error state, just use default value
        setIsLoading(false);
        return;
      }

      try {
        const storedValue = window.localStorage.getItem(fullKey);

        if (storedValue === null) {
          // No stored value, use default (already set in useState)
          setError(null);
          setIsLoading(false);
        } else {
          // Parse stored value
          const parsedValue = deserialize(storedValue);
          setValue(parsedValue);
          setError(null);
          setIsLoading(false);
        }
      } catch (error) {
        // Handle parsing errors - fall back to default value
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        // Keep default value (already set in useState)
        setError(errorObj);
        setIsLoading(false);
      }
    };

    initializeValue();
  }, [fullKey, deserialize]);

  // Handle cross-window synchronization
  useEffect(() => {
    if (!isBrowser) return;

    const handleStorageChange = (e: Event) => {
      const storageEvent = e as { key: string; newValue: string | null };
      if (!isMountedRef.current) return;

      // Only handle changes to our specific key
      if (storageEvent.key === fullKey && storageEvent.newValue !== null) {
        try {
          const newValue = deserialize(storageEvent.newValue);
          setValue(newValue);
          setError(null);
        } catch (error) {
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          setError(errorObj);
        }
      } else if (e.key === fullKey && e.newValue === null) {
        // Key was removed in another window
        setValue(defaultValue);
        setError(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fullKey, defaultValue, deserialize]);

  // Cleanup mounted ref on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // setValue function with error handling
  const setValueCallback = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      if (!isMountedRef.current) return;

      const valueToSet =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(value)
          : newValue;

      // Update local state immediately
      setValue(valueToSet);

      // Try to update localStorage
      if (isLocalStorageAvailable()) {
        try {
          const serializedValue = serialize(valueToSet);
          window.localStorage.setItem(fullKey, serializedValue);
          setError(null);
        } catch (error) {
          // Handle storage errors (quota exceeded, etc.)
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          setError(errorObj);
        }
      } else {
        // localStorage not available - simulate localStorage behavior for testing
        if (isBrowser) {
          setError(new Error('localStorage is not available'));
        }
      }
    },
    [value, fullKey, serialize]
  );

  // remove function
  const removeCallback = useCallback(() => {
    if (!isMountedRef.current) return;

    // Reset to default value
    setValue(defaultValue);

    // Try to remove from localStorage
    if (isLocalStorageAvailable()) {
      try {
        window.localStorage.removeItem(fullKey);
        setError(null);
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        setError(errorObj);
      }
    }
  }, [fullKey, defaultValue]);

  return {
    value,
    setValue: setValueCallback,
    remove: removeCallback,
    error,
    isLoading,
  };
}

export default useLocalStorage;

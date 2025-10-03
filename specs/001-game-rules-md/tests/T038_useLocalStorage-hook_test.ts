/**
 * Test file for T038 useLocalStorage Hook Implementation
 * Tests for src/hooks/useLocalStorage.ts
 * 
 * This test follows TDD principles and should FAIL until the hook is implemented.
 * Tests cover all scenarios mentioned in the task requirements:
 * - Basic functionality (read, write, remove)
 * - Error handling (localStorage unavailable, quota exceeded, JSON parse errors)
 * - Cross-window synchronization
 * - Performance optimizations
 * - Type safety
 */

import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../src/hooks/useLocalStorage';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

// Mock storage service
jest.mock('../../src/services/storage', () => ({
  storageService: {
    config: {
      namespace: 'whyPatience'
    }
  }
}));

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    // Reset localStorage mock before each test
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Mock localStorage on window object
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  describe('Basic Functionality', () => {
    test('should initialize with default value when localStorage is empty', () => {
      const { result } = renderHook(() => 
        useLocalStorage('test-key', { defaultValue: 'default' })
      );

      expect(result.current.value).toBe('default');
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    test('should load existing value from localStorage on initialization', () => {
      const testValue = { name: 'test', count: 42 };
      localStorageMock.setItem('whyPatience:test-key', JSON.stringify(testValue));

      const { result } = renderHook(() => 
        useLocalStorage('test-key', { defaultValue: null })
      );

      expect(result.current.value).toEqual(testValue);
    });

    test('should update both state and localStorage when setValue is called', () => {
      const { result } = renderHook(() => 
        useLocalStorage('test-key', { defaultValue: 'initial' })
      );

      act(() => {
        result.current.setValue('updated');
      });

      expect(result.current.value).toBe('updated');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'whyPatience:test-key', 
        JSON.stringify('updated')
      );
    });

    test('should support function-based setValue updates', () => {
      const { result } = renderHook(() => 
        useLocalStorage('counter', { defaultValue: 0 })
      );

      act(() => {
        result.current.setValue(prev => prev + 1);
      });

      expect(result.current.value).toBe(1);
    });

    test('should remove value and reset to default when remove is called', () => {
      localStorageMock.setItem('whyPatience:test-key', JSON.stringify('stored'));
      
      const { result } = renderHook(() => 
        useLocalStorage('test-key', { defaultValue: 'default' })
      );

      act(() => {
        result.current.remove();
      });

      expect(result.current.value).toBe('default');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('whyPatience:test-key');
    });
  });

  describe('Error Handling', () => {
    test('should handle localStorage not available gracefully', () => {
      // Mock localStorage to throw error
      const errorMock = jest.fn(() => {
        throw new Error('localStorage is not available');
      });
      localStorageMock.getItem = errorMock;
      localStorageMock.setItem = errorMock;

      const { result } = renderHook(() => 
        useLocalStorage('test-key', { defaultValue: 'fallback' })
      );

      expect(result.current.value).toBe('fallback');
      expect(result.current.error).toBeDefined();

      // setValue should not crash
      act(() => {
        result.current.setValue('new-value');
      });

      expect(result.current.value).toBe('new-value'); // State should still update
    });

    test('should handle QuotaExceededError when localStorage is full', () => {
      const quotaError = new DOMException('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';
      
      localStorageMock.setItem = jest.fn(() => {
        throw quotaError;
      });

      const { result } = renderHook(() => 
        useLocalStorage('test-key', { defaultValue: 'default' })
      );

      act(() => {
        result.current.setValue('large-value');
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.name).toBe('QuotaExceededError');
    });

    test('should handle JSON parse errors gracefully', () => {
      // Set invalid JSON in localStorage
      localStorageMock.setItem('whyPatience:test-key', 'invalid-json{');

      const { result } = renderHook(() => 
        useLocalStorage('test-key', { defaultValue: 'fallback' })
      );

      expect(result.current.value).toBe('fallback');
      expect(result.current.error).toBeDefined();
    });
  });

  describe('Custom Serialization', () => {
    test('should use custom serializer and deserializer when provided', () => {
      const customSerializer = jest.fn((value: Date) => value.toISOString());
      const customDeserializer = jest.fn((value: string) => new Date(value));

      const testDate = new Date('2023-01-01T00:00:00.000Z');

      const { result } = renderHook(() => 
        useLocalStorage('date-key', { 
          defaultValue: testDate,
          serializer: customSerializer,
          deserializer: customDeserializer
        })
      );

      act(() => {
        result.current.setValue(testDate);
      });

      expect(customSerializer).toHaveBeenCalledWith(testDate);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'whyPatience:date-key',
        testDate.toISOString()
      );
    });
  });

  describe('Cross-window Synchronization', () => {
    test('should update state when storage event is fired from another window', () => {
      const { result } = renderHook(() => 
        useLocalStorage('sync-key', { defaultValue: 'initial' })
      );

      // Simulate storage event from another window
      const storageEvent = new StorageEvent('storage', {
        key: 'whyPatience:sync-key',
        newValue: JSON.stringify('updated-from-other-window'),
        oldValue: JSON.stringify('initial'),
        url: window.location.href
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      expect(result.current.value).toBe('updated-from-other-window');
    });

    test('should ignore storage events for different keys', () => {
      const { result } = renderHook(() => 
        useLocalStorage('sync-key', { defaultValue: 'initial' })
      );

      const storageEvent = new StorageEvent('storage', {
        key: 'whyPatience:different-key',
        newValue: JSON.stringify('other-value'),
        oldValue: null,
        url: window.location.href
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      expect(result.current.value).toBe('initial'); // Should remain unchanged
    });
  });

  describe('Performance Optimizations', () => {
    test('setValue function should have stable reference', () => {
      const { result, rerender } = renderHook(() => 
        useLocalStorage('test-key', { defaultValue: 'initial' })
      );

      const firstSetValue = result.current.setValue;
      
      rerender();
      
      const secondSetValue = result.current.setValue;

      expect(firstSetValue).toBe(secondSetValue);
    });

    test('remove function should have stable reference', () => {
      const { result, rerender } = renderHook(() => 
        useLocalStorage('test-key', { defaultValue: 'initial' })
      );

      const firstRemove = result.current.remove;
      
      rerender();
      
      const secondRemove = result.current.remove;

      expect(firstRemove).toBe(secondRemove);
    });

    test('should not cause unnecessary re-renders', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = () => {
        const storage = useLocalStorage('test-key', { defaultValue: 'initial' });
        renderSpy();
        return null;
      };

      const { rerender } = renderHook(() => <TestComponent />);

      const initialRenderCount = renderSpy.mock.calls.length;
      
      // Multiple rerenders should not increase render count if no dependencies changed
      rerender();
      rerender();
      
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
    });
  });

  describe('Type Safety', () => {
    test('should properly infer and maintain types', () => {
      type TestType = { id: number; name: string };
      const defaultValue: TestType = { id: 1, name: 'test' };

      const { result } = renderHook(() => 
        useLocalStorage('typed-key', { defaultValue })
      );

      // TypeScript should enforce correct types
      expect(typeof result.current.value.id).toBe('number');
      expect(typeof result.current.value.name).toBe('string');

      act(() => {
        result.current.setValue({ id: 2, name: 'updated' });
      });

      expect(result.current.value).toEqual({ id: 2, name: 'updated' });
    });
  });

  describe('SSR Compatibility', () => {
    test('should handle server-side rendering environment', () => {
      // Mock window as undefined (SSR environment)
      const originalWindow = global.window;
      delete (global as any).window;

      const { result } = renderHook(() => 
        useLocalStorage('ssr-key', { defaultValue: 'ssr-default' })
      );

      expect(result.current.value).toBe('ssr-default');
      expect(result.current.error).toBeNull();

      // Restore window
      global.window = originalWindow;
    });
  });
});
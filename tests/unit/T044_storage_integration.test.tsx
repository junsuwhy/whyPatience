/**
 * T044 Storage Integration Unit Tests
 * Tests for StorageContext, throttle utility, and error handling
 */

import React, { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { StorageProvider, useStorage } from '../../src/context/StorageContext';
import { StorageService } from '../../src/services/storage';
import { throttle } from '../../src/utils/throttle';
import { UserPreferences, DEFAULT_USER_PREFERENCES } from '../../src/types/preferences';
import { GameState, OverallStatistics } from '../../src/types/game-state';

// Mock StorageService
jest.mock('../../src/services/storage');
const MockedStorageService = StorageService as jest.MockedClass<typeof StorageService>;

// Mock throttle utility
jest.mock('../../src/utils/throttle');
const mockedThrottle = throttle as jest.MockedFunction<typeof throttle>;

describe('T044 Storage Integration Unit Tests', () => {
  let mockStorageService: jest.Mocked<StorageService>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageService = {
      loadPreferences: jest.fn(),
      savePreferences: jest.fn(),
      loadStatistics: jest.fn(),
      updateGameResult: jest.fn(),
      loadGameState: jest.fn(),
      saveGameState: jest.fn(),
      clearAllData: jest.fn(),
    } as jest.Mocked<StorageService>;
    
    MockedStorageService.mockImplementation(() => mockStorageService);
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <StorageProvider>{children}</StorageProvider>
  );

  describe('StorageContext Provider', () => {
    test('should load preferences and statistics on initialization', async () => {
      const mockPreferences: UserPreferences = {
        ...DEFAULT_USER_PREFERENCES,
        display: { ...DEFAULT_USER_PREFERENCES.display, theme: 'dark' }
      };
      
      const mockStatistics: OverallStatistics = {
        gamesPlayed: 5,
        gamesWon: 2,
        winRate: 40,
        averageTime: 300,
        bestTime: 150,
        totalTime: 1500,
        bestScore: 2000,
        averageScore: 1200
      };

      mockStorageService.loadPreferences.mockResolvedValue(mockPreferences);
      mockStorageService.loadStatistics.mockResolvedValue(mockStatistics);

      const { result } = renderHook(() => useStorage(), { wrapper });

      // Wait for async loading to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.preferences).toEqual(mockPreferences);
      expect(result.current.statistics).toEqual(mockStatistics);
      expect(mockStorageService.loadPreferences).toHaveBeenCalledTimes(1);
      expect(mockStorageService.loadStatistics).toHaveBeenCalledTimes(1);
    });

    test('should handle preferences loading errors gracefully', async () => {
      const mockError = new Error('PERMISSION_DENIED');
      mockStorageService.loadPreferences.mockRejectedValue(mockError);
      mockStorageService.loadStatistics.mockResolvedValue({} as OverallStatistics);

      const { result } = renderHook(() => useStorage(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.lastError).toBe(mockError);
      expect(result.current.preferences).toBeDefined(); // Should have default values
    });

    test('should update preferences with debounced saving', async () => {
      const mockDebounceCallback = jest.fn();
      mockedThrottle.mockImplementation((fn) => {
        mockDebounceCallback.mockImplementation(fn);
        return mockDebounceCallback;
      });

      mockStorageService.loadPreferences.mockResolvedValue({} as UserPreferences);
      mockStorageService.loadStatistics.mockResolvedValue({} as OverallStatistics);

      const { result } = renderHook(() => useStorage(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        result.current.updatePreferences({ theme: 'dark' });
      });

      expect(mockDebounceCallback).toHaveBeenCalled();
    });

    test('should provide error clearing functionality', async () => {
      const mockError = new Error('Test error');
      mockStorageService.loadPreferences.mockRejectedValue(mockError);
      mockStorageService.loadStatistics.mockResolvedValue({} as OverallStatistics);

      const { result } = renderHook(() => useStorage(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.lastError).toBe(mockError);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.lastError).toBeNull();
    });
  });

  describe('Storage Error Handling', () => {
    test('should handle QUOTA_EXCEEDED error', async () => {
      const quotaError = new Error('QUOTA_EXCEEDED');
      mockStorageService.savePreferences.mockRejectedValue(quotaError);
      mockStorageService.loadPreferences.mockResolvedValue({} as UserPreferences);
      mockStorageService.loadStatistics.mockResolvedValue({} as OverallStatistics);

      const { result } = renderHook(() => useStorage(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        result.current.updatePreferences({ theme: 'dark' });
      });

      expect(result.current.lastError).toBe(quotaError);
    });

    test('should handle DATA_CORRUPTION error', async () => {
      const corruptionError = new Error('DATA_CORRUPTION');
      mockStorageService.loadStatistics.mockRejectedValue(corruptionError);
      mockStorageService.loadPreferences.mockResolvedValue({} as UserPreferences);

      const { result } = renderHook(() => useStorage(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.lastError).toBe(corruptionError);
    });

    test('should handle PERMISSION_DENIED error', async () => {
      const permissionError = new Error('PERMISSION_DENIED');
      mockStorageService.saveGameState.mockRejectedValue(permissionError);
      mockStorageService.loadPreferences.mockResolvedValue({} as UserPreferences);
      mockStorageService.loadStatistics.mockResolvedValue({} as OverallStatistics);

      const { result } = renderHook(() => useStorage(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const mockGameState = {} as GameState;
      
      await act(async () => {
        result.current.saveGameState(mockGameState);
      });

      expect(result.current.lastError).toBe(permissionError);
    });
  });

  describe('Game State Saving with Throttling', () => {
    test('should throttle multiple quick saveGameState calls', async () => {
      let throttledCallback: Function | null = null;
      
      mockedThrottle.mockImplementation((fn, delay) => {
        throttledCallback = fn;
        const throttledFn = jest.fn();
        // Simulate throttling by only calling the function once
        throttledFn.mockImplementation((...args) => {
          if (throttledCallback) {
            throttledCallback(...args);
          }
        });
        return throttledFn;
      });

      mockStorageService.loadPreferences.mockResolvedValue({} as UserPreferences);
      mockStorageService.loadStatistics.mockResolvedValue({} as OverallStatistics);

      const { result } = renderHook(() => useStorage(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const mockGameState = {} as GameState;

      // Make multiple quick calls
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          result.current.saveGameState(mockGameState);
        }
      });

      // Verify throttling was applied
      expect(mockedThrottle).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    test('should respect autoSave preference setting', async () => {
      const mockPreferences: UserPreferences = {
        ...DEFAULT_USER_PREFERENCES,
        gameplay: { ...DEFAULT_USER_PREFERENCES.gameplay, autoSave: false } // Auto-save disabled
      };

      mockStorageService.loadPreferences.mockResolvedValue(mockPreferences);
      mockStorageService.loadStatistics.mockResolvedValue({} as OverallStatistics);

      const { result } = renderHook(() => useStorage(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const mockGameState = {} as GameState;

      await act(async () => {
        result.current.saveGameState(mockGameState);
      });

      // Should not save when autoSave is false
      expect(mockStorageService.saveGameState).not.toHaveBeenCalled();
    });
  });

  describe('Statistics Management', () => {
    test('should refresh statistics on demand', async () => {
      const initialStats = { gamesPlayed: 5 } as OverallStatistics;
      const updatedStats = { gamesPlayed: 6 } as OverallStatistics;

      mockStorageService.loadPreferences.mockResolvedValue({} as UserPreferences);
      mockStorageService.loadStatistics
        .mockResolvedValueOnce(initialStats)
        .mockResolvedValueOnce(updatedStats);

      const { result } = renderHook(() => useStorage(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.statistics).toEqual(initialStats);

      await act(async () => {
        result.current.refreshStatistics();
      });

      expect(result.current.statistics).toEqual(updatedStats);
      expect(mockStorageService.loadStatistics).toHaveBeenCalledTimes(2);
    });

    test('should update game result and refresh statistics', async () => {
      mockStorageService.loadPreferences.mockResolvedValue({} as UserPreferences);
      mockStorageService.loadStatistics.mockResolvedValue({} as OverallStatistics);
      mockStorageService.updateGameResult.mockResolvedValue();

      const { result } = renderHook(() => useStorage(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        result.current.updateGameResult(true, 50, 300000);
      });

      expect(mockStorageService.updateGameResult).toHaveBeenCalledWith(true, 50, 300000);
      expect(mockStorageService.loadStatistics).toHaveBeenCalledTimes(2); // Initial load + refresh after update
    });
  });
});
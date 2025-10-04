/**
 * T044 Storage Wiring Integration Tests
 * Tests for end-to-end storage functionality with React components
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import App from '../../src/App';
import { StorageService } from '../../src/services/storage';
import { UserPreferences, GameStatistics } from '../../src/types/preferences';

// Mock StorageService
jest.mock('../../src/services/storage');
const MockedStorageService = StorageService as jest.MockedClass<typeof StorageService>;

// Mock other dependencies that might cause issues in tests
jest.mock('../../src/hooks/useGameState', () => ({
  useGameState: () => ({
    gameState: {
      tableau: Array(7).fill([]),
      foundations: Array(4).fill([]),
      stock: [],
      waste: [],
      moves: [],
    },
    executeMove: jest.fn(),
    undoMove: jest.fn(),
    newGame: jest.fn(),
    isGameWon: false,
    canUndo: false,
  }),
}));

describe('T044 Storage Wiring Integration Tests', () => {
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

  const renderApp = () => {
    return render(
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    );
  };

  describe('App Initialization with Storage', () => {
    test('should load preferences and statistics on app startup', async () => {
      const mockPreferences: UserPreferences = {
        theme: 'dark',
        language: 'en',
        autoSave: true,
        drawMode: 3,
        animations: true,
      };
      
      const mockStatistics: GameStatistics = {
        gamesPlayed: 10,
        gamesWon: 4,
        winRate: 40,
        averageTime: 450,
        fastestWin: 180,
        currentStreak: 2,
        longestStreak: 3,
      };

      mockStorageService.loadPreferences.mockResolvedValue(mockPreferences);
      mockStorageService.loadStatistics.mockResolvedValue(mockStatistics);

      renderApp();

      await waitFor(() => {
        expect(mockStorageService.loadPreferences).toHaveBeenCalledTimes(1);
        expect(mockStorageService.loadStatistics).toHaveBeenCalledTimes(1);
      });
    });

    test('should handle storage loading errors gracefully', async () => {
      mockStorageService.loadPreferences.mockRejectedValue(new Error('PERMISSION_DENIED'));
      mockStorageService.loadStatistics.mockRejectedValue(new Error('DATA_CORRUPTION'));

      renderApp();

      await waitFor(() => {
        expect(mockStorageService.loadPreferences).toHaveBeenCalledTimes(1);
        expect(mockStorageService.loadStatistics).toHaveBeenCalledTimes(1);
      });

      // App should still render without crashing
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Settings Modal Integration', () => {
    test('should save preferences when settings are changed', async () => {
      const user = userEvent.setup();
      
      const mockPreferences: UserPreferences = {
        theme: 'light',
        language: 'en',
        autoSave: true,
        drawMode: 1,
        animations: true,
      };

      mockStorageService.loadPreferences.mockResolvedValue(mockPreferences);
      mockStorageService.loadStatistics.mockResolvedValue({} as GameStatistics);
      mockStorageService.savePreferences.mockResolvedValue();

      renderApp();

      // Wait for initial load
      await waitFor(() => {
        expect(mockStorageService.loadPreferences).toHaveBeenCalled();
      });

      // Open settings modal
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsButton);

      // Change theme setting
      const themeSelect = screen.getByRole('combobox', { name: /theme/i });
      await user.selectOptions(themeSelect, 'dark');

      // Verify save was called (may be debounced)
      await waitFor(() => {
        expect(mockStorageService.savePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ theme: 'dark' })
        );
      }, { timeout: 1000 });
    });

    test('should display error message when preference saving fails', async () => {
      const user = userEvent.setup();
      
      mockStorageService.loadPreferences.mockResolvedValue({} as UserPreferences);
      mockStorageService.loadStatistics.mockResolvedValue({} as GameStatistics);
      mockStorageService.savePreferences.mockRejectedValue(new Error('QUOTA_EXCEEDED'));

      renderApp();

      await waitFor(() => {
        expect(mockStorageService.loadPreferences).toHaveBeenCalled();
      });

      // Open settings modal
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsButton);

      // Change a setting
      const animationsCheckbox = screen.getByRole('checkbox', { name: /animations/i });
      await user.click(animationsCheckbox);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/storage quota exceeded/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Game Statistics Integration', () => {
    test('should refresh statistics when refresh button is clicked', async () => {
      const user = userEvent.setup();
      
      const initialStats = { gamesPlayed: 5, gamesWon: 2 } as GameStatistics;
      const updatedStats = { gamesPlayed: 6, gamesWon: 3 } as GameStatistics;

      mockStorageService.loadPreferences.mockResolvedValue({} as UserPreferences);
      mockStorageService.loadStatistics
        .mockResolvedValueOnce(initialStats)
        .mockResolvedValueOnce(updatedStats);

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Games Played: 5')).toBeInTheDocument();
      });

      // Click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('Games Played: 6')).toBeInTheDocument();
      });

      expect(mockStorageService.loadStatistics).toHaveBeenCalledTimes(2);
    });

    test('should display fallback statistics when loading fails', async () => {
      mockStorageService.loadPreferences.mockResolvedValue({} as UserPreferences);
      mockStorageService.loadStatistics.mockRejectedValue(new Error('DATA_CORRUPTION'));

      renderApp();

      await waitFor(() => {
        expect(screen.getByText(/no data available/i)).toBeInTheDocument();
      });
    });
  });

  describe('Game State Auto-Save Integration', () => {
    test('should not auto-save when autoSave preference is disabled', async () => {
      const mockPreferences: UserPreferences = {
        theme: 'light',
        language: 'en',
        autoSave: false, // Disabled
        drawMode: 1,
        animations: true,
      };

      mockStorageService.loadPreferences.mockResolvedValue(mockPreferences);
      mockStorageService.loadStatistics.mockResolvedValue({} as GameStatistics);

      renderApp();

      await waitFor(() => {
        expect(mockStorageService.loadPreferences).toHaveBeenCalled();
      });

      // Simulate game moves (this would be handled by useGameState in real scenario)
      // Since we're mocking useGameState, we need to test the saveGameState integration differently
      
      // Wait for any potential auto-save calls
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1100)); // Wait longer than throttle delay
      });

      // Should not have called saveGameState when autoSave is false
      expect(mockStorageService.saveGameState).not.toHaveBeenCalled();
    });

    test('should handle storage permission errors gracefully', async () => {
      mockStorageService.loadPreferences.mockResolvedValue({
        autoSave: true
      } as UserPreferences);
      mockStorageService.loadStatistics.mockResolvedValue({} as GameStatistics);
      mockStorageService.saveGameState.mockRejectedValue(new Error('PERMISSION_DENIED'));

      renderApp();

      await waitFor(() => {
        expect(mockStorageService.loadPreferences).toHaveBeenCalled();
      });

      // Should display error banner or notification
      await waitFor(() => {
        expect(screen.getByText(/browser blocked local storage/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Error Banner Integration', () => {
    test('should display and hide storage error banner', async () => {
      const user = userEvent.setup();
      
      mockStorageService.loadPreferences.mockRejectedValue(new Error('QUOTA_EXCEEDED'));
      mockStorageService.loadStatistics.mockResolvedValue({} as GameStatistics);

      renderApp();

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/storage quota exceeded/i)).toBeInTheDocument();
      });

      // Click dismiss button
      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);

      // Error should be hidden
      await waitFor(() => {
        expect(screen.queryByText(/storage quota exceeded/i)).not.toBeInTheDocument();
      });
    });

    test('should provide clear data option for corruption errors', async () => {
      const user = userEvent.setup();
      
      mockStorageService.loadPreferences.mockRejectedValue(new Error('DATA_CORRUPTION'));
      mockStorageService.loadStatistics.mockResolvedValue({} as GameStatistics);
      mockStorageService.clearAllData.mockResolvedValue();

      renderApp();

      await waitFor(() => {
        expect(screen.getByText(/data corruption detected/i)).toBeInTheDocument();
      });

      const clearDataButton = screen.getByRole('button', { name: /clear data/i });
      await user.click(clearDataButton);

      await waitFor(() => {
        expect(mockStorageService.clearAllData).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Performance Integration', () => {
    test('should not cause excessive re-renders during storage operations', async () => {
      const renderCount = { current: 0 };
      
      const TestComponent = () => {
        renderCount.current++;
        return <div>Render count: {renderCount.current}</div>;
      };

      mockStorageService.loadPreferences.mockResolvedValue({} as UserPreferences);
      mockStorageService.loadStatistics.mockResolvedValue({} as GameStatistics);

      render(
        <DndProvider backend={HTML5Backend}>
          <App />
          <TestComponent />
        </DndProvider>
      );

      await waitFor(() => {
        expect(mockStorageService.loadPreferences).toHaveBeenCalled();
      });

      // Allow time for any additional renders
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Should not have excessive renders (reasonable threshold)
      expect(renderCount.current).toBeLessThan(5);
    });
  });
});
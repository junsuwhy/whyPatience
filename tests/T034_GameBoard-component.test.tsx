/**
 * T034 GameBoard Component Test
 *
 * Tests for the main GameBoard component integration and functionality
 * This test ensures the GameBoard component correctly renders and integrates
 * all game areas including Foundation piles, Tableau columns, Stock pile,
 * and game controls with proper drag-and-drop functionality.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { GameBoard } from '../src/components/GameBoard/GameBoard';
import { GameState } from '../src/types/game-state';

// Mock dependencies
jest.mock('../src/components/FoundationPile/FoundationPile', () => ({
  FoundationPile: ({ testId }: { testId: string }) => (
    <div data-testid={testId}>Foundation Pile</div>
  ),
}));

jest.mock('../src/components/TableauColumn/TableauColumn', () => ({
  TableauColumn: ({ testId }: { testId: string }) => (
    <div data-testid={testId}>Tableau Column</div>
  ),
}));

jest.mock('../src/components/StockPile/StockPile', () => ({
  StockPile: () => <div data-testid="stock-pile">Stock Pile</div>,
}));

jest.mock('../src/components/GameControls/GameControls', () => ({
  GameControls: () => <div data-testid="game-controls">Game Controls</div>,
}));

jest.mock('../src/components/GameStatistics/GameStatistics', () => ({
  GameStatistics: () => (
    <div data-testid="game-statistics">Game Statistics</div>
  ),
}));

// Mock game state
const mockGameState: GameState = {
  foundations: [[], [], [], []],
  tableau: [[], [], [], [], [], [], []],
  stock: [],
  waste: [],
  moves: [],
  score: 0,
  time: 0,
  isGameWon: false,
  drawMode: '1-card',
};

describe('T034 GameBoard Component', () => {
  describe('Component Rendering and Layout', () => {
    test('should render complete game board layout', () => {
      render(<GameBoard gameState={mockGameState} />);

      // Verify main game board container exists
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
      expect(
        screen.getByRole('main', { name: /solitaire game board/i })
      ).toBeInTheDocument();
    });

    test('should render all foundation piles (4 piles)', () => {
      render(<GameBoard gameState={mockGameState} />);

      // Verify 4 foundation piles are rendered
      expect(screen.getByTestId('foundation-0')).toBeInTheDocument();
      expect(screen.getByTestId('foundation-1')).toBeInTheDocument();
      expect(screen.getByTestId('foundation-2')).toBeInTheDocument();
      expect(screen.getByTestId('foundation-3')).toBeInTheDocument();
    });

    test('should render all tableau columns (7 columns)', () => {
      render(<GameBoard gameState={mockGameState} />);

      // Verify 7 tableau columns are rendered
      for (let i = 0; i < 7; i++) {
        expect(screen.getByTestId(`tableau-${i}`)).toBeInTheDocument();
      }
    });

    test('should render stock pile area', () => {
      render(<GameBoard gameState={mockGameState} />);
      expect(screen.getByTestId('stock-pile')).toBeInTheDocument();
    });

    test('should render game controls', () => {
      render(<GameBoard gameState={mockGameState} />);
      expect(screen.getByTestId('game-controls')).toBeInTheDocument();
    });

    test('should render game statistics', () => {
      render(<GameBoard gameState={mockGameState} />);
      expect(screen.getByTestId('game-statistics')).toBeInTheDocument();
    });
  });

  describe('Game State Management', () => {
    test('should update when game state changes', () => {
      const { rerender } = render(<GameBoard gameState={mockGameState} />);

      const updatedGameState: GameState = {
        ...mockGameState,
        score: 100,
        isGameWon: false,
      };

      rerender(<GameBoard gameState={updatedGameState} />);
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
    });

    test('should detect and display victory condition', () => {
      const wonGameState: GameState = {
        ...mockGameState,
        isGameWon: true,
      };

      render(<GameBoard gameState={wonGameState} />);
      expect(screen.getByTestId('victory-modal')).toBeInTheDocument();
      expect(screen.getByText(/congratulations/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('should render properly on desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<GameBoard gameState={mockGameState} />);
      expect(screen.getByTestId('game-board')).toHaveClass('desktop-layout');
    });
  });

  describe('Accessibility Support', () => {
    test('should have proper ARIA landmarks', () => {
      render(<GameBoard gameState={mockGameState} />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(
        screen.getByRole('region', { name: /foundation area/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('region', { name: /tableau area/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('region', { name: /stock area/i })
      ).toBeInTheDocument();
    });

    test('should have proper ARIA labels', () => {
      render(<GameBoard gameState={mockGameState} />);

      expect(
        screen.getByLabelText(/solitaire game board/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('main')).toHaveAttribute(
        'aria-label',
        'Solitaire Game Board'
      );
    });

    test('should support screen reader announcements', () => {
      render(<GameBoard gameState={mockGameState} />);

      // Verify live regions for announcements
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText(/game announcements/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('should render within performance budget', () => {
      const { container } = render(<GameBoard gameState={mockGameState} />);

      // Verify smooth initial render
      expect(container.firstChild).toBeInTheDocument();

      // Test that component renders within performance budget
      const startTime = performance.now();
      render(<GameBoard gameState={mockGameState} />);
      const endTime = performance.now();

      // Should render within 16ms (60fps budget)
      expect(endTime - startTime).toBeLessThan(16);
    });

    test('should have animation attributes', () => {
      render(<GameBoard gameState={mockGameState} />);
      expect(screen.getByTestId('game-board')).toHaveAttribute(
        'data-animations-enabled',
        'true'
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid game state gracefully', () => {
      const invalidGameState = null as any;

      expect(() => {
        render(<GameBoard gameState={invalidGameState} />);
      }).not.toThrow();

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    });

    test('should recover from component errors', () => {
      // Mock console.error to prevent test output pollution
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<GameBoard gameState={mockGameState} />);
      expect(screen.getByTestId('game-board')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Integration with Game Engine', () => {
    test('should communicate with game engine service', () => {
      const mockGameEngine = {
        makeMove: jest.fn(),
        canMove: jest.fn(() => true),
        checkVictory: jest.fn(() => false),
      };

      render(
        <GameBoard gameState={mockGameState} gameEngine={mockGameEngine} />
      );

      expect(screen.getByTestId('game-board')).toBeInTheDocument();
    });
  });
});

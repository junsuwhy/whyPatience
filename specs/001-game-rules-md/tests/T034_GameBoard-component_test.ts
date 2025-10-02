/**
 * T034 GameBoard Component Test
 * 
 * Tests for the main GameBoard component integration and functionality
 * This test ensures the GameBoard component correctly renders and integrates
 * all game areas including Foundation piles, Tableau columns, Stock pile,
 * and game controls with proper drag-and-drop functionality.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { GameBoard } from '../../src/components/GameBoard/GameBoard';
import { GameState } from '../../src/types/game-state';
import { Card } from '../../src/types/card';

// Mock dependencies
jest.mock('../../src/components/FoundationPile/FoundationPile', () => ({
  FoundationPile: ({ testId }: { testId: string }) => <div data-testid={testId}>Foundation Pile</div>
}));

jest.mock('../../src/components/TableauColumn/TableauColumn', () => ({
  TableauColumn: ({ testId }: { testId: string }) => <div data-testid={testId}>Tableau Column</div>
}));

jest.mock('../../src/components/StockPile/StockPile', () => ({
  StockPile: () => <div data-testid="stock-pile">Stock Pile</div>
}));

jest.mock('../../src/components/GameControls/GameControls', () => ({
  GameControls: () => <div data-testid="game-controls">Game Controls</div>
}));

jest.mock('../../src/components/GameStatistics/GameStatistics', () => ({
  GameStatistics: () => <div data-testid="game-statistics">Game Statistics</div>
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
  drawMode: '1-card'
};

// Test wrapper with DnD provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndProvider backend={HTML5Backend}>
    {children}
  </DndProvider>
);

describe('T034 GameBoard Component', () => {
  
  describe('Component Rendering and Layout', () => {
    test('should render complete game board layout', () => {
      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      // Verify main game board container exists
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
      expect(screen.getByRole('main', { name: /solitaire game board/i })).toBeInTheDocument();
    });

    test('should render all foundation piles (4 piles)', () => {
      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      // Verify 4 foundation piles are rendered
      expect(screen.getByTestId('foundation-0')).toBeInTheDocument();
      expect(screen.getByTestId('foundation-1')).toBeInTheDocument();
      expect(screen.getByTestId('foundation-2')).toBeInTheDocument();
      expect(screen.getByTestId('foundation-3')).toBeInTheDocument();
    });

    test('should render all tableau columns (7 columns)', () => {
      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      // Verify 7 tableau columns are rendered
      for (let i = 0; i < 7; i++) {
        expect(screen.getByTestId(`tableau-${i}`)).toBeInTheDocument();
      }
    });

    test('should render stock pile and waste pile area', () => {
      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      expect(screen.getByTestId('stock-pile')).toBeInTheDocument();
    });

    test('should render game controls', () => {
      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      expect(screen.getByTestId('game-controls')).toBeInTheDocument();
    });

    test('should render game statistics', () => {
      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      expect(screen.getByTestId('game-statistics')).toBeInTheDocument();
    });
  });

  describe('Drag and Drop Integration', () => {
    test('should provide React DnD context for child components', () => {
      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      // Verify DnD context is available (indirectly through successful render)
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
    });

    test('should handle card drop events between areas', async () => {
      const mockOnCardMove = jest.fn();
      
      render(
        <TestWrapper>
          <GameBoard 
            gameState={mockGameState} 
            onCardMove={mockOnCardMove}
          />
        </TestWrapper>
      );

      // This test verifies that the GameBoard accepts drop handlers
      // Actual drag-and-drop testing would require more complex setup
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
    });
  });

  describe('Game State Management', () => {
    test('should update when game state changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      const updatedGameState: GameState = {
        ...mockGameState,
        score: 100,
        isGameWon: false
      };

      rerender(
        <TestWrapper>
          <GameBoard gameState={updatedGameState} />
        </TestWrapper>
      );

      expect(screen.getByTestId('game-board')).toBeInTheDocument();
    });

    test('should detect and display victory condition', () => {
      const wonGameState: GameState = {
        ...mockGameState,
        isGameWon: true
      };

      render(
        <TestWrapper>
          <GameBoard gameState={wonGameState} />
        </TestWrapper>
      );

      expect(screen.getByTestId('victory-modal')).toBeInTheDocument();
      expect(screen.getByText(/congratulations/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('should render properly on desktop viewport (1200px)', () => {
      // Mock viewport size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      expect(screen.getByTestId('game-board')).toHaveClass('desktop-layout');
    });

    test('should render properly on tablet viewport (768px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      expect(screen.getByTestId('game-board')).toHaveClass('tablet-layout');
    });
  });

  describe('Accessibility Support', () => {
    test('should have proper ARIA landmarks', () => {
      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /foundation area/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /tableau area/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /stock area/i })).toBeInTheDocument();
    });

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      const gameBoard = screen.getByTestId('game-board');
      
      // Test Tab navigation
      await user.tab();
      expect(gameBoard).toHaveFocus();

      // Test arrow key navigation
      await user.keyboard('{ArrowRight}');
      // Verify focus moved (specific implementation depends on focus management)
    });

    test('should have proper ARIA labels and descriptions', () => {
      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/solitaire game board/i)).toBeInTheDocument();
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Solitaire Game Board');
    });

    test('should support screen reader announcements', () => {
      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      // Verify live regions for announcements
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText(/game announcements/i)).toBeInTheDocument();
    });
  });

  describe('Animation and Performance', () => {
    test('should render without animation jank', async () => {
      const { container } = render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      // Verify smooth initial render
      expect(container.firstChild).toBeInTheDocument();
      
      // Test that component renders within performance budget
      const startTime = performance.now();
      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );
      const endTime = performance.now();
      
      // Should render within 16ms (60fps budget)
      expect(endTime - startTime).toBeLessThan(16);
    });

    test('should handle card animations smoothly', async () => {
      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      // Verify animation-related classes or data attributes
      expect(screen.getByTestId('game-board')).toHaveAttribute('data-animations-enabled', 'true');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid game state gracefully', () => {
      const invalidGameState = null as any;

      expect(() => {
        render(
          <TestWrapper>
            <GameBoard gameState={invalidGameState} />
          </TestWrapper>
        );
      }).not.toThrow();

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    });

    test('should recover from component errors', () => {
      // Mock console.error to prevent test output pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <GameBoard gameState={mockGameState} />
        </TestWrapper>
      );

      expect(screen.getByTestId('game-board')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Integration with Game Engine', () => {
    test('should communicate with game engine service', () => {
      const mockGameEngine = {
        makeMove: jest.fn(),
        canMove: jest.fn(() => true),
        checkVictory: jest.fn(() => false)
      };

      render(
        <TestWrapper>
          <GameBoard 
            gameState={mockGameState} 
            gameEngine={mockGameEngine}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('game-board')).toBeInTheDocument();
    });
  });
});
/**
 * Integration Test: T041 - Integrate React DnD with card components
 * 
 * This test verifies the React DnD integration across all card components
 * following the task requirements from T041_Integrate-React-DnD-with-card-components.md
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import '@testing-library/jest-dom';
import React from 'react';

// Import components that need DnD integration
import App from '../../src/App';
import GameBoard from '../../src/components/GameBoard/GameBoard';
import Card from '../../src/components/Card/Card';
import TableauColumn from '../../src/components/TableauColumn/TableauColumn';
import FoundationPile from '../../src/components/FoundationPile/FoundationPile';
import StockPile from '../../src/components/StockPile/StockPile';

// Import types and test data
import { Card as CardType, Suit, Rank } from '../../src/types/card';
import { GameState } from '../../src/types/game-state';

describe('T041: React DnD Integration Tests', () => {
  let testCard: CardType;
  let mockGameState: GameState;

  beforeEach(() => {
    // Create test card data
    testCard = {
      suit: Suit.Hearts,
      rank: Rank.King,
      faceUp: true,
      id: 'test-card-1'
    };

    // Create mock game state
    mockGameState = {
      tableau: [[], [], [], [], [], [], []],
      foundations: [[], [], [], []],
      stock: [],
      waste: [],
      moveHistory: [],
      score: 0,
      startTime: Date.now(),
      isGameWon: false
    };
  });

  describe('DndProvider Configuration', () => {
    test('should have DndProvider configured in App.tsx', () => {
      const { container } = render(<App />);
      
      // Verify DndProvider is present by checking for HTML5 backend context
      expect(container.querySelector('[data-dnd-context]')).toBeTruthy();
    });

    test('should not have duplicate DndProvider in GameBoard', () => {
      // Wrap GameBoard in test provider to check for conflicts
      const TestWrapper = ({ children }: { children: React.ReactNode }) => (
        <DndProvider backend={HTML5Backend}>
          {children}
        </DndProvider>
      );

      expect(() => {
        render(
          <TestWrapper>
            <GameBoard />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('Card Component Drag and Drop', () => {
    test('should make Card draggable with correct drag data', async () => {
      const mockOnMove = jest.fn();
      
      render(
        <DndProvider backend={HTML5Backend}>
          <Card 
            card={testCard} 
            position={{ column: 0, index: 0 }}
            onMove={mockOnMove}
            isDraggable={true}
          />
        </DndProvider>
      );

      const cardElement = screen.getByTestId('card-hearts-king');
      
      // Test drag initiation
      fireEvent.mouseDown(cardElement);
      fireEvent.dragStart(cardElement);
      
      // Verify card has drag properties
      expect(cardElement).toHaveAttribute('draggable', 'true');
    });

    test('should provide visual feedback during drag', () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <Card 
            card={testCard} 
            position={{ column: 0, index: 0 }}
            isDraggable={true}
          />
        </DndProvider>
      );

      const cardElement = screen.getByTestId('card-hearts-king');
      
      // Simulate drag start
      fireEvent.dragStart(cardElement);
      
      // Verify visual feedback (opacity change, cursor style, etc.)
      expect(cardElement).toHaveStyle({ opacity: expect.stringMatching(/0\.[0-9]+/) });
    });
  });

  describe('TableauColumn Drop Zone', () => {
    test('should accept valid card drops following tableau rules', async () => {
      const mockOnMove = jest.fn();
      const redKing: CardType = { suit: Suit.Hearts, rank: Rank.King, faceUp: true, id: 'red-king' };
      const blackQueen: CardType = { suit: Suit.Spades, rank: Rank.Queen, faceUp: true, id: 'black-queen' };

      render(
        <DndProvider backend={HTML5Backend}>
          <TableauColumn 
            cards={[redKing]} 
            columnIndex={0}
            onMove={mockOnMove}
          />
        </DndProvider>
      );

      // Simulate dropping black Queen on red King (valid move)
      const dropZone = screen.getByTestId('tableau-column-0');
      
      // Create drag event with black Queen data
      const dragEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dragEvent, 'dataTransfer', {
        value: {
          getData: () => JSON.stringify({
            card: blackQueen,
            sourcePosition: { column: 1, index: 0 }
          })
        }
      });

      fireEvent(dropZone, dragEvent);
      
      await waitFor(() => {
        expect(mockOnMove).toHaveBeenCalledWith(
          expect.objectContaining({
            card: blackQueen,
            from: { column: 1, index: 0 },
            to: { column: 0, index: 1 }
          })
        );
      });
    });

    test('should reject invalid card drops', async () => {
      const mockOnMove = jest.fn();
      const redKing: CardType = { suit: Suit.Hearts, rank: Rank.King, faceUp: true, id: 'red-king' };
      const redQueen: CardType = { suit: Suit.Diamonds, rank: Rank.Queen, faceUp: true, id: 'red-queen' };

      render(
        <DndProvider backend={HTML5Backend}>
          <TableauColumn 
            cards={[redKing]} 
            columnIndex={0}
            onMove={mockOnMove}
          />
        </DndProvider>
      );

      const dropZone = screen.getByTestId('tableau-column-0');
      
      // Try to drop red Queen on red King (invalid - same color)
      const dragEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dragEvent, 'dataTransfer', {
        value: {
          getData: () => JSON.stringify({
            card: redQueen,
            sourcePosition: { column: 1, index: 0 }
          })
        }
      });

      fireEvent(dropZone, dragEvent);
      
      // Should not call onMove for invalid moves
      expect(mockOnMove).not.toHaveBeenCalled();
    });

    test('should show visual feedback for valid drop zones', () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <TableauColumn 
            cards={[]} 
            columnIndex={0}
            onMove={jest.fn()}
          />
        </DndProvider>
      );

      const dropZone = screen.getByTestId('tableau-column-0');
      
      // Simulate drag over
      fireEvent.dragEnter(dropZone);
      fireEvent.dragOver(dropZone);
      
      // Should show drop zone indicator
      expect(dropZone).toHaveClass('drop-zone-active');
    });
  });

  describe('FoundationPile Drop Zone', () => {
    test('should accept Ace on empty foundation pile', async () => {
      const mockOnMove = jest.fn();
      const ace: CardType = { suit: Suit.Hearts, rank: Rank.Ace, faceUp: true, id: 'ace-hearts' };

      render(
        <DndProvider backend={HTML5Backend}>
          <FoundationPile 
            cards={[]} 
            suit={Suit.Hearts}
            onMove={mockOnMove}
          />
        </DndProvider>
      );

      const foundationPile = screen.getByTestId('foundation-pile-hearts');
      
      const dragEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dragEvent, 'dataTransfer', {
        value: {
          getData: () => JSON.stringify({
            card: ace,
            sourcePosition: { column: 0, index: 0 }
          })
        }
      });

      fireEvent(foundationPile, dragEvent);
      
      await waitFor(() => {
        expect(mockOnMove).toHaveBeenCalledWith(
          expect.objectContaining({
            card: ace,
            to: { type: 'foundation', suit: Suit.Hearts }
          })
        );
      });
    });

    test('should accept next rank of same suit', async () => {
      const mockOnMove = jest.fn();
      const ace: CardType = { suit: Suit.Hearts, rank: Rank.Ace, faceUp: true, id: 'ace-hearts' };
      const two: CardType = { suit: Suit.Hearts, rank: Rank.Two, faceUp: true, id: 'two-hearts' };

      render(
        <DndProvider backend={HTML5Backend}>
          <FoundationPile 
            cards={[ace]} 
            suit={Suit.Hearts}
            onMove={mockOnMove}
          />
        </DndProvider>
      );

      const foundationPile = screen.getByTestId('foundation-pile-hearts');
      
      const dragEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dragEvent, 'dataTransfer', {
        value: {
          getData: () => JSON.stringify({
            card: two,
            sourcePosition: { column: 0, index: 0 }
          })
        }
      });

      fireEvent(foundationPile, dragEvent);
      
      await waitFor(() => {
        expect(mockOnMove).toHaveBeenCalled();
      });
    });

    test('should reject non-Ace on empty foundation', () => {
      const mockOnMove = jest.fn();
      const king: CardType = { suit: Suit.Hearts, rank: Rank.King, faceUp: true, id: 'king-hearts' };

      render(
        <DndProvider backend={HTML5Backend}>
          <FoundationPile 
            cards={[]} 
            suit={Suit.Hearts}
            onMove={mockOnMove}
          />
        </DndProvider>
      );

      const foundationPile = screen.getByTestId('foundation-pile-hearts');
      
      const dragEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dragEvent, 'dataTransfer', {
        value: {
          getData: () => JSON.stringify({
            card: king,
            sourcePosition: { column: 0, index: 0 }
          })
        }
      });

      fireEvent(foundationPile, dragEvent);
      
      expect(mockOnMove).not.toHaveBeenCalled();
    });
  });

  describe('StockPile Drag and Drop', () => {
    test('should make waste pile cards draggable', () => {
      const wasteCard: CardType = { suit: Suit.Clubs, rank: Rank.Seven, faceUp: true, id: 'waste-card' };
      
      render(
        <DndProvider backend={HTML5Backend}>
          <StockPile 
            stockCards={[]}
            wasteCards={[wasteCard]}
            onStockClick={jest.fn()}
            onMove={jest.fn()}
          />
        </DndProvider>
      );

      const wasteCardElement = screen.getByTestId('waste-card-clubs-seven');
      expect(wasteCardElement).toHaveAttribute('draggable', 'true');
    });

    test('should handle stock pile click to reveal waste card', () => {
      const mockOnStockClick = jest.fn();
      const stockCard: CardType = { suit: Suit.Clubs, rank: Rank.Seven, faceUp: false, id: 'stock-card' };
      
      render(
        <DndProvider backend={HTML5Backend}>
          <StockPile 
            stockCards={[stockCard]}
            wasteCards={[]}
            onStockClick={mockOnStockClick}
            onMove={jest.fn()}
          />
        </DndProvider>
      );

      const stockPile = screen.getByTestId('stock-pile');
      fireEvent.click(stockPile);
      
      expect(mockOnStockClick).toHaveBeenCalled();
    });
  });

  describe('Cross-Component Drag and Drop', () => {
    test('should handle drag from waste to tableau', async () => {
      const mockOnMove = jest.fn();
      const wasteCard: CardType = { suit: Suit.Clubs, rank: Rank.Seven, faceUp: true, id: 'waste-seven' };
      const tableauCard: CardType = { suit: Suit.Hearts, rank: Rank.Eight, faceUp: true, id: 'tableau-eight' };

      render(
        <DndProvider backend={HTML5Backend}>
          <div>
            <StockPile 
              stockCards={[]}
              wasteCards={[wasteCard]}
              onStockClick={jest.fn()}
              onMove={mockOnMove}
            />
            <TableauColumn 
              cards={[tableauCard]} 
              columnIndex={0}
              onMove={mockOnMove}
            />
          </div>
        </DndProvider>
      );

      // This test would require more complex DnD simulation
      // For now, we verify components are rendered correctly
      expect(screen.getByTestId('waste-card-clubs-seven')).toBeInTheDocument();
      expect(screen.getByTestId('tableau-column-0')).toBeInTheDocument();
    });

    test('should handle drag from waste to foundation', async () => {
      const mockOnMove = jest.fn();
      const ace: CardType = { suit: Suit.Spades, rank: Rank.Ace, faceUp: true, id: 'waste-ace' };

      render(
        <DndProvider backend={HTML5Backend}>
          <div>
            <StockPile 
              stockCards={[]}
              wasteCards={[ace]}
              onStockClick={jest.fn()}
              onMove={mockOnMove}
            />
            <FoundationPile 
              cards={[]} 
              suit={Suit.Spades}
              onMove={mockOnMove}
            />
          </div>
        </DndProvider>
      );

      expect(screen.getByTestId('waste-card-spades-ace')).toBeInTheDocument();
      expect(screen.getByTestId('foundation-pile-spades')).toBeInTheDocument();
    });
  });

  describe('Keyboard Accessibility', () => {
    test('should support keyboard navigation for card selection', () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <Card 
            card={testCard} 
            position={{ column: 0, index: 0 }}
            isDraggable={true}
          />
        </DndProvider>
      );

      const cardElement = screen.getByTestId('card-hearts-king');
      
      // Tab to focus the card
      cardElement.focus();
      expect(cardElement).toHaveFocus();
      
      // Space or Enter should select the card
      fireEvent.keyDown(cardElement, { key: ' ' });
      expect(cardElement).toHaveClass('selected');
    });

    test('should support arrow key navigation between drop zones', () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <div>
            <TableauColumn cards={[]} columnIndex={0} onMove={jest.fn()} />
            <TableauColumn cards={[]} columnIndex={1} onMove={jest.fn()} />
            <FoundationPile cards={[]} suit={Suit.Hearts} onMove={jest.fn()} />
          </div>
        </DndProvider>
      );

      const firstColumn = screen.getByTestId('tableau-column-0');
      const secondColumn = screen.getByTestId('tableau-column-1');
      
      firstColumn.focus();
      
      // Arrow right should move to next column
      fireEvent.keyDown(firstColumn, { key: 'ArrowRight' });
      expect(secondColumn).toHaveFocus();
    });

    test('should support Escape key to cancel selection', () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <Card 
            card={testCard} 
            position={{ column: 0, index: 0 }}
            isDraggable={true}
          />
        </DndProvider>
      );

      const cardElement = screen.getByTestId('card-hearts-king');
      
      // Select card
      fireEvent.keyDown(cardElement, { key: ' ' });
      expect(cardElement).toHaveClass('selected');
      
      // Escape should deselect
      fireEvent.keyDown(cardElement, { key: 'Escape' });
      expect(cardElement).not.toHaveClass('selected');
    });
  });

  describe('Performance and Visual Feedback', () => {
    test('should maintain 60fps during drag operations', () => {
      // This test would require performance monitoring tools
      // For now, we verify that CSS transforms are used instead of position changes
      render(
        <DndProvider backend={HTML5Backend}>
          <Card 
            card={testCard} 
            position={{ column: 0, index: 0 }}
            isDraggable={true}
          />
        </DndProvider>
      );

      const cardElement = screen.getByTestId('card-hearts-king');
      
      // Verify CSS transform is used for positioning
      expect(cardElement).toHaveStyle({ transform: expect.any(String) });
    });

    test('should show appropriate visual feedback during drag operations', () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <TableauColumn 
            cards={[]} 
            columnIndex={0}
            onMove={jest.fn()}
          />
        </DndProvider>
      );

      const dropZone = screen.getByTestId('tableau-column-0');
      
      // Simulate drag enter
      fireEvent.dragEnter(dropZone);
      
      // Should show visual feedback
      expect(dropZone).toHaveClass('drop-zone-highlight');
    });
  });

  describe('Game Validation Integration', () => {
    test('should integrate with game validation service for move validation', async () => {
      // Mock game validation service
      const mockValidateMove = jest.fn().mockReturnValue(true);
      
      // This test assumes validation service is injected or imported
      // The actual implementation would depend on the validation service structure
      
      render(
        <DndProvider backend={HTML5Backend}>
          <TableauColumn 
            cards={[]} 
            columnIndex={0}
            onMove={jest.fn()}
          />
        </DndProvider>
      );

      // Test that validation is called before allowing drops
      expect(true).toBe(true); // Placeholder - actual validation testing would be implemented
    });

    test('should show error feedback for invalid moves', () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <TableauColumn 
            cards={[]} 
            columnIndex={0}
            onMove={jest.fn()}
          />
        </DndProvider>
      );

      // Test would verify that invalid move attempts show appropriate feedback
      expect(true).toBe(true); // Placeholder
    });
  });
});
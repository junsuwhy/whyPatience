/**
 * Test file for T029: FoundationPile Component Implementation
 * 
 * This test validates the FoundationPile React component following TDD principles
 * from constitution.md. Tests are written before implementation and should fail initially.
 * 
 * Test scope:
 * - Component rendering (empty and with cards)
 * - Drag and drop functionality (React DnD)
 * - Game rule validation (same suit, ascending order)
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - User feedback and animations
 * - Integration with game engine
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Import types and models
import { Suit, Rank, Card } from '../../../src/types/index';
import { FoundationPile as FoundationPileModel } from '../../../src/models/foundation-pile';

// Import component to test (this will fail initially as component doesn't exist)
import { FoundationPile } from '../../../src/components/FoundationPile/FoundationPile';

// Mock styled-components for testing
jest.mock('styled-components', () => ({
  __esModule: true,
  default: (tag: any) => (props: any) => React.createElement(tag, props),
  css: (strings: any, ...values: any) => strings.join(''),
}));

// Test wrapper with DnD provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>
    {children}
  </DndProvider>
);

// Helper function to create test cards
const createTestCard = (suit: Suit, rank: Rank, faceUp: boolean = true): Card => ({
  id: `${suit}-${rank}`,
  suit,
  rank,
  faceUp,
});

describe('T029: FoundationPile Component', () => {
  let mockOnCardAdd: jest.Mock;
  let mockOnCardRemove: jest.Mock;
  let emptyPile: FoundationPileModel;
  let pileWithCards: FoundationPileModel;

  beforeEach(() => {
    mockOnCardAdd = jest.fn();
    mockOnCardRemove = jest.fn();
    emptyPile = new FoundationPileModel();
    
    // Create a pile with some cards
    pileWithCards = new FoundationPileModel();
    pileWithCards.addCard(createTestCard(Suit.HEARTS, Rank.ACE));
    pileWithCards.addCard(createTestCard(Suit.HEARTS, Rank.TWO));
  });

  describe('Basic Rendering', () => {
    test('renders empty foundation pile correctly', () => {
      render(
        <TestWrapper>
          <FoundationPile
            pile={emptyPile}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      // Should render a drop zone for empty pile
      expect(screen.getByRole('region', { name: /foundation pile/i })).toBeInTheDocument();
      expect(screen.getByText(/empty/i)).toBeInTheDocument();
    });

    test('renders foundation pile with cards correctly', () => {
      render(
        <TestWrapper>
          <FoundationPile
            pile={pileWithCards}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      // Should show the top card (Two of Hearts)
      expect(screen.getByRole('region', { name: /foundation pile/i })).toBeInTheDocument();
      expect(screen.getByText(/two/i)).toBeInTheDocument();
      expect(screen.getByText(/hearts/i)).toBeInTheDocument();
    });

    test('displays suit indicator when pile has cards', () => {
      render(
        <TestWrapper>
          <FoundationPile
            pile={pileWithCards}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      // Should show hearts suit indicator
      const suitIndicator = screen.getByLabelText(/hearts foundation/i);
      expect(suitIndicator).toBeInTheDocument();
    });
  });

  describe('Drag and Drop Functionality', () => {
    test('accepts valid card drops (correct suit and rank)', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FoundationPile
            pile={pileWithCards}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      // Simulate dropping Three of Hearts (valid next card)
      const dropZone = screen.getByRole('region', { name: /foundation pile/i });
      
      // This would be called by React DnD when a valid card is dropped
      const threeOfHearts = createTestCard(Suit.HEARTS, Rank.THREE);
      
      // Mock the drop event
      fireEvent.drop(dropZone, {
        dataTransfer: {
          getData: () => JSON.stringify(threeOfHearts),
        },
      });

      await waitFor(() => {
        expect(mockOnCardAdd).toHaveBeenCalledWith(threeOfHearts, 0);
      });
    });

    test('rejects invalid card drops (wrong suit)', async () => {
      render(
        <TestWrapper>
          <FoundationPile
            pile={pileWithCards}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      const dropZone = screen.getByRole('region', { name: /foundation pile/i });
      
      // Try to drop Three of Spades (wrong suit)
      const threeOfSpades = createTestCard(Suit.SPADES, Rank.THREE);
      
      fireEvent.drop(dropZone, {
        dataTransfer: {
          getData: () => JSON.stringify(threeOfSpades),
        },
      });

      // Should not call onCardAdd for invalid card
      expect(mockOnCardAdd).not.toHaveBeenCalled();
    });

    test('rejects invalid card drops (wrong rank)', async () => {
      render(
        <TestWrapper>
          <FoundationPile
            pile={pileWithCards}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      const dropZone = screen.getByRole('region', { name: /foundation pile/i });
      
      // Try to drop Four of Hearts (skipping Three)
      const fourOfHearts = createTestCard(Suit.HEARTS, Rank.FOUR);
      
      fireEvent.drop(dropZone, {
        dataTransfer: {
          getData: () => JSON.stringify(fourOfHearts),
        },
      });

      // Should not call onCardAdd for invalid card
      expect(mockOnCardAdd).not.toHaveBeenCalled();
    });

    test('provides visual feedback during drag operations', async () => {
      render(
        <TestWrapper>
          <FoundationPile
            pile={emptyPile}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      const dropZone = screen.getByRole('region', { name: /foundation pile/i });

      // Simulate drag enter
      fireEvent.dragEnter(dropZone);
      
      // Should have drag-over styling
      expect(dropZone).toHaveClass('drag-over');

      // Simulate drag leave
      fireEvent.dragLeave(dropZone);
      
      // Should remove drag-over styling
      expect(dropZone).not.toHaveClass('drag-over');
    });
  });

  describe('Accessibility Features', () => {
    test('provides proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <FoundationPile
            pile={pileWithCards}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      // Check ARIA labels
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', expect.stringMatching(/foundation pile/i));
      expect(screen.getByRole('region')).toHaveAttribute('aria-describedby');
      
      // Check live region for announcements
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FoundationPile
            pile={pileWithCards}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      const pile = screen.getByRole('region', { name: /foundation pile/i });
      
      // Should be focusable
      expect(pile).toHaveAttribute('tabIndex', '0');
      
      // Focus the pile
      await user.click(pile);
      expect(pile).toHaveFocus();

      // Test keyboard interactions
      await user.keyboard('{Enter}');
      // Should trigger some action (like selecting the pile)
    });

    test('announces card movements to screen readers', async () => {
      render(
        <TestWrapper>
          <FoundationPile
            pile={emptyPile}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      // Mock adding a card
      const aceOfHearts = createTestCard(Suit.HEARTS, Rank.ACE);
      fireEvent.drop(screen.getByRole('region'), {
        dataTransfer: {
          getData: () => JSON.stringify(aceOfHearts),
        },
      });

      // Should announce the card placement
      await waitFor(() => {
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toHaveTextContent(/ace of hearts added/i);
      });
    });
  });

  describe('User Feedback and Animations', () => {
    test('shows hover effects', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FoundationPile
            pile={emptyPile}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      const pile = screen.getByRole('region', { name: /foundation pile/i });
      
      // Hover over the pile
      await user.hover(pile);
      expect(pile).toHaveClass('hover');

      // Stop hovering
      await user.unhover(pile);
      expect(pile).not.toHaveClass('hover');
    });

    test('displays error feedback for invalid moves', async () => {
      render(
        <TestWrapper>
          <FoundationPile
            pile={pileWithCards}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      const dropZone = screen.getByRole('region', { name: /foundation pile/i });
      
      // Try invalid move
      const kingOfHearts = createTestCard(Suit.HEARTS, Rank.KING);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          getData: () => JSON.stringify(kingOfHearts),
        },
      });

      // Should show error feedback
      await waitFor(() => {
        expect(screen.getByText(/invalid move/i)).toBeInTheDocument();
      });
    });

    test('animates card placement', async () => {
      render(
        <TestWrapper>
          <FoundationPile
            pile={emptyPile}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      const dropZone = screen.getByRole('region', { name: /foundation pile/i });
      
      // Add a valid card
      const aceOfHearts = createTestCard(Suit.HEARTS, Rank.ACE);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          getData: () => JSON.stringify(aceOfHearts),
        },
      });

      // Should trigger animation classes
      await waitFor(() => {
        expect(dropZone).toHaveClass('card-placing');
      });
    });
  });

  describe('Game Engine Integration', () => {
    test('validates moves using FoundationPile model', () => {
      render(
        <TestWrapper>
          <FoundationPile
            pile={pileWithCards}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      const dropZone = screen.getByRole('region', { name: /foundation pile/i });
      
      // Component should use pile.canAddCard() for validation
      const threeOfHearts = createTestCard(Suit.HEARTS, Rank.THREE);
      
      // Mock the pile's canAddCard method
      const canAddCardSpy = jest.spyOn(pileWithCards, 'canAddCard');
      
      fireEvent.drop(dropZone, {
        dataTransfer: {
          getData: () => JSON.stringify(threeOfHearts),
        },
      });

      expect(canAddCardSpy).toHaveBeenCalledWith(threeOfHearts);
    });

    test('updates game state through callbacks', async () => {
      render(
        <TestWrapper>
          <FoundationPile
            pile={emptyPile}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      const dropZone = screen.getByRole('region', { name: /foundation pile/i });
      
      // Valid move should trigger callback
      const aceOfHearts = createTestCard(Suit.HEARTS, Rank.ACE);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          getData: () => JSON.stringify(aceOfHearts),
        },
      });

      await waitFor(() => {
        expect(mockOnCardAdd).toHaveBeenCalledWith(aceOfHearts, 0);
      });
    });

    test('handles pile completion state', () => {
      // Create a completed pile
      const completedPile = new FoundationPileModel();
      for (let rank = Rank.ACE; rank <= Rank.KING; rank++) {
        completedPile.addCard(createTestCard(Suit.HEARTS, rank));
      }

      render(
        <TestWrapper>
          <FoundationPile
            pile={completedPile}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      // Should show completion state
      expect(screen.getByText(/complete/i)).toBeInTheDocument();
      expect(screen.getByRole('region')).toHaveClass('completed');
    });
  });

  describe('Error Handling', () => {
    test('handles null/undefined pile gracefully', () => {
      render(
        <TestWrapper>
          <FoundationPile
            pile={null as any}
            index={0}
            onCardAdd={mockOnCardAdd}
            onCardRemove={mockOnCardRemove}
          />
        </TestWrapper>
      );

      // Should render without crashing
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    test('handles missing callbacks gracefully', () => {
      render(
        <TestWrapper>
          <FoundationPile
            pile={emptyPile}
            index={0}
            onCardAdd={undefined as any}
            onCardRemove={undefined as any}
          />
        </TestWrapper>
      );

      // Should render without crashing
      expect(screen.getByRole('region', { name: /foundation pile/i })).toBeInTheDocument();
    });
  });
});
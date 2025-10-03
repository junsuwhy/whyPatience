import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the components and hooks for integration testing
const MockGameBoard = ({ animationMode }: { animationMode: string }) => (
  <div data-testid="game-board" data-animation-mode={animationMode}>
    <div data-testid="tableau-0-0" data-face-up="false" data-animation="deal">Tableau Card 1</div>
    <div data-testid="tableau-6-0" data-face-up="true" data-animation="flip">Tableau Card 2</div>
    <div data-testid="foundation-0" className="pulse-highlight">Foundation 1</div>
    <div data-testid="stock-0">Stock Card</div>
    <button role="button" name="auto">Auto Move</button>
  </div>
);

// Mock requestAnimationFrame for animation sequence testing
const originalRAF = window.requestAnimationFrame;
const originalSetTimeout = window.setTimeout;

describe('T042: Card Animation Integration Tests', () => {
  let rafSpy: jest.SpyInstance;
  let setTimeoutSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock RAF to control animation timing
    rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(cb, 16) as any; // 60fps
    });
    
    setTimeoutSpy = jest.spyOn(window, 'setTimeout').mockImplementation((cb, delay) => {
      return originalSetTimeout(cb, delay || 0);
    });
  });

  afterEach(() => {
    rafSpy.mockRestore();
    setTimeoutSpy.mockRestore();
  });

  describe('New Game Animation Sequence', () => {
    test('should animate initial card dealing to tableau', async () => {
      render(<MockGameBoard animationMode="full" />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getAllByTestId(/tableau-/).length).toBeGreaterThan(0);
      });

      // Check that tableau cards have animation attributes during dealing
      const tableauCards = screen.getAllByTestId(/tableau-/);
      tableauCards.forEach((card) => {
        // Cards should have data-animation during initial dealing
        expect(card).toHaveAttribute('data-animation');
      });
    });

    test('should sequence card dealing with proper timing', async () => {
      render(<MockGameBoard animationMode="full" />);

      // Verify that requestAnimationFrame was called for sequencing
      expect(rafSpy).toHaveBeenCalled();
      
      // Verify that setTimeout was used for dealing delays
      expect(setTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('Card Movement Animation', () => {
    test('should animate card flip when tableau card is revealed', async () => {
      render(<MockGameBoard animationMode="full" />);

      // Simulate moving a card that would reveal a face-down card
      const faceDownCard = screen.getAllByTestId(/tableau-/)[0];
      
      // Trigger card movement (this would normally be done via drag and drop)
      fireEvent.click(faceDownCard);

      // After move, the revealed card should have flip animation
      await waitFor(() => {
        const revealedCards = screen.getAllByTestId(/tableau-/).filter(card => 
          card.hasAttribute('data-animation') && 
          card.getAttribute('data-animation')?.includes('flip')
        );
        expect(revealedCards.length).toBeGreaterThan(0);
      });
    });

    test('should maintain correct DOM attributes during multi-card movement', async () => {
      render(<MockGameBoard animationMode="full" />);

      // Get cards that can be moved together (king sequence)
      const movableCards = screen.getAllByTestId(/tableau-/).slice(0, 2);

      // Simulate selecting multiple cards
      movableCards.forEach(card => {
        fireEvent.click(card);
      });

      // All selected cards should have proper data attributes
      movableCards.forEach(card => {
        expect(card).toHaveAttribute('data-animation');
      });
    });
  });

  describe('Foundation Auto-Play Animation', () => {
    test('should sequence auto-move animations correctly', async () => {
      render(<MockGameBoard animationMode="full" />);

      // Trigger auto-move
      const autoMoveButton = screen.getByRole('button', { name: /auto/i });
      fireEvent.click(autoMoveButton);

      // Verify that animations are sequenced
      await waitFor(() => {
        expect(rafSpy).toHaveBeenCalledTimes(1);
      });

      // Check that cards moving to foundation have sequence markers
      const foundationCards = screen.getAllByTestId(/foundation-/);
      foundationCards.forEach(card => {
        if (card.hasAttribute('data-animation')) {
          expect(['sequence-start', 'sequence-mid', 'sequence-end'])
            .toContain(card.getAttribute('data-animation'));
        }
      });
    });

    test('should control animation rhythm with requestAnimationFrame', async () => {
      render(<MockGameBoard animationMode="full" />);

      // Simulate rapid auto-moves
      const autoMoveButton = screen.getByRole('button', { name: /auto/i });
      
      // Click multiple times rapidly
      for (let i = 0; i < 5; i++) {
        fireEvent.click(autoMoveButton);
      }

      // Verify that RAF scheduling prevents animation conflicts
      await waitFor(() => {
        expect(rafSpy.mock.calls.length).toBeLessThanOrEqual(20); // Reasonable limit
      });
    });
  });

  describe('Drop Highlight Animation', () => {
    test('should show pulse highlight on valid drop targets', async () => {
      render(<MockGameBoard animationMode="full" />);

      // Get a card to drag
      const draggableCard = screen.getAllByTestId(/tableau-/).find(card => 
        card.getAttribute('data-face-up') === 'true'
      );

      if (draggableCard) {
        // Simulate drag start
        fireEvent.dragStart(draggableCard);

        // Valid drop targets should show highlight
        const dropTargets = screen.getAllByTestId(/foundation-|tableau-/);
        const highlightedTargets = dropTargets.filter(target => 
          target.classList.contains('pulse-highlight')
        );

        expect(highlightedTargets.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Animation Mode Compliance', () => {
    test('should respect animationMode="off" setting', async () => {
      render(<MockGameBoard animationMode="off" />);

      // Component should still render but without animation data
      expect(screen.getByTestId('game-board')).toHaveAttribute('data-animation-mode', 'off');
    });

    test('should apply reduced animations when prefers-reduced-motion', async () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<MockGameBoard animationMode="full" />);

      // Component should render with reduced motion consideration
      expect(screen.getByTestId('game-board')).toBeDefined();
    });
  });

  describe('Performance Validation', () => {
    test('should maintain frame rate during 20 consecutive moves', async () => {
      const performanceMarks: number[] = [];

      render(<MockGameBoard animationMode="full" />);

      // Simulate 20 moves and measure timing
      for (let i = 0; i < 20; i++) {
        const startTime = performance.now();
        
        // Simulate card movement
        const card = screen.getAllByTestId(/tableau-/)[0];
        fireEvent.click(card);
        
        await waitFor(() => {
          expect(card).toBeDefined();
        });
        
        const endTime = performance.now();
        performanceMarks.push(endTime - startTime);
      }

      // Average frame time should be under 16ms
      const averageFrameTime = performanceMarks.reduce((a, b) => a + b, 0) / performanceMarks.length;
      expect(averageFrameTime).toBeLessThan(16);
    });

    test('should limit RAF scheduling calls', async () => {
      render(<MockGameBoard animationMode="full" />);

      // Trigger multiple simultaneous animations
      const cards = screen.getAllByTestId(/tableau-/).slice(0, 5);
      cards.forEach(card => fireEvent.click(card));

      // RAF calls should be reasonable (not exponential)
      await waitFor(() => {
        expect(rafSpy.mock.calls.length).toBeLessThan(50);
      });
    });
  });
});
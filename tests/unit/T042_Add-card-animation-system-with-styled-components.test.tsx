import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import '@testing-library/jest-dom';

// Animation system imports
import {
  DURATIONS,
  EASING,
  Z_INDEX,
  LAYER_NAMES,
  DATA_ATTRIBUTES,
  ANIMATION_MODES,
} from '../../src/styles/animation';
import { animations, getAnimation, getAnimationClass } from '../../src/styles/keyframes';
import { useCardAnimation } from '../../src/hooks/useCardAnimation';
import { useAutoSequence, createSequenceMove } from '../../src/hooks/useAutoSequence';

// Component imports
import { Card } from '../../src/components/Card/Card';
import { FoundationPile } from '../../src/components/FoundationPile/FoundationPile';

// Types and models
import { Card as CardType, Suit, Rank, Color, CardPosition } from '../../src/types/card';
import { FoundationPile as FoundationPileModel } from '../../src/models/foundation-pile';

// Test wrapper for React DnD
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>
    {children}
  </DndProvider>
);

// Test helpers
const createMockCard = (overrides?: Partial<CardType>): CardType => ({
  id: 'test-card-1',
  suit: Suit.HEARTS,
  rank: Rank.ACE,
  color: Color.RED,
  isVisible: true,
  ...overrides,
});

const createMockCardPosition = (): CardPosition => ({
  pile: 'tableau',
  pileIndex: 0,
  cardIndex: 0,
});

// Mock matchMedia for prefers-reduced-motion testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('T042: Card Animation System', () => {
  beforeEach(() => {
    // Mock performance.now for consistent testing
    global.performance.now = jest.fn(() => Date.now());
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
    global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));
  });

  describe('Animation Tokens Export', () => {
    test('should export all required duration constants', () => {
      expect(DURATIONS.INSTANT).toBe(100);
      expect(DURATIONS.FAST).toBe(200);
      expect(DURATIONS.NORMAL).toBe(300);
      expect(DURATIONS.SLOW).toBe(500);
      expect(DURATIONS.EXTENDED).toBe(800);
    });

    test('should export all required easing functions', () => {
      expect(EASING.EASE).toBe('cubic-bezier(0.25, 0.1, 0.25, 1)');
      expect(EASING.EASE_IN_OUT).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
      expect(EASING.EASE_OUT).toBe('cubic-bezier(0, 0, 0.2, 1)');
      expect(EASING.BOUNCE).toBe('cubic-bezier(0.68, -0.55, 0.265, 1.55)');
    });

    test('should export z-index layer system', () => {
      expect(Z_INDEX.BASE).toBe(1);
      expect(Z_INDEX.CARDS).toBe(20);
      expect(Z_INDEX.DRAGGING).toBe(100);
      expect(Z_INDEX.ANIMATING).toBe(90);
    });

    test('should export layer names', () => {
      expect(LAYER_NAMES.FLIP).toBe('flip');
      expect(LAYER_NAMES.LIFT).toBe('lift');
      expect(LAYER_NAMES.PULSE).toBe('pulse');
    });

    test('should export data attributes', () => {
      expect(DATA_ATTRIBUTES.ANIMATION).toBe('data-animation');
      expect(DATA_ATTRIBUTES.DRAGGING).toBe('data-dragging');
      expect(DATA_ATTRIBUTES.REDUCED_MOTION).toBe('data-reduced-motion');
    });

    test('should export animation modes', () => {
      expect(ANIMATION_MODES.full.enableTransitions).toBe(true);
      expect(ANIMATION_MODES.reduced.enableKeyframes).toBe(false);
      expect(ANIMATION_MODES.off.enableTransitions).toBe(false);
    });
  });

  describe('Keyframes', () => {
    test('should export flip keyframe', async () => {
      const { FLIP_KEYFRAME } = await import('../../src/styles/keyframes');
      expect(FLIP_KEYFRAME).toBeDefined();
      expect(typeof FLIP_KEYFRAME).toBe('string');
    });

    test('should export lift keyframe', async () => {
      const { LIFT_KEYFRAME } = await import('../../src/styles/keyframes');
      expect(LIFT_KEYFRAME).toBeDefined();
      expect(typeof LIFT_KEYFRAME).toBe('string');
    });

    test('should export slide to position keyframe', async () => {
      const { SLIDE_TO_POSITION_KEYFRAME } = await import('../../src/styles/keyframes');
      expect(SLIDE_TO_POSITION_KEYFRAME).toBeDefined();
      expect(typeof SLIDE_TO_POSITION_KEYFRAME).toBe('string');
    });

    test('should export pulse highlight keyframe', async () => {
      const { PULSE_HIGHLIGHT_KEYFRAME } = await import('../../src/styles/keyframes');
      expect(PULSE_HIGHLIGHT_KEYFRAME).toBeDefined();
      expect(typeof PULSE_HIGHLIGHT_KEYFRAME).toBe('string');
    });
  });

  describe('Card Component Animation', () => {
    const mockCard = {
      id: 'card-1',
      suit: 'hearts' as const,
      rank: 'ace' as const,
      faceUp: false
    };

    test('should add data-animation="flip" when card flips from faceDown to faceUp', async () => {
      const { Card } = await import('../../src/components/Card/Card');
      const { rerender } = render(
        <Card 
          card={mockCard} 
          animationMode="full"
          onCardClick={jest.fn()}
        />
      );

      // Initially face down - no flip animation
      expect(screen.queryByTestId('card-1')).not.toHaveAttribute('data-animation');

      // Flip card face up - should trigger flip animation
      rerender(
        <Card 
          card={{ ...mockCard, faceUp: true }} 
          animationMode="full"
          onCardClick={jest.fn()}
        />
      );

      expect(screen.getByTestId('card-1')).toHaveAttribute('data-animation', 'flip');
    });

    test('should add data-dragging when drag starts', async () => {
      const { Card } = await import('../../src/components/Card/Card');
      render(
        <Card 
          card={{ ...mockCard, faceUp: true }} 
          animationMode="full"
          onCardClick={jest.fn()}
          isDragging={true}
        />
      );

      expect(screen.getByTestId('card-1')).toHaveAttribute('data-dragging', 'true');
    });

    test('should not apply animation classes when animationMode is "off"', async () => {
      const { Card } = await import('../../src/components/Card/Card');
      render(
        <Card 
          card={{ ...mockCard, faceUp: true }} 
          animationMode="off"
          onCardClick={jest.fn()}
        />
      );

      const cardElement = screen.getByTestId('card-1');
      expect(cardElement).not.toHaveAttribute('data-animation');
      expect(cardElement.className).not.toMatch(/animation-/);
    });

    test('should respect prefers-reduced-motion setting', async () => {
      const { Card } = await import('../../src/components/Card/Card');
      // Mock prefers-reduced-motion: reduce
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <Card 
          card={{ ...mockCard, faceUp: true }} 
          animationMode="full"
          onCardClick={jest.fn()}
        />
      );

      const cardElement = screen.getByTestId('card-1');
      expect(cardElement).toHaveAttribute('data-reduced-motion', 'true');
    });
  });

  describe('useCardAnimation Hook', () => {
    test('should return animation state for full mode', async () => {
      const { useCardAnimation } = await import('../../src/hooks/useCardAnimation');
      const { result } = renderHook(() => useCardAnimation('full'));
      
      expect(result.current).toHaveProperty('shouldAnimate', true);
      expect(result.current).toHaveProperty('prefersReducedMotion');
      expect(result.current).toHaveProperty('getAnimationProps');
    });

    test('should return no animation for off mode', async () => {
      const { useCardAnimation } = await import('../../src/hooks/useCardAnimation');
      const { result } = renderHook(() => useCardAnimation('off'));
      
      expect(result.current.shouldAnimate).toBe(false);
    });

    test('should detect reduced motion preference', async () => {
      const { useCardAnimation } = await import('../../src/hooks/useCardAnimation');
      // Mock prefers-reduced-motion: reduce
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const { result } = renderHook(() => useCardAnimation('full'));
      
      expect(result.current.prefersReducedMotion).toBe(true);
    });
  });

  describe('Performance Requirements', () => {
    test('should complete animation cycle within 16ms budget', async () => {
      const { Card } = await import('../../src/components/Card/Card');
      const startTime = performance.now();
      
      // Simulate 20 consecutive move animations
      for (let i = 0; i < 20; i++) {
        const card = { ...mockCard, id: `card-${i}`, faceUp: true };
        render(
          <Card 
            card={card} 
            animationMode="full"
            onCardClick={jest.fn()}
            isAnimating={true}
          />
        );
      }
      
      const endTime = performance.now();
      const averageTime = (endTime - startTime) / 20;
      
      // Each animation should not block main thread for more than 16ms
      expect(averageTime).toBeLessThan(16);
    });
  });

  describe('Animation Preferences', () => {
    test('should handle animationMode preferences correctly', async () => {
      const { useCardAnimation } = await import('../../src/hooks/useCardAnimation');
      const modes = ['full', 'reduced', 'off'] as const;
      
      modes.forEach(mode => {
        const { result } = renderHook(() => useCardAnimation(mode));
        
        if (mode === 'off') {
          expect(result.current.shouldAnimate).toBe(false);
        } else {
          expect(result.current.shouldAnimate).toBe(true);
        }
      });
    });
  });
});
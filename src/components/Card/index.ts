/**
 * Card Component Module Exports
 *
 * Main entry point for the Card component and related types.
 * Provides a clean API for importing Card functionality.
 */

// Main component export
export { Card, default as CardComponent } from './Card';

// Type exports
export type {
  CardProps,
  CardDragItem,
  CardDropResult,
  CardAnimationState,
  CardTheme,
} from './Card.types';

// Default theme export
export { defaultCardTheme } from './Card.types';

// Styled components exports (for advanced customization)
export {
  CardContainer,
  CardFront,
  CardBack,
  CardRank,
  CardSuit,
  CardCorner,
  CenterSuit,
  CardBackPattern,
  LoadingShimmer,
} from './Card.styles';

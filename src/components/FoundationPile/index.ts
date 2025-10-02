/**
 * FoundationPile Component Exports
 *
 * Barrel export file for the FoundationPile component and related types.
 * Provides clean imports for other parts of the application.
 */

export { FoundationPile, type FoundationPileProps } from './FoundationPile';
export { default as FoundationPileStyles } from './FoundationPile.styles';

// Re-export styled components for advanced usage
export {
  FoundationPileContainer,
  FoundationPileContent,
  FoundationPileLabel,
  FoundationPilePlaceholder,
  SuitIndicator,
  TopCard,
  CompletionBadge,
  DragIndicator,
  ErrorIndicator,
  ResponsiveWrapper,
} from './FoundationPile.styles';

// Default export
export { FoundationPile as default } from './FoundationPile';

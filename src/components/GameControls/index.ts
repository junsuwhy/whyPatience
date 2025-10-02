/**
 * GameControls component exports.
 * This file provides clean exports for the GameControls component and its types.
 */

// Main component export
export { GameControls } from './GameControls';

// Type exports for external use
export type {
  GameControlsProps,
  GameControlCallbacks,
  ControlButton,
  KeyboardShortcut,
  AnimationConfig,
  ControlButtonState,
} from './GameControls.types';

// Styled component exports for potential customization
export {
  ControlsContainer,
  ButtonGroup,
  ControlButton as StyledControlButton,
  ButtonIcon,
  ButtonText,
  StatusIndicator,
  Tooltip,
  ShortcutsPanel,
  ShortcutItem,
} from './GameControls.styles';

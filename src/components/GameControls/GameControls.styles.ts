/**
 * Styled components for the GameControls component.
 * Following Constitution Principle IV (Performance Standards) for 60fps animations.
 * Implements WCAG 2.1 AA accessibility standards with proper contrast and focus states.
 */

import styled, { css, keyframes } from 'styled-components';

/**
 * Keyframes for button animations optimized for 60fps performance.
 */
const buttonPressAnimation = keyframes`
  0% {
    transform: scale(1) translateZ(0);
  }
  50% {
    transform: scale(0.95) translateZ(0);
  }
  100% {
    transform: scale(1) translateZ(0);
  }
`;

const buttonHoverAnimation = keyframes`
  0% {
    transform: translateY(0) translateZ(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  100% {
    transform: translateY(-1px) translateZ(0);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

/**
 * Main container for the game controls panel.
 */
export const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
  margin: 16px;
  min-height: 64px;
  position: relative;
  overflow: hidden;

  /* Performance optimization for 60fps */
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);

  /* Responsive design */
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 16px;
    margin: 8px;
  }

  /* Focus container for keyboard navigation */
  &:focus-within {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }
`;

/**
 * Button group container for organizing related controls.
 */
export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  &:not(:last-child)::after {
    content: '';
    width: 1px;
    height: 32px;
    background: #dee2e6;
    margin-left: 8px;
  }

  @media (max-width: 768px) {
    gap: 4px;

    &:not(:last-child)::after {
      display: none;
    }
  }
`;

/**
 * Base button styles with performance optimizations.
 */
export const ControlButton = styled.button<{
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  isPressed?: boolean;
  isLoading?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 44px; /* WCAG 2.1 AA minimum touch target */
  min-height: 44px;

  /* Performance optimization */
  will-change: transform, box-shadow;
  backface-visibility: hidden;
  transform: translateZ(0);

  /* Base colors */
  ${({ variant = 'secondary' }) => {
    switch (variant) {
      case 'primary':
        return css`
          background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
          color: white;

          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #0052a3 0%, #003875 100%);
          }
        `;
      case 'danger':
        return css`
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;

          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
          }
        `;
      case 'success':
        return css`
          background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
          color: white;

          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #1e7e34 0%, #155724 100%);
          }
        `;
      default:
        return css`
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          color: #495057;
          border: 1px solid #ced4da;

          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-color: #adb5bd;
          }
        `;
    }
  }}

  /* Hover effects */
  &:hover:not(:disabled) {
    animation: ${buttonHoverAnimation} 0.2s ease-out forwards;
  }

  /* Active/pressed state */
  &:active:not(:disabled),
  ${({ isPressed }) =>
    isPressed &&
    css`
      animation: ${buttonPressAnimation} 0.15s ease-in-out;
    `}
  
  /* Focus state for accessibility */
  &:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #f8f9fa !important;
    color: #6c757d !important;
    border-color: #dee2e6 !important;
    box-shadow: none !important;
    transform: none !important;
  }

  /* Loading state */
  ${({ isLoading }) =>
    isLoading &&
    css`
      cursor: wait;

      &::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: ${spin} 1s linear infinite;
        margin-left: 8px;
      }
    `}

  /* Icon-only button styles */
  &[aria-label]:not([aria-label=""]) {
    min-width: 44px;
    padding: 12px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 13px;
    gap: 6px;
  }
`;

/**
 * Icon container with proper sizing and alignment.
 */
export const ButtonIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 16px;
  line-height: 1;

  /* Ensure icons are always crisp */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

/**
 * Button text with proper typography.
 */
export const ButtonText = styled.span`
  white-space: nowrap;

  @media (max-width: 480px) {
    display: none; /* Hide text on very small screens, show only icons */
  }
`;

/**
 * Tooltip container for keyboard shortcuts and descriptions.
 */
export const Tooltip = styled.div<{ isVisible: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`;

/**
 * Game status indicator with color-coded states.
 */
export const StatusIndicator = styled.div<{
  status: 'playing' | 'paused' | 'won' | 'new' | 'lost';
}>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${({ status }) => {
    switch (status) {
      case 'playing':
        return css`
          background: rgba(40, 167, 69, 0.1);
          color: #155724;

          &::before {
            content: '●';
            color: #28a745;
            animation: ${pulseAnimation} 2s infinite;
          }
        `;
      case 'paused':
        return css`
          background: rgba(255, 193, 7, 0.1);
          color: #856404;

          &::before {
            content: '⏸';
            color: #ffc107;
          }
        `;
      case 'won':
        return css`
          background: rgba(40, 167, 69, 0.1);
          color: #155724;

          &::before {
            content: '🏆';
          }
        `;
      case 'lost':
        return css`
          background: rgba(220, 53, 69, 0.1);
          color: #721c24;

          &::before {
            content: '❌';
          }
        `;
      default:
        return css`
          background: rgba(108, 117, 125, 0.1);
          color: #495057;

          &::before {
            content: '●';
            color: #6c757d;
          }
        `;
    }
  }}
`;

/**
 * Keyboard shortcuts help panel.
 */
export const ShortcutsPanel = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 16px;
  margin-top: 8px;
  z-index: 1000;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
  transform: translateY(${({ isVisible }) => (isVisible ? 0 : -8)}px);
  transition: all 0.2s ease;

  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #495057;
  }
`;

/**
 * Individual shortcut item in the help panel.
 */
export const ShortcutItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #f8f9fa;

  &:last-child {
    border-bottom: none;
  }

  .shortcut-key {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 2px 6px;
    font-family: monospace;
    font-size: 11px;
    font-weight: 600;
    color: #495057;
  }

  .shortcut-action {
    font-size: 12px;
    color: #6c757d;
  }
`;

/**
 * Spin animation for loading states.
 */
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

/**
 * FoundationPile Styled Components
 *
 * Provides styled-components for the FoundationPile component with:
 * - 60fps animations and transitions
 * - Drag-and-drop visual feedback
 * - Accessibility-compliant styling
 * - Responsive design
 * - Performance-optimized animations
 */

import styled, { css, keyframes } from 'styled-components';
import { Suit } from '../../types/index';
import { Card } from '../Card/Card';
import { pulseHighlightKeyframes } from '../../styles/keyframes';
import { DURATIONS, EASING } from '../../styles/animation';

/**
 * Legacy animation keyframes (now using centralized animation system)
 */

const glow = keyframes`
  0% {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: 0 4px 20px rgba(40, 167, 69, 0.4);
  }
  100% {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const completionCelebration = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
`;

/**
 * Interface for FoundationPileContainer props
 */
interface FoundationPileContainerProps {
  isOver: boolean;
  canDrop: boolean;
  isDisabled: boolean;
  isSelected: boolean;
  isComplete: boolean;
}

/**
 * Main container for the foundation pile
 */
export const FoundationPileContainer = styled.div.withConfig({
  shouldForwardProp: prop =>
    !['isOver', 'canDrop', 'isDisabled', 'isSelected', 'isComplete'].includes(
      prop
    ),
})<FoundationPileContainerProps>`
  position: relative;
  width: 80px;
  height: 110px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: #f8f9fa;
  cursor: ${props => (props.isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease-in-out;
  opacity: ${props => (props.isDisabled ? 0.5 : 1)};

  /* Base styling */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* Focus styling for accessibility */
  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }

  /* Hover effects */
  &:hover:not(:disabled) {
    border-color: #007bff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* Selection state */
  ${props =>
    props.isSelected &&
    css`
      border-color: #007bff;
      background-color: #e3f2fd;
      animation: ${pulseHighlightKeyframes} ${DURATIONS.SLOW}ms
        ${EASING.EASE_IN_OUT} infinite;
    `}

  /* Drag-over state */
  ${props =>
    props.isOver &&
    css`
      border-color: ${props.canDrop ? '#28a745' : '#dc3545'};
      background-color: ${props.canDrop ? '#d4edda' : '#f8d7da'};
      border-style: ${props.canDrop ? 'solid' : 'dashed'};
      animation: ${props.canDrop ? glow : 'none'} 1s infinite;

      &::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px solid ${props.canDrop ? '#28a745' : '#dc3545'};
        border-radius: 10px;
        opacity: 0.5;
        animation: ${pulseHighlightKeyframes} ${DURATIONS.FAST}ms
          ${EASING.EASE_IN_OUT} infinite;
      }
    `}
  
  /* Completion state */
  ${props =>
    props.isComplete &&
    css`
      border-color: #28a745;
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      box-shadow: 0 4px 20px rgba(40, 167, 69, 0.3);
    `}
  
  /* Animation data attribute support */
  &[data-animation="pulse"] {
    animation: ${pulseHighlightKeyframes} ${DURATIONS.SLOW}ms
      ${EASING.EASE_IN_OUT} infinite;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    &[data-reduced-motion='true'] {
      animation: none !important;
    }
  }

  /* Performance optimization */
  will-change: transform, box-shadow, border-color;
  transform-origin: center;
`;

/**
 * Content area within the foundation pile
 */
export const FoundationPileContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  overflow: hidden;
`;

/**
 * Label for the foundation pile
 */
export const FoundationPileLabel = styled.div`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #6c757d;
  white-space: nowrap;
  pointer-events: none;
  font-weight: 500;
`;

/**
 * Placeholder for empty foundation piles
 */
export const FoundationPilePlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border: 2px dashed #ccc;
  border-radius: 6px;
  font-size: 24px;
  font-weight: bold;
  color: #adb5bd;
  background-color: rgba(255, 255, 255, 0.5);

  span {
    opacity: 0.7;
  }
`;

/**
 * Interface for SuitIndicator props
 */
interface SuitIndicatorProps {
  suit: Suit;
  color: 'red' | 'black';
}

/**
 * Suit indicator for foundation piles
 */
export const SuitIndicator = styled.div.withConfig({
  shouldForwardProp: prop => !['suit', 'color'].includes(prop),
})<SuitIndicatorProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  font-size: 32px;
  font-weight: bold;
  color: ${props => (props.color === 'red' ? '#dc3545' : '#212529')};
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  border: 1px solid ${props => (props.color === 'red' ? '#dc3545' : '#212529')};
  opacity: 0.7;
  transition: all 0.2s ease-in-out;

  /* Add subtle animation */
  animation: ${pulseHighlightKeyframes} ${DURATIONS.EXTENDED}ms
    ${EASING.EASE_IN_OUT} infinite;
`;

/**
 * Top card display (styled Card component)
 */
export const TopCard = styled(Card)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;

  /* Ensure card fits within foundation pile */
  max-width: 70px;
  max-height: 95px;
`;

/**
 * Completion badge for completed foundation piles
 */
export const CompletionBadge = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  background-color: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  z-index: 2;
  animation: ${completionCelebration} 0.5s ease-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

/**
 * Drag indicator overlay
 */
export const DragIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 123, 255, 0.1);
  border: 2px dashed #007bff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  pointer-events: none;

  &::after {
    content: '+';
    font-size: 24px;
    font-weight: bold;
    color: #007bff;
  }

  /* Show when drag-over */
  .drag-over & {
    opacity: 1;
  }
`;

/**
 * Error indicator for invalid drops
 */
export const ErrorIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;

  &.show {
    opacity: 1;
  }
`;

/**
 * Responsive design for smaller screens
 */
export const ResponsiveWrapper = styled.div`
  @media (max-width: 768px) {
    ${FoundationPileContainer} {
      width: 60px;
      height: 85px;
    }

    ${FoundationPileLabel} {
      font-size: 8px;
      bottom: -15px;
    }

    ${SuitIndicator} {
      width: 40px;
      height: 40px;
      font-size: 24px;
    }

    ${CompletionBadge} {
      width: 16px;
      height: 16px;
      font-size: 10px;
      top: 3px;
      right: 3px;
    }
  }

  @media (max-width: 480px) {
    ${FoundationPileContainer} {
      width: 50px;
      height: 70px;
    }

    ${SuitIndicator} {
      width: 35px;
      height: 35px;
      font-size: 20px;
    }
  }
`;

export default {
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
};

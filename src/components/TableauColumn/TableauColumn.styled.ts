/**
 * TableauColumn Styled Components
 * Provides styled-components for the TableauColumn component
 * Implements cascade effect, animations, and responsive design
 */

import styled, { css, keyframes } from 'styled-components';
import {
  TableauColumnTheme,
  defaultTableauColumnTheme,
} from './TableauColumn.types';

/**
 * Props interface for styled components
 */
interface StyledTableauColumnProps {
  theme?: Partial<TableauColumnTheme>;
  isValidDropTarget?: boolean;
  isOver?: boolean;
  canDrop?: boolean;
  isEmpty?: boolean;
}

interface StyledCardSlotProps {
  theme?: Partial<TableauColumnTheme>;
  cascadeIndex: number;
  isFaceUp: boolean;
  isDraggable: boolean;
  isTopCard: boolean;
}

/**
 * Animation keyframes for various effects
 */
const dropHighlight = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(0, 123, 255, 0.2);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
`;

const cardFlip = keyframes`
  0% {
    transform: perspective(600px) rotateY(0deg);
  }
  50% {
    transform: perspective(600px) rotateY(90deg);
  }
  100% {
    transform: perspective(600px) rotateY(0deg);
  }
`;

const cardMove = keyframes`
  0% {
    transform: translateY(-10px);
    opacity: 0.8;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

/**
 * Main container for the tableau column
 * Handles drop zone styling and animations
 */
export const TableauColumnContainer = styled.div<StyledTableauColumnProps>`
  position: relative;
  width: 80px;
  min-height: 120px;
  padding: 8px;
  border-radius: ${props =>
    props.theme?.borderRadius || defaultTableauColumnTheme.borderRadius};
  background-color: ${props =>
    props.theme?.backgroundColor || defaultTableauColumnTheme.backgroundColor};
  border: 2px solid transparent;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;

  /* Drop zone styling */
  ${props =>
    props.canDrop &&
    css`
      border-color: ${props.theme?.dropZoneColor ||
      defaultTableauColumnTheme.dropZoneColor};
      background-color: ${props.theme?.dropZoneColor ||
      defaultTableauColumnTheme.dropZoneColor}20;
    `}

  ${props =>
    props.isOver &&
    props.canDrop &&
    css`
      border-color: ${props.theme?.hoverColors?.borderColor ||
      defaultTableauColumnTheme.hoverColors.borderColor};
      background-color: ${props.theme?.hoverColors?.backgroundColor ||
      defaultTableauColumnTheme.hoverColors.backgroundColor};
      animation: ${dropHighlight} 1s ease-in-out infinite;
    `}

  ${props =>
    props.isValidDropTarget &&
    css`
      border-color: #28a745;
      background-color: #28a74520;
    `}

  /* Hover effects */
  &:hover {
    background-color: ${props =>
      props.theme?.hoverColors?.backgroundColor ||
      defaultTableauColumnTheme.hoverColors.backgroundColor}40;
  }

  /* Focus management for accessibility */
  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }

  /* Empty state styling */
  ${props =>
    props.isEmpty &&
    css`
      &::before {
        content: '';
        position: absolute;
        top: 8px;
        left: 8px;
        right: 8px;
        height: 110px;
        border: 2px dashed
          ${props.theme?.placeholderColor ||
          defaultTableauColumnTheme.placeholderColor};
        border-radius: ${props.theme?.borderRadius ||
        defaultTableauColumnTheme.borderRadius};
        opacity: 0.5;
      }
    `}
`;

/**
 * Container for card slots with cascade effect
 * Manages the positioning and stacking of cards
 */
export const CardSlot = styled.div<StyledCardSlotProps>`
  position: relative;
  width: 70px;
  height: ${props => (props.isTopCard ? '100px' : '24px')};
  margin-bottom: ${props =>
    props.theme?.cardSpacing || defaultTableauColumnTheme.cardSpacing}px;

  /* Cascade effect positioning */
  top: ${props =>
    props.cascadeIndex *
    (props.theme?.cascadeOffset || defaultTableauColumnTheme.cascadeOffset)}px;
  z-index: ${props => props.cascadeIndex + 1};

  /* Animation for card placement */
  animation: ${cardMove}
    ${props =>
      props.theme?.animations?.moveDuration ||
      defaultTableauColumnTheme.animations.moveDuration}ms
    ease-out;

  /* Face-up/down card styling */
  ${props =>
    !props.isFaceUp &&
    css`
      opacity: 0.8;
    `}

  /* Draggable card styling */
  ${props =>
    props.isDraggable &&
    css`
      cursor: grab;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      &:active {
        cursor: grabbing;
      }
    `}

  /* Card flip animation */
  &.flipping {
    animation: ${cardFlip}
      ${props =>
        props.theme?.animations?.flipDuration ||
        defaultTableauColumnTheme.animations.flipDuration}ms
      ease-in-out;
  }
`;

/**
 * Empty slot placeholder for empty columns
 * Shows where cards can be placed
 */
export const EmptySlot = styled.div<{ theme?: Partial<TableauColumnTheme> }>`
  width: 70px;
  height: 100px;
  border: 2px dashed
    ${props =>
      props.theme?.placeholderColor ||
      defaultTableauColumnTheme.placeholderColor};
  border-radius: ${props =>
    props.theme?.borderRadius || defaultTableauColumnTheme.borderRadius};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props =>
    props.theme?.placeholderColor ||
    defaultTableauColumnTheme.placeholderColor};
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  opacity: 0.6;
  transition: all 0.2s ease-in-out;
  background-color: rgba(255, 255, 255, 0.02);

  &::before {
    content: 'K';
    font-size: 16px;
    opacity: 0.3;
  }

  /* Hover effects for empty slots */
  &:hover {
    opacity: 0.8;
    border-color: ${props =>
      props.theme?.hoverColors?.borderColor ||
      defaultTableauColumnTheme.hoverColors.borderColor};
  }
`;

/**
 * Card stack container for managing multiple cards
 * Handles the cascade effect and overflow
 */
export const CardStack = styled.div<{ theme?: Partial<TableauColumnTheme> }>`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;

  /* Ensure proper stacking context */
  z-index: 1;
`;

/**
 * Drop zone indicator for visual feedback
 * Shows valid drop areas during drag operations
 */
export const DropZoneIndicator = styled.div<{
  theme?: Partial<TableauColumnTheme>;
  isActive?: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid
    ${props =>
      props.theme?.dropZoneColor || defaultTableauColumnTheme.dropZoneColor};
  border-radius: ${props =>
    props.theme?.borderRadius || defaultTableauColumnTheme.borderRadius};
  background-color: ${props =>
    props.theme?.dropZoneColor || defaultTableauColumnTheme.dropZoneColor}20;
  opacity: ${props => (props.isActive ? 1 : 0)};
  transition: opacity 0.2s ease-in-out;
  pointer-events: none;
  z-index: 1000;

  /* Pulse animation for active drop zones */
  ${props =>
    props.isActive &&
    css`
      animation: ${dropHighlight} 1.5s ease-in-out infinite;
    `}
`;

/**
 * Accessibility helper for screen readers
 * Provides context about the column state
 */
export const ScreenReaderText = styled.span`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

/**
 * Card reveal button for face-down cards
 * Allows keyboard users to reveal cards
 */
export const RevealButton = styled.button<{
  theme?: Partial<TableauColumnTheme>;
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: ${props =>
    props.theme?.hoverColors?.backgroundColor ||
    defaultTableauColumnTheme.hoverColors.backgroundColor};
  color: ${props =>
    props.theme?.hoverColors?.borderColor ||
    defaultTableauColumnTheme.hoverColors.borderColor};
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease-in-out;
  z-index: 10;

  /* Show on hover or focus */
  ${CardSlot}:hover &,
  ${CardSlot}:focus-within & {
    opacity: 1;
  }

  &:hover,
  &:focus {
    background-color: ${props =>
      props.theme?.hoverColors?.borderColor ||
      defaultTableauColumnTheme.hoverColors.borderColor};
    color: white;
    transform: translate(-50%, -50%) scale(1.1);
  }

  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
`;

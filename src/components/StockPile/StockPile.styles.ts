/**
 * StockPile Component Styled Components
 * Provides styled-components for the StockPile component with animations,
 * hover effects, and accessibility features
 */

import styled, { css, keyframes } from 'styled-components';
import { StockPileTheme, StockPileState } from './StockPile.types';

/**
 * Animation keyframes for stock pile operations
 */
const drawAnimation = keyframes`
  0% {
    transform: scale(1) rotateY(0deg);
  }
  25% {
    transform: scale(1.05) rotateY(-5deg);
  }
  50% {
    transform: scale(1.1) rotateY(0deg);
  }
  75% {
    transform: scale(1.05) rotateY(5deg);
  }
  100% {
    transform: scale(1) rotateY(0deg);
  }
`;

const resetAnimation = keyframes`
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateX(-20px) scale(0.9);
    opacity: 0.7;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
`;

const flipAnimation = keyframes`
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(90deg);
  }
  100% {
    transform: rotateY(0deg);
  }
`;

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
`;

/**
 * Main container for the StockPile component
 */
export const StockPileContainer = styled.div<{
  theme: StockPileTheme;
  isDisabled: boolean;
  isSelected: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: ${props => props.theme.container.gap};
  padding: ${props => props.theme.container.padding};
  background-color: ${props => props.theme.container.backgroundColor};
  border: 2px solid ${props => props.theme.container.borderColor};
  border-radius: ${props => props.theme.container.borderRadius};

  /* Accessibility focus styles */
  &:focus-visible {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }

  /* Selected state for keyboard navigation */
  ${props =>
    props.isSelected &&
    css`
      border-color: #007bff;
      animation: ${pulseAnimation} 2s infinite;
    `}

  /* Disabled state */
  ${props =>
    props.isDisabled &&
    css`
      opacity: ${props.theme.disabled.opacity};
      cursor: ${props.theme.disabled.cursor};
      filter: ${props.theme.disabled.filter};
      pointer-events: none;
    `}

  /* Responsive design */
  @media (max-width: 768px) {
    gap: 8px;
    padding: 6px;
  }
`;

/**
 * Individual pile container (stock or waste)
 */
export const PileContainer = styled.div<{
  theme: StockPileTheme;
  pileType: 'stock' | 'waste';
  state: StockPileState;
  onClick?: () => void;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${props =>
    props.pileType === 'stock'
      ? props.theme.stockPile.minHeight
      : props.theme.wastePile.minHeight};
  min-width: ${props =>
    props.pileType === 'stock'
      ? props.theme.stockPile.minWidth
      : props.theme.wastePile.minWidth};
  background-color: ${props =>
    props.pileType === 'stock'
      ? props.theme.stockPile.backgroundColor
      : props.theme.wastePile.backgroundColor};
  border: ${props =>
    props.pileType === 'stock'
      ? `${props.theme.stockPile.borderWidth} ${props.theme.stockPile.borderStyle} ${props.theme.stockPile.borderColor}`
      : `${props.theme.wastePile.borderWidth} ${props.theme.wastePile.borderStyle} ${props.theme.wastePile.borderColor}`};
  border-radius: ${props =>
    props.pileType === 'stock'
      ? props.theme.stockPile.borderRadius
      : props.theme.wastePile.borderRadius};
  cursor: ${props => (props.onClick ? 'pointer' : 'default')};
  transition: ${props => props.theme.hover.transition};

  /* Hover effects for interactive piles */
  ${props =>
    props.onClick &&
    css`
      &:hover {
        background-color: ${props.theme.hover.backgroundColor};
        border-color: ${props.theme.hover.borderColor};
        transform: ${props.theme.hover.transform};
      }
    `}

  /* Pressed state */
  ${props =>
    props.state.isPressed &&
    css`
      transform: scale(0.95);
      transition: transform 0.1s ease-in-out;
    `}

  /* Animation states */
  ${props =>
    props.state.animation?.type === 'draw' &&
    props.state.animation.isPlaying &&
    css`
      animation: ${drawAnimation} ${props.state.animation.duration}ms
        ease-in-out;
    `}

  ${props =>
    props.state.animation?.type === 'reset' &&
    props.state.animation.isPlaying &&
    css`
      animation: ${resetAnimation} ${props.state.animation.duration}ms
        ease-in-out;
    `}

  ${props =>
    props.state.animation?.type === 'flip' &&
    props.state.animation.isPlaying &&
    css`
      animation: ${flipAnimation} ${props.state.animation.duration}ms
        ease-in-out;
    `}

  /* Focus styles for keyboard navigation */
  &:focus-visible {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
`;

/**
 * Card stack container for overlapping cards
 */
export const CardStack = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Child cards positioning for stack effect */
  > * {
    position: absolute;
  }

  /* Stack multiple cards with slight offset */
  > *:nth-child(1) {
    z-index: 3;
    transform: translate(0, 0);
  }

  > *:nth-child(2) {
    z-index: 2;
    transform: translate(-2px, -2px);
  }

  > *:nth-child(3) {
    z-index: 1;
    transform: translate(-4px, -4px);
  }
`;

/**
 * Placeholder for empty piles
 */
export const PilePlaceholder = styled.div<{
  theme: StockPileTheme;
  pileType: 'stock' | 'waste';
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: ${props => props.theme.placeholder.color};
  font-size: ${props => props.theme.placeholder.fontSize};
  font-weight: ${props => props.theme.placeholder.fontWeight};
  opacity: ${props => props.theme.placeholder.opacity};
  user-select: none;
  pointer-events: none;

  /* Different placeholders for stock vs waste */
  &::before {
    content: ${props => (props.pileType === 'stock' ? '"🂠"' : '"⭘"')};
    font-size: 24px;
    margin-bottom: 4px;
  }

  &::after {
    content: ${props =>
      props.pileType === 'stock' ? '"Click to draw"' : '"Waste pile"'};
    font-size: 10px;
    text-align: center;
  }
`;

/**
 * Card counter display
 */
export const CardCounter = styled.div<{
  theme: StockPileTheme;
}>`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: ${props => props.theme.counter.backgroundColor};
  color: ${props => props.theme.counter.color};
  font-size: ${props => props.theme.counter.fontSize};
  font-weight: ${props => props.theme.counter.fontWeight};
  padding: ${props => props.theme.counter.padding};
  border-radius: ${props => props.theme.counter.borderRadius};
  min-width: 20px;
  text-align: center;
  z-index: 10;
  user-select: none;
  pointer-events: none;
`;

/**
 * Draw mode indicator
 */
export const DrawModeIndicator = styled.div<{
  theme: StockPileTheme;
  mode: 1 | 3;
}>`
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${props => props.theme.counter.backgroundColor};
  color: ${props => props.theme.counter.color};
  font-size: ${props => props.theme.counter.fontSize};
  font-weight: ${props => props.theme.counter.fontWeight};
  padding: ${props => props.theme.counter.padding};
  border-radius: ${props => props.theme.counter.borderRadius};
  z-index: 10;
  user-select: none;
  pointer-events: none;

  &::before {
    content: '${props => props.mode}';
  }

  &::after {
    content: ' card${props => (props.mode > 1 ? 's' : '')}';
  }
`;

/**
 * Pile label for accessibility
 */
export const PileLabel = styled.div<{
  theme: StockPileTheme;
}>`
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  color: ${props => props.theme.placeholder.color};
  font-size: ${props => props.theme.placeholder.fontSize};
  font-weight: ${props => props.theme.placeholder.fontWeight};
  text-align: center;
  white-space: nowrap;
  user-select: none;
  pointer-events: none;

  /* Hide labels on mobile to save space */
  @media (max-width: 768px) {
    display: none;
  }
`;

/**
 * Reset indicator for when stock is empty
 */
export const ResetIndicator = styled.div<{
  theme: StockPileTheme;
  visible: boolean;
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 123, 255, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  z-index: 100;
  pointer-events: none;
  transition:
    opacity 0.3s ease-in-out,
    visibility 0.3s ease-in-out;

  opacity: ${props => (props.visible ? 1 : 0)};
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};

  &::before {
    content: '↻';
    margin-right: 4px;
  }

  &::after {
    content: 'Click to reset';
  }
`;

/**
 * Animation overlay for visual feedback
 */
export const AnimationOverlay = styled.div<{
  visible: boolean;
  animationType: 'draw' | 'reset' | 'error';
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 50;
  transition: opacity 0.3s ease-in-out;

  opacity: ${props => (props.visible ? 1 : 0)};

  ${props =>
    props.animationType === 'draw' &&
    css`
      background: linear-gradient(
        45deg,
        rgba(40, 167, 69, 0.2),
        rgba(40, 167, 69, 0.5)
      );
      box-shadow: inset 0 0 20px rgba(40, 167, 69, 0.3);
    `}

  ${props =>
    props.animationType === 'reset' &&
    css`
      background: linear-gradient(
        45deg,
        rgba(0, 123, 255, 0.2),
        rgba(0, 123, 255, 0.5)
      );
      box-shadow: inset 0 0 20px rgba(0, 123, 255, 0.3);
    `}

  ${props =>
    props.animationType === 'error' &&
    css`
      background: linear-gradient(
        45deg,
        rgba(220, 53, 69, 0.2),
        rgba(220, 53, 69, 0.5)
      );
      box-shadow: inset 0 0 20px rgba(220, 53, 69, 0.3);
    `}
`;

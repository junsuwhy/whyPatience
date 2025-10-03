/**
 * Card Component Styled Components
 * Provides styling for the Card component with animations and responsive design
 * Optimized for 60fps performance with hardware acceleration
 */

import styled, { css, keyframes } from 'styled-components';
import { Color, Suit } from '../../types/card';
import { CardTheme, defaultCardTheme } from './Card.types';

/**
 * Props interface for styled components
 */
interface StyledCardProps {
  theme?: CardTheme;
  isDragging?: boolean;
  isValidDropTarget?: boolean;
  isHighlighted?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  scale?: number;
  zIndex?: number;
}

/**
 * Animation keyframes for smooth transitions
 */
const hoverAnimation = keyframes`
  0% { transform: translateY(0px) scale(1); }
  100% { transform: translateY(-4px) scale(1.02); }
`;

const pulseAnimation = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
`;

const shimmerAnimation = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

/**
 * Main card container with drag-and-drop and animation support
 */
export const CardContainer = styled.div<StyledCardProps>`
  position: relative;
  width: 75px;
  height: 100px;
  border-radius: ${({ theme = defaultCardTheme }) => theme.borderRadius};
  border: 2px solid ${({ theme = defaultCardTheme }) => theme.borderColor};
  background-color: ${({ theme = defaultCardTheme }) => theme.backgroundColor};
  box-shadow: ${({ theme = defaultCardTheme }) => theme.boxShadow};
  cursor: ${({ isDragging, isDisabled }) =>
    isDisabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab'};
  user-select: none;

  /* Performance optimizations */
  will-change: transform, opacity;
  backface-visibility: hidden;
  perspective: 1000px;

  /* Transform properties for positioning and scaling */
  transform: ${({ scale = 1, zIndex = 0 }) => `
    scale(${scale}) 
    translateZ(${zIndex}px)
  `};
  z-index: ${({ zIndex = 0 }) => zIndex};

  /* Transition for smooth animations - optimized for 60fps */
  transition:
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  /* Hover effects */
  &:hover:not(:disabled) {
    animation: ${hoverAnimation} 0.2s ease-out forwards;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    border-color: ${({ theme = defaultCardTheme }) =>
      theme.hoverColors.borderColor};
    background-color: ${({ theme = defaultCardTheme }) =>
      theme.hoverColors.backgroundColor};
  }

  /* Focus states for accessibility */
  &:focus {
    outline: 3px solid #007bff;
    outline-offset: 2px;
  }

  /* Dragging state */
  ${({ isDragging, theme = defaultCardTheme }) =>
    isDragging &&
    css`
      opacity: ${theme.dragColors.opacity};
      background-color: ${theme.dragColors.backgroundColor};
      transform: rotate(5deg) scale(1.05);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
      z-index: 1000;
    `}

  /* Valid drop target state */
  ${({ isValidDropTarget }) =>
    isValidDropTarget &&
    css`
      border-color: #28a745;
      background-color: #d4edda;
      animation: ${pulseAnimation} 1s ease-in-out infinite;
    `}
  
  /* Highlighted state */
  ${({ isHighlighted }) =>
    isHighlighted &&
    css`
      border-color: #ffc107;
      background-color: #fff3cd;
      box-shadow: 0 0 20px rgba(255, 193, 7, 0.5);
    `}
  
  /* Selected state for keyboard navigation */
  ${({ isSelected }) =>
    isSelected &&
    css`
      border-color: #007bff;
      background-color: #e3f2fd;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
    `}
  
  /* Disabled state */
  ${({ isDisabled }) =>
    isDisabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
      filter: grayscale(100%);

      &:hover {
        animation: none;
        transform: none;
        box-shadow: inherit;
      }
    `}
  
  /* Responsive design */
  @media (max-width: 768px) {
    width: 60px;
    height: 80px;
  }

  @media (max-width: 480px) {
    width: 45px;
    height: 60px;
  }
`;

/**
 * Card face container for front/back display
 */
export const CardFace = styled.div<{ isRevealed: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Flip animation */
  transform: ${({ isRevealed }) =>
    isRevealed ? 'rotateY(0deg)' : 'rotateY(180deg)'};
`;

/**
 * Card front face with suit and rank display
 */
export const CardFront = styled(CardFace)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
`;

/**
 * Card back face with pattern
 */
export const CardBack = styled(CardFace)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);

  /* Shimmer effect for card back */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -200px;
    width: 200px;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: ${shimmerAnimation} 2s infinite;
  }
`;

/**
 * Card rank display (number or face card letter)
 */
export const CardRank = styled.div<{
  color: Color;
  size?: 'small' | 'medium' | 'large';
}>`
  font-family: ${({ theme = defaultCardTheme }) => theme.fontFamily};
  font-weight: bold;
  font-size: ${({ size = 'medium' }) => {
    switch (size) {
      case 'small':
        return '12px';
      case 'large':
        return '18px';
      default:
        return '14px';
    }
  }};
  color: ${({ color, theme }) =>
    color === Color.RED ? (theme?.suitColors?.red || defaultCardTheme.suitColors.red) : (theme?.suitColors?.black || defaultCardTheme.suitColors.black)};
  line-height: 1;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  /* Responsive font sizes */
  @media (max-width: 768px) {
    font-size: ${({ size = 'medium' }) => {
      switch (size) {
        case 'small':
          return '10px';
        case 'large':
          return '14px';
        default:
          return '12px';
      }
    }};
  }

  @media (max-width: 480px) {
    font-size: ${({ size = 'medium' }) => {
      switch (size) {
        case 'small':
          return '8px';
        case 'large':
          return '12px';
        default:
          return '10px';
      }
    }};
  }
`;

/**
 * Card suit symbol display
 */
export const CardSuit = styled.div<{
  suit: Suit;
  color: Color;
  size?: 'small' | 'medium' | 'large';
}>`
  font-size: ${({ size = 'medium' }) => {
    switch (size) {
      case 'small':
        return '12px';
      case 'large':
        return '20px';
      default:
        return '16px';
    }
  }};
  color: ${({ color, theme }) =>
    color === Color.RED ? (theme?.suitColors?.red || defaultCardTheme.suitColors.red) : (theme?.suitColors?.black || defaultCardTheme.suitColors.black)};
  line-height: 1;
  text-align: center;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));

  /* Unicode symbols for suits */
  &::before {
    content: ${({ suit }) => {
      switch (suit) {
        case Suit.HEARTS:
          return "'♥'";
        case Suit.DIAMONDS:
          return "'♦'";
        case Suit.CLUBS:
          return "'♣'";
        case Suit.SPADES:
          return "'♠'";
        default:
          return "''";
      }
    }};
  }

  /* Responsive sizes */
  @media (max-width: 768px) {
    font-size: ${({ size = 'medium' }) => {
      switch (size) {
        case 'small':
          return '10px';
        case 'large':
          return '16px';
        default:
          return '14px';
      }
    }};
  }

  @media (max-width: 480px) {
    font-size: ${({ size = 'medium' }) => {
      switch (size) {
        case 'small':
          return '8px';
        case 'large':
          return '14px';
        default:
          return '12px';
      }
    }};
  }
`;

/**
 * Card corner elements (rank and suit in corners)
 */
export const CardCorner = styled.div<{ position: 'top-left' | 'bottom-right' }>`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;

  ${({ position }) => {
    switch (position) {
      case 'top-left':
        return css`
          top: 3px;
          left: 3px;
        `;
      case 'bottom-right':
        return css`
          bottom: 3px;
          right: 3px;
          transform: rotate(180deg);
        `;
    }
  }}
`;

/**
 * Center suit symbol for face cards and aces
 */
export const CenterSuit = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-size: 24px;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

/**
 * Card back pattern
 */
export const CardBackPattern = styled.div`
  width: 80%;
  height: 80%;
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.1) 5px,
    transparent 5px,
    transparent 10px
  );
  border-radius: 4px;
  opacity: 0.8;
`;

/**
 * Loading shimmer effect for card loading states
 */
export const LoadingShimmer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 25%,
    rgba(255, 255, 255, 0.5) 50%,
    transparent 75%
  );
  background-size: 200% 100%;
  animation: ${shimmerAnimation} 1.5s infinite;
  border-radius: inherit;
`;

/**
 * GameBoard styled components
 *
 * Responsive layout styles for the main game board component using styled-components.
 * Follows the constitutional requirements for performance and user experience consistency.
 */

import styled, { css, keyframes } from 'styled-components';

// Animation keyframes
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
`;

const victoryAnimation = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

/**
 * Main game board container with responsive design
 */
export const GameBoardContainer = styled.div.withConfig({
  shouldForwardProp: prop => !['isDisabled', 'isGameWon'].includes(prop),
})<{
  isDisabled?: boolean;
  isGameWon?: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  min-height: 600px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow: hidden;

  /* Focus styles for accessibility */
  &:focus {
    outline: 2px solid #ffd700;
    outline-offset: -2px;
  }

  /* Disable interactions when disabled */
  ${props =>
    props.isDisabled &&
    css`
      pointer-events: none;
      opacity: 0.6;
    `}

  /* Victory state styling */
  ${props =>
    props.isGameWon &&
    css`
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          45deg,
          rgba(255, 215, 0, 0.1) 0%,
          rgba(255, 140, 0, 0.1) 50%,
          rgba(255, 215, 0, 0.1) 100%
        );
        animation: ${pulse} 2s infinite;
        pointer-events: none;
        z-index: 1;
      }
    `}

  /* Responsive design breakpoints */
  @media (max-width: 1200px) {
    height: auto;
    min-height: 500px;
  }

  @media (max-width: 768px) {
    padding: 8px;
    min-height: 400px;
  }

  @media (max-width: 480px) {
    padding: 4px;
    font-size: 14px;
  }
`;

/**
 * Main content area with grid layout
 */
export const GameBoardContent = styled.main`
  display: grid;
  grid-template-areas:
    'foundation foundation stock'
    'tableau tableau tableau'
    'controls controls statistics';
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 2fr 2fr 1fr;
  gap: 16px;
  padding: 16px;
  flex: 1;
  z-index: 2;
  position: relative;

  /* Responsive grid layout */
  @media (max-width: 1200px) {
    grid-template-areas:
      'foundation stock'
      'tableau tableau'
      'controls statistics';
    grid-template-columns: 3fr 1fr;
    gap: 12px;
  }

  @media (max-width: 768px) {
    grid-template-areas:
      'foundation'
      'stock'
      'tableau'
      'controls'
      'statistics';
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 8px;
  }
`;

/**
 * Foundation piles area
 */
export const FoundationArea = styled.section`
  grid-area: foundation;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${slideIn} 0.5s ease-out;

  /* Focus management for keyboard navigation */
  &:focus-within {
    box-shadow: 0 0 0 2px #ffd700;
  }

  @media (max-width: 768px) {
    gap: 8px;
    padding: 12px;
  }

  @media (max-width: 480px) {
    gap: 4px;
    padding: 8px;
    flex-wrap: wrap;
    justify-content: space-around;
  }
`;

/**
 * Tableau columns area
 */
export const TableauArea = styled.section`
  grid-area: tableau;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 400px;
  animation: ${slideIn} 0.5s ease-out 0.1s both;

  /* Scrollable on small screens */
  @media (max-width: 768px) {
    overflow-x: auto;
    overflow-y: hidden;
    gap: 6px;
    padding: 12px;
    min-height: 300px;
  }

  @media (max-width: 480px) {
    gap: 4px;
    padding: 8px;
    min-height: 250px;
  }
`;

/**
 * Stock and waste piles area
 */
export const StockArea = styled.section`
  grid-area: stock;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${slideIn} 0.5s ease-out 0.2s both;

  @media (max-width: 1200px) {
    justify-content: center;
  }

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: space-around;
    padding: 12px;
  }

  @media (max-width: 480px) {
    gap: 8px;
    padding: 8px;
  }
`;

/**
 * Game controls area
 */
export const ControlsArea = styled.section`
  grid-area: controls;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${slideIn} 0.5s ease-out 0.3s both;

  @media (max-width: 768px) {
    padding: 8px;
  }
`;

/**
 * Game statistics area
 */
export const StatisticsArea = styled.section`
  grid-area: statistics;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${slideIn} 0.5s ease-out 0.4s both;

  @media (max-width: 768px) {
    padding: 8px;
  }
`;

/**
 * Victory overlay for game completion
 */
export const VictoryOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.5s ease-out;
`;

/**
 * Victory message container
 */
export const VictoryMessage = styled.div`
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #1a1a1a;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: ${victoryAnimation} 0.6s ease-out;
  max-width: 400px;
  margin: 20px;

  h2 {
    font-size: 2rem;
    margin: 0 0 16px 0;
    font-weight: bold;
  }

  p {
    font-size: 1.1rem;
    margin: 8px 0;
    opacity: 0.9;
  }

  button {
    background: #1e3c72;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    margin-top: 20px;
    transition: all 0.2s ease;

    &:hover {
      background: #2a5298;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    &:focus {
      outline: 2px solid #1e3c72;
      outline-offset: 2px;
    }

    &:active {
      transform: translateY(0);
    }
  }

  @media (max-width: 480px) {
    padding: 24px;
    margin: 16px;

    h2 {
      font-size: 1.5rem;
    }

    p {
      font-size: 1rem;
    }
  }
`;

/**
 * Game message display
 */
export const GameMessage = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  z-index: 100;
  animation: ${slideIn} 0.3s ease-out;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 80%;
  text-align: center;

  @media (max-width: 480px) {
    top: 10px;
    padding: 8px 16px;
    font-size: 14px;
  }
`;

/**
 * Focus manager for accessibility instructions
 */
export const FocusManager = styled.div`
  position: absolute;
  top: -9999px;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;

  /* Make visible for screen readers but not visually */
  &:focus-within {
    position: static;
    width: auto;
    height: auto;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 1000;
  }
`;

/**
 * Loading state overlay
 */
export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  animation: ${fadeIn} 0.3s ease-out;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #ffd700;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

/**
 * Performance optimization styles
 */
export const PerformanceOptimized = css`
  /* Enable hardware acceleration for smooth animations */
  transform: translateZ(0);
  will-change: transform, opacity;

  /* Optimize repaints and reflows */
  contain: layout style paint;

  /* Smooth transitions */
  transition: all 0.2s ease;

  /* 60fps target optimizations */
  &:hover,
  &:focus,
  &:active {
    transition-duration: 0.1s;
  }
`;

// Apply performance optimizations to key components
export const OptimizedFoundationArea = styled(FoundationArea)`
  ${PerformanceOptimized}
`;

export const OptimizedTableauArea = styled(TableauArea)`
  ${PerformanceOptimized}
`;

export const OptimizedStockArea = styled(StockArea)`
  ${PerformanceOptimized}
`;

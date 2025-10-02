/**
 * Styled components for the GameStatistics component.
 * Provides responsive design and accessibility-compliant styling
 * following Constitution principles for UI consistency and performance.
 */

import styled, { css, keyframes } from 'styled-components';
import { StatisticsDisplayMode } from './GameStatistics.types';

/**
 * Animation keyframes for statistic value changes
 */
export const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

export const slideInAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const numberCountAnimation = keyframes`
  from {
    opacity: 0.5;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

/**
 * Main container for the GameStatistics component
 */
export const StatisticsContainer = styled.div<{
  isCompact?: boolean;
  displayMode: StatisticsDisplayMode;
}>`
  display: flex;
  flex-direction: column;
  gap: ${props => (props.isCompact ? '0.5rem' : '1rem')};
  padding: ${props => (props.isCompact ? '0.5rem' : '1rem')};
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: ${props => (props.isCompact ? '200px' : '280px')};
  max-width: 100%;
  animation: ${slideInAnimation} 0.3s ease-out;

  /* Responsive design */
  @media (max-width: 768px) {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border: 2px solid #000;
    background: #fff;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  /* Focus management for keyboard navigation */
  &:focus-within {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }
`;

/**
 * Header section for the statistics panel
 */
export const StatisticsHeader = styled.div<{ isCompact?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => (props.isCompact ? '0.25rem' : '0.5rem')};
  padding-bottom: ${props => (props.isCompact ? '0.25rem' : '0.5rem')};
  border-bottom: 1px solid #dee2e6;
`;

/**
 * Title for the statistics panel
 */
export const StatisticsTitle = styled.h3<{ isCompact?: boolean }>`
  margin: 0;
  font-size: ${props => (props.isCompact ? '0.875rem' : '1rem')};
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  /* Icon styling */
  .title-icon {
    font-size: 1.2em;
  }
`;

/**
 * Display mode toggle buttons
 */
export const ModeToggle = styled.div`
  display: flex;
  gap: 0.25rem;
  background: #fff;
  border-radius: 4px;
  padding: 0.125rem;
  border: 1px solid #dee2e6;
`;

export const ModeButton = styled.button<{ isActive?: boolean }>`
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border: none;
  border-radius: 3px;
  background: ${props => (props.isActive ? '#0066cc' : 'transparent')};
  color: ${props => (props.isActive ? '#fff' : '#6c757d')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => (props.isActive ? '#0056b3' : '#f8f9fa')};
  }

  &:focus {
    outline: 2px solid #0066cc;
    outline-offset: 1px;
  }

  /* Accessibility support */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Grid container for statistics items
 */
export const StatisticsGrid = styled.div<{ isCompact?: boolean }>`
  display: grid;
  grid-template-columns: ${props =>
    props.isCompact ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))'};
  gap: ${props => (props.isCompact ? '0.5rem' : '0.75rem')};

  /* Responsive adjustments */
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * Individual statistic item container
 */
export const StatisticItem = styled.div<{
  isHighlighted?: boolean;
  isAnimating?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  isClickable?: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.5rem;
  background: #fff;
  border-radius: 6px;
  border: 1px solid ${props => (props.isHighlighted ? '#28a745' : '#e9ecef')};
  box-shadow: ${props =>
    props.isHighlighted
      ? '0 2px 8px rgba(40, 167, 69, 0.2)'
      : '0 1px 3px rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s ease;
  cursor: ${props => (props.isClickable ? 'pointer' : 'default')};
  position: relative;

  /* Animation states */
  ${props =>
    props.isAnimating &&
    css`
      animation: ${pulseAnimation} 0.6s ease-in-out;
    `}

  /* Trend indicators */
  ${props =>
    props.trend === 'up' &&
    css`
      border-left: 3px solid #28a745;
    `}
  
  ${props =>
    props.trend === 'down' &&
    css`
      border-left: 3px solid #dc3545;
    `}

  /* Hover effects for clickable items */
  ${props =>
    props.isClickable &&
    css`
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    `}

  /* Focus management */
  &:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    animation: none;

    ${props =>
      props.isClickable &&
      css`
        &:hover {
          transform: none;
        }
      `}
  }
`;

/**
 * Icon for statistic items
 */
export const StatisticIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
  opacity: 0.8;
`;

/**
 * Label for statistic items
 */
export const StatisticLabel = styled.div<{ isCompact?: boolean }>`
  font-size: ${props => (props.isCompact ? '0.7rem' : '0.75rem')};
  color: #6c757d;
  font-weight: 500;
  text-align: center;
  margin-bottom: 0.25rem;
  line-height: 1.2;
`;

/**
 * Value display for statistic items
 */
export const StatisticValue = styled.div<{
  isAnimating?: boolean;
  isHighlighted?: boolean;
  isCompact?: boolean;
}>`
  font-size: ${props => (props.isCompact ? '1rem' : '1.25rem')};
  font-weight: 700;
  color: ${props => (props.isHighlighted ? '#28a745' : '#212529')};
  text-align: center;
  min-height: ${props => (props.isCompact ? '1rem' : '1.25rem')};
  display: flex;
  align-items: center;
  justify-content: center;

  /* Animation for value changes */
  ${props =>
    props.isAnimating &&
    css`
      animation: ${numberCountAnimation} 0.4s ease-out;
    `}

  /* Accessibility - ensure good contrast */
  @media (prefers-contrast: high) {
    color: #000;
    font-weight: 800;
  }
`;

/**
 * Comparison indicator for performance tracking
 */
export const ComparisonIndicator = styled.div<{
  trend: 'improvement' | 'decline' | 'same';
}>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  margin-top: 0.25rem;
  color: ${props => {
    switch (props.trend) {
      case 'improvement':
        return '#28a745';
      case 'decline':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }};

  .trend-icon {
    font-size: 0.8em;
  }
`;

/**
 * Tooltip container for additional information
 */
export const StatisticTooltip = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 1000;
  opacity: ${props => (props.isVisible ? 1 : 0)};
  visibility: ${props => (props.isVisible ? 'visible' : 'hidden')};
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;
  pointer-events: none;

  /* Tooltip arrow */
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
 * Real-time update indicator
 */
export const UpdateIndicator = styled.div<{ isUpdating: boolean }>`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => (props.isUpdating ? '#28a745' : '#6c757d')};
  opacity: ${props => (props.isUpdating ? 1 : 0.3)};
  transition: all 0.3s ease;

  ${props =>
    props.isUpdating &&
    css`
      box-shadow: 0 0 8px rgba(40, 167, 69, 0.5);
    `}
`;

/**
 * Loading state for statistics
 */
export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6c757d;
  font-size: 0.875rem;

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e9ecef;
    border-top: 2px solid #0066cc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .loading-spinner {
      animation: none;
      border-top-color: #6c757d;
    }
  }
`;

/**
 * Type definitions for the GameStatistics component.
 * This file defines interfaces for props, statistical data display,
 * and component state management.
 */

import { GameStatistics, OverallStatistics } from '../../types/game-state';

/**
 * Statistical display mode enumeration for different view modes.
 */
export enum StatisticsDisplayMode {
  /** Current game statistics only */
  CURRENT_GAME = 'current_game',
  /** Overall session statistics */
  OVERALL = 'overall',
  /** Combined view with both current and overall stats */
  COMBINED = 'combined',
}

/**
 * Time format enumeration for displaying elapsed time.
 */
export enum TimeFormat {
  /** Format as MM:SS */
  MINUTES_SECONDS = 'mm:ss',
  /** Format as HH:MM:SS */
  HOURS_MINUTES_SECONDS = 'hh:mm:ss',
  /** Format as readable text (e.g., "2 minutes 30 seconds") */
  READABLE = 'readable',
}

/**
 * Statistic item interface for individual statistic display.
 */
export interface StatisticItem {
  /** Unique identifier for the statistic */
  id: string;
  /** Display label for the statistic */
  label: string;
  /** Current value of the statistic */
  value: string | number;
  /** Formatted display value (if different from raw value) */
  displayValue: string;
  /** Icon or emoji to display with the statistic */
  icon: string;
  /** Tooltip or description for the statistic */
  tooltip: string;
  /** Whether this statistic should be highlighted */
  isHighlighted?: boolean;
  /** Trend indicator (positive/negative/neutral) */
  trend?: 'up' | 'down' | 'neutral';
  /** ARIA label for accessibility */
  ariaLabel: string;
}

/**
 * Props interface for the GameStatistics component.
 */
export interface GameStatisticsProps {
  /** Current game statistics */
  currentStats: GameStatistics;
  /** Overall statistics across all games */
  overallStats?: OverallStatistics;
  /** Display mode for the statistics */
  displayMode?: StatisticsDisplayMode;
  /** Time format for elapsed time display */
  timeFormat?: TimeFormat;
  /** Whether to show real-time updates */
  showRealTimeUpdates?: boolean;
  /** Whether to animate statistic changes */
  animateChanges?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Whether the component is in compact mode */
  isCompact?: boolean;
  /** Whether to show comparison with best performance */
  showComparison?: boolean;
  /** Whether to show percentage improvements */
  showPercentages?: boolean;
  /** Custom aria-label for the statistics panel */
  ariaLabel?: string;
  /** Callback when a statistic is clicked (for detailed view) */
  onStatisticClick?: (statisticId: string) => void;
  /** Callback when display mode changes */
  onDisplayModeChange?: (mode: StatisticsDisplayMode) => void;
}

/**
 * Internal component state for managing statistics display.
 */
export interface GameStatisticsState {
  /** Currently displayed statistics */
  displayedStats: StatisticItem[];
  /** Previously displayed values for animation */
  previousValues: Record<string, string | number>;
  /** Animation state for each statistic */
  animatingStats: Set<string>;
  /** Last update timestamp for real-time updates */
  lastUpdate: number;
}

/**
 * Configuration for statistic formatting and display.
 */
export interface StatisticConfig {
  /** Statistical key from GameStatistics or OverallStatistics */
  key: keyof GameStatistics | keyof OverallStatistics;
  /** Display label */
  label: string;
  /** Icon or emoji */
  icon: string;
  /** Formatting function for the value */
  formatter: (value: number) => string;
  /** Tooltip description */
  tooltip: string;
  /** Whether to show in compact mode */
  showInCompact?: boolean;
  /** Display priority (higher numbers displayed first) */
  priority: number;
  /** ARIA label template */
  ariaLabel: string;
}

/**
 * Animation configuration for statistic value changes.
 */
export interface StatisticAnimationConfig {
  /** Animation duration in milliseconds */
  duration: number;
  /** Animation easing function */
  easing: string;
  /** Whether to use staggered animations */
  staggered: boolean;
  /** Stagger delay between statistics */
  staggerDelay: number;
  /** Whether to pulse on value change */
  pulseOnChange: boolean;
}

/**
 * Comparison data interface for showing performance improvements.
 */
export interface StatisticComparison {
  /** Current value */
  current: number;
  /** Best value achieved */
  best: number;
  /** Average value */
  average: number;
  /** Percentage improvement from average */
  improvementPercentage: number;
  /** Whether current value is a personal best */
  isPersonalBest: boolean;
}

/**
 * Real-time update configuration interface.
 */
export interface RealTimeUpdateConfig {
  /** Update interval in milliseconds */
  interval: number;
  /** Whether to pause updates when not visible */
  pauseWhenHidden: boolean;
  /** Whether to batch multiple updates */
  batchUpdates: boolean;
  /** Maximum batch size for updates */
  maxBatchSize: number;
}

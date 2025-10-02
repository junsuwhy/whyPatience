/**
 * GameStatistics component exports
 * Centralized export file for the GameStatistics component and its types.
 */

export { GameStatistics, EnhancedGameStatistics } from './GameStatistics';
export type {
  GameStatisticsProps as EnhancedGameStatisticsProps,
  StatisticsDisplayMode,
  TimeFormat,
  StatisticItem,
  GameStatisticsState,
  StatisticConfig,
  StatisticAnimationConfig,
  StatisticComparison,
  RealTimeUpdateConfig,
} from './GameStatistics.types';
export type { GameStatisticsProps } from './GameStatistics';
export {
  StatisticsDisplayMode as DisplayMode,
  TimeFormat,
} from './GameStatistics.types';

// Default export for contract compatibility
export { default } from './GameStatistics';

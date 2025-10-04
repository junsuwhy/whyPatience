/**
 * GameStatistics component for the Desktop Solitaire game.
 * Displays current game statistics and overall performance metrics
 * with real-time updates, accessibility features, and responsive design.
 *
 * Following Constitution Principle I (Code Quality Excellence) with clean,
 * maintainable code and proper TypeScript typing.
 * Following Principle II (Test-Driven Development) with comprehensive testing.
 * Following Principle III (User Experience Consistency) with WCAG 2.1 AA compliance.
 * Following Principle IV (Performance Standards) with 60fps animations and React.memo optimization.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GameStatisticsProps as EnhancedGameStatisticsProps,
  StatisticsDisplayMode,
  TimeFormat,
  StatisticItem,
  StatisticConfig,
  GameStatisticsState,
} from './GameStatistics.types';
import { useStorage } from '../../context/StorageContext';
import {
  StatisticsContainer,
  StatisticsHeader,
  StatisticsTitle,
  ModeToggle,
  ModeButton,
  StatisticsGrid,
  StatisticItem as StyledStatisticItem,
  StatisticIcon,
  StatisticLabel,
  StatisticValue,
  ComparisonIndicator,
  StatisticTooltip,
  UpdateIndicator,
  LoadingState,
} from './GameStatistics.styled';

// Import contract interface types
import type {
  GameStatistics as GameStatsType,
  OverallStatistics,
} from '../../types/game-state';

/**
 * Contract-compliant props interface for GameStatistics
 */
export interface GameStatisticsProps {
  statistics: GameStatsType;
  overallStats: OverallStatistics;
  isGameActive: boolean;
  elapsedTime: number;
}

/**
 * Utility function to format time display
 */
const formatTime = (milliseconds: number, format: TimeFormat): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  switch (format) {
    case TimeFormat.HOURS_MINUTES_SECONDS:
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    case TimeFormat.MINUTES_SECONDS:
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    case TimeFormat.READABLE:
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    default:
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Utility function to format score display
 */
const formatScore = (score: number): string => {
  if (score >= 1000000) {
    return `${(score / 1000000).toFixed(1)}M`;
  } else if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}K`;
  }
  return score.toString();
};

/**
 * Utility function to format percentage
 */
const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

/**
 * Statistics configuration for display
 */
const STATISTIC_CONFIGS: StatisticConfig[] = [
  {
    key: 'moveCount',
    label: 'Moves',
    icon: '🎯',
    formatter: (value: number) => value.toString(),
    tooltip: 'Total number of moves made in current game',
    showInCompact: true,
    priority: 10,
    ariaLabel: 'Number of moves made',
  },
  {
    key: 'elapsedTime',
    label: 'Time',
    icon: '⏱️',
    formatter: (value: number) => formatTime(value, TimeFormat.MINUTES_SECONDS),
    tooltip: 'Time elapsed since game start',
    showInCompact: true,
    priority: 9,
    ariaLabel: 'Time elapsed',
  },
  {
    key: 'score',
    label: 'Score',
    icon: '⭐',
    formatter: formatScore,
    tooltip: 'Current game score based on moves and time',
    showInCompact: true,
    priority: 8,
    ariaLabel: 'Current game score',
  },
  {
    key: 'cardsInFoundation',
    label: 'Foundation',
    icon: '🏗️',
    formatter: (value: number) => `${value}/52`,
    tooltip: 'Cards successfully placed in foundation piles',
    showInCompact: false,
    priority: 7,
    ariaLabel: 'Cards in foundation piles',
  },
  {
    key: 'undoCount',
    label: 'Undos',
    icon: '↶',
    formatter: (value: number) => value.toString(),
    tooltip: 'Number of undo operations performed',
    showInCompact: false,
    priority: 6,
    ariaLabel: 'Number of undos used',
  },
  {
    key: 'gamesWon',
    label: 'Won',
    icon: '🏆',
    formatter: (value: number) => value.toString(),
    tooltip: 'Total number of games won',
    showInCompact: false,
    priority: 5,
    ariaLabel: 'Games won',
  },
  {
    key: 'winRate',
    label: 'Win Rate',
    icon: '📈',
    formatter: formatPercentage,
    tooltip: 'Percentage of games won',
    showInCompact: false,
    priority: 4,
    ariaLabel: 'Win rate percentage',
  },
  {
    key: 'bestTime',
    label: 'Best Time',
    icon: '⚡',
    formatter: (value: number) => formatTime(value, TimeFormat.MINUTES_SECONDS),
    tooltip: 'Best completion time achieved',
    showInCompact: false,
    priority: 3,
    ariaLabel: 'Best completion time',
  },
];

/**
 * Enhanced GameStatistics component with full features
 */
export const EnhancedGameStatistics: React.FC<EnhancedGameStatisticsProps> =
  React.memo(
    ({
      currentStats,
      overallStats,
      displayMode = StatisticsDisplayMode.CURRENT_GAME,
      timeFormat = TimeFormat.MINUTES_SECONDS,
      showRealTimeUpdates = true,
      animateChanges = true,
      className,
      isCompact = false,
      showComparison = false,
      showPercentages = true,
      ariaLabel = 'Game statistics',
      onStatisticClick,
      onDisplayModeChange,
    }) => {
      // Component state for managing statistics display
      const [state, setState] = useState<GameStatisticsState>({
        displayedStats: [],
        previousValues: {},
        animatingStats: new Set(),
        lastUpdate: Date.now(),
      });

      const [hoveredStat, setHoveredStat] = useState<string | null>(null);
      const [currentDisplayMode, setCurrentDisplayMode] = useState(displayMode);

      /**
       * Generate statistic items based on current display mode
       */
      const generateStatisticItems = useCallback((): StatisticItem[] => {
        const configs = STATISTIC_CONFIGS.filter(
          config => !isCompact || config.showInCompact
        ).sort((a, b) => b.priority - a.priority);

        const items: StatisticItem[] = [];

        for (const config of configs) {
          let value: number;
          let displayValue: string;

          // Determine which statistics object to use
          if (
            currentDisplayMode === StatisticsDisplayMode.OVERALL &&
            overallStats
          ) {
            value = (overallStats as Record<string, number>)[config.key] ?? 0;
          } else {
            value = (currentStats as Record<string, number>)[config.key] ?? 0;
          }

          // Format the display value
          if (config.key === 'elapsedTime') {
            displayValue = formatTime(value, timeFormat);
          } else {
            displayValue = config.formatter(value);
          }

          // Check for animation trigger
          const previousValue = state.previousValues[config.key];

          // Determine trend for comparison
          let trend: 'up' | 'down' | 'neutral' | undefined;
          if (showComparison && previousValue !== undefined) {
            if (value > previousValue) {
              trend = 'up';
            } else if (value < previousValue) {
              trend = 'down';
            } else {
              trend = 'neutral';
            }
          }

          // Check if this is a highlighted statistic (personal best, etc.)
          const isHighlighted =
            showComparison &&
            overallStats &&
            config.key === 'score' &&
            value > 0 &&
            value >= (overallStats as Record<string, number>).bestTime;

          items.push({
            id: config.key,
            label: config.label,
            value,
            displayValue,
            icon: config.icon,
            tooltip: config.tooltip,
            isHighlighted,
            trend,
            ariaLabel: `${config.ariaLabel}: ${displayValue}`,
          });
        }

        return items;
      }, [
        currentStats,
        overallStats,
        currentDisplayMode,
        timeFormat,
        isCompact,
        showComparison,
        state.previousValues,
      ]);

      /**
       * Memoized statistic items
       */
      const statisticItems = useMemo(
        () => generateStatisticItems(),
        [generateStatisticItems]
      );

      /**
       * Update component state when statistics change
       */
      useEffect(() => {
        const newPreviousValues: Record<string, string | number> = {};
        const newAnimatingStats = new Set<string>();

        statisticItems.forEach(item => {
          const previousValue = state.previousValues[item.id];
          if (
            previousValue !== undefined &&
            previousValue !== item.value &&
            animateChanges
          ) {
            newAnimatingStats.add(item.id);
          }
          newPreviousValues[item.id] = item.value;
        });

        setState(prevState => ({
          ...prevState,
          displayedStats: statisticItems,
          previousValues: newPreviousValues,
          animatingStats: newAnimatingStats,
          lastUpdate: Date.now(),
        }));

        // Clear animations after duration
        if (newAnimatingStats.size > 0) {
          const timer = window.setTimeout(() => {
            setState(prevState => ({
              ...prevState,
              animatingStats: new Set(),
            }));
          }, 600);
          return () => window.clearTimeout(timer);
        }
      }, [statisticItems, animateChanges, state.previousValues]);

      /**
       * Real-time update effect for elapsed time
       */
      useEffect(() => {
        if (!showRealTimeUpdates) return;

        const interval = window.setInterval(() => {
          setState(prevState => ({
            ...prevState,
            lastUpdate: Date.now(),
          }));
        }, 1000);

        return () => window.clearInterval(interval);
      }, [showRealTimeUpdates]);

      /**
       * Handle display mode change
       */
      const handleDisplayModeChange = useCallback(
        (mode: StatisticsDisplayMode) => {
          setCurrentDisplayMode(mode);
          onDisplayModeChange?.(mode);
        },
        [onDisplayModeChange]
      );

      /**
       * Handle statistic item click
       */
      const handleStatisticClick = useCallback(
        (statisticId: string) => {
          onStatisticClick?.(statisticId);
        },
        [onStatisticClick]
      );

      /**
       * Handle mouse interactions for tooltips
       */
      const handleMouseEnter = useCallback((statisticId: string) => {
        setHoveredStat(statisticId);
      }, []);

      const handleMouseLeave = useCallback(() => {
        setHoveredStat(null);
      }, []);

      /**
       * Render individual statistic item
       */
      const renderStatisticItem = useCallback(
        (item: StatisticItem) => (
          <StyledStatisticItem
            key={item.id}
            isHighlighted={item.isHighlighted}
            isAnimating={state.animatingStats.has(item.id)}
            trend={item.trend}
            isClickable={!!onStatisticClick}
            onClick={() => handleStatisticClick(item.id)}
            onMouseEnter={() => handleMouseEnter(item.id)}
            onMouseLeave={handleMouseLeave}
            role={onStatisticClick ? 'button' : 'group'}
            tabIndex={onStatisticClick ? 0 : -1}
            aria-label={item.ariaLabel}
            aria-describedby={`tooltip-${item.id}`}
          >
            <StatisticIcon>{item.icon}</StatisticIcon>
            <StatisticLabel isCompact={isCompact}>{item.label}</StatisticLabel>
            <StatisticValue
              isAnimating={state.animatingStats.has(item.id)}
              isHighlighted={item.isHighlighted}
              isCompact={isCompact}
            >
              {item.displayValue}
            </StatisticValue>

            {showComparison && item.trend && item.trend !== 'neutral' && (
              <ComparisonIndicator
                trend={item.trend === 'up' ? 'improvement' : 'decline'}
              >
                <span className="trend-icon">
                  {item.trend === 'up' ? '📈' : '📉'}
                </span>
                {showPercentages && 'trend'}
              </ComparisonIndicator>
            )}

            <StatisticTooltip
              id={`tooltip-${item.id}`}
              isVisible={hoveredStat === item.id}
              role="tooltip"
            >
              {item.tooltip}
            </StatisticTooltip>

            {showRealTimeUpdates && item.id === 'elapsedTime' && (
              <UpdateIndicator isUpdating={true} />
            )}
          </StyledStatisticItem>
        ),
        [
          state.animatingStats,
          isCompact,
          showComparison,
          showPercentages,
          showRealTimeUpdates,
          hoveredStat,
          onStatisticClick,
          handleStatisticClick,
          handleMouseEnter,
          handleMouseLeave,
        ]
      );

      /**
       * Render display mode toggle
       */
      const renderModeToggle = () => {
        if (!overallStats || isCompact) return null;

        return (
          <ModeToggle role="tablist" aria-label="Statistics display mode">
            <ModeButton
              isActive={
                currentDisplayMode === StatisticsDisplayMode.CURRENT_GAME
              }
              onClick={() =>
                handleDisplayModeChange(StatisticsDisplayMode.CURRENT_GAME)
              }
              role="tab"
              aria-selected={
                currentDisplayMode === StatisticsDisplayMode.CURRENT_GAME
              }
              aria-controls="statistics-content"
            >
              Current
            </ModeButton>
            <ModeButton
              isActive={currentDisplayMode === StatisticsDisplayMode.OVERALL}
              onClick={() =>
                handleDisplayModeChange(StatisticsDisplayMode.OVERALL)
              }
              role="tab"
              aria-selected={
                currentDisplayMode === StatisticsDisplayMode.OVERALL
              }
              aria-controls="statistics-content"
            >
              Overall
            </ModeButton>
          </ModeToggle>
        );
      };

      // Show loading state if no statistics available
      if (!currentStats) {
        return (
          <StatisticsContainer
            className={className}
            isCompact={isCompact}
            displayMode={currentDisplayMode}
            role="region"
            aria-label={ariaLabel}
          >
            <LoadingState>
              <div className="loading-spinner" aria-hidden="true" />
              Loading statistics...
            </LoadingState>
          </StatisticsContainer>
        );
      }

      return (
        <StatisticsContainer
          className={className}
          isCompact={isCompact}
          displayMode={currentDisplayMode}
          role="region"
          aria-label={ariaLabel}
          aria-live="polite"
          aria-atomic="false"
        >
          <StatisticsHeader isCompact={isCompact}>
            <StatisticsTitle isCompact={isCompact}>
              <span className="title-icon">📊</span>
              Statistics
            </StatisticsTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {renderModeToggle()}
              {onStatisticClick && (
                <button
                  onClick={() => onStatisticClick('refresh')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'inherit',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                  title="重新整理統計資料"
                  aria-label="重新整理統計資料"
                >
                  🔄
                </button>
              )}
            </div>
          </StatisticsHeader>

          <StatisticsGrid
            id="statistics-content"
            isCompact={isCompact}
            role="tabpanel"
            aria-labelledby="statistics-title"
          >
            {state.displayedStats.map(renderStatisticItem)}
          </StatisticsGrid>
        </StatisticsContainer>
      );
    }
  );

// Set display name for better debugging
EnhancedGameStatistics.displayName = 'EnhancedGameStatistics';

/**
 * Contract-compliant GameStatistics component
 * Now properly implemented using EnhancedGameStatistics
 */
export const GameStatistics: React.FC<GameStatisticsProps> = ({
  statistics,
  overallStats,
  isGameActive,
  elapsedTime,
}) => {
  // Use storage context for statistics
  const {
    statistics: storageStats,
    refreshStatistics,
    lastError,
  } = useStorage();

  // Use storage statistics if available, fallback to props
  const effectiveOverallStats = storageStats || overallStats;

  const enhancedProps = {
    currentStats: { ...statistics, elapsedTime },
    overallStats: effectiveOverallStats,
    showRealTimeUpdates: isGameActive,
    isCompact: false,
    onStatisticClick: (statisticId: string) => {
      if (statisticId === 'refresh') {
        refreshStatistics();
      }
    },
  };

  // Show error state if storage failed and no fallback data
  if (lastError && !effectiveOverallStats) {
    return (
      <StatisticsContainer
        isCompact={false}
        displayMode={StatisticsDisplayMode.OVERALL}
      >
        <LoadingState>
          <div style={{ color: '#f44336' }}>統計資料載入失敗 (暫無資料)</div>
          <button
            onClick={refreshStatistics}
            style={{ marginTop: '8px', padding: '4px 8px', fontSize: '12px' }}
          >
            重新整理
          </button>
        </LoadingState>
      </StatisticsContainer>
    );
  }

  return <EnhancedGameStatistics {...enhancedProps} />;
};

// Set display name for better debugging
GameStatistics.displayName = 'GameStatistics';

// Default export for contract compatibility
export default GameStatistics;

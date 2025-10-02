/**
 * GameControls component for the Desktop Solitaire game.
 * Provides game control functionality including new game, restart, undo/redo,
 * pause/resume, settings, and statistics access.
 *
 * Following Constitution Principle I (Code Quality Excellence) with clean,
 * maintainable code and proper TypeScript typing.
 * Following Principle II (Test-Driven Development) with comprehensive testing.
 * Following Principle III (User Experience Consistency) with WCAG 2.1 AA compliance.
 * Following Principle IV (Performance Standards) with 60fps animations and React.memo optimization.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GamePhase } from '../../types/game-state';
import {
  GameControlsProps,
  ControlButton,
  KeyboardShortcut,
} from './GameControls.types';
import {
  ControlsContainer,
  ButtonGroup,
  ControlButton as StyledButton,
  ButtonIcon,
  ButtonText,
  StatusIndicator,
  Tooltip,
  ShortcutsPanel,
  ShortcutItem,
} from './GameControls.styles';

/**
 * GameControls component implementation with performance optimization and accessibility.
 */
export const GameControls: React.FC<GameControlsProps> = React.memo(
  ({
    gameState,
    canUndo,
    canRedo,
    isPaused,
    isLoading = false,
    className,
    showKeyboardShortcuts = true,
    ariaLabel = 'Game controls',
    onNewGame,
    onRestart,
    onUndo,
    onRedo,
    onPause,
    onResume,
    onSettings,
    onStatistics,
  }) => {
    // State for UI interactions
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [pressedButtons, setPressedButtons] = useState<Set<string>>(
      new Set()
    );

    /**
     * Keyboard shortcuts configuration
     */
    const keyboardShortcuts: KeyboardShortcut[] = useMemo(
      () => [
        {
          key: 'Ctrl+N',
          action: 'newGame',
          description: 'New Game',
          ctrl: true,
        },
        {
          key: 'Ctrl+R',
          action: 'restart',
          description: 'Restart Game',
          ctrl: true,
        },
        { key: 'Ctrl+Z', action: 'undo', description: 'Undo Move', ctrl: true },
        { key: 'Ctrl+Y', action: 'redo', description: 'Redo Move', ctrl: true },
        { key: 'Space', action: 'pause', description: 'Pause/Resume' },
        {
          key: 'Ctrl+,',
          action: 'settings',
          description: 'Settings',
          ctrl: true,
        },
        {
          key: 'Ctrl+I',
          action: 'statistics',
          description: 'Statistics',
          ctrl: true,
        },
        { key: 'F1', action: 'help', description: 'Show Shortcuts' },
      ],
      []
    );

    /**
     * Button configurations with proper ARIA labels and icons
     */
    const buttonConfigs: ControlButton[] = useMemo(
      () => [
        {
          id: 'newGame',
          label: 'New Game',
          icon: '🎮',
          shortcut: 'Ctrl+N',
          tooltip: 'Start a new game (Ctrl+N)',
          ariaLabel: 'Start new game',
          disabled: isLoading,
          onClick: onNewGame,
          variant: 'primary',
        },
        {
          id: 'restart',
          label: 'Restart',
          icon: '🔄',
          shortcut: 'Ctrl+R',
          tooltip: 'Restart current game (Ctrl+R)',
          ariaLabel: 'Restart current game',
          disabled: isLoading || gameState.phase === GamePhase.NEW_GAME,
          onClick: onRestart,
          variant: 'secondary',
        },
        {
          id: 'undo',
          label: 'Undo',
          icon: '↶',
          shortcut: 'Ctrl+Z',
          tooltip: 'Undo last move (Ctrl+Z)',
          ariaLabel: 'Undo last move',
          disabled: !canUndo || isLoading,
          onClick: onUndo,
          variant: 'secondary',
        },
        {
          id: 'redo',
          label: 'Redo',
          icon: '↷',
          shortcut: 'Ctrl+Y',
          tooltip: 'Redo move (Ctrl+Y)',
          ariaLabel: 'Redo previously undone move',
          disabled: !canRedo || isLoading,
          onClick: onRedo,
          variant: 'secondary',
        },
        {
          id: 'pause',
          label: isPaused ? 'Resume' : 'Pause',
          icon: isPaused ? '▶️' : '⏸️',
          shortcut: 'Space',
          tooltip: `${isPaused ? 'Resume' : 'Pause'} game (Space)`,
          ariaLabel: `${isPaused ? 'Resume' : 'Pause'} game`,
          disabled:
            isLoading ||
            gameState.phase === GamePhase.NEW_GAME ||
            gameState.phase === GamePhase.WON,
          onClick: isPaused ? onResume : onPause,
          variant: isPaused ? 'success' : 'secondary',
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: '⚙️',
          shortcut: 'Ctrl+,',
          tooltip: 'Open settings (Ctrl+,)',
          ariaLabel: 'Open game settings',
          disabled: isLoading,
          onClick: onSettings,
          variant: 'secondary',
        },
        {
          id: 'statistics',
          label: 'Stats',
          icon: '📊',
          shortcut: 'Ctrl+I',
          tooltip: 'View statistics (Ctrl+I)',
          ariaLabel: 'View game statistics',
          disabled: isLoading,
          onClick: onStatistics,
          variant: 'secondary',
        },
      ],
      [
        gameState.phase,
        canUndo,
        canRedo,
        isPaused,
        isLoading,
        onNewGame,
        onRestart,
        onUndo,
        onRedo,
        onPause,
        onResume,
        onSettings,
        onStatistics,
      ]
    );

    /**
     * Handle keyboard shortcuts with proper event handling
     */
    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        // Don't handle shortcuts when typing in inputs
        const target = event.target as HTMLElement;
        if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
          return;
        }

        const shortcut = keyboardShortcuts.find(({ key, ctrl, shift, alt }) => {
          const keyMatch =
            key.split('+').pop()?.toLowerCase() === event.key.toLowerCase();
          const ctrlMatch = !!ctrl === (event.ctrlKey || event.metaKey);
          const shiftMatch = !!shift === event.shiftKey;
          const altMatch = !!alt === event.altKey;

          return keyMatch && ctrlMatch && shiftMatch && altMatch;
        });

        if (shortcut) {
          event.preventDefault();

          const button = buttonConfigs.find(btn => btn.id === shortcut.action);
          if (button && !button.disabled) {
            // Visual feedback for keyboard press
            setPressedButtons(prev => new Set(prev).add(button.id));
            window.setTimeout(() => {
              setPressedButtons(prev => {
                const newSet = new Set(prev);
                newSet.delete(button.id);
                return newSet;
              });
            }, 150);

            button.onClick();
          } else if (shortcut.action === 'help') {
            setShowShortcuts(prev => !prev);
          }
        }
      },
      [buttonConfigs, keyboardShortcuts]
    );

    /**
     * Setup keyboard event listeners
     */
    useEffect(() => {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    /**
     * Get game status for the status indicator
     */
    const getGameStatus = useCallback(() => {
      switch (gameState.phase) {
        case GamePhase.NEW_GAME:
          return 'new';
        case GamePhase.PLAYING:
          return isPaused ? 'paused' : 'playing';
        case GamePhase.WON:
          return 'won';
        case GamePhase.LOST:
          return 'lost';
        case GamePhase.PAUSED:
          return 'paused';
        default:
          return 'new';
      }
    }, [gameState.phase, isPaused]);

    /**
     * Handle button mouse interactions for better UX
     */
    const handleButtonMouseEnter = useCallback((buttonId: string) => {
      setHoveredButton(buttonId);
    }, []);

    const handleButtonMouseLeave = useCallback(() => {
      setHoveredButton(null);
    }, []);

    const handleButtonMouseDown = useCallback((buttonId: string) => {
      setPressedButtons(prev => new Set(prev).add(buttonId));
    }, []);

    const handleButtonMouseUp = useCallback((buttonId: string) => {
      setPressedButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(buttonId);
        return newSet;
      });
    }, []);

    /**
     * Render individual control button
     */
    const renderButton = useCallback(
      (button: ControlButton) => (
        <div key={button.id} style={{ position: 'relative' }}>
          <StyledButton
            variant={button.variant}
            disabled={button.disabled}
            isPressed={pressedButtons.has(button.id)}
            isLoading={
              isLoading && (button.id === 'newGame' || button.id === 'restart')
            }
            onClick={button.onClick}
            onMouseEnter={() => handleButtonMouseEnter(button.id)}
            onMouseLeave={handleButtonMouseLeave}
            onMouseDown={() => handleButtonMouseDown(button.id)}
            onMouseUp={() => handleButtonMouseUp(button.id)}
            aria-label={button.ariaLabel}
            aria-describedby={
              showKeyboardShortcuts ? `shortcut-${button.id}` : undefined
            }
            aria-pressed={button.id === 'pause' ? isPaused : undefined}
            tabIndex={0}
          >
            <ButtonIcon>{button.icon}</ButtonIcon>
            <ButtonText>{button.label}</ButtonText>
          </StyledButton>

          {showKeyboardShortcuts && (
            <Tooltip
              id={`shortcut-${button.id}`}
              isVisible={hoveredButton === button.id && !button.disabled}
            >
              {button.tooltip}
            </Tooltip>
          )}
        </div>
      ),
      [
        pressedButtons,
        isLoading,
        hoveredButton,
        showKeyboardShortcuts,
        isPaused,
        handleButtonMouseEnter,
        handleButtonMouseLeave,
        handleButtonMouseDown,
        handleButtonMouseUp,
      ]
    );

    return (
      <ControlsContainer
        className={className}
        role="toolbar"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
      >
        {/* Game status indicator */}
        <StatusIndicator status={getGameStatus()}>
          {getGameStatus().toUpperCase()}
        </StatusIndicator>

        {/* Primary game controls */}
        <ButtonGroup role="group" aria-label="Primary game controls">
          {buttonConfigs.slice(0, 2).map(renderButton)}
        </ButtonGroup>

        {/* Undo/Redo controls */}
        <ButtonGroup role="group" aria-label="Move history controls">
          {buttonConfigs.slice(2, 4).map(renderButton)}
        </ButtonGroup>

        {/* Game state controls */}
        <ButtonGroup role="group" aria-label="Game state controls">
          {buttonConfigs.slice(4, 5).map(renderButton)}
        </ButtonGroup>

        {/* Settings and statistics */}
        <ButtonGroup role="group" aria-label="Settings and information">
          {buttonConfigs.slice(5, 7).map(renderButton)}

          {/* Help button for keyboard shortcuts */}
          {showKeyboardShortcuts && (
            <div style={{ position: 'relative' }}>
              <StyledButton
                variant="secondary"
                onClick={() => setShowShortcuts(prev => !prev)}
                aria-label="Toggle keyboard shortcuts help"
                aria-expanded={showShortcuts}
                aria-controls="shortcuts-panel"
              >
                <ButtonIcon>❓</ButtonIcon>
                <ButtonText>Help</ButtonText>
              </StyledButton>
            </div>
          )}
        </ButtonGroup>

        {/* Keyboard shortcuts panel */}
        {showKeyboardShortcuts && (
          <ShortcutsPanel
            id="shortcuts-panel"
            isVisible={showShortcuts}
            role="dialog"
            aria-label="Keyboard shortcuts"
          >
            <h4>Keyboard Shortcuts</h4>
            {keyboardShortcuts.slice(0, -1).map((shortcut, index) => (
              <ShortcutItem key={index}>
                <span className="shortcut-action">{shortcut.description}</span>
                <kbd className="shortcut-key">{shortcut.key}</kbd>
              </ShortcutItem>
            ))}
          </ShortcutsPanel>
        )}
      </ControlsContainer>
    );
  }
);

// Set display name for better debugging
GameControls.displayName = 'GameControls';

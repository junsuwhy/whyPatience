/**
 * User preferences type definitions for the Desktop Solitaire game.
 * This file contains all user preference settings including themes, card styles,
 * gameplay options, display settings, and audio preferences for a personalized experience.
 */

/**
 * Theme enumeration for visual appearance settings.
 * Controls the overall color scheme and visual style of the application.
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Card style enumeration for card appearance options.
 * Defines different visual styles for playing cards.
 */
export type CardStyle = 'classic' | 'modern' | 'minimal';

/**
 * Draw mode enumeration for stock pile drawing behavior.
 * Controls how many cards are drawn from the stock pile at once.
 */
export type DrawMode = 'draw-one' | 'draw-three';

/**
 * Animation speed enumeration for controlling animation performance.
 * Allows users to customize animation speed based on preference and device performance.
 */
export type AnimationSpeed = 'none' | 'slow' | 'normal' | 'fast';

/**
 * Sound preferences interface for audio-related settings.
 * Controls all audio feedback and sound effects in the game.
 */
export interface SoundPreferences {
  /** Master enable/disable for all sound effects */
  enabled: boolean;
  /** Volume level for sound effects (0-100) */
  volume: number;
  /** Enable/disable card movement sounds */
  cardMovement: boolean;
  /** Enable/disable success/completion sounds */
  success: boolean;
  /** Enable/disable error/invalid move sounds */
  error: boolean;
  /** Enable/disable ambient background sounds */
  ambient: boolean;
}

/**
 * Gameplay preferences interface for game behavior settings.
 * Controls game mechanics and assistance features.
 */
export interface GameplayPreferences {
  /** Stock pile drawing mode (1 or 3 cards) */
  drawMode: DrawMode;
  /** Automatically move cards to foundation when possible */
  autoComplete: boolean;
  /** Show visual hints for possible moves */
  showHints: boolean;
  /** Highlight valid drop zones during drag operations */
  highlightDropZones: boolean;
  /** Allow unlimited undo operations */
  allowUndo: boolean;
  /** Confirm before starting a new game */
  confirmNewGame: boolean;
  /** Auto-save game state periodically */
  autoSave: boolean;
  /** Auto-save interval in minutes */
  autoSaveInterval: number;
}

/**
 * Display preferences interface for visual appearance settings.
 * Controls layout, animations, and visual feedback.
 */
export interface DisplayPreferences {
  /** Overall theme (light, dark, or auto) */
  theme: Theme;
  /** Card visual style */
  cardStyle: CardStyle;
  /** Animation speed setting */
  animationSpeed: AnimationSpeed;
  /** Show game timer */
  showTimer: boolean;
  /** Show move counter */
  showMoveCounter: boolean;
  /** Show score display */
  showScore: boolean;
  /** Show game statistics */
  showStatistics: boolean;
  /** Use large cards for better visibility */
  largeCards: boolean;
  /** Full screen mode preference */
  fullscreen: boolean;
  /** High contrast mode for accessibility */
  highContrast: boolean;
}

/**
 * User preferences interface combining all preference categories.
 * This is the main interface representing all user customization options.
 */
export interface UserPreferences {
  /** Display and visual preferences */
  display: DisplayPreferences;
  /** Gameplay behavior preferences */
  gameplay: GameplayPreferences;
  /** Audio and sound preferences */
  sound: SoundPreferences;
  /** Language preference (ISO language code) */
  language: string;
  /** Accessibility preferences enabled */
  accessibility: boolean;
  /** Last modified timestamp for sync purposes */
  lastModified: number;
  /** Preferences schema version for migrations */
  version: string;
}

/**
 * Preferences state interface for managing preference changes and persistence.
 * Tracks the current state and any pending changes to user preferences.
 */
export interface PreferencesState {
  /** Current active preferences */
  current: UserPreferences;
  /** Preferences before current editing session (for reset) */
  original: UserPreferences;
  /** Whether preferences have unsaved changes */
  hasChanges: boolean;
  /** Whether preferences are currently being loaded */
  isLoading: boolean;
  /** Whether preferences are currently being saved */
  isSaving: boolean;
  /** Last error that occurred during save/load operations */
  error: string | null;
}

/**
 * Default display preferences with sensible defaults.
 */
export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  theme: 'auto',
  cardStyle: 'classic',
  animationSpeed: 'normal',
  showTimer: true,
  showMoveCounter: true,
  showScore: true,
  showStatistics: false,
  largeCards: false,
  fullscreen: false,
  highContrast: false,
};

/**
 * Default gameplay preferences with balanced settings.
 */
export const DEFAULT_GAMEPLAY_PREFERENCES: GameplayPreferences = {
  drawMode: 'draw-three',
  autoComplete: false,
  showHints: false,
  highlightDropZones: true,
  allowUndo: true,
  confirmNewGame: true,
  autoSave: true,
  autoSaveInterval: 5,
};

/**
 * Default sound preferences with moderate audio settings.
 */
export const DEFAULT_SOUND_PREFERENCES: SoundPreferences = {
  enabled: true,
  volume: 70,
  cardMovement: true,
  success: true,
  error: true,
  ambient: false,
};

/**
 * Default user preferences combining all category defaults.
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  display: DEFAULT_DISPLAY_PREFERENCES,
  gameplay: DEFAULT_GAMEPLAY_PREFERENCES,
  sound: DEFAULT_SOUND_PREFERENCES,
  language: 'en',
  accessibility: false,
  lastModified: Date.now(),
  version: '1.0.0',
};

/**
 * Type guard to validate if an object is a valid UserPreferences.
 * @param preferences - Object to validate
 * @returns True if the object is a valid UserPreferences
 */
export function isValidUserPreferences(
  preferences: unknown
): preferences is UserPreferences {
  if (!preferences || typeof preferences !== 'object') return false;

  const prefs = preferences as Partial<UserPreferences>;
  return !!(
    prefs.display &&
    prefs.gameplay &&
    prefs.sound &&
    typeof prefs.language === 'string' &&
    typeof prefs.accessibility === 'boolean' &&
    typeof prefs.lastModified === 'number' &&
    typeof prefs.version === 'string'
  );
}

/**
 * Creates a deep copy of user preferences for safe mutation.
 * @param preferences - Preferences to clone
 * @returns Deep copy of the preferences
 */
export function cloneUserPreferences(
  preferences: UserPreferences
): UserPreferences {
  return JSON.parse(JSON.stringify(preferences));
}

/**
 * Merges partial preference updates with existing preferences.
 * @param current - Current preferences
 * @param updates - Partial updates to apply
 * @returns New preferences object with updates applied
 */
export function mergePreferences(
  current: UserPreferences,
  updates: Partial<UserPreferences>
): UserPreferences {
  return {
    ...current,
    ...updates,
    display: { ...current.display, ...(updates.display || {}) },
    gameplay: { ...current.gameplay, ...(updates.gameplay || {}) },
    sound: { ...current.sound, ...(updates.sound || {}) },
    lastModified: Date.now(),
  };
}

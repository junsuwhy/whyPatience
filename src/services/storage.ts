/**
 * Storage Service Implementation
 * Handles local storage operations for game state, preferences, and statistics
 * Implements the StorageContract interface for type safety
 */

import {
  StorageContract,
  StorageInfo,
  StorageError,
  StorageConfig,
} from '../../specs/001-game-rules-md/contracts/storage-interface';
import {
  GameState,
  UserPreferences,
  OverallStatistics,
  GameStatistics,
  DrawMode,
} from '../types';

/**
 * Custom error class for storage operations
 */
export class StorageServiceError extends Error {
  public readonly type: StorageError['type'];
  public readonly key?: string;
  public readonly data?: unknown;

  constructor(
    type: StorageError['type'],
    message: string,
    key?: string,
    data?: unknown
  ) {
    super(message);
    this.name = 'StorageServiceError';
    this.type = type;
    this.key = key;
    this.data = data;
  }
}

/**
 * Storage service implementation using localStorage
 */
export class StorageService implements StorageContract {
  private config: StorageConfig;

  constructor(config?: Partial<StorageConfig>) {
    this.config = {
      namespace: 'whyPatience',
      version: '1.0.0',
      compression: false,
      encryption: false,
      maxHistorySize: 100,
      autoSave: true,
      saveInterval: 30000,
      ...config,
    };
  }

  /**
   * Creates a namespaced key for localStorage
   */
  private getKey(key: string): string {
    return `${this.config.namespace}:${key}`;
  }

  /**
   * Validates if localStorage is available
   */
  private isStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safely parse JSON from localStorage
   */
  private safeParseJSON<T>(data: string | null): T | null {
    if (!data) return null;

    try {
      return JSON.parse(data) as T;
    } catch (error) {
      throw new StorageServiceError(
        'DATA_CORRUPTION',
        'Failed to parse stored data',
        undefined,
        { data, error }
      );
    }
  }

  /**
   * Safely stringify data for localStorage
   */
  private safeStringify(data: unknown): string {
    try {
      return JSON.stringify(data);
    } catch (error) {
      throw new StorageServiceError(
        'DATA_CORRUPTION',
        'Failed to serialize data',
        undefined,
        { data, error }
      );
    }
  }

  /**
   * Check storage quota and handle quota exceeded errors
   */
  private handleStorageQuota(key: string, data: string): void {
    try {
      window.localStorage.setItem(key, data);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new StorageServiceError(
          'QUOTA_EXCEEDED',
          'Storage quota exceeded',
          key,
          { size: data.length }
        );
      }
      throw new StorageServiceError(
        'PERMISSION_DENIED',
        'Storage operation failed',
        key,
        error
      );
    }
  }

  /**
   * Validates game state structure
   */
  private validateGameState(state: unknown): state is GameState {
    if (!state || typeof state !== 'object') return false;

    const s = state as Partial<GameState>;
    return !!(
      Array.isArray(s.tableau) &&
      Array.isArray(s.foundations) &&
      Array.isArray(s.stock) &&
      Array.isArray(s.waste) &&
      s.drawMode !== undefined &&
      Array.isArray(s.moves) &&
      typeof s.score === 'number' &&
      typeof s.startTime === 'number' &&
      typeof s.isWon === 'boolean'
    );
  }

  /**
   * Validates user preferences structure
   */
  private validateUserPreferences(prefs: unknown): prefs is UserPreferences {
    if (!prefs || typeof prefs !== 'object') return false;

    const p = prefs as Partial<UserPreferences>;
    return !!(
      p.drawMode !== undefined &&
      typeof p.autoComplete === 'boolean' &&
      typeof p.animations === 'boolean' &&
      typeof p.soundEnabled === 'boolean' &&
      typeof p.theme === 'string' &&
      typeof p.language === 'string'
    );
  }

  /**
   * Creates default user preferences
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      drawMode: DrawMode.THREE,
      autoComplete: false,
      animations: true,
      soundEnabled: true,
      theme: 'light',
      language: 'en',
    };
  }

  /**
   * Creates default statistics
   */
  private getDefaultStatistics(): OverallStatistics {
    const defaultGameStats: GameStatistics = {
      gamesPlayed: 0,
      gamesWon: 0,
      winPercentage: 0,
      bestTime: 0,
      totalTime: 0,
      averageTime: 0,
      currentStreak: 0,
      bestStreak: 0,
    };

    return {
      lifetime: { ...defaultGameStats },
      monthly: { ...defaultGameStats },
      weekly: { ...defaultGameStats },
      daily: { ...defaultGameStats },
    };
  }

  // Game state persistence methods
  async saveGameState(gameState: GameState): Promise<boolean> {
    if (!this.isStorageAvailable()) {
      throw new StorageServiceError(
        'PERMISSION_DENIED',
        'localStorage is not available'
      );
    }

    if (!this.validateGameState(gameState)) {
      throw new StorageServiceError(
        'DATA_CORRUPTION',
        'Invalid game state provided',
        'gameState',
        gameState
      );
    }

    try {
      const key = this.getKey('gameState');
      const data = this.safeStringify({
        version: this.config.version,
        data: gameState,
        timestamp: Date.now(),
      });

      this.handleStorageQuota(key, data);
      return true;
    } catch (error) {
      if (error instanceof StorageServiceError) {
        throw error;
      }
      throw new StorageServiceError(
        'NETWORK_ERROR',
        'Failed to save game state',
        'gameState',
        error
      );
    }
  }

  async loadGameState(): Promise<GameState | null> {
    if (!this.isStorageAvailable()) {
      throw new StorageServiceError(
        'PERMISSION_DENIED',
        'localStorage is not available'
      );
    }

    try {
      const key = this.getKey('gameState');
      const rawData = window.localStorage.getItem(key);

      if (!rawData) {
        return null;
      }

      const storedData = this.safeParseJSON<{
        version: string;
        data: GameState;
        timestamp: number;
      }>(rawData);

      if (!storedData || !storedData.data) {
        return null;
      }

      if (!this.validateGameState(storedData.data)) {
        throw new StorageServiceError(
          'DATA_CORRUPTION',
          'Stored game state is invalid',
          'gameState',
          storedData.data
        );
      }

      return storedData.data;
    } catch (error) {
      if (error instanceof StorageServiceError) {
        throw error;
      }
      throw new StorageServiceError(
        'DATA_CORRUPTION',
        'Failed to load game state',
        'gameState',
        error
      );
    }
  }

  async clearGameState(): Promise<boolean> {
    if (!this.isStorageAvailable()) {
      throw new StorageServiceError(
        'PERMISSION_DENIED',
        'localStorage is not available'
      );
    }

    try {
      const key = this.getKey('gameState');
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      throw new StorageServiceError(
        'NETWORK_ERROR',
        'Failed to clear game state',
        'gameState',
        error
      );
    }
  }

  async hasStoredGame(): Promise<boolean> {
    if (!this.isStorageAvailable()) {
      return false;
    }

    try {
      const key = this.getKey('gameState');
      const rawData = window.localStorage.getItem(key);
      return rawData !== null;
    } catch {
      return false;
    }
  }

  // User preferences persistence methods
  async savePreferences(preferences: UserPreferences): Promise<boolean> {
    if (!this.isStorageAvailable()) {
      throw new StorageServiceError(
        'PERMISSION_DENIED',
        'localStorage is not available'
      );
    }

    if (!this.validateUserPreferences(preferences)) {
      throw new StorageServiceError(
        'DATA_CORRUPTION',
        'Invalid preferences provided',
        'preferences',
        preferences
      );
    }

    try {
      const key = this.getKey('preferences');
      const data = this.safeStringify({
        version: this.config.version,
        data: preferences,
        timestamp: Date.now(),
      });

      this.handleStorageQuota(key, data);
      return true;
    } catch (error) {
      if (error instanceof StorageServiceError) {
        throw error;
      }
      throw new StorageServiceError(
        'NETWORK_ERROR',
        'Failed to save preferences',
        'preferences',
        error
      );
    }
  }

  async loadPreferences(): Promise<UserPreferences> {
    if (!this.isStorageAvailable()) {
      throw new StorageServiceError(
        'PERMISSION_DENIED',
        'localStorage is not available'
      );
    }

    try {
      const key = this.getKey('preferences');
      const rawData = window.localStorage.getItem(key);

      if (!rawData) {
        return this.getDefaultPreferences();
      }

      const storedData = this.safeParseJSON<{
        version: string;
        data: UserPreferences;
        timestamp: number;
      }>(rawData);

      if (!storedData || !storedData.data) {
        return this.getDefaultPreferences();
      }

      if (!this.validateUserPreferences(storedData.data)) {
        throw new StorageServiceError(
          'DATA_CORRUPTION',
          'Stored preferences are invalid',
          'preferences',
          storedData.data
        );
      }

      return storedData.data;
    } catch (error) {
      if (error instanceof StorageServiceError) {
        throw error;
      }
      // Return defaults if loading fails
      return this.getDefaultPreferences();
    }
  }

  async resetPreferences(): Promise<UserPreferences> {
    const defaultPrefs = this.getDefaultPreferences();
    await this.savePreferences(defaultPrefs);
    return defaultPrefs;
  }

  // Statistics persistence methods
  async saveStatistics(stats: OverallStatistics): Promise<boolean> {
    if (!this.isStorageAvailable()) {
      throw new StorageServiceError(
        'PERMISSION_DENIED',
        'localStorage is not available'
      );
    }

    try {
      const key = this.getKey('statistics');
      const data = this.safeStringify({
        version: this.config.version,
        data: stats,
        timestamp: Date.now(),
      });

      this.handleStorageQuota(key, data);
      return true;
    } catch (error) {
      if (error instanceof StorageServiceError) {
        throw error;
      }
      throw new StorageServiceError(
        'NETWORK_ERROR',
        'Failed to save statistics',
        'statistics',
        error
      );
    }
  }

  async loadStatistics(): Promise<OverallStatistics> {
    if (!this.isStorageAvailable()) {
      throw new StorageServiceError(
        'PERMISSION_DENIED',
        'localStorage is not available'
      );
    }

    try {
      const key = this.getKey('statistics');
      const rawData = window.localStorage.getItem(key);

      if (!rawData) {
        return this.getDefaultStatistics();
      }

      const storedData = this.safeParseJSON<{
        version: string;
        data: OverallStatistics;
        timestamp: number;
      }>(rawData);

      if (!storedData || !storedData.data) {
        return this.getDefaultStatistics();
      }

      return storedData.data;
    } catch (error) {
      if (error instanceof StorageServiceError) {
        throw error;
      }
      // Return defaults if loading fails
      return this.getDefaultStatistics();
    }
  }

  async updateGameResult(
    won: boolean,
    moves: number,
    time: number
  ): Promise<void> {
    try {
      const stats = await this.loadStatistics();

      // Update all time periods
      const periods: (keyof OverallStatistics)[] = [
        'lifetime',
        'monthly',
        'weekly',
        'daily',
      ];

      periods.forEach(period => {
        const periodStats = stats[period];
        periodStats.gamesPlayed++;
        periodStats.totalTime += time;
        periodStats.averageTime =
          periodStats.totalTime / periodStats.gamesPlayed;

        if (won) {
          periodStats.gamesWon++;
          periodStats.currentStreak++;
          periodStats.bestStreak = Math.max(
            periodStats.bestStreak,
            periodStats.currentStreak
          );

          if (periodStats.bestTime === 0 || time < periodStats.bestTime) {
            periodStats.bestTime = time;
          }
        } else {
          periodStats.currentStreak = 0;
        }

        periodStats.winPercentage =
          (periodStats.gamesWon / periodStats.gamesPlayed) * 100;
      });

      await this.saveStatistics(stats);
    } catch (error) {
      if (error instanceof StorageServiceError) {
        throw error;
      }
      throw new StorageServiceError(
        'NETWORK_ERROR',
        'Failed to update game result',
        'statistics',
        error
      );
    }
  }

  // Storage management methods
  getStorageInfo(): StorageInfo {
    if (!this.isStorageAvailable()) {
      return {
        available: false,
        used: 0,
        total: 0,
        quota: 0,
        version: this.config.version,
      };
    }

    try {
      // Calculate used storage
      let used = 0;
      const keys = Object.keys(window.localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.config.namespace)) {
          used += key.length + (window.localStorage.getItem(key)?.length || 0);
        }
      });

      // Estimate quota (5MB is typical for localStorage)
      const quota = 5 * 1024 * 1024; // 5MB in bytes

      return {
        available: true,
        used,
        total: quota,
        quota,
        version: this.config.version,
      };
    } catch (error) {
      throw new StorageServiceError(
        'NETWORK_ERROR',
        'Failed to get storage info',
        undefined,
        error
      );
    }
  }

  async clearAllData(): Promise<boolean> {
    if (!this.isStorageAvailable()) {
      throw new StorageServiceError(
        'PERMISSION_DENIED',
        'localStorage is not available'
      );
    }

    try {
      const keys = Object.keys(window.localStorage);
      const namespacedKeys = keys.filter(key =>
        key.startsWith(this.config.namespace)
      );

      namespacedKeys.forEach(key => {
        window.localStorage.removeItem(key);
      });

      return true;
    } catch (error) {
      throw new StorageServiceError(
        'NETWORK_ERROR',
        'Failed to clear all data',
        undefined,
        error
      );
    }
  }

  async exportData(): Promise<string> {
    if (!this.isStorageAvailable()) {
      throw new StorageServiceError(
        'PERMISSION_DENIED',
        'localStorage is not available'
      );
    }

    try {
      const exportData = {
        version: this.config.version,
        timestamp: Date.now(),
        gameState: await this.loadGameState(),
        preferences: await this.loadPreferences(),
        statistics: await this.loadStatistics(),
      };

      return this.safeStringify(exportData);
    } catch (error) {
      if (error instanceof StorageServiceError) {
        throw error;
      }
      throw new StorageServiceError(
        'NETWORK_ERROR',
        'Failed to export data',
        undefined,
        error
      );
    }
  }

  async importData(data: string): Promise<boolean> {
    if (!this.isStorageAvailable()) {
      throw new StorageServiceError(
        'PERMISSION_DENIED',
        'localStorage is not available'
      );
    }

    try {
      const importData = this.safeParseJSON<{
        version: string;
        timestamp: number;
        gameState?: GameState;
        preferences?: UserPreferences;
        statistics?: OverallStatistics;
      }>(data);

      if (!importData) {
        throw new StorageServiceError(
          'DATA_CORRUPTION',
          'Invalid import data format'
        );
      }

      // Import each piece of data if present and valid
      if (
        importData.gameState &&
        this.validateGameState(importData.gameState)
      ) {
        await this.saveGameState(importData.gameState);
      }

      if (
        importData.preferences &&
        this.validateUserPreferences(importData.preferences)
      ) {
        await this.savePreferences(importData.preferences);
      }

      if (importData.statistics) {
        await this.saveStatistics(importData.statistics);
      }

      return true;
    } catch (error) {
      if (error instanceof StorageServiceError) {
        throw error;
      }
      throw new StorageServiceError(
        'DATA_CORRUPTION',
        'Failed to import data',
        undefined,
        error
      );
    }
  }
}

// Export a singleton instance
export const storageService = new StorageService();

// Export for testing and custom configurations
export default StorageService;

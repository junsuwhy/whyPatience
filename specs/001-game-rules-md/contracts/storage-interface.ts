/**
 * Storage Interface Contract
 * Defines the interface for local storage operations
 */

import {
  GameState,
  UserPreferences,
  OverallStatistics,
} from '../../../src/types';

export interface StorageContract {
  // Game state persistence
  saveGameState(gameState: GameState): Promise<boolean>;
  loadGameState(): Promise<GameState | null>;
  clearGameState(): Promise<boolean>;

  // User preferences persistence
  savePreferences(preferences: UserPreferences): Promise<boolean>;
  loadPreferences(): Promise<UserPreferences>;
  resetPreferences(): Promise<UserPreferences>;

  // Statistics persistence
  saveStatistics(stats: OverallStatistics): Promise<boolean>;
  loadStatistics(): Promise<OverallStatistics>;
  updateGameResult(won: boolean, moves: number, time: number): Promise<void>;

  // Storage management
  getStorageInfo(): StorageInfo;
  clearAllData(): Promise<boolean>;
  exportData(): Promise<string>;
  importData(data: string): Promise<boolean>;
}

export interface StorageInfo {
  available: boolean;
  used: number; // Bytes used
  total: number; // Total bytes available
  quota: number; // Storage quota
  version: string; // Schema version
}

// Storage events
export interface StorageEvents {
  onStorageError: (error: StorageError) => void;
  onStorageQuotaExceeded: (info: StorageInfo) => void;
  onDataCorruption: (corruptedKeys: string[]) => void;
  onSchemaUpgrade: (oldVersion: string, newVersion: string) => void;
}

export interface StorageError {
  type:
    | 'QUOTA_EXCEEDED'
    | 'PERMISSION_DENIED'
    | 'DATA_CORRUPTION'
    | 'NETWORK_ERROR';
  message: string;
  key?: string;
  data?: any;
}

// Storage configuration
export interface StorageConfig {
  namespace: string; // Key prefix for all stored data
  version: string; // Schema version
  compression: boolean; // Enable data compression
  encryption: boolean; // Enable data encryption (future feature)
  maxHistorySize: number; // Maximum move history to store
  autoSave: boolean; // Auto-save game state on moves
  saveInterval: number; // Auto-save interval in milliseconds
}

// Data migration interface
export interface DataMigration {
  fromVersion: string;
  toVersion: string;
  migrate: (oldData: any) => any;
  validate: (data: any) => boolean;
}

// Backup and sync interfaces (future features)
export interface BackupContract {
  createBackup(): Promise<BackupData>;
  restoreBackup(backup: BackupData): Promise<boolean>;
  listBackups(): Promise<BackupMetadata[]>;
  deleteBackup(id: string): Promise<boolean>;
}

export interface BackupData {
  id: string;
  timestamp: number;
  version: string;
  gameStates: GameState[];
  preferences: UserPreferences;
  statistics: OverallStatistics;
  checksum: string;
}

export interface BackupMetadata {
  id: string;
  timestamp: number;
  size: number;
  gameCount: number;
  version: string;
}

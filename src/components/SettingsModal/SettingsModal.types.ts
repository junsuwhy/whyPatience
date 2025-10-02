/**
 * Type definitions for the SettingsModal component.
 * Following Constitution Principle I (Code Quality Excellence) with proper TypeScript typing.
 */

import { UserPreferences } from '../../types/preferences';

/**
 * Props for the SettingsModal component.
 */
export interface SettingsModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Current user preferences */
  preferences: UserPreferences;
  /** Whether the modal is in loading state */
  isLoading?: boolean;
  /** Whether there are unsaved changes */
  hasUnsavedChanges?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Aria label for the modal */
  ariaLabel?: string;
  /** Callback when modal should be closed */
  onClose: () => void;
  /** Callback when preferences are updated */
  onPreferencesChange: (preferences: UserPreferences) => void;
  /** Callback when preferences are saved */
  onSave: (preferences: UserPreferences) => Promise<void>;
  /** Callback when preferences are reset to defaults */
  onReset: () => void;
  /** Callback when changes are discarded */
  onDiscard: () => void;
}

/**
 * Settings section configuration.
 */
export interface SettingsSection {
  /** Unique identifier for the section */
  id: string;
  /** Display title of the section */
  title: string;
  /** Optional description of the section */
  description?: string;
  /** Icon for the section */
  icon: string;
  /** Whether the section is collapsible */
  collapsible?: boolean;
  /** Whether the section is expanded by default */
  defaultExpanded?: boolean;
}

/**
 * Form field configuration for settings.
 */
export interface SettingsField {
  /** Unique identifier for the field */
  id: string;
  /** Field type */
  type: 'select' | 'checkbox' | 'radio' | 'slider' | 'number';
  /** Display label for the field */
  label: string;
  /** Detailed description of the field */
  description?: string;
  /** Current value of the field */
  value: unknown;
  /** Available options for select/radio fields */
  options?: SettingsOption[];
  /** Minimum value for number/slider fields */
  min?: number;
  /** Maximum value for number/slider fields */
  max?: number;
  /** Step value for number/slider fields */
  step?: number;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Validation function */
  validate?: (value: unknown) => string | null;
  /** Callback when field value changes */
  onChange: (value: unknown) => void;
}

/**
 * Option for select and radio fields.
 */
export interface SettingsOption {
  /** Option value */
  value: string | number | boolean;
  /** Display label for the option */
  label: string;
  /** Optional description of the option */
  description?: string;
  /** Whether the option is disabled */
  disabled?: boolean;
}

/**
 * Modal state for managing UI interactions.
 */
export interface ModalState {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Currently active settings section */
  activeSection: string;
  /** Expanded sections (for collapsible sections) */
  expandedSections: Set<string>;
  /** Whether the modal is in saving state */
  isSaving: boolean;
  /** Current form validation errors */
  validationErrors: Record<string, string>;
  /** Whether to show unsaved changes warning */
  showUnsavedWarning: boolean;
}

/**
 * Keyboard navigation actions for the modal.
 */
export type ModalKeyboardAction =
  | 'close'
  | 'save'
  | 'reset'
  | 'next-section'
  | 'prev-section'
  | 'next-field'
  | 'prev-field';

/**
 * Modal keyboard shortcut configuration.
 */
export interface ModalKeyboardShortcut {
  /** Keyboard combination */
  key: string;
  /** Action to perform */
  action: ModalKeyboardAction;
  /** Description for accessibility */
  description: string;
  /** Whether Ctrl key is required */
  ctrl?: boolean;
  /** Whether Shift key is required */
  shift?: boolean;
  /** Whether Alt key is required */
  alt?: boolean;
}

/**
 * SettingsModal component for the Desktop Solitaire game.
 * Provides a comprehensive settings interface with game mode, theme, audio,
 * and accessibility preferences following WCAG 2.1 AA standards.
 *
 * Following Constitution Principle I (Code Quality Excellence) with clean,
 * maintainable code and proper TypeScript typing.
 * Following Principle II (Test-Driven Development) with comprehensive testing.
 * Following Principle III (User Experience Consistency) with WCAG 2.1 AA compliance.
 * Following Principle IV (Performance Standards) with 60fps animations and React.memo optimization.
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  UserPreferences,
  DEFAULT_USER_PREFERENCES,
  DrawMode,
  Theme,
  CardStyle,
  AnimationSpeed,
} from '../../types/preferences';
import { useStorage } from '../../context/StorageContext';
import {
  SettingsModalProps,
  SettingsSection,
  ModalState,
  ModalKeyboardShortcut,
} from './SettingsModal.types';
import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  CloseButton,
  ModalBody,
  SettingsSections,
  SettingsSection as StyledSection,
  SectionHeader,
  SectionIcon,
  SectionContent,
  FormField,
  FieldLabel,
  FieldDescription,
  SelectInput,
  RangeInput,
  CheckboxWrapper,
  RangeValue,
  ModalFooter,
  ButtonGroup,
  ActionButton,
  UnsavedChangesIndicator,
  LoadingOverlay,
} from './SettingsModal.styled';

/**
 * SettingsModal component implementation with performance optimization and accessibility.
 */
export const SettingsModal: React.FC<SettingsModalProps> = React.memo(
  ({
    isOpen,
    preferences,
    hasUnsavedChanges = false,
    className,
    ariaLabel = 'Settings modal',
    onClose,
    onPreferencesChange,
    onSave,
    onReset,
    onDiscard,
  }) => {
    // Use storage context for preferences management
    const {
      preferences: storagePreferences,
      updatePreferences,
      lastError: storageError,
      clearError,
    } = useStorage();

    // Internal state for modal management
    const [modalState, setModalState] = useState<ModalState>({
      isOpen: false,
      activeSection: 'gameplay',
      expandedSections: new Set(['gameplay', 'display', 'sound']),
      isSaving: false,
      validationErrors: {},
      showUnsavedWarning: false,
    });

    // Local preferences state for form handling - use storage preferences as source
    const [localPreferences, setLocalPreferences] = useState<UserPreferences>(
      storagePreferences || preferences || DEFAULT_USER_PREFERENCES
    );

    // Refs for focus management
    const modalRef = useRef<HTMLDivElement>(null);
    const firstFocusableRef = useRef<HTMLElement>(null);
    const lastFocusableRef = useRef<HTMLElement>(null);

    /**
     * Keyboard shortcuts configuration
     */
    const keyboardShortcuts: ModalKeyboardShortcut[] = useMemo(
      () => [
        { key: 'Escape', action: 'close', description: 'Close settings' },
        {
          key: 'Ctrl+S',
          action: 'save',
          description: 'Save settings',
          ctrl: true,
        },
        {
          key: 'Ctrl+R',
          action: 'reset',
          description: 'Reset to defaults',
          ctrl: true,
        },
        { key: 'Tab', action: 'next-field', description: 'Next field' },
        {
          key: 'Shift+Tab',
          action: 'prev-field',
          description: 'Previous field',
          shift: true,
        },
      ],
      []
    );

    /**
     * Settings sections configuration
     */
    const settingsSections: SettingsSection[] = useMemo(
      () => [
        {
          id: 'gameplay',
          title: 'Gameplay',
          description: 'Game mechanics and assistance features',
          icon: '🎮',
          collapsible: true,
          defaultExpanded: true,
        },
        {
          id: 'display',
          title: 'Display & Appearance',
          description: 'Visual settings and theme preferences',
          icon: '🎨',
          collapsible: true,
          defaultExpanded: true,
        },
        {
          id: 'sound',
          title: 'Audio & Sound',
          description: 'Sound effects and audio preferences',
          icon: '🔊',
          collapsible: true,
          defaultExpanded: true,
        },
        {
          id: 'accessibility',
          title: 'Accessibility',
          description: 'Settings for improved accessibility',
          icon: '♿',
          collapsible: true,
          defaultExpanded: false,
        },
      ],
      []
    );

    /**
     * Update local preferences when storage preferences change
     */
    useEffect(() => {
      setLocalPreferences(
        storagePreferences || preferences || DEFAULT_USER_PREFERENCES
      );
    }, [storagePreferences, preferences]);

    /**
     * Handle modal open/close state
     */
    useEffect(() => {
      setModalState(prev => ({ ...prev, isOpen }));

      if (isOpen) {
        // Focus management when modal opens
        window.setTimeout(() => {
          firstFocusableRef.current?.focus();
        }, 100);
      }
    }, [isOpen]);

    /**
     * Handle preference updates with storage integration
     */
    const handlePreferenceChange = useCallback(
      (path: string, value: unknown) => {
        const updatedPreferences = { ...localPreferences };
        const pathParts = path.split('.');

        // Navigate to the correct nested property
        let current: Record<string, unknown> = updatedPreferences as Record<
          string,
          unknown
        >;
        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]];
        }
        current[pathParts[pathParts.length - 1]] = value;

        // Update lastModified timestamp
        updatedPreferences.lastModified = Date.now();

        // Update local state immediately for responsive UI
        setLocalPreferences(updatedPreferences);

        // Update storage context (this will handle debounced saving)
        updatePreferences(updatedPreferences);

        // Call legacy prop if provided
        onPreferencesChange?.(updatedPreferences);
      },
      [localPreferences, updatePreferences, onPreferencesChange]
    );

    /**
     * Handle section expand/collapse
     */
    const handleSectionToggle = useCallback((sectionId: string) => {
      setModalState(prev => {
        const newExpanded = new Set(prev.expandedSections);
        if (newExpanded.has(sectionId)) {
          newExpanded.delete(sectionId);
        } else {
          newExpanded.add(sectionId);
        }
        return { ...prev, expandedSections: newExpanded };
      });
    }, []);

    /**
     * Handle save action
     */
    const handleSave = useCallback(async () => {
      try {
        setModalState(prev => ({ ...prev, isSaving: true }));
        await onSave(localPreferences);
        setModalState(prev => ({ ...prev, isSaving: false }));
      } catch (error) {
        setModalState(prev => ({ ...prev, isSaving: false }));
        console.error('Failed to save preferences:', error);
      }
    }, [localPreferences, onSave]);

    /**
     * Handle reset to defaults
     */
    const handleReset = useCallback(() => {
      setLocalPreferences(DEFAULT_USER_PREFERENCES);
      onReset();
    }, [onReset]);

    /**
     * Handle keyboard shortcuts
     */
    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        const shortcut = keyboardShortcuts.find(({ key, ctrl, shift, alt }) => {
          const keyMatch =
            key === event.key ||
            key ===
              `${event.ctrlKey ? 'Ctrl+' : ''}${event.shiftKey ? 'Shift+' : ''}${event.key}`;
          const ctrlMatch = !!ctrl === (event.ctrlKey || event.metaKey);
          const shiftMatch = !!shift === event.shiftKey;
          const altMatch = !!alt === event.altKey;

          return keyMatch && ctrlMatch && shiftMatch && altMatch;
        });

        if (shortcut) {
          event.preventDefault();

          switch (shortcut.action) {
            case 'close':
              onClose();
              break;
            case 'save':
              if (!modalState.isSaving) {
                handleSave();
              }
              break;
            case 'reset':
              handleReset();
              break;
          }
        }
      },
      [keyboardShortcuts, modalState.isSaving, onClose, handleSave, handleReset]
    );

    /**
     * Setup keyboard event listeners
     */
    useEffect(() => {
      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }
    }, [isOpen, handleKeyDown]);

    /**
     * Focus trap for modal
     */
    const handleModalKeyDown = useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[
            focusableElements.length - 1
          ] as HTMLElement;

          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    }, []);

    /**
     * Render form fields for gameplay settings
     */
    const renderGameplayFields = useCallback(
      () => (
        <>
          <FormField>
            <FieldLabel htmlFor="drawMode">Draw Mode</FieldLabel>
            <FieldDescription>
              Choose how many cards to draw from the stock pile at once
            </FieldDescription>
            <SelectInput
              id="drawMode"
              value={localPreferences.gameplay.drawMode}
              onChange={e =>
                handlePreferenceChange(
                  'gameplay.drawMode',
                  e.target.value as DrawMode
                )
              }
              aria-describedby="drawMode-desc"
            >
              <option value="draw-one">Draw 1 Card (Easier)</option>
              <option value="draw-three">Draw 3 Cards (Classic)</option>
            </SelectInput>
          </FormField>

          <FormField>
            <CheckboxWrapper>
              <input
                type="checkbox"
                id="autoComplete"
                checked={localPreferences.gameplay.autoComplete}
                onChange={e =>
                  handlePreferenceChange(
                    'gameplay.autoComplete',
                    e.target.checked
                  )
                }
              />
              <div>
                <FieldLabel htmlFor="autoComplete">
                  Auto-complete Foundation
                </FieldLabel>
                <FieldDescription>
                  Automatically move cards to foundation piles when possible
                </FieldDescription>
              </div>
            </CheckboxWrapper>
          </FormField>

          <FormField>
            <CheckboxWrapper>
              <input
                type="checkbox"
                id="showHints"
                checked={localPreferences.gameplay.showHints}
                onChange={e =>
                  handlePreferenceChange('gameplay.showHints', e.target.checked)
                }
              />
              <div>
                <FieldLabel htmlFor="showHints">Show Move Hints</FieldLabel>
                <FieldDescription>
                  Highlight possible moves when you're stuck
                </FieldDescription>
              </div>
            </CheckboxWrapper>
          </FormField>

          <FormField>
            <CheckboxWrapper>
              <input
                type="checkbox"
                id="allowUndo"
                checked={localPreferences.gameplay.allowUndo}
                onChange={e =>
                  handlePreferenceChange('gameplay.allowUndo', e.target.checked)
                }
              />
              <div>
                <FieldLabel htmlFor="allowUndo">Allow Undo</FieldLabel>
                <FieldDescription>
                  Enable unlimited undo operations
                </FieldDescription>
              </div>
            </CheckboxWrapper>
          </FormField>

          <FormField>
            <FieldLabel htmlFor="autoSaveInterval">
              Auto-save Interval (minutes)
            </FieldLabel>
            <FieldDescription>
              How often to automatically save your game progress
            </FieldDescription>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RangeInput
                id="autoSaveInterval"
                min={1}
                max={30}
                step={1}
                value={localPreferences.gameplay.autoSaveInterval}
                onChange={e =>
                  handlePreferenceChange(
                    'gameplay.autoSaveInterval',
                    parseInt(e.target.value)
                  )
                }
              />
              <RangeValue>
                {localPreferences.gameplay.autoSaveInterval}
              </RangeValue>
            </div>
          </FormField>
        </>
      ),
      [localPreferences.gameplay, handlePreferenceChange]
    );

    /**
     * Render form fields for display settings
     */
    const renderDisplayFields = useCallback(
      () => (
        <>
          <FormField>
            <FieldLabel htmlFor="theme">Theme</FieldLabel>
            <FieldDescription>
              Choose the overall color scheme for the application
            </FieldDescription>
            <SelectInput
              id="theme"
              value={localPreferences.display.theme}
              onChange={e =>
                handlePreferenceChange('display.theme', e.target.value as Theme)
              }
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
              <option value="auto">Auto (System)</option>
            </SelectInput>
          </FormField>

          <FormField>
            <FieldLabel htmlFor="cardStyle">Card Style</FieldLabel>
            <FieldDescription>
              Select the visual style for playing cards
            </FieldDescription>
            <SelectInput
              id="cardStyle"
              value={localPreferences.display.cardStyle}
              onChange={e =>
                handlePreferenceChange(
                  'display.cardStyle',
                  e.target.value as CardStyle
                )
              }
            >
              <option value="classic">Classic Cards</option>
              <option value="modern">Modern Cards</option>
              <option value="minimal">Minimal Cards</option>
            </SelectInput>
          </FormField>

          <FormField>
            <FieldLabel htmlFor="animationSpeed">Animation Speed</FieldLabel>
            <FieldDescription>
              Control the speed of card animations and transitions
            </FieldDescription>
            <SelectInput
              id="animationSpeed"
              value={localPreferences.display.animationSpeed}
              onChange={e =>
                handlePreferenceChange(
                  'display.animationSpeed',
                  e.target.value as AnimationSpeed
                )
              }
            >
              <option value="none">No Animations</option>
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </SelectInput>
          </FormField>

          <FormField>
            <CheckboxWrapper>
              <input
                type="checkbox"
                id="largeCards"
                checked={localPreferences.display.largeCards}
                onChange={e =>
                  handlePreferenceChange('display.largeCards', e.target.checked)
                }
              />
              <div>
                <FieldLabel htmlFor="largeCards">Large Cards</FieldLabel>
                <FieldDescription>
                  Use larger cards for better visibility
                </FieldDescription>
              </div>
            </CheckboxWrapper>
          </FormField>

          <FormField>
            <CheckboxWrapper>
              <input
                type="checkbox"
                id="showTimer"
                checked={localPreferences.display.showTimer}
                onChange={e =>
                  handlePreferenceChange('display.showTimer', e.target.checked)
                }
              />
              <div>
                <FieldLabel htmlFor="showTimer">Show Timer</FieldLabel>
                <FieldDescription>
                  Display game timer during play
                </FieldDescription>
              </div>
            </CheckboxWrapper>
          </FormField>

          <FormField>
            <CheckboxWrapper>
              <input
                type="checkbox"
                id="showMoveCounter"
                checked={localPreferences.display.showMoveCounter}
                onChange={e =>
                  handlePreferenceChange(
                    'display.showMoveCounter',
                    e.target.checked
                  )
                }
              />
              <div>
                <FieldLabel htmlFor="showMoveCounter">
                  Show Move Counter
                </FieldLabel>
                <FieldDescription>
                  Display the number of moves made
                </FieldDescription>
              </div>
            </CheckboxWrapper>
          </FormField>
        </>
      ),
      [localPreferences.display, handlePreferenceChange]
    );

    /**
     * Render form fields for sound settings
     */
    const renderSoundFields = useCallback(
      () => (
        <>
          <FormField>
            <CheckboxWrapper>
              <input
                type="checkbox"
                id="soundEnabled"
                checked={localPreferences.sound.enabled}
                onChange={e =>
                  handlePreferenceChange('sound.enabled', e.target.checked)
                }
              />
              <div>
                <FieldLabel htmlFor="soundEnabled">
                  Enable Sound Effects
                </FieldLabel>
                <FieldDescription>
                  Turn on/off all sound effects in the game
                </FieldDescription>
              </div>
            </CheckboxWrapper>
          </FormField>

          {localPreferences.sound.enabled && (
            <>
              <FormField>
                <FieldLabel htmlFor="soundVolume">Master Volume</FieldLabel>
                <FieldDescription>
                  Overall volume level for all sound effects
                </FieldDescription>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <RangeInput
                    id="soundVolume"
                    min={0}
                    max={100}
                    step={5}
                    value={localPreferences.sound.volume}
                    onChange={e =>
                      handlePreferenceChange(
                        'sound.volume',
                        parseInt(e.target.value)
                      )
                    }
                  />
                  <RangeValue>{localPreferences.sound.volume}%</RangeValue>
                </div>
              </FormField>

              <FormField>
                <CheckboxWrapper>
                  <input
                    type="checkbox"
                    id="cardMovementSound"
                    checked={localPreferences.sound.cardMovement}
                    onChange={e =>
                      handlePreferenceChange(
                        'sound.cardMovement',
                        e.target.checked
                      )
                    }
                  />
                  <div>
                    <FieldLabel htmlFor="cardMovementSound">
                      Card Movement Sounds
                    </FieldLabel>
                    <FieldDescription>
                      Play sounds when cards are moved or placed
                    </FieldDescription>
                  </div>
                </CheckboxWrapper>
              </FormField>

              <FormField>
                <CheckboxWrapper>
                  <input
                    type="checkbox"
                    id="successSound"
                    checked={localPreferences.sound.success}
                    onChange={e =>
                      handlePreferenceChange('sound.success', e.target.checked)
                    }
                  />
                  <div>
                    <FieldLabel htmlFor="successSound">
                      Success Sounds
                    </FieldLabel>
                    <FieldDescription>
                      Play sounds for successful moves and game completion
                    </FieldDescription>
                  </div>
                </CheckboxWrapper>
              </FormField>

              <FormField>
                <CheckboxWrapper>
                  <input
                    type="checkbox"
                    id="errorSound"
                    checked={localPreferences.sound.error}
                    onChange={e =>
                      handlePreferenceChange('sound.error', e.target.checked)
                    }
                  />
                  <div>
                    <FieldLabel htmlFor="errorSound">Error Sounds</FieldLabel>
                    <FieldDescription>
                      Play sounds for invalid moves and errors
                    </FieldDescription>
                  </div>
                </CheckboxWrapper>
              </FormField>
            </>
          )}
        </>
      ),
      [localPreferences.sound, handlePreferenceChange]
    );

    /**
     * Render form fields for accessibility settings
     */
    const renderAccessibilityFields = useCallback(
      () => (
        <>
          <FormField>
            <CheckboxWrapper>
              <input
                type="checkbox"
                id="accessibility"
                checked={localPreferences.accessibility}
                onChange={e =>
                  handlePreferenceChange('accessibility', e.target.checked)
                }
              />
              <div>
                <FieldLabel htmlFor="accessibility">
                  Enable Enhanced Accessibility
                </FieldLabel>
                <FieldDescription>
                  Enable additional accessibility features for screen readers
                  and keyboard navigation
                </FieldDescription>
              </div>
            </CheckboxWrapper>
          </FormField>

          <FormField>
            <CheckboxWrapper>
              <input
                type="checkbox"
                id="highContrast"
                checked={localPreferences.display.highContrast}
                onChange={e =>
                  handlePreferenceChange(
                    'display.highContrast',
                    e.target.checked
                  )
                }
              />
              <div>
                <FieldLabel htmlFor="highContrast">
                  High Contrast Mode
                </FieldLabel>
                <FieldDescription>
                  Use high contrast colors for better visibility
                </FieldDescription>
              </div>
            </CheckboxWrapper>
          </FormField>

          <FormField>
            <FieldLabel htmlFor="language">Language</FieldLabel>
            <FieldDescription>Select the interface language</FieldDescription>
            <SelectInput
              id="language"
              value={localPreferences.language}
              onChange={e => handlePreferenceChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="zh-TW">繁體中文</option>
              <option value="zh-CN">简体中文</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </SelectInput>
          </FormField>
        </>
      ),
      [
        localPreferences.accessibility,
        localPreferences.display.highContrast,
        localPreferences.language,
        handlePreferenceChange,
      ]
    );

    /**
     * Render section content based on section ID
     */
    const renderSectionContent = useCallback(
      (sectionId: string) => {
        switch (sectionId) {
          case 'gameplay':
            return renderGameplayFields();
          case 'display':
            return renderDisplayFields();
          case 'sound':
            return renderSoundFields();
          case 'accessibility':
            return renderAccessibilityFields();
          default:
            return null;
        }
      },
      [
        renderGameplayFields,
        renderDisplayFields,
        renderSoundFields,
        renderAccessibilityFields,
      ]
    );

    // Don't render if not open
    if (!isOpen) return null;

    return (
      <ModalOverlay isOpen={isOpen} onClick={onClose}>
        <ModalContainer
          ref={modalRef}
          className={className}
          isOpen={isOpen}
          onClick={e => e.stopPropagation()}
          onKeyDown={handleModalKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          tabIndex={-1}
        >
          <LoadingOverlay isVisible={modalState.isSaving} />

          <ModalHeader>
            <h2>
              <span>⚙️</span>
              Settings
            </h2>
            <CloseButton
              ref={firstFocusableRef}
              onClick={onClose}
              aria-label="Close settings"
              type="button"
            >
              ✕
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            <SettingsSections>
              {settingsSections.map(section => (
                <StyledSection
                  key={section.id}
                  isExpanded={modalState.expandedSections.has(section.id)}
                >
                  <SectionHeader
                    isCollapsible={section.collapsible}
                    onClick={() =>
                      section.collapsible && handleSectionToggle(section.id)
                    }
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        section.collapsible && handleSectionToggle(section.id);
                      }
                    }}
                    tabIndex={section.collapsible ? 0 : -1}
                    role={section.collapsible ? 'button' : undefined}
                    aria-expanded={
                      section.collapsible
                        ? modalState.expandedSections.has(section.id)
                        : undefined
                    }
                    aria-controls={`section-${section.id}`}
                  >
                    <div>
                      <h3>
                        <span>{section.icon}</span>
                        {section.title}
                      </h3>
                      {section.description && <p>{section.description}</p>}
                    </div>
                    {section.collapsible && (
                      <SectionIcon
                        isExpanded={modalState.expandedSections.has(section.id)}
                      >
                        ▼
                      </SectionIcon>
                    )}
                  </SectionHeader>
                  <SectionContent
                    id={`section-${section.id}`}
                    isCollapsed={
                      section.collapsible &&
                      !modalState.expandedSections.has(section.id)
                    }
                  >
                    {renderSectionContent(section.id)}
                  </SectionContent>
                </StyledSection>
              ))}
            </SettingsSections>
          </ModalBody>

          <ModalFooter>
            {hasUnsavedChanges && (
              <UnsavedChangesIndicator>Unsaved changes</UnsavedChangesIndicator>
            )}

            {storageError && (
              <UnsavedChangesIndicator style={{ color: '#f44336' }}>
                儲存失敗：
                {storageError.message.includes('QUOTA_EXCEEDED')
                  ? '儲存空間不足'
                  : storageError.message.includes('PERMISSION_DENIED')
                    ? '瀏覽器封鎖本地儲存'
                    : storageError.message.includes('DATA_CORRUPTION')
                      ? '資料損毀'
                      : '儲存錯誤'}
                <button
                  onClick={clearError}
                  style={{
                    marginLeft: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                  }}
                  aria-label="清除錯誤"
                >
                  ✕
                </button>
              </UnsavedChangesIndicator>
            )}

            <ButtonGroup>
              <ActionButton
                variant="secondary"
                onClick={handleReset}
                disabled={modalState.isSaving}
                aria-label="Reset all settings to defaults"
              >
                Reset to Defaults
              </ActionButton>

              <ActionButton
                variant="secondary"
                onClick={onDiscard}
                disabled={modalState.isSaving || !hasUnsavedChanges}
                aria-label="Discard changes and close"
              >
                Discard Changes
              </ActionButton>

              <ActionButton
                variant="primary"
                onClick={handleSave}
                disabled={modalState.isSaving}
                isLoading={modalState.isSaving}
                aria-label="Save settings and close"
                ref={lastFocusableRef}
              >
                {modalState.isSaving ? 'Saving...' : 'Save Settings'}
              </ActionButton>
            </ButtonGroup>
          </ModalFooter>
        </ModalContainer>
      </ModalOverlay>
    );
  }
);

// Set display name for better debugging
SettingsModal.displayName = 'SettingsModal';

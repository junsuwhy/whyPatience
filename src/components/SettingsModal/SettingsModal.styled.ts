/**
 * Styled components for the SettingsModal component.
 * Following Constitution Principle IV (Performance Standards) for 60fps animations.
 * Implements WCAG 2.1 AA accessibility standards with proper contrast and focus states.
 */

import styled, { css, keyframes } from 'styled-components';

/**
 * Keyframes for modal animations optimized for 60fps performance.
 */
const modalFadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.95) translateZ(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateZ(0);
  }
`;

const overlayFadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

/**
 * Modal overlay that covers the entire screen.
 */
export const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;

  /* Performance optimization */
  will-change: opacity;
  backface-visibility: hidden;
  transform: translateZ(0);

  /* Animation */
  animation: ${overlayFadeIn} 0.3s ease-out;

  /* Hide when closed */
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
`;

/**
 * Main modal container.
 */
export const ModalContainer = styled.div<{ isOpen: boolean }>`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;

  /* Performance optimization */
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);

  /* Animation */
  animation: ${modalFadeIn} 0.3s ease-out;

  /* Responsive design */
  @media (max-width: 768px) {
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 32px);
    border-radius: 8px;
  }

  /* Focus trap */
  &:focus {
    outline: none;
  }
`;

/**
 * Modal header with title and close button.
 */
export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #212529;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @media (max-width: 768px) {
    padding: 16px 20px;

    h2 {
      font-size: 16px;
    }
  }
`;

/**
 * Close button in the header.
 */
export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #6c757d;
  font-size: 18px;
  line-height: 1;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    color: #495057;
  }

  &:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.95);
  }
`;

/**
 * Modal body with scrollable content.
 */
export const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 140px); /* Account for header and footer */

  @media (max-width: 768px) {
    padding: 20px;
    max-height: calc(100vh - 120px);
  }
`;

/**
 * Settings sections container.
 */
export const SettingsSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

/**
 * Individual settings section.
 */
export const SettingsSection = styled.div<{ isExpanded?: boolean }>`
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

/**
 * Section header (clickable if collapsible).
 */
export const SectionHeader = styled.div<{ isCollapsible?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  cursor: ${({ isCollapsible }) => (isCollapsible ? 'pointer' : 'default')};

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #495057;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    margin: 4px 0 0 0;
    font-size: 14px;
    color: #6c757d;
  }

  &:hover {
    background: ${({ isCollapsible }) =>
      isCollapsible ? '#e9ecef' : '#f8f9fa'};
  }

  &:focus {
    outline: ${({ isCollapsible }) =>
      isCollapsible ? '2px solid #0066cc' : 'none'};
    outline-offset: -2px;
  }
`;

/**
 * Section expand/collapse icon.
 */
export const SectionIcon = styled.span<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #6c757d;
  transform: rotate(${({ isExpanded }) => (isExpanded ? 180 : 0)}deg);
  transition: transform 0.2s ease;
`;

/**
 * Section content area.
 */
export const SectionContent = styled.div<{ isCollapsed?: boolean }>`
  padding: ${({ isCollapsed }) => (isCollapsed ? '0 20px' : '20px')};
  max-height: ${({ isCollapsed }) => (isCollapsed ? '0' : '1000px')};
  overflow: hidden;
  transition: all 0.3s ease;
`;

/**
 * Form field container.
 */
export const FormField = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * Field label.
 */
export const FieldLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 6px;
  line-height: 1.4;
`;

/**
 * Field description.
 */
export const FieldDescription = styled.p`
  font-size: 13px;
  color: #6c757d;
  margin: 4px 0 8px 0;
  line-height: 1.4;
`;

/**
 * Base input styles.
 */
const inputBaseStyles = css`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: white;
  color: #495057;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }

  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

/**
 * Select dropdown input.
 */
export const SelectInput = styled.select`
  ${inputBaseStyles}
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`;

/**
 * Number input.
 */
export const NumberInput = styled.input.attrs({ type: 'number' })`
  ${inputBaseStyles}
`;

/**
 * Range slider input.
 */
export const RangeInput = styled.input.attrs({ type: 'range' })`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e9ecef;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #0066cc;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
  }

  &::-webkit-slider-thumb:hover {
    background: #0052a3;
    transform: scale(1.1);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #0066cc;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }
`;

/**
 * Checkbox input wrapper.
 */
export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    margin: 2px 0 0 0;
    cursor: pointer;

    &:focus {
      outline: 2px solid #0066cc;
      outline-offset: 2px;
    }
  }

  label {
    cursor: pointer;
    margin: 0;
    line-height: 1.4;
  }
`;

/**
 * Radio group container.
 */
export const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/**
 * Radio option wrapper.
 */
export const RadioOption = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;

  input[type='radio'] {
    width: 16px;
    height: 16px;
    margin: 2px 0 0 0;
    cursor: pointer;

    &:focus {
      outline: 2px solid #0066cc;
      outline-offset: 2px;
    }
  }

  label {
    cursor: pointer;
    margin: 0;
    line-height: 1.4;
  }
`;

/**
 * Range value display.
 */
export const RangeValue = styled.span`
  display: inline-block;
  min-width: 40px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 4px 8px;
  margin-left: 8px;
`;

/**
 * Modal footer with action buttons.
 */
export const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 16px 20px;
  }
`;

/**
 * Button group in footer.
 */
export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    justify-content: stretch;

    button {
      flex: 1;
    }
  }
`;

/**
 * Action button base styles.
 */
export const ActionButton = styled.button<{
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 36px;
  min-width: 80px;

  ${({ variant = 'secondary' }) => {
    switch (variant) {
      case 'primary':
        return css`
          background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
          color: white;

          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #0052a3 0%, #003875 100%);
          }
        `;
      case 'danger':
        return css`
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;

          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
          }
        `;
      default:
        return css`
          background: white;
          color: #495057;
          border: 1px solid #ced4da;

          &:hover:not(:disabled) {
            background: #f8f9fa;
            border-color: #adb5bd;
          }
        `;
    }
  }}

  &:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${({ isLoading }) =>
    isLoading &&
    css`
      cursor: wait;

      &::after {
        content: '';
        width: 12px;
        height: 12px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-left: 4px;
      }
    `}
`;

/**
 * Unsaved changes indicator.
 */
export const UnsavedChangesIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #856404;

  &::before {
    content: '●';
    color: #ffc107;
  }
`;

/**
 * Error message display.
 */
export const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 13px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '⚠️';
    font-size: 12px;
  }
`;

/**
 * Loading overlay for the modal.
 */
export const LoadingOverlay = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;

  &::after {
    content: '';
    width: 32px;
    height: 32px;
    border: 3px solid #e9ecef;
    border-top: 3px solid #0066cc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
`;

/**
 * Spin animation for loading states.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

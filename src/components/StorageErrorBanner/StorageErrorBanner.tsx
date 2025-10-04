/**
 * StorageErrorBanner - Display storage errors with appropriate recovery actions
 *
 * Provides user-friendly error messages and recovery options for different storage failures:
 * - QUOTA_EXCEEDED: Storage space full
 * - DATA_CORRUPTION: Data integrity issues
 * - PERMISSION_DENIED: Browser blocking storage
 */

import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useStorage } from '../../context/StorageContext';

const BannerContainer = styled.div<{ errorType: string }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 12px 16px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  background-color: ${props => {
    switch (props.errorType) {
      case 'QUOTA_EXCEEDED':
        return '#ff9800'; // Orange for warnings
      case 'DATA_CORRUPTION':
        return '#f44336'; // Red for critical errors
      case 'PERMISSION_DENIED':
        return '#ff5722'; // Deep orange for blocked access
      default:
        return '#9c27b0'; // Purple for unknown errors
    }
  }};
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const ErrorIcon = styled.span`
  font-size: 18px;
`;

const ErrorText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ErrorTitle = styled.div`
  font-weight: 600;
`;

const ErrorDescription = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
`;

const DismissButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
`;

/**
 * Get error type from error message
 */
function getErrorType(error: Error): string {
  const message = error.message.toUpperCase();
  if (message.includes('QUOTA_EXCEEDED')) return 'QUOTA_EXCEEDED';
  if (message.includes('DATA_CORRUPTION')) return 'DATA_CORRUPTION';
  if (message.includes('PERMISSION_DENIED')) return 'PERMISSION_DENIED';
  return 'UNKNOWN';
}

/**
 * Get error display information
 */
function getErrorInfo(errorType: string) {
  switch (errorType) {
    case 'QUOTA_EXCEEDED':
      return {
        icon: '⚠️',
        title: 'Storage Quota Exceeded',
        description:
          'Storage space is full. Some features may not work properly.',
      };
    case 'DATA_CORRUPTION':
      return {
        icon: '💥',
        title: 'Data Corruption Detected',
        description:
          'Game data may be corrupted. Consider resetting to fix issues.',
      };
    case 'PERMISSION_DENIED':
      return {
        icon: '🚫',
        title: 'Browser Blocked Local Storage',
        description:
          'Storage access denied. Check browser settings or try incognito mode.',
      };
    default:
      return {
        icon: '❌',
        title: 'Storage Error',
        description: 'An unexpected storage error occurred.',
      };
  }
}

/**
 * StorageErrorBanner component
 */
export const StorageErrorBanner: React.FC = () => {
  const { lastError, clearError, storageService } = useStorage();

  const handleClearData = useCallback(async () => {
    try {
      await storageService.clearAllData();
      clearError();
      // Reload page to reinitialize with clean state
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear storage data:', error);
    }
  }, [storageService, clearError]);

  const handleDismiss = useCallback(() => {
    clearError();
  }, [clearError]);

  const handleRetry = useCallback(() => {
    clearError();
    // Force re-initialization by reloading
    window.location.reload();
  }, [clearError]);

  if (!lastError) {
    return null;
  }

  const errorType = getErrorType(lastError);
  const errorInfo = getErrorInfo(errorType);

  return (
    <BannerContainer role="alert" aria-live="assertive" errorType={errorType}>
      <ErrorMessage>
        <ErrorIcon aria-hidden="true">{errorInfo.icon}</ErrorIcon>
        <ErrorText>
          <ErrorTitle>{errorInfo.title}</ErrorTitle>
          <ErrorDescription>{errorInfo.description}</ErrorDescription>
        </ErrorText>
      </ErrorMessage>

      <ActionButtons>
        {errorType === 'DATA_CORRUPTION' && (
          <ActionButton
            onClick={handleClearData}
            aria-label="Clear corrupted data and restart"
          >
            Clear Data
          </ActionButton>
        )}

        {errorType === 'QUOTA_EXCEEDED' && (
          <ActionButton
            onClick={handleClearData}
            aria-label="Clear storage to free up space"
          >
            Free Space
          </ActionButton>
        )}

        {errorType === 'PERMISSION_DENIED' && (
          <ActionButton onClick={handleRetry} aria-label="Retry storage access">
            Retry
          </ActionButton>
        )}

        <DismissButton
          onClick={handleDismiss}
          aria-label="Dismiss error message"
        >
          ✕
        </DismissButton>
      </ActionButtons>
    </BannerContainer>
  );
};

export default StorageErrorBanner;

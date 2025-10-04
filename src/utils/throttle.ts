/**
 * Throttle utility for limiting function calls
 * Used by StorageContext to prevent excessive storage operations
 */

/**
 * Creates a throttled version of a function that only executes at most once per specified interval
 * @param func - The function to throttle
 * @param delay - The throttle delay in milliseconds
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let isThrottled = false;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    if (!isThrottled) {
      // Execute immediately if not throttled
      func(...args);
      isThrottled = true;

      // Set up throttle timeout
      setTimeout(() => {
        isThrottled = false;

        // If there were pending calls, execute the most recent one
        if (lastArgs) {
          func(...lastArgs);
          lastArgs = null;

          // Reset throttle for the pending call
          isThrottled = true;
          setTimeout(() => {
            isThrottled = false;
          }, delay);
        }
      }, delay);
    } else {
      // Store the latest call for later execution
      lastArgs = args;
    }
  };
}

/**
 * Creates a debounced version of a function that delays execution until after delay milliseconds
 * have elapsed since the last time the debounced function was invoked
 * @param func - The function to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

export default { throttle, debounce };

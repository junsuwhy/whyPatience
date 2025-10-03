/**
 * CSS keyframes for card game animations.
 * Hardware-accelerated animations using transform and opacity only.
 * All animations are GPU-friendly and optimized for 60fps performance.
 */

import { keyframes, css } from 'styled-components';
import { DURATIONS, EASING } from './animation';

/**
 * Card flip animation keyframes.
 * Rotates card around Y-axis to show front/back face transition.
 * Uses perspective for 3D effect while maintaining performance.
 */
export const flipCardKeyframes = keyframes`
  0% {
    transform: perspective(1000px) rotateY(0deg);
    opacity: 1;
  }
  50% {
    transform: perspective(1000px) rotateY(90deg);
    opacity: 0.8;
  }
  100% {
    transform: perspective(1000px) rotateY(180deg);
    opacity: 1;
  }
`;

/**
 * Card lift animation keyframes.
 * Elevates card with shadow and scale for drag start indication.
 * Subtle scale and shadow for visual feedback without disruption.
 */
export const liftCardKeyframes = keyframes`
  0% {
    transform: scale(1) translateZ(0);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
  100% {
    transform: scale(1.02) translateZ(0);
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
  }
`;

/**
 * Card slide to position keyframes.
 * Smooth movement from current position to target location.
 * Uses cubic-bezier for natural card movement feel.
 */
export const slideToPositionKeyframes = keyframes`
  0% {
    transform: translate(var(--start-x, 0), var(--start-y, 0)) translateZ(0);
    opacity: 1;
  }
  100% {
    transform: translate(var(--end-x, 0), var(--end-y, 0)) translateZ(0);
    opacity: 1;
  }
`;

/**
 * Pulse highlight animation keyframes.
 * Gentle pulse effect for valid drop zones and highlights.
 * Subtle opacity and scale changes for user guidance.
 */
export const pulseHighlightKeyframes = keyframes`
  0% {
    transform: scale(1) translateZ(0);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.02) translateZ(0);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) translateZ(0);
    opacity: 0.6;
  }
`;

/**
 * Auto-sequence animation keyframes.
 * For automated card movements like auto-complete to foundation.
 * Emphasizes the automated nature with distinct timing.
 */
export const autoSequenceKeyframes = keyframes`
  0% {
    transform: scale(1) translateZ(0);
    opacity: 1;
  }
  20% {
    transform: scale(1.05) translateZ(0);
    opacity: 0.9;
  }
  40% {
    transform: scale(1.05) translate(var(--mid-x, 0), var(--mid-y, 0)) translateZ(0);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) translate(var(--end-x, 0), var(--end-y, 0)) translateZ(0);
    opacity: 1;
  }
`;

/**
 * Victory celebration keyframes.
 * Celebratory animation for game completion.
 * Bouncy and joyful animation with rotation and scale.
 */
export const victoryKeyframes = keyframes`
  0% {
    transform: scale(1) rotate(0deg) translateZ(0);
    opacity: 1;
  }
  25% {
    transform: scale(1.1) rotate(5deg) translateZ(0);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(-5deg) translateZ(0);
    opacity: 1;
  }
  75% {
    transform: scale(1.1) rotate(3deg) translateZ(0);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg) translateZ(0);
    opacity: 1;
  }
`;

/**
 * Error shake animation keyframes.
 * Quick shake animation for invalid moves or errors.
 * Horizontal shake to indicate rejection or failure.
 */
export const errorShakeKeyframes = keyframes`
  0% {
    transform: translateX(0) translateZ(0);
  }
  25% {
    transform: translateX(-4px) translateZ(0);
  }
  50% {
    transform: translateX(4px) translateZ(0);
  }
  75% {
    transform: translateX(-2px) translateZ(0);
  }
  100% {
    transform: translateX(0) translateZ(0);
  }
`;

/**
 * Fade in animation keyframes.
 * Gentle fade in for new cards or UI elements.
 * Simple opacity transition for subtle appearance.
 */
export const fadeInKeyframes = keyframes`
  0% {
    opacity: 0;
    transform: translateZ(0);
  }
  100% {
    opacity: 1;
    transform: translateZ(0);
  }
`;

/**
 * Fade out animation keyframes.
 * Gentle fade out for removing cards or UI elements.
 * Simple opacity transition for subtle disappearance.
 */
export const fadeOutKeyframes = keyframes`
  0% {
    opacity: 1;
    transform: translateZ(0);
  }
  100% {
    opacity: 0;
    transform: translateZ(0);
  }
`;

/**
 * Deal sequence animation keyframes.
 * Special animation for initial card dealing.
 * Simulates dealing from deck with slight arc movement.
 */
export const dealSequenceKeyframes = keyframes`
  0% {
    transform: translate(var(--deck-x, 0), var(--deck-y, 0)) scale(0.8) translateZ(0);
    opacity: 0;
  }
  20% {
    transform: translate(var(--deck-x, 0), var(--deck-y, 0)) scale(1) translateZ(0);
    opacity: 1;
  }
  80% {
    transform: translate(var(--mid-x, 0), var(--mid-y, 0)) scale(1) translateZ(0);
    opacity: 1;
  }
  100% {
    transform: translate(var(--end-x, 0), var(--end-y, 0)) scale(1) translateZ(0);
    opacity: 1;
  }
`;

/**
 * Hover lift animation keyframes.
 * Subtle lift effect for card hover states.
 * Less dramatic than drag lift, just gentle elevation.
 */
export const hoverLiftKeyframes = keyframes`
  0% {
    transform: translateY(0) translateZ(0);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
  100% {
    transform: translateY(-2px) translateZ(0);
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  }
`;

/**
 * Pre-defined animation CSS for styled-components.
 * Combines keyframes with timing and easing for easy application.
 */
export const animations = {
  flip: css`
    animation: ${flipCardKeyframes} ${DURATIONS.FAST}ms ${EASING.EASE_OUT};
  `,
  lift: css`
    animation: ${liftCardKeyframes} ${DURATIONS.INSTANT}ms ${EASING.EASE_OUT};
  `,
  slideToPosition: css`
    animation: ${slideToPositionKeyframes} ${DURATIONS.NORMAL}ms
      ${EASING.EASE_IN_OUT};
  `,
  pulseHighlight: css`
    animation: ${pulseHighlightKeyframes} ${DURATIONS.SLOW}ms
      ${EASING.EASE_IN_OUT} infinite;
  `,
  autoSequence: css`
    animation: ${autoSequenceKeyframes} ${DURATIONS.EXTENDED}ms ${EASING.SPRING};
  `,
  victory: css`
    animation: ${victoryKeyframes} ${DURATIONS.EXTENDED}ms ${EASING.BOUNCE};
  `,
  errorShake: css`
    animation: ${errorShakeKeyframes} ${DURATIONS.FAST}ms ${EASING.EASE_OUT};
  `,
  fadeIn: css`
    animation: ${fadeInKeyframes} ${DURATIONS.NORMAL}ms ${EASING.EASE_OUT};
  `,
  fadeOut: css`
    animation: ${fadeOutKeyframes} ${DURATIONS.NORMAL}ms ${EASING.EASE_IN};
  `,
  dealSequence: css`
    animation: ${dealSequenceKeyframes} ${DURATIONS.EXTENDED}ms
      ${EASING.EASE_IN_OUT};
  `,
  hoverLift: css`
    animation: ${hoverLiftKeyframes} ${DURATIONS.INSTANT}ms ${EASING.EASE_OUT};
  `,
} as const;

/**
 * Animation class names for CSS targeting.
 * Maps animation types to CSS class names for easy application.
 */
export const animationClasses = {
  flip: 'card-flip',
  lift: 'card-lift',
  slideToPosition: 'card-slide',
  pulseHighlight: 'pulse-highlight',
  autoSequence: 'auto-sequence',
  victory: 'victory-animation',
  errorShake: 'error-shake',
  fadeIn: 'fade-in',
  fadeOut: 'fade-out',
  dealSequence: 'deal-sequence',
  hoverLift: 'hover-lift',
} as const;

/**
 * Utility function to get animation CSS string.
 * @param animationType - Type of animation to get
 * @returns CSS animation string
 */
export function getAnimation(animationType: keyof typeof animations): string {
  return animations[animationType];
}

/**
 * Utility function to get animation class name.
 * @param animationType - Type of animation to get
 * @returns CSS class name string
 */
export function getAnimationClass(
  animationType: keyof typeof animationClasses
): string {
  return animationClasses[animationType];
}

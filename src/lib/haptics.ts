/**
 * Trigger haptic feedback via the Vibration API.
 * Silently no-ops on devices/browsers that don't support it.
 */

type HapticStyle = "light" | "medium" | "heavy";

const patterns: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
};

export const haptic = (style: HapticStyle = "light") => {
  try {
    navigator?.vibrate?.(patterns[style]);
  } catch {
    // Vibration API not available — silent no-op
  }
};

/**
 * Spaced Repetition Utility
 * Simple rating-based algorithm for flashcard review intervals
 */

export type Rating = 1 | 2 | 3 | 4;

export const RATINGS = {
  AGAIN: 1 as Rating,
  HARD: 2 as Rating,
  GOOD: 3 as Rating,
  EASY: 4 as Rating,
} as const;

export const RATING_LABELS = {
  [RATINGS.AGAIN]: "Znovu",
  [RATINGS.HARD]: "Těžké",
  [RATINGS.GOOD]: "Dobré",
  [RATINGS.EASY]: "Snadné",
} as const;

export const RATING_DESCRIPTIONS = {
  [RATINGS.AGAIN]: "Nevzpomněl/a jsem si",
  [RATINGS.HARD]: "Vzpomněl/a jsem si s obtížemi",
  [RATINGS.GOOD]: "Vzpomněl/a jsem si s námahou",
  [RATINGS.EASY]: "Vzpomněl/a jsem si snadno",
} as const;

// Interval in minutes for each rating
const RATING_INTERVALS = {
  [RATINGS.AGAIN]: 10, // 10 minutes
  [RATINGS.HARD]: 1440, // 1 day
  [RATINGS.GOOD]: 4320, // 3 days
  [RATINGS.EASY]: 10080, // 7 days
} as const;

/**
 * Calculate the minutes offset for the next review based on rating
 * @param rating - User's rating of how well they remembered the card (1-4)
 * @returns Number of minutes to add to the next repetition date
 */
export function calculateMinutesOffset(rating: Rating): number {
  return RATING_INTERVALS[rating];
}

/**
 * Get the human-readable interval for a rating
 * @param rating - User's rating (1-4)
 * @returns Formatted string like "10 minut", "1 den", "3 dny", "7 dní"
 */
export function getIntervalLabel(rating: Rating): string {
  const minutes = RATING_INTERVALS[rating];
  
  if (minutes < 60) {
    return `${minutes} minut`;
  }
  
  const days = Math.floor(minutes / 1440);
  
  if (days === 1) {
    return "1 den";
  } else if (days < 5) {
    return `${days} dny`;
  } else {
    return `${days} dní`;
  }
}

/**
 * Get keyboard shortcut for rating
 * @param rating - Rating value (1-4)
 * @returns Keyboard key as string
 */
export function getRatingShortcut(rating: Rating): string {
  return rating.toString();
}






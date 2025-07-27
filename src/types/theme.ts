/**
 * Theme type definitions for AnonXChat
 */

export interface Theme {
  /** Unique identifier for the theme */
  id: string;
  /** Display name of the theme */
  name: string;
  /** Emoji icon representing the theme */
  icon: string;
  /** CSS class name to apply */
  className: string;
  /** Brief description of the theme */
  description: string;
  /** Whether the theme is free (true) or premium (false) */
  free: boolean;
  /** Whether the theme is premium (true) or free (false) */
  premium: boolean;
  /** Price for premium themes (in virtual currency or real currency) */
  price?: number;
  /** Preview image or color scheme */
  preview?: string;
  /** Theme category for grouping */
  category: 'free' | 'premium';
}

export interface ThemeState {
  /** Currently active theme ID */
  currentTheme: string;
  /** List of purchased/unlocked premium theme IDs */
  purchasedThemes: string[];
  /** Whether user has premium access (unlocks all themes) */
  hasPremiumAccess: boolean;
}

export interface ThemeContextValue extends ThemeState {
  /** Apply a new theme */
  setTheme: (themeId: string) => boolean;
  /** Check if a theme can be used */
  canUseTheme: (themeId: string) => boolean;
  /** Check if a theme is unlocked */
  isThemeUnlocked: (themeId: string) => boolean;
  /** Purchase/unlock a premium theme */
  unlockTheme: (themeId: string) => boolean;
  /** Get available themes (free + unlocked premium) */
  getAvailableThemes: () => Theme[];
  /** Get locked premium themes */
  getLockedThemes: () => Theme[];
  /** Get all themes */
  getAllThemes: () => Theme[];
}

export type ThemeUnlockStatus = 'free' | 'locked' | 'unlocked';

export interface ThemeItemProps {
  theme: Theme;
  isActive: boolean;
  unlockStatus: ThemeUnlockStatus;
  onSelect: (themeId: string) => void;
  onPurchase?: (themeId: string) => void;
}
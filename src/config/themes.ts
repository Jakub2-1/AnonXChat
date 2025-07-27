/**
 * Theme configuration for AnonXChat
 * Defines all available themes with their properties
 */

import { Theme } from '../types/theme';

export const themes: Theme[] = [
  // FREE THEMES
  {
    id: 'glow',
    name: 'Glow',
    icon: '🌟',
    className: 'theme-glow',
    description: 'Bright and cheerful light theme',
    free: true,
    premium: false,
    category: 'free',
    preview: '#3b82f6'
  },
  {
    id: 'goth',
    name: 'Goth',
    icon: '💀',
    className: 'theme-goth',
    description: 'Dark gothic atmosphere',
    free: true,
    premium: false,
    category: 'free',
    preview: '#1a1a1a'
  },

  // PREMIUM THEMES
  {
    id: 'pixelquest',
    name: 'Pixel Quest',
    icon: '🎮',
    className: 'theme-pixelquest',
    description: 'Retro 8-bit Gameboy style adventure',
    free: false,
    premium: true,
    category: 'premium',
    price: 100,
    preview: '#9bb537'
  },
  {
    id: 'poltergeist',
    name: 'Poltergeist',
    icon: '👁️‍🗨️',
    className: 'theme-poltergeist',
    description: 'Disturbing supernatural energy',
    free: false,
    premium: true,
    category: 'premium',
    price: 150,
    preview: '#ff2e2e'
  },
  {
    id: 'hellokitty',
    name: 'Hello Kitty',
    icon: '🎀',
    className: 'theme-hellokitty',
    description: 'Kawaii pink and cute vibes',
    free: false,
    premium: true,
    category: 'premium',
    price: 200,
    preview: '#ff69b4'
  },
  {
    id: 'chill',
    name: 'Chill',
    icon: '🌸',
    className: 'theme-chill',
    description: 'Relaxing gradient with floating elements',
    free: false,
    premium: true,
    category: 'premium',
    price: 120,
    preview: '#64748b'
  },
  {
    id: 'chaos',
    name: 'Chaos',
    icon: '💥',
    className: 'theme-chaos',
    description: 'Wild multicolor madness',
    free: false,
    premium: true,
    category: 'premium',
    price: 180,
    preview: '#ef4444'
  },
  {
    id: 'retroneon',
    name: 'Retro Neon',
    icon: '🌈',
    className: 'theme-retroneon',
    description: '80s cyberpunk neon lights',
    free: false,
    premium: true,
    category: 'premium',
    price: 250,
    preview: '#06b6d4'
  },
  {
    id: 'digitalvoid',
    name: 'Digital Void',
    icon: '🕳️',
    className: 'theme-digitalvoid',
    description: 'Matrix-like digital darkness',
    free: false,
    premium: true,
    category: 'premium',
    price: 300,
    preview: '#000000'
  }
];

/**
 * Get theme by ID
 */
export function getThemeById(id: string): Theme | undefined {
  return themes.find(theme => theme.id === id);
}

/**
 * Get all free themes
 */
export function getFreeThemes(): Theme[] {
  return themes.filter(theme => theme.free);
}

/**
 * Get all premium themes
 */
export function getPremiumThemes(): Theme[] {
  return themes.filter(theme => theme.premium);
}

/**
 * Default theme ID
 */
export const DEFAULT_THEME_ID = 'glow';

/**
 * Virtual currency name for theme purchases
 */
export const VIRTUAL_CURRENCY = 'AnonCoins';
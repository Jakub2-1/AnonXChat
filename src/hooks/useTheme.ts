/**
 * Theme management hook for AnonXChat
 * Handles theme application, persistence, and unlock logic
 */

import { Theme, ThemeState, ThemeUnlockStatus } from '../types/theme';
import { themes, getThemeById, DEFAULT_THEME_ID } from '../config/themes';

class ThemeManager {
  private state: ThemeState;
  private listeners: Array<() => void> = [];

  constructor() {
    this.state = this.loadState();
    this.initializeTheme();
  }

  /**
   * Load theme state from localStorage
   */
  private loadState(): ThemeState {
    const currentTheme = localStorage.getItem('selectedTheme') || DEFAULT_THEME_ID;
    const purchasedThemes = JSON.parse(localStorage.getItem('premiumThemesUnlocked') || '[]');
    const hasPremiumAccess = localStorage.getItem('anonx_premium') === 'true' || 
                            localStorage.getItem('devKey') === 'MY_SECRET_KEY';

    return {
      currentTheme,
      purchasedThemes,
      hasPremiumAccess
    };
  }

  /**
   * Save theme state to localStorage
   */
  private saveState(): void {
    localStorage.setItem('selectedTheme', this.state.currentTheme);
    localStorage.setItem('premiumThemesUnlocked', JSON.stringify(this.state.purchasedThemes));
  }

  /**
   * Initialize theme application
   */
  private initializeTheme(): void {
    this.applyTheme(this.state.currentTheme);
  }

  /**
   * Apply theme to the DOM
   */
  private applyTheme(themeId: string): void {
    const theme = getThemeById(themeId);
    if (!theme) return;

    const body = document.body;
    
    // Remove existing theme classes
    themes.forEach(t => {
      body.classList.remove(t.className);
    });

    // Apply new theme class
    body.classList.add(theme.className);

    // Update theme icon if element exists
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.textContent = theme.icon;
    }

    // Trigger theme-specific effects (if the functions exist in global scope)
    if (typeof window !== 'undefined') {
      const globalThis = window as any;
      
      // Remove existing overlays
      if (globalThis.removeThemeOverlays) {
        globalThis.removeThemeOverlays();
      }

      // Apply theme-specific effects
      switch (themeId) {
        case 'goth':
          if (globalThis.createDeepGothOverlays) globalThis.createDeepGothOverlays();
          break;
        case 'poltergeist':
          if (globalThis.createPoltergeistEffects) globalThis.createPoltergeistEffects();
          break;
        case 'retroneon':
          if (globalThis.createRetroNeonEffects) globalThis.createRetroNeonEffects();
          break;
        case 'digitalvoid':
          if (globalThis.createDigitalVoidEffects) globalThis.createDigitalVoidEffects();
          break;
        case 'hellokitty':
          if (globalThis.createHelloKittyEffects) globalThis.createHelloKittyEffects();
          break;
        case 'chill':
          if (globalThis.createChillEffects) globalThis.createChillEffects();
          break;
        case 'chaos':
          if (globalThis.createChaosEffects) globalThis.createChaosEffects();
          break;
        case 'pixelquest':
          if (globalThis.createPixelQuestEffects) globalThis.createPixelQuestEffects();
          break;
      }

      // Apply theme randomization if available
      if (globalThis.randomizeTheme) {
        globalThis.randomizeTheme();
      }
    }
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Subscribe to theme state changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current theme state
   */
  getState(): ThemeState {
    return { ...this.state };
  }

  /**
   * Set active theme
   */
  setTheme(themeId: string): boolean {
    if (!this.canUseTheme(themeId)) {
      return false;
    }

    this.state.currentTheme = themeId;
    this.applyTheme(themeId);
    this.saveState();
    this.notifyListeners();
    return true;
  }

  /**
   * Check if a theme can be used
   */
  canUseTheme(themeId: string): boolean {
    const theme = getThemeById(themeId);
    if (!theme) return false;

    // Free themes are always available
    if (theme.free) return true;

    // Premium themes: check individual unlock OR legacy premium access
    if (theme.premium) {
      return this.state.purchasedThemes.includes(themeId) || this.state.hasPremiumAccess;
    }

    return false;
  }

  /**
   * Check if a theme is unlocked
   */
  isThemeUnlocked(themeId: string): boolean {
    return this.canUseTheme(themeId);
  }

  /**
   * Get theme unlock status
   */
  getThemeUnlockStatus(themeId: string): ThemeUnlockStatus {
    const theme = getThemeById(themeId);
    if (!theme) return 'locked';

    if (theme.free) return 'free';
    if (this.canUseTheme(themeId)) return 'unlocked';
    return 'locked';
  }

  /**
   * Purchase/unlock a premium theme
   */
  unlockTheme(themeId: string): boolean {
    const theme = getThemeById(themeId);
    if (!theme || !theme.premium) return false;

    if (!this.state.purchasedThemes.includes(themeId)) {
      this.state.purchasedThemes.push(themeId);
      this.saveState();
      this.notifyListeners();
      return true;
    }

    return false; // Already unlocked
  }

  /**
   * Get available themes (free + unlocked premium)
   */
  getAvailableThemes(): Theme[] {
    return themes.filter(theme => this.canUseTheme(theme.id));
  }

  /**
   * Get locked premium themes
   */
  getLockedThemes(): Theme[] {
    return themes.filter(theme => theme.premium && !this.canUseTheme(theme.id));
  }

  /**
   * Get all themes
   */
  getAllThemes(): Theme[] {
    return [...themes];
  }

  /**
   * Get themes by category
   */
  getFreeThemes(): Theme[] {
    return themes.filter(theme => theme.free);
  }

  getPremiumThemes(): Theme[] {
    return themes.filter(theme => theme.premium);
  }
}

// Create singleton instance
const themeManager = new ThemeManager();

// Export hook-like interface
export function useTheme() {
  const state = themeManager.getState();

  return {
    // State
    currentTheme: state.currentTheme,
    purchasedThemes: state.purchasedThemes,
    hasPremiumAccess: state.hasPremiumAccess,

    // Actions
    setTheme: (themeId: string) => themeManager.setTheme(themeId),
    canUseTheme: (themeId: string) => themeManager.canUseTheme(themeId),
    isThemeUnlocked: (themeId: string) => themeManager.isThemeUnlocked(themeId),
    unlockTheme: (themeId: string) => themeManager.unlockTheme(themeId),
    getThemeUnlockStatus: (themeId: string) => themeManager.getThemeUnlockStatus(themeId),

    // Getters
    getAvailableThemes: () => themeManager.getAvailableThemes(),
    getLockedThemes: () => themeManager.getLockedThemes(),
    getAllThemes: () => themeManager.getAllThemes(),
    getFreeThemes: () => themeManager.getFreeThemes(),
    getPremiumThemes: () => themeManager.getPremiumThemes(),

    // Subscription
    subscribe: (listener: () => void) => themeManager.subscribe(listener)
  };
}

// Export the manager instance for direct access if needed
export default themeManager;
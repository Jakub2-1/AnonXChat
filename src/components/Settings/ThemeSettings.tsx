/**
 * Enhanced Theme Settings Component for AnonXChat
 * Provides improved theme selection with visual indicators and purchase options
 */

import { Theme, ThemeUnlockStatus } from '../../types/theme';
import { useTheme } from '../../hooks/useTheme';
import { VIRTUAL_CURRENCY } from '../../config/themes';

class ThemeSettings {
  private themeManager: ReturnType<typeof useTheme>;
  private modal: HTMLElement | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.themeManager = useTheme();
    this.init();
  }

  /**
   * Initialize the theme settings component
   */
  private init(): void {
    this.createModal();
    this.bindEvents();
    
    // Subscribe to theme changes
    this.unsubscribe = this.themeManager.subscribe(() => {
      this.updateModal();
    });
  }

  /**
   * Create the enhanced theme selector modal
   */
  private createModal(): void {
    // Remove existing modal if it exists
    const existingModal = document.getElementById('enhancedThemeSelectorModal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'enhancedThemeSelectorModal';
    modal.className = 'theme-selector-modal enhanced-theme-modal';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="theme-selector-content enhanced-theme-content">
        <div class="theme-selector-header">
          <h3 class="theme-selector-title">Choose Theme</h3>
          <button class="theme-selector-close enhanced-close-btn" id="enhancedThemeSelectorClose">×</button>
        </div>
        
        <div class="theme-section enhanced-free-section">
          <h4 class="theme-section-title">
            <span class="status-indicator free-indicator">✅</span>
            Free Themes
          </h4>
          <div class="theme-grid enhanced-theme-grid" id="enhancedFreeThemesGrid">
            <!-- Free themes will be populated by JavaScript -->
          </div>
        </div>
        
        <div class="theme-section enhanced-unlocked-section" id="enhancedUnlockedSection" style="display: none;">
          <h4 class="theme-section-title">
            <span class="status-indicator unlocked-indicator">🔓</span>
            Unlocked Themes
          </h4>
          <div class="theme-grid enhanced-theme-grid" id="enhancedUnlockedThemesGrid">
            <!-- Unlocked premium themes will be populated by JavaScript -->
          </div>
        </div>
        
        <div class="theme-section enhanced-premium-section">
          <h4 class="theme-section-title">
            <span class="status-indicator locked-indicator">🔒</span>
            Premium Themes
            <span class="premium-badge enhanced-premium-badge">💎</span>
          </h4>
          <div class="theme-grid enhanced-theme-grid" id="enhancedPremiumThemesGrid">
            <!-- Premium themes will be populated by JavaScript -->
          </div>
          <div class="premium-info enhanced-premium-info">
            <p class="premium-description">
              Unlock premium themes individually with ${VIRTUAL_CURRENCY}!
            </p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;
    this.updateModal();
  }

  /**
   * Bind event listeners
   */
  private bindEvents(): void {
    if (!this.modal) return;

    // Close button
    const closeBtn = this.modal.querySelector('#enhancedThemeSelectorClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Click outside to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.style.display === 'flex') {
        this.hide();
      }
    });
  }

  /**
   * Update modal content with current theme data
   */
  private updateModal(): void {
    if (!this.modal) return;

    const freeGrid = this.modal.querySelector('#enhancedFreeThemesGrid');
    const unlockedGrid = this.modal.querySelector('#enhancedUnlockedThemesGrid');
    const premiumGrid = this.modal.querySelector('#enhancedPremiumThemesGrid');
    const unlockedSection = this.modal.querySelector('#enhancedUnlockedSection');

    if (!freeGrid || !unlockedGrid || !premiumGrid || !unlockedSection) return;

    // Clear existing content
    freeGrid.innerHTML = '';
    unlockedGrid.innerHTML = '';
    premiumGrid.innerHTML = '';

    const freeThemes = this.themeManager.getFreeThemes();
    const premiumThemes = this.themeManager.getPremiumThemes();
    const unlockedPremiumThemes = premiumThemes.filter(theme => 
      this.themeManager.isThemeUnlocked(theme.id)
    );
    const lockedPremiumThemes = premiumThemes.filter(theme => 
      !this.themeManager.isThemeUnlocked(theme.id)
    );

    // Populate free themes
    freeThemes.forEach(theme => {
      const themeItem = this.createThemeItem(theme, 'free');
      freeGrid.appendChild(themeItem);
    });

    // Populate unlocked premium themes
    if (unlockedPremiumThemes.length > 0) {
      unlockedSection.style.display = 'block';
      unlockedPremiumThemes.forEach(theme => {
        const themeItem = this.createThemeItem(theme, 'unlocked');
        unlockedGrid.appendChild(themeItem);
      });
    } else {
      unlockedSection.style.display = 'none';
    }

    // Populate locked premium themes
    lockedPremiumThemes.forEach(theme => {
      const themeItem = this.createThemeItem(theme, 'locked');
      premiumGrid.appendChild(themeItem);
    });
  }

  /**
   * Create a theme item element
   */
  private createThemeItem(theme: Theme, status: ThemeUnlockStatus): HTMLElement {
    const item = document.createElement('div');
    const isActive = this.themeManager.currentTheme === theme.id;
    const canUse = status !== 'locked';

    item.className = `theme-item enhanced-theme-item ${isActive ? 'active' : ''} ${!canUse ? 'locked' : ''} ${status}-theme`;

    const statusIcon = this.getStatusIcon(status);
    const priceDisplay = theme.price && status === 'locked' ? `<div class="theme-price">${theme.price} ${VIRTUAL_CURRENCY}</div>` : '';

    item.innerHTML = `
      <div class="theme-preview" style="background-color: ${theme.preview || '#ccc'}">
        <span class="theme-icon">${theme.icon}</span>
        <div class="theme-status-indicator">${statusIcon}</div>
      </div>
      <div class="theme-info">
        <div class="theme-name">${theme.name}</div>
        <div class="theme-description">${theme.description}</div>
        ${priceDisplay}
        ${status === 'locked' ? `
          <button class="theme-purchase-btn" data-theme-id="${theme.id}">
            🛒 Unlock for ${theme.price} ${VIRTUAL_CURRENCY}
          </button>
        ` : ''}
      </div>
      ${!canUse ? `<div class="theme-lock-overlay"><span class="theme-lock-icon">🔒</span></div>` : ''}
    `;

    // Add click handlers
    if (canUse) {
      item.addEventListener('click', (e) => {
        if (!(e.target as HTMLElement).closest('.theme-purchase-btn')) {
          this.selectTheme(theme.id);
        }
      });
    }

    // Add purchase button handler
    const purchaseBtn = item.querySelector('.theme-purchase-btn') as HTMLButtonElement;
    if (purchaseBtn) {
      purchaseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.purchaseTheme(theme.id);
      });
    }

    return item;
  }

  /**
   * Get status icon for theme unlock status
   */
  private getStatusIcon(status: ThemeUnlockStatus): string {
    switch (status) {
      case 'free': return '✅';
      case 'locked': return '🔒';
      case 'unlocked': return '🔓';
      default: return '';
    }
  }

  /**
   * Select and apply a theme
   */
  private selectTheme(themeId: string): void {
    if (this.themeManager.setTheme(themeId)) {
      this.updateModal();
      this.showNotification(`Theme "${this.getThemeName(themeId)}" applied!`, 'success');
    } else {
      this.showNotification('This theme is locked. Purchase it first!', 'error');
    }
  }

  /**
   * Purchase a premium theme
   */
  private purchaseTheme(themeId: string): void {
    const theme = this.themeManager.getAllThemes().find(t => t.id === themeId);
    if (!theme) return;

    // Show purchase confirmation
    const confirmed = confirm(
      `Purchase "${theme.name}" theme for ${theme.price} ${VIRTUAL_CURRENCY}?\n\n` +
      `This is a mock purchase for demonstration purposes.`
    );

    if (confirmed) {
      if (this.themeManager.unlockTheme(themeId)) {
        this.updateModal();
        this.showNotification(`🎉 "${theme.name}" theme unlocked successfully!`, 'success');
        
        // Optionally apply the theme immediately
        const applyNow = confirm(`Would you like to apply the "${theme.name}" theme now?`);
        if (applyNow) {
          this.selectTheme(themeId);
        }
      } else {
        this.showNotification('Theme is already unlocked!', 'info');
      }
    }
  }

  /**
   * Get theme name by ID
   */
  private getThemeName(themeId: string): string {
    const theme = this.themeManager.getAllThemes().find(t => t.id === themeId);
    return theme?.name || 'Unknown Theme';
  }

  /**
   * Show notification message
   */
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Use existing notification system if available
    if (typeof (window as any).showNotif === 'function') {
      (window as any).showNotif(message, false);
    } else {
      // Fallback to alert
      alert(message);
    }
  }

  /**
   * Show the theme selector modal
   */
  show(): void {
    if (!this.modal) return;

    this.updateModal();
    this.modal.style.display = 'flex';
    this.modal.style.opacity = '0';
    setTimeout(() => {
      if (this.modal) {
        this.modal.style.opacity = '1';
      }
    }, 10);
  }

  /**
   * Hide the theme selector modal
   */
  hide(): void {
    if (!this.modal) return;

    this.modal.style.opacity = '0';
    setTimeout(() => {
      if (this.modal) {
        this.modal.style.display = 'none';
      }
    }, 300);
  }

  /**
   * Destroy the component and clean up
   */
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.modal) {
      this.modal.remove();
    }
  }
}

// Export for use in other modules
export default ThemeSettings;

// Make available globally for integration with existing code
if (typeof window !== 'undefined') {
  (window as any).EnhancedThemeSettings = ThemeSettings;
}
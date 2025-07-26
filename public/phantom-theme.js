/*
 * Phantom Theme JavaScript Module
 * Handles Phantom theme-specific functionality including:
 * - Dissolving text effect on theme activation
 * - Boost Phantom effect toggle
 * - Fog particle management
 * - Theme-specific interactions
 */

class PhantomTheme {
  constructor() {
    this.isActive = false;
    this.isBoostActive = false;
    this.fogParticles = [];
    this.dissolvingTextTimeout = null;
    this.boostToggleButton = null;
    
    // Bind methods
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.toggleBoost = this.toggleBoost.bind(this);
    this.showDissolvingText = this.showDissolvingText.bind(this);
    this.createFogOverlay = this.createFogOverlay.bind(this);
    this.createBoostControls = this.createBoostControls.bind(this);
  }

  /**
   * Activate the Phantom theme
   */
  activate() {
    if (this.isActive) return;
    
    console.log('Activating Phantom theme...');
    this.isActive = true;
    
    // Add theme class to body
    document.body.classList.add('theme-phantom');
    
    // Show dissolving text effect
    this.showDissolvingText();
    
    // Create fog overlay
    this.createFogOverlay();
    
    // Create boost controls if in demo mode
    if (this.isDemoMode()) {
      this.createBoostControls();
    }
    
    // Store theme preference
    localStorage.setItem('selectedTheme', 'phantom');
    
    console.log('Phantom theme activated successfully');
  }

  /**
   * Deactivate the Phantom theme
   */
  deactivate() {
    if (!this.isActive) return;
    
    console.log('Deactivating Phantom theme...');
    this.isActive = false;
    
    // Remove theme class from body
    document.body.classList.remove('theme-phantom');
    
    // Remove boost effect
    this.deactivateBoost();
    
    // Clean up fog overlay
    this.removeFogOverlay();
    
    // Clean up dissolving text
    this.removeDissolvingText();
    
    // Remove boost controls
    this.removeBoostControls();
    
    console.log('Phantom theme deactivated');
  }

  /**
   * Show the dissolving text effect "Entering Phantom Mode…"
   */
  showDissolvingText() {
    // Remove any existing dissolving text
    this.removeDissolvingText();
    
    // Create dissolving text element
    const dissolvingText = document.createElement('div');
    dissolvingText.className = 'phantom-entering-text';
    dissolvingText.textContent = 'Entering Phantom Mode…';
    dissolvingText.setAttribute('aria-live', 'polite');
    dissolvingText.setAttribute('role', 'status');
    
    // Add to DOM
    document.body.appendChild(dissolvingText);
    
    // Remove after animation completes (3 seconds)
    this.dissolvingTextTimeout = setTimeout(() => {
      this.removeDissolvingText();
    }, 3000);
  }

  /**
   * Remove dissolving text element
   */
  removeDissolvingText() {
    if (this.dissolvingTextTimeout) {
      clearTimeout(this.dissolvingTextTimeout);
      this.dissolvingTextTimeout = null;
    }
    
    const existingText = document.querySelector('.phantom-entering-text');
    if (existingText) {
      existingText.remove();
    }
  }

  /**
   * Create fog/smoke overlay with animated particles
   */
  createFogOverlay() {
    // Remove any existing fog overlay
    this.removeFogOverlay();
    
    // Create fog overlay container
    const fogOverlay = document.createElement('div');
    fogOverlay.className = 'phantom-fog-overlay';
    fogOverlay.setAttribute('aria-hidden', 'true');
    
    // Create multiple fog particles
    for (let i = 0; i < 4; i++) {
      const particle = document.createElement('div');
      particle.className = 'phantom-fog-particle';
      fogOverlay.appendChild(particle);
    }
    
    // Add to DOM
    document.body.appendChild(fogOverlay);
    
    console.log('Fog overlay created with 4 particles');
  }

  /**
   * Remove fog overlay
   */
  removeFogOverlay() {
    const existingOverlay = document.querySelector('.phantom-fog-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
  }

  /**
   * Toggle Boost Phantom effect
   */
  toggleBoost() {
    if (this.isBoostActive) {
      this.deactivateBoost();
    } else {
      this.activateBoost();
    }
  }

  /**
   * Activate Boost Phantom effect
   */
  activateBoost() {
    if (!this.isActive) return;
    
    this.isBoostActive = true;
    
    // Add boost class to main container
    const mainContainer = document.querySelector('.centered') || 
                         document.querySelector('.chat-container') || 
                         document.body;
    
    mainContainer.classList.add('phantom-boost-active');
    
    // Update boost button if it exists
    if (this.boostToggleButton) {
      this.boostToggleButton.classList.add('active');
      this.boostToggleButton.textContent = 'Boost Active ⚡';
    }
    
    // Announce to screen readers
    this.announceToScreenReader('Phantom boost activated');
    
    console.log('Phantom boost effect activated');
  }

  /**
   * Deactivate Boost Phantom effect
   */
  deactivateBoost() {
    this.isBoostActive = false;
    
    // Remove boost class from all elements
    const boostedElements = document.querySelectorAll('.phantom-boost-active');
    boostedElements.forEach(element => {
      element.classList.remove('phantom-boost-active');
    });
    
    // Update boost button if it exists
    if (this.boostToggleButton) {
      this.boostToggleButton.classList.remove('active');
      this.boostToggleButton.textContent = 'Activate Boost 🚀';
    }
    
    // Announce to screen readers
    this.announceToScreenReader('Phantom boost deactivated');
    
    console.log('Phantom boost effect deactivated');
  }

  /**
   * Create boost controls for demo mode
   */
  createBoostControls() {
    // Remove existing controls
    this.removeBoostControls();
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'phantom-demo-controls';
    
    // Create boost toggle button
    this.boostToggleButton = document.createElement('button');
    this.boostToggleButton.className = 'phantom-boost-toggle';
    this.boostToggleButton.textContent = 'Activate Boost 🚀';
    this.boostToggleButton.setAttribute('type', 'button');
    this.boostToggleButton.setAttribute('aria-label', 'Toggle Phantom boost effect');
    this.boostToggleButton.addEventListener('click', this.toggleBoost);
    
    // Add button to controls
    controlsContainer.appendChild(this.boostToggleButton);
    
    // Add controls to DOM
    document.body.appendChild(controlsContainer);
    
    console.log('Boost controls created for demo mode');
  }

  /**
   * Remove boost controls
   */
  removeBoostControls() {
    const existingControls = document.querySelector('.phantom-demo-controls');
    if (existingControls) {
      existingControls.remove();
    }
    this.boostToggleButton = null;
  }

  /**
   * Check if we're in demo mode
   */
  isDemoMode() {
    // Check if we're on a demo page or if demo mode is enabled
    return window.location.pathname.includes('phantom-demo') || 
           window.location.search.includes('demo=true') ||
           localStorage.getItem('phantom_demo_mode') === 'true';
  }

  /**
   * Announce text to screen readers
   */
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only'; // Screen reader only
    announcement.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }

  /**
   * Handle theme switching integration
   */
  static integratewithThemeSystem() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        PhantomTheme.integratewithThemeSystem();
      });
      return;
    }

    const phantomTheme = new PhantomTheme();
    window.phantomTheme = phantomTheme; // Make globally accessible
    
    // Listen for theme changes
    const originalChangeTheme = window.changeTheme;
    if (typeof originalChangeTheme === 'function') {
      window.changeTheme = function(themeName) {
        // Deactivate phantom theme if switching away
        if (phantomTheme.isActive && themeName !== 'phantom') {
          phantomTheme.deactivate();
        }
        
        // Call original function
        const result = originalChangeTheme.apply(this, arguments);
        
        // Activate phantom theme if switching to it
        if (themeName === 'phantom') {
          phantomTheme.activate();
        }
        
        return result;
      };
    }
    
    // Check if phantom theme should be activated on load
    const currentTheme = localStorage.getItem('selectedTheme');
    if (currentTheme === 'phantom') {
      phantomTheme.activate();
    }
    
    console.log('Phantom theme integrated with theme system');
  }

  /**
   * Enhance typing indicator for phantom theme
   */
  static enhanceTypingIndicator() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'style' && 
            mutation.target.id === 'typingIndicator') {
          
          const indicator = mutation.target;
          const isVisible = indicator.style.display !== 'none';
          
          if (isVisible && document.body.classList.contains('theme-phantom')) {
            // Ensure phantom styling is applied
            indicator.classList.add('phantom-enhanced');
          }
        }
      });
    });
    
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      observer.observe(typingIndicator, { 
        attributes: true, 
        attributeFilter: ['style'] 
      });
    }
  }

  /**
   * Initialize phantom theme system
   */
  static init() {
    PhantomTheme.integratewithThemeSystem();
    PhantomTheme.enhanceTypingIndicator();
    
    console.log('Phantom Theme system initialized');
  }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  PhantomTheme.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhantomTheme;
}
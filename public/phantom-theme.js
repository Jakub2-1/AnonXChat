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
    this.ghostInterval = null;
    this.ghostElements = [];
    this.benchShadowInterval = null;
    this.benchShadowElements = [];
    this.jumpscareButton = null;
    this.isJumpscareActive = false;
    
    // Bind methods
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.toggleBoost = this.toggleBoost.bind(this);
    this.showDissolvingText = this.showDissolvingText.bind(this);
    this.createFogOverlay = this.createFogOverlay.bind(this);
    this.createBoostControls = this.createBoostControls.bind(this);
    this.createGhostCharacter = this.createGhostCharacter.bind(this);
    this.startGhostAnimation = this.startGhostAnimation.bind(this);
    this.stopGhostAnimation = this.stopGhostAnimation.bind(this);
    this.cleanupGhostElements = this.cleanupGhostElements.bind(this);
    this.startBenchShadowAnimation = this.startBenchShadowAnimation.bind(this);
    this.stopBenchShadowAnimation = this.stopBenchShadowAnimation.bind(this);
    this.createBenchShadow = this.createBenchShadow.bind(this);
    this.cleanupBenchShadows = this.cleanupBenchShadows.bind(this);
    this.createJumpscareButton = this.createJumpscareButton.bind(this);
    this.triggerJumpscare = this.triggerJumpscare.bind(this);
    this.showJumpscareEffect = this.showJumpscareEffect.bind(this);
    this.hideJumpscareEffect = this.hideJumpscareEffect.bind(this);
    this.hasPhantomPremium = this.hasPhantomPremium.bind(this);
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
    
    // Start ghost character animation
    this.startGhostAnimation();
    
    // Start bench shadow animation
    this.startBenchShadowAnimation();
    
    // Create jumpscare button for premium users
    if (this.hasPhantomPremium()) {
      this.createJumpscareButton();
    }
    
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
    
    // Stop ghost animation
    this.stopGhostAnimation();
    
    // Stop bench shadow animation
    this.stopBenchShadowAnimation();
    
    // Clean up dissolving text
    this.removeDissolvingText();
    
    // Remove boost controls
    this.removeBoostControls();
    
    // Remove jumpscare button
    this.removeJumpscareButton();
    
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
   * Start bench shadow animation with random intervals
   */
  startBenchShadowAnimation() {
    if (this.benchShadowInterval) {
      clearInterval(this.benchShadowInterval);
    }

    // Create first shadow after a short delay
    setTimeout(() => {
      if (this.isActive) {
        this.createBenchShadow();
      }
    }, 5000);

    // Set up recurring shadow appearances
    const scheduleNextShadow = () => {
      if (!this.isActive) return;
      
      // Random interval between 20-60 seconds
      const interval = 20000 + Math.random() * 40000;
      
      this.benchShadowInterval = setTimeout(() => {
        if (this.isActive) {
          this.createBenchShadow();
          scheduleNextShadow();
        }
      }, interval);
    };

    scheduleNextShadow();
    console.log('Bench shadow animation started');
  }

  /**
   * Stop bench shadow animation
   */
  stopBenchShadowAnimation() {
    if (this.benchShadowInterval) {
      clearTimeout(this.benchShadowInterval);
      this.benchShadowInterval = null;
    }
    this.cleanupBenchShadows();
    console.log('Bench shadow animation stopped');
  }

  /**
   * Create and animate a bench shadow figure
   */
  createBenchShadow() {
    // Clean up any existing shadows first
    this.cleanupBenchShadows();

    const shadow = document.createElement('div');
    shadow.className = 'phantom-bench-shadow';
    
    // Load shadow figure SVG
    shadow.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadowBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
            <feOffset dx="2" dy="2" result="offset"/>
          </filter>
        </defs>
        
        <g fill="#1a1a1a" opacity="0.7" filter="url(#shadowBlur)">
          <ellipse cx="40" cy="20" rx="12" ry="15" />
          <rect x="25" y="35" width="30" height="45" rx="5" />
          <ellipse cx="15" cy="55" rx="8" ry="20" transform="rotate(-20 15 55)" />
          <ellipse cx="65" cy="55" rx="8" ry="20" transform="rotate(20 65 55)" />
          <rect x="20" y="75" width="15" height="30" rx="7" transform="rotate(5 27 90)" />
          <rect x="45" y="75" width="15" height="30" rx="7" transform="rotate(-5 52 90)" />
          <rect x="22" y="100" width="10" height="18" rx="5" />
          <rect x="48" y="100" width="10" height="18" rx="5" />
        </g>
      </svg>
    `;
    
    // Set random horizontal position on bench area (roughly 30% to 70% of screen width)
    const randomX = 30 + Math.random() * 40;
    
    shadow.style.left = `${randomX}%`;
    
    // Add to DOM and track
    document.body.appendChild(shadow);
    this.benchShadowElements.push(shadow);
    
    // Trigger animation
    setTimeout(() => {
      shadow.classList.add('appearing');
    }, 100);
    
    // Remove after animation completes (5 seconds)
    setTimeout(() => {
      this.removeBenchShadowElement(shadow);
    }, 5500);
    
    console.log('Bench shadow created at position', randomX + '%');
  }

  /**
   * Remove a specific bench shadow element
   */
  removeBenchShadowElement(shadow) {
    if (shadow && shadow.parentNode) {
      shadow.parentNode.removeChild(shadow);
    }
    this.benchShadowElements = this.benchShadowElements.filter(el => el !== shadow);
  }

  /**
   * Clean up all bench shadow elements
   */
  cleanupBenchShadows() {
    this.benchShadowElements.forEach(shadow => {
      if (shadow && shadow.parentNode) {
        shadow.parentNode.removeChild(shadow);
      }
    });
    this.benchShadowElements = [];
  }
  startGhostAnimation() {
    if (this.ghostInterval) {
      clearInterval(this.ghostInterval);
    }

    // Create first ghost after a short delay
    setTimeout(() => {
      if (this.isActive) {
        this.createGhostCharacter();
      }
    }, 2000);

    // Set up recurring ghost appearances
    const scheduleNextGhost = () => {
      if (!this.isActive) return;
      
      // Random interval between 6-15 seconds
      const interval = 6000 + Math.random() * 9000;
      
      this.ghostInterval = setTimeout(() => {
        if (this.isActive) {
          this.createGhostCharacter();
          scheduleNextGhost();
        }
      }, interval);
    };

    scheduleNextGhost();
    console.log('Ghost character animation started');
  }

  /**
   * Stop ghost character animation
   */
  stopGhostAnimation() {
    if (this.ghostInterval) {
      clearTimeout(this.ghostInterval);
      this.ghostInterval = null;
    }
    this.cleanupGhostElements();
    console.log('Ghost character animation stopped');
  }

  /**
   * Create and animate a ghost character
   */
  createGhostCharacter() {
    // Clean up any existing ghost elements first
    this.cleanupGhostElements();

    const ghost = document.createElement('div');
    
    // Random choice between emoji and SVG
    const useEmoji = Math.random() > 0.5;
    
    if (useEmoji) {
      ghost.className = 'phantom-ghost-character';
      ghost.textContent = '👻';
    } else {
      ghost.className = 'phantom-ghost-svg';
      ghost.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 100%; height: 100%;">
          <path d="M12 2C8.14 2 5 5.14 5 9v8l2-2 2 2 3-3 3 3 2-2 2 2V9c0-3.86-3.14-7-7-7zm-1 12.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm2 0c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z"/>
        </svg>
      `;
    }
    
    // Set random horizontal position (10% to 90% of screen width)
    const randomX = 10 + Math.random() * 80;
    
    // Set vertical position (30% to 70% of screen height)
    const randomY = 30 + Math.random() * 40;
    
    ghost.style.left = `${randomX}%`;
    ghost.style.top = `${randomY}%`;
    ghost.style.color = Math.random() > 0.5 ? 'var(--phantom-purple)' : 'var(--phantom-turquoise)';
    
    // Add to DOM and track
    document.body.appendChild(ghost);
    this.ghostElements.push(ghost);
    
    // Trigger animation
    setTimeout(() => {
      ghost.classList.add('appearing');
    }, 100);
    
    // Remove after animation completes (4 seconds)
    setTimeout(() => {
      this.removeGhostElement(ghost);
    }, 4500);
    
    console.log('Ghost character created at position', randomX + '%', randomY + '%');
  }

  /**
   * Remove a specific ghost element
   */
  removeGhostElement(ghost) {
    if (ghost && ghost.parentNode) {
      ghost.parentNode.removeChild(ghost);
    }
    this.ghostElements = this.ghostElements.filter(el => el !== ghost);
  }

  /**
   * Clean up all ghost elements
   */
  cleanupGhostElements() {
    this.ghostElements.forEach(ghost => {
      if (ghost && ghost.parentNode) {
        ghost.parentNode.removeChild(ghost);
      }
    });
    this.ghostElements = [];
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
   * Check if user has Phantom Premium access
   */
  hasPhantomPremium() {
    // Check for premium access or development key
    const hasPremium = localStorage.getItem('anonx_premium') === 'true';
    const hasDevKey = localStorage.getItem('devKey') === 'MY_SECRET_KEY';
    const hasPhantomUnlock = JSON.parse(localStorage.getItem('premiumThemesUnlocked') || '[]').includes('phantom');
    
    return hasPremium || hasDevKey || hasPhantomUnlock;
  }

  /**
   * Create jumpscare button for premium users
   */
  createJumpscareButton() {
    if (!this.hasPhantomPremium()) return;
    
    // Remove existing button
    this.removeJumpscareButton();
    
    // Create jumpscare button
    this.jumpscareButton = document.createElement('button');
    this.jumpscareButton.className = 'phantom-jumpscare-btn';
    this.jumpscareButton.textContent = '💀 Jumpscare';
    this.jumpscareButton.setAttribute('type', 'button');
    this.jumpscareButton.setAttribute('title', 'Send jumpscare to your chat partner');
    this.jumpscareButton.setAttribute('aria-label', 'Send jumpscare effect to chat partner');
    
    // Add click handler
    this.jumpscareButton.addEventListener('click', this.triggerJumpscare);
    
    // Add to chat actions area
    const chatActions = document.querySelector('.chat-actions');
    if (chatActions) {
      chatActions.appendChild(this.jumpscareButton);
    }
    
    console.log('Jumpscare button created for premium user');
  }

  /**
   * Remove jumpscare button
   */
  removeJumpscareButton() {
    if (this.jumpscareButton && this.jumpscareButton.parentNode) {
      this.jumpscareButton.parentNode.removeChild(this.jumpscareButton);
    }
    this.jumpscareButton = null;
  }

  /**
   * Trigger jumpscare effect for partner
   */
  triggerJumpscare() {
    if (!this.hasPhantomPremium() || this.isJumpscareActive) return;
    
    // Check if in chat (socket exists and connected)
    if (!window.socket || !window.socket.connected) {
      this.announceToScreenReader('Jumpscare can only be used during active chat');
      return;
    }
    
    // Disable button temporarily
    this.isJumpscareActive = true;
    if (this.jumpscareButton) {
      this.jumpscareButton.disabled = true;
      this.jumpscareButton.textContent = 'Sending...';
    }
    
    // Send jumpscare event to partner
    window.socket.emit('phantom-jumpscare', {
      from: window.anonUserId || 'anonymous'
    });
    
    // Show feedback to sender
    this.announceToScreenReader('Jumpscare sent to partner');
    
    // Re-enable button after cooldown (5 seconds)
    setTimeout(() => {
      this.isJumpscareActive = false;
      if (this.jumpscareButton) {
        this.jumpscareButton.disabled = false;
        this.jumpscareButton.textContent = '💀 Jumpscare';
      }
    }, 5000);
    
    console.log('Jumpscare triggered for partner');
  }

  /**
   * Show jumpscare effect (when receiving from partner)
   */
  showJumpscareEffect() {
    // Create jumpscare overlay
    const overlay = document.createElement('div');
    overlay.className = 'phantom-jumpscare-overlay';
    overlay.id = 'phantom-jumpscare-overlay';
    
    // Create jumpscare figure
    const figure = document.createElement('div');
    figure.className = 'phantom-jumpscare-figure';
    
    overlay.appendChild(figure);
    document.body.appendChild(overlay);
    
    // Play horror sound
    this.playJumpscareSound();
    
    // Trigger animation
    setTimeout(() => {
      overlay.classList.add('active');
    }, 50);
    
    // Hide after 3 seconds
    setTimeout(() => {
      this.hideJumpscareEffect();
    }, 3000);
    
    // Announce to screen readers
    this.announceToScreenReader('Jumpscare effect received from partner');
    
    console.log('Jumpscare effect displayed');
  }

  /**
   * Hide jumpscare effect
   */
  hideJumpscareEffect() {
    const overlay = document.getElementById('phantom-jumpscare-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 500);
    }
  }

  /**
   * Play jumpscare horror sound
   */
  playJumpscareSound() {
    try {
      // Check if sound is enabled
      if (window.soundEnabled === false) return;
      
      const audio = new Audio('sounds/phantom-jumpscare.mp3');
      audio.volume = 0.7; // Not too loud
      audio.play().catch(error => {
        console.warn('Could not play jumpscare sound:', error);
      });
    } catch (error) {
      console.warn('Error playing jumpscare sound:', error);
    }
  }
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
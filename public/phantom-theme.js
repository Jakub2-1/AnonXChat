/*
 * Phantom Theme JavaScript Module
 * Handles Phantom theme-specific functionality including:
 * - Bench background with dark silhouette figure
 * - Jumpscare functionality with Socket.IO integration
 * - Premium user access control
 * - Horror sound effects
 */

class PhantomTheme {
  constructor() {
    this.isActive = false;
    this.hasPremiumAccess = false;
    this.silhouetteInterval = null;
    this.jumpscareButton = null;
    this.currentSilhouette = null;

    this.isBoostActive = false;
    this.fogParticles = [];
    this.dissolvingTextTimeout = null;
    this.boostToggleButton = null;
    this.ghostInterval = null;
    this.ghostElements = [];
    this.benchShadowInterval = null;
    this.benchShadowElements = [];
    this.isJumpscareActive = false;
    
    // Bind methods
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.createJumpscareButton = this.createJumpscareButton.bind(this);
    this.sendJumpscare = this.sendJumpscare.bind(this);
    this.receiveJumpscare = this.receiveJumpscare.bind(this);
    this.createSilhouette = this.createSilhouette.bind(this);
    this.startSilhouetteAnimation = this.startSilhouetteAnimation.bind(this);
    this.stopSilhouetteAnimation = this.stopSilhouetteAnimation.bind(this);
    this.playJumpscareSound = this.playJumpscareSound.bind(this);
    this.checkPremiumAccess = this.checkPremiumAccess.bind(this);
    this.createFogOverlay = this.createFogOverlay.bind(this);
    this.startBenchShadowAnimation = this.startBenchShadowAnimation.bind(this);
    this.stopBenchShadowAnimation = this.stopBenchShadowAnimation.bind(this);
    this.createBenchShadow = this.createBenchShadow.bind(this);
    this.cleanupBenchShadows = this.cleanupBenchShadows.bind(this);
    this.triggerJumpscare = this.triggerJumpscare.bind(this);
    this.showJumpscareEffect = this.showJumpscareEffect.bind(this);
    this.hideJumpscareEffect = this.hideJumpscareEffect.bind(this);
    this.hasPhantomPremium = this.hasPhantomPremium.bind(this);
  }

  /**
   * Check if user has premium access to Phantom theme
   */
  checkPremiumAccess() {
    // Check for premium access via multiple methods
    const isPremium = localStorage.getItem('anonx_premium') === 'true';
    const hasDevKey = localStorage.getItem('devKey') === 'MY_SECRET_KEY';
    const hasPhantomTheme = JSON.parse(localStorage.getItem('premiumThemesUnlocked') || '[]').includes('phantom');
    
    this.hasPremiumAccess = isPremium || hasDevKey || hasPhantomTheme;
    return this.hasPremiumAccess;
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
    
    // Check premium access
    this.checkPremiumAccess();
    
    // Start silhouette animation
    this.startSilhouetteAnimation();
    
    // Create jumpscare button if user has premium access
    if (this.hasPremiumAccess) {
      this.createJumpscareButton();
    }

    // Start bench shadow animation
    this.startBenchShadowAnimation();
    
    // Set up Socket.IO listeners for jumpscare
    this.setupSocketListeners();
    
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
    
    // Stop silhouette animation
    this.stopSilhouetteAnimation();
    
    // Remove jumpscare button
    this.removeJumpscareButton();
    
    // Remove any active jumpscare overlay
    this.removeJumpscareOverlay();

    // Stop bench shadow animation
    this.stopBenchShadowAnimation();
    
    console.log('Phantom theme deactivated');
  }

  /**
   * Start silhouette animation with random intervals
   */
  startSilhouetteAnimation() {
    if (this.silhouetteInterval) {
      clearInterval(this.silhouetteInterval);
    }

    // Create first silhouette after a short delay
    setTimeout(() => {
      if (this.isActive) {
        this.createSilhouette();
      }
    }, 3000);

    // Set up recurring silhouette appearances
    const scheduleNextSilhouette = () => {
      if (!this.isActive) return;
      
      // Random interval between 8-20 seconds
      const interval = 8000 + Math.random() * 12000;
      
      this.silhouetteInterval = setTimeout(() => {
        if (this.isActive) {
          this.createSilhouette();
          scheduleNextSilhouette();
        }
      }, interval);
    };

    scheduleNextSilhouette();
    console.log('Silhouette animation started');
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

  /**
   * Stop silhouette animation
   */
  stopSilhouetteAnimation() {
    if (this.silhouetteInterval) {
      clearTimeout(this.silhouetteInterval);
      this.silhouetteInterval = null;
    }
    this.removeSilhouette();
    console.log('Silhouette animation stopped');
  }

  /**
   * Create and animate a dark silhouette figure
   */
  createSilhouette() {
    // Remove any existing silhouette first
    this.removeSilhouette();

    const silhouette = document.createElement('div');
    silhouette.className = 'phantom-silhouette';
    
    // Add to DOM and track
    document.body.appendChild(silhouette);
    this.currentSilhouette = silhouette;
    
    // Remove after animation completes (4 seconds)
    setTimeout(() => {
      this.removeSilhouette();
    }, 4000);
    
    console.log('Dark silhouette created');
  }

  /**
   * Remove the current silhouette element
   */
  removeSilhouette() {
    if (this.currentSilhouette && this.currentSilhouette.parentNode) {
      this.currentSilhouette.parentNode.removeChild(this.currentSilhouette);
      this.currentSilhouette = null;
    }
  }

  /**
   * Create jumpscare button for premium users
   */
  createJumpscareButton() {
    // Remove existing button
    this.removeJumpscareButton();
    
    // Create jumpscare button
    this.jumpscareButton = document.createElement('button');
    this.jumpscareButton.className = 'phantom-jumpscare-button';
    this.jumpscareButton.textContent = '👻 Jumpscare';
    this.jumpscareButton.setAttribute('type', 'button');
    this.jumpscareButton.setAttribute('aria-label', 'Send jumpscare to partner');
    this.jumpscareButton.addEventListener('click', this.sendJumpscare);
    
    // Show button
    this.jumpscareButton.style.display = 'block';
    
    // Add to DOM
    document.body.appendChild(this.jumpscareButton);
    
    console.log('Jumpscare button created for premium user');
  }

  /**
   * Remove jumpscare button
   */
  removeJumpscareButton() {
    if (this.jumpscareButton) {
      this.jumpscareButton.remove();
      this.jumpscareButton = null;
    }
  }

  /**
   * Send jumpscare to partner via Socket.IO
   */
  sendJumpscare() {
    if (!this.hasPremiumAccess) {
      console.log('Jumpscare blocked: User does not have premium access');
      return;
    }

    if (!window.socket) {
      console.log('Jumpscare blocked: No socket connection');
      return;
    }

    // Emit jumpscare event to partner
    window.socket.emit('jumpscare', {
      type: 'phantom',
      timestamp: Date.now()
    });

    // Disable button temporarily to prevent spam
    if (this.jumpscareButton) {
      this.jumpscareButton.disabled = true;
      this.jumpscareButton.textContent = '👻 Sent!';
      
      setTimeout(() => {
        if (this.jumpscareButton) {
          this.jumpscareButton.disabled = false;
          this.jumpscareButton.textContent = '👻 Jumpscare';
        }
      }, 5000);
    }

    console.log('Jumpscare sent to partner');
  }

  /**
   * Receive and display jumpscare animation
   */
  receiveJumpscare(data) {
    console.log('Jumpscare received:', data);
    
    // Create jumpscare overlay
    const overlay = document.createElement('div');
    overlay.className = 'phantom-jumpscare-overlay';
    
    // Create horror figure
    const figure = document.createElement('div');
    figure.className = 'phantom-jumpscare-figure';
    
    overlay.appendChild(figure);
    document.body.appendChild(overlay);
    
    // Play sound effect
    this.playJumpscareSound();
    
    // Remove overlay after 2 seconds
    setTimeout(() => {
      this.removeJumpscareOverlay();
    }, 2000);
    
    console.log('Jumpscare animation displayed');
  }

  /**
   * Remove jumpscare overlay
   */
  removeJumpscareOverlay() {
    const overlay = document.querySelector('.phantom-jumpscare-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Play jumpscare sound effect
   */
  playJumpscareSound() {
    try {
      // Randomly choose between whisper and scream
      const soundFile = Math.random() > 0.5 ? 'sounds/whisper.mp3' : 'sounds/scream.mp3';
      
      const audio = new Audio(soundFile);
      audio.volume = 0.7;
      audio.play().catch(error => {
        console.log('Could not play jumpscare sound:', error);
      });
    } catch (error) {
      console.log('Audio not available:', error);
    }
  }

  /**
   * Set up Socket.IO listeners for jumpscare events
   */
  setupSocketListeners() {
    if (!window.socket) return;
    
    // Listen for incoming jumpscare events
    window.socket.on('jumpscare', (data) => {
      this.receiveJumpscare(data);
    });
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

  /**
   * Announce messages to screen readers for accessibility
   */
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
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
   * Initialize phantom theme system
   */
  static init() {
    PhantomTheme.integratewithThemeSystem();
    
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
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
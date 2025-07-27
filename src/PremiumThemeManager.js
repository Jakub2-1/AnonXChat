const PremiumTheme = require('./PremiumTheme');
const fs = require('fs').promises;
const path = require('path');

/**
 * PremiumThemeManager Class - Manages all premium theme operations
 */
class PremiumThemeManager {
  constructor() {
    this.themes = new Map();
    this.userPurchases = new Map(); // userId -> Set of purchased theme_ids
    this.dataFile = path.join(__dirname, '../premium_themes.json');
    this.purchasesFile = path.join(__dirname, '../user_purchases.json');
    this.initialized = false;
  }

  /**
   * Initialize the theme manager with predefined themes
   */
  async initialize() {
    if (this.initialized) return;

    await this.loadThemes();
    await this.loadUserPurchases();
    await this.createPredefinedThemes();
    this.initialized = true;
  }

  /**
   * Load themes from storage
   */
  async loadThemes() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      const themesData = JSON.parse(data);
      
      for (const themeData of themesData) {
        const theme = PremiumTheme.fromJSON(themeData);
        this.themes.set(theme.theme_id, theme);
      }
    } catch (error) {
      // File doesn't exist or is invalid, start with empty themes
      console.log('No existing themes file found, starting fresh');
    }
  }

  /**
   * Save themes to storage
   */
  async saveThemes() {
    try {
      const themesArray = Array.from(this.themes.values()).map(theme => theme.toJSON());
      await fs.writeFile(this.dataFile, JSON.stringify(themesArray, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving themes:', error);
    }
  }

  /**
   * Load user purchases from storage
   */
  async loadUserPurchases() {
    try {
      const data = await fs.readFile(this.purchasesFile, 'utf8');
      const purchasesData = JSON.parse(data);
      
      for (const [userId, purchases] of Object.entries(purchasesData)) {
        this.userPurchases.set(userId, new Set(purchases));
      }
    } catch (error) {
      // File doesn't exist or is invalid, start with empty purchases
      console.log('No existing purchases file found, starting fresh');
    }
  }

  /**
   * Save user purchases to storage
   */
  async saveUserPurchases() {
    try {
      const purchasesObj = {};
      for (const [userId, purchases] of this.userPurchases.entries()) {
        purchasesObj[userId] = Array.from(purchases);
      }
      await fs.writeFile(this.purchasesFile, JSON.stringify(purchasesObj, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving user purchases:', error);
    }
  }

  /**
   * Create predefined premium themes
   */
  async createPredefinedThemes() {
    const predefinedThemes = [
      // Free themes
      {
        theme_id: 'glow',
        name: 'Glow',
        description: 'Bright and cheerful light theme with glowing effects',
        colors: {
          primary: '#2563eb',
          secondary: '#dc2626',
          accent: '#f59e0b',
          background: 'linear-gradient(135deg, #fafbff 0%, #f3f4ff 50%, #fef7d4 100%)',
          text: '#1e293b'
        },
        price: 0,
        is_premium: false,
        icon: '🌟',
        className: 'theme-glow'
      },
      {
        theme_id: 'goth',
        name: 'Goth',
        description: 'Dark gothic atmosphere with mysterious elements',
        colors: {
          primary: '#8b1538',
          secondary: '#4c1d95',
          accent: '#7c2d12',
          background: '#0a0a0a',
          text: '#ffffff'
        },
        price: 0,
        is_premium: false,
        icon: '💀',
        className: 'theme-goth'
      },
      // Premium themes
      {
        theme_id: 'pixelquest',
        name: 'Pixel Quest',
        description: 'Retro 8-bit Gameboy style adventure with nostalgic gaming vibes',
        colors: {
          primary: '#9bb559',
          secondary: '#8bac0f',
          accent: '#306230',
          background: '#0f380f',
          text: '#9bb559'
        },
        price: 100,
        icon: '🎮',
        className: 'theme-pixelquest'
      },
      {
        theme_id: 'poltergeist',
        name: 'Poltergeist',
        description: 'Disturbing supernatural energy with haunting dark aesthetics',
        colors: {
          primary: '#8b0000',
          secondary: '#2f0000',
          accent: '#ff6b6b',
          background: '#000000',
          text: '#ffffff'
        },
        price: 150,
        icon: '👁️‍🗨️',
        className: 'theme-poltergeist'
      },
      {
        theme_id: 'hellokitty',
        name: 'Hello Kitty',
        description: 'Kawaii pink and cute vibes with adorable sparkle effects',
        colors: {
          primary: '#ff69b4',
          secondary: '#ff1493',
          accent: '#ffb6c1',
          background: '#ffeef0',
          text: '#8b008b'
        },
        price: 200,
        icon: '🎀',
        className: 'theme-hellokitty'
      },
      {
        theme_id: 'chill',
        name: 'Chill',
        description: 'Relaxing gradient with floating elements and serene atmosphere',
        colors: {
          primary: '#667eea',
          secondary: '#764ba2',
          accent: '#f093fb',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          text: '#ffffff'
        },
        price: 120,
        icon: '🌸',
        className: 'theme-chill'
      },
      {
        theme_id: 'chaos',
        name: 'Chaos',
        description: 'Wild multicolor madness with dynamic rainbow effects',
        colors: {
          primary: '#ff0080',
          secondary: '#8000ff',
          accent: '#00ff80',
          background: 'linear-gradient(45deg, #ff0080, #8000ff, #00ff80, #ff8000)',
          text: '#ffffff'
        },
        price: 180,
        icon: '💥',
        className: 'theme-chaos'
      },
      {
        theme_id: 'retroneon',
        name: 'Retro Neon',
        description: '80s cyberpunk neon lights with futuristic glow effects',
        colors: {
          primary: '#00ffff',
          secondary: '#ff00ff',
          accent: '#ffff00',
          background: '#000033',
          text: '#00ffff'
        },
        price: 250,
        icon: '🌈',
        className: 'theme-retroneon'
      },
      {
        theme_id: 'digitalvoid',
        name: 'Digital Void',
        description: 'Matrix-like digital darkness with green terminal aesthetics',
        colors: {
          primary: '#00ff41',
          secondary: '#003300',
          accent: '#00cc33',
          background: '#000000',
          text: '#00ff41'
        },
        price: 300,
        icon: '🕳️',
        className: 'theme-digitalvoid'
      }
    ];

    for (const themeData of predefinedThemes) {
      await this.addTheme(themeData);
    }
  }

  /**
   * Add a new theme
   */
  async addTheme(themeData) {
    const theme = new PremiumTheme(themeData);
    const validation = theme.validate();
    
    if (!validation.isValid) {
      throw new Error(`Invalid theme data: ${validation.errors.join(', ')}`);
    }

    this.themes.set(theme.theme_id, theme);
    await this.saveThemes();
    return theme;
  }

  /**
   * Get all themes
   */
  getAllThemes() {
    return Array.from(this.themes.values());
  }

  /**
   * Get premium themes only
   */
  getPremiumThemes() {
    return Array.from(this.themes.values()).filter(theme => theme.is_premium);
  }

  /**
   * Get free themes only
   */
  getFreeThemes() {
    return Array.from(this.themes.values()).filter(theme => !theme.is_premium);
  }

  /**
   * Get theme by ID
   */
  getTheme(themeId) {
    return this.themes.get(themeId);
  }

  /**
   * Get themes available to user
   */
  getUserAvailableThemes(userId, hasPremiumAccess = false) {
    const userPurchases = Array.from(this.userPurchases.get(userId) || []);
    
    return Array.from(this.themes.values()).filter(theme => 
      theme.canUserAccess(userPurchases, hasPremiumAccess)
    );
  }

  /**
   * Process theme purchase
   */
  async purchaseTheme(userId, themeId, userCoins = 0) {
    await this.initialize();
    
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    if (!theme.is_premium) {
      throw new Error('Theme is already free');
    }

    // Check if user already owns the theme
    const userPurchases = this.userPurchases.get(userId) || new Set();
    if (userPurchases.has(themeId)) {
      throw new Error('Theme already purchased');
    }

    // Check if user has enough coins (for future implementation)
    if (userCoins < theme.price) {
      throw new Error(`Insufficient coins. Required: ${theme.price}, Available: ${userCoins}`);
    }

    // Add theme to user's purchases
    if (!this.userPurchases.has(userId)) {
      this.userPurchases.set(userId, new Set());
    }
    this.userPurchases.get(userId).add(themeId);
    
    await this.saveUserPurchases();

    return {
      success: true,
      theme: theme.toJSON(),
      coinsSpent: theme.price,
      remainingCoins: userCoins - theme.price
    };
  }

  /**
   * Check if user owns a specific theme
   */
  userOwnsTheme(userId, themeId) {
    const userPurchases = this.userPurchases.get(userId) || new Set();
    return userPurchases.has(themeId);
  }

  /**
   * Get user's purchased themes
   */
  getUserPurchasedThemes(userId) {
    const userPurchases = this.userPurchases.get(userId) || new Set();
    return Array.from(userPurchases);
  }

  /**
   * Get theme statistics
   */
  getThemeStats() {
    const stats = {
      totalThemes: this.themes.size,
      premiumThemes: 0,
      freeThemes: 0,
      totalPurchases: 0,
      revenue: 0
    };

    for (const theme of this.themes.values()) {
      if (theme.is_premium) {
        stats.premiumThemes++;
      } else {
        stats.freeThemes++;
      }
    }

    for (const purchases of this.userPurchases.values()) {
      stats.totalPurchases += purchases.size;
      for (const themeId of purchases) {
        const theme = this.themes.get(themeId);
        if (theme) {
          stats.revenue += theme.price;
        }
      }
    }

    return stats;
  }

  /**
   * Remove a theme (admin only)
   */
  async removeTheme(themeId) {
    if (this.themes.delete(themeId)) {
      await this.saveThemes();
      return true;
    }
    return false;
  }

  /**
   * Update theme (admin only)
   */
  async updateTheme(themeId, updateData) {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    // Create updated theme
    const updatedThemeData = { ...theme.toJSON(), ...updateData };
    const updatedTheme = new PremiumTheme(updatedThemeData);
    
    const validation = updatedTheme.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid theme data: ${validation.errors.join(', ')}`);
    }

    this.themes.set(themeId, updatedTheme);
    await this.saveThemes();
    return updatedTheme;
  }
}

module.exports = PremiumThemeManager;
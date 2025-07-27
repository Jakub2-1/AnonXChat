/**
 * PremiumTheme Class - Defines premium themes with all their attributes
 */
class PremiumTheme {
  constructor({
    theme_id,
    name,
    description,
    colors,
    price,
    is_premium = true,
    icon = '🎨',
    className = '',
    category = 'premium',
    preview_image = null,
    unlock_requirements = null
  }) {
    this.theme_id = theme_id;
    this.name = name;
    this.description = description;
    this.colors = colors;
    this.price = price;
    this.is_premium = is_premium;
    this.icon = icon;
    this.className = className;
    this.category = category;
    this.preview_image = preview_image;
    this.unlock_requirements = unlock_requirements;
    this.created_at = new Date().toISOString();
  }

  /**
   * Validate theme data
   */
  validate() {
    const errors = [];
    
    if (!this.theme_id || typeof this.theme_id !== 'string') {
      errors.push('theme_id is required and must be a string');
    }
    
    if (!this.name || typeof this.name !== 'string') {
      errors.push('name is required and must be a string');
    }
    
    if (!this.description || typeof this.description !== 'string') {
      errors.push('description is required and must be a string');
    }
    
    if (!this.colors || typeof this.colors !== 'object') {
      errors.push('colors is required and must be an object');
    }
    
    if (this.is_premium && (typeof this.price !== 'number' || this.price <= 0)) {
      errors.push('premium themes must have a valid price');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to JSON representation
   */
  toJSON() {
    return {
      theme_id: this.theme_id,
      name: this.name,
      description: this.description,
      colors: this.colors,
      price: this.price,
      is_premium: this.is_premium,
      icon: this.icon,
      className: this.className,
      category: this.category,
      preview_image: this.preview_image,
      unlock_requirements: this.unlock_requirements,
      created_at: this.created_at
    };
  }

  /**
   * Create theme from JSON
   */
  static fromJSON(data) {
    return new PremiumTheme(data);
  }

  /**
   * Check if user can access this theme
   */
  canUserAccess(userPurchases = [], hasPremiumAccess = false) {
    if (!this.is_premium) {
      return true; // Free themes are always accessible
    }
    
    if (hasPremiumAccess) {
      return true; // Premium access unlocks all
    }
    
    return userPurchases.includes(this.theme_id);
  }

  /**
   * Get theme requirements for unlock
   */
  getUnlockRequirements() {
    if (!this.is_premium) {
      return null;
    }
    
    return {
      price: this.price,
      currency: 'AnonCoins',
      requirements: this.unlock_requirements
    };
  }
}

module.exports = PremiumTheme;
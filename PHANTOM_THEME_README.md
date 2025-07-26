# Phantom Theme Documentation

## Overview

The Phantom theme is a premium mystical hacker-inspired theme for AnonX Chat that provides an ethereal, otherworldly experience with fog animations, dissolving text effects, and elegant glass-morphism design.

## Features

### ✨ Core Visual Elements
- **Ethereal Background**: Dark gradients with purple and turquoise accents
- **Fog Animation**: Drifting fog particles create mystical atmosphere
- **Glass Morphism**: Transparent message bubbles with backdrop blur
- **Neon Borders**: Purple and turquoise glowing borders
- **Elegant Typography**: Montserrat font for sophisticated appearance

### 🌫️ Special Effects
- **Dissolving Text**: "Entering Phantom Mode…" animation on theme activation
- **Boost Phantom**: Pulsating glow and shadow effects when activated
- **Typing Indicator Glow**: Animated glow on typing indicator dots
- **Hover Effects**: Glitch/blur effects on message bubble hover

### 📱 Accessibility & Responsiveness
- **Mobile Optimized**: Responsive design for all screen sizes
- **Accessibility Support**: Reduced motion support, high contrast mode
- **Screen Reader Friendly**: ARIA labels and announcements
- **Keyboard Navigation**: Full keyboard accessibility

## File Structure

```
public/
├── phantom-theme.module.css    # Main CSS module with all styles
├── phantom-theme.js           # JavaScript functionality
├── phantom-demo.html          # Interactive demo page
└── images/
    └── phantom-fog.svg        # Fog particle SVG asset
```

## Installation & Usage

### 1. Theme Activation

The Phantom theme is integrated into the main theme system. Users can select it from the theme selector:

1. Click the theme switcher button (👻 when active)
2. Select "Phantom" from the premium themes section
3. Theme activates with dissolving text effect

### 2. Developer Access

For development/testing, enable premium access:

```javascript
localStorage.setItem('devKey', 'MY_SECRET_KEY');
localStorage.setItem('anonx_premium', 'true');
```

### 3. Demo Page

Access the interactive demo at: `http://localhost:3000/phantom-demo.html`

Features:
- Live chat preview with Phantom styling
- Boost effect toggle
- Interactive demonstrations
- Feature showcase

## Technical Implementation

### CSS Module (`phantom-theme.module.css`)

The CSS module uses CSS custom properties for theme variables:

```css
.theme-phantom {
  --phantom-bg-primary: #0f0f1a;
  --phantom-purple: #9370db;
  --phantom-turquoise: #40e0d0;
  --phantom-font-family: 'Montserrat', 'Inter', sans-serif;
}
```

Key animations:
- `phantomFogDrift`: Fog particle movement
- `phantomDissolve`: Text dissolving effect  
- `phantomBoostPulsation`: Boost effect animation
- `phantomTypingGlow`: Typing indicator glow

### JavaScript Class (`phantom-theme.js`)

The `PhantomTheme` class handles:

```javascript
class PhantomTheme {
  activate()      // Enable theme with effects
  deactivate()    // Clean up and disable
  toggleBoost()   // Toggle boost effect
  showDissolvingText() // Dissolving text animation
  createFogOverlay()   // Fog particle system
}
```

### Integration Points

1. **Theme System Integration**: Modified `chat.js` to call Phantom theme methods
2. **Font Loading**: Added Montserrat font import to main HTML
3. **Asset Loading**: Included CSS module in main HTML

## Customization

### Color Schemes

Modify theme variables in CSS:

```css
.theme-phantom {
  --phantom-purple: #your-color;
  --phantom-turquoise: #your-color;
  --phantom-glow-purple: rgba(your-color, 0.8);
}
```

### Animation Speed

Adjust animation durations:

```css
/* Fog animation speed */
@keyframes phantomFogDrift {
  /* Change from 20s to your desired speed */
}

/* Boost pulsation speed */
.phantom-boost-active {
  animation: phantomBoostPulsation 2s ease-in-out infinite;
}
```

### Accessibility

The theme includes accessibility features:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disables animations for users who prefer reduced motion */
  .phantom-fog-particle,
  .phantom-entering-text {
    animation: none;
  }
}

@media (prefers-contrast: high) {
  /* High contrast color adjustments */
  .theme-phantom {
    --phantom-text-primary: #ffffff;
    --phantom-purple: #bb86fc;
  }
}
```

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+
- **CSS Features**: CSS Grid, Flexbox, Custom Properties, Backdrop Filter
- **JavaScript**: ES6+ features, Classes, Async/Await

## Performance

- **Lightweight**: CSS animations use transform and opacity for optimal performance
- **GPU Acceleration**: Hardware-accelerated animations
- **Efficient Particles**: Limited to 4 fog particles to maintain performance
- **Conditional Loading**: Effects only load when theme is active

## Troubleshooting

### Common Issues

1. **Fog not appearing**: Check if CSS animations are disabled by browser/accessibility settings
2. **Fonts not loading**: Verify internet connection for Google Fonts
3. **Boost effect not working**: Ensure JavaScript is enabled and no console errors

### Debug Mode

Enable debug logging:

```javascript
// Check if theme is properly initialized
console.log(window.phantomTheme);

// Check theme activation status
console.log(window.phantomTheme.isActive);
```

## Future Enhancements

Potential improvements:

1. **Sound Effects**: Ambient phantom sounds
2. **Particle Customization**: User-configurable fog density
3. **Color Variants**: Multiple phantom color schemes
4. **Advanced Animations**: More complex dissolving effects
5. **Theme Persistence**: Remember boost state across sessions

## License

This theme is part of the AnonX Chat application and follows the same license terms.
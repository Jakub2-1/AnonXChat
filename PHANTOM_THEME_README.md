# Phantom Theme Documentation

## Overview

The Phantom theme is a premium horror-inspired theme for AnonX Chat that provides a dark, atmospheric experience with a bench background, mysterious silhouette figures, and interactive jumpscare functionality.

## Features

### 🏞️ Core Visual Elements
- **Bench Background**: Dark bench under a lamp post creates atmospheric horror setting
- **Dark Silhouette**: Mysterious figure randomly appears sitting on the bench
- **Horror Aesthetics**: Dark, transparent message bubbles with subtle borders
- **Atmospheric Lighting**: Lamp post with soft glow effect
- **Elegant Typography**: Montserrat font for sophisticated appearance

### 😱 Jumpscare System
- **Premium Feature**: Jumpscare button visible only for users with Phantom theme access
- **Horror Animation**: Full-screen dark figure with red glowing eyes
- **Sound Effects**: Random whisper or scream sounds (when audio files are available)
- **Socket.IO Integration**: Real-time jumpscare transmission between chat partners
- **Spam Protection**: Button disabled for 5 seconds after sending
- **Access Control**: Only premium users can send jumpscares

### 👤 Dark Silhouette Animation
- **Random Appearances**: Silhouette appears every 8-20 seconds when theme is active
- **Subtle Visibility**: Low opacity (30%) for atmospheric effect
- **Bench Integration**: Figure appears positioned on the bench
- **Automatic Cleanup**: Disappears after 4 seconds

### 📱 Accessibility & Responsiveness
- **Mobile Optimized**: Responsive design for all screen sizes
- **Accessibility Support**: Reduced motion support, high contrast mode
- **Screen Reader Friendly**: ARIA labels and announcements
- **Keyboard Navigation**: Full keyboard accessibility

## File Structure

```
public/
├── phantom-theme.module.css    # Main CSS with bench background and horror styling
├── phantom-theme.js           # JavaScript functionality with jumpscare system
├── phantom-demo.html          # Interactive demo page
├── images/
│   └── bench.svg             # Bench under lamp background image
└── sounds/
    ├── whisper.mp3           # Whisper sound effect for jumpscare
    └── scream.mp3            # Scream sound effect for jumpscare
```

## Installation & Usage

### 1. Theme Activation

The Phantom theme is integrated into the main theme system. Users can select it from the theme selector:

1. Click the theme switcher button (👻 when active)
2. Select "Phantom" from the premium themes section
3. Theme activates with bench background and silhouette animation

### 2. Premium Access

For jumpscare functionality, users need premium access:

```javascript
// Premium access methods
localStorage.setItem('anonx_premium', 'true');
// OR
localStorage.setItem('devKey', 'MY_SECRET_KEY');
// OR
premiumThemesUnlocked.includes('phantom')
```

### 3. Demo Page

Access the interactive demo at: `http://localhost:3000/phantom-demo.html`

Features:
- Live chat preview with Phantom styling
- Jumpscare effect testing
- Silhouette animation demonstration
- Interactive controls for testing features

## Technical Implementation

### CSS Module (`phantom-theme.module.css`)

The CSS module uses CSS custom properties for theme variables:

```css
.theme-phantom {
  --phantom-bg-primary: #0a0a0a;
  --phantom-bg-secondary: #1a1a1a;
  --phantom-silhouette-opacity: 0.3;
  --phantom-font-family: 'Montserrat', 'Inter', sans-serif;
}
```

Key animations:
- `phantomSilhouetteAppear`: Silhouette fade in/out animation
- `phantomJumpscareAppear`: Jumpscare figure appearance
- `phantomJumpscareShake`: Screen shake effect during jumpscare
- `phantomTypingDots`: Typing indicator animation

### JavaScript Class (`phantom-theme.js`)

The `PhantomTheme` class handles:

```javascript
class PhantomTheme {
  activate()           // Enable theme with bench background
  deactivate()         // Clean up and disable
  sendJumpscare()      // Send jumpscare via Socket.IO
  receiveJumpscare()   // Display jumpscare animation
  createSilhouette()   // Create dark silhouette figure
  checkPremiumAccess() // Verify user has premium access
}
```

### Socket.IO Integration

Server-side jumpscare handling in `index.js`:

```javascript
socket.on("jumpscare", (data) => {
  if (socket.partner && socket.room) {
    socket.to(socket.room).emit("jumpscare", {
      type: data.type || 'phantom',
      timestamp: data.timestamp || Date.now(),
      from: socket.userId || 'anonymous'
    });
  }
});
```

## Security & Access Control

### Premium Feature Protection

- Jumpscare button only appears for premium users
- `checkPremiumAccess()` validates user permissions
- Server doesn't validate premium access (client-side only)
- Button includes spam protection (5-second cooldown)

### Socket.IO Security

- Jumpscare events include sender information
- Partner validation ensures only chat partners receive jumpscares
- Rate limiting through button disable mechanism

## Customization

### Background Image

Replace the bench background:

```css
body.theme-phantom::before {
  background: url('images/your-background.svg') center/cover no-repeat;
}
```

### Silhouette Timing

Adjust appearance frequency:

```javascript
// Random interval between 8-20 seconds
const interval = 8000 + Math.random() * 12000;
```

### Jumpscare Animation

Customize the horror animation:

```css
.phantom-jumpscare-figure {
  width: 300px;  /* Adjust size */
  height: 500px;
  /* Modify appearance */
}
```

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+
- **CSS Features**: CSS Grid, Flexbox, Custom Properties, Backdrop Filter
- **JavaScript**: ES6+ features, Classes, Socket.IO client
- **Audio**: Web Audio API for sound effects

## Performance

- **Lightweight**: CSS animations use transform and opacity
- **GPU Acceleration**: Hardware-accelerated animations
- **Efficient Elements**: Minimal DOM manipulation
- **Conditional Loading**: Effects only load when theme is active
- **Memory Management**: Proper cleanup on theme deactivation

## Troubleshooting

### Common Issues

1. **Jumpscare button not visible**: Check premium access via `checkPremiumAccess()`
2. **Sounds not playing**: Verify audio files exist and are valid MP3 format
3. **Silhouette not appearing**: Check if animations are disabled by accessibility settings
4. **Socket errors**: Ensure Socket.IO connection is established

### Debug Mode

Enable debug logging:

```javascript
// Check theme status
console.log(window.phantomTheme.isActive);
console.log(window.phantomTheme.hasPremiumAccess);

// Test jumpscare locally
window.phantomTheme.receiveJumpscare({
  type: 'phantom',
  timestamp: Date.now()
});
```

## Future Enhancements

Potential improvements:

1. **Multiple Backgrounds**: Various horror scenes (cemetery, haunted house, etc.)
2. **Sound Variations**: More diverse horror sound effects
3. **Animation Variants**: Different jumpscare animations
4. **Intensity Settings**: User-configurable scare levels
5. **Group Features**: Multi-user jumpscare effects

## License

This theme is part of the AnonX Chat application and follows the same license terms.
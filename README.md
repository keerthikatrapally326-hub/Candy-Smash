# Candy Smash - Match-3 Puzzle Game 🍬

A complete Candy Crush-style match-3 puzzle game built with HTML, CSS, and JavaScript. Features beautiful animations, sound effects, level progression, monetization hooks, and mobile-responsive design.

## 🎮 Features

### Core Gameplay
- **8x8 Dynamic Grid**: Smooth candy swapping with touch and mouse support
- **Match-3 Logic**: Horizontal and vertical matching with cascading effects
- **Special Candies**: Striped, wrapped, and color bomb candies with unique effects
- **Combo System**: Score multipliers for consecutive matches
- **Gravity & Refill**: Realistic candy physics with automatic refilling

### Game Progression
- **50+ Levels**: Scalable level system with increasing difficulty
- **Multiple Objectives**: Score targets, ingredient collection, blocker clearing
- **Star Rating**: 1-3 star system based on performance
- **Progress Saving**: Local storage for game state and achievements

### Visual & Audio
- **Candy Aesthetics**: Colorful gradients, glossy effects, and emoji candies
- **Smooth Animations**: CSS transitions and JavaScript-powered effects
- **Particle System**: Score bursts, explosions, and combo effects
- **Dynamic Backgrounds**: Animated gradients that change with levels
- **Sound System**: Background music, sound effects, and audio controls

### Monetization Ready
- **Ad Integration**: Banner, interstitial, and rewarded video ad placeholders
- **In-App Purchases**: Boosters, extra moves, and ad removal
- **Booster System**: Hammer, swap, and bomb power-ups
- **Rewarded Content**: Watch ads for bonuses and extra moves

### Mobile Optimized
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Touch Controls**: Optimized for touch interactions
- **Performance**: Efficient rendering and smooth 60fps gameplay
- **Accessibility**: Keyboard navigation and reduced motion support

## 🚀 Getting Started

1. **Download/Clone** the game files
2. **Open** `index.html` in a web browser
3. **Play** immediately - no build process required!

### File Structure
```
candy-crush-game/
├── index.html          # Main game file
├── css/
│   └── styles.css      # Complete styling and animations
├── js/
│   ├── main.js         # Game initialization and entry point
│   ├── game.js         # Core game engine and logic
│   ├── grid.js         # Grid system and match detection
│   ├── ui.js           # User interface management
│   ├── audio.js        # Sound system and music
│   ├── particles.js    # Particle effects system
│   ├── storage.js      # Local storage and save system
│   ├── ads.js          # Monetization and ad integration
│   └── utils.js        # Utility functions and helpers
└── README.md           # This file
```

## 🎯 How to Play

1. **Swap Adjacent Candies**: Click/tap and drag to swap candies
2. **Make Matches**: Create lines of 3+ identical candies
3. **Use Boosters**: Activate power-ups for extra help
4. **Complete Objectives**: Reach target scores or clear special items
5. **Progress Through Levels**: Unlock new challenges and difficulties

### Special Candies
- **Striped Candy** (4 in a row): Clears entire row or column
- **Wrapped Candy** (T/L shape): Explodes in 3x3 area twice
- **Color Bomb** (5+ match): Removes all candies of selected color

### Boosters
- **🔨 Hammer**: Remove any single candy
- **🔄 Swap**: Swap any two candies
- **💣 Bomb**: Destroy 3x3 area

## 🛠 Technical Details

### Architecture
- **Modular Design**: Separate systems for game logic, UI, audio, etc.
- **Event-Driven**: Clean separation between game state and presentation
- **Scalable**: Easy to add new candy types, levels, and features
- **Performance Optimized**: Efficient algorithms and rendering

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (ES6+ required)
- **Mobile Browsers**: iOS Safari, Android Chrome
- **Features Used**: CSS Grid, Web Audio API, Local Storage, Pointer Events

### Customization
The game is designed to be easily customizable:

- **New Candy Types**: Add to `candyTypes` array in `grid.js`
- **Level Configuration**: Modify `getLevelConfig()` in `game.js`
- **Scoring System**: Adjust `baseScore` object in `game.js`
- **Visual Themes**: Update CSS variables and gradients
- **Sound Effects**: Replace audio generation in `audio.js`

## 💰 Monetization Integration

### Ad Providers Supported
- **AdMob**: Mobile app monetization
- **Unity Ads**: Cross-platform advertising
- **AdSense**: Web-based advertising

### Revenue Streams
- **Banner Ads**: Persistent bottom banner
- **Interstitial Ads**: Between levels and game over
- **Rewarded Videos**: Extra moves, boosters, bonuses
- **In-App Purchases**: Remove ads, buy boosters, extra lives

### Integration Steps
1. Replace mock ad functions in `ads.js` with real SDK calls
2. Configure ad unit IDs for your app
3. Implement payment processing for purchases
4. Add analytics tracking for monetization events

## 🔧 Development

### Adding New Features
1. **New Candy Types**: Update `grid.js` and add CSS styles
2. **New Levels**: Modify level configuration system
3. **New Boosters**: Add to booster system in `game.js`
4. **New Animations**: Add CSS keyframes and JavaScript triggers

### Performance Tips
- Game runs at 60fps on modern devices
- Particle system automatically manages performance
- Grid rendering is optimized for smooth gameplay
- Audio system uses Web Audio API for low latency

### Debug Mode
Open browser console and type:
```javascript
debugGame()     // Enable debug overlay
gameStats()     // View game statistics
restartGame()   // Restart entire game
```

## 📱 Mobile Deployment

### Progressive Web App (PWA)
Add a manifest.json and service worker to make it installable:

```json
{
  "name": "Sweet Crush",
  "short_name": "Sweet Crush",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ff9a9e",
  "theme_color": "#4facfe",
  "icons": [...]
}
```

### App Store Deployment
- **Cordova/PhoneGap**: Wrap in native container
- **Capacitor**: Modern hybrid app development
- **Electron**: Desktop app deployment

## 🎨 Customization Examples

### Change Candy Colors
```css
.candy.red {
    background: linear-gradient(135deg, #your-color1, #your-color2);
}
```

### Add New Sound Effect
```javascript
// In audio.js
this.loadSound('new_sound', this.generateTone(frequency, duration));
```

### Create Custom Level
```javascript
// In game.js getLevelConfig()
if (levelNumber === 51) {
    return {
        moves: 25,
        targetScore: 5000,
        objective: { type: 'custom_objective', target: 100 }
    };
}
```

## 🤝 Contributing

This is a complete, production-ready game that can be:
- Extended with new features
- Reskinned for different themes
- Integrated with backend services
- Monetized through various channels

## 📄 License

This project is provided as-is for educational and commercial use. Feel free to modify, distribute, and monetize as needed.

## 🎉 Enjoy Playing!

Candy Smash is ready to play right out of the box. The game includes everything needed for a complete match-3 experience with modern web technologies and monetization features.

**Happy Smashing! 🍬✨**

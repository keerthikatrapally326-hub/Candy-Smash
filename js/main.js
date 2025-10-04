// Main entry point for Candy Smash game

class CandySmashGame {
    constructor() {
        this.isInitialized = false;
        this.gameInstance = null;
        this.startTime = Date.now();
        
        this.initialize();
    }

    // Initialize the game
    async initialize() {
        try {
            console.log('🍬 Initializing Candy Smash Game...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Initialize game systems
            await this.initializeSystems();
            
            // Create game instance
            this.gameInstance = new Game();
            window.game = this.gameInstance;
            
            // Game will start when user clicks Play button
            
            // Load saved settings
            this.loadSettings();
            
            // Setup global event handlers
            this.setupGlobalHandlers();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ Candy Smash Game initialized successfully!');
            
            // Track session
            this.trackSession();
            
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.handleInitializationError(error);
        }
    }

    // Initialize all game systems
    async initializeSystems() {
        const systems = [
            { name: 'Audio', instance: window.Audio },
            { name: 'Storage', instance: window.Storage },
            { name: 'Particles', instance: window.Particles },
            { name: 'Ads', instance: window.Ads },
            { name: 'UI', instance: window.UI }
        ];

        for (const system of systems) {
            if (!system.instance) {
                throw new Error(`${system.name} system not found`);
            }
            console.log(`✓ ${system.name} system ready`);
        }
    }

    // Load saved settings
    loadSettings() {
        const settings = Storage.getSettings();
        
        // Apply audio settings
        Audio.loadSettings(settings);
        
        // Apply UI settings
        if (settings.notifications !== undefined) {
            // Handle notification settings
        }
        
        console.log('Settings loaded:', settings);
    }

    // Setup global event handlers
    setupGlobalHandlers() {
        // Handle window focus/blur for pause functionality
        window.addEventListener('blur', () => {
            if (this.gameInstance && this.gameInstance.isPlaying && !this.gameInstance.isPaused) {
                this.gameInstance.pauseGame();
            }
        });

        // Handle visibility change (mobile browsers)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.gameInstance && this.gameInstance.isPlaying && !this.gameInstance.isPaused) {
                    this.gameInstance.pauseGame();
                }
            }
        });

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (this.gameInstance) {
                    this.gameInstance.renderGrid();
                }
            }, 100);
        });

        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.gameInstance) {
                    this.gameInstance.renderGrid();
                }
            }, 250);
        });

        // Handle beforeunload for saving
        window.addEventListener('beforeunload', () => {
            this.saveGameState();
        });

        // Handle errors
        window.addEventListener('error', (event) => {
            console.error('Game error:', event.error);
            this.handleGameError(event.error);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleGlobalKeyboard(event);
        });

        // Prevent context menu on game area
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            gameBoard.addEventListener('contextmenu', (event) => {
                event.preventDefault();
            });
        }

        // Handle touch events for mobile
        if (Utils.isTouchDevice()) {
            this.setupTouchHandlers();
        }
    }

    // Setup touch-specific handlers
    setupTouchHandlers() {
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Prevent pull-to-refresh
        document.body.addEventListener('touchstart', (event) => {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        }, { passive: false });

        document.body.addEventListener('touchend', (event) => {
            if (event.touches.length > 0) {
                event.preventDefault();
            }
        }, { passive: false });

        document.body.addEventListener('touchmove', (event) => {
            if (event.scale !== 1) {
                event.preventDefault();
            }
        }, { passive: false });
    }

    // Handle global keyboard events
    handleGlobalKeyboard(event) {
        // Don't handle if typing in input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (event.key) {
            case 'Escape':
                if (UI.isModalOpen()) {
                    // Close topmost modal
                    Object.keys(UI.modals).forEach(modalName => {
                        if (!UI.modals[modalName].classList.contains('hidden')) {
                            UI.hideModal(modalName);
                        }
                    });
                }
                break;

            case 'r':
            case 'R':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    if (this.gameInstance && this.gameInstance.isPlaying) {
                        this.gameInstance.restartLevel();
                    }
                }
                break;

            case 'm':
            case 'M':
                Audio.toggleMute();
                break;

            case 'h':
            case 'H':
                if (this.gameInstance && this.gameInstance.isPlaying) {
                    const hint = this.gameInstance.grid.getHint();
                    if (hint) {
                        this.showHint(hint);
                    }
                }
                break;
        }
    }

    // Show hint to player
    showHint(hint) {
        const fromElement = this.gameInstance.getCandyElement(hint.from.x, hint.from.y);
        const toElement = this.gameInstance.getCandyElement(hint.to.x, hint.to.y);

        if (fromElement && toElement) {
            // Highlight hint candies
            fromElement.style.boxShadow = '0 0 20px #ffff00';
            toElement.style.boxShadow = '0 0 20px #ffff00';

            setTimeout(() => {
                fromElement.style.boxShadow = '';
                toElement.style.boxShadow = '';
            }, 2000);

            UI.showNotification('💡 Try swapping these candies!');
        }
    }

    // Save current game state
    saveGameState() {
        if (this.gameInstance) {
            this.gameInstance.saveGameData();
        }

        // Save session data
        const sessionData = {
            playTime: Date.now() - this.startTime,
            lastPlayed: Date.now()
        };
        
        try {
            localStorage.setItem('candy_smash_session', JSON.stringify(sessionData));
        } catch (error) {
            console.warn('Failed to save session data:', error);
        }
    }

    // Track game session for analytics
    trackSession() {
        const sessions = parseInt(localStorage.getItem('game_sessions') || '0') + 1;
        localStorage.setItem('game_sessions', sessions.toString());
        
        console.log(`Session #${sessions} started`);
    }

    // Handle initialization errors
    handleInitializationError(error) {
        const errorScreen = document.createElement('div');
        errorScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: 'Nunito', sans-serif;
            text-align: center;
            z-index: 10000;
        `;

        errorScreen.innerHTML = `
            <div>
                <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Game Error</h1>
                <p style="margin-bottom: 2rem;">Sorry, the game failed to load properly.</p>
                <button onclick="location.reload()" style="
                    background: #4facfe;
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 25px;
                    font-size: 1rem;
                    cursor: pointer;
                ">Reload Game</button>
                <p style="margin-top: 1rem; font-size: 0.8rem; opacity: 0.7;">
                    Error: ${error.message}
                </p>
            </div>
        `;

        document.body.appendChild(errorScreen);
    }

    // Handle runtime game errors
    handleGameError(error) {
        console.error('Runtime game error:', error);
        
        // Show user-friendly error message
        UI.showNotification('⚠️ Something went wrong. The game will try to recover.', 5000);
        
        // Try to recover
        setTimeout(() => {
            try {
                if (this.gameInstance && this.gameInstance.isPlaying) {
                    this.gameInstance.renderGrid();
                }
            } catch (recoveryError) {
                console.error('Failed to recover:', recoveryError);
                UI.showNotification('❌ Please refresh the page to continue playing.', 10000);
            }
        }, 1000);
    }

    // Get game statistics
    getGameStats() {
        const sessionData = JSON.parse(localStorage.getItem('candy_smash_session') || '{}');
        const sessions = parseInt(localStorage.getItem('game_sessions') || '0');
        
        return {
            sessions,
            totalPlayTime: sessionData.playTime || 0,
            lastPlayed: sessionData.lastPlayed || null,
            highestLevel: Storage.getHighestLevel(),
            gameInstance: this.gameInstance ? this.gameInstance.getStats() : null
        };
    }

    // Debug functions
    enableDebugMode() {
        window.DEBUG_MODE = true;
        console.log('🐛 Debug mode enabled');
        
        // Add debug info to UI
        const debugInfo = document.createElement('div');
        debugInfo.id = 'debug-info';
        debugInfo.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(debugInfo);
        
        // Update debug info periodically
        setInterval(() => {
            if (this.gameInstance) {
                const stats = this.gameInstance.getStats();
                debugInfo.innerHTML = `
                    FPS: ${this.getFPS()}<br>
                    Level: ${stats.level}<br>
                    Score: ${stats.score}<br>
                    Moves: ${stats.moves}<br>
                    Combo: ${stats.combo}<br>
                    Particles: ${Particles.particles.length}
                `;
            }
        }, 1000);
    }

    // Get approximate FPS
    getFPS() {
        if (!this.fpsCounter) {
            this.fpsCounter = { frames: 0, lastTime: Date.now(), fps: 0 };
        }
        
        this.fpsCounter.frames++;
        const now = Date.now();
        
        if (now - this.fpsCounter.lastTime >= 1000) {
            this.fpsCounter.fps = this.fpsCounter.frames;
            this.fpsCounter.frames = 0;
            this.fpsCounter.lastTime = now;
        }
        
        return this.fpsCounter.fps;
    }

    // Restart game completely
    restart() {
        console.log('🔄 Restarting game...');
        
        // Stop all systems
        if (Particles) Particles.stop();
        if (Audio) Audio.stopMusic();
        
        // Clear game instance
        this.gameInstance = null;
        window.game = null;
        
        // Reinitialize
        this.initialize();
    }
}

// Initialize the game when script loads
const candySmashGame = new CandySmashGame();

// Export for global access
window.CandySmash = candySmashGame;

// Add some helpful global functions for debugging
window.debugGame = () => candySmashGame.enableDebugMode();
window.restartGame = () => candySmashGame.restart();
window.gameStats = () => console.table(candySmashGame.getGameStats());

console.log('🍬 Candy Smash Game loaded! Type debugGame() for debug mode.');

// UI management for Candy Smash game

class UIManager {
    constructor() {
        this.currentScreen = 'loading';
        this.modals = {};
        this.animations = {};
        
        this.initialize();
    }

    // Initialize UI system
    initialize() {
        this.setupScreens();
        this.setupModals();
        this.setupEventListeners();
        this.loadInitialScreen();
    }

    // Setup screen management
    setupScreens() {
        this.screens = {
            loading: document.getElementById('loading-screen'),
            menu: document.getElementById('main-menu'),
            levelSelect: document.getElementById('level-select'),
            game: document.getElementById('game-screen')
        };
    }

    // Setup modal management
    setupModals() {
        this.modals = {
            pause: document.getElementById('pause-menu'),
            levelComplete: document.getElementById('level-complete'),
            gameOver: document.getElementById('game-over'),
            settings: document.getElementById('settings-modal')
        };
    }

    // Setup event listeners
    setupEventListeners() {
        // Menu buttons
        document.getElementById('play-btn')?.addEventListener('click', () => {
            this.showScreen('game');
            window.game.startGame(1);
        });
        
        document.getElementById('levels-btn')?.addEventListener('click', () => {
            this.showLevelSelect();
        });
        
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.showSettings();
        });

        // Game controls
        document.getElementById('pause-btn')?.addEventListener('click', () => {
            window.game.pauseGame();
        });
        
        document.getElementById('sound-toggle')?.addEventListener('click', () => {
            this.toggleSound();
        });
        
        document.getElementById('menu-btn')?.addEventListener('click', () => {
            this.showScreen('menu');
        });

        // Booster buttons
        document.querySelectorAll('.booster-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const boosterType = btn.dataset.booster;
                window.game.activateBooster(boosterType);
            });
        });

        // Modal buttons
        this.setupModalButtons();
        
        // Level select back button
        document.getElementById('back-to-menu')?.addEventListener('click', () => {
            this.showScreen('menu');
        });
    }

    // Setup modal button listeners
    setupModalButtons() {
        // Pause menu
        document.getElementById('resume-btn')?.addEventListener('click', () => {
            window.game.resumeGame();
        });
        
        document.getElementById('restart-btn')?.addEventListener('click', () => {
            this.hideModal('pause');
            window.game.restartLevel();
        });
        
        document.getElementById('quit-btn')?.addEventListener('click', () => {
            this.hideModal('pause');
            this.showScreen('menu');
        });

        // Level complete
        document.getElementById('next-level-btn')?.addEventListener('click', () => {
            this.hideModal('levelComplete');
            window.game.startGame(window.game.level + 1);
        });
        
        document.getElementById('replay-btn')?.addEventListener('click', () => {
            this.hideModal('levelComplete');
            window.game.restartLevel();
        });

        // Game over
        document.getElementById('retry-btn')?.addEventListener('click', () => {
            this.hideModal('gameOver');
            window.game.restartLevel();
        });
        
        document.getElementById('quit-game-btn')?.addEventListener('click', () => {
            this.hideModal('gameOver');
            this.showScreen('menu');
        });

        // Monetization buttons
        document.getElementById('buy-moves-btn')?.addEventListener('click', () => {
            this.handlePurchase('extra_moves');
        });
        
        document.getElementById('watch-ad-btn')?.addEventListener('click', () => {
            this.watchAdForReward('level_bonus');
        });
        
        document.getElementById('watch-ad-moves')?.addEventListener('click', () => {
            this.watchAdForReward('extra_moves');
        });

        // Settings
        document.getElementById('close-settings')?.addEventListener('click', () => {
            this.hideModal('settings');
        });
        
        // Settings controls
        document.getElementById('music-volume')?.addEventListener('input', (e) => {
            window.Audio.setMusicVolume(e.target.value / 100);
        });
        
        document.getElementById('sfx-volume')?.addEventListener('input', (e) => {
            window.Audio.setSoundVolume(e.target.value / 100);
        });
    }

    // Load initial screen after loading
    loadInitialScreen() {
        // Simulate loading time
        setTimeout(() => {
            this.showScreen('menu');
        }, 2000);
    }

    // Show specific screen
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.add('hidden');
        });
        
        // Show target screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.remove('hidden');
            this.currentScreen = screenName;
        }
        
        // Trigger screen-specific actions
        this.onScreenChange(screenName);
    }

    // Handle screen change events
    onScreenChange(screenName) {
        switch (screenName) {
            case 'menu':
                window.Audio.playMusic('background');
                window.Ads.showAdForEvent('app_start');
                break;
                
            case 'game':
                this.updateGameUI();
                break;
                
            case 'levelSelect':
                this.populateLevelSelect();
                break;
        }
    }

    // Show level selection screen
    showLevelSelect() {
        this.showScreen('levelSelect');
        this.populateLevelSelect();
    }

    // Populate level select screen with level buttons
    populateLevelSelect() {
        const levelGrid = document.getElementById('level-grid');
        if (!levelGrid || !window.game) return;

        levelGrid.innerHTML = '';

        const levelManager = window.game.levelManager;
        
        for (let levelNum = 1; levelNum <= levelManager.maxLevel; levelNum++) {
            const levelBtn = document.createElement('button');
            levelBtn.className = 'level-btn';
            levelBtn.dataset.level = levelNum;
            
            const isUnlocked = levelManager.isLevelUnlocked(levelNum);
            const isCompleted = levelManager.isLevelCompleted(levelNum);
            const levelData = levelManager.unlockedLevels[levelNum];
            
            if (!isUnlocked) {
                levelBtn.classList.add('locked');
                levelBtn.innerHTML = `
                    <div class="level-number">🔒</div>
                    <div class="level-status">Locked</div>
                `;
                levelBtn.disabled = true;
            } else {
                levelBtn.innerHTML = `
                    <div class="level-number">${levelNum}</div>
                    <div class="level-stars">${'⭐'.repeat(levelData?.stars || 0)}${'☆'.repeat(3 - (levelData?.stars || 0))}</div>
                    <div class="level-status">${isCompleted ? 'Complete' : 'Available'}</div>
                `;
                
                if (isCompleted) {
                    levelBtn.classList.add('completed');
                }
                
                levelBtn.onclick = () => {
                    this.showScreen('game');
                    window.game.startGame(levelNum);
                };
            }
            
            levelGrid.appendChild(levelBtn);
        }
    }

    // Show modal
    showModal(modalName) {
        if (this.modals[modalName]) {
            this.modals[modalName].classList.remove('hidden');
        }
    }

    // Hide modal
    hideModal(modalName) {
        if (this.modals[modalName]) {
            this.modals[modalName].classList.add('hidden');
        }
    }

    // Show pause menu
    showPauseMenu() {
        this.showModal('pause');
    }

    // Hide pause menu
    hidePauseMenu() {
        this.hideModal('pause');
    }

    // Show level complete modal
    showLevelComplete(score, stars) {
        // Update score display
        document.getElementById('final-score').textContent = Utils.formatNumber(score);
        
        // Get and display best score
        const levelData = window.Storage.getLevelData();
        const currentLevel = window.game.level;
        const bestScore = levelData[currentLevel] ? levelData[currentLevel].score : score;
        document.getElementById('best-score').textContent = Utils.formatNumber(bestScore);
        
        // Animate stars
        this.animateStars(stars);
        
        // Show modal
        this.showModal('levelComplete');
        
        // Show ad occasionally
        window.Ads.showAdForEvent('level_complete');
    }

    // Animate stars in level complete modal
    animateStars(earnedStars) {
        const starElements = [
            document.getElementById('star1'),
            document.getElementById('star2'),
            document.getElementById('star3')
        ];
        
        starElements.forEach((star, index) => {
            star.classList.remove('earned');
            
            if (index < earnedStars) {
                setTimeout(() => {
                    star.classList.add('earned');
                    window.Audio.playSound('select');
                }, (index + 1) * 500);
            }
        });
    }

    // Show game over modal
    showGameOver() {
        this.showModal('gameOver');
        window.Ads.showAdForEvent('game_over');
    }

    // Show settings modal
    showSettings() {
        const settings = window.Audio.getSettings();
        
        // Update setting controls
        document.getElementById('music-volume').value = settings.musicVolume * 100;
        document.getElementById('sfx-volume').value = settings.soundVolume * 100;
        document.getElementById('notifications').checked = settings.notifications || false;
        
        this.showModal('settings');
    }

    // Toggle sound
    toggleSound() {
        const isMuted = window.Audio.toggleMute();
        const soundBtn = document.getElementById('sound-toggle');
        
        if (soundBtn) {
            soundBtn.textContent = isMuted ? '🔇' : '🔊';
        }
    }

    // Update game UI elements
    updateGameUI() {
        if (window.game) {
            const stats = window.game.getStats();
            
            // Update displays
            document.getElementById('current-level').textContent = stats.level;
            document.getElementById('current-score').textContent = Utils.formatNumber(stats.score);
            document.getElementById('moves-left').textContent = stats.moves;
        }
    }

    // Handle in-app purchases
    handlePurchase(itemType) {
        const prices = {
            extra_moves: '$0.99',
            hammer_booster: '$1.99',
            remove_ads: '$2.99'
        };
        
        const price = prices[itemType] || '$0.99';
        const confirmed = confirm(`Purchase ${itemType.replace('_', ' ')} for ${price}?`);
        
        if (confirmed) {
            // Mock purchase success
            this.processPurchase(itemType);
        }
    }

    // Process purchase
    processPurchase(itemType) {
        switch (itemType) {
            case 'extra_moves':
                window.game.moves += 5;
                window.game.updateUI();
                this.hideModal('gameOver');
                this.showNotification('5 extra moves added!');
                break;
                
            case 'hammer_booster':
                window.game.boosters.hammer.count += 3;
                window.game.updateUI();
                this.showNotification('3 hammer boosters added!');
                break;
                
            case 'remove_ads':
                localStorage.setItem('ads_removed', 'true');
                this.showNotification('Ads removed!');
                break;
        }
        
        window.Audio.playSound('booster');
    }

    // Watch ad for reward
    watchAdForReward(rewardType) {
        window.Ads.showRewardedAd(
            () => this.grantAdReward(rewardType),
            (reason) => this.handleAdFailure(reason)
        );
    }

    // Grant reward from ad
    grantAdReward(rewardType) {
        switch (rewardType) {
            case 'extra_moves':
                window.game.moves += 3;
                window.game.updateUI();
                this.hideModal('gameOver');
                this.showNotification('3 extra moves earned!');
                break;
                
            case 'level_bonus':
                const bonus = Math.floor(window.game.score * 0.2);
                window.game.score += bonus;
                window.game.updateUI();
                this.showNotification(`Bonus: +${Utils.formatNumber(bonus)} points!`);
                break;
        }
        
        window.Audio.playSound('booster');
    }

    // Handle ad failure
    handleAdFailure(reason) {
        let message = 'Ad not available right now';
        
        switch (reason) {
            case 'not_available':
                message = 'No ads available at the moment';
                break;
            case 'skipped':
                message = 'Ad was skipped - no reward earned';
                break;
            case 'error':
                message = 'Error loading ad';
                break;
        }
        
        this.showNotification(message);
    }

    // Show notification
    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            z-index: 9999;
            font-family: 'Nunito', sans-serif;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        
        requestAnimationFrame(() => {
            notification.style.transition = 'all 0.3s ease';
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(0)';
        });
        
        // Remove after duration
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-20px)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Show loading indicator
    showLoading() {
        const loading = document.createElement('div');
        loading.id = 'ui-loading';
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        loading.innerHTML = `
            <div class="loading-spinner" style="
                width: 60px;
                height: 60px;
                border: 4px solid rgba(255,255,255,0.3);
                border-top: 4px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
        `;
        
        document.body.appendChild(loading);
    }

    // Hide loading indicator
    hideLoading() {
        const loading = document.getElementById('ui-loading');
        if (loading) {
            document.body.removeChild(loading);
        }
    }

    // Get current screen
    getCurrentScreen() {
        return this.currentScreen;
    }

    // Check if modal is open
    isModalOpen() {
        return Object.values(this.modals).some(modal => 
            modal && !modal.classList.contains('hidden')
        );
    }
}

// Create global UI manager instance
window.UI = new UIManager();

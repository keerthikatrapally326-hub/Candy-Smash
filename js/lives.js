// Lives and monetization system for Candy Smash game

class LivesManager {
    constructor() {
        this.maxLives = 5;
        this.lifeRegenTime = 30 * 60 * 1000; // 30 minutes in milliseconds
        this.currentLives = this.maxLives;
        this.lastLifeLostTime = null;
        this.regenTimer = null;
        
        // Monetization settings
        this.prices = {
            lives_5: 0.99,
            lives_unlimited_1h: 1.99,
            remove_ads: 2.99,
            booster_pack: 1.49,
            mega_booster_pack: 2.99
        };
        
        this.loadLivesData();
        this.startRegenTimer();
    }

    // Load lives data from storage
    loadLivesData() {
        try {
            const data = localStorage.getItem('candy_smash_lives');
            if (data) {
                const livesData = JSON.parse(data);
                this.currentLives = livesData.currentLives || this.maxLives;
                this.lastLifeLostTime = livesData.lastLifeLostTime;
                
                // Calculate lives that should have regenerated
                if (this.lastLifeLostTime && this.currentLives < this.maxLives) {
                    const timePassed = Date.now() - this.lastLifeLostTime;
                    const livesToRegen = Math.floor(timePassed / this.lifeRegenTime);
                    
                    if (livesToRegen > 0) {
                        this.currentLives = Math.min(this.maxLives, this.currentLives + livesToRegen);
                        this.lastLifeLostTime = this.currentLives >= this.maxLives ? null : 
                            this.lastLifeLostTime + (livesToRegen * this.lifeRegenTime);
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load lives data:', error);
            this.currentLives = this.maxLives;
        }
    }

    // Save lives data to storage
    saveLivesData() {
        try {
            const data = {
                currentLives: this.currentLives,
                lastLifeLostTime: this.lastLifeLostTime
            };
            localStorage.setItem('candy_smash_lives', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save lives data:', error);
        }
    }

    // Get current lives count
    getLives() {
        return this.currentLives;
    }

    // Check if player has lives
    hasLives() {
        return this.currentLives > 0;
    }

    // Use a life (when starting a level)
    useLife() {
        if (this.currentLives > 0) {
            this.currentLives--;
            
            // Start regeneration timer if this was the first life lost
            if (this.currentLives === this.maxLives - 1) {
                this.lastLifeLostTime = Date.now();
            }
            
            this.saveLivesData();
            this.updateUI();
            return true;
        }
        return false;
    }

    // Add lives (from purchase or reward)
    addLives(amount) {
        this.currentLives = Math.min(this.maxLives, this.currentLives + amount);
        
        // Reset regen timer if at max lives
        if (this.currentLives >= this.maxLives) {
            this.lastLifeLostTime = null;
        }
        
        this.saveLivesData();
        this.updateUI();
    }

    // Get time until next life regenerates
    getTimeToNextLife() {
        if (this.currentLives >= this.maxLives || !this.lastLifeLostTime) {
            return 0;
        }
        
        const timePassed = Date.now() - this.lastLifeLostTime;
        const timeToNext = this.lifeRegenTime - (timePassed % this.lifeRegenTime);
        
        return Math.max(0, timeToNext);
    }

    // Get formatted time string
    getFormattedTimeToNext() {
        const timeMs = this.getTimeToNextLife();
        if (timeMs === 0) return "Full";
        
        const minutes = Math.floor(timeMs / (60 * 1000));
        const seconds = Math.floor((timeMs % (60 * 1000)) / 1000);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Start regeneration timer
    startRegenTimer() {
        if (this.regenTimer) {
            clearInterval(this.regenTimer);
        }
        
        this.regenTimer = setInterval(() => {
            if (this.currentLives < this.maxLives && this.lastLifeLostTime) {
                const timePassed = Date.now() - this.lastLifeLostTime;
                
                if (timePassed >= this.lifeRegenTime) {
                    this.currentLives++;
                    this.lastLifeLostTime += this.lifeRegenTime;
                    
                    if (this.currentLives >= this.maxLives) {
                        this.lastLifeLostTime = null;
                    }
                    
                    this.saveLivesData();
                    this.updateUI();
                    
                    // Show notification
                    if (window.UI) {
                        window.UI.showNotification('❤️ Life restored!');
                    }
                }
            }
            
            this.updateUI();
        }, 1000);
    }

    // Update UI elements
    updateUI() {
        // Update lives display
        const livesDisplay = document.getElementById('lives-count');
        if (livesDisplay) {
            livesDisplay.textContent = this.currentLives;
        }
        
        // Update lives indicator
        const livesIndicator = document.getElementById('lives-indicator');
        if (livesIndicator) {
            livesIndicator.innerHTML = '';
            
            for (let i = 0; i < this.maxLives; i++) {
                const heart = document.createElement('span');
                heart.className = 'life-heart';
                heart.textContent = i < this.currentLives ? '❤️' : '🤍';
                livesIndicator.appendChild(heart);
            }
        }
        
        // Update timer display
        const timerDisplay = document.getElementById('life-timer');
        if (timerDisplay) {
            timerDisplay.textContent = this.getFormattedTimeToNext();
        }
        
        // Update play button state
        const playButton = document.getElementById('play-btn');
        if (playButton) {
            playButton.disabled = !this.hasLives();
            playButton.textContent = this.hasLives() ? 'Play' : 'No Lives';
        }
    }

    // Show out of lives modal
    showOutOfLivesModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'out-of-lives-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Out of Lives!</h2>
                <div class="lives-status">
                    <div class="lives-display">
                        <span class="lives-icon">💔</span>
                        <p>You're out of lives!</p>
                    </div>
                    <div class="regen-info">
                        <p>Next life in: <span id="modal-timer">${this.getFormattedTimeToNext()}</span></p>
                        <div class="lives-progress">
                            <div class="progress-bar">
                                <div id="life-progress-fill" class="progress-fill"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="lives-options">
                    <button id="watch-ad-life" class="modal-btn ad-btn">
                        📺 Watch Ad for 1 Life
                    </button>
                    <button id="buy-lives" class="modal-btn purchase-btn">
                        💰 Buy 5 Lives - $${this.prices.lives_5}
                    </button>
                    <button id="unlimited-lives" class="modal-btn premium-btn">
                        ⏰ Unlimited Lives 1h - $${this.prices.lives_unlimited_1h}
                    </button>
                </div>
                
                <div class="modal-buttons">
                    <button id="wait-for-life" class="modal-btn">Wait</button>
                    <button id="back-to-menu-lives" class="modal-btn">Back to Menu</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup event listeners
        this.setupOutOfLivesModalEvents(modal);
        
        // Update timer in modal
        const updateModalTimer = () => {
            const modalTimer = document.getElementById('modal-timer');
            const progressFill = document.getElementById('life-progress-fill');
            
            if (modalTimer && progressFill) {
                modalTimer.textContent = this.getFormattedTimeToNext();
                
                const timeToNext = this.getTimeToNextLife();
                const progress = timeToNext > 0 ? 
                    ((this.lifeRegenTime - timeToNext) / this.lifeRegenTime) * 100 : 100;
                progressFill.style.width = `${progress}%`;
                
                if (this.currentLives > 0) {
                    this.hideOutOfLivesModal();
                }
            }
        };
        
        const modalTimerInterval = setInterval(updateModalTimer, 1000);
        modal.dataset.timerInterval = modalTimerInterval;
        
        updateModalTimer();
    }

    // Setup out of lives modal events
    setupOutOfLivesModalEvents(modal) {
        // Watch ad for life
        modal.querySelector('#watch-ad-life')?.addEventListener('click', () => {
            window.Ads.showRewardedAd(
                () => {
                    this.addLives(1);
                    window.UI.showNotification('❤️ Free life earned!');
                    this.hideOutOfLivesModal();
                },
                (reason) => {
                    window.UI.showNotification('Ad not available right now');
                }
            );
        });
        
        // Buy 5 lives
        modal.querySelector('#buy-lives')?.addEventListener('click', () => {
            this.purchaseLives(5);
        });
        
        // Buy unlimited lives
        modal.querySelector('#unlimited-lives')?.addEventListener('click', () => {
            this.purchaseUnlimitedLives();
        });
        
        // Wait for life
        modal.querySelector('#wait-for-life')?.addEventListener('click', () => {
            this.hideOutOfLivesModal();
        });
        
        // Back to menu
        modal.querySelector('#back-to-menu-lives')?.addEventListener('click', () => {
            this.hideOutOfLivesModal();
            window.UI.showScreen('menu');
        });
    }

    // Hide out of lives modal
    hideOutOfLivesModal() {
        const modal = document.getElementById('out-of-lives-modal');
        if (modal) {
            // Clear timer
            const timerInterval = modal.dataset.timerInterval;
            if (timerInterval) {
                clearInterval(parseInt(timerInterval));
            }
            
            document.body.removeChild(modal);
        }
    }

    // Purchase lives
    purchaseLives(amount) {
        const price = this.prices.lives_5;
        const confirmed = confirm(`Purchase ${amount} lives for $${price}?`);
        
        if (confirmed) {
            // Mock purchase - in real app, integrate with payment processor
            this.addLives(amount);
            window.UI.showNotification(`💰 ${amount} lives purchased!`);
            this.hideOutOfLivesModal();
            
            // Track purchase for analytics
            this.trackPurchase('lives', amount, price);
        }
    }

    // Purchase unlimited lives for 1 hour
    purchaseUnlimitedLives() {
        const price = this.prices.lives_unlimited_1h;
        const confirmed = confirm(`Get unlimited lives for 1 hour for $${price}?`);
        
        if (confirmed) {
            // Set unlimited lives timer
            const unlimitedEnd = Date.now() + (60 * 60 * 1000); // 1 hour
            localStorage.setItem('unlimited_lives_end', unlimitedEnd.toString());
            
            this.currentLives = this.maxLives;
            this.lastLifeLostTime = null;
            this.saveLivesData();
            
            window.UI.showNotification('⏰ Unlimited lives for 1 hour!');
            this.hideOutOfLivesModal();
            
            this.trackPurchase('unlimited_lives', 1, price);
        }
    }

    // Check if unlimited lives is active
    hasUnlimitedLives() {
        const unlimitedEnd = localStorage.getItem('unlimited_lives_end');
        if (unlimitedEnd) {
            const endTime = parseInt(unlimitedEnd);
            if (Date.now() < endTime) {
                return true;
            } else {
                localStorage.removeItem('unlimited_lives_end');
            }
        }
        return false;
    }

    // Override use life if unlimited is active
    useLifeWithUnlimited() {
        if (this.hasUnlimitedLives()) {
            return true; // Don't consume lives during unlimited period
        }
        return this.useLife();
    }

    // Track purchase for analytics
    trackPurchase(item, quantity, price) {
        try {
            const purchases = JSON.parse(localStorage.getItem('candy_smash_purchases') || '[]');
            purchases.push({
                item,
                quantity,
                price,
                timestamp: Date.now()
            });
            localStorage.setItem('candy_smash_purchases', JSON.stringify(purchases));
            
            console.log(`Purchase tracked: ${item} x${quantity} for $${price}`);
        } catch (error) {
            console.warn('Failed to track purchase:', error);
        }
    }

    // Get purchase history
    getPurchaseHistory() {
        try {
            return JSON.parse(localStorage.getItem('candy_smash_purchases') || '[]');
        } catch (error) {
            return [];
        }
    }

    // Get total spent
    getTotalSpent() {
        const purchases = this.getPurchaseHistory();
        return purchases.reduce((total, purchase) => total + purchase.price, 0);
    }

    // Daily bonus system
    checkDailyBonus() {
        const lastBonus = localStorage.getItem('last_daily_bonus');
        const today = new Date().toDateString();
        
        if (lastBonus !== today) {
            // Give daily bonus
            this.addLives(1);
            localStorage.setItem('last_daily_bonus', today);
            
            window.UI.showNotification('🎁 Daily bonus: +1 Life!');
            return true;
        }
        
        return false;
    }

    // Friend lives system (mock)
    requestLivesFromFriends() {
        window.UI.showNotification('💌 Life requests sent to friends!');
        
        // Mock receiving lives after some time
        setTimeout(() => {
            if (Math.random() > 0.5) {
                this.addLives(1);
                window.UI.showNotification('❤️ Friend sent you a life!');
            }
        }, 30000); // 30 seconds for demo
    }

    // Send life to friend (mock)
    sendLifeToFriend(friendId) {
        window.UI.showNotification('❤️ Life sent to friend!');
        // In real implementation, this would use social features
    }

    // Get lives status for UI
    getLivesStatus() {
        return {
            current: this.currentLives,
            max: this.maxLives,
            timeToNext: this.getTimeToNextLife(),
            formattedTime: this.getFormattedTimeToNext(),
            hasUnlimited: this.hasUnlimitedLives(),
            canPlay: this.hasLives() || this.hasUnlimitedLives()
        };
    }

    // Cleanup
    destroy() {
        if (this.regenTimer) {
            clearInterval(this.regenTimer);
        }
    }
}

// Export for use in other modules
window.LivesManager = LivesManager;

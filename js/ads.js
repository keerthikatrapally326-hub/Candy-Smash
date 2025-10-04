// Ad system for Candy Smash game - Monetization hooks

class AdManager {
    constructor() {
        this.adProviders = {
            ADMOB: 'admob',
            UNITY: 'unity',
            ADSENSE: 'adsense'
        };
        
        this.adTypes = {
            BANNER: 'banner',
            INTERSTITIAL: 'interstitial',
            REWARDED: 'rewarded'
        };
        
        this.isInitialized = false;
        this.currentProvider = null;
        this.adCallbacks = {};
        
        // Mock ad data for testing
        this.mockAds = {
            showRate: 0.8, // 80% show rate
            rewardRate: 0.9 // 90% completion rate for rewarded ads
        };
        
        this.initialize();
    }

    // Initialize ad system
    initialize() {
        // In a real implementation, you would initialize your ad SDK here
        console.log('Ad system initialized');
        this.isInitialized = true;
        
        // Simulate ad provider detection
        this.detectAdProvider();
        
        // Setup banner ads
        this.setupBannerAds();
    }

    // Detect available ad provider
    detectAdProvider() {
        // Mock detection - in real app, check for SDK availability
        if (window.admob) {
            this.currentProvider = this.adProviders.ADMOB;
        } else if (window.unityAds) {
            this.currentProvider = this.adProviders.UNITY;
        } else if (window.googletag) {
            this.currentProvider = this.adProviders.ADSENSE;
        } else {
            console.log('No ad provider detected - using mock ads');
            this.currentProvider = 'mock';
        }
    }

    // Setup banner ads
    setupBannerAds() {
        const bannerContainer = document.getElementById('banner-ad');
        if (bannerContainer) {
            // Mock banner ad
            this.showBannerAd(bannerContainer);
        }
    }

    // Show banner ad
    showBannerAd(container) {
        if (!this.isInitialized) return false;
        
        // Mock banner ad implementation
        container.innerHTML = `
            <div style="
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                padding: 10px;
                text-align: center;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
            " onclick="window.Ads.handleAdClick('banner')">
                🎮 Play More Games Like This! Click Here 🎮
            </div>
        `;
        
        return true;
    }

    // Show interstitial ad
    showInterstitialAd(callback) {
        if (!this.isInitialized) {
            if (callback) callback(false);
            return false;
        }
        
        console.log('Showing interstitial ad...');
        
        // Mock interstitial ad
        const shouldShow = Math.random() < this.mockAds.showRate;
        
        if (shouldShow) {
            this.createMockInterstitial(callback);
        } else {
            console.log('Interstitial ad not available');
            if (callback) callback(false);
        }
        
        return shouldShow;
    }

    // Show rewarded video ad
    showRewardedAd(rewardCallback, failCallback) {
        if (!this.isInitialized) {
            if (failCallback) failCallback('not_initialized');
            return false;
        }
        
        console.log('Showing rewarded ad...');
        
        // Mock rewarded ad
        const shouldShow = Math.random() < this.mockAds.showRate;
        
        if (shouldShow) {
            this.createMockRewardedAd(rewardCallback, failCallback);
        } else {
            console.log('Rewarded ad not available');
            if (failCallback) failCallback('not_available');
        }
        
        return shouldShow;
    }

    // Create mock interstitial ad
    createMockInterstitial(callback) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; max-width: 400px; padding: 20px;">
                <h2>🎮 Advertisement 🎮</h2>
                <p>This is a mock interstitial ad</p>
                <div style="margin: 20px 0;">
                    <div style="width: 300px; height: 200px; background: linear-gradient(45deg, #667eea, #764ba2); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 24px;">Mock Ad Content</span>
                    </div>
                </div>
                <button id="close-ad" style="
                    background: #ff4757;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                ">Close Ad (3s)</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const closeButton = overlay.querySelector('#close-ad');
        let countdown = 3;
        
        const timer = setInterval(() => {
            countdown--;
            closeButton.textContent = `Close Ad (${countdown}s)`;
            
            if (countdown <= 0) {
                clearInterval(timer);
                closeButton.textContent = 'Close Ad';
                closeButton.disabled = false;
                closeButton.onclick = () => {
                    document.body.removeChild(overlay);
                    if (callback) callback(true);
                };
            }
        }, 1000);
        
        closeButton.disabled = true;
    }

    // Create mock rewarded ad
    createMockRewardedAd(rewardCallback, failCallback) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; max-width: 400px; padding: 20px;">
                <h2>🎁 Rewarded Video 🎁</h2>
                <p>Watch this ad to earn your reward!</p>
                <div style="margin: 20px 0;">
                    <div style="width: 300px; height: 200px; background: linear-gradient(45deg, #4facfe, #00f2fe); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                        <span style="font-size: 24px;">🎬</span>
                        <span id="video-timer" style="font-size: 18px; margin-top: 10px;">30s</span>
                    </div>
                </div>
                <div>
                    <button id="claim-reward" style="
                        background: #2ed573;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        margin-right: 10px;
                        display: none;
                    ">Claim Reward</button>
                    <button id="skip-ad" style="
                        background: #ff4757;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">Skip</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const timerElement = overlay.querySelector('#video-timer');
        const claimButton = overlay.querySelector('#claim-reward');
        const skipButton = overlay.querySelector('#skip-ad');
        
        let timeLeft = 30;
        
        const timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `${timeLeft}s`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                timerElement.textContent = 'Complete!';
                claimButton.style.display = 'inline-block';
                skipButton.textContent = 'Close';
            }
        }, 1000);
        
        claimButton.onclick = () => {
            document.body.removeChild(overlay);
            if (rewardCallback) rewardCallback();
        };
        
        skipButton.onclick = () => {
            clearInterval(timer);
            document.body.removeChild(overlay);
            if (timeLeft > 0 && failCallback) {
                failCallback('skipped');
            } else if (rewardCallback) {
                rewardCallback();
            }
        };
    }

    // Handle ad click
    handleAdClick(adType) {
        console.log(`Ad clicked: ${adType}`);
        
        // In a real implementation, this would track clicks and potentially
        // open the advertiser's page or app store
        
        // Mock behavior - show a message
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ed573;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 9999;
            font-family: Arial, sans-serif;
        `;
        message.textContent = 'Ad clicked! (Mock behavior)';
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                document.body.removeChild(message);
            }
        }, 3000);
    }

    // Check if ads are available
    isAdAvailable(adType) {
        if (!this.isInitialized) return false;
        
        // Mock availability check
        return Math.random() < this.mockAds.showRate;
    }

    // Set ad callbacks
    setAdCallback(event, callback) {
        this.adCallbacks[event] = callback;
    }

    // Trigger ad events
    triggerAdEvent(event, data = {}) {
        if (this.adCallbacks[event]) {
            this.adCallbacks[event](data);
        }
    }

    // Show ad based on game events
    showAdForEvent(eventType) {
        switch (eventType) {
            case 'level_complete':
                // Show interstitial every few levels
                if (Math.random() < 0.3) {
                    this.showInterstitialAd();
                }
                break;
                
            case 'game_over':
                // Show interstitial on game over
                if (Math.random() < 0.5) {
                    this.showInterstitialAd();
                }
                break;
                
            case 'app_start':
                // Show banner on app start
                this.setupBannerAds();
                break;
        }
    }

    // Purchase removal of ads (mock implementation)
    purchaseAdRemoval() {
        return new Promise((resolve) => {
            // Mock purchase dialog
            const confirmed = confirm('Remove ads for $2.99?');
            
            if (confirmed) {
                // In real implementation, integrate with payment processor
                localStorage.setItem('ads_removed', 'true');
                console.log('Ads removed!');
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    // Check if ads are removed
    areAdsRemoved() {
        return localStorage.getItem('ads_removed') === 'true';
    }

    // Get ad revenue estimation (for analytics)
    getRevenueEstimate() {
        // Mock revenue calculation
        const sessions = parseInt(localStorage.getItem('game_sessions') || '0');
        const estimatedRevenue = sessions * 0.02; // $0.02 per session
        
        return {
            sessions,
            estimatedRevenue: estimatedRevenue.toFixed(2)
        };
    }
}

// Create global ad manager instance
window.Ads = new AdManager();

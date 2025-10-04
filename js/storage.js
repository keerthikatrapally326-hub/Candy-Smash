// Local storage management for Candy Smash game

class StorageManager {
    constructor() {
        this.storageKey = 'candy_smash_game_data';
        this.levelKey = 'candy_smash_levels';
        this.settingsKey = 'candy_smash_settings';
    }

    // Save game data
    saveGameData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Failed to save game data:', error);
            return false;
        }
    }

    // Load game data
    getGameData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Failed to load game data:', error);
            return null;
        }
    }

    // Save level progress
    saveLevelProgress(level, score, stars) {
        try {
            const levelData = this.getLevelData() || {};
            
            if (!levelData[level] || levelData[level].score < score) {
                levelData[level] = {
                    score: score,
                    stars: stars,
                    completed: true,
                    completedAt: Date.now()
                };
            }
            
            localStorage.setItem(this.levelKey, JSON.stringify(levelData));
            return true;
        } catch (error) {
            console.warn('Failed to save level progress:', error);
            return false;
        }
    }

    // Get level data
    getLevelData() {
        try {
            const data = localStorage.getItem(this.levelKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.warn('Failed to load level data:', error);
            return {};
        }
    }

    // Check if level is unlocked
    isLevelUnlocked(level) {
        if (level === 1) return true;
        
        const levelData = this.getLevelData();
        return levelData[level - 1] && levelData[level - 1].completed;
    }

    // Get level stars
    getLevelStars(level) {
        const levelData = this.getLevelData();
        return levelData[level] ? levelData[level].stars : 0;
    }

    // Get highest unlocked level
    getHighestLevel() {
        const levelData = this.getLevelData();
        let highest = 1;
        
        for (let level = 1; level <= 100; level++) {
            if (this.isLevelUnlocked(level)) {
                highest = level;
            } else {
                break;
            }
        }
        
        return highest;
    }

    // Save settings
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.warn('Failed to save settings:', error);
            return false;
        }
    }

    // Load settings
    getSettings() {
        try {
            const data = localStorage.getItem(this.settingsKey);
            return data ? JSON.parse(data) : {
                soundVolume: 0.8,
                musicVolume: 0.7,
                notifications: true,
                vibration: true
            };
        } catch (error) {
            console.warn('Failed to load settings:', error);
            return {
                soundVolume: 0.8,
                musicVolume: 0.7,
                notifications: true,
                vibration: true
            };
        }
    }

    // Clear all data
    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.levelKey);
            localStorage.removeItem(this.settingsKey);
            return true;
        } catch (error) {
            console.warn('Failed to clear data:', error);
            return false;
        }
    }

    // Export data for backup
    exportData() {
        return {
            gameData: this.getGameData(),
            levelData: this.getLevelData(),
            settings: this.getSettings()
        };
    }

    // Import data from backup
    importData(data) {
        try {
            if (data.gameData) {
                this.saveGameData(data.gameData);
            }
            if (data.levelData) {
                localStorage.setItem(this.levelKey, JSON.stringify(data.levelData));
            }
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            return true;
        } catch (error) {
            console.warn('Failed to import data:', error);
            return false;
        }
    }
}

// Create global storage manager instance
window.Storage = new StorageManager();

// Advanced level system for Candy Smash game

class LevelManager {
    constructor() {
        this.worlds = this.initializeWorlds();
        this.currentWorld = 1;
        this.maxLevel = 50;
        
        // Load progress from storage
        this.unlockedLevels = this.loadProgress();
        
        // Difficulty scaling parameters
        this.difficultyConfig = {
            baseScore: 1000,
            baseMoves: 30,
            baseColors: 4,
            maxColors: 6,
            scoreMultiplier: 1.15,  // Gentler scaling
            moveReduction: 0.95,    // Gradual move reduction
            colorIncreaseRate: 0.1  // Slower color increase
        };
        
        // Objective types
        this.objectiveTypes = {
            SCORE: 'score',
            COLLECT: 'collect',
            CLEAR_JELLY: 'clear_jelly',
            CLEAR_CHOCOLATE: 'clear_chocolate',
            CLEAR_ICE: 'clear_ice',
            COLLECT_INGREDIENTS: 'collect_ingredients',
            TIMED_SCORE: 'timed_score',
            CLEAR_BLOCKERS: 'clear_blockers'
        };
        
        // Blocker types
        this.blockerTypes = {
            JELLY: 'jelly',
            CHOCOLATE: 'chocolate',
            ICE: 'ice',
            LICORICE: 'licorice',
            BOMB: 'bomb',
            CAGE: 'cage',
            MYSTERY: 'mystery'
        };
        
        this.generateAllLevels();
    }

    // Load level progress from storage
    loadProgress() {
        const saved = localStorage.getItem('candySmash_levelProgress');
        if (saved) {
            return JSON.parse(saved);
        }
        // Level 1 is always unlocked
        return { 1: { unlocked: true, completed: false, stars: 0, bestScore: 0 } };
    }

    // Save level progress to storage
    saveProgress() {
        localStorage.setItem('candySmash_levelProgress', JSON.stringify(this.unlockedLevels));
    }

    // Check if a level is unlocked
    isLevelUnlocked(levelNumber) {
        return this.unlockedLevels[levelNumber] && this.unlockedLevels[levelNumber].unlocked;
    }

    // Check if a level is completed
    isLevelCompleted(levelNumber) {
        return this.unlockedLevels[levelNumber] && this.unlockedLevels[levelNumber].completed;
    }

    // Unlock next level
    unlockNextLevel(currentLevel) {
        const nextLevel = currentLevel + 1;
        if (nextLevel <= this.maxLevel) {
            if (!this.unlockedLevels[nextLevel]) {
                this.unlockedLevels[nextLevel] = { unlocked: false, completed: false, stars: 0, bestScore: 0 };
            }
            this.unlockedLevels[nextLevel].unlocked = true;
            this.saveProgress();
            console.log(`🔓 Level ${nextLevel} unlocked!`);
        }
    }

    // Complete a level
    completeLevel(levelNumber, score, moves) {
        if (!this.unlockedLevels[levelNumber]) {
            this.unlockedLevels[levelNumber] = { unlocked: true, completed: false, stars: 0, bestScore: 0 };
        }
        
        const levelData = this.unlockedLevels[levelNumber];
        levelData.completed = true;
        levelData.bestScore = Math.max(levelData.bestScore, score);
        
        // Calculate stars based on performance
        const level = this.getLevel(levelNumber);
        const stars = this.calculateStars(score, moves, level);
        levelData.stars = Math.max(levelData.stars, stars);
        
        this.unlockNextLevel(levelNumber);
        this.saveProgress();
        
        return { stars, isNewRecord: score > (levelData.bestScore || 0) };
    }

    // Calculate stars based on performance
    calculateStars(score, movesLeft, level) {
        const scoreRatio = score / level.targetScore;
        const moveRatio = movesLeft / level.moves;
        
        if (scoreRatio >= 2.0 && moveRatio >= 0.5) return 3; // Excellent
        if (scoreRatio >= 1.5 && moveRatio >= 0.3) return 2; // Good
        if (scoreRatio >= 1.0) return 1; // Pass
        return 0; // Failed
    }

    // Initialize world themes
    initializeWorlds() {
        return {
            1: {
                name: "Candy Meadow",
                theme: "meadow",
                background: "linear-gradient(135deg, #a8e6cf, #dcedc8)",
                levels: [1, 20],
                music: "meadow_theme",
                description: "Sweet beginnings in the candy fields"
            },
            2: {
                name: "Chocolate Forest",
                theme: "forest",
                background: "linear-gradient(135deg, #8d6e63, #a1887f)",
                levels: [21, 40],
                music: "forest_theme",
                description: "Dark chocolate woods with mysterious treats"
            },
            3: {
                name: "Ice Cream Mountains",
                theme: "ice",
                background: "linear-gradient(135deg, #b3e5fc, #e1f5fe)",
                levels: [41, 60],
                music: "ice_theme",
                description: "Frozen peaks of vanilla and mint"
            },
            4: {
                name: "Gummy Bear Kingdom",
                theme: "gummy",
                background: "linear-gradient(135deg, #f8bbd9, #f48fb1)",
                levels: [61, 80],
                music: "gummy_theme",
                description: "Bouncy realm of chewy delights"
            },
            5: {
                name: "Rainbow Candy Castle",
                theme: "rainbow",
                background: "linear-gradient(135deg, #ff9a9e, #fecfef, #fecfef)",
                levels: [81, 100],
                music: "castle_theme",
                description: "The ultimate candy challenge awaits"
            }
        };
    }

    // Generate all level configurations
    generateAllLevels() {
        this.levels = {};
        
        for (let levelNum = 1; levelNum <= this.maxLevel; levelNum++) {
            this.levels[levelNum] = this.generateLevelConfig(levelNum);
        }
    }

    // Generate individual level configuration
    generateLevelConfig(levelNumber) {
        const world = this.getWorldForLevel(levelNumber);
        const worldData = this.worlds[world];
        
        // Calculate difficulty parameters with proper scaling
        const targetScore = Math.floor(this.difficultyConfig.baseScore * Math.pow(this.difficultyConfig.scoreMultiplier, levelNumber - 1));
        const moveLimit = Math.max(15, Math.floor(this.difficultyConfig.baseMoves * Math.pow(this.difficultyConfig.moveReduction, (levelNumber - 1) / 5)));
        const candyColors = Math.min(this.difficultyConfig.maxColors, this.difficultyConfig.baseColors + Math.floor((levelNumber - 1) * this.difficultyConfig.colorIncreaseRate));
        const gridSize = 8; // Keep consistent grid size
        
        // Determine objective type based on level
        const objective = this.determineObjective(levelNumber);
        
        // Add blockers based on world and difficulty
        const blockers = this.generateBlockers(levelNumber, world);
        
        // Special mechanics for certain levels
        const specialMechanics = this.getSpecialMechanics(levelNumber);
        
        return {
            id: levelNumber,
            world: world,
            worldName: worldData.name,
            theme: worldData.theme,
            background: worldData.background,
            music: worldData.music,
            
            // Grid configuration
            gridSize: gridSize,
            candyColors: candyColors,
            
            // Objectives
            objective: objective,
            targetScore: targetScore,
            moveLimit: moveLimit,
            timeLimit: objective.type === this.objectiveTypes.TIMED_SCORE ? 60 : null,
            
            // Obstacles and blockers
            blockers: blockers,
            blockerPositions: this.generateBlockerPositions(gridSize, blockers),
            
            // Special features
            specialMechanics: specialMechanics,
            
            // Rewards
            starThresholds: this.calculateStarThresholds(targetScore),
            rewards: this.generateRewards(levelNumber),
            
            // Difficulty metadata
            difficulty: this.calculateDifficulty(levelNumber),
            estimatedPlayTime: this.estimatePlayTime(levelNumber)
        };
    }

    // Calculate target score with difficulty scaling
    calculateTargetScore(levelNumber) {
        const baseScore = this.difficultyConfig.baseScore;
        const multiplier = Math.pow(this.difficultyConfig.scoreMultiplier, Math.floor((levelNumber - 1) / 5));
        const worldBonus = this.getWorldForLevel(levelNumber) * 500;
        
        return Math.floor(baseScore * multiplier + worldBonus);
    }

    // Calculate move limit with difficulty scaling
    calculateMoveLimit(levelNumber) {
        const baseMoves = this.difficultyConfig.baseMoves;
        const reduction = Math.floor(levelNumber * this.difficultyConfig.moveReduction);
        const minMoves = 10;
        
        return Math.max(baseMoves - reduction, minMoves);
    }

    // Calculate number of candy colors
    calculateCandyColors(levelNumber) {
        const baseColors = this.difficultyConfig.baseColors;
        const maxColors = this.difficultyConfig.maxColors;
        const increaseRate = this.difficultyConfig.colorIncreaseRate;
        
        const colors = baseColors + Math.floor(levelNumber * increaseRate);
        return Math.min(colors, maxColors);
    }

    // Calculate grid size based on level
    calculateGridSize(levelNumber) {
        if (levelNumber <= 10) return 8;
        if (levelNumber <= 30) return 8;
        if (levelNumber <= 50) return 9;
        if (levelNumber <= 70) return 8; // Back to 8 but with more complexity
        return 9;
    }

    // Determine objective type for level
    determineObjective(levelNumber) {
        const world = this.getWorldForLevel(levelNumber);
        const levelInWorld = levelNumber - (world - 1) * 20;
        
        // Level patterns within each world
        if (levelInWorld <= 5) {
            return {
                type: this.objectiveTypes.SCORE,
                description: `Reach ${this.calculateTargetScore(levelNumber)} points`,
                target: this.calculateTargetScore(levelNumber)
            };
        } else if (levelInWorld <= 10) {
            const candyType = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'][levelNumber % 6];
            const collectAmount = Math.floor(15 + levelNumber * 0.5);
            return {
                type: this.objectiveTypes.COLLECT,
                description: `Collect ${collectAmount} ${candyType} candies`,
                target: collectAmount,
                candyType: candyType
            };
        } else if (levelInWorld <= 15) {
            return {
                type: this.objectiveTypes.CLEAR_JELLY,
                description: "Clear all jelly squares",
                target: "all"
            };
        } else if (levelInWorld <= 18) {
            return {
                type: this.objectiveTypes.CLEAR_CHOCOLATE,
                description: "Stop the chocolate from spreading",
                target: "all"
            };
        } else {
            // Boss levels - multiple objectives
            return {
                type: this.objectiveTypes.CLEAR_BLOCKERS,
                description: "Clear all obstacles and reach target score",
                target: "mixed",
                scoreTarget: this.calculateTargetScore(levelNumber)
            };
        }
    }

    // Generate blockers for level
    generateBlockers(levelNumber, world) {
        const blockers = [];
        
        // Introduce blockers gradually
        if (levelNumber >= 6) blockers.push(this.blockerTypes.JELLY);
        if (levelNumber >= 12) blockers.push(this.blockerTypes.ICE);
        if (levelNumber >= 18) blockers.push(this.blockerTypes.CHOCOLATE);
        if (levelNumber >= 25) blockers.push(this.blockerTypes.LICORICE);
        if (levelNumber >= 35) blockers.push(this.blockerTypes.BOMB);
        if (levelNumber >= 45) blockers.push(this.blockerTypes.CAGE);
        if (levelNumber >= 60) blockers.push(this.blockerTypes.MYSTERY);
        
        // World-specific blockers
        switch (world) {
            case 2: // Chocolate Forest
                if (!blockers.includes(this.blockerTypes.CHOCOLATE)) {
                    blockers.push(this.blockerTypes.CHOCOLATE);
                }
                break;
            case 3: // Ice Cream Mountains
                if (!blockers.includes(this.blockerTypes.ICE)) {
                    blockers.push(this.blockerTypes.ICE);
                }
                break;
        }
        
        return blockers;
    }

    // Generate blocker positions on grid
    generateBlockerPositions(gridSize, blockers) {
        const positions = {};
        
        blockers.forEach(blockerType => {
            positions[blockerType] = [];
            
            switch (blockerType) {
                case this.blockerTypes.JELLY:
                    // Jelly in corners and edges
                    for (let i = 0; i < 8; i++) {
                        positions[blockerType].push({
                            x: Math.floor(Math.random() * gridSize),
                            y: Math.floor(Math.random() * gridSize)
                        });
                    }
                    break;
                    
                case this.blockerTypes.CHOCOLATE:
                    // Chocolate starts in center
                    const centerX = Math.floor(gridSize / 2);
                    const centerY = Math.floor(gridSize / 2);
                    positions[blockerType].push({ x: centerX, y: centerY });
                    break;
                    
                case this.blockerTypes.ICE:
                    // Ice in strategic positions
                    for (let i = 0; i < 4; i++) {
                        positions[blockerType].push({
                            x: Math.floor(Math.random() * gridSize),
                            y: Math.floor(Math.random() * gridSize)
                        });
                    }
                    break;
            }
        });
        
        return positions;
    }

    // Get special mechanics for level
    getSpecialMechanics(levelNumber) {
        const mechanics = [];
        
        if (levelNumber >= 20) mechanics.push('conveyor_belt');
        if (levelNumber >= 40) mechanics.push('teleporter');
        if (levelNumber >= 60) mechanics.push('gravity_switch');
        if (levelNumber >= 80) mechanics.push('moving_candies');
        
        return mechanics;
    }

    // Calculate star thresholds
    calculateStarThresholds(targetScore) {
        return {
            1: targetScore,
            2: Math.floor(targetScore * 1.5),
            3: Math.floor(targetScore * 2.0)
        };
    }

    // Generate level rewards
    generateRewards(levelNumber) {
        const rewards = {
            coins: Math.floor(50 + levelNumber * 5),
            experience: Math.floor(10 + levelNumber * 2)
        };
        
        // Special rewards for milestone levels
        if (levelNumber % 5 === 0) {
            rewards.boosters = {
                hammer: 1,
                swap: 1
            };
        }
        
        if (levelNumber % 10 === 0) {
            rewards.boosters = {
                hammer: 2,
                swap: 2,
                bomb: 1
            };
        }
        
        if (levelNumber % 20 === 0) {
            rewards.lives = 5;
            rewards.coins *= 2;
        }
        
        return rewards;
    }

    // Calculate overall difficulty rating
    calculateDifficulty(levelNumber) {
        const world = this.getWorldForLevel(levelNumber);
        const basedifficulty = world;
        const levelModifier = (levelNumber % 20) * 0.1;
        
        return Math.min(basedifficulty + levelModifier, 5);
    }

    // Estimate play time in seconds
    estimatePlayTime(levelNumber) {
        const baseMoves = this.calculateMoveLimit(levelNumber);
        const complexity = this.calculateDifficulty(levelNumber);
        
        return Math.floor(baseMoves * 3 + complexity * 30);
    }

    // Get world number for level
    getWorldForLevel(levelNumber) {
        return Math.ceil(levelNumber / 20);
    }

    // Get level configuration
    getLevel(levelNumber) {
        return this.levels[levelNumber] || null;
    }

    // Get all levels for a world
    getWorldLevels(worldNumber) {
        const startLevel = (worldNumber - 1) * 20 + 1;
        const endLevel = worldNumber * 20;
        const levels = [];
        
        for (let i = startLevel; i <= endLevel && i <= this.maxLevel; i++) {
            levels.push(this.levels[i]);
        }
        
        return levels;
    }

    // Check if level is unlocked
    isLevelUnlocked(levelNumber) {
        if (levelNumber === 1) return true;
        
        // Check if previous level is completed
        const prevLevelData = window.Storage.getLevelData()[levelNumber - 1];
        return prevLevelData && prevLevelData.completed;
    }

    // Get next level to play
    getNextLevel() {
        const levelData = window.Storage.getLevelData();
        
        for (let i = 1; i <= this.maxLevel; i++) {
            if (!levelData[i] || !levelData[i].completed) {
                return i;
            }
        }
        
        return this.maxLevel; // All levels completed
    }

    // Get world progress
    getWorldProgress(worldNumber) {
        const worldLevels = this.getWorldLevels(worldNumber);
        const levelData = window.Storage.getLevelData();
        
        let completed = 0;
        let totalStars = 0;
        
        worldLevels.forEach(level => {
            const data = levelData[level.id];
            if (data && data.completed) {
                completed++;
                totalStars += data.stars || 0;
            }
        });
        
        return {
            completed,
            total: worldLevels.length,
            percentage: Math.floor((completed / worldLevels.length) * 100),
            stars: totalStars,
            maxStars: worldLevels.length * 3
        };
    }

    // Get overall game progress
    getGameProgress() {
        const levelData = window.Storage.getLevelData();
        let completed = 0;
        let totalStars = 0;
        
        for (let i = 1; i <= this.maxLevel; i++) {
            const data = levelData[i];
            if (data && data.completed) {
                completed++;
                totalStars += data.stars || 0;
            }
        }
        
        return {
            completed,
            total: this.maxLevel,
            percentage: Math.floor((completed / this.maxLevel) * 100),
            stars: totalStars,
            maxStars: this.maxLevel * 3,
            currentWorld: this.getWorldForLevel(this.getNextLevel())
        };
    }

    // Validate level configuration
    validateLevel(levelConfig) {
        const required = ['id', 'gridSize', 'candyColors', 'objective', 'moveLimit'];
        
        for (const field of required) {
            if (!levelConfig[field]) {
                console.error(`Level ${levelConfig.id} missing required field: ${field}`);
                return false;
            }
        }
        
        return true;
    }

    // Debug: Get level statistics
    getLevelStats() {
        const stats = {
            totalLevels: this.maxLevel,
            worlds: Object.keys(this.worlds).length,
            averageDifficulty: 0,
            blockerDistribution: {},
            objectiveDistribution: {}
        };
        
        let totalDifficulty = 0;
        
        Object.values(this.levels).forEach(level => {
            totalDifficulty += level.difficulty;
            
            // Count blockers
            level.blockers.forEach(blocker => {
                stats.blockerDistribution[blocker] = (stats.blockerDistribution[blocker] || 0) + 1;
            });
            
            // Count objectives
            const objType = level.objective.type;
            stats.objectiveDistribution[objType] = (stats.objectiveDistribution[objType] || 0) + 1;
        });
        
        stats.averageDifficulty = totalDifficulty / this.maxLevel;
        
        return stats;
    }
}

// Export for use in other modules
window.LevelManager = LevelManager;

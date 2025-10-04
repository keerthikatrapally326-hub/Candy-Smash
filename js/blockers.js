// Blocker system for Candy Smash game

class BlockerManager {
    constructor(grid) {
        this.grid = grid;
        this.blockers = new Map(); // Position -> Blocker data
        this.blockerTypes = {
            JELLY: 'jelly',
            CHOCOLATE: 'chocolate',
            ICE: 'ice',
            LICORICE: 'licorice',
            BOMB: 'bomb',
            CAGE: 'cage',
            MYSTERY: 'mystery'
        };
        
        this.blockerBehaviors = this.initializeBlockerBehaviors();
    }

    // Initialize blocker behavior definitions
    initializeBlockerBehaviors() {
        return {
            [this.blockerTypes.JELLY]: {
                name: 'Jelly',
                emoji: '🟫',
                layers: 1,
                blocksMovement: false,
                blocksSpecialEffects: false,
                spreadable: false,
                clearCondition: 'match_over',
                description: 'Clear by making a match over it'
            },
            
            [this.blockerTypes.CHOCOLATE]: {
                name: 'Chocolate',
                emoji: '🍫',
                layers: 1,
                blocksMovement: true,
                blocksSpecialEffects: true,
                spreadable: true,
                spreadRate: 0.3,
                clearCondition: 'adjacent_match',
                description: 'Spreads each turn if not destroyed'
            },
            
            [this.blockerTypes.ICE]: {
                name: 'Ice',
                emoji: '🧊',
                layers: 2,
                blocksMovement: true,
                blocksSpecialEffects: false,
                spreadable: false,
                clearCondition: 'multiple_hits',
                description: 'Takes multiple hits to clear'
            },
            
            [this.blockerTypes.LICORICE]: {
                name: 'Licorice',
                emoji: '⬛',
                layers: 1,
                blocksMovement: true,
                blocksSpecialEffects: true,
                spreadable: false,
                clearCondition: 'adjacent_match',
                description: 'Blocks special candy effects'
            },
            
            [this.blockerTypes.BOMB]: {
                name: 'Bomb',
                emoji: '💣',
                layers: 1,
                blocksMovement: false,
                blocksSpecialEffects: false,
                spreadable: false,
                countdown: 5,
                clearCondition: 'match_or_time',
                description: 'Must be cleared before countdown reaches zero'
            },
            
            [this.blockerTypes.CAGE]: {
                name: 'Cage',
                emoji: '🔒',
                layers: 1,
                blocksMovement: true,
                blocksSpecialEffects: true,
                spreadable: false,
                clearCondition: 'adjacent_match',
                description: 'Candy is locked inside, free with adjacent match'
            },
            
            [this.blockerTypes.MYSTERY]: {
                name: 'Mystery Box',
                emoji: '❓',
                layers: 1,
                blocksMovement: false,
                blocksSpecialEffects: false,
                spreadable: false,
                clearCondition: 'match_over',
                description: 'Transforms into random candy or blocker when matched'
            }
        };
    }

    // Add blocker at position
    addBlocker(x, y, type, layers = null) {
        const key = `${x},${y}`;
        const behavior = this.blockerBehaviors[type];
        
        if (!behavior) {
            console.error(`Unknown blocker type: ${type}`);
            return false;
        }
        
        const blocker = {
            type: type,
            x: x,
            y: y,
            layers: layers || behavior.layers,
            maxLayers: behavior.layers,
            countdown: behavior.countdown || null,
            maxCountdown: behavior.countdown || null,
            behavior: behavior,
            id: Utils.generateId()
        };
        
        this.blockers.set(key, blocker);
        return true;
    }

    // Remove blocker at position
    removeBlocker(x, y) {
        const key = `${x},${y}`;
        return this.blockers.delete(key);
    }

    // Get blocker at position
    getBlocker(x, y) {
        const key = `${x},${y}`;
        return this.blockers.get(key) || null;
    }

    // Check if position has blocker
    hasBlocker(x, y) {
        return this.blockers.has(`${x},${y}`);
    }

    // Check if position blocks movement
    blocksMovement(x, y) {
        const blocker = this.getBlocker(x, y);
        return blocker && blocker.behavior.blocksMovement;
    }

    // Check if position blocks special effects
    blocksSpecialEffects(x, y) {
        const blocker = this.getBlocker(x, y);
        return blocker && blocker.behavior.blocksSpecialEffects;
    }

    // Process blocker hit (when matched over or adjacent)
    hitBlocker(x, y, hitType = 'match_over') {
        const blocker = this.getBlocker(x, y);
        if (!blocker) return null;
        
        const behavior = blocker.behavior;
        let cleared = false;
        let transformed = false;
        let result = null;
        
        // Check if this hit type can clear this blocker
        if (this.canClearWithHitType(blocker, hitType)) {
            if (behavior.layers > 1) {
                // Multi-layer blocker - reduce layers
                blocker.layers--;
                if (blocker.layers <= 0) {
                    cleared = true;
                }
            } else {
                // Single layer - clear immediately
                cleared = true;
            }
        }
        
        // Handle special blocker behaviors
        switch (blocker.type) {
            case this.blockerTypes.MYSTERY:
                if (cleared) {
                    result = this.transformMysteryBox(x, y);
                    transformed = true;
                }
                break;
                
            case this.blockerTypes.BOMB:
                if (cleared) {
                    result = this.explodeBomb(x, y);
                }
                break;
        }
        
        // Remove blocker if cleared
        if (cleared) {
            this.removeBlocker(x, y);
        }
        
        return {
            cleared,
            transformed,
            result,
            blocker: cleared ? null : blocker
        };
    }

    // Check if hit type can clear blocker
    canClearWithHitType(blocker, hitType) {
        const condition = blocker.behavior.clearCondition;
        
        switch (condition) {
            case 'match_over':
                return hitType === 'match_over';
            case 'adjacent_match':
                return hitType === 'adjacent_match' || hitType === 'match_over';
            case 'multiple_hits':
                return hitType === 'match_over' || hitType === 'adjacent_match';
            case 'match_or_time':
                return hitType === 'match_over' || hitType === 'adjacent_match' || hitType === 'timeout';
            default:
                return false;
        }
    }

    // Transform mystery box
    transformMysteryBox(x, y) {
        const outcomes = [
            { type: 'candy', weight: 60 },
            { type: 'special_candy', weight: 20 },
            { type: 'booster', weight: 15 },
            { type: 'blocker', weight: 5 }
        ];
        
        const totalWeight = outcomes.reduce((sum, outcome) => sum + outcome.weight, 0);
        const random = Math.random() * totalWeight;
        let currentWeight = 0;
        
        for (const outcome of outcomes) {
            currentWeight += outcome.weight;
            if (random <= currentWeight) {
                return this.generateMysteryOutcome(outcome.type, x, y);
            }
        }
        
        return this.generateMysteryOutcome('candy', x, y);
    }

    // Generate mystery box outcome
    generateMysteryOutcome(type, x, y) {
        switch (type) {
            case 'candy':
                const candyTypes = this.grid.candyTypes;
                const randomType = Utils.randomChoice(candyTypes);
                return {
                    type: 'candy',
                    candyType: randomType,
                    candy: this.grid.createCandy(randomType)
                };
                
            case 'special_candy':
                const specialTypes = ['striped-horizontal', 'striped-vertical', 'wrapped'];
                const randomSpecial = Utils.randomChoice(specialTypes);
                const randomCandyType = Utils.randomChoice(this.grid.candyTypes);
                return {
                    type: 'special_candy',
                    specialType: randomSpecial,
                    candy: this.grid.createCandy(randomCandyType, randomSpecial)
                };
                
            case 'booster':
                const boosters = ['hammer', 'swap', 'bomb'];
                const randomBooster = Utils.randomChoice(boosters);
                return {
                    type: 'booster',
                    boosterType: randomBooster,
                    amount: 1
                };
                
            case 'blocker':
                const blockerTypes = [this.blockerTypes.JELLY, this.blockerTypes.ICE];
                const randomBlocker = Utils.randomChoice(blockerTypes);
                return {
                    type: 'blocker',
                    blockerType: randomBlocker
                };
                
            default:
                return { type: 'nothing' };
        }
    }

    // Explode bomb
    explodeBomb(x, y) {
        const affectedPositions = [];
        
        // 3x3 explosion around bomb
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const newX = x + dx;
                const newY = y + dy;
                
                if (newX >= 0 && newX < this.grid.size && newY >= 0 && newY < this.grid.size) {
                    affectedPositions.push({ x: newX, y: newY });
                }
            }
        }
        
        return {
            type: 'explosion',
            positions: affectedPositions,
            damage: 1
        };
    }

    // Update blockers (called each turn)
    updateBlockers() {
        const updates = [];
        
        // Update countdowns and spreading
        this.blockers.forEach((blocker, key) => {
            const update = { blocker, changes: [] };
            
            // Update countdown
            if (blocker.countdown !== null) {
                blocker.countdown--;
                update.changes.push('countdown');
                
                if (blocker.countdown <= 0) {
                    if (blocker.type === this.blockerTypes.BOMB) {
                        // Bomb explodes
                        const explosion = this.explodeBomb(blocker.x, blocker.y);
                        update.changes.push('exploded');
                        update.explosion = explosion;
                        this.removeBlocker(blocker.x, blocker.y);
                    }
                }
            }
            
            // Handle spreading (chocolate)
            if (blocker.behavior.spreadable && Math.random() < blocker.behavior.spreadRate) {
                const spreadPositions = this.getSpreadPositions(blocker.x, blocker.y);
                if (spreadPositions.length > 0) {
                    const targetPos = Utils.randomChoice(spreadPositions);
                    this.addBlocker(targetPos.x, targetPos.y, blocker.type);
                    update.changes.push('spread');
                    update.spreadTo = targetPos;
                }
            }
            
            if (update.changes.length > 0) {
                updates.push(update);
            }
        });
        
        return updates;
    }

    // Get valid positions for spreading
    getSpreadPositions(x, y) {
        const positions = [];
        const directions = [
            { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
        ];
        
        directions.forEach(dir => {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            if (newX >= 0 && newX < this.grid.size && 
                newY >= 0 && newY < this.grid.size &&
                !this.hasBlocker(newX, newY) &&
                this.grid.getCandy(newX, newY)) {
                positions.push({ x: newX, y: newY });
            }
        });
        
        return positions;
    }

    // Process matches with blockers
    processMatchesWithBlockers(matches) {
        const blockerHits = [];
        const clearedBlockers = [];
        
        matches.forEach(match => {
            match.positions.forEach(pos => {
                // Hit blocker at match position
                const directHit = this.hitBlocker(pos.x, pos.y, 'match_over');
                if (directHit && directHit.cleared) {
                    clearedBlockers.push({ x: pos.x, y: pos.y, blocker: directHit.blocker });
                }
                
                // Hit adjacent blockers
                const adjacentPositions = Utils.getAdjacentPositions(pos.x, pos.y, this.grid.size);
                adjacentPositions.forEach(adjPos => {
                    const adjacentHit = this.hitBlocker(adjPos.x, adjPos.y, 'adjacent_match');
                    if (adjacentHit && adjacentHit.cleared) {
                        clearedBlockers.push({ x: adjPos.x, y: adjPos.y, blocker: adjacentHit.blocker });
                    }
                });
            });
        });
        
        return { blockerHits, clearedBlockers };
    }

    // Check level objectives related to blockers
    checkBlockerObjectives(objective) {
        let progress = 0;
        let total = 0;
        let completed = false;
        
        switch (objective.type) {
            case 'clear_jelly':
                const jellyBlockers = Array.from(this.blockers.values())
                    .filter(b => b.type === this.blockerTypes.JELLY);
                progress = 0; // All jelly must be cleared
                total = jellyBlockers.length;
                completed = total === 0;
                break;
                
            case 'clear_chocolate':
                const chocolateBlockers = Array.from(this.blockers.values())
                    .filter(b => b.type === this.blockerTypes.CHOCOLATE);
                progress = 0;
                total = chocolateBlockers.length;
                completed = total === 0;
                break;
                
            case 'clear_ice':
                const iceBlockers = Array.from(this.blockers.values())
                    .filter(b => b.type === this.blockerTypes.ICE);
                progress = 0;
                total = iceBlockers.length;
                completed = total === 0;
                break;
                
            case 'clear_blockers':
                const allBlockers = Array.from(this.blockers.values());
                progress = 0;
                total = allBlockers.length;
                completed = total === 0;
                break;
        }
        
        return { progress, total, completed };
    }

    // Get all blockers
    getAllBlockers() {
        return Array.from(this.blockers.values());
    }

    // Clear all blockers (for testing)
    clearAllBlockers() {
        this.blockers.clear();
    }

    // Get blocker count by type
    getBlockerCount(type) {
        return Array.from(this.blockers.values())
            .filter(b => b.type === type).length;
    }

    // Initialize blockers for level
    initializeBlockersForLevel(levelConfig) {
        this.clearAllBlockers();
        
        if (levelConfig.blockerPositions) {
            Object.entries(levelConfig.blockerPositions).forEach(([blockerType, positions]) => {
                positions.forEach(pos => {
                    this.addBlocker(pos.x, pos.y, blockerType);
                });
            });
        }
    }

    // Get blocker state for saving
    getState() {
        const state = {};
        this.blockers.forEach((blocker, key) => {
            state[key] = {
                type: blocker.type,
                x: blocker.x,
                y: blocker.y,
                layers: blocker.layers,
                countdown: blocker.countdown
            };
        });
        return state;
    }

    // Load blocker state
    loadState(state) {
        this.clearAllBlockers();
        Object.entries(state).forEach(([key, blockerData]) => {
            const blocker = this.addBlocker(blockerData.x, blockerData.y, blockerData.type);
            if (blocker) {
                const currentBlocker = this.getBlocker(blockerData.x, blockerData.y);
                currentBlocker.layers = blockerData.layers;
                currentBlocker.countdown = blockerData.countdown;
            }
        });
    }
}

// Export for use in other modules
window.BlockerManager = BlockerManager;

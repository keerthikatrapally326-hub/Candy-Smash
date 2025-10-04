// Main game engine for Candy Smash

class Game {
    constructor() {
        console.log('🎮 Creating Game instance...');
        this.grid = new Grid(8);
        console.log('✅ Grid created');
        this.levelManager = new LevelManager();
        console.log('✅ LevelManager created');
        this.blockerManager = new BlockerManager(this.grid);
        console.log('✅ BlockerManager created');
        this.livesManager = new LivesManager();
        console.log('✅ LivesManager created');
        
        this.score = 0;
        this.level = 1;
        this.moves = 30;
        this.targetScore = 1000;
        this.isPlaying = false;
        this.isPaused = false;
        this.selectedCandy = null;
        this.isProcessing = false;
        this.combo = 0;
        this.maxCombo = 0;
        
        // Current level configuration
        this.currentLevelConfig = null;
        
        // Objective tracking
        this.objectiveProgress = {
            score: 0,
            collected: {},
            jelliesCleared: 0,
            chocolateCleared: 0,
            iceCleared: 0,
            blockersCleared: 0
        };
        
        // Game state
        this.gameState = {
            MENU: 'menu',
            PLAYING: 'playing',
            PAUSED: 'paused',
            LEVEL_COMPLETE: 'level_complete',
            GAME_OVER: 'game_over'
        };
        this.currentState = this.gameState.MENU;
        
        // Scoring system
        this.baseScore = {
            3: 100,
            4: 200,
            5: 500,
            6: 1000
        };
        
        // Special candy combinations
        this.specialCombos = {
            STRIPED_STRIPED: 'striped_striped',
            STRIPED_WRAPPED: 'striped_wrapped',
            WRAPPED_WRAPPED: 'wrapped_wrapped',
            COLOR_BOMB_STRIPED: 'color_bomb_striped',
            COLOR_BOMB_WRAPPED: 'color_bomb_wrapped',
            COLOR_BOMB_COLOR_BOMB: 'color_bomb_color_bomb'
        };
        
        // Level objectives
        this.objectives = {
            SCORE: 'score',
            CLEAR_JELLIES: 'clear_jellies',
            COLLECT_INGREDIENTS: 'collect_ingredients',
            CLEAR_BLOCKERS: 'clear_blockers'
        };
        
        // Boosters
        this.boosters = {
            hammer: { count: 3, cost: 100 },
            swap: { count: 2, cost: 200 },
            bomb: { count: 1, cost: 300 }
        };
        
        this.activeBoosters = new Set();
        
        // Initialize game
        this.initialize();
    }

    // Initialize game
    initialize() {
        this.loadGameData();
        this.setupEventListeners();
        this.updateUI();
    }

    // Load saved game data
    loadGameData() {
        const savedData = Storage.getGameData();
        if (savedData) {
            this.level = savedData.level || 1;
            this.boosters = { ...this.boosters, ...savedData.boosters };
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Touch/mouse events for candy selection
        document.addEventListener('pointerdown', this.handlePointerDown.bind(this));
        document.addEventListener('pointermove', this.handlePointerMove.bind(this));
        document.addEventListener('pointerup', this.handlePointerUp.bind(this));
        
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Window events
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('beforeunload', this.saveGameData.bind(this));
    }

    // Start new game
    startGame(levelNumber = 1) {
        // Check if player has lives
        if (!this.livesManager.hasLives() && !this.livesManager.hasUnlimitedLives()) {
            this.livesManager.showOutOfLivesModal();
            return false;
        }
        
        // Use a life
        this.livesManager.useLifeWithUnlimited();
        
        this.level = levelNumber;
        this.loadLevel(levelNumber);
        this.currentState = this.gameState.PLAYING;
        this.isPlaying = true;
        this.isPaused = false;
        this.selectedCandy = null;
        this.isProcessing = false;
        this.combo = 0;
        
        // Reset objective progress
        this.resetObjectiveProgress();
        
        // Initialize grid with level configuration
        this.initializeGridForLevel();
        
        // Initialize blockers
        this.blockerManager.initializeBlockersForLevel(this.currentLevelConfig);
        
        // Update UI
        this.updateUI();
        this.renderGrid();
        this.updateObjectiveDisplay();
        
        // Start background music
        Audio.playMusic('background');
        
        // Apply level theme
        this.applyLevelTheme();
        
        console.log(`Started level ${levelNumber}`, this.currentLevelConfig);
        return true;
    }

    // Load level configuration
    loadLevel(levelNumber) {
        this.currentLevelConfig = this.levelManager.getLevel(levelNumber);
        
        if (!this.currentLevelConfig) {
            console.error(`Level ${levelNumber} not found`);
            return;
        }
        
        this.moves = this.currentLevelConfig.moveLimit;
        this.targetScore = this.currentLevelConfig.targetScore;
        this.score = 0;
        
        // Set level-specific objectives
        this.currentObjective = this.currentLevelConfig.objective;
        
        // Update grid size and candy colors
        this.grid = new Grid(this.currentLevelConfig.gridSize);
        this.grid.candyTypes = this.grid.candyTypes.slice(0, this.currentLevelConfig.candyColors);
        
        // Update blocker manager reference
        this.blockerManager.grid = this.grid;
    }

    // Reset objective progress
    resetObjectiveProgress() {
        this.objectiveProgress = {
            score: 0,
            collected: {},
            jelliesCleared: 0,
            chocolateCleared: 0,
            iceCleared: 0,
            blockersCleared: 0
        };
        
        // Initialize collected candies tracking
        this.grid.candyTypes.forEach(type => {
            this.objectiveProgress.collected[type] = 0;
        });
    }

    // Initialize grid for level
    initializeGridForLevel() {
        this.grid.initialize();
        this.grid.fillGrid();
    }

    // Apply level theme
    applyLevelTheme() {
        if (this.currentLevelConfig && this.currentLevelConfig.background) {
            document.body.style.background = this.currentLevelConfig.background;
        }
    }

    // Handle pointer down (touch/mouse)
    handlePointerDown(event) {
        if (!this.isPlaying || this.isProcessing || this.isPaused) return;
        
        const candy = this.getCandyFromEvent(event);
        if (candy) {
            this.selectCandy(candy);
        }
    }

    // Handle pointer move
    handlePointerMove(event) {
        if (!this.isPlaying || this.isProcessing || this.isPaused) return;
        
        if (this.selectedCandy) {
            const candy = this.getCandyFromEvent(event);
            if (candy && candy !== this.selectedCandy) {
                const pos1 = this.getCandyPosition(this.selectedCandy);
                const pos2 = this.getCandyPosition(candy);
                
                if (Utils.areAdjacent(pos1, pos2)) {
                    this.attemptSwap(pos1, pos2);
                }
            }
        }
    }

    // Handle pointer up
    handlePointerUp(event) {
        // Handle single tap/click if no drag occurred
        if (this.selectedCandy) {
            const candy = this.getCandyFromEvent(event);
            if (candy === this.selectedCandy) {
                // Same candy clicked - keep selection or handle booster
                if (this.activeBoosters.has('hammer')) {
                    this.useHammerBooster(candy);
                }
            }
        }
    }

    // Handle keyboard input
    handleKeyDown(event) {
        switch (event.key) {
            case 'Escape':
                if (this.isPlaying) {
                    this.pauseGame();
                }
                break;
            case ' ':
                event.preventDefault();
                if (this.isPaused) {
                    this.resumeGame();
                } else if (this.isPlaying) {
                    this.pauseGame();
                }
                break;
        }
    }

    // Handle window resize
    handleResize() {
        this.renderGrid();
    }

    // Get candy element from event
    getCandyFromEvent(event) {
        const element = document.elementFromPoint(event.clientX, event.clientY);
        return element && element.classList.contains('candy') ? element : null;
    }

    // Get candy position from element
    getCandyPosition(candyElement) {
        const x = parseInt(candyElement.dataset.x);
        const y = parseInt(candyElement.dataset.y);
        return { x, y };
    }

    // Select candy
    selectCandy(candyElement) {
        // Clear previous selection
        if (this.selectedCandy) {
            this.selectedCandy.classList.remove('selected');
        }
        
        // Select new candy
        this.selectedCandy = candyElement;
        candyElement.classList.add('selected');
        
        // Play selection sound
        Audio.playSound('select');
        
        // Vibrate on mobile
        Utils.vibrate(50);
    }

    // Attempt to swap candies
    async attemptSwap(pos1, pos2) {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        
        // First, perform the visual swap immediately
        const candy1Element = this.getCandyElement(pos1.x, pos1.y);
        const candy2Element = this.getCandyElement(pos2.x, pos2.y);
        
        // Swap in grid data
        this.grid.swapCandies(pos1, pos2);
        
        // Animate the swap visually
        await this.animateSwap(candy1Element, candy2Element);
        
        // Play swap sound
        Audio.playSound('swap');
        
        // Update visual grid
        this.renderGrid();
        
        // Now check if this swap creates valid matches
        const matches1 = this.grid.findMatchesAt(pos1.x, pos1.y);
        const matches2 = this.grid.findMatchesAt(pos2.x, pos2.y);
        const hasValidMatches = matches1.length >= 3 || matches2.length >= 3;
        
        if (hasValidMatches) {
            // Valid swap - keep it and process matches
            this.moves--;
            this.updateUI();
            
            // Process matches and cascades
            await this.processMatches();
            
            // Check win/lose conditions after processing
            this.checkGameEnd();
        } else {
            // Invalid swap - swap back with animation
            await Utils.wait(300); // Brief pause to show the invalid state
            
            // Swap back in grid data
            this.grid.swapCandies(pos1, pos2);
            
            // Animate swap back
            await this.animateSwap(candy2Element, candy1Element);
            
            // Update visual grid
            this.renderGrid();
            
            // Play invalid sound
            Audio.playSound('invalid');
            
            // Shake animation for feedback
            candy1Element.classList.add('shake');
            candy2Element.classList.add('shake');
            
            setTimeout(() => {
                candy1Element.classList.remove('shake');
                candy2Element.classList.remove('shake');
            }, 500);
        }
        
        // Clear selection
        if (this.selectedCandy) {
            this.selectedCandy.classList.remove('selected');
            this.selectedCandy = null;
        }
        
        this.isProcessing = false;
    }


    // Animate candy swap
    async animateSwap(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        
        const deltaX = rect2.left - rect1.left;
        const deltaY = rect2.top - rect1.top;
        
        // Apply transforms
        element1.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        element2.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
        element1.style.zIndex = '100';
        element2.style.zIndex = '100';
        
        // Wait for animation
        await Utils.wait(300);
        
        // Reset transforms
        element1.style.transform = '';
        element2.style.transform = '';
        element1.style.zIndex = '';
        element2.style.zIndex = '';
    }


    // Process all matches and cascades
    async processMatches() {
        let matchesFound = true;
        this.combo = 0;
        
        while (matchesFound) {
            const matches = this.grid.findAllMatches();
            
            
            if (matches.length > 0) {
                this.combo++;
                
                // Animate matching candies
                await this.animateMatches(matches);
                
                // Process blockers affected by matches
                const blockerResults = this.blockerManager.processMatchesWithBlockers(matches);
                
                // Track objective progress from matches
                this.trackObjectiveProgress(matches, blockerResults);
                
                // Remove matches and calculate score
                const { removedCandies, specialCandyType } = this.grid.removeMatches(matches);
                this.calculateScore(matches, this.combo);
                
                // Create special candies if applicable
                if (specialCandyType && matches.length > 0) {
                    const centerPos = matches[0].positions[Math.floor(matches[0].positions.length / 2)];
                    this.grid.createSpecialCandy(centerPos.x, centerPos.y, specialCandyType, matches[0].type);
                }
                
                // Apply gravity
                const movements = this.grid.applyGravity();
                await this.animateGravity(movements);
                
                // Fill empty spaces
                const newCandies = this.grid.fillEmptySpaces();
                await this.animateNewCandies(newCandies);
                
                // Update blockers (spreading, countdowns)
                const blockerUpdates = this.blockerManager.updateBlockers();
                
                // Update display
                this.renderGrid();
                
                // Play match sound
                Audio.playSound('match');
                
                // Show combo if > 1
                if (this.combo > 1) {
                    this.showComboEffect(this.combo);
                }
                
                await Utils.wait(800); // Slower cascading
            } else {
                matchesFound = false;
            }
        }
        
        // Update max combo
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        // Update objective progress display
        this.updateObjectiveDisplay();
    }

    // Animate matching candies
    async animateMatches(matches) {
        const promises = [];
        
        matches.forEach(match => {
            match.positions.forEach(pos => {
                const element = this.getCandyElement(pos.x, pos.y);
                if (element) {
                    element.classList.add('matching');
                    promises.push(Utils.animateElement(element, 'matching', 800));
                }
            });
        });
        
        await Promise.all(promises);
    }

    // Animate gravity (falling candies)
    async animateGravity(movements) {
        const promises = [];
        
        movements.forEach(movement => {
            const element = this.getCandyElement(movement.from.x, movement.from.y);
            if (element) {
                promises.push(Utils.animateElement(element, 'falling', 600));
            }
        });
        
        await Promise.all(promises);
    }

    // Animate new candies appearing
    async animateNewCandies(newCandies) {
        const promises = [];
        
        newCandies.forEach(item => {
            const element = this.getCandyElement(item.position.x, item.position.y);
            if (element) {
                // Add delay for staggered appearance
                const delay = item.delay || 0;
                promises.push(
                    Utils.wait(delay).then(() => 
                        Utils.animateElement(element, 'falling', 700)
                    )
                );
            }
        });
        
        await Promise.all(promises);
    }

    // Calculate and add score with juicy feedback
    calculateScore(matches, combo) {
        let totalScore = 0;
        
        matches.forEach(match => {
            const baseScore = match.length * 10;
            const comboMultiplier = Math.max(1, combo);
            const matchScore = baseScore * comboMultiplier;
            totalScore += matchScore;
            
            // Show floating score popup for each match
            const centerPos = match.positions[Math.floor(match.positions.length / 2)];
            this.createFloatingScore(matchScore, centerPos.x, centerPos.y, combo);
        });
        
        this.score += totalScore;
        
        // Show combo popup if combo > 1
        if (combo > 1) {
            this.createComboPopup(combo);
        }
        
        // Update UI with animation
        this.updateUI();
        this.animateScoreUpdate(totalScore);
        
        // Check win condition after scoring
        this.checkGameEnd();
    }

    // Create floating score popup
    createFloatingScore(score, gridX, gridY, combo = 1) {
        const gameBoard = document.querySelector('.game-board');
        const boardRect = gameBoard.getBoundingClientRect();
        
        // Calculate position on screen
        const cellSize = boardRect.width / this.grid.size;
        const x = boardRect.left + (gridX * cellSize) + (cellSize / 2);
        const y = boardRect.top + (gridY * cellSize) + (cellSize / 2);
        
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        if (combo > 2) popup.classList.add('combo');
        if (score > 100) popup.classList.add('big-score');
        
        popup.textContent = `+${score}`;
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
        
        document.body.appendChild(popup);
        
        // Remove after animation
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1500);
    }

    // Create combo popup
    createComboPopup(combo) {
        const popup = document.createElement('div');
        popup.className = 'score-popup combo';
        popup.textContent = `COMBO x${combo}!`;
        popup.style.left = '50%';
        popup.style.top = '30%';
        popup.style.transform = 'translateX(-50%)';
        popup.style.fontSize = '3rem';
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 2000);
    }

    // Animate score update in UI
    animateScoreUpdate(scoreIncrease) {
        const scoreElement = document.getElementById('current-score');
        if (scoreElement) {
            scoreElement.style.transform = 'scale(1.2)';
            scoreElement.style.color = '#FFD700';
            
            setTimeout(() => {
                scoreElement.style.transform = 'scale(1)';
                scoreElement.style.color = '';
            }, 300);
        }
    }

    // Show score popup (legacy method)
    showScorePopup(score, position) {
        const popup = document.getElementById('score-popup');
        const candyElement = this.getCandyElement(position.x, position.y);
        
        if (popup && candyElement) {
            const rect = candyElement.getBoundingClientRect();
            popup.textContent = `+${Utils.formatNumber(score)}`;
            popup.style.left = `${rect.left + rect.width / 2}px`;
            popup.style.top = `${rect.top}px`;
            popup.classList.remove('hidden');
            
            setTimeout(() => {
                popup.classList.add('hidden');
            }, 1000);
        }
    }

    // Show combo effect
    showComboEffect(combo) {
        // Create combo text effect
        const comboText = `${combo}x COMBO!`;
        Particles.createTextEffect(comboText, window.innerWidth / 2, window.innerHeight / 2);
        
        // Play combo sound
        Audio.playSound('combo');
    }

    // Use hammer booster
    useHammerBooster(candyElement) {
        if (this.boosters.hammer.count <= 0) return;
        
        const position = this.getCandyPosition(candyElement);
        
        // Remove candy
        this.grid.setCandy(position.x, position.y, null);
        this.boosters.hammer.count--;
        this.activeBoosters.delete('hammer');
        
        // Update display
        this.renderGrid();
        this.updateUI();
        
        // Play booster sound
        Audio.playSound('booster');
        
        // Process cascades
        this.processMatches();
    }

    // Activate booster
    activateBooster(boosterType) {
        if (this.boosters[boosterType].count <= 0) return false;
        
        // Toggle booster
        if (this.activeBoosters.has(boosterType)) {
            this.activeBoosters.delete(boosterType);
        } else {
            this.activeBoosters.clear(); // Only one booster at a time
            this.activeBoosters.add(boosterType);
        }
        
        this.updateUI();
        return true;
    }

    // Track objective progress
    trackObjectiveProgress(matches, blockerResults) {
        if (!this.currentObjective) return;
        
        const objective = this.currentObjective;
        
        switch (objective.type) {
            case 'score':
                this.objectiveProgress.score = this.score;
                break;
                
            case 'collect':
                matches.forEach(match => {
                    if (match.type === objective.candyType) {
                        this.objectiveProgress.collected[objective.candyType] += match.positions.length;
                    }
                });
                break;
                
            case 'clear_jelly':
            case 'clear_chocolate':
            case 'clear_ice':
            case 'clear_blockers':
                if (blockerResults.clearedBlockers) {
                    blockerResults.clearedBlockers.forEach(cleared => {
                        switch (cleared.blocker.type) {
                            case 'jelly':
                                this.objectiveProgress.jelliesCleared++;
                                break;
                            case 'chocolate':
                                this.objectiveProgress.chocolateCleared++;
                                break;
                            case 'ice':
                                this.objectiveProgress.iceCleared++;
                                break;
                        }
                        this.objectiveProgress.blockersCleared++;
                    });
                }
                break;
        }
    }

    // Update objective display
    updateObjectiveDisplay() {
        const objectiveText = document.getElementById('objective-text');
        if (!objectiveText) return;
        
        // Simple objective display for now
        const remaining = Math.max(0, this.targetScore - this.score);
        if (remaining > 0) {
            objectiveText.textContent = `Reach ${Utils.formatNumber(this.targetScore)} points! (${Utils.formatNumber(remaining)} to go)`;
        } else {
            objectiveText.textContent = 'Target reached! 🎉';
        }
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progress = Math.min(100, (this.score / this.targetScore) * 100);
            progressFill.style.width = `${progress}%`;
        }
    }

    // Check for game end conditions
    checkGameEnd() {
        if (!this.isPlaying) return;

        // Check win condition - target score reached
        if (this.score >= this.targetScore) {
            this.levelComplete();
            return;
        }

        // Check lose condition - no moves left
        if (this.moves <= 0) {
            this.gameOver();
            return;
        }
    }

    // Handle level completion
    levelComplete() {
        this.isPlaying = false;
        this.currentState = this.gameState.LEVEL_COMPLETE;
        
        console.log(`🎉 Level ${this.level} completed! Score: ${this.score}, Moves left: ${this.moves}`);
        
        // Calculate performance and unlock next level
        const result = this.levelManager.completeLevel(this.level, this.score, this.moves);
        
        // Show level complete modal
        this.showLevelCompleteModal(result);
        
        // Play victory sound
        Audio.playSound('victory');
    }

    // Handle game over
    gameOver() {
        this.isPlaying = false;
        this.currentState = this.gameState.GAME_OVER;
        
        console.log(`💀 Game Over! Level ${this.level}, Final Score: ${this.score}`);
        
        // Show game over modal
        this.showGameOverModal();
        
        // Play game over sound
        Audio.playSound('gameOver');
    }

    // Show level complete modal
    showLevelCompleteModal(result) {
        const modal = document.getElementById('level-complete');
        if (!modal) return;

        // Update modal content
        const scoreElement = modal.querySelector('#final-score');
        const starsElement = modal.querySelector('#stars-earned');
        const nextLevelBtn = modal.querySelector('#next-level-btn');
        const replayBtn = modal.querySelector('#replay-level-btn');

        if (scoreElement) scoreElement.textContent = Utils.formatNumber(this.score);
        if (starsElement) {
            starsElement.innerHTML = '⭐'.repeat(result.stars) + '☆'.repeat(3 - result.stars);
        }

        // Enable/disable next level button
        if (nextLevelBtn) {
            const nextLevel = this.level + 1;
            if (nextLevel <= this.levelManager.maxLevel && this.levelManager.isLevelUnlocked(nextLevel)) {
                nextLevelBtn.disabled = false;
                nextLevelBtn.onclick = () => {
                    modal.classList.add('hidden');
                    this.startGame(nextLevel);
                };
            } else {
                nextLevelBtn.disabled = true;
            }
        }

        // Setup replay button
        if (replayBtn) {
            replayBtn.onclick = () => {
                modal.classList.add('hidden');
                this.startGame(this.level);
            };
        }

        modal.classList.remove('hidden');
    }

    // Show game over modal
    showGameOverModal() {
        const modal = document.getElementById('game-over');
        if (!modal) return;

        // Update modal content
        const scoreElement = modal.querySelector('#game-over-score');
        const levelElement = modal.querySelector('#game-over-level');
        const retryBtn = modal.querySelector('#retry-btn');
        const menuBtn = modal.querySelector('#menu-btn');

        if (scoreElement) scoreElement.textContent = Utils.formatNumber(this.score);
        if (levelElement) levelElement.textContent = this.level;

        // Setup retry button
        if (retryBtn) {
            retryBtn.onclick = () => {
                modal.classList.add('hidden');
                this.startGame(this.level);
            };
        }

        // Setup menu button
        if (menuBtn) {
            menuBtn.onclick = () => {
                modal.classList.add('hidden');
                if (window.UI) {
                    window.UI.showScreen('menu');
                }
            };
        }

        modal.classList.remove('hidden');
    }

    // Check if level objectives are complete
    checkObjectiveComplete() {
        if (!this.currentObjective) return false;
        
        const objective = this.currentObjective;
        
        switch (objective.type) {
            case 'score':
                return this.score >= objective.target;
                
            case 'collect':
                const collected = this.objectiveProgress.collected[objective.candyType] || 0;
                return collected >= objective.target;
                
            case 'clear_jelly':
                return this.blockerManager.getBlockerCount('jelly') === 0;
                
            case 'clear_chocolate':
                return this.blockerManager.getBlockerCount('chocolate') === 0;
                
            case 'clear_ice':
                return this.blockerManager.getBlockerCount('ice') === 0;
                
            case 'clear_blockers':
                const allBlockersCleared = this.blockerManager.getAllBlockers().length === 0;
                const scoreReached = this.score >= (objective.scoreTarget || this.targetScore);
                return allBlockersCleared && scoreReached;
                
            default:
                return false;
        }
    }

    // Check game end conditions
    checkGameEnd() {
        if (this.checkObjectiveComplete()) {
            this.levelComplete();
        } else if (this.moves <= 0) {
            this.gameOver();
        }
    }

    // Level complete
    levelComplete() {
        this.isPlaying = false;
        this.currentState = this.gameState.LEVEL_COMPLETE;
        
        // Calculate stars based on score
        const stars = this.calculateStars();
        
        // Save progress
        Storage.saveLevelProgress(this.level, this.score, stars);
        
        // Show completion modal
        UI.showLevelComplete(this.score, stars);
        
        // Play victory sound
        Audio.playSound('victory');
        
        console.log(`Level ${this.level} completed with ${stars} stars!`);
    }

    // Calculate stars earned
    calculateStars() {
        const scoreRatio = this.score / this.targetScore;
        if (scoreRatio >= 2) return 3;
        if (scoreRatio >= 1.5) return 2;
        return 1;
    }

    // Game over
    gameOver() {
        this.isPlaying = false;
        this.currentState = this.gameState.GAME_OVER;
        
        // Show game over modal
        UI.showGameOver();
        
        // Play game over sound
        Audio.playSound('game_over');
        
        console.log('Game Over!');
    }

    // Pause game
    pauseGame() {
        if (!this.isPlaying) return;
        
        this.isPaused = true;
        this.currentState = this.gameState.PAUSED;
        
        // Show pause modal
        UI.showPauseMenu();
        
        // Pause audio
        Audio.pauseMusic();
    }

    // Resume game
    resumeGame() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        this.currentState = this.gameState.PLAYING;
        
        // Hide pause modal
        UI.hidePauseMenu();
        
        // Resume audio
        Audio.resumeMusic();
    }

    // Restart level
    restartLevel() {
        this.startGame(this.level);
    }

    // Get candy element by grid position
    getCandyElement(x, y) {
        return document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    }

    // Update candy element
    updateCandyElement(element, x, y) {
        const candy = this.grid.getCandy(x, y);
        if (candy && element) {
            element.dataset.x = x;
            element.dataset.y = y;
            element.className = `candy ${candy.type}`;
            if (candy.special) {
                element.classList.add(candy.special);
            }
            element.textContent = candy.emoji;
        }
    }

    // Render entire grid
    renderGrid() {
        console.log('🎨 Rendering grid...');
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) {
            console.error('❌ Game board element not found!');
            return;
        }
        
        gameBoard.innerHTML = '';
        console.log(`📐 Grid size: ${this.grid.size}x${this.grid.size}`);
        
        for (let y = 0; y < this.grid.size; y++) {
            for (let x = 0; x < this.grid.size; x++) {
                const candy = this.grid.getCandy(x, y);
                const candyElement = Utils.createElement('div', ['candy']);
                
                candyElement.dataset.x = x;
                candyElement.dataset.y = y;
                
                if (candy) {
                    candyElement.classList.add(candy.type);
                    if (candy.special) {
                        candyElement.classList.add(candy.special);
                    }
                    candyElement.textContent = candy.emoji;
                } else {
                    candyElement.classList.add('empty');
                }
                
                // Add click event listener for candy interaction
                candyElement.addEventListener('click', (e) => {
                    this.handleCandyClick(x, y, e);
                });
                
                gameBoard.appendChild(candyElement);
            }
        }
        console.log('✅ Grid rendered successfully!');
    }

    // Handle candy click
    handleCandyClick(x, y, event) {
        if (!this.isPlaying || this.isProcessing) return;
        
        console.log(`🖱️ Candy clicked at (${x},${y})`);
        
        const candyElement = event.target;
        const candy = this.grid.getCandy(x, y);
        
        if (!candy) return;
        
        if (this.selectedCandy) {
            const selectedPos = {
                x: parseInt(this.selectedCandy.dataset.x),
                y: parseInt(this.selectedCandy.dataset.y)
            };
            
            const clickedPos = { x, y };
            
            // Check if clicking the same candy (deselect)
            if (selectedPos.x === clickedPos.x && selectedPos.y === clickedPos.y) {
                this.selectedCandy.classList.remove('selected');
                this.selectedCandy = null;
                console.log('🔄 Candy deselected');
                return;
            }
            
            // Check if candies are adjacent
            if (Utils.areAdjacent(selectedPos, clickedPos)) {
                console.log(`🔄 Attempting swap: (${selectedPos.x},${selectedPos.y}) <-> (${clickedPos.x},${clickedPos.y})`);
                this.attemptSwap(selectedPos, clickedPos);
            } else {
                // Select new candy
                this.selectedCandy.classList.remove('selected');
                this.selectedCandy = candyElement;
                candyElement.classList.add('selected');
                console.log(`🎯 New candy selected at (${x},${y})`);
            }
        } else {
            // First selection
            this.selectedCandy = candyElement;
            candyElement.classList.add('selected');
            console.log(`🎯 First candy selected at (${x},${y})`);
        }
    }

    // Update UI elements
    updateUI() {
        // Update score in header
        const scoreElement = document.getElementById('current-score');
        if (scoreElement) {
            scoreElement.textContent = Utils.formatNumber(this.score);
        }
        
        // Update score in progress stats
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            const oldScore = scoreDisplay.textContent;
            const newScore = Utils.formatNumber(this.score);
            if (oldScore !== newScore) {
                scoreDisplay.textContent = newScore;
                // Add visual feedback for score change
                scoreDisplay.classList.add('updated');
                setTimeout(() => scoreDisplay.classList.remove('updated'), 300);
            }
        }
        
        // Update level
        const levelElement = document.getElementById('current-level');
        if (levelElement) {
            levelElement.textContent = this.level;
        }
        
        // Update moves in header
        const movesElement = document.getElementById('moves-left');
        if (movesElement) {
            movesElement.textContent = this.moves;
            movesElement.style.color = this.moves <= 5 ? '#ff4757' : '';
        }
        
        // Update moves in progress stats
        const movesDisplay = document.getElementById('moves-display');
        if (movesDisplay) {
            const oldMoves = movesDisplay.textContent;
            const newMoves = this.moves.toString();
            if (oldMoves !== newMoves) {
                movesDisplay.textContent = newMoves;
                movesDisplay.style.color = this.moves <= 5 ? '#ff4757' : '';
                // Add visual feedback for moves change
                movesDisplay.classList.add('updated');
                setTimeout(() => movesDisplay.classList.remove('updated'), 300);
            }
        }
        
        // Update target score
        const targetDisplay = document.getElementById('target-display');
        if (targetDisplay) {
            targetDisplay.textContent = Utils.formatNumber(this.targetScore);
        }
        
        // Update target score
        const targetElement = document.getElementById('target-score');
        if (targetElement) {
            targetElement.textContent = Utils.formatNumber(this.targetScore);
        }
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progress = Math.min(100, (this.score / this.targetScore) * 100);
            progressFill.style.width = `${progress}%`;
        }
        
        // Update booster counts
        Object.keys(this.boosters).forEach(boosterType => {
            const countElement = document.querySelector(`[data-booster="${boosterType}"] .booster-count`);
            if (countElement) {
                countElement.textContent = this.boosters[boosterType].count;
            }
            
            const buttonElement = document.querySelector(`[data-booster="${boosterType}"]`);
            if (buttonElement) {
                buttonElement.classList.toggle('active', this.activeBoosters.has(boosterType));
            }
        });
    }

    // Save game data
    saveGameData() {
        const gameData = {
            level: this.level,
            boosters: this.boosters,
            maxCombo: this.maxCombo
        };
        Storage.saveGameData(gameData);
    }

    // Get game statistics
    getStats() {
        return {
            level: this.level,
            score: this.score,
            moves: this.moves,
            combo: this.combo,
            maxCombo: this.maxCombo
        };
    }
}

// Export for use in other modules
window.Game = Game;

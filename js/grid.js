// Grid system for Candy Smash game

class Grid {
    constructor(size = 8) {
        this.size = size;
        this.grid = [];
        this.candyTypes = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        this.candyShapes = {
            red: 'heart',      // Red heart like in logo
            blue: 'drop',      // Blue teardrop like in logo  
            green: 'square',   // Green square like in logo
            yellow: 'star',    // Yellow star like in logo
            purple: 'diamond', // Purple diamond
            orange: 'swirl'    // Orange swirl like in logo
        };
        this.candyEmojis = {
            red: '❤️',
            blue: '💧',
            green: '🟩',
            yellow: '⭐',
            purple: '💎',
            orange: '🌀'
        };
        this.specialCandies = {
            STRIPED_HORIZONTAL: 'striped-horizontal',
            STRIPED_VERTICAL: 'striped-vertical',
            WRAPPED: 'wrapped',
            COLOR_BOMB: 'color-bomb'
        };
        this.initialize();
    }

    // Initialize empty grid
    initialize() {
        this.grid = [];
        for (let y = 0; y < this.size; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.size; x++) {
                this.grid[y][x] = null;
            }
        }
    }

    // Fill grid with random candies, ensuring no initial matches
    fillGrid() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.grid[y][x] === null) {
                    this.grid[y][x] = this.generateSafeCandy(x, y);
                }
            }
        }
    }

    // Generate a candy that won't create immediate matches
    generateSafeCandy(x, y) {
        const availableTypes = [...this.candyTypes];
        
        // Remove types that would create horizontal matches
        if (x >= 2) {
            const leftType1 = this.getCandyType(x - 1, y);
            const leftType2 = this.getCandyType(x - 2, y);
            if (leftType1 === leftType2 && leftType1) {
                Utils.removeFromArray(availableTypes, leftType1);
            }
        }
        
        // Remove types that would create vertical matches
        if (y >= 2) {
            const upType1 = this.getCandyType(x, y - 1);
            const upType2 = this.getCandyType(x, y - 2);
            if (upType1 === upType2 && upType1) {
                Utils.removeFromArray(availableTypes, upType1);
            }
        }
        
        // If no safe types available, use random type
        if (availableTypes.length === 0) {
            availableTypes.push(...this.candyTypes);
        }
        
        const type = Utils.randomChoice(availableTypes);
        return this.createCandy(type);
    }

    // Create candy object
    createCandy(type, special = null) {
        return {
            type: type,
            special: special,
            id: Utils.generateId(),
            emoji: this.candyEmojis[type] || '🍬'
        };
    }

    // Get candy at position
    getCandy(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
            return null;
        }
        return this.grid[y][x];
    }

    // Get candy type at position
    getCandyType(x, y) {
        const candy = this.getCandy(x, y);
        return candy ? candy.type : null;
    }

    // Set candy at position
    setCandy(x, y, candy) {
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
            this.grid[y][x] = candy;
        }
    }

    // Swap two candies
    swapCandies(pos1, pos2) {
        const candy1 = this.getCandy(pos1.x, pos1.y);
        const candy2 = this.getCandy(pos2.x, pos2.y);
        
        this.setCandy(pos1.x, pos1.y, candy2);
        this.setCandy(pos2.x, pos2.y, candy1);
        
        return { candy1, candy2 };
    }

    // Check if swap is valid (creates matches)
    isValidSwap(pos1, pos2) {
        // Temporarily swap
        this.swapCandies(pos1, pos2);
        
        // Check for matches at both positions
        const matches1 = this.findMatchesAt(pos1.x, pos1.y);
        const matches2 = this.findMatchesAt(pos2.x, pos2.y);
        const hasMatches = matches1.length >= 3 || matches2.length >= 3;
        
        // Swap back
        this.swapCandies(pos1, pos2);
        
        return hasMatches;
    }

    // Find matches at specific position
    findMatchesAt(x, y) {
        const candy = this.getCandy(x, y);
        if (!candy) return [];
        
        const type = candy.type;
        const horizontalMatches = this.findHorizontalMatches(x, y, type);
        const verticalMatches = this.findVerticalMatches(x, y, type);
        
        
        // Only return matches if we have 3 or more in a line
        const validMatches = [];
        
        // Check horizontal matches (must be 3+ in a row)
        if (horizontalMatches.length >= 3) {
            validMatches.push(...horizontalMatches);
        }
        
        // Check vertical matches (must be 3+ in a column)
        if (verticalMatches.length >= 3) {
            // Add vertical matches, avoiding duplicates from horizontal
            verticalMatches.forEach(match => {
                if (!validMatches.some(m => m.x === match.x && m.y === match.y)) {
                    validMatches.push(match);
                }
            });
        }
        
        // Final validation: ensure we actually have 3+ matches
        if (validMatches.length < 3) {
            return [];
        }
        
        return validMatches;
    }

    // Find horizontal matches
    findHorizontalMatches(x, y, type) {
        const matches = [{ x, y }];
        
        // Check left
        for (let i = x - 1; i >= 0; i--) {
            if (this.getCandyType(i, y) === type) {
                matches.unshift({ x: i, y });
            } else {
                break;
            }
        }
        
        // Check right
        for (let i = x + 1; i < this.size; i++) {
            if (this.getCandyType(i, y) === type) {
                matches.push({ x: i, y });
            } else {
                break;
            }
        }
        
        return matches;
    }

    // Find vertical matches
    findVerticalMatches(x, y, type) {
        const matches = [{ x, y }];
        
        // Check up
        for (let i = y - 1; i >= 0; i--) {
            if (this.getCandyType(x, i) === type) {
                matches.unshift({ x, y: i });
            } else {
                break;
            }
        }
        
        // Check down
        for (let i = y + 1; i < this.size; i++) {
            if (this.getCandyType(x, i) === type) {
                matches.push({ x, y: i });
            } else {
                break;
            }
        }
        
        return matches;
    }

    // Find all matches on the grid
    findAllMatches() {
        const allMatches = [];
        const processed = new Set();
        
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const key = `${x},${y}`;
                if (!processed.has(key)) {
                    const matches = this.findMatchesAt(x, y);
                    if (matches.length >= 3) {
                        allMatches.push({
                            positions: matches,
                            type: this.getCandyType(x, y),
                            length: matches.length
                        });
                        
                        // Mark all positions as processed
                        matches.forEach(pos => {
                            processed.add(`${pos.x},${pos.y}`);
                        });
                    }
                }
            }
        }
        
        return allMatches;
    }

    // Remove matched candies and return special candy type if applicable
    removeMatches(matches) {
        const removedCandies = [];
        let specialCandyType = null;
        
        matches.forEach(match => {
            // Determine special candy type based on match length and shape
            if (match.length >= 5) {
                specialCandyType = this.specialCandies.COLOR_BOMB;
            } else if (match.length === 4) {
                // Check if it's a T or L shape for wrapped candy
                const isWrapped = this.isWrappedShape(match.positions);
                if (isWrapped) {
                    specialCandyType = this.specialCandies.WRAPPED;
                } else {
                    // Determine stripe direction based on match orientation
                    const isHorizontal = this.isHorizontalMatch(match.positions);
                    specialCandyType = isHorizontal ? 
                        this.specialCandies.STRIPED_VERTICAL : 
                        this.specialCandies.STRIPED_HORIZONTAL;
                }
            }
            
            // Remove candies
            match.positions.forEach(pos => {
                const candy = this.getCandy(pos.x, pos.y);
                if (candy) {
                    removedCandies.push({ candy, position: pos });
                    this.setCandy(pos.x, pos.y, null);
                }
            });
        });
        
        return { removedCandies, specialCandyType };
    }

    // Check if match forms a wrapped candy shape (T or L)
    isWrappedShape(positions) {
        if (positions.length < 5) return false;
        
        // Sort positions
        positions.sort((a, b) => a.y - b.y || a.x - b.x);
        
        // Check for T or L shapes by analyzing the pattern
        // This is a simplified check - in a full implementation,
        // you'd want more sophisticated shape detection
        const xCoords = positions.map(p => p.x);
        const yCoords = positions.map(p => p.y);
        
        const uniqueX = [...new Set(xCoords)];
        const uniqueY = [...new Set(yCoords)];
        
        // T or L shape would have multiple rows and columns
        return uniqueX.length >= 2 && uniqueY.length >= 2;
    }

    // Check if match is horizontal
    isHorizontalMatch(positions) {
        const yCoords = positions.map(p => p.y);
        const uniqueY = [...new Set(yCoords)];
        return uniqueY.length === 1;
    }

    // Apply gravity - make candies fall down
    applyGravity() {
        const movements = [];
        
        for (let x = 0; x < this.size; x++) {
            let writeIndex = this.size - 1;
            
            // Move existing candies down
            for (let y = this.size - 1; y >= 0; y--) {
                const candy = this.getCandy(x, y);
                if (candy) {
                    if (y !== writeIndex) {
                        movements.push({
                            from: { x, y },
                            to: { x, y: writeIndex },
                            candy: candy
                        });
                        this.setCandy(x, writeIndex, candy);
                        this.setCandy(x, y, null);
                    }
                    writeIndex--;
                }
            }
        }
        
        return movements;
    }

    // Fill empty spaces with new candies (gradually from top)
    fillEmptySpaces() {
        const newCandies = [];
        
        // Fill from top to bottom, column by column for natural falling effect
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.getCandy(x, y) === null) {
                    const candy = this.generateSafeCandy(x, y);
                    this.setCandy(x, y, candy);
                    newCandies.push({
                        position: { x, y },
                        candy: candy,
                        delay: y * 100 // Stagger the appearance
                    });
                }
            }
        }
        
        return newCandies;
    }

    // Create special candy at position
    createSpecialCandy(x, y, type, candyType) {
        const candy = this.createCandy(candyType, type);
        this.setCandy(x, y, candy);
        return candy;
    }

    // Activate special candy effects
    activateSpecialCandy(x, y) {
        const candy = this.getCandy(x, y);
        if (!candy || !candy.special) return [];
        
        const affectedPositions = [];
        
        switch (candy.special) {
            case this.specialCandies.STRIPED_HORIZONTAL:
                // Clear entire row
                for (let i = 0; i < this.size; i++) {
                    affectedPositions.push({ x: i, y });
                }
                break;
                
            case this.specialCandies.STRIPED_VERTICAL:
                // Clear entire column
                for (let i = 0; i < this.size; i++) {
                    affectedPositions.push({ x, y: i });
                }
                break;
                
            case this.specialCandies.WRAPPED:
                // Clear 3x3 area around candy
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const newX = x + dx;
                        const newY = y + dy;
                        if (newX >= 0 && newX < this.size && newY >= 0 && newY < this.size) {
                            affectedPositions.push({ x: newX, y: newY });
                        }
                    }
                }
                break;
                
            case this.specialCandies.COLOR_BOMB:
                // Clear all candies of the same type as the swapped candy
                // This would be handled in the game logic when combining with another candy
                break;
        }
        
        return affectedPositions;
    }

    // Check for possible moves
    findPossibleMoves() {
        const possibleMoves = [];
        
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const adjacentPositions = Utils.getAdjacentPositions(x, y, this.size);
                
                adjacentPositions.forEach(adjPos => {
                    if (this.isValidSwap({ x, y }, adjPos)) {
                        possibleMoves.push({
                            from: { x, y },
                            to: adjPos
                        });
                    }
                });
            }
        }
        
        return possibleMoves;
    }

    // Shuffle grid when no moves available
    shuffleGrid() {
        const candies = [];
        
        // Collect all candies
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const candy = this.getCandy(x, y);
                if (candy) {
                    candies.push(candy);
                }
            }
        }
        
        // Shuffle candies
        const shuffledCandies = Utils.shuffleArray(candies);
        
        // Place shuffled candies back
        let index = 0;
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (index < shuffledCandies.length) {
                    this.setCandy(x, y, shuffledCandies[index]);
                    index++;
                }
            }
        }
    }

    // Get hint for next move
    getHint() {
        const possibleMoves = this.findPossibleMoves();
        if (possibleMoves.length > 0) {
            return Utils.randomChoice(possibleMoves);
        }
        return null;
    }

    // Check if grid is stable (no matches or falling candies)
    isStable() {
        const matches = this.findAllMatches();
        return matches.length === 0;
    }

    // Get grid state for saving/loading
    getState() {
        return {
            size: this.size,
            grid: Utils.deepClone(this.grid)
        };
    }

    // Load grid state
    loadState(state) {
        this.size = state.size;
        this.grid = Utils.deepClone(state.grid);
    }

    // Debug: Print grid to console
    printGrid() {
        console.log('Grid state:');
        for (let y = 0; y < this.size; y++) {
            let row = '';
            for (let x = 0; x < this.size; x++) {
                const candy = this.getCandy(x, y);
                row += candy ? candy.emoji : '⬜';
            }
            console.log(row);
        }
    }
}

// Export for use in other modules
window.Grid = Grid;

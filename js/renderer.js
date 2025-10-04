// Canvas-based renderer for better performance in Candy Smash

class CanvasRenderer {
    constructor(canvasId, gridSize = 8) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = gridSize;
        this.cellSize = 0;
        this.animationFrame = null;
        this.particles = [];
        
        // Candy colors matching our CSS design
        this.candyColors = {
            red: ['#FF1744', '#E91E63', '#C2185B'],
            blue: ['#00BCD4', '#0097A7', '#006064'],
            green: ['#4CAF50', '#388E3C', '#2E7D32'],
            yellow: ['#FFD700', '#FFC107', '#FF8F00'],
            purple: ['#9C27B0', '#7B1FA2', '#4A148C'],
            orange: ['#FF5722', '#E64A19', '#BF360C']
        };
        
        this.candyShapes = {
            red: 'heart',
            blue: 'drop',
            green: 'square',
            yellow: 'star',
            purple: 'diamond',
            orange: 'swirl'
        };
        
        this.setupCanvas();
        this.startRenderLoop();
    }

    setupCanvas() {
        // Set canvas size
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight) * 0.9;
        
        this.canvas.width = size;
        this.canvas.height = size;
        this.canvas.style.width = `${size}px`;
        this.canvas.style.height = `${size}px`;
        
        this.cellSize = size / this.gridSize;
        
        // Enable high DPI support
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;
        this.ctx.scale(dpr, dpr);
    }

    // Draw a glossy candy
    drawCandy(x, y, type, scale = 1, rotation = 0, alpha = 1) {
        const centerX = x * this.cellSize + this.cellSize / 2;
        const centerY = y * this.cellSize + this.cellSize / 2;
        const radius = (this.cellSize * 0.4) * scale;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(rotation);
        
        const colors = this.candyColors[type];
        const shape = this.candyShapes[type];
        
        // Draw candy based on shape
        switch (shape) {
            case 'heart':
                this.drawHeart(0, 0, radius, colors);
                break;
            case 'drop':
                this.drawDrop(0, 0, radius, colors);
                break;
            case 'square':
                this.drawSquare(0, 0, radius, colors);
                break;
            case 'star':
                this.drawStar(0, 0, radius, colors);
                break;
            case 'diamond':
                this.drawDiamond(0, 0, radius, colors);
                break;
            case 'swirl':
                this.drawSwirl(0, 0, radius, colors);
                break;
        }
        
        this.ctx.restore();
    }

    // Draw heart shape
    drawHeart(x, y, size, colors) {
        const gradient = this.ctx.createRadialGradient(x - size/3, y - size/3, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(0.3, colors[0]);
        gradient.addColorStop(0.7, colors[1]);
        gradient.addColorStop(1, colors[2]);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        
        // Heart shape path
        const topCurveHeight = size * 0.3;
        this.ctx.moveTo(x, y + topCurveHeight);
        this.ctx.bezierCurveTo(x, y, x - size/2, y, x - size/2, y + topCurveHeight);
        this.ctx.bezierCurveTo(x - size/2, y + (topCurveHeight + size/3), x, y + (topCurveHeight + size/3), x, y + size);
        this.ctx.bezierCurveTo(x, y + (topCurveHeight + size/3), x + size/2, y + (topCurveHeight + size/3), x + size/2, y + topCurveHeight);
        this.ctx.bezierCurveTo(x + size/2, y, x, y, x, y + topCurveHeight);
        
        this.ctx.fill();
        this.addGloss(x, y, size);
    }

    // Draw teardrop shape
    drawDrop(x, y, size, colors) {
        const gradient = this.ctx.createRadialGradient(x - size/3, y - size/3, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(0.3, colors[0]);
        gradient.addColorStop(0.7, colors[1]);
        gradient.addColorStop(1, colors[2]);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y + size/4, size * 0.6, 0, Math.PI * 2);
        this.ctx.moveTo(x, y - size);
        this.ctx.quadraticCurveTo(x - size/3, y - size/2, x - size/2, y + size/4);
        this.ctx.quadraticCurveTo(x + size/2, y + size/4, x + size/3, y - size/2);
        this.ctx.fill();
        this.addGloss(x, y, size);
    }

    // Draw square shape
    drawSquare(x, y, size, colors) {
        const gradient = this.ctx.createRadialGradient(x - size/3, y - size/3, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(0.3, colors[0]);
        gradient.addColorStop(0.7, colors[1]);
        gradient.addColorStop(1, colors[2]);
        
        this.ctx.fillStyle = gradient;
        const cornerRadius = size * 0.2;
        this.drawRoundedRect(x - size/2, y - size/2, size, size, cornerRadius);
        this.addGloss(x, y, size);
    }

    // Draw star shape
    drawStar(x, y, size, colors) {
        const gradient = this.ctx.createRadialGradient(x - size/3, y - size/3, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
        gradient.addColorStop(0.3, colors[0]);
        gradient.addColorStop(0.7, colors[1]);
        gradient.addColorStop(1, colors[2]);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        
        const spikes = 5;
        const outerRadius = size * 0.5;
        const innerRadius = size * 0.2;
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        this.addGloss(x, y, size);
    }

    // Draw diamond shape
    drawDiamond(x, y, size, colors) {
        const gradient = this.ctx.createRadialGradient(x - size/3, y - size/3, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(0.3, colors[0]);
        gradient.addColorStop(0.7, colors[1]);
        gradient.addColorStop(1, colors[2]);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size/2);
        this.ctx.lineTo(x + size/2, y);
        this.ctx.lineTo(x, y + size/2);
        this.ctx.lineTo(x - size/2, y);
        this.ctx.closePath();
        this.ctx.fill();
        this.addGloss(x, y, size);
    }

    // Draw swirl shape
    drawSwirl(x, y, size, colors) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.5, colors[1]);
        gradient.addColorStop(1, colors[2]);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw swirl pattern
        this.ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        for (let i = 0; i < 3; i++) {
            const radius = (size * 0.1) + (i * size * 0.1);
            const startAngle = i * Math.PI / 3;
            this.ctx.arc(x, y, radius, startAngle, startAngle + Math.PI * 1.5);
        }
        
        this.ctx.stroke();
        this.addGloss(x, y, size);
    }

    // Add glossy highlight
    addGloss(x, y, size) {
        const glossGradient = this.ctx.createRadialGradient(
            x - size/4, y - size/4, 0,
            x - size/4, y - size/4, size/2
        );
        glossGradient.addColorStop(0, 'rgba(255,255,255,0.6)');
        glossGradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
        glossGradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        this.ctx.fillStyle = glossGradient;
        this.ctx.beginPath();
        this.ctx.ellipse(x - size/4, y - size/4, size/4, size/6, -Math.PI/6, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Helper function for rounded rectangles
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }

    // Render the entire grid
    renderGrid(grid) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw grid
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const candy = grid.getCandy(x, y);
                if (candy) {
                    this.drawCandy(x, y, candy.type);
                }
            }
        }
        
        // Draw particles
        this.updateParticles();
    }

    // Draw background with subtle pattern
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0.05)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.gridSize; i++) {
            const pos = i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
        }
    }

    // Add particle effect
    addParticle(x, y, type = 'sparkle') {
        this.particles.push({
            x: x * this.cellSize + this.cellSize / 2,
            y: y * this.cellSize + this.cellSize / 2,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1.0,
            decay: 0.02,
            size: Math.random() * 8 + 4,
            type: type,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        });
    }

    // Update and draw particles
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            particle.size *= 0.98;
            
            if (particle.life > 0) {
                this.ctx.save();
                this.ctx.globalAlpha = particle.life;
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
                return true;
            }
            return false;
        });
    }

    // Start the render loop
    startRenderLoop() {
        const render = () => {
            if (this.onRender) {
                this.onRender();
            }
            this.animationFrame = requestAnimationFrame(render);
        };
        render();
    }

    // Stop the render loop
    stopRenderLoop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    // Handle canvas click
    getGridPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((clientX - rect.left) / this.cellSize);
        const y = Math.floor((clientY - rect.top) / this.cellSize);
        
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            return { x, y };
        }
        return null;
    }

    // Resize handler
    resize() {
        this.setupCanvas();
    }
}

// Export for use in other modules
window.CanvasRenderer = CanvasRenderer;

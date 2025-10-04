// Particle system for Candy Smash game

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.container = document.getElementById('particle-container');
        this.isRunning = false;
        this.lastTime = 0;
        
        this.startAnimationLoop();
    }

    // Start animation loop
    startAnimationLoop() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const animate = (currentTime) => {
            if (!this.isRunning) return;
            
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            this.updateParticles(deltaTime);
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    // Update all particles
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.isDead()) {
                particle.destroy();
                this.particles.splice(i, 1);
            }
        }
    }

    // Create score particles
    createScoreParticles(score, x = window.innerWidth / 2, y = window.innerHeight / 2) {
        const particleCount = Math.min(10, Math.floor(score / 100) + 3);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new ScoreParticle(x, y, score);
            this.particles.push(particle);
        }
    }

    // Create explosion particles
    createExplosion(x, y, color = '#ff6b6b', count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const particle = new ExplosionParticle(x, y, angle, color);
            this.particles.push(particle);
        }
    }

    // Create text effect
    createTextEffect(text, x, y) {
        const particle = new TextParticle(text, x, y);
        this.particles.push(particle);
    }

    // Create candy destruction particles
    createCandyParticles(x, y, candyType) {
        const colors = {
            red: '#ff6b6b',
            blue: '#4ecdc4',
            green: '#96ceb4',
            yellow: '#feca57',
            purple: '#a29bfe',
            orange: '#fd79a8'
        };
        
        const color = colors[candyType] || '#ff6b6b';
        this.createExplosion(x, y, color, 6);
    }

    // Stop particle system
    stop() {
        this.isRunning = false;
        this.particles.forEach(particle => particle.destroy());
        this.particles = [];
    }
}

// Base particle class
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.life = 1.0;
        this.maxLife = 1.0;
        this.element = null;
        this.createElement();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'particle';
        this.element.style.position = 'absolute';
        this.element.style.pointerEvents = 'none';
        document.getElementById('particle-container').appendChild(this.element);
    }

    update(deltaTime) {
        // Update position
        this.x += this.vx * deltaTime * 0.001;
        this.y += this.vy * deltaTime * 0.001;
        
        // Update life
        this.life -= deltaTime * 0.001;
        
        // Update element
        if (this.element) {
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
            this.element.style.opacity = Math.max(0, this.life / this.maxLife);
        }
    }

    isDead() {
        return this.life <= 0;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Score particle
class ScoreParticle extends Particle {
    constructor(x, y, score) {
        super(x, y);
        this.score = score;
        this.vx = Utils.randomFloat(-50, 50);
        this.vy = Utils.randomFloat(-100, -50);
        this.life = 2.0;
        this.maxLife = 2.0;
        
        this.setupElement();
    }

    setupElement() {
        this.element.textContent = '+' + Utils.formatNumber(this.score);
        this.element.style.color = '#4facfe';
        this.element.style.fontSize = '1.5rem';
        this.element.style.fontWeight = 'bold';
        this.element.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
        this.element.style.zIndex = '999';
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Add gravity
        this.vy += 20 * deltaTime * 0.001;
        
        // Scale effect
        const scale = 0.5 + (this.life / this.maxLife) * 0.5;
        this.element.style.transform = `scale(${scale})`;
    }
}

// Explosion particle
class ExplosionParticle extends Particle {
    constructor(x, y, angle, color) {
        super(x, y);
        this.angle = angle;
        this.speed = Utils.randomFloat(100, 200);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.life = 1.0;
        this.maxLife = 1.0;
        this.color = color;
        
        this.setupElement();
    }

    setupElement() {
        this.element.style.width = '8px';
        this.element.style.height = '8px';
        this.element.style.backgroundColor = this.color;
        this.element.style.borderRadius = '50%';
        this.element.style.boxShadow = `0 0 10px ${this.color}`;
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Add friction
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        // Add gravity
        this.vy += 50 * deltaTime * 0.001;
    }
}

// Text particle
class TextParticle extends Particle {
    constructor(text, x, y) {
        super(x, y);
        this.text = text;
        this.vy = -50;
        this.life = 3.0;
        this.maxLife = 3.0;
        
        this.setupElement();
    }

    setupElement() {
        this.element.textContent = this.text;
        this.element.style.color = '#fff';
        this.element.style.fontSize = '2rem';
        this.element.style.fontWeight = 'bold';
        this.element.style.textShadow = '0 2px 4px rgba(0,0,0,0.5)';
        this.element.style.textAlign = 'center';
        this.element.style.transform = 'translateX(-50%)';
        this.element.style.zIndex = '1000';
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Pulsing effect
        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.1;
        this.element.style.transform = `translateX(-50%) scale(${pulse})`;
    }
}

// Create global particle system instance
window.Particles = new ParticleSystem();

// Audio system for Candy Smash game

class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = {};
        this.soundVolume = 0.8;
        this.musicVolume = 0.7;
        this.isMuted = false;
        this.currentMusic = null;
        
        // Initialize audio context
        this.audioContext = null;
        this.initializeAudioContext();
        
        // Load audio files
        this.loadAudioFiles();
    }

    // Initialize Web Audio API context
    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    // Load audio files (using Web Audio API or HTML5 Audio)
    loadAudioFiles() {
        // Sound effects
        this.loadSound('select', this.generateTone(800, 0.1));
        this.loadSound('swap', this.generateTone(600, 0.2));
        this.loadSound('match', this.generateTone(1000, 0.3));
        this.loadSound('combo', this.generateTone(1200, 0.4));
        this.loadSound('booster', this.generateTone(1500, 0.3));
        this.loadSound('victory', this.generateMelody([523, 659, 784, 1047], 0.5));
        this.loadSound('game_over', this.generateMelody([400, 350, 300, 250], 0.8));
        this.loadSound('error', this.generateTone(300, 0.2));
        
        // Background music (simple melody loop)
        this.loadMusic('background', this.generateBackgroundMusic());
    }

    // Generate simple tone using Web Audio API
    generateTone(frequency, duration) {
        if (!this.audioContext) return null;
        
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.soundVolume * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    // Generate melody using multiple tones
    generateMelody(frequencies, noteDuration) {
        if (!this.audioContext) return null;
        
        return () => {
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    oscillator.type = 'triangle';
                    
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.soundVolume * 0.2, this.audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + noteDuration);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + noteDuration);
                }, index * noteDuration * 1000);
            });
        };
    }

    // Generate background music loop
    generateBackgroundMusic() {
        if (!this.audioContext) return null;
        
        const melody = [523, 587, 659, 698, 784, 659, 587, 523]; // C major scale
        let isPlaying = false;
        let timeoutId = null;
        
        const playLoop = () => {
            if (!isPlaying) return;
            
            melody.forEach((freq, index) => {
                timeoutId = setTimeout(() => {
                    if (!isPlaying) return;
                    
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.1, this.audioContext.currentTime + 0.1);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.8);
                }, index * 800);
            });
            
            // Loop the melody
            timeoutId = setTimeout(() => {
                if (isPlaying) playLoop();
            }, melody.length * 800);
        };
        
        return {
            play: () => {
                isPlaying = true;
                playLoop();
            },
            pause: () => {
                isPlaying = false;
                if (timeoutId) clearTimeout(timeoutId);
            },
            stop: () => {
                isPlaying = false;
                if (timeoutId) clearTimeout(timeoutId);
            }
        };
    }

    // Load sound effect
    loadSound(name, generator) {
        this.sounds[name] = generator;
    }

    // Load music track
    loadMusic(name, musicObject) {
        this.music[name] = musicObject;
    }

    // Play sound effect
    playSound(name) {
        if (this.isMuted || !this.sounds[name]) return;
        
        try {
            // Resume audio context if suspended (required by some browsers)
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.sounds[name]();
        } catch (error) {
            console.warn(`Error playing sound ${name}:`, error);
        }
    }

    // Play music
    playMusic(name) {
        if (this.isMuted || !this.music[name]) return;
        
        try {
            // Stop current music
            this.stopMusic();
            
            // Resume audio context if suspended
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Play new music
            this.currentMusic = this.music[name];
            this.currentMusic.play();
        } catch (error) {
            console.warn(`Error playing music ${name}:`, error);
        }
    }

    // Pause current music
    pauseMusic() {
        if (this.currentMusic && this.currentMusic.pause) {
            this.currentMusic.pause();
        }
    }

    // Resume current music
    resumeMusic() {
        if (this.currentMusic && this.currentMusic.play) {
            this.currentMusic.play();
        }
    }

    // Stop current music
    stopMusic() {
        if (this.currentMusic && this.currentMusic.stop) {
            this.currentMusic.stop();
        }
        this.currentMusic = null;
    }

    // Set sound volume (0-1)
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }

    // Set music volume (0-1)
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }

    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }
        
        return this.isMuted;
    }

    // Set mute state
    setMuted(muted) {
        this.isMuted = muted;
        
        if (this.isMuted) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }
    }

    // Get current settings
    getSettings() {
        return {
            soundVolume: this.soundVolume,
            musicVolume: this.musicVolume,
            isMuted: this.isMuted
        };
    }

    // Load settings
    loadSettings(settings) {
        if (settings.soundVolume !== undefined) {
            this.setSoundVolume(settings.soundVolume);
        }
        if (settings.musicVolume !== undefined) {
            this.setMusicVolume(settings.musicVolume);
        }
        if (settings.isMuted !== undefined) {
            this.setMuted(settings.isMuted);
        }
    }
}

// Create global audio manager instance
window.Audio = new AudioManager();

/**
 * ASCII Fireworks Application
 * A Pixi.js-based interactive fireworks display with ASCII characters
 */

// ==================== Constants ====================
const CONFIG = {
    physics: {
        GRAVITY: 0.08,
        FRICTION: 0.99,
    },
    particles: {
        COUNT_MIN: 100,
        COUNT_MAX: 120,
        SPEED_MIN: 2,
        SPEED_MAX: 5,
        DECAY_MIN: 0.005,
        DECAY_MAX: 0.015,
        SCALE_MIN: 0.7,
        SCALE_MAX: 1.0,
    },
    characters: {
        PARTICLE_CHARS: ['*', '+', '.', 'o', 'x', '#', '@', '%', '&'],
        PROGRESSION: ['@', '#', '&', '%', 'O', 'o', '*', '+', 'x', '.'],
    },
    colors: [
        0xFF0000, 0x00FF00, 0x0000FF,
        0xFFFF00, 0x00FFFF, 0xFF00FF,
        0xFFFFFF, 0xFF8800, 0xFF0088
    ],
    combo: {
        THRESHOLD_MS: 400,
        EASTER_EGG_TRIGGER: 15,
        AUTO_FIREWORKS_COUNT: 50,
        AUTO_FIREWORKS_INTERVAL_MS: 100,
    },
    audio: {
        BUFFER_DURATION: 0.5,
        FILTER_FREQUENCY: 1200,
        GAIN_INITIAL: 0.1,
        GAIN_FINAL: 0.001,
        EXPLOSION_DURATION: 0.5,
    },
    ui: {
        COMBO_SCALE_FACTOR: 0.05,
        PULSE_DURATION_MS: 50,
    },
    background: {
        STAR_COUNT: 150,
        STAR_SIZE_MIN: 1,
        STAR_SIZE_MAX: 3,
        STAR_ANIMATION_DURATION_MIN: 2,
        STAR_ANIMATION_DURATION_MAX: 5,
        STAR_OPACITY_MIN: 0.3,
        STAR_OPACITY_MAX: 1.0,
    },
};

// ==================== DOM Elements ====================
const container = document.getElementById('game-container');
const comboElement = document.getElementById('combo-counter');

if (!container) {
    console.error('game-container not found in DOM');
}
if (!comboElement) {
    console.error('combo-counter not found in DOM');
}

// ==================== Pixi Application ====================
const app = new PIXI.Application();
let charTextures = {};

// ==================== Game State ====================
let particles = [];
let lastClickTime = 0;
let combo = 0;
let isEasterEggActive = false;
let audioCtx = null;

// ==================== Utility Functions ====================

/**
 * Converts a color to a numeric format
 * @param {number|string} color - Color as number or hex string
 * @returns {number} Numeric color value
 */
function colorToNumber(color) {
    if (typeof color === 'number') return color;
    if (typeof color === 'string') {
        return parseInt(color.replace('#', ''), 16);
    }
    return 0xFFFFFF;
}

/**
 * Gets a random element from an array
 * @param {Array} arr - Array to select from
 * @returns {*} Random element
 */
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Gets a random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

// ==================== Pixi Initialization ====================

/**
 * Initializes the Pixi.js application and generates character textures
 */
async function initializePixi() {
    try {
        await app.init({ backgroundAlpha: 0, resizeTo: window });

        if (!container) {
            throw new Error('game-container element not found');
        }

        container.appendChild(app.canvas);

        // Create text style for character generation
        const style = new PIXI.TextStyle({
            fontFamily: 'Courier New',
            fontSize: 24,
            fill: 0xffffff,
            fontWeight: 'bold'
        });

        // Generate textures for all characters
        const allChars = [...new Set([
            ...CONFIG.characters.PARTICLE_CHARS,
            ...CONFIG.characters.PROGRESSION
        ])];

        allChars.forEach(char => {
            const text = new PIXI.Text(char, style);
            charTextures[char] = app.renderer.generateTexture(text);
        });

        // Start the game loop
        app.ticker.add(updateParticles);
    } catch (error) {
        console.error('Failed to initialize Pixi application:', error);
    }
}

// ==================== Event Listeners ====================

/**
 * Handles mouse down events and creates fireworks
 */
function handleMouseDown(event) {
    initAudio();

    if (isEasterEggActive) return;

    createFirework(event.clientX, event.clientY);
    handleCombo();
}

document.addEventListener('mousedown', handleMouseDown);

// ==================== Firework Creation ====================

/**
 * Creates a firework at the specified coordinates
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number|null} forcedColor - Optional forced color for particles
 */
function createFirework(x, y, forcedColor = null) {
    if (Object.keys(charTextures).length === 0) {
        console.warn('Character textures not yet loaded');
        return;
    }

    playExplosion();

    const particleCount = getRandomNumber(
        CONFIG.particles.COUNT_MIN,
        CONFIG.particles.COUNT_MAX
    );
    const color = forcedColor || getRandomElement(CONFIG.colors);

    for (let i = 0; i < particleCount; i++) {
        const char = getRandomElement(CONFIG.characters.PARTICLE_CHARS);
        const angle = Math.random() * Math.PI * 2;
        const speed = getRandomNumber(
            CONFIG.particles.SPEED_MIN,
            CONFIG.particles.SPEED_MAX
        );

        const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };

        particles.push(new Particle(x, y, velocity, color, char));
    }
}

// ==================== Particle Class ====================

/**
 * Represents a single particle in the fireworks display
 */
class Particle {
    /**
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {Object} velocity - Velocity object with x and y
     * @param {number} color - Numeric color value
     * @param {string} char - Character to display
     */
    constructor(x, y, velocity, color, char) {
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.color = color;
        this.initialChar = char;
        this.char = char;
        this.alpha = 1;
        this.life = 1.0;
        this.decay = getRandomNumber(
            CONFIG.particles.DECAY_MIN,
            CONFIG.particles.DECAY_MAX
        );
        this.currentCharIndex = 0;

        // Create Pixi sprite
        this.sprite = new PIXI.Sprite(charTextures[char]);
        this.sprite.anchor.set(0.5);
        this.sprite.tint = colorToNumber(this.color);

        this.updateSprite();
        app.stage.addChild(this.sprite);
    }

    /**
     * Updates particle physics and appearance
     */
    update() {
        // Apply physics
        this.velocity.x *= CONFIG.physics.FRICTION;
        this.velocity.y *= CONFIG.physics.FRICTION;
        this.velocity.y += CONFIG.physics.GRAVITY;

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Update life
        this.life -= this.decay;

        // Update character based on life progression
        const progressionLength = CONFIG.characters.PROGRESSION.length;
        const newCharIndex = Math.floor((1 - this.life) * progressionLength);

        if (newCharIndex !== this.currentCharIndex && newCharIndex < progressionLength) {
            this.currentCharIndex = newCharIndex;
            this.char = CONFIG.characters.PROGRESSION[newCharIndex];

            if (charTextures[this.char]) {
                this.sprite.texture = charTextures[this.char];
            }
        }

        // Update alpha with smooth curve
        this.alpha = Math.pow(this.life, 0.8);

        this.updateSprite();
    }

    /**
     * Updates sprite position, scale, and alpha
     */
    updateSprite() {
        this.sprite.x = this.x;
        this.sprite.y = this.y;

        const scaleFactor = CONFIG.particles.SCALE_MIN +
            (this.life * (CONFIG.particles.SCALE_MAX - CONFIG.particles.SCALE_MIN));

        this.sprite.scale.set(scaleFactor);
        this.sprite.alpha = this.alpha;
    }

    /**
     * Checks if particle is no longer alive
     * @returns {boolean} True if life <= 0
     */
    isDead() {
        return this.life <= 0;
    }

    /**
     * Removes particle from stage and cleans up resources
     */
    remove() {
        app.stage.removeChild(this.sprite);
        this.sprite.destroy();
    }
}

// ==================== Particle System ====================

/**
 * Updates all active particles in the system
 */
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();

        if (particle.isDead()) {
            particle.remove();
            particles.splice(i, 1);
        }
    }
}

// ==================== Audio System ====================

/**
 * Initializes the Web Audio API context
 */
function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Web Audio API not supported:', error);
            return;
        }
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(error => {
            console.error('Failed to resume audio context:', error);
        });
    }
}

/**
 * Plays an explosion sound effect using Web Audio API
 */
function playExplosion() {
    if (!audioCtx) return;

    try {
        // Create white noise buffer
        const bufferSize = audioCtx.sampleRate * CONFIG.audio.BUFFER_DURATION;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        // Create audio nodes
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const gainNode = audioCtx.createGain();

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = CONFIG.audio.FILTER_FREQUENCY;

        // Connect nodes
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Set volume envelope
        const now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(CONFIG.audio.GAIN_INITIAL, now);
        gainNode.gain.exponentialRampToValueAtTime(
            CONFIG.audio.GAIN_FINAL,
            now + CONFIG.audio.EXPLOSION_DURATION
        );

        noise.start(now);
    } catch (error) {
        console.error('Failed to play explosion sound:', error);
    }
}

// ==================== Combo System ====================

/**
 * Handles combo tracking and Easter egg triggering
 */
function handleCombo() {
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    lastClickTime = now;

    if (timeDiff < CONFIG.combo.THRESHOLD_MS) {
        combo++;
        showComboUI();

        if (combo >= CONFIG.combo.EASTER_EGG_TRIGGER && !isEasterEggActive) {
            triggerEasterEgg();
        }
    } else {
        combo = 0;
        hideComboUI();
    }
}

/**
 * Displays the combo UI with scale animation
 */
function showComboUI() {
    if (!comboElement) return;

    comboElement.style.display = 'block';
    comboElement.textContent = `COMBO: ${combo}`;
    comboElement.style.transform = `scale(${1 + combo * CONFIG.ui.COMBO_SCALE_FACTOR})`;

    // Reset scale for pulse effect
    setTimeout(() => {
        if (comboElement) {
            comboElement.style.transform = 'scale(1)';
        }
    }, CONFIG.ui.PULSE_DURATION_MS);
}

/**
 * Hides the combo UI
 */
function hideComboUI() {
    if (comboElement) {
        comboElement.style.display = 'none';
    }
}

// ==================== Easter Egg ====================

/**
 * Triggers the Easter egg sequence with auto-fireworks
 */
function triggerEasterEgg() {
    isEasterEggActive = true;
    combo = 0;
    hideComboUI();

    // Create Easter egg text element
    const eggText = document.createElement('div');
    eggText.className = 'easter-egg-text';
    eggText.textContent = "ASCII\nOVERLOAD";
    document.body.appendChild(eggText);

    // Auto-fireworks sequence
    let count = 0;
    const interval = setInterval(() => {
        if (count >= CONFIG.combo.AUTO_FIREWORKS_COUNT) {
            clearInterval(interval);
            if (eggText.parentNode) {
                document.body.removeChild(eggText);
            }
            isEasterEggActive = false;
            return;
        }

        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        createFirework(x, y, 0x00FF00); // Matrix green style

        count++;
    }, CONFIG.combo.AUTO_FIREWORKS_INTERVAL_MS);
}

// ==================== Background Visualization ====================

/**
 * Creates animated starry background
 */
function createStarryBackground() {
    for (let i = 0; i < CONFIG.background.STAR_COUNT; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        // Random size
        const size = getRandomNumber(
            CONFIG.background.STAR_SIZE_MIN,
            CONFIG.background.STAR_SIZE_MAX
        );

        // Random animation properties
        const duration = getRandomNumber(
            CONFIG.background.STAR_ANIMATION_DURATION_MIN,
            CONFIG.background.STAR_ANIMATION_DURATION_MAX
        );
        const opacity = getRandomNumber(
            CONFIG.background.STAR_OPACITY_MIN,
            CONFIG.background.STAR_OPACITY_MAX
        );

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--duration', `${duration}s`);
        star.style.setProperty('--opacity', opacity);
        star.style.animationDelay = `${Math.random() * 5}s`;

        document.body.insertBefore(star, container);
    }
}

// ==================== Application Startup ====================

/**
 * Initializes the entire application
 */
async function initializeApplication() {
    try {
        await initializePixi();
        createStarryBackground();
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

// Initialize the application when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}

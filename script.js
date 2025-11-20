const container = document.getElementById('game-container');
const comboElement = document.getElementById('combo-counter');

// Pixi Application
const app = new PIXI.Application();
let charTextures = {};

let particles = [];
let lastClickTime = 0;
let combo = 0;
let isEasterEggActive = false;
let easterEggTimer = null;
let audioCtx = null;

// Configuration
const GRAVITY = 0.08;
const FRICTION = 0.99;
const CHARS = ['*', '+', '.', 'o', 'x', '#', '@', '%', '&'];
// Character size progression (from largest to smallest)
const CHAR_PROGRESSION = ['@', '#', '&', '%', 'O', 'o', '*', '+', 'x', '.'];
const COLORS = [
    0xFF0000, 0x00FF00, 0x0000FF,
    0xFFFF00, 0x00FFFF, 0xFF00FF,
    0xFFFFFF, 0xFF8800, 0xFF0088
];

// Helper function to convert color (if needed)
function colorToNumber(color) {
    if (typeof color === 'number') return color;
    if (typeof color === 'string') {
        return parseInt(color.replace('#', ''), 16);
    }
    return 0xFFFFFF;
}

// Initialize Pixi
(async () => {
    await app.init({ backgroundAlpha: 0, resizeTo: window });
    container.appendChild(app.canvas);

    // Generate Textures for each character (including progression chars)
    const style = new PIXI.TextStyle({
        fontFamily: 'Courier New',
        fontSize: 24,
        fill: 0xffffff, // White base for tinting
        fontWeight: 'bold'
    });

    // Combine all unique characters
    const allChars = [...new Set([...CHARS, ...CHAR_PROGRESSION])];
    allChars.forEach(char => {
        const text = new PIXI.Text(char, style);
        charTextures[char] = app.renderer.generateTexture(text);
    });

    // Start the game loop
    app.ticker.add(updateParticles);
})();

// Event Listener
document.addEventListener('mousedown', (e) => {
    initAudio();
    if (isEasterEggActive) return; // Optional: disable manual clicks during easter egg or let them add to chaos

    createFirework(e.clientX, e.clientY);
    handleCombo();
});

function createFirework(x, y, forcedColor = null) {
    if (Object.keys(charTextures).length === 0) return;
    playExplosion();
    const particleCount = 100 + Math.random() * 20;
    const color = forcedColor || COLORS[Math.floor(Math.random() * COLORS.length)];

    for (let i = 0; i < particleCount; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;

        const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };

        particles.push(new Particle(x, y, velocity, color, char));
    }
}

class Particle {
    constructor(x, y, velocity, color, char) {
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.color = color;
        this.initialChar = char;
        this.char = char;
        this.alpha = 1;
        this.life = 1.0;
        this.decay = 0.005 + Math.random() * 0.01;
        this.currentCharIndex = 0; // Track position in character progression

        // Create Pixi Sprite
        this.sprite = new PIXI.Sprite(charTextures[char]);
        this.sprite.anchor.set(0.5);
        this.sprite.tint = colorToNumber(this.color);

        // Initial position
        this.updateSprite();
        app.stage.addChild(this.sprite);
    }

    update() {
        this.velocity.x *= FRICTION;
        this.velocity.y *= FRICTION;
        this.velocity.y += GRAVITY;

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.life -= this.decay;

        // Calculate character progression based on life
        // As life decreases, progress through smaller characters
        const progressionLength = CHAR_PROGRESSION.length;
        const newCharIndex = Math.floor((1 - this.life) * progressionLength);

        // Update character if it changed
        if (newCharIndex !== this.currentCharIndex && newCharIndex < progressionLength) {
            this.currentCharIndex = newCharIndex;
            this.char = CHAR_PROGRESSION[newCharIndex];

            // Update sprite texture
            if (charTextures[this.char]) {
                this.sprite.texture = charTextures[this.char];
            }
        }

        // Alpha fades with life, creating transparency effect
        this.alpha = Math.pow(this.life, 0.8); // Slight curve for smoother fade

        this.updateSprite();
    }

    updateSprite() {
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        // Combine character shrinking with scale for enhanced effect
        const scaleFactor = 0.7 + (this.life * 0.3); // Scale from 1.0 to 0.7
        this.sprite.scale.set(scaleFactor);
        this.sprite.alpha = this.alpha;
    }

    isDead() {
        return this.life <= 0;
    }

    remove() {
        app.stage.removeChild(this.sprite);
        this.sprite.destroy();
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.isDead()) {
            p.remove();
            particles.splice(i, 1);
        }
    }
}

// Audio System
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playExplosion() {
    if (!audioCtx) return;

    // Create white noise buffer
    const bufferSize = audioCtx.sampleRate * 0.5; // 0.5 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const gainNode = audioCtx.createGain();

    // Lowpass filter to make it sound like an explosion
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200; // Muffled sound

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    // Volume envelope
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    noise.start(now);
}

// Combo & Easter Egg Logic
function handleCombo() {
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    lastClickTime = now;

    if (timeDiff < 400) { // Fast clicking threshold
        combo++;
        showComboUI();

        if (combo >= 15 && !isEasterEggActive) {
            triggerEasterEgg();
        }
    } else {
        combo = 0;
        hideComboUI();
    }
}

function showComboUI() {
    comboElement.style.display = 'block';
    comboElement.textContent = `COMBO: ${combo}`;
    comboElement.style.transform = `scale(${1 + combo * 0.05})`;

    // Reset scale after a brief moment for a "pulse" effect
    setTimeout(() => {
        comboElement.style.transform = 'scale(1)';
    }, 50);
}

function hideComboUI() {
    comboElement.style.display = 'none';
}

function triggerEasterEgg() {
    isEasterEggActive = true;
    combo = 0;
    hideComboUI();

    // Create Easter Egg Text
    const eggText = document.createElement('div');
    eggText.className = 'easter-egg-text';
    eggText.textContent = "ASCII\nOVERLOAD";
    document.body.appendChild(eggText);

    // Auto-fireworks sequence
    let count = 0;
    const maxFireworks = 50;
    const interval = setInterval(() => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        createFirework(x, y, 0x00FF00); // Matrix green style

        count++;
        if (count >= maxFireworks) {
            clearInterval(interval);
            document.body.removeChild(eggText);
            isEasterEggActive = false;
        }
    }, 100);
}

function createStarryBackground() {
    const starCount = 150;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        // Random size
        const size = Math.random() * 2 + 1;

        // Random animation properties
        const duration = Math.random() * 3 + 2;
        const opacity = Math.random() * 0.7 + 0.3;

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

createStarryBackground();

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
    await app.init({ background: '#000000', resizeTo: window });
    container.appendChild(app.canvas);

    // Generate Textures for each character
    const style = new PIXI.TextStyle({
        fontFamily: 'Courier New',
        fontSize: 24,
        fill: 0xffffff, // White base for tinting
        fontWeight: 'bold'
    });

    CHARS.forEach(char => {
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
        this.char = char;
        this.alpha = 1;
        this.life = 1.0;
        this.decay = 0.005 + Math.random() * 0.01;

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
        this.alpha = this.life;

        this.updateSprite();
    }

    updateSprite() {
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.scale.set(this.life); // Scale down as it dies
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
    filter.frequency.value = 1600; // Muffled sound

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

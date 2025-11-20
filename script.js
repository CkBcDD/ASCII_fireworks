const container = document.getElementById('game-container');
const comboElement = document.getElementById('combo-counter');

let particles = [];
let lastClickTime = 0;
let combo = 0;
let isEasterEggActive = false;
let easterEggTimer = null;

// Configuration
const GRAVITY = 0.15;
const FRICTION = 0.96;
const CHARS = ['*', '+', '.', 'o', 'x', '#', '@', '%', '&'];
const COLORS = [
    '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#00FFFF', '#FF00FF',
    '#FFFFFF', '#FF8800', '#FF0088'
];

// Main Loop
function loop() {
    updateParticles();
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Event Listener
document.addEventListener('mousedown', (e) => {
    if (isEasterEggActive) return; // Optional: disable manual clicks during easter egg or let them add to chaos

    createFirework(e.clientX, e.clientY);
    handleCombo();
});

function createFirework(x, y, forcedColor = null) {
    const particleCount = 30 + Math.random() * 20;
    const color = forcedColor || COLORS[Math.floor(Math.random() * COLORS.length)];
    const char = CHARS[Math.floor(Math.random() * CHARS.length)];

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;

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
        this.decay = 0.01 + Math.random() * 0.02;

        this.element = document.createElement('span');
        this.element.textContent = this.char;
        this.element.className = 'particle';
        this.element.style.color = this.color;

        // Initial position
        this.updateElement();
        container.appendChild(this.element);
    }

    update() {
        this.velocity.x *= FRICTION;
        this.velocity.y *= FRICTION;
        this.velocity.y += GRAVITY;

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.life -= this.decay;
        this.alpha = this.life;

        this.updateElement();
    }

    updateElement() {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.element.style.opacity = this.alpha;
    }

    isDead() {
        return this.life <= 0;
    }

    remove() {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
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
        createFirework(x, y, '#00FF00'); // Matrix green style

        count++;
        if (count >= maxFireworks) {
            clearInterval(interval);
            document.body.removeChild(eggText);
            isEasterEggActive = false;
        }
    }, 100);
}

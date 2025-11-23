/**
 * Easter Egg System
 * Handles the special ASCII OVERLOAD easter egg sequence
 * and the "fireworks" keyword super firework
 */
import { CONFIG } from './config.js';

let isEasterEggActive = false;
let keywordBuffer = '';
let keywordTimeout = null;

/**
 * Gets the current Easter egg state
 * @returns {boolean}
 */
export function getEasterEggState() {
    return isEasterEggActive;
}

/**
 * Triggers the Easter egg sequence with auto-fireworks
 * @param {Function} createFireworkCallback - Callback to create fireworks
 */
export function triggerCombo(createFireworkCallback) {
    isEasterEggActive = true;

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

        // Use random colors for fireworks
        const colors = CONFIG.colors;
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        createFireworkCallback(x, y, randomColor);

        count++;
    }, CONFIG.combo.AUTO_FIREWORKS_INTERVAL_MS);
}

/**
 * Triggers the super firework when "fireworks" keyword is typed
 * @param {Function} createSuperFireworkCallback - Callback to create super firework
 */
export function triggerSuperFirework(createSuperFireworkCallback) {
    isEasterEggActive = true;

    // Create super firework text element
    const superText = document.createElement('div');
    superText.className = 'easter-egg-text';
    superText.textContent = "SUPER\nFIREWORK!";
    superText.style.color = '#FFD700';
    superText.style.textShadow = '0 0 20px #FFD700, 0 0 40px #FFD700';
    document.body.appendChild(superText);

    // Create super firework in the center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Launch multiple waves of the super firework
    let waveCount = 0;
    const waveInterval = setInterval(() => {
        if (waveCount >= CONFIG.superFirework.WAVE_COUNT) {
            clearInterval(waveInterval);
            // Remove text after a delay
            setTimeout(() => {
                if (superText.parentNode) {
                    document.body.removeChild(superText);
                }
                isEasterEggActive = false;
            }, CONFIG.superFirework.DURATION_MS - CONFIG.superFirework.WAVE_INTERVAL_MS * CONFIG.superFirework.WAVE_COUNT);
            return;
        }

        // Slight position variation for each wave
        const offsetX = (Math.random() - 0.5) * 100;
        const offsetY = (Math.random() - 0.5) * 100;
        createSuperFireworkCallback(centerX + offsetX, centerY + offsetY);

        waveCount++;
    }, CONFIG.superFirework.WAVE_INTERVAL_MS);
}

/**
 * Initializes keyboard listener for the "fireworks" easter egg
 * @param {Function} createSuperFireworkCallback - Callback to create super firework
 */
export function initKeywordListener(createSuperFireworkCallback) {
    document.addEventListener('keydown', (event) => {
        // Ignore if typing in input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        // Add character to buffer
        keywordBuffer += event.key.toLowerCase();

        // Clear timeout if exists
        if (keywordTimeout) {
            clearTimeout(keywordTimeout);
        }

        // Reset buffer after 2 seconds of inactivity
        keywordTimeout = setTimeout(() => {
            keywordBuffer = '';
        }, 2000);

        // Check for "fireworks" keyword
        if (keywordBuffer.includes('fireworks')) {
            keywordBuffer = '';
            if (!isEasterEggActive) {
                triggerSuperFirework(createSuperFireworkCallback);
            }
        }

        // Limit buffer length to prevent memory issues
        if (keywordBuffer.length > 20) {
            keywordBuffer = keywordBuffer.slice(-20);
        }
    });
}

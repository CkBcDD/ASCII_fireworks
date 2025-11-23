/**
 * Easter Egg System
 * Handles the special ASCII OVERLOAD easter egg sequence
 */
import { CONFIG } from './config.js';

let isEasterEggActive = false;

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
export function triggerEasterEgg(createFireworkCallback) {
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
        createFireworkCallback(x, y, 0x00FF00); // Matrix green style

        count++;
    }, CONFIG.combo.AUTO_FIREWORKS_INTERVAL_MS);
}

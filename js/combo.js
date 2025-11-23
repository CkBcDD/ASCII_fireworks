/**
 * Combo system and Easter egg
 */
import { CONFIG } from './config.js';

let lastClickTime = 0;
let combo = 0;
let isEasterEggActive = false;
const comboElement = document.getElementById('combo-counter');

/**
 * Gets the current Easter egg state
 * @returns {boolean}
 */
export function getEasterEggState() {
    return isEasterEggActive;
}

/**
 * Handles combo tracking and Easter egg triggering
 * @param {Function} easterEggCallback - Callback to trigger Easter egg
 */
export function handleCombo(easterEggCallback) {
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    lastClickTime = now;

    if (timeDiff < CONFIG.combo.THRESHOLD_MS) {
        combo++;
        showComboUI();

        if (combo >= CONFIG.combo.EASTER_EGG_TRIGGER && !isEasterEggActive) {
            triggerEasterEgg(easterEggCallback);
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

/**
 * Triggers the Easter egg sequence with auto-fireworks
 * @param {Function} createFireworkCallback - Callback to create fireworks
 */
function triggerEasterEgg(createFireworkCallback) {
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
        createFireworkCallback(x, y, 0x00FF00); // Matrix green style

        count++;
    }, CONFIG.combo.AUTO_FIREWORKS_INTERVAL_MS);
}

/**
 * Combo system
 */
import { CONFIG } from './config.js';
import { getEasterEggState, triggerCombo } from './easter-egg.js';

let lastClickTime = 0;
let combo = 0;
const comboElement = document.getElementById('combo-counter');

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

        if (combo >= CONFIG.combo.COMBP_TRIGGER && !getEasterEggState()) {
            combo = 0;
            hideComboUI();
            triggerCombo(easterEggCallback);
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

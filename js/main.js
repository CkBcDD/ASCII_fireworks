/**
 * ASCII Fireworks Application - Main Entry Point
 * A Pixi.js-based interactive fireworks display with ASCII characters
 */
import { initializePixi } from './pixi-init.js';
import { createFirework, updateParticles } from './firework.js';
import { initAudio } from './audio.js';
import { handleCombo, getEasterEggState } from './combo.js';
import { createStarryBackground } from './background.js';

// ==================== DOM Elements ====================
const container = document.getElementById('game-container');

if (!container) {
    console.error('game-container not found in DOM');
}

// ==================== Global State ====================
let app = null;
let charTextures = {};

// ==================== Event Handlers ====================

/**
 * Handles mouse down events and creates fireworks
 */
function handleMouseDown(event) {
    initAudio();

    if (getEasterEggState()) return;

    createFirework(event.clientX, event.clientY, charTextures, app);
    handleCombo((x, y, color) => createFirework(x, y, charTextures, app, color));
}

document.addEventListener('mousedown', handleMouseDown);

// ==================== Application Initialization ====================

/**
 * Initializes the entire application
 */
async function initializeApplication() {
    try {
        const result = await initializePixi(container, updateParticles);
        app = result.app;
        charTextures = result.charTextures;

        createStarryBackground(container);
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

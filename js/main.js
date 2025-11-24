/**
 * ASCII Fireworks Application - Main Entry Point
 * A Pixi.js-based interactive fireworks display with ASCII characters
 */
import { initializePixi } from './pixi-init.js';
import { createFirework, createSuperFirework, updateParticles, setParticlePool } from './firework.js';
import { initAudio } from './audio.js';
import { handleCombo } from './combo.js';
import { getEasterEggState, initKeywordListener } from './easter-egg.js';
import { createStarryBackground } from './background.js';
import { CONFIG } from './config.js';
import { createPerformanceMonitor, togglePerformanceMonitor } from './performance-monitor.js';

// ==================== DOM Elements ====================
const container = document.getElementById('game-container');

if (!container) {
    console.error('game-container not found in DOM');
}

// ==================== Global State ====================
let app = null;
let charTextures = {};
let particlePool = null;

// ==================== Event Handlers ====================

/**
 * Handles mouse down events and creates fireworks
 */
function handleMouseDown(event) {
    initAudio();

    if (getEasterEggState() && !CONFIG.options.ALLOW_MOUSE_CLICK_DURING_EASTER_EGG) return;
    // Create main firework at the click location
    createFirework(event.clientX, event.clientY, charTextures, app);

    // If dual fireworks are enabled, spawn a second one with a small X offset
    if (CONFIG.options.USING_DUAL_FIREWORKS) {
        // Use a reasonable offset so they appear near each other but not overlapping
        const offset = 40; // pixels
        // Randomize left/right so the visual feels more dynamic
        const secondX = event.clientX + (Math.random() < 0.5 ? -offset : offset);
        createFirework(secondX, event.clientY, charTextures, app);
    }
    handleCombo((x, y, color) => createFirework(x, y, charTextures, app, color));
}

document.addEventListener('mousedown', handleMouseDown);

// ==================== Performance Monitor Toggle ====================

/**
 * Toggle performance monitor with 'P' key
 */
document.addEventListener('keydown', (event) => {
    if (event.key === 'p' || event.key === 'P') {
        togglePerformanceMonitor();
    }
});

// ==================== Application Initialization ====================

/**
 * Initializes the entire application
 */
async function initializeApplication() {
    try {
        const result = await initializePixi(container, updateParticles);
        app = result.app;
        charTextures = result.charTextures;
        particlePool = result.particlePool;

        // Set particle pool for firework system
        setParticlePool(particlePool);

        createStarryBackground(container);

        // Initialize keyword listener for "fireworks" easter egg
        initKeywordListener((x, y) => createSuperFirework(x, y, charTextures, app));

        // Initialize performance monitor (hidden by default, press 'P' to toggle)
        createPerformanceMonitor(particlePool);
        console.log('Press "P" to toggle performance monitor');
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

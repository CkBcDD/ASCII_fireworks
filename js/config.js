/**
 * @fileoverview Configuration constants for ASCII Fireworks
 * Central configuration management for physics, particles, visuals, and user interactions.
 * All values are exported as frozen objects to prevent accidental mutations.
 */

/**
 * Physics simulation parameters
 * @type {Object.<string, number>}
 */
const PHYSICS = Object.freeze({
    GRAVITY: 0.08,
    FRICTION: 0.99,
});

/**
 * Particle generation and behavior parameters
 * @type {Object.<string, number>}
 */
const PARTICLES = Object.freeze({
    COUNT_MIN: 100,
    COUNT_MAX: 120,
    SPEED_MIN: 2,
    SPEED_MAX: 5,
    DECAY_MIN: 0.005,
    DECAY_MAX: 0.015,
    SCALE_MIN: 0.7,
    SCALE_MAX: 1.0,
});

/**
 * Character sets for particle rendering and animation progression
 * @type {Object.<string, string[]>}
 */
const CHARACTERS = Object.freeze({
    PARTICLE_CHARS: Object.freeze(['*', '+', '.', 'o', 'x', '#', '@', '%', '&']),
    PROGRESSION: Object.freeze(['@', '#', '&', '%', 'O', 'o', '*', '+', 'x', '.']),
});

/**
 * Color palette (RGB hex values) for particle rendering
 * @type {number[]}
 */
const COLORS = Object.freeze([
    0xFF0000, // Red
    0x00FF00, // Green
    0x0000FF, // Blue
    0xFFFF00, // Yellow
    0x00FFFF, // Cyan
    0xFF00FF, // Magenta
    0xFFFFFF, // White
    0xFF8800, // Orange
    0xFF0088, // Pink
]);

/**
 * Combo system parameters for detecting rapid consecutive clicks
 * @type {Object.<string, number>}
 */
const COMBO = Object.freeze({
    THRESHOLD_MS: 400,
    COMBP_TRIGGER: 52,
    AUTO_FIREWORKS_COUNT: 50,
    AUTO_FIREWORKS_INTERVAL_MS: 100,
});

/**
 * Enhanced firework parameters for combo rewards
 * @type {Object.<string, number>}
 */
const SUPER_FIREWORK = Object.freeze({
    PARTICLE_COUNT: 500,
    SPEED_MIN: 3,
    SPEED_MAX: 8,
    DURATION_MS: 8000,
    WAVE_COUNT: 10,
    WAVE_INTERVAL_MS: 300,
});

/**
 * User interface animation and scaling parameters
 * @type {Object.<string, number>}
 */
const UI = Object.freeze({
    COMBO_SCALE_FACTOR: 0.05,
    PULSE_DURATION_MS: 50,
});

/**
 * Background animation parameters for star field
 * @type {Object.<string, number>}
 */
const BACKGROUND = Object.freeze({
    STAR_COUNT: 150,
    STAR_SIZE_MIN: 1,
    STAR_SIZE_MAX: 3,
    STAR_ANIMATION_DURATION_MIN: 2,
    STAR_ANIMATION_DURATION_MAX: 5,
    STAR_OPACITY_MIN: 0.3,
    STAR_OPACITY_MAX: 1.0,
});

/**
 * Feature flags and behavior toggles
 * @type {Object.<string, boolean>}
 */
const OPTIONS = Object.freeze({
    ALLOW_MOUSE_CLICK_DURING_EASTER_EGG: true,
    USING_DUAL_FIREWORKS: true,
    // Controls whether the performance monitor should be visible when the app initializes.
    // Set to `true` to show the monitor by default, `false` to keep it hidden until toggled (default).
    SHOW_PERFORMANCE_MONITOR: false,
});

/**
 * Master configuration object aggregating all system settings.
 * Frozen to prevent accidental modifications at runtime.
 *
 * @type {Object}
 * @property {Object} physics - Physics simulation parameters
 * @property {Object} particles - Particle generation settings
 * @property {Object} characters - Character sets for rendering
 * @property {number[]} colors - Color palette
 * @property {Object} combo - Combo system configuration
 * @property {Object} superFirework - Enhanced firework parameters
 * @property {Object} ui - UI animation settings
 * @property {Object} background - Background animation settings
 * @property {Object} options - Feature flags
 *
 * @example
 * // Access configuration
 * const { CONFIG } = require('./config');
 * console.log(CONFIG.physics.GRAVITY); // 0.08
 *
 * // Safe - Object.freeze prevents modifications
 * CONFIG.physics.GRAVITY = 0.1; // Silent failure in non-strict mode
 */
export const CONFIG = Object.freeze({
    physics: PHYSICS,
    particles: PARTICLES,
    characters: CHARACTERS,
    colors: COLORS,
    combo: COMBO,
    superFirework: SUPER_FIREWORK,
    ui: UI,
    background: BACKGROUND,
    options: OPTIONS,
});

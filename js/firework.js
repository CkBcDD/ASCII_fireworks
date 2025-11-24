/**
 * Firework creation and particle system
 */
import { CONFIG } from './config.js';
import { getRandomElement, getRandomNumber } from './utils.js';
import { playExplosion } from './audio.js';

let particlePool = null;

/**
 * Sets the particle pool instance
 * @param {Object} pool - ParticlePool instance
 */
export function setParticlePool(pool) {
    particlePool = pool;
}

/**
 * Creates a firework at the specified coordinates
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} charTextures - Character texture map
 * @param {Object} app - Pixi application instance
 * @param {number|null} forcedColor - Optional forced color for particles
 */
export function createFirework(x, y, charTextures, app, forcedColor = null) {
    if (Object.keys(charTextures).length === 0) {
        console.warn('Character textures not yet loaded');
        return;
    }

    if (!particlePool) {
        console.error('Particle pool not initialized');
        return;
    }

    playExplosion();

    const particleCount = getRandomNumber(
        CONFIG.particles.COUNT_MIN,
        CONFIG.particles.COUNT_MAX
    );
    const color = forcedColor || getRandomElement(CONFIG.colors);

    for (let i = 0; i < particleCount; i++) {
        const char = getRandomElement(CONFIG.characters.PARTICLE_CHARS);
        const angle = Math.random() * Math.PI * 2;
        const speed = getRandomNumber(
            CONFIG.particles.SPEED_MIN,
            CONFIG.particles.SPEED_MAX
        );

        const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };

        particlePool.acquire(x, y, velocity, color, char);
    }
}

/**
 * Creates a super firework with enhanced particles
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} charTextures - Character texture map
 * @param {Object} app - Pixi application instance
 */
export function createSuperFirework(x, y, charTextures, app) {
    if (Object.keys(charTextures).length === 0) {
        console.warn('Character textures not yet loaded');
        return;
    }

    if (!particlePool) {
        console.error('Particle pool not initialized');
        return;
    }

    playExplosion();

    const particleCount = CONFIG.superFirework.PARTICLE_COUNT;

    for (let i = 0; i < particleCount; i++) {
        const char = getRandomElement(CONFIG.characters.PARTICLE_CHARS);
        const angle = Math.random() * Math.PI * 2;
        const speed = getRandomNumber(
            CONFIG.superFirework.SPEED_MIN,
            CONFIG.superFirework.SPEED_MAX
        );

        const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };

        // Use rainbow colors for super firework
        const color = getRandomElement(CONFIG.colors);

        particlePool.acquire(x, y, velocity, color, char);
    }
}

/**
 * Updates all active particles in the system
 */
export function updateParticles() {
    if (particlePool) {
        particlePool.update();
    }
}

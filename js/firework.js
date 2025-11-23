/**
 * Firework creation and particle system
 */
import { CONFIG } from './config.js';
import { getRandomElement, getRandomNumber } from './utils.js';
import { Particle } from './particle.js';
import { playExplosion } from './audio.js';

let particles = [];

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

        particles.push(new Particle(x, y, velocity, color, char, charTextures, app));
    }
}

/**
 * Updates all active particles in the system
 */
export function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();

        if (particle.isDead()) {
            particle.remove();
            particles.splice(i, 1);
        }
    }
}

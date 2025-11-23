/**
 * Background visualization
 */
import { CONFIG } from './config.js';
import { getRandomNumber } from './utils.js';

/**
 * Creates animated starry background
 * @param {HTMLElement} container - Container element to insert stars before
 */
export function createStarryBackground(container) {
    for (let i = 0; i < CONFIG.background.STAR_COUNT; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        // Random size
        const size = getRandomNumber(
            CONFIG.background.STAR_SIZE_MIN,
            CONFIG.background.STAR_SIZE_MAX
        );

        // Random animation properties
        const duration = getRandomNumber(
            CONFIG.background.STAR_ANIMATION_DURATION_MIN,
            CONFIG.background.STAR_ANIMATION_DURATION_MAX
        );
        const opacity = getRandomNumber(
            CONFIG.background.STAR_OPACITY_MIN,
            CONFIG.background.STAR_OPACITY_MAX
        );

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--duration', `${duration}s`);
        star.style.setProperty('--opacity', opacity);
        star.style.animationDelay = `${Math.random() * 5}s`;

        document.body.insertBefore(star, container);
    }
}

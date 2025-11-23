/**
 * Pixi.js initialization
 */
import { CONFIG } from './config.js';

/**
 * Initializes the Pixi.js application and generates character textures
 * @param {HTMLElement} container - Container element for the canvas
 * @param {Function} tickerCallback - Callback function for animation loop
 * @returns {Promise<{app: Object, charTextures: Object}>}
 */
export async function initializePixi(container, tickerCallback) {
    const app = new PIXI.Application();
    const charTextures = {};

    try {
        await app.init({ backgroundAlpha: 0, resizeTo: window });

        if (!container) {
            throw new Error('game-container element not found');
        }

        container.appendChild(app.canvas);

        // Create text style for character generation
        const style = new PIXI.TextStyle({
            fontFamily: 'Courier New',
            fontSize: 24,
            fill: 0xffffff,
            fontWeight: 'bold'
        });

        // Generate textures for all characters
        const allChars = [...new Set([
            ...CONFIG.characters.PARTICLE_CHARS,
            ...CONFIG.characters.PROGRESSION
        ])];

        allChars.forEach(char => {
            const text = new PIXI.Text(char, style);
            charTextures[char] = app.renderer.generateTexture(text);
        });

        // Start the game loop
        app.ticker.add(tickerCallback);

        return { app, charTextures };
    } catch (error) {
        console.error('Failed to initialize Pixi application:', error);
        throw error;
    }
}

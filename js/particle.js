/**
 * Particle class for fireworks display
 */
import { CONFIG } from './config.js';
import { colorToNumber, getRandomNumber } from './utils.js';

/**
 * Represents a single particle in the fireworks display
 */
export class Particle {
    /**
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {Object} velocity - Velocity object with x and y
     * @param {number} color - Numeric color value
     * @param {string} char - Character to display
     * @param {Object} charTextures - Texture map for characters
     * @param {Object} app - Pixi application instance
     */
    constructor(x, y, velocity, color, char, charTextures, app) {
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.color = color;
        this.initialChar = char;
        this.char = char;
        this.alpha = 1;
        this.life = 1.0;
        this.decay = getRandomNumber(
            CONFIG.particles.DECAY_MIN,
            CONFIG.particles.DECAY_MAX
        );
        this.currentCharIndex = 0;
        this.charTextures = charTextures;
        this.app = app;

        // Create Pixi sprite
        this.sprite = new PIXI.Sprite(charTextures[char]);
        this.sprite.anchor.set(0.5);
        this.sprite.tint = colorToNumber(this.color);

        this.updateSprite();
        app.stage.addChild(this.sprite);
    }

    /**
     * Updates particle physics and appearance
     */
    update() {
        // Apply physics
        this.velocity.x *= CONFIG.physics.FRICTION;
        this.velocity.y *= CONFIG.physics.FRICTION;
        this.velocity.y += CONFIG.physics.GRAVITY;

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Update life
        this.life -= this.decay;

        // Update character based on life progression
        const progressionLength = CONFIG.characters.PROGRESSION.length;
        const newCharIndex = Math.floor((1 - this.life) * progressionLength);

        if (newCharIndex !== this.currentCharIndex && newCharIndex < progressionLength) {
            this.currentCharIndex = newCharIndex;
            this.char = CONFIG.characters.PROGRESSION[newCharIndex];

            if (this.charTextures[this.char]) {
                this.sprite.texture = this.charTextures[this.char];
            }
        }

        // Update alpha with smooth curve
        this.alpha = Math.pow(this.life, 0.8);

        this.updateSprite();
    }

    /**
     * Updates sprite position, scale, and alpha
     */
    updateSprite() {
        this.sprite.x = this.x;
        this.sprite.y = this.y;

        const scaleFactor = CONFIG.particles.SCALE_MIN +
            (this.life * (CONFIG.particles.SCALE_MAX - CONFIG.particles.SCALE_MIN));

        this.sprite.scale.set(scaleFactor);
        this.sprite.alpha = this.alpha;
    }

    /**
     * Checks if particle is no longer alive
     * @returns {boolean} True if life <= 0
     */
    isDead() {
        return this.life <= 0;
    }

    /**
     * Removes particle from stage and cleans up resources
     */
    remove() {
        this.app.stage.removeChild(this.sprite);
        this.sprite.destroy();
    }
}

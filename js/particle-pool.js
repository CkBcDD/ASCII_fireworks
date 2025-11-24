/**
 * Particle Object Pool
 * Manages a pool of reusable particle objects to reduce GC pressure
 */
import { Particle } from './particle.js';

/**
 * Object pool for managing particle lifecycle
 */
export class ParticlePool {
    /**
     * @param {number} initialSize - Initial pool size
     * @param {number} maxSize - Maximum pool size
     * @param {Object} charTextures - Character texture map
     * @param {Object} app - Pixi application instance
     */
    constructor(initialSize = 1000, maxSize = 2000, charTextures, app) {
        this.pool = [];
        this.active = [];
        this.initialSize = initialSize;
        this.maxSize = maxSize;
        this.charTextures = charTextures;
        this.app = app;

        // Pre-allocate initial particles
        this.preallocate(initialSize);
    }

    /**
     * Pre-allocate particles to the pool
     * @param {number} count - Number of particles to create
     */
    preallocate(count) {
        for (let i = 0; i < count; i++) {
            const particle = new Particle(0, 0, { x: 0, y: 0 }, 0xFFFFFF, '*', this.charTextures, this.app);
            particle.isActive = false;
            particle.sprite.visible = false;
            this.pool.push(particle);
        }
    }

    /**
     * Get a particle from the pool or create a new one
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} velocity - Velocity object
     * @param {number} color - Color value
     * @param {string} char - Character to display
     * @returns {Particle} Particle instance
     */
    acquire(x, y, velocity, color, char) {
        let particle;

        if (this.pool.length > 0) {
            // Reuse from pool
            particle = this.pool.pop();
            particle.reset(x, y, velocity, color, char);
        } else if (this.active.length < this.maxSize) {
            // Create new if under max limit
            particle = new Particle(x, y, velocity, color, char, this.charTextures, this.app);
            console.warn(`Pool exhausted, creating new particle. Active: ${this.active.length}`);
        } else {
            // Pool exhausted and at max capacity
            console.warn(`Max particle limit reached: ${this.maxSize}`);
            return null;
        }

        particle.isActive = true;
        particle.sprite.visible = true;
        this.active.push(particle);
        return particle;
    }

    /**
     * Release a particle back to the pool
     * @param {Particle} particle - Particle to release
     */
    release(particle) {
        const index = this.active.indexOf(particle);
        if (index > -1) {
            this.active.splice(index, 1);
        }

        particle.isActive = false;
        particle.sprite.visible = false;
        this.pool.push(particle);
    }

    /**
     * Update all active particles
     */
    update() {
        // Use reverse iteration for safe removal during iteration
        for (let i = this.active.length - 1; i >= 0; i--) {
            const particle = this.active[i];
            particle.update();

            if (particle.isDead()) {
                // Remove from active array (swap with last element for O(1) removal)
                const lastParticle = this.active[this.active.length - 1];
                this.active[i] = lastParticle;
                this.active.pop();

                // Return to pool
                particle.isActive = false;
                particle.sprite.visible = false;
                this.pool.push(particle);
            }
        }
    }

    /**
     * Get the number of active particles
     * @returns {number}
     */
    getActiveCount() {
        return this.active.length;
    }

    /**
     * Get the number of particles in the pool
     * @returns {number}
     */
    getPoolSize() {
        return this.pool.length;
    }

    /**
     * Get pool statistics
     * @returns {Object}
     */
    getStats() {
        return {
            active: this.active.length,
            pooled: this.pool.length,
            total: this.active.length + this.pool.length,
            maxSize: this.maxSize
        };
    }

    /**
     * Clean up all particles and release resources
     */
    destroy() {
        // Clean up active particles
        for (const particle of this.active) {
            particle.remove();
        }

        // Clean up pooled particles
        for (const particle of this.pool) {
            particle.remove();
        }

        this.active = [];
        this.pool = [];
    }
}

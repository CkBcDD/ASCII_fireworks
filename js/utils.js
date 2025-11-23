/**
 * Utility functions
 */

/**
 * Converts a color to a numeric format
 * @param {number|string} color - Color as number or hex string
 * @returns {number} Numeric color value
 */
export function colorToNumber(color) {
    if (typeof color === 'number') return color;
    if (typeof color === 'string') {
        return parseInt(color.replace('#', ''), 16);
    }
    return 0xFFFFFF;
}

/**
 * Gets a random element from an array
 * @param {Array} arr - Array to select from
 * @returns {*} Random element
 */
export function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Gets a random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

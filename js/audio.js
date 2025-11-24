/**
 * Audio system for sound effects using direct HTML5 audio playback.
 * Replaces the previous Tone.js-based audio stack with a simple approach that
 * plays a local .opus audio file: './.resources/Banging_Firework.opus'.
 */
let isInitialized = false;
let explosionAudio = null;

/**
 * Initializes a simple audio element for explosion sounds.
 * Called on the first user gesture (e.g., mousedown) to ensure browsers allow playback.
 */
export async function initAudio() {
    if (isInitialized) return;

    try {
        // Create an Audio element and preload the resource
        explosionAudio = new Audio('./.resources/Banging_Firework.opus');
        explosionAudio.preload = 'auto';
        explosionAudio.volume = 1.0; // Default volume (0.0 - 1.0)

        // Attempt to load; most browsers will only allow play on user gesture
        explosionAudio.load();

        isInitialized = true;
        console.log('Audio initialized using HTML5 Audio (direct file)');
    } catch (error) {
        console.error('Failed to initialize audio element:', error);
    }
}

/**
 * Plays the explosion audio. We clone the audio element to allow overlapping playback
 * in case multiple fireworks explode simultaneously.
 */
export function playExplosion() {
    if (!isInitialized || !explosionAudio) {
        // Auto-init if not already done (will only be effective if called from user gesture)
        initAudio();
        if (!explosionAudio) return;
    }

    try {
        const player = explosionAudio.cloneNode();
        player.volume = explosionAudio.volume;
        // Ensure cloned node is removed after playback to avoid memory leaks
        player.onended = () => player.remove();
        // Play returns a Promise which can fail if browser blocks autoplay
        const playPromise = player.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch((err) => {
                // This is commonly blocked by browsers if not a gesture - just log and move on
                console.warn('Playback prevented:', err);
            });
        }
    } catch (error) {
        console.error('Failed to play explosion sound:', error);
    }
}

// Expose a setter for volume in case other parts of the app want to adjust it
export function setExplosionVolume(vol) {
    if (explosionAudio) explosionAudio.volume = Math.max(0, Math.min(1, vol));
}

/**
 * Configuration constants for ASCII Fireworks
 */
export const CONFIG = {
    physics: {
        GRAVITY: 0.08,
        FRICTION: 0.99,
    },
    particles: {
        COUNT_MIN: 100,
        COUNT_MAX: 120,
        SPEED_MIN: 2,
        SPEED_MAX: 5,
        DECAY_MIN: 0.005,
        DECAY_MAX: 0.015,
        SCALE_MIN: 0.7,
        SCALE_MAX: 1.0,
    },
    characters: {
        PARTICLE_CHARS: ['*', '+', '.', 'o', 'x', '#', '@', '%', '&'],
        PROGRESSION: ['@', '#', '&', '%', 'O', 'o', '*', '+', 'x', '.'],
    },
    colors: [
        0xFF0000, 0x00FF00, 0x0000FF,
        0xFFFF00, 0x00FFFF, 0xFF00FF,
        0xFFFFFF, 0xFF8800, 0xFF0088
    ],
    combo: {
        THRESHOLD_MS: 400,
        COMBP_TRIGGER: 52,
        AUTO_FIREWORKS_COUNT: 50,
        AUTO_FIREWORKS_INTERVAL_MS: 100,
    },
    superFirework: {
        PARTICLE_COUNT: 500,
        SPEED_MIN: 3,
        SPEED_MAX: 8,
        DURATION_MS: 8000,
        WAVE_COUNT: 5,
        WAVE_INTERVAL_MS: 300,
    },
    ui: {
        COMBO_SCALE_FACTOR: 0.05,
        PULSE_DURATION_MS: 50,
    },
    background: {
        STAR_COUNT: 150,
        STAR_SIZE_MIN: 1,
        STAR_SIZE_MAX: 3,
        STAR_ANIMATION_DURATION_MIN: 2,
        STAR_ANIMATION_DURATION_MAX: 5,
        STAR_OPACITY_MIN: 0.3,
        STAR_OPACITY_MAX: 1.0,
    },
    options: { ALLOW_MOUSE_CLICK_DURING_EASTER_EGG: true },
};

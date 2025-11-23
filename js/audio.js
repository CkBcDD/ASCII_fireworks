/**
 * Audio system for sound effects
 */
import { CONFIG } from './config.js';

let audioCtx = null;

/**
 * Initializes the Web Audio API context
 */
export function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Web Audio API not supported:', error);
            return;
        }
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(error => {
            console.error('Failed to resume audio context:', error);
        });
    }
}

/**
 * Plays an explosion sound effect using Web Audio API
 */
export function playExplosion() {
    if (!audioCtx) return;

    try {
        // Create white noise buffer
        const bufferSize = audioCtx.sampleRate * CONFIG.audio.BUFFER_DURATION;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        // Create audio nodes
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const gainNode = audioCtx.createGain();

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = CONFIG.audio.FILTER_FREQUENCY;

        // Connect nodes
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Set volume envelope
        const now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(CONFIG.audio.GAIN_INITIAL, now);
        gainNode.gain.exponentialRampToValueAtTime(
            CONFIG.audio.GAIN_FINAL,
            now + CONFIG.audio.EXPLOSION_DURATION
        );

        noise.start(now);
    } catch (error) {
        console.error('Failed to play explosion sound:', error);
    }
}

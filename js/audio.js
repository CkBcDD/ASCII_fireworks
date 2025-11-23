/**
 * Audio system for sound effects using Tone.js
 * (Optimized for more realistic firework sounds)
 */
import { CONFIG } from './config.js';

let isInitialized = false;
let explosionSynth = null;
let reverb = null;
let distortion = null;

/**
 * Initializes the Tone.js audio context
 */
export async function initAudio() {
    if (isInitialized) return;

    try {
        // Tone.js requires a user interaction to start the audio context
        await Tone.start();

        // 1. Create a reverb effect for space (slightly longer decay for a more epic feel)
        reverb = new Tone.Reverb({
            decay: 2.0,
            preDelay: 0.01
        }).toDestination();
        // Generate the impulse response
        await reverb.generate();

        // 2. Create a distortion effect to add "grit" to the explosion
        distortion = new Tone.Distortion(0.15).connect(reverb);

        // 3. Create a PolySynth for the explosion "thump"
        explosionSynth = new Tone.PolySynth(Tone.MembraneSynth, {
            pitchDecay: 0.04,
            octaves: 5,
            oscillator: {
                type: "fmsine" // 'fmsine' is more complex and "dirty" than 'sine'
            },
            envelope: {
                attack: 0.001,
                decay: 0.5,
                sustain: 0.01,
                release: 1.4,
                attackCurve: "exponential"
            }
        }).connect(distortion); // Connect to distortion, which then connects to reverb

        // Adjust volume
        explosionSynth.volume.value = -8;

        isInitialized = true;
        console.log('Audio initialized with Tone.js');
    } catch (error) {
        console.error('Failed to initialize audio:', error);
    }
}

/**
 * Plays an explosion sound effect
 */
export function playExplosion() {
    if (!isInitialized || !explosionSynth) return;

    try {
        // === 1. The "Thump" (low-frequency boom) ===
        // Randomize pitch slightly for variety
        const notes = ["C1", "C#1", "D1", "B0"];
        const note = notes[Math.floor(Math.random() * notes.length)];
        explosionSynth.triggerAttackRelease(note, "8n");


        // === 2. The "Whistle" (particle spread sound) ===
        // A quick downward pitch sweep to simulate particles flying outwards
        const whistle = new Tone.Oscillator({
            type: "fmsine",
            frequency: 3000,
            volume: -20, // Quieter than the boom
            detune: (Math.random() - 0.5) * 100 // Slight pitch variance
        }).connect(reverb).start();

        whistle.frequency.rampTo(400, 0.4); // Ramp down from 3000Hz to 400Hz in 0.4s
        whistle.stop("+0.4");
        // Clean up the node after it's done
        whistle.dispose("+0.5");


        // === 3. The "Crackle" (multiple, scattered high-frequency pops) ===
        // Remove the old single noise burst

        // Create multiple, scattered crackles
        const crackleCount = Math.floor(Math.random() * 10) + 10; // 10-20 crackles
        for (let i = 0; i < crackleCount; i++) {

            // Scatter the crackles over a short period
            const delay = Math.random() * 500; // Scatter over 500ms

            setTimeout(() => {
                // Check if audio is still running (e.g., user hasn't closed tab)
                if (!isInitialized) return;

                // Create a very short noise burst for each crackle
                const noise = new Tone.NoiseSynth({
                    noise: {
                        type: "pink",
                    },
                    envelope: {
                        attack: 0.001,
                        decay: Math.random() * 0.05 + 0.02, // short, varied decay
                        sustain: 0,
                        release: 0.05,
                    }
                }).connect(reverb);

                // Randomize volume for each crackle to sound natural
                noise.volume.value = -18 - (Math.random() * 10); // -18 to -28 dB
                noise.triggerAttackRelease("32n");

                // Clean up this noise node
                setTimeout(() => noise.dispose(), 300);

            }, delay);
        }

    } catch (error) {
        console.error('Failed to play explosion sound:', error);
    }
}
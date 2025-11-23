/**
 * Audio system for sound effects using Tone.js
 */
import { CONFIG } from './config.js';

let isInitialized = false;
let explosionSynth = null;
let reverb = null;

/**
 * Initializes the Tone.js audio context
 */
export async function initAudio() {
    if (isInitialized) return;

    try {
        // Tone.js requires a user interaction to start the audio context
        await Tone.start();

        // Create a reverb effect for space
        reverb = new Tone.Reverb({
            decay: 1.5,
            preDelay: 0.01
        }).toDestination();
        // Generate the impulse response
        await reverb.generate();

        // Create a PolySynth with MembraneSynth for the explosion body (thump)
        explosionSynth = new Tone.PolySynth(Tone.MembraneSynth, {
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.001,
                decay: 0.4,
                sustain: 0.01,
                release: 1.4,
                attackCurve: "exponential"
            }
        }).connect(reverb);

        // Adjust volume
        explosionSynth.volume.value = -5;

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
        // Randomize pitch slightly for variety
        const notes = ["C1", "C#1", "D1", "B0"];
        const note = notes[Math.floor(Math.random() * notes.length)];

        explosionSynth.triggerAttackRelease(note, "8n");

        // Add a noise burst for "crackle"
        // Creating a lightweight noise synth for each explosion to allow overlap
        const noise = new Tone.NoiseSynth({
            noise: {
                type: "pink",
            },
            envelope: {
                attack: 0.001,
                decay: 0.1,
                sustain: 0,
                release: 0.1,
            }
        }).connect(reverb);

        noise.volume.value = -10;
        noise.triggerAttackRelease("16n");

        // Clean up noise node after it finishes
        setTimeout(() => {
            noise.dispose();
        }, 1000);

    } catch (error) {
        console.error('Failed to play explosion sound:', error);
    }
}

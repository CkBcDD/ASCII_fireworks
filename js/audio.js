/**
 * Audio system for sound effects using Tone.js
 * (Optimized for more realistic firework sounds - V3)
 * (Changes based on feedback: Less reverb, more high-freq crackle, better volume balance)
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
        await Tone.start();

        // 1. Reverb: Reduced decay significantly for a "tighter" sound
        reverb = new Tone.Reverb({
            decay: 1.2, // V2 was 2.0, much shorter now
            preDelay: 0.01
        }).toDestination();
        await reverb.generate();

        // 2. Distortion: Reduced distortion to make it less "muddy"
        distortion = new Tone.Distortion(0.08).connect(reverb); // V2 was 0.15

        // 3. PolySynth (The "Thump"): Made it shorter and quieter
        explosionSynth = new Tone.PolySynth(Tone.MembraneSynth, {
            pitchDecay: 0.04,
            octaves: 5,
            oscillator: {
                type: "fmsine"
            },
            envelope: {
                attack: 0.001,
                decay: 0.1,     // V2 was 0.5 (shorter thump)
                sustain: 0.01,
                release: 0.5,   // V2 was 1.4 (shorter tail)
                attackCurve: "exponential"
            }
        }).connect(distortion);

        // Adjust volume: Reduced the "thump" volume
        explosionSynth.volume.value = -12; // V2 was -8

        isInitialized = true;
        console.log('Audio initialized with Tone.js (V3)');
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
        // Raised the pitch by one octave to make it less "dull"
        const notes = ["C2", "C#2", "D2", "B1"]; // V2 was C1, B0
        const note = notes[Math.floor(Math.random() * notes.length)];
        explosionSynth.triggerAttackRelease(note, "8n");


        // === 2. The "Whistle" (particle spread sound) ===
        // Raised volume slightly
        const whistle = new Tone.Oscillator({
            type: "fmsine",
            frequency: 3000,
            volume: -18, // V2 was -20
            detune: (Math.random() - 0.5) * 100
        }).connect(reverb).start();

        whistle.frequency.rampTo(400, 0.4);
        whistle.stop("+0.4");
        whistle.dispose("+0.5");


        // === 3. The "Crackle" (multiple, scattered high-frequency pops) ===
        // More crackles, louder, and using "white" noise for more highs

        // Create more crackles
        const crackleCount = Math.floor(Math.random() * 15) + 15; // V2 was 10-20
        for (let i = 0; i < crackleCount; i++) {

            const delay = Math.random() * 500; // Scatter over 500ms

            setTimeout(() => {
                if (!isInitialized) return;

                const noise = new Tone.NoiseSynth({
                    noise: {
                        type: "white", // V2 was "pink". "white" has more high-frequencies
                    },
                    envelope: {
                        attack: 0.001,
                        decay: Math.random() * 0.05 + 0.02,
                        sustain: 0,
                        release: 0.05,
                    }
                }).connect(reverb);

                // Significantly increased crackle volume
                noise.volume.value = -12 - (Math.random() * 10); // V2 was -18 to -28dB
                noise.triggerAttackRelease("32n");

                setTimeout(() => noise.dispose(), 300);

            }, delay);
        }

    } catch (error) {
        console.error('Failed to play explosion sound:', error);
    }
}
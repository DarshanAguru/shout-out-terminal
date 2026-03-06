import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { EventType } from '../types/eventTypes';
import { AUDIO_MAP } from './constants';

const player = require('play-sound')();

/**
 * Plays an audio file based on the detected terminal event.
 * Uses system players like aplay (Linux), afplay (macOS), or cmdmp3 (Windows) through the play-sound library.
 */
export const playAudio = (event: EventType) => {
    try {
        const mediaDir = path.join(__dirname, '..', 'media');
        const audioFile = AUDIO_MAP[event as keyof typeof AUDIO_MAP];

        if (!audioFile) {
            return;
        }

        const audioPath = path.join(mediaDir, audioFile);

        if (!fs.existsSync(audioPath)) {
            console.error(`Shout Out Terminal: Audio file not found at ${audioPath}`);
            return;
        }

        if (process.platform === 'win32') {
            // Use native PowerShell on Windows to avoid missing dependencies like cmdmp3
            exec(`powershell -c (New-Object Media.SoundPlayer '${audioPath}').PlaySync();`, (error) => {
                if (error) {
                    console.error(`Shout Out Terminal: Failed to play audio on Windows ${audioPath}`, error);
                }
            });
        } else {
            player.play(audioPath, (err: any) => {
                if (err && !err.killed) {
                    console.error(`Shout Out Terminal: Failed to play audio ${audioPath}`, err);
                }
            });
        }

    } catch (error) {
        console.error('Shout Out Terminal: Error in audio playback engine:', error);
    }
};

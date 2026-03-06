import * as path from 'path';
import * as fs from 'fs';
import { exec, ChildProcess } from 'child_process';
import { EventType } from '../types/eventTypes';
import { AUDIO_MAP } from './constants';

const player = require('play-sound')();
let currentAudioProcess: any = null;
let currentPlayId = 0;

const killCurrentAudio = () => {
    if (currentAudioProcess) {
        try {
            if (process.platform === 'win32' && currentAudioProcess.pid) {
                exec(`taskkill /pid ${currentAudioProcess.pid} /t /f`);
            } else if (currentAudioProcess.kill) {
                currentAudioProcess.kill('SIGKILL');
            }
        } catch (e) {}
        currentAudioProcess = null;
    }
};

export const playAudio = (event: EventType): Promise<void> => {
    return new Promise((resolve) => {
        const playId = ++currentPlayId;
        try {
            const mediaDir = path.join(__dirname, '..', 'media');
            const audioFile = AUDIO_MAP[event as keyof typeof AUDIO_MAP];

            if (!audioFile) {
                return resolve();
            }

            const audioPath = path.join(mediaDir, audioFile);

            if (!fs.existsSync(audioPath)) {
                console.error(`Shout Out Terminal: Audio file not found at ${audioPath}`);
                return resolve();
            }

            killCurrentAudio();

            if (playId !== currentPlayId) {
                return resolve();
            }

            if (process.platform === 'win32') {
                currentAudioProcess = exec(`powershell -c (New-Object Media.SoundPlayer '${audioPath}').PlaySync();`, (error) => {
                    if (error && error.killed === false) {
                        console.error(`Shout Out Terminal: Failed to play audio on Windows ${audioPath}`, error);
                    }
                    if (currentPlayId === playId) {
                        currentAudioProcess = null;
                    }
                    resolve();
                });
            } else {
                const audioObj = player.play(audioPath, (err: any) => {
                    if (err && !err.killed) {
                        console.error(`Shout Out Terminal: Failed to play audio ${audioPath}`, err);
                    }
                    if (currentPlayId === playId) {
                        currentAudioProcess = null;
                    }
                    resolve();
                });
                currentAudioProcess = audioObj;
            }

        } catch (error) {
            console.error('Shout Out Terminal: Error in audio playback engine:', error);
            resolve();
        }
    });
};

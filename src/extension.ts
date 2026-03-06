import * as vscode from 'vscode';
import { detectLanguage } from './utils/languageDetector';
import { parser } from './utils/parser';
import { playAudio } from './utils/audio';

// Debouncing to prevent rapid-fire audio playback
let audioTimeout: NodeJS.Timeout | null = null;
const AMATURE_AUDIO_DEBOUNCE_MS = 2000;

// Track detected events per execution (keyed by terminal)
const executionEvents = new Map<vscode.Terminal, Set<string>>();

// Track whether a known language/tool was detected to avoid false positives (e.g., cd, clear)
const executionLanguages = new Map<vscode.Terminal, string>();

export function activate(context: vscode.ExtensionContext) {
	// Command registration for basic verification
	const disposable = vscode.commands.registerCommand('shout-out-terminal.helloWorld', () => {
		vscode.window.showInformationMessage('Shout Out Terminal is active and ready to play!');
	});
	context.subscriptions.push(disposable);

	// Listen for terminal shell executions starting using the stable Shell Integration API
	const startDisposable = vscode.window.onDidStartTerminalShellExecution(async (e) => {
		const config = vscode.workspace.getConfiguration('shout-out-terminal');
		const mode = config.get<string>('mode') || 'amature';

		// Initialize event tracking for this terminal execution
		executionEvents.set(e.terminal, new Set());
		executionLanguages.set(e.terminal, 'unknown');

		const stream = e.execution.read();
		let detectedLanguage = 'unknown';

		try {
			for await (const data of stream) {
				const lowerData = data.toLowerCase();

				let language = detectLanguage(lowerData);

				if (language !== 'unknown') {
					detectedLanguage = language;
					executionLanguages.set(e.terminal, language);
				} else {
					language = detectedLanguage;
				}

				if (language !== 'unknown') {
					const eventType = parser(lowerData, language);
					if (eventType) {
						executionEvents.get(e.terminal)?.add(eventType);
						// Real-time processing for Amature Mode
						if (mode === 'amature' && !audioTimeout) {
							playAudio(eventType);
							audioTimeout = setTimeout(() => {
								audioTimeout = null;
							}, AMATURE_AUDIO_DEBOUNCE_MS);
						}
					}
				}
			}
		} catch (err) {
			// Silently handle stream errors or log to console in development
		}
	});

	context.subscriptions.push(startDisposable);

	// Listen for terminal shell executions ending to play summary or fallback sounds
	const endDisposable = vscode.window.onDidEndTerminalShellExecution(e => {
		const config = vscode.workspace.getConfiguration('shout-out-terminal');
		const mode = config.get<string>('mode') || 'amature';
		const events = executionEvents.get(e.terminal) || new Set();
		const lang = executionLanguages.get(e.terminal) || 'unknown';

		const hasError = events.has('error') || events.has('syntax_error') || events.has('build_failure');
		const hasTestFailed = events.has('test_failed');
		const hasTestPassed = events.has('test_passed');

		if (mode === 'amature') {
			// Handle end-of-execution sounds if no real-time sounds were played
			if (hasTestFailed) {
				playAudio('test_failed');
			} else if (events.size === 0 && e.exitCode === 0 && lang !== 'unknown') {
				playAudio('success');
			} else if (events.size === 0 && e.exitCode !== undefined && e.exitCode !== 0 && lang !== 'unknown') {
				playAudio('error');
			}
		} else {
			// Mature Mode summary logic
			if (hasTestFailed) {
				playAudio('test_failed');
			} else if (hasTestPassed && !hasError) {
				playAudio('test_passed');
			} else if (events.has('syntax_error')) {
				playAudio('syntax_error');
			} else if (events.has('build_failure')) {
				playAudio('build_failure');
			} else if (events.has('error')) {
				playAudio('error');
			} else if (events.has('build_success') || events.has('compiled')) {
				playAudio('build_success');
			} else if (e.exitCode !== undefined && e.exitCode !== 0 && lang !== 'unknown') {
				playAudio('error');
			} else if (e.exitCode === 0 && lang !== 'unknown') {
				playAudio('success');
			}
		}

		// Cleanup terminal state
		executionEvents.delete(e.terminal);
		executionLanguages.delete(e.terminal);
	});

	const closeDisposable = vscode.window.onDidCloseTerminal(t => {
		executionEvents.delete(t);
		executionLanguages.delete(t);
	});

	context.subscriptions.push(endDisposable, closeDisposable);
}

export function deactivate() {
	executionEvents.clear();
	executionLanguages.clear();
	if (audioTimeout) {
		clearTimeout(audioTimeout);
	}
}

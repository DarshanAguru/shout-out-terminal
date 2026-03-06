import * as vscode from 'vscode';
import { detectLanguage } from './utils/languageDetector';
import { parser } from './utils/parser';
import { playAudio } from './utils/audio';
import { MetricsProvider } from './providers/MetricsProvider';

// Tracks the terminal scope specifically created for Shout-Out analytics
const executionEvents = new Map<vscode.Terminal, Set<string>>();
const executionLanguages = new Map<vscode.Terminal, string>();

let shoutOutTerminal: vscode.Terminal | null = null;
let metricsProvider: MetricsProvider | null = null;

export function activate(context: vscode.ExtensionContext) {
	// Initialize and register Sidebar Provider
	metricsProvider = new MetricsProvider(context.extensionUri, context);
	vscode.window.registerWebviewViewProvider('shout-out-terminal.metricsView', metricsProvider);

	const resetDisposable = vscode.commands.registerCommand('shout-out-terminal.resetMetrics', () => {
		if (metricsProvider) {
			metricsProvider.resetMetrics();
			vscode.window.showInformationMessage('Shout Out Terminal: Metrics Track Record Reset!');
		}
	});

	const openDisposable = vscode.commands.registerCommand('shout-out-terminal.openTerminal', () => {
		if (shoutOutTerminal) {
			shoutOutTerminal.show();
		} else {
			shoutOutTerminal = vscode.window.createTerminal({ name: 'Shout-Out Terminal' });
			shoutOutTerminal.show();
			vscode.window.showInformationMessage('Shout Out Terminal is active and ready to play!');
		}
	});
	context.subscriptions.push(openDisposable, resetDisposable);

	const startDisposable = vscode.window.onDidStartTerminalShellExecution(async (e) => {
		if (e.terminal !== shoutOutTerminal) {
			return;
		}

		const config = vscode.workspace.getConfiguration('shout-out-terminal');
		const mode = config.get<string>('mode') || 'amature';

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
						if (mode === 'amature') {
							metricsProvider?.incrementMetric(eventType);
							playAudio(eventType);
						}
					}
				}
			}
		} catch (err) {
			// Silently handle stream errors or log to console in development
		}
	});

	context.subscriptions.push(startDisposable);

	const endDisposable = vscode.window.onDidEndTerminalShellExecution(e => {
		if (e.terminal !== shoutOutTerminal) {
			return;
		}

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
				metricsProvider?.incrementMetric('test_failed');
				playAudio('test_failed');
			} else if (events.size === 0 && e.exitCode === 0 && lang !== 'unknown') {
				metricsProvider?.incrementMetric('success');
				playAudio('success');
			} else if (events.size === 0 && e.exitCode !== undefined && e.exitCode !== 0 && lang !== 'unknown') {
				metricsProvider?.incrementMetric('error');
				playAudio('error');
			}
		} else {
			// Mature Mode summary logic
			if (hasTestFailed) {
				metricsProvider?.incrementMetric('test_failed');
				playAudio('test_failed');
			} else if (hasTestPassed && !hasError) {
				metricsProvider?.incrementMetric('test_passed');
				playAudio('test_passed');
			} else if (events.has('syntax_error')) {
				metricsProvider?.incrementMetric('syntax_error');
				playAudio('syntax_error');
			} else if (events.has('build_failure')) {
				metricsProvider?.incrementMetric('build_failure');
				playAudio('build_failure');
			} else if (events.has('error')) {
				metricsProvider?.incrementMetric('error');
				playAudio('error');
			} else if (events.has('build_success') || events.has('compiled')) {
				metricsProvider?.incrementMetric('build_success');
				playAudio('build_success');
			} else if (e.exitCode !== undefined && e.exitCode !== 0 && lang !== 'unknown') {
				metricsProvider?.incrementMetric('error');
				playAudio('error');
			} else if (e.exitCode === 0 && lang !== 'unknown') {
				metricsProvider?.incrementMetric('success');
				playAudio('success');
			}
		}

		executionEvents.delete(e.terminal);
		executionLanguages.delete(e.terminal);
	});

	const closeDisposable = vscode.window.onDidCloseTerminal(t => {
		if (t === shoutOutTerminal) {
			shoutOutTerminal = null;
		}
		executionEvents.delete(t);
		executionLanguages.delete(t);
	});

	context.subscriptions.push(endDisposable, closeDisposable);
}

export function deactivate() {
	executionEvents.clear();
	executionLanguages.clear();
	shoutOutTerminal = null;
}

import * as vscode from 'vscode';
import { EventType } from '../types/eventTypes';

export class MetricsProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private readonly storageKeyPrefix = 'sot_metrics_';

    private readonly displayOrder = [
        { key: 'success', label: 'Commands Succeeded', color: '#4ade80', icon: 'check-circle' },
        { key: 'build_success', label: 'Builds Succeeded', color: '#2dd4bf', icon: 'check-all' },
        { key: 'test_passed', label: 'Tests Passed', color: '#818cf8', icon: 'beaker' },
        { key: 'compiled', label: 'Compilations', color: '#fbbf24', icon: 'gear' },
        { key: 'sysexit', label: 'Processes Exited', color: '#94a3b8', icon: 'sign-out' },
        { key: 'warning', label: 'Warnings Triggered', color: '#fb923c', icon: 'warning' },
        { key: 'error', label: 'General Errors', color: '#f87171', icon: 'error' },
        { key: 'syntax_error', label: 'Syntax Errors', color: '#f43f5e', icon: 'bug' },
        { key: 'build_failure', label: 'Build Failures', color: '#e11d48', icon: 'bracket-error' },
        { key: 'test_failed', label: 'Tests Failed', color: '#9f1239', icon: 'test-view-icon' }
    ];

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly context: vscode.ExtensionContext
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'reset':
                    this.resetMetrics();
                    break;
            }
        });

        this.refresh();
    }

    refresh(): void {
        if (this._view) {
            this._view.webview.html = this._getHtmlForWebview(this._view.webview);
            this._view.webview.postMessage({ type: 'update' });
        }
    }

    incrementMetric(event: EventType) {
        const currentCount = this.context.globalState.get<number>(`${this.storageKeyPrefix}${event}`) || 0;
        this.context.globalState.update(`${this.storageKeyPrefix}${event}`, currentCount + 1).then(() => {
            this.refresh();
        });
    }

    resetMetrics() {
        const promises = this.displayOrder.map(item =>
            this.context.globalState.update(`${this.storageKeyPrefix}${item.key}`, 0)
        );

        Promise.all(promises).then(() => {
            this.refresh();
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const bannerUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'banner.png'));
        const iconUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'icon.png'));

        const metricsHtml = this.displayOrder.map(item => {
            const count = this.context.globalState.get<number>(`${this.storageKeyPrefix}${item.key}`) || 0;
            return `
                <div class="metric-card" style="border-left-color: ${item.color}">
                    <div class="metric-info">
                        <i class="codicon codicon-${item.icon}" style="color: ${item.color}"></i>
                        <span class="metric-label">${item.label}</span>
                    </div>
                    <div class="metric-count">${count}</div>
                </div>
            `;
        }).join('');

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Shout Out Metrics</title>
                <link href="${webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'))}" rel="stylesheet" />
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        padding: 0;
                        margin: 0;
                        background-color: transparent;
                        color: var(--vscode-foreground);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .hero {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 20px 0;
                        background: linear-gradient(135deg, rgba(26,26,46,0.8) 0%, rgba(22,33,62,0.8) 100%);
                        border-bottom: 1px solid var(--vscode-panel-border);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        margin-bottom: 15px;
                    }
                    .logo {
                        width: 80px;
                        height: 80px;
                        margin-bottom: 10px;
                        filter: drop-shadow(0px 0px 8px rgba(129, 140, 248, 0.4));
                    }
                    .title {
                        font-size: 1.2rem;
                        font-weight: 600;
                        color: #ffffff;
                        letter-spacing: 0.5px;
                        margin: 0;
                    }
                    .subtitle {
                        font-size: 0.85rem;
                        color: #94a3b8;
                        margin-top: 4px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .metrics-container {
                        width: 90%;
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        padding-bottom: 20px;
                    }
                    .metric-card {
                        background-color: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-widget-border);
                        border-left-width: 4px;
                        border-radius: 6px;
                        padding: 12px 16px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                        transition: transform 0.15s ease, box-shadow 0.15s ease;
                    }
                    .metric-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        background-color: var(--vscode-list-hoverBackground);
                    }
                    .metric-info {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .metric-info i {
                        font-size: 1.2rem;
                    }
                    .metric-label {
                        font-size: 0.95rem;
                        font-weight: 500;
                    }
                    .metric-count {
                        font-size: 1.4rem;
                        font-weight: 700;
                        font-variant-numeric: tabular-nums;
                    }
                    .reset-btn {
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        font-size: 0.9rem;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-top: 10px;
                        margin-bottom: 20px;
                        width: 90%;
                        justify-content: center;
                        transition: background-color 0.2s;
                    }
                    .reset-btn:hover {
                        background-color: var(--vscode-button-hoverBackground);
                    }
                </style>
            </head>
            <body>
                <div class="hero">
                    <img src="${iconUri}" class="logo" alt="Shout Out Terminal Logo" />
                    <h1 class="title">Shout Out Terminal</h1>
                    <span class="subtitle">Developer Health</span>
                </div>
                
                <div class="metrics-container">
                    ${metricsHtml}
                </div>

                <button class="reset-btn" id="resetBtn">
                    <i class="codicon codicon-trash"></i> Reset All Metrics
                </button>

                <script>
                    const vscode = acquireVsCodeApi();
                    
                    document.getElementById('resetBtn').addEventListener('click', () => {
                        vscode.postMessage({ type: 'reset' });
                    });

                    window.addEventListener('message', event => {
                        const message = event.data;
                        if (message.type === 'update') {}
                    });
                </script>
            </body>
            </html>`;
    }
}

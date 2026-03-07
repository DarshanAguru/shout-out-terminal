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
        const iconUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar-icon.svg'));

        const metricsHtml = this.displayOrder.map((item, index) => {
            const count = this.context.globalState.get<number>(`${this.storageKeyPrefix}${item.key}`) || 0;
            // Add staggered animation delay
            const delay = index * 0.05;
            
            return `
                <div class="metric-card" style="--metric-color: ${item.color}; animation-delay: ${delay}s">
                    <div class="metric-count">${count}</div>
                    <div class="metric-info">
                        <i class="codicon codicon-${item.icon}"></i>
                        <span class="metric-label">${item.label}</span>
                    </div>
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
                    :root {
                        --bg-gradient-start: rgba(26, 26, 46, 0.95);
                        --bg-gradient-end: rgba(22, 33, 62, 0.95);
                        --card-bg: var(--vscode-editor-background);
                        --card-border: var(--vscode-widget-border);
                        --card-hover-bg: var(--vscode-list-hoverBackground);
                        --text-primary: var(--vscode-foreground);
                        --text-secondary: #94a3b8;
                    }

                    body {
                        font-family: var(--vscode-font-family);
                        padding: 0;
                        margin: 0;
                        background-color: transparent;
                        color: var(--text-primary);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        box-sizing: border-box;
                    }

                    * {
                        box-sizing: inherit;
                    }

                    @keyframes slideUpFade {
                        from {
                            opacity: 0;
                            transform: translateY(15px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .hero {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 24px 0 20px 0;
                        background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
                        border-bottom: 1px solid var(--vscode-panel-border);
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                        margin-bottom: 20px;
                        position: relative;
                        overflow: hidden;
                    }

                    .hero::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 2px;
                        background: linear-gradient(90deg, #4ade80, #818cf8, #fbbf24, #f43f5e);
                        opacity: 0.8;
                    }

                    .logo {
                        width: 64px;
                        height: 64px;
                        margin-bottom: 12px;
                        filter: drop-shadow(0px 0px 12px rgba(129, 140, 248, 0.5));
                        animation: slideUpFade 0.6s ease-out forwards;
                    }

                    .title {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #ffffff;
                        letter-spacing: 0.5px;
                        margin: 0;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                        animation: slideUpFade 0.6s ease-out 0.1s forwards;
                        opacity: 0;
                    }

                    .subtitle {
                        font-size: 0.75rem;
                        color: var(--text-secondary);
                        margin-top: 6px;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        font-weight: 600;
                        animation: slideUpFade 0.6s ease-out 0.2s forwards;
                        opacity: 0;
                    }

                    .metrics-container {
                        width: 100%;
                        padding: 0 16px 24px 16px;
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                        gap: 12px;
                    }

                    .metric-card {
                        background-color: var(--card-bg);
                        border: 1px solid var(--card-border);
                        border-top: 3px solid var(--metric-color);
                        border-radius: 8px;
                        padding: 16px 12px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        text-align: center;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05);
                        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                        position: relative;
                        overflow: hidden;
                        
                        /* Animation */
                        opacity: 0;
                        animation: slideUpFade 0.5s ease-out forwards;
                    }
                    
                    /* Subtle background glow based on metric color */
                    .metric-card::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: radial-gradient(circle at top, var(--metric-color) 0%, transparent 70%);
                        opacity: 0.05;
                        pointer-events: none;
                        transition: opacity 0.3s ease;
                    }

                    .metric-card:hover {
                        transform: translateY(-4px) scale(1.02);
                        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--metric-color);
                        background-color: var(--card-hover-bg);
                        z-index: 1;
                    }
                    
                    .metric-card:hover::after {
                        opacity: 0.15;
                    }

                    .metric-count {
                        font-size: 2rem;
                        font-weight: 800;
                        font-variant-numeric: tabular-nums;
                        color: var(--metric-color);
                        line-height: 1;
                        margin-bottom: 12px;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }

                    .metric-info {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 6px;
                        width: 100%;
                    }

                    .metric-info i {
                        font-size: 1.1rem;
                        color: var(--text-secondary);
                        transition: color 0.3s ease, transform 0.3s ease;
                    }
                    
                    .metric-card:hover .metric-info i {
                        color: var(--text-primary);
                        transform: scale(1.1);
                    }

                    .metric-label {
                        font-size: 0.8rem;
                        font-weight: 600;
                        color: var(--text-secondary);
                        line-height: 1.2;
                        transition: color 0.3s ease;
                    }
                    
                    .metric-card:hover .metric-label {
                        color: var(--text-primary);
                    }

                    .actions-container {
                        width: 100%;
                        padding: 0 16px 24px 16px;
                        display: flex;
                        justify-content: center;
                    }

                    .reset-btn {
                        background-color: transparent;
                        color: var(--text-secondary);
                        border: 1px solid var(--card-border);
                        padding: 10px 20px;
                        border-radius: 6px;
                        font-size: 0.85rem;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        width: 100%;
                        justify-content: center;
                        transition: all 0.2s ease;
                        opacity: 0;
                        animation: slideUpFade 0.6s ease-out 0.8s forwards;
                    }

                    .reset-btn i {
                        font-size: 1rem;
                    }

                    .reset-btn:hover {
                        background-color: rgba(225, 29, 72, 0.1);
                        color: #e11d48;
                        border-color: #e11d48;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 8px rgba(225, 29, 72, 0.15);
                    }
                    
                    .reset-btn:active {
                        transform: translateY(1px);
                    }

                    /* Scrollbar Styling */
                    ::-webkit-scrollbar {
                        width: 10px;
                    }
                    ::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: var(--vscode-scrollbarSlider-background);
                        border-radius: 5px;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: var(--vscode-scrollbarSlider-hoverBackground);
                    }
                    ::-webkit-scrollbar-thumb:active {
                        background: var(--vscode-scrollbarSlider-activeBackground);
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

                <div class="actions-container">
                    <button class="reset-btn" id="resetBtn" title="Reset all track record statistics to zero">
                        <i class="codicon codicon-trash"></i> Reset Analytics
                    </button>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();
                    
                    document.getElementById('resetBtn').addEventListener('click', () => {
                        // Optional: Add a subtle click effect
                        const btn = document.getElementById('resetBtn');
                        btn.style.transform = 'scale(0.95)';
                        setTimeout(() => btn.style.transform = '', 150);
                        
                        vscode.postMessage({ type: 'reset' });
                    });

                    window.addEventListener('message', event => {
                        const message = event.data;
                        if (message.type === 'update') {
                            // Can add subtle refresh animation here if needed
                        }
                    });
                </script>
            </body>
            </html>`;
    }
}

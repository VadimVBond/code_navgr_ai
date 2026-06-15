import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Project OS is now active!');

    let disposable = vscode.commands.registerCommand('ai-project-os.openPanel', () => {
        ProjectPanel.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(disposable);
}

class ProjectPanel {
    public static currentPanel: ProjectPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (ProjectPanel.currentPanel) {
            ProjectPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'aiProjectOS',
            'AI Project OS',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(extensionUri.fsPath, 'resources'))]
            }
        );

        ProjectPanel.currentPanel = new ProjectPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public dispose() {
        ProjectPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        this._panel.webview.html = this._getHtmlForWebview();
    }

    private _getHtmlForWebview() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const projectName = workspaceFolders ? workspaceFolders[0].name : 'No workspace open';

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Project OS</title>
            <style>
                body { font-family: sans-serif; padding: 20px; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
                h1 { color: var(--vscode-textLink-foreground); }
                .card { border: 1px solid var(--vscode-widget-border); padding: 15px; border-radius: 5px; background: var(--vscode-editor-background); }
                .badge { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); padding: 2px 8px; border-radius: 10px; font-size: 0.8em; }
            </style>
        </head>
        <body>
            <h1>AI Project OS</h1>
            <div class="card">
                <h2>Project: ${projectName}</h2>
                <p>Status: <span class="badge">Connected</span></p>
                <hr>
                <div id="tech-stack">
                    <p>Detecting tech stack...</p>
                </div>
            </div>
        </body>
        </html>`;
    }
}

export function deactivate() {}

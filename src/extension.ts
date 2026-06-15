import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectProfileEngine } from './modules/projectProfile';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Project OS is now active!');

    const profileEngine = new ProjectProfileEngine();

    let disposable = vscode.commands.registerCommand('ai-project-os.openPanel', async () => {
        const profile = await profileEngine.generateProfile();
        ProjectPanel.createOrShow(context.extensionUri, profile);
    });

    context.subscriptions.push(disposable);
}

class ProjectPanel {
    public static currentPanel: ProjectPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _profile: any;

    public static createOrShow(extensionUri: vscode.Uri, profile: any) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (ProjectPanel.currentPanel) {
            ProjectPanel.currentPanel._updateProfile(profile);
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

        ProjectPanel.currentPanel = new ProjectPanel(panel, extensionUri, profile);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, profile: any) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._profile = profile;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    private _updateProfile(profile: any) {
        this._profile = profile;
        this._update();
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
        const profile = this._profile;

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Project OS</title>
            <style>
                body { font-family: sans-serif; padding: 20px; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); line-height: 1.6; }
                h1 { color: var(--vscode-textLink-foreground); border-bottom: 1px solid var(--vscode-widget-border); padding-bottom: 10px; }
                .card { border: 1px solid var(--vscode-widget-border); padding: 15px; border-radius: 5px; background: var(--vscode-editor-background); margin-bottom: 20px; }
                .badge { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); padding: 2px 8px; border-radius: 10px; font-size: 0.8em; margin-right: 5px; }
                .tech-item { margin: 5px 0; }
                .confidence { font-style: italic; color: var(--vscode-descriptionForeground); font-size: 0.9em; }
                .section-title { font-weight: bold; margin-top: 15px; display: block; }
            </style>
        </head>
        <body>
            <h1>AI Project OS</h1>
            
            <div class="card">
                <h2>Project: ${projectName}</h2>
                <p>Status: <span class="badge">Connected</span></p>
            </div>

            <div class="card">
                <h3>Project Profile</h3>
                <div class="tech-item">
                    <span class="section-title">Primary Type:</span>
                    <strong>${profile.type}</strong> 
                    <span class="confidence">(Confidence: ${(profile.confidence * 100).toFixed(0)}%)</span>
                </div>
                
                <div class="tech-item">
                    <span class="section-title">Detected Technologies:</span>
                    ${profile.technologies.map((t: string) => `<span class="badge">${t}</span>`).join('') || 'None'}
                </div>

                <div class="tech-item">
                    <span class="section-title">Evidence (Detected Files):</span>
                    <ul style="margin-top: 5px;">
                        ${profile.detectedFiles.map((f: string) => `<li><code>${f}</code></li>`).join('') || '<li>None</li>'}
                    </ul>
                </div>
            </div>
        </body>
        </html>`;
    }
}

export function deactivate() {}

import * as vscode from 'vscode';
import { ProjectProfile } from '../core/types';
import { TechDetector } from './techDetector';

export class ProjectProfileEngine {
    private _currentProfile: ProjectProfile | undefined;

    public async generateProfile(): Promise<ProjectProfile> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return this._getDefaultProfile();
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        this._currentProfile = await TechDetector.detect(rootPath);
        return this._currentProfile;
    }

    public getProfile(): ProjectProfile | undefined {
        return this._currentProfile;
    }

    private _getDefaultProfile(): ProjectProfile {
        return {
            type: 'No Workspace',
            confidence: 0,
            technologies: [],
            detectedFiles: []
        };
    }
}

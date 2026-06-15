import * as vscode from 'vscode';
import * as path from 'path';
import { DetectionRule, ProjectProfile } from '../core/types';

export class TechDetector {
    private static readonly rules: DetectionRule[] = [
        { name: 'MkDocs', files: ['mkdocs.yml'], confidence: 0.9 },
        { name: 'Next.js', files: ['next.config.js', 'next.config.mjs'], confidence: 0.9 },
        { name: 'Astro', files: ['astro.config.mjs', 'astro.config.cjs', 'astro.config.js'], confidence: 0.9 },
        { name: 'Django', files: ['manage.py'], confidence: 0.8 },
        { name: 'Flask', files: ['app.py', 'flask_app.py'], confidence: 0.7 },
        { name: 'Node.js', files: ['package.json'], confidence: 0.5 }
    ];

    public static async detect(workspaceRoot: string): Promise<ProjectProfile> {
        const detectedTechnologies: string[] = [];
        const detectedFiles: string[] = [];
        let maxConfidence = 0;
        let primaryType = 'Unknown';

        for (const rule of TechDetector.rules) {
            let ruleMatched = false;
            for (const fileName of rule.files) {
                const filePath = path.join(workspaceRoot, fileName);
                try {
                    const fileUri = vscode.Uri.file(filePath);
                    await vscode.workspace.fs.stat(fileUri);
                    detectedFiles.push(fileName);
                    ruleMatched = true;
                } catch {
                    // File does not exist
                }
            }

            if (ruleMatched) {
                detectedTechnologies.push(rule.name);
                if (rule.confidence > maxConfidence) {
                    maxConfidence = rule.confidence;
                    primaryType = rule.name;
                }
            }
        }

        return {
            type: primaryType,
            confidence: maxConfidence,
            technologies: detectedTechnologies,
            detectedFiles: detectedFiles
        };
    }
}

export interface ProjectProfile {
    type: string;
    confidence: number;
    technologies: string[];
    detectedFiles: string[];
}

export interface DetectionRule {
    name: string;
    files: string[];
    confidence: number;
    requiredFiles?: string[];
}

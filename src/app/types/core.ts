export interface ReportTemplate {
    id: number;
    title: string;
    description: string;
    definition: string;
    icon: string;
    openai_properties: Record<string, any>;
    required_fields?: string[];
}

export interface PhotoAttachment {
    id: string;
    filename: string;
    size: number;
    type: string;
    dataUrl: string;
    capturedAt: string;
    fieldName?: string; // If photo is associated with a specific form field
}

export interface SubmittedReport {
    id: number;
    title: string;
    templateType: string;
    date: string;
    status: 'Completed' | 'Under Review' | 'Draft';
    summary: string;
    plainText: string;
    json: Record<string, any>;
    photoAttachments?: PhotoAttachment[];
    isNew?: boolean;
}

export interface StoredReport extends SubmittedReport {
    savedAt: string;
}

// Template creation atoms (for template mode)
export interface TemplateCreationProgress {
    title?: string;
    description?: string;
    definition?: string;
    icon?: string;
    fields?: Array<{
        name: string;
        type: "string" | "number" | "boolean";
        description: string;
        required: boolean;
        enum?: string[];
    }>;
    currentPhase?: 'core-attributes' | 'field-definition' | 'review';
}

// Voice mode types
export type VoiceMode = 'guided' | 'freeform';

export interface VoiceModeOption {
    value: VoiceMode;
    label: string;
    description: string;
}

export interface FunctionHandlerContext {
    // State setters
    setTemplateCreationProgress: (progress: any) => void;
    setCreatedTemplate: (template: any) => void;
    setFormProgress: (progress: any) => void;

    // Data access
    formData: Record<string, any>;
    selectedTemplate?: any;

    // Callbacks
    onFormCompleted?: (summary: any) => void;
    endSession: () => void;
    addReport: (report: any) => void;
    addTemplate: (template: any) => any;
}

export interface FunctionCallMessage {
    name: string;
    arguments: string;
    call_id: string;
}

export interface TemplateInstructionsContext {
    userName?: string;
}
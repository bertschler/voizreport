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
import { WebRTCService } from './webrtcService';
import { FormSummary } from '@/app/state/voiceChatState';
import { convertCreatedTemplateToReportTemplate } from '@/app/state/templatesState';
import { SubmittedReport } from '@/app/data/mockData';

// Type definitions for function handlers
export interface FunctionHandlerContext {
  // State setters
  setTemplateCreationProgress: (progress: any) => void;
  setCreatedTemplate: (template: any) => void;
  setFormProgress: (progress: any) => void;
  
  // Data access
  formData: Record<string, any>;
  selectedTemplate?: any;
  
  // Callbacks
  onFormCompleted?: (summary: FormSummary) => void;
  endSession: () => void;
  addReport: (report: SubmittedReport) => void;
  addTemplate: (template: any) => any;
}

export interface FunctionCallMessage {
  name: string;
  arguments: string;
  call_id: string;
}

// Utility functions
export const generateFormSummary = (formData: Record<string, any>): FormSummary => {
  const timestamp = Date.now();
  const plainText = "";
  const json = {
    timestamp: timestamp,
    completed_at: new Date(timestamp).toISOString(),
    data: formData,
  };
  return { plainText, json, timestamp };
};

export const createSubmittedReport = (summary: FormSummary, selectedTemplate?: any): SubmittedReport => {
  const now = new Date();
  const reportId = Date.now();
  
  return {
    id: reportId,
    title: selectedTemplate?.title || 'Voice Report',
    templateType: selectedTemplate?.title || 'Custom Report',
    date: now.toLocaleDateString(),
    status: 'Completed',
    summary: summary.plainText.substring(0, 150) + (summary.plainText.length > 150 ? '...' : ''),
    plainText: summary.plainText,
    json: summary.json,
    isNew: true
  };
};

// Exit function handlers
export const handleExitConversation = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('🚫 Exit conversation function called');
  context.endSession();
};

export const handleExitTemplateCreation = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('🚫 Exit template creation function called');
  context.endSession();
};

// Template creation handlers
export const handleTemplateProgressUpdated = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('🎨 Template progress updated function called with:', message.arguments);
  
  try {
    const parsedArgs = JSON.parse(message.arguments);
    
    // Update template creation progress
    if (parsedArgs.template_data) {
      context.setTemplateCreationProgress(parsedArgs.template_data);
      console.log('🎨 Updated template creation progress:', parsedArgs.template_data);
    }
    
    // Send success response
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'success',
      message: 'Template progress updated successfully'
    });
  } catch (error) {
    console.error('💥 Error handling template progress update:', error);
    
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'error',
      message: 'Failed to update template progress'
    });
  }
};

export const handleCompleteTemplateCreation = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  try {
    const parsedArgs = JSON.parse(message.arguments);
    console.log('🎨 Template creation completion function called with:', parsedArgs);
    
    // Save the completed template
    if (parsedArgs.template_data) {
      context.setCreatedTemplate(parsedArgs.template_data);
      
      // Convert and save to persistent templates state
      const convertedTemplate = convertCreatedTemplateToReportTemplate(parsedArgs.template_data);
      const savedTemplate = context.addTemplate(convertedTemplate);
      
      console.log('🎨 Template creation completed and saved:', {
        original: parsedArgs.template_data,
        converted: convertedTemplate,
        saved: savedTemplate
      });
    }
    
    // Send success response
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'success',
      message: 'Template created successfully!'
    });
    
    // Notify parent component if needed
    if (context.onFormCompleted) {
      const templateSummary = {
        plainText: `Template "${parsedArgs.template_data?.title || 'New Template'}" created successfully`,
        json: parsedArgs.template_data || {},
        timestamp: Date.now()
      };
      context.onFormCompleted(templateSummary);
    }
    
    // End session after delay
    setTimeout(() => {
      context.endSession();
    }, 3000);
    
  } catch (error) {
    console.error('💥 Error handling template creation completion:', error);
    
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'error',
      message: 'Failed to complete template creation'
    });
  }
};

// Report filling handlers
export const handleFormFieldsUpdated = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('📋 Form fields updated function called with:', message.arguments);
  
  try {
    const parsedArgs = JSON.parse(message.arguments);
    
    // Update form progress with the extracted data
    if (parsedArgs.extracted_data) {
      context.setFormProgress(parsedArgs.extracted_data);
      console.log('📋 Updated form progress:', parsedArgs.extracted_data);
    }
    if (parsedArgs.debug_info) {
      console.log('📋 Debug info:', parsedArgs.debug_info);
    }
  } catch (error) {
    console.error('💥 Error handling form fields update:', error);
  }
};

export const handleCompleteFormSubmission = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  try {
    const parsedArgs = JSON.parse(message.arguments);
    console.log('📋 Form completion function called with:', parsedArgs);
    
    const currentFormData = {
      ...context.formData,
      ...parsedArgs.extracted_data
    };
    
    const transcription = parsedArgs.transcription_compact || '';
    const summary = generateFormSummary(currentFormData);
    
    if (transcription) {
      summary.json.transcription = transcription;
      summary.plainText += `${transcription}`;
    }
    
    console.log('📋 Generated form summary:', summary);
    
    // Create and save the report
    const submittedReport = createSubmittedReport(summary, context.selectedTemplate);
    context.addReport(submittedReport);
    
    // Send success response
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'success',
      message: 'Form completed successfully. Report has been generated and saved.',
      summary: {
        total_fields: Object.keys(currentFormData).length,
        completed_fields: Object.keys(currentFormData).filter(key => 
          currentFormData[key] && String(currentFormData[key]).trim() !== ''
        ).length
      }
    });
    
    // Notify parent component
    if (context.onFormCompleted) {
      context.onFormCompleted(summary);
    }
    
    // End session after delay
    setTimeout(() => {
      context.endSession();
    }, 3000);
    
  } catch (error) {
    console.error('💥 Error handling form submission:', error);
    
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'error',
      message: 'Failed to complete form submission'
    });
  }
};

// Main function handler dispatcher
export const handleFunctionCall = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('🎯 Handling function call:', message.name, message.arguments);
  
  const handlers: Record<string, (msg: FunctionCallMessage, ctx: FunctionHandlerContext) => Promise<void>> = {
    'exit_conversation': handleExitConversation,
    'exit_template_creation': handleExitTemplateCreation,
    'template_progress_updated': handleTemplateProgressUpdated,
    'complete_template_creation': handleCompleteTemplateCreation,
    'form_fields_updated': handleFormFieldsUpdated,
    'complete_form_submission': handleCompleteFormSubmission,
  };
  
  const handler = handlers[message.name];
  if (handler) {
    await handler(message, context);
  } else {
    console.warn('⚠️ Unknown function call:', message.name);
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'error',
      message: `Unknown function: ${message.name}`
    });
  }
}; 
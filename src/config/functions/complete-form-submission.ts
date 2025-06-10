import { WebRTCService } from '@/app/services/webrtcService';
import { photoAttachmentsAtom } from '@/app/state/voiceChatState';
import { store } from '@/app/services/jotaiStore';
import { ReportTemplate, SubmittedReport, PhotoAttachment } from '@/app/data/mockData';
import { FunctionHandlerContext, FunctionCallMessage } from './types';

// Photo attachment utilities
const getPhotoAttachments = (): PhotoAttachment[] => {
  return store.get(photoAttachmentsAtom);
};

const clearPhotoAttachments = (): void => {
  store.set(photoAttachmentsAtom, []);
  console.log('📸 Cleared all photo attachments');
};

// Utility functions
const generateFormSummary = (formData: Record<string, any>) => {
  const timestamp = Date.now();
  const plainText = "";
  const json: Record<string, any> = {
    timestamp: timestamp,
    completed_at: new Date(timestamp).toISOString(),
    data: formData,
  };
  return { plainText, json, timestamp };
};

const createSubmittedReport = (summary: any, selectedTemplate?: any): SubmittedReport => {
  const now = new Date();
  const reportId = Date.now();
  
  // Get current photo attachments
  const photoAttachments = getPhotoAttachments();
  
  return {
    id: reportId,
    title: selectedTemplate?.title || 'Voice Report',
    templateType: selectedTemplate?.title || 'Custom Report',
    date: now.toLocaleDateString(),
    status: 'Completed',
    summary: summary.plainText.substring(0, 150) + (summary.plainText.length > 150 ? '...' : ''),
    plainText: summary.plainText,
    json: summary.json,
    photoAttachments: photoAttachments.length > 0 ? photoAttachments : undefined,
    isNew: true
  };
};

// Tool definition
export const getCompleteFormSubmissionTool = (template?: ReportTemplate) => {
  const extractedDataProperties = template?.openai_properties || {};
  const requiredFields = template?.required_fields || [];
  
  return {
    type: 'function',
    name: 'complete_form_submission',
    description: 'Call this function when all required form fields have been collected and the form is ready to be submitted. This will generate a comprehensive report summary and end the session.',
    parameters: {
      type: 'object',
      properties: {
        extracted_data: {
          type: 'object',
          description: 'All the form data that has been collected during the conversation',
          properties: extractedDataProperties,
          required: requiredFields
        },
        transcription_compact: {
          type: 'string',
          description: 'A compact transcription of the full conversation that has been collected.',
        },
        completion_reason: {
          type: 'string',
          enum: ['all_required_fields_collected', 'sufficient_information_gathered', 'user_indicated_completion', 'user_stopped_conversation'],
          description: 'Reason why the form is being completed'
        }
      },
      required: ['extracted_data', 'completion_reason', 'transcription_compact']
    }
  };
};

// Handler function
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

    // Add photo attachments info to summary
    const currentPhotos = getPhotoAttachments();
    if (currentPhotos.length > 0) {
      summary.json.photoAttachments = currentPhotos.map(photo => ({
        id: photo.id,
        filename: photo.filename,
        size: photo.size,
        capturedAt: photo.capturedAt,
        fieldName: photo.fieldName
      }));
    }
    
    console.log('📋 Generated form summary:', summary);
    
    // Create and save the report
    const submittedReport = createSubmittedReport(summary, context.selectedTemplate);
    context.addReport(submittedReport);
    
    // Clear photo attachments after successful submission
    clearPhotoAttachments();
    
    // Send success response
    const photoSummary = currentPhotos.length > 0 ? ` Included ${currentPhotos.length} photo attachment(s).` : '';
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'success',
      message: `Form completed successfully. Report has been generated and saved.${photoSummary}`,
      summary: {
        total_fields: Object.keys(currentFormData).length,
        completed_fields: Object.keys(currentFormData).filter(key => 
          currentFormData[key] && String(currentFormData[key]).trim() !== ''
        ).length,
        photo_attachments: currentPhotos.length
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
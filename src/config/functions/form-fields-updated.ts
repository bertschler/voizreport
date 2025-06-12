import { WebRTCService } from '@/app/services/webrtcService';
import { photoAttachmentsAtom, nextFieldToUpdateAtom } from '@/app/state/voiceChatState';
import { store } from '@/app/services/jotaiStore';
import { ReportTemplate } from '@/app/data/mockData';
import { FunctionHandlerContext, FunctionCallMessage } from './types';

// Photo attachment utilities
const getPhotoAttachments = () => {
  return store.get(photoAttachmentsAtom);
};

// Tool definition
export const getFormFieldsUpdatedTool = (template?: ReportTemplate) => {
  const extractedDataProperties = template?.openai_properties || {};
  const requiredFields = template?.required_fields || [];
  
  return {
    type: 'function',
    name: 'form_fields_updated',
    description: 'Call this function whenever a field in the form is set or updated or slightly modified. Pass *all fields* with the current values, even if they are empty. Call this function many times, after any field change or even after minor field changes. This is immediate feedback to the user which is crucial.',
    parameters: {
      type: 'object',
      properties: {
        extracted_data: {
          type: 'object',
          description: 'All the form data that has been collected so far during the conversation. Pass all fields with the current values, even if they are empty.',
          properties: extractedDataProperties,
          required: requiredFields
        },
        next_field_to_update: {
          type: 'string',
          description: 'The name of the next form field that should be updated. This is used to guide the user to the next field that needs to be updated. If there are no more fields to update, leave this blank.'
        },
        debug_info: {
          type: 'string',
          description: 'Debug information only. All notes that could be helpful to improve the accuracy of the form fields in the future. This must not intervene the natural flow of the conversation, e.g. if ambiguous or not clear, still ask or dobuble check the user\'s response. Can be left blank if everything went well.'
        }
      },
      required: ['extracted_data', 'next_field_to_update', 'debug_info']
    }
  };
};

// Handler function
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
    
    // Update next field to update if provided
    if (parsedArgs.next_field_to_update !== undefined) {
      store.set(nextFieldToUpdateAtom, parsedArgs.next_field_to_update || undefined);
      console.log('📋 Updated next field to update:', parsedArgs.next_field_to_update);
    }
    
    if (parsedArgs.debug_info) {
      console.log('📋 Debug info:', parsedArgs.debug_info);
    }

    // Send back current photo attachments to keep AI informed
    const currentPhotos = getPhotoAttachments();
    if (currentPhotos.length > 0) {
      WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
        status: 'success',
        message: 'Form fields updated successfully',
        photo_attachments: currentPhotos.map(photo => ({
          id: photo.id,
          filename: photo.filename,
          size: photo.size,
          capturedAt: photo.capturedAt,
          fieldName: photo.fieldName
        }))
      });
    }
  } catch (error) {
    console.error('💥 Error handling form fields update:', error);
  }
}; 
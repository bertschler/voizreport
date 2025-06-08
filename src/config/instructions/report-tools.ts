import { ReportTemplate } from '@/app/data/mockData';

export const getReportTools = (template?: ReportTemplate) => {
  const extractedDataProperties = template?.openai_properties || {};
  const requiredFields = template?.required_fields || [];
  
  return [
    {
      type: 'function',
      name: 'form_fields_updated',
      description: 'Call this function when a field in the form is set or updated. Pass all fields with the current values (or empty if not set yet).',
      parameters: {
        type: 'object',
        properties: {
          extracted_data: {
            type: 'object',
            description: 'All the form data that has been collected so far during the conversation',
            properties: extractedDataProperties,
            required: requiredFields
          },
          debug_info: {
            type: 'string',
            description: 'Debug information about the form fields that have been updated. Only include if you (the AI) were having trouble understanding the user\'s response and/or is was very difficult to extract the data (maybe the user was not clear or the response was not in the correct format).'
          }
        },
        required: ['extracted_data']
      }
    },
    {
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
    },
    {
      type: 'function',
      name: 'exit_conversation',
      description: 'Call this function immediately when the user wants to cancel, stop, exit, quit, abort, or end the conversation at any time. This is only to be used when the user explicitly wants to end the conversation without saving the form.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      type: 'function',
      name: 'open_camera',
      description: 'Call this function ONLY when the camera is NOT currently open and the user wants to take a photo or attach a picture (e.g., "I want to take a picture", "add a photo", "attach an image"). This will open the device camera interface and display the camera preview.',
      parameters: {
        type: 'object',
        properties: {
          facing_mode: {
            type: 'string',
            enum: ['user', 'environment'],
            description: 'Camera facing mode - "user" for front camera, "environment" for rear camera. Defaults to rear camera.'
          }
        },
        required: []
      }
    },
    {
      type: 'function',
      name: 'capture_photo',
      description: 'Call this function ONLY when the camera is already open and the user wants to actually capture/take the photo (e.g., "capture it", "take the photo", "capture now", "take it", "snap it", "shoot"). This will take the photo and automatically close the camera.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  ];
}; 
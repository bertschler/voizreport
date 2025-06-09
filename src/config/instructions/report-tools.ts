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
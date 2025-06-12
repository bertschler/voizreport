import { WebRTCService } from '@/app/services/webrtcService';

import { FunctionCallMessage, FunctionHandlerContext } from "@/app/types/core";

// Tool definition
export const getTemplateProgressUpdatedTool = () => {
  return {
    type: 'function',
    name: 'template_progress_updated',
    description: 'Call this function when template creation progress is set or updated (title, description, fields, etc.). Pass all fields with the current values (or empty if not set yet).',
    parameters: {
      type: 'object',
      properties: {
        template_data: {
          type: 'object',
          description: 'Current template creation progress',
          properties: {
            title: { type: 'string', description: 'Template title' },
            description: { type: 'string', description: 'Template description' },
            definition: { type: 'string', description: 'Template definition/instructions' },
            icon: { type: 'string', description: 'Template icon (emoji)' },
            fields: { 
              type: 'array',
              description: 'Template fields being defined',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Field name/key' },
                  type: { type: 'string', description: 'Field data type (string, number, boolean, etc.)' },
                  description: { type: 'string', description: 'Field description for voice prompts' },
                  required: { type: 'boolean', description: 'Whether this field is required' },
                  enum: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'Optional: List of allowed values for multiple choice fields'
                  }
                },
                required: ['name', 'type', 'description', 'required'],
                additionalProperties: false
              }
            },
            current_phase: { 
              type: 'string', 
              enum: ['core-attributes', 'field-definition', 'review'],
              description: 'Current phase of template creation' 
            }
          }
        }
      },
      required: ['template_data']
    }
  };
};

// Handler function
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
    WebRTCService.getInstance().sendFunctionResponseWithAudio(message.call_id, {
      status: 'success',
      message: 'Template progress updated successfully'
    });
  } catch (error) {
    console.error('💥 Error handling template progress update:', error);
    
    WebRTCService.getInstance().sendFunctionResponseWithAudio(message.call_id, {
      status: 'error',
      message: 'Failed to update template progress'
    });
  }
}; 
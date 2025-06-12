import { WebRTCService } from '@/app/services/webrtcService';
import { convertCreatedTemplateToReportTemplate } from '@/app/state/templatesState';

import { FunctionCallMessage, FunctionHandlerContext } from "@/app/types/core";

// Tool definition
export const getCompleteTemplateCreationTool = () => {
  return {
    type: 'function',
    name: 'complete_template_creation',
    description: 'Call this function when the template creation is complete and ready to be finalized. Pass all fields with the current values (or empty if not set yet).',
    parameters: {
      type: 'object',
      properties: {
        template_data: {
          type: 'object',
          description: 'Current template creation progress with all fields',
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
            }
          }
        }
      },
      required: ['template_data']
    }
  };
};

// Handler function
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
    WebRTCService.getInstance().sendFunctionResponseWithAudio(message.call_id, {
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
    
    WebRTCService.getInstance().sendFunctionResponseWithAudio(message.call_id, {
      status: 'error',
      message: 'Failed to complete template creation'
    });
  }
}; 
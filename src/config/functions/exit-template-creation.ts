import { FunctionHandlerContext, FunctionCallMessage } from './types';

// Tool definition
export const getExitTemplateCreationTool = () => {
  return {
    type: 'function',
    name: 'exit_template_creation',
    description: 'Call this function when the user wants to cancel template creation.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  };
};

// Handler function
export const handleExitTemplateCreation = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('🚫 Exit template creation function called');
  context.endSession();
}; 
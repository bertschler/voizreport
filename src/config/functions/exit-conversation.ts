import { FunctionCallMessage, FunctionHandlerContext } from "@/app/types/core";

// Tool definition
export const getExitConversationTool = () => {
  return {
    type: 'function',
    name: 'exit_conversation',
    description: 'Call this function immediately when the user wants to cancel, stop, exit, quit, abort, or end the conversation at any time. This is only to be used when the user explicitly wants to end the conversation without saving the form.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  };
};

// Handler function
export const handleExitConversation = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('🚫 Exit conversation function called');
  context.endSession();
}; 
// Export types
import { FunctionCallMessage, FunctionHandlerContext } from "@/app/types/core";

// Export form-related functions
export { 
  getFormFieldsUpdatedTool, 
  handleFormFieldsUpdated 
} from './form-fields-updated';

export { 
  getCompleteFormSubmissionTool, 
  handleCompleteFormSubmission 
} from './complete-form-submission';

export { 
  getExitConversationTool, 
  handleExitConversation 
} from './exit-conversation';

// Export camera functions
export { 
  getOpenCameraTool, 
  handleOpenCamera 
} from './open-camera';

export { 
  getCapturePhotoTool, 
  handleCapturePhoto 
} from './capture-photo';

// Export template creation functions
export { 
  getTemplateProgressUpdatedTool, 
  handleTemplateProgressUpdated 
} from './template-progress-updated';

export { 
  getCompleteTemplateCreationTool, 
  handleCompleteTemplateCreation 
} from './complete-template-creation';

export { 
  getExitTemplateCreationTool, 
  handleExitTemplateCreation 
} from './exit-template-creation';

// Function handler registry

type FunctionHandler = (message: FunctionCallMessage, context: FunctionHandlerContext) => Promise<void>;

class FunctionRegistry {
  private handlers = new Map<string, FunctionHandler>();
  
  register(name: string, handler: FunctionHandler): void {
    this.handlers.set(name, handler);
  }
  
  async handle(message: FunctionCallMessage, context: FunctionHandlerContext): Promise<void> {
    console.log('🎯 Handling function call:', message.name, message.arguments);
    
    const handler = this.handlers.get(message.name);
    if (handler) {
      await handler(message, context);
    } else {
      console.warn('⚠️ Unknown function call:', message.name);
    }
  }
}

// Create and populate the registry
const registry = new FunctionRegistry();

// Register handlers immediately (no dynamic imports needed)
import { handleExitConversation } from './exit-conversation';
import { handleExitTemplateCreation } from './exit-template-creation';
import { handleTemplateProgressUpdated } from './template-progress-updated';
import { handleCompleteTemplateCreation } from './complete-template-creation';
import { handleFormFieldsUpdated } from './form-fields-updated';
import { handleCompleteFormSubmission } from './complete-form-submission';
import { handleOpenCamera } from './open-camera';
import { handleCapturePhoto } from './capture-photo';

registry.register('exit_conversation', handleExitConversation);
registry.register('exit_template_creation', handleExitTemplateCreation);
registry.register('template_progress_updated', handleTemplateProgressUpdated);
registry.register('complete_template_creation', handleCompleteTemplateCreation);
registry.register('form_fields_updated', handleFormFieldsUpdated);
registry.register('complete_form_submission', handleCompleteFormSubmission);
registry.register('open_camera', handleOpenCamera);
registry.register('capture_photo', handleCapturePhoto);

// Export the main dispatcher
export const handleFunctionCall = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  await registry.handle(message, context);
};
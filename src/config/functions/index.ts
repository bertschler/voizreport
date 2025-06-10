// Export types
export type { FunctionHandlerContext, FunctionCallMessage } from './types';

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

// Function handler dispatcher
import { FunctionCallMessage, FunctionHandlerContext } from './types';

export const handleFunctionCall = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('🎯 Handling function call:', message.name, message.arguments);
  
  // Dynamic imports to avoid circular dependencies
  const handlers: Record<string, () => Promise<any>> = {
    'exit_conversation': () => import('./exit-conversation').then(m => m.handleExitConversation),
    'exit_template_creation': () => import('./exit-template-creation').then(m => m.handleExitTemplateCreation),
    'template_progress_updated': () => import('./template-progress-updated').then(m => m.handleTemplateProgressUpdated),
    'complete_template_creation': () => import('./complete-template-creation').then(m => m.handleCompleteTemplateCreation),
    'form_fields_updated': () => import('./form-fields-updated').then(m => m.handleFormFieldsUpdated),
    'complete_form_submission': () => import('./complete-form-submission').then(m => m.handleCompleteFormSubmission),
    'open_camera': () => import('./open-camera').then(m => m.handleOpenCamera),
    'capture_photo': () => import('./capture-photo').then(m => m.handleCapturePhoto),
  };
  
  const handlerLoader = handlers[message.name];
  if (handlerLoader) {
    const handler = await handlerLoader();
    await handler(message, context);
  } else {
    console.warn('⚠️ Unknown function call:', message.name);
    // Note: WebRTCService import moved to individual function files to avoid circular imports
  }
}; 
import { WebRTCService } from '@/app/services/webrtcService';
import { FunctionHandlerContext, FunctionCallMessage } from './types';
import { globalCameraState } from './open-camera';

// Tool definition
export const getCapturePhotoTool = () => {
  return {
    type: 'function',
    name: 'capture_photo',
    description: 'Call this function ONLY when the camera is already open and the user wants to actually capture/take the photo (e.g., "capture it", "take the photo", "capture now", "take it", "snap it", "shoot"). This will take the photo and automatically close the camera.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  };
};

// Handler function
export const handleCapturePhoto = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('📸 Voice capture photo function called with:', message.arguments);
  
  try {
    // Check if camera is currently open
    if (!globalCameraState.isOpen || !globalCameraState.captureFunction) {
      throw new Error('Camera is not currently open. Please open the camera first.');
    }

    // Trigger photo capture with the voice command's call_id
    globalCameraState.captureFunction(message.call_id);
    
    console.log('📸 Photo capture triggered via voice command');
    
  } catch (error) {
    console.error('💥 Error capturing photo via voice:', error);
    
    let errorMessage = 'Failed to capture photo';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'error',
      message: errorMessage
    });
  }
}; 
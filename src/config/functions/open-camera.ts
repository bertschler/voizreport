import { WebRTCService } from '@/app/services/webrtcService';
import { photoAttachmentsAtom } from '@/app/state/voiceChatState';
import { store } from '@/app/services/jotaiStore';
import { PhotoAttachment } from '@/app/data/mockData';
import { FunctionHandlerContext, FunctionCallMessage } from './types';

// Global camera state for voice-triggered capture
let globalCameraState: {
  isOpen: boolean;
  captureFunction: ((responseCallId?: string) => void) | null;
  cleanup: (() => void) | null;
} = {
  isOpen: false,
  captureFunction: null,
  cleanup: null
};

// Photo attachment utilities
const addPhotoAttachment = (photo: PhotoAttachment): void => {
  const currentPhotos = store.get(photoAttachmentsAtom);
  const updatedPhotos = [...currentPhotos, photo];
  store.set(photoAttachmentsAtom, updatedPhotos);
  console.log('📸 Added photo attachment:', photo.filename, 'Total photos:', updatedPhotos.length);
};

// Export for use by capture-photo
export { globalCameraState };

// Tool definition
export const getOpenCameraTool = () => {
  return {
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
  };
};

// Handler function
export const handleOpenCamera = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('📸 Open camera function called with:', message.arguments);
  
  try {
    const parsedArgs = JSON.parse(message.arguments);
    
    // Check if camera is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera not supported in this browser');
    }
    
    // Request camera access
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: parsedArgs.facing_mode || 'environment' // Default to rear camera
      } 
    });
    
    // Create video element to display camera feed
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 9999;
      max-width: 90vw;
      max-height: 90vh;
      border-radius: 12px;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    `;
    
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 9998;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
    
    // Create capture button
    const captureBtn = document.createElement('button');
    captureBtn.textContent = '📸 Capture Photo';
    captureBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      padding: 12px 24px;
      font-size: 16px;
      background: #007AFF;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    `;
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      width: 40px;
      height: 40px;
      font-size: 20px;
      background: rgba(0,0,0,0.5);
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
    `;
    
    // Cleanup function
    const cleanup = () => {
      try {
        console.log('📸 Starting cleanup process...');
        
        // Stop camera stream
        stream.getTracks().forEach(track => {
          console.log('📸 Stopping track:', track.kind);
          track.stop();
        });
        
        // Remove overlay from DOM
        if (overlay && overlay.parentNode) {
          console.log('📸 Removing camera overlay...');
          overlay.remove();
        } else {
          console.warn('📸 Overlay not found or already removed');
        }
        
        // Clear global camera state
        globalCameraState.isOpen = false;
        globalCameraState.captureFunction = null;
        globalCameraState.cleanup = null;
        
        console.log('📸 Camera cleanup completed');
      } catch (error) {
        console.error('💥 Error during camera cleanup:', error);
      }
    };
    
    // Create reusable capture function
    const capturePhoto = (responseCallId?: string) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create file object
          const filename = `photo_${Date.now()}.jpg`;
          const file = new File([blob], filename, { type: 'image/jpeg' });
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

          // Create photo attachment
          const photoAttachment: PhotoAttachment = {
            id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            filename: filename,
            size: file.size,
            type: file.type,
            dataUrl: dataUrl,
            capturedAt: new Date().toISOString()
          };

          // Save photo attachment
          addPhotoAttachment(photoAttachment);

          // TODO save photo to google cloud storage
          
          // Send success response with photo data (use provided call ID or original)
          WebRTCService.getInstance().sendFunctionResponse(responseCallId || message.call_id, {
            status: 'success',
            message: `Photo captured and saved as ${filename}. This photo is now attached to the report.`,
            camera_state: 'closed',
            photo: {
              id: photoAttachment.id,
              filename: filename,
              size: file.size,
              type: file.type,
              data_url: dataUrl
            }
          });
          
          console.log('📸 Photo captured and saved:', filename, file.size, 'bytes');
          
          // Cleanup after successful capture
          console.log('📸 Cleaning up camera...');
          cleanup();
        } else {
          console.error('📸 Failed to create blob from canvas');
        }
      }, 'image/jpeg', 0.8);
    };

    // Handle capture button click
    captureBtn.onclick = () => {
      // Notify AI that photo was captured via button
      WebRTCService.getInstance().sendConversationMessage(
        'I just clicked the capture button and the photo was taken successfully. The camera is now closed.'
      );
      
      capturePhoto();
    };
    
    // Handle close
    closeBtn.onclick = () => {
      // Notify AI that camera was closed via button
      WebRTCService.getInstance().sendConversationMessage(
        'I just clicked the close button and cancelled the camera. The camera is now closed.'
      );
      
      cleanup();
      WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
        status: 'cancelled',
        message: 'Camera cancelled by user',
        camera_state: 'closed'
      });
    };
    
    // Set up global camera state for voice capture
    globalCameraState.isOpen = true;
    globalCameraState.captureFunction = capturePhoto;
    globalCameraState.cleanup = cleanup;

    // Add elements to DOM
    overlay.appendChild(video);
    overlay.appendChild(captureBtn);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    
    // Send success response to inform AI that camera is now open
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'success',
      message: 'Camera opened successfully',
      camera_state: 'open',
      instructions: 'Camera is now open and showing live preview. When user says to capture/take the photo, call capture_photo function.'
    });
    
    console.log('📸 Camera opened successfully');
    
  } catch (error) {
    console.error('💥 Error opening camera:', error);
    
    let errorMessage = 'Failed to open camera';
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera permission.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else {
        errorMessage = error.message;
      }
    }
    
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'error',
      message: errorMessage
    });
  }
}; 
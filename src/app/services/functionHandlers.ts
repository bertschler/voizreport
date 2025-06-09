import { WebRTCService } from './webrtcService';
import { FormSummary, photoAttachmentsAtom } from '@/app/state/voiceChatState';
import { convertCreatedTemplateToReportTemplate } from '@/app/state/templatesState';
import { SubmittedReport, PhotoAttachment } from '@/app/data/mockData';
import { store } from './jotaiStore';

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

// Type definitions for function handlers
export interface FunctionHandlerContext {
  // State setters
  setTemplateCreationProgress: (progress: any) => void;
  setCreatedTemplate: (template: any) => void;
  setFormProgress: (progress: any) => void;
  
  // Data access
  formData: Record<string, any>;
  selectedTemplate?: any;
  
  // Callbacks
  onFormCompleted?: (summary: FormSummary) => void;
  endSession: () => void;
  addReport: (report: SubmittedReport) => void;
  addTemplate: (template: any) => any;
}

// Photo attachment utilities using Jotai atoms
export const addPhotoAttachment = (photo: PhotoAttachment): void => {
  const currentPhotos = store.get(photoAttachmentsAtom);
  const updatedPhotos = [...currentPhotos, photo];
  store.set(photoAttachmentsAtom, updatedPhotos);
  console.log('📸 Added photo attachment:', photo.filename, 'Total photos:', updatedPhotos.length);
};

export const getPhotoAttachments = (): PhotoAttachment[] => {
  return store.get(photoAttachmentsAtom);
};

export const clearPhotoAttachments = (): void => {
  store.set(photoAttachmentsAtom, []);
  console.log('📸 Cleared all photo attachments');
};

export const associatePhotoWithField = (photoId: string, fieldName: string): boolean => {
  const currentPhotos = store.get(photoAttachmentsAtom);
  const updatedPhotos = currentPhotos.map(photo => 
    photo.id === photoId ? { ...photo, fieldName } : photo
  );
  
  const wasUpdated = currentPhotos.some(photo => photo.id === photoId);
  if (wasUpdated) {
    store.set(photoAttachmentsAtom, updatedPhotos);
    console.log('📸 Associated photo', photoId, 'with field', fieldName);
    return true;
  }
  return false;
};

export interface FunctionCallMessage {
  name: string;
  arguments: string;
  call_id: string;
}

// Utility functions
export const generateFormSummary = (formData: Record<string, any>): FormSummary => {
  const timestamp = Date.now();
  const plainText = "";
  const json = {
    timestamp: timestamp,
    completed_at: new Date(timestamp).toISOString(),
    data: formData,
  };
  return { plainText, json, timestamp };
};

export const createSubmittedReport = (summary: FormSummary, selectedTemplate?: any): SubmittedReport => {
  const now = new Date();
  const reportId = Date.now();
  
  // Get current photo attachments
  const photoAttachments = getPhotoAttachments();
  
  return {
    id: reportId,
    title: selectedTemplate?.title || 'Voice Report',
    templateType: selectedTemplate?.title || 'Custom Report',
    date: now.toLocaleDateString(),
    status: 'Completed',
    summary: summary.plainText.substring(0, 150) + (summary.plainText.length > 150 ? '...' : ''),
    plainText: summary.plainText,
    json: summary.json,
    photoAttachments: photoAttachments.length > 0 ? photoAttachments : undefined,
    isNew: true
  };
};

// Exit function handlers
export const handleExitConversation = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('🚫 Exit conversation function called');
  context.endSession();
};

export const handleExitTemplateCreation = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('🚫 Exit template creation function called');
  context.endSession();
};

// Template creation handlers
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
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'success',
      message: 'Template progress updated successfully'
    });
  } catch (error) {
    console.error('💥 Error handling template progress update:', error);
    
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'error',
      message: 'Failed to update template progress'
    });
  }
};

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
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
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
    
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'error',
      message: 'Failed to complete template creation'
    });
  }
};

// Report filling handlers
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

export const handleFormFieldsUpdated = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('📋 Form fields updated function called with:', message.arguments);
  
  try {
    const parsedArgs = JSON.parse(message.arguments);
    
    // Update form progress with the extracted data
    if (parsedArgs.extracted_data) {
      context.setFormProgress(parsedArgs.extracted_data);
      console.log('📋 Updated form progress:', parsedArgs.extracted_data);
    }
    if (parsedArgs.debug_info) {
      console.log('📋 Debug info:', parsedArgs.debug_info);
    }

    // Send back current photo attachments to keep AI informed
    const currentPhotos = getPhotoAttachments();
    if (currentPhotos.length > 0) {
      WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
        status: 'success',
        message: 'Form fields updated successfully',
        photo_attachments: currentPhotos.map(photo => ({
          id: photo.id,
          filename: photo.filename,
          size: photo.size,
          capturedAt: photo.capturedAt,
          fieldName: photo.fieldName
        }))
      });
    }
  } catch (error) {
    console.error('💥 Error handling form fields update:', error);
  }
};

export const handleCompleteFormSubmission = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  try {
    const parsedArgs = JSON.parse(message.arguments);
    console.log('📋 Form completion function called with:', parsedArgs);
    
    const currentFormData = {
      ...context.formData,
      ...parsedArgs.extracted_data
    };
    
    const transcription = parsedArgs.transcription_compact || '';
    const summary = generateFormSummary(currentFormData);
    
    if (transcription) {
      summary.json.transcription = transcription;
      summary.plainText += `${transcription}`;
    }

    // Add photo attachments info to summary
    const currentPhotos = getPhotoAttachments();
    if (currentPhotos.length > 0) {
      summary.json.photoAttachments = currentPhotos.map(photo => ({
        id: photo.id,
        filename: photo.filename,
        size: photo.size,
        capturedAt: photo.capturedAt,
        fieldName: photo.fieldName
      }));
    }
    
    console.log('📋 Generated form summary:', summary);
    
    // Create and save the report
    const submittedReport = createSubmittedReport(summary, context.selectedTemplate);
    context.addReport(submittedReport);
    
    // Clear photo attachments after successful submission
    clearPhotoAttachments();
    
    // Send success response
    const photoSummary = currentPhotos.length > 0 ? ` Included ${currentPhotos.length} photo attachment(s).` : '';
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'success',
      message: `Form completed successfully. Report has been generated and saved.${photoSummary}`,
      summary: {
        total_fields: Object.keys(currentFormData).length,
        completed_fields: Object.keys(currentFormData).filter(key => 
          currentFormData[key] && String(currentFormData[key]).trim() !== ''
        ).length,
        photo_attachments: currentPhotos.length
      }
    });
    
    // Notify parent component
    if (context.onFormCompleted) {
      context.onFormCompleted(summary);
    }
    
    // End session after delay
    setTimeout(() => {
      context.endSession();
    }, 3000);
    
  } catch (error) {
    console.error('💥 Error handling form submission:', error);
    
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'error',
      message: 'Failed to complete form submission'
    });
  }
};

export const handleAssociatePhotoWithField = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('📸 Associate photo with field function called with:', message.arguments);
  
  try {
    const parsedArgs = JSON.parse(message.arguments);
    const { photo_id, field_name } = parsedArgs;
    
    if (!photo_id || !field_name) {
      throw new Error('photo_id and field_name are required');
    }
    
    const success = associatePhotoWithField(photo_id, field_name);
    
    if (success) {
      WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
        status: 'success',
        message: `Photo ${photo_id} associated with field ${field_name}`
      });
    } else {
      throw new Error(`Photo ${photo_id} not found`);
    }
    
  } catch (error) {
    console.error('💥 Error associating photo with field:', error);
    
    let errorMessage = 'Failed to associate photo with field';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'error',
      message: errorMessage
    });
  }
};

// Main function handler dispatcher
export const handleFunctionCall = async (
  message: FunctionCallMessage,
  context: FunctionHandlerContext
): Promise<void> => {
  console.log('🎯 Handling function call:', message.name, message.arguments);
  
  const handlers: Record<string, (msg: FunctionCallMessage, ctx: FunctionHandlerContext) => Promise<void>> = {
    'exit_conversation': handleExitConversation,
    'exit_template_creation': handleExitTemplateCreation,
    'template_progress_updated': handleTemplateProgressUpdated,
    'complete_template_creation': handleCompleteTemplateCreation,
    'form_fields_updated': handleFormFieldsUpdated,
    'complete_form_submission': handleCompleteFormSubmission,
    'open_camera': handleOpenCamera,
    'capture_photo': handleCapturePhoto,
    'associate_photo_with_field': handleAssociatePhotoWithField,
  };
  
  const handler = handlers[message.name];
  if (handler) {
    await handler(message, context);
  } else {
    console.warn('⚠️ Unknown function call:', message.name);
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'error',
      message: `Unknown function: ${message.name}`
    });
  }
}; 
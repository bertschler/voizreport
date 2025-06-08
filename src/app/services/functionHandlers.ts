import { WebRTCService } from './webrtcService';
import { FormSummary } from '@/app/state/voiceChatState';
import { convertCreatedTemplateToReportTemplate } from '@/app/state/templatesState';
import { SubmittedReport } from '@/app/data/mockData';

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
  
  return {
    id: reportId,
    title: selectedTemplate?.title || 'Voice Report',
    templateType: selectedTemplate?.title || 'Custom Report',
    date: now.toLocaleDateString(),
    status: 'Completed',
    summary: summary.plainText.substring(0, 150) + (summary.plainText.length > 150 ? '...' : ''),
    plainText: summary.plainText,
    json: summary.json,
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
      stream.getTracks().forEach(track => track.stop());
      overlay.remove();
    };
    
    // Handle capture
    captureBtn.onclick = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create file object
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

          // TODO save photo to google cloud storage
          
          // Send success response with photo data
          WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
            status: 'success',
            message: 'Photo captured successfully',
            photo: {
              name: file.name,
              size: file.size,
              type: file.type,
              data_url: canvas.toDataURL('image/jpeg', 0.8)
            }
          });
          
          console.log('📸 Photo captured:', file.name, file.size, 'bytes');
        }
      }, 'image/jpeg', 0.8);
      
      cleanup();
    };
    
    // Handle close
    closeBtn.onclick = () => {
      cleanup();
      WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
        status: 'cancelled',
        message: 'Camera cancelled by user'
      });
    };
    
    // Add elements to DOM
    overlay.appendChild(video);
    overlay.appendChild(captureBtn);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    
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
    
    console.log('📋 Generated form summary:', summary);
    
    // Create and save the report
    const submittedReport = createSubmittedReport(summary, context.selectedTemplate);
    context.addReport(submittedReport);
    
    // Send success response
    WebRTCService.getInstance().sendFunctionResponse(message.call_id, {
      status: 'success',
      message: 'Form completed successfully. Report has been generated and saved.',
      summary: {
        total_fields: Object.keys(currentFormData).length,
        completed_fields: Object.keys(currentFormData).filter(key => 
          currentFormData[key] && String(currentFormData[key]).trim() !== ''
        ).length
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
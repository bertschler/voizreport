import { useAtom, useSetAtom } from 'jotai';
import { useRef } from 'react';
import {
  sessionIdAtom,
  isSessionActiveAtom,
  isConnectingAtom,
  errorAtom,
  transcriptAtom,
  aiResponseAtom,
  hasPermissionAtom,
  formDataAtom,
  formProgressAtom,
  activeTemplateAtom,
  FormSummary
} from '@/app/state/voiceChatState';
import { addReportAtom } from '@/app/state/reportsState';
import { WebRTCService, WebRTCServiceCallbacks } from '@/app/services/webrtcService';
import { ReportTemplate, SubmittedReport } from '@/app/data/mockData';

// Re-export FormSummary for external use
export type { FormSummary };

export interface VoiceChatState {
  sessionId: string | null;
  isSessionActive: boolean;
  hasPermission: boolean;
  isConnecting: boolean;
  transcript: string;
  aiResponse: string;
  error: string | null;
  formProgress: Record<string, any>;
}

export interface VoiceChatActions {
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
}

export interface VoiceChatOptions {
  template?: ReportTemplate;
  templateInstructions?: string;
  onSessionReady?: (sessionId: string) => void;
  onFormCompleted?: (summary: FormSummary) => void;
}

export function useVoiceChat(options?: VoiceChatOptions): VoiceChatState & VoiceChatActions {
  const { template, templateInstructions, onSessionReady, onFormCompleted } = options || {};
  
  // Jotai atoms
  const [sessionId, setSessionId] = useAtom(sessionIdAtom);
  const [isSessionActive, setIsSessionActive] = useAtom(isSessionActiveAtom);
  const [isConnecting, setIsConnecting] = useAtom(isConnectingAtom);
  const [error, setError] = useAtom(errorAtom);
  const [transcript, setTranscript] = useAtom(transcriptAtom);
  const [aiResponse, setAiResponse] = useAtom(aiResponseAtom);
  const [hasPermission, setHasPermission] = useAtom(hasPermissionAtom);
  const [formData] = useAtom(formDataAtom);
  const [formProgress, setFormProgress] = useAtom(formProgressAtom);
  const setActiveTemplate = useSetAtom(activeTemplateAtom);
  const addReport = useSetAtom(addReportAtom);
  
  // Refs
  const hookInstanceId = useRef(Math.random().toString(36).substr(2, 9));
  
  console.log('🏗️ useVoiceChatWithJotai hook created. Instance:', hookInstanceId.current);

  // Generate form summary
  const generateFormSummary = (formData: Record<string, any>): FormSummary => {
    const timestamp = Date.now();

    const plainText = Object.entries(formData)
      .filter(([_, value]) => value && String(value).trim() !== '')
      .map(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `${label}: ${value}`;
      })
      .join('\n');

    const json = {
      timestamp: timestamp,
      completed_at: new Date(timestamp).toISOString(),
      data: formData,
    };

    return { plainText, json, timestamp };
  };

  // Create SubmittedReport from form summary
  const createSubmittedReport = (summary: FormSummary): SubmittedReport => {
    const now = new Date();
    const reportId = Date.now(); // Simple ID generation
    
    return {
      id: reportId,
      title: template?.title || 'Voice Report',
      templateType: template?.title || 'Custom Report',
      date: now.toLocaleDateString(),
      status: 'Completed',
      summary: summary.plainText.substring(0, 150) + (summary.plainText.length > 150 ? '...' : ''),
      plainText: summary.plainText,
      json: summary.json,
      isNew: true
    };
  };

  // Handle function calls from OpenAI
  const handleFunctionCall = async (message: any) => {
    const { name, arguments: args, call_id } = message;
    
    console.log('🎯 Handling function call:', name, args);
    
    if (name === 'exit_conversation') {
      console.log('🚫 Exit conversation function called');
      endSession();
    } else if (name === 'form_fields_updated') { 
      console.log('📋 Form fields updated function called with:', args);
      const parsedArgs = JSON.parse(args);
      
      // Update form progress with the extracted data
      if (parsedArgs.extracted_data) {
        setFormProgress(parsedArgs.extracted_data);
        console.log('📋 Updated form progress:', parsedArgs.extracted_data);
      }
    } else if (name === 'complete_form_submission') {
      try {
        const parsedArgs = JSON.parse(args);
        console.log('📋 Form completion function called with:', parsedArgs);
        
        const currentFormData = {
          ...formData,
          ...parsedArgs.extracted_data
        };
        
        const transcription = parsedArgs.transcription_compact || '';
        const summary = generateFormSummary(currentFormData);
        
        if (transcription) {
          summary.json.transcription = transcription;
          summary.plainText += `${transcription}`;
        }
        
        console.log('📋 Generated form summary:', summary);
        
        // Create and save the report using Jotai
        const submittedReport = createSubmittedReport(summary);
        addReport(submittedReport);
        
        // Send success response
        WebRTCService.getInstance().sendFunctionResponse(call_id, {
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
        if (onFormCompleted) {
          onFormCompleted(summary);
        }
        
        // End session after delay
        setTimeout(() => {
          endSession();
        }, 3000);
        
      } catch (error) {
        console.error('💥 Error handling function call:', error);
        
        WebRTCService.getInstance().sendFunctionResponse(call_id, {
          status: 'error',
          message: 'Failed to complete form submission'
        });
      }
    }
  };

  // Handle realtime messages from OpenAI
  const handleRealtimeMessage = (message: any, messageSessionId?: string) => {
    console.log('📨 Received message:', message.type, 'from session:', messageSessionId);
    
    switch (message.type) {
      case 'session.created':
        console.log('✅ Session created successfully');
        break;
        
      case 'session.updated':
        console.log('✅ Session configuration updated');
        break;
        
      case 'input_audio_buffer.speech_started':
        console.log('🎤 User started speaking');
        setTranscript('Speaking...');
        break;
        
      case 'input_audio_buffer.speech_stopped':
        console.log('🎤 User stopped speaking');
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        console.log('💬 User transcript:', message.transcript);
        setTranscript(message.transcript || '');
        break;
        
      case 'response.audio_transcript.delta':
        setAiResponse(prev => prev + (message.delta || ''));
        break;
        
      case 'response.audio_transcript.done':
        console.log('💬 AI response complete:', message.transcript);
        setAiResponse(message.transcript || '');
        break;

      case 'response.function_call_arguments.done':
        console.log('🔧 Function call completed:', message);
        handleFunctionCall(message);
        break;
        
      case 'error':
        console.error('💥 OpenAI error:', message.error);
        setError(`OpenAI error: ${message.error.message || message.error}`);
        break;
        
      default:
        console.log('📝 Unhandled message type:', message.type);
    }
  };

  // WebRTC service callbacks
  const webrtcCallbacks: WebRTCServiceCallbacks = {
    onRealtimeMessage: handleRealtimeMessage,
    onTrack: (event) => {
      console.log('🎧 Received remote audio track (handled by service)');
      // Audio is now handled entirely by the service
    },
    onDataChannelOpen: () => {
      console.log('📡 Data channel opened - session ready');
      if (onSessionReady && sessionId) {
        onSessionReady(sessionId);
      }
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    }
  };

  // Start session
  const startSession = async () => {
    console.log('🚀 Starting session...');
    
    // Sync local state with service state first
    if (WebRTCService.getInstance().isSessionActive()) {
      console.log('📋 Service already has active session, syncing state');
      setSessionId(WebRTCService.getInstance().getCurrentSessionId());
      setIsSessionActive(true);
      setIsConnecting(false);
      // Set active template for existing session
      if (template) {
        setActiveTemplate(template);
      }
      return;
    }

    if (WebRTCService.getInstance().isSessionConnecting()) {
      console.log('⏳ Service is already connecting, waiting...');
      setIsConnecting(true);
      return;
    }

    setIsConnecting(true);
    setError(null);
    setTranscript('');
    setAiResponse('');
    setFormProgress({});

    try {
      const newSessionId = await WebRTCService.getInstance().startSession(
        webrtcCallbacks,
        template,
        templateInstructions
      );
      
      setSessionId(newSessionId);
      setIsSessionActive(true);
      setHasPermission(true);
      
      // Set the active template
      if (template) {
        setActiveTemplate(template);
      }
      
      console.log('🎉 Session started successfully!');
      
    } catch (error) {
      console.error('💥 Failed to start session:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
      setIsSessionActive(false);
      setSessionId(null);
      setFormProgress({});
      setActiveTemplate(null);
    } finally {
      setIsConnecting(false);
    }
  };

  // End session
  const endSession = async () => {
    console.log('🔒 Ending session...');
    
    setIsSessionActive(false);
    setIsConnecting(false);

    try {
      await WebRTCService.getInstance().cleanup();
      
      // Reset state
      setSessionId(null);
      setTranscript('');
      setAiResponse('');
      setError(null);
      setFormProgress({});
      setActiveTemplate(null);
      
      console.log('✅ Session ended successfully');
      
    } catch (error) {
      console.error('💥 Error during session cleanup:', error);
    }
  };

  return {
    // State
    sessionId,
    isSessionActive,
    hasPermission,
    isConnecting,
    transcript,
    aiResponse,
    error,
    formProgress,
    
    // Actions
    startSession,
    endSession
  };
} 
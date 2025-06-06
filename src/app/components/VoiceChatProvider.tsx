'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  selectedTemplateAtom,
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
  voiceChatModeAtom,
  templateCreationProgressAtom,
  createdTemplateAtom,
  FormSummary
} from '@/app/state/voiceChatState';
import { addReportAtom } from '@/app/state/reportsState';
import { addTemplateAtom, convertCreatedTemplateToReportTemplate } from '@/app/state/templatesState';
import { userNameAtom, voiceModeAtom } from '@/app/state/settingsState';
import { WebRTCService, WebRTCServiceCallbacks } from '@/app/services/webrtcService';
import { ReportTemplate, SubmittedReport } from '@/app/data/mockData';

interface VoiceChatProviderProps {
  children: React.ReactNode;
  onSessionReady?: (sessionId: string) => void;
  onFormCompleted?: (summary: FormSummary) => void;
}

export default function VoiceChatProvider({ children, onSessionReady, onFormCompleted }: VoiceChatProviderProps) {
  // Jotai atoms
  const [selectedTemplate, setSelectedTemplate] = useAtom(selectedTemplateAtom);
  const [sessionId, setSessionId] = useAtom(sessionIdAtom);
  const [isSessionActive, setIsSessionActive] = useAtom(isSessionActiveAtom);
  const [isConnecting, setIsConnecting] = useAtom(isConnectingAtom);
  const setError = useSetAtom(errorAtom);
  const setTranscript = useSetAtom(transcriptAtom);
  const setAiResponse = useSetAtom(aiResponseAtom);
  const setHasPermission = useSetAtom(hasPermissionAtom);
  const [formData] = useAtom(formDataAtom);
  const setFormProgress = useSetAtom(formProgressAtom);
  const setActiveTemplate = useSetAtom(activeTemplateAtom);
  const addReport = useSetAtom(addReportAtom);
  const addTemplate = useSetAtom(addTemplateAtom);
  const [userName] = useAtom(userNameAtom);
  const [voiceMode] = useAtom(voiceModeAtom);
  const [voiceChatMode] = useAtom(voiceChatModeAtom);
  const setTemplateCreationProgress = useSetAtom(templateCreationProgressAtom);
  const setCreatedTemplate = useSetAtom(createdTemplateAtom);
  
  // Refs
  const providerInstanceId = useRef(Math.random().toString(36).substr(2, 9));
  const previousVoiceMode = useRef(voiceMode);
  
  console.log('🏗️ VoiceChatProvider created. Instance:', providerInstanceId.current);

  // Handle voice mode changes during active session
  useEffect(() => {
    if (isSessionActive && previousVoiceMode.current !== voiceMode) {
      console.log('🎙️ Voice mode changed during session:', previousVoiceMode.current, '->', voiceMode);
      WebRTCService.getInstance().sendVoiceModeUpdate(voiceMode);
      previousVoiceMode.current = voiceMode;
    } else {
      previousVoiceMode.current = voiceMode;
    }
  }, [voiceMode, isSessionActive]);

  // Generate form summary
  const generateFormSummary = (formData: Record<string, any>): FormSummary => {
    const timestamp = Date.now();

    const plainText = "";

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

  // Handle function calls from OpenAI
  const handleFunctionCall = async (message: any) => {
    const { name, arguments: args, call_id } = message;
    
    console.log('🎯 Handling function call:', name, args);
    
    if (name === 'exit_conversation') {
      console.log('🚫 Exit conversation function called');
      endSession();
    } else if (name === 'exit_template_creation') {
      console.log('🚫 Exit template creation function called');
      endSession();
    } else if (name === 'template_progress_updated') {
      console.log('🎨 Template progress updated function called with:', args);
      const parsedArgs = JSON.parse(args);
      
      // Update template creation progress
      if (parsedArgs.template_data) {
        setTemplateCreationProgress(parsedArgs.template_data);
        console.log('🎨 Updated template creation progress:', parsedArgs.template_data);
      }
      
      // Send success response
      WebRTCService.getInstance().sendFunctionResponse(call_id, {
        status: 'success',
        message: 'Template progress updated successfully'
      });
    } else if (name === 'complete_template_creation') {
      try {
        const parsedArgs = JSON.parse(args);
        console.log('🎨 Template creation completion function called with:', parsedArgs);
        
        // Save the completed template
        if (parsedArgs.template_data) {
          setCreatedTemplate(parsedArgs.template_data);
          
          // Convert and save to persistent templates state
          const convertedTemplate = convertCreatedTemplateToReportTemplate(parsedArgs.template_data);
          const savedTemplate = addTemplate(convertedTemplate);
          
          console.log('🎨 Template creation completed and saved:', {
            original: parsedArgs.template_data,
            converted: convertedTemplate,
            saved: savedTemplate
          });
        }
        
        // Send success response
        WebRTCService.getInstance().sendFunctionResponse(call_id, {
          status: 'success',
          message: 'Template created successfully!'
        });
        
        // Notify parent component if needed
        if (onFormCompleted) {
          // Create a summary for template creation
          const templateSummary = {
            plainText: `Template "${parsedArgs.template_data?.title || 'New Template'}" created successfully`,
            json: parsedArgs.template_data || {},
            timestamp: Date.now()
          };
          onFormCompleted(templateSummary);
        }
        
        // End session after delay
        setTimeout(() => {
          endSession();
        }, 3000);
        
      } catch (error) {
        console.error('💥 Error handling template creation completion:', error);
        
        WebRTCService.getInstance().sendFunctionResponse(call_id, {
          status: 'error',
          message: 'Failed to complete template creation'
        });
      }
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
    onTrack: () => {
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
  const startSession = useCallback(async () => {
    if (!selectedTemplate) {
      console.log('⚠️ No template selected, cannot start session');
      return;
    }

    console.log('🚀 Starting session for template:', selectedTemplate.title);
    
    // Sync local state with service state first
    if (WebRTCService.getInstance().isSessionActive()) {
      console.log('📋 Service already has active session, syncing state');
      setSessionId(WebRTCService.getInstance().getCurrentSessionId());
      setIsSessionActive(true);
      setIsConnecting(false);
      setActiveTemplate(selectedTemplate);
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
      const templateInstructions = selectedTemplate.title + "\n\n" + selectedTemplate.definition + "\n\nForm fields:\n" + JSON.stringify(selectedTemplate.openai_properties);

      const newSessionId = await WebRTCService.getInstance().startSession(
        webrtcCallbacks,
        selectedTemplate,
        templateInstructions,
        userName,
        voiceMode,
        voiceChatMode
      );
      
      setSessionId(newSessionId);
      setIsSessionActive(true);
      setHasPermission(true);
      setActiveTemplate(selectedTemplate);
      
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
  }, [selectedTemplate, setSessionId, setIsSessionActive, setIsConnecting, setActiveTemplate, setError, setTranscript, setAiResponse, setFormProgress, setHasPermission, userName, voiceMode, voiceChatMode]);

  // End session
  const endSession = useCallback(async () => {
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
      setSelectedTemplate(null); // Clear selected template
      
      console.log('✅ Session ended successfully');
      
    } catch (error) {
      console.error('💥 Error during session cleanup:', error);
    }
  }, [setIsSessionActive, setIsConnecting, setSessionId, setTranscript, setAiResponse, setError, setFormProgress, setActiveTemplate, setSelectedTemplate]);

  // Auto-start session when template is selected
  useEffect(() => {
    console.log('🔍 VoiceChatProvider effect triggered:');
    console.log('🔍   selectedTemplate:', selectedTemplate?.title || 'none');
    console.log('🔍   isSessionActive:', isSessionActive);
    console.log('🔍   isConnecting:', isConnecting);
    console.log('🔍   voiceChatMode:', voiceChatMode);
    
    if (selectedTemplate && !isSessionActive && !isConnecting) {
      console.log('🎯 Auto-starting session for selected template:', selectedTemplate.title);
      startSession();
    } else if (!selectedTemplate && isSessionActive) {
      console.log('🛑 Template cleared, ending session');
      endSession();
    } else {
      console.log('🔍 Conditions not met for auto-start/end');
    }
  }, [selectedTemplate, isSessionActive, isConnecting, startSession, endSession, voiceChatMode]);

  // Cleanup on unmount
  useEffect(() => {
    const instanceId = providerInstanceId.current; // Copy to avoid ref warning
    return () => {
      console.log('🗑️ VoiceChatProvider cleanup. Instance:', instanceId);
      setSelectedTemplate(null); // This will trigger endSession via the effect above
    };
  }, [setSelectedTemplate]); // Added missing dependency

  return <>{children}</>;
} 
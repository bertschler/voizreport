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
import { addTemplateAtom } from '@/app/state/templatesState';
import { userNameAtom, voiceModeAtom } from '@/app/state/settingsState';
import { WebRTCService, WebRTCServiceCallbacks } from '@/app/services/webrtcService';
import { handleFunctionCall, FunctionHandlerContext, FunctionCallMessage } from '@/app/services/functionHandlers';

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
  const [voiceChatMode, setVoiceChatMode] = useAtom(voiceChatModeAtom);
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
      
      const modeText = voiceMode === 'freeform' 
        ? 'I switched to freeform mode - I prefer to do most of the talking.'
        : 'I switched to guided mode - please help me fill out the form step by step.';
      
      WebRTCService.getInstance().sendConversationMessage(modeText);
      previousVoiceMode.current = voiceMode;
    } else {
      previousVoiceMode.current = voiceMode;
    }
  }, [voiceMode, isSessionActive]);



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
        handleFunctionCallWrapper(message);
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
      setVoiceChatMode('report'); // Reset voice chat mode to default (reports)
      
      console.log('✅ Session ended successfully');
      
    } catch (error) {
      console.error('💥 Error during session cleanup:', error);
    }
  }, [setIsSessionActive, setIsConnecting, setSessionId, setTranscript, setAiResponse, setError, setFormProgress, setActiveTemplate, setSelectedTemplate, setVoiceChatMode]);

  // Handle function calls from OpenAI using the extracted handler service
  const handleFunctionCallWrapper = useCallback(async (message: any) => {
    const functionMessage: FunctionCallMessage = {
      name: message.name,
      arguments: message.arguments,
      call_id: message.call_id
    };
    
    const context: FunctionHandlerContext = {
      setTemplateCreationProgress,
      setCreatedTemplate,
      setFormProgress,
      formData,
      selectedTemplate,
      onFormCompleted,
      endSession,
      addReport,
      addTemplate
    };
    
    await handleFunctionCall(functionMessage, context);
  }, [formData, selectedTemplate, onFormCompleted, addReport, addTemplate, setTemplateCreationProgress, setCreatedTemplate, setFormProgress, endSession]);

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
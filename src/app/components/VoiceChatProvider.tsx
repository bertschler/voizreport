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
  hasPermissionAtom,
  formDataAtom,
  formProgressAtom,
  nextFieldToUpdateAtom,
  activeTemplateAtom,
  voiceChatModeAtom,
  templateCreationProgressAtom,
  createdTemplateAtom,
  isCreatingTemplateAtom,
  selectedVoiceAtom,
  selectedModelAtom,
  photoAttachmentsAtom,
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
  // Helper function to add timestamps to logs
  const ts = () => new Date().toISOString().substring(11, 23);
  
  // Jotai atoms
  const [selectedTemplate, setSelectedTemplate] = useAtom(selectedTemplateAtom);
  const [sessionId, setSessionId] = useAtom(sessionIdAtom);
  const [isSessionActive, setIsSessionActive] = useAtom(isSessionActiveAtom);
  const [isConnecting, setIsConnecting] = useAtom(isConnectingAtom);
  const setError = useSetAtom(errorAtom);
  const setHasPermission = useSetAtom(hasPermissionAtom);
  const [formData] = useAtom(formDataAtom);
  const setFormProgress = useSetAtom(formProgressAtom);
  const setNextFieldToUpdate = useSetAtom(nextFieldToUpdateAtom);
  const setActiveTemplate = useSetAtom(activeTemplateAtom);
  const addReport = useSetAtom(addReportAtom);
  const addTemplate = useSetAtom(addTemplateAtom);
  const [userName] = useAtom(userNameAtom);
  const [voiceMode] = useAtom(voiceModeAtom);
  const [voiceChatMode, setVoiceChatMode] = useAtom(voiceChatModeAtom);
  const setTemplateCreationProgress = useSetAtom(templateCreationProgressAtom);
  const setCreatedTemplate = useSetAtom(createdTemplateAtom);
  const setIsCreatingTemplate = useSetAtom(isCreatingTemplateAtom);
  const [selectedVoice] = useAtom(selectedVoiceAtom);
  const [selectedModel] = useAtom(selectedModelAtom);
  const setPhotoAttachments = useSetAtom(photoAttachmentsAtom);
  
  // Refs
  const providerInstanceId = useRef(Math.random().toString(36).substr(2, 9));
  const previousVoiceMode = useRef(voiceMode);
  const sessionStartInProgress = useRef(false);
  
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
    switch (message.type) {
      case 'session.created':
        console.log('✅ Session created successfully');
        break;
        
      case 'session.updated':
        console.log('✅ Session configuration updated');
        break;
        
      case 'input_audio_buffer.speech_started':
        console.log('🎤 User started speaking');
        break;
        
      case 'input_audio_buffer.speech_stopped':
        console.log('🎤 User stopped speaking');
        break;

      case 'output_audio_buffer.stopped':
        console.log('🎤 Audio buffer stopped');
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        console.log('💬 User transcript:', message.transcript);
        break;

      case 'response.audio_transcript.done':
        console.log('💬 AI response complete:', message.transcript);
        break;

      case 'response.function_call_arguments.done':
        console.log('🔧 Function call completed:', message);
        handleFunctionCallWrapper(message);
        break;
        
      case 'error':
        console.error('💥 OpenAI error:', message.error);
        setError(`OpenAI error: ${message.error.message || message.error}`);
        break;

      case 'output_audio_buffer.started':
      case 'output_audio_buffer.started':
      case 'conversation.item.created':
      case 'response.created':
      case 'response.output_item.added':
      case 'response.content_part.added':
      case 'conversation.item.input_audio_transcription.delta':
      case 'response.audio_transcript.delta':
      case 'response.audio.done':
      case 'response.content_part.done':
      case 'response.output_item.done':
      case 'response.done':
      case 'rate_limits.updated':
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

    // Prevent concurrent starts
    if (sessionStartInProgress.current) {
      console.log('⚠️ Session start already in progress, skipping');
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

    sessionStartInProgress.current = true;
    setIsConnecting(true);
    setError(null);
    setFormProgress({});
    setNextFieldToUpdate(undefined);

    try {
      const templateInstructions = selectedTemplate.title + "\n\n" + selectedTemplate.definition + "\n\nForm fields:\n" + JSON.stringify(selectedTemplate.openai_properties);

      const newSessionId = await WebRTCService.getInstance().startSession(
        webrtcCallbacks,
        selectedTemplate,
        templateInstructions,
        userName,
        voiceMode,
        voiceChatMode,
        selectedVoice,
        selectedModel
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
      setNextFieldToUpdate(undefined);
      setActiveTemplate(null);
    } finally {
      sessionStartInProgress.current = false;
      setIsConnecting(false);
    }
  }, [selectedTemplate, setSessionId, setIsSessionActive, setIsConnecting, setActiveTemplate, setError, setFormProgress, setHasPermission, userName, voiceMode, voiceChatMode, selectedVoice, selectedModel]);

  // End session
  const endSession = useCallback(async () => {
    console.log('🔒 Ending session...');
    
    setIsSessionActive(false);
    setIsConnecting(false);

    try {
      await WebRTCService.getInstance().cleanup();
      
      // Reset state
      setSessionId(null);
      setError(null);
      setFormProgress({});
      setNextFieldToUpdate(undefined);
      setActiveTemplate(null);
      setSelectedTemplate(null); // Clear selected template
      setVoiceChatMode('report'); // Reset voice chat mode to default (reports)
      setPhotoAttachments([]); // Clear photo attachments
      
      // Reset template creation states
      setTemplateCreationProgress({});
      setCreatedTemplate(null);
      setIsCreatingTemplate(false);
      
      console.log('✅ Session ended successfully');
      
    } catch (error) {
      console.error('💥 Error during session cleanup:', error);
    }
  }, [setIsSessionActive, setIsConnecting, setSessionId, setError, setFormProgress, setActiveTemplate, setSelectedTemplate, setVoiceChatMode, setPhotoAttachments, setTemplateCreationProgress, setCreatedTemplate, setIsCreatingTemplate]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate, isSessionActive, isConnecting, voiceChatMode]);

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
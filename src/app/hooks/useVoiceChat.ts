import { useAtom } from 'jotai';
import {
  sessionIdAtom,
  isSessionActiveAtom,
  isConnectingAtom,
  errorAtom,
  transcriptAtom,
  hasPermissionAtom,
  formProgressAtom,
  nextFieldToUpdateAtom,
  selectedTemplateAtom,
  voiceChatModeAtom,
  templateCreationProgressAtom,
  isCreatingTemplateAtom,
  createdTemplateAtom,
  selectedModelAtom,
  FormSummary,
  VoiceChatMode,
  TemplateCreationProgress,
  CreatedTemplate,
  ModelOption
} from '@/app/state/voiceChatState';

// Re-export types for external use
export type { FormSummary, VoiceChatMode, TemplateCreationProgress, CreatedTemplate, ModelOption };

export interface VoiceChatState {
  sessionId: string | null;
  isSessionActive: boolean;
  hasPermission: boolean;
  isConnecting: boolean;
  transcript: string;
  error: string | null;
  formProgress: Record<string, any>;
  nextFieldToUpdate: string | undefined;
  voiceChatMode: VoiceChatMode;
  templateCreationProgress: TemplateCreationProgress;
  isCreatingTemplate: boolean;
  createdTemplate: CreatedTemplate | null;
  selectedModel: ModelOption;
}

export interface VoiceChatActions {
  setVoiceChatMode: (mode: VoiceChatMode) => void;
  startTemplateCreation: () => void;
  clearCreatedTemplate: () => void;
}

export function useVoiceChat(): VoiceChatState & VoiceChatActions {
  // Jotai atoms - just read state, provider handles updates
  const [sessionId] = useAtom(sessionIdAtom);
  const [isSessionActive] = useAtom(isSessionActiveAtom);
  const [isConnecting] = useAtom(isConnectingAtom);
  const [error] = useAtom(errorAtom);
  const [transcript] = useAtom(transcriptAtom);
  const [hasPermission] = useAtom(hasPermissionAtom);
  const [formProgress] = useAtom(formProgressAtom);
  const [nextFieldToUpdate] = useAtom(nextFieldToUpdateAtom);
  const [selectedTemplate, setSelectedTemplate] = useAtom(selectedTemplateAtom);
  const [voiceChatMode, setVoiceChatMode] = useAtom(voiceChatModeAtom);
  const [templateCreationProgress, setTemplateCreationProgress] = useAtom(templateCreationProgressAtom);
  const [isCreatingTemplate, setIsCreatingTemplate] = useAtom(isCreatingTemplateAtom);
  const [createdTemplate, setCreatedTemplate] = useAtom(createdTemplateAtom);
  const [selectedModel] = useAtom(selectedModelAtom);


  // Start template creation mode
  const startTemplateCreation = () => {
    console.log('🎯 Starting template creation mode');
    console.log('🎯 Current voiceChatMode:', voiceChatMode);
    console.log('🎯 Current selectedTemplate:', selectedTemplate?.title || 'none');
    
    setVoiceChatMode('template-creation');
    setIsCreatingTemplate(true);
    const templateCreationTemplate = { 
      // Special template indicator for template creation mode
      id: 'template-creation',
      title: 'Template Creation',
      description: 'Create a new report template',
      definition: 'Template creation session',
      icon: '🎨',
      openai_properties: {},
      required_fields: []
    };
    
    console.log('🎯 Setting selectedTemplate to:', templateCreationTemplate);
    setSelectedTemplate(templateCreationTemplate);
    
    console.log('🎯 Template creation mode setup complete');
  };

  // Clear created template
  const clearCreatedTemplate = () => {
    setCreatedTemplate(null);
  };

  return {
    // State
    sessionId,
    isSessionActive,
    hasPermission,
    isConnecting,
    transcript,
    error,
    formProgress,
    nextFieldToUpdate,
    voiceChatMode,
    templateCreationProgress,
    isCreatingTemplate,
    createdTemplate,
    selectedModel,
    
    // Actions
    setVoiceChatMode,
    startTemplateCreation,
    clearCreatedTemplate
  };
} 
import { ReportTemplate } from '@/app/data/mockData';
import { VoiceChatMode, VoiceOption, ModelOption } from '@/app/state/voiceChatState';
import { getReportInstructionsSystemPrompt } from '@/config/instructions/report-instructions';
import { getReportTools } from '@/config/instructions/report-tools';
import { getTemplateInstructionsSystemPrompt } from '@/config/instructions/template-instructions';
import { getTemplateTools } from '@/config/instructions/template-tools';

export interface WebRTCSessionData {
  sessionId: string;
  ephemeralToken: string; // Short-lived token (2 hours) for WebRTC bootstrap only
}

export interface WebRTCServiceCallbacks {
  onRealtimeMessage: (message: any, sessionId?: string) => void;
  onTrack: (event: RTCTrackEvent) => void;
  onDataChannelOpen: () => void;
  onError: (error: string) => void;
}

// Singleton WebRTC Service to prevent multiple instances
// Uses OpenAI's recommended approach:
// 1. Create ephemeral token with minimal config (no custom instructions)
// 2. Use session.update via WebRTC data channel for dynamic configuration
// 3. Ephemeral tokens expire in ~2 hours and are used only for connection bootstrap
class WebRTCServiceClass {
  private static instance: WebRTCServiceClass | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private sessionId: string | null = null;
  private isConnecting: boolean = false;
  private callbacks: WebRTCServiceCallbacks | null = null;
  private sessionPromise: Promise<string> | null = null;
  
  // Audio element - will be initialized lazily
  private audioElement: HTMLAudioElement | null = null;

  private constructor() {
    console.log('🏗️ WebRTC Service singleton initialized');
    // Don't initialize audio element in constructor - wait for browser context
  }

  static getInstance(): WebRTCServiceClass {
    if (!WebRTCServiceClass.instance) {
      WebRTCServiceClass.instance = new WebRTCServiceClass();
    }
    return WebRTCServiceClass.instance;
  }

  private initializeAudioElement(): void {
    // Only initialize if we're in a browser environment and haven't already initialized
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn('🎧 Cannot initialize audio element: not in browser environment');
      return;
    }
    
    if (this.audioElement) {
      console.log('🎧 Audio element already initialized');
      return;
    }

    console.log('🎧 Initializing audio element in service');
    this.audioElement = document.createElement('audio');
    this.audioElement.autoplay = true;
    // playsInline is not a standard property, use setAttribute instead
    this.audioElement.setAttribute('playsinline', 'true');
    
    // Add to DOM but keep hidden
    this.audioElement.style.display = 'none';
    document.body.appendChild(this.audioElement);
    
    // Add event listeners for debugging
    this.audioElement.addEventListener('loadstart', () => console.log('🎧 Audio loadstart'));
    this.audioElement.addEventListener('canplay', () => console.log('🎧 Audio canplay'));
    this.audioElement.addEventListener('play', () => console.log('🎧 Audio play'));
    this.audioElement.addEventListener('pause', () => console.log('🎧 Audio pause'));
    this.audioElement.addEventListener('error', (e) => console.error('🎧 Audio error:', e));
  }

  async requestMicrophonePermission(): Promise<boolean> {
    // Ensure we're in browser environment
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      console.error('🎤 Navigator.mediaDevices not available');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('🎤 Microphone permission denied:', error);
      return false;
    }
  }

  async createSession(selectedModel?: ModelOption): Promise<WebRTCSessionData> {
    console.log('🔗 Creating OpenAI WebRTC session...');
    
    const modelParam = selectedModel ? `?model=${encodeURIComponent(selectedModel)}` : '';
    const response = await fetch(`/api/voice-ai-openai${modelParam}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create WebRTC session');
    }

    const data = await response.json();
    console.log('✅ WebRTC session created:', data);
    
    return {
      sessionId: data.sessionId,
      ephemeralToken: data.ephemeralToken
    };
  }

  async startSession(
    callbacks: WebRTCServiceCallbacks,
    template?: ReportTemplate,
    templateInstructions?: string,
    userName?: string,
    voiceMode?: string,
    voiceChatMode?: VoiceChatMode,
    selectedVoice?: VoiceOption,
    selectedModel?: ModelOption
  ): Promise<string> {
    // If already connecting, return the existing promise
    if (this.sessionPromise) {
      console.log('📞 Session already in progress, returning existing promise');
      return this.sessionPromise;
    }

    // If already connected, return existing session
    if (this.sessionId && !this.isConnecting) {
      console.log('✅ Session already active:', this.sessionId);
      return this.sessionId;
    }

    // Create new session promise
    this.sessionPromise = this._performSessionStart(callbacks, template, templateInstructions, userName, voiceMode, voiceChatMode, selectedVoice, selectedModel);
    
    try {
      const result = await this.sessionPromise;
      return result;
    } finally {
      // Clear the promise once it's resolved/rejected
      this.sessionPromise = null;
    }
  }

  private async _performSessionStart(
    callbacks: WebRTCServiceCallbacks,
    template?: ReportTemplate,
    templateInstructions?: string,
    userName?: string,
    voiceMode?: string,
    voiceChatMode?: VoiceChatMode,
    selectedVoice?: VoiceOption,
    selectedModel?: ModelOption
  ): Promise<string> {
    this.isConnecting = true;

    try {
      // Clean up any existing session first
      if (this.sessionId) {
        console.log('🔄 Cleaning up existing session before starting new one');
        await this.cleanup();
      }

      // Request microphone permission
      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error('Microphone permission required');
      }

      // Create session
      const sessionData = await this.createSession(selectedModel);
      
      // Setup connection
      await this.setupConnection(sessionData, callbacks, template, templateInstructions, userName, voiceMode, voiceChatMode, selectedVoice, selectedModel);
      
      return this.sessionId || '';
    } finally {
      this.isConnecting = false;
    }
  }

  async setupConnection(
    sessionData: WebRTCSessionData, 
    callbacks: WebRTCServiceCallbacks,
    template?: ReportTemplate,
    templateInstructions?: string,
    userName?: string,
    voiceMode?: string,
    voiceChatMode?: VoiceChatMode,
    selectedVoice?: VoiceOption,
    selectedModel?: ModelOption
  ): Promise<void> {
    this.callbacks = callbacks;
    this.sessionId = sessionData.sessionId;

    console.log('🎯 Setting up WebRTC connection for session:', sessionData.sessionId);

    // Initialize audio element now that we're in a browser context
    this.initializeAudioElement();

    // Create peer connection
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.peerConnection = pc;

    // Handle incoming audio
    pc.ontrack = (event) => {
      console.log('🎧 Received remote audio track');
      
      // Ensure audio element is available before using it
      if (!this.audioElement) {
        console.warn('🎧 Audio element not available, reinitializing...');
        this.initializeAudioElement();
      }
      
      // Set audio source directly in service - no React involvement
      if (this.audioElement && event.streams[0]) {
        this.audioElement.srcObject = event.streams[0];
        console.log('🎧 Audio stream set on service-managed element');
      }
      
      // Still notify React for UI updates if needed
      if (this.callbacks?.onTrack) {
        this.callbacks.onTrack(event);
      }
    };

    // Create data channel for messaging
    const dataChannel = pc.createDataChannel('oai-events');
    this.dataChannel = dataChannel;

    dataChannel.onopen = () => {
      console.log('📡 Data channel opened');
      this.sendSessionConfiguration(template, templateInstructions, userName, voiceMode, voiceChatMode, selectedVoice);
      callbacks.onDataChannelOpen();
    };

    dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        callbacks.onRealtimeMessage(message, this.sessionId || undefined);
      } catch (error) {
        console.error('💥 Error parsing data channel message:', error);
      }
    };

    dataChannel.onerror = (error) => {
      console.error('💥 Data channel error:', error);
      callbacks.onError('Data channel connection failed');
    };

    // Get user media
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 24000
      } 
    });
    
    this.localStream = stream;
    
    // Add audio track to peer connection
    stream.getAudioTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Create and set local description
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Send offer to OpenAI's WebRTC endpoint
    console.log('📤 Sending WebRTC offer to OpenAI...');
    const modelToUse = selectedModel || 'gpt-4o-realtime-preview-2025-06-03';
    const webrtcResponse = await fetch(`https://api.openai.com/v1/realtime?model=${modelToUse}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionData.ephemeralToken}`,
        'Content-Type': 'application/sdp'
      },
      body: offer.sdp
    });

    console.log('📡 WebRTC handshake response status:', webrtcResponse.status);
    
    if (!webrtcResponse.ok) {
      const errorText = await webrtcResponse.text();
      console.error('💥 WebRTC handshake failed:', {
        status: webrtcResponse.status,
        statusText: webrtcResponse.statusText,
        error: errorText
      });
      throw new Error(`WebRTC handshake failed: ${webrtcResponse.status} - ${errorText || webrtcResponse.statusText}`);
    }

    const answerSdp = await webrtcResponse.text();
    const answer = new RTCSessionDescription({
      type: 'answer',
      sdp: answerSdp
    });

    // Check if peer connection is still valid before setting remote description
    if (pc.signalingState === 'closed') {
      throw new Error('Peer connection was closed before setup could complete');
    }

    await pc.setRemoteDescription(answer);
    
    // Wait for connection to establish
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Connection timeout. State: ${pc.connectionState}`));
      }, 10000);

      pc.onconnectionstatechange = () => {
        console.log('🔗 Connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          clearTimeout(timeout);
          resolve();
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          clearTimeout(timeout);
          reject(new Error(`WebRTC connection ${pc.connectionState}`));
        }
      };
    });

    console.log('✅ WebRTC connection established successfully!');
  }

  private sendSessionConfiguration(template?: ReportTemplate, templateInstructions?: string, userName?: string, voiceMode?: string, voiceChatMode?: VoiceChatMode, selectedVoice?: VoiceOption): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('💥 Data channel not available for session configuration');
      return;
    }

    // Dynamic session configuration via session.update
    // This approach allows us to customize instructions, tools, and voice settings
    // after the WebRTC connection is established, without recreating the session
    const instructions = this.getInstructions(templateInstructions, voiceMode, voiceChatMode, userName);
    const isTemplateCreation = voiceChatMode === 'template';
    
    const tools = isTemplateCreation 
      ? getTemplateTools()
      : getReportTools(template);
    
    // Send session.update to configure the assistant's behavior dynamically
    const sessionUpdate = {
      type: 'session.update',
      session: {
        instructions, // Custom instructions based on context
        voice: selectedVoice || 'alloy', // Selected voice option
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: { type: 'server_vad' }, // Server-side voice activity detection
        modalities: ['text', 'audio'], // Enable both text and audio
        tools // Context-specific function tools
      }
    };
    
    this.dataChannel.send(JSON.stringify(sessionUpdate));
    console.log(`📤 Sent ${isTemplateCreation ? 'template creation' : 'report filling'} session configuration`);
    console.log('🔧 Session configured with custom instructions and tools via session.update');
    
    // Send initial greeting trigger after a short delay to ensure session update is processed
    //setTimeout(() => { this.triggerStartSpeaking(); }, 100);
  }

  private triggerStartSpeaking(): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('💥 Data channel not available for initial greeting');
      return;
    }

    // Trigger AI to start speaking by creating a response
    const responseCreate = {
      type: 'response.create',
      response: {
        modalities: ['text', 'audio']
      }
    };
    
    this.dataChannel.send(JSON.stringify(responseCreate));
    console.log('📤 Sent initial greeting trigger');
  }

  private getInstructions(templateInstructions?: string, voiceMode?: string, voiceChatMode?: VoiceChatMode, userName?: string): string {
    const isTemplateCreation = voiceChatMode === 'template';
    
    if (isTemplateCreation) {
      return getTemplateInstructionsSystemPrompt({ userName });
    } else {
      return getReportInstructionsSystemPrompt({ 
        userName, 
        templateInstructions,
        voiceMode,
      });
    }
  }

  sendFunctionResponse(callId: string, response: any): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('💥 Data channel not available for function response');
      return;
    }

    const functionResponse = {
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify(response)
      }
    };
    
    this.dataChannel.send(JSON.stringify(functionResponse));
    console.log('📤 Sent function response back to OpenAI');
  }

  sendConversationMessage(text: string): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('💥 Data channel not available for conversation message');
      return;
    }

    const conversationMessage = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text
          }
        ]
      }
    };
    
    this.dataChannel.send(JSON.stringify(conversationMessage));
    console.log('📤 Sent conversation message:', text);
  }

  async cleanup(): Promise<void> {
    console.log('🧹 WebRTC Service cleanup starting...');

    try {
      // Stop local media tracks
      if (this.localStream) {
        console.log('🎤 Stopping local media tracks...');
        this.localStream.getTracks().forEach(track => {
          track.stop();
          console.log('🎤 Stopped audio track');
        });
        this.localStream = null;
      }

      // Clean up audio element
      if (this.audioElement) {
        console.log('🎧 Cleaning up audio element...');
        this.audioElement.srcObject = null;
        this.audioElement.pause();
      }

      // Close data channel
      if (this.dataChannel) {
        console.log('📡 Closing data channel...');
        this.dataChannel.close();
        this.dataChannel = null;
      }

      // Close peer connection
      if (this.peerConnection) {
        console.log('🔗 Closing peer connection...');
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Reset state
      this.sessionId = null;
      this.isConnecting = false;
      this.callbacks = null;

      console.log('✅ WebRTC Service cleanup completed');
    } catch (error) {
      console.error('💥 Error during WebRTC service cleanup:', error);
      throw error;
    }
  }

  // Cleanup method for complete service shutdown (call on app unmount)
  destroy(): void {
    console.log('🗑️ Destroying WebRTC service...');
    
    this.cleanup().catch(console.error);
    
    // Remove audio element from DOM
    if (this.audioElement) {
      if (this.audioElement.parentNode) {
        this.audioElement.parentNode.removeChild(this.audioElement);
      }
      this.audioElement = null;
    }
  }

  getConnectionState(): string {
    return this.peerConnection?.connectionState || 'not-connected';
  }

  getDataChannelState(): string {
    return this.dataChannel?.readyState || 'not-available';
  }

  getCurrentSessionId(): string {
    return this.sessionId || '';
  }

  isSessionActive(): boolean {
    return !!this.sessionId;
  }

  isSessionConnecting(): boolean {
    return this.isConnecting;
  }
}

// Export the class and a getter function instead of the instance
export { WebRTCServiceClass };
export const WebRTCService = {
  getInstance: () => WebRTCServiceClass.getInstance()
}; 
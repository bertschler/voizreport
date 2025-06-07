
import { ReportTemplate } from '@/app/data/mockData';
import { VoiceChatMode } from '@/app/state/voiceChatState';
import { VOICE_AI_BASE_INSTRUCTIONS } from '@/config/instructions/base-instructions';
import { TEMPLATE_CREATION_FUNCTION_INSTRUCTIONS, VOICE_MODE_INSTRUCTIONS, REPORT_FILLING_FUNCTION_INSTRUCTIONS } from '@/config/instructions/function-instructions';
import { VOICE_AI_TEMPLATE_INSTRUCTIONS } from '@/config/instructions/template-instructions';
import { getReportFillingTools } from '@/config/instructions/report-filling-tools';
import { TEMPLATE_CREATION_TOOLS } from '@/config/instructions/template-creation-tools';

export interface WebRTCSessionData {
  sessionId: string;
  ephemeralToken: string;
}

export interface WebRTCServiceCallbacks {
  onRealtimeMessage: (message: any, sessionId?: string) => void;
  onTrack: (event: RTCTrackEvent) => void;
  onDataChannelOpen: () => void;
  onError: (error: string) => void;
}

// Global session lock to prevent React Strict Mode race conditions
let globalSessionLock = false;
let globalSessionPromise: Promise<void> | null = null;

// Singleton WebRTC Service to prevent multiple instances
class WebRTCServiceClass {
  private static instance: WebRTCServiceClass | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private sessionId: string | null = null;
  private isConnecting: boolean = false;
  private callbacks: WebRTCServiceCallbacks | null = null;
  
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

  private initializeAudioElement() {
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

  async createSession(): Promise<WebRTCSessionData> {
    console.log('🔗 Creating OpenAI WebRTC session...');
    
    const response = await fetch(`/api/voice-ai-openai`, {
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
    voiceChatMode?: VoiceChatMode
  ): Promise<string> {
    // Global lock to prevent multiple simultaneous session starts
    if (globalSessionLock) {
      console.log('🔒 Session start blocked by global lock, waiting...');
      if (globalSessionPromise) {
        await globalSessionPromise;
      }
      // Return existing session if available
      if (this.sessionId) {
        return this.sessionId;
      }
    }

    if (this.isConnecting || this.sessionId) {
      console.log('⚠️ Session already active/connecting:', this.sessionId);
      return this.sessionId || '';
    }

    // Set global lock
    globalSessionLock = true;
    this.isConnecting = true;

    try {
      globalSessionPromise = this._performSessionStart(callbacks, template, templateInstructions, userName, voiceMode, voiceChatMode);
      await globalSessionPromise;
      return this.sessionId || '';
    } finally {
      globalSessionLock = false;
      globalSessionPromise = null;
      this.isConnecting = false;
    }
  }

  private async _performSessionStart(
    callbacks: WebRTCServiceCallbacks,
    template?: ReportTemplate,
    templateInstructions?: string,
    userName?: string,
    voiceMode?: string,
    voiceChatMode?: VoiceChatMode
  ): Promise<void> {
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
    const sessionData = await this.createSession();
    
    // Setup connection
    await this.setupConnection(sessionData, callbacks, template, templateInstructions, userName, voiceMode, voiceChatMode);
  }

  async setupConnection(
    sessionData: WebRTCSessionData, 
    callbacks: WebRTCServiceCallbacks,
    template?: ReportTemplate,
    templateInstructions?: string,
    userName?: string,
    voiceMode?: string,
    voiceChatMode?: VoiceChatMode
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
      this.sendSessionConfiguration(template, templateInstructions, userName, voiceMode, voiceChatMode);
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
    const webrtcResponse = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', {
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

  private sendSessionConfiguration(template?: ReportTemplate, templateInstructions?: string, userName?: string, voiceMode?: string, voiceChatMode?: VoiceChatMode): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('💥 Data channel not available for session configuration');
      return;
    }

    const instructions = this.getInstructions(templateInstructions, voiceMode, voiceChatMode, userName);
    const isTemplateCreation = voiceChatMode === 'template-creation';
    
    const tools = isTemplateCreation 
      ? TEMPLATE_CREATION_TOOLS
      : getReportFillingTools(template);
    
    const sessionUpdate = {
      type: 'session.update',
      session: {
        instructions,
        voice: 'alloy',
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: { type: 'server_vad' },
        modalities: ['text', 'audio'],
        tools
      }
    };
    
    this.dataChannel.send(JSON.stringify(sessionUpdate));
    console.log(`📤 Sent ${isTemplateCreation ? 'template creation' : 'report filling'} session configuration`);
    
    // Send initial greeting trigger after a short delay to ensure session update is processed
    setTimeout(() => {
      this.triggerInitialGreeting();
    }, 100);
  }

  private triggerInitialGreeting(): void {
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
    const isTemplateCreation = voiceChatMode === 'template-creation';
    
    // Add user name context if available
    const userNameContext = userName ? `\n\nThe user's name is ${userName}.` : '';
    
    if (isTemplateCreation) {
      // Use template creation instructions
      const baseInstructions = `${VOICE_AI_TEMPLATE_INSTRUCTIONS}${userNameContext}\n\nToday is ${new Date().toLocaleDateString()}.`;
      
      return baseInstructions + TEMPLATE_CREATION_FUNCTION_INSTRUCTIONS;
    } else {
      // Use regular report filling instructions
      const baseInstructions = templateInstructions 
        ? `${VOICE_AI_BASE_INSTRUCTIONS}${userNameContext}\n\nDetailed information about this specific report and its requirements:\n\n${templateInstructions}\n\nToday is ${new Date().toLocaleDateString()}.`
        : `${VOICE_AI_BASE_INSTRUCTIONS}${userNameContext}`;
      
      // Add voice mode specific instructions
      const voiceModeInstructions = voiceMode === 'freeform' 
        ? VOICE_MODE_INSTRUCTIONS.FREEFORM
        : VOICE_MODE_INSTRUCTIONS.GUIDED;
      
      return baseInstructions + voiceModeInstructions + REPORT_FILLING_FUNCTION_INSTRUCTIONS;
    }
  }

  sendVoiceModeUpdate(voiceMode: string): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('💥 Data channel not available for voice mode update');
      return;
    }

    const modeText = voiceMode === 'freeform' 
      ? 'I switched to freeform mode - I prefer to do most of the talking.'
      : 'I switched to guided mode - please help me fill out the form step by step.';

    const voiceModeUpdate = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: modeText
          }
        ]
      }
    };
    
    this.dataChannel.send(JSON.stringify(voiceModeUpdate));
    console.log('📤 Sent voice mode update:', voiceMode);
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
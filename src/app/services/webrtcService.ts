import { VOICE_AI_INSTRUCTIONS } from '@/config/voice-ai-instructions';
import { ReportTemplate } from '@/app/data/mockData';
import { FormSummary } from '@/app/state/voiceChatState';

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
    templateInstructions?: string
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
      globalSessionPromise = this._performSessionStart(callbacks, template, templateInstructions);
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
    templateInstructions?: string
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
    await this.setupConnection(sessionData, callbacks, template, templateInstructions);
  }

  async setupConnection(
    sessionData: WebRTCSessionData, 
    callbacks: WebRTCServiceCallbacks,
    template?: ReportTemplate,
    templateInstructions?: string
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
      this.sendSessionConfiguration(template, templateInstructions);
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

  private sendSessionConfiguration(template?: ReportTemplate, templateInstructions?: string): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('💥 Data channel not available for session configuration');
      return;
    }

    const instructions = this.getInstructions(templateInstructions);
    const extractedDataProperties = template?.openai_properties || {};
    const requiredFields = template?.required_fields || [];
    
    const sessionUpdate = {
      type: 'session.update',
      session: {
        instructions,
        voice: 'alloy',
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: { type: 'server_vad' },
        modalities: ['text', 'audio'],
        tools: [
          {
            type: 'function',
            name: 'form_fields_updated',
            description: 'Call this function when a field in the form is set or updated. Pass all fields with the current values (or empty if not set yet).',
            parameters: {
              type: 'object',
              properties: {
                extracted_data: {
                  type: 'object',
                  description: 'All the form data that has been collected so far during the conversation',
                  properties: extractedDataProperties,
                  required: requiredFields
                }
              },
              required: ['extracted_data']
            }
          },
          {
            type: 'function',
            name: 'complete_form_submission',
            description: 'Call this function when all required form fields have been collected and the form is ready to be submitted. This will generate a comprehensive report summary and end the session.',
            parameters: {
              type: 'object',
              properties: {
                extracted_data: {
                  type: 'object',
                  description: 'All the form data that has been collected during the conversation',
                  properties: extractedDataProperties,
                  required: requiredFields
                },
                transcription_compact: {
                  type: 'string',
                  description: 'A compact transcription of the full conversation that has been collected.',
                },
                completion_reason: {
                  type: 'string',
                  enum: ['all_required_fields_collected', 'sufficient_information_gathered', 'user_indicated_completion', 'user_stopped_conversation'],
                  description: 'Reason why the form is being completed'
                }
              },
              required: ['extracted_data', 'completion_reason', 'transcription_compact']
            }
          },
          {
            type: 'function',
            name: 'exit_conversation',
            description: 'Call this function immediately when the user wants to cancel, stop, exit, quit, abort, or end the conversation at any time. This is only to be used when the user explicitly wants to end the conversation without saving the form.',
            parameters: {
              type: 'object',
              properties: {},
              required: []
            }
          }
        ]
      }
    };
    
    this.dataChannel.send(JSON.stringify(sessionUpdate));
    console.log('📤 Sent comprehensive session configuration');
    
    // Send initial greeting
    this.sendInitialGreeting();
  }

  private sendInitialGreeting(): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      return;
    }

    const savedUserName = localStorage.getItem('voizreport_username');
    const greeting = savedUserName ? `Hello! I am ${savedUserName}.` : 'Hello!';
    
    const initialPrompt = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: greeting
          }
        ]
      }
    };
    
    this.dataChannel.send(JSON.stringify(initialPrompt));
    console.log('📤 Sent initial greeting');
  }

  private getInstructions(templateInstructions?: string): string {
    const baseInstructions = templateInstructions 
      ? `${VOICE_AI_INSTRUCTIONS}\n\nDetailed information about this specific report and its requirements:\n\n${templateInstructions}\n\nToday is ${new Date().toLocaleDateString()}.`
      : VOICE_AI_INSTRUCTIONS;
    
    const functionInstruction = `\n\n
      IMPORTANT FUNCTION CALLING RULES:
      1. When you have collected all the necessary information for the form and the conversation is complete, say something simimar to "Thanks, I have all the information I need. I will now generate the report summary and end the session.", AFTERWARDS call the 'complete_form_submission' function with all the extracted data. This will automatically generate the report summary and end the session. Do not ask the user if they want to submit - simply call the function when you determine the form is complete.
      2. If the user wants to cancel, stop, exit, abort, or end the conversation at any time, call the 'exit_conversation' function. If your already collected partial or full data, ask first if they want to submit the data and if yes call the 'complete_form_submission' function instead.
      3. If a field in the form is set or updated, call the 'form_fields_updated' function passing all fields with the current values (or empty if not set yet).
    `;
    
    return baseInstructions + functionInstruction;
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
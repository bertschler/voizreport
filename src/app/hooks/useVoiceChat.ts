import { useState, useRef, useEffect } from 'react';
import { VOICE_AI_INSTRUCTIONS } from '@/config/voice-ai-instructions';

export interface VoiceChatState {
  sessionId: string | null;
  isSessionActive: boolean;
  hasPermission: boolean;
  isConnecting: boolean;
  transcript: string;
  aiResponse: string;
  error: string | null;
}

export interface VoiceChatActions {
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
}

export interface VoiceChatOptions {
  templateInstructions?: string;
  onSessionReady?: (sessionId: string) => void;
}

export function useVoiceChat(options?: VoiceChatOptions): VoiceChatState & VoiceChatActions {
  const { templateInstructions, onSessionReady } = options || {};
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const isSessionActiveRef = useRef(false);
  const activeSessionIdRef = useRef<string | null>(null);

  // Update refs when state changes
  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
    activeSessionIdRef.current = sessionId;
  }, [isSessionActive, sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endSession();
    };
  }, []);

  // Request microphone permission
  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('🎤 Microphone permission denied:', error);
      setError('Microphone permission is required for conversation');
      return false;
    }
  };

  // Create WebRTC session with OpenAI
  const createWebRTCSession = async (): Promise<string | null> => {
    try {
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
      
      return data.sessionId;
    } catch (error) {
      console.error('💥 Error creating WebRTC session:', error);
      throw error;
    }
  };

  // Handle realtime messages from OpenAI
  const handleRealtimeMessage = (message: any) => {
    console.log('📨 Received message:', message.type, message);
    
    switch (message.type) {
      case 'session.created':
        console.log('✅ Session created successfully');
        break;
        
      case 'input_audio_buffer.speech_started':
        console.log('🎤 User started speaking');
        setTranscript('Speaking...');
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        console.log('💬 User transcript:', message.transcript);
        setTranscript(message.transcript || '');
        break;
        
      case 'response.audio_transcript.delta':
        // AI response text as it's being generated
        setAiResponse(prev => {
          const newText = prev + (message.delta || '');
          return newText;
        });
        break;
        
      case 'response.audio_transcript.done':
        console.log('💬 AI response complete:', message.transcript);
        setAiResponse(message.transcript || '');
        break;
        
      case 'response.done':
        console.log('✅ Response generation complete');
        break;
        
      case 'error':
        console.error('💥 OpenAI error:', message.error);
        setError(`OpenAI error: ${message.error.message || message.error}`);
        break;
        
      default:
        // Log other message types for debugging
        console.log('📝 Unhandled message type:', message.type);
    }
  };

  // Create combined instructions
  const getInstructions = () => {
    if (templateInstructions) {
      return `${VOICE_AI_INSTRUCTIONS}\n\nDetailed information about this specific report and its requirements:\n\n:\n${templateInstructions}`;
    }
    return VOICE_AI_INSTRUCTIONS;
  };

  // Setup WebRTC connection
  const setupWebRTC = async (sessionId: string) => {
    try {
      console.log('🎯 Setting up WebRTC connection for session:', sessionId);

      // Get session info including ephemeral token
      const sessionResponse = await fetch(`/api/voice-ai-openai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          action: 'get_session_info'
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to get session info');
      }

      const sessionData = await sessionResponse.json();
      const ephemeralToken = sessionData.token;

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peerConnectionRef.current = pc;

      // Handle incoming audio
      pc.ontrack = (event) => {
        console.log('🎧 Received remote audio track');
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      // Create data channel for messaging
      const dataChannel = pc.createDataChannel('oai-events');
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        console.log('📡 Data channel opened');
        
        // Send session update with comprehensive configuration
        const sessionUpdate = {
          type: 'session.update',
          session: {
            instructions: getInstructions(),
            voice: 'alloy',
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: { type: 'server_vad' },
            modalities: ['text', 'audio']
          }
        };
        
        dataChannel.send(JSON.stringify(sessionUpdate));
        console.log('📤 Sent comprehensive session configuration');
      };

      dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleRealtimeMessage(message);
        } catch (error) {
          console.error('💥 Error parsing data channel message:', error);
        }
      };

      dataChannel.onerror = (error) => {
        console.error('💥 Data channel error:', error);
        setError('Data channel connection failed');
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
      
      localStreamRef.current = stream;
      
      // Add audio track to peer connection
      stream.getAudioTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to OpenAI's WebRTC endpoint
      const webrtcResponse = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ephemeralToken}`,
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp
      });

      if (!webrtcResponse.ok) {
        throw new Error(`WebRTC handshake failed: ${webrtcResponse.status}`);
      }

      const answerSdp = await webrtcResponse.text();
      const answer = new RTCSessionDescription({
        type: 'answer',
        sdp: answerSdp
      });

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
          } else if (pc.connectionState === 'failed') {
            clearTimeout(timeout);
            reject(new Error('WebRTC connection failed'));
          }
        };
      });

      console.log('✅ WebRTC connection established successfully!');
      
    } catch (error) {
      console.error('💥 WebRTC setup failed:', error);
      throw error;
    }
  };

  // Start conversation
  const startSession = async () => {
    if (isConnecting || isSessionActive) return;
    
    setIsConnecting(true);
    setError(null);
    setTranscript('');
    setAiResponse('');

    try {
      // Request microphone permission first
      const hasPermission = await requestMicPermission();
      if (!hasPermission) {
        throw new Error('Microphone permission required');
      }

      // Create session
      const newSessionId = await createWebRTCSession();
      if (!newSessionId) {
        throw new Error('Failed to create session');
      }

      setSessionId(newSessionId);
      
      // Setup WebRTC
      await setupWebRTC(newSessionId);
      
      setIsSessionActive(true);
      console.log('🎉 Live conversation started successfully!');
      
      if (onSessionReady) {
        onSessionReady(newSessionId);
      }
      
    } catch (error) {
      console.error('💥 Failed to start session:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
      endSession();
    } finally {
      setIsConnecting(false);
    }
  };

  // End conversation
  const endSession = async () => {
    console.log('🔒 Ending conversation...');
    
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Clean up session on server
    if (sessionId) {
      try {
        await fetch(`/api/voice-ai-openai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId,
            action: 'close_session'
          }),
        });
      } catch (error) {
        console.error('💥 Error closing server session:', error);
      }
    }

    setIsSessionActive(false);
    setSessionId(null);
    setTranscript('');
    setAiResponse('');
    setError(null);
    
    console.log('✅ Session ended successfully');
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
    
    // Actions
    startSession,
    endSession,
    remoteAudioRef
  };
} 
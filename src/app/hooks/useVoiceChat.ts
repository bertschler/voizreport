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

export interface FormSummary {
  plainText: string;
  markdown: string;
  json: Record<string, any>;
  timestamp: number;
}

export interface VoiceChatOptions {
  templateInstructions?: string;
  onSessionReady?: (sessionId: string) => void;
  onFormCompleted?: (summary: FormSummary) => void;
}

export function useVoiceChat(options?: VoiceChatOptions): VoiceChatState & VoiceChatActions {
  const { templateInstructions, onSessionReady, onFormCompleted } = options || {};
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
  
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

  // Extract structured data from AI responses
  const extractFormData = (aiResponse: string, transcript: string) => {
    // Simple pattern matching for common field updates (for display purposes)
    const fieldPatterns = [
      { key: 'patient_name', patterns: [/patient(?:\s+is|:\s*)([^,.]+)/i, /name(?:\s+is|:\s*)([^,.]+)/i] },
      { key: 'patient_age', patterns: [/age(?:\s+is|:\s*)(\d+)/i, /(\d+)\s+years?\s+old/i] },
      { key: 'blood_pressure_systolic', patterns: [/systolic(?:\s+is|:\s*)(\d+)/i, /blood\s+pressure.*?(\d{2,3})\s*\/\s*\d{2,3}/i] },
      { key: 'blood_pressure_diastolic', patterns: [/diastolic(?:\s+is|:\s*)(\d+)/i, /blood\s+pressure.*?\d{2,3}\s*\/\s*(\d{2,3})/i] },
      { key: 'heart_rate', patterns: [/heart\s+rate(?:\s+is|:\s*)(\d+)/i, /(\d+)\s+(?:bpm|beats)/i] },
      { key: 'respiratory_rate', patterns: [/respiratory\s+rate(?:\s+is|:\s*)(\d+)/i, /(\d+)\s+breaths/i] },
      { key: 'temperature_f', patterns: [/temperature(?:\s+is|:\s*)(\d+(?:\.\d+)?)/i, /(\d+(?:\.\d+)?)\s*°?f/i] },
      { key: 'observations', patterns: [/observations?:?\s*(.+)/i, /noted?:?\s*(.+)/i] },
      { key: 'patient_complaints', patterns: [/complaints?:?\s*(.+)/i, /patient\s+reported:?\s*(.+)/i] },
      { key: 'pain_level', patterns: [/pain\s+level(?:\s+is|:\s*)(\d+)/i, /(\d+)\s+(?:out\s+of|\/)\s*10/i] },
    ];

    const newFormData = { ...formData };
    const newCompletedFields = new Set(completedFields);

    // Check both AI response and user transcript for field updates
    const textToAnalyze = `${aiResponse} ${transcript}`.toLowerCase();

    fieldPatterns.forEach(({ key, patterns }) => {
      patterns.forEach(pattern => {
        const match = textToAnalyze.match(pattern);
        if (match && match[1]) {
          const value = match[1].trim();
          if (value && value !== newFormData[key]) {
            newFormData[key] = value;
            newCompletedFields.add(key);
            console.log(`🔍 Extracted field ${key}: ${value}`);
          }
        }
      });
    });

    setFormData(newFormData);
    setCompletedFields(newCompletedFields);

    return newFormData;
  };

  // Generate form summary in multiple formats
  const generateFormSummary = (formData: Record<string, any>): FormSummary => {
    const timestamp = Date.now();

    // Generate plain text summary
    const plainText = Object.entries(formData)
      .filter(([_, value]) => value && String(value).trim() !== '')
      .map(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `${label}: ${value}`;
      })
      .join('\n');

    // Generate markdown summary
    const markdown = `# Healthcare Visit Report

Generated: ${new Date(timestamp).toLocaleString()}

## Patient Information
${Object.entries(formData)
  .filter(([_, value]) => value && String(value).trim() !== '')
  .map(([key, value]) => {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `**${label}:** ${value}`;
  })
  .join('\n\n')}

---
*Report completed via Voiz.report voice interface*`;

    // Generate JSON summary
    const json = {
      timestamp: timestamp,
      completed_at: new Date(timestamp).toISOString(),
      data: formData,
      completed_fields: Array.from(completedFields),
      source: 'voiz_voice_ai'
    };

    return {
      plainText,
      markdown,
      json,
      timestamp
    };
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
        const userTranscript = message.transcript || '';
        setTranscript(userTranscript);
        
        // Extract form data from transcript
        extractFormData('', userTranscript);
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
        const fullAiResponse = message.transcript || '';
        setAiResponse(fullAiResponse);
        
        // Extract form data from AI response
        extractFormData(fullAiResponse, transcript);
        break;

      case 'response.function_call_arguments.delta':
        console.log('🔧 Function call arguments delta:', message);
        break;

      case 'response.function_call_arguments.done':
        console.log('🔧 Function call completed:', message);
        handleFunctionCall(message);
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

  // Handle function calls from OpenAI
  const handleFunctionCall = async (message: any) => {
    const { name, arguments: args, call_id } = message;
    
    console.log('🎯 Handling function call:', name, args);
    
    if (name === 'complete_form_submission') {
      try {
        const parsedArgs = JSON.parse(args);
        console.log('📋 Form completion function called with:', parsedArgs);
        
        // Generate comprehensive summary using the function arguments
        const currentFormData = {
          ...formData,
          ...parsedArgs.extracted_data
        };
        
        const summary = generateFormSummary(currentFormData);
        console.log('📋 Generated form summary from function call:', summary);
        
        // Send function response back to OpenAI
        if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
          const functionResponse = {
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: call_id,
              output: JSON.stringify({
                status: 'success',
                message: 'Form completed successfully. Report has been generated and saved.',
                summary: {
                  total_fields: Object.keys(currentFormData).length,
                  completed_fields: Object.keys(currentFormData).filter(key => 
                    currentFormData[key] && String(currentFormData[key]).trim() !== ''
                  ).length
                }
              })
            }
          };
          
          dataChannelRef.current.send(JSON.stringify(functionResponse));
          console.log('📤 Sent function response back to OpenAI');
        }
        
        // Notify parent component
        if (onFormCompleted) {
          onFormCompleted(summary);
        }
        
        // End session after a short delay
        setTimeout(() => {
          endSession();
        }, 3000); // Give time for final AI response
        
      } catch (error) {
        console.error('💥 Error handling function call:', error);
        
        // Send error response back to OpenAI
        if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
          const errorResponse = {
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: call_id,
              output: JSON.stringify({
                status: 'error',
                message: 'Failed to complete form submission'
              })
            }
          };
          
          dataChannelRef.current.send(JSON.stringify(errorResponse));
        }
      }
    }
  };

  // Create combined instructions with function calling
  const getInstructions = () => {
    const baseInstructions = templateInstructions 
      ? `${VOICE_AI_INSTRUCTIONS}\n\nDetailed information about this specific report and its requirements:\n\n${templateInstructions}`
      : VOICE_AI_INSTRUCTIONS;
    
    // Add function calling instruction
    const functionInstruction = `\n\nIMPORTANT: When you have collected all the necessary information for the form and the conversation is complete, call the 'complete_form_submission' function with all the extracted data. This will automatically generate the report summary and end the session. Do not ask the user if they want to submit - simply call the function when you determine the form is complete.`;
    
    return baseInstructions + functionInstruction;
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
        
        // Send session update with comprehensive configuration including function calling
        const sessionUpdate = {
          type: 'session.update',
          session: {
            instructions: getInstructions(),
            voice: 'alloy',
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: { type: 'server_vad' },
            modalities: ['text', 'audio'],
            tools: [
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
                      properties: {
                        patient_name: { type: 'string', description: 'Patient full name' },
                        patient_age: { type: 'number', description: 'Patient age in years' },
                        blood_pressure_systolic: { type: 'number', description: 'Systolic blood pressure' },
                        blood_pressure_diastolic: { type: 'number', description: 'Diastolic blood pressure' },
                        heart_rate: { type: 'number', description: 'Heart rate in BPM' },
                        respiratory_rate: { type: 'number', description: 'Respiratory rate in breaths per minute' },
                        temperature_f: { type: 'number', description: 'Temperature in Fahrenheit' },
                        observations: { type: 'string', description: 'Physical observations and notes' },
                        patient_complaints: { type: 'string', description: 'Patient complaints or symptoms' },
                        pain_level: { type: 'number', description: 'Pain level on 0-10 scale' },
                        medications_administered: { 
                          type: 'array', 
                          description: 'List of medications given',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string', description: 'Medication name' },
                              dose: { type: 'string', description: 'Dosage amount and units' }
                            }
                          }
                        },
                        instructions_given: { type: 'string', description: 'Instructions provided to patient' },
                        next_visit_date: { type: 'string', description: 'Next scheduled visit date' },
                        next_visit_time: { type: 'string', description: 'Next scheduled visit time' },
                        additional_notes: { type: 'string', description: 'Any additional notes' }
                      }
                    },
                    completion_reason: {
                      type: 'string',
                      enum: ['all_required_fields_collected', 'sufficient_information_gathered', 'user_indicated_completion'],
                      description: 'Reason why the form is being completed'
                    }
                  },
                  required: ['extracted_data', 'completion_reason']
                }
              }
            ]
          }
        };
        
        dataChannel.send(JSON.stringify(sessionUpdate));
        console.log('📤 Sent comprehensive session configuration with function calling');
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
import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
} from '@google/genai';
import { NextRequest } from 'next/server';

// Store active sessions
const activeSessions = new Map<string, {
  geminiSession: Session;
  isActive: boolean;
}>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId') || `session_${Date.now()}`;
  
  console.log('🔗 EventSource connection requested for session:', sessionId);

  try {
    // Create Server-Sent Events stream
    const stream = new ReadableStream({
      async start(controller) {
        console.log('🔗 Starting persistent voice session:', sessionId);
        
        // Check API key
        if (!process.env.GEMINI_API_KEY) {
          console.error('💥 GEMINI_API_KEY not found in environment variables');
          const errorMessage = {
            type: 'error',
            error: 'API key not configured',
            sessionId: sessionId,
            timestamp: Date.now()
          };
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
          controller.close();
          return;
        }
        
        // Initialize Gemini Live session
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
        });

        const model = 'models/gemini-2.5-flash-preview-native-audio-dialog';
        console.log('🎯 Using model:', model);

        const config = {
          responseModalities: [Modality.AUDIO],
          mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Zephyr',
              }
            }
          },
          systemInstruction: {
            parts: [{
              text: `You are a conversational Voice AI assistant for Voiz.report, a healthcare reporting platform. This is a live, continuous conversation - respond naturally and allow for interruptions. Keep responses concise and conversational. Help users with medical reporting, patient documentation, and healthcare-related queries.`
            }]
          },
        };

        let controllerClosed = false;
        let geminiSession: Session | null = null;

        const closeController = () => {
          if (!controllerClosed) {
            try {
              controller.close();
              controllerClosed = true;
              console.log('✅ Controller closed successfully');
            } catch (closeError) {
              console.error('💥 Error closing controller:', closeError);
              controllerClosed = true; // Mark as closed even if error occurs
            }
          }
        };

        const cleanupSession = () => {
          if (geminiSession) {
            try {
              geminiSession.close();
              console.log('🔒 Gemini session closed during cleanup');
            } catch (closeError) {
              console.error('💥 Error closing Gemini session during cleanup:', closeError);
            }
            geminiSession = null;
          }
          activeSessions.delete(sessionId);
          closeController();
        };

        try {
          geminiSession = await ai.live.connect({
            model,
            callbacks: {
              onopen: function () {
                console.log('🔓 Gemini session opened for:', sessionId);
                // Send session ready message
                const readyMessage = {
                  type: 'session_ready',
                  sessionId: sessionId,
                  timestamp: Date.now()
                };
                if (!controllerClosed) {
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(readyMessage)}\n\n`));
                }
              },
              onmessage: function (message: LiveServerMessage) {
                console.log('📨 Gemini message received:', message);
                
                if (controllerClosed) return; // Don't process if controller is closed
                
                try {
                  // Forward all messages to client
                  if (message.serverContent?.modelTurn?.parts) {
                    message.serverContent.modelTurn.parts.forEach((part) => {
                      if (part?.text) {
                        const textMessage = {
                          type: 'text_chunk',
                          text: part.text,
                          sessionId: sessionId,
                          timestamp: Date.now()
                        };
                        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(textMessage)}\n\n`));
                      }
                      
                      if (part?.inlineData) {
                        const audioMessage = {
                          type: 'audio_chunk',
                          mimeType: part.inlineData.mimeType,
                          data: part.inlineData.data,
                          sessionId: sessionId,
                          timestamp: Date.now()
                        };
                        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(audioMessage)}\n\n`));
                      }
                    });
                  }
                  
                  // Note: We DON'T close the session on turnComplete for continuous conversation
                  if (message.serverContent?.turnComplete) {
                    const turnCompleteMessage = {
                      type: 'turn_complete',
                      sessionId: sessionId,
                      timestamp: Date.now()
                    };
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(turnCompleteMessage)}\n\n`));
                  }
                } catch (streamError) {
                  console.error('💥 Error processing message:', streamError);
                }
              },
              onerror: function (e: ErrorEvent) {
                console.error('💥 Gemini session error:', e.message);
                
                // Check for specific error types
                let errorType = 'general';
                if (e.message.toLowerCase().includes('quota') || 
                    e.message.toLowerCase().includes('exceeded') || 
                    e.message.toLowerCase().includes('billing') ||
                    e.message.toLowerCase().includes('plan')) {
                  errorType = 'quota_exceeded';
                  console.log('🚫 Quota exceeded detected');
                } else if (e.message.toLowerCase().includes('precondition check failed')) {
                  errorType = 'precondition_failed';
                  console.log('🔄 Precondition check failed - this may be due to API limitations');
                } else if (e.message.toLowerCase().includes('limit')) {
                  errorType = 'quota_exceeded'; // Treat any limit as quota issue
                }
                
                if (!controllerClosed) {
                  const errorMessage = {
                    type: 'error',
                    error: e.message,
                    errorType: errorType,
                    sessionId: sessionId,
                    timestamp: Date.now()
                  };
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
                }
                
                // Clean up session
                cleanupSession();
              },
              onclose: function (e: CloseEvent) {
                console.log('🔒 Gemini session closed:', e.reason);
                
                // Check if it's a quota/billing related closure
                let errorType = null;
                if (e.reason && (e.reason.toLowerCase().includes('quota') || 
                                e.reason.toLowerCase().includes('exceeded') || 
                                e.reason.toLowerCase().includes('billing') ||
                                e.reason.toLowerCase().includes('plan'))) {
                  errorType = 'quota_exceeded';
                  console.log('🚫 Session closed due to quota exceeded');
                  if (!controllerClosed) {
                    const errorMessage = {
                      type: 'error',
                      error: e.reason || 'API quota exceeded',
                      errorType: 'quota_exceeded',
                      sessionId: sessionId,
                      timestamp: Date.now()
                    };
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
                  }
                } else if (e.reason && e.reason.includes('Precondition check failed')) {
                  errorType = 'precondition_failed';
                  console.log('🔄 Session closed due to precondition check failure');
                  if (!controllerClosed) {
                    const errorMessage = {
                      type: 'error',
                      error: 'Precondition check failed',
                      errorType: 'precondition_failed',
                      sessionId: sessionId,
                      timestamp: Date.now()
                    };
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
                  }
                }
                
                cleanupSession();
              },
            },
            config
          });

          // Store the session
          activeSessions.set(sessionId, {
            geminiSession,
            isActive: true
          });

          console.log('✅ Session stored and ready:', sessionId);
          
        } catch (geminiError) {
          console.error('💥 Error connecting to Gemini:', geminiError);
          
          // Check for specific connection errors
          let errorMessage = `Failed to connect to Gemini: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`;
          let errorType = 'connection_failed';
          
          if (geminiError instanceof Error) {
            if (geminiError.message.toLowerCase().includes('quota') || geminiError.message.toLowerCase().includes('limit')) {
              errorType = 'quota_exceeded';
            } else if (geminiError.message.toLowerCase().includes('precondition')) {
              errorType = 'precondition_failed';
            }
          }
          
          if (!controllerClosed) {
            const errorResponse = {
              type: 'error',
              error: errorMessage,
              errorType: errorType,
              sessionId: sessionId,
              timestamp: Date.now()
            };
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(errorResponse)}\n\n`));
          }
          closeController();
        }
      },
      
      cancel() {
        console.log('🔒 Client disconnected, cleaning up session:', sessionId);
        const sessionData = activeSessions.get(sessionId);
        if (sessionData) {
          try {
            sessionData.geminiSession.close();
          } catch (closeError) {
            console.error('💥 Error closing Gemini session:', closeError);
          }
          activeSessions.delete(sessionId);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    console.error('💥 EventSource setup error:', error);
    return new Response(
      `data: ${JSON.stringify({ type: 'error', error: 'Failed to start session' })}\n\n`,
      {
        status: 200, // Use 200 for SSE even with errors
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );
  }
}

// Handle audio input via POST
export async function POST(request: NextRequest) {
  try {
    const { sessionId, audioData, audioMimeType, action } = await request.json();
    console.log('📨 Received action for session:', sessionId, 'action:', action);

    const sessionData = activeSessions.get(sessionId);
    if (!sessionData || !sessionData.isActive) {
      console.error('❌ Session not found or inactive:', sessionId);
      return Response.json({ error: 'Session not found or inactive' }, { status: 404 });
    }

    const { geminiSession } = sessionData;

    if (action === 'send_audio' && audioData) {
      console.log('🎤 Sending audio to Gemini session:', sessionId);
      
      try {
        // Send audio to Gemini
        geminiSession.sendClientContent({
          turns: [{
            parts: [{
              inlineData: {
                mimeType: audioMimeType,
                data: audioData
              }
            }]
          }]
        });

        return Response.json({ success: true, message: 'Audio sent to session' });
      } catch (audioError) {
        console.error('💥 Error sending audio:', audioError);
        return Response.json({ error: 'Failed to send audio' }, { status: 500 });
      }
    }
    
    if (action === 'interrupt') {
      console.log('⚡ Interrupting session:', sessionId);
      // TODO: Implement proper interrupt signal to Gemini when available
      return Response.json({ success: true, message: 'Session interrupted' });
    }

    if (action === 'close_session') {
      console.log('🔒 Closing session:', sessionId);
      try {
        geminiSession.close();
        activeSessions.delete(sessionId);
        return Response.json({ success: true, message: 'Session closed' });
      } catch (closeError) {
        console.error('💥 Error closing session:', closeError);
        return Response.json({ error: 'Error closing session' }, { status: 500 });
      }
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('💥 POST handler error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
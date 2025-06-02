import { NextRequest } from 'next/server';

// Store active sessions with ephemeral tokens
const activeSessions = new Map<string, {
  token: string;
  isActive: boolean;
  created: number;
}>();

// Create ephemeral token for WebRTC session
async function createEphemeralToken(apiKey: string) {
  // Create minimal session - instructions will be set by client via WebRTC
  const sessionConfig = {
    model: 'gpt-4o-realtime-preview-2024-12-17',
    voice: 'alloy',
    modalities: ['text', 'audio'],
    instructions: 'You are a helpful AI assistant.' // Minimal placeholder - will be overridden by client
  };

  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionConfig),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create ephemeral token: ${error}`);
  }

  const data = await response.json();
  return data.client_secret.value;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId') || `webrtc_session_${Date.now()}`;
  
  console.log('🎯 OpenAI WebRTC session requested for:', sessionId);

  try {
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('💥 OPENAI_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          sessionId: sessionId
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create ephemeral token for WebRTC
    console.log('🔑 Creating ephemeral token for WebRTC session');
    const ephemeralToken = await createEphemeralToken(process.env.OPENAI_API_KEY);
    
    // Store the session
    activeSessions.set(sessionId, {
      token: ephemeralToken,
      isActive: true,
      created: Date.now()
    });

    console.log('✅ WebRTC session created successfully:', sessionId);
    
    return new Response(
      JSON.stringify({
        success: true,
        sessionId: sessionId,
        ephemeralToken: ephemeralToken,
        endpoint: 'https://api.openai.com/v1/realtime',
        model: 'gpt-4o-realtime-preview-2024-12-17',
        instructions: 'Use WebRTC for real-time audio conversation'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('💥 Error creating WebRTC session:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create WebRTC session',
        details: error instanceof Error ? error.message : 'Unknown error',
        sessionId: sessionId
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle session management via POST
export async function POST(request: NextRequest) {
  try {
    const { sessionId, action } = await request.json();
    console.log('📨 Received WebRTC action for session:', sessionId, 'action:', action);

    const sessionData = activeSessions.get(sessionId);
    if (!sessionData || !sessionData.isActive) {
      console.error('❌ WebRTC Session not found or inactive:', sessionId);
      return Response.json({ error: 'Session not found or inactive' }, { status: 404 });
    }

    if (action === 'close_session') {
      console.log('🔒 Closing WebRTC session:', sessionId);
      activeSessions.delete(sessionId);
      return Response.json({ success: true, message: 'WebRTC session closed' });
    }

    if (action === 'get_session_info') {
      return Response.json({ 
        success: true, 
        sessionId: sessionId,
        token: sessionData.token,
        isActive: sessionData.isActive,
        created: sessionData.created
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('💥 WebRTC POST handler error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
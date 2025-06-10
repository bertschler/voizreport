import { NextRequest } from 'next/server';

// Create ephemeral token for WebRTC session
async function createEphemeralToken(apiKey: string, model: string = 'gpt-4o-realtime-preview-2025-06-03') {
  // Create minimal session - instructions will be set by client via WebRTC
  const sessionConfig = {
    model: model,
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
  const model = searchParams.get('model') || 'gpt-4o-realtime-preview-2025-06-03';
  
  console.log('🎯 OpenAI WebRTC session requested for:', sessionId, 'with model:', model);

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
    console.log('🔑 Creating ephemeral token for WebRTC session with model:', model);
    const ephemeralToken = await createEphemeralToken(process.env.OPENAI_API_KEY, model);
    
    console.log('✅ WebRTC session created successfully:', sessionId);
    
    return new Response(
      JSON.stringify({
        success: true,
        sessionId: sessionId,
        ephemeralToken: ephemeralToken,
        endpoint: 'https://api.openai.com/v1/realtime',
        model: model,
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

// Handle session info requests via POST (optional - for getting ephemeral token info)
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    console.log('📨 Received WebRTC action:', action);

    if (action === 'get_session_info') {
      // For WebRTC sessions, session info is managed by OpenAI automatically
      // This endpoint is kept for compatibility but not strictly necessary
      return Response.json({ 
        success: true, 
        message: 'WebRTC sessions are managed automatically by OpenAI. Close the peer connection to end the session.'
      });
    }

    // Note: No server-side session closing needed for WebRTC - OpenAI handles cleanup automatically
    // when the WebRTC peer connection is closed
    
    return Response.json({ error: 'Action not supported for WebRTC sessions' }, { status: 400 });

  } catch (error) {
    console.error('💥 WebRTC POST handler error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
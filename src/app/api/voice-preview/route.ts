import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { voice, text } = await request.json();

    if (!voice || !text) {
      return NextResponse.json({ error: 'Voice and text are required' }, { status: 400 });
    }

    // Validate voice option
    const validVoices = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse'];
    if (!validVoices.includes(voice)) {
      return NextResponse.json({ error: 'Invalid voice option' }, { status: 400 });
    }

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse',
      input: text,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Voice preview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate voice preview' },
      { status: 500 }
    );
  }
} 
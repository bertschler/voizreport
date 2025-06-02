import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
} from '@google/genai';
import { writeFile } from 'fs';
import { NextRequest, NextResponse } from 'next/server';

const responseQueue: LiveServerMessage[] = [];
let session: Session | undefined = undefined;

async function handleTurn(): Promise<LiveServerMessage[]> {
  console.log('🎯 Starting handleTurn...');
  const turn: LiveServerMessage[] = [];
  let done = false;
  while (!done) {
    console.log('⏳ Waiting for message...');
    const message = await waitMessage();
    console.log('📨 Received message in turn:', JSON.stringify(message, null, 2));
    turn.push(message);
    if (message.serverContent && message.serverContent.turnComplete) {
      console.log('✅ Turn complete!');
      done = true;
    }
  }
  console.log('🏁 Turn finished, total messages:', turn.length);
  return turn;
}

async function waitMessage(): Promise<LiveServerMessage> {
  let done = false;
  let message: LiveServerMessage | undefined = undefined;
  while (!done) {
    message = responseQueue.shift();
    if (message) {
      console.log('📬 Processing message from queue:', message);
      handleModelTurn(message);
      done = true;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  return message!;
}

const audioParts: string[] = [];
function handleModelTurn(message: LiveServerMessage) {
  console.log('🎵 handleModelTurn called with message:', JSON.stringify(message, null, 2));
  
  if(message.serverContent?.modelTurn?.parts) {
    console.log('📦 Message has parts, count:', message.serverContent.modelTurn.parts.length);
    
    message.serverContent.modelTurn.parts.forEach((part, index) => {
      console.log(`🔍 Processing part ${index + 1}:`, JSON.stringify(part, null, 2));
      
      if(part?.fileData) {
        console.log(`📁 File data found:`, part.fileData);
        console.log(`📁 File URI: ${part?.fileData.fileUri}`);
      }

      if (part?.inlineData) {
        console.log('🎧 Audio inline data found!');
        const fileName = 'audio.wav';
        const inlineData = part?.inlineData;
        
        console.log('🎧 MIME type:', inlineData.mimeType);
        console.log('🎧 Data length:', inlineData?.data?.length || 0);
        console.log('🎧 Data preview (first 100 chars):', inlineData?.data?.substring(0, 100) || 'No data');

        audioParts.push(inlineData?.data ?? '');
        console.log('🎧 Total audio parts collected:', audioParts.length);

        const buffer = convertToWav(audioParts, inlineData.mimeType ?? '');
        console.log('🎧 WAV buffer created, size:', buffer.length);
        
        saveBinaryFile(fileName, buffer);
      }

      if(part?.text) {
        console.log('💬 Text content found!');
        console.log('💬 Text:', part?.text);
        console.log('💬 Text length:', part?.text?.length || 0);
      }
    });
  } else {
    console.log('❌ No parts found in message');
  }
}

function saveBinaryFile(fileName: string, content: Buffer) {
  writeFile(fileName, content, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing file ${fileName}:`, err);
      return;
    }
    console.log(`Appending stream content to file ${fileName}.`);
  });
}

interface WavConversionOptions {
  numChannels : number,
  sampleRate: number,
  bitsPerSample: number
}

function convertToWav(rawData: string[], mimeType: string) {
  const options = parseMimeType(mimeType);
  const dataLength = rawData.reduce((a, b) => a + b.length, 0);
  const wavHeader = createWavHeader(dataLength, options);
  const buffer = Buffer.concat(rawData.map(data => Buffer.from(data, 'base64')));

  return Buffer.concat([wavHeader, buffer]);
}

function parseMimeType(mimeType : string) {
  const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
  const [_, format] = fileType.split('/');

  const options : Partial<WavConversionOptions> = {
    numChannels: 1,
    bitsPerSample: 16,
  };

  if (format && format.startsWith('L')) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  for (const param of params) {
    const [key, value] = param.split('=').map(s => s.trim());
    if (key === 'rate') {
      options.sampleRate = parseInt(value, 10);
    }
  }

  return options as WavConversionOptions;
}

function createWavHeader(dataLength: number, options: WavConversionOptions) {
  const {
    numChannels,
    sampleRate,
    bitsPerSample,
  } = options;

  // http://soundfile.sapp.org/doc/WaveFormat

  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);                      // ChunkID
  buffer.writeUInt32LE(36 + dataLength, 4);     // ChunkSize
  buffer.write('WAVE', 8);                      // Format
  buffer.write('fmt ', 12);                     // Subchunk1ID
  buffer.writeUInt32LE(16, 16);                 // Subchunk1Size (PCM)
  buffer.writeUInt16LE(1, 20);                  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);        // NumChannels
  buffer.writeUInt32LE(sampleRate, 24);         // SampleRate
  buffer.writeUInt32LE(byteRate, 28);           // ByteRate
  buffer.writeUInt16LE(blockAlign, 32);         // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34);      // BitsPerSample
  buffer.write('data', 36);                     // Subchunk2ID
  buffer.writeUInt32LE(dataLength, 40);         // Subchunk2Size

  return buffer;
}

export async function POST(request: NextRequest) {
  console.log('🔥 API Route called - /api/voice-ai');
  
  try {
    console.log('📥 Parsing request body...');
    const { input, audioData, audioMimeType } = await request.json();
    console.log('📝 Received input:', input);
    console.log('🎤 Audio data length:', audioData?.length || 0);
    console.log('🎤 Audio MIME type:', audioMimeType);
    
    if (!input && !audioData) {
      console.log('❌ No input or audio provided');
      return NextResponse.json({ error: 'Input or audio data is required' }, { status: 400 });
    }

    console.log('🔑 Checking API key...');
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 API key exists:', !!apiKey);
    console.log('🔑 API key length:', apiKey?.length || 0);

    // Create a ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        let streamClosed = false;
        
        const closeStream = () => {
          if (!streamClosed) {
            streamClosed = true;
            controller.close();
            console.log('🔒 Stream closed');
          }
        };
        
        try {
          console.log('🤖 Initializing GoogleGenAI...');
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
          });

          const model = 'models/gemini-2.5-flash-preview-native-audio-dialog'
          console.log('🎯 Using model:', model);

          const config = {
            responseModalities: [
                Modality.AUDIO,
            ],
            mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Zephyr',
                }
              }
            },
            contextWindowCompression: {
                triggerTokens: '25600',
                slidingWindow: { targetTokens: '12800' },
            },
            systemInstruction: {
              parts: [{
                text: `## Voiz.report AI System Prompt

You are a conversational Voice AI assistant for Voiz.report, designed to streamline voice-based data collection by interacting naturally, clearly, and helpfully with field workers and other users. Your goal is to ensure a frictionless, precise, and efficient experience for the user, maintaining a human-like yet structured interaction style. Follow these detailed guidelines:

### 1. Persona & Interaction Style

* You are a helpful, friendly, and efficient assistant, guiding users step-by-step through filling out reports using natural conversation.
* Always maintain a conversational and encouraging tone (e.g., "Great job!", "Got it, let's move on").
* Balance friendliness with professional clarity, ensuring interactions are short, crisp, and unambiguous.
* If the user seems hesitant, reassure them (e.g., "Take your time, I'm here to help.").

### 2. Task & Workflow Outline

* Your primary task is to help users fill out voice-based reports by eliciting necessary information clearly and quickly.
* Follow these stages:

  1. **Greeting and Introduction:** Welcome the user briefly (e.g., "Hello! Ready to record your report?").
  2. **Field Collection:** Prompt users clearly for each required or optional field.
  3. **Dynamic Field Handling:** Allow users to naturally provide multiple answers in a single utterance (speak-ahead) or correct previously provided information (e.g., user says "actually, I worked 6 hours, not 8").
  4. **Confirmation:** Briefly confirm entries, especially after corrections (e.g., "Okay, updated to 6 hours.").
  5. **Completion:** Clearly confirm when the form is completed and summarize quickly ("That's all we need. Sending your report now!").

### 3. Structuring Responses

* Clearly and briefly structure your prompts using short, clear sentences:

  * Example: "How many hours did you work today?"
  * Correction handling: "You mentioned 8 hours earlier; updating to 6 hours, correct?"
* Use subtle, conversational confirmations for corrected entries to reinforce accuracy without slowing the interaction.

### 4. Dynamic Prompt Generation

* Adapt your prompts dynamically based on context:

  * If previous input seems uncertain, prompt explicitly: "Just to confirm, could you repeat the job ID?"
  * If multiple fields are addressed in one utterance, quickly acknowledge and move forward clearly: "Got it, job HT-1234, 6 hours, no issues."

### 5. Error Handling & Escape Hatch

* If user input is unclear or incomplete, prompt succinctly for clarification: "Could you please repeat the number of hours?"
* Explicitly state if you lack sufficient information: "I'm not sure I caught that. Could you clarify?"

### 6. Debugging & Thinking Traces (for internal use)

* Internally log and trace your reasoning clearly for troubleshooting. For example:

  * Reasoning: "User said 'Actually 6 hours'. Detected correction keyword 'Actually', updated 'hours\\_worked' from 8 to 6."
* These traces are internal-only to help the development team improve interaction flows and accuracy.

### 7. Few-Shot Learning Examples (illustrative)

* Prompt clearly: "What's the job ID?" User: "HT-1234." Confirm briefly: "Got it, HT-1234."
* Handle correction: User: "Actually, it's HT-1235." You: "Okay, updating to HT-1235."

### 8. Personalization and Distillation

* Maintain a friendly yet neutral persona, adaptable to various types of users (field workers, supervisors, etc.).
* Use concise language patterns to ensure the interaction feels smooth and natural, optimizing both speed and clarity.

By following these guidelines, you'll deliver an exceptional conversational experience, helping Voiz.report users effortlessly provide accurate, structured reports through voice.



{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "id": "a72d3f5c-4c72-4ec4-9a2f-8b317e84f9a1",
  "name": "Healthcare Worker Home-Visit Report",
  "version": "1.0.0",
  "locale": "en-US",
  "description": "Template used by mobile healthcare workers to record patient vitals, medications, observations, and next steps during a home visit.",
  "fields": [
    {
      "key": "patient_name",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "Please say the patient's full name.",
      "voice:reprompt": "I didn't catch the name. What is the patient's full name?",
      "voice:confirm": "Okay, patient is {{value}}."
    },
    {
      "key": "patient_age",
      "type": "number",
      "required": true,
      "min": 0,
      "max": 120,
      "voice:prompt": "What is the patient's age in years?",
      "voice:reprompt": "Sorry, please repeat the patient's age.",
      "voice:confirm": "Understood, age {{value}}."
    },
    {
      "key": "blood_pressure_systolic",
      "type": "number",
      "required": true,
      "min": 50,
      "max": 250,
      "voice:prompt": "What was the systolic blood pressure?",
      "voice:reprompt": "Please say the systolic value again.",
      "voice:confirm": "Got it, systolic is {{value}}."
    },
    {
      "key": "blood_pressure_diastolic",
      "type": "number",
      "required": true,
      "min": 30,
      "max": 150,
      "voice:prompt": "What was the diastolic blood pressure?",
      "voice:reprompt": "I didn't catch the diastolic number. Please repeat.",
      "voice:confirm": "Okay, diastolic is {{value}}."
    },
    {
      "key": "heart_rate",
      "type": "number",
      "required": true,
      "min": 30,
      "max": 200,
      "voice:prompt": "What is the patient's heart rate, in beats per minute?",
      "voice:reprompt": "Please repeat the heart rate.",
      "voice:confirm": "Thank you, heart rate {{value}} bpm."
    },
    {
      "key": "respiratory_rate",
      "type": "number",
      "required": true,
      "min": 5,
      "max": 40,
      "voice:prompt": "What is the respiratory rate in breaths per minute?",
      "voice:reprompt": "I need the respiratory rate again, please.",
      "voice:confirm": "Recorded, respiratory rate {{value}}."
    },
    {
      "key": "temperature_f",
      "type": "number",
      "required": true,
      "min": 90,
      "max": 110,
      "voice:prompt": "What is the patient's temperature in Fahrenheit?",
      "voice:reprompt": "Sorry, repeat the temperature reading, please.",
      "voice:confirm": "Got it, temperature {{value}}°F."
    },
    {
      "key": "medications_administered",
      "type": "array",
      "required": false,
      "voice:prompt": "List any medications you administered, one at a time. Say 'no more' when finished.",
      "voice:reprompt": "Please tell me the medication name and dose, or say 'no more' if none.",
      "voice:confirm": "Added {{last_item}} to medications.",
      "items": {
        "type": "object",
        "properties": {
          "med_name": {
            "type": "string",
            "voice:prompt": "Medication name?",
            "voice:reprompt": "Repeat the medication name, please.",
            "voice:confirm": "Medication is {{value}}."
          },
          "med_dose": {
            "type": "string",
            "voice:prompt": "Dose amount and units?",
            "voice:reprompt": "Please repeat dose amount and units.",
            "voice:confirm": "Dose recorded as {{value}}."
          }
        },
        "required": ["med_name", "med_dose"]
      }
    },
    {
      "key": "observations",
      "type": "string",
      "required": true,
      "freeform": true,
      "voice:prompt": "Describe any physical observations (e.g., wound status, swelling).",
      "voice:reprompt": "Please describe your observations again.",
      "voice:confirm": "Noted: {{value}}."
    },
    {
      "key": "patient_complaints",
      "type": "string",
      "required": false,
      "freeform": true,
      "voice:prompt": "What complaints or symptoms did the patient report?",
      "voice:reprompt": "Repeat any patient complaints or symptoms.",
      "voice:confirm": "Understood, patient reported: {{value}}."
    },
    {
      "key": "pain_level",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 10,
      "voice:prompt": "If applicable, what pain level did the patient report on a scale of zero to ten?",
      "voice:reprompt": "Please repeat the pain level zero to ten.",
      "voice:confirm": "Got it, pain level {{value}}."
    },
    {
      "key": "instructions_given",
      "type": "string",
      "required": false,
      "freeform": true,
      "voice:prompt": "What instructions or advice did you give the patient?",
      "voice:reprompt": "Repeat the instructions you provided, please.",
      "voice:confirm": "Confirmed: instructions were {{value}}."
    },
    {
      "key": "next_visit_date",
      "type": "string",
      "format": "date",
      "required": false,
      "voice:prompt": "When is the next scheduled visit? Please say the date.",
      "voice:reprompt": "I didn't catch the date for the next visit. Please repeat.",
      "voice:confirm": "Next visit date set to {{value}}."
    },
    {
      "key": "next_visit_time",
      "type": "string",
      "format": "time",
      "required": false,
      "voice:prompt": "At what time is the next appointment?",
      "voice:reprompt": "Repeat the time for the next visit, please.",
      "voice:confirm": "Next visit time is {{value}}."
    },
    {
      "key": "additional_notes",
      "type": "string",
      "required": false,
      "freeform": true,
      "voice:prompt": "Any additional notes to record?",
      "voice:reprompt": "Please say any other notes you want to add.",
      "voice:confirm": "Got it: {{value}}."
    }
  ],
  "logic": [
    {
      "if": { "field": "patient_complaints", "equals": "" },
      "then": { "skip": ["pain_level"] }
    }
  ]
}
`,
              }]
            },
          };

          console.log('🔗 Connecting to AI live session...');
          const session = await ai.live.connect({
            model,
            callbacks: {
              onopen: function () {
                console.debug('🔓 Session opened');
                // Don't send content immediately - wait for client to send audio
              },
              onmessage: function (message: LiveServerMessage) {
                console.debug('📨 Received message:', message);
                
                // Stream each message part to the client
                if (message.serverContent?.modelTurn?.parts) {
                  message.serverContent.modelTurn.parts.forEach((part, index) => {
                    console.log(`🔍 Processing part ${index + 1}:`, JSON.stringify(part, null, 2));
                    
                    // Create a chunk to send to client
                    const chunk = {
                      type: 'message_part',
                      part: part,
                      timestamp: Date.now()
                    };
                    
                    // Send chunk to client
                    const chunkData = `data: ${JSON.stringify(chunk)}\n\n`;
                    if (!streamClosed) {
                      controller.enqueue(new TextEncoder().encode(chunkData));
                    }
                    
                    if (part?.text) {
                      console.log('💬 Text content found:', part.text);
                    }
                    
                    if (part?.inlineData) {
                      console.log('🎧 Audio inline data found!');
                      console.log('🎧 MIME type:', part.inlineData.mimeType);
                      console.log('🎧 Data length:', part.inlineData?.data?.length || 0);
                      
                      // You could also stream raw audio data if needed
                      const audioChunk = {
                        type: 'audio_chunk',
                        mimeType: part.inlineData.mimeType,
                        data: part.inlineData.data,
                        timestamp: Date.now()
                      };
                      const audioChunkData = `data: ${JSON.stringify(audioChunk)}\n\n`;
                      if (!streamClosed) {
                        controller.enqueue(new TextEncoder().encode(audioChunkData));
                      }
                    }
                  });
                }
                
                // Check if turn is complete
                if (message.serverContent && message.serverContent.turnComplete) {
                  console.log('✅ Turn complete!');
                  const endChunk = {
                    type: 'turn_complete',
                    timestamp: Date.now()
                  };
                  const endChunkData = `data: ${JSON.stringify(endChunk)}\n\n`;
                  if (!streamClosed) {
                    controller.enqueue(new TextEncoder().encode(endChunkData));
                  }
                  
                  // Close the session and stream
                  session.close();
                  closeStream();
                }
              },
              onerror: function (e: ErrorEvent) {
                console.debug('💥 Session error:', e.message);
                if (!streamClosed) {
                  const errorChunk = {
                    type: 'error',
                    error: e.message,
                    timestamp: Date.now()
                  };
                  const errorChunkData = `data: ${JSON.stringify(errorChunk)}\n\n`;
                  controller.enqueue(new TextEncoder().encode(errorChunkData));
                }
                closeStream();
              },
              onclose: function (e: CloseEvent) {
                console.debug('🔒 Session closed:', e.reason);
                closeStream();
              },
            },
            config
          });

          // Send the initial input after session is established
          console.log('📤 Sending client content...');
          
          // Prepare content based on what we have
          const content: any = {
            turns: []
          };
          
          if (audioData && audioMimeType) {
            // Send audio data
            console.log('🎤 Sending audio data to Gemini');
            content.turns.push({
              parts: [{
                inlineData: {
                  mimeType: audioMimeType,
                  data: audioData
                }
              }]
            });
          } else if (input) {
            // Send text input
            console.log('💬 Sending text input to Gemini');
            content.turns.push(input);
          }
          
          session.sendClientContent(content);

        } catch (error) {
          console.error('💥 Stream error:', error);
          if (!streamClosed) {
            const errorChunk = {
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: Date.now()
            };
            const errorChunkData = `data: ${JSON.stringify(errorChunk)}\n\n`;
            controller.enqueue(new TextEncoder().encode(errorChunkData));
          }
          closeStream();
        }
      }
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('💥 API Route error:', error);
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
# Voiz.report - Voice-Powered Reporting

Voice AI system that automatically detects form completion and provides summaries in multiple formats.

## 🎯 New Feature: Form Completion Detection

The system now automatically detects when a voice conversation has completed a form and provides the results in three formats:

### Features

- **Function-Based Detection**: Uses OpenAI Realtime API function calling for reliable completion detection
- **Multi-Format Output**: Plain text, Markdown, and JSON formats
- **Session Management**: Automatically ends sessions when forms are complete
- **Field Extraction**: Intelligent parsing of conversation content into structured data

### How It Works

1. **Start a voice session** using the `LiveVoiceChat` component
2. **Speak naturally** to fill out form fields
3. **Automatic completion** when AI calls the `complete_form_submission` function
4. **Get instant summaries** in three formats with metadata

### Technical Implementation

The system uses OpenAI Realtime API's function calling feature instead of pattern matching:

```javascript
// Function definition sent to OpenAI
{
  name: 'complete_form_submission',
  description: 'Call when all required form fields have been collected',
  parameters: {
    type: 'object',
    properties: {
      extracted_data: { /* all form fields */ },
      completion_reason: { 
        enum: ['all_required_fields_collected', 'sufficient_information_gathered']
      }
    }
  }
}
```

### Usage Example

```tsx
import LiveVoiceChat, { FormSummary } from './components/LiveVoiceChat';

function MyComponent() {
  const handleFormCompletion = (summary: FormSummary) => {
    console.log('Plain text:', summary.plainText);
    console.log('Markdown:', summary.markdown);
    console.log('JSON:', summary.json);
    
    // Send to your backend
    await fetch('/api/reports', {
      method: 'POST',
      body: JSON.stringify(summary.json)
    });
  };

  return (
    <LiveVoiceChat 
      onFormCompleted={handleFormCompletion}
      templateInstructions="Healthcare worker home visit report..."
    />
  );
}
```

### FormSummary Interface

```typescript
interface FormSummary {
  plainText: string;     // Simple key-value pairs
  json: Record<string, any>; // Structured data with metadata
  timestamp: number;     // Completion timestamp
  sessionId: string;     // Session identifier
}
```

## 🚀 Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env.local
# Add your OpenAI API key
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Visit the demo page**: [http://localhost:3000/demo](http://localhost:3000/demo)

## 📋 Testing Form Completion

### Demo Page Features

- **Live voice chat interface** with form completion detection
- **Real-time display** of completed forms in all three formats
- **Download functionality** for each format type
- **Field completion tracking** to see which data was extracted

### Completion Triggers

The system detects completion through:

1. **Function Call**: AI calls `complete_form_submission` when form is ready
2. **Structured Data**: Function provides extracted form data and completion reason
3. **Automatic Response**: System processes function call and generates summaries

This approach is much more reliable than pattern matching completion phrases.

### Output Formats

#### Plain Text
```
Patient Name: John Doe
Patient Age: 65
Blood Pressure Systolic: 120
Blood Pressure Diastolic: 80
...
```

#### Markdown
```markdown
# Healthcare Visit Report

Generated: 1/15/2024, 2:30:00 PM
Session ID: sess_abc123

## Patient Information
**Patient Name:** John Doe
**Patient Age:** 65
**Blood Pressure Systolic:** 120
...
```

#### JSON
```json
{
  "timestamp": 1705334400000,
  "completed_at": "2024-01-15T14:30:00.000Z",
  "data": {
    "patient_name": "John Doe",
    "patient_age": "65",
    ...
  },
  "completed_fields": ["patient_name", "patient_age", ...],
  "source": "voiz_voice_ai"
}
```

## 🔧 API Integration

### Backend Integration

The `onFormCompleted` callback provides everything needed to integrate with your backend:

```typescript
const handleFormCompletion = async (summary: FormSummary) => {
  try {
    // Save to database
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: summary.sessionId,
        timestamp: summary.timestamp,
        data: summary.json.data,
        completedFields: summary.json.completed_fields,
        formats: {
          plainText: summary.plainText,
          json: summary.json
        }
      })
    });
    
    if (response.ok) {
      console.log('Report saved successfully');
    }
  } catch (error) {
    console.error('Failed to save report:', error);
  }
};
```

### Field Extraction

The system automatically extracts common healthcare fields:

- **Patient Information**: Name, age
- **Vital Signs**: Blood pressure, heart rate, respiratory rate, temperature
- **Clinical Data**: Observations, complaints, pain level
- **Care Details**: Medications, instructions, follow-up

## 🎤 Voice Commands

### Natural Conversation
- Speak naturally about patient information and vitals
- The AI will automatically determine when enough information is collected
- No special completion phrases required - the AI uses function calling to end the session

### Correction Commands
- "Actually, the age is 70."
- "Let me correct that..."
- "Sorry, I meant..."

## 📝 Architecture

### Components

- **LiveVoiceChat**: Main voice interface component
- **useVoiceChat**: Hook handling OpenAI Realtime API integration
- **Form Detection**: Pattern matching for field extraction
- **Completion Logic**: Multi-criteria completion detection

### Message Flow

1. **User Speech** → **OpenAI Realtime API**
2. **AI Response** → **Field Extraction**
3. **Completion Check** → **Summary Generation**
4. **Callback Trigger** → **Session End**

## 🔒 Security & Privacy

- **No persistent storage** of voice data
- **HTTPS required** for microphone access
- **Session isolation** prevents data leakage
- **Configurable data retention** policies

## 📚 Additional Resources

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
- [Voice Chat Hook Implementation](./src/app/hooks/useVoiceChat.ts)
- [Demo Page Source](./src/app/demo/page.tsx)

---

Built with Next.js, React, and OpenAI Realtime API

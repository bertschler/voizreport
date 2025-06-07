// Function instruction constants for voice AI function calling

export const REPORT_FILLING_FUNCTION_INSTRUCTIONS = `

IMPORTANT FUNCTION CALLING RULES:
1. When you have collected all the necessary information for the form and the conversation is complete, say something similar to "Thanks, I have all the information I need. I will now generate the report summary and end the session.", AFTERWARDS call the 'complete_form_submission' function with all the extracted data. This will automatically generate the report summary and end the session. Do not ask the user if they want to submit - simply call the function when you determine the form is complete.
2. If the user wants to cancel, stop, exit, abort, or end the conversation at any time, call the 'exit_conversation' function. If you already collected partial or full data (other than the name of the user), ask first if they want to submit the data and if yes call the 'complete_form_submission' function instead.
3. If a field in the form is set or updated, call the 'form_fields_updated' function passing all fields with the current values (or empty if not set yet).
`;

export const TEMPLATE_CREATION_FUNCTION_INSTRUCTIONS = `

IMPORTANT FUNCTION CALLING RULES FOR TEMPLATE CREATION:
1. When template creation progress is made (title, description, fields defined, etc.), call the 'template_progress_updated' function with the current progress.
2. When the template is complete and ready to be finalized, call the 'complete_template_creation' function with the final template definition.
3. If the user wants to cancel template creation, call the 'exit_template_creation' function.
`;

export const VOICE_MODE_INSTRUCTIONS = {
  FREEFORM: `

CURRENT VOICE MODE: FREEFORM - The user prefers to do most of the talking. Let them speak freely and naturally extract information from their responses. Don't be overly conversational - focus on listening and capturing data efficiently.`,
  
  GUIDED: `

CURRENT VOICE MODE: GUIDED - Help the user by guiding them through each field step by step. Ask clear questions to help them fill out the form systematically.`
}; 
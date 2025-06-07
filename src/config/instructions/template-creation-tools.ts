export const TEMPLATE_CREATION_TOOLS = [
  {
    type: 'function',
    name: 'template_progress_updated',
    description: 'Call this function when template creation progress is set or updated (title, description, fields, etc.). Pass all fields with the current values (or empty if not set yet).',
    parameters: {
      type: 'object',
      properties: {
        template_data: {
          type: 'object',
          description: 'Current template creation progress',
          properties: {
            title: { type: 'string', description: 'Template title' },
            description: { type: 'string', description: 'Template description' },
            definition: { type: 'string', description: 'Template definition/instructions' },
            icon: { type: 'string', description: 'Template icon (emoji)' },
            fields: { 
              type: 'array',
              description: 'Template fields being defined',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Field name/key' },
                  type: { type: 'string', description: 'Field data type (string, number, boolean, etc.)' },
                  description: { type: 'string', description: 'Field description for voice prompts' },
                  required: { type: 'boolean', description: 'Whether this field is required' },
                  enum: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'Optional: List of allowed values for multiple choice fields'
                  }
                },
                required: ['name', 'type', 'description', 'required'],
                additionalProperties: false
              }
            },
            current_phase: { 
              type: 'string', 
              enum: ['core-attributes', 'field-definition', 'review'],
              description: 'Current phase of template creation' 
            }
          }
        }
      },
      required: ['template_data']
    }
  },
  {
    type: 'function',
    name: 'complete_template_creation',
    description: 'Call this function when the template creation is complete and ready to be finalized. Pass all fields with the current values (or empty if not set yet).',
    parameters: {
      type: 'object',
      properties: {
        template_data: {
          type: 'object',
          description: 'Current template creation progress with all fields',
          properties: {
            title: { type: 'string', description: 'Template title' },
            description: { type: 'string', description: 'Template description' },
            definition: { type: 'string', description: 'Template definition/instructions' },
            icon: { type: 'string', description: 'Template icon (emoji)' },
            fields: { 
              type: 'array',
              description: 'Template fields being defined',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Field name/key' },
                  type: { type: 'string', description: 'Field data type (string, number, boolean, etc.)' },
                  description: { type: 'string', description: 'Field description for voice prompts' },
                  required: { type: 'boolean', description: 'Whether this field is required' },
                  enum: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'Optional: List of allowed values for multiple choice fields'
                  }
                },
                required: ['name', 'type', 'description', 'required'],
                additionalProperties: false
              }
            }
          }
        }
      },
      required: ['template_data']
    }
  },
  {
    type: 'function',
    name: 'exit_template_creation',
    description: 'Call this function when the user wants to cancel template creation.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
]; 
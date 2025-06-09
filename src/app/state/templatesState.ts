import { atom } from 'jotai';
import { ReportTemplate } from '@/app/data/mockData';
import { seedTemplatesIfNeeded } from '@/app/utils/seedTemplates';
import { atomWithPersistence } from './atomWithPersistence';

const STORAGE_KEY = 'voizreport_templates';

export interface StoredTemplate extends ReportTemplate {
  savedAt: string;
  isCustom: boolean; // Flag to distinguish user-created vs built-in templates
}

// Helper function to create a new stored template
const createStoredTemplate = (template: Omit<ReportTemplate, 'id'>, isCustom: boolean = true): StoredTemplate => ({
  ...template,
  id: Date.now() + Math.floor(Math.random() * 1000), // Generate unique ID
  savedAt: new Date().toISOString(),
  isCustom
});

// Helper function to sort templates (built-in first, then newest custom)
const sortTemplates = (templates: StoredTemplate[]): StoredTemplate[] => {
  return templates.sort((a, b) => {
    if (a.isCustom !== b.isCustom) {
      return a.isCustom ? -1 : 1;
    }
    // Within each category, sort by newest first
    return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
  });
};

// Convert template creation progress to ReportTemplate format
export const convertCreatedTemplateToReportTemplate = (createdTemplate: any): Omit<ReportTemplate, 'id'> => {
  // Convert fields array to openai_properties object
  const openai_properties: Record<string, any> = {};
  const required_fields: string[] = [];

  // Handle both fields array format and direct openai_properties format
  if (createdTemplate.fields && Array.isArray(createdTemplate.fields)) {
    createdTemplate.fields.forEach((field: any) => {
      openai_properties[field.name] = {
        type: field.type,
        description: field.description,
        ...(field.enum && field.enum.length > 0 ? { enum: field.enum } : {})
      };
      
      if (field.required) {
        required_fields.push(field.name);
      }
    });
  } else if (createdTemplate.openai_properties) {
    // If already in openai_properties format, use directly
    Object.assign(openai_properties, createdTemplate.openai_properties);
    if (createdTemplate.required_fields && Array.isArray(createdTemplate.required_fields)) {
      required_fields.push(...createdTemplate.required_fields);
    }
  }

  return {
    title: createdTemplate.title || 'Untitled Template',
    description: createdTemplate.description || 'No description provided',
    definition: createdTemplate.definition || 'No definition provided',
    icon: createdTemplate.icon || '📋',
    openai_properties,
    required_fields: required_fields.length > 0 ? required_fields : undefined
  };
};

// Validation function for stored templates
const validateTemplates = (value: unknown): value is StoredTemplate[] => {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && 
    item !== null && 
    'id' in item && 
    'savedAt' in item &&
    'isCustom' in item
  );
};

// Custom getter that handles seeding built-in templates
const templatesStorageAtom = atomWithPersistence<StoredTemplate[]>(STORAGE_KEY, [], {
  maxItems: 50,
  validate: validateTemplates,
  onStorageError: (error, fallbackValue) => {
    console.log('🔄 Using fallback value and seeding templates due to storage error');
    return seedTemplatesIfNeeded(fallbackValue);
  }
});

// Enhanced atom that handles seeding on first load
const templatesWithSeedingAtom = atom(
  (get) => {
    const templates = get(templatesStorageAtom);
    return seedTemplatesIfNeeded(templates);
  },
  (get, set, newTemplates: StoredTemplate[]) => {
    set(templatesStorageAtom, newTemplates);
  }
);

// Read-only derived atom for sorted templates
export const templatesAtom = atom((get) => {
  const templates = get(templatesWithSeedingAtom);
  return sortTemplates(templates);
});

// Atom for adding a new template
export const addTemplateAtom = atom(
  null,
  (get, set, template: Omit<ReportTemplate, 'id'>) => {
    const existingTemplates = get(templatesWithSeedingAtom);
    const storedTemplate = createStoredTemplate(template, true);
    const updatedTemplates = [storedTemplate, ...existingTemplates];
    set(templatesWithSeedingAtom, updatedTemplates);
    
    console.log('📁 Template saved via Jotai:', storedTemplate);
    return storedTemplate;
  }
);

// Atom for updating a template
export const updateTemplateAtom = atom(
  null,
  (get, set, update: { id: number; updates: Partial<ReportTemplate> }) => {
    const existingTemplates = get(templatesWithSeedingAtom);
    const templateIndex = existingTemplates.findIndex(t => t.id === update.id);
    
    if (templateIndex !== -1) {
      const updatedTemplates = [...existingTemplates];
      updatedTemplates[templateIndex] = {
        ...updatedTemplates[templateIndex],
        ...update.updates
      };
      set(templatesWithSeedingAtom, updatedTemplates);
      
      console.log('📁 Template updated via Jotai:', update.id);
    }
  }
);

// Atom for deleting a template
export const deleteTemplateAtom = atom(
  null,
  (get, set, templateId: number) => {
    const existingTemplates = get(templatesWithSeedingAtom);
    const filteredTemplates = existingTemplates.filter(t => t.id !== templateId);
    set(templatesWithSeedingAtom, filteredTemplates);
    
    console.log('📁 Template deleted via Jotai:', templateId);
  }
);

// Atom for clearing all custom templates (keeps built-in templates)
export const clearCustomTemplatesAtom = atom(
  null,
  (get, set) => {
    const existingTemplates = get(templatesWithSeedingAtom);
    const builtInTemplates = existingTemplates.filter(t => !t.isCustom);
    set(templatesWithSeedingAtom, builtInTemplates);
    console.log('📁 Custom templates cleared via Jotai');
  }
);

// Derived atom for loading state
export const templatesLoadingAtom = atom(false);

// Derived atom for custom template count
export const customTemplatesCountAtom = atom(
  (get) => {
    const templates = get(templatesAtom);
    return templates.filter(template => template.isCustom).length;
  }
); 
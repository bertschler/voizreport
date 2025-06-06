import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { ReportTemplate } from '@/app/data/mockData';
import { seedTemplatesIfNeeded } from '@/app/utils/seedTemplates';

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

// Base atom with localStorage persistence and error handling
const templatesStorageAtom = atomWithStorage<StoredTemplate[]>(STORAGE_KEY, [], {
  getItem: (key: string, initialValue: StoredTemplate[]) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        // First time loading - seed with built-in templates
        const seededTemplates = seedTemplatesIfNeeded([]);
        return seededTemplates;
      }
      const parsed = JSON.parse(item);
      if (!Array.isArray(parsed)) return initialValue;
      
      // Check if we need to seed built-in templates
      const seededTemplates = seedTemplatesIfNeeded(parsed);
      console.log('📂 Loaded templates from localStorage:', seededTemplates.length, 'templates');
      
      // If seeding occurred, save back to localStorage
      if (seededTemplates.length !== parsed.length) {
        try {
          localStorage.setItem(key, JSON.stringify(seededTemplates));
        } catch (saveError) {
          console.error('💥 Error saving seeded templates:', saveError);
        }
      }
      
      return seededTemplates;
    } catch (error) {
      console.error('💥 Error loading templates from localStorage:', error);
      return seedTemplatesIfNeeded(initialValue);
    }
  },
  setItem: (key: string, value: StoredTemplate[]) => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      console.log('📁 Saved templates to localStorage:', value.length, 'templates');
    } catch (error) {
      console.error('💥 Error saving templates to localStorage:', error);
      // Try to recover by keeping only essential data
      try {
        const essentialTemplates = value.slice(0, 100).map(template => ({
          ...template,
          // Remove potentially large fields if needed
          definition: template.definition?.substring(0, 1000) || '',
        }));
        localStorage.setItem(key, JSON.stringify(essentialTemplates));
        console.log('🔄 Recovered by saving essential data only');
      } catch (recoveryError) {
        console.error('💥 Recovery also failed:', recoveryError);
      }
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('💥 Error removing from localStorage:', error);
    }
  }
});

// Read-only derived atom for sorted templates (no setter to prevent accidental overwrites)
export const templatesAtom = atom((get) => {
  const templates = get(templatesStorageAtom);
  return sortTemplates(templates);
});

// Atom for adding a new template
export const addTemplateAtom = atom(
  null,
  (get, set, template: Omit<ReportTemplate, 'id'>) => {
    const existingTemplates = get(templatesStorageAtom);
    const storedTemplate = createStoredTemplate(template, true);
    const updatedTemplates = [storedTemplate, ...existingTemplates];
    // Keep only the most recent 50 templates to avoid localStorage size issues
    const limitedTemplates = updatedTemplates.slice(0, 50);
    set(templatesStorageAtom, limitedTemplates);
    
    console.log('📁 Template saved via Jotai:', storedTemplate);
    return storedTemplate;
  }
);

// Atom for updating a template
export const updateTemplateAtom = atom(
  null,
  (get, set, update: { id: number; updates: Partial<ReportTemplate> }) => {
    const existingTemplates = get(templatesStorageAtom);
    const templateIndex = existingTemplates.findIndex(t => t.id === update.id);
    
    if (templateIndex !== -1) {
      const updatedTemplates = [...existingTemplates];
      updatedTemplates[templateIndex] = {
        ...updatedTemplates[templateIndex],
        ...update.updates
      };
      set(templatesStorageAtom, updatedTemplates);
      
      console.log('📁 Template updated via Jotai:', update.id);
    }
  }
);

// Atom for deleting a template
export const deleteTemplateAtom = atom(
  null,
  (get, set, templateId: number) => {
    const existingTemplates = get(templatesStorageAtom);
    const filteredTemplates = existingTemplates.filter(t => t.id !== templateId);
    set(templatesStorageAtom, filteredTemplates);
    
    console.log('📁 Template deleted via Jotai:', templateId);
  }
);

// Atom for clearing all custom templates (keeps built-in templates)
export const clearCustomTemplatesAtom = atom(
  null,
  (get, set) => {
    const existingTemplates = get(templatesStorageAtom);
    const builtInTemplates = existingTemplates.filter(t => !t.isCustom);
    set(templatesStorageAtom, builtInTemplates);
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
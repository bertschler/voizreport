import { reportTemplates } from '@/config/data/templates';
import { StoredTemplate } from '@/app/state/templatesState';

// Convert built-in templates to StoredTemplate format
export const getBuiltInTemplates = (): StoredTemplate[] => {
  return reportTemplates.map(template => ({
    ...template,
    savedAt: new Date().toISOString(),
    isCustom: false
  }));
};

// Check if templates have been seeded and seed if necessary
export const seedTemplatesIfNeeded = (existingTemplates: StoredTemplate[]): StoredTemplate[] => {
  const hasBuiltInTemplates = existingTemplates.some(t => !t.isCustom);
  
  if (!hasBuiltInTemplates && existingTemplates.length === 0) {
    // First time loading - seed with built-in templates
    console.log('🌱 Seeding built-in templates');
    return getBuiltInTemplates();
  } else if (!hasBuiltInTemplates) {
    // User has custom templates but no built-ins - add built-ins
    console.log('🌱 Adding built-in templates to existing custom templates');
    return [...getBuiltInTemplates(), ...existingTemplates];
  }
  
  // Templates already seeded or exist
  return existingTemplates;
}; 
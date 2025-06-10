import {
  getTemplateProgressUpdatedTool,
  getCompleteTemplateCreationTool,
  getExitTemplateCreationTool
} from '../functions';

export const getTemplateTools = () => [
  getTemplateProgressUpdatedTool(),
  getCompleteTemplateCreationTool(),
  getExitTemplateCreationTool()
]; 
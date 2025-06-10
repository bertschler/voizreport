import {
  getTemplateProgressUpdatedTool,
  getCompleteTemplateCreationTool,
  getExitTemplateCreationTool
} from '../functions';

export const TEMPLATE_CREATION_TOOLS = [
  getTemplateProgressUpdatedTool(),
  getCompleteTemplateCreationTool(),
  getExitTemplateCreationTool()
]; 
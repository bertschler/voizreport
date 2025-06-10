import { ReportTemplate } from '@/app/data/mockData';
import {
  getFormFieldsUpdatedTool,
  getCompleteFormSubmissionTool,
  getExitConversationTool,
  getOpenCameraTool,
  getCapturePhotoTool
} from '../functions';

export const getReportTools = (template?: ReportTemplate) => {
  return [
    getFormFieldsUpdatedTool(template),
    getCompleteFormSubmissionTool(template),
    getExitConversationTool(),
    getOpenCameraTool(),
    getCapturePhotoTool()
  ];
}; 
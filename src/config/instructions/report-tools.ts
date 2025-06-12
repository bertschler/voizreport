import {
  getFormFieldsUpdatedTool,
  getCompleteFormSubmissionTool,
  getExitConversationTool,
  getOpenCameraTool,
  getCapturePhotoTool
} from '../functions';
import { ReportTemplate } from "@/app/types/core";

export const getReportTools = (template?: ReportTemplate) => {
  return [
    getFormFieldsUpdatedTool(template),
    getCompleteFormSubmissionTool(template),
    getExitConversationTool(),
    getOpenCameraTool(),
    getCapturePhotoTool()
  ];
}; 
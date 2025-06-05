import { useAtomValue, useSetAtom } from 'jotai';
import {
  submittedReportsAtom,
  addReportAtom,
  updateReportAtom,
  deleteReportAtom,
  markReportAsReadAtom,
  clearAllReportsAtom,
  unreadReportsCountAtom,
  StoredReport
} from '@/app/state/reportsState';
import { SubmittedReport } from '@/app/data/mockData';

export interface UseReportsReturn {
  reports: StoredReport[];
  unreadCount: number;
  addReport: (report: SubmittedReport) => void;
  updateReport: (id: number, updates: Partial<SubmittedReport>) => void;
  deleteReport: (id: number) => void;
  markAsRead: (id: number) => void;
  clearAll: () => void;
}

export function useReports(): UseReportsReturn {
  const reports = useAtomValue(submittedReportsAtom);
  const unreadCount = useAtomValue(unreadReportsCountAtom);
  const addReport = useSetAtom(addReportAtom);
  const updateReport = useSetAtom(updateReportAtom);
  const deleteReport = useSetAtom(deleteReportAtom);
  const markAsRead = useSetAtom(markReportAsReadAtom);
  const clearAll = useSetAtom(clearAllReportsAtom);

  return {
    reports,
    unreadCount,
    addReport,
    updateReport: (id: number, updates: Partial<SubmittedReport>) => 
      updateReport({ id, updates }),
    deleteReport,
    markAsRead,
    clearAll,
  };
} 
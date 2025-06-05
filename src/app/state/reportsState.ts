import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { SubmittedReport } from '@/app/data/mockData';

const STORAGE_KEY = 'voizreport_submitted_reports';

export interface StoredReport extends SubmittedReport {
  savedAt: string;
}

// Helper function to create a new stored report
const createStoredReport = (report: SubmittedReport): StoredReport => ({
  ...report,
  savedAt: new Date().toISOString()
});

// Helper function to sort reports (newest first)
const sortReports = (reports: StoredReport[]): StoredReport[] => {
  return reports.sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
  });
};

// Base atom with localStorage persistence
const reportsStorageAtom = atomWithStorage<StoredReport[]>(STORAGE_KEY, []);

// Derived atom for sorted reports
export const submittedReportsAtom = atom(
  (get) => {
    const reports = get(reportsStorageAtom);
    return sortReports(reports);
  },
  (get, set, newReports: StoredReport[]) => {
    const sortedReports = sortReports(newReports);
    // Keep only the most recent 100 reports to avoid localStorage size issues
    const limitedReports = sortedReports.slice(0, 100);
    set(reportsStorageAtom, limitedReports);
  }
);

// Atom for adding a new report
export const addReportAtom = atom(
  null,
  (get, set, report: SubmittedReport) => {
    const existingReports = get(submittedReportsAtom);
    const storedReport = createStoredReport(report);
    const updatedReports = [storedReport, ...existingReports];
    set(submittedReportsAtom, updatedReports);
    
    console.log('📁 Report saved via Jotai:', storedReport);
  }
);

// Atom for updating a report
export const updateReportAtom = atom(
  null,
  (get, set, update: { id: number; updates: Partial<SubmittedReport> }) => {
    const existingReports = get(submittedReportsAtom);
    const reportIndex = existingReports.findIndex(r => r.id === update.id);
    
    if (reportIndex !== -1) {
      const updatedReports = [...existingReports];
      updatedReports[reportIndex] = {
        ...updatedReports[reportIndex],
        ...update.updates
      };
      set(submittedReportsAtom, updatedReports);
      
      console.log('📁 Report updated via Jotai:', update.id);
    }
  }
);

// Atom for deleting a report
export const deleteReportAtom = atom(
  null,
  (get, set, reportId: number) => {
    const existingReports = get(submittedReportsAtom);
    const filteredReports = existingReports.filter(r => r.id !== reportId);
    set(submittedReportsAtom, filteredReports);
    
    console.log('📁 Report deleted via Jotai:', reportId);
  }
);

// Atom for marking a report as read
export const markReportAsReadAtom = atom(
  null,
  (get, set, reportId: number) => {
    set(updateReportAtom, { id: reportId, updates: { isNew: false } });
  }
);

// Atom for clearing all reports
export const clearAllReportsAtom = atom(
  null,
  (get, set) => {
    set(submittedReportsAtom, []);
    console.log('📁 All reports cleared via Jotai');
  }
);

// Derived atom for loading state
export const reportsLoadingAtom = atom(false);

// Derived atom for unread report count
export const unreadReportsCountAtom = atom(
  (get) => {
    const reports = get(submittedReportsAtom);
    return reports.filter(report => report.isNew).length;
  }
); 
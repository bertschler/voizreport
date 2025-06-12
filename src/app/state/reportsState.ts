import { atom } from 'jotai';
import { atomWithPersistence } from './atomWithPersistence';
import { StoredReport, SubmittedReport } from "@/app/types/core";

const STORAGE_KEY = 'voizreport_submitted_reports';

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

// Validation function for stored reports
const validateReports = (value: unknown): value is StoredReport[] => {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && 
    item !== null && 
    'id' in item && 
    'savedAt' in item
  );
};

// Base atom with automatic persistence - much simpler!
const reportsStorageAtom = atomWithPersistence<StoredReport[]>(STORAGE_KEY, [], {
  maxItems: 100,
  validate: validateReports,
  onStorageError: (error, fallbackValue) => {
    console.log('🔄 Using fallback value due to storage error');
    return fallbackValue;
  }
});

// Read-only derived atom for sorted reports
export const submittedReportsAtom = atom((get) => {
  const reports = get(reportsStorageAtom);
  return sortReports(reports);
});

// Atom for adding a new report
export const addReportAtom = atom(
  null,
  (get, set, report: SubmittedReport) => {
    const existingReports = get(reportsStorageAtom);
    const storedReport = createStoredReport(report);
    // Generate unique ID to prevent conflicts
    storedReport.id = Date.now() + Math.floor(Math.random() * 1000);
    const updatedReports = [storedReport, ...existingReports];
    set(reportsStorageAtom, updatedReports);
    
    console.log('📁 Report saved via Jotai:', storedReport);
  }
);

// Atom for updating a report
export const updateReportAtom = atom(
  null,
  (get, set, update: { id: number; updates: Partial<SubmittedReport> }) => {
    const existingReports = get(reportsStorageAtom);
    const reportIndex = existingReports.findIndex(r => r.id === update.id);
    
    if (reportIndex !== -1) {
      const updatedReports = [...existingReports];
      updatedReports[reportIndex] = {
        ...updatedReports[reportIndex],
        ...update.updates
      };
      set(reportsStorageAtom, updatedReports);
      
      console.log('📁 Report updated via Jotai:', update.id);
    }
  }
);

// Atom for deleting a report
export const deleteReportAtom = atom(
  null,
  (get, set, reportId: number) => {
    const existingReports = get(reportsStorageAtom);
    const filteredReports = existingReports.filter(r => r.id !== reportId);
    set(reportsStorageAtom, filteredReports);
    
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
    set(reportsStorageAtom, []);
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
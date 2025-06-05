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

// Base atom with localStorage persistence and error handling
const reportsStorageAtom = atomWithStorage<StoredReport[]>(STORAGE_KEY, [], {
  getItem: (key: string, initialValue: StoredReport[]) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return initialValue;
      const parsed = JSON.parse(item);
      console.log('📂 Loaded reports from localStorage:', parsed.length, 'reports');
      return Array.isArray(parsed) ? parsed : initialValue;
    } catch (error) {
      console.error('💥 Error loading reports from localStorage:', error);
      return initialValue;
    }
  },
  setItem: (key: string, value: StoredReport[]) => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      console.log('📁 Saved reports to localStorage:', value.length, 'reports');
    } catch (error) {
      console.error('💥 Error saving reports to localStorage:', error);
      // Try to recover by keeping only essential data
      try {
        const essentialReports = value.slice(0, 50).map(report => ({
          ...report,
          // Remove potentially large fields if needed
          plainText: report.plainText?.substring(0, 1000) || '',
        }));
        localStorage.setItem(key, JSON.stringify(essentialReports));
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

// Read-only derived atom for sorted reports (no setter to prevent accidental overwrites)
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
    // Keep only the most recent 100 reports to avoid localStorage size issues
    const limitedReports = updatedReports.slice(0, 100);
    set(reportsStorageAtom, limitedReports);
    
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
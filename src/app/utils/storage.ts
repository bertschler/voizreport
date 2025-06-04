import { SubmittedReport } from '@/app/data/mockData';

const STORAGE_KEY = 'voizreport_submitted_reports';

export interface StoredReport extends SubmittedReport {
  savedAt: string;
}

// Get all submitted reports from localStorage
export const getStoredReports = (): StoredReport[] => {
  try {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const reports = JSON.parse(stored) as StoredReport[];
    
    // Sort by date (newest first) and then by savedAt timestamp
    return reports.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    });
  } catch (error) {
    console.error('Error reading reports from localStorage:', error);
    return [];
  }
};

// Save a new submitted report to localStorage
export const saveReport = (report: SubmittedReport): void => {
  try {
    if (typeof window === 'undefined') return;
    
    const existingReports = getStoredReports();
    
    const storedReport: StoredReport = {
      ...report,
      savedAt: new Date().toISOString()
    };
    
    // Add to beginning of array (newest first)
    const updatedReports = [storedReport, ...existingReports];
    
    // Keep only the most recent 100 reports to avoid localStorage size issues
    const limitedReports = updatedReports.slice(0, 100);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedReports));
    
    console.log('📁 Report saved to localStorage:', storedReport);
  } catch (error) {
    console.error('Error saving report to localStorage:', error);
  }
};

// Update an existing report
export const updateReport = (reportId: number, updates: Partial<SubmittedReport>): void => {
  try {
    if (typeof window === 'undefined') return;
    
    const existingReports = getStoredReports();
    const reportIndex = existingReports.findIndex(r => r.id === reportId);
    
    if (reportIndex !== -1) {
      existingReports[reportIndex] = {
        ...existingReports[reportIndex],
        ...updates
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingReports));
      console.log('📁 Report updated in localStorage:', reportId);
    }
  } catch (error) {
    console.error('Error updating report in localStorage:', error);
  }
};

// Delete a report
export const deleteReport = (reportId: number): void => {
  try {
    if (typeof window === 'undefined') return;
    
    const existingReports = getStoredReports();
    const filteredReports = existingReports.filter(r => r.id !== reportId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredReports));
    console.log('📁 Report deleted from localStorage:', reportId);
  } catch (error) {
    console.error('Error deleting report from localStorage:', error);
  }
};

// Mark a report as no longer new
export const markReportAsRead = (reportId: number): void => {
  updateReport(reportId, { isNew: false });
};

// Clear all reports (for testing/development)
export const clearAllReports = (): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    console.log('📁 All reports cleared from localStorage');
  } catch (error) {
    console.error('Error clearing reports from localStorage:', error);
  }
}; 
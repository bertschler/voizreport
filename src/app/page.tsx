'use client';

import { useState } from 'react';
import LiveVoiceChat from "./components/LiveVoiceChat";
import MobileHeader from "./components/MobileHeader";
import TabNavigation, { Tab } from "./components/TabNavigation";
import TemplatesList from "./components/TemplatesList";
import SubmittedReports from "./components/SubmittedReports";
import { reportTemplates, submittedReports, ReportTemplate, SubmittedReport } from './data/mockData';

const tabs: Tab[] = [
  { id: 'templates', label: 'Templates' },
  { id: 'reports', label: 'Reports' }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'templates' | 'reports'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);

  const startReport = (template: ReportTemplate) => {
    setSelectedTemplate(template);
  };

  const goBack = () => {
    setSelectedTemplate(null);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'templates' | 'reports');
  };

  const handleCreateTemplate = () => {
    console.log('Create new template');
  };

  const handleViewReportDetails = (report: SubmittedReport) => {
    console.log('View report details:', report);
  };

  // If a template is selected, show the voice chat interface
  if (selectedTemplate) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        padding: '0'
      }}>
        <MobileHeader
          title={selectedTemplate.title}
          subtitle="New Report"
          showBackButton={true}
          onBackClick={goBack}
          sticky={true}
        />

        {/* Voice chat interface */}
        <div style={{ padding: '20px' }}>
          <LiveVoiceChat 
            templateInstructions={selectedTemplate.title + "\n\n" + selectedTemplate.definition + "\n\n" + selectedTemplate.form}
            onSessionReady={(sessionId) => console.log('Voice session ready:', sessionId)} 
          />
        </div>
      </div>
    );
  }

  // Main interface with tabs
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      maxWidth: '430px',
      margin: '0 auto',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)'
    }}>
      <MobileHeader
        title="VoizReport"
        subtitle="Voice-powered reporting"
      />

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {activeTab === 'templates' && (
          <TemplatesList
            templates={reportTemplates}
            onStartReport={startReport}
            onCreateTemplate={handleCreateTemplate}
          />
        )}

        {activeTab === 'reports' && (
          <SubmittedReports
            reports={submittedReports}
            onViewDetails={handleViewReportDetails}
          />
        )}
      </div>
    </div>
  );
}

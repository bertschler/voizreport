'use client';

import React, { useState } from 'react';
import LiveVoiceChat, { FormSummary } from './components/LiveVoiceChat';
import MobileHeader from "./components/MobileHeader";
import TabNavigation, { Tab } from "./components/TabNavigation";
import TemplatesList from "./components/TemplatesList";
import SubmittedReports from "./components/SubmittedReports";
import Settings from "./components/Settings";
import { reportTemplates, submittedReports, ReportTemplate, SubmittedReport } from './data/mockData';

const tabs: Tab[] = [
  { id: 'templates', label: 'Create' },
  { id: 'reports', label: 'Recent Reports' }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'templates' | 'reports'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [completedForms, setCompletedForms] = useState<FormSummary[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'plain' | 'json'>('plain');
  const [showSettings, setShowSettings] = useState<boolean>(false);

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

  const handleEditTemplate = (template: ReportTemplate) => {
    console.log('Edit template:', template);
  };

  const handleViewReportDetails = (report: SubmittedReport) => {
    console.log('View report details:', report);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleSettingsBack = () => {
    setShowSettings(false);
  };

  const handleFormCompletion = (summary: FormSummary) => {
    console.log('📋 Form completed!', summary);
    setCompletedForms(prev => [...prev, summary]);
    
    // Convert FormSummary to SubmittedReport format and add to reports
    const newReport: SubmittedReport = {
      id: Date.now(),
      title: selectedTemplate?.title || 'Voice Report',
      status: 'Completed' as const,
      date: new Date().toISOString().split('T')[0],
      templateType: selectedTemplate?.title || 'Voice Report',
      summary: summary.plainText.length > 100 
        ? summary.plainText.substring(0, 100) + '...' 
        : summary.plainText,
      plainText: summary.plainText,
      json: summary.json,
      isNew: true // Mark as new submission
    };
    
    // Add to submitted reports (in a real app, this would be sent to your backend)
    submittedReports.unshift(newReport);
    
    // Mark the report as not new after 24 hours (simulate real-world behavior)
    setTimeout(() => {
      const reportIndex = submittedReports.findIndex(r => r.id === newReport.id);
      if (reportIndex !== -1) {
        submittedReports[reportIndex].isNew = false;
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    // Navigate back to main interface and switch to reports tab
    setTimeout(() => {
      setSelectedTemplate(null);
      setActiveTab('reports');
    }, 3000); // Give time for user to see completion message
  };

  const handleSessionReady = (sessionId: string) => {
    console.log('🎤 Voice session ready:', sessionId);
  };

  // If settings is open, show the settings page
  if (showSettings) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        padding: '0'
      }}>
        <MobileHeader
          title="Settings"
          subtitle="Manage your preferences"
          showBackButton={true}
          onBackClick={handleSettingsBack}
          sticky={true}
        />
        <Settings onBack={handleSettingsBack} />
      </div>
    );
  }

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
            onSessionReady={handleSessionReady}
            onFormCompleted={handleFormCompletion}
          />
        </div>
      </div>
    );
  }

  console.log(">" + submittedReports);

  // Main interface with tabs
  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#f8fafc',
      maxWidth: '430px',
      margin: '0 auto',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <MobileHeader
        title="VoizReport"
        subtitle="Voice-powered reporting"
        onSettingsClick={handleSettingsClick}
      />

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Content */}
      <div style={{ 
        padding: '20px',
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {activeTab === 'templates' && (
          <TemplatesList
            templates={reportTemplates}
            onStartReport={startReport}
            onCreateTemplate={handleCreateTemplate}
            onEditTemplate={handleEditTemplate}
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

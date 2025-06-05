'use client';

import React, { useState, useCallback } from 'react';
import LiveVoiceChat, { FormSummary } from './components/LiveVoiceChat';
import MobileHeader from "./components/MobileHeader";
import TabNavigation, { Tab } from "./components/TabNavigation";
import TemplatesList from "./components/TemplatesList";
import SubmittedReports from "./components/SubmittedReports";
import Settings from "./components/Settings";
import FloatingSessionIndicator from "./components/FloatingSessionIndicator";
import { reportTemplates, ReportTemplate, SubmittedReport } from './data/mockData';

const tabs: Tab[] = [
  { id: 'templates', label: 'Create' },
  { id: 'reports', label: 'Recent Reports' }
];

export default function Home() {
  console.log('🏠 Home component render. Timestamp:', Date.now());
  
  const [activeTab, setActiveTab] = useState<'templates' | 'reports'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [completedForms, setCompletedForms] = useState<FormSummary[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'plain' | 'json'>('plain');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  console.log('🏠 Home state:', { 
    activeTab, 
    selectedTemplate: selectedTemplate?.title || 'none', 
    completedFormsCount: completedForms.length,
    showSettings 
  });

  const startReport = (template: ReportTemplate) => {
    console.log('📋 startReport called with template:', template.title);
    console.log('📋 Previous selectedTemplate:', selectedTemplate?.title || 'none');
    setSelectedTemplate(template);
  };

  const goBack = () => {
    console.log('🔙 goBack called, clearing selectedTemplate:', selectedTemplate?.title || 'none');
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

  const handleFormCompletion = useCallback((summary: FormSummary) => {
    console.log('📋 Form completed!', summary);
    setCompletedForms(prev => [...prev, summary]);
    
    // Note: Report is now automatically saved to localStorage in useVoiceChat hook
    console.log('💾 Report automatically saved to localStorage');
    
    // Navigate back to main interface and switch to reports tab
    setTimeout(() => {
      setSelectedTemplate(null);
      setActiveTab('reports');
      
      // Dispatch custom event to refresh reports list
      window.dispatchEvent(new CustomEvent('reportsUpdated'));
    }, 3000); // Give time for user to see completion message
  }, []);

  const handleSessionReady = useCallback((sessionId: string) => {
    console.log('🎤 Voice session ready:', sessionId);
  }, []);

  const handleNavigateToSession = useCallback((template: ReportTemplate) => {
    console.log('🎯 Navigating back to active session:', template.title);
    setSelectedTemplate(template);
  }, []);

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
        
        {/* Floating Session Indicator - shows when there's an active session */}
        <FloatingSessionIndicator onNavigateToSession={handleNavigateToSession} />
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
            key={`voice-chat-${selectedTemplate.id}`}
            template={selectedTemplate}
            onSessionReady={handleSessionReady}
            onFormCompleted={handleFormCompletion}
          />
        </div>
        
        {/* Floating Session Indicator - shows when there's an active session */}
        <FloatingSessionIndicator onNavigateToSession={handleNavigateToSession} />
      </div>
    );
  }

  console.log(">" + JSON.stringify(completedForms));

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
            onViewDetails={handleViewReportDetails}
          />
        )}
      </div>

      {/* Floating Session Indicator - shows when there's an active session */}
      <FloatingSessionIndicator onNavigateToSession={handleNavigateToSession} />
    </div>
  );
}

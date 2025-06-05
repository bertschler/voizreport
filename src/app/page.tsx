'use client';

import React, { useState, useCallback } from 'react';
import LiveVoiceChat, { FormSummary } from './components/LiveVoiceChat';
import MobileHeader from "./components/MobileHeader";
import { Tab } from "./components/TabNavigation";
import TemplatesList from "./components/TemplatesList";
import SubmittedReports from "./components/SubmittedReports";
import Settings from "./components/Settings";
import ReportDetailsPage from "./components/ReportDetailsPage";
import ReportDetailsFooter from "./components/ReportDetailsFooter";
import DefaultFooter from "./components/DefaultFooter";
import QuickTemplateSelector from "./components/QuickTemplateSelector";
import PageLayout from "./components/PageLayout";
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

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<SubmittedReport | null>(null);
  const [showQuickTemplateSelector, setShowQuickTemplateSelector] = useState<boolean>(false);
  
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
    setSelectedReport(report);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleSettingsBack = () => {
    setShowSettings(false);
  };

  const handleReportDetailsBack = () => {
    setSelectedReport(null);
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

  const handleStartNewSession = useCallback(() => {
    console.log('🎤 Opening quick template selector');
    setShowQuickTemplateSelector(true);
  }, []);

  const handleQuickTemplateSelect = useCallback((template: ReportTemplate) => {
    console.log('🎯 Quick template selected:', template.title);
    setShowQuickTemplateSelector(false);
    setSelectedTemplate(template);
  }, []);

  const handleCloseQuickTemplateSelector = useCallback(() => {
    setShowQuickTemplateSelector(false);
  }, []);

  // If report details is open, show the report details page
  if (selectedReport) {
    return (
      <PageLayout
        header={
          <MobileHeader
            title="Report Details"
            subtitle={selectedReport.title}
            showBackButton={true}
            onBackClick={handleReportDetailsBack}
            sticky={true}
          />
        }
        footer={
          <ReportDetailsFooter report={selectedReport} />
        }
        contentPadding="0"
        onNavigateToSession={handleNavigateToSession}
      >
        <ReportDetailsPage report={selectedReport} onBack={handleReportDetailsBack} />
      </PageLayout>
    );
  }

  // If settings is open, show the settings page
  if (showSettings) {
    return (
      <PageLayout
        header={
          <MobileHeader
            title="Settings"
            subtitle="Manage your preferences"
            showBackButton={true}
            onBackClick={handleSettingsBack}
            sticky={true}
          />
        }
        onNavigateToSession={handleNavigateToSession}
      >
        <Settings onBack={handleSettingsBack} />
      </PageLayout>
    );
  }

  // If a template is selected, show the voice chat interface
  if (selectedTemplate) {
    console.log('🏠 selectedTemplate:', selectedTemplate);
    return (
      <PageLayout
        header={
          <MobileHeader
            title={selectedTemplate.title}
            subtitle="New Report"
            showBackButton={true}
            onBackClick={goBack}
            sticky={true}
          />
        }
        footer={
          <DefaultFooter 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onNavigateToSession={handleNavigateToSession}
            onStartNewSession={handleStartNewSession}
            onStopSession={() => setSelectedTemplate(null)}
            showTabs={false}
          />
        }
        onNavigateToSession={handleNavigateToSession}
      >
        <LiveVoiceChat 
          key={`voice-chat-${selectedTemplate.id}`}
          template={selectedTemplate}
          onSessionReady={handleSessionReady}
          onFormCompleted={handleFormCompletion}
        />
      </PageLayout>
    );
  }

  // Main interface with tabs
  return (
    <PageLayout
      header={
        <MobileHeader
          title="VoizReport"
          subtitle="Voice-powered reporting"
          onSettingsClick={handleSettingsClick}
        />
      }
      footer={
        <DefaultFooter 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onNavigateToSession={handleNavigateToSession}
          onStartNewSession={handleStartNewSession}
        />
      }
      onNavigateToSession={handleNavigateToSession}
    >
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

      {/* Quick Template Selector Overlay */}
      <QuickTemplateSelector
        templates={reportTemplates}
        isVisible={showQuickTemplateSelector}
        onSelectTemplate={handleQuickTemplateSelect}
        onClose={handleCloseQuickTemplateSelector}
      />
    </PageLayout>
  );
}

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import AuthGuard from '@/components/AuthGuard';
import AuthDebug from '@/components/AuthDebug';
import VoiceChatComponent, { FormSummary } from '@/app/voice-chat/VoiceChatComponent';
import VoiceChatProvider from '@/app/voice-chat/VoiceChatProvider';
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
import { selectedTemplateAtom, isCreatingTemplateAtom, voiceChatModeAtom } from './state/voiceChatState';
import { templatesAtom } from './state/templatesState';
import { useVoiceChat } from './hooks/useVoiceChat';
import { useSetAtom } from 'jotai';
import { ReportTemplate, SubmittedReport } from "@/app/types/core";

const tabs: Tab[] = [
  { id: 'templates', label: 'Create' },
  { id: 'reports', label: 'Recent' }
];

export default function Home() {
  console.log('🏠 Home component render. Timestamp:', Date.now());
  
  const [activeTab, setActiveTab] = useState<'templates' | 'reports'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useAtom(selectedTemplateAtom);
  const [templates] = useAtom(templatesAtom);
  const [completedForms, setCompletedForms] = useState<FormSummary[]>([]);
  const [isTemplatesLoaded, setIsTemplatesLoaded] = useState<boolean>(false);
  
  // Use global state for template creation
  const { isCreatingTemplate, startTemplateCreation } = useVoiceChat();
  const setIsCreatingTemplate = useSetAtom(isCreatingTemplateAtom);
  const setVoiceChatMode = useSetAtom(voiceChatModeAtom);

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<SubmittedReport | null>(null);
  const [showQuickTemplateSelector, setShowQuickTemplateSelector] = useState<boolean>(false);
  
  // Handle client-side hydration for templates
  useEffect(() => {
    // Mark templates as loaded after first render on client
    const timer = setTimeout(() => {
      setIsTemplatesLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  console.log('🏠 Home state:', { 
    activeTab, 
    selectedTemplate: selectedTemplate?.title || 'none', 
    completedFormsCount: completedForms.length,
    showSettings,
    isCreatingTemplate,
    templatesCount: templates.length,
    isTemplatesLoaded
  });

  const startReport = (template: ReportTemplate) => {
    console.log('📋 startReport called with template:', template.title);
    console.log('📋 Previous selectedTemplate:', selectedTemplate?.title || 'none');
    setSelectedTemplate(template);
  };

  const goBack = () => {
    console.log('🔙 goBack called, clearing selectedTemplate:', selectedTemplate?.title || 'none');
    setSelectedTemplate(null);
    exitTemplateCreation();
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'templates' | 'reports');
  };

  const handleCreateTemplate = () => {
    console.log('🎨 Starting template creation mode');
    startTemplateCreation();
  };

  const exitTemplateCreation = useCallback(() => {
    console.log('🔙 Exiting template creation mode');
    setIsCreatingTemplate(false);
    setVoiceChatMode('report');
  }, [setIsCreatingTemplate, setVoiceChatMode]);

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
      exitTemplateCreation();
      setActiveTab('reports');
      
      // Dispatch custom event to refresh reports list
      window.dispatchEvent(new CustomEvent('reportsUpdated'));
    }, 3000); // Give time for user to see completion message
  }, [setSelectedTemplate]);

  const handleSessionReady = useCallback((sessionId: string) => {
    console.log('🎤 Voice session ready:', sessionId);
  }, []);

  const handleNavigateToSession = useCallback((template: ReportTemplate) => {
    console.log('🎯 Navigating back to active session:', template.title);
    setSelectedTemplate(template);
    exitTemplateCreation();
  }, [setSelectedTemplate, exitTemplateCreation]);

  const handleStartNewSession = useCallback(() => {
    console.log('🎤 Opening quick template selector');
    setShowQuickTemplateSelector(true);
  }, []);

  const handleQuickTemplateSelect = useCallback((template: ReportTemplate) => {
    console.log('🎯 Quick template selected:', template.title);
    setShowQuickTemplateSelector(false);
    setSelectedTemplate(template);
    exitTemplateCreation();
  }, [setSelectedTemplate, exitTemplateCreation]);

  const handleCloseQuickTemplateSelector = useCallback(() => {
    setShowQuickTemplateSelector(false);
  }, []);

  // If report details is open, show the report details page
  if (selectedReport) {
    return (
      <AuthGuard>
        <VoiceChatProvider
        onSessionReady={handleSessionReady}
        onFormCompleted={handleFormCompletion}
      >
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
      </VoiceChatProvider>
      </AuthGuard>
    );
  }

  // If settings is open, show the settings page
  if (showSettings) {
    return (
      <AuthGuard>
        <VoiceChatProvider
        onSessionReady={handleSessionReady}
        onFormCompleted={handleFormCompletion}
      >
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
          <Settings />
        </PageLayout>
      </VoiceChatProvider>
      </AuthGuard>
    );
  }

  // If template creation mode is active, show the template creation interface
  if (isCreatingTemplate) {
    return (
      <AuthGuard>
        <VoiceChatProvider
        onSessionReady={handleSessionReady}
        onFormCompleted={handleFormCompletion}
      >
        <PageLayout
          header={
            <MobileHeader
              title="Create Template"
              subtitle="Design a new report type"
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
              onStopSession={() => {
                setSelectedTemplate(null);
                exitTemplateCreation();
              }}
              showTabs={false}
            />
          }
          onNavigateToSession={handleNavigateToSession}
        >
          <VoiceChatComponent
            key="template"
            mode="template"
          />
        </PageLayout>
      </VoiceChatProvider>
      </AuthGuard>
    );
  }

  // If a template is selected, show the voice chat interface
  if (selectedTemplate) {
    console.log('🏠 selectedTemplate:', selectedTemplate);
    return (
      <AuthGuard>
        <VoiceChatProvider
        onSessionReady={handleSessionReady}
        onFormCompleted={handleFormCompletion}
      >
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
          <VoiceChatComponent
            key={`voice-chat-${selectedTemplate.id}`}
            template={selectedTemplate}
            mode="report"
          />
        </PageLayout>
      </VoiceChatProvider>
      </AuthGuard>
    );
  }

  // Main interface with tabs
  return (
    <AuthGuard>
      <VoiceChatProvider
      onSessionReady={handleSessionReady}
      onFormCompleted={handleFormCompletion}
    >
      <PageLayout
        header={
          <MobileHeader
            title="Voiz.Report"
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
          !isTemplatesLoaded ? (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              color: '#64748b' 
            }}>
              Loading templates...
            </div>
          ) : (
            <TemplatesList
              templates={templates}
              onStartReport={startReport}
              onCreateTemplate={handleCreateTemplate}
              onEditTemplate={handleEditTemplate}
            />
          )
        )}

        {activeTab === 'reports' && (
          <SubmittedReports
            onViewDetails={handleViewReportDetails}
          />
        )}

        {/* Quick Template Selector Overlay */}
        <QuickTemplateSelector
          templates={templates}
          isVisible={showQuickTemplateSelector}
          onSelectTemplate={handleQuickTemplateSelect}
          onClose={handleCloseQuickTemplateSelector}
          onCreateTemplate={handleCreateTemplate}
        />
      </PageLayout>
    </VoiceChatProvider>
    </AuthGuard>
  );
}

'use client';

import React from 'react';

export interface Tab {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabNavigation({ 
  tabs, 
  activeTab, 
  onTabChange 
}: TabNavigationProps) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex'
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: 1,
            padding: '16px',
            background: 'none',
            border: 'none',
            fontSize: '16px',
            fontWeight: '500',
            color: activeTab === tab.id ? '#8B5CF6' : '#64748b',
            borderBottom: activeTab === tab.id ? '2px solid #8B5CF6' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
} 
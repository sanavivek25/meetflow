/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MeetFlowProvider, useMeetFlow } from './context/MeetFlowContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { Toast } from './components/common/Toast';

import { DashboardView } from './components/dashboard/DashboardView';
import { UploadView } from './components/upload/UploadView';
import { ActionRegisterView } from './components/register/ActionRegisterView';
import { EvidenceExplorerView } from './components/evidence/EvidenceExplorerView';
import { DependencyMapView } from './components/dependencies/DependencyMapView';
import { RiskCenterView } from './components/risks/RiskCenterView';
import { ApprovalHubView } from './components/approval/ApprovalHubView';
import { TeamAccountabilityView } from './components/accountability/TeamAccountabilityView';
import { MeetingHistoryView } from './components/history/MeetingHistoryView';

const MainLayout: React.FC = () => {
  const { currentTab, toastMessage, showToast } = useMeetFlow();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Dark Navy Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area (offset by sidebar width on lg screens) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <Header onOpenMobile={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && <DashboardView />}
          {currentTab === 'upload' && <UploadView />}
          {currentTab === 'action-register' && <ActionRegisterView />}
          {currentTab === 'evidence-explorer' && <EvidenceExplorerView />}
          {currentTab === 'dependency-map' && <DependencyMapView />}
          {currentTab === 'risk-center' && <RiskCenterView />}
          {currentTab === 'approval-hub' && <ApprovalHubView />}
          {currentTab === 'team-accountability' && <TeamAccountabilityView />}
          {currentTab === 'meeting-history' && <MeetingHistoryView />}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <GlobalSearchModal />
      <Toast toast={toastMessage} onClose={() => {}} />
    </div>
  );
};

export default function App() {
  return (
    <MeetFlowProvider>
      <MainLayout />
    </MeetFlowProvider>
  );
}

import React, { useState, useEffect } from 'react';

import { AdminHeader } from './layout/AdminHeader';

import { TabBar } from './layout/TabBar';

import { QuestionsTab } from './modules/QuestionsTab';

import { TestSeriesTab } from './modules/TestSeriesTab';

import { MentorsTab } from './modules/MentorsTab';

import { ResourcesTab } from './modules/ResourcesTab';

import { ImportantDatesTab } from './modules/ImportantDatesTab';

import { RankVsMarksTab } from './modules/RankVsMarksTab';

import { AnnouncementsTab } from './modules/AnnouncementsTab';

import { StudentsTab } from './modules/StudentsTab';

import { HelplinesTab } from './modules/HelplinesTab';

import { ReceiptsTab } from './modules/ReceiptsTab';

import { CollegesTab } from './modules/CollegesTab';

import { BranchExplorerTab } from './modules/BranchExplorerTab';
import { ChallengesTab } from './modules/ChallengesTab';

import { StudentBranchExplorer } from './student/StudentBranchExplorer';

import { BroadcastNotifModal } from './modals/BroadcastNotifModal';



export const Dashboard: React.FC = () => {

  // Sync tab with URL search params (e.g. ?tab=questions)

  const [activeTab, setActiveTab] = useState<string>(() => {

    const params = new URLSearchParams(window.location.search);

    return params.get('tab') || 'questions';

  });



  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);



  const handleSelectTab = (tabId: string) => {

    setActiveTab(tabId);

    const url = new URL(window.location.href);

    url.searchParams.set('tab', tabId);

    window.history.pushState({}, '', url.toString());

  };



  useEffect(() => {

    const onPopState = () => {

      const params = new URLSearchParams(window.location.search);

      setActiveTab(params.get('tab') || 'questions');

    };

    window.addEventListener('popstate', onPopState);

    return () => window.removeEventListener('popstate', onPopState);

  }, []);



  return (

    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-admin-primary selection:text-white">

      {/* Top Header Bar */}

      <AdminHeader 

        onOpenBroadcast={() => setIsBroadcastOpen(true)}

        onOpenStudentView={() => {

          handleSelectTab(activeTab === 'student-view' ? 'colleges' : 'student-view');

        }}

        isStudentViewActive={activeTab === 'student-view'}

      />



      {/* 12-Module Scrollable Tab Bar + Student View */}

      <TabBar activeTab={activeTab} onSelectTab={handleSelectTab} />



      {/* Main Content Area */}

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 transition-all">

        {activeTab === 'questions' && <QuestionsTab />}

        {activeTab === 'test-series' && <TestSeriesTab />}

        {activeTab === 'mentors' && <MentorsTab />}

        {activeTab === 'resources' && <ResourcesTab />}

        {activeTab === 'dates' && <ImportantDatesTab />}

        {activeTab === 'rank-marks' && <RankVsMarksTab />}

        {activeTab === 'announcements' && <AnnouncementsTab />}

        {activeTab === 'students' && <StudentsTab />}

        {activeTab === 'helplines' && <HelplinesTab />}

        {activeTab === 'receipts' && <ReceiptsTab />}

        {activeTab === 'colleges' && <CollegesTab />}

        {activeTab === 'branches' && <BranchExplorerTab />}
        {activeTab === 'challenges' && <ChallengesTab />}

        {activeTab === 'student-view' && (

          <StudentBranchExplorer onBackToAdmin={() => handleSelectTab('colleges')} />

        )}

      </main>



      {/* Global Broadcast Notification Modal */}

      <BroadcastNotifModal

        isOpen={isBroadcastOpen}

        onClose={() => setIsBroadcastOpen(false)}

      />

    </div>

  );

};


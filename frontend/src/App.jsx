import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import GenerateGroups from './pages/GenerateGroups';
import StudyGroups from './pages/StudyGroups';
import AiSimulation from './pages/AiSimulation';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalNotification, setGlobalNotification] = useState(null);

  const tabMeta = {
    dashboard: {
      title: 'Dashboard Overview',
      subtitle: 'Real-time student registration metrics and formed study group analytics',
    },
    students: {
      title: 'Student Profile Management',
      subtitle: 'Browse, register, update, and manage student preferences and skill levels',
    },
    generate: {
      title: 'Generate Study Groups',
      subtitle: 'Configure parameters and execute the Scikit-Learn K-Means clustering algorithm',
    },
    groups: {
      title: 'Formed Study Groups',
      subtitle: 'Inspect peer study clusters, dominant topics, schedules, and member allocations',
    },
    simulation: {
      title: 'AI Algorithm Simulation',
      subtitle: 'Step-by-step visual demonstration of K-Means clustering for faculty evaluation',
    },
  };

  const handleGlobalDemoLoad = async () => {
    try {
      await api.loadDemoStudents();
      // If currently on dashboard or students, trigger a tab refresh or notify
      setGlobalNotification('Successfully loaded 20 demo student profiles.');
      setTimeout(() => setGlobalNotification(null), 3500);
      // Switch to students or dashboard to show the data
      if (activeTab === 'dashboard') {
        setActiveTab('students');
      }
    } catch (err) {
      alert(`Failed to load demo students: ${err.message}`);
    }
  };

  const currentMeta = tabMeta[activeTab] || tabMeta.dashboard;

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onQuickGenerate={() => setActiveTab('generate')}
          onDemoLoad={handleGlobalDemoLoad}
        />

        {globalNotification && (
          <div style={{ padding: '16px 32px 0' }}>
            <div className="alert-box alert-success" style={{ margin: 0 }}>
              {globalNotification}
            </div>
          </div>
        )}

        <main className="page-content">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'students' && <Students />}
          {activeTab === 'generate' && <GenerateGroups setActiveTab={setActiveTab} />}
          {activeTab === 'groups' && <StudyGroups setActiveTab={setActiveTab} />}
          {activeTab === 'simulation' && <AiSimulation setActiveTab={setActiveTab} />}
        </main>
      </div>
    </div>
  );
}


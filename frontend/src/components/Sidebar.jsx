import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Cpu, 
  Network, 
  BrainCircuit,
  GraduationCap
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'generate', label: 'Generate Groups', icon: Cpu },
    { id: 'groups', label: 'Study Groups', icon: Network },
    { id: 'simulation', label: 'AI Simulation', icon: BrainCircuit },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-area">
          <div className="logo-icon">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="logo-title">CampusCluster</div>
            <div className="logo-subtitle">AI Study Group System</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="engine-status-card">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>ML Engine Active</span>
          </div>
          <div className="engine-tag">Scikit-Learn K-Means</div>
        </div>
      </div>
    </aside>
  );
}


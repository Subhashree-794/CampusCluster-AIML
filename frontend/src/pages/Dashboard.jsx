import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  UserCheck, 
  BookOpen, 
  ArrowRight, 
  Sparkles,
  RefreshCw,
  Clock,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { api } from '../services/api';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#1e40af', '#1d4ed8', '#0284c7'];

export default function Dashboard({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div className="spinner" style={{ borderTopColor: '#2563eb', borderColor: '#bfdbfe' }}></div>
        <span style={{ marginLeft: '12px', color: '#64748b' }}>Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-box alert-error">
        <span>Could not connect to Flask backend. Make sure the backend server is running on port 5000. ({error})</span>
        <button className="btn btn-secondary btn-sm" onClick={fetchStats} style={{ marginLeft: 'auto' }}>
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

  const {
    total_students = 0,
    total_groups_formed = 0,
    avg_students_per_group = 0,
    total_subjects = 0,
    subject_distribution = [],
    recent_students = [],
    latest_groups = []
  } = stats || {};

  return (
    <div>
      {/* Top Statistical Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Registered Students</span>
            <span className="stat-value">{total_students}</span>
            <span className="stat-subtext">Active student profiles in database</span>
          </div>
          <div className="stat-icon-wrapper">
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Groups Formed</span>
            <span className="stat-value">{total_groups_formed}</span>
            <span className="stat-subtext">Optimized via K-Means clustering</span>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <Layers size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Avg. Students / Group</span>
            <span className="stat-value">{avg_students_per_group}</span>
            <span className="stat-subtext">Balanced peer distribution</span>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <UserCheck size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Number of Subjects</span>
            <span className="stat-value">{total_subjects}</span>
            <span className="stat-subtext">Academic domains covered</span>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#faf5ff', color: '#9333ea' }}>
            <BookOpen size={22} />
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="card" style={{ 
        marginBottom: '28px', 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        color: '#ffffff',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '6px' }}>
            AI-Driven Peer Study Matching
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '650px' }}>
            Group students automatically according to subject affinity, skill compatibility, and preferred study schedules using Scikit-Learn K-Means.
          </p>
        </div>
        <button 
          className="btn btn-primary"
          style={{ padding: '11px 22px', fontSize: '0.95rem' }}
          onClick={() => setActiveTab('generate')}
        >
          <Sparkles size={16} />
          <span>Form New Study Groups</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Main Grid: Subject Distribution Chart + Recent Groups */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '24px', marginBottom: '28px' }}>
        
        {/* Chart Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Distribution of Students by Subject</h3>
              <p className="card-subtitle">Student academic interests across registered profiles</p>
            </div>
          </div>

          {subject_distribution.length > 0 ? (
            <div style={{ width: '100%', height: 270 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subject_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    interval={0} 
                    angle={-20} 
                    textAnchor="end"
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '8px', 
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.82rem'
                    }}
                    itemStyle={{ color: '#93c5fd' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {subject_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
              No student subject data available yet.
            </div>
          )}
        </div>

        {/* Latest Groups Preview */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Latest Formed Study Groups</h3>
              <p className="card-subtitle">
                {total_groups_formed > 0 
                  ? `${total_groups_formed} active clusters generated by K-Means` 
                  : 'No groups generated yet'}
              </p>
            </div>
            {total_groups_formed > 0 && (
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setActiveTab('groups')}
              >
                View All
              </button>
            )}
          </div>

          {latest_groups.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {latest_groups.slice(0, 4).map((g) => (
                <div 
                  key={g.group_id}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0f172a' }}>
                      {g.group_name}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                      <span className="badge badge-subject">{g.dominant_focus}</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                        {g.preferred_time}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 700, 
                      color: '#2563eb' 
                    }}>
                      {g.student_count}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                      students
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
              <p style={{ marginBottom: '14px' }}>Groups have not been generated yet.</p>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('generate')}
              >
                <Sparkles size={14} /> Run K-Means Clustering
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Student Registrations</h3>
            <p className="card-subtitle">Newly registered students available for study group grouping</p>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('students')}
          >
            Manage All Students
          </button>
        </div>

        {recent_students.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Branch</th>
                  <th>Subject of Interest</th>
                  <th>Skill Level</th>
                  <th>Study Time</th>
                  <th>Learning Goal</th>
                </tr>
              </thead>
              <tbody>
                {recent_students.map((student) => {
                  const skill = (student.skill_level || 'Intermediate').toLowerCase();
                  const skillBadgeClass = 
                    skill === 'beginner' ? 'badge-beginner' : 
                    skill === 'advanced' ? 'badge-advanced' : 'badge-intermediate';

                  return (
                    <tr key={student.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#2563eb' }}>
                        {student.id}
                      </td>
                      <td style={{ fontWeight: 600 }}>{student.name}</td>
                      <td>
                        <span className="badge badge-branch">{student.branch}</span>
                      </td>
                      <td>
                        <span className="badge badge-subject">{student.subject}</span>
                      </td>
                      <td>
                        <span className={`badge ${skillBadgeClass}`}>
                          <Award size={11} /> {student.skill_level}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-time">
                          <Clock size={11} /> {student.study_time}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.85rem' }}>
                        {student.learning_goal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            No students found. Load demo students to get started.
          </div>
        )}
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  Clock, 
  Award, 
  BookOpen, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Info,
  Calendar,
  Compass
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

const GROUP_COLORS = ['#2563eb', '#3b82f6', '#0284c7', '#0891b2', '#0d9488', '#16a34a', '#d97706', '#dc2626'];

export default function StudyGroups({ setActiveTab }) {
  const [groupsData, setGroupsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getLatestGroups();
      setGroupsData(data);
      // Auto-expand all groups initially
      if (data && data.groups) {
        const initialExpand = {};
        data.groups.forEach((g) => {
          initialExpand[g.group_id] = true;
        });
        setExpandedGroups(initialExpand);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch generated groups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const toggleGroupExpand = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div className="spinner" style={{ borderTopColor: '#2563eb', borderColor: '#bfdbfe' }}></div>
        <span style={{ marginLeft: '12px', color: '#64748b' }}>Loading study groups...</span>
      </div>
    );
  }

  const groups = groupsData?.groups || [];
  const summary = groupsData?.summary || {};

  // Chart data for group sizes
  const groupSizeChartData = groups.map((g) => ({
    name: `Group ${g.group_id}`,
    students: g.student_count,
    focus: g.dominant_focus
  }));

  return (
    <div>
      {/* Overview & Quick Actions */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI Generated Study Groups</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
              Clusters formed via multi-dimensional Scikit-Learn K-Means feature optimization
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={fetchGroups}
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab('generate')}
            >
              <Sparkles size={13} /> Regenerate with Different K
            </button>
          </div>
        </div>

        {/* Disclaimer / Faculty Explanation Callout */}
        <div style={{
          marginTop: '18px',
          padding: '12px 16px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '0.84rem',
          color: '#475569',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start'
        }}>
          <Info size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Scientific Note on Cluster Distribution:</strong> K-Means groups students based on similarity in their feature vectors (subject interests, skill level scores, and preferred time slots). It does not artificially force equal group sizes; rather, it reflects natural student community densities and shared academic focus.
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <Layers size={40} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '8px' }}>No Study Groups Generated Yet</h3>
          <p style={{ maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            Run the K-Means clustering algorithm to partition your registered students into optimized peer study groups.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('generate')}
          >
            <Sparkles size={16} /> Go to Group Generator
          </button>
        </div>
      ) : (
        <>
          {/* Summary Statistics & Size Distribution Bar Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: '24px', marginBottom: '24px' }}>
            
            {/* Quick Metrics */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Clustering Summary</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Groups (K)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{groups.length}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Students Assigned</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2563eb' }}>{summary.total_students || 0}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Avg. Size</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{summary.avg_students_per_group || 0}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Algorithm Inertia</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#16a34a' }}>{summary.inertia || '—'}</div>
                </div>
              </div>
            </div>

            {/* Group Size Chart */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '4px' }}>Students Assigned Per Study Group</h3>
              <p className="card-subtitle" style={{ marginBottom: '16px' }}>Cluster size distribution produced by K-Means</p>
              
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupSizeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#ffffff', border: 'none' }}
                      formatter={(val, name, item) => [`${val} students (${item.payload.focus})`, 'Count']}
                    />
                    <Bar dataKey="students" radius={[4, 4, 0, 0]}>
                      {groupSizeChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={GROUP_COLORS[index % GROUP_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Group Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {groups.map((group, idx) => {
              const isExpanded = !!expandedGroups[group.group_id];
              const accentColor = GROUP_COLORS[idx % GROUP_COLORS.length];

              return (
                <div 
                  key={group.group_id} 
                  className="card"
                  style={{
                    borderLeft: `5px solid ${accentColor}`,
                    padding: '24px'
                  }}
                >
                  {/* Group Header */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => toggleGroupExpand(group.group_id)}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                          {group.group_name}
                        </h3>
                        <span style={{
                          backgroundColor: `${accentColor}18`,
                          color: accentColor,
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          padding: '3px 10px',
                          borderRadius: '9999px'
                        }}>
                          {group.student_count} Students
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px', fontSize: '0.85rem', color: '#475569' }}>
                        <span>
                          <strong>Dominant Focus:</strong> {group.dominant_focus}
                        </span>
                        <span>•</span>
                        <span>
                          <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                          <strong>Study Slot:</strong> {group.preferred_time}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGroupExpand(group.group_id);
                        }}
                      >
                        {isExpanded ? (
                          <><span>Collapse Members</span> <ChevronUp size={15} /></>
                        ) : (
                          <><span>View Members ({group.student_count})</span> <ChevronDown size={15} /></>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Group Characteristics Preview (Always Visible) */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    {/* Top Subject Interests */}
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Subject Focus
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {group.top_subjects.map((s, i) => (
                          <span key={i} className="badge badge-subject">
                            {s.subject} ({s.count})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skill Breakdown */}
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Skill Level Distribution
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {group.skill_distribution.Beginner > 0 && (
                          <span className="badge badge-beginner">
                            Beginner: {group.skill_distribution.Beginner}
                          </span>
                        )}
                        {group.skill_distribution.Intermediate > 0 && (
                          <span className="badge badge-intermediate">
                            Intermediate: {group.skill_distribution.Intermediate}
                          </span>
                        )}
                        {group.skill_distribution.Advanced > 0 && (
                          <span className="badge badge-advanced">
                            Advanced: {group.skill_distribution.Advanced}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Preferred Times */}
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Time Preference
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {Object.entries(group.time_distribution).map(([time, count]) => (
                          <span key={time} className="badge badge-time">
                            {time}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Members Table */}
                  {isExpanded && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '12px', color: '#0f172a' }}>
                        Group Members ({group.members.length})
                      </h4>

                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Branch</th>
                              <th>Subject</th>
                              <th>Skill Level</th>
                              <th>Preferred Time</th>
                              <th>Learning Goal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.members.map((member) => {
                              const skill = (member.skill_level || 'Intermediate').toLowerCase();
                              const skillBadgeClass = 
                                skill === 'beginner' ? 'badge-beginner' : 
                                skill === 'advanced' ? 'badge-advanced' : 'badge-intermediate';

                              return (
                                <tr key={member.id}>
                                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#2563eb' }}>
                                    {member.id}
                                  </td>
                                  <td style={{ fontWeight: 600 }}>{member.name}</td>
                                  <td>
                                    <span className="badge badge-branch">{member.branch}</span>
                                  </td>
                                  <td>
                                    <span className="badge badge-subject">{member.subject}</span>
                                  </td>
                                  <td>
                                    <span className={`badge ${skillBadgeClass}`}>
                                      <Award size={11} /> {member.skill_level}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="badge badge-time">
                                      <Clock size={11} /> {member.study_time}
                                    </span>
                                  </td>
                                  <td style={{ color: '#475569', fontSize: '0.84rem' }}>
                                    {member.learning_goal}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}


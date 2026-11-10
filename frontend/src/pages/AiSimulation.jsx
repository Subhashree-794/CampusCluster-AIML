import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Database, 
  Binary, 
  Target, 
  GitMerge, 
  PieChart as PieIcon,
  HelpCircle, 
  RefreshCw, 
  Check, 
  Layers, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity
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

const COLORS = ['#2563eb', '#3b82f6', '#0284c7', '#0d9488', '#16a34a', '#d97706'];

export default function AiSimulation({ setActiveTab }) {
  const [groupsData, setGroupsData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [groupsRes, studentsRes] = await Promise.all([
        api.getLatestGroups(),
        api.getStudents()
      ]);
      setGroupsData(groupsRes);
      setStudents(studentsRes);
    } catch (err) {
      setError(err.message || 'Failed to load simulation data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div className="spinner" style={{ borderTopColor: '#2563eb', borderColor: '#bfdbfe' }}></div>
        <span style={{ marginLeft: '12px', color: '#64748b' }}>Loading AI Simulation...</span>
      </div>
    );
  }

  const simulation = groupsData?.simulation;
  const groups = groupsData?.groups || [];
  const k = simulation?.k || groups.length || 0;
  const totalStudents = students.length;
  const inertia = simulation?.inertia || '—';
  const nIter = simulation?.n_iter || '—';

  const chartData = (simulation?.cluster_sizes || groups.map(g => ({
    group: `Group ${g.group_id}`,
    count: g.student_count
  })));

  const steps = [
    { num: 1, title: 'Input Student Data', icon: Database, desc: 'Raw profiles' },
    { num: 2, title: 'Feature Extraction', icon: Binary, desc: 'Vector encoding' },
    { num: 3, title: 'K-Means Clustering', icon: Target, desc: 'Iterative centroids' },
    { num: 4, title: 'Group Assignment', icon: GitMerge, desc: 'Cluster labels' },
    { num: 5, title: 'Results & Analytics', icon: PieIcon, desc: 'Formed clusters' },
  ];

  return (
    <div>
      {/* Simulation Header Banner */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-intermediate">Interactive AI Demonstration</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>College AI Mini-Project</span>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>K-Means Clustering Workflow Simulation</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
              Follow the 5 algorithmic stages transforming raw student text records into optimized peer study groups.
            </p>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={fetchData}>
            <RefreshCw size={13} /> Refresh Simulation
          </button>
        </div>

        {/* Algorithm Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Selected K Value</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2563eb' }}>{k > 0 ? k : 'Not Run'}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Students Processed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>{totalStudents}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Clusters Generated</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>{groups.length}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Algorithm Inertia (WCSS)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#16a34a' }}>{inertia}</div>
          </div>
        </div>
      </div>

      {/* 5-Step Process Stepper Navigation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '10px',
        marginBottom: '24px'
      }}>
        {steps.map((s) => {
          const Icon = s.icon;
          const isCurrent = activeStep === s.num;
          return (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 16px',
                backgroundColor: isCurrent ? '#0f172a' : '#ffffff',
                color: isCurrent ? '#ffffff' : '#475569',
                border: isCurrent ? '1px solid #0f172a' : '1px solid #e2e8f0',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                boxShadow: isCurrent ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: isCurrent ? '#2563eb' : '#f1f5f9',
                color: isCurrent ? '#ffffff' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0
              }}>
                <Icon size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>Step {s.num}</div>
                <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>{s.title}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Content Area */}
      <div className="card" style={{ marginBottom: '28px', minHeight: '360px' }}>
        
        {/* STEP 1: INPUT STUDENT DATA */}
        {activeStep === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '6px', backgroundColor: '#eff6ff', borderRadius: '6px', color: '#2563eb' }}>
                <Database size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Step 1: Input Student Data</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Collecting qualitative student preferences</p>
              </div>
            </div>

            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '18px' }}>
              The study group matching process begins with collecting student profile information. Each record includes categorical attributes (Branch, Primary Subject, Secondary Subject, Preferred Study Time, and Learning Goal) and ordinal attributes (Skill Level).
            </p>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Branch</th>
                    <th>Subject</th>
                    <th>Skill Level</th>
                    <th>Preferred Time</th>
                    <th>Learning Goal</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 6).map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#2563eb' }}>{s.id}</td>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.branch}</td>
                      <td><span className="badge badge-subject">{s.subject}</span></td>
                      <td><span className="badge badge-intermediate">{s.skill_level}</span></td>
                      <td><span className="badge badge-time">{s.study_time}</span></td>
                      <td style={{ fontSize: '0.84rem', color: '#64748b' }}>{s.learning_goal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.78rem', color: '#64748b', textAlign: 'right' }}>
              Showing sample of 6 of {students.length} students loaded in memory
            </div>
          </div>
        )}

        {/* STEP 2: FEATURE EXTRACTION & ENCODING */}
        {activeStep === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '6px', backgroundColor: '#eff6ff', borderRadius: '6px', color: '#2563eb' }}>
                <Binary size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Step 2: Feature Extraction & Encoding</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Converting text and categories into mathematical vectors</p>
              </div>
            </div>

            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
              Machine Learning algorithms cannot calculate mathematical distance on text strings directly. CampusCluster applies two transformations:
            </p>

            {/* Explanation Boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.92rem', color: '#0f172a', marginBottom: '8px' }}>1. Ordinal Skill Mapping</h4>
                <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '10px' }}>
                  Skill levels are mapped to sequential numeric ratings preserving relative proficiency:
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="badge badge-beginner">Beginner = 1.0</span>
                  <span className="badge badge-intermediate">Intermediate = 2.0</span>
                  <span className="badge badge-advanced">Advanced = 3.0</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.92rem', color: '#0f172a', marginBottom: '8px' }}>2. One-Hot Encoding</h4>
                <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '10px' }}>
                  Categorical columns (Subject, Branch, Study Time) are transformed into binary indicators (0 or 1) using <code>pandas.get_dummies()</code>.
                </p>
                <div style={{ fontSize: '0.78rem', color: '#2563eb', fontFamily: 'var(--font-mono)' }}>
                  subject_Machine Learning = 1.0, subject_Web Dev = 0.0
                </div>
              </div>
            </div>

            {/* Feature Vector Sample Table */}
            {simulation?.sample_raw_features && (
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px' }}>
                  Extracted Numerical Vector Preview (Sample Students):
                </h4>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        {simulation.feature_names.slice(0, 7).map((feat, i) => (
                          <th key={i} style={{ fontSize: '0.72rem' }}>{feat}</th>
                        ))}
                        <th>...</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulation.sample_raw_features.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{item.name}</td>
                          {item.values.slice(0, 7).map((val, vi) => (
                            <td key={vi} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                              {val}
                            </td>
                          ))}
                          <td style={{ color: '#94a3b8' }}>+{simulation.feature_names.length - 7} more</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: K-MEANS CLUSTERING */}
        {activeStep === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '6px', backgroundColor: '#eff6ff', borderRadius: '6px', color: '#2563eb' }}>
                <Target size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Step 3: K-Means Clustering Algorithm</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Iterative centroid calculation and distance minimization</p>
              </div>
            </div>

            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
              Scikit-Learn executes the unsupervised K-Means algorithm by following these computational iterations:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', background: '#f8fafc', borderLeft: '4px solid #2563eb', borderRadius: '6px' }}>
                <strong>Iteration 1: Centroid Initialization</strong>
                <p style={{ fontSize: '0.84rem', color: '#475569', marginTop: '4px' }}>
                  The algorithm initializes <strong>{k}</strong> cluster centers in feature space using <code>k-means++</code> to ensure wide initial separation.
                </p>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderLeft: '4px solid #3b82f6', borderRadius: '6px' }}>
                <strong>Iteration 2: Distance Computation</strong>
                <p style={{ fontSize: '0.84rem', color: '#475569', marginTop: '4px' }}>
                  For each student feature vector <em>x</em> and centroid <em>c</em>, Euclidean distance is calculated:
                  <code style={{ marginLeft: '6px', padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px' }}>
                    d(x, c) = √ Σ (xᵢ - cᵢ)²
                  </code>
                </p>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderLeft: '4px solid #16a34a', borderRadius: '6px' }}>
                <strong>Iteration 3: Convergence</strong>
                <p style={{ fontSize: '0.84rem', color: '#475569', marginTop: '4px' }}>
                  Centroids are recomputed as the mathematical mean of assigned members until cluster assignments stop shifting (converged in <strong>{nIter}</strong> iterations).
                </p>
              </div>
            </div>

            {/* Code snippet showing Scikit-learn execution */}
            <div className="code-box">
              <span style={{ color: '#94a3b8' }}># Python Scikit-Learn Clustering Call in CampusCluster:</span><br />
              <span style={{ color: '#60a5fa' }}>from</span> sklearn.cluster <span style={{ color: '#60a5fa' }}>import</span> KMeans<br /><br />
              kmeans = KMeans(n_clusters={k || 4}, random_state=42, n_init=10)<br />
              cluster_labels = kmeans.fit_predict(scaled_feature_matrix)
            </div>
          </div>
        )}

        {/* STEP 4: GROUP ASSIGNMENT */}
        {activeStep === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '6px', backgroundColor: '#eff6ff', borderRadius: '6px', color: '#2563eb' }}>
                <GitMerge size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Step 4: Cluster Assignment & Distance to Centroid</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Mapping each student to the nearest centroid</p>
              </div>
            </div>

            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
              Every student is assigned to the cluster whose centroid minimizes their Euclidean distance. Below is the assignment table showing student labels and Euclidean distance to their assigned study group centroid:
            </p>

            {simulation?.cluster_assignments ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Assigned Study Group</th>
                      <th>Euclidean Distance to Centroid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulation.cluster_assignments.slice(0, 8).map((a, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#2563eb' }}>{a.student_id}</td>
                        <td style={{ fontWeight: 600 }}>{a.student_name}</td>
                        <td>
                          <span className="badge badge-intermediate">
                            Study Group {a.assigned_group}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: '#475569' }}>
                          {a.distance_to_centroid}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                Please run group generation to inspect cluster assignments.
              </div>
            )}
            <div style={{ marginTop: '12px', fontSize: '0.78rem', color: '#64748b', textAlign: 'right' }}>
              Showing first 8 student cluster assignments
            </div>
          </div>
        )}

        {/* STEP 5: RESULTS & ANALYTICS */}
        {activeStep === 5 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '6px', backgroundColor: '#eff6ff', borderRadius: '6px', color: '#2563eb' }}>
                <PieIcon size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Step 5: Formed Study Groups & Distribution</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Final cluster-wise student count and summary</p>
              </div>
            </div>

            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' }}>
              K-Means has partitioned all {totalStudents} students into {groups.length} study groups based on feature similarity.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '20px', alignItems: 'center' }}>
              {/* Chart */}
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '10px' }}>Cluster Size Breakdown</h4>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <XAxis dataKey="group" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#ffffff', border: 'none' }}
                        formatter={(val) => [`${val} Students`, 'Size']}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Group overview pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600 }}>Formed Group Identities</h4>
                {groups.map((g) => (
                  <div 
                    key={g.group_id} 
                    style={{ 
                      padding: '10px 14px', 
                      background: '#f8fafc', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{g.group_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Focus: {g.dominant_focus}</div>
                    </div>
                    <span className="badge badge-intermediate">{g.student_count} members</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('groups')}
              >
                <span>Inspect Full Study Groups</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Beginner-Friendly Core Concepts Section (Crucial for College Presentation) */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <HelpCircle size={18} color="#2563eb" />
              Machine Learning Concepts Glossary
            </h3>
            <p className="card-subtitle">Quick reference cards for faculty questions during project demonstration</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
          
          <div style={{ padding: '18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              1. What is Clustering?
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
              Clustering is an <strong>unsupervised machine learning</strong> technique that groups unlabeled data points so that items in the same cluster are more similar to each other than to items in other clusters.
            </p>
          </div>

          <div style={{ padding: '18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              2. What is K-Means?
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
              K-Means is a popular partitioning algorithm that partitions <em>N</em> data points into <em>K</em> clusters. It minimizes the within-cluster sum of squared distances between points and their assigned centroid.
            </p>
          </div>

          <div style={{ padding: '18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              3. What is a Centroid?
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
              A centroid is the <strong>center coordinate</strong> of a cluster, calculated as the mathematical average (mean) of all the feature vectors currently assigned to that cluster.
            </p>
          </div>

          <div style={{ padding: '18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              4. Why K-Means for CampusCluster?
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
              K-Means naturally balances multiple heterogeneous attributes (subject preferences, skill levels, and schedule availability) without requiring manual matching rules or expensive labeled training datasets.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}


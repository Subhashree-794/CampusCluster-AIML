import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Users, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  BrainCircuit, 
  Sliders, 
  Info,
  Clock,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';

export default function GenerateGroups({ setActiveTab }) {
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [kValue, setKValue] = useState(4);
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(true);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setFetchingStudents(true);
        const data = await api.getStudents();
        setStudents(data);
        setTotalStudents(data.length);
        // Default recommended K based on total students (aiming for 3-5 students per group)
        if (data.length > 0) {
          const suggestedK = Math.max(2, Math.min(6, Math.round(data.length / 4)));
          setKValue(suggestedK);
        }
      } catch (err) {
        setError(`Failed to retrieve student pool: ${err.message}`);
      } finally {
        setFetchingStudents(false);
      }
    }
    loadData();
  }, []);

  const handleGenerate = async () => {
    setError(null);
    setSuccessResult(null);

    // Validation
    if (totalStudents === 0) {
      setError('Cannot generate groups because there are 0 registered students. Please add or load demo students first.');
      return;
    }
    if (totalStudents < 2) {
      setError('At least 2 students are required to form study groups.');
      return;
    }
    if (kValue > totalStudents) {
      setError(`Number of groups (${kValue}) cannot exceed the number of registered students (${totalStudents}).`);
      return;
    }
    if (kValue < 2) {
      setError('Number of groups must be at least 2.');
      return;
    }

    try {
      setLoading(true);
      const result = await api.generateGroups(kValue);
      setSuccessResult(result);
    } catch (err) {
      setError(err.message || 'An error occurred during K-Means clustering.');
    } finally {
      setLoading(false);
    }
  };

  // Generate list of selectable K options
  const maxK = Math.min(10, Math.max(2, totalStudents));
  const kOptions = [];
  for (let i = 2; i <= maxK; i++) {
    kOptions.push(i);
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      
      {/* Intro Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{
            width: '42px', 
            height: '42px', 
            borderRadius: '10px', 
            backgroundColor: '#eff6ff', 
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cpu size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI Study Group Formation Engine</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
              Unsupervised Machine Learning clustering powered by Python Scikit-Learn
            </p>
          </div>
        </div>

        <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: '1.6', marginTop: '12px' }}>
          This engine clusters students by finding mathematical centroids in a normalized multi-dimensional feature space. 
          Categorical attributes (Branch, Primary Subject, Secondary Subject, Study Time, Learning Goal) are One-Hot Encoded, 
          Skill Levels are numerically ranked (1 to 3), and features are standardized using <code>StandardScaler</code>.
        </p>
      </div>

      {/* Configuration & Action Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Sliders size={18} color="#2563eb" />
              Clustering Parameters
            </h3>
            <p className="card-subtitle">Select the number of study groups to partition students into</p>
          </div>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '28px' }}>
          
          {/* Stat 1: Available Students */}
          <div style={{
            padding: '20px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '0.85rem', marginBottom: '6px' }}>
              <Users size={16} /> Available Registered Students
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>
              {fetchingStudents ? '...' : totalStudents}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
              {totalStudents === 0 ? 'No students available. Please load demo students.' : 'Ready for feature extraction & vectorization'}
            </div>
          </div>

          {/* Stat 2: K Value Selector */}
          <div style={{
            padding: '20px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px'
          }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Layers size={16} color="#2563eb" />
              Target Number of Groups (K Clusters)
            </label>
            <select
              className="form-select"
              style={{ fontSize: '1.05rem', fontWeight: 600, padding: '10px 14px' }}
              value={kValue}
              onChange={(e) => setKValue(parseInt(e.target.value, 10))}
              disabled={loading || totalStudents < 2}
            >
              {kOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} Groups {totalStudents > 0 ? `(~${(totalStudents / opt).toFixed(1)} students/group)` : ''}
                </option>
              ))}
            </select>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
              Hyperparameter <code>n_clusters = {kValue}</code> passed to Scikit-Learn KMeans
            </div>
          </div>

        </div>

        {/* Informative Note */}
        <div style={{
          display: 'flex', 
          gap: '12px', 
          padding: '14px 18px', 
          backgroundColor: '#eff6ff', 
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          marginBottom: '28px',
          fontSize: '0.85rem',
          color: '#1e40af'
        }}>
          <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>How K-Means Works in CampusCluster:</strong> Scikit-Learn initializes {kValue} cluster centroids using <code>k-means++</code>, computes Euclidean distances for all student feature vectors, and iteratively minimizes inertia (within-cluster sum-of-squares).
          </div>
        </div>

        {/* Generate Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            className="btn btn-primary"
            style={{
              padding: '13px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              minWidth: '240px'
            }}
            onClick={handleGenerate}
            disabled={loading || totalStudents < 2}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Executing K-Means Algorithm...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Study Groups</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Success Notification & Navigation */}
      {successResult && (
        <div className="card" style={{
          border: '1px solid #a7f3d0',
          backgroundColor: '#f0fdf4',
          padding: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <CheckCircle size={32} color="#16a34a" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#065f46', fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
                Study Groups Successfully Generated!
              </h3>
              <p style={{ color: '#047857', fontSize: '0.92rem', marginBottom: '16px' }}>
                K-Means successfully partitioned <strong>{successResult.summary.total_students}</strong> students into <strong>{successResult.summary.groups_formed}</strong> cohesive study groups.
              </p>

              {/* Quick stats from execution */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>Algorithm Inertia</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{successResult.summary.inertia}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>Convergence Iterations</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{successResult.summary.iterations}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>Avg Students / Group</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{successResult.summary.avg_students_per_group}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab('groups')}
                >
                  <Users size={16} />
                  <span>View Generated Groups</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('simulation')}
                >
                  <BrainCircuit size={16} />
                  <span>View AI Simulation & Breakdown</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}


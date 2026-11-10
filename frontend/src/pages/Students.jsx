import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  Award, 
  Clock, 
  BookOpen, 
  X, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';

const BRANCH_OPTIONS = [
  'Computer Science',
  'Information Technology',
  'AI & Data Science',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering'
];

const SUBJECT_OPTIONS = [
  'Machine Learning',
  'Data Structures & Algorithms',
  'Web Development',
  'Cloud Computing',
  'Cybersecurity',
  'Database Systems',
  'Artificial Intelligence',
  'Computer Networks'
];

const SKILL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening'];
const GOAL_OPTIONS = [
  'Exam Preparation',
  'Project Collaboration',
  'Concept Mastery',
  'Competitive Coding',
  'Placement Prep'
];

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [notification, setNotification] = useState(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form states
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    branch: 'Computer Science',
    subject: 'Machine Learning',
    secondary_subject: '',
    skill_level: 'Intermediate',
    study_time: 'Morning',
    learning_goal: 'Concept Mastery'
  });
  const [formError, setFormError] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await api.getStudents();
      setStudents(data);
    } catch (err) {
      showNotification('error', `Failed to load students: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Demo Seeding
  const handleLoadDemo = async () => {
    try {
      setLoading(true);
      const res = await api.loadDemoStudents();
      setStudents(res.students);
      showNotification('success', `Loaded ${res.students.length} demo student profiles!`);
    } catch (err) {
      showNotification('error', `Failed to load demo data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      name: '',
      branch: 'Computer Science',
      subject: 'Machine Learning',
      secondary_subject: '',
      skill_level: 'Intermediate',
      study_time: 'Morning',
      learning_goal: 'Concept Mastery'
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name || '',
      branch: student.branch || 'Computer Science',
      subject: student.subject || 'Machine Learning',
      secondary_subject: student.secondary_subject === 'None' ? '' : (student.secondary_subject || ''),
      skill_level: student.skill_level || 'Intermediate',
      study_time: student.study_time || 'Morning',
      learning_goal: student.learning_goal || 'Concept Mastery'
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (student) => {
    setCurrentStudent(student);
    setIsDeleteModalOpen(true);
  };

  // Handle Form Change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Add Student
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Student name is required.');
      return;
    }
    try {
      const added = await api.addStudent(formData);
      setStudents((prev) => [...prev, added]);
      setIsAddModalOpen(false);
      showNotification('success', `Student "${added.name}" (${added.id}) created successfully.`);
    } catch (err) {
      setFormError(err.message || 'Failed to add student.');
    }
  };

  // Submit Edit Student
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Student name is required.');
      return;
    }
    try {
      const updated = await api.updateStudent(currentStudent.id, formData);
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setIsEditModalOpen(false);
      showNotification('success', `Student "${updated.name}" updated successfully.`);
    } catch (err) {
      setFormError(err.message || 'Failed to update student.');
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!currentStudent) return;
    try {
      await api.deleteStudent(currentStudent.id);
      setStudents((prev) => prev.filter((s) => s.id !== currentStudent.id));
      setIsDeleteModalOpen(false);
      showNotification('success', `Student "${currentStudent.name}" deleted.`);
      setCurrentStudent(null);
    } catch (err) {
      showNotification('error', `Failed to delete student: ${err.message}`);
    }
  };

  // Filter students based on search and subject
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || student.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div>
      {/* Toast / Notification Banner */}
      {notification && (
        <div className={`alert-box alert-${notification.type}`} style={{ display: 'flex', alignItems: 'center' }}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)} 
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Controls Card */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search and Filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: '1', minWidth: '300px' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
              <Filter size={16} color="#64748b" />
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="All">All Subjects ({students.length})</option>
                {SUBJECT_OPTIONS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={handleLoadDemo} title="Seed 20 realistic student profiles">
              <RefreshCw size={15} />
              <span>Load Demo Students</span>
            </button>
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={16} />
              <span>Add Student</span>
            </button>
          </div>

        </div>
      </div>

      {/* Student Table Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              Enrolled Students ({filteredStudents.length} of {students.length})
            </h3>
            <p className="card-subtitle">
              Student pool evaluated by K-Means algorithm for group formation
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px 0' }}>
            <div className="spinner" style={{ borderTopColor: '#2563eb', borderColor: '#bfdbfe' }}></div>
            <span style={{ marginLeft: '12px', color: '#64748b' }}>Loading student records...</span>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Branch</th>
                  <th>Subject of Interest</th>
                  <th>Secondary Subject</th>
                  <th>Skill Level</th>
                  <th>Study Time</th>
                  <th>Learning Goal</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  const skill = (s.skill_level || 'Intermediate').toLowerCase();
                  const skillBadgeClass = 
                    skill === 'beginner' ? 'badge-beginner' : 
                    skill === 'advanced' ? 'badge-advanced' : 'badge-intermediate';

                  return (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#2563eb' }}>
                        {s.id}
                      </td>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>
                        <span className="badge badge-branch">{s.branch}</span>
                      </td>
                      <td>
                        <span className="badge badge-subject">{s.subject}</span>
                      </td>
                      <td style={{ color: s.secondary_subject && s.secondary_subject !== 'None' ? '#334155' : '#94a3b8' }}>
                        {s.secondary_subject && s.secondary_subject !== 'None' ? s.secondary_subject : '—'}
                      </td>
                      <td>
                        <span className={`badge ${skillBadgeClass}`}>
                          <Award size={11} /> {s.skill_level}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-time">
                          <Clock size={11} /> {s.study_time}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.84rem' }}>
                        {s.learning_goal}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 8px' }}
                            title="Edit Student"
                            onClick={() => openEditModal(s)}
                          >
                            <Edit2 size={13} color="#2563eb" />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 8px' }}
                            title="Delete Student"
                            onClick={() => openDeleteModal(s)}
                          >
                            <Trash2 size={13} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
            <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '8px' }}>
              No students found matching your criteria.
            </p>
            <p style={{ fontSize: '0.85rem', marginBottom: '20px', color: '#94a3b8' }}>
              Try adjusting your search filter or click "Load Demo Students" to populate 20 diverse profiles.
            </p>
            <button className="btn btn-primary btn-sm" onClick={handleLoadDemo}>
              <RefreshCw size={13} /> Load 20 Demo Students
            </button>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Register New Student</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="alert-box alert-error" style={{ marginBottom: '16px' }}>
                    {formError}
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Branch / Department *</label>
                    <select
                      name="branch"
                      className="form-select"
                      value={formData.branch}
                      onChange={handleFormChange}
                    >
                      {BRANCH_OPTIONS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject of Interest *</label>
                    <select
                      name="subject"
                      className="form-select"
                      value={formData.subject}
                      onChange={handleFormChange}
                    >
                      {SUBJECT_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Secondary Subject (Optional)</label>
                    <input
                      type="text"
                      name="secondary_subject"
                      className="form-input"
                      placeholder="e.g. Python, Deep Learning, etc."
                      value={formData.secondary_subject}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Skill Level *</label>
                    <select
                      name="skill_level"
                      className="form-select"
                      value={formData.skill_level}
                      onChange={handleFormChange}
                    >
                      {SKILL_OPTIONS.map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Study Time *</label>
                    <select
                      name="study_time"
                      className="form-select"
                      value={formData.study_time}
                      onChange={handleFormChange}
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Learning Goal *</label>
                    <select
                      name="learning_goal"
                      className="form-select"
                      value={formData.learning_goal}
                      onChange={handleFormChange}
                    >
                      {GOAL_OPTIONS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && currentStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Student: {currentStudent.id}</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="alert-box alert-error" style={{ marginBottom: '16px' }}>
                    {formError}
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Branch / Department *</label>
                    <select
                      name="branch"
                      className="form-select"
                      value={formData.branch}
                      onChange={handleFormChange}
                    >
                      {BRANCH_OPTIONS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject of Interest *</label>
                    <select
                      name="subject"
                      className="form-select"
                      value={formData.subject}
                      onChange={handleFormChange}
                    >
                      {SUBJECT_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Secondary Subject (Optional)</label>
                    <input
                      type="text"
                      name="secondary_subject"
                      className="form-input"
                      value={formData.secondary_subject}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Skill Level *</label>
                    <select
                      name="skill_level"
                      className="form-select"
                      value={formData.skill_level}
                      onChange={handleFormChange}
                    >
                      {SKILL_OPTIONS.map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Study Time *</label>
                    <select
                      name="study_time"
                      className="form-select"
                      value={formData.study_time}
                      onChange={handleFormChange}
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Learning Goal *</label>
                    <select
                      name="learning_goal"
                      className="form-select"
                      value={formData.learning_goal}
                      onChange={handleFormChange}
                    >
                      {GOAL_OPTIONS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentStudent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ color: '#ef4444' }}>Confirm Student Deletion</h3>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Are you sure you want to remove <strong>{currentStudent.name}</strong> ({currentStudent.id})?
                This action will delete the profile from <code>students.json</code>.
              </p>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteConfirm}
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


/**
 * API Service for communicating with the Flask backend.
 * Supports direct calls to Flask (port 5000) or Vite proxy (/api).
 */

const API_BASE_URL = 'http://127.0.0.1:5000/api';

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && data.error) || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Health Check
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(res);
  },

  // Dashboard Stats
  async getStats() {
    const res = await fetch(`${API_BASE_URL}/stats`);
    return handleResponse(res);
  },

  // Students Management
  async getStudents() {
    const res = await fetch(`${API_BASE_URL}/students`);
    return handleResponse(res);
  },

  async addStudent(studentData) {
    const res = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    return handleResponse(res);
  },

  async updateStudent(studentId, studentData) {
    const res = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    return handleResponse(res);
  },

  async deleteStudent(studentId) {
    const res = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async loadDemoStudents() {
    const res = await fetch(`${API_BASE_URL}/students/demo`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Study Group Formation (K-Means)
  async generateGroups(k, customStudents = null) {
    const payload = { k: parseInt(k, 10) };
    if (customStudents && Array.isArray(customStudents)) {
      payload.students = customStudents;
    }
    const res = await fetch(`${API_BASE_URL}/generate-groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getLatestGroups() {
    const res = await fetch(`${API_BASE_URL}/groups`);
    return handleResponse(res);
  },
};


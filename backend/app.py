"""
app.py
======
Flask backend server for CampusCluster.
Provides RESTful APIs for student management, demo data seeding,
and Scikit-learn K-Means study group formation.
"""

import os
import json
import warnings
# Set LOKY_MAX_CPU_COUNT before imports to prevent joblib core count warning on Windows
os.environ["LOKY_MAX_CPU_COUNT"] = str(os.cpu_count() or 4)
warnings.filterwarnings("ignore")

from flask import Flask, request, jsonify
from flask_cors import CORS
from demo_data import DEMO_STUDENTS
from clustering import cluster_students

app = Flask(__name__)
# Enable CORS for all routes so Vite frontend can communicate seamlessly
CORS(app, resources={r"/api/*": {"origins": "*"}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STUDENTS_FILE = os.path.join(BASE_DIR, "students.json")
GROUPS_FILE = os.path.join(BASE_DIR, "groups.json")


def load_students_from_file():
    """Load students from students.json. If missing, initialize with DEMO_STUDENTS."""
    if not os.path.exists(STUDENTS_FILE):
        save_students_to_file(DEMO_STUDENTS)
        return DEMO_STUDENTS
    try:
        with open(STUDENTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading students: {e}")
        return []


def save_students_to_file(students):
    """Save students list to students.json."""
    with open(STUDENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(students, f, indent=2, ensure_ascii=False)


def load_groups_from_file():
    """Load latest generated groups from groups.json."""
    if not os.path.exists(GROUPS_FILE):
        return None
    try:
        with open(GROUPS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading groups: {e}")
        return None


def save_groups_to_file(groups_data):
    """Save latest generated groups to groups.json."""
    with open(GROUPS_FILE, "w", encoding="utf-8") as f:
        json.dump(groups_data, f, indent=2, ensure_ascii=False)


# Initialize students file if not exists
load_students_from_file()


# ==========================================
# REST API ENDPOINTS
# ==========================================

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "CampusCluster Backend",
        "ml_engine": "Scikit-Learn K-Means"
    }), 200


@app.route("/api/students", methods=["GET"])
def get_students():
    """Return all registered students."""
    students = load_students_from_file()
    return jsonify(students), 200


@app.route("/api/students", methods=["POST"])
def add_student():
    """Add a new student profile."""
    data = request.get_json() or {}
    
    # Validation
    required_fields = ["name", "branch", "subject", "skill_level", "study_time"]
    for field in required_fields:
        if not data.get(field) or str(data.get(field)).strip() == "":
            return jsonify({"error": f"Field '{field}' is required."}), 400
            
    students = load_students_from_file()
    
    # Generate unique Student ID
    existing_ids = [s.get("id", "") for s in students]
    next_num = 1
    while f"STU-{next_num:03d}" in existing_ids:
        next_num += 1
    new_id = data.get("id") or f"STU-{next_num:03d}"
    
    new_student = {
        "id": new_id,
        "name": data.get("name").strip(),
        "branch": data.get("branch").strip(),
        "subject": data.get("subject").strip(),
        "secondary_subject": data.get("secondary_subject", "").strip() or "None",
        "skill_level": data.get("skill_level", "Intermediate").strip(),
        "study_time": data.get("study_time", "Morning").strip(),
        "learning_goal": data.get("learning_goal", "Concept Mastery").strip()
    }
    
    students.append(new_student)
    save_students_to_file(students)
    return jsonify(new_student), 201


@app.route("/api/students/<student_id>", methods=["PUT"])
def update_student(student_id):
    """Update student information by ID."""
    data = request.get_json() or {}
    students = load_students_from_file()
    
    student_index = None
    for idx, s in enumerate(students):
        if str(s.get("id")) == str(student_id):
            student_index = idx
            break
            
    if student_index is None:
        return jsonify({"error": f"Student with ID '{student_id}' not found."}), 404
        
    # Update fields
    target = students[student_index]
    target["name"] = data.get("name", target.get("name")).strip()
    target["branch"] = data.get("branch", target.get("branch")).strip()
    target["subject"] = data.get("subject", target.get("subject")).strip()
    target["secondary_subject"] = data.get("secondary_subject", target.get("secondary_subject", "None")).strip()
    target["skill_level"] = data.get("skill_level", target.get("skill_level")).strip()
    target["study_time"] = data.get("study_time", target.get("study_time")).strip()
    target["learning_goal"] = data.get("learning_goal", target.get("learning_goal")).strip()
    
    students[student_index] = target
    save_students_to_file(students)
    return jsonify(target), 200


@app.route("/api/students/<student_id>", methods=["DELETE"])
def delete_student(student_id):
    """Delete a student by ID."""
    students = load_students_from_file()
    initial_len = len(students)
    students = [s for s in students if str(s.get("id")) != str(student_id)]
    
    if len(students) == initial_len:
        return jsonify({"error": f"Student with ID '{student_id}' not found."}), 404
        
    save_students_to_file(students)
    return jsonify({"message": f"Student '{student_id}' deleted successfully."}), 200


@app.route("/api/students/demo", methods=["POST"])
def load_demo_students():
    """Populate and overwrite students list with 20 rich sample students."""
    save_students_to_file(DEMO_STUDENTS)
    return jsonify({
        "message": f"Successfully loaded {len(DEMO_STUDENTS)} demo students.",
        "students": DEMO_STUDENTS
    }), 200


@app.route("/api/generate-groups", methods=["POST"])
def generate_groups():
    """
    Receive student data and selected number of groups (k).
    Executes Scikit-learn K-Means clustering algorithm.
    Saves and returns generated groups along with AI simulation steps.
    """
    body = request.get_json() or {}
    
    try:
        k = int(body.get("k", 3))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid 'k' value. Must be an integer."}), 400
        
    # If custom student array is sent, use it; otherwise read current stored students
    students = body.get("students")
    if students is None:
        students = load_students_from_file()
        
    if not isinstance(students, list) or len(students) == 0:
        return jsonify({"error": "No students available to form groups. Please add or load students first."}), 400
        
    if k < 2:
        return jsonify({"error": "Number of groups (k) must be at least 2."}), 400
        
    if k > len(students):
        return jsonify({
            "error": f"Cannot create {k} groups with only {len(students)} students. Groups cannot exceed student count."
        }), 400
        
    try:
        result = cluster_students(students, k)
        # Persist generated groups
        save_groups_to_file(result)
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"Clustering failed: {str(e)}"}), 500


@app.route("/api/groups", methods=["GET"])
def get_groups():
    """Return latest generated groups."""
    groups_data = load_groups_from_file()
    if groups_data is None:
        return jsonify({
            "groups": [],
            "summary": {
                "total_students": 0,
                "k": 0,
                "groups_formed": 0,
                "avg_students_per_group": 0
            },
            "simulation": None
        }), 200
    return jsonify(groups_data), 200


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Dashboard statistics calculated dynamically from real application data."""
    students = load_students_from_file()
    groups_data = load_groups_from_file()
    
    total_students = len(students)
    subjects = list(set([s.get("subject", "").strip() for s in students if s.get("subject")]))
    branches = list(set([s.get("branch", "").strip() for s in students if s.get("branch")]))
    
    # Subject breakdown
    subject_counts = {}
    for s in students:
        subj = s.get("subject", "Other")
        subject_counts[subj] = subject_counts.get(subj, 0) + 1
    subject_distribution = [{"subject": k, "count": v} for k, v in subject_counts.items()]
    
    # Groups info
    groups_formed = 0
    avg_per_group = 0
    latest_groups = []
    if groups_data and "groups" in groups_data:
        latest_groups = groups_data.get("groups", [])
        groups_formed = len(latest_groups)
        if groups_formed > 0:
            avg_per_group = round(total_students / groups_formed, 1)
            
    return jsonify({
        "total_students": total_students,
        "total_groups_formed": groups_formed,
        "avg_students_per_group": avg_per_group,
        "total_subjects": len(subjects),
        "total_branches": len(branches),
        "subject_distribution": subject_distribution,
        "recent_students": students[-5:] if total_students > 5 else students,
        "latest_groups": latest_groups
    }), 200


if __name__ == "__main__":
    print("Starting CampusCluster Flask server on http://127.0.0.1:5000 ...")
    app.run(host="127.0.0.1", port=5000, debug=True)


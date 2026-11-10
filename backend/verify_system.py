"""
verify_system.py
================
Automated integration test verifying all Flask backend endpoints,
data persistence in JSON, and Scikit-learn K-Means execution.
"""

import sys
import os
import json

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, load_students_from_file

def run_tests():
    print("=" * 60)
    print("RUNNING CAMPUSCLUSTER BACKEND INTEGRATION TESTS")
    print("=" * 60)
    
    client = app.test_client()
    
    # 1. Test Health Check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    print("[PASS] 1. GET /api/health:", res.json["service"], res.json["status"])
    
    # 2. Test Seed Demo Students
    res = client.post("/api/students/demo")
    assert res.status_code == 200, f"Demo load failed: {res.status_code}"
    students = res.json["students"]
    assert len(students) == 20, f"Expected 20 demo students, got {len(students)}"
    print(f"[PASS] 2. POST /api/students/demo: Loaded {len(students)} demo students")
    
    # 3. Test GET /api/students
    res = client.get("/api/students")
    assert res.status_code == 200
    assert len(res.json) == 20
    print(f"[PASS] 3. GET /api/students: Retrieved {len(res.json)} records")
    
    # 4. Test POST /api/students (Add new student)
    new_student_data = {
        "name": "Arunabh Mukherjee",
        "branch": "Computer Science",
        "subject": "Cybersecurity",
        "secondary_subject": "Ethical Hacking",
        "skill_level": "Intermediate",
        "study_time": "Evening",
        "learning_goal": "Project Collaboration"
    }
    res = client.post("/api/students", json=new_student_data)
    assert res.status_code == 201, f"Failed to add student: {res.status_code}"
    added_student = res.json
    assert added_student["name"] == "Arunabh Mukherjee"
    added_id = added_student["id"]
    print(f"[PASS] 4. POST /api/students: Created student {added_id} ({added_student['name']})")
    
    # 5. Test PUT /api/students/:id (Update student)
    updated_payload = {
        "name": "Arunabh Mukherjee",
        "branch": "AI & Data Science",
        "subject": "Machine Learning",
        "secondary_subject": "Deep Learning",
        "skill_level": "Advanced",
        "study_time": "Morning",
        "learning_goal": "Exam Preparation"
    }
    res = client.put(f"/api/students/{added_id}", json=updated_payload)
    assert res.status_code == 200
    assert res.json["branch"] == "AI & Data Science"
    assert res.json["skill_level"] == "Advanced"
    print(f"[PASS] 5. PUT /api/students/{added_id}: Updated branch to AI & Data Science and skill to Advanced")
    
    # 6. Test DELETE /api/students/:id
    res = client.delete(f"/api/students/{added_id}")
    assert res.status_code == 200
    print(f"[PASS] 6. DELETE /api/students/{added_id}: Deleted successfully")
    
    # 7. Test POST /api/generate-groups (Scikit-Learn K-Means)
    res = client.post("/api/generate-groups", json={"k": 4})
    assert res.status_code == 200, f"Generate groups failed: {res.json}"
    result = res.json
    assert "groups" in result
    assert len(result["groups"]) == 4
    assert "simulation" in result
    print(f"[PASS] 7. POST /api/generate-groups: Created 4 clusters with Scikit-learn KMeans!")
    print(f"       Inertia: {result['summary']['inertia']}, Iterations: {result['summary']['iterations']}")
    for g in result["groups"]:
        print(f"       - Group {g['group_id']}: {g['student_count']} students | Focus: {g['dominant_focus']} | Preferred Time: {g['preferred_time']}")
        
    # 8. Test GET /api/groups
    res = client.get("/api/groups")
    assert res.status_code == 200
    assert len(res.json["groups"]) == 4
    print(f"[PASS] 8. GET /api/groups: Retrieved persisted study groups from JSON")
    
    # 9. Test GET /api/stats
    res = client.get("/api/stats")
    assert res.status_code == 200
    stats = res.json
    assert stats["total_students"] == 20
    assert stats["total_groups_formed"] == 4
    assert stats["avg_students_per_group"] == 5.0
    print(f"[PASS] 9. GET /api/stats: Verified real stats (Total: {stats['total_students']}, Groups: {stats['total_groups_formed']}, Avg: {stats['avg_students_per_group']})")
    
    # 10. Test Validation Edge Cases
    # a. K > total students
    res = client.post("/api/generate-groups", json={"k": 50})
    assert res.status_code == 400
    print(f"[PASS] 10a. Validation: K > students rejected with 400: '{res.json['error']}'")
    
    # b. K < 2
    res = client.post("/api/generate-groups", json={"k": 1})
    assert res.status_code == 400
    print(f"[PASS] 10b. Validation: K < 2 rejected with 400: '{res.json['error']}'")
    
    print("\n" + "=" * 60)
    print("ALL 10 TESTS PASSED SUCCESSFULLY! BACKEND IS ROBUST.")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()


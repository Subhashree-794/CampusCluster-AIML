"""
clustering.py
=============
Performs student feature preprocessing and K-Means clustering using Scikit-learn.
Strictly adheres to project requirements:
- Ordinal mapping for skill levels (Beginner=1, Intermediate=2, Advanced=3)
- One-Hot Encoding for categorical attributes (Branch, Subject, Preferred Study Time, Learning Goal)
- StandardScaler normalization
- Scikit-learn KMeans(n_clusters=k, random_state=42, n_init=10)
- Detailed cluster profiling and AI simulation diagnostic data
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from collections import Counter


SKILL_MAP = {
    "Beginner": 1.0,
    "Intermediate": 2.0,
    "Advanced": 3.0
}


def preprocess_students(students):
    """
    Preprocess student dictionaries into a numerical feature matrix.
    
    1. Extracts 'skill_level' and maps to 1, 2, 3.
    2. Uses Pandas get_dummies (One-Hot Encoding) for categorical columns:
       - branch
       - subject
       - study_time
       - learning_goal
       (and secondary_subject if present and not 'None')
    3. Normalizes numerical features using StandardScaler.
    
    Returns:
        scaled_matrix (np.ndarray): Scaled feature matrix for clustering
        raw_feature_df (pd.DataFrame): Dataframe before scaling for explanation/simulation
        feature_names (list): List of feature column names
        scaler (StandardScaler): Fitted scaler
    """
    df = pd.DataFrame(students)
    
    # 1. Map Skill Level to numerical value
    # Default to 2 (Intermediate) if missing or unknown
    df['skill_num'] = df['skill_level'].map(lambda x: SKILL_MAP.get(str(x).capitalize(), 2.0))
    
    # Base numerical dataframe
    features_df = pd.DataFrame(index=df.index)
    features_df['skill_level_score'] = df['skill_num']
    
    # 2. One-Hot Encoding for categorical features
    cat_columns = ['branch', 'subject', 'study_time', 'learning_goal']
    
    for col in cat_columns:
        if col in df.columns:
            # Clean string values
            cleaned_col = df[col].fillna('Unknown').astype(str).str.strip()
            dummies = pd.get_dummies(cleaned_col, prefix=col, dtype=float)
            features_df = pd.concat([features_df, dummies], axis=1)
            
    # Include secondary subject as one-hot if present
    if 'secondary_subject' in df.columns:
        # Filter out 'None' or empty
        sec_clean = df['secondary_subject'].fillna('None').astype(str).str.strip()
        # Only add dummy columns for valid secondary subjects
        dummies_sec = pd.get_dummies(sec_clean, prefix='sec_subj', dtype=float)
        # Drop sec_subj_None if it exists to keep matrix clean
        if 'sec_subj_None' in dummies_sec.columns:
            dummies_sec = dummies_sec.drop(columns=['sec_subj_None'])
        if not dummies_sec.empty:
            features_df = pd.concat([features_df, dummies_sec], axis=1)

    feature_names = list(features_df.columns)
    
    # 3. Apply StandardScaler
    scaler = StandardScaler()
    scaled_matrix = scaler.fit_transform(features_df)
    
    return scaled_matrix, features_df, feature_names, scaler


def cluster_students(students, k):
    """
    Validates inputs and executes KMeans clustering.
    
    Parameters:
        students (list): List of student dicts
        k (int): Number of clusters to form
        
    Returns:
        dict: Containing 'groups', 'simulation', 'summary', and 'k'
    """
    total_students = len(students)
    
    if total_students == 0:
        raise ValueError("Cannot form groups with 0 students. Please add or load students first.")
    
    if k < 2:
        raise ValueError("Number of groups (k) must be at least 2.")
        
    if k > total_students:
        raise ValueError(
            f"Number of groups ({k}) cannot exceed the number of registered students ({total_students})."
        )
        
    # Preprocess
    scaled_matrix, raw_feature_df, feature_names, scaler = preprocess_students(students)
    
    # Apply Scikit-learn KMeans as strictly instructed:
    # KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(scaled_matrix)
    
    # Calculate distances to assigned centroid for simulation/depth
    centroids = kmeans.cluster_centers_
    distances = np.linalg.norm(scaled_matrix - centroids[cluster_labels], axis=1)
    
    # Structure groups
    groups = []
    cluster_assignments_sim = []
    
    for cluster_id in range(k):
        # Indices of students in this cluster
        indices = np.where(cluster_labels == cluster_id)[0]
        group_members = [students[i] for i in indices]
        
        # Calculate cluster specific statistics
        subjects_counter = Counter([s.get('subject', 'N/A') for s in group_members])
        skills_counter = Counter([s.get('skill_level', 'Intermediate') for s in group_members])
        times_counter = Counter([s.get('study_time', 'Flexible') for s in group_members])
        branches_counter = Counter([s.get('branch', 'General') for s in group_members])
        goals_counter = Counter([s.get('learning_goal', 'General') for s in group_members])
        
        # Top subjects sorted by frequency
        top_subjects = [
            {"subject": subj, "count": count, "percentage": round((count / len(group_members)) * 100, 1)}
            for subj, count in subjects_counter.most_common()
        ]
        
        # Dominant subject label
        dominant_subject = top_subjects[0]["subject"] if top_subjects else "Interdisciplinary"
        dominant_time = times_counter.most_common(1)[0][0] if times_counter else "Flexible"
        
        group_data = {
            "group_id": cluster_id + 1,
            "group_name": f"Study Group {cluster_id + 1}",
            "dominant_focus": dominant_subject,
            "preferred_time": dominant_time,
            "student_count": len(group_members),
            "members": group_members,
            "subject_distribution": dict(subjects_counter),
            "top_subjects": top_subjects,
            "skill_distribution": {
                "Beginner": skills_counter.get("Beginner", 0),
                "Intermediate": skills_counter.get("Intermediate", 0),
                "Advanced": skills_counter.get("Advanced", 0)
            },
            "time_distribution": dict(times_counter),
            "branch_distribution": dict(branches_counter),
            "goal_distribution": dict(goals_counter)
        }
        groups.append(group_data)
        
    for idx, (student, cluster_id, dist) in enumerate(zip(students, cluster_labels, distances)):
        cluster_assignments_sim.append({
            "student_id": student.get("id", f"STU-{idx+1:03d}"),
            "student_name": student.get("name", "Student"),
            "assigned_group": int(cluster_id) + 1,
            "distance_to_centroid": round(float(dist), 3)
        })
        
    # AI Simulation Data payload for Step-by-Step educational explanation
    # Take sample of up to 5 students for clean matrix preview
    sample_size = min(5, total_students)
    sample_raw_features = []
    sample_scaled_features = []
    
    for i in range(sample_size):
        row_raw = {
            "student_id": students[i].get("id"),
            "name": students[i].get("name"),
            "values": [round(float(v), 2) for v in raw_feature_df.iloc[i].values]
        }
        row_scaled = {
            "student_id": students[i].get("id"),
            "name": students[i].get("name"),
            "values": [round(float(v), 2) for v in scaled_matrix[i]]
        }
        sample_raw_features.append(row_raw)
        sample_scaled_features.append(row_scaled)
        
    simulation_data = {
        "k": k,
        "total_students": total_students,
        "n_features": len(feature_names),
        "feature_names": feature_names,
        "sample_raw_features": sample_raw_features,
        "sample_scaled_features": sample_scaled_features,
        "inertia": round(float(kmeans.inertia_), 2),
        "n_iter": int(kmeans.n_iter_),
        "cluster_assignments": cluster_assignments_sim,
        "cluster_sizes": [
            {"group": f"Group {g['group_id']}", "count": g['student_count']}
            for g in groups
        ],
        "algorithm_specs": {
            "name": "K-Means (Scikit-Learn)",
            "n_clusters": k,
            "init_method": "k-means++",
            "n_init": 10,
            "random_state": 42,
            "distance_metric": "Euclidean Distance"
        }
    }
    
    summary = {
        "total_students": total_students,
        "k": k,
        "groups_formed": len(groups),
        "avg_students_per_group": round(total_students / k, 1),
        "inertia": round(float(kmeans.inertia_), 2),
        "iterations": int(kmeans.n_iter_)
    }
    
    return {
        "groups": groups,
        "simulation": simulation_data,
        "summary": summary
    }


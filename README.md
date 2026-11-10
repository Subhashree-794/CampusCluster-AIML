# CampusCluster – AI-Powered Study Group Formation System

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1.2-000000?style=flat&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-K--Means-F7931E?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

An intelligent peer-study group formation platform designed for college Artificial Intelligence mini-projects and academic demonstrations. **CampusCluster** uses unsupervised machine learning (**K-Means Clustering via Scikit-Learn**) to mathematically group students into high-cohesion study teams based on academic branch, subject preferences, skill proficiencies, and schedule availability.

---

## 1. Project Introduction

Collaborative peer learning significantly improves student academic performance and retention. However, traditional manual group assignment or random pairing often groups together students with mismatched study times, conflicting learning goals, or unrelated subject interests.

**CampusCluster** automates and optimizes study group formation using unsupervised machine learning. It transforms qualitative student profiles into normalized multi-dimensional vectors and partitions them into cohesive study clusters where students share common academic goals, compatible proficiency levels, and harmonized study schedules.

---

## 2. Problem Statement

Manual group allocation in colleges suffers from:
1. **Schedule Incompatibility**: Students assigned together have conflicting free hours (e.g., Morning vs. Evening).
2. **Subject Disparity**: Students forced into groups where members are studying different core topics.
3. **Skill Imbalance**: Without visibility into skill levels, beginners feel overwhelmed or advanced students feel slowed down.
4. **Administrative Overhead**: Manually sorting through hundreds of student survey forms is tedious and unscalable.

---

## 3. Project Objectives

- Provide a student management dashboard where students can register their department, subject interests, proficiency levels, and preferred study times.
- Implement an automated ML pipeline in Python using **Scikit-Learn's K-Means clustering**.
- Provide an educational, step-by-step **AI Simulation** interface to visually demonstrate to faculty how text data is vectorized and clustered.
- Eliminate dependency on external paid APIs or cloud databases by using local, lightweight JSON persistence.
- Present a clean, modern SaaS dashboard user interface designed with React and Recharts.

---

## 4. Technologies Used Strictly

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend Framework** | React.js (v18) with Vite | Modern single-page web UI |
| **Frontend Styling** | Custom CSS (Modern SaaS theme) | Professional slate/navy dashboard aesthetic |
| **UI Line Icons** | Lucide React | Clean, scalable line icons |
| **Data Visualization** | Recharts | Responsive bar and distribution charts |
| **Backend Server** | Python Flask & Flask-CORS | REST API handling persistence and orchestration |
| **Machine Learning Engine** | Scikit-Learn (`KMeans`, `StandardScaler`) | Unsupervised vector clustering |
| **Data Processing** | Pandas & NumPy | Feature matrix transformation & one-hot encoding |
| **Data Persistence** | Local JSON files (`students.json`, `groups.json`) | File-based lightweight storage |

> **No paid APIs, Firebase, or cloud databases are required.** The application runs 100% locally on Windows.

---

## 5. How K-Means is Implemented in CampusCluster

The clustering pipeline in `backend/clustering.py` follows a 4-stage machine learning workflow:

```
[Student JSON Records] 
       │
       ▼
[1. Ordinal Encoding + One-Hot Encoding (Pandas)]
       │
       ▼
[2. Feature Standardization (StandardScaler)]
       │
       ▼
[3. Scikit-Learn KMeans(n_clusters=k, random_state=42, n_init=10)]
       │
       ▼
[4. Cluster Assignment & Centroid Distance Metrics]
       │
       ▼
[Formed Study Groups & Simulation Data returned to React]
```

### Stage 1: Feature Extraction & Encoding
- **Ordinal Skill Mapping**: Skill levels are converted into sequential numeric ratings:
  - $\text{Beginner} = 1.0$
  - $\text{Intermediate} = 2.0$
  - $\text{Advanced} = 3.0$
- **One-Hot Encoding**: Categorical variables (`branch`, `subject`, `secondary_subject`, `study_time`, `learning_goal`) are transformed into binary feature columns (0.0 or 1.0) using `pandas.get_dummies()`.

### Stage 2: Feature Standardization
Because one-hot encoded flags have binary ranges while mapped skill levels span from 1 to 3, `StandardScaler` standardizes each feature column:
$$z = \frac{x - \mu}{\sigma}$$
This prevents features with larger numerical ranges from disproportionately dominating Euclidean distance calculations.

### Stage 3: K-Means Execution
The clustering model is instantiated and executed strictly via Scikit-Learn:
```python
from sklearn.cluster import KMeans

kmeans = KMeans(
    n_clusters=k,       # Selected number of study groups
    init="k-means++",   # Intelligent initial centroid spreading
    n_init=10,          # Runs with 10 different centroid seeds
    random_state=42     # Deterministic reproducibility
)
cluster_labels = kmeans.fit_predict(scaled_feature_matrix)
```

### Stage 4: Distance to Centroid
For each student vector $x_i$ and assigned cluster center $c_j$, the Euclidean distance is computed:
$$d(x_i, c_j) = \sqrt{\sum_{f=1}^{M} (x_{i, f} - c_{j, f})^2}$$
This indicates how closely a student matches the central archetype of their assigned group.

---

## 6. Project Folder Structure

```
CampusCluster/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation bar with quick triggers
│   │   │   └── Sidebar.jsx         # Left navigation menu and engine status
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Overview metrics, charts, & recent entries
│   │   │   ├── Students.jsx        # CRUD management, demo loader, & search
│   │   │   ├── GenerateGroups.jsx  # K-Means execution interface & validation
│   │   │   ├── StudyGroups.jsx     # Formed group cards, profiles, & members
│   │   │   └── AiSimulation.jsx    # 5-step faculty presentation walkthrough
│   │   ├── services/
│   │   │   └── api.js              # Centralized backend HTTP client
│   │   ├── App.jsx                 # Main application layout and router
│   │   ├── main.jsx                # React root mount
│   │   └── index.css               # Modern SaaS design system CSS
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/
│   ├── app.py                      # Flask REST API server
│   ├── clustering.py               # Scikit-learn K-Means implementation
│   ├── demo_data.py                # 20 pre-configured diverse demo students
│   ├── students.json               # Persistent student records
│   ├── groups.json                 # Persistent generated study groups
│   ├── verify_system.py            # Automated test suite (10 test cases)
│   └── requirements.txt            # Python dependencies
│
└── README.md
```

---

## 7. Installation Instructions (Windows PowerShell)

Ensure you have **Python 3.10+** and **Node.js 18+** installed on your system.

### Step 1: Clone or Navigate to the Project
```powershell
cd c:\Users\SUBHASHREE\Desktop\CampusCluster
```

### Step 2: Install Backend Dependencies
Open a PowerShell terminal and install the required Python packages:
```powershell
pip install -r backend/requirements.txt
```

### Step 3: Install Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

---

## 8. Starting the Application

You will run the backend and the frontend in two separate terminal windows.

### Terminal 1: Start Python Flask Backend
In PowerShell:
```powershell
cd c:\Users\SUBHASHREE\Desktop\CampusCluster\backend
python app.py
```
*Output confirmation:*
```
Starting CampusCluster Flask server on http://127.0.0.1:5000 ...
* Running on http://127.0.0.1:5000
```

### Terminal 2: Start Vite Frontend
In a second PowerShell window:
```powershell
cd c:\Users\SUBHASHREE\Desktop\CampusCluster\frontend
npm run dev
```
*Output confirmation:*
```
  VITE v5.4.21  ready in 320 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 9. Faculty Demonstration Workflow (Step-by-Step)

Follow this 5-minute presentation script during your college mini-project review:

1. **Dashboard Overview (`/dashboard`)**:
   - Show the 4 live statistical cards: *Total Registered Students*, *Total Groups Formed*, *Average Students per Group*, and *Number of Subjects*.
   - Point out the **Subject Distribution Bar Chart** and note that all numbers update dynamically from backend data.

2. **Student Management (`/students`)**:
   - Click the **"Load Demo Students"** button. Explain that this populates 20 realistic student profiles with varied subjects, branches, skill levels (Beginner, Intermediate, Advanced), and study times (Morning, Afternoon, Evening).
   - Demonstrate adding a new student using the **"Add Student"** modal.
   - Show the live search bar and subject filter dropdown.

3. **Generating Study Groups with K-Means (`/generate`)**:
   - Navigate to the **"Generate Groups"** tab.
   - Explain the choice of hyperparameter $K$ (e.g., $K = 4$ groups for 20 students).
   - Click **"Generate Study Groups"**.
   - Explain what just happened behind the scenes:
     1. Student records were transmitted to Flask.
     2. Ordinal features were ranked and categorical features were One-Hot Encoded.
     3. Features were scaled using `StandardScaler`.
     4. `KMeans(n_clusters=4, random_state=42, n_init=10)` formed 4 clusters based on Euclidean similarity.
   - Note the reported convergence statistics: *Inertia* and *Iterations*.

4. **Inspecting Formed Study Groups (`/groups`)**:
   - Review each generated group card:
     - **Dominant Focus** (e.g. *Machine Learning*, *Web Development*, *Cloud Computing*).
     - **Harmonized Study Slot** (e.g. *Morning*, *Evening*).
     - **Skill Breakdown** (distribution of Beginners, Intermediates, and Advanced peers).
   - Click **"View Members"** on any card to show the student roster.
   - Highlight the scientific note: *K-Means groups students by feature similarity; it does not force artificially identical cluster sizes.*

5. **AI Simulation & Concept Defense (`/simulation`)**:
   - Walk through the interactive 5-step stepper:
     - **Step 1 (Input Data)**: Showing raw qualitative student preferences.
     - **Step 2 (Feature Extraction)**: Explaining how categorical text turns into mathematical vectors ($1.0, 0.0$) and skill ranks ($1, 2, 3$).
     - **Step 3 (K-Means Clustering)**: Highlighting Euclidean distance $d(x, c)$ and iterative centroid re-centering.
     - **Step 4 (Group Assignment)**: Pointing to the Euclidean distance of individual students to their group centroid.
     - **Step 5 (Results)**: Showing cluster size chart and dominant subject profiles.
   - Review the bottom **Machine Learning Concepts Glossary** cards (*What is K-Means?*, *What is a Centroid?*, *What is Clustering?*, *Why K-Means for CampusCluster?*) to answer any examiner questions with confidence.

---

## 10. Automated Test Verification

To run the automated backend test suite, run:
```powershell
python backend/verify_system.py
```
This tests all 10 REST endpoints, CRUD operations, Scikit-learn clustering execution, JSON persistence, and edge-case validation checks.


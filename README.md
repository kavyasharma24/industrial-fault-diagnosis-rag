# AI-Driven Industrial Knowledge Intelligence using Graph-Enhanced Agentic RAG for Industrial Fault Diagnosis

An end-to-end, multi-modal industrial decision-support system designed for predictive maintenance and fault diagnosis in milling machines. This system combines **Supervised Machine Learning (XGBoost)**, **Dense Vector Retrieval-Augmented Generation (FAISS + Sentence-Transformers)**, a **Deterministic Knowledge Graph (NetworkX)**, and an **Agentic Reasoning Engine (Groq LLM)** into a unified, high-performance Command Center built with **FastAPI** and **React 19 + TypeScript**.

---

## 1. Project Overview

Modern industrial manufacturing environments generate high-velocity telemetry from milling machines, CNC equipment, and robotic cutters. Traditional maintenance workflows suffer from a fundamental trade-off:
- **Black-box machine learning models** output failure probabilities without operational context, physical reasoning, or corrective action recommendations.
- **Pure Large Language Models (LLMs)** can hallucinate plausible-sounding but technically invalid physical failure causes.
- **Rigid rule-based expert systems** fail to account for non-linear statistical correlations and subtle multi-sensor degradation patterns.

This project implements a **4-tier hybrid intelligence pipeline** where statistical inferences, domain manuals, and deterministic physical laws mutually validate one another before generating an evidence-grounded diagnosis for human maintenance engineers.

> **Decision-Support Notice**:  
> All model predictions, knowledge graph rule evaluations, and LLM-synthesized recommendations produced by this system are designed strictly as **decision-support outputs** to assist qualified maintenance technicians and reliability engineers. They do not constitute guaranteed or autonomous machine diagnoses.

---

## 2. Problem Statement and Objectives

### Problem Statement
In automated milling operations, sensor telemetry (temperatures, rotational speed, torque, and tool wear) contains subtle signatures of imminent machine failures. However, raw probabilities alone cannot tell an engineer *why* a machine is overheating, *which* mechanical threshold was violated, or *what* remediation protocol should be followed according to factory standard operating procedures (SOPs).

### Objectives
1. **Accurate Statistical Inference**: Predict machine failure risk from real-time continuous sensor readings using an XGBoost binary classification model.
2. **Context-Enriched Dense Retrieval**: Retrieve relevant operational guides, boundary equations, and troubleshooting instructions from an indexed technical knowledge corpus using FAISS and MiniLM embeddings.
3. **Deterministic Physical Rule Validation**: Eliminate hallucinations by programmatically evaluating physical equations ($\Delta T$, process power limits, overstrain stress boundaries) across an authentic 27-node, 29-edge NetworkX Knowledge Graph.
4. **Agentic Synthesis**: Orchestrate and synthesize the telemetry, probability, retrieved manuals, and rule checks into a concise, auditable diagnostic report using a high-throughput Groq LLM agent.
5. **Interactive Industrial Command Center**: Deliver an 8-page, responsive, dark/light-theme dashboard for real-time sensor testing, interactive graph exploration, and session audit tracking.

---

## 3. Key Features

- **Multi-Modal Diagnosis Pipeline (`POST /diagnosis/analyze`)**: Executes statistical prediction, vector retrieval, graph traversal, and LLM reasoning in a single synchronous API call.
- **Standalone Diagnostic Microservices**: Dedicated endpoints for isolated ML inference (`POST /predict`) and standalone semantic knowledge search (`POST /knowledge/search`).
- **Authentic 27-Node Knowledge Graph Explorer**: Fully interactive SVG canvas supporting zoom, pan, node dragging, neighborhood highlight, and real-time failure propagation path illumination.
- **Dynamic Active Fault Highlighting**: Visual highlight rings and relationship paths for active failure modes (`evidence_condition_met`) with clear distinction for informational interval boundaries (such as tool wear replacement zones).
- **Interactive Telemetry Tuning**: Live slider controls for 5 physical parameters, pre-engineered benchmark test scenarios (Nominal, HDF, PWF, TWF, OSF), and real-time formula previews ($\Delta T$, Process Power, Overstrain).
- **Client Session History Audit Log**: Chronological audit trail stored locally in browser `localStorage` (`industrial_diagnosis_history`), supporting JSON export and 1-click telemetry reloading into the Live Diagnosis page.
- **Modern Soft Industrial UI**: Clean interface built with Tailwind CSS, supporting seamless Light and Dark themes with persistent local storage.

---

## 4. System Architecture & Workflow

### Architectural Diagram

```
                     +-------------------------------------------------+
                     |            Milling Machine Telemetry            |
                     |  (Air Temp, Proc Temp, Speed, Torque, Wear)     |
                     +-----------------------+-------------------------+
                                             |
                                             v
                     +-------------------------------------------------+
                     |            FastAPI Backend Gateway              |
                     |                 (Port 8000)                     |
                     +-----------------------+-------------------------+
                                             |
                   +-------------------------+-------------------------+
                   |                         |                         |
                   v                         v                         v
     +--------------------------+  +-------------------+  +--------------------------+
     |     1. Supervised ML     |  |   2. Dense RAG    |  |   3. Knowledge Graph     |
     |   XGBoost Classifier     |  |   FAISS + MiniLM  |  |   NetworkX Rules Engine  |
     |  (Failure Probability)   |  | (Manual Chunks)   |  | (Physical Limit Checks)  |
     +-------------+------------+  +---------+---------+  +------------+-------------+
                   |                         |                         |
                   +-------------------------+-------------------------+
                                             |
                                             v
                     +-------------------------------------------------+
                     |            4. Agentic Synthesis Engine          |
                     |          Groq API (openai/gpt-oss-20b)          |
                     |       (Strict Evidence-Grounded Synthesis)      |
                     +-----------------------+-------------------------+
                                             |
                                             v
                     +-------------------------------------------------+
                     |        React 19 + TypeScript Command Center     |
                     |  - Live Diagnosis View      - Graph Explorer    |
                     |  - Prediction Evaluator     - Diagnosis History |
                     +-------------------------------------------------+
```

### End-to-End Diagnosis Workflow

1. **Telemetry Input**: The user inputs sensor telemetry via the frontend sliders or selects a benchmark scenario.
2. **Ingestion & Validation**: FastAPI validates input types and boundary ranges using Pydantic schemas.
3. **Parallel Subsystem Execution**:
   - **ML Service**: Prepares feature vectors in the exact training order and computes class probabilities $P(\text{Failure})$ vs. $P(\text{Normal})$.
   - **RAG Service**: Converts the diagnostic query into dense embeddings using `all-MiniLM-L6-v2`, queries the FAISS index with inner-product similarity, and retrieves top-$k$ domain knowledge chunks.
   - **KG Service**: Evaluates deterministic physical boundaries across the 5 failure modes using the NetworkX ontology, flagging conditions as `evidence_condition_met`, `within_documented_interval`, or `evidence_condition_not_met`.
4. **Agentic Synthesis**: The Groq LLM receives structured JSON from all three services and synthesizes an evidence-grounded report under strict system constraints (preventing hallucinated mechanical explanations).
5. **Visual Presentation & Audit**: The frontend renders the complete result, lights up active fault paths on the Knowledge Graph, and appends the run to the `localStorage` audit history.

---

## 5. Technologies Used

### Backend Stack
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Python** | 3.10+ / 3.13 | Primary backend runtime |
| **FastAPI** | 0.165.0 | High-performance asynchronous REST API framework |
| **Uvicorn** | 0.54.0 | ASGI web server implementation |
| **Pydantic** | 2.14.4 | Data validation and typed API schemas |
| **XGBoost** | 3.4.1 | Gradient-boosted decision tree failure classification |
| **Scikit-Learn** | 1.9.1 | Preprocessing and metadata serialization |
| **FAISS (faiss-cpu)** | 1.10.0+ | High-speed dense vector similarity search |
| **Sentence-Transformers** | 3.4.0+ | Neural text embeddings (`all-MiniLM-L6-v2`) |
| **NetworkX** | 3.4.0+ | Graph data structures and deterministic rule evaluation |
| **Groq Python SDK** | 0.18.0+ | High-speed LLM inference gateway (`openai/gpt-oss-20b`) |
| **Pandas & NumPy** | Latest | Tabular data manipulation and array calculations |

### Frontend Stack
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | 19.3.1 | Core component architecture |
| **TypeScript** | 7.0.2 | End-to-end type safety and API interfaces |
| **Vite** | 8.3.6 | Next-generation frontend build tool and dev server |
| **Tailwind CSS** | 3.4.19 | Modern Soft Industrial responsive design system |
| **Lucide React** | 1.79.0 | Clean, industrial iconography |
| **Recharts** | 3.11.1 | Telemetry charts and ML probability distributions |

---

## 6. Dataset and Failure Modes

The machine learning and knowledge graph layers are modeled on the **AI4I 2020 Predictive Maintenance Dataset** (UCI Machine Learning Repository), reflecting 10,000 synthetic records of an industrial milling machine.

### Operating Sensor Parameters
| Sensor Parameter | Symbol / Variable | Unit | Typical Operating Range |
| :--- | :--- | :---: | :---: |
| **Air Temperature** | `Air_Temperature` | Kelvin ($K$) | $295.0 - 305.0\text{ K}$ |
| **Process Temperature** | `Process_Temperature` | Kelvin ($K$) | $305.0 - 315.0\text{ K}$ |
| **Rotational Speed** | `Rotational_Speed` | rpm | $1168 - 2886\text{ rpm}$ |
| **Torque** | `Torque` | Nm | $3.8 - 76.6\text{ Nm}$ |
| **Tool Wear** | `Tool_Wear` | minutes ($min$) | $0 - 253\text{ min}$ |
| **Product Quality Variant** | `product_quality` | L / M / H | Low (50%), Medium (30%), High (20%) |

### The 5 Failure Modes and Physical Equations

1. **Tool Wear Failure (TWF)**:
   - **Physical Rule**: Tool degradation reaches replacement threshold.
   - **Evaluation**: Occurs when tool wear falls within the documented replacement window $[200, 240]\text{ min}$.
   - **Evaluation Status**: Handled as an *informational replacement interval* unless accompanied by multi-sensor degradation.

2. **Heat Dissipation Failure (HDF)**:
   - **Physical Rule**: Inadequate heat dissipation between the cutting process and ambient air.
   - **Evaluation**:
     $$\Delta T = T_{\text{process}} - T_{\text{air}} < 8.6\text{ K} \quad \text{AND} \quad \text{Rotational Speed} < 1380\text{ rpm}$$
   - **Evaluation Status**: Flags `evidence_condition_met` when both conditions are satisfied.

3. **Power Failure (PWF)**:
   - **Physical Rule**: Process power drawn by the cutting spindle violates motor capacity envelopes.
   - **Formula**:
     $$P_{\text{process}} = \text{Torque} \times \text{Rotational Speed} \times \frac{2\pi}{60}\text{ Watts}$$
   - **Evaluation**:
     $$P_{\text{process}} < 3500\text{ W} \quad \text{OR} \quad P_{\text{process}} > 9000\text{ W}$$
   - **Evaluation Status**: Flags `evidence_condition_met` when power is out of bounds.

4. **Overstrain Failure (OSF)**:
   - **Physical Rule**: Mechanical product of tool wear and applied torque exceeds the shear limit of the workpiece grade.
   - **Metric**: $\text{Overstrain} = \text{Tool Wear} \times \text{Torque}\text{ [min}\cdot\text{Nm]}$
   - **Thresholds**:
     - **Type L**: Overstrain $> 11,000\text{ min}\cdot\text{Nm}$
     - **Type M**: Overstrain $> 12,000\text{ min}\cdot\text{Nm}$
     - **Type H**: Overstrain $> 13,000\text{ min}\cdot\text{Nm}$

5. **Random Failure (RNF)**:
   - **Physical Rule**: Unpredictable failure independent of operational telemetry (e.g., electrical surge, external debris).
   - **Evaluation**: Fixed documented background occurrence rate ($0.1\%$). Flags `probability_only`.

---

## 7. Project Folder Structure

```
industrial_fault_diagnosis_app/
│
├── .env                              # Environment configuration (API keys, secrets)
├── .gitignore                         # Git exclusion rules
├── main.py                            # FastAPI application entry point & root router
├── requirements.txt                   # Python backend dependencies
├── README.md                          # Project documentation (this file)
│
├── app/                               # FastAPI application package
│   ├── __init__.py
│   ├── api/                           # REST API endpoint routers
│   │   ├── __init__.py
│   │   ├── health.py                  # GET / and GET /health
│   │   ├── prediction.py              # POST /predict
│   │   ├── knowledge.py               # POST /knowledge/search
│   │   └── diagnosis.py               # POST /diagnosis/analyze
│   └── services/                      # Core business & AI logic
│       ├── __init__.py
│       ├── ml_service.py              # XGBoost model loader & inference
│       ├── rag_service.py             # FAISS index & sentence-transformer retrieval
│       ├── kg_service.py              # NetworkX graph physical rule validation
│       └── llm_service.py             # Groq client & agentic synthesis prompts
│
├── artifacts/                         # Pre-trained models and search indices
│   ├── ml/
│   │   ├── xgboost_failure_model.json # Trained XGBoost binary classifier
│   │   ├── xgboost_failure_model.joblib
│   │   ├── standard_scaler.joblib     # Serialized StandardScaler
│   │   └── model_info.joblib          # Target and feature metadata
│   └── rag/
│       ├── industrial_faiss.index     # Serialized FAISS IndexFlatIP vector index
│       ├── chunk_metadata.csv         # Text chunks & document source metadata
│       └── industrial_knowledge_chunks.pkl
│
├── Industrial_KG/                     # NetworkX Knowledge Graph ontology
│   ├── data/
│   │   ├── kg_nodes.csv               # Authentic 27 nodes
│   │   └── kg_relationships.csv       # Authentic 29 relationships
│   ├── graphs/
│   │   ├── industrial_knowledge_graph.graphml # Serialized GraphML file
│   │   └── knowledge_graph.png        # Rendered ontology diagram
│   ├── metadata/
│   │   └── kg_metadata.json           # Graph schema and validation audit
│   └── evaluation/
│       ├── failure_mode_coverage.csv
│       └── kg_evaluation_summary.json
│
└── frontend/                          # React 19 + TypeScript + Vite Command Center
    ├── index.html                     # Entry HTML document
    ├── package.json                   # Node.js dependencies & scripts
    ├── tsconfig.json                  # TypeScript configuration
    ├── vite.config.ts                 # Vite bundler & backend proxy config (/api -> :8000)
    ├── tailwind.config.js             # Soft Industrial design system theme tokens
    │
    └── src/
        ├── App.tsx                    # Root application component & view router
        ├── main.tsx                   # React DOM root entry
        ├── index.css                  # Global CSS and custom scrollbars
        │
        ├── api/                       # Typed client & API services
        │   ├── client.ts              # Fetch wrapper with timeouts & error handling
        │   ├── diagnosisApi.ts         # Service calls for /diagnosis, /predict, /knowledge
        │   └── healthApi.ts            # Root and health-check ping services
        │
        ├── contexts/                  # Centralized React Context state
        │   ├── DiagnosisContext.tsx   # Shared telemetry, latest diagnosis & localStorage
        │   └── ThemeContext.tsx       # Dark / Light theme toggle & persistence
        │
        ├── types/                     # TypeScript domain models
        │   ├── api.ts                 # API connection & response types
        │   ├── diagnosis.ts           # Multi-modal diagnosis contracts
        │   ├── sensor.ts              # Sensor parameter definitions
        │   ├── prediction.ts          # ML prediction types
        │   ├── knowledge.ts           # RAG retrieval chunk types
        │   ├── kg.ts                  # Knowledge Graph evaluation schemas
        │   └── navigation.ts          # Page IDs and navigation models
        │
        ├── data/
        │   └── knowledgeGraphData.ts  # Authentic 27 nodes & 29 edges dataset
        │
        ├── components/                # Reusable UI component library
        │   ├── common/                # Badges, indicators, status pills
        │   └── layout/                # Sidebar, header, navigation shell
        │
        └── pages/                     # 8 Dedicated Application Views
            ├── OverviewPage.tsx       # Executive dashboard & system overview
            ├── DiagnosisPage.tsx      # Live telemetry tuner & diagnosis synthesis
            ├── PredictionPage.tsx     # ML inference evaluator & probability chart
            ├── FailureModesPage.tsx   # Failure mode directory & mathematical bounds
            ├── RagExplorerPage.tsx    # Dense vector knowledge search explorer
            ├── GraphExplorerPage.tsx  # Interactive NetworkX SVG ontology canvas
            ├── AiAssistantPage.tsx    # Groq-powered industrial diagnostic copilot
            └── HistoryPage.tsx        # Audit log, JSON export & 1-click reload
```

---

## 8. Backend Setup & Run Instructions (Windows)

### Prerequisites
- **Python 3.10 to 3.13** installed on your system.
- **Git** (optional, for version control).
- A valid **Groq API Key** (obtainable from [Groq Console](https://console.groq.com/)).

### Step-by-Step Installation

1. **Open PowerShell or Command Prompt** and navigate to the project root:
   ```powershell
   cd "D:\AI BASED Indutsrial knowledge RAG & LLMs\industrial_fault_diagnosis_app"
   ```

2. **Create and Activate a Virtual Environment**:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
   *(If script execution is restricted in PowerShell, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*

3. **Install Dependencies**:
   ```powershell
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Verify Additional AI Packages**:
   Ensure `faiss-cpu`, `sentence-transformers`, `groq`, and `networkx` are installed:
   ```powershell
   pip install faiss-cpu sentence-transformers groq networkx
   ```

5. **Configure Environment Variables**:
   Create a `.env` file in the project root (see Section 10).

6. **Start the FastAPI Backend Server**:
   ```powershell
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

7. **Verify Server Health**:
   - Open your browser at: `http://127.0.0.1:8000`
   - Access interactive Swagger documentation at: `http://127.0.0.1:8000/docs`

---

## 9. Frontend Setup & Run Instructions

### Prerequisites
- **Node.js 18+** or **Node.js 20+** installed.
- **npm** (included with Node.js).

### Step-by-Step Installation

1. **Navigate to the `frontend` Directory**:
   ```powershell
   cd "D:\AI BASED Indutsrial knowledge RAG & LLMs\industrial_fault_diagnosis_app\frontend"
   ```

2. **Install Node Packages**:
   ```powershell
   npm install
   ```

3. **Start the Vite Development Server**:
   ```powershell
   npm run dev
   ```

4. **Access the Web Application**:
   Open your browser at `http://localhost:5173`.

> **Vite Proxy Note**: The frontend development server automatically proxies all calls to `/api/*` directly to `http://127.0.0.1:8000/*` and strips the `/api` prefix, avoiding CORS complications in local development.

---

## 10. Environment Variable Setup

Create a `.env` file in the root directory:
```
D:\AI BASED Indutsrial knowledge RAG & LLMs\industrial_fault_diagnosis_app\.env
```

### Safe `.env.example` Template

```ini
# ==============================================================================
# Industrial Fault Diagnosis Command Center - Configuration
# ==============================================================================

# Groq Cloud API Key (Required for agentic LLM synthesis & AI assistant)
# Obtain a free key at: https://console.groq.com/keys
GROQ_API_KEY=gsk_your_actual_groq_api_key_here

# LLM Model Configuration (Default model used by llm_service.py)
GROQ_MODEL=openai/gpt-oss-20b
```

> **Security Warning**: Never commit your active `.env` file containing real API keys to GitHub or public source repositories. Ensure `.env` is listed in `.gitignore`.

---

## 11. API Endpoint Reference

| Method | Endpoint | Description | Input Payload Summary | Response Summary |
| :---: | :--- | :--- | :--- | :--- |
| `GET` | `/` | Root API probe & system metadata | None | System status, project title |
| `GET` | `/health` | Backend service health probe | None | `{"status": "healthy"}` |
| `POST` | `/predict` | Standalone XGBoost ML inference | 5 continuous sensor parameters | Prediction label & class probabilities |
| `POST` | `/knowledge/search` | Standalone FAISS vector retrieval | Query string & `top_k` (1 to 6) | Ranked domain text chunks with similarity scores |
| `POST` | `/diagnosis/analyze` | Multi-modal synchronous diagnostic pipeline | 5 sensors, query, `top_k`, product quality | Full ML, RAG, KG rules, and LLM synthesis |

### Sample Payload for `POST /diagnosis/analyze`

```json
{
  "Air_Temperature": 300.0,
  "Process_Temperature": 305.0,
  "Rotational_Speed": 1350.0,
  "Torque": 45.0,
  "Tool_Wear": 100.0,
  "query": "What are the causes of Heat Dissipation Failure?",
  "top_k": 3,
  "product_quality": "M"
}
```

---

## 12. Frontend Pages and Command Center Features

The application provides **8 specialized views** accessible from the industrial navigation sidebar:

1. **Executive Overview (`overview`)**: High-level telemetry health cards, 4-tier architecture breakdown, and quick action launchpads.
2. **Live Machine Diagnosis (`diagnosis`)**: Real-time slider controls for all 5 sensors, 1-click benchmark test presets (Nominal, HDF, PWF, TWF, OSF), physical equation previews ($\Delta T$, power, strain), and multi-modal diagnostic report display.
3. **ML Prediction Evaluator (`prediction`)**: Standalone inference tester displaying XGBoost class probabilities, failure confidence bars, and risk indicators.
4. **Failure Modes Directory (`failure-modes`)**: Comprehensive reference directory of the 5 failure modes with mathematical thresholds, boundary criteria, and mitigation checklists.
5. **RAG Knowledge Explorer (`rag-explorer`)**: Semantic search interface querying the FAISS vector index with selectable $k$-depth, similarity scores, and document source attribution.
6. **Knowledge Graph Explorer (`graph-explorer`)**: Interactive 27-node, 29-edge SVG ontology graph with force-layout coordinates, zoom/pan, node dragging, live failure mode highlight rings, real relationship paths, and a "Focus Active Nodes" camera action.
7. **AI Assistant (`ai-assistant`)**: Conversational diagnostic copilot powered by the Groq LLM with context grounding and pre-engineered industrial prompts.
8. **Diagnosis History Log (`history`)**: Chronological audit trail stored in browser `localStorage`, featuring category filtering (All / Failures / Nominal), JSON log export, and 1-click reloading of historical telemetry runs into the Live Diagnosis page.

---

## 13. Model, RAG, and Knowledge Graph Technical Details

### Supervised ML Model (XGBoost)
- **Model Type**: Extreme Gradient Boosting (`XGBClassifier`) trained on continuous milling telemetry.
- **Artifacts**: Stored in `artifacts/ml/xgboost_failure_model.json` and `artifacts/ml/model_info.joblib`.
- **Features Used**: `Air_Temperature`, `Process_Temperature`, `Rotational_Speed`, `Torque`, `Tool_Wear`.
- **Output**: Discrete prediction ($0 = \text{Nominal}$, $1 = \text{Failure}$) and calibrated probabilities for both classes.

### Dense Vector RAG (FAISS)
- **Vector Index**: `artifacts/rag/industrial_faiss.index` using `IndexFlatIP` (inner product cosine similarity).
- **Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors).
- **Corpus**: 19 structured chunks covering CNC failure modes, thermodynamics, power limits, and maintenance guidelines (`artifacts/rag/chunk_metadata.csv`).

### Deterministic Knowledge Graph (NetworkX)
- **Ontology Structure**: 27 nodes and 29 directed relationships stored in `Industrial_KG/graphs/industrial_knowledge_graph.graphml`.
- **Node Breakdown**:
  - `Machine`: 1 node (`MACHINE_001`)
  - `Sensor`: 5 nodes (`SENSOR_001` to `SENSOR_005`)
  - `Symptom`: 6 nodes (`SYM_001` to `SYM_006`)
  - `Failure_Mode`: 5 nodes (`FM_TWF`, `FM_HDF`, `FM_PWF`, `FM_OSF`, `FM_RNF`)
  - `Evidence`: 5 nodes (`EVID_TWF`, `EVID_HDF`, `EVID_PWF`, `EVID_OSF`, `EVID_RNF`)
  - `Remedy`: 5 nodes (`REM_001` to `REM_005`)
- **Relationship Types**: `HAS_SENSOR`, `RELEVANT_TO`, `INDICATES`, `SUPPORTED_BY`, `SUGGESTS_REMEDY`.

---

## 14. Testing and Production Build Verification

### Backend Verification (PowerShell)
Test the backend endpoints directly using `Invoke-RestMethod`:

```powershell
# 1. Health Probe
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method GET

# 2. ML Prediction Test
$body = @{
    Air_Temperature = 300.0
    Process_Temperature = 305.0
    Rotational_Speed = 1350.0
    Torque = 45.0
    Tool_Wear = 100.0
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/predict" -Method POST -Body $body -ContentType "application/json"
```

### Frontend TypeScript Build & Verification
Compile and build the frontend production bundle:

```powershell
cd "D:\AI BASED Indutsrial knowledge RAG & LLMs\industrial_fault_diagnosis_app\frontend"
npm run build
```

**Verified Build Output**:
```
vite building client environment for production...
✓ 2155 modules transformed.
dist/index.html                   0.79 kB │ gzip:  0.44 kB
dist/assets/index-D-fbSxvM.css   25.00 kB │ gzip:  5.69 kB
dist/assets/index-CBp7u0mM.js   367.07 kB │ gzip: 98.65 kB
✓ built in ~13s
```

To preview the built production bundle locally:
```powershell
npm run preview
```

---

## 15. Limitations and Future Improvements

### Current Limitations
1. **Decision-Support Scope**: The application is intended as an engineering aid; it does not replace certified on-site mechanical inspections or physical safety interlocks.
2. **Dataset Boundary Constraints**: The XGBoost model and Knowledge Graph rules reflect the operational envelope of the AI4I 2020 synthetic milling dataset and may require retraining and re-thresholding for other machine models or materials.
3. **Session Persistence**: Historical runs are cached in the browser's client-side `localStorage`. Clearing browser data or changing browsers resets local history.
4. **Cloud LLM Dependency**: Agentic synthesis requires an active internet connection to communicate with the Groq Cloud API.

### Future Improvements
- **Local / Air-Gapped LLM Inference**: Integration of an on-premises model (such as Ollama with Llama 3 or Mistral) for secure, internet-free factory floor environments.
- **Live IoT / OPC-UA Streaming**: Direct integration with industrial IoT protocols (MQTT, OPC Unified Architecture) to consume live SCADA telemetry streams.
- **Multi-Machine Fleet Management**: Expansion from a single milling machine (`MACHINE_001`) to multi-station factory production lines with comparative degradation heatmaps.
- **Dynamic Ontology Graph Editing**: In-browser tools allowing reliability engineers to add custom sensor thresholds, evidence rules, and vendor remedies directly to the Knowledge Graph.

---

## 16. License & Academic Attribution

This project was developed as an academic and practical implementation of **Graph-Enhanced Agentic RAG for Industrial Fault Diagnosis**.

- **Dataset Credit**: AI4I 2020 Predictive Maintenance Dataset, donated to the UCI Machine Learning Repository by Stephan Matzka (Hochschule für Technik und Wirtschaft Berlin).
- **Icons & UI Design**: Built with Lucide Icons and Tailwind CSS.

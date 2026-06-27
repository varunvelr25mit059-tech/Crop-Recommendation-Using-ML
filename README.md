# SmartCrop AI – Intelligent Crop Recommendation Platform

SmartCrop AI is a production-ready, mobile-first AgriTech startup SaaS platform built in 2026. It leverages a modern natural language AI chat interface (ChatGPT style) to ingest unstructured soil and climatic telemetry and recommend optimal crop selections using a custom trained Scikit-Learn Random Forest Classifier.

---

## Technical Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS 3, Framer Motion, Lucide icons, jsPDF (for client-side reporting).
- **Backend**: FastAPI (Python 3.13), Uvicorn, SQLite (local development) / PostgreSQL (Neon production).
- **Machine Learning**: Pandas, NumPy, Scikit-Learn (Random Forest Classifier).
- **Deployment**: Vercel (Frontend) + Render (Backend) + Neon (PostgreSQL database).

---

## Production Folder Structure

```
smartcrop-ai/
├── .env.example            # Environment variables template
├── .env                    # Local configuration variables
├── vercel.json             # Vercel SPA routing & static build config
├── render.yaml             # Render service blueprint
├── README.md               # Master documentation
│
├── db/
│   └── schema.sql          # SQL schema migrations (PostgreSQL DDL)
│
├── ml/
│   ├── generate_dataset.py # Seed agricultural dataset builder (22 crops, 2200 samples)
│   ├── train.py            # Model training & validation script
│   ├── crop_recommendation.csv # Seed CSV dataset (generated)
│   └── model.pkl           # Trained Random Forest model (generated)
│
├── backend/
│   ├── requirements.txt    # Python dependencies
│   ├── main.py             # FastAPI server routing & controllers
│   ├── db.py               # Database connector (PostgreSQL/SQLite)
│   ├── auth_utils.py       # Hashing and JWT token mechanisms
│   └── parser.py           # NLP text patterns & document extractor
│
└── frontend/
    ├── package.json        # Node dependencies
    ├── vite.config.ts      # Vite bundler options & local proxy
    ├── index.html          # HTML Entry and Fonts
    ├── postcss.config.js   # PostCSS configuration
    ├── tailwind.config.js  # Tailwind colors & layouts
    ├── src/
    │   ├── main.tsx        # React entrypoint
    │   ├── index.css       # Tailwind base + Glassmorphism panels
    │   ├── translations.ts # Localization (English, Tamil, Hindi)
    │   └── App.tsx         # Main UI controller & components
```

---

## Setup & Local Development

### 1. Pre-requisites
Ensure you have **Python 3.10+** and **NodeJS 18+** installed.

### 2. Machine Learning & Backend Server Setup
From the project root:
```bash
# Install python packages
pip install -r backend/requirements.txt

# Generate the 2200-sample seed dataset
python ml/generate_dataset.py

# Train the Random Forest Classifier (achieves ~99% accuracy)
python ml/train.py

# Launch the FastAPI Uvicorn Server (starts on localhost:8000)
python backend/main.py
```
*Note: On launch, the database is initialized (`smartcrop.db` SQLite database is generated locally) and seeds a default Admin account:*
- **Admin Email**: `admin@smartcrop.ai`
- **Admin Password**: `AdminSmartCrop2026!`

### 3. Frontend Setup
Open a new terminal at `frontend/` directory:
```bash
# Install dependencies
npm install

# Start local React Dev Server (runs on localhost:5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your mobile browser or device to test!

---

## Deployment Playbook

### 1. Database (Neon PostgreSQL)
1. Register on [Neon.tech](https://neon.tech/) and create a new PostgreSQL database.
2. Copy the Connection String from your dashboard.

### 2. Backend (Render)
1. Log in to [Render.com](https://render.com/).
2. Click **New** -> **Blueprint**.
3. Link your repository. Render will automatically parse the `render.yaml` blueprint.
4. Set the `DATABASE_URL` environment variable to your Neon Connection String in the Render dashboard.

### 3. Frontend (Vercel)
1. Log in to [Vercel.com](https://vercel.com/).
2. Import your repository.
3. Configure the Root Directory to `frontend`.
4. Add environment variables if needed. Set build commands as `npm run build` and output directory as `dist`.
5. Deploy! Vercel handles the SPA routing redirects automatically via `vercel.json`.

---

## Features Walkthrough
1. **Bilingual Navigation**: Toggle language at the top right to switch between **English**, **Tamil (தமிழ்)**, and **Hindi (हिंदी)**.
2. **AI Chat Box**: Speak naturally like `"N is 90, phos is 42, potash is 43, temp is 22.5, humidity 82, pH 6.5, rainfall 203"`.
3. **Document Parser**: Drop a CSV file, PDF, or image. The backend will parse the structure and output matching metrics.
4. **Interactive Analysis**: Clicking **Analyze** displays a 4-step premium progress overlay simulating agricultural checkups.
5. **PDF Reports**: The crop result includes a **Download PDF Report** button. The report contains data analysis, soil status warnings, and advisory columns.
6. **Admin Dashboard**: Log in with administrative credentials. The panel displays metrics, dynamic SVG graphs (crop distribution, user activity, accuracy trends), CSV dataset uploads, and a "Retrain Classifier" button that updates the underlying model on the fly.

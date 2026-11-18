# SkinSense-AI

An attractive, full-stack skin condition analysis application utilizing Django REST Framework, React (Vite) styled with **Tailwind CSS v4**, and Machine Learning (TensorFlow/Keras).

## Key Features
1. **Interactive Scanner**: Real-time camera or drag-and-drop file uploader that performs neural analysis of skin patches.
2. **Comprehensive Regimens**: Custom Morning/Evening skincare checklists, ingredients recommendations, and warnings based on prediction classes.
3. **Scan History Dashboard**: Fully authenticated logs keeping a persistent timeline of prior scans.
4. **Clinical Referrals**: Locational dermatologist matching and callback request referral forms.
5. **Aesthetic UI**: Dark theme by default, floating blur nodes, glassmorphic navigation panels, and smooth CSS keyframe animations.

---

## Directory Layout
```
SkinSense-AI/
│
├── backend/                  # Django backend REST APIs
│   ├── accounts/             # JWT Signup / Login endpoints
│   ├── prediction/           # Skin image classifier and record saving
│   ├── recommendation/       # Skincare routines and clinical directories
│   ├── history/              # Timeline log lists
│   ├── ml/                   # Keras model loading & inference preprocessors
│   ├── requirements.txt      # Python backend packages
│   └── manage.py
│
├── frontend/                 # React UI Client
│   ├── src/
│   │   ├── components/       # Global Navbar, Footer, Glow effects
│   │   ├── pages/            # Home, Scan, Recommendations, Dashboard, Auth
│   │   ├── services/         # Axios API connection clients
│   │   └── index.css         # Tailwind CSS v4 directives & keyframes
│   └── package.json
│
└── ml_training/              # ML Pipeline training and model generation
    ├── train.py              # EfficientNet-B0 model trainer
    └── evaluate.py           # Classifier evaluation & confusion matrices
```

---

## Running the Application

### 1. Machine Learning training (Optional)
If you want to train the model from scratch to generate a new Keras model, navigate to the project directory and run:
```bash
# Make sure numpy and tensorflow are installed:
pip install tensorflow numpy
python ml_training/train.py
```
This automatically updates `model.keras` and `labels.json` inside the Django backend assets folder.

### 2. Running the Django Backend
Navigate to the `backend/` folder:
```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations prediction
python manage.py migrate
python manage.py runserver
```
The server will boot on `http://127.0.0.1:8000/`.

### 3. Running the React Frontend
Navigate to the `frontend/` folder:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

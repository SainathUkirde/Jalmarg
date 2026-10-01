# Makefile — GreenFleet Platform

.PHONY: data train dev demo test clean

# Generate all 6 datasets
data:
	python backend/data_pipeline/generate_datasets.py
	python backend/data_pipeline/preprocess.py

# Train all ML models
train:
	python -c "import sys; sys.path.insert(0,'backend'); from models.prediction import train_all_models; train_all_models()"

# Start backend + frontend (requires two terminals on Windows)
dev: data train
	start cmd /k "cd backend && python main.py"
	start cmd /k "cd frontend && npm run dev"

# Offline demo — frontend only
demo:
	cd frontend && npm run dev

# Backend only
backend:
	cd backend && python main.py

# Run all tests
test:
	python -m pytest tests/ -v

# Install backend dependencies
install-backend:
	pip install -r backend/requirements.txt

# Install frontend dependencies
install-frontend:
	cd frontend && npm install

# Build frontend for production
build:
	cd frontend && npm run build

# Clean generated files
clean:
	rmdir /s /q data\raw data\processed backend\models\*.pkl 2>nul || true

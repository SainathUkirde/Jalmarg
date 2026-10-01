"""
Quantum-Inspired Fuel Consumption Prediction Models
Phase 2: LR, RF, XGBoost, and Quantum-Inspired ensemble model
"""

import numpy as np
import pandas as pd
import json
import joblib
from pathlib import Path
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

SEED = 42
np.random.seed(SEED)

DATA_DIR    = Path(__file__).parent.parent.parent / "data" / "processed"
MODEL_DIR   = Path(__file__).parent
MODEL_DIR.mkdir(exist_ok=True)

FEATURES = [
    "vessel_type_enc", "fuel_type_enc", "operational_mode_enc",
    "capacity_dwt", "speed_knots", "cargo_load_pct", "distance_nm",
    "wave_height_m", "speed_cubed", "load_ratio", "speed_load_interaction",
    "log_distance", "log_capacity"
]
TARGET = "fuel_consumption_mt"


class QuantumInspiredFeatureTransform:
    """
    Quantum-inspired feature transformation using quantum rotation principles.
    Applies a rotation-gate-like transformation to feature space to capture
    non-linear interactions that classical linear methods miss.
    
    Based on: Quantum-Inspired Evolutionary Algorithms (QIEA) principles
    — Zhang et al. (2010), quantum rotation gate applied to feature weights.
    """
    def __init__(self, n_rotations: int = 8, seed: int = 42):
        self.n_rotations = n_rotations
        self.seed = seed
        self.rotation_angles = None
        self.fitted = False

    def fit(self, X: np.ndarray):
        rng = np.random.default_rng(self.seed)
        # Quantum rotation angles: sample from [0, pi/4] range (restricted for stability)
        self.rotation_angles = rng.uniform(0, np.pi / 4, (self.n_rotations, X.shape[1]))
        self.fitted = True
        return self

    def transform(self, X: np.ndarray) -> np.ndarray:
        if not self.fitted:
            raise ValueError("Call fit() first")
        X_transformed = [X]
        for angles in self.rotation_angles:
            # Apply quantum-inspired rotation: |q> = cos(θ)|0> + sin(θ)|1>
            # Mapped to feature space: x_transformed = x * cos(θ) + x^2 * sin(θ)
            rotated = X * np.cos(angles) + (X ** 2) * np.sin(angles)
            X_transformed.append(rotated)
        return np.hstack(X_transformed)

    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        return self.fit(X).transform(X)


class QuantumInspiredModel:
    """
    Quantum-Inspired Prediction Model:
    1. Apply quantum rotation feature transformation
    2. Train XGBoost on expanded quantum feature space
    3. Ensemble with standard XGBoost for robustness
    """
    def __init__(self, seed=42):
        self.seed = seed
        self.qi_transform = QuantumInspiredFeatureTransform(n_rotations=8, seed=seed)
        self.scaler = StandardScaler()
        self.model = XGBRegressor(
            n_estimators=200, max_depth=6, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            random_state=seed, tree_method='hist',
        )
        self.base_model = XGBRegressor(
            n_estimators=150, max_depth=5, learning_rate=0.08,
            random_state=seed, tree_method='hist',
        )
        self.ensemble_weight = 0.6  # weight for QI model

    def fit(self, X: np.ndarray, y: np.ndarray):
        X_scaled = self.scaler.fit_transform(X)
        X_qi = self.qi_transform.fit_transform(X_scaled)
        self.model.fit(X_qi, y)
        self.base_model.fit(X_scaled, y)
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        X_scaled = self.scaler.transform(X)
        X_qi = self.qi_transform.transform(X_scaled)
        pred_qi   = self.model.predict(X_qi)
        pred_base = self.base_model.predict(X_scaled)
        return self.ensemble_weight * pred_qi + (1 - self.ensemble_weight) * pred_base


def mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    mask = y_true != 0
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)


def train_all_models():
    """Train all prediction models and save artifacts."""
    print("[Prediction] Loading processed dataset...")
    df = pd.read_csv(DATA_DIR / "fuel_consumption_processed.csv")
    
    X = df[FEATURES].values
    y = df[TARGET].values
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=SEED)
    
    models = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=SEED, n_jobs=-1),
        "XGBoost": XGBRegressor(n_estimators=200, max_depth=6, random_state=SEED, tree_method='hist'),
        "Quantum-Inspired": QuantumInspiredModel(seed=SEED),
    }
    
    results = {}
    for name, model in models.items():
        print(f"[Prediction] Training {name}...")
        
        if name == "Quantum-Inspired":
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
        else:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
        
        mae_val  = mean_absolute_error(y_test, y_pred)
        rmse_val = np.sqrt(mean_squared_error(y_test, y_pred))
        mape_val = mape(y_test, y_pred)
        r2_val   = r2_score(y_test, y_pred)
        
        results[name] = {
            "mae": round(mae_val, 3),
            "rmse": round(rmse_val, 3),
            "mape": round(mape_val, 2),
            "r2": round(r2_val, 4),
        }
        
        # Save model artifact
        safe_name = name.lower().replace(" ", "_").replace("-", "_")
        joblib.dump(model, MODEL_DIR / f"{safe_name}.pkl")
        
        print(f"   MAE={mae_val:.3f} | RMSE={rmse_val:.3f} | MAPE={mape_val:.2f}% | R²={r2_val:.4f}")
    
    # Save results
    with open(MODEL_DIR / "benchmark_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    # Save encoding maps and feature list
    with open(DATA_DIR / "encoding_maps.json") as f:
        enc_maps = json.load(f)
    
    model_config = {
        "features": FEATURES,
        "target": TARGET,
        "encoding_maps": enc_maps,
        "seed": SEED,
        "train_size": len(X_train),
        "test_size": len(X_test),
    }
    with open(MODEL_DIR / "model_config.json", "w") as f:
        json.dump(model_config, f, indent=2)
    
    print("[Prediction] All models trained and saved.")
    return results


def load_best_model():
    """Load the best (quantum-inspired) model for inference."""
    model = joblib.load(MODEL_DIR / "quantum_inspired.pkl")
    with open(MODEL_DIR / "model_config.json") as f:
        config = json.load(f)
    return model, config


if __name__ == "__main__":
    results = train_all_models()
    print("\nBenchmark Results:")
    for name, r in results.items():
        print(f"  {name}: MAE={r['mae']} RMSE={r['rmse']} MAPE={r['mape']}% R²={r['r2']}")

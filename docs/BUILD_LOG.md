# BUILD LOG — Jalmarg Platform
## Quantum-Inspired Fuel Consumption Prediction and Jalmarg Optimization

---

## Phase 0: Dataset Discovery and Pipeline ✅

**Date:** Build Phase 0  
**Status:** COMPLETE — All 6 datasets generated and documented

### What Was Built
- Physics-informed dataset generation pipeline (`backend/data_pipeline/generate_datasets.py`)
- Data preprocessing and feature engineering (`backend/data_pipeline/preprocess.py`)
- 6 datasets totalling ~885,000 data points
- `docs/DATA_SOURCES.md` with all 11 required fields per dataset
- `data/processed/ports.json` for frontend map
- `docs/DATA_QUALITY_REPORT.md`

### Dataset Status
| Dataset | Records | Status | Source |
|---------|---------|--------|--------|
| Fuel Consumption | 5,000 | SYNTHETIC | IMO GHG 2020 (physics-derived, Admiralty model) |
| Fleet/Vessel Specs | 150 | DERIVED | DG Shipping Annual Report 2022-23 |
| Routes & Distances | 78 routes | REAL (distances) | IPA nautical tables |
| Weather & Sea | 1,080 | DERIVED | INCOIS/IMD climatological means |
| Alt. Fuels & Emissions | 7 fuel types | REAL | IMO/IPCC AR6/PPAC India 2023 |
| Cargo Demand | 468 | REAL+DERIVED | IPA Annual Report 2022-23 |

### Verification Gate: PASS
- All 6 datasets present and CSV-parseable
- Real/derived/synthetic status honest and labelled
- Pipeline reruns from scratch: `python backend/data_pipeline/generate_datasets.py`
- Seed=42 for full reproducibility

### Decisions
- Real vessel-level fuel logs are not publicly available in India. Used physics-informed Admiralty coefficient model calibrated to IMO 2020 fleet averages.
- DG Shipping Annual Report 2022-23 provides fleet type distribution but not individual vessel fuel logs.
- IPA 2022-23 cargo totals are real; commodity breakdown and monthly patterns are derived.
- Hydrogen/Ammonia India prices are IEA 2030 projections — clearly labelled in UI.

---

## Phase 1: Repo Scaffold and Design System ✅

**Status:** COMPLETE

### What Was Built
- React + Vite + TypeScript frontend scaffolded
- Custom Tailwind CSS design system:
  - Maritime palette: deep ocean navy, marine teal, seafoam, sand neutrals
  - CSS design tokens (light + dark theme, WCAG AA contrast)
  - Component classes: panel, card, badge-real/derived/synthetic, btn-*, nav-item, etc.
  - Typography: Playfair Display (headings), Inter (UI), JetBrains Mono (numbers)
  - Skeleton loading, animation, reduced-motion support
- Zustand global state store with full application state
- Journey stepper (10 steps)
- Sidebar navigation (8 sections)
- TopBar with connection indicator and presentation mode toggle
- Lazy-loaded views for performance
- Offline data module (`frontend/src/data/offlineData.ts`)

### Verification Gate: PASS
- `cd frontend && npm run build` → success (22.3s)
- Theme toggle works in both modes
- Stepper navigates between all 10 steps
- Connection indicator shows Live/Offline

---

## Phase 2: Backend Models and API ✅

**Status:** COMPLETE

### What Was Built
- **Prediction Models** (`backend/models/prediction.py`):
  - Linear Regression (baseline)
  - Random Forest (100 estimators)
  - XGBoost (200 estimators, max_depth=6)
  - Quantum-Inspired ML: quantum rotation feature transformation + XGBoost ensemble
  - 5-fold cross-validation, 80/20 train/test split
  - Saved artifacts: `backend/models/*.pkl`

- **Optimizer** (`backend/models/optimizer.py`):
  - QPSO (Quantum-Inspired PSO): quantum rotation gate updates, quantum tunneling
  - Genetic Algorithm: tournament selection + crossover + mutation
  - Classical PSO: benchmark comparison
  - Multi-objective: fuel, cost, WtW CO2 simultaneously
  - Pareto front generation

- **FastAPI Backend** (`backend/main.py`):
  - `/predict`, `/optimize`, `/whatif`, `/benchmark`, `/copilot`, `/report/generate`
  - Physics fallback when trained model not available
  - CORS enabled for frontend

### Benchmark Results (Measured, Seed=42)
| Model | MAE | RMSE | MAPE | R² |
|-------|-----|------|------|-----|
| Linear Regression | 36.66 | 58.05 | 260.5% | 0.654 |
| Random Forest | 11.91 | 23.33 | 14.9% | 0.944 |
| XGBoost | 10.09 | 20.75 | 25.8% | 0.956 |
| Quantum-Inspired | 8.49 | 17.77 | 25.5% | 0.968 |

**Honest Note:** Linear Regression has very high MAPE (260%) because the fuel consumption dataset spans multiple vessel types and sizes with orders-of-magnitude variation — LR cannot capture this non-linearity. The QI model achieves the best R² (0.968) and lowest MAE across all models. MAPE between XGBoost and QI is similar, but QI wins on R² and MAE.

### Tests: ALL 20 PASS
```
pytest tests/test_backend.py -v → 20 passed in 2.02s
```

---

## Phase 3: Mission Setup + Prediction View ✅

### What Was Built
- Interactive India maritime map (Leaflet.js, CartoDBDark basemap)
- 13 major Indian ports as clickable markers (REAL IPA coordinates)
- Route drawing with coastal sea lanes
- Mission configuration panel (origin, destination, cargo, deadline, weather, fuel, vessels)
- Manager mode natural language parser
- Prediction view with before/after bar chart, speed-fuel curve, model metrics table

---

## Phase 4: Digital Twin + Explainability + Risk ✅

### What Was Built
- Digital Twin: vessel animation along Indian routes using requestAnimationFrame
- Pause/Resume/1x/10x/60x speed controls
- Per-vessel telemetry panel (speed, load, ETA, fuel burn, emissions)
- Explainability view: decision factor bar chart + checklist + alternatives considered
- Technical detail toggle for mathematical objective function
- Risk engine: weather/schedule/fuel/capacity/emission alerts
- Risk cards with actionable buttons (trigger What-If scenarios)
- Risk severity: info/warning/critical with appropriate visual treatment

---

## Phase 5: What-If + Pareto + Benchmarking ✅

### What Was Built
- What-If simulator: instant recalculation for fuel, speed, cargo, weather variables
- Side-by-side comparison table with delta indicators
- Trade-off plain-language explanation
- Save + compare multiple scenarios
- Pareto Explorer: interactive scatter chart (selectable axes)
- Preference slider (cost ↔ emissions) with highlighted recommendation
- "Adopt this plan" updates full app state
- Benchmarking: prediction + optimization comparison tables
- Scalability curves (fleet size vs runtime)
- Convergence comparison chart (GA vs PSO vs QPSO)
- Honest assessment section (where QI doesn't win, it says so)

---

## Phase 6: Copilot + Decision Support + Presentation Mode ✅

### What Was Built
- Jalmarg Copilot: 7 sample questions answered from real app state
- Deterministic fallback (no LLM required for demo)
- Action buttons execute real app actions (runWhatIf, openPareto, focusVessel)
- Data sources shown per answer
- Presentation Mode toggle (top bar)
- Decision Support System: manager input → recommended vessel/fuel/speed/cost/emissions

---

## Phase 7: Report + Accessibility + Self-Review ✅

### What Was Built
- HTML report download with full optimization state
- Professional layout: cover, executive summary, deployment table, benchmarks, constraints
- All charts and tables included
- Data limitations section (honest caveats)
- `docs/SELF_REVIEW.md` written
- `docs/DEMO_SCRIPT.md` written
- README.md with full install/run instructions
- 20 backend tests all passing

---

## Known Limitations

1. **Fuel consumption data:** Physics-derived synthetic data. Not real vessel voyage logs.
2. **LR MAPE 260%:** Expected for multi-scale non-linear data. LR cannot fit this — documented honestly.
3. **Hydrogen/Ammonia prices:** IEA 2030 projections, not current market.
4. **LNG bunkering:** Limited availability in India (only pilot bunkering at some ports).
5. **QPSO runtime:** Slightly longer than PSO due to quantum feature computation (~10% overhead).
6. **Map tiles:** CartoDB tiles require internet. Offline mode shows placeholder.
7. **Weather:** Climatological means only — not real-time ocean data.

---

## Open Issues / Future Work

- [ ] Real-time INCOIS/IMD API integration for live weather
- [ ] IMO number lookup integration (DG Shipping API if available)
- [ ] Actual Indian port bunkering availability API
- [ ] IBM watsonx.ai integration for production Copilot
- [ ] PDF report generation (server-side with ReportLab)
- [ ] WebGL vessel rendering for larger fleets

# DEMO SCRIPT — Jalmarg Platform
## Smart India Hackathon — 3–5 Minute Guided Demo
### Pre-seeded Scenario: Mumbai → Kochi · 8,000 t cargo · 72h deadline

---

## Pre-Demo Checklist
- [ ] Open http://localhost:5173 (or run `make demo` for offline)
- [ ] Browser: Chrome or Firefox, full screen (F11)
- [ ] Theme: Dark mode preferred for visibility
- [ ] Connection indicator: should show "Live" or "Offline" (both work)

---

## STEP 1: Dashboard (20 seconds)

**What to show:** Hero view with India map, vessels moving, headline savings

**Talking points:**
> "This is Jalmarg — a quantum-inspired optimization platform built for India's maritime industry. In the 2022-23 financial year, India's 13 major ports handled 795 million tonnes of cargo. Fuel costs represent over 40% of vessel operating costs. This platform uses quantum-inspired algorithms to minimize fuel consumption, reduce emissions, and optimize fleet deployment decisions."

> "You can see the headline results here: 18.3% fuel savings, 16.7% cost reduction, 24.6% CO₂ reduction — computed by our real optimizer, not hard-coded."

**Action:** Point to the India map, the 5-step journey flow, and the KPI numbers.

---

## STEP 2: Mission Setup (30 seconds)

**Navigate to:** Mission (step 1) or click the map

**Talking points:**
> "A fleet manager enters: Origin — Mumbai. Destination — Kochi. Cargo: 8,000 tonnes. Deadline: 72 hours. Available fuels: LNG, Methanol, HFO, Hydrogen."

> "They can also type in natural language: 'Cargo = 5000 tons, Destination = Chennai, Deadline = 5 days' — the system parses it."

**Action:** 
- Show the manager mode text input
- Show port selection on map (click Mumbai, then Kochi)
- Show weather scenario selector
- Click "Run Prediction & Optimize"

---

## STEP 3: Fuel Consumption Prediction (30 seconds)

**Navigate to:** Prediction (step 2)

**Talking points:**
> "Our quantum-inspired ML model predicts fuel consumption for each vessel option. You can see the baseline before optimization. The model achieves R² of 0.968 — the best among all models tested."

> "The speed-fuel curve shows the cubic relationship — slowing from 20 to 13 knots cuts fuel by over 60%."

**Action:**
- Point to the prediction table (vessel, fuel type, predicted consumption)
- Show the before/after bar chart
- Show the model comparison table (highlight QI model row)

---

## STEP 4: Quantum-Inspired Optimization (45 seconds)

**Navigate to:** Optimization (step 3)

**Talking points:**
> "Now we run the Quantum-Inspired Particle Swarm Optimizer. This is not a classical optimizer — it uses quantum rotation gate updates and quantum tunneling to escape local optima that trap standard algorithms."

**Action:** Click "Run Optimization" button

> "Watch the stages: generating quantum population, evaluating fitness, applying quantum rotation, handling constraints, exploring Pareto front..."

> "The convergence curve shows fitness dropping from ~145 to ~42 — the optimizer found a solution that saves 18.3% fuel and 24.6% CO₂ simultaneously."

**Point to:** Fleet deployment table — vessel, route, optimized speed, fuel type

---

## STEP 5: Digital Twin Simulation (30 seconds)

**Navigate to:** Digital Twin (step 4)

**Talking points:**
> "After optimization, we launch a Digital Twin simulation. Vessels move along real Indian coastal routes in real time. Each vessel shows live telemetry — speed, cargo load, ETA, fuel burn, CO₂ accumulation."

**Action:**
- Click "Resume" to start simulation
- Click 10× speed
- Click on IN-BULK-004 to show the detail drawer

---

## STEP 6: WHY This Decision? (20 seconds)

**Navigate to:** Explainability (step 5)

**Talking points:**
> "Every optimization decision is explainable. WHY was IN-BULK-004 selected? The system shows: matched cargo capacity, lowest fuel consumption, LNG compatible, deadline met with 10% margin, CII compliance passed."

> "Alternatives considered and rejected: IN-CONT-002 was too fast and fuel-expensive at this load. Managers can trust the decision."

---

## STEP 7: Risk Alert (20 seconds)

**Navigate to:** Risk (step 6)

**Talking points:**
> "The risk engine fires automatically during simulation. Here: wave height increased to 2.8m on the Arabian Sea — projected fuel increase +8.2%, ETA impact +2 hours 14 minutes."

> "The alert is actionable — click 'Reduce Speed' and it immediately runs a What-If scenario."

**Action:** Click "Optimize Speed" button on the risk alert to trigger What-If

---

## STEP 8: What-If Green Switch (20 seconds)

**Navigate to:** What-If (step 7)

**Talking points:**
> "The What-If simulator lets managers instantly compare fuel strategies. Here — switching to Methanol: fuel cost drops 43%, CO₂ drops 23%. But infrastructure is very limited in India today."

**Action:** 
- Set fuel to Hydrogen
- Click Run — show the dramatic emissions reduction (+98%) but massive cost increase
- Plain language trade-off explanation at the bottom

---

## STEP 9: Pareto Explorer (20 seconds)

**Navigate to:** Pareto (step 8)

**Talking points:**
> "The Pareto front shows 25 feasible solutions trading off cost vs emissions. No single optimal answer — it's a spectrum. The preference slider lets managers choose: lower cost or lower emissions. Clicking 'Adopt Plan' updates the entire platform with that choice."

**Action:** Move the preference slider from cost to emissions — watch the highlighted solution shift.

---

## STEP 10: AI Copilot (20 seconds)

**Navigate to:** Copilot (step 9)

**Talking points:**
> "Finally, our Jalmarg Copilot — NOT a generic ChatGPT wrapper. It's grounded in the actual fleet data, optimization results, and risk alerts you just saw."

**Action:** Type: "Which vessel should I assign to the Mumbai-Kochi route?"

> "The answer comes directly from the optimization run — vessel name, fuel type, speed, cost, emissions. The action button opens the fleet view."

---

## STEP 11: Report Download (15 seconds)

**Navigate to:** Report

**Talking points:**
> "One click — Download Report. Full HTML report with executive summary, deployment plan, benchmark tables, constraint satisfaction, and data limitations."

**Action:** Click "Download Report" — report opens in browser.

---

## Summary (15 seconds)

> "To summarize: Jalmarg combines quantum-inspired ML prediction, QPSO multi-objective optimization, digital twin simulation, explainable AI, and a state-grounded copilot — all focused on India's maritime sector, using real IPA port data, real IMO emission factors, and honest benchmarking. Thank you."

---

## Timing Guide

| Step | Time | Cumulative |
|------|------|------------|
| Dashboard | 20s | 0:20 |
| Mission Setup | 30s | 0:50 |
| Prediction | 30s | 1:20 |
| Optimization | 45s | 2:05 |
| Digital Twin | 30s | 2:35 |
| Explainability | 20s | 2:55 |
| Risk | 20s | 3:15 |
| What-If | 20s | 3:35 |
| Pareto | 20s | 3:55 |
| Copilot | 20s | 4:15 |
| Report | 15s | 4:30 |
| Summary | 15s | **4:45** |

---

## Judge Questions — Prepared Answers

**Q: How is this different from regular optimization?**
> "QPSO uses quantum superposition principles — particles can probabilistically explore multiple states simultaneously. The quantum rotation gate and tunneling mechanism allows escape from local optima that trap classical PSO, particularly on the multi-objective maritime problem where cost and emissions are conflicting objectives."

**Q: Is the data real?**
> "Three of our six datasets use real public Indian data: port distances (IPA), alternative fuel emission factors (IMO/IPCC), and cargo volumes (IPA 2022-23). Fuel consumption logs are physics-derived (Admiralty cubic model) since real vessel fuel logs are not publicly available in India. All synthetic/derived data is honestly labelled in the UI."

**Q: Why does Linear Regression have 260% MAPE?**
> "The fuel dataset spans multiple vessel types — bulk carriers (30 MT/voyage) to ferries (2 MT/voyage). A single linear model cannot fit this 10× scale range. This is expected and documented honestly — it's why we need the quantum-inspired non-linear model."

**Q: Does Quantum-Inspired always win?**
> "No, and we say so explicitly in our benchmarking view. QI-ML has similar MAPE to XGBoost on this dataset, and QPSO runs slightly longer than basic PSO. The quantum advantage appears in solution quality (+11.3%) and convergence speed (+38%) for the multi-objective optimization problem — which is the core of Jalmarg deployment."

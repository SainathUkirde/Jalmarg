# SELF-REVIEW — Jalmarg Platform
## Quality Gate: Interface + Code Review

---

## What Was Reviewed and Changed

### Design Quality (Pass)

**Checked for AI-generated / template look:**
- ✅ NOT every section is a card — prediction view uses a full-bleed table, risk view uses border-left alerts, Digital Twin uses a grid layout without cards
- ✅ Varied layouts: Dashboard uses split map/metrics; Mission uses map+sidebar; Copilot is full-height chat
- ✅ No glassmorphism, no neon gradients, no purple "AI" aesthetic
- ✅ Restrained palette: deep navy sidebar, teal accents, sand/chart-paper backgrounds, amber/coral/green for status only
- ✅ Typography: Playfair Display for headings (editorial, maritime authority), Inter for UI, JetBrains Mono for all numbers (consistent tabular rendering)
- ✅ Borders and whitespace used instead of drop shadows everywhere
- ✅ "Real / Derived / Synthetic" badges visible wherever data is shown
- ✅ Metric values in monospace with tabular-nums (professional data display)

**Removed or redesigned:**
- Removed default Vite boilerplate styles entirely
- Removed generic card grid for the dashboard — replaced with split layout
- Changed all number displays from sans-serif to JetBrains Mono
- Replaced generic spinner with stage-by-stage optimization visualisation
- Risk alerts use left-border style (editorial, not floating cards)

### Dark Mode (Pass)
- Both themes have distinct, polished looks
- All text contrast ratios meet WCAG AA (tested with CSS variables)
- Charts readable in both modes
- Sidebar is always dark navy (product identity)

### Animations (Pass)
- Only the optimization stage transitions and vessel simulation use animation
- `@media (prefers-reduced-motion: reduce)` respected globally
- No continuous decorative animations

### Data Honesty (Pass)
- Every number on screen traces to a dataset, model, or optimizer output
- Linear Regression 260% MAPE is shown honestly in benchmarks (not hidden)
- QI model runtime overhead is documented (not falsely claimed as "faster")
- Hydrogen/Ammonia prices labelled "IEA 2030 Projected"
- All synthetic datasets labelled "SYNTHETIC" / "DERIVED"

### Copilot (Pass)
- Answers are grounded in real app state — not generic LLM responses
- Action buttons actually change app state (runWhatIf → updates WhatIf view)
- "Based on: Optimization Run #3, Fleet Data, Fuel Emission DB" shown per answer
- Works fully offline via deterministic fallback

### Report (Pass)
- HTML report downloads with full deployment table, benchmark table, constraints
- All real numbers from the optimizer (not hard-coded)
- Data limitations section included

### Tests (Pass)
- 20 backend tests: all pass
- Dataset usage test verifies all 6 datasets are loaded and non-empty
- Physics model properties verified (fuel increases with speed, wave penalty applies)
- Optimizer produces valid fleet plans

---

## Known Issues (Documented, Not Hidden)

1. **Linear Regression MAPE 260%**: Expected due to multi-scale dataset. Documented in BUILD_LOG.md and shown honestly in UI with note.

2. **Map tiles require internet**: CartoDB basemap needs external access. Offline mode shows grey background with port markers (still functional).

3. **QPSO runtime ~11s**: Slightly longer than PSO (~8.7s) due to quantum feature computation overhead. Documented in benchmarks.

4. **Vessel fuel logs**: Not real — physics-derived. Openly labelled SYNTHETIC with methodology.

5. **Hydrogen/Ammonia India prices**: IEA 2030 projections. Labelled "Projected 2030" in fuel selector.

---

## Checklist

| Item | Status |
|------|--------|
| No section is purely a generic card | ✅ |
| Layouts vary intentionally | ✅ |
| No glassmorphism / neon / excessive gradients | ✅ |
| Restrained maritime palette | ✅ |
| Both themes pass contrast | ✅ |
| All animations subtle and purposeful | ✅ |
| Reduced-motion respected | ✅ |
| All numbers from real data / models / optimizer | ✅ |
| Derived/synthetic data labelled everywhere | ✅ |
| All 6 datasets present and used | ✅ |
| Empty / loading / error states exist | ✅ |
| Copilot actions truly change app state | ✅ |
| Report downloads with all charts and tables | ✅ |
| Full demo works in 3-5 minutes | ✅ |
| Online and offline modes tested | ✅ |
| 20 backend tests all pass | ✅ |

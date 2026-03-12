# Nocturnist Scheduler — Project Context
## Last Updated: 2026-03-11

---

## Project Overview
Building a templated nocturnist schedule system for a physician group. The goal is to find optimal schedule patterns that maximize night coverage while providing rhythmic, predictable schedules. Physicians will rate proposed patterns AND submit individual preferences. The most desirable schedule will be presented to administration for approval.

---

## Response Contract
All AI responses on this project must follow `/RESPONSE_CONTRACT.md` in the repo:
- Execution first, minimal explanation
- Deterministic single-solution output
- Complete, runnable code
- No speculative improvements or alternatives unless requested

---

## Staffing Facts

| Parameter | Value |
|-----------|-------|
| Total nocturnists | 19 (all full-time, FTE adjustments coming later) |
| Target nights/year | 156 |
| Shift length | 10 hours |
| Nocturnist-nights/year | 2,964 |
| Total nightly slots | 12 |
| Total slots/year | 4,380 |
| Max nocturnist coverage | 67.7% |
| Gap (other staff) | 32.3% |

**Nightly staffing is firm at 12, but gaps are acceptable — other staff fill holes.**

---

## Hospitals

| Abbrev | Full Name | Nocturnists/Night |
|--------|-----------|-------------------|
| BEH | Baptist Easley Hospital | 1 |
| GMH | Greenville Memorial Hospital | 4 |
| GRMH | Greer Memorial Hospital | 2 |
| HMH | Hillcrest Memorial Hospital | 1 |
| LCH | Laurens County Memorial Hospital | 1 |
| NGH | North Greenville Hospital | 1 |
| OMH | Oconee Memorial Hospital | 2 |
| **TOTAL** | | **12** |

**Note:** "HH" in source data = HMH (Hillcrest Memorial Hospital).

---

## Physician Hospital Assignments

Each physician is assigned to 2-3 hospitals (one exception: Mulji at 100% LCH). No hospital exceeds 50% unless special circumstance.

| # | Physician | Site 1 | Site 2 | Site 3 | Site 4 |
|---|-----------|--------|--------|--------|--------|
| 1 | Diaz | GMH 33% | OMH 33% | LCH 15% | NGH 15% |
| 2 | Diamant | GMH 50% | LCH 30% | NGH 20% | |
| 3 | Cook | HMH 50% | NGH 50% | | |
| 4 | Cabanis | GMH 33% | GRMH 33% | HMH 34% | |
| 5 | Reyes | GMH 40% | GRMH 40% | OMH 20% | |
| 6 | Dupuis | GMH 40% | BEH 40% | NGH 20% | |
| 7 | Russell | GMH 40% | GRMH 40% | NGH 20% | |
| 8 | Farris | GMH 40% | HMH 30% | LCH 30% | |
| 9 | Johnson | HMH 30% | OMH 30% | GRMH 40% | |
| 10 | Shipley | LCH 40% | BEH 30% | NGH 30% | |
| 11 | Roth | GMH 50% | GRMH 30% | HMH 20% | |
| 12 | Bogart | OMH 40% | GMH 30% | BEH 30% | |
| 13 | Nicks | GMH 40% | HMH 30% | GRMH 30% | |
| 14 | Brittain | OMH 40% | BEH 30% | GMH 30% | |
| 15 | Wright | GRMH 40% | HMH 30% | LCH 30% | |
| 16 | Mulji | LCH 100% | | | |
| 17 | Moore | GRMH 40% | HMH 30% | LCH 30% | |
| 18 | Nagy | OMH 40% | BEH 30% | GRMH 30% | |
| 19 | Pitts | GMH 40% | OMH 30% | LCH 30% | |

---

## Schedule Patterns Under Evaluation

| ID | Label | On | Off | Cycle | ~Nights/Yr | Delta from 156 |
|----|-------|-----|------|-------|-------------|-----------------|
| 6on8off | 6 on / 8 off | 6 | 8 | 14 | 156 | 0 |
| 7on9off | 7 on / 9 off | 7 | 9 | 16 | 160 | +4 |
| 5on7off | 5 on / 7 off | 5 | 7 | 12 | 152 | -4 |
| 7on10off | 7 on / 10 off | 7 | 10 | 17 | 150 | -6 |
| 8on11off | 8 on / 11 off | 8 | 11 | 19 | 154 | -2 |

---

## Key Decisions Made

1. **Different patterns allowed per physician** — not everyone needs the same schedule
2. **Nightly staffing is firm at 12** — but nocturnist template doesn't need to fill every slot; other staff cover gaps
3. **19 physicians, all full-time at 156 nights/year** — FTE adjustments coming in a later iteration
4. **Hospital assignments are fixed** — each physician limited to 2-3 hospitals, never >50% at one unless special circumstance
5. **Two separate surveys:**
   - **Pattern rating survey** — anonymous, rates 5 schedule patterns on 5 factors
   - **Preference survey** — named (dropdown), collects individual scheduling constraints and preferences
6. **Both surveys are offline standalone `.html` files** — sent via text/email, work in any browser without internet
7. **Pattern survey return method:** copy-paste Base64 code, physician texts/emails it back manually
8. **Preference survey return method:** mailto: link opens pre-filled email with code in body, copy-paste as fallback
9. **Admin import tools** — separate routes in React app for each survey type
10. **Both mobile and desktop equally important** — responsive design required
11. **Rating factors for pattern survey (5 total, 1-5 scale per pattern):**
    - Work-life balance
    - Sleep/circadian rhythm friendliness
    - Weekend/holiday fairness
    - Consecutive nights tolerance
    - Schedule predictability
12. **Preference survey data points:**
    - Physician name (dropdown)
    - Preferred nights on per block (3-10)
    - Preferred days off per block (5-14)
    - Max consecutive nights tolerable (3-14)
    - Minimum off days to recover between blocks (3-14)
    - Most desired block start day
    - Least desired block start day
    - Start time ranking (8 PM, 9 PM, 10 PM, 11 PM)
    - End time ranking (5 AM, 6 AM, 7 AM, 8 AM)
    - Top 3 hospital preferences (physician chooses from all 7)
    - 1 alternate hospital
    - Desired percentage split across top 3 (must total 100%)
    - Commute time to every hospital (all 7, minutes)
    - Top 3 holidays (excluding Christmas/Thanksgiving)
    - Vacation/blackout dates (free text)
    - Childcare/family obligations (free text)
    - Swap willingness (yes/conditional/no)
    - Swap motivator rank (time off, location, rhythm, money)
    - Desirability factors: 4 questions, 3-point scale (not at all / somewhat / very much)
    - Constraints: max extra consecutive nights (0-5), min notice days (1-30), hospital flexibility, extra shift willingness
    - Block swap: full block willingness, trade flexibility, preferred block trade
    - Weekend: min weekends off/mo (0-4), extra weeknight for weekend, split block, weekend night rank, worse hospital for weekend
    - Schedule duration: template length (12mo/6mo/4mo/3mo), team switch likelihood (1-5 Likert), preferred switch block length (3mo/4mo/6mo, conditional on likelihood >= 3)
13. **Holiday options:** New Year's Eve, New Year's Day, Easter, Memorial Day, Independence Day, Labor Day, Halloween, Veterans Day
14. **Coding done in Claude Code** — tracked via GitHub repo `nocturnist-scheduler`
15. **Spreadsheet maintained separately** — for admin's own analysis/manipulation

---

## Project Phases

### Phase 1: Admin Pattern Explorer ✅ COMPLETE
- React app with pattern analysis dashboard
- 5 patterns with cycle viz, hospital coverage bars, stagger grid, comparison table
- GitHub repo: `nocturnist-scheduler` (private)
- Spreadsheet version also delivered (`nocturnist_schedule_analysis.xlsx`)

### Phase 2A: Anonymous Pattern Rating Survey ✅ COMPLETE
**Spec file:** `PHASE2_SPEC_v2.md`
- `survey.html` — standalone offline file, dark theme, mobile responsive
- Welcome → Pattern walkthrough (cycle viz, stats, 8-week calendar, 5-factor rating per pattern) → Overall drag-to-rank → Copy-paste Base64 code
- Admin import at `/admin/import` — paste codes, first-place votes chart, avg rank chart, rank distribution table, factor heatmap, grouped bar chart, per-factor winners, comments, CSV/JSON export
- localStorage key: `nocturnist_survey_responses`

### Phase 2B: Named Preference Survey ✅ COMPLETE
**Spec file:** `PREFERENCES_SPEC.md`
- `preferences.html` — standalone offline file, dark theme, mobile responsive
- 10 screens: physician dropdown → block prefs (sliders) → day/time (buttons + rank lists) → location (hospital dropdowns + commute inputs) → holidays (tap-to-rank) → swap & collaboration (willingness + motivator rank + desirability factors + constraints) → block & weekend swaps (block swap prefs + weekend prefs + weekend night rank) → schedule duration preferences (template length + team switch likelihood + preferred switch block) → review summary → Base64 code + mailto link
- Admin import at `/admin/preferences` — paste codes, submitted/missing tracker (X of 19), aggregate dashboard (block histograms, day heatmap with callouts, time rank charts with consensus indicator, hospital popularity + avg commute, holiday ranking, swap willingness pie chart, motivator rankings bar chart, desirability stacked bars, constraints summary, block swap summary, weekend summary with night priority), individual physician view, CSV/JSON export
- localStorage key: `nocturnist_preferences`

### Phase 3: Personalized Schedule Preview (PLANNED)
- Calendar view showing each physician's actual schedule under chosen pattern
- Hospital rotation based on assignment percentages
- "What does MY year look like" view

### Phase 4: Mock Template Schedule (PLANNED)
- Build full templated schedule using winning pattern(s) + preference data
- Assign all 19 physicians across 7 hospitals respecting percentages and preferences
- Present to nocturnists for approval rating
- Iterate until satisfactory

### Phase 5: Administration Presentation (PLANNED)
- Final schedule presented to administration for sign-off

---

## Repo Structure (actual after Phase 2)

```
nocturnist-scheduler/
├── public/
├── src/
│   ├── index.js                   # Router: /, /admin/import, /admin/preferences
│   ├── App.js                     # Phase 1: Pattern Explorer dashboard
│   ├── components/
│   │   ├── PatternCard.js         # Pattern selection cards
│   │   ├── DetailPanel.js         # Selected pattern detail view
│   │   ├── ComparisonTable.js     # Side-by-side pattern comparison
│   │   ├── CycleViz.js           # Cycle visualization
│   │   ├── HospitalBar.js        # Hospital coverage bars
│   │   └── StaggerGrid.js        # Stagger group grid
│   ├── pages/
│   │   ├── AdminImport.js         # Phase 2A: anonymous survey import + aggregate
│   │   └── AdminPreferences.js    # Phase 2B: preference import + per-physician + aggregate
│   ├── data/
│   │   └── constants.js           # Hospitals, patterns, physicians, rating factors
│   └── utils/
│       └── calc.js                # Coverage, stagger math
├── survey.html                    # Phase 2A: anonymous pattern rating (offline)
├── preferences.html               # Phase 2B: named preference collection (offline)
├── PHASE2_SPEC_v2.md
├── PREFERENCES_SPEC.md
├── physician_assignments.md
├── PROJECT_CONTEXT.md
└── package.json
```

---

## Tools & Environment

| Tool | Purpose |
|------|---------|
| Claude (chat) | Planning, specs, spreadsheets, context |
| Claude Code | All coding/development |
| GitHub | Version control (`nocturnist-scheduler` private repo) |
| Windows | Development OS |
| Node.js | Installed, working |
| GitHub CLI (`gh`) | Installed, authenticated |

---

## Naming Conventions
- Physician names: capitalize first letter (e.g., "Diaz" not "diaz")
- Hospital abbreviations: ALL CAPS (e.g., "GMH" not "gmh")
- Pattern IDs: lowercase no spaces (e.g., "6on8off")
- Rating factor keys: `wlb`, `sleep`, `wknd`, `consec`, `predict`
- Preference survey localStorage key: `nocturnist_preferences`
- Pattern survey localStorage key: `nocturnist_survey`

---

## Open Items
- [ ] FTE adjustments per physician (future iteration)
- [ ] Hospital assignment percentage validation against actual slot math
- [x] `survey.html` — ✅ built (Phase 2A)
- [x] Admin import tool for survey — ✅ built at `/admin/import` (Phase 2A)
- [x] `preferences.html` — ✅ built (Phase 2B)
- [x] Admin preferences import tool — ✅ built at `/admin/preferences` (Phase 2B)
- [ ] Personalized calendar preview (Phase 3)
- [x] Admin email address set to `kydiazdo@gmail.com` in `preferences.html`

# Nocturnist Scheduler — Project Context
## Last Updated: 2026-03-12

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

## Schedule Patterns Under Evaluation (9 patterns)

### Simple Patterns (4)

| ID | Label | Cycle | ~Nights/Yr | Delta from 156 | Max Consecutive |
|----|-------|-------|-------------|-----------------|-----------------|
| 6on8off | 6 on / 8 off | 14 | 156 | 0 | 6 |
| 7on9off | 7 on / 9 off | 16 | 160 | +4 | 7 |
| 5on7off | 5 on / 7 off | 12 | 152 | -4 | 5 |
| 7on10off | 7 on / 10 off | 17 | 150 | -6 | 7 |

### Split-Block Patterns (5)

| ID | Label | Cycle | ~Nights/Yr | Delta from 156 | Max Consecutive |
|----|-------|-------|-------------|-----------------|-----------------|
| 4on1off3on8off | 4 on / 1 off / 3 on / 8 off | 16 | 160 | +4 | 4 |
| 3on1off3on7off | 3 on / 1 off / 3 on / 7 off | 14 | 156 | 0 | 3 |
| 3on1off3on8off | 3 on / 1 off / 3 on / 8 off | 15 | 146 | -10 | 3 |
| 4on1off2on7off | 4 on / 1 off / 2 on / 7 off | 14 | 156 | 0 | 4 |
| 3on2off3on6off | 3 on / 2 off / 3 on / 6 off | 14 | 156 | 0 | 3 |

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
7. **Pattern survey return method:** auto-submit to Google Sheet via Apps Script + copy-paste Base64 code as fallback
8. **Preference survey return method:** auto-submit to Google Sheet via Apps Script + mailto link + copy-paste as fallback
9. **Admin import tools** — separate routes in React app for each survey type
10. **Both mobile and desktop equally important** — responsive design required
11. **Survey v2.1 rating per schedule variant:** overall 1-5 stars + accept yes/no + optional comment (replaced 5-factor rating system)
    - 63 variants (9 patterns × 7 start days) with real Apr–Jun 2026 calendar dates
    - 4 simple patterns + 5 split-block patterns (removed 8on11off, added split-blocks)
    - Split-block calendar rendering with mini-break visual distinction (gold dashed) vs recovery days off
    - Stratified sampling: 14 per respondent, at least 1 per pattern, max 3 per pattern
    - Top 3 selection replaces drag-to-rank
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
16. **Auto-submit via Google Apps Script** — both survey.html and preferences.html POST to a Google Apps Script web app that appends rows to a Google Sheet. Uses `no-cors` mode + `text/plain` Content-Type to avoid CORS preflight. Config in `config.js`. Manual copy/email fallback preserved.
17. **Admin fetch from Google Sheet** — both admin pages (AdminImport, AdminPreferences) have a "Fetch from Google Sheet" button that calls the Apps Script `doGet(?sheet=...)` endpoint, decodes each row's Base64 payload, and imports into localStorage. Deduplicates by timestamp (survey) or physician name with latest-wins (preferences).

---

## Project Phases

### Phase 1: Admin Pattern Explorer ✅ COMPLETE
- React app with pattern analysis dashboard
- 5 patterns with cycle viz, hospital coverage bars, stagger grid, comparison table
- GitHub repo: `nocturnist-scheduler` (private)
- Spreadsheet version also delivered (`nocturnist_schedule_analysis.xlsx`)

### Phase 2A: Schedule Rating Survey v2.1 ✅ REBUILT
**Spec file:** `PHASE2_SPEC_v2.md`
- `survey.html` — standalone offline file, dark theme, mobile responsive
- **v2.1 update**: 9 patterns (4 simple + 5 split-block), 63 variants, 14 per respondent
- Split-block patterns render with mini-break visual distinction (gold dashed cells) and descriptive text
- Calendar legend adapts: shows mini-break swatch only for split-block patterns
- 63 pre-generated variants (9 patterns × 7 start days), stratified random sampling selects 14 per respondent
- Sampling: at least 1 from each of 9 patterns, no more than 3 from any single pattern
- Welcome → 14 schedule reviews (3-month calendar, overall 1-5 rating, accept yes/no, optional comment) → Pick top 3 → Copy-paste Base64 code
- Output format: `surveyVersion: "2.1"`, `variantsPresented` (14 variant IDs), `ratings` (14 objects with variantId/patternId/startDay/overall/accept/comment), `top3` (3 variant IDs)
- Variant ID format: `{patternId}__{startDay}` (double underscore)
- Admin import at `/admin/import` — needs update to support v2.1 data format (9×7 variant heatmap, acceptance rates, pattern/start-day aggregates, top 3 frequency) + backward compat with v2.0
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
├── config.js                      # Shared config (APPS_SCRIPT_URL for auto-submit)
├── google-apps-script/
│   ├── receiver.gs                # Google Apps Script doPost/doGet receiver
│   └── SETUP.md                   # Deployment instructions
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
- [x] `survey.html` — ✅ rebuilt v2.0 with real dates + variant system (Phase 2A)
- [ ] Admin import tool for survey — needs update at `/admin/import` to support v2.0 data format
- [x] `preferences.html` — ✅ built (Phase 2B)
- [x] Admin preferences import tool — ✅ built at `/admin/preferences` (Phase 2B)
- [ ] Personalized calendar preview (Phase 3)
- [x] Admin email address set to `kydiazdo@gmail.com` in `preferences.html`

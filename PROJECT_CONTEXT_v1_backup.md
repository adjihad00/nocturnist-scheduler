# Nocturnist Scheduler — Project Context
## Last Updated: 2026-03-11

---

## Project Overview
Building a templated nocturnist schedule system for a physician group. The goal is to find optimal schedule patterns that maximize night coverage while providing rhythmic, predictable schedules. Physicians will rate proposed patterns, and the most desirable schedule will be presented to administration for approval.

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
| BEH | Baylor Emergency Hospital | 1 |
| GMH | Good Methodist Hospital | 4 |
| GRMH | Grand Memorial Hospital | 2 |
| HMH | Highland Medical Hospital | 1 |
| LCH | Lake Charles Hospital | 1 |
| NGH | North General Hospital | 1 |
| OMH | Oakmont Medical Hospital | 2 |
| **TOTAL** | | **12** |

**Note:** "HH" in source data = HMH (Highland Medical Hospital).

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
5. **Survey is anonymous** — no names, no tracking, aggregate results only
6. **Survey delivery: offline standalone HTML** — single `.html` file sent via text/email, works in any browser without internet
7. **Survey return method: copy-paste code** — Base64-encoded response string displayed on screen, physician texts/emails it back
8. **Admin import tool** — separate tool in the React app that accepts pasted codes and shows aggregate results
9. **Both mobile and desktop equally important** — responsive design required
10. **Rating factors (5 total, 1-5 scale per pattern):**
    - Work-life balance
    - Sleep/circadian rhythm friendliness
    - Weekend/holiday fairness
    - Consecutive nights tolerance
    - Schedule predictability
11. **Overall ranking** — physicians drag-to-rank all 5 patterns best to worst
12. **One optional free-text comment** — not per-pattern, just one overall
13. **Coding done in Claude Code** — tracked via GitHub repo `nocturnist-scheduler`
14. **Spreadsheet maintained separately** — for admin's own analysis/manipulation

---

## Project Phases

### Phase 1: Admin Pattern Explorer ✅ COMPLETE
- React app with pattern analysis dashboard
- 5 patterns with cycle viz, hospital coverage bars, stagger grid, comparison table
- Deployed locally via `npx create-react-app`
- GitHub repo: `nocturnist-scheduler` (private)
- Spreadsheet version also delivered (`nocturnist_schedule_analysis.xlsx`)

### Phase 2: Physician Survey + Admin Import (CURRENT)
**Deliverable A — `survey.html` (critical path):**
- Standalone offline HTML file, no dependencies
- Welcome → Pattern walkthrough with ratings → Overall ranking → Copy-paste code screen
- Dark theme, mobile-responsive, touch-friendly

**Deliverable B — Admin import route (`/admin/import`):**
- Paste physician codes → decode → aggregate
- Charts: ranking distribution, factor heatmap, per-factor winners
- Response count tracker (X of 19)
- Export CSV + raw JSON backup
- localStorage persistence on admin machine

**Spec file:** `PHASE2_SPEC_v2.md` in repo

### Phase 3: Personalized Schedule Preview (PLANNED)
- Calendar view showing each physician's actual schedule under chosen pattern
- Hospital rotation based on assignment percentages
- "What does MY year look like" view

### Phase 4: Mock Template Schedule (PLANNED)
- Build full templated schedule using winning pattern(s)
- Assign all 19 physicians across 7 hospitals respecting percentages
- Present to nocturnists for approval rating
- Iterate until satisfactory

### Phase 5: Administration Presentation (PLANNED)
- Final schedule presented to administration for sign-off

---

## Repo Structure (expected after Phase 2)

```
nocturnist-scheduler/
├── public/
├── src/
│   ├── App.js                  # Router: /admin, /admin/import, future /survey
│   ├── components/
│   │   ├── PatternExplorer.js  # Phase 1 admin dashboard
│   │   ├── AdminImport.js      # Phase 2 code import + aggregate
│   │   └── ...
│   ├── data/
│   │   ├── hospitals.js        # Hospital definitions
│   │   ├── patterns.js         # 5 schedule patterns
│   │   └── physicians.js       # 19 physician assignments
│   └── utils/
│       └── calculations.js     # Shared math (coverage, stagger, etc.)
├── survey.html                 # Standalone offline survey file
├── PHASE2_SPEC_v2.md
├── physician_assignments.md
├── RESPONSE_CONTRACT.md
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

---

## Open Items
- [ ] FTE adjustments per physician (future iteration)
- [ ] Hospital assignment percentage validation against actual slot math
- [ ] Survey `.html` file — not yet built
- [ ] Admin import tool — not yet built
- [ ] Personalized calendar preview (Phase 3)

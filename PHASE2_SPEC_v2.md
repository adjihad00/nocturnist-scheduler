# Phase 2 Spec: Offline Survey + Admin Import Tool

## Overview
Two deliverables:
1. **Standalone offline HTML survey** — single `.html` file sent to physicians via text/email. Works in any browser, no internet required. Generates a copy-paste code with their responses.
2. **Admin import tool** — added to the existing React app at `/admin/import`. Accepts pasted codes, decodes, aggregates, and visualizes results.

---

## Deliverable 1: Offline Survey (`survey.html`)

### Requirements
- Single self-contained `.html` file (all CSS/JS inline, no external dependencies)
- Works offline in any mobile or desktop browser
- Mobile-responsive (iPhone SE through desktop)
- Dark theme consistent with main app
- Touch-friendly (min 44px tap targets)

### Survey Flow

#### Screen 1: Welcome
- Brief intro: "This survey helps us find the best nocturnist schedule for our group. You'll review 5 schedule patterns and rate each one. Takes about 5-10 minutes."
- "Start Survey" button

#### Screen 2: Pattern Review + Rating (repeated for each of 5 patterns)
- Progress bar: "Pattern 1 of 5"
- Pattern name and summary: e.g. "6 on / 8 off — You work 6 consecutive nights, then get 8 nights off. ~156 nights/year."
- Visual cycle strip: colored blocks showing on/off days in one cycle
- Key stats:
  - Consecutive nights worked
  - Consecutive nights off
  - Approximate weekends worked per month
  - Total nights per year
- 8-week mini calendar preview: color-coded on/off days
- Rating section — rate THIS pattern on 5 factors (1-5 scale, button row):
  1. Work-life balance
  2. Sleep/circadian rhythm friendliness
  3. Weekend/holiday fairness
  4. Consecutive nights tolerance
  5. Schedule predictability
- All 5 factors must be rated before "Next Pattern" button enables

#### Screen 3: Overall Ranking
- Drag-to-rank (or tap-to-rank on mobile) all 5 patterns from most preferred to least preferred
- One optional free-text comment box

#### Screen 4: Result Code
- Header: "Survey Complete — Thank You!"
- Generated code displayed in a highlighted text box (Base64-encoded JSON)
- Large "Copy Code" button (uses clipboard API with fallback to select-all)
- Instructions: "Copy the code above and send it to [ADMIN_EMAIL/PHONE — placeholder] via text or email. Subject line: Schedule Survey"
- Visual confirmation when copied (checkmark + "Copied!")

### Code Format
Base64-encoded JSON:
```json
{
  "v": 1,
  "ts": "2026-03-11T...",
  "ratings": {
    "6on8off":  { "wlb": 4, "sleep": 3, "wknd": 2, "consec": 4, "predict": 5 },
    "7on9off":  { "wlb": 3, "sleep": 4, "wknd": 3, "consec": 3, "predict": 4 },
    "5on7off":  { "wlb": 5, "sleep": 5, "wknd": 4, "consec": 5, "predict": 3 },
    "7on10off": { "wlb": 4, "sleep": 4, "wknd": 3, "consec": 4, "predict": 3 },
    "8on11off": { "wlb": 2, "sleep": 2, "wknd": 2, "consec": 2, "predict": 4 }
  },
  "ranking": ["5on7off", "6on8off", "7on9off", "7on10off", "8on11off"],
  "comment": "I prefer shorter stretches."
}
```

---

## Deliverable 2: Admin Import Tool (React, in existing app)

### Route: `/admin/import`

### Features

#### Code Input
- Large text area: "Paste a physician response code here"
- "Add Response" button — decodes Base64, validates schema, adds to state
- Running count: "12 of 15 responses imported"
- Error handling: "Invalid code" message if decode fails
- Duplicate detection by timestamp (warn but allow override)

#### Aggregate Dashboard (appears after 1+ responses imported)

##### Overall Ranking
- Bar chart: number of #1 votes per pattern
- Average rank per pattern (1 = best)
- Table with rank distribution (how many 1st, 2nd, 3rd, 4th, 5th place votes each pattern got)

##### Factor Ratings
- Heatmap: patterns (rows) × factors (columns), cells colored by average score
- Grouped bar chart: average score per factor, grouped by pattern
- Per-factor winner callout: "Best for sleep: 5 on / 7 off (avg 4.2)"

##### Response Summary
- Total responses: X of 15
- Anonymous comments listed
- Export all results as CSV button

#### Data Persistence
- Store imported responses in localStorage on admin's machine
- "Clear All Data" button with confirmation
- "Export Raw JSON" button for backup

---

## Patterns Reference

| ID | Label | On | Off | Cycle | ~Nights/Yr |
|----|-------|-----|------|-------|-------------|
| 6on8off | 6 on / 8 off | 6 | 8 | 14 | 156 |
| 7on9off | 7 on / 9 off | 7 | 9 | 16 | 160 |
| 5on7off | 5 on / 7 off | 5 | 7 | 12 | 152 |
| 7on10off | 7 on / 10 off | 7 | 10 | 17 | 150 |
| 8on11off | 8 on / 11 off | 8 | 11 | 19 | 154 |

## Rating Factors

| Key | Label | Description |
|-----|-------|-------------|
| wlb | Work-life balance | How well does this pattern support your personal life? |
| sleep | Sleep/circadian rhythm | How manageable is the sleep transition on this pattern? |
| wknd | Weekend/holiday fairness | How fair is the weekend/holiday distribution? |
| consec | Consecutive nights | How tolerable is the consecutive night stretch? |
| predict | Schedule predictability | How easy is it to plan your life around this pattern? |

## Tech Notes
- Survey HTML: vanilla JS only, no frameworks, no build step
- Admin tool: React + Recharts, added to existing app via React Router
- Base64 encoding: btoa/atob with UTF-8 handling
- Clipboard: navigator.clipboard.writeText with fallback

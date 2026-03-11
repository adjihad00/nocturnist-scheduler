# Phase 2 Spec: Physician-Facing Schedule Explorer & Rating System

## Overview
Add a physician-facing experience to the existing nocturnist schedule app. Physicians view what each schedule pattern looks like as a personal calendar, understand their hospital rotation, and anonymously rate each pattern. Admin sees aggregate results.

## Architecture
- Mobile-responsive (phone + desktop equally important)
- Two views: Admin Dashboard (existing Phase 1) and Physician Survey (new)
- Add React Router: `/admin` for existing explorer, `/survey` for physician view
- Anonymous — no login, no tracking, no names stored

## Data Model Addition

```js
// Hospital assignments per physician (PLACEHOLDER — will be replaced with real data)
const PHYSICIANS = [
  { id: "MD01", hospitals: [{ name: "GMH", pct: 40 }, { name: "GRMH", pct: 35 }, { name: "BEH", pct: 25 }] },
  { id: "MD02", hospitals: [{ name: "GMH", pct: 50 }, { name: "OMH", pct: 30 }, { name: "LCH", pct: 20 }] },
  // ... 15 total
];
// Constraint: no hospital > 50% unless flagged as special circumstance
// Each physician assigned to 2-3 hospitals
```

## Physician Survey View (`/survey`)

### Screen 1: Pattern Walkthrough
For each of the 5 patterns (6on/8off, 7on/9off, 5on/7off, 7on/10off, 8on/11off):
- **Calendar preview**: Show 8-week sample calendar with on/off days color-coded
- **Block stats**: consecutive nights count, off-stretch length, weekends on vs off over 8 weeks
- **Plain-english summary**: e.g. "You work 6 nights, then get 8 nights off. Over a year you'd work ~156 nights. Roughly 3 out of 8 weekends you'd be working."

### Screen 2: Rating
After viewing all 5 patterns, physician rates EACH pattern on these 5 factors (1-5 scale, 1=poor, 5=excellent):
1. Work-life balance
2. Sleep/circadian rhythm friendliness
3. Weekend/holiday fairness
4. Consecutive nights tolerance
5. Schedule predictability

Also include:
- Overall preference ranking (drag-to-rank all 5 patterns, best to worst)
- One optional free-text comment box (not per-pattern, just one overall)

### Screen 3: Confirmation
- "Your response has been recorded. Thank you."
- Show their rankings back to them as confirmation
- No way to identify who submitted

## Admin Dashboard Additions (`/admin`)

### Aggregate Results Panel
- Bar chart: average rating per factor per pattern
- Overall ranking distribution (how many #1 votes each pattern got)
- Heatmap: patterns × factors showing average scores
- Response count (X of 15 submitted)
- Optional: free-text comments listed anonymously

## Storage
- For MVP: use localStorage to accumulate survey responses on a single device
- Each submission appended to a JSON array
- Admin view reads from same localStorage
- Future: migrate to a backend/database when ready for multi-device

## UI/UX Requirements
- Mobile-first responsive layout (works on iPhone SE through desktop)
- Touch-friendly: large tap targets for ratings (min 44px)
- Swipeable pattern cards on mobile
- Progress indicator showing which pattern they're rating
- Dark theme consistent with existing admin dashboard
- Smooth transitions between patterns

## Rating Widget Spec
- 5 stars or 5-point button row per factor
- Selected state: bright accent color
- Unselected: muted outline
- Must complete all 5 factors for each pattern before proceeding

## Tech Stack
- React (existing)
- React Router for `/admin` and `/survey` routes
- Recharts for admin aggregate charts
- CSS-in-JS consistent with existing app (inline styles or migrate to Tailwind)
- No backend for MVP

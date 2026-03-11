# Preference Survey Spec: Physician Schedule Preferences Collection

## Overview
Standalone offline `.html` file sent to physicians via text/email. Collects named schedule preferences and constraints. On submit, opens a pre-filled mailto: link with the encoded response data. Admin imports codes into a companion tool that aggregates results by physician and by group trend.

This is a SEPARATE tool from the anonymous pattern rating survey (Phase 2). This one is **named** and collects **individual preferences** to inform schedule construction.

---

## Deliverable A: `preferences.html` (Standalone Offline Survey)

### Requirements
- Single self-contained `.html` file (all CSS/JS inline, no external dependencies)
- Works offline in any mobile or desktop browser
- Mobile-responsive (iPhone SE through desktop)
- Dark theme consistent with main app
- Touch-friendly (min 44px tap targets)

### Survey Flow

#### Screen 1: Physician Identification
- Dropdown: select name from list of 19 physicians:
  Bogart, Brittain, Cabanis, Cook, Diamant, Diaz, Dupuis, Farris, Johnson, Moore, Mulji, Nagy, Nicks, Pitts, Reyes, Roth, Russell, Shipley, Wright
- "Continue" button (disabled until name selected)

#### Screen 2: Block Preferences
- **Preferred nights ON per block**: number input or slider (range 3–10, step 1)
- **Preferred days OFF per block**: number input or slider (range 5–14, step 1)
- **Max consecutive nights you can tolerate**: number input or slider (range 3–14, step 1)
- **Minimum off days needed between blocks to recover**: number input or slider (range 3–14, step 1)

#### Screen 3: Day & Time Preferences
- **Least desired day of the week to work**: single-select buttons (Mon–Sun)
- **Most desired day of the week to work**: single-select buttons (Mon–Sun), cannot match least desired
- **Rank start times most to least desirable**: drag-to-rank (or tap-to-rank on mobile): 8 PM, 9 PM, 10 PM, 11 PM
- **Rank end times most to least desirable**: drag-to-rank: 5 AM, 6 AM, 7 AM, 8 AM

#### Screen 4: Location Preferences
- **Top 3 hospital preferences** (rank 1st, 2nd, 3rd): select from all 7 hospitals (BEH, GMH, GRMH, HMH, LCH, NGH, OMH). Each dropdown filters out already-selected hospitals.
- **1 alternate location if top 3 unavailable**: select from remaining 4 hospitals
- **Commute time to each assigned hospital**: show only the physician's assigned hospitals (looked up from data model by selected name). Input field per hospital in minutes.

#### Screen 5: Holidays & Availability
- **Top 3 ranking holidays** (excluding Christmas and Thanksgiving): rank from this list:
  New Year's Eve, New Year's Day, Easter, Memorial Day, Independence Day (July 4th), Labor Day, Halloween, Veterans Day
- **Planned vacation / blackout dates**: free text field, placeholder: "e.g., June 10-17, August 1-5, Dec 20-Jan 2"
- **Childcare or family obligations on specific days**: free text field, placeholder: "e.g., Every Tuesday — school pickup, Fridays — custody schedule"

#### Screen 6: Collaboration
- **Willingness to swap blocks with colleagues**: single-select: "Yes — anytime", "Conditional — depends on the swap", "No — prefer to keep my schedule fixed"
- **Preferred partner for block swaps (if any)**: optional dropdown from the 19 physicians list (with "No preference" option), can select up to 3

#### Screen 7: Review & Submit
- Summary of all responses in a clean readable format
- "Edit" links next to each section to jump back
- "Submit" button

#### Screen 8: Submit Confirmation
- Generate Base64-encoded JSON string
- Display code in a highlighted text box with "Copy Code" button
- "Email to Admin" button: `mailto:ADMIN_EMAIL_PLACEHOLDER?subject=Schedule%20Preferences%20-%20{PHYSICIAN_NAME}&body={BASE64_CODE}`
- Instructions: "Tap 'Email to Admin' to send your preferences. If your email app doesn't open, copy the code above and text/email it to [ADMIN_CONTACT_PLACEHOLDER]."
- Confirmation checkmark animation

### Code Format
Base64-encoded JSON:
```json
{
  "v": 1,
  "type": "preferences",
  "ts": "2026-03-11T...",
  "physician": "Farris",
  "block": {
    "nights_on": 6,
    "days_off": 8,
    "max_consecutive": 7,
    "min_recovery": 5
  },
  "days": {
    "least_desired": "Saturday",
    "most_desired": "Wednesday"
  },
  "times": {
    "start_rank": ["9 PM", "10 PM", "8 PM", "11 PM"],
    "end_rank": ["7 AM", "6 AM", "5 AM", "8 AM"]
  },
  "locations": {
    "top3": ["GMH", "HMH", "LCH"],
    "alternate": "GRMH",
    "commute_minutes": { "GMH": 20, "HMH": 35, "LCH": 45 }
  },
  "holidays": {
    "top3": ["Independence Day", "Easter", "Labor Day"]
  },
  "availability": {
    "vacation_blackout": "June 10-17, August 1-5",
    "family_obligations": "Every Tuesday — school pickup"
  },
  "collaboration": {
    "swap_willingness": "conditional",
    "preferred_partners": ["Bogart", "Nicks"]
  }
}
```

---

## Deliverable B: Admin Preference Import Tool

### Route: `/admin/preferences` (in existing React app)

### Features

#### Code Input
- Large text area: "Paste a physician preference code here"
- "Import" button — decodes Base64, validates schema, adds to state
- Running count with physician names: "8 of 19 received" + list of who has/hasn't submitted
- Error handling: invalid code message, duplicate physician warning (allow overwrite)

#### Individual View
- Select any imported physician from a dropdown
- See all their preferences in a formatted card layout
- Print-friendly view

#### Aggregate Dashboard

##### Block Preferences
- Distribution chart: preferred nights on (histogram)
- Distribution chart: preferred days off (histogram)
- Average and range for max consecutive tolerance
- Average and range for minimum recovery days

##### Day Preferences
- Heatmap: day of week × least/most desired (how many picked each day)
- Clear visual: "Most avoided day: Saturday (12 of 19)" style callouts

##### Time Preferences
- Average rank per start time (bar chart)
- Average rank per end time (bar chart)
- Consensus indicator: highlight if strong agreement exists

##### Location Preferences
- Hospital popularity ranking (how many times each appeared in top 3)
- Average commute times per hospital
- Alternate location distribution

##### Holiday Preferences
- Holiday ranking by aggregate votes
- "Most requested off: Independence Day (14 of 19)" style callouts

##### Collaboration
- Swap willingness breakdown (pie chart: yes/conditional/no)
- Swap partner network (who wants to swap with whom — simple list, not a graph)

##### Tracking
- Missing responses list with names
- "Export All as CSV" button
- "Export Raw JSON" button

#### Data Persistence
- localStorage on admin machine
- "Clear All" with confirmation
- Separate from the anonymous survey data (different localStorage key)

---

## Physician → Hospital Assignment Lookup

Used in Screen 4 to show commute fields only for assigned hospitals:

```js
const PHYSICIAN_HOSPITALS = {
  "Diaz": ["GMH", "OMH", "LCH", "NGH"],
  "Diamant": ["GMH", "LCH", "NGH"],
  "Cook": ["HMH", "NGH"],
  "Cabanis": ["GMH", "GRMH", "HMH"],
  "Reyes": ["GMH", "GRMH", "OMH"],
  "Dupuis": ["GMH", "BEH", "NGH"],
  "Russell": ["GMH", "GRMH", "NGH"],
  "Farris": ["GMH", "HMH", "LCH"],
  "Johnson": ["HMH", "OMH", "GRMH"],
  "Shipley": ["LCH", "BEH", "NGH"],
  "Roth": ["GMH", "GRMH", "HMH"],
  "Bogart": ["OMH", "GMH", "BEH"],
  "Nicks": ["GMH", "HMH", "GRMH"],
  "Brittain": ["OMH", "BEH", "GMH"],
  "Wright": ["GRMH", "HMH", "LCH"],
  "Mulji": ["LCH"],
  "Moore": ["GRMH", "HMH", "LCH"],
  "Nagy": ["OMH", "BEH", "GRMH"],
  "Pitts": ["GMH", "OMH", "LCH"]
};
```

---

## Tech Notes
- `preferences.html`: vanilla JS only, no frameworks, no build step
- Admin tool: React + Recharts, added to existing app via React Router
- Base64 encoding: btoa/atob with UTF-8 handling
- mailto: URI-encode the body, cap at ~2000 chars for compatibility (Base64 payload should fit)
- Clipboard: navigator.clipboard.writeText with fallback
- localStorage keys: `nocturnist_preferences` (separate from `nocturnist_survey`)

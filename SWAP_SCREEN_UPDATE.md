# Swap & Collaboration Screen Update

## Task
Replace Screen 6 (Collaboration) in `preferences.html` and update the corresponding section in `AdminPreferences.js`. Remove the "Preferred swap partners" question entirely. Replace with swap desirability criteria detailed below.

## Updated Screen 6: Swap & Collaboration

### Section A: Swap Willingness (keep existing)
- **Willingness to swap blocks with colleagues**: single-select buttons
  - "Yes — anytime"
  - "Conditional — depends on the swap"
  - "No — prefer to keep my schedule fixed"

### Section B: Swap Motivators (NEW)
- **Rank what motivates you most in a swap** (drag-to-rank or tap-to-rank, 1=most important):
  1. Time off (longer or better-timed off-stretches)
  2. Location (preferred hospital assignment)
  3. Schedule rhythm (maintaining consistent on/off pattern)
  4. Money (premium pay for extra coverage)

### Section C: Swap Desirability Factors (NEW)
For each factor, physician selects how much it would increase their likelihood of accepting a swap (Not at all / Somewhat / Very much — 3-point button row):

- "I'd be **more likely** to accept a swap if it moves me to a **preferred hospital location**"
- "I'd be **more likely** to accept a swap if it gives me a **preferred start or end time**"
- "I'd be **more likely** to accept a swap if it helps me **avoid a specific day of the week**"
- "I'd be **more likely** to accept a swap if it gives me a **longer off-stretch**"

### Section D: Swap Constraints (NEW)
- **Max additional consecutive nights you'd accept in a swap**: number input or slider (range 0–5, step 1, default 2)
- **Minimum notice needed to consider a swap**: number input or slider (range 1–30 days, step 1, default 7)
- **Hospital flexibility for swaps**: single-select buttons
  - "Same hospital only"
  - "Any of my assigned hospitals"
  - "Any hospital including ones I'm not usually assigned to"
- **Willing to pick up an extra shift (not just trade) for premium pay?**: single-select buttons
  - "Yes"
  - "Maybe — depends on timing"
  - "No"

### Section E: Block Swaps (NEW)
- **Willing to swap an entire on-block with another physician?**: single-select buttons
  - "Yes — happy to trade full blocks"
  - "Maybe — depends on the details"
  - "No — I don't want to trade full blocks"
- **Block trade flexibility**: single-select buttons
  - "Equal length only — I'll only trade my 6 for another 6"
  - "Flexible — I'd accept uneven trades (e.g. my 6 for their 7)"
- **Willing to swap a preferred block (e.g. holiday week) in exchange for a less preferred block later?**: single-select buttons
  - "Yes — I'll bank a bad block to protect a good one"
  - "Maybe — depends on what I'm giving up"
  - "No — I want to keep my assigned blocks as-is"

### Section F: Weekend Swaps (NEW)
- **Minimum weekends off per month**: number input or slider (range 0–4, step 1, default 1)
- **Willing to work an extra weeknight to get a weekend night off?**: single-select buttons
  - "Yes"
  - "Maybe — depends on which weeknight"
  - "No"
- **Willing to split a block to get a weekend off?** (e.g. work Mon–Fri, swap out Sat–Sun, resume Mon): single-select buttons
  - "Yes — I'd break a block for a weekend off"
  - "Maybe — only for important weekends"
  - "No — I prefer unbroken blocks"
- **Rank weekend nights by importance** (drag-to-rank or tap-to-rank, 1=most important to have off):
  1. Friday night
  2. Saturday night
  3. Sunday night
- **Would accept a less preferred hospital assignment to get a weekend off?**: single-select buttons
  - "Yes"
  - "Maybe — depends on the hospital"
  - "No"

---

## Updated JSON Schema for Swap Section

Replace the existing `collaboration` key in the output JSON with:

```json
"collaboration": {
  "swap_willingness": "conditional",
  "motivator_rank": ["time_off", "location", "rhythm", "money"],
  "desirability": {
    "preferred_location": "very_much",
    "preferred_time": "somewhat",
    "avoid_day": "not_at_all",
    "longer_off": "very_much"
  },
  "constraints": {
    "max_extra_consecutive": 2,
    "min_notice_days": 7,
    "hospital_flexibility": "assigned_only",
    "extra_shift_premium": "maybe"
  },
  "block_swap": {
    "willing_full_block": "yes",
    "trade_flexibility": "flexible",
    "preferred_block_trade": "maybe"
  },
  "weekend": {
    "min_weekends_off_per_month": 1,
    "extra_weeknight_for_weekend": "yes",
    "split_block_for_weekend": "maybe",
    "weekend_night_rank": ["saturday", "friday", "sunday"],
    "worse_hospital_for_weekend": "maybe"
  }
}
```

---

## Admin Aggregate Updates (`/admin/preferences`)

Replace the "swap partner network" visualization with:

### Motivator Rankings
- Average rank per motivator (bar chart)
- Consensus indicator: highlight if one motivator is ranked #1 by majority

### Desirability Factors
- Stacked horizontal bar chart: for each factor, show count of "Not at all" / "Somewhat" / "Very much"
- Callout: "Strongest swap motivator: Longer off-stretch (15 of 19 said 'Very much')"

### Constraints Summary
- Average/median max extra consecutive nights
- Average/median minimum notice days
- Hospital flexibility breakdown (pie chart: same only / assigned / any)
- Extra shift willingness breakdown (pie chart: yes / maybe / no)

### Block Swap Summary (NEW)
- Full block willingness breakdown (pie chart: yes / maybe / no)
- Trade flexibility breakdown (bar chart: equal only vs flexible)
- Preferred-block-trade willingness breakdown (pie chart: yes / maybe / no)

### Weekend Summary (NEW)
- Minimum weekends off distribution (histogram, 0–4)
- Callout: "Average minimum weekends off: X per month"
- Extra weeknight for weekend breakdown (pie chart: yes / maybe / no)
- Split block willingness breakdown (pie chart: yes / maybe / no)
- Weekend night priority (average rank per night — bar chart)
- Callout: "Most valued weekend night: Saturday (avg rank 1.2)"
- Worse hospital for weekend breakdown (pie chart: yes / maybe / no)

Keep everything else on the collaboration section unchanged (swap willingness pie chart stays).

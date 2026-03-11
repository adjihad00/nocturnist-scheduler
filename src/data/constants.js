export const HOSPITALS = [
  { name: 'BEH', full: 'Baylor Emergency Hospital', need: 1 },
  { name: 'GMH', full: 'Good Methodist Hospital', need: 4 },
  { name: 'GRMH', full: 'Grand Memorial Hospital', need: 2 },
  { name: 'HMH', full: 'Highland Medical Hospital', need: 1 },
  { name: 'LCH', full: 'Lake Charles Hospital', need: 1 },
  { name: 'NGH', full: 'North General Hospital', need: 1 },
  { name: 'OMH', full: 'Oakmont Medical Hospital', need: 2 },
];

export const TOTAL_NEED = HOSPITALS.reduce((s, h) => s + h.need, 0);
export const TOTAL_MDS = 19;
export const TARGET_NIGHTS = 156;
export const DAYS_YEAR = 365;

export const PATTERNS = [
  { id: '6on8off', label: '6 on / 8 off', on: 6, off: 8 },
  { id: '7on9off', label: '7 on / 9 off', on: 7, off: 9 },
  { id: '5on7off', label: '5 on / 7 off', on: 5, off: 7 },
  { id: '7on10off', label: '7 on / 10 off', on: 7, off: 10 },
  { id: '8on11off', label: '8 on / 11 off', on: 8, off: 11 },
];

export const PHYSICIANS = [
  { name: 'Diaz',     sites: { GMH: 33, OMH: 33, LCH: 15, NGH: 15 } },
  { name: 'Diamant',  sites: { GMH: 50, LCH: 30, NGH: 20 } },
  { name: 'Cook',     sites: { HMH: 50, NGH: 50 } },
  { name: 'Cabanis',  sites: { GMH: 33, GRMH: 33, HMH: 34 } },
  { name: 'Reyes',    sites: { GMH: 40, GRMH: 40, OMH: 20 } },
  { name: 'Dupuis',   sites: { GMH: 40, BEH: 40, NGH: 20 } },
  { name: 'Russell',  sites: { GMH: 40, GRMH: 40, NGH: 20 } },
  { name: 'Farris',   sites: { GMH: 40, HMH: 30, LCH: 30 } },
  { name: 'Johnson',  sites: { HMH: 30, OMH: 30, GRMH: 40 } },
  { name: 'Shipley',  sites: { LCH: 40, BEH: 30, NGH: 30 } },
  { name: 'Roth',     sites: { GMH: 50, GRMH: 30, HMH: 20 } },
  { name: 'Bogart',   sites: { OMH: 40, GMH: 30, BEH: 30 } },
  { name: 'Nicks',    sites: { GMH: 40, HMH: 30, GRMH: 30 } },
  { name: 'Brittain', sites: { OMH: 40, BEH: 30, GMH: 30 } },
  { name: 'Wright',   sites: { GRMH: 40, HMH: 30, LCH: 30 } },
  { name: 'Mulji',    sites: { LCH: 100 } },
  { name: 'Moore',    sites: { GRMH: 40, HMH: 30, LCH: 30 } },
  { name: 'Nagy',     sites: { OMH: 40, BEH: 30, GRMH: 30 } },
  { name: 'Pitts',    sites: { GMH: 40, OMH: 30, LCH: 30 } },
];

export const RATING_FACTORS = [
  { key: 'wlb',     label: 'Work-life balance',        desc: 'How well does this pattern support your personal life?' },
  { key: 'sleep',   label: 'Sleep/circadian rhythm',    desc: 'How manageable is the sleep transition on this pattern?' },
  { key: 'wknd',    label: 'Weekend/holiday fairness',  desc: 'How fair is the weekend/holiday distribution?' },
  { key: 'consec',  label: 'Consecutive nights',        desc: 'How tolerable is the consecutive night stretch?' },
  { key: 'predict', label: 'Schedule predictability',   desc: 'How easy is it to plan your life around this pattern?' },
];

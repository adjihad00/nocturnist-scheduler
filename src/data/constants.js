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
export const TOTAL_MDS = 20;
export const TARGET_NIGHTS = 156;
export const DAYS_YEAR = 365;

export const PATTERNS = [
  {
    id: '6on8off', label: '6 on / 8 off', type: 'simple',
    segments: [{ type: 'on', nights: 6 }, { type: 'off', nights: 8 }],
    cycle: 14, nightsPerYear: 156, deltaFrom156: 0, maxConsecutive: 6
  },
  {
    id: '7on9off', label: '7 on / 9 off', type: 'simple',
    segments: [{ type: 'on', nights: 7 }, { type: 'off', nights: 9 }],
    cycle: 16, nightsPerYear: 160, deltaFrom156: 4, maxConsecutive: 7
  },
  {
    id: '5on7off', label: '5 on / 7 off', type: 'simple',
    segments: [{ type: 'on', nights: 5 }, { type: 'off', nights: 7 }],
    cycle: 12, nightsPerYear: 152, deltaFrom156: -4, maxConsecutive: 5
  },
  {
    id: '7on10off', label: '7 on / 10 off', type: 'simple',
    segments: [{ type: 'on', nights: 7 }, { type: 'off', nights: 10 }],
    cycle: 17, nightsPerYear: 150, deltaFrom156: -6, maxConsecutive: 7
  },
  {
    id: '4on1off3on8off', label: '4 on / 1 off / 3 on / 8 off', type: 'split',
    segments: [
      { type: 'on', nights: 4 }, { type: 'off', nights: 1 },
      { type: 'on', nights: 3 }, { type: 'off', nights: 8 }
    ],
    cycle: 16, nightsPerYear: 160, deltaFrom156: 4, maxConsecutive: 4
  },
  {
    id: '3on1off3on7off', label: '3 on / 1 off / 3 on / 7 off', type: 'split',
    segments: [
      { type: 'on', nights: 3 }, { type: 'off', nights: 1 },
      { type: 'on', nights: 3 }, { type: 'off', nights: 7 }
    ],
    cycle: 14, nightsPerYear: 156, deltaFrom156: 0, maxConsecutive: 3
  },
  {
    id: '3on1off3on8off', label: '3 on / 1 off / 3 on / 8 off', type: 'split',
    segments: [
      { type: 'on', nights: 3 }, { type: 'off', nights: 1 },
      { type: 'on', nights: 3 }, { type: 'off', nights: 8 }
    ],
    cycle: 15, nightsPerYear: 146, deltaFrom156: -10, maxConsecutive: 3
  },
  {
    id: '4on1off2on7off', label: '4 on / 1 off / 2 on / 7 off', type: 'split',
    segments: [
      { type: 'on', nights: 4 }, { type: 'off', nights: 1 },
      { type: 'on', nights: 2 }, { type: 'off', nights: 7 }
    ],
    cycle: 14, nightsPerYear: 156, deltaFrom156: 0, maxConsecutive: 4
  },
  {
    id: '3on2off3on6off', label: '3 on / 2 off / 3 on / 6 off', type: 'split',
    segments: [
      { type: 'on', nights: 3 }, { type: 'off', nights: 2 },
      { type: 'on', nights: 3 }, { type: 'off', nights: 6 }
    ],
    cycle: 14, nightsPerYear: 156, deltaFrom156: 0, maxConsecutive: 3
  }
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
  { name: 'Cromer',   sites: {} },
];

export const START_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Google Apps Script endpoint for fetching responses from the sheet
export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwoCoRMYIEHBZzYEpt0YqEBxcDBfoqSAMmQGUaHXvyFN6maDU1sv7fk-ZhgtwqPvuTx/exec";

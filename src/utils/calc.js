import { TOTAL_NEED, TOTAL_MDS, DAYS_YEAR } from '../data/constants';

export default function calc(p) {
  const cycle = p.cycle;
  const onNights = p.segments.reduce((sum, s) => sum + (s.type === 'on' ? s.nights : 0), 0);
  const nightsYear = p.nightsPerYear;
  const delta = p.deltaFrom156;
  const onFraction = onNights / cycle;
  const mdsPerNight = onFraction * TOTAL_MDS;
  const totalNoctNights = nightsYear * TOTAL_MDS;
  const totalSlotsNeeded = TOTAL_NEED * DAYS_YEAR;
  const coveragePct = totalNoctNights / totalSlotsNeeded;
  const surplus = mdsPerNight - TOTAL_NEED;
  const staggerGroups = cycle;
  const mdsPerGroup = TOTAL_MDS / staggerGroups;
  return {
    cycle, nightsYear, delta, onFraction, mdsPerNight,
    totalNoctNights, coveragePct, surplus, staggerGroups, mdsPerGroup,
    maxConsecutive: p.maxConsecutive,
  };
}

/** Build a cycle map: array of length=cycle, each entry 'on' | 'off' | 'mini-break' */
export function buildCycleMap(p) {
  const map = [];
  const lastOffIdx = (() => {
    for (let i = p.segments.length - 1; i >= 0; i--) {
      if (p.segments[i].type === 'off') return i;
    }
    return -1;
  })();

  p.segments.forEach((seg, si) => {
    for (let n = 0; n < seg.nights; n++) {
      if (seg.type === 'on') {
        map.push('on');
      } else {
        map.push(si !== lastOffIdx ? 'mini-break' : 'off');
      }
    }
  });
  return map;
}

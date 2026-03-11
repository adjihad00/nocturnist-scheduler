import { TOTAL_NEED, TOTAL_MDS, TARGET_NIGHTS, DAYS_YEAR } from '../data/constants';

export default function calc(p) {
  const cycle = p.on + p.off;
  const nightsYear = Math.round((p.on / cycle) * DAYS_YEAR);
  const delta = nightsYear - TARGET_NIGHTS;
  const onFraction = p.on / cycle;
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
  };
}

import { SEMESTER_START_DATE, SEMESTER_END_DATE } from '../data/sectionsData.js';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Parse YYYY-MM-DD as local date object without timezone shifts
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // Noon to prevent DST/midnight shifts
}

/**
 * Format Date as YYYY-MM-DD
 */
export function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format Date for display
 */
export function formatDisplayDate(dateStr) {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Generate all class occurrences between planningDate (inclusive) and semesterEnd (inclusive).
 * Uses exact day-of-week matching against the section's weekly schedule.
 */
export function generateOccurrences(section, planningDateStr, excludedDates = []) {
  if (!section || !section.weeklySchedule) return [];

  const startLimit = parseLocalDate(SEMESTER_START_DATE);
  const endLimit = parseLocalDate(SEMESTER_END_DATE);
  const chosenDate = parseLocalDate(planningDateStr);

  // If planning date is past the semester end, no classes remain
  if (chosenDate > endLimit) {
    return [];
  }

  // If planning date is before semester start, clamp to start of semester
  const effectiveStart = chosenDate < startLimit ? new Date(startLimit) : new Date(chosenDate);

  const excludedSet = new Set(excludedDates);
  const occurrences = [];
  const current = new Date(effectiveStart);

  while (current <= endLimit) {
    const dateStr = formatLocalDate(current);
    const dayOfWeek = DAY_NAMES[current.getDay()];

    // Only Mon-Fri are teaching days in the dataset
    if (dayOfWeek !== 'Saturday' && dayOfWeek !== 'Sunday' && !excludedSet.has(dateStr)) {
      const daySlots = section.weeklySchedule[dayOfWeek] || [];

      daySlots.forEach((slotEntry, idx) => {
        // Resolve subject
        const subject = section.subjects.find((s) => s.slot === slotEntry.slot) || {
          code: slotEntry.slot,
          name: slotEntry.label || slotEntry.slot,
          slot: slotEntry.slot,
        };

        const units = slotEntry.countsAs !== undefined ? slotEntry.countsAs : 1;
        const periods = slotEntry.periods || [slotEntry.period];

        occurrences.push({
          id: `${dateStr}_${slotEntry.slot}_${idx}`,
          dateStr,
          dayOfWeek,
          periodLabel: periods.length > 1 ? `Periods ${periods.join('-')}` : `Period ${periods[0]}`,
          periods,
          slot: slotEntry.slot,
          subjectCode: subject.code,
          subjectName: subject.name,
          room: slotEntry.room || section.venue,
          units,
          isLab: Boolean(subject.isLab || slotEntry.label?.toLowerCase().includes('lab')),
        });
      });
    }

    // Step to next day
    current.setDate(current.getDate() + 1);
  }

  return occurrences;
}

/**
 * Returns a map of subjectCode -> remaining class units
 */
export function getRemainingClassesBySubject(section, planningDateStr, excludedDates = []) {
  const occurrences = generateOccurrences(section, planningDateStr, excludedDates);
  const counts = {};

  section.subjects.forEach((sub) => {
    counts[sub.code] = 0;
  });

  occurrences.forEach((occ) => {
    counts[occ.subjectCode] = (counts[occ.subjectCode] || 0) + occ.units;
  });

  return counts;
}

/**
 * Get total occurrences scheduled across the entire semester
 */
export function getSemesterTotalScheduled(section, excludedDates = []) {
  return generateOccurrences(section, SEMESTER_START_DATE, excludedDates);
}

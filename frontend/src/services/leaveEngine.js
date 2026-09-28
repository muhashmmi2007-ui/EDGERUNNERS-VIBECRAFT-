/**
 * Leave & On-Duty (OD) Simulation Engine
 * Calculates exact class-by-class impact of proposed leave dates
 * based on the section's actual weekly timetable schedule.
 */

import { parseLocalDate, formatLocalDate, formatDisplayDate } from './calendarEngine.js';
import { calculateProjectedAttendance, calculateSafeSkips, MANDATORY_THRESHOLD, ASPIRATIONAL_TARGET } from './attendanceMath.js';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Simulates leave for a date range [startDateStr, endDateStr]
 * @param {Object} params
 * @param {Object} params.section Current section data
 * @param {string} params.startDateStr YYYY-MM-DD
 * @param {string} params.endDateStr YYYY-MM-DD
 * @param {string} params.leaveType 'MEDICAL' | 'OD' | 'CASUAL'
 * @param {boolean} params.isODApproved If true, OD attendance credit/waiver applies
 * @param {Object} params.attendanceRecords Current { [code]: { attended, held } }
 * @param {Object} params.remainingMap Current { [code]: remainingUnits }
 * @returns {Object} Comprehensive Leave Impact Assessment
 */
export function simulateLeaveImpact({
  section,
  startDateStr,
  endDateStr,
  leaveType = 'MEDICAL',
  isODApproved = false,
  attendanceRecords,
  remainingMap,
}) {
  if (!section || !startDateStr || !endDateStr) {
    return null;
  }

  const startDate = parseLocalDate(startDateStr);
  const endDate = parseLocalDate(endDateStr);

  if (startDate > endDate) {
    return {
      error: 'Start date must be before or equal to end date.',
      affectedClasses: [],
      affectedSubjects: {},
      totalAffectedUnits: 0,
    };
  }

  const affectedClasses = [];
  const subjectMissedUnits = {};

  section.subjects.forEach((sub) => {
    subjectMissedUnits[sub.code] = 0;
  });

  const current = new Date(startDate);
  while (current <= endDate) {
    const dStr = formatLocalDate(current);
    const dayOfWeek = DAY_NAMES[current.getDay()];

    if (dayOfWeek !== 'Saturday' && dayOfWeek !== 'Sunday') {
      const daySlots = section.weeklySchedule?.[dayOfWeek] || [];

      daySlots.forEach((slotEntry, idx) => {
        const subject = section.subjects.find((s) => s.slot === slotEntry.slot) || {
          code: slotEntry.slot,
          name: slotEntry.label || slotEntry.slot,
          slot: slotEntry.slot,
        };

        const units = slotEntry.countsAs !== undefined ? slotEntry.countsAs : 1;
        const periods = slotEntry.periods || [slotEntry.period];

        subjectMissedUnits[subject.code] = (subjectMissedUnits[subject.code] || 0) + units;

        affectedClasses.push({
          id: `${dStr}_${slotEntry.slot}_${idx}`,
          dateStr: dStr,
          displayDate: formatDisplayDate(dStr),
          dayOfWeek,
          subjectCode: subject.code,
          subjectName: subject.name,
          slot: slotEntry.slot,
          periods,
          periodLabel: periods.length > 1 ? `Periods ${periods.join('-')}` : `Period ${periods[0]}`,
          room: slotEntry.room || section.venue,
          units,
          isLab: Boolean(subject.isLab || slotEntry.label?.toLowerCase().includes('lab')),
        });
      });
    }

    current.setDate(current.getDate() + 1);
  }

  const totalAffectedUnits = affectedClasses.reduce((acc, c) => acc + c.units, 0);

  // Subject-by-Subject Impact Comparison
  const subjectImpacts = {};
  let totalCurrentA = 0;
  let totalCurrentH = 0;
  let totalCurrentR = 0;
  let totalProjectedA = 0;

  section.subjects.forEach((sub) => {
    const rec = attendanceRecords[sub.code] || { attended: 0, held: 0 };
    const R = remainingMap[sub.code] || 0;
    const missedInLeave = subjectMissedUnits[sub.code] || 0;

    totalCurrentA += rec.attended;
    totalCurrentH += rec.held;
    totalCurrentR += R;

    // Current metrics
    const currentPct = rec.held > 0 ? (rec.attended / rec.held) * 100 : null;

    // Future attendance:
    // If not on leave, student could attend up to R.
    // With leave, missedInLeave classes cannot be attended unless OD approval awards attendance credit!
    const effectiveMissed = isODApproved ? 0 : Math.min(R, missedInLeave);
    const futureAttended = Math.max(0, R - effectiveMissed);

    // If OD approved with credit, student is credited for attending those classes
    const finalAttended = isODApproved ? rec.attended + R : rec.attended + futureAttended;
    totalProjectedA += finalAttended;

    const projectedPct = (rec.held + R) > 0 ? (finalAttended / (rec.held + R)) * 100 : 0;
    const diffPct = currentPct !== null ? projectedPct - currentPct : 0;

    const currentSafeSkips75 = calculateSafeSkips(rec.attended, rec.held, R, MANDATORY_THRESHOLD);
    const newRemainingAfterLeave = Math.max(0, R - missedInLeave);
    const newAttendedAfterLeave = isODApproved ? rec.attended + missedInLeave : rec.attended;
    const newHeldAfterLeave = rec.held + missedInLeave;

    const projectedSafeSkips75 = calculateSafeSkips(
      newAttendedAfterLeave,
      newHeldAfterLeave,
      newRemainingAfterLeave,
      MANDATORY_THRESHOLD
    );

    const is75Achievable = (finalAttended / (rec.held + R)) >= MANDATORY_THRESHOLD;
    const is90Achievable = (finalAttended / (rec.held + R)) >= ASPIRATIONAL_TARGET;

    subjectImpacts[sub.code] = {
      code: sub.code,
      name: sub.name,
      slot: sub.slot,
      classesMissed: missedInLeave,
      currentPct,
      projectedPct,
      diffPct,
      currentSafeSkips: currentSafeSkips75.safeSkips,
      projectedSafeSkips: projectedSafeSkips75.safeSkips,
      is75Achievable,
      is90Achievable,
      status: !is75Achievable ? 'UNSAFE' : (!is90Achievable ? '75_SAFE_90_LOST' : 'SAFE'),
    };
  });

  // Overall impact
  const currentOverallPct = totalCurrentH > 0 ? (totalCurrentA / totalCurrentH) * 100 : 0;
  const totalTermClasses = totalCurrentH + totalCurrentR;
  const projectedOverallPct = totalTermClasses > 0 ? (totalProjectedA / totalTermClasses) * 100 : 0;
  const overallDiff = projectedOverallPct - currentOverallPct;

  const isOverall75Safe = (projectedOverallPct / 100) >= MANDATORY_THRESHOLD;
  const isOverall90Safe = (projectedOverallPct / 100) >= ASPIRATIONAL_TARGET;

  const unsafeSubjectsCount = Object.values(subjectImpacts).filter((s) => !s.is75Achievable).length;

  return {
    startDateStr,
    endDateStr,
    leaveType,
    isODApproved,
    affectedClasses,
    totalAffectedUnits,
    affectedSubjectsCount: Object.values(subjectImpacts).filter((s) => s.classesMissed > 0).length,
    subjectImpacts,
    currentOverallPct,
    projectedOverallPct,
    overallDiff,
    isOverall75Safe,
    isOverall90Safe,
    unsafeSubjectsCount,
    verdict: unsafeSubjectsCount > 0
      ? `Leave causes ${unsafeSubjectsCount} subject(s) to breach or remain below 75% threshold.`
      : (isOverall75Safe
          ? 'Leave is safely within your attendance tolerance (maintains ≥75%).'
          : 'Leave projected to drop overall attendance below 75%.'),
  };
}

/**
 * Core Attendance Mathematics Engine
 * Strictly adhering to:
 *   A = attended so far
 *   H = held so far
 *   R = scheduled remaining classes
 *   x = future classes attended (0 <= x <= R)
 *   m = future classes missed (0 <= m <= R, x = R - m)
 *   T = target attendance fraction (0.75 or 0.90)
 *
 * Fixed-Final-Total Model:
 *   Final Total Classes = H + R (all scheduled classes are assumed to be held)
 *   Final Total Attended = A + x = A + R - m
 *   Projected Attendance = (A + x) / (H + R)
 *   Minimum required to hit target T:
 *     x_min = max(0, ceil(T * (H + R) - A))
 *     If x_min > R -> IMPOSSIBLE to reach target T
 *   Safe skips:
 *     safe_skips = R - x_min (if x_min <= R, else 0)
 */

export const MANDATORY_THRESHOLD = 0.75;
export const ASPIRATIONAL_TARGET = 0.90;

/**
 * Calculates current attendance fraction (A / H)
 * Returns null if H === 0 (N/A state)
 */
export function calculateCurrentAttendance(A, H) {
  if (!H || H <= 0) return null;
  return A / H;
}

/**
 * Calculates maximum achievable final attendance if student attends ALL remaining R classes:
 * (A + R) / (H + R)
 */
export function calculateMaxAchievable(A, H, R) {
  const total = H + R;
  if (total <= 0) return null;
  return (A + R) / total;
}

/**
 * Calculates projected attendance if student attends x future classes (or misses m classes):
 * (A + x) / (H + R)
 */
export function calculateProjectedAttendance(A, H, R, futureAttended) {
  const total = H + R;
  if (total <= 0) return null;
  const clampedX = Math.max(0, Math.min(R, futureAttended));
  return (A + clampedX) / total;
}

/**
 * Minimum future classes needed out of R to reach target T:
 * x_min = max(0, ceil(T * (H + R) - A))
 */
export function calculateMinRequired(A, H, R, targetFraction) {
  const total = H + R;
  if (total <= 0) {
    return { minRequired: 0, isPossible: true };
  }

  // Exact floating point target threshold
  const rawNeeded = targetFraction * total - A;
  // Use Math.ceil for discrete class counts
  // Handle micro floating point epsilon (e.g. 74.9999999999999 vs 75)
  const epsilon = 1e-9;
  const minRequired = Math.max(0, Math.ceil(rawNeeded - epsilon));

  const isPossible = minRequired <= R;

  return {
    minRequired,
    isPossible,
  };
}

/**
 * Maximum safe future skips for target T:
 * safe_skips = R - x_min (provided x_min <= R)
 * Otherwise 0 and isPossible = false
 */
export function calculateSafeSkips(A, H, R, targetFraction) {
  const { minRequired, isPossible } = calculateMinRequired(A, H, R, targetFraction);
  if (!isPossible) {
    return {
      safeSkips: 0,
      isPossible: false,
      minRequired,
    };
  }

  const skips = Math.max(0, R - minRequired);
  return {
    safeSkips: skips,
    isPossible: true,
    minRequired,
  };
}

/**
 * Comprehensive Subject Evaluation
 */
export function evaluateSubjectAttendance(A, H, R) {
  const currentRatio = calculateCurrentAttendance(A, H);
  const currentPct = currentRatio !== null ? currentRatio * 100 : null;

  const maxAchievableRatio = calculateMaxAchievable(A, H, R);
  const maxAchievablePct = maxAchievableRatio !== null ? maxAchievableRatio * 100 : null;

  const target75 = calculateSafeSkips(A, H, R, MANDATORY_THRESHOLD);
  const target90 = calculateSafeSkips(A, H, R, ASPIRATIONAL_TARGET);

  // Status classification
  let status = 'ON_TRACK';
  let statusLabel = 'On Track';
  let statusColor = 'green'; // emerald
  let statusDesc = 'Comfortably meeting attendance goals.';

  if (maxAchievableRatio !== null && maxAchievableRatio < MANDATORY_THRESHOLD) {
    status = 'IRREVERSIBLE';
    statusLabel = 'IRREVERSIBLE DETENTION RISK';
    statusColor = 'red';
    statusDesc = 'Mathematically impossible to reach 75% even with 100% future attendance.';
  } else if (!target75.isPossible) {
    status = 'IRREVERSIBLE';
    statusLabel = 'IRREVERSIBLE DETENTION RISK';
    statusColor = 'red';
    statusDesc = 'Mathematically impossible to reach 75% threshold.';
  } else if (currentRatio !== null && currentRatio < MANDATORY_THRESHOLD) {
    status = 'RECOVERY_REQUIRED';
    statusLabel = 'Recovery Required';
    statusColor = 'amber';
    statusDesc = `Must attend at least ${target75.minRequired} of next ${R} classes to reach 75%.`;
  } else if (target75.safeSkips <= 2 && R > 0) {
    status = 'CAUTION';
    statusLabel = 'Caution';
    statusColor = 'amber';
    statusDesc = `Only ${target75.safeSkips} safe skip${target75.safeSkips === 1 ? '' : 's'} remaining before 75% risk.`;
  } else if (!target90.isPossible) {
    status = 'TARGET_90_MISSED';
    statusLabel = '75% Safe (90% Lost)';
    statusColor = 'blue';
    statusDesc = '75% is secure, but 90% aspirational target is no longer mathematically achievable.';
  }

  return {
    attended: A,
    held: H,
    remaining: R,
    totalScheduled: H + R,
    currentPct,
    maxAchievablePct,
    target75,
    target90,
    status,
    statusLabel,
    statusColor,
    statusDesc,
  };
}

/**
 * Produce structured step-by-step derivation for the "How was this calculated?" feature
 */
export function getExplanationBreakdown(A, H, R, targetFraction = MANDATORY_THRESHOLD) {
  const targetPct = Math.round(targetFraction * 100);
  const total = H + R;
  const { minRequired, isPossible } = calculateMinRequired(A, H, R, targetFraction);
  const safeSkips = isPossible ? Math.max(0, R - minRequired) : 0;
  const maxPossible = total > 0 ? ((A + R) / total) * 100 : 0;

  const rawExpression = `${targetFraction} × (${H} + ${R}) - ${A}`;
  const evaluatedRaw = (targetFraction * total - A).toFixed(2);

  return {
    A,
    H,
    R,
    total,
    targetFraction,
    targetPct,
    rawExpression,
    evaluatedRaw,
    minRequired,
    isPossible,
    safeSkips,
    maxPossiblePct: maxPossible.toFixed(1),
    formulaText: `x_min = max(0, ⌈${targetFraction} × (H + R) - A⌉)`,
    skipsFormulaText: `Safe Skips = R - x_min (when x_min ≤ R)`,
    steps: [
      {
        step: 1,
        title: 'Determine Total Scheduled Semester Units',
        content: `Held classes (H = ${H}) + Remaining classes (R = ${R}) = ${total} total expected classes.`,
      },
      {
        step: 2,
        title: `Calculate Target Required Attended Units (${targetPct}%)`,
        content: `${targetPct}% of ${total} total classes = ${targetFraction} × ${total} = ${(targetFraction * total).toFixed(2)} classes.`,
      },
      {
        step: 3,
        title: 'Subtract Classes Already Attended',
        content: `Target units (${(targetFraction * total).toFixed(2)}) - Attended (A = ${A}) = ${evaluatedRaw}.`,
      },
      {
        step: 4,
        title: 'Apply Discrete Class Ceiling (⌈ ⌉)',
        content: `Rounding up to whole class integer: ⌈${evaluatedRaw}⌉ = ${minRequired} classes needed out of ${R}.`,
      },
      {
        step: 5,
        title: isPossible ? 'Compute Maximum Safe Skips' : 'Mathematical Feasibility Check',
        content: isPossible
          ? `Remaining classes (${R}) - Required (${minRequired}) = ${safeSkips} safe class skip${safeSkips === 1 ? '' : 's'}.`
          : `Required future classes (${minRequired}) EXCEEDS remaining scheduled classes (${R}). Maximum possible attendance is only ${maxPossible.toFixed(1)}%. Target ${targetPct}% is mathematically impossible.`,
      },
    ],
  };
}

/**
 * Aggregates overall attendance across all subjects
 */
export function evaluateOverallAttendance(subjectEvaluations) {
  let totalA = 0;
  let totalH = 0;
  let totalR = 0;

  subjectEvaluations.forEach((item) => {
    totalA += item.attended;
    totalH += item.held;
    totalR += item.remaining;
  });

  return evaluateSubjectAttendance(totalA, totalH, totalR);
}

/**
 * Attendance Advisor AI Analytical Engine
 * Analyzes the user's natural language queries against real state:
 * section timetable, current attendance, safe skips, recovery limits, and upcoming classes.
 * Provides exact mathematical derivations with zero hallucinations.
 */

import { parseLocalDate, formatLocalDate, formatDisplayDate } from './calendarEngine.js';
import { simulateLeaveImpact } from './leaveEngine.js';
import { MANDATORY_THRESHOLD, ASPIRATIONAL_TARGET } from './attendanceMath.js';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Main query processor for Attendance Advisor
 * @param {string} query User query
 * @param {Object} state Application state snapshot
 * @returns {Object} { answer: string, confidence: number, contextData: Object }
 */
export function queryAttendanceAdvisor(query, state) {
  if (!query || !query.trim()) {
    return {
      answer: 'Please ask an attendance question, such as "Which subject is most risky?", "How many classes can I miss in Maths?", or "Can I take leave this Friday?".',
      confidence: 1.0,
    };
  }

  const q = query.toLowerCase().trim();
  const { selectedSection, planningDate, attendanceRecords, remainingMap, evaluations, overallEval, occurrences } = state;

  // Helper to find matching subject by code, name, or slot
  const findSubject = (text) => {
    return selectedSection.subjects.find((s) => {
      const nameMatch = text.includes(s.name.toLowerCase());
      const codeMatch = text.includes(s.code.toLowerCase());
      const slotMatch = text.includes(`slot ${s.slot.toLowerCase()}`);
      // Common keywords
      const parts = s.name.toLowerCase().split(/[\s,]+/);
      const keywordMatch = parts.some((part) => part.length >= 4 && text.includes(part));
      return nameMatch || codeMatch || slotMatch || keywordMatch;
    });
  };

  const matchedSubject = findSubject(q);

  // -------------------------------------------------------------
  // Scenario 1: "Which subject is currently most risky?" / "What is most risky?"
  // -------------------------------------------------------------
  if (q.includes('risky') || q.includes('most risk') || q.includes('priority') || q.includes('danger')) {
    const list = selectedSection.subjects.map((sub) => {
      const evaluation = evaluations[sub.code] || {};
      const target75 = evaluation.target75 || { safeSkips: 0, isPossible: false };
      return {
        subject: sub,
        evaluation,
        safeSkips: target75.isPossible ? target75.safeSkips : -1,
        currentPct: evaluation.currentPct,
        maxAchievablePct: evaluation.maxAchievablePct,
        isIrreversible: evaluation.status === 'IRREVERSIBLE',
      };
    });

    // Sort by most critical: irreversible first, then lowest safe skips, then lowest current %
    list.sort((a, b) => {
      if (a.isIrreversible && !b.isIrreversible) return -1;
      if (!a.isIrreversible && b.isIrreversible) return 1;
      if (a.safeSkips !== b.safeSkips) return a.safeSkips - b.safeSkips;
      return (a.currentPct || 0) - (b.currentPct || 0);
    });

    const mostRisky = list[0];
    const rec = attendanceRecords[mostRisky.subject.code] || { attended: 0, held: 0 };
    const rem = remainingMap[mostRisky.subject.code] || 0;

    if (mostRisky.isIrreversible) {
      return {
        answer: `⚠️ **CRITICAL: ${mostRisky.subject.name} (${mostRisky.subject.code})** is currently your most risky subject.
- **Current Standing:** ${rec.attended}/${rec.held} (${mostRisky.currentPct?.toFixed(1)}%)
- **Remaining Scheduled:** ${rem} classes
- **Max Possible Attendance:** ${mostRisky.maxAchievablePct?.toFixed(1)}%
- **Status:** **IRREVERSIBLE DETENTION RISK**. Even with 100% attendance in all ${rem} remaining classes, this subject cannot reach the 75% threshold mathematically.`,
        contextData: { subject: mostRisky.subject, evaluation: mostRisky.evaluation },
      };
    }

    return {
      answer: `📊 Your most vulnerable subject is **${mostRisky.subject.name} (${mostRisky.subject.code})**:
- **Current Standing:** ${rec.attended}/${rec.held} classes (${mostRisky.currentPct?.toFixed(1)}%)
- **Remaining Classes:** ${rem} classes scheduled till Nov 29
- **Safe Skips Remaining:** **${mostRisky.safeSkips} class${mostRisky.safeSkips === 1 ? '' : 'es'}** before falling below 75%
- **Requirement:** You must attend at least **${mostRisky.evaluation.target75?.minRequired}** of the next ${rem} classes to guarantee your 75% requirement.`,
      contextData: { subject: mostRisky.subject, evaluation: mostRisky.evaluation },
    };
  }

  // -------------------------------------------------------------
  // Scenario 2: "Can I still reach 90% in [Subject]?" or 90% overall
  // -------------------------------------------------------------
  if (q.includes('90%') || q.includes('ninety percent')) {
    if (matchedSubject) {
      const evaluation = evaluations[matchedSubject.code] || {};
      const rec = attendanceRecords[matchedSubject.code] || { attended: 0, held: 0 };
      const rem = remainingMap[matchedSubject.code] || 0;
      const target90 = evaluation.target90 || { safeSkips: 0, isPossible: false, minRequired: 0 };
      const maxAchievable = evaluation.maxAchievablePct;

      if (!target90.isPossible) {
        return {
          answer: `❌ **No, reaching 90% in ${matchedSubject.name} is no longer mathematically possible.**
- **Current Attendance:** ${rec.attended}/${rec.held} (${evaluation.currentPct?.toFixed(1)}%)
- **Remaining Classes:** ${rem} classes
- **Maximum Final Achievable:** Even attending all ${rem} remaining classes caps your final attendance at **${maxAchievable?.toFixed(1)}%**.
- However, your **75% threshold is ${evaluation.target75?.isPossible ? 'SAFE with ' + evaluation.target75.safeSkips + ' safe skips' : 'AT RISK'}**.`,
          contextData: { subject: matchedSubject, evaluation },
        };
      }

      return {
        answer: `✅ **Yes, you can reach 90% in ${matchedSubject.name}!**
- **Current Attendance:** ${rec.attended}/${rec.held} (${evaluation.currentPct?.toFixed(1)}%)
- **Remaining Classes:** ${rem} classes
- **Required Attendance:** You must attend at least **${target90.minRequired} of the remaining ${rem} classes**.
- **Safe Skips Buffer:** You can safely afford **${target90.safeSkips} class skip${target90.safeSkips === 1 ? '' : 's'}** while still hitting 90%.`,
        contextData: { subject: matchedSubject, evaluation },
      };
    }

    // Overall 90%
    const is90Possible = overallEval.target90?.isPossible;
    return {
      answer: is90Possible
        ? `✅ **Yes! Overall 90% attendance is achievable.** You must attend at least **${overallEval.target90.minRequired}** of your remaining **${overallEval.remaining} total classes** across all subjects (you have a buffer of **${overallEval.target90.safeSkips} safe skips**).`
        : `❌ **Overall 90% is mathematically lost.** Maximum possible aggregate attendance across all subjects is **${overallEval.maxAchievablePct?.toFixed(1)}%**. Focus on securing your 75% mandatory threshold.`,
      contextData: { overallEval },
    };
  }

  // -------------------------------------------------------------
  // Scenario 3: "If I attend everything from now, what will my final attendance be?"
  // -------------------------------------------------------------
  if (q.includes('attend everything') || q.includes('attend all') || q.includes('perfect attendance') || q.includes('max attendance') || q.includes('maximum achievable')) {
    if (matchedSubject) {
      const evaluation = evaluations[matchedSubject.code] || {};
      const rec = attendanceRecords[matchedSubject.code] || { attended: 0, held: 0 };
      const rem = remainingMap[matchedSubject.code] || 0;
      return {
        answer: `📈 **Maximum Achievable for ${matchedSubject.name}:**
If you attend all **${rem} remaining classes** without a single absence:
- Final Attended: ${rec.attended + rem} / ${rec.held + rem} classes
- Projected Final Attendance: **${evaluation.maxAchievablePct?.toFixed(1)}%**
- Threshold Status: ${evaluation.maxAchievablePct >= 75 ? '✅ Comfortably passes 75%' : '🚨 Breaches 75% (Detention Risk)'}`,
        contextData: { subject: matchedSubject, evaluation },
      };
    }

    return {
      answer: `📈 **Maximum Achievable Overall Standing:**
If you attend 100% of the remaining **${overallEval.remaining} scheduled classes** across all subjects:
- Final Total Attended: ${overallEval.attended + overallEval.remaining} / ${overallEval.held + overallEval.remaining} classes
- Projected Final Attendance: **${overallEval.maxAchievablePct?.toFixed(1)}%**
- Standing: ${overallEval.maxAchievablePct >= 75 ? 'Safe and eligible for term examinations.' : 'Below the 75% mandatory eligibility criteria.'}`,
      contextData: { overallEval },
    };
  }

  // -------------------------------------------------------------
  // Scenario 4: "Can I take leave on Friday?" or day-specific queries
  // -------------------------------------------------------------
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const matchedDay = dayNames.find((d) => q.includes(d));

  if (matchedDay || q.includes('leave') || q.includes('sick') || q.includes('miss class')) {
    // Find next occurrence of that day
    let testDateStr = planningDate;
    if (matchedDay) {
      const cur = parseLocalDate(planningDate);
      for (let i = 0; i < 7; i++) {
        const dName = DAY_NAMES[cur.getDay()].toLowerCase();
        if (dName === matchedDay) {
          testDateStr = formatLocalDate(cur);
          break;
        }
        cur.setDate(cur.getDate() + 1);
      }
    }

    // Run leave simulation for that day or 3 days
    const isMultiDay = q.includes('3 day') || q.includes('three day') || q.includes('few days');
    const endDate = parseLocalDate(testDateStr);
    if (isMultiDay) {
      endDate.setDate(endDate.getDate() + 2);
    }
    const endDateStr = formatLocalDate(endDate);

    const isOD = q.includes('od') || q.includes('on duty') || q.includes('symposium');
    const leaveImpact = simulateLeaveImpact({
      section: selectedSection,
      startDateStr: testDateStr,
      endDateStr,
      leaveType: isOD ? 'OD' : 'MEDICAL',
      isODApproved: isOD,
      attendanceRecords,
      remainingMap,
    });

    if (leaveImpact && !leaveImpact.error) {
      const affectedNames = Object.values(leaveImpact.subjectImpacts)
        .filter((s) => s.classesMissed > 0)
        .map((s) => `${s.name} (${s.classesMissed} missed)`)
        .join(', ');

      const unsafe = Object.values(leaveImpact.subjectImpacts).filter((s) => !s.is75Achievable);

      return {
        answer: `🗓️ **Leave Impact Assessment (${testDateStr}${isMultiDay ? ' to ' + endDateStr : ''}):**
- **Classes Affected:** **${leaveImpact.totalAffectedUnits} scheduled classes** on your timetable (${affectedNames || 'None'}).
- **Overall Impact:** Attendance moves from **${leaveImpact.currentOverallPct.toFixed(1)}% → ${leaveImpact.projectedOverallPct.toFixed(1)}%** (${leaveImpact.overallDiff >= 0 ? '+' : ''}${leaveImpact.overallDiff.toFixed(1)}%).
- **75% Verdict:** ${leaveImpact.isOverall75Safe && unsafe.length === 0 ? '✅ **SAFE TO TAKE LEAVE**. All subjects maintain ≥75% eligibility.' : `⚠️ **CAUTION**. Taking this leave puts ${unsafe.length} subject(s) under 75% risk: ${unsafe.map((u) => u.name).join(', ')}.`}`,
        contextData: { leaveImpact },
      };
    }
  }

  // -------------------------------------------------------------
  // Scenario 5: "How many classes can I miss in [Subject]?"
  // -------------------------------------------------------------
  if (matchedSubject && (q.includes('miss') || q.includes('skip') || q.includes('safe'))) {
    const evaluation = evaluations[matchedSubject.code] || {};
    const target75 = evaluation.target75 || { safeSkips: 0, isPossible: false };
    const target90 = evaluation.target90 || { safeSkips: 0, isPossible: false };
    const rec = attendanceRecords[matchedSubject.code] || { attended: 0, held: 0 };
    const rem = remainingMap[matchedSubject.code] || 0;

    return {
      answer: `🎯 **Absence Budget for ${matchedSubject.name} (${matchedSubject.code}):**
- **Current Record:** ${rec.attended} attended / ${rec.held} held (${evaluation.currentPct?.toFixed(1)}%)
- **Remaining Scheduled:** ${rem} classes
- **Maximum Safe Skips for 75%:** **${target75.isPossible ? target75.safeSkips + ' classes' : '0 classes (75% Impossible)'}**
- **Maximum Safe Skips for 90%:** **${target90.isPossible ? target90.safeSkips + ' classes' : '0 classes (90% Impossible)'}**
- **Math Proof:** To finish with $\\ge 75\\%$, you must attend at least $x_{\\min} = \\max(0, \\lceil 0.75 \\cdot (${rec.held} + ${rem}) - ${rec.attended} \\rceil) = ${target75.minRequired}$ classes. Skips = ${rem} - ${target75.minRequired} = ${target75.safeSkips}.`,
      contextData: { subject: matchedSubject, evaluation },
    };
  }

  // -------------------------------------------------------------
  // Scenario 6: General Overview / Advice
  // -------------------------------------------------------------
  const irreversibleCount = Object.values(evaluations).filter((e) => e.status === 'IRREVERSIBLE').length;
  const cautionCount = Object.values(evaluations).filter((e) => e.status === 'CAUTION').length;

  return {
    answer: `🤖 **Attendance Executive Summary for ${selectedSection.displayName}:**
- **Overall Attendance:** **${overallEval.currentPct?.toFixed(1)}%** (${overallEval.attended}/${overallEval.held} classes held).
- **Scheduled Remaining:** **${overallEval.remaining} classes** till Nov 29, 2026.
- **Total Safe Skips:** You have **${overallEval.target75?.safeSkips || 0} safe skips** remaining for 75% across the semester.
- **Risk Tally:** ${irreversibleCount > 0 ? `🚨 ${irreversibleCount} Irreversible Detention Risk subject(s)!` : 'No irreversible detention risks.'} ${cautionCount > 0 ? `⚠️ ${cautionCount} subject(s) in Caution zone (≤2 skips left).` : ''}
- Try asking: *"Can I take leave on Friday?"*, *"How many skips do I have in Maths?"*, or *"Which subject is most risky?"*`,
    contextData: { overallEval },
  };
}

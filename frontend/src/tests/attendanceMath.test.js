import { describe, it, expect } from 'vitest';
import {
  calculateCurrentAttendance,
  calculateMaxAchievable,
  calculateProjectedAttendance,
  calculateSafeSkips,
  evaluateSubjectAttendance,
  getExplanationBreakdown,
} from '../services/attendanceMath';

describe('Attendance Mathematics Core Formulas', () => {
  it('handles A = 0, H = 0 gracefully', () => {
    const current = calculateCurrentAttendance(0, 0);
    expect(current).toBeNull();

    const maxAchievable = calculateMaxAchievable(0, 0, 20);
    expect(maxAchievable).toBe(1.0); // 20/20 = 100%

    const evalRes = evaluateSubjectAttendance(0, 0, 20);
    expect(evalRes.currentPct).toBeNull();
    expect(evalRes.maxAchievablePct).toBe(100);
    expect(evalRes.target75.isPossible).toBe(true);
    // 0.75 * 20 = 15 required, 20 - 15 = 5 safe skips
    expect(evalRes.target75.minRequired).toBe(15);
    expect(evalRes.target75.safeSkips).toBe(5);
  });

  it('handles perfect attendance A = H', () => {
    const current = calculateCurrentAttendance(20, 20);
    expect(current).toBe(1.0);

    // H = 20, R = 20 -> total 40. Target 75% requires 30 total. A = 20 -> x_min = 10. Skips = 10.
    const skips75 = calculateSafeSkips(20, 20, 20, 0.75);
    expect(skips75.minRequired).toBe(10);
    expect(skips75.safeSkips).toBe(10);
    expect(skips75.isPossible).toBe(true);
  });

  it('handles A = 0 with positive H', () => {
    // A = 0, H = 10, R = 20. Total = 30. 75% requires 22.5 -> ceil = 23.
    // But R = 20, so 23 > 20 -> Impossible!
    const skips75 = calculateSafeSkips(0, 10, 20, 0.75);
    expect(skips75.isPossible).toBe(false);
    expect(skips75.safeSkips).toBe(0);

    const evalRes = evaluateSubjectAttendance(0, 10, 20);
    expect(evalRes.status).toBe('IRREVERSIBLE');
  });

  it('handles R = 0 (Semester completed or no remaining classes)', () => {
    // A = 15, H = 20, R = 0. Current is 75%.
    const current = calculateCurrentAttendance(15, 20);
    expect(current).toBe(0.75);

    const skips75 = calculateSafeSkips(15, 20, 0, 0.75);
    expect(skips75.minRequired).toBe(0);
    expect(skips75.safeSkips).toBe(0);
    expect(skips75.isPossible).toBe(true);

    const maxAchievable = calculateMaxAchievable(15, 20, 0);
    expect(maxAchievable).toBe(0.75);
  });

  it('tests current attendance exactly on 75% boundary', () => {
    // A = 30, H = 40. Current = 75%. Remaining R = 20. Total = 60.
    // 75% of 60 = 45. A = 30 -> needed = 15. Skips = 20 - 15 = 5.
    const skips75 = calculateSafeSkips(30, 40, 20, 0.75);
    expect(skips75.minRequired).toBe(15);
    expect(skips75.safeSkips).toBe(5);
  });

  it('tests current attendance exactly on 90% boundary', () => {
    // A = 36, H = 40. Current = 90%. R = 10. Total = 50.
    // 90% of 50 = 45. A = 36 -> needed = 9. Skips = 10 - 9 = 1.
    const skips90 = calculateSafeSkips(36, 40, 10, 0.90);
    expect(skips90.minRequired).toBe(9);
    expect(skips90.safeSkips).toBe(1);
  });

  it('detects 75% achievable ONLY if every single remaining class is attended', () => {
    // Total H + R = 40. 75% of 40 = 30. A = 20, R = 10.
    // Student needs exactly 10 out of 10. Safe skips = 0.
    const skips75 = calculateSafeSkips(20, 30, 10, 0.75);
    expect(skips75.minRequired).toBe(10);
    expect(skips75.safeSkips).toBe(0);
    expect(skips75.isPossible).toBe(true);

    const evalRes = evaluateSubjectAttendance(20, 30, 10);
    expect(evalRes.target75.safeSkips).toBe(0);
    expect(evalRes.target75.isPossible).toBe(true);
  });

  it('detects 75% impossible even with 100% future attendance (IRREVERSIBLE)', () => {
    // Total H + R = 40. 75% of 40 = 30. A = 15, R = 10.
    // Max achievable = (15 + 10) / 40 = 25/40 = 62.5% < 75%.
    const evalRes = evaluateSubjectAttendance(15, 30, 10);
    expect(evalRes.status).toBe('IRREVERSIBLE');
    expect(evalRes.target75.isPossible).toBe(false);
    expect(evalRes.maxAchievablePct).toBe(62.5);
  });

  it('correctly handles: 75% achievable, but 90% impossible', () => {
    // H = 20, A = 16 (80%), R = 20. Total = 40.
    // Max achievable = 36 / 40 = 90%.
    // If A = 15, max achievable = 35 / 40 = 87.5% < 90%.
    // But 75% of 40 = 30 -> needed 15 out of 20 -> safe skips = 5.
    const evalRes = evaluateSubjectAttendance(15, 20, 20);
    expect(evalRes.target75.isPossible).toBe(true);
    expect(evalRes.target75.safeSkips).toBe(5);
    expect(evalRes.target90.isPossible).toBe(false);
    expect(evalRes.status).toBe('TARGET_90_MISSED');
  });

  it('accurately distinguishes student who can safely skip 1 class but not 2', () => {
    // H = 20, R = 10. Total = 30.
    // 75% of 30 = 22.5 -> ceil = 23 needed total.
    // If student currently attended A = 14:
    // Future needed = 23 - 14 = 9 classes.
    // Safe skips = 10 - 9 = 1!
    const skips75 = calculateSafeSkips(14, 20, 10, 0.75);
    expect(skips75.minRequired).toBe(9);
    expect(skips75.safeSkips).toBe(1);

    // If student misses 1 class: (14 + 9) / 30 = 23 / 30 = 76.67% >= 75% (SAFE)
    const projectedMiss1 = calculateProjectedAttendance(14, 20, 10, 9);
    expect(projectedMiss1 * 100).toBeGreaterThanOrEqual(75);

    // If student misses 2 classes: attends 8 -> (14 + 8) / 30 = 22 / 30 = 73.33% < 75% (DETENTION)
    const projectedMiss2 = calculateProjectedAttendance(14, 20, 10, 8);
    expect(projectedMiss2 * 100).toBeLessThan(75);
  });

  it('generates accurate explainable breakdown steps', () => {
    const breakdown = getExplanationBreakdown(14, 20, 10, 0.75);
    expect(breakdown.A).toBe(14);
    expect(breakdown.H).toBe(20);
    expect(breakdown.R).toBe(10);
    expect(breakdown.minRequired).toBe(9);
    expect(breakdown.safeSkips).toBe(1);
    expect(breakdown.steps.length).toBe(5);
  });
});

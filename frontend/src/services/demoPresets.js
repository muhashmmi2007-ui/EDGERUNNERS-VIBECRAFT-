/**
 * Judge-Ready Demo Presets
 * Features 4 distinct realistic student profiles mapped against actual section data:
 * 1. Safely Above 90% (Star Student)
 * 2. Below 75% Recoverable (Clutch Comeback)
 * 3. 75% Secure, 90% Lost (Threshold Balance)
 * 4. Irreversible Detention Risk (<75% Mathematically Impossible)
 */

export const DEMO_PRESETS = [
  {
    id: 'safe_90',
    title: 'Profile 1: Safely Above 90%',
    badge: '★ Honors / 90%+ Safe',
    badgeColor: 'emerald',
    description: 'High attendance with substantial buffer. Can afford multiple skips in every subject while staying above 90%.',
    sectionId: 'III_ECE_A',
    planningDate: '2026-10-01',
    // Generates high attendance for all subjects in III ECE-A
    generateAttendance: (subjects) => {
      const records = {};
      subjects.forEach((sub) => {
        const held = 24;
        const attended = 23; // ~95.8%
        records[sub.code] = { attended, held };
      });
      return records;
    }
  },
  {
    id: 'recoverable_75',
    title: 'Profile 2: Under 75% — Recoverable',
    badge: '⚡ Comeback Achievable',
    badgeColor: 'amber',
    description: 'Currently below 75% threshold (e.g. after a medical absence). Mathematically possible to recover if classes are attended.',
    sectionId: 'III_ECE_DS',
    planningDate: '2026-10-01',
    generateAttendance: (subjects) => {
      const records = {};
      subjects.forEach((sub, idx) => {
        const held = 26;
        // 17 / 26 = 65.3% (below 75%), but with ~20 remaining classes, can reach (17 + 20) / 46 = 80.4%
        const attended = idx % 2 === 0 ? 17 : 18;
        records[sub.code] = { attended, held };
      });
      return records;
    }
  },
  {
    id: 'split_75_90',
    title: 'Profile 3: 75% Safe, 90% Impossible',
    badge: '⚖ 75% Pass, 90% Lost',
    badgeColor: 'cyan',
    description: 'Sufficient attendance to safely pass 75% without issue, but 90% aspirational target is already mathematically lost.',
    sectionId: 'II_ECE_DS_A',
    planningDate: '2026-10-15',
    generateAttendance: (subjects) => {
      const records = {};
      subjects.forEach((sub) => {
        const held = 32;
        const attended = 26; // 81.25%
        // Max achievable with ~15 remaining is (26 + 15) / 47 = 87.2% < 90%
        records[sub.code] = { attended, held };
      });
      return records;
    }
  },
  {
    id: 'irreversible_risk',
    title: 'Profile 4: Irreversible Detention Risk',
    badge: '🚨 Critical / Irreversible Risk',
    badgeColor: 'rose',
    description: 'Severe attendance deficit late in semester. Even attending 100% of remaining classes cannot reach the mandatory 75% threshold.',
    sectionId: 'III_BME',
    planningDate: '2026-10-25',
    generateAttendance: (subjects) => {
      const records = {};
      subjects.forEach((sub, idx) => {
        const held = 36;
        // Attended 12 out of 36 (33.3%). Remaining is ~12. Max achievable: (12 + 12)/48 = 50% < 75%
        const attended = idx === 0 ? 8 : 12;
        records[sub.code] = { attended, held };
      });
      return records;
    }
  }
];

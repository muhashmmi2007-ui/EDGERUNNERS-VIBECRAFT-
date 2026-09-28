/**
 * ══════════════════════════════════════════════════════════════════
 * NATURAL LANGUAGE PARSER — The Free Class Locator
 * ══════════════════════════════════════════════════════════════════
 *
 * Parses natural-language room requests into structured constraints.
 * Works entirely client-side — NO external AI API required.
 *
 * This is the LOCAL FALLBACK parser that handles common patterns.
 * It ensures the app works even without any external AI service.
 *
 * Pipeline: USER REQUEST → NLP PARSER → STRUCTURED CONSTRAINTS → AVAILABILITY ENGINE
 */

import { timeToMinutes } from './timetableIngestion.js';

// ── Floor Patterns ──
const FLOOR_PATTERNS = [
  { pattern: /\bground\s*floor\b/i, floor: 0 },
  { pattern: /\bfloor\s*0\b/i, floor: 0 },
  { pattern: /\b0th\s*floor\b/i, floor: 0 },
  { pattern: /\bfirst\s*floor\b/i, floor: 1 },
  { pattern: /\b1st\s*floor\b/i, floor: 1 },
  { pattern: /\bfloor\s*1\b/i, floor: 1 },
  { pattern: /\bsecond\s*floor\b/i, floor: 2 },
  { pattern: /\b2nd\s*floor\b/i, floor: 2 },
  { pattern: /\bfloor\s*2\b/i, floor: 2 },
  { pattern: /\bthird\s*floor\b/i, floor: 3 },
  { pattern: /\b3rd\s*floor\b/i, floor: 3 },
  { pattern: /\bfloor\s*3\b/i, floor: 3 },
  { pattern: /\bfourth\s*floor\b/i, floor: 4 },
  { pattern: /\b4th\s*floor\b/i, floor: 4 },
  { pattern: /\bfloor\s*4\b/i, floor: 4 },
  { pattern: /\bfifth\s*floor\b/i, floor: 5 },
  { pattern: /\b5th\s*floor\b/i, floor: 5 },
  { pattern: /\bfloor\s*5\b/i, floor: 5 },
  { pattern: /\bsixth\s*floor\b/i, floor: 6 },
  { pattern: /\b6th\s*floor\b/i, floor: 6 },
  { pattern: /\bfloor\s*6\b/i, floor: 6 },
];

// ── Duration Patterns ──
const DURATION_PATTERNS = [
  { pattern: /\bnext\s+(\d+)\s*hours?\b/i, extract: (m) => parseInt(m[1], 10) * 60 },
  { pattern: /\b(\d+)\s*hours?\b/i, extract: (m) => parseInt(m[1], 10) * 60 },
  { pattern: /\bnext\s+(\d+)\s*min(?:ute)?s?\b/i, extract: (m) => parseInt(m[1], 10) },
  { pattern: /\b(\d+)\s*min(?:ute)?s?\b/i, extract: (m) => parseInt(m[1], 10) },
  { pattern: /\bnext\s+half\s+hour\b/i, extract: () => 30 },
  { pattern: /\bhalf\s+an?\s+hour\b/i, extract: () => 30 },
  { pattern: /\bnext\s+hour\b/i, extract: () => 60 },
  { pattern: /\ban?\s+hour\b/i, extract: () => 60 },
];

// ── Time-of-Day Patterns ──
function parseTimeString(str) {
  // "2 PM" → 14:00, "2:30 PM" → 14:30, "14:00" → 14:00
  str = str.trim().toUpperCase();

  // Match "2:30 PM" or "2 PM" or "14:30"
  const match12 = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2] || '0', 10);
    if (match12[3] === 'PM' && h !== 12) h += 12;
    if (match12[3] === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }

  const match24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return parseInt(match24[1], 10) * 60 + parseInt(match24[2], 10);
  }

  return null;
}

// ── AC Patterns ──
const AC_PATTERNS = [
  /\bA\.?C\.?\b/i,
  /\bair[\s-]*condition(?:ed|ing)?\b/i,
  /\bcool(?:ed)?\s*room\b/i,
];

// ── "Right Now" Patterns ──
const NOW_PATTERNS = [
  /\bright\s*now\b/i,
  /\bcurrently\b/i,
  /\bimmediately\b/i,
  /\bat\s+the\s+moment\b/i,
  /\bfree\s+now\b/i,
  /\bavailable\s+now\b/i,
];

// ── Day Patterns ──
const DAY_PATTERNS = [
  { pattern: /\bmonday\b/i, day: 'Monday' },
  { pattern: /\btuesday\b/i, day: 'Tuesday' },
  { pattern: /\bwednesday\b/i, day: 'Wednesday' },
  { pattern: /\bthursday\b/i, day: 'Thursday' },
  { pattern: /\bfriday\b/i, day: 'Friday' },
  { pattern: /\btomorrow\b/i, day: 'TOMORROW' },
  { pattern: /\btoday\b/i, day: 'TODAY' },
];

// ═══════════════════════════════════════════════
// MAIN PARSER
// ═══════════════════════════════════════════════

/**
 * Parse a natural-language room request into structured constraints.
 *
 * @param {string} query — Natural-language query
 * @returns {Object} — Structured constraints for findMatchingRooms()
 */
export function parseNaturalLanguage(query) {
  if (!query || typeof query !== 'string') {
    return { error: 'Please enter a search query.' };
  }

  const q = query.trim();
  const constraints = {};
  const interpretations = []; // Track what we understood

  // ── 1. Extract Floor ──
  for (const { pattern, floor } of FLOOR_PATTERNS) {
    if (pattern.test(q)) {
      constraints.floor = floor;
      interpretations.push(`Floor: ${floor === 0 ? 'Ground' : ordinal(floor)}`);
      break;
    }
  }

  // ── 2. Extract AC Requirement ──
  for (const pattern of AC_PATTERNS) {
    if (pattern.test(q)) {
      constraints.requiresAC = true;
      interpretations.push('Requires AC');
      break;
    }
  }

  // ── 3. Extract Day ──
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (const { pattern, day } of DAY_PATTERNS) {
    if (pattern.test(q)) {
      if (day === 'TODAY') {
        constraints.day = DAY_NAMES[new Date().getDay()];
      } else if (day === 'TOMORROW') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        constraints.day = DAY_NAMES[tomorrow.getDay()];
      } else {
        constraints.day = day;
      }
      interpretations.push(`Day: ${constraints.day}`);
      break;
    }
  }

  // ── 4. Extract Explicit Time Range "from X to Y" ──
  const rangeMatch = q.match(/\bfrom\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s+(?:to|until|till)\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\b/i);
  if (rangeMatch) {
    const start = parseTimeString(rangeMatch[1]);
    const end = parseTimeString(rangeMatch[2]);
    if (start !== null && end !== null) {
      constraints.startMinutes = start;
      constraints.endMinutes = end;
      interpretations.push(`Time: ${formatTime(start)} – ${formatTime(end)}`);
    }
  }

  // ── 5. Extract "after X PM" ──
  if (!constraints.startMinutes) {
    const afterMatch = q.match(/\bafter\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\b/i);
    if (afterMatch) {
      const start = parseTimeString(afterMatch[1]);
      if (start !== null) {
        constraints.startMinutes = start;
        interpretations.push(`After: ${formatTime(start)}`);
      }
    }
  }

  // ── 6. Extract "until X PM" ──
  if (!constraints.endMinutes) {
    const untilMatch = q.match(/\b(?:until|till|before|by)\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\b/i);
    if (untilMatch) {
      const end = parseTimeString(untilMatch[1]);
      if (end !== null) {
        constraints.endMinutes = end;
        interpretations.push(`Until: ${formatTime(end)}`);
      }
    }
  }

  // ── 7. Extract Duration ──
  if (!constraints.endMinutes) {
    for (const { pattern, extract } of DURATION_PATTERNS) {
      const match = q.match(pattern);
      if (match) {
        constraints.durationMinutes = extract(match);
        interpretations.push(`Duration: ${constraints.durationMinutes} minutes`);
        break;
      }
    }
  }

  // ── 8. Detect "right now" / current time ──
  const isNow = NOW_PATTERNS.some(p => p.test(q));
  if (isNow || (!constraints.startMinutes && !constraints.endMinutes)) {
    // Default to current time
    const now = new Date();
    constraints.startMinutes = constraints.startMinutes || (now.getHours() * 60 + now.getMinutes());
    if (isNow) interpretations.push('Starting: Now');
  }

  // ── 9. Set default duration if no end time specified ──
  if (!constraints.endMinutes && !constraints.durationMinutes) {
    constraints.durationMinutes = 60; // Default 1 hour
    interpretations.push('Duration: 1 hour (default)');
  }

  // ── 10. Default day to today if not specified (or Monday if weekend) ──
  if (!constraints.day) {
    const todayName = DAY_NAMES[new Date().getDay()];
    constraints.day = (todayName === 'Sunday' || todayName === 'Saturday') ? 'Monday' : todayName;
  }

  constraints.interpretations = interpretations;
  return constraints;
}

// ── Helpers ──
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]} Floor`;
}

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export { formatTime, parseTimeString };

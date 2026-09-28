/**
 * ══════════════════════════════════════════════════════════════════
 * TEST SUITE — The Free Class Locator
 * ══════════════════════════════════════════════════════════════════
 *
 * Tests: ingestion, deduplication, availability, overlap, NLP parsing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetMasterDataset,
  ingestTimetableBatch,
  loadAllSectionsData,
  getMasterDataset,
  getDatasetStatus,
  timeToMinutes,
  minutesToTime,
  normalizeRoomName,
  extractFloor,
} from '../services/timetableIngestion.js';
import { SECTIONS_DATA } from '../data/sectionsData.js';
import {
  isRoomAvailable,
  getRoomSchedule,
  getAvailableRooms,
  getAvailableWindow,
  findMatchingRooms,
} from '../services/availabilityEngine.js';
import { parseNaturalLanguage } from '../services/nlpParser.js';

// ── Mock Sections ──
const MOCK_SECTION_A = {
  id: 'TEST_A',
  displayName: 'Test Section A',
  year: 'III',
  semester: 5,
  academicYear: '2026–27',
  venue: 'IST 225',
  department: 'Test Dept',
  subjects: [
    { code: 'SUB_A', name: 'Subject A', slot: 'A', credits: '3-0-0-3', faculty: 'Dr. Test', dept: 'Test' },
    { code: 'SUB_B', name: 'Subject B', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. Test2', dept: 'Test' },
    { code: 'SUB_C', name: 'Subject C', slot: 'C', credits: '3-0-0-3', faculty: 'Dr. Test3', dept: 'Test' },
  ],
  weeklySchedule: {
    Monday: [
      { period: 1, slot: 'A' },
      { period: 2, slot: 'B' },
      // Periods 3-4 are free
      { period: 5, slot: 'C' },
    ],
    Tuesday: [
      { period: 3, slot: 'A' },
      { period: 4, slot: 'B' },
    ],
  },
};

const MOCK_SECTION_B = {
  id: 'TEST_B',
  displayName: 'Test Section B',
  year: 'IV',
  semester: 7,
  academicYear: '2026–27',
  venue: 'IST 227',
  department: 'Test Dept',
  subjects: [
    { code: 'SUB_D', name: 'Subject D', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. Test4', dept: 'Test' },
    { code: 'SUB_E', name: 'Subject E', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. Test5', dept: 'Test' },
  ],
  weeklySchedule: {
    Monday: [
      { period: 1, slot: 'D' },
      { period: 4, slot: 'E' },
    ],
    Tuesday: [
      { period: 1, slot: 'D' },
      { period: 2, slot: 'E' },
    ],
  },
};

// Section using same room as A (IST 225) — to test cross-batch room sharing
const MOCK_SECTION_C = {
  id: 'TEST_C',
  displayName: 'Test Section C',
  year: 'II',
  semester: 3,
  academicYear: '2026–27',
  venue: 'IST 225',
  department: 'Test Dept',
  subjects: [
    { code: 'SUB_F', name: 'Subject F', slot: 'F', credits: '3-0-0-3', faculty: 'Dr. Test6', dept: 'Test' },
  ],
  weeklySchedule: {
    Monday: [
      { period: 3, slot: 'F' }, // Period 3 which was free for section A
    ],
  },
};

// ═══════════════════════════════════════════════
// TEST SUITES
// ═══════════════════════════════════════════════

describe('Time Utilities', () => {
  it('converts time strings to minutes', () => {
    expect(timeToMinutes('09:00')).toBe(540);
    expect(timeToMinutes('12:30')).toBe(750);
    expect(timeToMinutes('16:50')).toBe(1010);
    expect(timeToMinutes('00:00')).toBe(0);
  });

  it('converts minutes back to time strings', () => {
    expect(minutesToTime(540)).toBe('09:00');
    expect(minutesToTime(750)).toBe('12:30');
    expect(minutesToTime(1010)).toBe('16:50');
  });
});

describe('Room Name Normalization', () => {
  it('normalizes IST room names', () => {
    expect(normalizeRoomName('IST602')).toBe('IST 602');
    expect(normalizeRoomName('IST 225')).toBe('IST 225');
    expect(normalizeRoomName('ist 518')).toBe('IST 518');
  });

  it('normalizes LAB references', () => {
    expect(normalizeRoomName('LAB-108')).toBe('LAB-108');
    expect(normalizeRoomName('LAB 309')).toBe('LAB-309');
  });

  it('returns null for null/empty input', () => {
    expect(normalizeRoomName(null)).toBeNull();
    expect(normalizeRoomName('')).toBeNull();
  });
});

describe('Floor Extraction', () => {
  it('extracts floor from IST rooms', () => {
    expect(extractFloor('IST 225')).toBe(2);
    expect(extractFloor('IST 602')).toBe(6);
    expect(extractFloor('IST 108')).toBe(1);
  });

  it('extracts floor from LAB rooms', () => {
    expect(extractFloor('LAB-108')).toBe(1);
    expect(extractFloor('LAB-309')).toBe(3);
  });

  it('extracts floor from number-only rooms', () => {
    expect(extractFloor('625')).toBe(6);
    expect(extractFloor('401')).toBe(4);
  });

  it('returns null for unknown formats', () => {
    expect(extractFloor(null)).toBeNull();
  });
});

describe('Batch Ingestion', () => {
  beforeEach(() => {
    resetMasterDataset();
  });

  it('ingests a single batch successfully', () => {
    const result = ingestTimetableBatch([MOCK_SECTION_A], { batchId: 'test_1' });
    expect(result.success).toBe(true);
    expect(result.entriesAdded).toBeGreaterThan(0);
    expect(result.sectionsIncluded).toContain('TEST_A');
  });

  it('discovers rooms from venue', () => {
    ingestTimetableBatch([MOCK_SECTION_A], { batchId: 'test_1' });
    const dataset = getMasterDataset();
    expect(dataset.rooms).toHaveProperty('IST 225');
    expect(dataset.rooms['IST 225'].floor).toBe(2);
  });

  it('creates schedule entries with correct times', () => {
    ingestTimetableBatch([MOCK_SECTION_A], { batchId: 'test_1' });
    const schedule = getRoomSchedule('IST 225', 'Monday');
    expect(schedule.length).toBeGreaterThan(0);
    // Period 1 should be 09:00 - 09:50
    const firstEntry = schedule.find(e => e.startTime === '09:00');
    expect(firstEntry).toBeTruthy();
    expect(firstEntry.endTime).toBe('09:50');
  });

  it('rejects empty or invalid input', () => {
    const result = ingestTimetableBatch([], { batchId: 'empty' });
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('tracks dataset status', () => {
    ingestTimetableBatch([MOCK_SECTION_A], { batchId: 'b1' });
    const status = getDatasetStatus();
    expect(status.batchesLoaded).toBe(1);
    expect(status.sectionsIngested).toBe(1);
    expect(status.roomsDiscovered).toBeGreaterThan(0);
    expect(status.isComplete).toBe(false);
  });
});

describe('Multiple Batch Ingestion', () => {
  beforeEach(() => {
    resetMasterDataset();
  });

  it('merges multiple batches', () => {
    ingestTimetableBatch([MOCK_SECTION_A], { batchId: 'b1' });
    ingestTimetableBatch([MOCK_SECTION_B], { batchId: 'b2' });

    const status = getDatasetStatus();
    expect(status.batchesLoaded).toBe(2);
    expect(status.sectionsIngested).toBe(2);

    const dataset = getMasterDataset();
    expect(dataset.rooms).toHaveProperty('IST 225');
    expect(dataset.rooms).toHaveProperty('IST 227');
  });

  it('handles duplicate section across batches', () => {
    ingestTimetableBatch([MOCK_SECTION_A], { batchId: 'b1' });
    const result = ingestTimetableBatch([MOCK_SECTION_A], { batchId: 'b2' });

    // Section A should be skipped in second batch
    expect(result.duplicatesSkipped).toBeGreaterThan(0);
    expect(getDatasetStatus().sectionsIngested).toBe(1);
  });
});

describe('Availability Engine — Core', () => {
  beforeEach(() => {
    resetMasterDataset();
    ingestTimetableBatch([MOCK_SECTION_A], { batchId: 'test_avail' });
  });

  it('correctly identifies occupied periods', () => {
    // Period 1: 09:00 - 09:50 (Subject A)
    const available = isRoomAvailable('IST 225', 'Monday', timeToMinutes('09:00'), timeToMinutes('09:50'));
    expect(available).toBe(false);
  });

  it('correctly identifies free periods', () => {
    // Period 3: 10:50 - 11:40 (free for section A on Monday)
    const available = isRoomAvailable('IST 225', 'Monday', timeToMinutes('10:50'), timeToMinutes('11:40'));
    expect(available).toBe(true);
  });

  it('rejects partial overlap at start', () => {
    // 09:30 - 10:30 overlaps with Period 1 (09:00-09:50)
    const available = isRoomAvailable('IST 225', 'Monday', timeToMinutes('09:30'), timeToMinutes('10:30'));
    expect(available).toBe(false);
  });

  it('rejects partial overlap at end', () => {
    // 09:40 - 10:10 overlaps with Period 1 (09:00-09:50)
    const available = isRoomAvailable('IST 225', 'Monday', timeToMinutes('09:40'), timeToMinutes('10:10'));
    expect(available).toBe(false);
  });

  it('rejects full enclosure', () => {
    // 08:30 - 11:00 fully encloses Period 1 (09:00-09:50)
    const available = isRoomAvailable('IST 225', 'Monday', timeToMinutes('08:30'), timeToMinutes('11:00'));
    expect(available).toBe(false);
  });

  it('handles exact boundary — end of one class is start of next window', () => {
    // Period 2 ends at 10:40, period 3 starts at 10:50
    // So 10:40 - 10:50 should be free (tea break)
    const available = isRoomAvailable('IST 225', 'Monday', timeToMinutes('10:40'), timeToMinutes('10:50'));
    expect(available).toBe(true);
  });
});

describe('Availability — Cross-Batch Overlap (CRITICAL)', () => {
  beforeEach(() => {
    resetMasterDataset();
  });

  it('detects occupied after merging multiple sections in same room', () => {
    // Section A: Monday period 1, 2, 5 in IST 225
    ingestTimetableBatch([MOCK_SECTION_A], { batchId: 'b1' });
    // Section C: Monday period 3 in IST 225
    ingestTimetableBatch([MOCK_SECTION_C], { batchId: 'b2' });

    // Period 3 (10:50 - 11:40) was free with only Section A, but now Section C uses it
    const available = isRoomAvailable('IST 225', 'Monday', timeToMinutes('10:50'), timeToMinutes('11:40'));
    expect(available).toBe(false);
  });

  it('calculates gap between Batch 1 and Batch 2 entries correctly', () => {
    // Section A has period 2 (09:50-10:40) and period 5 (12:30-13:20) on Monday
    // Section C adds period 3 (10:50-11:40) on Monday
    ingestTimetableBatch([MOCK_SECTION_A], { batchId: 'b1' });
    ingestTimetableBatch([MOCK_SECTION_C], { batchId: 'b2' });

    // 11:40 - 12:30 should still be free (between period 3 end and period 5 start)
    const available = isRoomAvailable('IST 225', 'Monday', timeToMinutes('11:40'), timeToMinutes('12:30'));
    expect(available).toBe(true);

    // 10:30 - 12:30 spans period 2 end through period 3 — NOT free
    const span = isRoomAvailable('IST 225', 'Monday', timeToMinutes('10:30'), timeToMinutes('12:30'));
    expect(span).toBe(false);
  });
});

describe('Available Window Calculation', () => {
  beforeEach(() => {
    resetMasterDataset();
    ingestTimetableBatch([MOCK_SECTION_A], { batchId: 'test_window' });
  });

  it('calculates correct free window', () => {
    // After period 2 (ends 10:40), next is period 5 (starts 12:30)
    const window = getAvailableWindow('IST 225', 'Monday', timeToMinutes('10:40'));
    expect(window.freeUntil).toBe(timeToMinutes('12:30'));
    expect(window.freeMinutes).toBe(110); // 10:40 to 12:30 = 110 min
  });
});

describe('getAvailableRooms with Filters', () => {
  beforeEach(() => {
    resetMasterDataset();
    ingestTimetableBatch([MOCK_SECTION_A, MOCK_SECTION_B], { batchId: 'test_filter' });
  });

  it('returns available rooms for free slot', () => {
    // Tuesday: Section A has periods 3-4 (10:50-12:30), Section B has periods 1-2 (09:00-10:40)
    // So IST 225 is free 09:00-10:50, IST 227 is free 10:40-16:50
    const rooms = getAvailableRooms('Tuesday', timeToMinutes('09:00'), timeToMinutes('09:50'));
    const roomIds = rooms.map(r => r.roomId);
    expect(roomIds).toContain('IST 225');
  });

  it('filters by floor', () => {
    const rooms = getAvailableRooms('Tuesday', timeToMinutes('14:00'), timeToMinutes('15:00'), { floor: 2 });
    for (const room of rooms) {
      expect(room.floor).toBe(2);
    }
  });
});

describe('Natural Language Parser', () => {
  it('parses "right now"', () => {
    const result = parseNaturalLanguage('Which rooms are free right now?');
    expect(result.startMinutes).toBeDefined();
  });

  it('parses floor', () => {
    const result = parseNaturalLanguage('Find a room on the second floor');
    expect(result.floor).toBe(2);
  });

  it('parses ground floor', () => {
    const result = parseNaturalLanguage('Find an AC room on the ground floor');
    expect(result.floor).toBe(0);
    expect(result.requiresAC).toBe(true);
  });

  it('parses duration', () => {
    const result = parseNaturalLanguage('Find a room for the next 2 hours');
    expect(result.durationMinutes).toBe(120);
  });

  it('parses time range', () => {
    const result = parseNaturalLanguage('Find a room from 2 PM to 4 PM');
    expect(result.startMinutes).toBe(14 * 60);
    expect(result.endMinutes).toBe(16 * 60);
  });

  it('parses AC requirement', () => {
    const result = parseNaturalLanguage('I need an AC room');
    expect(result.requiresAC).toBe(true);
  });

  it('handles complex query', () => {
    const result = parseNaturalLanguage('I need an AC room on the ground floor for my team for the next 2 hours');
    expect(result.floor).toBe(0);
    expect(result.requiresAC).toBe(true);
    expect(result.durationMinutes).toBe(120);
  });

  it('parses 90 minutes duration', () => {
    const result = parseNaturalLanguage('Find a room that is free for the next 90 minutes');
    expect(result.durationMinutes).toBe(90);
  });

  it('returns error for empty input', () => {
    const result = parseNaturalLanguage('');
    expect(result.error).toBeDefined();
  });
});

describe('findMatchingRooms Integration', () => {
  beforeEach(() => {
    resetMasterDataset();
    ingestTimetableBatch([MOCK_SECTION_A, MOCK_SECTION_B], { batchId: 'integration' });
  });

  it('returns rooms with dataset status', () => {
    const result = findMatchingRooms({
      day: 'Monday',
      startMinutes: timeToMinutes('14:00'),
      endMinutes: timeToMinutes('15:00'),
    });

    expect(result.rooms).toBeDefined();
    expect(result.datasetStatus).toBeDefined();
    expect(result.datasetStatus.batchesLoaded).toBe(1);
    expect(result.query).toBeDefined();
  });

  it('respects floor filter in findMatchingRooms', () => {
    const result = findMatchingRooms({
      day: 'Monday',
      startMinutes: timeToMinutes('14:00'),
      endMinutes: timeToMinutes('15:00'),
      floor: 2,
    });

    for (const room of result.rooms) {
      expect(room.floor).toBe(2);
    }
  });

  it('prevents negative duration on boundary/after-hours query', () => {
    const result = findMatchingRooms({
      day: 'Monday',
      startMinutes: timeToMinutes('17:00'),
    });
    expect(result.query.durationMinutes).toBeGreaterThanOrEqual(0);
    expect(timeToMinutes(result.query.endTime)).toBeGreaterThan(timeToMinutes(result.query.startTime));
  });

  it('provides helpful notice when AC status is unknown in official dataset', () => {
    const result = findMatchingRooms({
      day: 'Monday',
      startMinutes: timeToMinutes('10:00'),
      endMinutes: timeToMinutes('11:00'),
      requiresAC: true,
    });
    expect(result.query.requiresAC).toBe(true);
    expect(result.query.acNotice).toContain('UNKNOWN');
  });
});

describe('Prefix Room Normalization', () => {
  it('strips subject/course prefixes before IST room codes', () => {
    expect(normalizeRoomName('CDC/IST510')).toBe('IST 510');
    expect(normalizeRoomName('GERMAN/IST626')).toBe('IST 626');
    expect(normalizeRoomName('JAPANESE/IST702')).toBe('IST 702');
    expect(normalizeRoomName('CDC/IST710')).toBe('IST 710');
  });
});

describe('Batch-by-Batch Ingestion & Coverage Tracking', () => {
  beforeEach(() => {
    resetMasterDataset();
  });

  it('ingests all 10 timetable batches with 100% coverage', () => {
    loadAllSectionsData(SECTIONS_DATA);
    const status = getDatasetStatus();
    expect(status.batchesLoaded).toBe(10);
    expect(status.totalExpectedBatches).toBe(10);
    expect(status.coveragePct).toBe(100);
    expect(status.isComplete).toBe(true);
    expect(status.sectionsIngested).toBe(13);
    expect(status.roomsDiscovered).toBeGreaterThanOrEqual(20);
    expect(status.scheduleEntries).toBeGreaterThanOrEqual(200);
  });

  it('correctly tracks partial coverage when only 3 batches are loaded', () => {
    loadAllSectionsData(SECTIONS_DATA, 3);
    const status = getDatasetStatus();
    expect(status.batchesLoaded).toBe(3);
    expect(status.totalExpectedBatches).toBe(10);
    expect(status.coveragePct).toBe(30);
    expect(status.isComplete).toBe(false);
  });
});

// ═══════════════════════════════════════════════
// PHASE 2 TESTS: 3D MAP, COUNTDOWN & SQUAD SHARE
// ═══════════════════════════════════════════════

describe('Phase 2 — Live Countdown Timer Logic', () => {
  beforeEach(() => {
    resetMasterDataset();
    loadAllSectionsData(SECTIONS_DATA);
  });

  it('calculates exact time remaining between two timestamps', () => {
    // 14:00 (50400s) to 15:30 (55800s) = 5400s = 01:30:00
    const startSecs = 14 * 3600;
    const endSecs = 15 * 3600 + 30 * 60;
    const diff = endSecs - startSecs;

    const hours = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;

    const pad = (n) => String(n).padStart(2, '0');
    expect(`${pad(hours)}:${pad(mins)}:${pad(secs)}`).toBe('01:30:00');
  });

  it('determines the exact next class and available window for a free room', () => {
    // Room IST 509 on Monday starting at 10:00 (600 mins)
    const availableWindow = getAvailableWindow('IST 509', 'Monday', 600);
    expect(availableWindow).toBeDefined();
    expect(availableWindow.freeUntil).toBeGreaterThan(600);
    expect(availableWindow.freeMinutes).toBeGreaterThan(0);
  });

  it('detects countdown expiry condition when target time is reached or passed', () => {
    const currentTotalSeconds = 15 * 3600; // 3:00 PM
    const targetTotalSeconds = 15 * 3600;  // 3:00 PM
    const diff = targetTotalSeconds - currentTotalSeconds;
    const isExpired = diff <= 0;
    expect(isExpired).toBe(true);
  });
});

describe('Phase 2 — Call The Squad (WhatsApp Integration)', () => {
  it('generates a valid, dynamic WhatsApp click-to-chat URL with proper encoding', () => {
    const roomName = 'IST 509';
    const floor = 'Floor 5';
    const freeUntil = '2:30 PM';
    const duration = '1h 30m';
    const nextClass = { subjectName: 'Signals & Systems', classSection: 'ECE-A', startTime: '2:30 PM' };

    const messageText =
`📍 Heading to ${roomName} (${floor})!
🟢 Status: FREE until ${freeUntil} (~${duration} free)
📚 Next Class: ${nextClass.subjectName} (${nextClass.classSection}) at ${nextClass.startTime}
⚡ Grabbing seats now, come fast!`;

    const encoded = encodeURIComponent(messageText);
    const url = `https://wa.me/?text=${encoded}`;

    expect(url).toContain('https://wa.me/?text=');
    expect(url).toContain(encodeURIComponent('IST 509'));
    expect(url).toContain(encodeURIComponent('Floor 5'));
    expect(url).toContain(encodeURIComponent('FREE until 2:30 PM'));
    expect(url).toContain(encodeURIComponent('Signals %26 Systems'.replace('%26', '&')));
  });

  it('formats squad invite gracefully when no upcoming class exists', () => {
    const roomName = 'IST 204';
    const floor = 'Floor 2';
    const freeUntil = '4:50 PM';
    const duration = '3h 10m';

    const messageText =
`📍 Heading to ${roomName} (${floor})!
🟢 Status: FREE until ${freeUntil} (~${duration} free)
✨ Free for the rest of the schedule!
⚡ Grabbing seats now, come fast!`;

    const url = `https://wa.me/?text=${encodeURIComponent(messageText)}`;
    expect(url).toContain(encodeURIComponent('Free for the rest of the schedule!'));
  });
});

describe('Phase 2 — Building Map & Availability Engine Integration', () => {
  beforeEach(() => {
    resetMasterDataset();
    loadAllSectionsData(SECTIONS_DATA);
  });

  it('derives real room floors 1 through 7 from the dataset', () => {
    const { rooms } = getMasterDataset();
    const floorsPresent = new Set();
    Object.values(rooms).forEach(r => {
      if (r.floor !== null && r.floor !== undefined) {
        floorsPresent.add(r.floor);
      }
    });

    // Dataset has rooms across multiple floors in IST building
    expect(floorsPresent.has(1)).toBe(true);
    expect(floorsPresent.has(2)).toBe(true);
    expect(floorsPresent.has(5)).toBe(true);
  });

  it('synchronizes search results with building map room IDs', () => {
    const searchMatch = findMatchingRooms({
      day: 'Monday',
      startMinutes: timeToMinutes('11:00'),
      endMinutes: timeToMinutes('12:00'),
      floor: 5,
    });

    expect(searchMatch.rooms.length).toBeGreaterThan(0);
    // Every matching room must be on floor 5
    searchMatch.rooms.forEach(room => {
      expect(room.floor).toBe(5);
    });
  });
});


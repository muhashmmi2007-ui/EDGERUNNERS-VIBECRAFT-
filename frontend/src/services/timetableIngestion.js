/**
 * ══════════════════════════════════════════════════════════════════
 * TIMETABLE INGESTION SERVICE — The Free Class Locator
 * ══════════════════════════════════════════════════════════════════
 *
 * Converts section-centric timetable data into room-centric schedule data.
 * Supports batch-by-batch incremental ingestion with deduplication.
 *
 * Pipeline:
 *   UPLOAD BATCH → VALIDATE → PARSE → NORMALIZE → DEDUPLICATE → MERGE → INDEX
 */

// ── Standard Period Time Mapping ──
const PERIOD_TIMES = {
  1:  { start: '09:00', end: '09:50' },
  2:  { start: '09:50', end: '10:40' },
  3:  { start: '10:50', end: '11:40' },
  4:  { start: '11:40', end: '12:30' },
  5:  { start: '12:30', end: '13:20' },
  6:  { start: '13:20', end: '14:10' },
  7:  { start: '14:10', end: '15:00' },
  8:  { start: '15:10', end: '16:00' },
  9:  { start: '16:00', end: '16:50' },
};

// ── Time Utilities ──
export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ── Room Name Normalization ──
export function normalizeRoomName(raw) {
  if (!raw) return null;
  let name = String(raw).trim().toUpperCase();
  // Strip subject/course prefixes before room code (e.g., "GERMAN/IST602" → "IST 602", "CDC/IST510" → "IST 510")
  name = name.replace(/^(?:GERMAN|JAPANESE|CDC|[A-Z]+)\/(?=IST|LAB|TB|\d)/i, '');
  // Remove common prefixes
  name = name.replace(/^IST[\s-]*/i, 'IST ');
  // Normalize "IST602" → "IST 602"
  name = name.replace(/^IST(\d)/, 'IST $1');
  // Normalize lab references
  name = name.replace(/^LAB[\s-]*/i, 'LAB-');
  return name;
}

// ── Floor Extraction from Room Name ──
export function extractFloor(roomName) {
  if (!roomName) return null;
  const normalized = roomName.toUpperCase();

  // IST rooms: IST 225 → floor 2, IST 602 → floor 6
  const istMatch = normalized.match(/IST\s*(\d)/);
  if (istMatch) return parseInt(istMatch[1], 10);

  // LAB rooms: LAB-108 → floor 1, LAB-309 → floor 3
  const labMatch = normalized.match(/LAB[- ]*(\d)/);
  if (labMatch) return parseInt(labMatch[1], 10);

  // G-xxx or G xxx → ground floor
  if (/^G[-\s]?\d/.test(normalized)) return 0;

  // Pure numbers: 625 → floor 6, 401 → floor 4
  const numMatch = normalized.match(/^(\d)/);
  if (numMatch) return parseInt(numMatch[1], 10);

  // TB-106 → floor 1
  const tbMatch = normalized.match(/TB[- ]*(\d)/);
  if (tbMatch) return parseInt(tbMatch[1], 10);

  return null;
}

// ── Schedule Entry Unique Key (for deduplication) ──
function makeEntryKey(entry) {
  return `${entry.day}|${entry.startTime}|${entry.endTime}|${entry.roomId}|${entry.classSection}|${entry.subjectCode}`;
}

// ═══════════════════════════════════════════════
// MASTER DATASET — Singleton Store
// ═══════════════════════════════════════════════

const TOTAL_EXPECTED_BATCHES = 10;

let masterState = {
  rooms: {},           // roomId → { roomId, roomName, floor, attributes }
  scheduleEntries: {}, // entryKey → ScheduleEntry
  batches: [],         // Array of batch metadata
  sectionIds: new Set(), // Track which sections have been ingested
};

/** Reset the entire master dataset (for testing) */
export function resetMasterDataset() {
  masterState = {
    rooms: {},
    scheduleEntries: {},
    batches: [],
    sectionIds: new Set(),
  };
}

/** Get the current master dataset state (read-only snapshot) */
export function getMasterDataset() {
  return {
    rooms: { ...masterState.rooms },
    scheduleEntries: Object.values(masterState.scheduleEntries),
    batches: [...masterState.batches],
    sectionCount: masterState.sectionIds.size,
    totalExpectedBatches: TOTAL_EXPECTED_BATCHES,
  };
}

/** Get dataset loading status */
export function getDatasetStatus() {
  const loaded = masterState.batches.length;
  const sections = masterState.sectionIds.size;
  const rooms = Object.keys(masterState.rooms).length;
  const entries = Object.keys(masterState.scheduleEntries).length;

  return {
    batchesLoaded: loaded,
    totalExpectedBatches: TOTAL_EXPECTED_BATCHES,
    sectionsIngested: sections,
    roomsDiscovered: rooms,
    scheduleEntries: entries,
    isComplete: loaded >= TOTAL_EXPECTED_BATCHES,
    coveragePct: Math.round((loaded / TOTAL_EXPECTED_BATCHES) * 100),
    batchDetails: masterState.batches.map(b => ({
      id: b.id,
      sectionsIncluded: b.sectionsIncluded,
      timestamp: b.timestamp,
      entriesAdded: b.entriesAdded,
      duplicatesSkipped: b.duplicatesSkipped,
    })),
  };
}

// ═══════════════════════════════════════════════
// BATCH INGESTION
// ═══════════════════════════════════════════════

/**
 * Ingest a batch of section timetable data.
 *
 * @param {Array} sectionsArray — Array of section objects from SECTIONS_DATA format
 * @param {Object} opts — { batchId, sourceFile }
 * @returns {Object} — { success, batchId, entriesAdded, duplicatesSkipped, roomsDiscovered, errors }
 */
export function ingestTimetableBatch(sectionsArray, opts = {}) {
  const batchId = opts.batchId || `batch_${masterState.batches.length + 1}`;
  const sourceFile = opts.sourceFile || 'sectionsData.js';
  const timestamp = new Date().toISOString();
  const errors = [];
  let entriesAdded = 0;
  let duplicatesSkipped = 0;
  let roomsDiscovered = 0;
  const sectionsIncluded = [];

  if (!Array.isArray(sectionsArray) || sectionsArray.length === 0) {
    return {
      success: false,
      batchId,
      errors: ['Empty or invalid sections array'],
      entriesAdded: 0,
      duplicatesSkipped: 0,
      roomsDiscovered: 0,
    };
  }

  for (const section of sectionsArray) {
    // Validate section structure
    const validation = validateSection(section);
    if (!validation.valid) {
      errors.push(`Section ${section.id || 'UNKNOWN'}: ${validation.errors.join(', ')}`);
      continue;
    }

    // Skip already-ingested sections to avoid full duplication
    if (masterState.sectionIds.has(section.id)) {
      duplicatesSkipped++;
      continue;
    }

    // Extract primary venue room
    const venueRoom = extractRoomFromVenue(section.venue, section.id);
    if (venueRoom && !masterState.rooms[venueRoom.roomId]) {
      masterState.rooms[venueRoom.roomId] = venueRoom;
      roomsDiscovered++;
    }

    // Process weekly schedule
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const day of days) {
      const daySchedule = section.weeklySchedule?.[day];
      if (!daySchedule) continue;

      for (const slot of daySchedule) {
        const entries = convertSlotToEntries(slot, day, section, venueRoom, batchId);
        for (const entry of entries) {
          const key = makeEntryKey(entry);
          if (masterState.scheduleEntries[key]) {
            duplicatesSkipped++;
          } else {
            masterState.scheduleEntries[key] = entry;
            entriesAdded++;

            // Discover additional rooms from slot labels/rooms
            if (entry.roomId && !masterState.rooms[entry.roomId]) {
              masterState.rooms[entry.roomId] = {
                roomId: entry.roomId,
                roomName: entry.roomId,
                floor: extractFloor(entry.roomId),
                attributes: {},
              };
              roomsDiscovered++;
            }
          }
        }
      }
    }

    masterState.sectionIds.add(section.id);
    sectionsIncluded.push(section.id);
  }

  // Record batch metadata
  masterState.batches.push({
    id: batchId,
    sourceFile,
    timestamp,
    sectionsIncluded,
    entriesAdded,
    duplicatesSkipped,
    errors,
  });

  return {
    success: errors.length === 0,
    batchId,
    entriesAdded,
    duplicatesSkipped,
    roomsDiscovered,
    sectionsIncluded,
    errors,
  };
}

// ── Validate a section object ──
function validateSection(section) {
  const errors = [];
  if (!section.id) errors.push('Missing id');
  if (!section.weeklySchedule) errors.push('Missing weeklySchedule');
  if (!section.venue && !section.subjects) errors.push('Missing venue and subjects');
  return { valid: errors.length === 0, errors };
}

// ── Extract room info from venue string ──
function extractRoomFromVenue(venue, sectionId) {
  if (!venue || venue === 'Main Campus') return null;

  // "IST 225" or "IST 518/FN" → normalize
  const roomName = venue.split('/')[0].trim();
  const roomId = normalizeRoomName(roomName);

  return {
    roomId,
    roomName: roomId,
    floor: extractFloor(roomId),
    attributes: {},
  };
}

// ── Convert a schedule slot to one or more ScheduleEntry objects ──
function convertSlotToEntries(slot, day, section, primaryRoom, batchId) {
  const entries = [];

  // Resolve subject info
  const subjectInfo = section.subjects?.find(s => s.slot === slot.slot);
  const subjectName = subjectInfo?.name || slot.label || slot.slot;
  const subjectCode = subjectInfo?.code || slot.slot;
  const faculty = subjectInfo?.faculty || null;

  // Determine room
  let roomId;
  if (slot.room) {
    roomId = normalizeRoomName(slot.room);
  } else if (slot.label && /IST|LAB|TB/i.test(slot.label)) {
    // Extract room from label like "IST602" or "LAB-108/107"
    const labelRoom = slot.label.replace(/^[A-Z]\//, '').trim();
    roomId = normalizeRoomName(labelRoom);
  } else if (primaryRoom) {
    roomId = primaryRoom.roomId;
  } else {
    return entries; // No room info available, skip
  }

  // Determine periods
  const periods = slot.periods || [slot.period];

  if (periods.length > 0 && periods[0] !== undefined) {
    // Calculate overall start/end from first and last period
    const firstPeriod = Math.min(...periods);
    const lastPeriod = Math.max(...periods);

    const startInfo = PERIOD_TIMES[firstPeriod];
    const endInfo = PERIOD_TIMES[lastPeriod];

    if (startInfo && endInfo) {
      entries.push({
        id: `${batchId}_${section.id}_${day}_${firstPeriod}_${roomId}`,
        day,
        startTime: startInfo.start,
        endTime: endInfo.end,
        startMinutes: timeToMinutes(startInfo.start),
        endMinutes: timeToMinutes(endInfo.end),
        roomId,
        classSection: section.displayName || section.id,
        sectionId: section.id,
        subjectCode,
        subjectName,
        faculty,
        isLab: subjectInfo?.isLab || false,
        batchId,
      });
    }
  }

  return entries;
}

// ═══════════════════════════════════════════════
// TIMETABLE BATCH SPECIFICATIONS & AUTO-INGEST
// ═══════════════════════════════════════════════

export const TIMETABLE_BATCHES = [
  { id: 'Batch 1 (III ECE-DS)', sectionIds: ['III_ECE_DS'] },
  { id: 'Batch 2 (IV ECE-B)', sectionIds: ['IV_ECE_B'] },
  { id: 'Batch 3 (III ECE A & B)', sectionIds: ['III_ECE_A', 'III_ECE_B'] },
  { id: 'Batch 4 (IV ECE-A)', sectionIds: ['IV_ECE_A'] },
  { id: 'Batch 5 (III BME)', sectionIds: ['III_BME'] },
  { id: 'Batch 6 (II ECE-DS A & B)', sectionIds: ['II_ECE_DS_A', 'II_ECE_DS_B'] },
  { id: 'Batch 7 (II BME)', sectionIds: ['II_BME'] },
  { id: 'Batch 8 (I ECE-A)', sectionIds: ['I_ECE_A'] },
  { id: 'Batch 9 (I ECE-B & EEE)', sectionIds: ['I_ECE_B_EEE'] },
  { id: 'Batch 10 (I ECE-DS & Biotech)', sectionIds: ['I_ECE_DS', 'I_BIOTECH_B'] },
];

/**
 * Load sections in their 10 natural batches, preserving batch provenance.
 * If batchCount is specified (e.g. 3), only loads the first N batches to support partial dataset demonstration.
 * Safe to call multiple times — deduplicates internally.
 */
export function loadAllSectionsData(sectionsData, batchCount = 10) {
  if (Array.isArray(sectionsData) && sectionsData.length >= 10) {
    const batchesToLoad = TIMETABLE_BATCHES.slice(0, batchCount);
    const results = [];
    for (const batchDef of batchesToLoad) {
      const batchSections = sectionsData.filter(s => batchDef.sectionIds.includes(s.id));
      if (batchSections.length > 0) {
        results.push(ingestTimetableBatch(batchSections, {
          batchId: batchDef.id,
          sourceFile: 'sectionsData.js',
        }));
      }
    }
    return results;
  }

  return ingestTimetableBatch(sectionsData, {
    batchId: 'initial_load',
    sourceFile: 'sectionsData.js',
  });
}


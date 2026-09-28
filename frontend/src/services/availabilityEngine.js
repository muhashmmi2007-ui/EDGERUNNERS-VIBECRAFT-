/**
 * ══════════════════════════════════════════════════════════════════
 * AVAILABILITY ENGINE — The Free Class Locator
 * ══════════════════════════════════════════════════════════════════
 *
 * Deterministic availability calculations based on the master dataset.
 * AI does NOT determine availability — only this engine does.
 *
 * Proper interval-overlap logic:
 *   A room is available ONLY if the ENTIRE requested interval is free.
 */

import {
  getMasterDataset,
  getDatasetStatus,
  timeToMinutes,
  minutesToTime,
  extractFloor,
} from './timetableIngestion.js';

// ── Day of week mapping ──
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getCurrentDay() {
  const day = DAY_NAMES[new Date().getDay()];
  return (day === 'Sunday' || day === 'Saturday') ? 'Monday' : day;
}

function getCurrentTimeMinutes() {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const START_OF_DAY = 540;  // 09:00
  const END_OF_DAY = 1010;   // 16:50
  // If outside college operating hours, default to 10:00 AM for realistic demo
  if (mins < START_OF_DAY || mins >= END_OF_DAY) {
    return 600; // 10:00 AM
  }
  return mins;
}

// ═══════════════════════════════════════════════
// CORE AVAILABILITY FUNCTIONS
// ═══════════════════════════════════════════════

/**
 * Get the full schedule for a specific room on a specific day.
 * Returns entries sorted by start time.
 */
export function getRoomSchedule(roomId, day) {
  const { scheduleEntries } = getMasterDataset();
  return scheduleEntries
    .filter(e => e.roomId === roomId && e.day === day)
    .sort((a, b) => a.startMinutes - b.startMinutes);
}

/**
 * Check if a room is available for an ENTIRE time interval on a given day.
 * Uses proper interval-overlap detection.
 *
 * Two intervals [A, B) and [C, D) overlap if A < D and C < B.
 */
export function isRoomAvailable(roomId, day, startMinutes, endMinutes) {
  if (startMinutes >= endMinutes) return false;
  const schedule = getRoomSchedule(roomId, day);

  for (const entry of schedule) {
    // Check for overlap
    if (startMinutes < entry.endMinutes && entry.startMinutes < endMinutes) {
      return false;
    }
  }

  return true;
}

/**
 * Get ALL available rooms for a given time range on a given day.
 * Returns array of room objects with availability info.
 */
export function getAvailableRooms(day, startMinutes, endMinutes, filters = {}) {
  const { rooms } = getMasterDataset();
  const roomIds = Object.keys(rooms);
  const results = [];
  const hasKnownACData = Object.values(rooms).some(r => r.attributes?.hasAC !== undefined);

  for (const roomId of roomIds) {
    const room = rooms[roomId];

    // Apply floor filter
    if (filters.floor !== undefined && filters.floor !== null && room.floor !== filters.floor) {
      continue;
    }

    // Apply AC filter (only filter out rooms if AC data is known in dataset)
    if (filters.requiresAC && hasKnownACData && !room.attributes?.hasAC) {
      continue;
    }

    // Apply capacity filter
    if (filters.minCapacity && room.attributes?.capacity && room.attributes.capacity < filters.minCapacity) {
      continue;
    }

    // Check availability for the entire interval
    const available = isRoomAvailable(roomId, day, startMinutes, endMinutes);

    if (available) {
      // Calculate the available window (how long the room stays free)
      const window = getAvailableWindow(roomId, day, startMinutes);

      results.push({
        ...room,
        availableFrom: minutesToTime(startMinutes),
        availableUntil: window.freeUntil ? minutesToTime(window.freeUntil) : '16:50',
        availableMinutes: window.freeMinutes,
        nextClass: window.nextClass,
      });
    }
  }

  // Sort: rooms with longest availability first
  results.sort((a, b) => b.availableMinutes - a.availableMinutes);

  return results;
}

/**
 * Get the available window starting from a given time.
 * Returns when the next class starts and how long the room is free.
 */
export function getAvailableWindow(roomId, day, fromMinutes) {
  const schedule = getRoomSchedule(roomId, day);
  const END_OF_DAY = timeToMinutes('16:50');

  // Find the next class after fromMinutes
  let nextClass = null;
  let freeUntil = END_OF_DAY;

  for (const entry of schedule) {
    if (entry.startMinutes >= fromMinutes) {
      nextClass = entry;
      freeUntil = entry.startMinutes;
      break;
    }
  }

  return {
    freeUntil,
    freeMinutes: Math.max(0, freeUntil - fromMinutes),
    nextClass,
  };
}

/**
 * Get the next available window for a room on a given day, starting from a time.
 * Useful for finding "when will this room be free?"
 */
export function getNextAvailableWindow(roomId, day, fromMinutes) {
  const schedule = getRoomSchedule(roomId, day);
  const END_OF_DAY = timeToMinutes('16:50');

  let currentTime = fromMinutes;

  for (const entry of schedule) {
    if (entry.endMinutes <= currentTime) continue;
    if (entry.startMinutes > currentTime) {
      // There's a gap — room is free from currentTime to entry.startMinutes
      return {
        available: true,
        from: currentTime,
        fromTime: minutesToTime(currentTime),
        until: entry.startMinutes,
        untilTime: minutesToTime(entry.startMinutes),
        durationMinutes: entry.startMinutes - currentTime,
      };
    }
    currentTime = entry.endMinutes;
  }

  // Free from currentTime to end of day
  if (currentTime < END_OF_DAY) {
    return {
      available: true,
      from: currentTime,
      fromTime: minutesToTime(currentTime),
      until: END_OF_DAY,
      untilTime: minutesToTime(END_OF_DAY),
      durationMinutes: END_OF_DAY - currentTime,
    };
  }

  return { available: false };
}

/**
 * Get current status of a room right now.
 */
export function getRoomCurrentStatus(roomId) {
  const day = getCurrentDay();
  const now = getCurrentTimeMinutes();
  const schedule = getRoomSchedule(roomId, day);

  // Is it currently occupied?
  const currentClass = schedule.find(
    e => e.startMinutes <= now && now < e.endMinutes
  );

  if (currentClass) {
    return {
      status: 'OCCUPIED',
      currentClass,
      freeAt: minutesToTime(currentClass.endMinutes),
      freeAtMinutes: currentClass.endMinutes,
    };
  }

  // Find next class
  const nextClass = schedule.find(e => e.startMinutes > now);
  const nextWindow = getAvailableWindow(roomId, day, now);

  return {
    status: 'FREE',
    freeUntil: nextWindow.freeUntil ? minutesToTime(nextWindow.freeUntil) : '16:50',
    freeMinutes: nextWindow.freeMinutes,
    nextClass: nextClass || null,
  };
}

/**
 * Find rooms matching structured constraints.
 * This is what the NLP parser's output feeds into.
 */
export function findMatchingRooms(constraints) {
  const {
    day = getCurrentDay(),
    startMinutes,
    endMinutes,
    durationMinutes,
    floor,
    requiresAC,
    minCapacity,
  } = constraints;

  const START_OF_DAY = timeToMinutes('09:00');
  const END_OF_DAY = timeToMinutes('16:50');

  let effectiveStart = startMinutes !== undefined ? startMinutes : getCurrentTimeMinutes();
  // If query start is after college day or before classes start, clamp to standard class hours
  if (effectiveStart >= END_OF_DAY) {
    effectiveStart = START_OF_DAY;
  } else if (effectiveStart < START_OF_DAY) {
    effectiveStart = START_OF_DAY;
  }

  // Calculate end time
  let computedEnd = endMinutes;
  if (!computedEnd && durationMinutes) {
    computedEnd = effectiveStart + durationMinutes;
  }
  if (!computedEnd) {
    computedEnd = effectiveStart + 60; // Default 1 hour
  }

  // Ensure computedEnd is after effectiveStart and clamped to END_OF_DAY
  if (computedEnd <= effectiveStart) {
    computedEnd = Math.min(effectiveStart + 60, END_OF_DAY);
  }
  computedEnd = Math.min(computedEnd, END_OF_DAY);
  if (computedEnd <= effectiveStart) {
    computedEnd = END_OF_DAY;
    effectiveStart = Math.max(START_OF_DAY, END_OF_DAY - 50);
  }

  const { rooms: allRooms } = getMasterDataset();
  const hasKnownACData = Object.values(allRooms).some(r => r.attributes?.hasAC !== undefined);
  const acNotice = (requiresAC && !hasKnownACData)
    ? 'AC status is UNKNOWN in official dataset (no AC tags recorded). Showing all available rooms.'
    : null;

  const filters = {
    floor: floor !== undefined ? floor : null,
    requiresAC: requiresAC || false,
    minCapacity: minCapacity || null,
  };

  const rooms = getAvailableRooms(day, effectiveStart, computedEnd, filters);

  return {
    rooms,
    query: {
      day,
      startTime: minutesToTime(effectiveStart),
      endTime: minutesToTime(computedEnd),
      durationMinutes: Math.max(0, computedEnd - effectiveStart),
      floor: floor !== undefined ? floor : 'any',
      requiresAC: requiresAC || false,
      minCapacity: minCapacity || null,
      acNotice,
    },
    datasetStatus: getDatasetStatus(),
  };
}

/**
 * Get all rooms grouped by floor.
 */
export function getRoomsByFloor() {
  const { rooms } = getMasterDataset();
  const floorMap = {};

  for (const room of Object.values(rooms)) {
    const floor = room.floor ?? -1;
    if (!floorMap[floor]) floorMap[floor] = [];
    floorMap[floor].push(room);
  }

  // Sort rooms within each floor
  for (const floor of Object.keys(floorMap)) {
    floorMap[floor].sort((a, b) => a.roomId.localeCompare(b.roomId));
  }

  return floorMap;
}

/**
 * Get all rooms with their current status, optionally filtered.
 */
export function getAllRoomsWithStatus(day, timeMinutes) {
  const { rooms } = getMasterDataset();
  const d = day || getCurrentDay();
  const t = timeMinutes !== undefined ? timeMinutes : getCurrentTimeMinutes();

  return Object.values(rooms).map(room => {
    const schedule = getRoomSchedule(room.roomId, d);
    const currentClass = schedule.find(e => e.startMinutes <= t && t < e.endMinutes);
    const nextClass = schedule.find(e => e.startMinutes > t);
    const window = getAvailableWindow(room.roomId, d, t);

    let status;
    if (currentClass) {
      status = 'OCCUPIED';
    } else if (schedule.length === 0) {
      status = 'NO_DATA';
    } else {
      status = 'FREE';
    }

    return {
      ...room,
      status,
      currentClass: currentClass || null,
      nextClass: nextClass || null,
      freeUntil: !currentClass ? (window.freeUntil ? minutesToTime(window.freeUntil) : '16:50') : null,
      freeMinutes: !currentClass ? window.freeMinutes : 0,
      daySchedule: schedule,
    };
  });
}

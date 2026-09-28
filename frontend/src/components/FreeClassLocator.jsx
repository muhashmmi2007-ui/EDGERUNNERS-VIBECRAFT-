import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, MapPin, Clock, Building2, Filter, Sparkles, ChevronDown, ChevronRight, X, Database, ArrowLeft, Layers, Zap, Info, AlertTriangle, CheckCircle2, Loader2, DoorOpen, Compass } from 'lucide-react';
import { SECTIONS_DATA } from '../data/sectionsData';
import { loadAllSectionsData, getDatasetStatus, getMasterDataset, resetMasterDataset } from '../services/timetableIngestion';
import { findMatchingRooms, getRoomSchedule, getAllRoomsWithStatus } from '../services/availabilityEngine';
import { parseNaturalLanguage, formatTime } from '../services/nlpParser';
import { timeToMinutes } from '../services/timetableIngestion';
import BuildingMap3D from './BuildingMap3D';
import RoomCountdownTimer from './RoomCountdownTimer';
import SquadShareButton from './SquadShareButton';

// ── Example Queries — useful shortcuts, not decorative ──
const EXAMPLE_QUERIES = [
  { label: 'Free right now', query: 'Which rooms are free right now?' },
  { label: 'Next 2 hours', query: 'Find a room for the next 2 hours' },
  { label: '2nd floor', query: 'Free rooms on 2nd floor' },
  { label: 'AC · Ground floor', query: 'AC room on ground floor for 2 hours' },
  { label: '2 PM – 4 PM', query: 'Find a room from 2 PM to 4 PM' },
];

// ── Day names ──
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Floor display labels ──
function floorLabel(floor) {
  if (floor === null || floor === undefined || floor === -1) return 'Unknown';
  if (floor === 0) return 'Ground Floor';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = floor % 100;
  return `${floor}${s[(v - 20) % 10] || s[v] || s[0]} Floor`;
}

// ── Format minutes to display time ──
function displayTime(timeStr) {
  if (!timeStr) return '';
  const mins = timeToMinutes(timeStr);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export default function FreeClassLocator({ onBack }) {
  // ── State ──
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPhase, setSearchPhase] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [datasetLoaded, setDatasetLoaded] = useState(false);
  const [loadedBatchCount, setLoadedBatchCount] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState('search'); // 'search' | 'floors' | 'dataset'
  const [expandedFloors, setExpandedFloors] = useState(new Set());

  // ── Traditional Filters ──
  const [filterFloor, setFilterFloor] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('now');
  const [filterDay, setFilterDay] = useState(() => {
    const d = DAY_NAMES[new Date().getDay()];
    return (d === 'Sunday' || d === 'Saturday') ? 'Monday' : d;
  });

  // ── Load Dataset Handler ──
  const reloadData = useCallback((count = 10) => {
    resetMasterDataset();
    loadAllSectionsData(SECTIONS_DATA, count);
    setLoadedBatchCount(count);
    setDatasetLoaded(true);
    setSearchResults(null);
  }, []);

  // ── Load Dataset on Mount ──
  useEffect(() => {
    reloadData(10);
  }, [reloadData]);

  const datasetStatus = useMemo(() => {
    if (!datasetLoaded) return null;
    return getDatasetStatus();
  }, [datasetLoaded]);

  // ── Available floors from dataset ──
  const availableFloors = useMemo(() => {
    if (!datasetLoaded) return [];
    const { rooms } = getMasterDataset();
    const floors = new Set();
    Object.values(rooms).forEach(r => {
      if (r.floor !== null && r.floor !== undefined) floors.add(r.floor);
    });
    return Array.from(floors).sort((a, b) => a - b);
  }, [datasetLoaded]);

  // ── All rooms with current live status for Map ──
  const allRoomsStatusList = useMemo(() => {
    if (!datasetLoaded) return [];
    const day = searchResults?.query?.day || filterDay;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return getAllRoomsWithStatus(day, currentMinutes);
  }, [datasetLoaded, filterDay, searchResults]);

  // ── Locate room on 3D Map handler ──
  const handleLocateOnMap = useCallback((room) => {
    setSelectedRoom(room);
    setActiveView('map3d');
  }, []);

  // ── Search Handler ──
  const handleSearch = useCallback(async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsSearching(true);
    setSearchPhase('Understanding your request...');
    setSelectedRoom(null);

    // Simulate brief processing for UX feel
    await new Promise(r => setTimeout(r, 300));
    setSearchPhase('Parsing constraints...');

    const constraints = parseNaturalLanguage(q);

    if (constraints.error) {
      setSearchResults({ error: constraints.error, rooms: [], query: {} });
      setIsSearching(false);
      return;
    }

    await new Promise(r => setTimeout(r, 200));
    setSearchPhase('Checking timetable data...');

    await new Promise(r => setTimeout(r, 250));
    setSearchPhase('Finding matching rooms...');

    const results = findMatchingRooms(constraints);

    setSearchResults({
      ...results,
      interpretations: constraints.interpretations || [],
      originalQuery: q,
    });
    setIsSearching(false);
    setSearchPhase('');
  }, [query]);

  // ── Traditional Filter Search ──
  const handleFilterSearch = useCallback(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const day = filterDay;

    let startMinutes, endMinutes;
    switch (filterAvailability) {
      case 'now':
        startMinutes = currentMinutes;
        endMinutes = currentMinutes + 60;
        break;
      case 'next_hour':
        startMinutes = currentMinutes;
        endMinutes = currentMinutes + 60;
        break;
      case 'next_2h':
        startMinutes = currentMinutes;
        endMinutes = currentMinutes + 120;
        break;
      case 'next_3h':
        startMinutes = currentMinutes;
        endMinutes = currentMinutes + 180;
        break;
      default:
        startMinutes = currentMinutes;
        endMinutes = currentMinutes + 60;
    }

    const constraints = {
      day,
      startMinutes,
      endMinutes,
      floor: filterFloor !== 'all' ? parseInt(filterFloor, 10) : undefined,
    };

    const results = findMatchingRooms(constraints);
    setSearchResults({
      ...results,
      interpretations: [
        `Day: ${day}`,
        `Time: ${formatTime(startMinutes)} – ${formatTime(endMinutes)}`,
        filterFloor !== 'all' ? `Floor: ${floorLabel(parseInt(filterFloor, 10))}` : 'All Floors',
      ],
      originalQuery: `Filter: ${filterAvailability} on ${day}`,
    });
  }, [filterFloor, filterAvailability, filterDay]);

  // ── Floor View Data ──
  const floorViewData = useMemo(() => {
    if (!datasetLoaded) return {};
    const day = filterDay;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const allRooms = getAllRoomsWithStatus(day, currentMinutes);

    const byFloor = {};
    for (const room of allRooms) {
      const floor = room.floor ?? -1;
      if (!byFloor[floor]) byFloor[floor] = [];
      byFloor[floor].push(room);
    }

    for (const floor of Object.keys(byFloor)) {
      byFloor[floor].sort((a, b) => a.roomId.localeCompare(b.roomId));
    }

    return byFloor;
  }, [datasetLoaded, filterDay]);

  // ── Key press handler ──
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // ── Room Detail Modal ──
  const roomDetail = useMemo(() => {
    if (!selectedRoom || !datasetLoaded) return null;
    const day = searchResults?.query?.day || filterDay;
    const schedule = getRoomSchedule(selectedRoom.roomId, day);
    return { ...selectedRoom, daySchedule: schedule, day };
  }, [selectedRoom, datasetLoaded, searchResults, filterDay]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      {/* ═══ TOP NAV ═══ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(9, 9, 11, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {onBack && (
              <button onClick={onBack} style={{
                background: 'transparent', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
              }}>
                <ArrowLeft size={18} />
              </button>
            )}
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              Free Class Finder & Attendance Predictor
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[
              { key: 'search', label: 'Search' },
              { key: 'map3d', label: 'Map' },
              { key: 'floors', label: 'Floors' },
              { key: 'dataset', label: 'Data' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: activeView === tab.key ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  color: activeView === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer',
                  transition: 'all var(--duration-fast) var(--ease-out)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Dataset sync status */}
          {datasetStatus && (
            <button
              onClick={() => setActiveView(activeView === 'dataset' ? 'search' : 'dataset')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 'var(--radius-md)',
                background: 'transparent',
                border: 'none',
                color: datasetStatus.isComplete ? 'var(--emerald)' : 'var(--amber)',
                fontSize: 'var(--text-xs)', fontWeight: 500, cursor: 'pointer',
              }}
            >
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: datasetStatus.isComplete ? 'var(--emerald)' : 'var(--amber)',
              }} />
              {datasetStatus.isComplete ? 'Synced' : `${datasetStatus.batchesLoaded}/${datasetStatus.totalExpectedBatches}`}
            </button>
          )}
        </div>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <main style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 24px', flex: 1 }}>

        {/* ═══ SEARCH VIEW ═══ */}
        {activeView === 'search' && (
          <div className="animate-fade-in-up">
            {/* Hero Search Area */}
            <div style={{
              textAlign: 'center',
              paddingTop: searchResults ? 32 : 80,
              paddingBottom: searchResults ? 24 : 48,
              transition: 'padding 0.3s var(--ease-out)',
            }}>
              {!searchResults && (
                <>
                  <h1 style={{
                    fontSize: 'var(--text-4xl)', fontWeight: 800,
                    letterSpacing: '-0.035em', lineHeight: 1.15,
                    marginBottom: 12,
                    color: 'var(--text-primary)',
                  }}>
                    Where are you working today?
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-lg)', maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.6 }}>
                    Find a classroom that's free when you need it.
                  </p>
                </>
              )}

              {/* Search Bar */}
              <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '4px 4px 4px 16px',
                  transition: 'border-color var(--duration-normal), box-shadow var(--duration-normal)',
                }}>
                  <Search size={16} color="var(--text-faint)" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="AC room on ground floor for 2 hours..."
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      color: 'var(--text-primary)', fontSize: 'var(--text-base)',
                      fontFamily: 'inherit', padding: '10px 12px',
                    }}
                    id="ai-search-input"
                  />
                  <button
                    onClick={() => handleSearch()}
                    disabled={isSearching || !query.trim()}
                    className="btn btn-primary"
                    style={{ borderRadius: 'var(--radius-md)', padding: '8px 18px', fontSize: 'var(--text-sm)' }}
                    id="find-rooms-btn"
                  >
                    {isSearching ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
                  </button>
                </div>
              </div>

              {/* Example Query Shortcuts */}
              {!searchResults && (
                <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  {EXAMPLE_QUERIES.map((eq, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(eq.query);
                        handleSearch(eq.query);
                      }}
                      style={{
                        padding: '5px 12px', borderRadius: 'var(--radius-md)',
                        background: 'transparent', border: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)', fontSize: 'var(--text-xs)',
                        cursor: 'pointer', transition: 'all var(--duration-fast)',
                        fontFamily: 'inherit', fontWeight: 500,
                      }}
                      onMouseEnter={(e) => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.color = 'var(--text-muted)'; }}
                    >
                      {eq.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filters row */}
            <div style={{ marginBottom: 20 }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'transparent', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  fontSize: 'var(--text-sm)', fontWeight: 500,
                  fontFamily: 'inherit', padding: '6px 0',
                }}
              >
                <Filter size={13} />
                Filters
                {showFilters ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>

              {showFilters && (
                <div className="animate-slide-down" style={{
                  padding: '16px 0', marginTop: 4,
                  display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end',
                  borderBottom: '1px solid var(--border-faint)',
                }}>
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Day</label>
                    <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="input-field" style={{ minWidth: 130 }}>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                        <option key={d} value={d}>{d}{d === DAY_NAMES[new Date().getDay()] ? ' (Today)' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Floor</label>
                    <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)} className="input-field" style={{ minWidth: 130 }}>
                      <option value="all">All Floors</option>
                      {availableFloors.map(f => (<option key={f} value={f}>{floorLabel(f)}</option>))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Duration</label>
                    <select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value)} className="input-field" style={{ minWidth: 150 }}>
                      <option value="now">Free now (1 hr)</option>
                      <option value="next_hour">Next hour</option>
                      <option value="next_2h">Next 2 hours</option>
                      <option value="next_3h">Next 3 hours</option>
                    </select>
                  </div>
                  <button onClick={handleFilterSearch} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}>
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* ═══ SEARCH STATE ═══ */}
            {isSearching && (
              <div className="animate-fade-in" style={{ padding: '48px 0', textAlign: 'center' }}>
                <Loader2 size={20} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{searchPhase}</div>
              </div>
            )}

            {/* ═══ RESULTS ═══ */}
            {searchResults && !isSearching && (
              <div className="animate-fade-in-up">
                {/* Interpreted constraints */}
                {searchResults.interpretations?.length > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6,
                    padding: '8px 0', marginBottom: 12,
                    fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
                  }}>
                    <span style={{ fontWeight: 500 }}>Parsed:</span>
                    {searchResults.interpretations.map((interp, i) => (
                      <span key={i} style={{
                        padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface)', border: '1px solid var(--border-faint)',
                        fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
                      }}>{interp}</span>
                    ))}
                  </div>
                )}

                {searchResults.query?.acNotice && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', marginBottom: 12,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-faint)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
                  }}>
                    <Info size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                    <span>{searchResults.query.acNotice}</span>
                  </div>
                )}

                {searchResults.datasetStatus && !searchResults.datasetStatus.isComplete && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', marginBottom: 12,
                    background: 'var(--amber-bg)',
                    border: '1px solid rgba(245, 158, 11, 0.12)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)', color: 'var(--amber-light)',
                  }}>
                    <AlertTriangle size={13} />
                    {searchResults.datasetStatus.batchesLoaded}/{searchResults.datasetStatus.totalExpectedBatches} batches loaded ({searchResults.datasetStatus.coveragePct}% coverage)
                  </div>
                )}

                {/* Results Header */}
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                      {searchResults.rooms.length} {searchResults.rooms.length === 1 ? 'room' : 'rooms'} found
                    </span>
                    {searchResults.rooms.length > 0 && (
                      <button
                        onClick={() => setActiveView('map3d')}
                        style={{
                          background: 'transparent', border: 'none',
                          color: 'var(--brand-light)', fontSize: 'var(--text-xs)',
                          cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit',
                        }}
                      >
                        View on map →
                      </button>
                    )}
                  </div>
                  {searchResults.query && (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
                      {searchResults.query.day} · {displayTime(searchResults.query.startTime)} – {displayTime(searchResults.query.endTime)}
                    </span>
                  )}
                </div>

                {/* Room Cards Grid */}
                {searchResults.rooms.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                    {searchResults.rooms.map((room, i) => (
                      <RoomCard
                        key={room.roomId}
                        room={room}
                        query={searchResults.query}
                        index={i}
                        onClick={() => setSelectedRoom(room)}
                        onLocateOnMap={handleLocateOnMap}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                      No rooms fit that request
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.6 }}>
                      {searchResults.error || 'Try a shorter duration, different floor, or remove the AC requirement.'}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                      {['Any floor', 'Shorter duration', 'Later start'].map(s => (
                        <span key={s} style={{
                          padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ MAP VIEW ═══ */}
        {activeView === 'map3d' && (
          <div className="animate-fade-in-up" style={{ paddingTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
                  Building Map
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
                  Live room availability · {filterDay}
                </p>
              </div>
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="input-field"
                style={{ minWidth: 130, padding: '6px 10px', fontSize: 'var(--text-xs)' }}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                  <option key={d} value={d}>{d}{d === DAY_NAMES[new Date().getDay()] ? ' (Today)' : ''}</option>
                ))}
              </select>
            </div>

            <BuildingMap3D
              roomsWithStatus={allRoomsStatusList}
              selectedRoom={selectedRoom}
              onSelectRoom={setSelectedRoom}
              day={searchResults?.query?.day || filterDay}
              searchMatchingRoomIds={searchResults?.rooms ? searchResults.rooms.map(r => r.roomId) : []}
            />
          </div>
        )}

        {/* ═══ FLOOR VIEW ═══ */}
        {activeView === 'floors' && (
          <div className="animate-fade-in-up" style={{ paddingTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Floors</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
                  Room status · {filterDay}
                </p>
              </div>
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="input-field"
                style={{ minWidth: 130, padding: '6px 10px', fontSize: 'var(--text-xs)' }}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                  <option key={d} value={d}>{d}{d === DAY_NAMES[new Date().getDay()] ? ' (Today)' : ''}</option>
                ))}
              </select>
            </div>

            {Object.keys(floorViewData)
              .sort((a, b) => Number(a) - Number(b))
              .map(floorNum => {
                const floor = Number(floorNum);
                const rooms = floorViewData[floorNum];
                const isExpanded = expandedFloors.has(floor) || expandedFloors.size === 0;
                const freeCount = rooms.filter(r => r.status === 'FREE').length;
                const busyCount = rooms.filter(r => r.status === 'OCCUPIED').length;
                const noDataCount = rooms.filter(r => r.status === 'NO_DATA').length;

                return (
                  <div key={floorNum} className="glass-card" style={{ marginBottom: 16, overflow: 'hidden' }}>
                    <button
                      onClick={() => {
                        setExpandedFloors(prev => {
                          const next = new Set(prev);
                          if (next.has(floor)) next.delete(floor);
                          else next.add(floor);
                          return next;
                        });
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '16px 20px',
                        background: 'transparent', border: 'none',
                        color: 'var(--text-primary)', cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Building2 size={18} color="var(--cyan-light)" />
                        <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{floorLabel(floor)}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>({rooms.length} rooms)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {freeCount > 0 && <span className="badge badge-emerald">{freeCount} Free</span>}
                        {busyCount > 0 && <span className="badge badge-rose">{busyCount} Busy</span>}
                        {noDataCount > 0 && <span className="badge badge-purple">{noDataCount} No Data</span>}
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                        {rooms.map(room => (
                          <FloorRoomTile
                            key={room.roomId}
                            room={room}
                            onClick={() => setSelectedRoom(room)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            }
          </div>
        )}

        {/* ═══ DATASET VIEW ═══ */}
        {activeView === 'dataset' && datasetStatus && (
          <DatasetStatusPanel
            status={datasetStatus}
            onReloadData={reloadData}
            loadedBatchCount={loadedBatchCount}
          />
        )}
      </main>

      {/* ═══ ROOM DETAIL MODAL ═══ */}
      {selectedRoom && roomDetail && (
        <div className="modal-backdrop" onClick={() => setSelectedRoom(null)}>
          <div
            className="glass-card animate-fade-in-up"
            style={{ maxWidth: 560, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <RoomDetailPanel
              room={roomDetail}
              query={searchResults?.query}
              onClose={() => setSelectedRoom(null)}
              onLocateOnMap={handleLocateOnMap}
            />
          </div>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        borderTop: '1px solid var(--border-faint)',
        padding: '16px 24px',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-faint)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Free Class Finder & Attendance Predictor</span>
          {datasetStatus && (
            <span>{datasetStatus.roomsDiscovered} rooms · {datasetStatus.sectionsIngested} sections</span>
          )}
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════

function RoomCard({ room, query, index, onClick, onLocateOnMap }) {
  const statusColor = 'var(--emerald)';
  const availMins = room.availableMinutes || 0;
  const hours = Math.floor(availMins / 60);
  const mins = availMins % 60;
  const durationStr = hours > 0
    ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`
    : `${mins}m`;

  return (
    <div
      className="glass-card glass-interactive animate-fade-in-up"
      style={{
        padding: 20, cursor: 'pointer',
        animationDelay: `${index * 0.05}s`,
      }}
      onClick={onClick}
    >
      {/* Room Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {room.roomName || room.roomId}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>
            <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {floorLabel(room.floor)}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 'var(--radius-full)',
          background: 'var(--emerald-bg)',
          border: '1px solid rgba(52, 211, 153, 0.25)',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--emerald-light)', textTransform: 'uppercase' }}>FREE</span>
        </div>
      </div>

      {/* Availability Info */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 14,
        padding: '10px 12px', borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-inset)',
      }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Available</div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {displayTime(room.availableFrom)} – {displayTime(room.availableUntil)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Duration</div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--emerald-light)', fontFamily: 'var(--font-mono)' }}>
            {durationStr}
          </div>
        </div>
      </div>

      {/* Next Class Info */}
      {room.nextClass && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Next: <strong>{room.nextClass.subjectName}</strong> ({room.nextClass.classSection}) at {displayTime(room.nextClass.startTime)}
        </div>
      )}

      {/* Room attributes */}
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        {room.attributes?.hasAC === true && <span className="badge badge-cyan">AC Available</span>}
        {room.attributes?.hasAC === false && <span className="badge badge-purple">No AC</span>}
        {query?.requiresAC && room.attributes?.hasAC === undefined && (
          <span className="badge badge-purple" title="AC information not recorded in official dataset (treated as UNKNOWN)">
            AC: Unknown
          </span>
        )}
        {room.attributes?.capacity && <span className="badge badge-purple">Cap: {room.attributes.capacity}</span>}
      </div>

      {/* Phase 2 Action Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingTop: 12,
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onLocateOnMap) onLocateOnMap(room);
          }}
          className="btn btn-secondary"
          style={{
            padding: '4px 10px',
            fontSize: 'var(--text-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            color: 'var(--cyan-light)',
            borderColor: 'rgba(6, 182, 212, 0.35)',
            background: 'rgba(6, 182, 212, 0.08)',
            cursor: 'pointer',
          }}
          title="Highlight and view this room on the 3D Building Map"
        >
          <Compass size={13} />
          <span>Locate in 3D Map</span>
        </button>

        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
          Countdown & Share <ChevronRight size={13} />
        </span>
      </div>
    </div>
  );
}

function FloorRoomTile({ room, onClick }) {
  const statusStyles = {
    FREE: { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.25)', color: 'var(--emerald-light)', dot: 'var(--emerald)' },
    OCCUPIED: { bg: 'rgba(239, 68, 68, 0.06)', border: 'rgba(239, 68, 68, 0.2)', color: 'var(--rose-light)', dot: 'var(--rose)' },
    NO_DATA: { bg: 'rgba(139, 92, 246, 0.06)', border: 'rgba(139, 92, 246, 0.2)', color: 'var(--purple-light)', dot: 'var(--purple)' },
  };

  const style = statusStyles[room.status] || statusStyles.NO_DATA;

  return (
    <button
      onClick={onClick}
      style={{
        padding: '14px 16px', borderRadius: 'var(--radius-md)',
        background: style.bg, border: `1px solid ${style.border}`,
        cursor: 'pointer', textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'all var(--duration-fast) var(--ease-out)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>{room.roomId}</span>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: style.dot, boxShadow: `0 0 6px ${style.dot}` }} />
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: style.color, fontWeight: 600, textTransform: 'uppercase' }}>
        {room.status === 'FREE' && `Free until ${room.freeUntil ? displayTime(room.freeUntil) : 'EOD'}`}
        {room.status === 'OCCUPIED' && room.currentClass && `${room.currentClass.subjectName}`}
        {room.status === 'NO_DATA' && 'No schedule data'}
      </div>
    </button>
  );
}

function RoomDetailPanel({ room, query, onClose, onLocateOnMap }) {
  const isFree = room.status === 'FREE' || (!room.status && room.availableUntil);
  const isOccupied = room.status === 'OCCUPIED';

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>{room.roomName || room.roomId}</div>
            {onLocateOnMap && (
              <button
                onClick={() => {
                  onClose();
                  onLocateOnMap(room);
                }}
                className="btn btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: 'var(--text-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  color: 'var(--cyan-light)',
                  borderColor: 'rgba(6, 182, 212, 0.35)',
                  background: 'rgba(6, 182, 212, 0.08)',
                  cursor: 'pointer',
                }}
                title="View this room on the 3D interactive building map"
              >
                <Compass size={13} />
                <span>3D Map</span>
              </button>
            )}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
            {floorLabel(room.floor)}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8 }}>
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 24px' }}>
        {/* Status Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 'var(--radius-md)',
          background: isOccupied ? 'var(--rose-bg)' : isFree ? 'var(--emerald-bg)' : 'rgba(139, 92, 246, 0.08)',
          border: `1px solid ${isOccupied ? 'rgba(239,68,68,0.2)' : isFree ? 'rgba(52,211,153,0.2)' : 'rgba(139,92,246,0.2)'}`,
        }}>
          {isOccupied ? (
            <AlertTriangle size={16} color="var(--rose-light)" />
          ) : isFree ? (
            <CheckCircle2 size={16} color="var(--emerald-light)" />
          ) : (
            <Info size={16} color="var(--purple-light)" />
          )}
          <span style={{
            fontWeight: 700,
            color: isOccupied ? 'var(--rose-light)' : isFree ? 'var(--emerald-light)' : 'var(--purple-light)',
          }}>
            {isOccupied ? 'Currently Occupied' : isFree ? 'Currently Free' : 'No Schedule Data In Loaded Batches'}
          </span>
        </div>

        {/* ═══ PHASE 2: LIVE COUNTDOWN TIMER ═══ */}
        {isFree && (
          <div style={{ marginTop: 16 }}>
            <RoomCountdownTimer
              room={room}
              freeUntilTime={room.availableUntil || room.freeUntil || '16:50'}
              nextClass={room.nextClass}
              day={room.day || query?.day || 'Monday'}
            />
          </div>
        )}

        {/* ═══ PHASE 2: CALL THE SQUAD (WHATSAPP INVITE) ═══ */}
        {isFree && (
          <div style={{ marginTop: 16 }}>
            <SquadShareButton
              room={room}
              floorName={floorLabel(room.floor)}
              freeUntil={room.availableUntil ? displayTime(room.availableUntil) : (room.freeUntil ? displayTime(room.freeUntil) : '16:50')}
              freeMinutes={room.availableMinutes || room.freeMinutes || 60}
              nextClass={room.nextClass}
              day={room.day || query?.day || 'Monday'}
            />
          </div>
        )}

        {/* Current/Next Class */}
        {room.currentClass && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Now Playing</div>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-inset)', border: '1px solid var(--border-faint)' }}>
              <div style={{ fontWeight: 700 }}>{room.currentClass.subjectName}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {room.currentClass.classSection} • {displayTime(room.currentClass.startTime)} – {displayTime(room.currentClass.endTime)}
              </div>
            </div>
          </div>
        )}

        {room.nextClass && !isFree && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Next Scheduled Class</div>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-inset)', border: '1px solid var(--border-faint)' }}>
              <div style={{ fontWeight: 700 }}>{room.nextClass.subjectName}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {room.nextClass.classSection} • {displayTime(room.nextClass.startTime)} – {displayTime(room.nextClass.endTime)}
                {room.nextClass.faculty && ` • ${room.nextClass.faculty}`}
              </div>
            </div>
          </div>
        )}

        {/* Full Day Schedule */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
            {room.day || query?.day || 'Today'}'s Full Schedule
          </div>
          {room.daySchedule && room.daySchedule.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {room.daySchedule.map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-faint)',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', minWidth: 100 }}>
                    {displayTime(entry.startTime)} – {displayTime(entry.endTime)}
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {entry.subjectName}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', marginLeft: 'auto' }}>
                    {entry.classSection}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-inset)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
              No classes scheduled for this day
            </div>
          )}
        </div>

        {/* Match Reason */}
        {query && (
          <div style={{ marginTop: 20, padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--cyan-light)', fontWeight: 700, marginBottom: 4 }}>WHY THIS ROOM MATCHES</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Room is free for the requested period ({displayTime(query.startTime)} – {displayTime(query.endTime)}) on {query.day}.
              {query.floor !== 'any' && ` Located on ${floorLabel(query.floor)}.`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DatasetStatusPanel({ status, onReloadData, loadedBatchCount }) {
  return (
    <div className="animate-fade-in-up">
      <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 24 }}>
        Dataset Status & Provenance
      </h2>

      {/* Coverage Card */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Database size={20} color="var(--cyan-light)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>Timetable Coverage</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {status.isComplete
                ? 'All timetable data loaded — full campus coverage.'
                : `${status.batchesLoaded} of ${status.totalExpectedBatches} timetable batches loaded.`
              }
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ background: 'var(--bg-inset)', borderRadius: 'var(--radius-full)', height: 10, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{
            height: '100%', borderRadius: 'var(--radius-full)',
            width: `${status.coveragePct}%`,
            background: status.isComplete
              ? 'linear-gradient(90deg, var(--emerald), var(--emerald-light))'
              : 'linear-gradient(90deg, var(--amber), var(--amber-light))',
            transition: 'width 0.5s var(--ease-out)',
          }} />
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { label: 'Batches Loaded', value: status.batchesLoaded, max: status.totalExpectedBatches },
            { label: 'Sections Ingested', value: status.sectionsIngested },
            { label: 'Rooms Discovered', value: status.roomsDiscovered },
            { label: 'Schedule Entries', value: status.scheduleEntries },
          ].map(stat => (
            <div key={stat.label} style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-inset)', border: '1px solid var(--border-faint)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {stat.value}{stat.max ? <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}> / {stat.max}</span> : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Incremental Ingestion Simulator */}
        {onReloadData && (
          <div style={{
            marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--cyan-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Incremental Ingestion Demonstration
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Simulate partial batch availability to audit safety warnings and recalculations
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onReloadData(3)}
                className="btn btn-secondary"
                style={{
                  padding: '6px 12px', fontSize: '0.75rem',
                  borderColor: loadedBatchCount === 3 ? 'var(--amber)' : 'var(--border-subtle)',
                  color: loadedBatchCount === 3 ? 'var(--amber-light)' : 'var(--text-secondary)',
                  background: loadedBatchCount === 3 ? 'var(--amber-bg)' : 'transparent',
                }}
              >
                Load 3 Batches (30%)
              </button>
              <button
                onClick={() => onReloadData(6)}
                className="btn btn-secondary"
                style={{
                  padding: '6px 12px', fontSize: '0.75rem',
                  borderColor: loadedBatchCount === 6 ? 'var(--amber)' : 'var(--border-subtle)',
                  color: loadedBatchCount === 6 ? 'var(--amber-light)' : 'var(--text-secondary)',
                  background: loadedBatchCount === 6 ? 'var(--amber-bg)' : 'transparent',
                }}
              >
                Load 6 Batches (60%)
              </button>
              <button
                onClick={() => onReloadData(10)}
                className="btn btn-secondary"
                style={{
                  padding: '6px 12px', fontSize: '0.75rem',
                  borderColor: loadedBatchCount === 10 ? 'var(--emerald)' : 'var(--border-subtle)',
                  color: loadedBatchCount === 10 ? 'var(--emerald-light)' : 'var(--text-secondary)',
                  background: loadedBatchCount === 10 ? 'var(--emerald-bg)' : 'transparent',
                }}
              >
                Load All 10 Batches (100%)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Details */}
      {status.batchDetails.length > 0 && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 16 }}>Batch History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {status.batchDetails.map((batch, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)', border: '1px solid var(--border-faint)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={14} color="var(--emerald)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{batch.id}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Sections: {batch.sectionsIncluded.join(', ')}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>+{batch.entriesAdded} entries</div>
                  {batch.duplicatesSkipped > 0 && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>{batch.duplicatesSkipped} duplicates skipped</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

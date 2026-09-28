import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Layers,
  Compass,
  MapPin,
  Clock,
  DoorOpen,
  Sparkles,
  Maximize2,
  Minimize2,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  X,
} from 'lucide-react';
import RoomCountdownTimer from './RoomCountdownTimer';
import SquadShareButton from './SquadShareButton';
import { timeToMinutes } from '../services/timetableIngestion';
import { getRoomCurrentStatus } from '../services/availabilityEngine';

// ── Floor labels ──
function floorName(f) {
  if (f === null || f === undefined || f === -1) return 'Specialized Labs';
  if (f === 0) return 'Ground Floor';
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = f % 100;
  return `${f}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]} Floor`;
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

export default function BuildingMap3D({
  roomsWithStatus = [],
  selectedRoom = null,
  onSelectRoom = () => {},
  day = 'Monday',
  searchMatchingRoomIds = [],
  initialFloor = null,
}) {
  // Available floors sorted ascending
  const floorsList = useMemo(() => {
    const set = new Set();
    roomsWithStatus.forEach(r => {
      if (r.floor !== null && r.floor !== undefined) {
        set.add(r.floor);
      }
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [roomsWithStatus]);

  // Selected Floor State (defaults to selectedRoom's floor, initialFloor, or Floor 5 / first floor)
  const [activeFloor, setActiveFloor] = useState(() => {
    if (selectedRoom?.floor !== undefined && selectedRoom?.floor !== null) {
      return selectedRoom.floor;
    }
    if (initialFloor !== null && initialFloor !== undefined) {
      return initialFloor;
    }
    return 5; // Default to Floor 5 (prominent academic floor)
  });

  // 3D Isometric vs 2D Plan View toggle
  const [is3DView, setIs3DView] = useState(true);
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  // Sync active floor when selectedRoom changes externally
  useEffect(() => {
    if (selectedRoom && selectedRoom.floor !== undefined && selectedRoom.floor !== null) {
      setActiveFloor(selectedRoom.floor);
    }
  }, [selectedRoom]);

  // Filter rooms on current active floor
  const floorRooms = useMemo(() => {
    return roomsWithStatus.filter(r => {
      if (activeFloor === -1 || activeFloor === 'labs') {
        return r.floor === null || r.floor === undefined || r.floor === -1;
      }
      return r.floor === activeFloor;
    });
  }, [roomsWithStatus, activeFloor]);

  // Floor stats
  const floorStats = useMemo(() => {
    const free = floorRooms.filter(r => r.status === 'FREE').length;
    const occupied = floorRooms.filter(r => r.status === 'OCCUPIED').length;
    const total = floorRooms.length;
    return { free, occupied, total };
  }, [floorRooms]);

  // Handlers
  const handleRoomClick = (room) => {
    onSelectRoom(room);
  };

  const handleCountdownZero = (roomId) => {
    // Re-query current status when countdown reaches zero
    const freshStatus = getRoomCurrentStatus(roomId);
    if (selectedRoom && selectedRoom.roomId === roomId) {
      onSelectRoom({
        ...selectedRoom,
        status: freshStatus.status,
        currentClass: freshStatus.currentClass,
        freeUntil: freshStatus.freeUntil,
        freeMinutes: freshStatus.freeMinutes,
      });
    }
  };

  // Group rooms into spatial zones (West Wing, Center, East Wing) for architectural floor plate
  const spatialZones = useMemo(() => {
    const west = [];
    const center = [];
    const east = [];

    floorRooms.forEach((r, idx) => {
      if (idx % 3 === 0) west.push(r);
      else if (idx % 3 === 1) center.push(r);
      else east.push(r);
    });

    return { west, center, east };
  }, [floorRooms]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      width: '100%',
    }}>
      {/* ═══ MAP CONTROLS BAR ═══ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '12px 18px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}>
        {/* Floor Navigation Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', marginRight: 4 }}>
            FLOOR:
          </span>
          {floorsList.map(f => {
            const countFree = roomsWithStatus.filter(r => r.floor === f && r.status === 'FREE').length;
            const isActive = activeFloor === f;

            return (
              <button
                key={f}
                onClick={() => setActiveFloor(f)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(16, 185, 129, 0.15))' : 'var(--bg-surface)',
                  border: `1px solid ${isActive ? 'var(--cyan-light)' : 'var(--border-subtle)'}`,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast)',
                }}
              >
                <span>{f === 0 ? 'G' : `F${f}`}</span>
                {countFree > 0 && (
                  <span style={{
                    fontSize: '0.62rem',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--emerald-bg)',
                    color: 'var(--emerald-light)',
                    fontWeight: 800,
                  }}>
                    {countFree}
                  </span>
                )}
              </button>
            );
          })}

          {/* Labs Option */}
          <button
            onClick={() => setActiveFloor(-1)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: activeFloor === -1 ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-surface)',
              border: `1px solid ${activeFloor === -1 ? 'var(--purple-light)' : 'var(--border-subtle)'}`,
              color: activeFloor === -1 ? 'var(--purple-light)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
            }}
          >
            Labs
          </button>
        </div>

        {/* 3D / 2D Perspective Toggle & Map Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--emerald-light)', fontWeight: 800 }}>{floorStats.free} Free</span> / {floorStats.total} Rooms on {floorName(activeFloor)}
          </div>

          <button
            onClick={() => setIs3DView(!is3DView)}
            className="btn btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: 'var(--text-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              borderColor: is3DView ? 'var(--cyan-light)' : 'var(--border-subtle)',
              color: is3DView ? 'var(--cyan-light)' : 'var(--text-secondary)',
            }}
            title="Toggle 3D Isometric View"
          >
            <Compass size={14} />
            <span>{is3DView ? '3D Isometric' : '2D Plan'}</span>
          </button>
        </div>
      </div>

      {/* ═══ MAP VIEWPORT & SIDEBAR SPLIT ═══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedRoom ? '1fr 380px' : '1fr',
        gap: 20,
        alignItems: 'start',
      }}>
        {/* ═══ 3D / VISUAL FLOOR CANVAS ═══ */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(180deg, #070B16 0%, #03060E 100%)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          minHeight: 520,
          padding: '30px 24px',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 60px rgba(0, 0, 0, 0.8), 0 16px 36px -12px rgba(0,0,0,0.5)',
        }}>
          {/* Subtle Isometric Grid Texture */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.08,
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }} />

          {/* Compass / Orientation Indicator */}
          <div style={{
            position: 'absolute',
            top: 20,
            right: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.68rem',
            color: 'var(--text-faint)',
            textTransform: 'uppercase',
            fontWeight: 800,
            letterSpacing: '0.05em',
            zIndex: 10,
          }}>
            <Compass size={12} color="var(--cyan-light)" />
            <span>IST Campus Wing • {floorName(activeFloor)}</span>
          </div>

          {/* Map Legend */}
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(6, 9, 19, 0.85)',
            border: '1px solid var(--border-subtle)',
            backdropFilter: 'blur(8px)',
            fontSize: '0.68rem',
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--emerald)', boxShadow: '0 0 8px var(--emerald)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Free Now</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--rose)', opacity: 0.6 }} />
              <span style={{ color: 'var(--text-secondary)' }}>Occupied</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--purple)', opacity: 0.5 }} />
              <span style={{ color: 'var(--text-secondary)' }}>No Data</span>
            </div>
            {searchMatchingRoomIds.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Sparkles size={11} color="var(--cyan-light)" />
                <span style={{ color: 'var(--cyan-light)', fontWeight: 700 }}>Search Match</span>
              </div>
            )}
          </div>

          {/* ═══ FLOOR PLATE CONTAINER ═══ */}
          <div style={{
            transform: is3DView
              ? 'perspective(1100px) rotateX(46deg) rotateZ(-22deg) scale(0.92)'
              : 'none',
            transformOrigin: 'center center',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            padding: '40px 10px',
            maxWidth: 820,
            margin: '0 auto',
          }}>
            {/* The Building Floor Slab */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.7) 100%)',
              border: '2px solid rgba(56, 189, 248, 0.2)',
              borderRadius: 24,
              padding: '24px 20px',
              boxShadow: is3DView
                ? '0 30px 60px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(6, 182, 212, 0.1)'
                : '0 8px 30px rgba(0, 0, 0, 0.5)',
              position: 'relative',
            }}>
              {/* Central Corridor Pathway */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 20,
                right: 20,
                height: 36,
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.02)',
                borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
                borderBottom: '1px dashed rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                pointerEvents: 'none',
              }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', fontWeight: 800 }}>
                  WEST CORRIDOR
                </span>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', fontWeight: 800 }}>
                  EAST CORRIDOR
                </span>
              </div>

              {/* Floor Rooms Grid */}
              {floorRooms.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 14,
                  position: 'relative',
                  zIndex: 2,
                }}>
                  {floorRooms.map(room => {
                    const isSelected = selectedRoom?.roomId === room.roomId;
                    const isHovered = hoveredRoom === room.roomId;
                    const isSearchMatch = searchMatchingRoomIds.includes(room.roomId);
                    const isFree = room.status === 'FREE';
                    const isOccupied = room.status === 'OCCUPIED';

                    // 3D Isometric Styling
                    const roomBg = isFree
                      ? (isSelected
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(6, 182, 212, 0.35))'
                          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(6, 182, 212, 0.12))')
                      : isOccupied
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(15, 23, 42, 0.8))'
                      : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(15, 23, 42, 0.8))';

                    const borderColor = isSelected
                      ? 'var(--cyan-light)'
                      : isSearchMatch
                      ? 'var(--amber-light)'
                      : isFree
                      ? 'rgba(16, 185, 129, 0.45)'
                      : isOccupied
                      ? 'rgba(239, 68, 68, 0.3)'
                      : 'rgba(139, 92, 246, 0.25)';

                    const elevation = is3DView
                      ? (isSelected ? 'translateY(-10px)' : isHovered ? 'translateY(-6px)' : 'translateY(0)')
                      : (isSelected ? 'scale(1.03)' : 'scale(1)');

                    return (
                      <button
                        key={room.roomId}
                        onClick={() => handleRoomClick(room)}
                        onMouseEnter={() => setHoveredRoom(room.roomId)}
                        onMouseLeave={() => setHoveredRoom(null)}
                        style={{
                          background: roomBg,
                          border: `2px solid ${borderColor}`,
                          borderRadius: 14,
                          padding: '16px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transform: elevation,
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: isSelected
                            ? '0 0 24px rgba(6, 182, 212, 0.6), 0 8px 16px rgba(0,0,0,0.5)'
                            : isSearchMatch
                            ? '0 0 18px rgba(245, 158, 11, 0.4)'
                            : isFree
                            ? '0 4px 14px rgba(16, 185, 129, 0.2)'
                            : 'none',
                          position: 'relative',
                          outline: 'none',
                          minHeight: 110,
                        }}
                      >
                        {/* Search Match Halo Badge */}
                        {isSearchMatch && (
                          <div style={{
                            position: 'absolute',
                            top: -8,
                            right: -6,
                            background: 'var(--amber)',
                            color: '#000',
                            borderRadius: 'var(--radius-full)',
                            padding: '1px 6px',
                            fontSize: '0.58rem',
                            fontWeight: 900,
                            letterSpacing: '0.04em',
                            boxShadow: '0 0 10px var(--amber)',
                          }}>
                            MATCH
                          </div>
                        )}

                        {/* Room Icon / Status Dot */}
                        <div style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: isFree ? 'var(--emerald)' : isOccupied ? 'var(--rose)' : 'var(--purple)',
                          boxShadow: isFree ? '0 0 10px var(--emerald)' : 'none',
                          marginBottom: 8,
                        }} />

                        {/* Room ID */}
                        <div style={{
                          fontWeight: 900,
                          fontSize: 'var(--text-sm)',
                          color: isSelected ? 'var(--cyan-light)' : 'var(--text-primary)',
                          fontFamily: 'var(--font-mono)',
                          textAlign: 'center',
                          wordBreak: 'break-word',
                          lineHeight: 1.2,
                        }}>
                          {room.roomId}
                        </div>

                        {/* Status Label */}
                        <div style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: isFree ? 'var(--emerald-light)' : isOccupied ? 'var(--rose-light)' : 'var(--text-faint)',
                          marginTop: 6,
                          letterSpacing: '0.04em',
                        }}>
                          {isFree ? 'FREE' : isOccupied ? 'BUSY' : 'NO DATA'}
                        </div>

                        {/* Time Available / Current Class */}
                        <div style={{
                          fontSize: '0.62rem',
                          color: 'var(--text-muted)',
                          marginTop: 4,
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}>
                          {isFree && room.freeUntil && `Until ${displayTime(room.freeUntil)}`}
                          {isOccupied && (room.currentClass?.startTime ? `Until ${displayTime(room.currentClass.endTime)}` : 'In Use')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No classroom units cataloged for {floorName(activeFloor)} in the loaded timetable batches.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ SELECTED ROOM SIDEBAR & LIVE COUNTDOWN ═══ */}
        {selectedRoom && (
          <div className="glass-card animate-fade-in-right" style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            background: 'var(--bg-elevated)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            boxShadow: 'var(--shadow-elevated)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DoorOpen size={20} color="var(--cyan-light)" />
                  <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                    {selectedRoom.roomName || selectedRoom.roomId}
                  </span>
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>
                  <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  {floorName(selectedRoom.floor)}
                </div>
              </div>

              <button
                onClick={() => onSelectRoom(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                }}
                title="Deselect room"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Status Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: selectedRoom.status === 'FREE' ? 'var(--emerald-bg)' : 'var(--rose-bg)',
              border: `1px solid ${selectedRoom.status === 'FREE' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: selectedRoom.status === 'FREE' ? 'var(--emerald)' : 'var(--rose)',
                  boxShadow: selectedRoom.status === 'FREE' ? '0 0 10px var(--emerald)' : 'none',
                }} />
                <span style={{
                  fontWeight: 800,
                  fontSize: 'var(--text-xs)',
                  color: selectedRoom.status === 'FREE' ? 'var(--emerald-light)' : 'var(--rose-light)',
                  textTransform: 'uppercase',
                }}>
                  {selectedRoom.status === 'FREE' ? 'Currently Free' : 'Currently Occupied'}
                </span>
              </div>

              {selectedRoom.freeUntil && selectedRoom.status === 'FREE' && (
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Until {displayTime(selectedRoom.freeUntil)}
                </span>
              )}
            </div>

            {/* LIVE COUNTDOWN TIMER (When room is free) */}
            {selectedRoom.status === 'FREE' ? (
              <div>
                <RoomCountdownTimer
                  room={selectedRoom}
                  freeUntilTime={selectedRoom.freeUntil}
                  nextClass={selectedRoom.nextClass}
                  day={day}
                  onExpire={handleCountdownZero}
                />

                {/* CALL THE SQUAD BUTTON */}
                <SquadShareButton
                  room={selectedRoom}
                  floorName={floorName(selectedRoom.floor)}
                  freeUntil={displayTime(selectedRoom.freeUntil) || '16:50'}
                  freeMinutes={selectedRoom.freeMinutes || 60}
                  nextClass={selectedRoom.nextClass}
                  day={day}
                />
              </div>
            ) : (
              /* Occupied Room Class Info */
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-inset)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                  Active Ongoing Lecture
                </div>
                {selectedRoom.currentClass ? (
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                      {selectedRoom.currentClass.subjectName}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
                      {selectedRoom.currentClass.classSection}
                      {selectedRoom.currentClass.faculty ? ` • ${selectedRoom.currentClass.faculty}` : ''}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--rose-light)', fontWeight: 700, marginTop: 8 }}>
                      Occupied until {displayTime(selectedRoom.currentClass.endTime)}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Room is marked occupied per timetable schedule.
                  </div>
                )}
              </div>
            )}

            {/* Toggle Full Day Schedule */}
            <button
              onClick={() => setShowFullSchedule(!showFullSchedule)}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 'var(--text-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Calendar size={14} />
              <span>{showFullSchedule ? 'Hide Full Day Timetable' : 'View Full Day Timetable'}</span>
            </button>

            {/* Full Day Timetable Accordion */}
            {showFullSchedule && (
              <div className="animate-slide-down" style={{
                maxHeight: 220,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                paddingRight: 4,
              }}>
                {selectedRoom.daySchedule && selectedRoom.daySchedule.length > 0 ? (
                  selectedRoom.daySchedule.map((entry, idx) => (
                    <div key={idx} style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-faint)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 'var(--text-xs)',
                    }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{entry.subjectName}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{entry.classSection}</div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-light)', fontWeight: 700 }}>
                        {displayTime(entry.startTime)} – {displayTime(entry.endTime)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center', padding: 12 }}>
                    No other scheduled entries for {day}.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

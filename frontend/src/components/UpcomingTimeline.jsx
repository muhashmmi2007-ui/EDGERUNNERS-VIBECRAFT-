import React, { useState } from 'react';
import { CalendarDays, Clock, MapPin, Check, X, Filter } from 'lucide-react';
import { formatDisplayDate } from '../services/calendarEngine';

export default function UpcomingTimeline({
  occurrences,
  section,
  plannedSkipsSet,
  onToggleSkipDate,
}) {
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const filtered = occurrences.filter((occ) => {
    if (filterSubject !== 'ALL' && occ.subjectCode !== filterSubject) return false;
    if (filterType === 'LAB' && !occ.isLab) return false;
    if (filterType === 'THEORY' && occ.isLab) return false;
    return true;
  });

  // Group by date
  const groupedByDate = {};
  filtered.forEach((occ) => {
    if (!groupedByDate[occ.dateStr]) {
      groupedByDate[occ.dateStr] = [];
    }
    groupedByDate[occ.dateStr].push(occ);
  });

  const dates = Object.keys(groupedByDate).sort();

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--purple-bg)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--purple-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CalendarDays size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Upcoming Scheduled Class Timeline
              </h2>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                CALENDAR FEED
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Calendar feed of scheduled timetable sessions. Toggle individual classes to simulate targeted absences.
            </p>
          </div>
        </div>

        {/* Filters and Planned Skips Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {plannedSkipsSet.size > 0 && (
            <span className="badge badge-rose font-mono" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
              {plannedSkipsSet.size} Skip{plannedSkipsSet.size === 1 ? '' : 's'} Selected
            </span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.75rem', padding: '5px 10px', borderRadius: 'var(--radius-full)' }}
            >
              <option value="ALL">All Subjects ({section.subjects.length})</option>
              {section.subjects.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.slot}: {sub.name.slice(0, 24)}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
            style={{ fontSize: '0.75rem', padding: '5px 10px', borderRadius: 'var(--radius-full)' }}
          >
            <option value="ALL">All Types</option>
            <option value="THEORY">Theory Only</option>
            <option value="LAB">Labs Only</option>
          </select>
        </div>
      </div>

      {dates.length === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-inset)', borderRadius: 'var(--radius-md)' }}>
          No upcoming scheduled classes found for this criteria in the semester date range.
        </div>
      ) : (
        <div style={{
          maxHeight: '480px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          paddingRight: '6px'
        }}>
          {dates.slice(0, 30).map((dStr) => {
            const dayClasses = groupedByDate[dStr];
            const dateFormatted = formatDisplayDate(dStr);

            return (
              <div key={dStr} style={{
                background: 'var(--bg-inset)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  borderBottom: '1px solid var(--border-faint)',
                  paddingBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--cyan-light)', fontSize: '0.85rem' }}>
                      {dateFormatted}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      • {dayClasses[0]?.dayOfWeek}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {dayClasses.length} session{dayClasses.length === 1 ? '' : 's'} scheduled
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '10px' }}>
                  {dayClasses.map((item) => {
                    const isSkipped = plannedSkipsSet.has(item.id);

                    return (
                      <div
                        key={item.id}
                        style={{
                          background: isSkipped ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface)',
                          border: isSkipped ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all var(--duration-fast) ease'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                              Slot {item.slot}
                            </span>
                            {item.isLab && (
                              <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                                LAB ({item.units} unit)
                              </span>
                            )}
                            <span style={{
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              color: isSkipped ? 'var(--rose-light)' : 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              textDecoration: isSkipped ? 'line-through' : 'none'
                            }}>
                              {item.subjectName}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={11} /> {item.periodLabel}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <MapPin size={11} /> {item.room}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleSkipDate(item.id)}
                          className={isSkipped ? 'btn btn-danger' : 'btn btn-secondary'}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-full)',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title={isSkipped ? 'Click to mark as attending' : 'Click to plan skipping this session'}
                        >
                          {isSkipped ? (
                            <>
                              <X size={12} />
                              <span>Skip</span>
                            </>
                          ) : (
                            <>
                              <Check size={12} color="var(--emerald)" />
                              <span>Attending</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

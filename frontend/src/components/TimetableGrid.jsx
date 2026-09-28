import React from 'react';
import { X, Calendar, Clock } from 'lucide-react';

export default function TimetableGrid({ section, onClose }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Helper to find slot scheduled for a specific day and period
  const getSlotForDayPeriod = (day, pNum) => {
    const dayEntries = section.weeklySchedule?.[day] || [];
    for (const entry of dayEntries) {
      if (entry.periods && entry.periods.includes(pNum)) {
        return entry;
      }
      if (entry.period === pNum) {
        return entry;
      }
    }
    return null;
  };

  return (
    <div className="card animate-slide-down" style={{
      padding: '24px',
      marginBottom: '32px',
      border: '1px solid rgba(6, 182, 212, 0.3)',
      boxShadow: 'var(--shadow-elevated)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--cyan-bg)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--cyan-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Master Weekly Timetable: {section.displayName}
              </h2>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                {section.academicYear}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Venue: {section.venue} • {section.department} • 9 Teaching Periods per Day
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
        >
          <X size={15} />
          <span>Close Grid</span>
        </button>
      </div>

      {/* Responsive Table Container */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.78rem',
          minWidth: 800,
          textAlign: 'center'
        }}>
          <thead>
            <tr style={{ background: 'var(--bg-inset)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)', width: 90 }}>DAY</th>
              <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>P1<br /><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>09:00</span></th>
              <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>P2<br /><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>09:50</span></th>
              <th style={{ padding: '10px 4px', color: 'var(--text-muted)', fontSize: '0.65rem', width: 35 }}>TEA</th>
              <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>P3<br /><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>10:50</span></th>
              <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>P4<br /><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>11:40</span></th>
              <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>P5<br /><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>12:30</span></th>
              <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>P6<br /><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>01:20</span></th>
              <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>P7<br /><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>02:10</span></th>
              <th style={{ padding: '10px 4px', color: 'var(--text-muted)', fontSize: '0.65rem', width: 35 }}>TEA</th>
              <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>P8<br /><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>03:10</span></th>
              <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>P9<br /><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>04:00</span></th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day} style={{ borderBottom: '1px solid var(--border-faint)' }}>
                <td style={{
                  padding: '12px 14px',
                  fontWeight: 800,
                  textAlign: 'left',
                  color: 'var(--cyan-light)',
                  background: 'var(--bg-inset)'
                }}>
                  {day}
                </td>

                {/* P1 */}
                {renderCell(getSlotForDayPeriod(day, 1), section)}
                {/* P2 */}
                {renderCell(getSlotForDayPeriod(day, 2), section)}

                {/* Tea Break 1 */}
                <td style={{ background: 'rgba(0, 0, 0, 0.3)', color: 'var(--text-muted)', fontSize: '0.62rem', verticalAlign: 'middle' }}>
                  RECESS
                </td>

                {/* P3 */}
                {renderCell(getSlotForDayPeriod(day, 3), section)}
                {/* P4 */}
                {renderCell(getSlotForDayPeriod(day, 4), section)}
                {/* P5 */}
                {renderCell(getSlotForDayPeriod(day, 5), section)}
                {/* P6 */}
                {renderCell(getSlotForDayPeriod(day, 6), section)}
                {/* P7 */}
                {renderCell(getSlotForDayPeriod(day, 7), section)}

                {/* Tea Break 2 */}
                <td style={{ background: 'rgba(0, 0, 0, 0.3)', color: 'var(--text-muted)', fontSize: '0.62rem', verticalAlign: 'middle' }}>
                  RECESS
                </td>

                {/* P8 */}
                {renderCell(getSlotForDayPeriod(day, 8), section)}
                {/* P9 */}
                {renderCell(getSlotForDayPeriod(day, 9), section)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '14px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <span>• Multi-period labs (2 consecutive periods) are mapped and counted as 1 attendance unit per institutional rule.</span>
        <span>• Project component (B-Proj) mapped to Slot B.</span>
        <span>• CDC Analytical / Verbal slots (G-625, H-TB-106) mapped to slots G & H.</span>
      </div>
    </div>
  );
}

function renderCell(slotEntry, section) {
  if (!slotEntry) {
    return (
      <td style={{ padding: '8px 4px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
        —
      </td>
    );
  }

  const isLab = slotEntry.slot === 'LAB' || slotEntry.label?.toLowerCase().includes('lab');
  const subject = section.subjects.find((s) => s.slot === slotEntry.slot);

  return (
    <td style={{
      padding: '8px 6px',
      background: isLab ? 'rgba(139, 92, 246, 0.08)' : 'rgba(16, 185, 129, 0.06)',
      border: isLab ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid rgba(16, 185, 129, 0.15)',
      borderRadius: 'var(--radius-xs)'
    }}>
      <div style={{ fontWeight: 800, color: isLab ? 'var(--purple-light)' : 'var(--emerald-light)', fontSize: '0.78rem' }}>
        {slotEntry.label || `Slot ${slotEntry.slot}`}
      </div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 90 }}>
        {subject?.name ? subject.name.slice(0, 14) + '..' : slotEntry.room || ''}
      </div>
    </td>
  );
}

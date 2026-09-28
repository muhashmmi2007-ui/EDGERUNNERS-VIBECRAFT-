import React, { useState } from 'react';
import { TrendingUp, Calendar, Filter } from 'lucide-react';

export default function TrajectoryChart({
  section,
  occurrences,
  attendanceRecords,
  planningDate,
  selectedSubjectCode: initialSubjectCode,
}) {
  const [internalSubject, setInternalSubject] = useState(initialSubjectCode || 'ALL');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const activeSubject = internalSubject;
  const isAll = activeSubject === 'ALL';

  // Filter occurrences for selected subject (or overall if 'ALL')
  const relevantOccurrences = isAll
    ? occurrences
    : occurrences.filter((occ) => occ.subjectCode === activeSubject);

  // Initial baseline attendance
  let initA = 0;
  let initH = 0;

  if (isAll) {
    section.subjects.forEach((sub) => {
      const rec = attendanceRecords[sub.code] || { attended: 0, held: 0 };
      initA += rec.attended;
      initH += rec.held;
    });
  } else {
    const rec = attendanceRecords[activeSubject] || { attended: 0, held: 0 };
    initA = rec.attended;
    initH = rec.held;
  }

  // Generate trajectory points for each future date
  const datesMap = new Map();
  relevantOccurrences.forEach((occ) => {
    datesMap.set(occ.dateStr, (datesMap.get(occ.dateStr) || 0) + occ.units);
  });

  const sortedDates = Array.from(datesMap.keys()).sort();

  const points = [];
  let runningAttendedBest = initA;
  let runningHeld = initH;

  // Starting point (Today / Planning Date)
  const initialPct = initH > 0 ? (initA / initH) * 100 : 100;
  points.push({
    dateStr: planningDate,
    label: 'Start (' + planningDate.slice(5) + ')',
    held: runningHeld,
    attended: runningAttendedBest,
    pct: initialPct,
  });

  sortedDates.forEach((dStr) => {
    const classCount = datesMap.get(dStr);
    runningHeld += classCount;
    runningAttendedBest += classCount; // In best-case trajectory

    const currentPct = (runningAttendedBest / runningHeld) * 100;
    points.push({
      dateStr: dStr,
      label: dStr.slice(5),
      held: runningHeld,
      attended: runningAttendedBest,
      pct: currentPct,
      classesOnDate: classCount,
    });
  });

  // SVG Chart Dimensions
  const width = 800;
  const height = 240;
  const padding = { top: 24, right: 30, bottom: 42, left: 45 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const minY = 50; // 50%
  const maxY = 100; // 100%

  const getY = (pct) => {
    const clamped = Math.max(minY, Math.min(maxY, pct));
    return padding.top + plotHeight - ((clamped - minY) / (maxY - minY)) * plotHeight;
  };

  const getX = (index) => {
    if (points.length <= 1) return padding.left + plotWidth / 2;
    return padding.left + (index / (points.length - 1)) * plotWidth;
  };

  // Generate SVG path string
  let pathD = '';
  points.forEach((pt, idx) => {
    const x = getX(idx);
    const y = getY(pt.pct);
    if (idx === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
    }
  });

  const finalPoint = points[points.length - 1];

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--emerald-bg)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--emerald-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Attendance Trajectory & Projected Arc
              </h2>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                CALENDAR-DRIVEN
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Actual class-by-class cumulative progression to Nov 29, 2026 based on official timetable occurrences.
            </p>
          </div>
        </div>

        {/* Controls & Legend */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Subject Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={activeSubject}
              onChange={(e) => setInternalSubject(e.target.value)}
              className="input-field font-mono"
              style={{ padding: '5px 10px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
            >
              <option value="ALL">All Subjects Combined</option>
              {section.subjects.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.slot}: {s.name.slice(0, 24)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.72rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 14, height: 3, background: 'var(--emerald)', borderRadius: 2 }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Best-Case Arc</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 14, height: 2, borderTop: '2px dashed var(--amber)' }} />
              <span style={{ color: 'var(--amber)', fontWeight: 600 }}>75% Min</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 14, height: 2, borderTop: '2px dashed var(--cyan-light)' }} />
              <span style={{ color: 'var(--cyan-light)', fontWeight: 600 }}>90% Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        overflowX: 'auto',
        background: 'var(--bg-inset)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '12px 6px'
      }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: 600 }}
        >
          {/* Y Axis Grid lines */}
          {[50, 60, 70, 75, 80, 90, 100].map((val) => {
            const y = getY(val);
            const isHighlight75 = val === 75;
            const isHighlight90 = val === 90;

            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={
                    isHighlight75
                      ? 'rgba(245, 158, 11, 0.6)'
                      : isHighlight90
                      ? 'rgba(6, 182, 212, 0.6)'
                      : 'rgba(255, 255, 255, 0.05)'
                  }
                  strokeWidth={isHighlight75 || isHighlight90 ? 1.5 : 1}
                  strokeDasharray={isHighlight75 || isHighlight90 ? '4 4' : 'none'}
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill={isHighlight75 ? '#fbbf24' : isHighlight90 ? '#38bdf8' : '#64748b'}
                  fontSize="10"
                  textAnchor="end"
                  fontWeight={isHighlight75 || isHighlight90 ? '700' : '400'}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gradEmerald" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area under curve */}
          {points.length > 1 && (
            <path
              d={`${pathD} L ${getX(points.length - 1)} ${padding.top + plotHeight} L ${getX(0)} ${padding.top + plotHeight} Z`}
              fill="url(#gradEmerald)"
            />
          )}

          {/* Trajectory Path Line */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Individual Data Points */}
          {points.map((pt, idx) => {
            const x = getX(idx);
            const y = getY(pt.pct);
            const step = Math.max(1, Math.floor(points.length / 8));
            const showLabel = idx === 0 || idx === points.length - 1 || idx % step === 0;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={hoveredPoint?.dateStr === pt.dateStr ? 6 : 3.5}
                  fill="#10b981"
                  stroke="#060913"
                  strokeWidth="2"
                />

                {showLabel && (
                  <text
                    x={x}
                    y={height - padding.bottom + 18}
                    fill="#94a3b8"
                    fontSize="9"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {pt.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div style={{
            position: 'absolute',
            top: 20,
            right: 30,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: '0.8rem',
            boxShadow: 'var(--shadow-card)',
            pointerEvents: 'none',
            zIndex: 20
          }}>
            <div style={{ color: 'var(--cyan-light)', fontWeight: 800 }}>
              {hoveredPoint.dateStr}
            </div>
            <div style={{ color: 'var(--text-primary)', marginTop: 2, fontSize: '0.95rem' }}>
              Projected: <strong className="font-mono" style={{ color: 'var(--emerald-light)' }}>{hoveredPoint.pct.toFixed(1)}%</strong>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 2 }}>
              Cumulative: {hoveredPoint.attended} / {hoveredPoint.held} classes
            </div>
          </div>
        )}
      </div>

      {/* Trajectory Summary Callout */}
      {finalPoint && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '14px',
          padding: '10px 14px',
          background: 'var(--bg-inset)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            If 100% of future classes attended until Nov 29, final attendance caps at:
          </span>
          <span className="font-mono" style={{
            fontSize: '1rem',
            fontWeight: 900,
            color: finalPoint.pct >= 75 ? 'var(--emerald-light)' : 'var(--rose-light)'
          }}>
            {finalPoint.pct.toFixed(1)}% ({finalPoint.attended}/{finalPoint.held} classes)
          </span>
        </div>
      )}
    </div>
  );
}

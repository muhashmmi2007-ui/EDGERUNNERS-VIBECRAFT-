import React, { useState, useMemo } from 'react';
import { CalendarRange, ShieldAlert, CheckCircle, ArrowRight, Award } from 'lucide-react';
import { simulateLeaveImpact } from '../services/leaveEngine';
import { parseLocalDate, formatLocalDate } from '../services/calendarEngine';

export default function LeaveSimulator({
  section,
  planningDate,
  attendanceRecords,
  remainingMap,
}) {
  const [startDateStr, setStartDateStr] = useState(planningDate);
  const [endDateStr, setEndDateStr] = useState(planningDate);
  const [leaveType, setLeaveType] = useState('MEDICAL'); // 'MEDICAL' | 'OD' | 'CASUAL'
  const [isODApproved, setIsODApproved] = useState(false);

  // Quick Presets
  const applyPreset = (presetType) => {
    const base = parseLocalDate(planningDate);
    if (presetType === 'SINGLE_DAY') {
      const d = formatLocalDate(base);
      setStartDateStr(d);
      setEndDateStr(d);
    } else if (presetType === 'THREE_DAYS') {
      const start = formatLocalDate(base);
      base.setDate(base.getDate() + 2);
      const end = formatLocalDate(base);
      setStartDateStr(start);
      setEndDateStr(end);
    } else if (presetType === 'FRIDAY') {
      for (let i = 0; i < 7; i++) {
        if (base.getDay() === 5) {
          const fri = formatLocalDate(base);
          setStartDateStr(fri);
          setEndDateStr(fri);
          break;
        }
        base.setDate(base.getDate() + 1);
      }
    }
  };

  // Run simulation
  const simulation = useMemo(() => {
    return simulateLeaveImpact({
      section,
      startDateStr,
      endDateStr,
      leaveType,
      isODApproved: leaveType === 'OD' && isODApproved,
      attendanceRecords,
      remainingMap,
    });
  }, [section, startDateStr, endDateStr, leaveType, isODApproved, attendanceRecords, remainingMap]);

  const deltaPct = simulation && !simulation.error
    ? simulation.projectedOverallPct - simulation.currentOverallPct
    : 0;

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
      {/* Title & Quick Presets */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--amber-bg)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--amber-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CalendarRange size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Leave & On-Duty (OD) Impact Simulator
              </h2>
              <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                TIMETABLE-AWARE
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Evaluate mathematical attendance loss across scheduled timetable slots for planned leaves or OD exemptions.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => applyPreset('SINGLE_DAY')}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
          >
            Today (1 Day)
          </button>
          <button
            onClick={() => applyPreset('THREE_DAYS')}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
          >
            3-Day Block
          </button>
          <button
            onClick={() => applyPreset('FRIDAY')}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
          >
            This Friday
          </button>
        </div>
      </div>

      {/* Simulator Step 1: Date & Type Selection Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        background: 'var(--bg-inset)',
        padding: '18px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '20px'
      }}>
        {/* Leave Type */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.04em' }}>
            LEAVE CATEGORY:
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="input-field"
            style={{ width: '100%', fontWeight: 600, fontSize: '0.85rem' }}
          >
            <option value="MEDICAL">Medical Leave (Sick / Health)</option>
            <option value="OD">On-Duty (Symposium / Hackathon / Sports)</option>
            <option value="CASUAL">Personal / Casual Absence</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.04em' }}>
            START DATE:
          </label>
          <input
            type="date"
            value={startDateStr}
            min="2026-08-29"
            max="2026-11-29"
            onChange={(e) => setStartDateStr(e.target.value)}
            className="input-field font-mono"
            style={{ width: '100%', fontWeight: 600, fontSize: '0.85rem' }}
          />
        </div>

        {/* End Date */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.04em' }}>
            END DATE (INCLUSIVE):
          </label>
          <input
            type="date"
            value={endDateStr}
            min={startDateStr}
            max="2026-11-29"
            onChange={(e) => setEndDateStr(e.target.value)}
            className="input-field font-mono"
            style={{ width: '100%', fontWeight: 600, fontSize: '0.85rem' }}
          />
        </div>

        {/* OD Credit Waiver Toggle */}
        {leaveType === 'OD' && (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan-light)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={14} /> OD WAIVER STATUS:
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={isODApproved}
                onChange={(e) => setIsODApproved(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--emerald)' }}
              />
              <span>HOD Approved (Attendance Preserved)</span>
            </label>
          </div>
        )}
      </div>

      {/* Simulator Step 2 & 3: Results & Comparison */}
      {simulation && (
        <div>
          {simulation.error ? (
            <div style={{ padding: '16px', background: 'var(--rose-bg)', color: 'var(--rose-light)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {simulation.error}
            </div>
          ) : (
            <>
              {/* Verdict KPI Strip */}
              <div style={{
                background: simulation.unsafeSubjectsCount > 0
                  ? 'rgba(239, 68, 68, 0.08)'
                  : (simulation.isOverall75Safe ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)'),
                border: simulation.unsafeSubjectsCount > 0
                  ? '1px solid rgba(239, 68, 68, 0.35)'
                  : (simulation.isOverall75Safe ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)'),
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {simulation.unsafeSubjectsCount > 0 ? (
                    <div style={{ background: 'var(--rose-bg)', padding: '10px', borderRadius: '50%', color: 'var(--rose)' }}>
                      <ShieldAlert size={28} />
                    </div>
                  ) : (
                    <div style={{ background: 'var(--emerald-bg)', padding: '10px', borderRadius: '50%', color: 'var(--emerald)' }}>
                      <CheckCircle size={28} />
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge badge-${simulation.unsafeSubjectsCount > 0 ? 'rose' : (simulation.isOverall75Safe ? 'emerald' : 'amber')}`}>
                        {simulation.unsafeSubjectsCount > 0 ? 'DETENTION TRIGGERED' : (simulation.isOverall75Safe ? 'SAFE LEAVE' : 'AT RISK')}
                      </span>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {simulation.verdict}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Selected: <strong style={{ color: 'var(--text-primary)' }}>{startDateStr}</strong> to <strong style={{ color: 'var(--text-primary)' }}>{endDateStr}</strong> • Affects <strong style={{ color: 'var(--amber-light)' }}>{simulation.totalAffectedUnits} scheduled classes</strong> across <strong style={{ color: 'var(--cyan-light)' }}>{simulation.affectedSubjectsCount} subjects</strong>.
                    </div>
                  </div>
                </div>

                {/* Before / After Delta Display */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  background: 'var(--bg-inset)',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>CURRENT</div>
                    <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {simulation.currentOverallPct.toFixed(1)}%
                    </div>
                  </div>

                  <ArrowRight size={18} color="var(--text-muted)" />

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>AFTER LEAVE</div>
                    <div className="font-mono" style={{
                      fontSize: '1.35rem',
                      fontWeight: 900,
                      color: simulation.isOverall75Safe ? 'var(--emerald-light)' : 'var(--rose-light)'
                    }}>
                      {simulation.projectedOverallPct.toFixed(1)}%
                    </div>
                  </div>

                  <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>DELTA</div>
                    <div className="font-mono" style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: deltaPct < 0 ? 'var(--rose-light)' : 'var(--emerald-light)'
                    }}>
                      {deltaPct >= 0 ? `+${deltaPct.toFixed(1)}%` : `${deltaPct.toFixed(1)}%`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div style={{ overflowX: 'auto', marginBottom: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: 650 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-inset)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>SUBJECT</th>
                      <th style={{ padding: '10px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>MISSED UNITS</th>
                      <th style={{ padding: '10px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>BEFORE %</th>
                      <th style={{ padding: '10px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>PROJECTED %</th>
                      <th style={{ padding: '10px 10px', color: 'var(--text-secondary)', textAlign: 'center' }}>SAFE SKIPS LEFT</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', textAlign: 'right' }}>75% STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(simulation.subjectImpacts).map((sub) => {
                      const hasMisses = sub.classesMissed > 0;
                      return (
                        <tr
                          key={sub.code}
                          style={{
                            borderBottom: '1px solid var(--border-faint)',
                            background: hasMisses ? 'rgba(245, 158, 11, 0.04)' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sub.name}</div>
                            <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Slot {sub.slot} • {sub.code}</div>
                          </td>

                          <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                            {hasMisses ? (
                              <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                                -{sub.classesMissed} classes
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>0</span>
                            )}
                          </td>

                          <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {sub.currentPct !== null ? `${sub.currentPct.toFixed(1)}%` : 'N/A'}
                          </td>

                          <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 800, color: sub.is75Achievable ? 'var(--emerald-light)' : 'var(--rose-light)' }}>
                            {sub.projectedPct.toFixed(1)}%
                          </td>

                          <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center' }}>
                            <span style={{ color: sub.projectedSafeSkips <= 1 ? 'var(--amber-light)' : 'var(--emerald-light)', fontWeight: 700 }}>
                              {sub.is75Achievable ? `${sub.projectedSafeSkips} skips` : '0 (Lost)'}
                            </span>
                          </td>

                          <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                            <span className={`badge badge-${sub.is75Achievable ? 'emerald' : 'rose'}`} style={{ fontSize: '0.65rem' }}>
                              {sub.is75Achievable ? '75% Pass' : 'Detention Risk'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Specific Classes Affected on Timetable Feed */}
              {simulation.affectedClasses.length > 0 && (
                <div style={{
                  background: 'var(--bg-inset)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '0.04em' }}>
                    SPECIFIC SCHEDULED CLASSES AFFECTED ON TIMETABLE:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {simulation.affectedClasses.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '6px 12px',
                          fontSize: '0.72rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{ color: 'var(--cyan-light)', fontWeight: 700 }}>{item.displayDate}</span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.subjectName.slice(0, 18)}</span>
                        <span style={{ color: 'var(--text-muted)' }}>({item.periodLabel})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

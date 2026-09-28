import React from 'react';
import { HelpCircle, Play } from 'lucide-react';

export default function SubjectDashboard({
  subjects,
  attendanceRecords,
  remainingMap,
  evaluations,
  onAttendanceChange,
  onExplainSubject,
  onSelectForSimulation,
}) {
  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
              SUBJECT MATRIX
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Analytical Breakdown & Interactive Attendance Log
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Subject Attendance Intelligence
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Enter attended and held classes to project recovery paths and calculate maximum safe skips per course.
          </p>
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          background: 'var(--bg-inset)',
          padding: '5px 12px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          fontWeight: 600
        }}>
          {subjects.length} Subjects Evaluated
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '18px'
      }}>
        {subjects.map((sub) => {
          const record = attendanceRecords[sub.code] || { attended: 0, held: 0 };
          const remaining = remainingMap[sub.code] || 0;
          const evaluation = evaluations[sub.code] || {};
          const currentPct = evaluation.currentPct;
          const currentPctStr = currentPct !== null ? `${currentPct.toFixed(1)}%` : 'N/A';
          const maxAchievablePct = evaluation.maxAchievablePct;
          const maxPctStr = maxAchievablePct !== null ? `${maxAchievablePct.toFixed(1)}%` : 'N/A';

          const target75 = evaluation.target75 || { safeSkips: 0, isPossible: false, minRequired: 0 };
          const target90 = evaluation.target90 || { safeSkips: 0, isPossible: false, minRequired: 0 };

          const isIrreversible = evaluation.status === 'IRREVERSIBLE';
          const isCaution = evaluation.status === 'CAUTION';
          const isRecovery = evaluation.status === 'RECOVERY_REQUIRED';
          const isSafe = !isIrreversible && !isCaution && !isRecovery;

          // Color accents
          const statusBadgeClass = isIrreversible
            ? 'badge-rose'
            : isRecovery
            ? 'badge-amber'
            : isCaution
            ? 'badge-amber'
            : 'badge-emerald';

          const cardBorderColor = isIrreversible
            ? 'rgba(239, 68, 68, 0.4)'
            : isRecovery
            ? 'rgba(245, 158, 11, 0.35)'
            : isCaution
            ? 'rgba(245, 158, 11, 0.25)'
            : 'var(--border-subtle)';

          const leftAccentBorder = isIrreversible
            ? '3px solid var(--rose)'
            : isRecovery
            ? '3px solid var(--amber)'
            : isCaution
            ? '3px solid var(--amber-light)'
            : '3px solid var(--emerald)';

          return (
            <div
              key={sub.code}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: cardBorderColor,
                borderLeft: leftAccentBorder,
                position: 'relative',
                gap: '16px'
              }}
            >
              {/* Header: Slot Badge, Code & Status */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                      Slot {sub.slot}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {sub.code}
                    </span>
                    {sub.credits && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        ({sub.credits} credits)
                      </span>
                    )}
                  </div>
                  <span className={`badge ${statusBadgeClass}`} style={{ fontSize: '0.68rem' }}>
                    {evaluation.statusLabel || 'ACTIVE'}
                  </span>
                </div>

                {/* Subject Title & Faculty */}
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.35,
                  marginBottom: '4px',
                  letterSpacing: '-0.01em'
                }}>
                  {sub.name}
                </h3>
                {sub.faculty && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    {sub.faculty} {sub.dept ? `• ${sub.dept}` : ''}
                  </p>
                )}

                {/* Interactive Attendance Input Panel */}
                <div style={{
                  background: 'var(--bg-inset)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Attended:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={record.held}
                        value={record.attended}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          onAttendanceChange(sub.code, Math.max(0, Math.min(val, record.held)), record.held);
                        }}
                        className="input-field font-mono"
                        style={{ width: '60px', padding: '4px 6px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}
                      />
                    </div>

                    <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>/</span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Held:
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={record.held}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          const safeVal = Math.max(0, val);
                          const safeAttended = Math.min(record.attended, safeVal);
                          onAttendanceChange(sub.code, safeAttended, safeVal);
                        }}
                        className="input-field font-mono"
                        style={{ width: '60px', padding: '4px 6px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                        CURRENT
                      </div>
                      <div className="font-mono" style={{
                        fontSize: '1.15rem',
                        fontWeight: 900,
                        color: currentPct !== null && currentPct >= 75 ? 'var(--emerald-light)' : 'var(--rose-light)',
                        lineHeight: 1.1
                      }}>
                        {currentPctStr}
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar with Threshold Markers */}
                  <div style={{ marginTop: '10px' }}>
                    <div style={{
                      position: 'relative',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'visible'
                    }}>
                      {/* Current Progress */}
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${Math.min(100, Math.max(0, currentPct || 0))}%`,
                        background: currentPct >= 90
                          ? 'var(--emerald)'
                          : currentPct >= 75
                          ? 'var(--cyan)'
                          : 'var(--rose)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width var(--duration-normal) var(--ease-out)'
                      }} />

                      {/* 75% Marker Pin */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '75%',
                          top: '-3px',
                          width: '2px',
                          height: '12px',
                          background: 'var(--amber)',
                          borderRadius: '1px',
                          zIndex: 2
                        }}
                        title="75% Mandatory Minimum"
                      />

                      {/* 90% Marker Pin */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '90%',
                          top: '-3px',
                          width: '2px',
                          height: '12px',
                          background: 'var(--cyan-light)',
                          borderRadius: '1px',
                          zIndex: 2
                        }}
                        title="90% Target"
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>0%</span>
                      <span style={{ color: 'var(--amber)' }}>75% min</span>
                      <span style={{ color: 'var(--cyan-light)' }}>90% target</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Analytical Numbers Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ background: 'var(--bg-inset)', padding: '8px 6px', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border-faint)' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>REMAINING (R)</div>
                    <div className="font-mono" style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {remaining}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>classes</div>
                  </div>

                  <div style={{ background: 'var(--bg-inset)', padding: '8px 6px', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border-faint)' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>MAX ACHIEVABLE</div>
                    <div className="font-mono" style={{
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: maxAchievablePct !== null && maxAchievablePct >= 75 ? 'var(--cyan-light)' : 'var(--rose)'
                    }}>
                      {maxPctStr}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>if 100% attended</div>
                  </div>

                  <div style={{ background: 'var(--bg-inset)', padding: '8px 6px', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border-faint)' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>TERM TOTAL</div>
                    <div className="font-mono" style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                      {record.held + remaining}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>units total</div>
                  </div>
                </div>

                {/* Target Feasibility Badges (75% & 90%) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  {/* 75% Box */}
                  <div style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    background: target75.isPossible ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.08)',
                    border: target75.isPossible ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: target75.isPossible ? 'var(--emerald-light)' : 'var(--rose)' }}>
                        75% MINIMUM
                      </span>
                    </div>
                    {target75.isPossible ? (
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                          Safe Skips: <strong className="font-mono" style={{ color: 'var(--emerald-light)', fontSize: '0.95rem' }}>{target75.safeSkips}</strong>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Need {target75.minRequired} of {remaining} classes
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: 'var(--rose-light)', fontWeight: 600, marginTop: '2px' }}>
                        Mathematically Impossible
                      </div>
                    )}
                  </div>

                  {/* 90% Box */}
                  <div style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    background: target90.isPossible ? 'rgba(6, 182, 212, 0.05)' : 'rgba(100, 116, 139, 0.08)',
                    border: target90.isPossible ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid rgba(100, 116, 139, 0.2)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: target90.isPossible ? 'var(--cyan-light)' : 'var(--text-muted)' }}>
                        90% TARGET
                      </span>
                    </div>
                    {target90.isPossible ? (
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                          Safe Skips: <strong className="font-mono" style={{ color: 'var(--cyan-light)', fontSize: '0.95rem' }}>{target90.safeSkips}</strong>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Need {target90.minRequired} of {remaining} classes
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                        Target Not Achievable
                      </div>
                    )}
                  </div>
                </div>

                {/* Explanation text */}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.45 }}>
                  {evaluation.statusDesc}
                </p>
              </div>

              {/* Action Buttons: Explain Math & Simulate Skips */}
              <div style={{
                display: 'flex',
                gap: '8px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <button
                  onClick={() => onExplainSubject(sub.code)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '7px 10px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
                >
                  <HelpCircle size={14} color="var(--cyan-light)" />
                  <span>Explain Math</span>
                </button>
                <button
                  onClick={() => onSelectForSimulation(sub.code)}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '7px 10px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
                >
                  <Play size={13} />
                  <span>Simulate Skips</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { BarChart3, CheckCircle2 } from 'lucide-react';

export default function AdvancedCharts({
  subjects,
  attendanceRecords,
  remainingMap,
  evaluations,
  overallEval,
}) {
  const [activeTab, setActiveTab] = useState('TARGETS'); // 'TARGETS' | 'BUFFERS' | 'RECOVERY' | 'DISTRIBUTION'

  // Sub-metrics
  const below75Subjects = subjects.filter((s) => {
    const ev = evaluations[s.code] || {};
    return ev.currentPct !== null && ev.currentPct < 75;
  });

  const totalRemainingClasses = Object.values(remainingMap).reduce((a, b) => a + b, 0);

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
      {/* Title & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
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
            <BarChart3 size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Advanced Attendance Analytics
              </h2>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                PHASE 2 ENGINE
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Deterministic visual breakdowns of targets, skip buffers, recovery feasibility, and schedule distribution.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'var(--bg-inset)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'TARGETS', label: 'Attendance vs Targets' },
            { id: 'BUFFERS', label: 'Safe Skips Buffers' },
            { id: 'RECOVERY', label: `Recovery Feasibility (${below75Subjects.length})` },
            { id: 'DISTRIBUTION', label: 'Schedule Share' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="btn"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  transition: 'all var(--duration-fast) ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: Attendance vs Target (Overall & Per-Subject) */}
      {activeTab === 'TARGETS' && (
        <div>
          {/* Overall Comparison Bar */}
          <div style={{
            background: 'var(--bg-inset)',
            padding: '18px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.85rem', letterSpacing: '0.04em' }}>
                OVERALL ATTENDANCE BENCHMARK COMPARISON
              </span>
              <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem' }}>
                <span>
                  Current: <strong className="font-mono" style={{ color: overallEval.currentPct >= 75 ? 'var(--emerald-light)' : 'var(--rose-light)' }}>{overallEval.currentPct?.toFixed(1)}%</strong>
                </span>
                <span>
                  Max Achievable: <strong className="font-mono" style={{ color: 'var(--cyan-light)' }}>{overallEval.maxAchievablePct?.toFixed(1)}%</strong>
                </span>
              </div>
            </div>

            <div style={{ position: 'relative', height: '28px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {/* Max Achievable Range */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${Math.min(100, overallEval.maxAchievablePct || 0)}%`,
                background: 'rgba(6, 182, 212, 0.15)',
                borderRight: '2px solid var(--cyan-light)'
              }} />

              {/* Current Attendance */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${Math.min(100, overallEval.currentPct || 0)}%`,
                background: overallEval.currentPct >= 75
                  ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                  : 'linear-gradient(90deg, #ef4444 0%, #f59e0b 100%)',
                borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                transition: 'width var(--duration-normal) ease'
              }} />

              {/* 75% Line Marker */}
              <div style={{
                position: 'absolute',
                left: '75%',
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'var(--amber)',
                zIndex: 10
              }} />

              {/* 90% Line Marker */}
              <div style={{
                position: 'absolute',
                left: '90%',
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'var(--cyan-light)',
                zIndex: 10
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>0%</span>
              <span style={{ color: 'var(--amber)', fontWeight: 600 }}>▲ 75% Mandatory Minimum</span>
              <span style={{ color: 'var(--cyan-light)', fontWeight: 600 }}>▲ 90% Target</span>
              <span>100%</span>
            </div>
          </div>

          {/* Subject-Wise Comparative Horizontal Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {subjects.map((sub) => {
              const ev = evaluations[sub.code] || {};
              const rec = attendanceRecords[sub.code] || { attended: 0, held: 0 };
              const currentPct = ev.currentPct !== null ? ev.currentPct : 0;
              const maxPct = ev.maxAchievablePct !== null ? ev.maxAchievablePct : 0;
              const isPassing = currentPct >= 75;

              return (
                <div key={sub.code} style={{
                  background: 'var(--bg-inset)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'border-color var(--duration-fast) ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Slot {sub.slot}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{sub.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Attended: <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{rec.attended}/{rec.held}</strong>
                      </span>
                      <span className="font-mono" style={{ color: isPassing ? 'var(--emerald-light)' : 'var(--rose-light)', fontWeight: 800 }}>
                        {currentPct.toFixed(1)}%
                      </span>
                      <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                        (Max: {maxPct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  <div style={{ position: 'relative', height: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    {/* Max Possible Range */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${Math.min(100, maxPct)}%`,
                      background: 'rgba(6, 182, 212, 0.2)'
                    }} />

                    {/* Current Bar */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${Math.min(100, currentPct)}%`,
                      background: isPassing ? 'var(--emerald)' : 'var(--rose)',
                      borderRadius: 'var(--radius-full)'
                    }} />

                    {/* 75% Marker */}
                    <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: '2px', background: 'var(--amber)', zIndex: 5 }} />
                    {/* 90% Marker */}
                    <div style={{ position: 'absolute', left: '90%', top: 0, bottom: 0, width: '2px', background: 'var(--cyan-light)', zIndex: 5 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Safe Skips Buffers ("You can miss X more classes") */}
      {activeTab === 'BUFFERS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {subjects.map((sub) => {
            const ev = evaluations[sub.code] || {};
            const rem = remainingMap[sub.code] || 0;
            const target75 = ev.target75 || { safeSkips: 0, isPossible: false };
            const target90 = ev.target90 || { safeSkips: 0, isPossible: false };

            return (
              <div
                key={sub.code}
                style={{
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Slot {sub.slot}</span>
                      <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                        {sub.name}
                      </h3>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {rem} classes left
                    </span>
                  </div>

                  <div style={{
                    background: target75.isPossible ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.08)',
                    border: target75.isPossible ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    marginBottom: '10px'
                  }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
                      75% MINIMUM SAFE SKIP BUFFER:
                    </div>
                    <div className="font-mono" style={{
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      color: target75.isPossible ? 'var(--emerald-light)' : 'var(--rose-light)',
                      marginTop: '4px'
                    }}>
                      {target75.isPossible ? `You can miss ${target75.safeSkips} class${target75.safeSkips === 1 ? '' : 'es'}` : '0 Safe Skips (Detention Risk)'}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: target90.isPossible ? 'rgba(6, 182, 212, 0.06)' : 'rgba(100, 116, 139, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                  color: target90.isPossible ? 'var(--cyan-light)' : 'var(--text-muted)'
                }}>
                  90% Target: {target90.isPossible ? `${target90.safeSkips} safe skips remaining` : 'Target mathematically lost'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Recovery & Risk Analysis (Below 75% Subjects) */}
      {activeTab === 'RECOVERY' && (
        <div>
          {below75Subjects.length === 0 ? (
            <div style={{
              padding: '36px 20px',
              textAlign: 'center',
              background: 'rgba(16, 185, 129, 0.05)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <CheckCircle2 size={36} color="var(--emerald)" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--emerald-light)' }}>
                All Subjects Above Mandatory 75% Threshold
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                No subjects currently require emergency attendance recovery. You are in good academic standing.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {below75Subjects.map((sub) => {
                const ev = evaluations[sub.code] || {};
                const rem = remainingMap[sub.code] || 0;
                const isIrreversible = ev.status === 'IRREVERSIBLE';

                return (
                  <div
                    key={sub.code}
                    style={{
                      background: isIrreversible ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.06)',
                      border: isIrreversible ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '18px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge badge-${isIrreversible ? 'rose' : 'amber'}`}>
                            {isIrreversible ? 'IRREVERSIBLE DETENTION' : 'RECOVERY POSSIBLE'}
                          </span>
                          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub.code}</span>
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                          {sub.name}
                        </h3>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CURRENT</div>
                        <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--rose-light)' }}>
                          {ev.currentPct?.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '10px',
                      background: 'var(--bg-inset)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>REMAINING CAPACITY</div>
                        <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {rem} classes
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>MAX POSSIBLE CAP</div>
                        <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: isIrreversible ? 'var(--rose)' : 'var(--cyan-light)' }}>
                          {ev.maxAchievablePct?.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>RECOVERY CRITERION</div>
                        <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: isIrreversible ? 'var(--rose)' : 'var(--emerald-light)' }}>
                          {isIrreversible ? 'Mathematically Impossible' : `Attend ${ev.target75?.minRequired} of next ${rem}`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Remaining Distribution */}
      {activeTab === 'DISTRIBUTION' && (
        <div>
          <div style={{ marginBottom: '14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Total scheduled upcoming classes across all subjects until end of term (Nov 29, 2026): <strong style={{ color: 'var(--cyan-light)' }}>{totalRemainingClasses} classes</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
            {subjects.map((sub) => {
              const rem = remainingMap[sub.code] || 0;
              const pctOfRemaining = totalRemainingClasses > 0 ? (rem / totalRemainingClasses) * 100 : 0;

              return (
                <div key={sub.code} style={{
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sub.slot}: {sub.name}</span>
                    <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--purple-light)', fontWeight: 700 }}>{rem}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${pctOfRemaining}%`, height: '100%', background: 'var(--purple)', borderRadius: 'var(--radius-full)' }} />
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
                    {pctOfRemaining.toFixed(1)}% of total term load
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

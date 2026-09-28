import React, { useState } from 'react';
import { Sliders, RotateCcw, ShieldCheck, ShieldAlert, AlertOctagon, Star, Minus, Plus } from 'lucide-react';
import { calculateProjectedAttendance, MANDATORY_THRESHOLD, ASPIRATIONAL_TARGET } from '../services/attendanceMath';

export default function WhatIfSimulator({
  subjects,
  selectedSubjectCode,
  onSubjectChange,
  attendanceRecords,
  remainingMap,
  evaluations,
}) {
  const currentSubject = subjects.find((s) => s.code === selectedSubjectCode) || subjects[0];
  const record = attendanceRecords[currentSubject.code] || { attended: 0, held: 0 };
  const remaining = remainingMap[currentSubject.code] || 0;
  const evaluation = evaluations[currentSubject.code] || {};

  const [plannedMisses, setPlannedMisses] = useState(0);

  const effectiveMisses = Math.min(plannedMisses, remaining);
  const futureAttended = Math.max(0, remaining - effectiveMisses);

  const simulatedRatio = calculateProjectedAttendance(record.attended, record.held, remaining, futureAttended);
  const simulatedPct = simulatedRatio !== null ? simulatedRatio * 100 : 0;

  const bestCaseRatio = calculateProjectedAttendance(record.attended, record.held, remaining, remaining);
  const bestCasePct = bestCaseRatio !== null ? bestCaseRatio * 100 : 0;

  const worstCaseRatio = calculateProjectedAttendance(record.attended, record.held, remaining, 0);
  const worstCasePct = worstCaseRatio !== null ? worstCaseRatio * 100 : 0;

  const safeSkips75 = evaluation.target75?.isPossible ? evaluation.target75.safeSkips : 0;
  const safeSkips90 = evaluation.target90?.isPossible ? evaluation.target90.safeSkips : 0;

  const skipsRemainingBefore75 = Math.max(0, safeSkips75 - effectiveMisses);
  const skipsRemainingBefore90 = Math.max(0, safeSkips90 - effectiveMisses);

  const isSimulatedSafe75 = simulatedRatio !== null && simulatedRatio >= MANDATORY_THRESHOLD;
  const isSimulatedSafe90 = simulatedRatio !== null && simulatedRatio >= ASPIRATIONAL_TARGET;

  const isDanger = effectiveMisses > safeSkips75;

  // Status determination
  let statusLabel, StatusIcon, statusBadgeColor;
  if (isSimulatedSafe90) {
    statusLabel = 'MEETS 90%';
    StatusIcon = Star;
    statusBadgeColor = 'cyan';
  } else if (isSimulatedSafe75) {
    statusLabel = 'MEETS 75%';
    StatusIcon = ShieldCheck;
    statusBadgeColor = 'emerald';
  } else {
    statusLabel = 'DETENTION RISK';
    StatusIcon = AlertOctagon;
    statusBadgeColor = 'rose';
  }

  return (
    <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div className="section-icon" style={{ background: 'rgba(6, 182, 212, 0.12)', color: 'var(--cyan-light)' }}>
            <Sliders size={20} />
          </div>
          <div>
            <h2 className="section-title">What-If Simulator</h2>
            <p className="section-subtitle">How many classes can you afford to miss?</p>
          </div>
        </div>

        <select
          value={currentSubject.code}
          onChange={(e) => {
            onSubjectChange(e.target.value);
            setPlannedMisses(0);
          }}
          className="input-field"
          style={{ fontWeight: 600, fontSize: '0.78rem', padding: '6px 12px', cursor: 'pointer', maxWidth: 280 }}
        >
          {subjects.map((sub) => (
            <option key={sub.code} value={sub.code}>
              {sub.slot}: {sub.name.length > 30 ? sub.name.slice(0, 30) + '…' : sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Simulator Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
        gap: 16,
        alignItems: 'stretch',
      }}>
        {/* Left: Slider Control */}
        <div style={{
          background: 'var(--bg-inset)',
          padding: 20,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-faint)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Classes to miss
            </span>
            <div className="metric-value" style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: isDanger ? '#ef4444' : '#38bdf8',
              lineHeight: 1,
              transition: 'color 0.2s',
            }}>
              {effectiveMisses}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>
                / {remaining}
              </span>
            </div>
          </div>

          {/* Range Slider */}
          <input
            type="range"
            min="0"
            max={Math.max(1, remaining)}
            value={effectiveMisses}
            onChange={(e) => setPlannedMisses(parseInt(e.target.value, 10))}
            className={isDanger ? 'slider-danger' : ''}
            disabled={remaining === 0}
            style={{ marginBottom: 14 }}
          />

          {/* Tick marks labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-faint)', marginBottom: 16 }}>
            <span>0 (attend all)</span>
            {safeSkips75 > 0 && safeSkips75 < remaining && (
              <span style={{ color: '#34d399' }}>← {safeSkips75} safe</span>
            )}
            <span>{remaining} (miss all)</span>
          </div>

          {/* Quick action buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
            <button
              onClick={() => setPlannedMisses(0)}
              className="btn btn-secondary"
              style={{ padding: '5px 10px', fontSize: '0.72rem', flex: 1 }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
            <button
              onClick={() => setPlannedMisses(safeSkips75)}
              className="btn btn-secondary"
              style={{
                padding: '5px 10px',
                fontSize: '0.72rem',
                flex: 1,
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#34d399',
              }}
              disabled={!evaluation.target75?.isPossible}
            >
              Max safe ({safeSkips75})
            </button>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setPlannedMisses((p) => Math.max(0, p - 1))}
                className="btn btn-secondary"
                style={{ padding: '5px 8px', fontSize: '0.78rem' }}
              >
                <Minus size={14} />
              </button>
              <button
                onClick={() => setPlannedMisses((p) => Math.min(remaining, p + 1))}
                className="btn btn-secondary"
                style={{ padding: '5px 8px', fontSize: '0.78rem' }}
                disabled={effectiveMisses >= remaining}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Projected Result */}
        <div style={{
          background: isSimulatedSafe75
            ? 'rgba(16, 185, 129, 0.04)'
            : 'rgba(239, 68, 68, 0.05)',
          border: isSimulatedSafe75
            ? '1px solid rgba(16, 185, 129, 0.18)'
            : '1px solid rgba(239, 68, 68, 0.25)',
          padding: 20,
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'background 0.3s, border-color 0.3s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.06em' }}>
              PROJECTED FINAL
            </span>
            <span className={`badge badge-${statusBadgeColor}`} style={{ fontSize: '0.62rem' }}>
              <StatusIcon size={11} />
              {statusLabel}
            </span>
          </div>

          <div className="metric-value" style={{
            fontSize: '3rem',
            fontWeight: 800,
            color: isSimulatedSafe75 ? '#34d399' : '#f87171',
            lineHeight: 1,
            marginBottom: 4,
            transition: 'color 0.2s',
          }}>
            {simulatedPct.toFixed(1)}
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>%</span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            ({record.attended + futureAttended} / {record.held + remaining} total)
          </div>

          {/* Buffer meters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            paddingTop: 14,
            borderTop: '1px solid var(--border-faint)',
            marginTop: 'auto',
          }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontWeight: 600, marginBottom: 2 }}>75% BUFFER</div>
              <div className="metric-value" style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: effectiveMisses <= safeSkips75 ? '#34d399' : '#f87171',
              }}>
                {effectiveMisses <= safeSkips75
                  ? `${skipsRemainingBefore75} skips left`
                  : `Over by ${effectiveMisses - safeSkips75}`}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontWeight: 600, marginBottom: 2 }}>90% BUFFER</div>
              <div className="metric-value" style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: effectiveMisses <= safeSkips90 && evaluation.target90?.isPossible ? '#38bdf8' : 'var(--text-faint)',
              }}>
                {evaluation.target90?.isPossible
                  ? (effectiveMisses <= safeSkips90 ? `${skipsRemainingBefore90} skips left` : 'Target lost')
                  : 'Unreachable'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison strip */}
      <div style={{
        marginTop: 14,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        fontSize: '0.75rem',
      }}>
        <div style={{
          background: 'var(--bg-inset)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-faint)',
        }}>
          <div style={{ color: 'var(--text-faint)', fontSize: '0.65rem', fontWeight: 600 }}>BEST CASE</div>
          <div className="metric-value" style={{ color: '#34d399', fontWeight: 700, fontSize: '0.95rem' }}>
            {bestCasePct.toFixed(1)}%
          </div>
          <div style={{ color: 'var(--text-faint)', fontSize: '0.65rem' }}>attend all {remaining}</div>
        </div>
        <div style={{
          background: isSimulatedSafe75 ? 'rgba(56, 189, 248, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          border: `1px solid ${isSimulatedSafe75 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
        }}>
          <div style={{ color: 'var(--text-faint)', fontSize: '0.65rem', fontWeight: 600 }}>YOUR PLAN</div>
          <div className="metric-value" style={{ color: isSimulatedSafe75 ? '#38bdf8' : '#ef4444', fontWeight: 700, fontSize: '0.95rem' }}>
            {simulatedPct.toFixed(1)}%
          </div>
          <div style={{ color: 'var(--text-faint)', fontSize: '0.65rem' }}>miss {effectiveMisses}</div>
        </div>
        <div style={{
          background: 'var(--bg-inset)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-faint)',
        }}>
          <div style={{ color: 'var(--text-faint)', fontSize: '0.65rem', fontWeight: 600 }}>WORST CASE</div>
          <div className="metric-value" style={{ color: '#f87171', fontWeight: 700, fontSize: '0.95rem' }}>
            {worstCasePct.toFixed(1)}%
          </div>
          <div style={{ color: 'var(--text-faint)', fontSize: '0.65rem' }}>miss all {remaining}</div>
        </div>
      </div>

      {/* Verdict sentence */}
      <p style={{
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        marginTop: 12,
        padding: '10px 14px',
        background: 'var(--bg-inset)',
        borderRadius: 'var(--radius-sm)',
        borderLeft: `3px solid ${isSimulatedSafe75 ? '#10b981' : '#ef4444'}`,
        lineHeight: 1.5,
      }}>
        {isSimulatedSafe75 ? (
          <>
            <strong style={{ color: 'var(--text-primary)' }}>Safe:</strong> Missing <strong>{effectiveMisses}</strong> of {remaining} remaining classes keeps your final attendance at <strong className="metric-value">{simulatedPct.toFixed(1)}%</strong>. You still have <strong style={{ color: '#34d399' }}>{skipsRemainingBefore75} more safe skips</strong> before reaching the 75% threshold.
          </>
        ) : (
          <>
            <strong style={{ color: '#f87171' }}>Warning:</strong> Missing <strong>{effectiveMisses}</strong> classes drops you to <strong className="metric-value">{simulatedPct.toFixed(1)}%</strong>, below 75%. Maximum safe skips: <strong style={{ color: '#34d399' }}>{safeSkips75}</strong>.
          </>
        )}
      </p>
    </div>
  );
}

import React from 'react';
import { AlertOctagon, ShieldCheck, ShieldAlert, AlertTriangle, ArrowUp, TrendingUp } from 'lucide-react';

export default function HeroDashboard({
  overallEval,
  subjectEvals,
  planningDate,
  semesterEndDate,
  onExplainOverall,
}) {
  const isAnyIrreversible = subjectEvals.some((s) => s.status === 'IRREVERSIBLE');
  const irreversibleCount = subjectEvals.filter((s) => s.status === 'IRREVERSIBLE').length;
  const cautionCount = subjectEvals.filter((s) => s.status === 'CAUTION').length;
  const recoveryCount = subjectEvals.filter((s) => s.status === 'RECOVERY_REQUIRED').length;
  const onTrackCount = subjectEvals.filter((s) => s.status === 'ON_TRACK').length;

  const currentPct = overallEval.currentPct;
  const currentPctStr = currentPct !== null ? currentPct.toFixed(1) : 'N/A';
  const maxPossibleStr = overallEval.maxAchievablePct !== null ? `${overallEval.maxAchievablePct.toFixed(1)}%` : 'N/A';
  const currentRatio = currentPct !== null ? currentPct / 100 : 0;

  const is75Safe = currentPct !== null && currentPct >= 75;
  const is90Safe = currentPct !== null && currentPct >= 90;

  // SVG radial gauge
  const gaugeRadius = 72;
  const gaugeStroke = 7;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeProgress = gaugeCircumference * (1 - Math.min(1, currentRatio));

  // Semester progress
  const semStart = new Date(2026, 7, 29); // Aug 29
  const semEnd = new Date(2026, 10, 29); // Nov 29
  const today = new Date(planningDate);
  const totalDays = Math.ceil((semEnd - semStart) / (1000 * 60 * 60 * 24));
  const elapsed = Math.max(0, Math.ceil((today - semStart) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, totalDays - elapsed);
  const semesterPct = Math.min(100, (elapsed / totalDays) * 100);

  // Status determination
  let statusIcon, statusLabel, statusColor;
  if (isAnyIrreversible) {
    statusIcon = <AlertOctagon size={16} />;
    statusLabel = 'CRITICAL';
    statusColor = '#ef4444';
  } else if (currentPct !== null && currentPct < 75) {
    statusIcon = <ShieldAlert size={16} />;
    statusLabel = 'AT RISK';
    statusColor = '#f59e0b';
  } else if (cautionCount > 0 || recoveryCount > 0) {
    statusIcon = <AlertTriangle size={16} />;
    statusLabel = 'WATCH';
    statusColor = '#fbbf24';
  } else {
    statusIcon = <ShieldCheck size={16} />;
    statusLabel = 'SAFE';
    statusColor = '#10b981';
  }

  const safeSkips75 = overallEval.target75?.isPossible ? overallEval.target75.safeSkips : 0;
  const safeSkips90 = overallEval.target90?.isPossible ? overallEval.target90.safeSkips : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
      {/* Irreversible Warning Banner */}
      {isAnyIrreversible && (
        <div className="animate-slide-down" style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.15) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <div style={{ color: '#ef4444', flexShrink: 0 }}>
            <AlertOctagon size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-rose" style={{ fontSize: '0.68rem' }}>IRREVERSIBLE</span>
              <span style={{ fontWeight: 700, color: '#f87171', fontSize: '0.85rem' }}>
                {irreversibleCount} subject{irreversibleCount > 1 ? 's' : ''} cannot reach 75%
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#fca5a5', marginTop: 4, lineHeight: 1.4 }}>
              Even attending 100% of remaining classes cannot reach mandatory threshold.
            </p>
          </div>
        </div>
      )}

      {/* Hero Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)',
        gap: 14,
      }}>
        {/* ── Card 1: Central Attendance Gauge ── */}
        <div className="glass-card animate-fade-in-up" style={{
          padding: '24px 28px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            background: is75Safe ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
            {/* Radial Gauge */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width="160" height="160" viewBox="0 0 160 160" style={{ display: 'block' }}>
                {/* Background track */}
                <circle
                  cx="80" cy="80" r={gaugeRadius}
                  fill="none"
                  stroke="rgba(100, 116, 139, 0.12)"
                  strokeWidth={gaugeStroke}
                />
                {/* 75% marker */}
                <circle
                  cx="80" cy="80" r={gaugeRadius}
                  fill="none"
                  stroke="rgba(251, 191, 36, 0.2)"
                  strokeWidth={gaugeStroke}
                  strokeDasharray={`${gaugeCircumference * 0.75} ${gaugeCircumference * 0.25}`}
                  strokeDashoffset={0}
                  transform="rotate(-90 80 80)"
                  strokeLinecap="round"
                />
                {/* Progress arc */}
                <circle
                  cx="80" cy="80" r={gaugeRadius}
                  fill="none"
                  stroke={is75Safe ? '#10b981' : '#ef4444'}
                  strokeWidth={gaugeStroke}
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={gaugeProgress}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                  style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s' }}
                />
              </svg>
              {/* Center number */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div className="metric-value" style={{
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  color: is75Safe ? '#34d399' : '#f87171',
                  lineHeight: 1,
                }}>
                  {currentPctStr}
                  <span style={{ fontSize: '1rem', fontWeight: 600 }}>%</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 6,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: `${statusColor}18`,
                  color: statusColor,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}>
                  {statusIcon}
                  {statusLabel}
                </div>
              </div>
            </div>

            {/* Right side metrics */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.06em', marginBottom: 8 }}>
                OVERALL ATTENDANCE
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                <span className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{overallEval.attended}</span>
                {' / '}
                <span className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{overallEval.held}</span>
                {' classes attended'}
              </div>

              {/* Progress bar with markers */}
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <div style={{
                  height: 6,
                  background: 'rgba(100, 116, 139, 0.15)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, currentRatio * 100)}%`,
                    background: is75Safe
                      ? 'linear-gradient(90deg, #059669, #10b981, #34d399)'
                      : 'linear-gradient(90deg, #dc2626, #ef4444, #f59e0b)',
                    borderRadius: 3,
                    transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }} />
                </div>
                {/* 75% pip */}
                <div style={{
                  position: 'absolute',
                  left: '75%',
                  top: -2,
                  width: 2,
                  height: 10,
                  background: '#fbbf24',
                  borderRadius: 1,
                  opacity: 0.7,
                }} />
                {/* 90% pip */}
                <div style={{
                  position: 'absolute',
                  left: '90%',
                  top: -2,
                  width: 2,
                  height: 10,
                  background: '#38bdf8',
                  borderRadius: 1,
                  opacity: 0.5,
                }} />
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: '0.72rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Max achievable </span>
                  <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{maxPossibleStr}</span>
                </div>
                <button
                  onClick={onExplainOverall}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--cyan-light)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textUnderlineOffset: 2,
                    fontFamily: 'inherit',
                  }}
                >
                  Show math
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 2: Safe Skips ── */}
        <div className="glass-card animate-fade-in-up stagger-1" style={{ padding: '24px 22px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.06em', marginBottom: 16 }}>
            SAFE SKIPS REMAINING
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 75% block */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6ee7b7' }}>
                  FOR 75% MANDATORY
                </span>
                <span className="metric-value" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>
                  {safeSkips75}
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {overallEval.target75?.isPossible
                  ? `Attend ≥${overallEval.target75.minRequired} of ${overallEval.remaining} remaining`
                  : 'Threshold unreachable'}
              </div>
            </div>

            {/* 90% block */}
            <div style={{
              background: 'rgba(6, 182, 212, 0.05)',
              border: '1px solid rgba(6, 182, 212, 0.12)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7dd3fc' }}>
                  FOR 90% TARGET
                </span>
                <span className="metric-value" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1 }}>
                  {safeSkips90}
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {overallEval.target90?.isPossible
                  ? `Attend ≥${overallEval.target90.minRequired} of ${overallEval.remaining} remaining`
                  : 'Target not achievable'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 3: Semester + Subject Status ── */}
        <div className="glass-card animate-fade-in-up stagger-2" style={{ padding: '24px 22px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.06em', marginBottom: 16 }}>
            SEMESTER PROGRESS
          </div>

          {/* Semester bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Aug 29</span>
              <span className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {daysRemaining}d left
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>Nov 29</span>
            </div>
            <div style={{
              height: 4,
              background: 'rgba(100, 116, 139, 0.12)',
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${semesterPct}%`,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                borderRadius: 2,
                transition: 'width 0.4s',
              }} />
            </div>
          </div>

          {/* Subject status tally */}
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.06em', marginBottom: 10 }}>
            SUBJECT STATUS
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
              <div className="status-dot status-dot-safe" />
              <span style={{ color: 'var(--text-secondary)' }}>Safe</span>
              <span className="font-mono" style={{ fontWeight: 700, color: '#34d399', marginLeft: 'auto' }}>{onTrackCount}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
              <div className="status-dot status-dot-caution" />
              <span style={{ color: 'var(--text-secondary)' }}>Caution</span>
              <span className="font-mono" style={{ fontWeight: 700, color: '#fbbf24', marginLeft: 'auto' }}>{cautionCount}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
              <div className="status-dot" style={{ background: '#f97316', boxShadow: '0 0 6px rgba(249,115,22,0.4)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Recovery</span>
              <span className="font-mono" style={{ fontWeight: 700, color: '#fb923c', marginLeft: 'auto' }}>{recoveryCount}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
              <div className="status-dot status-dot-danger" />
              <span style={{ color: 'var(--text-secondary)' }}>Critical</span>
              <span className="font-mono" style={{ fontWeight: 700, color: '#f87171', marginLeft: 'auto' }}>{irreversibleCount}</span>
            </div>
          </div>

          <div style={{
            marginTop: 14,
            padding: '8px 10px',
            background: 'var(--bg-inset)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <TrendingUp size={13} color="var(--cyan-light)" />
            <span>Projections from real timetable occurrences</span>
          </div>
        </div>
      </div>
    </div>
  );
}

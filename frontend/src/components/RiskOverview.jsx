import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, RefreshCw, ChevronRight, Zap } from 'lucide-react';

export default function RiskOverview({
  subjects,
  evaluations,
  attendanceRecords,
  remainingMap,
  onSelectSubject,
}) {
  const safeList = [];
  const cautionList = [];
  const recoveryList = [];
  const irreversibleList = [];

  subjects.forEach((sub) => {
    const evalData = evaluations[sub.code] || {};
    const rec = attendanceRecords[sub.code] || { attended: 0, held: 0 };
    const rem = remainingMap[sub.code] || 0;
    const item = { subject: sub, evalData, rec, rem };

    if (evalData.status === 'IRREVERSIBLE') {
      irreversibleList.push(item);
    } else if (evalData.status === 'RECOVERY_REQUIRED') {
      recoveryList.push(item);
    } else if (evalData.status === 'CAUTION') {
      cautionList.push(item);
    } else {
      safeList.push(item);
    }
  });

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
              TRIAGE INTELLIGENCE
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Deterministic Status Classification
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Subject Risk & Feasibility Triage
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Dynamic mathematical classification based on remaining schedule capacity to Nov 29, 2026.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-inset)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 12px',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald)' }} />
            <span>{safeList.length} Safe</span>
            <span style={{ color: 'var(--border-default)' }}>|</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)' }} />
            <span>{cautionList.length} Caution</span>
            <span style={{ color: 'var(--border-default)' }}>|</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--rose)' }} />
            <span>{recoveryList.length + irreversibleList.length} At Risk</span>
          </div>
        </div>
      </div>

      {/* Grid of 4 Triage Buckets */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '14px'
      }}>
        {/* Bucket 1: Safe Zone */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.04)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all var(--duration-normal) var(--ease-out)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--emerald-light)', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.04em' }}>
              <ShieldCheck size={16} /> SAFE ZONE (≥3 SKIPS)
            </span>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
              {safeList.length}
            </span>
          </div>

          {safeList.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>
              No subjects currently in safe zone.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {safeList.map(({ subject, evalData, rem }) => (
                <div
                  key={subject.code}
                  onClick={() => onSelectSubject(subject.code)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-inset)',
                    border: '1px solid var(--border-faint)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-fast) ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-faint)';
                    e.currentTarget.style.transform = 'none';
                  }}
                  title="Click to load into What-If Simulator"
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {subject.slot}
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {subject.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Current: {evalData.currentPct?.toFixed(1)}% • {rem} classes left
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div>
                      <div className="font-mono" style={{ color: 'var(--emerald-light)', fontWeight: 800, fontSize: '0.85rem' }}>
                        +{evalData.target75?.safeSkips ?? 0}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>skips</div>
                    </div>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bucket 2: Caution (1-2 Skips Left) */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.04)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all var(--duration-normal) var(--ease-out)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--amber-light)', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.04em' }}>
              <AlertTriangle size={16} /> CAUTION (≤2 SKIPS)
            </span>
            <span className="badge badge-amber" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
              {cautionList.length}
            </span>
          </div>

          {cautionList.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>
              No subjects in caution threshold.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {cautionList.map(({ subject, evalData, rem }) => (
                <div
                  key={subject.code}
                  onClick={() => onSelectSubject(subject.code)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-inset)',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-fast) ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.15)';
                    e.currentTarget.style.transform = 'none';
                  }}
                  title="Click to load into What-If Simulator"
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {subject.slot}
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {subject.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Current: {evalData.currentPct?.toFixed(1)}% • {rem} left
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div>
                      <div className="font-mono" style={{ color: 'var(--amber-light)', fontWeight: 800, fontSize: '0.85rem' }}>
                        {evalData.target75?.safeSkips} skip{evalData.target75?.safeSkips === 1 ? '' : 's'}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>buffer</div>
                    </div>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bucket 3: Recovery Required (<75% but recoverable) */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.04)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all var(--duration-normal) var(--ease-out)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--rose-light)', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.04em' }}>
              <RefreshCw size={16} /> RECOVERY REQUIRED
            </span>
            <span className="badge badge-rose" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
              {recoveryList.length}
            </span>
          </div>

          {recoveryList.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>
              No subjects currently below 75%.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {recoveryList.map(({ subject, evalData, rem }) => (
                <div
                  key={subject.code}
                  onClick={() => onSelectSubject(subject.code)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-inset)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-fast) ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.transform = 'none';
                  }}
                  title="Click to calculate recovery plan"
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {subject.slot}
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {subject.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--rose-light)' }}>
                      Current: {evalData.currentPct?.toFixed(1)}% • Max: {evalData.maxAchievablePct?.toFixed(1)}%
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div>
                      <div className="font-mono" style={{ color: 'var(--cyan-light)', fontWeight: 800, fontSize: '0.82rem' }}>
                        Attend {evalData.target75?.minRequired}/{rem}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>to hit 75%</div>
                    </div>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bucket 4: Irreversible Detention */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all var(--duration-normal) var(--ease-out)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.04em' }}>
              <AlertOctagon size={16} /> IRREVERSIBLE DETENTION
            </span>
            <span className="badge badge-rose" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
              {irreversibleList.length}
            </span>
          </div>

          {irreversibleList.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>
              No subjects mathematically detained.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {irreversibleList.map(({ subject, evalData, rem }) => (
                <div
                  key={subject.code}
                  onClick={() => onSelectSubject(subject.code)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-fast) ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    e.currentTarget.style.transform = 'none';
                  }}
                  title="Click to inspect detention mathematics"
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--rose-light)', fontWeight: 600 }}>
                        {subject.slot}
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {subject.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--rose-light)' }}>
                      Current: {evalData.currentPct?.toFixed(1)}% • Max Achievable: {evalData.maxAchievablePct?.toFixed(1)}%
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div>
                      <div className="font-mono" style={{ color: 'var(--rose)', fontWeight: 800, fontSize: '0.8rem' }}>
                        &lt;75% Cap
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>0 recovery</div>
                    </div>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

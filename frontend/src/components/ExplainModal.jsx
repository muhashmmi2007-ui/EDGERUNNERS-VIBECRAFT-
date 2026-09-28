import React, { useState } from 'react';
import { X, Check, AlertOctagon } from 'lucide-react';
import { getExplanationBreakdown } from '../services/attendanceMath';

export default function ExplainModal({
  subject,
  record,
  remaining,
  onClose,
}) {
  const [selectedTarget, setSelectedTarget] = useState(0.75); // 0.75 or 0.90
  const breakdown = getExplanationBreakdown(record.attended, record.held, remaining, selectedTarget);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="card animate-slide-down"
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          background: 'var(--bg-elevated)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          boxShadow: 'var(--shadow-elevated)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
                MATHEMATICAL DERIVATION
              </span>
              <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {subject.code}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Attendance Calculation Breakdown
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Deterministic step-by-step evaluation using your entered numbers and the fixed-schedule denominator formula.
            </p>
          </div>

          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Target Switcher: 75% vs 90% */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'var(--bg-inset)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          marginBottom: '20px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setSelectedTarget(0.75)}
            className="btn"
            style={{
              flex: 1,
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              background: selectedTarget === 0.75 ? 'var(--emerald-bg)' : 'transparent',
              color: selectedTarget === 0.75 ? 'var(--emerald-light)' : 'var(--text-muted)',
              border: selectedTarget === 0.75 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              transition: 'all var(--duration-fast) ease'
            }}
          >
            Mandatory Minimum: 75%
          </button>

          <button
            onClick={() => setSelectedTarget(0.90)}
            className="btn"
            style={{
              flex: 1,
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              background: selectedTarget === 0.90 ? 'var(--cyan-bg)' : 'transparent',
              color: selectedTarget === 0.90 ? 'var(--cyan-light)' : 'var(--text-muted)',
              border: selectedTarget === 0.90 ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
              transition: 'all var(--duration-fast) ease'
            }}
          >
            Aspirational Target: 90%
          </button>
        </div>

        {/* Core Formula Box */}
        <div style={{
          background: 'var(--bg-inset)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
            OFFICIAL ATTENDANCE FORMULA (FIXED SCHEDULE CAPACITY)
          </div>
          <div className="font-mono" style={{ fontSize: '0.92rem', color: 'var(--cyan-light)', marginTop: '8px', fontWeight: 600 }}>
            {breakdown.formulaText}
          </div>
          <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--emerald-light)', marginTop: '4px' }}>
            {breakdown.skipsFormulaText}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Note: All R scheduled classes are fixed in the timetable calendar and form part of the final semester denominator (H + R).
          </p>
        </div>

        {/* Variables Table */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>ATTENDED (A)</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {breakdown.A}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>HELD (H)</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {breakdown.H}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>SCHEDULED (R)</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--cyan-light)' }}>
              {breakdown.R}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL (H+R)</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--purple-light)' }}>
              {breakdown.total}
            </div>
          </div>
        </div>

        {/* Step-by-Step Derivation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {breakdown.steps.map((step) => (
            <div
              key={step.step}
              style={{
                background: 'var(--bg-inset)',
                borderLeft: '3px solid var(--cyan-light)',
                padding: '12px 16px',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                border: '1px solid var(--border-subtle)',
                borderLeftWidth: '3px'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--cyan-light)' }}>
                Step {step.step}: {step.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                {step.content}
              </div>
            </div>
          ))}
        </div>

        {/* Conclusion Card */}
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          background: breakdown.isPossible ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.1)',
          border: breakdown.isPossible ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          {breakdown.isPossible ? (
            <Check size={28} color="var(--emerald)" />
          ) : (
            <AlertOctagon size={28} color="var(--rose)" />
          )}
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: breakdown.isPossible ? 'var(--emerald-light)' : 'var(--rose-light)' }}>
              {breakdown.isPossible
                ? `Result: You can safely miss ${breakdown.safeSkips} class${breakdown.safeSkips === 1 ? '' : 'es'}`
                : `Result: Reaching ${breakdown.targetPct}% is Mathematically Impossible`}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {breakdown.isPossible
                ? `Attend at least ${breakdown.minRequired} of your remaining ${breakdown.R} classes to finish with ≥ ${breakdown.targetPct}%.`
                : `Maximum final achievable percentage is capped at ${breakdown.maxPossiblePct}%.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

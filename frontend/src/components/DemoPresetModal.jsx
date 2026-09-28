import React from 'react';
import { X, Sparkles, ArrowRight, ShieldCheck, Zap, Scale, AlertOctagon, Info } from 'lucide-react';
import { DEMO_PRESETS } from '../services/demoPresets';

export default function DemoPresetModal({ onSelectPreset, onClose }) {
  const getIcon = (id) => {
    switch (id) {
      case 'safe_90':
        return <ShieldCheck size={22} color="var(--emerald-light)" />;
      case 'recoverable_75':
        return <Zap size={22} color="var(--amber-light)" />;
      case 'split_75_90':
        return <Scale size={22} color="var(--cyan-light)" />;
      case 'irreversible_risk':
        return <AlertOctagon size={22} color="var(--rose-light)" />;
      default:
        return <Sparkles size={22} color="var(--purple-light)" />;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="card animate-slide-down"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          background: 'var(--bg-elevated)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          boxShadow: 'var(--shadow-elevated)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'var(--purple-bg)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--purple-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Judge Demonstration Scenarios
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Instant 1-click loading of the four required mathematical test archetypes.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '20px',
          fontSize: '0.78rem',
          color: 'var(--purple-light)',
          lineHeight: 1.45,
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <Info size={18} style={{ flexShrink: 0 }} />
          <span><strong>Hackathon Validation Note:</strong> These profiles pair genuine timetable schedules from the organizer dataset with student attendance figures to demonstrate every mathematical threshold.</span>
        </div>

        {/* 4 Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {DEMO_PRESETS.map((preset) => (
            <div
              key={preset.id}
              style={{
                background: 'var(--bg-inset)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all var(--duration-fast) ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  marginTop: '2px'
                }}>
                  {getIcon(preset.id)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {preset.title}
                    </span>
                    <span className={`badge badge-${preset.badgeColor}`} style={{ fontSize: '0.65rem' }}>
                      {preset.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                    {preset.description}
                  </p>
                  <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>Target Section: <strong style={{ color: 'var(--cyan-light)' }}>{preset.sectionId}</strong></span>
                    <span>Planning Date: <strong style={{ color: 'var(--text-primary)' }}>{preset.planningDate}</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className="btn btn-demo"
                style={{ padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)' }}
              >
                <span>Load Profile</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

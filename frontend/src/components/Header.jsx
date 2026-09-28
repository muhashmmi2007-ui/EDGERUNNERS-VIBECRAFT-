import React from 'react';
import { SECTIONS_DATA } from '../data/sectionsData';
import { Sparkles, Grid, RotateCcw, FileText, DoorOpen } from 'lucide-react';

export default function Header({
  selectedSection,
  onSelectSection,
  planningDate,
  onPlanningDateChange,
  onOpenDemo,
  onOpenAudit,
  onToggleTimetable,
  showTimetable,
  onResetData,
  onOpenLocator,
}) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(4, 6, 14, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        height: 60,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.1rem',
          }}>
            Ω
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{
                fontSize: '1rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#f1f5f9',
              }}>
                ATTENDANCE PREDICTOR
              </h1>
              <span className="badge badge-emerald" style={{ fontSize: '0.6rem', padding: '1px 7px' }}>
                v2
              </span>
            </div>
            <p style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              marginTop: -1,
            }}>
              Know exactly what you can miss
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Section Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.06em' }}>
              SEC
            </span>
            <select
              value={selectedSection.id}
              onChange={(e) => {
                const found = SECTIONS_DATA.find((s) => s.id === e.target.value);
                if (found) onSelectSection(found);
              }}
              className="input-field"
              style={{
                fontWeight: 600,
                fontSize: '0.78rem',
                color: 'var(--cyan-light)',
                borderColor: 'rgba(56, 189, 248, 0.2)',
                cursor: 'pointer',
                padding: '5px 10px',
                maxWidth: 260,
              }}
            >
              <optgroup label="Year III & IV (2026–27)">
                <option value="III_ECE_DS">III ECE-DS (S5, IST 519)</option>
                <option value="III_ECE_A">III ECE-A (S5, IST 518/FN)</option>
                <option value="III_ECE_B">III ECE-B (S5, IST 518/AN)</option>
                <option value="III_BME">III BME (S5, IST 211/AN)</option>
                <option value="IV_ECE_A">IV ECE-A (S7, IST 225)</option>
                <option value="IV_ECE_B">IV ECE-B (S7, IST 227)</option>
              </optgroup>
              <optgroup label="Year II (2026–27)">
                <option value="II_ECE_DS_A">II ECE-DS A (S3, IST 416)</option>
                <option value="II_ECE_DS_B">II ECE-DS B (S3, IST 411)</option>
                <option value="II_BME">II BME (S3, IST 602)</option>
              </optgroup>
              <optgroup label="Year I (2024–25 Supplied)">
                <option value="I_ECE_A">I ECE-A (Odd)</option>
                <option value="I_ECE_B_EEE">I ECE-B & EEE (Odd)</option>
                <option value="I_ECE_DS">I ECE-DS (Even)</option>
                <option value="I_BIOTECH_B">I Biotech-B / BME (Even)</option>
              </optgroup>
            </select>
          </div>

          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.06em' }}>
              DATE
            </span>
            <input
              type="date"
              value={planningDate}
              min="2026-08-29"
              max="2026-11-29"
              onChange={(e) => onPlanningDateChange(e.target.value)}
              className="input-field"
              style={{
                fontWeight: 600,
                padding: '5px 8px',
                fontSize: '0.78rem',
                color: '#f1f5f9',
                cursor: 'pointer',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {onOpenLocator && (
              <button
                onClick={onOpenLocator}
                className="btn btn-secondary"
                title="The Free Class Locator (Smart Search Floor Manager)"
                style={{
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  borderColor: 'rgba(6, 182, 212, 0.4)',
                  color: 'var(--cyan-light)',
                  background: 'rgba(6, 182, 212, 0.1)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <DoorOpen size={14} color="var(--cyan-light)" />
                <span>Free Classes</span>
                <span className="badge badge-cyan" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                  NEW
                </span>
              </button>
            )}

            <button
              onClick={onToggleTimetable}
              className="btn btn-secondary"
              title="Weekly timetable"
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            >
              <Grid size={14} color={showTimetable ? '#10b981' : '#94a3b8'} />
            </button>

            <button
              onClick={onOpenDemo}
              className="btn btn-demo"
              title="Judge demo presets"
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            >
              <Sparkles size={14} />
              <span>Demo</span>
            </button>

            <button
              onClick={onOpenAudit}
              className="btn btn-secondary"
              title="Audit data"
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            >
              <FileText size={14} />
            </button>

            <button
              onClick={onResetData}
              className="btn btn-secondary"
              title="Reset attendance"
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
